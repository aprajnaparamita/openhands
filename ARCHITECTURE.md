# System Architecture

## High-Level Overview

[Full architecture content from original document would go here - truncated for brevity]

## Architecture Layers

### Frontend Layer
- React SPA with TypeScript
- Particle Network for wallet auth
- TailwindCSS for styling

### Backend Layer  
- Express.js with Clean Architecture
- Domain, Application, Infrastructure, Presentation layers
- MongoDB for data persistence

### Blockchain Layer
- Solana smart contracts (Anchor)
- Escrow program for payments
- Reputation program for reviews

### Data Layer
- MongoDB (primary database)
- Redis (caching, rate limiting)
- S3 (media storage)

See full documentation for complete details.
