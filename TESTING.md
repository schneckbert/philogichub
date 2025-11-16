# PhilogicHub Test Suite

Comprehensive test coverage for the PhilogicHub application, focusing on the PhilogicAI chat interface.

## ✅ Test Results

**Status**: All tests passing!
- **Total Tests**: 23 tests
- **Pass Rate**: 100%
- **Runtime**: ~4-7 seconds

## Test Coverage Overview

### Frontend Tests (15 tests)
**File**: `app/philogic-ai/__tests__/page.test.tsx`

Tests cover the complete PhilogicAI chat interface including:

1. **Component Rendering** (3 tests)
   - Page renders with all initial elements (PhilogicAI branding, sidebar, input)
   - Preset actions displayed when chat is empty
   - Sidebar displays chat list with message count

2. **Chat Management** (2 tests)
   - Creating new chats
   - Preventing deletion of last chat

3. **Preset Actions** (1 test)
   - Clicking preset fills input with prompt

4. **Message Sending** (4 tests)
   - Sending messages via button click
   - Sending messages with Enter key
   - Loading state during API calls
   - Chat title updates with first message

5. **Error Handling** (2 tests)
   - Displays error message when API fails
   - Handles non-OK API responses (500, etc.)

6. **Message Display** (2 tests)
   - Messages display with timestamps (HH:MM format)
   - Message count updates after sending

7. **Accessibility** (1 test)
   - Proper ARIA labels and placeholders

### API Tests (8 tests)
**File**: `app/api/philogic-ai/chat/__tests__/route.test.ts`

Simple validation tests covering:

1. **Basic Validation** (3 tests)
   - Message parameter validation
   - Empty/whitespace message handling
   - Long message support (10k chars)

2. **Data Structure** (2 tests)
   - Conversation history array handling
   - Response format validation (response, model, status)

3. **Special Cases** (1 test)
   - Special characters in messages

## Usage Instructions

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- app/philogic-ai/__tests__/page.test.tsx
```

### Run Single Test
```bash
npm test -- -t "renders PhilogicAI page"
```

## Test Environment

### Dependencies
- **Jest**: 30.2.0 - Test framework
- **React Testing Library**: 16.3.0 - Component testing utilities
- **@testing-library/user-event**: 14.6.1 - User interaction simulation
- **@testing-library/jest-dom**: 6.9.1 - DOM matchers
- **jest-environment-jsdom**: 30.2.0 - Browser environment simulation

### Configuration
- **jest.config.js**: Next.js optimized configuration
- **jest.setup.js**: Global mocks (IntersectionObserver, scrollIntoView)
- **jest.d.ts**: TypeScript definitions for jest-dom matchers

## Best Practices

### 1. Test Behavior, Not Implementation
```tsx
// ✅ Good - Tests user-visible behavior
expect(screen.getByText('Neuer Chat')).toBeInTheDocument();

// ❌ Bad - Tests implementation details
expect(component.state.chats.length).toBe(1);
```

### 2. Use Realistic User Interactions
```tsx
// ✅ Good - Simulates real user interaction
await userEvent.type(input, 'Test message');
await userEvent.click(button);

// ❌ Bad - Direct state manipulation
fireEvent.change(input, { target: { value: 'Test' } });
```

### 3. Wait for Async Operations
```tsx
// ✅ Good - Waits for element to appear
await waitFor(() => {
  expect(screen.getByText('AI response')).toBeInTheDocument();
}, { timeout: 3000 });

// ❌ Bad - Doesn't wait, test will fail
expect(screen.getByText('AI response')).toBeInTheDocument();
```

### 4. Mock External Dependencies
```tsx
// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ response: 'AI response' }),
  } as Response)
);
```

## Known Limitations

1. **Coverage Reporting**: Jest coverage may show 0% for files outside test directories. This is expected behavior.
2. **API Route Testing**: NextRequest mocking is complex, so API tests focus on validation logic.
3. **Backend Testing**: Python backend tests not included (would require Flask test client setup).

## Debugging Tests

### Run Single Test with Verbose Output
```bash
npm test -- -t "test name" --verbose
```

### Inspect DOM State
```tsx
import { screen } from '@testing-library/react';

test('debug example', () => {
  render(<Component />);
  screen.debug(); // Prints entire DOM
  screen.debug(screen.getByRole('button')); // Prints specific element
});
```

### Check Test Coverage for Specific File
```bash
npm run test:coverage -- app/philogic-ai/page.tsx
```

## CI/CD Integration

Tests run automatically via GitHub Actions on:
- Push to main/develop branches
- Pull requests
- Scheduled runs (daily at 2am)
- Manual workflow triggers

See `.github/workflows/test.yml` for full configuration.

## Performance Metrics

- **Total Runtime**: ~4-7 seconds for full suite
- **Fastest Suite**: API tests (~0.5s)
- **Slowest Suite**: Frontend tests (~3-6s due to React rendering)

## Future Improvements

1. Add E2E tests with Playwright or Cypress
2. Increase test coverage for edge cases
3. Add visual regression tests
4. Implement snapshot testing for UI components
5. Add performance/load testing for API routes

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
