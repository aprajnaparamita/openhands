# Production Deployment

## Pre-Launch Checklist

- [ ] Security audit completed
- [ ] Smart contracts audited
- [ ] Load testing passed
- [ ] Backup procedures tested
- [ ] Monitoring configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] DDoS protection enabled

## Infrastructure

- Kubernetes with auto-scaling
- MongoDB Atlas (M30+, replica set)
- Redis Cloud (HA cluster)
- S3 + CloudFront
- Solana mainnet RPC

## Deployment Process

```bash
# 1. Tag release
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0

# 2. Build production images
npm run build:prod
docker build -t frontend:v1.0.0 ./packages/frontend
docker build -t backend:v1.0.0 ./packages/backend

# 3. Push to production registry
docker push <registry>/frontend:v1.0.0
docker push <registry>/backend:v1.0.0

# 4. Deploy to production (requires approval)
kubectl apply -f k8s/production/

# 5. Deploy smart contracts to mainnet
# (After final audit only)
cd packages/contracts
anchor deploy --provider.cluster mainnet
```

## Rollback Procedure

```bash
# Revert to previous version
kubectl rollout undo deployment/backend
kubectl rollout undo deployment/frontend
```

## Monitoring

- Prometheus + Grafana dashboards
- Sentry error tracking
- Uptime monitoring
- Log aggregation (Loki)

## Maintenance

- Database backups: Daily automated
- Security updates: Weekly scans
- Dependency updates: Monthly review
- Performance review: Quarterly

See operations runbook for detailed procedures.
