# Changelog — AI Second Brain

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.5.7] — 2026-11-17

### 🧠 Universal Semantic Identification Across the Ecosystem
- **Expanded Recognition of Defined & Formalized Items (`app.js` and `session-capture.js`)**:
  - Sections such as *"What Has Been Formalized and Specified"*, *"Established Decisions"*, *"Closed Contracts"*, and *"Completed Deliverables"* are now automatically mapped into **✓ Defined Items**, along with emoji task markers (`✅`, `✔️`, `☑️`, `☐`, `🔲`, `⏳`).
- **Smart Milestone Hierarchy & Indented Checkboxes**:
  - Checkbox tasks (`- [ ]` / `- [x]`) are recognized at any indentation level (e.g. nested under numbered *Milestone 1*, *Phase 1*, *Sprint 1* bullets), automatically promoting the parent bullet to a group header while keeping descriptive sub-bullets (such as `GET/POST` routes) attached to their parent task.
- **Universal Goal, Stack & Status Extraction Across Dashboard, Workspace & Editor**:
  - Unified resilient metadata extractor across `server.js` and `app.js` (Main Dashboard cards, Project Overview, and Markdown Editor), recognizing **Project Goal** under any heading variant (*Executive Overview*, *Project Goal*, *Executive Summary*, *About*, *Overview*, or lead paragraph) with inline bold and code formatting.
- **Session Capture Engine Synchronization (`scripts/session-capture.js`)**:
  - Session Capture now shares the same semantic parser and toggles completed tasks directly on Milestone checkboxes in `CURRENT_STATE.md` without duplicating sections.

## [1.5.6] — 2026-11-17

### 🎯 Smart Active Roadmap & Non-Destructive CURRENT_STATE.md Editing
- **Smart Roadmap Parser (`docs/brain-ui/app.js`)**:
  - The **Active Roadmap** card now detects progress regardless of how `CURRENT_STATE.md` was written (by AI or developer): checkboxes anywhere (`- [x]` done / `- [ ]` pending) and sections identified by synonyms (`Next Steps`, `Roadmap`, `Milestone`, `Phase`, `Sprint`, `Backlog`, `To-do`, `In progress`, `Done`, `Completed`, and Portuguese equivalents).
  - Subheadings such as *"Milestone 1 – Domain Foundations"* (heading or bold line) inherit the parent section classification and are shown as group labels in the card.
  - Nested sub-items, code blocks, and unrelated sections (SLA, Risks, Policies) are ignored.
- **Surgical, Non-Destructive Editing**:
  - Completing, reopening, adding, or deleting steps from the Cockpit now changes only the affected lines (toggling `[x]`/`[ ]` in place), fully preserving the rest of the document — previously these actions rewrote the entire file and discarded AI-generated content.
- **Project Goal**: Overview extraction now supports numbered headings (e.g. `## 1. Executive Overview`).

## [1.5.5] — 2026-11-17

### 🐛 Quickstart Grill Fixes & Resilient Tech Stack Detection
- **Quickstart Grill Bridge Generation Fix (`scripts/quickstart-grill.js`)**:
  - Fixed a variable scoping issue in atomic project commitment (`commitProject`) that halted the bridge generation engine (`writeBridges`), ensuring new projects created via technical interview generate the active AI bridge configured in `brain.config.json` (e.g., `.github/copilot-instructions.md`).
- **Guaranteed Metadata & Resilient Stack Parser (`quickstart-grill.js` and `server.js`)**:
  - Automatically injects canonical `## Informações Gerais` section with `- **Stack Tecnológica**: <stack>` into AI-synthesized `PROJECT.md`.
  - Added resilient multi-pattern parser in `/api/projects/:name/details` to identify tech stacks across bullets, Markdown tables, inline prose (e.g., *"desenvolvido em C# / .NET 8"*), and fallback in `ARCHITECTURE.md`, resolving "Unspecified" badge issues.

## [1.5.4] — 2026-11-17

