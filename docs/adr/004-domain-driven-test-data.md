# ADR 004: Domain-Driven Test Data

**Status**: Accepted

**Context**: Test data needs to be realistic, type-safe, and easy to generate.

**Decision**: Use domain entities with builder pattern for test data.

**Consequences**:

- ✅ Realistic data generation
- ✅ Type safety for test data
- ✅ Easy to create variations
- ❌ More initial code to write
