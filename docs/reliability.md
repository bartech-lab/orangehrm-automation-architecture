# Reliability Guide

This document explains how to write tests that pass consistently, fail clearly, and remain stable as the application evolves.

Flaky tests destroy trust in automation. A test that passes sometimes and fails others is worse than no test at all. This guide establishes patterns that prevent flakiness at the architectural level.

## Locator Stability Rules

Stable locators survive UI refactoring. They express intent rather than DOM structure.

### Selector Priority

Playwright locators find elements by semantic meaning. Use this priority order:

1. **Role selectors** (`getByRole`) match ARIA roles and accessible names
2. **Test IDs** (`getByTestId`) target elements marked for testing
3. **Label associations** (`getByLabel`) find form fields by their labels
4. **Semantic attributes** (`getByPlaceholder`, `getByAltText`) use meaningful HTML
5. **Text content** (`getByText`) for visible, stable labels only
6. **CSS selectors** as absolute last resort

### Locator Anti-Patterns

Avoid these patterns that create brittle selectors:

```typescript
// WRONG: Structural selectors break when layout changes
await page.locator('div > div:nth-child(3) > button').click();

// WRONG: Deep CSS chains assume DOM hierarchy
await page.locator('.sidebar .menu-item.active .submenu li:first-child').click();

// WRONG: Text matching for dynamic content
await page.locator('text=Submit (2 items)').click();

// RIGHT: Role-based locator survives refactoring
await page.getByRole('button', { name: 'Save Employee' }).click();

// RIGHT: Test ID when no semantic role exists
await page.getByTestId('employee-form-submit').click();
```

### Dynamic Content Handling

When content changes (counts, timestamps, user names), use partial matching:

```typescript
// Use regex for dynamic suffixes
await expect(page.getByText(/Employee created successfully/i)).toBeVisible();

// Or verify presence without exact match
await expect(page.locator('[data-testid="employee-list"]')).toContainText(lastName);
```

## Anti-Flakiness Patterns

Flakiness comes from race conditions, environmental variance, and timing assumptions. These patterns eliminate those sources.

### No Fixed Waits

Never use `sleep()`, `waitForTimeout()`, or arbitrary delays. They slow tests without fixing timing issues.

```typescript
// WRONG: Assumes 2 seconds is always enough
await page.click('#save');
await page.waitForTimeout(2000);

// RIGHT: Wait for actual completion signal
await page.click('#save');
await page.waitForSelector('[data-testid="success-message"]');
```

Page objects handle waiting internally. Callers never add delays.

### State-Based Waiting

Wait for state changes, not time. Playwright's auto-waiting handles most cases. For custom conditions, use `expect.poll()`:

```typescript
// Poll until condition is met
await expect
  .poll(
    async () => {
      const results = await domain.search({ id });
      return results.length > 0;
    },
    { timeout: 20000, intervals: [250, 500, 1000, 2000] }
  )
  .toBe(true);
```

### Deterministic Data

Tests generate unique identifiers to prevent collisions in parallel execution:

```typescript
// Generate unique data per test
const uniqueId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
const uniqueName = testData.getUniqueString('employee');
```

Static names cause failures when tests run concurrently or retry.

## Waiting Philosophy

Waiting is the primary source of flakiness. The framework handles waiting so tests don't need to.

### Implicit Waiting

Playwright actions auto-wait for elements to be actionable:

- `click()` waits for element to be visible and enabled
- `fill()` waits for element to be visible and editable
- `navigate()` waits for load event by default

Trust these mechanisms. Don't add redundant waits.

### Explicit Waiting

Use explicit waits only when:

- Verifying state changes in external systems
- Waiting for background processing to complete
- Polling for async operation results

Domain objects encapsulate explicit waits. Tests call `domain.createEmployee()` and the domain handles all waiting internally.

### Wait Scope

Page methods ensure completion before returning:

```typescript
// Page method waits for save to complete
async saveEmployee(): Promise<void> {
  await this.saveButton.click();
  await this.page.waitForURL(/\/pim\/viewEmployeeList/);
  await this.page.waitForLoadState('networkidle');
}
```

Callers assume success when the method returns.

## Handling Async UI

Modern applications load content asynchronously. Tests must handle this without adding brittleness.

### Loading States

Wait for loading to complete before interacting:

```typescript
async waitForReady(): Promise<void> {
  await this.page.waitForSelector('[data-testid="loading-spinner"]', { state: 'detached' });
  await this.page.waitForSelector('[data-testid="employee-table"]');
}
```

### Progressive Loading

For infinite scroll or progressive rendering, scroll then wait:

```typescript
async loadMoreResults(): Promise<void> {
  const currentCount = await this.resultItems.count();
  await this.loadMoreButton.click();
  await this.page.waitForFunction(
    (expected) => document.querySelectorAll('[data-testid="result-item"]').length > expected,
    currentCount
  );
}
```

### Animation Considerations

Disable animations in test environments when possible. If animations must run, wait for them:

```typescript
// Wait for modal animation
await this.page.waitForSelector('.modal', { state: 'visible' });
await this.page.waitForTimeout(300); // Only for animation, never for logic
```

Keep animation waits minimal and isolated.

## Network Instability Mitigation

Network variability causes intermittent failures. The framework mitigates this at multiple levels.

### Retry Configuration

Playwright retries handle transient failures:

```typescript
// playwright.config.ts
retries: process.env.CI ? 1 : 0,
```

- Local: 0 retries (fail fast for development)
- CI: 1 retry (handle infrastructure blips)

Retries are a safety net, not a fix for broken tests.

