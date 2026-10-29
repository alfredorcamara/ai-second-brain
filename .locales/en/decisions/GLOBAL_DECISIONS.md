# Global Architectural Decisions

> Decisions affecting all projects across the AI Second Brain workspace.

## ADR-G001: Adoption of the AI Decision Gate Pattern
- **Status**: Accepted
- **Date**: 2026-09-27
- **Description**: Every project utilizing AI must pass through the Decision Gate
  to determine whether a task is deterministic, classification/decision, or generation.
- **Details**: See `.agents/rules/01-ai-decision.md` and `knowledge/ai/AIJEV.md`

## ADR-G002: AI Gateway as Unified Abstraction
- **Status**: Accepted
- **Date**: 2026-09-27
- **Description**: All AI access must occur through abstract interfaces
  (`IDecisionProvider`, `IGenerativeAIProvider`) to decouple from concrete providers.
- **Details**: See `knowledge/ai/AI_GATEWAY.md`

## ADR-G003: Native Antigravity Format for AI Second Brain
- **Status**: Accepted
- **Date**: 2026-09-27
- **Description**: AI Second Brain uses the native Antigravity format
  (Rules, Skills, Plugins) rather than generic ad-hoc structures.
- **Reason**: Ensures automatic discovery and flawless feature execution.

## ADR-G004: Documentation as Code
- **Status**: Accepted
- **Date**: 2026-09-27
- **Description**: All documentation lives in the repository, versioned with Git,
  in Markdown format.

## ADR-G005: Research Lab Engine with Groq Cloud & Live Prompt
- **Status**: Accepted
- **Date**: 2026-10-02
- **Description**: Research Lab is adopted as a subsystem of AI Second Brain for autonomous topic research and project knowledge cataloging in Markdown. Briefing refinement and topic decomposition use native HTTP modules without npm dependencies (`scripts/groq-client.js`). The "Live Prompt" concept is established: the user can refine and update intent at any time, preserving version history in `_meta.json` (`definitionHistory`) for incremental re-research.
- **Details**: See `docs/RESEARCH_LAB.md`.

## ADR-G006: Multi-Provider AI Gateway with BYOK (Bring Your Own Key) Architecture
- **Status**: Accepted
- **Date**: 2026-10-09
- **Description**: AI Second Brain decouples the cognitive layer from any single AI vendor, implementing a universal BYOK (`Bring Your Own Key`) architecture in the native `scripts/ai-gateway.js` client.
- **Rationale**:
  1. **Developer Sovereignty and Freedom**: Seamless switching between Groq Cloud (free and ultra-fast), OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), OpenRouter (+300 models), Local Ollama (100% offline at zero cost), and custom OpenAI-compatible endpoints.
  2. **Privacy and Security**: Credentials never transit to external telemetry clouds; they are saved atomically in the user's local `.env` file and protected via `.gitignore`.
  3. **Zero Dependencies**: All HTTP/HTTPS communication with OpenAI-compatible APIs and Anthropic `/v1/messages` uses exclusively Node.js native `http` and `https` modules.
  4. **Failure and Quota Resilience (429)**: Live latency ping and automatic quota exhaustion detection with UI interceptor guiding provider switching without breaking workflow.
- **Details**: See `scripts/ai-gateway.js`, `server.js`, and settings modal in `docs/brain-ui/index.html`.

## ADR-G007: AI-Assisted Session Capture with Mandatory Human Review (Session Capture)
- **Status**: Accepted
- **Date**: 2026-10-12
- **Description**: Daily project memory capture is assisted by AI through a coordinated two-step pipeline:
  1. **Deterministic Collection & AI Draft (Read-Only)**: `POST /api/projects/:name/session/draft` gathers Git telemetry (commits, modified filenames, sanitized diffstat excluding `.env`), contract snapshots (`PROJECT.md`, `CURRENT_STATE.md`, `LESSONS_LEARNED.md`), and optional developer notes. The AI strictly redacts and structures typed JSON. **Nothing is written to disk in this step**.
  2. **Interactive Human Review & Atomic Commit**: The developer reviews title, summary markdown, completed checkboxes, upcoming steps, and suggested lessons. Only upon explicit click on "Commit to Memory", `POST /api/projects/:name/session/commit` performs physical disk writes (`MEMORY/sessions/YYYY-MM-DD-title.md`), surgically updates `CURRENT_STATE.md` (re-queuing completed items and preserving custom sections/CRLF), and appends validated lessons to `LESSONS_LEARNED.md`.
- **Rationale**: Eliminates the friction of manual session logging and inter-agent memory amnesia without hallucination risks or loss of control, adhering to the *Zero Fabrication* principle.
- **Details**: See `scripts/session-capture.js`, `scripts/ai-gateway.js`, and UI in `docs/brain-ui/`.

