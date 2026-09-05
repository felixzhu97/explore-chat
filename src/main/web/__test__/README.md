# Testing Setup for WhatsChat Web App

This directory contains the test suite for the WhatsChat web application built with Next.js, React, and TypeScript.

## Testing Stack

- **Vitest**: Fast and modern testing framework
- **React Testing Library**: Testing utilities for React components
- **Jest DOM**: Custom matchers for DOM elements
- **User Event**: Utilities for simulating user interactions
- **jsdom**: DOM implementation for Node.js

## Directory Structure

```
__test__/
├── app/                    # Tests for Next.js app router pages
│   └── login/             # Login page tests
├── components/            # Tests for React components
│   └── add-friend-dialog.test.tsx
├── utils/                 # Testing utilities and helpers
│   └── test-utils.tsx
└── README.md             # This file
```

## Running Tests

### From the web app directory (`src/main/web/`):

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (default for vitest)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### From the root directory:

```bash
# Run all tests across the monorepo
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Test Patterns

### Component Testing

Components are tested for:
- **Rendering**: Does the component render correctly?
- **Props**: Does the component handle props correctly?
- **User Interactions**: Do user interactions work as expected?
- **State Changes**: Do state changes update the UI correctly?
- **Error Handling**: Does the component handle errors gracefully?

Example:
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('should render with correct props', () => {
    render(<MyComponent title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    const mockHandler = vi.fn()
    
    render(<MyComponent onClick={mockHandler} />)
    
    await user.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })
})
```

### Page Testing

Pages are tested for:
- **Routing**: Does navigation work correctly?
- **Authentication**: Are auth states handled properly?
- **Form Submission**: Do forms submit correctly?
- **Loading States**: Are loading states displayed?
- **Error States**: Are errors displayed to users?

### Mock Patterns

#### Mocking Next.js Features

```typescript
import { vi } from 'vitest'

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Mock useAuth hook
vi.mock('@/src/presentation/hooks/use-auth', () => ({
  useAuth: () => ({
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  }),
}))
```

#### Mocking UI Components

```typescript
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))
```

## Test Utilities

The `test-utils.tsx` file provides:

- **Custom render function**: Wraps components with necessary providers
- **Mock data generators**: Create consistent test data
- **Mock handlers**: Reusable mock functions
- **Common assertions**: Frequently used test assertions
- **Async utilities**: Helpers for testing async operations

## Best Practices

### 1. Test User Behavior, Not Implementation

```typescript
// ❌ Testing implementation details
expect(component.state.isOpen).toBe(true)

// ✅ Testing user-visible behavior
expect(screen.getByText('Dialog Content')).toBeVisible()
```

### 2. Use Semantic Queries

```typescript
// ❌ Fragile selectors
screen.getByTestId('submit-btn')

// ✅ Semantic queries
screen.getByRole('button', { name: /submit/i })
```

### 3. Test Accessibility

```typescript
it('should have proper ARIA labels', () => {
  render(<LoginForm />)
  
  const emailInput = screen.getByLabelText(/email/i)
  expect(emailInput).toHaveAttribute('aria-required', 'true')
})
```

### 4. Mock External Dependencies

```typescript
import { vi } from 'vitest'

// Mock API calls
vi.mock('@/lib/api', () => ({
  login: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})
```

### 5. Test Error Boundaries

```typescript
import { vi } from 'vitest'

it('should handle errors gracefully', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  
  // Test error scenario
  
  consoleSpy.mockRestore()
})
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Before deployments

## Debugging Tests

### Running Specific Tests

```bash
# Run tests for a specific file
pnpm test add-friend-dialog

# Run tests matching a pattern
pnpm test -t "should render"

# Run tests in a specific directory
pnpm test __test__/components
```

### Debug Mode

```bash
# Run tests with Node debugger
pnpm test --inspect-brk

# Run with verbose output
pnpm test --reporter=verbose

# Run tests in UI mode (Vitest feature)
pnpm test --ui
```

### Common Issues

1. **Async operations**: Use `waitFor` for async state changes
2. **User events**: Always use `userEvent.setup()` before interactions
3. **Timers**: Mock timers when testing time-dependent code with `vi.useFakeTimers()`
4. **Network requests**: Mock fetch or API calls
5. **Browser APIs**: Mock browser-specific APIs in vitest.setup.ts

## Contributing

When adding new components or features:

1. Write tests alongside your code
2. Follow existing test patterns
3. Update test utilities if needed
4. Ensure tests pass before submitting PR
5. Aim for meaningful test coverage

For questions about testing patterns or debugging test issues, refer to the [React Testing Library documentation](https://testing-library.com/docs/react-testing-library/intro/) or [Vitest documentation](https://vitest.dev/guide/).
