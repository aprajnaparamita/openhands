# Staging Environment Setup

## Infrastructure
- Cloud provider: AWS/GCP/Azure
- Kubernetes cluster
- MongoDB Atlas (M10)
- Redis Cloud
- Solana devnet

## Deployment

```bash
# Build Docker images
npm run build
docker build -t frontend:staging ./packages/frontend
docker build -t backend:staging ./packages/backend

# Push to registry
docker push <registry>/frontend:staging
docker push <registry>/backend:staging

# Deploy to Kubernetes
kubectl apply -f k8s/staging/

# Deploy smart contracts to devnet
cd packages/contracts
anchor deploy --provider.cluster devnet
```

## Configuration

Set environment variables:
- Database URLs
- API keys
- Solana RPC endpoints (devnet)
- CAPTCHA keys
- Storage credentials

## Verification

Run smoke tests:
```bash
npm run test:staging
```

See CI/CD pipeline for automated deployment.
