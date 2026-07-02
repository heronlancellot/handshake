---
name: composition-patterns
description: React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, designing reusable APIs, or reviewing component architecture. Covers compound components, state lifting, render props, and React 19 APIs.
---

# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid boolean prop proliferation by using compound components, lifting state, and composing internals.

## When to Apply

- Refactoring components with many boolean props
- Building reusable component libraries
- Designing flexible component APIs
- Reviewing component architecture
- Working with compound components or context providers

## Rule Categories by Priority

| Priority | Category | Impact | Rules |
|----------|----------|--------|-------|
| 1 | Component Architecture | HIGH | 2 |
| 2 | State Management | MEDIUM | 3 |
| 3 | Implementation Patterns | MEDIUM | 2 |
| 4 | React 19 APIs | MEDIUM | 1 |

## Quick Reference

### 1. Component Architecture (HIGH)

- `architecture-avoid-boolean-props` — Don't add boolean props to customize behavior; use composition
- `architecture-compound-components` — Structure complex components with shared context

### 2. State Management (MEDIUM)

- `state-decouple-implementation` — Provider is the only place that knows how state is managed
- `state-context-interface` — Define generic interface with state, actions, meta for DI
- `state-lift-state` — Move state into provider components for sibling access

### 3. Implementation Patterns (MEDIUM)

- `patterns-explicit-variants` — Create explicit variant components instead of boolean modes
- `patterns-children-over-render-props` — Use children for composition instead of renderX props

### 4. React 19 APIs (MEDIUM)

> **React 19+ only.** Skip if using React 18 or earlier.

- `react19-no-forwardref` — Don't use `forwardRef`; use `use()` instead of `useContext()`

## How to Use

### Fetching a specific rule

```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/composition-patterns/rules/{rule-name}.md")
```

Example rules:
- `architecture-avoid-boolean-props.md`
- `architecture-compound-components.md`
- `state-context-interface.md`
- `patterns-explicit-variants.md`

### Fetching the full compiled guide

```
WebFetch("https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/composition-patterns/AGENTS.md")
```

### Workflow

1. Identify the pattern problem (boolean props? prop drilling? rigid API?)
2. Fetch the relevant rule for detailed explanation + code examples
3. Apply the refactoring pattern shown in the correct examples

## Source

Upstream: `vercel-labs/agent-skills` — `skills/composition-patterns/`
