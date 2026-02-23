# How to Add a Test

This guide walks you through adding a new E2E test to the framework. Follow these steps to create tests that are maintainable, parallel-safe, and aligned with the architecture.

## Purpose

Tests in this repository express **behavior**, not UI mechanics. A test describes what a user accomplishes, not which buttons they click. The layered architecture enforces this through dependency rules.

## Prerequisites

Before adding a test:

1. Understand the dependency flow: `tests -> domain -> ui -> playwright`
2. Check if a domain object exists for your feature (e.g., `EmployeeDomain`, `LeaveDomain`)
3. Review existing tests in the target module folder for naming patterns
4. Ensure the feature requires browser interaction (otherwise consider API tests)

## Naming Conventions

Test files: `{module}/{action}.spec.ts`

Examples:

- `pim/add-employee.spec.ts`
- `leave/approve-request.spec.ts`
- `recruitment/apply-vacancy.spec.ts`

Test names describe outcomes (actor + action + result):

```typescript
// Good
test('should add employee with valid data', async () => { ... });
test('HR approves pending leave request', async () => { ... });

// Bad
test('clicks add button and fills form', async () => { ... });
```

## Folder Placement

```
tests/
├── e2e/           # Feature-specific E2E tests
│   ├── admin/
│   ├── leave/
│   ├── pim/
│   └── recruitment/
└── journeys/      # Cross-module user journeys
```

Place your test in the appropriate module folder under `tests/e2e/`. For cross-module flows, use `tests/journeys/`.

## Fixture Usage

Fixtures provide **capabilities**, not workflows. Import from the test runner:

```typescript
import { test, expect } from '../../../infra/test-runner/index.js';
```

### Available Fixtures

| Fixture          | Provides                            |
| ---------------- | ----------------------------------- |
| `auth`           | Authenticated page (user logged in) |
| `testData`       | Factory for unique test data        |
| `employeeDomain` | Employee management operations      |
| `leaveDomain`    | Leave management operations         |
| `hrmSystem`      | High-level HRM operations           |

### Using Fixtures

```typescript
test('should create employee', async ({ auth, testData }) => {
  // auth: pre-authenticated Page
  // testData: factory with getUniqueString(), createEmployee(), createUser()
});
```

### Fixture Rules

**DO:**

- Use `auth` for an authenticated page
- Use `testData` to generate unique identifiers
- Create domain objects from the `auth` page

**DO NOT:**

- Encode workflows in fixtures
- Hide side effects
- Perform assertions in fixtures

## Anti-Patterns

Avoid these patterns at all costs:

```typescript
// WRONG: Importing UI layer directly
import { EmployeePage } from '../../../ui/pages/employee-page.js';

// WRONG: Using locators in tests
await expect(page.locator('.toast')).toBeVisible();

// WRONG: Static entity names
const employeeId = 'EMP001';

// WRONG: Fixed waits
await page.waitForTimeout(2000);

// WRONG: Toast-only verification
await expect(page.getByText('Success')).toBeVisible();
// No persisted check follows

// WRONG: Workflow fixture
test('employee setup', async ({ createEmployee }) => { ... });
// Fixtures provide capabilities, not pre-created entities
```

## Worked Example

This example shows adding an employee and verifying persistence.

```typescript
import { test, expect } from '../../../infra/test-runner/index.js';
import { EmployeeDomain } from '../../../domain/employee-domain.js';

test.describe('PIM - Add Employee', () => {
  test('should add employee with valid data', async ({ auth, testData }) => {
    // 1. Create domain object from authenticated page
    const employeeDomain = new EmployeeDomain(auth);

    // 2. Generate unique test data
    const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
    const uniqueLastName = testData
      .getUniqueString('last')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-8);

    // 3. Perform the operation through domain
    const createdEmployee = await employeeDomain.createEmployee({
      firstName: 'Test',
      lastName: `Employee${uniqueLastName}`,
      employeeId: uniqueEmployeeId,
    });

    // 4. Verify persisted state using expect.poll
    await expect
      .poll(
        async () => {
          const results = await employeeDomain.searchEmployee({ employeeId: uniqueEmployeeId });
          return results.some((employee) => employee.id === uniqueEmployeeId);
        },
        { timeout: 20000, intervals: [250, 500, 1000, 2000] }
      )
      .toBe(true);

    // 5. Assert returned values
    expect(createdEmployee.id).toBe(uniqueEmployeeId);
    expect(createdEmployee.fullName).toContain(`Employee${uniqueLastName}`);
  });
});
```

**Why this works:**

1. Imports domain, not UI
2. Uses fixtures for auth and data generation
3. Unique identifiers prevent parallel collisions
4. `expect.poll` verifies persisted state, not transient UI
5. Test describes behavior ("add employee"), not steps

## Copy-Paste Template

Use this template as a starting point:

```typescript
import { test, expect } from '../../../infra/test-runner/index.js';
import { YourDomain } from '../../../domain/your-domain.js';

test.describe('{Module} - {Feature}', () => {
  test('should {action} with {condition}', async ({ auth, testData }) => {
    // Setup: Create domain object
    const domain = new YourDomain(auth);

    // Setup: Generate unique identifiers
    const uniqueId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
    const uniqueName = testData.getUniqueString('name');

    // Action: Perform operation through domain
    const result = await domain.performAction({
      field: uniqueName,
      identifier: uniqueId,
    });

    // Verification: Check persisted state
    await expect
      .poll(
        async () => {
          const results = await domain.search({ identifier: uniqueId });
          return results.some((item) => item.id === uniqueId);
        },
        { timeout: 20000, intervals: [250, 500, 1000, 2000] }
      )
      .toBe(true);

    // Verification: Assert returned values
    expect(result.id).toBe(uniqueId);
  });
});
```

## Verification Checklist

Before submitting your test, verify:

- [ ] Test file in correct module folder (`tests/e2e/{module}/`)
- [ ] Test name describes behavior, not steps
- [ ] Imports domain layer, not UI layer
- [ ] Uses `auth` and `testData` fixtures
- [ ] Generates unique identifiers for all entities
- [ ] No `sleep()`, `waitForTimeout()`, or fixed waits
- [ ] Verification checks persisted state (not just toasts)
- [ ] No static entity names or identifiers
- [ ] Test runs independently (no dependencies on other tests)
- [ ] `npx playwright test {your-file}` passes locally

## Quick Reference

| Rule         | Do This           | Not This           |
| ------------ | ----------------- | ------------------ |
| Imports      | `domain/*`        | `ui/*`             |
| Data         | Generate unique   | Static names       |
| Waits        | Let domain handle | `waitForTimeout()` |
| Verification | Persisted state   | Toast only         |
| Fixtures     | Capabilities      | Workflows          |
| Test name    | Outcome           | Steps              |

---

For architecture details, see `docs/testing-strategy.md`. For layer rules, see `AGENTS.md` in the repository root.
