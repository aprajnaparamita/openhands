# Prompt 12: Deployment & DevOps

## Overview
Production infrastructure, CI/CD, monitoring, and operations.

## Infrastructure

### Environments
- Development (Docker Compose)
- Staging (cloud, devnet)
- Production (cloud, mainnet)

### Services
- Kubernetes deployment
- MongoDB Atlas
- Redis Cloud
- S3 + CloudFront CDN

### CI/CD Pipeline
```
PR: lint → test → build
Main: deploy to staging → smoke tests
Tag: deploy to production (manual approval)
```

### Monitoring
- Prometheus + Grafana (metrics)
- Loki (logs)
- Sentry (errors)
- Uptime monitoring

### Backup & Recovery
- Automated database backups
- Disaster recovery plan
- Incident response procedures

See full prompt for DevOps implementation.
