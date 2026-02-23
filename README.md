# OrangeHRM Automation Architecture

**This repository demonstrates how I design scalable Playwright automation architecture on a real external system.**

It is intentionally structured to reflect long-term maintainability, domain modeling, and enterprise-ready test design rather than minimal demo tests.

OrangeHRM is used intentionally as a stable third-party system to demonstrate automation architecture independent of product ownership.

```
Not a tutorial. Not a demo. An architecture decision record in executable form.
```

---

## What This Repository Demonstrates

- **Scalable Playwright automation architecture** — supports hundreds of tests without collapse
- **Layered test design** — strict separation of UI, domain, and infrastructure concerns
- **Fixture-driven system modeling** — reusable primitives instead of encoded workflows
- **Long-term maintainability patterns** — architecture prevents common failure modes by design
- **Architecture decision tracking** — professional ADR process for documenting choices
- **Enterprise-ready structure** — patterns that scale to multi-team, multi-year projects

This is what senior automation engineering looks like.

---

## Why This Exists

Most Playwright repositories become unmaintainable at 100+ tests:

- Tests couple to DOM selectors → break on every UI change
- Business logic leaks into test files → duplication everywhere
- Flaky tests get retries instead of fixes → trust erodes
- Parallel execution causes data collisions → tests run serially → slow feedback

**This architecture prevents those failure modes by design.**

The complexity you see is intentional. This project prioritizes maintainability and architectural clarity over minimal setup in order to demonstrate long-term test system design.

---

## The Architecture in 30 Seconds

```
test → domain → UI → Playwright → browser
```

**Dependency rule**: Each layer only imports from the layer to its right.

```
✅ Tests import domain (business workflows)
✅ Domain imports UI (page interactions)
✅ UI imports Playwright (browser automation)
❌ Never upward imports
```

**Result**: Tests describe _what_ happens. Implementation details live in layers tests cannot see.

---

## Quick Start

```bash
npm install
npx playwright install
npx playwright test
```

---

## Documentation

This repository is **documentation-heavy by design**. The docs explain _why_ decisions were made, not just _how_ to use the code.

**If you read only 3 docs:**

1. **[Architecture](./docs/architecture.md)** — Layer responsibilities, dependency flow, scaling rationale
2. **[Testing Strategy](./docs/testing-strategy.md)** — What belongs in E2E vs API vs unit tests
3. **[Design Decisions](./docs/design-decisions.md)** — Why Page Object over Screenplay, why capability fixtures, etc.

**Full index:** [docs/README.md](./docs/README.md)

---

## Architecture Decision Records (ADRs)

Every major architectural choice is documented as an ADR in `docs/adr/`:

- Why Page Object Model over Screenplay
- Why TypeScript strict mode
- Why fixture-based authentication
- Why domain-driven test data
- Why Allure for reporting
- Why ES modules
- Why multi-browser testing

**ADRs demonstrate professional architectural governance.**

---

## Project Structure

```
├── data/              # Test data builders
├── domain/            # Business workflows (tests import this)
├── infra/             # Fixtures, config, test runner
├── tests/             # Test suites (only import domain)
├── ui/                # Page objects (only import Playwright)
└── docs/              # Architecture documentation
```

---

## Scaling & Extensibility

**This structure is intended to support:**

- Large suites with hundreds of tests
- Multiple contributors working concurrently
- Long-term maintenance over years
- Extension to other web applications

**The domain layer abstracts OrangeHRM specifics.** To adapt this architecture to another system:

1. Replace domain objects with your application's business workflows
2. Replace UI page objects with your application's pages
3. Keep the layer structure and fixture patterns

The architecture is portable. The patterns are universal.

---

## If This Were a Real Company Project

The patterns here scale to enterprise. A production deployment would add:

| Area              | What Would Expand                                        |
| ----------------- | -------------------------------------------------------- |
| **Test Data**     | API-based setup/teardown, data lifecycle policies        |
| **CI/CD**         | Parallel sharding, failure alerting, performance budgets |
| **Packages**      | `@company/test-core`, `@company/test-domain`             |
| **Observability** | Flaky test tracking, coverage heatmaps, RCA              |
| **Governance**    | Dev team contracts, breakage ownership                   |

The architecture supports all of this. The patterns are production-proven.

---

## Demo Environment Behaviour

The public OrangeHRM demo environment may assign different user contexts and datasets after login.  
Because permissions and available records vary between sessions, some UI paths and data-dependent assertions may behave differently across runs. The test suite is structured to tolerate these variations where possible.

---

## What This Is NOT

- ❌ **Tutorial** → See [Playwright docs](https://playwright.dev)
- ❌ **Snippet library** → Copy-paste destroys architecture
- ❌ **NPM package** → This is a reference implementation
- ❌ **Production automation** → Demo site, not your HR system
- ❌ **Auto-healing magic** → Architecture prevents breakage instead

---

## Example: With vs Without Architecture

**Without (brittle):**

```typescript
test('add employee', async ({ page }) => {
  await page.goto('/pim/addEmployee');
  await page.fill('#firstName', 'John');
  await page.fill('#lastName', 'Doe');
  await page.click('#saveBtn');
  await page.waitForTimeout(2000); // flaky
  await expect(page.locator('.toast')).toContainText('Success');
});
```

**With (maintainable):**

```typescript
test('should add employee', async ({ auth, testData }) => {
  const employeeDomain = new EmployeeDomain(auth);
  const uniqueId = testData.getUniqueString('emp');

  await employeeDomain.createEmployee({
    firstName: 'John',
    lastName: `Doe${uniqueId}`,
    employeeId: uniqueId,
  });

  // Verify persisted state, not toast
  await expect
    .poll(async () => {
      const results = await employeeDomain.searchEmployee({ employeeId: uniqueId });
      return results.some((e) => e.id === uniqueId);
    })
    .toBe(true);
});
```

---

## License

MIT

---

**Built with:** Playwright · TypeScript · Layered Architecture · Domain-Driven Design
