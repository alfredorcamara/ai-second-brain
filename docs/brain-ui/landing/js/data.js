// Dados de exemplo (sanitizados) em PT e EN — estrutura real do "AI Second Brain".
// LANDING_DATA.build('pt' | 'en') devolve { nodes, colors, folders }.
(() => {
    // pasta: [ícone, cor, ...arquivos]; arquivo = "slug|Título PT|Desc PT|Title EN|Desc EN"
    const D = {
        rules: [
            '⚙️', '#f87171',
            '00-core|00-core: Regras Fundamentais|A lei da casa: prioridade determinística, zero invenção e catálogo dinâmico de IA.|00-core: Core Rules|The house law: deterministic priority, zero invention and dynamic AI catalog.',
            '01-ai-decision|01-ai-decision: Roteamento de IA|Quando usar código puro, regras determinísticas ou modelo generativo.|01-ai-decision: AI Decision Routing|When to use plain code, business rules or generative models.',
            '02-aijev|02-aijev: Padrão AIJev e Automação|Arquitetura de decisão determinística e classificação estruturada.|02-aijev: AIJev Pattern & Automation|Deterministic decision architecture and structured classification.',
            '03-security|03-security: Regras de Segurança|OWASP, classificação de dados, proteção de segredos e PII.|03-security: Security Rules|OWASP, data classification, secrets protection and PII.',
            '04-documentation|04-documentation: Regras de Documentação|Como registrar decisões, manter a memória viva e evitar documentação obsoleta.|04-documentation: Documentation Rules|How to record decisions, keep memory alive and avoid stale docs.'
        ],
        skills: [
            '⚡', '#a3e635',
            'ai-decision-gate|ai-decision-gate: Portão de Decisão|Classifica a tarefa e define o roteamento determinístico antes do código.|ai-decision-gate: Decision Gate|Classifies task and sets deterministic routing before code.',
            'ai-integration|ai-integration: Integração de IA|Guia de integração do AI Gateway pattern e provedores multi-IA.|ai-integration: AI Integration|Integration guide for AI Gateway pattern and multi-AI providers.',
            'new-feature|new-feature: Nova Feature|Roteiro estruturado para iniciar novas features com contexto preservado.|new-feature: New Feature|Structured playbook to start new features with context preserved.',
            'bug-investigation|bug-investigation: Investigação de Bugs|Investigação guiada por evidências, classificação de severidade e post-mortem.|bug-investigation: Bug Investigation|Evidence-driven investigation, severity triage and post-mortem.',
            'architecture-review|architecture-review: Revisão de Arquitetura|Revisão arquitetural orientada a trade-offs e registros de ADRs.|architecture-review: Architecture Review|Architectural review driven by trade-offs and ADR records.',
            'session-memory|session-memory: Memória de Sessão|Gerenciamento de memória persistente entre sessões de trabalho.|session-memory: Session Memory|Persistent memory management across work sessions.'
        ],
        knowledge: [
            '📚', '#f59e0b',
            'AIJEV|AIJev & Decisões Determinísticas|Padrão para decisões rápidas e auditáveis sem LLM.|AIJev & Deterministic Decisions|Pattern for fast, auditable decisions without LLM.',
            'AI_GATEWAY|AI Gateway Multi-Provedor|Abstração unificada, auto-descoberta e fallback entre modelos.|Multi-Provider AI Gateway|Unified abstraction, auto-discovery and model fallback.',
            'MODEL_SELECTION|Seleção de Modelos de IA|Critérios de latência, custo e complexidade para escolha de LLMs.|AI Model Selection|Latency, cost and complexity criteria for model selection.',
            'OWASP|Segurança e OWASP para IA|Guia prático contra vazamentos, prompt injection e riscos LGPD.|Security & OWASP for IA|Hands-on guide against leaks, prompt injection and GDPR/LGPD risks.',
            'PATTERNS|Padrões de Arquitetura|Catálogo de padrões adotados no ecossistema de projetos.|Architecture Patterns|Catalog of patterns adopted across the project ecosystem.'
        ],
        memory: [
            '🧠', '#38bdf8',
            'current-state|current-state: Estado Atual do Framework|Onde o AI Second Brain está hoje e próximas etapas consolidadas.|current-state: Framework Current State|Where AI Second Brain stands today and consolidated next steps.',
            'lessons-learned|lessons-learned: Lições Globais|Erros catalogados do framework que nunca mais serão repetidos.|lessons-learned: Global Lessons|Cataloged framework mistakes that will never be repeated.',
            'README|README: Estrutura de Memória|Diretrizes de isolamento de memória entre o framework e os projetos.|README: Memory Architecture|Guidelines on memory isolation between framework and projects.'
        ],
        decisions: [
            '⚖️', '#c084fc',
            'GLOBAL_DECISIONS|GLOBAL_DECISIONS: Decisões Globais|Governança agnóstica, padrão AGENTS.md e catálogo dinâmico de IA.|GLOBAL_DECISIONS: Global Decisions|Agnostic governance, AGENTS.md standard and dynamic AI catalog.',
            '001-stack-inicial|001-stack-inicial (Projeto)|Exemplo real de ADR de stack, banco de dados e requisitos técnicos.|001-stack-inicial (Project)|Real-world ADR on stack, database and technical requirements.',
            'decisao_groq_provider|decisao_groq_provider: Provedor de IA|Decisão técnica e métricas do Research Lab.|decisao_groq_provider: AI Provider|Technical decision and metrics for Research Lab.'
        ],
        templates: [
            '📐', '#facc15',
            'project|project.md: Template de Projeto|Estrutura padrão para documentar e iniciar novos projetos.|project.md: Project Template|Standard structure to document and start new projects.',
            'feature-spec|feature-spec.md: Template de Feature|Especificação técnica com contexto, riscos e critérios de aceite.|feature-spec.md: Feature Spec|Technical spec with context, risks and acceptance criteria.',
            'session-memory|session-memory.md: Memória de Sessão|Template de registro ao fim de cada sessão de trabalho.|session-memory.md: Session Memory|Handoff template at the end of each work session.',
            'lessons-learned|lessons-learned.md: Lições Aprendidas|Template para catalogar erros e soluções em projetos.|lessons-learned.md: Lessons Learned|Template to catalog mistakes and solutions in projects.',
            'ai-use-case|ai-use-case.md: Caso de Uso de IA|Avaliação de viabilidade, Decision Gate e métricas de IA.|ai-use-case.md: AI Use Case|Feasibility assessment, Decision Gate and AI metrics.'
        ],
        projects: [
            '🚀', '#fb923c',
            'PROJECT|PROJECT.md: Visão Geral|Objetivos, escopo e tecnologias centrais do projeto.|PROJECT.md: Project Overview|Goals, scope and core technologies of the project.',
            'CURRENT_STATE|CURRENT_STATE.md: Estado Local|O que foi feito, tarefas em andamento e bloqueios no projeto.|CURRENT_STATE.md: Local State|What was done, in-progress tasks and project blockers.',
            'LESSONS_LEARNED|LESSONS_LEARNED.md: Lições Locais|Memória local de erros corrigidos e aprendizados do projeto.|LESSONS_LEARNED.md: Local Lessons|Local memory of fixed bugs and learnings in the project.',
            'ARCHITECTURE|ARCHITECTURE.md: Arquitetura|Diagramas, contratos de API e modelagem do projeto.|ARCHITECTURE.md: Architecture|Diagrams, API contracts and project modeling.',
            'BACKUPS|dossie_governanca: Backup Auditável|Exportação completa de governança em Markdown e JSON.|dossie_governanca: Auditable Backup|Complete governance export in Markdown and JSON.'
        ],
        research: [
            '🔬', '#22d3ee',
            'RESEARCH_LAB|RESEARCH_LAB.md: Guia do Laboratório|Como funciona a pesquisa autônoma em duas camadas.|RESEARCH_LAB.md: Lab Guide|How two-layer autonomous research works.',
            'analise_prompt_refinement|analise_prompt_refinement: Refino de Prompts|Metodologia de análise e evolução de prompts com IA.|analise_prompt_refinement: Prompt Refinement|Methodology for AI prompt analysis and evolution.',
            'melhorias_research_lab|melhorias_research_lab: Melhorias e Resiliência|Arquitetura de rate-limiting, retry e cadência preventiva.|melhorias_research_lab: Improvements & Resilience|Rate-limiting, retry and preventive cadence architecture.',
            'crm_overview|CRM: OVERVIEW.md (Pesquisa Real)|Exemplo de pesquisa concluída com camadas knowledge e actionable.|CRM: OVERVIEW.md (Real Research)|Example of completed research with knowledge and actionable layers.'
        ]
    };
    const TXT = {
        pt: { root: 'AI Second Brain', sum: 'Em resumo', l1: 'Vive em', l2: 'versionado junto com o código.', l3: 'O agente lê este arquivo **antes** de agir.', l4: 'Qualquer pessoa edita: é só Markdown.', see: 'Veja também' },
        en: { root: 'AI Second Brain', sum: 'In short', l1: 'Lives at', l2: 'versioned along with the code.', l3: 'The agent reads this file **before** acting.', l4: 'Anyone can edit it: it\'s just Markdown.', see: 'See also' }
    };
    function build(lang) {
        const en = lang === 'en', t = TXT[en ? 'en' : 'pt'], nodes = [], colors = { 'g-root': { fill: '#8b5cf6' } }, folders = {}, all = [];
        nodes.push({ id: 'root', label: t.root, icon: '🧠', isFolder: true, isCentral: true, group: 'g-root', depth: 0 });
        for (const k in D) {
            const [icon, col, ...fl] = D[k], g = 'g-' + k; colors[g] = { fill: col };
            const fd = folders[k] = { id: 'd:' + k, label: k + '/', icon, isFolder: true, parentId: 'root', group: g, depth: 1, fileCount: fl.length, path: k };
            nodes.push(fd);
            fl.forEach(f => { const p = f.split('|'); all.push({ k, slug: p[0], title: en ? p[3] : p[1], desc: en ? p[4] : p[2], g }); });
        }
        all.forEach((f, i) => {
            const a = all[(i + 1) % all.length], b = all[(i * 7 + 3) % all.length];
            let realPath = `${f.k}/${f.slug}.md`;
            if (f.k === 'rules') realPath = `.agents/rules/${f.slug}.md`;
            else if (f.k === 'skills') realPath = `.agents/skills/${f.slug}/SKILL.md`;
            else if (f.k === 'knowledge') realPath = f.slug === 'PATTERNS' ? 'knowledge/architecture/PATTERNS.md' : (f.slug === 'OWASP' ? 'knowledge/security/OWASP.md' : `knowledge/ai/${f.slug}.md`);
            else if (f.k === 'memory') realPath = `memory/${f.slug}.md`;
            else if (f.k === 'decisions') realPath = f.slug === 'GLOBAL_DECISIONS' ? 'decisions/GLOBAL_DECISIONS.md' : (f.slug === '001-stack-inicial' ? 'projects/<projeto>/DECISIONS/001-stack-inicial.md' : `docs/${f.slug}.md`);
            else if (f.k === 'templates') realPath = `templates/${f.slug}.md`;
            else if (f.k === 'projects') realPath = f.slug === 'BACKUPS' ? 'projects/<projeto>/BACKUPS/dossie_governanca.md' : `projects/<projeto>/${f.slug}.md`;
            else if (f.k === 'research') realPath = f.slug === 'crm_overview' ? 'projects/<projeto>/RESEARCH/crm/OVERVIEW.md' : `docs/${f.slug}.md`;

            const md = `# ${f.title}\n\n> ${f.desc}\n\n## ${t.sum}\n- ${t.l1} \`${realPath}\`, ${t.l2}\n- ${t.l3}\n- ${t.l4}\n\n## ${t.see}\n- [[${a.slug}]]\n- [[${b.slug}]]\n`;
            nodes.push({ id: `${f.k}/${f.slug}`, label: f.title, icon: D[f.k][0], path: realPath, group: f.g, parentId: 'd:' + f.k, depth: 2, content: md, bytes: 900 + ((i * 937) % 7000), mtime: Date.now() - ((i * 53) % 400) * 36e5 });
        });
        return { nodes, colors, folders };
    }
    window.LANDING_DATA = Object.assign(build('pt'), { build });
})();
