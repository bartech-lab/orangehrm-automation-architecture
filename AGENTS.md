# web-app-e2e-architecture

**Generated:** 2026-02-18
**Commit:** 208a128
**Branch:** master

## OVERVIEW

Playwright E2E testing framework for OrangeHRM using Page Object Model with component abstraction layer. TypeScript with Allure reporting.

## STRUCTURE

```
.
├── ui/              # Page Objects + Components (semantic locators)
├── tests/           # E2E tests + journey tests
├── infra/           # Test runner, fixtures, auth helpers
├── domain/          # Type definitions (auth, employee, leave)
├── data/            # Test data builders + fixtures
└── api/             # API client base
```

## WHERE TO LOOK

| Task                  | Location                        | Notes                                  |
| --------------------- | ------------------------------- | -------------------------------------- |
| Add new page object   | `ui/pages/`                     | Extend BasePage, use semantic locators |
| Add new component     | `ui/components/`                | Extend BaseComponent                   |
| Add new test          | `tests/e2e/`                    | Mirror ui/pages structure              |
| Add journey test      | `tests/journeys/`               | Cross-module workflows                 |
| Modify fixtures       | `infra/test-runner/fixtures.ts` | Custom test fixtures                   |
| Add domain types      | `domain/{module}/types.ts`      | Shared interfaces                      |
| Add test data builder | `data/builders/`                | Builder pattern for entities           |

## CONVENTIONS

### Locator Pattern (CRITICAL)

Always use semantic locators first, CSS fallback:

```typescript
// Preferred - Semantic locators
this.usernameInput = page.getByPlaceholder('Username');
this.loginButton = page.getByRole('button', { name: /login/i });
this.alert = page.getByRole('alert');
this.table = page.getByRole('table');
this.checkbox = page.getByRole('checkbox');

// Fallback only when semantic unavailable - Use attribute filters
this.errorMessage = page.locator('[class*="error-message"]').filter({ hasText: /required|invalid/i });
this.toast = page.locator('[class*="toast"]');
this.form = page.locator('[class*="form"]');
```

### Test Structure

- Use `given/when/then` style (NOT Arrange-Act-Assert)
- Co-located: `Component.spec.ts` tests `Component.ts`
- All tests use custom fixtures from `infra/test-runner/fixtures.ts`

### Error Handling

```typescript
// Use .catch(() => false) for visibility checks
async isVisible(): Promise<boolean> {
  return this.root.isVisible().catch(() => false);
}
```

### File Organization

- `index.ts` exports from each module
- Component files: `*-component.ts`
- Page files: `*-page.ts`

## ANTI-PATTERNS

| Pattern            | Reason                                |
| ------------------ | ------------------------------------- |
| `as any`           | Type error suppression - never use    |
| `@ts-ignore`       | Type error suppression - never use    |
| `@ts-expect-error` | Type error suppression - never use    |
| CSS-only locators  | Use semantic first, CSS fallback only |
| Arrange-Act-Assert | Use given/when/then style             |
| Empty catch blocks | Always handle or rethrow              |

## COMMANDS

```bash
npx playwright test              # Run all tests
npx playwright test --ui         # Interactive UI mode
npx playwright test --headed     # Run with browser visible
npm run lint                     # ESLint check
npm run typecheck                # TypeScript check
npm run report:allure            # Generate + open Allure report
```

## NOTES

- **Base URL**: `https://opensource-demo.orangehrmlive.com`
- **Test timeout**: 20s per test
- **OrangeHRM uses `.oxd-*` CSS classes** - use semantic locators instead
- **All components extend BaseComponent** which provides getByRole, getByLabel, getByPlaceholder, getByTestId helpers
