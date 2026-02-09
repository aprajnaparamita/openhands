import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { z } from 'zod';

/**
 * 1) dotenv load order
 *    - .env (Common)
 *    - .env.{NODE_ENV}.local (Environment override, overwrites if exists)
 */
config(); // .env
const nodeEnv = process.env.NODE_ENV || 'development';
const layerPath = resolve(process.cwd(), `.env.${nodeEnv}.local`);
if (existsSync(layerPath)) {
  config({ path: layerPath });
}

/**
 * 2) Zod Schema Definition
 *    - Required/Optional/Default policies can be modified as needed
 */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().optional(), // Default is handled as 3000 in app.ts

    SECRET_KEY: z.string().min(1),

    LOG_FORMAT: z.string().min(1).optional(), // Default is 'dev' in app.ts
    LOG_DIR: z.string().min(1),
    LOG_LEVEL: z.string().min(1),

    ORIGIN: z.string().min(1), // Can be made into an array if needed
    CREDENTIALS: z.coerce.boolean(), // 'true'/'false' string → boolean
    CORS_ORIGINS: z.string().optional(), // "http://a.com,http://b.com"

    API_SERVER_URL: z.string().url().optional(),

    SENTRY_DSN: z.string().default(''),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    CLOUDINARY_UPLOAD_FOLDER: z.string().default('openhands'),

    // PubNub
    PUBNUB_PUBLISH_KEY: z.string().min(1),
    PUBNUB_SUBSCRIBE_KEY: z.string().min(1),
    PUBNUB_SECRET_KEY: z.string().min(1),
  })
  .strip();

/**
 * 3) Validation (Executed at module import time)
 */
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('\n❌ Invalid environment variables:\n');
  console.error(parsed.error.format());
  process.exit(1);
}
const env = parsed.data;

/**
 * 4) Type-safe constant export
 *    - Do not use process.env directly in other files, import from here.
 */
export const NODE_ENV = env.NODE_ENV;
export const PORT = env.PORT; // PORT || 3000 in app.ts
export const SECRET_KEY = env.SECRET_KEY;

export const LOG_FORMAT = env.LOG_FORMAT; // LOG_FORMAT || 'dev' in app.ts
export const LOG_DIR = env.LOG_DIR;
export const LOG_LEVEL = env.LOG_LEVEL;

export const ORIGIN = env.ORIGIN;
export const CREDENTIALS = env.CREDENTIALS;

export const SENTRY_DSN = env.SENTRY_DSN;
export const REDIS_URL = env.REDIS_URL;
export const API_SERVER_URL = env.API_SERVER_URL;

export const CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_UPLOAD_FOLDER = env.CLOUDINARY_UPLOAD_FOLDER;

export const PUBNUB_PUBLISH_KEY = env.PUBNUB_PUBLISH_KEY;
export const PUBNUB_SUBSCRIBE_KEY = env.PUBNUB_SUBSCRIBE_KEY;
export const PUBNUB_SECRET_KEY = env.PUBNUB_SECRET_KEY;

// Provide CORS Origins as an array (empty if none)
export const CORS_ORIGIN_LIST =
  env.CORS_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) ?? [];
