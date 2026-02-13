# System Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                 Frontend Layer                        │
│   React + TypeScript + TailwindCSS + Particle        │
│   Components | Pages | Hooks | Services              │
└────────────┬─────────────────────────────────────────┘
             │ HTTPS REST API + WebSocket
┌────────────▼─────────────────────────────────────────┐
│                 Backend Layer                         │
│         Express.js + Clean Architecture              │
│  ┌──────────┬──────────┬──────────┬──────────┐      │
│  │ Present. │  Appl.   │  Domain  │  Infra.  │      │
│  │ (Routes) │(UseCases)│(Business)│ (Repos)  │      │
│  └──────────┴──────────┴──────────┴──────────┘      │
└──┬───────────┬────────────┬──────────────────────────┘
   │           │            │
   ▼           ▼            ▼
┌──────┐  ┌────────┐  ┌──────────┐
│MongoDB│  │ Redis  │  │  Solana  │
│(Data) │  │(Cache) │  │(Escrow)  │
└──────┘  └────────┘  └──────────┘
```

See ARCHITECTURE.md for detailed explanations.
