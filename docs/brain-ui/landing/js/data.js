// Dados de exemplo (sanitizados) em PT e EN — estrutura de um "AI Second Brain".
// LANDING_DATA.build('pt' | 'en') devolve { nodes, colors, folders }.
(() => {
    // pasta: [ícone, cor, ...arquivos]; arquivo = "slug|Título PT|Desc PT|Title EN|Desc EN"
    const D = {
        rules: ['⚙️', '#f87171', 'nucleo|Regras Fundamentais|A lei da casa: o que todo agente precisa respeitar.|Core Rules|The house law: what every agent must respect.', 'decisao-ia|Regras de Decisão com IA|Quando usar IA, regra de negócio ou código puro.|AI Decision Rules|When to use AI, business rules or plain code.', 'seguranca|Regras de Segurança|OWASP, segredos e proteção de dados.|Security Rules|OWASP, secrets and data protection.', 'documentacao|Regras de Documentação|Como registrar e manter o contexto vivo.|Documentation Rules|How to record and keep context alive.', 'integracao|Regras de Integração|Contratos entre serviços e gateways.|Integration Rules|Contracts between services and gateways.'],
        skills: ['⚡', '#a3e635', 'ai-decision-gate|ai-decision-gate|Classifica a tarefa antes de escrever código.|ai-decision-gate|Classifies the task before writing code.', 'new-feature|new-feature|Roteiro para nascer uma feature com contexto.|new-feature|Playbook to start a feature with context.', 'bug-investigation|bug-investigation|Investigação guiada por evidências.|bug-investigation|Evidence-driven investigation.', 'architecture-review|architecture-review|Revisão de arquitetura com ADRs.|architecture-review|Architecture review with ADRs.', 'database-review|database-review|Schema, índices e migrações seguras.|database-review|Schema, indexes and safe migrations.'],
        knowledge: ['📚', '#f59e0b', 'padroes|Padrões de Arquitetura|Catálogo de padrões que o time adota.|Architecture Patterns|Catalog of patterns the team adopts.', 'gateway|AI Gateway Pattern|Um ponto único para falar com modelos.|AI Gateway Pattern|A single entry point to talk to models.', 'modelos|Seleção de Modelos de IA|Custo, latência e qualidade lado a lado.|AI Model Selection|Cost, latency and quality side by side.', 'owasp|Segurança e OWASP|Proteção de dados com IA.|Security & OWASP|Data protection when using AI.', 'indice|Índice de Conhecimento|O mapa de tudo que o cérebro sabe.|Knowledge Index|The map of everything the brain knows.'],
        memory: ['🧠', '#38bdf8', 'estado|Estado Atual|Onde o projeto está hoje.|Current State|Where the project stands today.', 'licoes|Lições Aprendidas|Erros que nunca mais serão repetidos.|Lessons Learned|Mistakes that will never be repeated.', 'sessao-12|Memória da Sessão 12|O que foi feito e o que ficou pendente.|Session 12 Memory|What was done and what is pending.', 'sessao-13|Memória da Sessão 13|Contexto entregue ao próximo agente.|Session 13 Memory|Context handed to the next agent.'],
        decisions: ['⚖️', '#c084fc', 'adr-001|ADR-001 Stack Inicial|Por que escolhemos esta stack.|ADR-001 Initial Stack|Why we chose this stack.', 'adr-002|ADR-002 Provedor de IA|Decisão e alternativas descartadas.|ADR-002 AI Provider|Decision and discarded alternatives.', 'adr-003|ADR-003 Modelo de Dados|Schema e estratégia de migração.|ADR-003 Data Model|Schema and migration strategy.', 'globais|Decisões Globais|Regras que valem para todos os projetos.|Global Decisions|Rules that apply to every project.'],
        templates: ['📐', '#facc15', 'feature|Template de Feature|Especificação pronta para preencher.|Feature Template|Ready-to-fill specification.', 'projeto|Template de Projeto|Do zero ao contexto completo.|Project Template|From zero to full context.', 'caso-ia|Template de Caso de Uso de IA|Problema, dados, risco e métrica.|AI Use Case Template|Problem, data, risk and metric.', 'sessao|Template de Memória de Sessão|Registro padrão ao fim do dia.|Session Memory Template|Standard end-of-day record.'],
        projects: ['🚀', '#fb923c', 'projeto-a|Projeto A — Arquitetura|Visão geral e decisões.|Project A — Architecture|Overview and decisions.', 'projeto-a-estado|Projeto A — Estado Atual|Tarefas, bloqueios e próximos passos.|Project A — Current State|Tasks, blockers and next steps.', 'projeto-b|Projeto B — Governança|Dossiê de riscos e conformidade.|Project B — Governance|Risk and compliance dossier.', 'projeto-b-crm|Projeto B — Modelagem CRM|Entidades e migração de schema.|Project B — CRM Modeling|Entities and schema migration.', 'legado|Projeto Legado — Mapeamento|Como conectar código antigo ao cérebro.|Legacy Project — Mapping|How to connect old code to the brain.'],
        research: ['🔬', '#22d3ee', 'lab|Research Lab|Laboratório de conhecimento com IA.|Research Lab|Autonomous knowledge lab with AI.', 'refino|Refino de Prompts|Análise de prompts assistidos.|Prompt Refinement|AI-assisted prompt analysis.', 'provedor|Groq como Provedor|Decisão e métricas do laboratório.|Groq as Provider|Decision and lab metrics.', 'melhorias|Melhorias Propostas|Backlog de pesquisa priorizado.|Proposed Improvements|Prioritized research backlog.']
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
            const md = `# ${f.title}\n\n> ${f.desc}\n\n## ${t.sum}\n- ${t.l1} \`${f.k}/${f.slug}.md\`, ${t.l2}\n- ${t.l3}\n- ${t.l4}\n\n## ${t.see}\n- [[${a.slug}]]\n- [[${b.slug}]]\n`;
            nodes.push({ id: `${f.k}/${f.slug}`, label: f.title, icon: D[f.k][0], path: `${f.k}/${f.slug}.md`, group: f.g, parentId: 'd:' + f.k, depth: 2, content: md, bytes: 900 + ((i * 937) % 7000), mtime: Date.now() - ((i * 53) % 400) * 36e5 });
        });
        return { nodes, colors, folders };
    }
    window.LANDING_DATA = Object.assign(build('pt'), { build });
})();
