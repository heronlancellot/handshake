---
name: code-style
description: Code style and formatting conventions
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# Code Style Rules

## Naming
- **Variables/Functions**: camelCase
- **Classes/Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case for utilities, PascalCase for components
- **Private fields**: prefix with underscore

## Imports
- Group imports: external → internal → relative
- Use named imports over default imports
- Sort alphabetically within groups
- Remove unused imports

## Functions
- Max 30 lines per function
- Max 3 parameters (use object for more)
- Pure functions when possible
- Early return over nested conditions

## Types
- Explicit return types for public functions
- Interface for object shapes
- Type for unions/intersections
- No `any` — use `unknown` if truly unknown

## Comments
- Don't comment obvious code
- Use JSDoc for public APIs
- Explain "why" not "what"
- TODO must include author and date: `// TODO(author 2024-01-15): description`
