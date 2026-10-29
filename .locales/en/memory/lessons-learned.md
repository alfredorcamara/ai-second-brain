# Universal Lessons Learned — AI Second Brain

> Perennial engineering, governance, and AI integration records.
> Must be consulted by the developer and any AI coding agent before architecting code.

---

## 🏛️ Golden Principles of AI Governance

1. **Zero Fabrication**: The model must NEVER invent nonexistent libraries, speculative routes, or rules not present in contracts.
2. **Deterministic Code Before LLM (JEV-First)**: If a task can be solved with deterministic rules, regex, or traditional code, do not use generative AI.
3. **100% Dynamic Catalogs**: NEVER create fixed or hardcoded lists of AI models in code or HTML. Catalogs must query provider APIs in real time.
4. **Secret Isolation**: Credentials and API keys are NEVER committed to Git; they belong exclusively in the local `.env` file.

---

## 📐 Framework Architectural Lessons

### Lesson: Surgical Specification Routing and Token Limits
- **Context**: Passing large specification documents entirely to the model led to output token exhaustion (`max_tokens`) and repetition loops.
- **Validated Pattern**: Semantic section routing. Scope and business rules populate `PROJECT.md`. Database schemas, tables, and endpoints populate `ARCHITECTURE.md`. High-density code files should be generated in dedicated calls with clean outputs.

### Lesson: Universal Propagation of Quota Failures (429) and BYOK Resilience
- **Context**: When encountering rate limits (`429 Rate Limit`), generic calls returned HTTP 500 without clear metadata, making the UI feel frozen.
- **Validated Pattern**: All AI modules must propagate `quotaExceeded`, `isRateLimit`, `retryAfter`, and `providerName` while preserving the HTTP 429 status. The local client must alert the user and guide switching model or provider.

### Lesson: Preserving Original Documents in `SPECS/`
- **Context**: Briefing documents or PRDs provided at project kickoff risked being forgotten after contract generation.
- **Validated Pattern**: Saving copies of original briefings under the project's `SPECS/` directory ensures traceability and prevents the AI from asking redundant questions during technical interviews.

---

## 🗄️ Specific Lessons Archive
- [Audiovisual Performance & UI Lessons (MP4, GOP & Compositor)](archive/video-and-ui-lessons.md)
