# Design Decisions

This document consolidates the five key architectural decisions that shape this test framework. Each decision includes the context that motivated it, the choice made, and the consequences, both positive and negative.

For individual decision records with full rationale, see the [ADR index](./adr/).

---

## 1. Layered Architecture Over Screenplay Pattern

### Context

Test automation frameworks must balance expressiveness with maintainability. Two dominant patterns exist: the classic Page Object Model with domain abstractions, and the Screenplay Pattern that models user interactions as tasks and questions.

This framework targets teams maintaining medium to large test suites over multiple years. Contributors range from QA engineers comfortable with UI automation to developers who prefer business-focused APIs.

### Decision

Use a three-layer architecture (`tests -> domain -> ui -> playwright`) rather than the Screenplay Pattern. Domain objects encapsulate workflows, page objects handle UI mechanics, and tests express intent through domain APIs.

The layered approach was chosen because:

- Lower learning curve for teams familiar with page objects
- Clear ownership boundaries (domain experts, UI specialists, test writers)
- Simpler mental model with three layers versus task/question/actor abstractions

### Consequences

- ✅ Tests read like business requirements without UI details
- ✅ UI changes contained to page objects, workflow changes to domain methods
- ✅ Team members can work on different layers without conflict
- ✅ Easier onboarding for engineers new to test automation
- ❌ Domain objects can accumulate workflow logic if not carefully scoped
- ❌ Less granular composition than Screenplay's task-based approach
- ❌ Requires discipline to maintain layer boundaries (enforced via `AGENTS.md` rules)

---

## 2. Capability Fixtures Over Workflow Fixtures

### Context

Playwright fixtures provide reusable test setup. The design choice is whether fixtures should encode complete workflows (login, create test data, navigate to page) or provide primitives that tests compose.

Workflow fixtures reduce test verbosity but hide side effects. Capability fixtures keep tests explicit but require more setup code per test.

### Decision

Fixtures provide capabilities, not workflows. The `auth` fixture gives an authenticated page. The `testData` fixture provides data generation utilities. Neither performs business operations.

This follows the principle that tests should be readable top-to-bottom. Hidden setup makes debugging harder and encourages fixture bloat.

### Consequences

- ✅ Test intent is visible in the test body
- ✅ Side effects are traceable, not hidden in fixture setup
- ✅ Fixtures remain focused and reusable across test types
- ✅ Easier to debug when tests fail at specific operations
- ❌ More verbose tests compared to workflow fixtures
- ❌ Requires test writers to understand domain APIs
- ❌ Temptation to create workflow fixtures for common patterns (resist this)

---

## 3. Builder Pattern for Test Data

### Context

Test data must be realistic, unique per test, and type-safe. Hardcoded data creates maintenance burden. Random data makes failures hard to reproduce. Factory functions lack fluency for variations.

### Decision

Use the Builder pattern for test data construction. Builders provide a fluent API for creating entity variations while ensuring uniqueness and type safety.

Example: `data/builders/employee-builder.ts` generates `Employee` objects with sensible defaults, unique identifiers, and override capability through chained methods.

### Consequences

- ✅ Readable data construction with clear intent
- ✅ Type safety catches errors at compile time
- ✅ Unique identifiers prevent parallel test collisions
- ✅ Easy to create variations for edge cases
- ❌ More initial code than hardcoded fixtures
- ❌ Builders require maintenance as entity schemas evolve
- ❌ Learning curve for team members unfamiliar with the pattern

---

## 4. Domain Layer as Abstraction Boundary

### Context

Tests that interact directly with page objects become brittle. UI structure changes ripple through test files. The same workflow logic gets duplicated across tests that need it.

Without an abstraction layer, tests know too much about implementation details: button selectors, navigation paths, wait conditions.

### Decision

Introduce a domain layer between tests and page objects. Domain classes expose business operations (`createEmployee`, `searchLeaveRequests`) that internally orchestrate page interactions and waiting logic.

Tests import from `domain/`, never from `ui/`. This boundary is enforced through code review and `AGENTS.md` rules.

### Consequences

- ✅ Tests express behavior, not UI mechanics
- ✅ Workflow changes require updating one domain method, not N tests
- ✅ Domain methods can return typed results for assertions
- ✅ Hides waiting logic from test writers (operations complete when they return)
- ❌ Additional layer increases codebase size
- ❌ Risk of domain objects becoming "god classes" if not scoped
- ❌ Requires mapping domain types to UI inputs and outputs

---

## 5. Allure Reporter with Module-Based Folder Structure

### Context

Test reports must serve multiple audiences: developers debugging failures, QA tracking trends, and stakeholders assessing release readiness. The reporter choice affects CI integration, artifact management, and report accessibility.

Folder organization affects navigation, ownership assignment, and parallel development.

### Decision

Use Allure for reporting combined with a module-based folder structure under `tests/e2e/`. Each business module (pim, leave, admin, recruitment, time, performance) has its own subdirectory.

Allure provides HTML reports with history, screenshots, and categorization. The folder structure aligns with application modules, enabling parallel team ownership.

### Consequences

- ✅ Rich HTML reports with attachments and history
- ✅ Category-based organization matches business domains
- ✅ GitHub Pages integration for shared access
- ✅ Module folders enable parallel development without merge conflicts
- ✅ Clear ownership: one team owns one module's tests
- ❌ Allure requires additional dependency and CI configuration
- ❌ Report generation adds time to CI pipeline
- ❌ Large test suites produce large reports requiring storage management

---

## Summary

| Decision                | Primary Benefit                  | Primary Cost              |
| ----------------------- | -------------------------------- | ------------------------- |
| Layered architecture    | Maintainability at scale         | Layer discipline required |
| Capability fixtures     | Explicit test intent             | More verbose tests        |
| Builder pattern         | Type-safe unique data            | Builder maintenance       |
| Domain layer            | Behavior-focused tests           | Additional abstraction    |
| Allure + module folders | Rich reports, parallel ownership | CI complexity             |

These decisions work together. The domain layer depends on capability fixtures and builders. The folder structure supports team scaling that the layered architecture enables. All five choices prioritize long-term maintainability over short-term convenience.
