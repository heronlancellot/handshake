---
paths:
  - "src/feature/**"
---

# Feature Module Conventions

## Structure

Each feature follows this exact layout — no exceptions:

```
src/feature/[name]/
├── _api/          # API endpoint definitions (axios/fetch calls)
├── _hooks/        # React Query hooks + index.ts re-exports
├── _schema/       # Zod validation schemas
├── _types/        # TypeScript interfaces + index.ts re-exports
├── screens/       # Screen components
│   └── [Screen]/
│       ├── _components/  # Screen-specific components (not shared)
│       └── index.tsx
└── utils/         # Feature-specific utilities
```

## Import Rules

- Always re-export from `_hooks/index.ts` and `_types/index.ts`
- Import from feature index, never from internal paths of another feature
- Use `@/feature/[name]` alias — never relative paths across features

## _types/

- One interface per file, named after the entity
- Always export a `[Name]Id` branded type for IDs:
  ```typescript
  type [Name]Id = string & { readonly __brand: '[Name]Id' };
  ```
- `index.ts` re-exports everything

## _schema/

- Zod schemas mirror the types exactly
- Export `[name]Schema` and infer type via `z.infer<typeof [name]Schema>`
- Use `.transform()` for API response normalization

## _hooks/

- One hook per concern (list, detail, create, update, delete)
- All hooks use React Query (`useQuery` / `useMutation`)
- Hook names: `use[Feature][Action]` e.g. `useUserCreate`, `useUserList`
- Always export query keys as constants:
  ```typescript
  export const userKeys = {
    all: ['users'] as const,
    list: (filters: UserFilters) => [...userKeys.all, 'list', filters] as const,
    detail: (id: UserId) => [...userKeys.all, 'detail', id] as const,
  };
  ```

## _api/

- One function per endpoint
- Always type request and response explicitly
- Never use `any` for API responses — define the type

## screens/

- `index.tsx` is the screen entry — receives only typed props
- `_components/` contains components used exclusively by that screen
- Shared components go to `src/components/`, not here
