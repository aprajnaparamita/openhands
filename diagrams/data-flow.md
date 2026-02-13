# Data Flow Diagrams

## Project Lifecycle Flow

```
1. Create Project
   User → Frontend → POST /api/projects → Backend
   → Validate → MongoDB.insert() → Return project_id

2. Fund Escrow
   User → Frontend → POST /api/projects/:id/fund
   → Backend builds tx → Frontend signs → Solana
   → Confirmation → Backend updates status

3. Accept Project
   Provider → POST /api/projects/:id/accept
   → Check eligibility → Update MongoDB
   → Update Solana → Create chat

4. Deliver
   Provider → Upload image → S3
   → POST /api/projects/:id/deliver
   → Update status → Notify requester

5. Submit Reviews
   Both parties → POST /api/reviews
   → MongoDB + Solana → After both
   → Trigger payment release

6. Payment Release
   Backend → Solana.release_payment()
   → Transfer funds → Update status
```

## Authentication Flow

```
1. Connect Wallet
   User → Particle SDK → Wallet signature
   → Frontend → POST /api/auth/login
   → Backend verifies signature
   → Generate JWT + Refresh Token
   → Return to Frontend

2. Authenticated Request
   Frontend → Request + JWT in header
   → Backend validates JWT
   → Extract user identity
   → Process request

3. Token Refresh
   Frontend → POST /api/auth/refresh
   → Backend validates refresh token
   → Generate new access token
   → Return new token
```

See individual feature prompts for detailed flows.
