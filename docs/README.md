# Documentation

Architectural and operational documentation for the OrangeHRM Automation Architecture.

---

## Start Here

**New to this repo?** Read in this order:

1. **[Architecture](./architecture.md)** (10 min) — Understand the layer design
2. **[Testing Strategy](./testing-strategy.md)** (8 min) — Learn what belongs in E2E tests
3. **[Design Decisions](./design-decisions.md)** (12 min) — See why choices were made

**Total: 30 minutes to understand the system.**

---

## By Goal

### I want to understand the architecture

→ Start with [Architecture](./architecture.md) → then [Design Decisions](./design-decisions.md)

### I want to add a test

→ Read [How to Add a Test](./how-to-add-test.md) — contains template and checklist

### I want to fix flaky tests

→ See [Reliability](./reliability.md) — waiting philosophy and anti-patterns

### I want to extend the framework

→ Follow [Extending Framework](./extending-framework.md) — adding modules, domains, pages

---

## Documentation Index

### Architecture

- **[architecture.md](./architecture.md)** — Layer responsibilities, dependency flow, scaling to 500+ tests
- **[design-decisions.md](./design-decisions.md)** — 5 major decisions with trade-offs (Page Object vs Screenplay, etc.)

### Operating the Framework

- **[testing-strategy.md](./testing-strategy.md)** — E2E boundaries, flakiness prevention, parallel execution
- **[reliability.md](./reliability.md)** — Waiting philosophy, network mitigation, failure observability
- **[how-to-add-test.md](./how-to-add-test.md)** — Step-by-step guide with copy-paste template

### Extending the System

- **[extending-framework.md](./extending-framework.md)** — How to add modules, domain objects, UI pages, tests

---

## Architecture Decision Records (ADRs)

This project tracks key architectural choices using ADRs. These documents explain not only what was implemented, but why.

| ADR                                                  | Decision                    | Why It Matters                          |
| ---------------------------------------------------- | --------------------------- | --------------------------------------- |
| [ADR-001](./adr/001-page-object-model-pattern.md)    | Page Object over Screenplay | Maintainability vs complexity trade-off |
| [ADR-002](./adr/002-typescript-with-strict-mode.md)  | TypeScript strict mode      | Catch errors at compile time            |
| [ADR-003](./adr/003-fixture-based-authentication.md) | Fixture-based auth          | Reusable, auto-cleanup auth             |
| [ADR-004](./adr/004-domain-driven-test-data.md)      | Domain-driven test data     | Realistic data via builders             |
| [ADR-005](./adr/005-allure-for-reporting.md)         | Allure for reporting        | Actionable failure investigation        |
| [ADR-006](./adr/006-es-modules-with-nodenext.md)     | ES modules                  | Modern JS, tree-shaking                 |
| [ADR-007](./adr/007-multi-browser-testing.md)        | Multi-browser               | Cross-browser confidence                |

**ADRs demonstrate professional architectural governance.**

---

## Quality Assurance

Documentation is validated via `../scripts/validate-docs.sh`. This script ensures:

- All required docs exist
- Word counts within limits (architecture ≤2000 words, testing ≤1500, etc.)
- No incomplete task markers
- Required sections present

Run it: `cd .. && ./scripts/validate-docs.sh`

---

## Why So Much Documentation?

This repository demonstrates enterprise practices. In real teams, documentation prevents:

- **Architecture drift** — "I'll just import UI in this one test..."
- **Knowledge silos** — Only one person knows why X was done
- **Onboarding friction** — New engineers guessing at patterns

**The docs are the product as much as the code is.**
