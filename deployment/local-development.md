# Local Development Setup

## Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Solana CLI tools
- Git

## Setup Steps

```bash
# Clone repository
git clone <repo-url>
cd art-commission-platform

# Copy environment files
cp .env.sample .env
# Edit .env with local configuration

# Start services
docker-compose up -d

# Install dependencies
npm install

# Run migrations
npm run migrate

# Start development
npm run dev
```

## Services

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- MongoDB: mongodb://localhost:27017
- Redis: redis://localhost:6379
- Solana: http://localhost:8899

## Deploy Smart Contracts

```bash
cd packages/contracts
anchor build
anchor deploy --provider.cluster localnet
```

See main README for more details.
