---
paths:
  - "src/components/**"
---

# Shared Components Conventions

## When a component belongs here

A component belongs in `src/components/` only if it is used by **2 or more** features or screens.
If it's used by only one screen, it lives in `src/feature/[name]/screens/[Screen]/_components/`.

## Structure

```
src/components/
├── ui/            # Primitive UI elements (Button, Input, Badge...)
├── layout/        # Layout wrappers (Container, Grid, PageHeader...)
├── feedback/      # Loading states, error boundaries, empty states
└── [domain]/      # Domain-specific shared components
```

## Rules

- Each component in its own file, named in PascalCase
- Props interface exported alongside the component: `export interface ButtonProps {...}`
- No business logic — components are purely presentational
- No direct API calls — data comes via props or hooks passed from parent
- No feature-specific imports — components must not import from `src/feature/`

## Props Pattern

```typescript
export interface [Component]Props {
  // Required props first
  // Optional props after, with JSDoc if non-obvious
  className?: string; // always last
}

export function [Component]({ prop1, prop2, className }: [Component]Props) {
  // ...
}
```
