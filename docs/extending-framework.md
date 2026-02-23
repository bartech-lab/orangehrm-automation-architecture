# Extending the Framework

This guide explains how to add new capabilities to the test framework while preserving its architecture. Follow these patterns when adding modules, domain objects, UI pages, or tests.

## Before You Start

The framework enforces a strict dependency direction:

```
tests -> domain -> ui -> playwright
```

Every extension must respect this flow. Upward imports break the architecture.

## Adding a New Module

A module represents a business area (PIM, Leave, Recruitment). Each module has its own domain, pages, and tests.

### File Structure

When adding a new module called "timesheet":

```
domain/
  timesheet/
    types.ts           # Domain types
    index.ts           # Public exports
  timesheet-domain.ts  # Domain class

ui/
  pages/
    timesheet/
      timesheet-list-page.ts
      create-timesheet-page.ts

tests/
  e2e/
    timesheet/
      create-timesheet.spec.ts
      timesheet-list.spec.ts
```

### Step-by-Step

1. **Create domain types** in `domain/timesheet/types.ts`

```typescript
export interface Timesheet {
  id: string;
  employeeId: string;
  period: DateRange;
  status: TimesheetStatus;
  totalHours: number;
}

export type TimesheetStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface CreateTimesheetInput {
  employeeId: string;
  startDate: Date;
  endDate: Date;
}
```

2. **Create the domain class** in `domain/timesheet-domain.ts`

```typescript
import { CreateTimesheetPage } from '../ui/pages/timesheet/create-timesheet-page.js';
import { TimesheetListPage } from '../ui/pages/timesheet/timesheet-list-page.js';
import type { CreateTimesheetInput, Timesheet } from './timesheet/types.js';

export class TimesheetDomain {
  private readonly createPage: CreateTimesheetPage;
  private readonly listPage: TimesheetListPage;

  constructor(page: Page) {
    this.createPage = new CreateTimesheetPage(page);
    this.listPage = new TimesheetListPage(page);
  }

  async createTimesheet(data: CreateTimesheetInput): Promise<Timesheet> {
    await this.createPage.navigate();
    await this.createPage.waitForReady();
    await this.createPage.fillTimesheet(data);
    await this.createPage.submit();
    // Return the created timesheet
  }

  async getTimesheet(id: string): Promise<Timesheet | null> {
    // Search and return
  }
}
```

3. **Create page objects** in `ui/pages/timesheet/`

4. **Create tests** in `tests/e2e/timesheet/`

5. **Add domain fixture** (optional) in `infra/test-runner/fixtures.ts`:

```typescript
import { TimesheetDomain } from '../../domain/timesheet-domain.js';

export interface TestFixtures {
  // ... existing fixtures
  timesheetDomain: TimesheetDomain;
}

export const test = baseTest.extend<TestFixtures>({
  // ... existing fixtures

  timesheetDomain: async ({ auth: page }, use) => {
    const timesheetDomain = new TimesheetDomain(page);
    await use(timesheetDomain);
  },
});
```

## Adding a Domain Object

Domain objects encapsulate business workflows. They orchestrate UI interactions behind meaningful method names.

### Rules

- Domain methods express business intent, not UI steps
- Domain may import UI pages internally, but callers never see UI details
- Domain must not import Playwright test API or perform assertions
- Domain returns typed results, not page state

### Pattern

```typescript
// domain/leave-domain.ts
export class LeaveDomain {
  private readonly applyLeavePage: ApplyLeavePage;
  private readonly leaveListPage: LeaveListPage;

  constructor(page: Page) {
    this.applyLeavePage = new ApplyLeavePage(page);
    this.leaveListPage = new LeaveListPage(page);
  }

  // Good: business operation with clear return type
  async requestLeave(data: LeaveRequestInput): Promise<LeaveRequest> {
    await this.applyLeavePage.navigate();
    await this.applyLeavePage.waitForReady();
    await this.applyLeavePage.fillLeaveRequest(data);
    await this.applyLeavePage.submit();

    return {
      id: this.extractRequestId(),
      status: 'pending',
      ...data,
    };
  }

  // Good: query method returning domain data
  async getPendingLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    await this.leaveListPage.navigate();
    await this.leaveListPage.waitForReady();
    await this.leaveListPage.filterByEmployee(employeeId);
    await this.leaveListPage.filterByStatus('pending');

    return this.leaveListPage.extractLeaveRequests();
  }
}
```

### Anti-Patterns

