---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
---

# Testing Conventions

## Stack

> [Replace with your testing stack, e.g.: Vitest + Testing Library + MSW]

## File placement

- Unit/integration tests: co-located with the file they test (`[file].test.ts`)
- E2E tests: `tests/e2e/` directory

## Rules

- Test behavior, not implementation — assert what the user sees, not internal state
- One `describe` block per component/hook/function
- Use `it('should [expected behavior] when [condition]')` naming
- Never import from another test file
- Mocks reset between tests — use `beforeEach` to set up, `afterEach` to clean up

## React component tests

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [Component] } from './[Component]';

describe('[Component]', () => {
  it('should [behavior]', async () => {
    const user = userEvent.setup();
    render(<[Component] />);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

## Hook tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '@/tests/utils'; // QueryClient wrapper
import { use[Entity] } from '.';

describe('use[Entity]', () => {
  it('should return data on success', async () => {
    const { result } = renderHook(() => use[Entity]('id-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```