## ADR-G008: Usability and IDE Connection Optimizations in Developer Lifecycle
- **Status**: Accepted
- **Date**: 2026-10-12
- **Description**: Consolidation of 5 essential usability improvements identified during real-world onboarding simulations:
  1. **Automatic Git Initialization (`git init`)**: Quickstart modal offers automatic `git init`, generating default `.gitignore` and tracking governance contracts from second one.
  2. **Flexible Tech Stack with Quick Suggestions**: Tech Stack field in Quickstart becomes an editable free-text input while preserving clickable chips for swift entry.
  3. **Native IDE Launchers (`open-ide`)**: Project Workspace header features direct buttons to launch the project in VS Code, Cursor AI, or local File Explorer with safe fallbacks.
  4. **1-Click Agent Bootstrap Prompt**: "Copy Agent Prompt" button generates and copies to clipboard a parameterized prompt with project path, contracts, and core rules to feed any AI coding agent without amnesia.
  5. **Active Visual Telemetry with Rotating Progress Messages**: Session Capture modal displays synchronized stages and continuous animation during AI inference, preventing perceived freezes and increasing operational confidence.
- **Rationale**: Drastically reduces friction between the visual Cockpit and coding in the IDE, ensuring developers open and close sessions with maximum speed.
- **Details**: See `server.js`, `docs/brain-ui/app.js`, `docs/brain-ui/demo/app.js`, and `docs/internals/relatorio_usabilidade_dev_journey.md`.

## ADR-G009: Native JEV Decision Engine (RulesDecisionProvider) & Surgical Refinement with Human Clarification
- **Status**: Accepted
- **Date**: 2026-10-16
- **Description**: Iterative refinement of governance contracts in Quickstart Studio ("Live Prompt") is governed by the local `RulesDecisionProvider` engine (based on the JEV / Level 4 Composite pattern), preventing cross-document pollution and enabling a *Human-in-the-Loop* flow for technical ambiguities:
  1. **Canonical Local Engine (`scripts/decision-provider.js`)**: Implements the universal `IDecisionProvider` interface of the JEV pattern with deterministic execution (`decideSync`), 0ms latency, zero token costs, and 100% offline operation.
  2. **Surgical Contract Isolation**: Directives regarding tables, SQL schemas, entities, or endpoints affect **exclusively** `ARCHITECTURE.md`. Directives regarding scope affect `PROJECT.md`, roadmap affects `CURRENT_STATE.md`, and technical choices affect `ADR-0001`. Programmatic guardrails ensure unauthorized contracts remain strictly untouched.
  3. **Technical Ambiguity Detection & Human Clarification**: Vague requests regarding payments (`AMBIGUOUS_PAYMENTS`), messaging (`AMBIGUOUS_MESSAGING`), authentication (`AMBIGUOUS_AUTH`), or deployment (`AMBIGUOUS_INFRA`) do not invoke the LLM; they instantly launch `#qsClarificationModal`, presenting the technical question formulated by the AI Architect with 1-click chip options (mandatory completion).
  4. **Numerical Explainability & Auditability**: Every decision returns `ruleId`, numerical `confidence` (0.0 to 1.0), and natural language `rationale`.
  5. **Tab Auto-Switch with Visual Accent & Undo Button**: Web UI automatically transitions to the modified contract's tab with `.tab-flash-active` animation and provides an instant `↺ Undo` button backed by `previousGrillDraft`.
- **Rationale**: Ensures surgical precision in contract governance, respects *Zero Fabrication*, prevents token waste, and prevents partial requests from corrupting software architecture.
- **Details**: See `scripts/decision-provider.js`, `scripts/quickstart-grill.js`, `server.js`, `docs/brain-ui/app.js`, `knowledge/ai/AIJEV.md`, and `docs/internals/plano_trabalho_prompt_vivo_cirurgico.md`.

## ADR-G010: AI Provider Rate Limit Resilience, AbortController & BYOK Quota Banner
- **Status**: Accepted
- **Date**: 2026-10-16
- **Description**: Universal shielding of AI Gateway and Cockpit against freezes and inconsistencies during rate limiting (HTTP 429) or token exhaustion:
  1. **Retry Ceiling (`scripts/ai-gateway.js`)**: Backends never sleep indefinitely when AI providers return lengthy `retry-after` headers (such as 20 minutes on Groq Cloud). Retry wait time is capped at 10s. Beyond that, the gateway throws a structured 429 error with rich metadata (`quotaExceeded`, `isRateLimit`, `retryAfter`, `providerName`).
  2. **Active Cancellation via `AbortController` (`docs/brain-ui/app.js`)**: User actions to exit or navigate back during AI generation abort ongoing `fetch` requests, preventing zombie callbacks from mutating the DOM after screen disposal.
  3. **Geometric Layout Safeguard**: Collapsing classes (`.is-loading-questions`, `.grill-mode`) are strictly scoped in CSS and cleanly cleared on backward navigation, preventing residual modal shrinking.
  4. **Universal AI Error Modal (`#aiErrorModal`)**: Presents clear diagnosis with semantic badges (429, 401, 404, 408), estimated quota reset timer, and direct button to open AI Settings (BYOK) without losing context.
  5. **Contextual Quota Banner in BYOK Modal (`#aiSettingsQuotaBanner`)**: Resolves cognitive discrepancy between key validation (which calls `GET /models` and returns 200 OK) and chat inference exhaustion (`POST /chat/completions`), warning developers about quota limits and guiding switching models or providers.
