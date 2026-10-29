# AI SECOND BRAIN — INSTRUCTIONS FOR CLAUDE CODE

> This repository is the central brain and governance vault for AI-assisted software development.
> Every Claude Code session in this workspace must follow these guidelines.

---

## IDENTITY & OBJECTIVE

You operate inside the **AI Second Brain**, a structured system that organizes knowledge, architectural decisions, persistent memory, and engineering rules across all connected projects.

---

## OPERATIONAL WORKFLOW

1. **Project Location**: All managed projects reside in `projects/<project-name>/`.
2. **Living Contracts**:
   - `projects/<name>/PROJECT.md` — Overview, business goals, technical stack, and constraints.
   - `projects/<name>/CURRENT_STATE.md` — What is completed, what is in progress, and immediate next steps.
   - `projects/<name>/ARCHITECTURE.md` — Technical design, component diagrams, and patterns.
   - `projects/<name>/LESSONS_LEARNED.md` — Lessons learned, technical pitfalls, and mistakes never to repeat in this project.
   - `projects/<name>/DECISIONS/` — Architecture Decision Records (ADRs) documenting why technical choices were made.
3. **Persistent Memory**:
   - At the end of significant work sessions, record the session summary in `projects/<name>/MEMORY/sessions/` and update `CURRENT_STATE.md`.
   - Consult the project's `LESSONS_LEARNED.md` and `memory/lessons-learned.md` before implementing or modifying code, AI integrations, and architecture.

---

## ABSOLUTE RULES

1. **Zero Hallucination**: If information is not documented, ask the user or explicitly state it as "Undefined". Never fabricate specifications.
2. **100% Dynamic Catalogs**: NEVER create fixed/hardcoded AI model lists or catalogs in code or HTML. The catalog must be 100% dynamic via the provider's real-time API.
3. **Deterministic Code First**: Follow `.agents/rules/01-ai-decision.md`. Never use an LLM for tasks that deterministic code or business rules can solve.
4. **Security & Secrets**: Follow `.agents/rules/03-security.md`. Never expose API keys, secrets, or PII in code or logs.
5. **Strict Document Taxonomy**: ALWAYS check where each file belongs before creating it:
   - `docs/` (root): Reserved exclusively for official user guides and manuals (e.g. `COMO_UTILIZAR_O_PROJETO.md`, `GUIA_PRATICO.md`, `SOLUCAO_AI_SECOND_BRAIN.md`).
   - `docs/internals/`: Internal tool construction documents, usability reports (Dev Journey), sprint plans, and internal engineering debates (ignored by `scan-vault.js` and `doctor.js`).
   - `decisions/GLOBAL_DECISIONS.md`: Consolidated official registry of global architectural decisions (ADRs).
   - `projects/<name>/`: Isolated documentation for developer projects.
