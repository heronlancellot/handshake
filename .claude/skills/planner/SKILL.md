---
name: planner
description: Decomposes task specifications into atomic, executable todo items
user-invocable: true
argument-hint: task-name
allowed-tools:
  - Read
  - Write
  - Glob
---

# /planner $ARGUMENTS

Decompose a task specification into atomic, dependency-ordered todo items.

## Input

Read from `developer/tasks/$ARGUMENTS/task.md`

## Output

### 1. `developer/tasks/$ARGUMENTS/MAIN.md`

Execution plan with dependency table:

```markdown
# Execution Plan: [Task Name]

## Status

| ID | Description | Status | Depends On |
|----|-------------|--------|------------|
| TODO-TYPE-1 | Define [X] interfaces | [ ] | — |
| TODO-SCHEMA-1 | Create [X] validation schema | [ ] | TODO-TYPE-1 |
| TODO-API-1 | Add [X] endpoints | [ ] | — |
| TODO-HOOK-1 | Create use[X] hooks | [ ] | TODO-TYPE-1, TODO-API-1 |
| TODO-SCREEN-1 | Implement [X] screen | [ ] | TODO-HOOK-1, TODO-SCHEMA-1 |
| TODO-ROUTE-1 | Configure [X] routing | [ ] | TODO-SCREEN-1 |

## Execution Groups

### Group 1 (parallel)
- TODO-TYPE-1
- TODO-API-1

### Group 2 (parallel, after Group 1)
- TODO-SCHEMA-1
- TODO-HOOK-1

### Group 3 (sequential)
- TODO-SCREEN-1 → TODO-ROUTE-1
```

### 2. `developer/tasks/$ARGUMENTS/todo/[TASK-ID].md`

One file per atomic task:

```markdown
# [TASK-ID]: [Short Description]

**Status:** [ ]
**Depends On:** [list or —]

## Objective
[What this task accomplishes]

## Files to Create
- `path/to/file.tsx`

## Files to Modify
- `path/to/file.tsx` — [specific changes]

## Implementation Spec
[Detailed implementation instructions — no actual code, just specs]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

## Task ID Prefixes

| Prefix | Domain |
|--------|--------|
| TODO-TYPE-N | Types/interfaces (_types/) |
| TODO-SCHEMA-N | Zod schemas (_schema/) |
| TODO-API-N | Endpoint additions |
| TODO-HOOK-N | React Query hooks (_hooks/) |
| TODO-SCREEN-N | Screen components (screens/) |
| TODO-UI-N | UI sub-components (_components/) |
| TODO-ROUTE-N | Routing (paths, config) |
| TODO-PAGE-N | Page files (app/) |
| TODO-FT-N | Feature integration |
| TODO-TEST-N | Tests |

## Rules

- Each todo must be independently executable (given its dependencies)
- No code in plan files — specs only
- Maximize parallel execution groups
- Every file mentioned in task.md must appear in at least one todo
