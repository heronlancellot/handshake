# Project: Handshake (monad-sao-paulo)

> Web3 marketplace + lending pool on Monad. Next.js frontend + Hardhat smart contracts.

## Boundaries

### Always

- Read CLAUDE.md and relevant docs before making changes
- Follow the established patterns and conventions in `.claude/rules/`
- Use the `@/` import alias for all imports
- Handle errors consistently using the project's error handling pattern
- Run verification commands before considering work complete
- Ask for clarification when requirements are ambiguous
- Use named exports in feature modules

### Never

- Use `@ts-ignore`, `as any`, or disable type checking
- Leave `console.log`, `TODO`, or placeholder code in production
- Hardcode URLs, paths, or configuration values
- Push to remote without explicit user confirmation
- Skip verification steps (type-check, lint)
- Modify files outside the scope of the current task
- Import from another feature's internal directories

## Architecture Overview

**Stack:**

| Layer           | Technology                                   |
| --------------- | -------------------------------------------- |
| Framework       | Next.js 16.2 (App Router)                    |
| Language        | TypeScript 5 (strict)                        |
| Styling         | Tailwind CSS v4                              |
| State           | TanStack React Query v5                      |
| Web3            | wagmi v2 + viem v2 + RainbowKit v2           |
| Smart Contracts | Solidity 0.8.20 (Hardhat)                    |
| Storage         | Pinata (IPFS)                                |
| Notifications   | Sonner                                       |
| i18n            | Custom (src/lib/i18n)                        |
| Package Mgr     | pnpm                                         |

**Directory Structure:**

```
app/                    # Next.js App Router routes (root-level)
├── api/pinata/         # API routes (image + json upload)
├── my-deals/           # User's deals page
├── my-loans/           # User's loans page
├── pool/               # Lending pool page
├── product/[id]/       # Product detail page
├── profile/            # User profile page
├── sell/               # Sell/list product page
├── layout.tsx          # Root layout
└── page.tsx            # Home page

src/
├── components/         # Shared UI components
│   ├── layout/         # Navbar, BottomNav
│   ├── ui/             # UI primitives
│   ├── feedback/       # Toast, Loading, Error
│   ├── form/           # Form primitives
│   └── ProductCard.tsx # Product display card
├── feature/            # Feature modules (empty — to be populated)
├── hooks/              # Shared hooks
│   ├── useLendingPool.ts
│   ├── useMarketplace.ts
│   ├── useIPFSImage.ts
│   └── useOnChainReputation.ts
├── lib/                # Utilities, services, configs
│   ├── contract.ts     # Contract ABIs and addresses
│   ├── errors.ts       # Error handling
│   ├── ipfs.ts         # IPFS/Pinata utilities
│   ├── lendingPool.ts  # Lending pool helpers
│   ├── wagmi.ts        # Wagmi/RainbowKit config
│   └── i18n/           # Internationalization (en, pt)
├── providers/          # Context providers
│   └── Web3Provider.tsx
└── types/              # Shared type definitions
    ├── marketplace.ts  # Listing, Deal, Offer
    └── reputation.ts   # ReputationTier, Badge, OwnedNFT, etc.

smart-contract/         # Hardhat project
├── contracts/
│   ├── MonadMarketplace.sol   # P2P marketplace contract
│   └── LendingPool.sol        # Lending pool contract
└── hardhat.config.ts          # Monad testnet + mainnet
```

## Feature Module Pattern

Each feature follows this standardized structure:

```
src/feature/[name]/
├── _api/          # API endpoint definitions (1 function per endpoint)
├── _hooks/        # React Query hooks + index.ts re-exports
├── _schema/       # Zod validation schemas
├── _types/        # TypeScript interfaces + index.ts re-exports
├── screens/       # Screen components
│   └── [Screen]/
│       ├── _components/  # Screen-specific components
│       └── index.tsx
└── utils/         # Feature-specific utilities
```

## Commands

```bash
pnpm dev            # Development server
pnpm build          # Production build
pnpm lint           # ESLint check (eslint)
pnpm start          # Start production server
```

> Note: `type-check`, `test`, `format` scripts are not configured yet. Add them as needed.

## Context System (3 Tiers)

