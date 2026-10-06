// Dados de exemplo (sanitizados) — estrutura real de um "AI Second Brain"
(() => {
    const D = {
        rules: ['⚙️', '#f87171', 'nucleo:Regras Fundamentais:A lei da casa: o que todo agente precisa respeitar.', 'decisao-ia:Regras de Decisão com IA:Quando usar IA, regra de negócio ou código puro.', 'seguranca:Regras de Segurança:OWASP, segredos e proteção de dados.', 'documentacao:Regras de Documentação:Como registrar e manter o contexto vivo.', 'integracao:Regras de Integração:Contratos entre serviços e gateways.'],
        skills: ['⚡', '#a3e635', 'ai-decision-gate:ai-decision-gate:Classifica a tarefa antes de escrever código.', 'new-feature:new-feature:Roteiro para nascer uma feature com contexto.', 'bug-investigation:bug-investigation:Investigação guiada por evidências.', 'architecture-review:architecture-review:Revisão de arquitetura com ADRs.', 'database-review:database-review:Schema, índices e migrações seguras.'],
        knowledge: ['📚', '#f59e0b', 'padroes:Padrões de Arquitetura:Catálogo de padrões que o time adota.', 'gateway:AI Gateway Pattern:Um ponto único para falar com modelos.', 'modelos:Seleção de Modelos de IA:Custo, latência e qualidade lado a lado.', 'owasp:Segurança e OWASP:Proteção de dados com IA.', 'indice:Índice de Conhecimento:O mapa de tudo que o cérebro sabe.'],
        memory: ['🧠', '#38bdf8', 'estado:Estado Atual:Onde o projeto está hoje.', 'licoes:Lições Aprendidas:Erros que nunca mais serão repetidos.', 'sessao-12:Memória da Sessão 12:O que foi feito e o que ficou pendente.', 'sessao-13:Memória da Sessão 13:Contexto entregue ao próximo agente.'],
        decisions: ['⚖️', '#c084fc', 'adr-001:ADR-001 Stack Inicial:Por que escolhemos esta stack.', 'adr-002:ADR-002 Provedor de IA:Decisão e alternativas descartadas.', 'adr-003:ADR-003 Modelo de Dados:Schema e estratégia de migração.', 'globais:Decisões Globais:Regras que valem para todos os projetos.'],
        templates: ['📐', '#facc15', 'feature:Template de Feature:Especificação pronta para preencher.', 'projeto:Template de Projeto:Do zero ao contexto completo.', 'caso-ia:Template de Caso de Uso de IA:Problema, dados, risco e métrica.', 'sessao:Template de Memória de Sessão:Registro padrão ao fim do dia.'],
        projects: ['🚀', '#fb923c', 'projeto-a:Projeto A — Arquitetura:Visão geral e decisões.', 'projeto-a-estado:Projeto A — Estado Atual:Tarefas, bloqueios e próximos passos.', 'projeto-b:Projeto B — Governança:Dossiê de riscos e conformidade.', 'projeto-b-crm:Projeto B — Modelagem CRM:Entidades e migração de schema.', 'legado:Projeto Legado — Mapeamento:Como conectar código antigo ao cérebro.'],
        research: ['🔬', '#22d3ee', 'lab:Research Lab:Laboratório de conhecimento com IA.', 'refino:Refino de Prompts:Análise de prompts assistidos.', 'provedor:Groq como Provedor:Decisão e métricas do laboratório.', 'melhorias:Melhorias Propostas:Backlog de pesquisa priorizado.']
    };
    const nodes = [], colors = { 'g-root': { fill: '#8b5cf6' } }, folders = {}, all = [];
    nodes.push({ id: 'root', label: 'AI Second Brain', icon: '🧠', isFolder: true, isCentral: true, group: 'g-root', depth: 0 });
    for (const k in D) {
        const [icon, col, ...fl] = D[k], g = 'g-' + k;
        colors[g] = { fill: col };
        const fd = folders[k] = { id: 'd:' + k, label: k + '/', icon, isFolder: true, parentId: 'root', group: g, depth: 1, fileCount: fl.length, path: k };
        nodes.push(fd);
        fl.forEach(f => { const [slug, title, desc] = f.split(':'); all.push({ k, slug, title, desc, g }); });
    }
    all.forEach((f, i) => {
        const a = all[(i + 1) % all.length], b = all[(i * 7 + 3) % all.length];
        const md = `# ${f.title}\n\n> ${f.desc}\n\n## Em resumo\n- Vive em \`${f.k}/${f.slug}.md\`, versionado junto com o código.\n- O agente lê este arquivo **antes** de agir.\n- Qualquer pessoa edita: é só Markdown.\n\n## Veja também\n- [[${a.slug}]]\n- [[${b.slug}]]\n`;
        nodes.push({ id: `${f.k}/${f.slug}`, label: f.title, icon: D[f.k][0], path: `${f.k}/${f.slug}.md`, group: f.g, parentId: 'd:' + f.k, depth: 2, content: md, bytes: 900 + ((i * 937) % 7000), mtime: Date.now() - ((i * 53) % 400) * 36e5 });
    });
    window.LANDING_DATA = { nodes, colors, folders };
})();
