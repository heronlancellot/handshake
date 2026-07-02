---
name: react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. Use when writing, reviewing, or refactoring React/Next.js code. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
---

# React Best Practices (Vercel Engineering)

70 rules across 8 categories, prioritized by impact. Rules are fetched on-demand from the upstream source — no local files needed.

## When to Apply

- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category | Impact | Prefix | Rules |
|----------|----------|--------|--------|-------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` | 6 |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` | 6 |
| 3 | Server-Side Performance | HIGH | `server-` | 10 |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` | 4 |
| 5 | Re-render Optimization | MEDIUM | `rerender-` | 15 |
| 6 | Rendering Performance | MEDIUM | `rendering-` | 11 |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` | 14 |
| 8 | Advanced Patterns | LOW | `advanced-` | 4 |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)

- `async-cheap-condition-before-await` — Check cheap sync conditions before awaiting flags or remote values
- `async-defer-await` — Move await into branches where actually used
- `async-parallel` — Use Promise.all() for independent operations
- `async-dependencies` — Use better-all for partial dependencies
- `async-api-routes` — Start promises early, await late in API routes
- `async-suspense-boundaries` — Use Suspense to stream content

### 2. Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` — Import directly, avoid barrel files
- `bundle-analyzable-paths` — Prefer statically analyzable import paths
- `bundle-dynamic-imports` — Use next/dynamic for heavy components
- `bundle-defer-third-party` — Load analytics/logging after hydration
- `bundle-conditional` — Load modules only when feature is activated
- `bundle-preload` — Preload on hover/focus for perceived speed

### 3. Server-Side Performance (HIGH)

- `server-auth-actions` — Authenticate server actions like API routes
- `server-cache-react` — Use React.cache() for per-request deduplication
- `server-cache-lru` — Use LRU cache for cross-request caching
- `server-dedup-props` — Avoid duplicate serialization in RSC props
- `server-hoist-static-io` — Hoist static I/O (fonts, logos) to module level
- `server-no-shared-module-state` — Avoid module-level mutable request state
- `server-serialization` — Minimize data passed to client components
- `server-parallel-fetching` — Restructure components to parallelize fetches
- `server-parallel-nested-fetching` — Chain nested fetches per item in Promise.all
- `server-after-nonblocking` — Use after() for non-blocking operations

### 4. Client-Side Data Fetching (MEDIUM-HIGH)

- `client-swr-dedup` — Use SWR for automatic request deduplication
- `client-event-listeners` — Deduplicate global event listeners
- `client-passive-event-listeners` — Use passive listeners for scroll
- `client-localstorage-schema` — Version and minimize localStorage data

### 5-8. Medium/Low Priority

Remaining categories (rerender, rendering, js, advanced) contain 44 additional rules. Fetch specific rules on-demand when needed.

## How to Use

### Fetching a specific rule

When you need details on a specific rule, use WebFetch to get it:

```
URL: https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/rules/{rule-name}.md
```

Example: To get the `async-parallel` rule:
```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/rules/async-parallel.md")
```

### Fetching the full compiled guide

For a comprehensive review, fetch the full AGENTS.md:
```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/AGENTS.md")
```

### Workflow

1. Identify which category applies to the current task
2. Start with CRITICAL/HIGH rules — they have the most impact
3. Fetch individual rule files only for rules you need to apply
4. Apply the pattern shown in the correct/incorrect examples

## Source

Upstream: `vercel-labs/agent-skills` — `skills/react-best-practices/`
