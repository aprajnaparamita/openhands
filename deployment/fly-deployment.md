# Deploying OpenHands to Fly.io

This guide outlines how to deploy the OpenHands Backend and Frontend to Fly.io.

## Prerequisites

1. [Install flyctl](https://fly.io/docs/hands-on/install-flyctl/)
2. [Sign up/Login to Fly.io](https://fly.io/docs/hands-on/sign-up/)
3. A MongoDB Atlas cluster (or other MongoDB provider)
4. A Redis instance (Fly.io Redis or external)

## 1. Backend Deployment

### Initial Setup

Navigate to the backend directory:
```bash
cd backend
```

Launch the app (this creates/updates `fly.toml`):
```bash
fly launch --no-deploy
```
*   **App Name**: e.g., `openhands-backend-production`
*   **Region**: Choose one close to your users (e.g., `iad`, `sjc`, `lhr`)
*   **Database**: You can set up Postgres/Redis if needed, but we use MongoDB.

### Secrets Configuration

Set the required environment variables:

```bash
fly secrets set \
  SECRET_KEY="your-secure-secret-key" \
  MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/openhands?retryWrites=true&w=majority" \
  REDIS_URL="redis://:password@host:port" \
  CLOUDINARY_CLOUD_NAME="your-cloud-name" \
  CLOUDINARY_API_KEY="your-api-key" \
  CLOUDINARY_API_SECRET="your-api-secret" \
  PUBNUB_PUBLISH_KEY="your-pub-key" \
  PUBNUB_SUBSCRIBE_KEY="your-sub-key" \
  PUBNUB_SECRET_KEY="your-secret-key" \
  SENTRY_DSN="your-sentry-dsn" \
  CORS_ORIGINS="https://your-frontend-app.fly.dev"
```

### Deploy

```bash
fly deploy
```

## 2. Frontend Deployment

Navigate to the frontend directory:
```bash
cd ../frontend
```

Launch the frontend app:
```bash
fly launch --no-deploy
```
*   **App Name**: e.g., `openhands-frontend-production`

### Build Arguments / Environment Variables

Since the frontend is built statically, environment variables like `REACT_APP_API_URL` must be available at **build time**.

Update `frontend/Dockerfile` if you need to pass args, or simply use a `.env.production` file. Alternatively, pass build args via fly.

To inject variables during build:
```bash
fly deploy --build-arg REACT_APP_API_URL=https://openhands-backend-production.fly.dev/api/v1
```

## 3. CI/CD with GitHub Actions

A workflow is provided in `.github/workflows/deploy.yml` to automate deployment on push to `main`.

### Setup
1.  Get a Fly API Token: `fly tokens create deploy -x 999999h`
2.  Add it to GitHub Repository Secrets as `FLY_API_TOKEN`.

## 4. Monitoring

*   **Health Checks**: The backend exposes `/health` which Fly.io checks every 10s.
*   **Sentry**: Errors are automatically reported to Sentry if `SENTRY_DSN` is set.
*   **Logs**: View logs with `fly logs -a openhands-backend-production`.
