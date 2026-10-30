<p align="center">
  <img src="docs/brain-ui/assets/Banner%20futurista%20do%20AI%20Second%20Brain.webp" alt="AI Second Brain Banner" width="100%" />
</p>

# AI Second Brain

<p align="center">
  <a href="https://github.com/alfredorcamara/ai-second-brain/stargazers"><img src="https://img.shields.io/github/stars/alfredorcamara/ai-second-brain?style=for-the-badge&logo=github&color=38bdf8&logoColor=white&label=Star%20on%20GitHub%20%E2%AD%90" alt="GitHub Stars" /></a>
  <a href="https://github.com/alfredorcamara/ai-second-brain/releases"><img src="https://img.shields.io/github/v/release/alfredorcamara/ai-second-brain?style=for-the-badge&color=8b5cf6" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  🌐 <a href="../../README.md">Português</a> &nbsp;|&nbsp; <b>English</b>
</p>

> **The Living Memory and Governance Operating System for AI Coding Agents.**  
> 100% Markdown · Tool & IDE Agnostic (Cursor, Claude Code, Antigravity, Windsurf, Copilot, Cline, Roo Code) · Zero Lock-in.

---

## 🌐 Explore the Landing Page & Online Demo

- 🚀 **Official Landing Page with 3D Graph**: [https://alfredorcamara.github.io/ai-second-brain-site/](https://alfredorcamara.github.io/ai-second-brain-site/)  
  *(Explore the interactive presentation, navigate the real-time 3D neural graph, and test the public demo).*
- 💻 **Local Offline Access**: Open [`docs/brain-ui/index.html`](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN_CENTRAL/AI_SECOND_BRAIN/docs/brain-ui/index.html) directly in your browser.

---

## ⚡ How to Start the Brain Cockpit

The simplest, fastest, and recommended way to start **AI Second Brain** on your machine:

> ### 🟢 Double-click `start-brain.bat`
> 
> It handles everything automatically in the background:
> 1. Starts the high-performance local server with Live Reload support (SSE);
> 2. Synchronizes the neural vault and validates governance contracts;
> 3. Instantly opens the Visual Cockpit in your default browser at `http://localhost:3333`.

*(If you prefer the command line: simply run `npm start`).*

> 🌟 **Enjoying the project?** Please consider leaving a **[Star on GitHub](https://github.com/alfredorcamara/ai-second-brain)**! It takes 2 seconds and helps more developers discover the framework.

---

## 💡 What is AI Second Brain?

Developing software with AI coding agents (Cursor AI, Claude Code, Antigravity, Windsurf) often runs into the same systemic pitfalls: **cross-session amnesia**, **repetitive daily prompt re-briefing**, **architectural hallucinations**, and **technical decisions lost inside ephemeral chat sessions**.

**AI Second Brain** solves this by turning your AI agent into a true senior engineering partner:
- **Rules, Decisions (ADRs), and Lessons Learned** become a **Living 3D Neural Graph** that any agent reads automatically at the beginning of each session;
- **Isolated Projects**: Each connected repository (`projects/<name>/`) owns its own governance contracts without scope contamination;
- **Zero Fabrication**: The system enforces strict rules forbidding agents from inventing imaginary libraries, phantom screens, or speculative mechanics.

---

## 🎯 Guided Project Creation with AI Technical Interview (Grill Studio)

When creating a new project in the Cockpit (via **`+ New Project`** or `npm run project:new`), developers can leverage the **Dual-Mode Quickstart**:

| Mode | How It Works | When to Use |
|---|---|---|
| **⚡ Express Mode (50ms)** | Instant, 100% deterministic folder creation with clean starter contracts. | For routine tasks or when all architectural choices are already decided in your head. |
| **🎯 AI-Assisted Mode (Grill Studio)** | An **interactive technical interview conducted by AI** that hardens architecture before writing code. | For new ideas, SaaS, APIs, and complex systems where you want to eliminate ambiguity. |

### 🧠 How the Technical Interview Helps Developers:

```
Project Name ──► [AI Interview] ──► [Audit & JEV Gate] ──► [Live Synthesis Cockpit (4 Cards & SSE)] ──► [Human Approval]
```

1. **Surgical, Context-Aware Questions**:
   - The AI crafts **3 to 4 deep technical questions tailored to your project stack and domain** (e.g., persistence & database strategy, auth models, fault tolerance, concurrency, API contracts).
2. **Focused Ergonomics (Smart Accordion)**:
   - Only **1 question remains expanded at a time**, collapsing answered questions into clean checklist badges with a live progress bar.
   - Choose between **1-click quick-answer chips** or free-form text input with seamless automatic advancement.
3. **Incoherent Answer Auditor**:
   - If vague or disconnected inputs are entered, the auditing engine analyzes architectural coherence and provides **1-click actionable suggestions** to harden specifications.
4. **Real-Time Neural Synthesis Cockpit (Zero Freezing & Live SSE)**:
   - During generation, an **interactive pipeline displays 4 governance cards** (`📑 Requirements Extraction`, `📄 PROJECT.md`, `🏗️ ARCHITECTURE.md`, and `⚖️ CURRENT_STATE.md & ADR-0001`).
   - Live telemetry and status updates are streamed directly from AI inference via Server-Sent Events.
5. **Atomic Synthesis of 4 Living Contracts**:
   - Synthesizes the core governance pillars:
     - `PROJECT.md`: Executive overview, approved tech stack, and business rules;
     - `ARCHITECTURE.md`: Component diagram, data flows, and integrations;
     - `CURRENT_STATE.md`: Active roadmap calibrated into 3 realistic milestones;
     - `DECISIONS/ADR-0001-initial-stack.md`: The formal architectural decision record.
6. **Iterative Refinement Toolbar ("Surgical Live Prompt with JEV Engine")**:
   - Governed by the local **`RulesDecisionProvider`** (0ms latency, zero tokens before decision).
   - **Surgical Isolation**: Modifying tables/data affects **strictly** `ARCHITECTURE.md`, without polluting `PROJECT.md` or `CURRENT_STATE.md`.
   - **Human-in-the-Loop Clarification**: If vague instructions are detected, a clarification dialog opens with 1-click option chips.
   - **Auto-Switch & Undo**: Smoothly shifts focus to the modified document tab and supports instant rollbacks with `↺ Undo`.
7. **Accidental Dismiss Guard**:
   - Smart protection against accidental backdrop clicks or `Escape` key presses during form completion.
8. **Mandatory Human Approval**:
   - **Zero Fabrication**: Nothing is written to disk until the developer explicitly clicks `💾 Approve & Create Project on Disk`.

---

## ✨ Core Cockpit Capabilities

Beyond Quickstart Studio, the AI Second Brain web portal provides a complete AI-assisted engineering suite:

- **🪐 Interactive 3D Neural Graph (Three.js)**: Visualize synapses, dependencies, and connections between rules, skills, decisions, and projects orbiting in space with organic force-directed physics.
- **⚡ Synaptic Boot HUD (0ms Pre-Render)**: Seamless startup telemetry (`Active Vault`, `Live Contracts`, `AI Gateways`) with immediate render and zero white screens.
- **🔍 Executive Governance Toolbar**: Real-time Omnisearch (shortcut `/`), dynamic filters by Tech Stack, unified Operational Status (SSOT), and Contract Compliance metrics.
- **✨ Ask the Brain (Global Q&A — `Ctrl+K`)**: Hybrid search engine with source citations from ADRs, lessons, and contracts, opening directly in the viewer or zooming to neurons in the 3D Graph.
- **🧠 AI-Assisted Session Capture**: Capture daily sessions directly from real Git commits with mandatory secret sanitization (`.env`, credentials). AI drafts the summary and you approve atomic commits to `CURRENT_STATE.md` and `LESSONS_LEARNED.md`.
- **🔌 Multi-Provider AI Gateway (BYOK - Bring Your Own Key)**: Switch seamlessly between **Groq Cloud** (ultra-fast), **OpenAI**, **Anthropic Claude**, **OpenRouter**, and **Local Ollama** (100% offline), with credentials securely stored on your machine.
- **💻 Native IDE Integration & Prompt Bootstrap**: Launch projects into VS Code, Cursor, or Windows Explorer in 1 click, and copy **pre-warmed Prompt Bootstrap templates** to initialize fresh chat contexts without amnesia.

---

## 📁 Workspace Structure

```
AI_SECOND_BRAIN/
│
├── start-brain.bat              ← 🟢 1-click startup script (Recommended)
├── server.js                    ← Local server with SSE and Live Reload
├── README.md                    ← Main documentation
│
├── AGENTS.md                    ← Universal standard for AI agents
├── GEMINI.md                    ← Native bridge for Google Antigravity
├── .cursorrules                 ← Native bridge for Cursor AI
├── CLAUDE.md                    ← Native bridge for Claude Code
├── .windsurfrules               ← Native bridge for Windsurf
├── .github/copilot-instructions ← Native bridge for GitHub Copilot
├── .clinerules                  ← Native bridge for Cline / Roo Code
│
├── .agents/                     ← Active governance
│   ├── rules/                   ← Deterministic rules and security guardrails
│   ├── skills/                  ← Reusable workflows on demand
│   └── plugins/                 ← Ecosystem extensions
│
├── knowledge/                   ← Universal and enduring knowledge base
│   ├── global/                  ← Global index and domain glossary
│   ├── ai/                      ← Decision Gate, AIJev, AI Gateway, and Model Selection
│   ├── architecture/            ← Architectural patterns and industry best practices
│   └── security/                ← OWASP, sanitization, and AI security
│
├── projects/                    ← Your real-world projects (APIs, SaaS, Mobile, Games)
│   └── <your-project>/          ← Each project with its own living contracts
│       ├── PROJECT.md           ← Vision and official stack
│       ├── ARCHITECTURE.md      ← Technical design and decisions
│       ├── CURRENT_STATE.md     ← Active roadmap and progress
│       ├── LESSONS_LEARNED.md   ← Project-specific learnings to avoid repeat mistakes
│       ├── DECISIONS/           ← Sequential ADRs for this project
│       └── MEMORY/sessions/     ← Detailed session history
│
├── decisions/                   ← Global framework architectural decisions
├── memory/                      ← Stability memory and universal learnings
├── templates/                   ← Standardized templates for projects, ADRs, and specs
└── docs/
    └── brain-ui/                ← Modern web visualizer portal and Landing Page
```

---

## 🛠️ CLI Operations

| Command | Description |
|---|---|
| `start-brain.bat` *(or `npm start`)* | **Fastest way:** Syncs vault, starts server, and opens Cockpit in browser |
| `npm run project:new <name>` | Creates a new AI-assisted project with governance contracts |
| `npm run project:link <name> <path>` | Links an existing repository on your disk via NTFS junction without file duplication |
| `npm run doctor` *(or `npm run check`)* | Runs integrity linter: validates Markdown links, project contracts, and **100% of JS scripts syntax** |
| `npm run version:sync` | Automatically synchronizes `package.json` version across HTML UI, apps, and dictionaries |
| `npm run scan` | Forces vault re-scan and updates static snapshot for offline viewing |
| `npm run sync:demo` | Synchronizes Cockpit visual assets directly to the public web demo |
| `npm run lang:en` | Sets active language to English and swaps all 58 framework documents to English |
| `npm run lang:pt` | Sets active language to Portuguese and synchronizes all 58 framework documents to Portuguese |

---

## 📖 In-Depth Guides

- 📘 **[Practical Guide (docs/COMO_UTILIZAR_O_PROJETO.md)](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN_CENTRAL/AI_SECOND_BRAIN/docs/COMO_UTILIZAR_O_PROJETO.md)**: Step-by-step practical manual for day-to-day operation.
- 🧠 **[Market & Strategic Analysis (docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md)](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN_CENTRAL/AI_SECOND_BRAIN/docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md)**: Why context governance is the primary competitive edge for AI-assisted teams.
- 🔬 **[Autonomous Research Lab Engine (docs/RESEARCH_LAB.md)](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN_CENTRAL/AI_SECOND_BRAIN/docs/RESEARCH_LAB.md)**: Architecture of autonomous research, topic decomposition, and continuous synthesis.

---

## 🏛️ Governance Philosophy

```
                      AI SECOND BRAIN
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
    AI CODING AGENTS (Multi-IDE)       KNOWLEDGE VAULT
    Cursor · Claude · Antigravity      Markdown · Git · Zero Lock-in
            │                                 │
     ┌──────┴──────┐                   ┌──────┴──────┐
     ▼             ▼                   ▼             ▼
   RULES        SKILLS              DECISIONS      MEMORY
 (Guardrails)  (Workflows)           (ADRs)      (Continuous)
     │             │                   │             │
     └──────┬──────┘                   └──────┬──────┘
            │                                 │
            └───────────────┬─────────────────┘
                            ▼
                        AI GATEWAY
             Groq · OpenAI · Claude · Ollama
                            │
                            ▼
                      YOUR PROJECTS
              SaaS · Web · APIs · Mobile · Games
```

---

## Author & License

Created and maintained with dedication by **Alfredo R. Câmara** ([@alfredorcamara](https://github.com/alfredorcamara)).  
Distributed under the **[FSL-1.1-MIT](LICENSE)** license (*Functional Source License — Source-Available / Fair-Code*).  
Free for personal use, research, learning, and internal development. For commercial competition or commercial partnerships, refer to [LICENSE](LICENSE) and [CLA](CLA.md).

<br>

<p align="center">
  <img src="docs/brain-ui/assets/ai-second-brain-logo-animado.svg" alt="AI Second Brain Logo" width="220" />
</p>

<p align="center">
  <em>Transforming AI coding agents into senior software engineers through living memory and continuous governance.</em>
</p>

<p align="center">
  <a href="https://cursor.com"><img src="https://img.shields.io/badge/Cursor-Compatible-000000?style=flat-square&logo=cursor&logoColor=white" alt="Cursor"></a>
  <a href="https://claude.ai"><img src="https://img.shields.io/badge/Claude%20Code-Compatible-D97706?style=flat-square&logo=anthropic&logoColor=white" alt="Claude"></a>
  <a href="#"><img src="https://img.shields.io/badge/Google%20Antigravity-Native-4285F4?style=flat-square&logo=google&logoColor=white" alt="Antigravity"></a>
  <a href="https://codeium.com/windsurf"><img src="https://img.shields.io/badge/Windsurf-Compatible-0ea5e9?style=flat-square&logo=windsurf&logoColor=white" alt="Windsurf"></a>
  <a href="https://github.com/features/copilot"><img src="https://img.shields.io/badge/GitHub%20Copilot-Compatible-181717?style=flat-square&logo=githubcopilot&logoColor=white" alt="Copilot"></a>
</p>

<p align="center">
  <a href="https://alfredorcamara.github.io/ai-second-brain-site/">🌐 Landing Page</a> ·
  <a href="https://github.com/alfredorcamara/ai-second-brain/issues">🐛 Report Issue</a> ·
  <a href="https://github.com/alfredorcamara/ai-second-brain/discussions">💡 Discussions</a> ·
  <a href="#ai-second-brain">⬆ Back to Top</a>
</p>