- **Rationale**: Prevents UI lockups, ensures predictable operation under rate limits, and provides self-healing paths.
- **Details**: See `scripts/ai-gateway.js`, `server.js`, `docs/brain-ui/app.js`, `docs/brain-ui/demo/app.js`, `docs/brain-ui/index.html`, and `docs/brain-ui/style.css`.

## ADR-G011: Landing Page Audiovisual Integration with Hybrid Responsive Approach (Hero, Lightbox, Showcase & 16:9/9:16)
- **Status**: Accepted
- **Date**: 2026-10-16
- **Description**: Integration of audiovisual assets (promotional video / pitch) into the public landing page via a non-competing hybrid design:
  1. **High-Impact Hero Trigger (Approach A)**: `[ ▷ Watch Pitch (1 min) ]` button placed next to top CTAs, opening the pitch video inside a cinematic Lightbox Modal on demand without visually conflicting with the 3D Neural Planet.
  2. **Dedicated "In Action" Section (Approach B)**: Dark luxury cockpit block `#video-showcase` positioned right before the interactive Demo, acting as a guided walkthrough for vertical browsers.
  3. **Dynamic Responsive Adaptation (Approach C)**: Native switching between desktop (`Promo-16x9.mp4`, 16:9 widescreen) and mobile (`Reels-9x16.mp4`, 9:16 vertical).
  4. **Strict Lazy Loading & Performance**: Adoption of `preload="none"` on both players, ensuring ~29 MB of media does not degrade First Contentful Paint (FCP) or Lighthouse scores.
  5. **Audio Control & Accessibility**: Modal automatically pauses playback on close (via ✕ button, backdrop click, or ESC key), eliminating ghost background audio.
- **Rationale**: Increases conversion and product comprehension without cognitive clutter or page speed penalties.
- **Details**: See `docs/brain-ui/landing/index.html`, `docs/brain-ui/landing/css/extra.css`, `docs/brain-ui/landing/js/extra.js`, and `docs/brain-ui/landing/js/i18n.dict.js`.

## ADR-G012: Licensing Transition to FSL-1.1-MIT (Source-Available) & CLA Adoption
- **Status**: Accepted
- **Date**: 2026-10-25
- **Description**: Transition of the repository licensing model from permissive MIT to the **Functional Source License, Version 1.1 (FSL-1.1-MIT)**, accompanied by a **Contributor License Agreement (CLA)**:
  1. **Commercial Protection with Zero Adoption Barriers**: The code remains 100% public, auditable, and free for developers, researchers, students, and companies using the product internally.
  2. **Prevention of Unauthorized Competing Exploitation**: Third parties are prohibited from repackaging or reselling the software as a competing commercial product or service without prior explicit commercial agreement with the author.
  3. **Automatic Timed Conversion to MIT (4 years)**: Each version published under FSL converts automatically to permissive MIT 4 years after release, ensuring long-term predictability.
  4. **Rights Preservation via CLA (`CLA.md`)**: External contributions via Pull Request grant the maintainer and copyright owner (Alfredo R. Câmara) a broad license to distribute, sublicense, and monetize, preventing IP fragmentation.
- **Rationale**: Protects intellectual and engineering investment against predatory exploitation while keeping the community free to use and learn.
- **Details**: See `LICENSE`, `CLA.md`, `CONTRIBUTING.md`, and `package.json`.

## ADR-G013: Bilingual Document Engine with `.locales/` Vault & Smart Customization Protection
- **Status**: Accepted
- **Date**: 2026-10-29
- **Description**: Implementation of an instant language switching engine between Portuguese and English across the 44 official framework starter documents via a protected `.locales/` vault:
  1. **Zero Graph or IDE Pollution**: Factory files live in `.locales/pt/` and `.locales/en/` (ignored by `scan-vault.js` and `doctor.js`), preserving canonical filenames on disk without duplicating 3D nodes.
  2. **Deterministic 0ms Swap (JEV-First)**: Untouched files are swapped instantaneously in <30ms at zero token cost via normalized SHA-256 hashing.
  3. **User Customization Protection**: If the developer edits a rule or memory document, the system intercepts the swap and opens the protection modal, offering options to keep local modifications, restore factory defaults with automated backup, or translate via AI Gateway (BYOK) with cached parity in `.locales/user-custom/`.
- **Rationale**: Empowers developers globally to work in their preferred language while safeguarding custom rules from accidental overwrites.
- **Details**: See `docs/internals/ADR_ARQUITETURA_DOCUMENTOS_MULTILINGUA.md`.
