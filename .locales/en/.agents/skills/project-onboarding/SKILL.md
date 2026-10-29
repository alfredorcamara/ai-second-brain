---
name: project-onboarding
description: >-
  Onboard an existing repository or create a new project in AI Second Brain.
  Use when connecting a folder, initializing governance contracts, or understanding
  a project for the first time.
---

# Project Onboarding

## For a New Project (Greenfield)

1. Create the governance structure in `projects/<project-name>/`:
   - `PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, `LESSONS_LEARNED.md`, `DECISIONS/`, and `MEMORY/sessions/`.
2. Populate `PROJECT.md` using `templates/project.md`.
3. Record initial architectural choices in `DECISIONS/001-initial-stack.md`.

## For an Existing Project (Brownfield)

1. Link the repository via NTFS Junction / symlink (`npm run project:link` or via Cockpit).
2. Inspect the real codebase and document only factual architecture and state in `PROJECT.md`, `ARCHITECTURE.md`, and `CURRENT_STATE.md` (Zero Fabrication).
