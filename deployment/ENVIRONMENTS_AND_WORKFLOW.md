# Environments, Services & Deployment Workflow

This guide outlines the infrastructure setup for OpenHands, required external services, and the workflow for managing Development, Staging, and Production environments.

## 1. External Services Checklist

Before deploying, ensure you have accounts and API keys for the following services:

### Infrastructure
- **Fly.io**: Hosting for Backend (and optionally Redis/Postgres).
  - *Sign up*: https://fly.io
- **MongoDB Atlas**: Managed Database.
  - *Sign up*: https://www.mongodb.com/cloud/atlas
  - *Create*: Two Clusters (or two Databases in one cluster): `openhands-staging` and `openhands-production`.
- **Upstash** (Optional but recommended): Managed Redis.
  - *Sign up*: https://upstash.com
  - *Create*: Two Redis databases.

### Third-Party APIs
- **Particle Network**: Web3 Auth & Wallet abstraction.
  - *Sign up*: https://particle.network
  - *Create*: One Project, two Apps (Staging, Production).
- **WalletConnect**: For connecting external wallets.
  - *Sign up*: https://cloud.walletconnect.com
- **PubNub**: Real-time chat & signaling.
  - *Sign up*: https://www.pubnub.com
  - *Create*: Two Apps (Staging, Production).
- **Cloudinary**: Image storage & optimization.
  - *Sign up*: https://cloudinary.com
  - *Create*: Two Cloud environments.
- **Sentry**: Error tracking & monitoring.
  - *Sign up*: https://sentry.io
  - *Create*: Two Projects (Backend Staging, Backend Prod).
- **Google reCAPTCHA v3**: Bot protection.
  - *Sign up*: https://www.google.com/recaptcha/admin
  - *Create*: Two Sites (Staging domain, Production domain).

---

## 2. Environment Configuration

We maintain strict separation between environments to prevent state leakage.

### Backend (`backend/.env.*`)

| Variable | Description | Staging Value | Production Value |
|----------|-------------|---------------|------------------|
| `NODE_ENV` | Runtime mode | `staging` | `production` |
| `API_SERVER_URL` | Public Backend URL | `https://api-staging.yoursite.com` | `https://api.yoursite.com` |
| `MONGO_URI` | DB Connection | `.../openhands-staging` | `.../openhands-prod` |
| `SECRET_KEY` | JWT Signing Key | Random String A | Random String B (Stronger) |
| `PUBNUB_*` | Chat Keys | Staging Keys | Production Keys |

### Frontend (`frontend/.env.*`)

| Variable | Description | Staging Value | Production Value |
|----------|-------------|---------------|------------------|
| `REACT_APP_API_SERVER_URL` | Backend URL | `https://api-staging.yoursite.com` | `https://api.yoursite.com` |
| `REACT_APP_ENABLE_NEW_UI` | Feature Flag | `true` | `false` (until verified) |

> **Note**: See `backend/.env.staging` and `backend/.env.production` in the codebase for the full template.

---

## 3. Deployment Workflow

### Feature Flags & Testing
We use Environment Variables as simple Feature Flags (e.g., `REACT_APP_ENABLE_NEW_UI`).

1.  **Development (`local`)**
    *   Developers work on `feature/xyz` branch.
    *   Run locally with `.env.development`.
    *   Tests pass locally (`npm test`).

2.  **Staging (`staging`)**
    *   Merge PR into `main` (or a dedicated `staging` branch).
    *   **Auto-Deploy**: CI/CD (GitHub Actions) builds and deploys to Fly.io (Backend) and Vercel/Netlify (Frontend).
    *   **Configuration**: Uses `backend/.env.staging` (injected via Fly.io Secrets) and `frontend/.env.staging`.
    *   **Verification**:
        *   QA Team tests new features enabled by flags.
        *   Run E2E tests against Staging URL.

3.  **Production (`production`)**
    *   Create a **Release Tag** (e.g., `v1.0.0`) or promote the build.
    *   **Deploy**: CI/CD deploys the tagged commit to Production.
    *   **Configuration**: Uses `backend/.env.production` (Fly.io Secrets) and `frontend/.env.production`.
    *   **Feature Flags**: Riskier features can be disabled in Prod env vars even if code is deployed.

### Suggested CI/CD Pipeline (GitHub Actions)

1.  **Test**: On PR open -> Run Unit/Integration Tests.
2.  **Deploy Staging**: On push to `main` ->
    *   Build Docker Image.
    *   Deploy to Fly.io (App: `openhands-backend-staging`).
    *   Deploy Frontend to Vercel (Project: `openhands-staging`).
3.  **Deploy Production**: On release tag `v*` ->
    *   Build Docker Image.
    *   Deploy to Fly.io (App: `openhands-backend-prod`).
    *   Deploy Frontend to Vercel (Project: `openhands-prod`).

## 4. Setting Secrets on Fly.io

Use the CLI to set secrets for each environment:

```bash
# Staging
fly secrets set NODE_ENV=staging MONGO_URI=... SECRET_KEY=... -a openhands-backend-staging

# Production
fly secrets set NODE_ENV=production MONGO_URI=... SECRET_KEY=... -a openhands-backend-prod
```
