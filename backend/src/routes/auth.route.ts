import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { AuthController } from '@controllers/auth.controller';
import { loginWalletSchema } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { authRateLimiter } from '@middlewares/rateLimit.middleware';

@injectable()
export class AuthRoute implements Routes {
  public router: Router = Router();
  public path = '/auth';

  constructor(@inject(AuthController) private authController: AuthController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authRateLimiter); // Apply rate limiter to all auth routes
    
    this.router.post(
      `${this.path}/wallet`,
      ValidationMiddleware(loginWalletSchema),
      this.authController.logInWithWallet,
    );
    this.router.post(`${this.path}/logout`, AuthMiddleware, this.authController.logOut);
    this.router.post(`${this.path}/refresh`, this.authController.refresh);
    this.router.get(`${this.path}/me`, AuthMiddleware, this.authController.getMe);
  }
}
