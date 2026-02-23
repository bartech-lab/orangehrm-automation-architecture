# Testing Strategy

This document defines what belongs in E2E tests, how to keep them reliable, and how the architecture supports parallel execution.

## Testing Philosophy

Tests express behavior, not UI mechanics. A test describes what a user accomplishes, not which buttons they click.

Good test names describe outcomes:

- "HR creates a new employee record"
- "Manager approves pending leave request"
- "Candidate applies to a job vacancy"

Bad test names describe steps:

- "Click add button and fill form"
- "Navigate to leave list and click approve"

This philosophy is enforced through the layered architecture. Tests import from `domain/`, not `ui/`. Domain objects expose business operations like `createEmployee()` or `approveLeaveRequest()`. Page objects handle the UI details internally.

## E2E Boundaries

### What Belongs in E2E Tests

End-to-end tests validate complete user workflows through the browser. Use E2E for:

- Critical business paths (employee creation, leave approval)
- Cross-module journeys (recruitment pipeline, onboarding flow)
- UI-specific behavior (form validation, navigation state)
- Scenarios requiring browser context (file uploads, session handling)

### What Does NOT Belong in E2E Tests

Move these to API tests or lower-level validation:

- Pure business logic calculations (leave balance computation)
- Data transformations that don't require browser rendering
- High-volume data operations (bulk imports, batch processing)
- Performance benchmarks better measured without browser overhead
- Unit-level validation rules (field format regex, edge cases)

E2E tests are expensive. They run slowly, consume resources, and can flake. Reserve them for scenarios where the browser interaction itself provides value.

### Decision Guide

Ask: "Does this test need a browser to prove correctness?"

If the answer is no, consider API tests, unit tests, or domain-level validation instead.

## Flakiness Prevention

Flaky tests destroy trust. This framework prevents flakiness through architecture, not workarounds.

### No Sleep or Fixed Waits

Tests never use `sleep()`, `waitForTimeout()`, or fixed delays. Page objects include waiting logic internally. When a method like `createEmployee()` returns, the operation is complete.

```typescript
// Wrong
await page.click('#save-button');
await page.waitForTimeout(2000);

// Right
await employeeDomain.createEmployee({ firstName: 'John', lastName: 'Doe' });
// Method handles all waiting internally
```

### Capability Fixtures Over Workflow Fixtures

Fixtures provide primitives, not workflows. The `auth` fixture gives an authenticated page. It does not perform a login workflow. The `testData` fixture generates unique data. It does not create entities.

This keeps side effects visible in the test body. You can trace exactly what happens.

### Persisted Verification

Tests verify durable state, not transient UI feedback. A toast message confirms an action was attempted. Entity presence in a search result confirms it succeeded.

The framework uses `expect.poll()` to wait for persisted state:

```typescript
await expect
  .poll(
    async () => {
      const results = await employeeDomain.searchEmployee({ employeeId });
      return results.some((e) => e.id === employeeId);
    },
    { timeout: 20000, intervals: [250, 500, 1000, 2000] }
  )
  .toBe(true);
```

This polls the actual data store, not the UI. The test passes when the entity exists, regardless of render timing.

### Retry Strategy

Playwright retries are configured per environment:

- Local development: 0 retries (fail fast for immediate feedback)
- CI environment: 1 retry (handles transient infrastructure issues)

Retries are a safety net, not a fix for flaky tests. If a test fails consistently, fix the test or the application. Do not increase retry counts.

## Data Strategy

### Unique Test Data

Every test generates unique identifiers. The `testData` fixture provides `getUniqueString()` and typed builders that incorporate timestamps and counters.

```typescript
const employeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
const uniqueLastName = testData
  .getUniqueString('last')
  .replace(/[^a-zA-Z0-9]/g, '')
  .slice(-8);
```

This prevents collisions when tests run in parallel against shared environments.

### Test Independence

Tests define their own state. No test depends on another test's execution or outcome. The serial mode (`test.describe.configure({ mode: 'serial' })`) is used sparingly, typically when tests share expensive setup that cannot be isolated.

Each test should:

- Create or reference its own test data
- Not assume prior test state
- Clean up when practical (though unique data makes cleanup optional)

### Data Ownership

Tests own their data lifecycle. Domain operations return created entities for verification. Fixtures provide factories, not pre-created entities.

## Parallel Execution

The architecture supports parallel execution at multiple levels.

### Test-Level Parallelism

Playwright runs test files in parallel by default (`fullyParallel: true`). Each test file gets an isolated worker process.

Worker count is environment-tuned:

- Local: 4 workers (balance between speed and resource usage)
- CI: 1 worker (container resource constraints, stable logging)

### Worker Isolation

Each worker has its own browser context. Tests within a file share that context but have isolated storage and cookies. The `auth` fixture handles authentication per-worker, so parallel tests don't conflict on session state.

### Data Isolation for Parallelism

Unique data generation makes parallel execution safe. Two tests creating employees simultaneously won't collide because each uses a distinct employee ID.

The `testData` fixture's counter is per-factory-instance, ensuring uniqueness within a test. Timestamps ensure uniqueness across parallel workers.

### What Breaks Parallelism

Avoid patterns that force serial execution:

- Static entity names or identifiers
- Shared mutable state between tests
- Tests that modify global configuration
- External resource contention (same user account, fixed records)

The framework's rules already prohibit these patterns. Following them guarantees parallel-safe tests.

## Non-Deterministic Demo User Context

The public OrangeHRM demo environment does not guarantee a consistent user dataset after login.

Depending on backend assignment, the authenticated session may receive:

- different employee datasets
- different available form options
- different permission scopes
- different UI visibility rules

This means the system state is not fully deterministic between runs.

### Testing Approach

The framework is designed with this constraint in mind:

- tests avoid assumptions about specific existing records
- selectors target stable UI structures rather than optional elements
- flows prefer creating their own data when possible
- assertions focus on outcomes rather than fixed datasets

This mirrors real-world automation strategies when working with shared or multi-tenant environments.

## Summary

| Concern     | Strategy                                               |
| ----------- | ------------------------------------------------------ |
| Test intent | Behavior-driven through domain layer                   |
| E2E scope   | Browser-required scenarios only                        |
| Flakiness   | No sleeps, persisted verification, capability fixtures |
| Data        | Unique per test, self-contained state                  |
| Parallelism | Architecture-enforced isolation, unique identifiers    |

This strategy keeps tests fast, reliable, and maintainable. The architecture enforces these rules, so following the layer boundaries and using the provided fixtures naturally produces good tests.
