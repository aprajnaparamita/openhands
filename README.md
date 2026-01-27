![Portfolio Image](./about/out-043.jpg)

# Decentralized Art Commission Platform for Displaced Artists

## Background & Motivation

On the weekends I do volunteer work with **[Tzu Chi](https://global.tzuchi.org/)**, I worked closely with refugee families and came to understand the severe constraints they face in host countries. Many refugees are legally prohibited from working, despite having time, skill, and strong motivation to contribute. This creates a crushing pressure: talent without a legal or economic outlet.

Art became a natural bridge. By providing art supplies, I discovered several individuals with exceptional artistic ability such as [Mirab Tariq](./about/Mirab_portfolio.pdf). (She was recently honored with a full-ride scholarship to the Kansas City Art Institute.) However, they have no way to safely connect with patrons, no ability to receive payments, and no trusted system to protect them from exploitation. Traditional platforms fail this population due to identity requirements, banking restrictions, and jurisdictional barriers.

This project proposes a **decentralized art-commission platform** that allows displaced artists to accept project-based art commissions in a way that is non-custodial, reputation-driven, and respectful of legal boundaries.

![Portfolio Image](./about/out-041.jpg)

## Core Concept

The platform enables **requesters** to commission artwork and **providers** (displaced artists) to deliver completed pieces under clearly defined terms. Payments are handled via cryptocurrency escrow, avoiding cash handling or employment classification.

The system is designed around:

- Trust minimization  
- Progressive reputation  
- Non-custodial payments  
- Minimal personal data collection  
- Strong abuse and spam prevention  

![Portfolio Image](./about/out-022.jpg)

## Authentication & Identity

Authentication is handled using **[Particle Network](https://particle.network)** enabling:

- Email or wallet-based login  
- Wallet abstraction for non-technical users  
- Cross-chain identity linkage  

After authentication, the backend issues **JWTs** with scoped permissions. Tokens are short-lived, rotated securely, and never expose sensitive user data. Wallet addresses serve as the primary identity anchor; real names are never required.

![Portfolio Image](./about/out-039.jpg)

## Backend Architecture

The backend is built with **[Express](https://expressjs.com)** using a strict **Clean / Onion Architecture**:

- **Domain layer**: pure business rules (projects, reviews, eligibility)  
- **Application layer**: use cases and orchestration  
- **Infrastructure layer**: MongoDB, blockchain adapters, storage, CAPTCHA  
- **Presentation layer**: Express routes and controllers only  

Data is stored in **[MongoDB](https://www.mongodb.com)**, chosen for its flexibility with user profiles, portfolios, chats, and project metadata.

No domain logic depends on Express, MongoDB, JWTs, or blockchain libraries.

![Portfolio Image](./about/out-044.jpg)

## Provider Profiles & Portfolios

Each provider has a **public profile page** that includes:

- Profile image  
- Header image  
- Display name and biography  
- Uploadable art portfolio (multiple works with titles and descriptions)  

All images are uploaded via signed URLs to cloud object storage, with:

- MIME type validation  
- File size limits  
- EXIF metadata stripping  
- Virus scanning  
- NudeNet scanning with admin notification

This allows artists to showcase their work without exposing personal or legal identifiers.

![Portfolio Image](./about/out-013.jpg)

## Project Flow

1. **Requester creates a project**
   - Uploads reference images  
   - Provides a description  
   - Funds escrow using tokens or stablecoins  

2. **Provider accepts terms**
   - Eligibility is checked (review status & concurrency rules)  
   - Smart contract escrow is activated  

3. **Chat-based collaboration**
   - Project-scoped chat  
   - Image uploads supported for drafts and references  

4. **Delivery**
   - Provider uploads final artwork  
   - Content hash recorded for integrity  

5. **Review & Completion**
   - Both parties must submit reviews  
   - Funds are released to the provider  

![Portfolio Image](./about/out-002.jpg)

## Review & Reputation System

The platform enforces **mandatory reviews** to protect both parties.

### Review Rules

- **Before 3 completed projects**:
  - Provider may only handle **one active project**  
  - Reviews are required **before and after** each project  
  - No new projects can be accepted until reviews are completed  

- **After 3 completed reviews**:
  - Provider may accept **multiple concurrent projects**  
  - Reviews remain required, but are no longer blocking  

This creates a gradual trust curve while preventing early exploitation or abuse.

![Portfolio Image](./about/out-042.jpg)

## Blockchain & Payments

Payments and escrow logic are implemented using:

- **[Solana](https://solana.com)** for fast, low-cost transfers  
- EVM-compatible smart contracts for escrow, project state, and reputation logic  

Funds are never held by the platform. Escrow contracts release payments only when delivery and review conditions are satisfied.

All smart contracts undergo:

- Static analysis  
- Fuzz testing  
- Independent third-party security audits  

![Portfolio Image](./about/out-033.jpg)

## Anti-Abuse & Spam Prevention

To prevent account farming and spam:

- CAPTCHA is required during account creation and sensitive actions  
- Rate limiting enforced via middleware  
- Wallet + Particle identity binding  
- Review-gated progression limits abuse incentives  

![Portfolio Image](./about/out-011.jpg)

## Testing & CI/CD

The system includes:

- Unit tests for domain logic  
- Integration tests for API and database  
- Smart contract tests  
- End-to-end user flow tests  

Continuous integration ensures:

- Type safety  
- Linting and formatting  
- Contract test execution  
- Security checks before deployment  


![Portfolio Image](./about/out-012.jpg)

## Legal & Ethical Positioning

The platform:

- Does not classify providers as employees  
- Frames work strictly as **art commissions**  
- Avoids collecting sensitive personal or legal status data  
- Uses wallet-based identity rather than government documents  

This minimizes risk while preserving dignity, autonomy, and safety for providers.

![Portfolio Image](./about/out-019.jpg)

## Getting Started

First, create and configure the `.env` file by referring to the `.env.sample`.

```
# Particle Project Config, learn more info:  https://dashboard.particle.network/
REACT_APP_PROJECT_ID=xxxx
REACT_APP_CLIENT_KEY=xxxx
REACT_APP_APP_ID=xxxx

# WalletConnect Project Id, learn more info: https://cloud.walletconnect.com/
REACT_APP_WALLETCONNECT_PROJECT_ID=xxxx
```

Run the development server:

```bash
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
