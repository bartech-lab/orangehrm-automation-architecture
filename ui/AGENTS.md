# AGENTS.md — UI Layer Rules

The UI layer encapsulates all Playwright interactions.

---

# 1. UI Encapsulates Implementation

UI classes may use:

- locators
- Playwright Page
- selectors
- DOM logic

But callers must not depend on these details.

---

# 2. Page Methods Must Express Intent

Bad:
clickSave()

Good:
saveEmployee(data)

---

# 3. Page Methods Must Handle Waiting

Callers should never need to add waits.

Methods must:

- wait for readiness
- perform action
- confirm completion

---

# 4. UI MUST NOT:

- import domain layer
- expose locators publicly
- assume caller timing
- return raw locator objects

---

End of file.