### 🧭 Active Bridge Governance via System Architecture & Update Detection
- **Smart & Clean Bridge Generation on Project Creation (`scripts/bridge-templates.js`)**:
  - New projects (via Web Cockpit, Quickstart Grill, or CLI `project:new`) now exclusively generate the active AI bridge defined in **"System Architecture"** (`brain.config.json`), keeping the repository root clean and free from unused tool configs.
  - Complete support: GitHub Copilot (`.github/copilot-instructions.md`), Cursor AI (`.cursorrules`), Google Antigravity (`GEMINI.md`), Claude Code (`CLAUDE.md`), Windsurf (`.windsurfrules`), Cline (`.clinerules`), and Universal (`AGENTS.md`).
  - Full flexibility: developers can add or delete bridges anytime via Web Cockpit or CLI.
- **Enhanced Visual Feedback in Quickstart Studio (`app.js`)**:
  - Wizard completion screen now clearly displays the active bridge generated, its icon, and the matching IDE.
- **Real-Time Automatic GitHub Release Update Check (`server.js` and `app.js`)**:
  - Added smart update detection via GitHub's official releases API (`/releases/latest`), featuring a 1-hour cache for zero latency and silent fallback for offline environments.
  - Cockpit now proactively notifies developers via toast and highlights the sidebar badge (`Update ⚡`) whenever a new release is published, showing release notes and update instructions (`git pull origin main`).

## [1.5.3] — 2026-11-17

### 🎯 Quickstart Studio Usability & Visual Resilience
- **AI Technical Grill Studio — Fixed Action Footer & Fluid Scrollbar (`style.css`)**:
  - Fixed modal height calculation to keep footer action boxes fully visible and anchored.
  - Added smart scrollbar styling to architectural decisions list.
- **Architectural Diagram SVG Resilience**:
  - Removed query strings (`?v=...`) from documentation diagram images to avoid Windows file not found errors.
- **AI Gateway — Official Provider Focus**:
  - Strictly focused on official, documented AI providers (Gemini, Groq, OpenAI, Claude, OpenRouter, Ollama, Custom).

## [1.5.2] — 2026-11-17

### 🔌 Universal AI Bridge Standardization (SSOT) & Full Cockpit Management
- **Unified Bridge Engine (`scripts/bridge-templates.js`)**:
  - Consolidated generation of all 7 AI bridges (`.github/copilot-instructions.md`, `.cursorrules`, `CLAUDE.md`, `GEMINI.md`, `.windsurfrules`, `.clinerules`, and `AGENTS.md`) across all workflows (`project:new`, `project:link`, Quickstart Grill, and Web Cockpit).
  - **Single Source of Truth (SSOT)**: Bridges operate strictly as static routers and rule constitutions (mandatory 5-contract read order, read gate, zero fabrication, stack/architecture protection, memory update cycle, and adherence check), never duplicating dynamic stack or state to prevent drift.
- **Cockpit Bridge Controls (`/api/projects/:name/bridges`)**:
  - Individual creation (`+`), safe individual deletion (`×` on chips or `🗑️ Delete` in the contracts list), and batch actions (`🌐 All IDEs` and `🗑️ Clear All`), while keeping core contracts protected against accidental deletion.
  - Configurable **Path prefix in bridges** (`📁 Path prefix in bridges`) for standalone satellite repositories (e.g. `docs/second-brain/` or `./`).
  - Automatic indexing of bridge dotfiles (`.cursorrules`, `.windsurfrules`, `.clinerules`) and `.github/copilot-instructions.md` in `scan-vault.js`, removal of duplicate header button, and addition of `LESSONS_LEARNED.md` to `KNOWN_CONTRACTS`.

### 🛠️ Integrated Editor Fixes
- **Integrated Editor Scroll & Zoom (`style.css` and `app.js`)**:
  - Fixed height calculation (`height: 100%` with `min-height: 0` on `.editor-body` and `font-size` zoom scaling in Write mode), eliminating top-line clipping and restoring natural mouse wheel scrolling.
  - Editor Write mode now always opens at line 1 (top of file).

## [1.5.1] — 2026-11-14

### 🛡️ Interactive Modal Shielding & Stability (Zero Accidental Data Discard)
- **Universal Static Backdrop**:
  - Interactive modals containing forms and user input (`quickstartModal`, `fileEditorModal`, `aiSettingsModal`, `askBrainModal`, `sessionCaptureModal`, `researchModal`, `promptVivoModal`, `decomposeModal`, etc.) now feature Static Backdrop behavior.
  - Inadvertently clicking the dark backdrop or dragging the cursor outside modal cards no longer closes the window or discards in-progress data.
  - Added subtle pulse/shake visual feedback (`.modal-static-shake`) indicating the modal remains active and requires explicit action on buttons (`✕ Close`, `Cancel`, or finalization).
