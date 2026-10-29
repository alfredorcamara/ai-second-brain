# Lessons Learned — [Project Name]

> This document records bugs, technical pitfalls, and project-specific learnings.
> Every AI agent or developer must consult this file before implementing or modifying code.

---

## How to Record a Lesson:
- **Context**: What was being built or changed when the issue occurred.
- **Root Cause**: The real technical reason for the failure (library, database, API contract, business rule).
- **What NOT to Do**: The anti-pattern that broke or created technical debt.
- **Validated Pattern**: The mandatory, verified solution for this project going forward.

---

## Lessons Learned History

### [YYYY-MM-DD] — Example: Webhook Handling and Raw Body
- **Context**: While integrating the external payment notification webhook route.
- **Root Cause**: The default JSON middleware mutated the request bytes, invalidating the HMAC cryptographic signature.
- **What NOT to Do**: Never pass webhook payloads through JSON parsers that mutate the body before signature verification.
- **Validated Pattern**: Capture the raw body buffer exclusively on the webhook route before global middleware.
