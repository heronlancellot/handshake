---
paths:
  - "src/feature/**/_api/**"
  - "src/lib/api*"
---

# API Layer Conventions

## Structure

Each feature's `_api/` contains functions that map 1:1 to backend endpoints.

```typescript
// src/feature/[name]/_api/[entity].api.ts

import { api } from '@/lib/api'; // central axios/fetch instance

export const [entity]Api = {
  getAll: (params: Get[Entity]Params): Promise<[Entity][]> =>
    api.get('/[entity]', { params }).then(r => r.data),

  getById: (id: [Entity]Id): Promise<[Entity]> =>
    api.get(`/[entity]/${id}`).then(r => r.data),

  create: (data: Create[Entity]Input): Promise<[Entity]> =>
    api.post('/[entity]', data).then(r => r.data),

  update: (id: [Entity]Id, data: Update[Entity]Input): Promise<[Entity]> =>
    api.patch(`/[entity]/${id}`, data).then(r => r.data),

  delete: (id: [Entity]Id): Promise<void> =>
    api.delete(`/[entity]/${id}`).then(r => r.data),
};
```

## Rules

- Never use `any` for request or response types
- Never hardcode URLs — always use constants from `@/lib/api` or env vars
- All functions return typed Promises — no implicit `any`
- Error handling is done at the hook layer (`useMutation`/`useQuery`) — not here
- The central `api` instance (in `src/lib/`) is the only place to configure headers, interceptors, and base URL