- **Escape Key Shielding with Mandatory Confirmation**:
  - Pressing `ESC` inside modals with in-progress work or filled fields now requires explicit confirmation before discarding data.
  - In Quickstart Studio, `qsConfirmExitModal` guards onboarding progress; in the Expanded File/Specs Editor and AI Gateway, confirmation dialogs prevent unintended loss of typed descriptions, specs, or API keys.
- **Form Enter Key Submission Prevention**:
  - Implemented `setupQuickstartFormKeyguards()` for project creation and link forms (`qsFormNew` and `qsFormLink`), preventing accidental premature submissions on single-line inputs and advancing focus to description fields smoothly.

## [1.5.0] — 2026-10-29

### 🌐 Internationalization & Full Multilingual Support (PT / EN)
- **Factory Bilingual Vault (`.locales/pt/` and `.locales/en/`)**:
  - Full parity coverage (100%) for all 44 canonical framework documents (rules, skills, agents, product guides, decisions, starter memory, and templates).
  - Genuine, fluent technical English preserving cross-references and relative link structures.
- **Instant Swap CLI Engine (`npm run lang:en` and `npm run lang:pt`)**:
  - New CLI orchestrator (`scripts/i18n-cli.js` and `scripts/locale-docs-manager.js`) switching all 44 framework documents in <30ms with atomic validation.
  - Safe user customization preservation with automatic backups (`.locales/backups/`) and custom files quarantine (`.locales/user-custom/`).
- **Dynamic Cockpit and Public Demo Support**:
  - Live language switcher (PT 🇧🇷 / EN 🇺🇸) without full page reload, seamlessly updating UI labels and document vault contents.
  - Full suite of localized architectural SVG diagrams (`*-eng.svg`).

### 📁 Strict Documentation Taxonomy & Distribution Shielding
- **Sanitized `docs/` Root**:
  - `docs/` root now strictly hosts the 6 official user-facing guides (`COMO_UTILIZAR_O_PROJETO.md`, `GUIA_PRATICO.md`, `GUIA_TECNICO_AI_DECISION_GATE_JEV.md`, `RESEARCH_LAB.md`, `SOLUCAO_AI_SECOND_BRAIN.md`, `VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md`).
- **Secure Internal Engineering Isolation (`docs/internals/`)**:
  - Usability reports (Dev Journey), sprint plans, prompt refinement notes, and internal engineering debates moved to `docs/internals/`, fully ignored by Cockpit search, 3D Graph, and AI agents.
  - Formally registered **ADR-G013** in `decisions/GLOBAL_DECISIONS.md` specifying multilingual architecture and doc isolation.
- **Distribution Protection via `.gitattributes`**:
  - Added `export-ignore` directives ensuring GitHub Release downloads and ZIP archives automatically strip internal folders (`docs/internals/`, `memory/sessions/`, etc.), delivering a clean developer experience.

### 🧠 Starter Memory Sanitization
- **Clean Starter State & Lessons Learned**:
  - `memory/current-state.md` and `memory/lessons-learned.md` sanitized into clean boilerplate templates (~30 lines) ready for new developer projects.
  - Comprehensive historical session logs archived in `memory/sessions/` and `memory/archive/`.

### 🛡️ AI Governance & Contract Updates
- Updated core rules (`.agents/rules/00-core.md`, `.agents/rules/04-documentation.md`, `GEMINI.md`, `AGENTS.md`, `CLAUDE.md`) with Principle 9 (Document Taxonomy) and language matching based on `brain.config.json`.

---

## [1.4.2] — 2026-10-28

### 🌟 Community Engagement & Open Source Support
- **Contextual Star Feedback Toast**:
  - Implemented `#starFeedbackToast` in Web Cockpit and Public Demo, non-intrusively triggered in the bottom-right corner upon successful completion of Quickstart Studio (project creation or linking) and on the 3rd user session.
  - Anti-fatigue rules via `localStorage`: persistent choices for `⭐ Star on GitHub` and `Already Starred ⭐` (never shown again) and 14-day smart snooze for `Later` and close button `✕`.
- **Direct Terminal Broadcast (`server.js`)**:
  - Local server startup banner (`npm start` / `start-brain.bat`) updated with a direct GitHub star link.
