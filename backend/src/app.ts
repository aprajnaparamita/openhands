import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, CREDENTIALS, CORS_ORIGIN_LIST, API_SERVER_URL } from '@config/env';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { NotFoundMiddleware } from '@middlewares/notFound.middleware';
import { logger, stream } from '@utils/logger';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[], apiPrefix = '/api/v1') {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.initializeTrustProxy();
    this.initializeMiddlewares();
    this.initializeRoutes(routes, apiPrefix);
    this.initializeSwagger(apiPrefix);
    this.initializeErrorHandling();
  }

  public listen() {
    const server = this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });

    return server;
  }

  public getServer() {
    return this.app;
  }

  private initializeTrustProxy() {
    // Required to extract real IP in proxy environments like Nginx, Heroku, Cloudflare
    this.app.set('trust proxy', 1);
  }

  private initializeMiddlewares() {
    // Stricter rate limit for Auth
    this.app.use('/api/v1/auth', rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 20, // Limit each IP to 20 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many login attempts, please try again after 15 minutes',
    }));

    // Stricter rate limit for Chat
    this.app.use('/api/v1/chat', rateLimit({
      windowMs: 60 * 1000, // 1 minute
      limit: 60, // Limit each IP to 60 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
    }));

    this.app.use(
      rateLimit({
        windowMs: 60_000,
        limit: this.env === 'production' ? 100 : 1000,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) =>
          this.env !== 'production' ||
          ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip ?? ''),
      }),
    );

    this.app.use(morgan(LOG_FORMAT || 'dev', { stream }));

    // Manage CORS whitelist in environment variables
    const allowedOrigins =
      CORS_ORIGIN_LIST.length > 0 ? CORS_ORIGIN_LIST : ['http://localhost:3001'];

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: CREDENTIALS,
      }),
    );

    this.app.use(
      helmet({
        contentSecurityPolicy:
          this.env === 'production'
            ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
              },
            }
            : false, // Disable CSP in development environment (for hot reload convenience etc.)
        referrerPolicy: { policy: 'no-referrer' },
      }),
    );

    this.app.use(hpp());
    this.app.use(cookieParser());
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(mongoSanitize());
    this.app.use(xss());
  }

  private initializeRoutes(routes: Routes[], apiPrefix: string) {
    routes.forEach((route) => {
      this.app.use(apiPrefix, route.router);
    });
  }

  private initializeSwagger(apiPrefix: string) {
    const options = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example API Documentation',
        },
        servers: [
          {
            url: API_SERVER_URL || `http://localhost:${this.port}${apiPrefix}`,
            description: this.env === 'production' ? 'Production server' : 'Local server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: ['swagger.yaml', 'src/controllers/*.ts'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(NotFoundMiddleware);
    this.app.use(ErrorMiddleware);
  }
}

export default App;
