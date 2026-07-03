# Handshake — Trustless P2P Marketplace on Monad

A decentralized peer-to-peer marketplace with on-chain escrow and BNPL (Buy Now, Pay Later) financing, built on the Monad blockchain.

> **[🇧🇷 Versão em Português](README.pt-BR.md)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://docs.soliditylang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Monad Testnet](https://img.shields.io/badge/Network-Monad%20Testnet-purple)](https://testnet.monad.xyz)

---

## The Problem

P2P commerce in emerging markets relies entirely on trust between strangers. Platforms like Facebook Marketplace and WhatsApp groups handle billions in daily transactions but offer zero protection — buyers can pay and never receive goods, sellers can ship and never get paid. Traditional escrow solutions require third-party intermediaries and bank accounts that many users don't have access to.

## The Solution

Handshake brings trust infrastructure to P2P commerce through smart contracts:

- **On-chain escrow**: Funds are locked in a smart contract until both parties confirm delivery in person — no intermediaries, no chargebacks.
- **BNPL financing**: Buyers can purchase now and pay over 30 days using their crypto as collateral, without selling their assets.
- **NFT listings**: Every product is minted as an ERC-721 NFT, creating a permanent, verifiable on-chain transaction history.
- **Reputation system**: On-chain reputation tiers (Bronze → Silver → Gold → Diamond) based on completed deals and ecosystem activity.

## Why Monad?

Monad's EVM compatibility and high throughput (10,000+ TPS) make it ideal for a marketplace where real-time offer updates, instant escrow releases, and batched reputation queries need to feel native — not like slow on-chain transactions.

---

## Key Features

- 🔒 **Escrow Protection** — MON locked in contract until both seller and buyer confirm delivery
- 💳 **BNPL** — 30% down payment, repay within 30 days (5% interest, 70% LTV)
- 🖼️ **NFT Listings** — Products minted as ERC-721 on Monad, stored on IPFS via Pinata
- ⭐ **On-chain Reputation** — Earn tiers and achievement badges purely from on-chain activity
- 🌐 **Bilingual** — English and Portuguese (pt-BR) support
- 📱 **Mobile-first** — Responsive design with bottom navigation for mobile wallets

---

## Live Contracts (Monad Testnet)

