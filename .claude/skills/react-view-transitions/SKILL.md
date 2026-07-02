---
name: react-view-transitions
description: Implement smooth, native-feeling animations using React View Transition API. Use when adding page transitions, route animations, shared element morphs, enter/exit animations, list reorder animations, or integrating view transitions in Next.js. Triggers on mentions of ViewTransition, startViewTransition, transition types, or animating between UI states without third-party libraries.
---

# React View Transitions

Animate between UI states using the browser's native `document.startViewTransition`. Declare *what* with `<ViewTransition>`, trigger *when* with `startTransition` / `useDeferredValue` / `Suspense`, control *how* with CSS classes.

## When to Apply

- Adding page transitions or route animations
- Animating enter/exit of components
- Creating shared element transitions (list-to-detail morphing)
- Implementing directional (forward/back) navigation animations
- Integrating view transitions in Next.js App Router
- Animating list reorder or Suspense fallback reveals

## Availability

- **Next.js:** Works out of the box — do NOT install `react@canary`
- **Without Next.js:** Install `react@canary react-dom@canary`
- Browser: Chromium 111+, Firefox 144+, Safari 18.2+. Graceful degradation.

## Pattern Priority

Implement **all** applicable patterns, in this order:

| Priority | Pattern | What it communicates |
|----------|---------|---------------------|
| 1 | **Shared element** (`name`) | "Same thing — going deeper" |
| 2 | **Suspense reveal** | "Data loaded" |
| 3 | **List identity** (per-item `key`) | "Same items, new arrangement" |
| 4 | **State change** (`enter`/`exit`) | "Something appeared/disappeared" |
| 5 | **Route change** (layout-level) | "Going to a new place" |

## Core Concepts (Quick)

```jsx
import { ViewTransition } from 'react';

// Basic enter/exit
{show && (
  <ViewTransition enter="fade-in" exit="fade-out">
    <Panel />
  </ViewTransition>
)}

// Shared element morph
<ViewTransition name={`hero-${id}`} share="morph">
  <img src={src} />
</ViewTransition>

// List reorder
{items.map(item => (
  <ViewTransition key={item.id}><ItemCard item={item} /></ViewTransition>
))}
```

**Critical rules:**
- Only `startTransition`, `useDeferredValue`, or `Suspense` activate VTs
- `<ViewTransition>` must appear **before any DOM nodes** (not wrapped in a div)
- Always use `default="none"` to prevent unwanted cross-fades
- `router.back()` does NOT trigger view transitions — use `router.push()` with explicit URL

## How to Use — Fetch References On-Demand

### Full SKILL.md (complete guide, ~320 lines)
```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-view-transitions/SKILL.md")
```

### Implementation workflow (step-by-step)
```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-view-transitions/references/implementation.md")
```

### CSS animation recipes (copy-paste ready)
```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-view-transitions/references/css-recipes.md")
```

### Advanced patterns + troubleshooting
```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-view-transitions/references/patterns.md")
```

### Next.js App Router integration
```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-view-transitions/references/nextjs.md")
```

### Full compiled guide (all references expanded)
```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-view-transitions/AGENTS.md")
```

## Workflow

1. Start with the implementation guide (`references/implementation.md`) — it includes an audit step
2. Copy CSS recipes from `references/css-recipes.md` into global stylesheet — do NOT write custom animation CSS
3. For Next.js specifics, fetch `references/nextjs.md`
4. For advanced patterns or troubleshooting, fetch `references/patterns.md`

## Source

Upstream: `vercel-labs/agent-skills` — `skills/react-view-transitions/`