### Tier 1 — This file (always loaded)
Global rules, architecture overview, commands. Keep lean.

### Tier 2 — `.claude/rules/` (auto-loaded by path)
Domain-specific conventions loaded automatically when the agent works in matching paths:

| File | Auto-loads when working in |
|------|---------------------------|
| `feature-module.md` | `src/feature/**` |
| `components.md` | `src/components/**` |
| `hooks.md` | `src/hooks/**`, `src/feature/**/_hooks/**` |
| `api.md` | `src/feature/**/_api/**`, `src/lib/api*` |
| `types.md` | `src/types/**`, `src/feature/**/_types/**` |
| `testing.md` | `**/*.test.ts`, `**/*.spec.ts` |
| `security.md` | `**/*.ts`, `**/*.tsx` (cross-cutting) |
| `code-style.md` | `**/*.ts`, `**/*.tsx` (cross-cutting) |

### Tier 3 — `.claude/docs/` (on-demand by sub-agents)
Heavy reference guides loaded only when needed:

| File | When to load |
|------|-------------|
| `architecture-overview.md` | Designing a new feature, evaluating where code belongs |
| `feature-module-guide.md` | Building a complete feature module from scratch |

## Agents Available

| Agent                  | Role                                | Model |
| ---------------------- | ----------------------------------- | ----- |
| task-executor          | Implements atomic tasks             | opus  |
| task-verifier          | Validates completed implementations | opus  |
| reviewer               | Code review (security, quality)     | opus  |
| architecture-guardian  | Enforces architectural patterns     | opus  |
| expert                 | Domain/stack specialist consultant  | opus  |

## Skills Available

| Skill              | Command                         | Purpose                                        |
| ------------------ | ------------------------------- | ---------------------------------------------- |
| prime              | `/prime`                        | Load full project context before starting work |
| prime-feature      | `/prime-feature [feature-name]` | Load focused context for a specific feature    |
| setup              | `/setup`                        | Auto-adapt config to the real repo             |
| enhance            | `/enhance [request-name]`       | Request → structured task spec                 |
| planner            | `/planner [task-name]`          | Task spec → atomic execution plan              |
| execute-todo       | `/execute-todo [task-name]`     | Orchestrates parallel task execution           |
| system-verifier    | `/system-verifier`              | Full architectural audit                       |
| handoff            | `/handoff`                      | Write session handoff for next agent/session   |
| ui-ux-pro-max      | `/ui-ux-pro-max`                | Design intelligence: styles, colors, fonts     |
| debug              | `/debug`                        | Systematic debugging workflow                  |
| refactor           | `/refactor`                     | Safe refactoring with test preservation        |
| test-gen           | `/test-gen`                     | Generate tests for existing code               |
| review-pr          | `/review-pr`                    | Structured PR review with severities           |

## Development Workflow

```
0. /prime                  →  Orient on project context (new session)
   /prime-feature [name]   →  Orient on specific feature (focused work)

1. Write request     →  developer/requests/[name].md
2. /enhance [name]   →  developer/tasks/[name]/task.md
3. /planner [name]   →  developer/tasks/[name]/MAIN.md + todo/*.md
4. /ui-ux-pro-max    →  Design system: styles, colors, fonts (UI tasks)
5. /execute-todo [name] → Automated implementation + verification
6. /system-verifier  →  Final audit

7. /handoff          →  Write HANDOFF.md before ending long sessions
```

## Ad-hoc Skills

```
/debug              →  Track down and fix a bug (6-step workflow)
/refactor           →  Safe refactoring (tests pass at every step)
/test-gen           →  Generate tests for existing code
/review-pr          →  Review a pull request with structured feedback
```

## Vercel Labs Skills (auto, fetch on-demand)

These skills fetch rules remotely from `vercel-labs/agent-skills` — no local rule files needed. They activate automatically when the agent detects a relevant task.

| Skill | Triggers on |
|---|---|
| `react-best-practices` | Writing/reviewing React/Next.js code, performance optimization |
| `web-design-guidelines` | UI review, accessibility audit, UX check |
| `composition-patterns` | Component refactoring, boolean prop proliferation, API design |
| `react-view-transitions` | Page transitions, route animations, shared element morphs |