- **Fixed Sidebar Star Button**:
  - New subtle gold action button (`.sidebar-star-btn`) in sidebar footer, positioned right below the version badge for continuous, unobtrusive access.
- **Landing Page — High-Intent Callout & Navbar Star**:
  - Navbar updated with amber neon illuminated `⭐ Star on GitHub` button.
  - New contextual callout (`.star-callout`) located right below terminal installation block (`git clone`), intercepting developers at the exact moment of copying commands.
  - Conversion telemetry in `analytics.js` tracking clicks on `quickstart_star_callout`.
- **Dynamic Decoupling & Version Single Source of Truth (SSOT)**:
  - Eliminated hardcoded version strings across HTML in Cockpit and Demo (`#bootVersionText`, `#sidebarVersionText`, `#topVersionTag`, `#changelogModalVersionTag`).
  - `package.json` consolidated as the Single Source of Truth (SSOT), powering `/api/system/version` and hydrating the frontend dynamically at runtime via JavaScript and local cache.
  - Integrity linter (`npm run doctor`) and synchronizer (`npm run version:sync`) refactored to verify dynamic integrity without static version string pollution.

---

## [1.4.1] — 2026-10-25

### ⚖️ Governance & Licensing
- **Transition to Functional Source License (FSL-1.1-MIT)**:
  - Adopted `FSL-1.1-MIT` (Source-Available / Fair-Code), ensuring software remains free and open for developers, researchers, students, and internal business use, while explicitly prohibiting unauthorized competing commercial exploitation.
  - Commercial protection period set to **4 years** from each release date, automatically converting to permissive MIT thereafter.
  - Formal recording of **ADR-G012** in `decisions/GLOBAL_DECISIONS.md`.
- **Contributor License Agreement (CLA)**:
  - Created `CLA.md` and `CONTRIBUTING.md` guidelines, protecting intellectual property and ensuring maintainer stewardship over the ecosystem.

### 🎨 Design & UI/UX (Landing Page)
- **Dynamic Catalog Cards Refinement**:
  - Added subtle `Examples` informational label above recommended models.
  - Adopted readable commercial model names (e.g. `Llama 3.3 70B`, `DeepSeek R1 (70B)`, `Gemini 2.5 Flash`) instead of raw API IDs.
  - Restructured dedicated containers (`.profile-example-row`) with comfortable vertical rhythm and balanced mono typography.
- **Community Section**:
  - Refined badge to `COLLABORATION & COMMUNITY` and title to `Built with you.` (with full English parity in `i18n.dict.js`).
  - Footer updated to reflect the new `FSL-1.1-MIT` license.

---

## [1.4.0] — 2026-10-21

### 🚀 Added & Enhanced
- **Total AI Agnosticism (Universal AI Gateway)**:
  - **Interactive AI Status Pill in Research Lab**: Status pill in hero banner (`#rlConnectedAiPill`) is now clickable (`.rl-ai-clickable`) with gear spin micro-animation (`gear-spin-hover`), allowing 1-click access to AI Settings modal (`openAiSettingsModal()`).
  - **Universal Neutralization Across Cockpit & Documentation**:
    - Solution documentation hero (`index.html` and `demo/index.html`) updated to `🔬 Engine: Universal AI Gateway + SSE`.
    - Chapter 3 (Governance & Routing) updated with new callout detailing the universal generative layer (Groq, OpenAI, Anthropic Claude, Google Gemini, DeepSeek, OpenRouter, and local offline Ollama).
    - Chapter 7 (Technical FAQ) completely reframed regarding AI provider downtime, handling automatic TPM/RPM (HTTP 429), exponential backoff, transparent provider swap, and independence of the AIJev rules engine.
    - New Research modal (`#btnAiRefine`): "Refine with AI" button dynamically reflects active provider in real time.
    - Error modal (`#aiErrorProviderText`) and diagnostic terminals: coupled vendor names replaced with neutral AI Gateway designations.
  - **Decoupled Architectural Diagrams**:
    - `research-two-layers.svg`: Updated to reference `Universal AI Gateway`.
    - `ai-decision-routing.svg`: Updated to `Universal AI Gateway + Validation`.
  - **Markdown Documentation & Vault**:
    - `RESEARCH_LAB.md`, `SOLUCAO_AI_SECOND_BRAIN.md`, `GUIA_TECNICO_AI_DECISION_GATE_JEV.md`, and decision records reviewed and neutralized.
    - Snapshot `vault-data.js` regenerated with zero vendor lock-in residue.

