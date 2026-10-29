---
name: grill-with-docs
description: >-
  Deep technical interview (Grill-Me) grounded in project documentation.
  Use before implementing complex features or greenfield projects to eliminate
  ambiguity and uncover edge cases without making assumptions.
---

# Grill With Docs (Technical Interview)

## Workflow

1. **Read Existing Context**:
   - Read `PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, and any attached `SPECS/`.
2. **Identify Real Gaps**:
   - Never ask generic boilerplate questions if the documentation already answers them.
   - Focus on architectural trade-offs, domain edge cases, security boundaries, and data contracts.
3. **Consolidate into Living Contracts**:
   - Transform the user's answers into concrete, zero-fabrication updates in `PROJECT.md`, `ARCHITECTURE.md`, and `DECISIONS/`.
