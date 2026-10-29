---
name: bug-investigation
description: >-
  Structured investigation of bugs, regressions, and production failures.
  Use when diagnosing errors, analyzing stack traces, or preventing recurring bugs.
---

# Bug Investigation

## Investigation Workflow

1. **Consult Lessons Learned First**:
   - Check `LESSONS_LEARNED.md` in the project and `memory/lessons-learned.md` to see if this root cause was already documented.
2. **Reproduce & Isolate**:
   - Identify exact reproduction steps, affected files, and input state.
3. **Identify Root Cause (Not Just Symptoms)**:
   - Trace the data flow and determine *why* the invariant broke.
4. **Fix & Verify**:
   - Implement a surgical fix and validate with automated tests or linter checks.
5. **Document the Lesson**:
   - Record the Context, Root Cause, What NOT to Do, and Validated Pattern in `LESSONS_LEARNED.md`.
