#!/bin/bash

# Documentation Validation Script
# Validates all documentation files meet quality criteria

set -e

ERRORS=0

echo "================================"
echo "Documentation Validation"
echo "================================"
echo ""

# Check required docs exist
echo "Checking required documentation files..."
REQUIRED_DOCS=(
  "docs/architecture.md"
  "docs/testing-strategy.md"
  "docs/how-to-add-test.md"
  "docs/design-decisions.md"
  "docs/reliability.md"
  "docs/extending-framework.md"
  "docs/README.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
  if [[ -f "$doc" ]]; then
    echo "  ✓ $doc exists"
  else
    echo "  ✗ $doc MISSING"
    ((ERRORS++))
  fi
done

echo ""
echo "Checking word count limits..."

# Check word counts
ARCHITECTURE_WORDS=$(wc -w < docs/architecture.md)
TESTING_WORDS=$(wc -w < docs/testing-strategy.md)
HOWTO_WORDS=$(wc -w < docs/how-to-add-test.md)
DESIGN_WORDS=$(wc -w < docs/design-decisions.md)
RELIABILITY_WORDS=$(wc -w < docs/reliability.md)
EXTENDING_WORDS=$(wc -w < docs/extending-framework.md)

if [[ $ARCHITECTURE_WORDS -le 2000 ]]; then
  echo "  ✓ architecture.md: $ARCHITECTURE_WORDS words (≤2000)"
else
  echo "  ✗ architecture.md: $ARCHITECTURE_WORDS words (exceeds 2000)"
  ((ERRORS++))
fi

if [[ $TESTING_WORDS -le 1500 ]]; then
  echo "  ✓ testing-strategy.md: $TESTING_WORDS words (≤1500)"
else
  echo "  ✗ testing-strategy.md: $TESTING_WORDS words (exceeds 1500)"
  ((ERRORS++))
fi

for doc_words in "$HOWTO_WORDS:how-to-add-test.md:1500" "$DESIGN_WORDS:design-decisions.md:3000" "$RELIABILITY_WORDS:reliability.md:3000" "$EXTENDING_WORDS:extending-framework.md:3000"; do
  IFS=':' read -r words name limit <<< "$doc_words"
  if [[ $words -le $limit ]]; then
    echo "  ✓ $name: $words words (≤$limit)"
  else
    echo "  ✗ $name: $words words (exceeds $limit)"
    ((ERRORS++))
  fi
done

echo ""
echo "Checking for TODO/FIXME/HACK markers..."

if grep -rq "TODO\|FIXME\|HACK\|xxx" docs/ --include="*.md" 2>/dev/null; then
  echo "  ✗ Found markers in documentation"
  ((ERRORS++))
else
  echo "  ✓ No markers found"
fi

echo ""
echo "Checking required sections..."

# Check architecture.md sections
if grep -q "^## Architecture Overview" docs/architecture.md && \
   grep -q "^## Layer Responsibilities" docs/architecture.md && \
   grep -q "^## Dependency Flow" docs/architecture.md; then
  echo "  ✓ architecture.md has required sections"
else
  echo "  ✗ architecture.md missing required sections"
  ((ERRORS++))
fi

# Check testing-strategy.md sections
if grep -q "^## Testing Philosophy" docs/testing-strategy.md && \
   grep -q "^## E2E Boundaries" docs/testing-strategy.md; then
  echo "  ✓ testing-strategy.md has required sections"
else
  echo "  ✗ testing-strategy.md missing required sections"
  ((ERRORS++))
fi

echo ""
echo "================================"
if [[ $ERRORS -eq 0 ]]; then
  echo "✓ All validations passed!"
  exit 0
else
  echo "✗ $ERRORS validation(s) failed"
  exit 1
fi