### Request Waiting

Wait for network stability after mutations:

```typescript
await Promise.all([this.page.waitForResponse(/api\/employees/), this.saveButton.click()]);
```

This ensures the API call completes before proceeding.

### Graceful Degradation

When APIs are unavailable, tests should fail clearly:

- Use specific timeouts with descriptive messages
- Verify final state, not intermediate steps
- Fail on missing data, not timing assumptions

## Failure Observability

When tests fail, you need information to diagnose the cause. The framework captures comprehensive artifacts.

### Screenshots on Failure

Playwright captures screenshots automatically:

```typescript
// playwright.config.ts
use: {
  screenshot: 'only-on-failure',
}
```

Screenshots show the exact UI state at failure point.

### Video Recording

Videos capture the sequence leading to failure:

```typescript
// playwright.config.ts
use: {
  video: 'retain-on-failure',
}
```

Review videos to understand timing issues and animation problems.

### Trace Collection

Traces provide step-by-step execution details:

```typescript
// playwright.config.ts
use: {
  trace: 'retain-on-failure',
}
```

Open traces in Playwright Trace Viewer to inspect:

- DOM snapshots at each step
- Network requests and responses
- Console logs and errors
- Timing of every action

### Logging Strategy

Tests should log context for debugging:

```typescript
// Log test data for reproduction
console.log(`Test employee ID: ${employeeId}`);
console.log(`Test user: ${user.email}`);
```

This enables manual reproduction of failed scenarios.

### Artifact Retention

Configure artifact retention in CI:

```yaml
# .github/workflows/test.yml
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: test-artifacts
    path: |
      test-results/
      playwright-report/
```

Failed runs preserve evidence for analysis.

## Test Isolation Rules

Isolated tests run reliably in parallel and in any order.

### Data Isolation

Each test creates its own data:

```typescript
test('should create employee', async ({ auth, testData }) => {
  const uniqueId = testData.getUniqueString('emp');
  // This test's data won't conflict with other tests
});
```

### State Independence

Tests don't depend on previous test state:

```typescript
// WRONG: Assumes employee from previous test exists
await domain.searchEmployee({ id: 'PREVIOUS_EMP_ID' });

// RIGHT: Creates own data
test('should search employee', async ({ auth, testData }) => {
  const employee = await domain.createEmployee({ ... });
  const results = await domain.searchEmployee({ id: employee.id });
});
```

### Cleanup Strategy

Clean up when practical, but unique data makes cleanup optional:

```typescript
test.afterEach(async ({ auth }) => {
  // Cleanup if needed, but don't fail if already deleted
  await domain.deleteEmployee(employeeId).catch(() => {});
});
```

### Serial Mode

Avoid serial mode except for expensive shared setup:

```typescript
// Only use when tests genuinely share unsharable resources
test.describe.configure({ mode: 'serial' });
```

Most tests should run in parallel.

## Handling Non-Deterministic Datasets

Because the demo environment may assign different users and permissions on login, tests must tolerate varying UI states.

The framework mitigates this by:

- avoiding reliance on pre-existing records
- preferring data creation within the test flow
- waiting for UI elements conditionally rather than assuming presence
- using domain-level abstractions that hide optional UI paths

These strategies reflect how automation systems are designed when backend state cannot be controlled.

## Do and Don't

### Do

| Practice                                 | Why It Helps                                  |
| ---------------------------------------- | --------------------------------------------- |
| Use role-based locators                  | Survives UI refactoring                       |
| Generate unique test data                | Prevents parallel collisions                  |
| Verify persisted state                   | Confirms actual success, not just UI feedback |
| Let page objects handle waiting          | Centralizes timing logic                      |
| Use `expect.poll()` for async conditions | Handles variable timing gracefully            |
| Capture screenshots/videos on failure    | Provides debugging evidence                   |
| Keep tests independent                   | Enables parallel execution                    |
| Log test identifiers                     | Enables reproduction of failures              |

### Don't

| Anti-Pattern                        | Why It Fails                           |
| ----------------------------------- | -------------------------------------- |
| Use `sleep()` or `waitForTimeout()` | Creates slow, still-flaky tests        |
| Rely on toast messages alone        | Misses actual persistence failures     |
| Use static entity names             | Causes collisions in parallel runs     |
| Import UI layer in tests            | Breaks architecture, creates fragility |
| Chain deep CSS selectors            | Breaks when layout changes             |
| Use `nth()` without alternatives    | Assumes element order never changes    |
| Share mutable state between tests   | Creates order dependencies             |
| Verify only UI state                | Misses backend processing failures     |

## Quick Reference

| Concern           | Pattern              | Example                                        |
| ----------------- | -------------------- | ---------------------------------------------- |
| Locator stability | Role + test ID       | `getByRole('button')` or `getByTestId('save')` |
| Async operations  | `expect.poll()`      | Poll until data appears in search              |
| Network waits     | `waitForResponse()`  | Wait for API call to complete                  |
| Parallel safety   | Unique identifiers   | `testData.getUniqueString('emp')`              |
| Failure diagnosis | Screenshots + traces | Configured in `playwright.config.ts`           |
| Test independence | Self-contained data  | Each test creates what it needs                |

## Summary

Reliable tests share common traits:

- They use stable locators that survive UI changes
- They wait for state, not time
- They generate unique data for isolation
- They verify persisted outcomes, not transient feedback
- They provide clear evidence when they fail
- They run independently in any order

The architecture enforces these patterns through layer boundaries. Following the dependency flow (`tests -> domain -> ui -> playwright`) naturally produces reliable tests.