```typescript
// BAD: Exposes UI details to caller
async clickApplyLeaveButton(): Promise<void> {
  await this.applyLeavePage.clickButton();
}

// BAD: Returns raw page state
async getLeaveListPage(): Promise<LeaveListPage> {
  return this.leaveListPage;
}

// BAD: Performs assertion
async verifyLeaveApproved(id: string): Promise<void> {
  const leave = await this.getLeave(id);
  expect(leave.status).toBe('approved');  // No assertions in domain
}
```

## Adding UI Pages and Components

Page objects represent capabilities, not DOM structure. Methods express user intent with internal waiting.

### Page Object Rules

- Encapsulate locators and selectors privately
- Handle waiting and synchronization internally
- Ensure actions complete before returning
- Never expose locator objects publicly

### Page Pattern

```typescript
// ui/pages/timesheet/create-timesheet-page.ts
import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

export class CreateTimesheetPage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/time/createTimesheet');
  }

  // Private locators - never exposed
  private employeeSelect() {
    return this.page.getByLabel(/employee name/i);
  }

  private startDateInput() {
    return this.page.getByLabel(/start date/i);
  }

  private submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  // Navigation
  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  // Readiness check
  async waitForReady(): Promise<void> {
    await this.employeeSelect().waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.employeeSelect()
      .isVisible()
      .catch(() => false);
  }

  // Intent-expressing methods with internal waits
  async fillTimesheet(data: CreateTimesheetInput): Promise<void> {
    await this.employeeSelect().fill(data.employeeName);
    await this.startDateInput().fill(formatDate(data.startDate));
    // Fill other fields...
  }

  async submit(): Promise<void> {
    await this.submitButton().click();
    await this.page.waitForURL(/\/viewTimesheet/, { timeout: 10000 });
  }
}
```

### Component Pattern

Shared UI elements live in `ui/components/`:

```typescript
// ui/components/date-picker-component.ts
import { BaseComponent } from './base-component.js';
import type { Page, Locator } from '@playwright/test';

export class DatePickerComponent extends BaseComponent {
  constructor(page: Page, rootLocator: Locator) {
    super(page, rootLocator);
  }

  private input() {
    return this.root.getByRole('textbox');
  }

  async selectDate(date: Date): Promise<void> {
    await this.input().fill(formatDate(date));
    await this.input().press('Enter');
    await this.waitForClose();
  }

  private async waitForClose(): Promise<void> {
    // Wait for picker to close
  }
}
```

### Locator Priority

Use selectors in this order:

1. Role selectors: `getByRole('button', { name: 'Save' })`
2. Test ID selectors: `getByTestId('submit-button')`
3. Label associations: `getByLabel('Employee Name')`
4. Semantic attributes: `getByPlaceholder('First Name')`
5. CSS selectors (fallback only): `locator('.submit-btn')`

Avoid:

- `nth()` unless no alternative exists
- Deep chained CSS selectors
- Text matching for layout elements

## Adding Tests

Tests describe behaviour, not interactions. They use domain objects and verify persisted state.

### Test Pattern

```typescript
// tests/e2e/timesheet/create-timesheet.spec.ts
import { test, expect } from '../../../infra/test-runner/index.js';
import { TimesheetDomain } from '../../../domain/timesheet-domain.js';

test.describe('Timesheet', () => {
  test('should create timesheet with valid data', async ({ auth, testData }) => {
    const timesheetDomain = new TimesheetDomain(auth);
    const uniqueId = testData.getUniqueString('ts');

    const timesheet = await timesheetDomain.createTimesheet({
      employeeId: 'EMP001',
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
    });

    // Verify persisted state, not UI state
    await expect
      .poll(async () => {
        const found = await timesheetDomain.getTimesheet(timesheet.id);
        return found?.status === 'pending';
      })
      .toBe(true);
  });
});
```

### Test Rules

- Use domain methods, never page objects directly
- Generate unique test data via `testData` fixture
- Verify persisted state with `expect.poll()`, not toast visibility
- Each test must be independent and runnable in any order

### Anti-Patterns

```typescript
// BAD: Imports page object directly in test
import { CreateTimesheetPage } from '../../../ui/pages/timesheet/create-timesheet-page.js';

// BAD: Uses locators in test
await page.getByRole('button', { name: 'Submit' }).click();

// BAD: Static entity name
const employeeId = 'EMP001'; // Will collide with other tests

// BAD: Toast-only verification
await expect(page.getByText('Successfully created')).toBeVisible();
```

