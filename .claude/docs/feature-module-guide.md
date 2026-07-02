# Feature Module Guide

> **For sub-agents:** Load this document when building a new feature module end-to-end, or when the task involves multiple sub-folders (_types, _schema, _hooks, _api, screens) at once. For isolated changes to a single sub-folder, the path-scoped rules in `.claude/rules/` are sufficient.

## When to load this doc

- Building a new feature module from scratch
- Adding CRUD operations to an existing feature
- Debugging an issue that spans types → api → hooks → screen

---

## Step-by-step: Building a Feature Module

### 1. Define types (`_types/`)

Start with the data model. Types drive everything else.

```typescript
// src/feature/[name]/_types/[entity].types.ts

export type [Entity]Id = string & { readonly __brand: '[Entity]Id' };

export interface [Entity] {
  id: [Entity]Id;
  // ... fields
  createdAt: string;
  updatedAt: string;
}

export interface Create[Entity]Input {
  // fields required to create
}

export interface Update[Entity]Input {
  // fields allowed to update (all optional)
}

export interface Get[Entity]Params {
  // query params for list endpoint
  page?: number;
  limit?: number;
  search?: string;
}
```

```typescript
// src/feature/[name]/_types/index.ts
export * from './[entity].types';
```

### 2. Define schema (`_schema/`)

Zod schemas for form validation and API response parsing.

```typescript
// src/feature/[name]/_schema/[entity].schema.ts
import { z } from 'zod';

export const create[Entity]Schema = z.object({
  // mirror Create[Entity]Input with validations
  name: z.string().min(1, 'Name is required').max(100),
});

export type Create[Entity]FormValues = z.infer<typeof create[Entity]Schema>;
```

### 3. Define API functions (`_api/`)

One function per endpoint, fully typed.

```typescript
// src/feature/[name]/_api/[entity].api.ts
import { api } from '@/lib/api';
import type { [Entity], [Entity]Id, Create[Entity]Input, Update[Entity]Input, Get[Entity]Params } from '../_types';

export const [entity]Api = {
  getAll: (params?: Get[Entity]Params): Promise<[Entity][]> =>
    api.get('/[entity]', { params }).then(r => r.data),

  getById: (id: [Entity]Id): Promise<[Entity]> =>
    api.get(`/[entity]/${id}`).then(r => r.data),

  create: (data: Create[Entity]Input): Promise<[Entity]> =>
    api.post('/[entity]', data).then(r => r.data),

  update: (id: [Entity]Id, data: Update[Entity]Input): Promise<[Entity]> =>
    api.patch(`/[entity]/${id}`, data).then(r => r.data),

  delete: (id: [Entity]Id): Promise<void> =>
    api.delete(`/[entity]/${id}`),
};
```

### 4. Define hooks (`_hooks/`)

React Query hooks that wrap the API functions.

```typescript
// src/feature/[name]/_hooks/use-[entity].ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [entity]Api } from '../_api/[entity].api';
import type { [Entity]Id, Create[Entity]Input, Get[Entity]Params } from '../_types';

export const [entity]Keys = {
  all: ['[entity]'] as const,
  list: (params?: Get[Entity]Params) => [...[entity]Keys.all, 'list', params] as const,
  detail: (id: [Entity]Id) => [...[entity]Keys.all, 'detail', id] as const,
};

export function use[Entity]List(params?: Get[Entity]Params) {
  return useQuery({
    queryKey: [entity]Keys.list(params),
    queryFn: () => [entity]Api.getAll(params),
  });
}

export function use[Entity](id: [Entity]Id) {
  return useQuery({
    queryKey: [entity]Keys.detail(id),
    queryFn: () => [entity]Api.getById(id),
    enabled: Boolean(id),
  });
}

export function use[Entity]Create() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Create[Entity]Input) => [entity]Api.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [entity]Keys.all }),
  });
}
```

```typescript
// src/feature/[name]/_hooks/index.ts
export * from './use-[entity]';
export { [entity]Keys } from './use-[entity]';
```

### 5. Build screens (`screens/`)

```typescript
// src/feature/[name]/screens/[Entity]List/index.tsx
import { use[Entity]List } from '../../_hooks';
import { [Entity]Card } from './_components/[Entity]Card';

export function [Entity]ListScreen() {
  const { data, isPending, isError } = use[Entity]List();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState />;

  return (
    <div>
      {data.map(item => (
        <[Entity]Card key={item.id} [entity]={item} />
      ))}
    </div>
  );
}
```

### 6. Wire up routing (`app/`)

```typescript
// src/app/[route]/page.tsx
import { [Entity]ListScreen } from '@/feature/[name]/screens/[Entity]List';

export default function [Entity]Page() {
  return <[Entity]ListScreen />;
}
```

---

## Checklist for a complete feature module

- [ ] `_types/[entity].types.ts` — entity, input types, ID brand
- [ ] `_types/index.ts` — re-exports all types
- [ ] `_schema/[entity].schema.ts` — Zod schemas for forms
- [ ] `_api/[entity].api.ts` — all CRUD functions typed
- [ ] `_hooks/use-[entity].ts` — query/mutation hooks + query keys
- [ ] `_hooks/index.ts` — re-exports
- [ ] `screens/[Screen]/index.tsx` — screen component
- [ ] `screens/[Screen]/_components/` — screen-specific components
- [ ] Route wired in `app/`
- [ ] `pnpm type-check` passes with 0 errors
