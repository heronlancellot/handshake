---
name: system-verifier
description: Full architectural audit of the entire codebase
user-invocable: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Agent
  - Bash(pnpm type-check:*)
  - Bash(pnpm lint:*)
---

# /system-verifier

Execute a comprehensive audit of the entire codebase.

## Flow

1. **Run automated checks**
   - `pnpm type-check` — TypeScript verification
   - `pnpm lint` — ESLint check

2. **Launch parallel architecture-guardian agents** for each domain:
   - **Domain 1 (Auth)**: Authentication, middleware, token handling
   - **Domain 2 (Features)**: All feature modules structure and patterns
   - **Domain 3 (Infrastructure)**: API config, endpoints, paths, interceptors
   - **Domain 4 (Components)**: Shared components, form components, UI primitives
   - **Domain 5 (Providers)**: Context providers, state management

3. **Aggregate** all results into a single report

## Output Format

```
SYSTEM VERIFICATION REPORT
══════════════════════════

Automated Checks:
  TypeScript  → PASSED | FAILED (N errors)
  ESLint      → PASSED | FAILED (N warnings, M errors)

Domain Audits:
  Auth           → PASS | WARN | FAIL
  Features       → PASS | WARN | FAIL
  Infrastructure → PASS | WARN | FAIL
  Components     → PASS | WARN | FAIL
  Providers      → PASS | WARN | FAIL

Issues Found:
  1. [severity] file:line — description
  2. ...

OVERALL: PASS | WARN | FAIL
```

## Success Criteria

- All 5 domains audited
- Automated checks executed
- All violations reported with file:line references