## Future API-Layer Integration

The architecture supports adding an API layer for faster test setup and teardown. This remains a future enhancement path.

### Where API Would Fit

```
tests -> domain -> ui -> playwright
         |
         v
        api -> HTTP client
```

Domain objects could optionally use API calls for:

- Creating test data (faster than UI)
- Querying state for assertions (more reliable than UI scraping)
- Cleanup operations (faster than manual deletion)

### Preparation Steps

1. **Create API client** in `api/`:

```typescript
// api/timesheet-api-client.ts
export class TimesheetApiClient {
  constructor(
    private baseUrl: string,
    private token: string
  ) {}

  async createTimesheet(data: CreateTimesheetInput): Promise<Timesheet> {
    const response = await fetch(`${this.baseUrl}/api/timesheets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async getTimesheet(id: string): Promise<Timesheet | null> {
    // API implementation
  }
}
```

2. **Add API client to domain** (hybrid approach):

```typescript
export class TimesheetDomain {
  constructor(
    private page: Page,
    private apiClient?: TimesheetApiClient
  ) {}

  async createTimesheetForTest(data: CreateTimesheetInput): Promise<Timesheet> {
    // Use API for test setup
    if (this.apiClient) {
      return this.apiClient.createTimesheet(data);
    }
    // Fallback to UI
    return this.createTimesheet(data);
  }

  async createTimesheet(data: CreateTimesheetInput): Promise<Timesheet> {
    // UI flow for testing the creation itself
  }
}
```

3. **Add API fixture**:

```typescript
// infra/test-runner/fixtures.ts
timesheetApi: async ({}, use) => {
  const client = new TimesheetApiClient(config.baseUrl, config.apiToken);
  await use(client);
},
```

### API Layer Constraints

- API layer does not replace UI testing
- Tests that verify creation workflows still use UI
- API is for setup/teardown and state queries only
- Domain must work without API (fallback to UI)

## Boundary Guardrails

These rules preserve architecture integrity. Breaking them creates technical debt.

### Never Do These

| Rule                       | Violation                                                      | Consequence                       |
| -------------------------- | -------------------------------------------------------------- | --------------------------------- |
| Tests import UI            | `import { LoginPage } from '../../../ui/pages/login-page.js'`  | Tests fragile to UI changes       |
| Domain imports fixtures    | `import { test } from '@playwright/test'` in domain            | Domain coupled to test runner     |
| Domain performs assertions | `expect(result).toBe(true)` in domain                          | Assertion logic hidden from tests |
| UI imports domain          | `import { Employee } from '../../../domain/employee/types.js'` | Circular dependency risk          |
| UI exposes locators        | `get saveButton() { return this.page.getByRole('button') }`    | Callers must know timing          |
| Tests use static data      | `employeeId: 'EMP001'`                                         | Test collisions in parallel runs  |
| Toast-only assertions      | `await expect(toast).toBeVisible()`                            | Misses actual failures            |

### Dependency Check

Run this to verify imports:

```bash
# Tests should not import UI
grep -r "from.*ui/" tests/

# Domain should not import Playwright test API
grep -r "from '@playwright/test'" domain/

# UI should not import domain
grep -r "from.*domain/" ui/
```

All three commands should return no results.

## Extension Checklist

Before submitting a new module or capability:

### Domain

- [ ] Types defined in `domain/<module>/types.ts`
- [ ] Domain class in `domain/<module>-domain.ts`
- [ ] Methods express business intent, not UI steps
- [ ] No Playwright test imports
- [ ] No assertions
- [ ] Returns typed domain objects

### UI

- [ ] Page objects in `ui/pages/<module>/`
- [ ] Locators are private methods
- [ ] Methods express user intent
- [ ] Waiting handled internally
- [ ] No public locator exposure
- [ ] Uses role/label selectors when possible

### Tests

- [ ] Tests in `tests/e2e/<module>/`
- [ ] Imports domain, not UI
- [ ] Uses `testData` fixture for unique values
- [ ] Verifies persisted state with polling
- [ ] Independent of execution order
- [ ] Descriptive test names (actor + action + outcome)

### Fixtures (if needed)

- [ ] Added to `TestFixtures` interface
- [ ] Provides capability, not workflow
- [ ] No hidden assertions

### Documentation

- [ ] Update `docs/README.md` if adding new concepts
- [ ] Add types to `docs/glossary.md` if introducing new terms
