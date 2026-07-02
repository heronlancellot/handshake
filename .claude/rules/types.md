---
paths:
  - "src/types/**"
  - "src/feature/**/_types/**"
---

# TypeScript Types Conventions

## Shared types (src/types/)

Only types used by 2+ features belong here. Feature-specific types live in
`src/feature/[name]/_types/`.

## Branded IDs

All entity IDs must be branded to prevent mixing:

```typescript
// Correct
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function getUser(id: UserId) { ... }

// This now fails at compile time — prevents bugs
const orderId: OrderId = 'abc' as OrderId;
getUser(orderId); // Error: Type 'OrderId' is not assignable to type 'UserId'
```

## Interface vs Type

- Use `interface` for object shapes that can be extended (entities, props)
- Use `type` for unions, intersections, and branded primitives

## Naming

| Pattern | Convention | Example |
|---------|-----------|---------|
| Entity | PascalCase noun | `User`, `Order` |
| DTO (create) | `Create[Entity]Input` | `CreateUserInput` |
| DTO (update) | `Update[Entity]Input` | `UpdateUserInput` |
| Query params | `Get[Entity]Params` | `GetUsersParams` |
| Response page | `Paginated[Entity]` | `PaginatedUser` |

## Rules

- Never use `any` — use `unknown` and narrow with type guards
- Never use `@ts-ignore` — fix the type problem
- Prefer `readonly` on arrays: `readonly User[]` or `ReadonlyArray<User>`
- Enums → use `const` objects + `keyof typeof`:
  ```typescript
  export const UserRole = { Admin: 'admin', Member: 'member' } as const;
  export type UserRole = (typeof UserRole)[keyof typeof UserRole];
  ```
