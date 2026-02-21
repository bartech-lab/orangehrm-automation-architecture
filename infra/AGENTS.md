# AGENTS.md — Infrastructure Layer Rules

The infra layer provides test wiring and capabilities.

---

# 1. Infra Provides Capabilities

Examples:

- authentication setup
- environment configuration
- test context creation
- service wiring

---

# 2. Infra MUST NOT Encode Business Logic

Fixtures must not:

- perform workflows
- hide test steps
- make assertions
- mutate domain state silently

---

# 3. Infra Should Be Transparent

Agents should prefer explicit setup over hidden behaviour.

---

End of file.
