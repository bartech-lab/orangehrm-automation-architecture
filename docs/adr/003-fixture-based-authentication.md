# ADR 003: Fixture-Based Authentication

**Status**: Accepted

**Context**: Tests need authenticated sessions, but login is slow and repetitive.

**Decision**: Use Playwright fixtures with storage state for authentication.

**Consequences**:

- ✅ Faster test execution
- ✅ Authenticated state shared across tests
- ✅ Automatic cleanup after tests
- ❌ Requires understanding of fixture pattern