### 🛡️ Fixed
- **WAI-ARIA Accessibility & Modal Focus Lifecycle (Inert Attribute)**:
  - **Prevention of Chromium Violation (`Blocked aria-hidden because its descendant retained focus`)**:
    - Fixed closing lifecycle across all Landing Page modals (`#promo-video-modal-9x16`, `#feature-modal`, `#video-modal`) and Markdown reader drawer (`#reader`), restoring focus to trigger element or performing defensive `blur()` **before** setting `aria-hidden="true"`.
    - Native adoption of `inert` attribute on inactive modal containers, preventing unwanted interactions, ghost keyboard focus, and assistive technology noise.
- **Visual & Geometric Refinement in `ai-decision-routing.svg`**:
  - **Alignment and Layering of "YES ➔" Badges**:
    - "YES ➔" badges centered horizontally across decision branches (`y = 195`, `y = 335`, `y = 450`).
    - 100% solid background fill (`#06130e`, `#05121c`, `#130815`) with depth filter (`filter="url(#cardShadow)"`), ensuring animated lines cleanly flow **behind** the badge without intersecting label text.
  - **Enclosing Box for "Governed LLM"**:
    - Result card width expanded from 260px to 285px (`x = 600`), with height unified at 80px.
    - Subtitle font size adjusted to 9px, preventing text overflow and maintaining premium margins.
- **Strict Parity 100%**:
  - Rigorous synchronization of all diagrams, templates, and scripts between `docs/brain-ui/`, `docs/brain-ui/demo/`, and `docs/brain-ui/landing/`.

---

## [1.3.0] — 2026-10-21

### 🚀 Added
- **Real-Time Neural Synthesis Cockpit (Quickstart AI Synthesis Cockpit)**:
  - Eliminated frozen/opaque screen feeling during governance contract synthesis.
  - Streaming technical telemetry via Server-Sent Events (SSE `/api/vault/events` with `quickstart-progress` event) directly from inference engine in `server.js` and `scripts/quickstart-grill.js`.
  - Visual 4-card pipeline carousel (`📑 Requirements Extraction`, `📄 PROJECT.md`, `🏗️ ARCHITECTURE.md`, `⚖️ CURRENT_STATE.md & ADR-0001`) with animated spinners, status badges (`Pending`, `Analyzing / Generating`, `Completed`), and smooth visual transitions.
  - Integrated technical telemetry console with live logs, active model display, elapsed time stopwatch, and token generation speed indicator.
  - Modal expanded to `1040px` with `repeat(4, minmax(0, 1fr))` grid ensuring all 4 cards remain visible without horizontal cuts, plus responsive 2x2 wrapping on smaller viewports.
- **Involuntary Exit Guard & Confirmation**:
  - Click isolation on dark backdrop via `mousedown` tracking (`qsBackdropMouseDownTarget`), preventing accidental dismissals during text selection or form input toggling.
  - Intelligent confirmation modal (`#qsConfirmExitModal`) for outside clicks, `✕` button, and `Escape` key during Step 2, protecting interview answers and specifications from loss.
  - Automatic exemption in Step 3 ("Connected!"): clicking green *"💾 Approve & Create Project on Disk"* button completes setup immediately without exit prompts.

---

## [1.2.0] — 2026-10-18

### 🚀 Added
- **Interactive 3D Neural Planet Visualizer**:
  - Implemented Three.js dynamic node graph representing documents, rules, skills, and projects with real-time physics and orbital camera controls.
- **Markdown Quick Reader Drawer**:
  - Side drawer for reading documents without leaving the dashboard or navigating away.

---

## [1.1.0] — 2026-10-10

### 🚀 Added
- **Multi-Model BYOK Engine**:
  - Native Node.js HTTP/HTTPS client supporting OpenAI, Anthropic, Groq, and Ollama.
- **Git Telemetry Session Capture**:
  - Automated session summary drafts based on commits, file diffs, and developer notes.

---

## [1.0.0] — 2026-09-27

### 🚀 Initial Release
- **AI Second Brain Architecture**:
  - Initial foundation for rules, skills, knowledge base, decisions, and memory.
  - AI Decision Gate (JEV First) pattern and multi-project workspace support.
