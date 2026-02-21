# AGENTS.md — Tests Layer Rules

This file defines how tests must be generated or modified.

---

# 1. Tests Represent Behaviour

Tests must describe what the system does, not how the UI is manipulated.

Good:

- "HR updates employee salary"
- "Candidate can apply to vacancy"

Bad:

- "Click edit button and fill form"

---

# 2. Tests MUST NOT Use UI Directly

Tests must not:

- import page objects directly
- call locators
- interact with playwright Page
- depend on UI structure

Use domain-level methods when available.

---

# 3. Assertion Rules

Tests must prefer strong assertions:

- entity visible after reload
- list reflects change
- persisted value updated
- cross-page consistency

Weak assertions like toast visibility alone are insufficient.

---

# 4. Data Rules

Tests must:

- generate unique entity names
- avoid static identifiers
- avoid cross-test dependencies
- clean up if necessary

---

# 5. Independence Rules

Tests must:

- run in any order
- not depend on previous tests
- define their own state

---

# 6. Style Rules

Tests must:

- use descriptive names (actor + action + outcome)
- avoid inline selectors
- avoid manual waits
- rely on abstractions

---

End of file.
