---
name: execute-todo
description: Orchestrates parallel execution and verification of all tasks in a plan
user-invocable: true
argument-hint: task-name
allowed-tools:
  - Read
  - Write
  - Edit
  - Agent
  - Bash(pnpm type-check:*)
---

# /execute-todo $ARGUMENTS

Orchestrate the execution of all tasks in an execution plan.

## Input

Read from `developer/tasks/$ARGUMENTS/MAIN.md`

## Execution Flow

1. **Read** the complete MAIN.md plan
2. **Identify** ready tasks: status `[ ]` with all dependencies `[x]`
3. **Launch** task-executor agents in parallel for all ready tasks
4. **Update** MAIN.md: `[ ]` → `[-]` as tasks start
5. **Verify** each completed task with task-verifier agent
6. **Update** based on verification:
   - CONFIRMED or FIXED → `[-]` → `[x]`
   - FAILED → `[-]` → `[!]`, re-run with failure context
7. **Repeat** steps 2-6 until all tasks are `[x]`
8. **Final** verification: `pnpm type-check`

## Status Symbols

| Symbol | Meaning |
|--------|---------|
| `[ ]`  | Pending |
| `[-]`  | In progress |
| `[x]`  | Complete + verified |
| `[!]`  | Failed (needs rework) |

## Rules

1. **Respect dependencies** — never start a task before its dependencies are `[x]`
2. **Maximize parallelism** — launch all ready tasks simultaneously
3. **Always verify** — never mark `[x]` without task-verifier confirmation
4. **Stop on double failure** — if a task fails twice, halt and report
5. **Type-check at end** — run `pnpm type-check` after all tasks complete

## Success Criteria

- All tasks in MAIN.md marked `[x]`
- `pnpm type-check` passes with 0 errors
- No `[!]` tasks remaining
