# Projects Directory — AI Second Brain

> All satellite repositories and greenfield projects governed by the **AI Second Brain** reside in this directory.

---

## How Projects Are Connected

1. **Greenfield (New Project from Scratch)**:
   - Created directly in `projects/<project-name>/` via the **Quickstart Grill Studio** in the Cockpit or via CLI (`npm run project:new`).
2. **Brownfield (Existing External Repository)**:
   - Connected via an **NTFS Junction (Windows)** or **Directory Symlink (Linux/macOS)** using the Cockpit or `npm run project:link`.
   - Your physical code stays in its original folder on disk while the Brain injects and monitors the living governance contracts (`PROJECT.md`, `CURRENT_STATE.md`, `ARCHITECTURE.md`, `LESSONS_LEARNED.md`, `DECISIONS/`, `RESEARCH/`, `MEMORY/`).

## Living Contracts per Project

- `PROJECT.md` — Vision, domain, stack, and links.
- `CURRENT_STATE.md` — Completed items, active work, and next steps.
- `ARCHITECTURE.md` — Architectural patterns and system design.
- `LESSONS_LEARNED.md` — Project-specific technical lessons.
- `DECISIONS/` — Numbered Architecture Decision Records (ADRs).
