# Architecture Overview

> **For sub-agents:** Read only the sections relevant to your task. This document is a deep reference — not a quick summary. The quick summary lives in CLAUDE.md.

## When to load this doc

Load this document when:
- Designing a new feature module from scratch
- Evaluating where new code belongs (which layer, which directory)
- Debugging cross-feature data flow
- Onboarding to the project for the first time

Skip this document when making isolated changes within an existing feature.

---

## Stack

| Layer           | Technology              | Version | Notes                              |
| --------------- | ----------------------- | ------- | ---------------------------------- |
| Framework       | Next.js                 | 16.2.1  | App Router (app/ at root)          |
| Language        | TypeScript              | ^5      | strict mode                        |
| Styling         | Tailwind CSS            | ^4      | via @tailwindcss/postcss           |
| State Mgmt      | TanStack React Query    | ^5.94   | Server state management            |
| Web3            | wagmi + viem            | ^2.14 / ^2.47 | Wallet connection, contract calls |
| Wallet UI       | RainbowKit              | ^2.2    | Wallet connect modal               |
| IPFS            | Pinata SDK              | ^2.5    | Image + metadata uploads           |
| Notifications   | Sonner                  | ^2.0    | Toast notifications                |
| i18n            | Custom context           | —       | EN/PT support (src/lib/i18n)       |
| Package Mgr     | pnpm                    | —       |                                    |
| Smart Contracts | Solidity (Hardhat)       | 0.8.20  | Monad testnet + mainnet            |

---

## Directory Map

```
app/                         # Next.js App Router (root-level, NOT src/app/)
├── layout.tsx               # Root layout (providers, fonts)
├── page.tsx                 # Home page (marketplace listing)
├── globals.css              # Global styles
├── api/pinata/              # API routes
│   ├── image/route.ts       # Image upload to Pinata
│   └── json/route.ts        # JSON metadata upload to Pinata
├── my-deals/page.tsx        # User's active deals
├── my-loans/page.tsx        # User's lending positions
├── pool/page.tsx            # Lending pool interface
├── product/[id]/page.tsx    # Product detail + purchase
├── profile/page.tsx         # User profile + reputation
└── sell/page.tsx            # List a product for sale

src/
├── components/              # Shared UI components
│   ├── Navbar.tsx           # Top navigation (wallet connect)
│   ├── BottomNav.tsx        # Mobile bottom navigation
│   ├── ProductCard.tsx      # Product display card
│   ├── ui/                  # (empty — primitives to be added)
│   ├── layout/              # (empty)
│   ├── feedback/            # (empty)
│   └── form/                # (empty)
│
├── hooks/                   # Shared Web3 hooks
│   ├── useLendingPool.ts    # Lending pool contract interactions
│   ├── useMarketplace.ts    # Marketplace contract interactions
│   ├── useIPFSImage.ts      # IPFS image fetching
│   └── useOnChainReputation.ts # Reputation score from contract
│
├── lib/                     # Utilities, services, configs
│   ├── contract.ts          # Contract ABIs and deployed addresses
│   ├── errors.ts            # Error handling utilities
│   ├── ipfs.ts              # IPFS/Pinata helper functions
│   ├── lendingPool.ts       # Lending pool helper logic
│   ├── wagmi.ts             # Wagmi + RainbowKit configuration
│   └── i18n/                # Internationalization
│       ├── en.ts            # English translations
│       ├── pt.ts            # Portuguese translations
│       └── context.tsx      # i18n React context provider
│
├── providers/
│   └── Web3Provider.tsx     # wagmi + RainbowKit + QueryClient provider
│
├── feature/                 # (empty — feature modules to be added)
└── types/                   # Shared type definitions

smart-contract/              # Hardhat project (separate tsconfig)
├── contracts/
│   ├── MonadMarketplace.sol # P2P marketplace (list, buy, cancel, dispute)
│   └── LendingPool.sol      # Lending pool (deposit, borrow, repay)
└── hardhat.config.ts        # Networks: Monad testnet (10143) + mainnet (143)
```

---

## Layering Rules

Current project is flat (no feature modules yet). When features are created:

```
app/ → feature/[name]/screens → feature/[name]/_hooks → feature/[name]/_api
                                                       ↘ feature/[name]/_types
                              ↗ components/
                src/hooks/ ←
                src/types/ ←
```

**Current pattern (pre-feature-modules):**
- `app/` pages directly use hooks from `src/hooks/`
- `src/hooks/` use contract helpers from `src/lib/`
- `src/components/` are used by any page

---

## Key Flows

### Web3 Connection Flow

```
User clicks "Connect Wallet"
  → RainbowKit modal (via Web3Provider)
    → wagmi connects to Monad network
      → Hooks (useMarketplace, useLendingPool) become active
```

### Marketplace Purchase Flow

```
User browses products (Home page)
  → ProductCard shows listing from contract
    → Product detail page (/product/[id])
      → useMarketplace().buyProduct(id)
        → Sends transaction via viem/wagmi
```

### IPFS Upload Flow

```
Seller creates listing (/sell)
  → Image uploaded via /api/pinata/image
    → Metadata JSON uploaded via /api/pinata/json
      → IPFS hash stored on-chain via marketplace contract
```

### Lending Flow

```
User visits pool (/pool)
  → useLendingPool() reads pool state
    → deposit() / borrow() / repay() transactions
```

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `ETHERSCAN_KEY` | Etherscan API key (contract verification) | Smart contract only |
| `SEPOLIA_RPC_URL` | Sepolia testnet RPC | Smart contract only |
| `SEPOLIA_PRIVATE_KEY` | Deployer private key (Sepolia) | Smart contract only |
| `MONAD_PRIVATE_KEY` | Deployer private key (Monad) | Smart contract only |
| `PINATA_JWT` | Pinata API JWT for IPFS uploads | Yes (frontend) |
| `PINATA_GATEWAY` | Pinata gateway URL | Yes (frontend) |

> Note: Check `.env.example` or `.env.local` for the actual variable names used in the frontend.

---

## Related Docs

- `.claude/docs/feature-module-guide.md` — Detailed guide to building a complete feature module
- `CLAUDE.md` — Quick reference: stack, commands, rules
