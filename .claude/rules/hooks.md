---
paths:
  - "src/hooks/**"
  - "src/feature/**/_hooks/**"
---

# Hooks Conventions

## Shared hooks (src/hooks/)

Only hooks used by 2+ features belong here. Feature-specific hooks live in
`src/feature/[name]/_hooks/`.

## React Query patterns

```typescript
// Query key factory — always define as const
export const [entity]Keys = {
  all: ['[entity]'] as const,
  list: (params: [Entity]Params) => [...[entity]Keys.all, 'list', params] as const,
  detail: (id: [Entity]Id) => [...[entity]Keys.all, 'detail', id] as const,
};

// useQuery — always type the select return
export function use[Entity](id: [Entity]Id) {
  return useQuery({
    queryKey: [entity]Keys.detail(id),
    queryFn: () => [entity]Api.getById(id),
    enabled: Boolean(id),
  });
}

// useMutation — always invalidate related queries onSuccess
export function use[Entity]Create() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Create[Entity]Input) => [entity]Api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity]Keys.all });
    },
  });
}
```

## Rules

- Never call `useQuery` with `enabled: false` as default — use conditional rendering instead
- Always handle `isPending`, `isError` states at the component level
- Mutation side effects (toast, navigate) go in the component's `onSuccess`, not in the hook
- Never use `refetchInterval` without explicit user justification
