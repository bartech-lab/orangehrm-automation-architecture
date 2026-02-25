# AGENTS.md — Documentation Rules

The docs directory contains architectural documentation and ADRs.

---

# 1. Documentation Structure

```
docs/
├── adr/              # Architecture Decision Records
├── architecture.md   # Layer responsibilities, dependency flow
├── design-decisions.md  # Major decisions with trade-offs
├── testing-strategy.md  # E2E boundaries, flakiness prevention
├── reliability.md    # Waiting philosophy, anti-patterns
├── how-to-add-test.md   # Step-by-step guide with templates
├── extending-framework.md  # Adding modules, domains, pages
└── README.md         # Documentation index
```

---

# 2. ADR Conventions

Each ADR follows the format in `adr/`:

- Numbered sequentially (001-, 002-, etc.)
- Title in kebab-case
- Sections: Context, Decision, Consequences

Example: `001-page-object-model-pattern.md`

---

# 3. Documentation MUST:

- explain WHY, not just HOW
- include code examples where relevant
- reference existing AGENTS.md rules
- be kept in sync with code changes

---

# 4. Documentation MUST NOT:

- duplicate AGENTS.md content
- include temporary or draft notes
- contain outdated information

---

End of file.
