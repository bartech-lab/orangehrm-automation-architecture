# AGENTS.md — Repository Rules for AI Code Generation

This file defines strict rules for AI agents generating or modifying code in this repository.
These rules are mandatory. If a rule conflicts with a suggestion, the rule wins.

---

# 1. Purpose of This Repository

This repository contains a layered Playwright E2E test architecture designed to:

- express behaviour, not UI scripting
- isolate UI implementation from test intent
- ensure maintainability at scale
- prevent fragile locator-driven tests

Agents must preserve this design.

---

# 2. Dependency Rules (MANDATORY)

The allowed dependency direction is:

tests → domain → ui → playwright

### Tests MAY import:

- domain/\*
- data/\*
- fixtures from infra
- test utilities

### Tests MUST NOT import:

- ui/pages directly
- ui/components directly
- playwright Page object
- raw locators

---

### Domain MAY import:

- ui/pages
- domain models
- data factories

### Domain MUST NOT import:

- playwright test API
- fixtures
- expect()

---

### UI layer MAY import:

- playwright
- base classes
- shared UI utilities

### UI MUST NOT import:

- domain layer
- tests
- fixtures

---

# 3. Test Writing Contract (MANDATORY)

Tests represent behaviour, not interactions.

### Tests MUST:

- describe user intent
- use domain-level operations where available
- verify persisted state when modifying data
- use unique test data
- be independent of execution order

### Tests MUST NOT:

- call locator methods directly
- depend on toast visibility alone
- rely on UI structure knowledge
- use static entity names
- use sleep or fixed timeout waits

---

# 4. Page Object Contract (MANDATORY)

Page objects represent **capabilities**, not UI structure.

### Page methods MUST:

- express user intent
- include waiting logic internally
- ensure action success before returning
- hide locators from callers

### Page methods MUST NOT:

- expose locator objects publicly
- be thin wrappers around click/fill
- require callers to add waits
- leak DOM structure assumptions

---

# 5. Locator Policy (STRICT PRIORITY ORDER)

When generating selectors, agents MUST use:

1. role selectors
2. test id selectors
3. label associations
4. semantic attributes
5. CSS selectors only as fallback

### Agents MUST NOT use:

- nth() unless no alternative exists
- deep chained CSS selectors
- brittle structural selectors
- text matching for layout elements

---

# 6. Fixture Philosophy

Fixtures provide **capabilities**, not workflows.

### Fixtures MAY:

- create authenticated contexts
- provide configured services
- provide test data helpers

### Fixtures MUST NOT:

- encode business flows
- hide side effects
- perform assertions implicitly

---

# 7. Code Generation Rules

When generating code, agents MUST:

- follow existing naming patterns
- use constructor-based locator initialization
- keep comments minimal and in English
- prefer domain calls over page calls
- match existing async style
- reuse existing helpers instead of duplicating logic

---

# 8. Forbidden Patterns

Agents MUST NEVER generate:

- tests importing ui/\*
- expect(page.locator(...)) inside tests
- page methods that just click a button
- toast-only verification
- static test entities
- sleep-based waiting
- duplicated flows across tests

---

# 9. Refactor Safety Rules

Agents MUST NOT:

- rename files without instruction
- move layers automatically
- change public method signatures silently
- replace domain flows with UI calls

If unsure, agents must modify the smallest possible surface.

---

# 10. Golden Example Pattern

A good test:

- describes behaviour
- uses domain-level API
- verifies persisted outcome
- does not expose UI structure

Agents should mirror this pattern whenever possible.

---

End of file.
