# Deployment Architecture

## Production Environment

```
┌────────────────────────────────────────┐
│         CloudFront CDN                 │
│    (Static Assets + Images)            │
└──────────┬─────────────────────────────┘
           │
┌──────────▼─────────────────────────────┐
│    Application Load Balancer           │
│    (SSL Termination + WAF)             │
└─────┬────────────────┬─────────────────┘
      │                │
┌─────▼──────┐  ┌──────▼─────────┐
│  Frontend  │  │  Backend API   │
│  (Nginx)   │  │  (Node.js)     │
│  K8s Pods  │  │  K8s Pods      │
└────────────┘  └────┬───────────┘
                     │
        ┌────────────┼──────────────┐
        │            │              │
   ┌────▼───┐  ┌────▼────┐  ┌──────▼─────┐
   │MongoDB │  │  Redis  │  │   Solana   │
   │ Atlas  │  │  Cloud  │  │  Mainnet   │
   └────────┘  └─────────┘  └────────────┘
```

## Development Environment

```
Docker Compose:
- frontend (Vite dev server:3000)
- backend (Express:3001)
- mongodb (local:27017)
- redis (local:6379)
- solana-test-validator (local:8899)
- clamav (local:3310)
- nudenet (local:8080)
```

See deployment/ guides for setup instructions.