| Contract | Address |
|----------|---------|
| `MonadMarketplace` | [`0xc107F34F1E8Bc97B0d534258457D031333C8359B`](https://testnet.monadscan.com/address/0xc107F34F1E8Bc97B0d534258457D031333C8359B) |
| `LendingPool` | [`0x7a37a8a2479bd9Fbb171e4D9F00E72B099FD2a47`](https://testnet.monadscan.com/address/0x7a37a8a2479bd9Fbb171e4D9F00E72B099FD2a47) |

- **Network:** Monad Testnet (chainId `10143`)
- **RPC:** `https://testnet-rpc.monad.xyz`
- **Explorer:** https://testnet.monadscan.com
- **Native token:** MON (18 decimals)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js)              │
│                                                 │
│  /            → Active listings grid            │
│  /sell        → List a product as NFT           │
│  /product/[id]→ Details, offers, escrow panel   │
│  /my-deals    → Your sales and purchases        │
│  /my-loans    → Your BNPL loans                 │
│  /pool        → Liquidity pool dashboard        │
│  /profile     → On-chain reputation & badges    │
└───────────────────┬─────────────────────────────┘
                    │ wagmi v2 + viem + RainbowKit
                    │
┌───────────────────▼─────────────────────────────┐
│              Monad Testnet (EVM)                 │
│                                                 │
│  ┌──────────────────────┐  ┌───────────────────┐│
│  │  MonadMarketplace    │  │   LendingPool     ││
│  │  (ERC-721 + Escrow)  │◄─┤  (BNPL / Credit) ││
│  │                      │  │                   ││
│  │  listItem            │  │  depositCollateral││
│  │  makeOffer           │  │  financePurchase  ││
│  │  makeFinancedOffer   │  │  repayLoan        ││
│  │  acceptOffer         │  │  liquidate        ││
│  │  confirmDelivery     │  │                   ││
│  │  cancelDeal          │  │  LTV: 70%         ││
│  │                      │  │  Interest: 5%     ││
│  │  Platform fee: 1%    │  │  Duration: 30d    ││
│  └──────────────────────┘  └───────────────────┘│
└─────────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│             IPFS via Pinata                      │
│  NFT images and metadata                        │
└─────────────────────────────────────────────────┘
```

---

## Transaction Flows

### Standard Purchase
1. Seller calls `listItem` → NFT minted + listing created
2. Buyer calls `makeOffer` sending MON (held in escrow)
3. Seller calls `acceptOffer` → competing offers automatically refunded
4. In-person delivery occurs
5. Both parties call `confirmDelivery` → escrow released to seller (minus 1% fee)

### BNPL Purchase (Buy Now, Pay Later)
1. Buyer deposits collateral in `LendingPool` via `depositCollateral`
2. Buyer calls `makeFinancedOffer` with minimum 30% down payment
3. `LendingPool.financePurchase` covers the remainder directly into escrow
4. Seller receives 100% immediately after `confirmDelivery`
5. Buyer has 30 days to repay via `repayLoan`
6. On default: `liquidate` seizes the collateral

### Cancellation
- Either party can call `cancelDeal` at any time → MON returned to buyer
- Automatic timeout: 3 days without confirmation allows unilateral cancellation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| React | v19 |
| Web3 | wagmi v2 + viem v2 |
| Wallet UI | RainbowKit v2 |
| Data Fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Smart Contracts | Solidity 0.8.20 (Hardhat) |
| Storage | Pinata (IPFS) |
| Notifications | Sonner |
| Language | TypeScript 5 (strict mode) |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [WalletConnect Project ID](https://cloud.walletconnect.com)
- A [Pinata](https://pinata.cloud) account for IPFS uploads

### Setup

```bash
# Clone the repository
git clone https://github.com/heronlancellot/handshake.git
cd handshake

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local and fill in your keys

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet to Monad Testnet.

### Get Test MON

Visit the [Monad Testnet Faucet](https://faucet.monad.xyz) to get free test tokens.

---

## Contract Parameters

### MonadMarketplace
- Platform fee: **1%** (100 bps) on completed deals
- Escrow timeout: **3 days** — allows cancellation after inactivity
- `ReentrancyGuard` on all fund-movement functions
- Safe `.call{value}()` pattern (no `.transfer()`)

### LendingPool
- LTV (Loan-to-Value): **70%** — borrow up to 70% of deposited collateral
- Interest rate: **5%** fixed on principal
- Loan duration: **30 days**
- Minimum down payment: **30%** of item price
- Sellers always receive 100% immediately; default risk falls on buyer + pool

---

## Security

> ⚠️ **This project has not undergone a formal security audit.** It is deployed on Monad Testnet for demonstration purposes. Use with caution.

Security measures implemented:
- `ReentrancyGuard` on all state-changing functions that move funds
- `.call{value}()` for ETH transfers (no `.transfer()` / `.send()`)
- `onlyOwner` and `onlyMarketplace` access control modifiers
- Dual-confirmation model for deal completion (requires both parties)
- Events emitted on every significant state change

See [SECURITY.md](SECURITY.md) for the full security policy and how to report vulnerabilities.

---

## Smart Contract Development

```bash
cd smart-contract

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Check coverage
npx hardhat coverage

# Deploy to Monad Testnet
npx hardhat run scripts/deployMarketplace.ts --network monadTestnet
```

---

## File Structure

```
├── app/                         # Next.js App Router
│   ├── page.tsx                 # Home — listings grid
│   ├── sell/page.tsx            # List a product
│   ├── product/[id]/page.tsx    # Product detail + offers
│   ├── my-deals/page.tsx        # My deals (buy & sell)
│   ├── my-loans/page.tsx        # My BNPL loans
│   ├── pool/page.tsx            # Liquidity pool
│   ├── profile/page.tsx         # On-chain reputation
│   └── api/pinata/              # IPFS upload API routes
│
├── src/
│   ├── components/              # Shared UI components
│   ├── hooks/                   # wagmi-based contract hooks
│   ├── lib/                     # ABIs, config, IPFS utils, i18n
│   ├── providers/               # Web3Provider (wagmi + RainbowKit)
│   └── types/                   # TypeScript interfaces
│
└── smart-contract/              # Hardhat project
    ├── contracts/               # MonadMarketplace.sol, LendingPool.sol
    ├── test/                    # Contract tests (~95% coverage)
    └── scripts/                 # Deployment scripts (auto-generates ABIs)
```

---

## Roadmap

- [ ] **v1.1** — Pausable contracts (emergency circuit breaker)
- [ ] **v1.2** — Configurable parameters via governance (fees, LTV, interest)
- [ ] **v1.3** — Dispute resolution & arbitration DAO
- [ ] **v2.0** — Security audit + Monad Mainnet deployment
- [ ] **v2.1** — Mobile app (React Native)
- [ ] **v2.2** — Integration with physical delivery tracking APIs

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## License

[MIT](LICENSE) © 2025 Heron Lancellot
