# Prompt 1: Project Initialization & Configuration

## Overview
Set up the foundational project structure with monorepo configuration, development environment, and build tooling.

## Requirements

### Monorepo Structure
```
art-commission-platform/
├── packages/
│   ├── frontend/          # React app
│   ├── backend/           # Express API
│   └── contracts/         # Solana programs
├── docker-compose.yml
├── package.json
└── .env.sample
```

### Frontend Setup
- Initialize with Vite + React + TypeScript
- Configure ESLint + Prettier
- Set up TailwindCSS
- Configure path aliases

### Backend Setup  
- Initialize Express + TypeScript
- Configure Clean Architecture folders
- Set up MongoDB connection
- Configure environment variables

### Smart Contract Setup
- Initialize Anchor workspace
- Create escrow program
- Create reputation program

### Development Environment
- Docker Compose with all services
- Hot reload for all packages
- Automated testing setup

See full prompt for detailed implementation steps.
