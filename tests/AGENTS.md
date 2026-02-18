# Tests

E2E tests for OrangeHRM using Playwright.

## STRUCTURE

```
tests/
├── e2e/                  # Module-specific tests
│   ├── login.spec.ts     # Authentication tests
│   ├── dashboard.spec.ts # Dashboard tests
│   ├── components/       # Component tests
│   ├── pim/              # PIM module tests
│   ├── admin/            # Admin module tests
│   ├── leave/            # Leave module tests
│   └── ...
├── journeys/             # Cross-module workflow tests
│   ├── employee-onboarding.spec.ts
│   ├── leave-approval.spec.ts
│   └── recruitment-pipeline.spec.ts
└── verify-fixtures.spec.ts
```

## WHERE TO LOOK

| Task               | Location                                   |
| ------------------ | ------------------------------------------ |
| Add module test    | `tests/e2e/{module}/{feature}.spec.ts`     |
| Add journey test   | `tests/journeys/{workflow}.spec.ts`        |
| Add component test | `tests/e2e/components/{component}.spec.ts` |

## TEST PATTERN

Use `given/when/then` style:

```typescript
test('should login successfully', async ({ page, loginPage }) => {
  // Given
  await loginPage.navigate();

  // When
  await loginPage.login({ username: 'Admin', password: 'admin123' });

  // Then
  await expect(page).toHaveURL(/dashboard/);
});
```

## FIXTURES

Custom fixtures from `infra/test-runner/fixtures.ts`:

- `page` - Playwright page
- `loginPage`, `dashboardPage`, etc. - Page objects
- `authenticatedPage` - Pre-authenticated page

## CONVENTIONS

- **File naming**: `{feature}.spec.ts`
- **Test structure**: `given/when/then` (NOT Arrange-Act-Assert)
- **Assertions**: Use Playwright's `expect()`
- **Parallel**: Tests run in parallel by default
