---
name: enhance
description: Transforms raw development requests into structured task specifications
user-invocable: true
argument-hint: request-name
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Agent
---

# /enhance $ARGUMENTS

Transform a raw development request into a structured, actionable task specification.

## Flow

1. **Read** the request from `developer/requests/$ARGUMENTS.md`
   - If file not found, ask the user for the request description
2. **Consult** architecture-guardian to identify affected modules and existing patterns
3. **Read** relevant `docs/architecture/` files for context
4. **Create** `developer/tasks/$ARGUMENTS/task.md` with the full specification

## Output: task.md

```markdown
# Task: [Descriptive Title]

## Original Request
> [verbatim copy of the request]

## Context & Rationale
[Why this change is needed, business context]

## Scope

### Feature Modules Affected
- [list of src/feature/[name] modules]

### Pages Affected
- [list of routes/pages]

## Functional Requirements
1. [User-facing behavior requirements]
2. ...

## Technical Requirements
1. [Implementation-specific requirements]
2. ...

## Acceptance Criteria
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- ...

## Files to Create
- `path/to/new/file.tsx` — [purpose]

## Files to Modify
- `path/to/existing/file.tsx` — [what changes]

## Files to Delete
- `path/to/obsolete/file.tsx` — [reason]

## Out of Scope
- [Explicitly excluded items]

## Dependencies
- [External dependencies, APIs, packages needed]

## Risks
- [Potential issues or edge cases]
```

## Success Criteria

- task.md created in `developer/tasks/$ARGUMENTS/`
- All affected files listed explicitly
- Acceptance criteria are testable (not vague)
- Out of scope section is explicit
- No implementation code in the spec
