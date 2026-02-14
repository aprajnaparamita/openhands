import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import pino from 'pino';
import { LOG_DIR, LOG_LEVEL, NODE_ENV } from '@config/env';

// Log Environment Configuration
const isProd = NODE_ENV === 'production';
const logRoot = LOG_DIR || 'logs';
const logLevel = LOG_LEVEL || 'info';

// Create logs folder in the current runtime location (project execution directory)
const projectRoot = process.cwd(); // Current process execution directory
const logDir = join(projectRoot, logRoot);

// Create log directory (includes error handling)
try {
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
    console.log(`[Logger Init] Created log directory: ${logDir}`);
  } else {
    console.log(`[Logger Init] Log directory already exists: ${logDir}`);
  }
} catch (error) {
  console.error(`[Logger Init] Failed to create log directory: ${logDir}`, error);
  throw error;
}

// Path for file logging
const prodFile = join(logDir, 'app');
const devFile = join(logDir, 'app.dev');
const errorFile = join(logDir, 'error');

const isTest = NODE_ENV === 'test';

// Pino Instance
const targets = [];

if (isProd) {
  targets.push(
    {
      target: 'pino-roll',
      level: logLevel,
      options: {
        file: prodFile,
        frequency: 'daily',
        size: '50m',
        dateFormat: 'yyyy-MM-dd',
        extension: '.log',
        mkdir: true,
        symlink: true,
        limit: { count: 30 },
      },
    },
    {
      target: 'pino-roll',
      level: 'error',
      options: {
        file: errorFile,
        frequency: 'daily',
        size: '50m',
        dateFormat: 'yyyy-MM-dd',
        extension: '.log',
        mkdir: true,
        symlink: true,
        limit: { count: 60 },
      },
    }
  );
} else if (isTest) {
  // Test environment: Console only, no file logging to avoid race conditions
  targets.push({
    target: 'pino-pretty',
    level: 'error', // Reduce noise in tests, only show errors
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  });
} else {
  // Development
  targets.push(
    {
      target: 'pino-pretty',
      level: logLevel,
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
    {
      target: 'pino-roll',
      level: logLevel,
      options: {
        file: devFile,
        frequency: 'daily',
        size: '20m',
        dateFormat: 'yyyy-MM-dd',
        extension: '.log',
        mkdir: true,
        symlink: true,
        limit: { count: 7 },
      },
    }
  );
}

const transport = pino.transport({
  targets,
});

// ── Logger Instance
export const logger = pino(
  {
    level: logLevel,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ['req.headers.authorization', 'password', 'token'],
      censor: '[REDACTED]',
    },
  },
  transport,
);

// morgan stream
export const stream = { write: (msg: string) => logger.info(msg.trim()) };
