# AGENTS.md — Domain Layer Rules

The domain layer expresses business operations independent of UI structure.

---

# 1. Domain Represents Business Intent

Domain methods should read like:

- hireEmployee(data)
- requestLeave(user, dates)
- openVacancy(data)

They must not expose UI steps.

---

# 2. Domain MAY Use UI Pages Internally

But callers must not see UI details.

Domain methods should orchestrate flows and return meaningful results.

---

# 3. Domain MUST NOT:

- import playwright test API
- perform assertions
- depend on fixtures
- expose locators

---

# 4. Domain Should Be Stable

Domain APIs should change rarely.

Agents must avoid modifying domain method signatures unless explicitly instructed.

---

End of file.
