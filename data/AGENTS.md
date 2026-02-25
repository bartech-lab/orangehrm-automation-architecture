# AGENTS.md — Data Layer Rules

The data layer provides test data builders and fixtures.

---

# 1. Data Provides Test Entities

Builders generate realistic test data using @faker-js/faker.

Examples:

- EmployeeBuilder — creates Employee entities
- DepartmentBuilder — creates Department entities
- JobTitleBuilder — creates JobTitle entities
- LeaveRequestBuilder — creates LeaveRequest entities

---

# 2. Builder Pattern Conventions

Builders use fluent API with method chaining:

```typescript
const employee = new EmployeeBuilder()
  .withFirstName('John')
  .withLastName('Doe')
  .asManager()
  .build();
```

Methods:

- `with<Field>()` — set specific field
- `withRandomData()` — populate all fields with random data
- `as<Type>()` — preset configurations (asAdmin, asManager, etc.)
- `build()` — validate and return entity
- `buildMany(n)` — create multiple entities

---

# 3. Data MUST NOT:

- import from UI layer
- import from infra layer
- import from tests layer
- perform assertions
- depend on Playwright

---

# 4. Fixtures Directory

Contains static test data:

- departments.json — predefined department list
- employees.json — predefined employee data
- test-document.pdf — upload test fixture
- test-image.jpg — image test fixture

---

End of file.
