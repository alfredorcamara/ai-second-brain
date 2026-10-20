// Modo demonstração: dashboard 100% estático (GitHub Pages), somente leitura.
(() => {
    const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { 'Content-Type': 'application/json' } });
    const real = window.fetch.bind(window);
    const toast = msg => {
        let t = document.getElementById('demo-toast');
        if (!t) { t = document.createElement('div'); t.id = 'demo-toast'; document.body.appendChild(t); }
        t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 3200);
    };
    window.fetch = (url, opts) => {
        const u = String(url);
        if (!u.startsWith('/api/')) return real(url, opts);
        if (u.startsWith('/api/file?path=')) {                                   // leitura vem do snapshot
            const p = decodeURIComponent(u.split('path=')[1]), f = (window.VAULT_SNAPSHOT.files || []).find(x => x.path === p);
            return Promise.resolve(f ? new Response(f.content, { status: 200 }) : new Response('', { status: 404 }));
        }
        if (u.startsWith('/api/vault') || u.startsWith('/api/events')) return Promise.resolve(new Response('', { status: 404 }));   // cai no snapshot
        if (u.startsWith('/api/engine/current')) return Promise.resolve(json({ activeEngine: 'demo' }));
        if (u.startsWith('/api/ai/status') || u.startsWith('/api/ai/config')) return Promise.resolve(json({
            success: true,
            provider: 'groq',
            providerName: 'Groq Cloud',
            configured: true,
            hasKey: true,
            apiKeyMasked: 'gsk_••••••••Zvrf',
            model: 'openai/gpt-oss-120b',
            models: [
                { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', contextWindow: 131072 },
                { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', contextWindow: 131072 },
                { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', contextWindow: 131072 },
                { id: 'allam-2-7b', name: 'ALLaM-2-7b', contextWindow: 4096 }
            ],
            modelCount: 4,
            latencyMs: 380,
            baseUrl: 'https://api.groq.com/openai/v1',
            cacheHours: 24,
            maxRetries: 2
        }));
        if (u.startsWith('/api/ai/test')) {
            let reqBody = {};
            try { reqBody = JSON.parse(opts?.body || '{}'); } catch(e) {}
            const prov = reqBody.provider || 'groq';
            const requiresKey = !['ollama', 'custom'].includes(prov);
            const isSavedDemoKey = (prov === 'groq' && (!reqBody.apiKey || reqBody.apiKey.includes('••••')));
            if (requiresKey && !reqBody.apiKey?.trim() && !isSavedDemoKey) {
                const provNames = { gemini: 'Google Gemini', openai: 'OpenAI', groq: 'Groq', anthropic: 'Anthropic', openrouter: 'OpenRouter' };
                const provName = provNames[prov] || prov.toUpperCase();
                return Promise.resolve(json({
                    success: false,
                    error: `Informe uma API Key para o provedor ${provName}`
                }, 400));
            }
            const mockModelsByProv = {
                gemini: [
                    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', contextWindow: 1048576, category: 'recommended' },
                    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', contextWindow: 1048576, category: 'recommended' },
                    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', contextWindow: 1048576, category: 'recommended' },
                    { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', contextWindow: 1048576, category: 'fast' },
                    { id: 'gemma-4-31b-it', name: 'Gemma 4 31B IT', contextWindow: 131072, category: 'code' }
                ],
                groq: [
                    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', contextWindow: 131072, category: 'recommended' },
                    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', contextWindow: 131072, category: 'recommended' },
                    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', contextWindow: 131072, category: 'fast' },
                    { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', contextWindow: 131072, category: 'code' }
                ],
                openai: [
                    { id: 'gpt-4o', name: 'GPT-4o Flagship', contextWindow: 128000, category: 'recommended' },
                    { id: 'o1', name: 'o1 Raciocínio', contextWindow: 128000, category: 'recommended' },
                    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, category: 'fast' }
                ],
                anthropic: [
                    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextWindow: 200000, category: 'recommended' },
                    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextWindow: 200000, category: 'fast' }
                ],
                openrouter: [
                    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', contextWindow: 64000, category: 'recommended' },
                    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', contextWindow: 64000, category: 'code' }
                ],
                ollama: [
                    { id: 'llama3.2', name: 'Llama 3.2', contextWindow: 128000, category: 'recommended' },
                    { id: 'deepseek-r1', name: 'DeepSeek R1', contextWindow: 64000, category: 'code' },
                    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder', contextWindow: 32000, category: 'code' }
                ],
                custom: [
                    { id: 'default', name: 'Default Model', contextWindow: 32000, category: 'general' }
                ]
            };
            return Promise.resolve(json({
                success: true,
                provider: prov,
                latencyMs: 142,
                models: mockModelsByProv[prov] || mockModelsByProv.groq
            }));
        }
        if (u.startsWith('/api/ai/save')) {
            let reqBody = {};
            try { reqBody = JSON.parse(opts?.body || '{}'); } catch(e) {}
            return Promise.resolve(json({
                success: true,
                message: 'Configuração simulada com sucesso no modo demo.',
                config: {
                    provider: reqBody.provider || 'groq',
                    model: reqBody.model || 'openai/gpt-oss-120b',
                    configured: true,
                    apiKeyMasked: 'gsk_••••••••demo'
                }
            }));
        }
        if (u.startsWith('/api/system/open-ide')) {
            toast('💻 Demo somente leitura — em instalação local seu editor (VS Code, Cursor) seria disparado no projeto.');
            return Promise.resolve(json({ success: true, message: 'Simulado no modo demo.' }));
        }
        if (u.startsWith('/api/system/version')) {
            return Promise.resolve(json({
                success: true,
                version: '1.2.0',
                name: 'ai-second-brain',
                updateAvailable: false,
                behindCommits: 0,
                statusText: 'Atualizado (Modo Demo)',
                changelogUrl: '/api/system/changelog',
                releaseUrl: 'https://github.com/alfredorcamara/ai-second-brain/releases'
            }));
        }
        if (u.startsWith('/api/system/changelog')) {
            const demoChangelog = `# Changelog — AI Second Brain

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico (SemVer)](https://semver.org/lang/pt-BR/).

---

## [1.2.0] — 2026-10-19

### 🚀 Adicionado
- **Suporte Nativo ao Google Gemini**: Integração direta no AI Gateway (BYOK) com suporte à família \`gemini-3.8-flash\`, \`gemini-flash-latest\`, \`gemini-3.5-flash-lite\`, e modelos de alto contexto (1M+ tokens).
- **Curadoria e Agrupamento Semântico Dinâmico de Modelos**:
  - Classificação automática e dinâmica via API sem hardcoding em três grupos no \`<select>\`:
    - 🌟 *Recomendados para Arquitetura & Raciocínio*
    - ⚡ *Rápidos & Baixa Latência*
    - 🛠️ *Abertos & Código (Open-Weights)*
  - Filtro inteligente que descarta automaticamente modelos irrelevantes para engenharia de software.
- **Telemetria e Sinalização Visual de Cota Esgotada (HTTP 429 Rate Limit / Créditos)**:
  - Botão de IA na Topbar passa a pulsar em vermelho imediatamente ao detectar cota ou limite esgotado.
  - Banner contextual dentro do modal de configurações indicando exatamente qual modelo/provedor esgotou.
- **Badge de Versão, Verificador de Atualizações e Modal Changelog**:
  - Notificação de atualizações com detecção de commits remotos e instruções de \`git pull\`.
- **Pasta de Exemplos de Entrada**: Inclusão de \`docs/Exemplos/\` contendo casos de uso reais de requisitos complexos.

### 🛡️ Corrigido
- **Desacoplamento Universal do Research Lab**:
  - Eliminados todos os textos estáticos que mencionavam a Groq Cloud na síntese em tempo real. O modal agora exibe dinamicamente o provedor ativo.
- **Invalidação de Cache de Módulos no Servidor Node.js**:
  - Invalidação dinâmica de \`require.cache\` garantindo efeito imediato de novas rotas e configurações.
- **Paridade Estrita**: 100% de sincronismo e paridade entre o Cockpit local e o modo online.

---

## [1.1.0] — 2026-10-18

### 🚀 Adicionado
- **Suporte a HTTP 206 Partial Content (Range Requests)**: Streaming fluido de vídeos \`.mp4\` e \`.webm\` no servidor nativo Node.js.
- **Player Vertical 9:16 (Bento Grid Cinemática)**: Demonstrações em formato mobile-first/shorts com suspensão de GPU do Three.js.
- **Quickstart Studio em 3 Atos**: Briefing, Sabatina Técnica e Contratos de Governança.

---

## [1.0.0] — 2026-10-03

### 🚀 Lançamento Inicial
- Fundação do **AI Second Brain**: plataforma agnóstica de governança e desenvolvimento assistido por IA.
- Portal Cockpit Web com Grafo 3D Orbital e Spotlight "Pergunte ao Cérebro" (\`Ctrl+K\`).
- AI Gateway agnóstico com suporte inicial Groq, OpenAI, Anthropic, OpenRouter e Ollama.
- Linter de integridade estrutural e contratos de governança (\`npm run doctor\`).`;

            return Promise.resolve(json({
                success: true,
                content: demoChangelog,
                version: '1.2.0'
            }));
        }
        const sessionRoute = u.match(/^\/api\/projects\/[^/]+\/session\/(draft|commit)$/);
        if (sessionRoute) {
            if (sessionRoute[1] === 'commit') {
                toast('🔒 Demo somente leitura — em instalação local a sessão seria gravada em MEMORY/sessions/.');
                return Promise.resolve(json({ success: true, sessionFileName: 'exemplo-demo.md', movedSteps: 0, addedSteps: 0, lessonsAdded: 0 }));
            }
            return new Promise(resolve => setTimeout(() => resolve(json({
                success: true,
                project: 'demo-app',
                git: { available: true, branch: 'main', since: null, commits: 3, changedFiles: 2 },
                provider: 'groq',
                model: 'openai/gpt-oss-120b',
                inferenceMs: 1840,
                usage: {},
                draft: {
                    title: 'Exemplo: autenticação JWT e testes de expiração',
                    summaryMarkdown: '## O que foi feito\n- (Exemplo de demonstração) Implementado login com JWT e refresh token.\n- Cobertura de testes para expiração de token.\n\n## Decisões e motivos\n- Refresh token em cookie httpOnly para reduzir risco de XSS.\n\n## Pendências e bloqueios\n- Revisar política de rotação de refresh tokens.',
                    completedSteps: [],
                    newDefinedItems: ['Login com JWT e refresh token'],
                    newNextSteps: ['Revisar política de rotação de refresh tokens'],
                    lessons: [{ title: 'Expiração de JWT em testes', context: 'Testes dependiam do relógio real.', learning: 'Injetar o relógio evita testes instáveis de expiração.', action: 'Usar relógio injetável em testes de autenticação.' }],
                    adrCandidates: [{ title: 'Refresh token em cookie httpOnly', reason: 'Mudança na estratégia de sessão.' }]
                }
            })), 1400));
        }
        if (u.startsWith('/api/projects/quickstart/')) {
            let reqBody = {};
            try { reqBody = JSON.parse(opts?.body || '{}'); } catch(e) {}
            if (u.includes('/questions')) {
                const existing = Array.isArray(reqBody.existingQuestions) ? reqBody.existingQuestions : [];
                const isComplementary = existing.length > 0;
                const startIndex = existing.length + 1;
                const questions = isComplementary ? [
                    {
                        id: `q${startIndex}`,
                        category: 'Performance & Cache',
                        question: 'Qual será a estratégia de cache e otimização de latência?',
                        options: ['Redis Distribuído', 'Cache em Memória Local', 'CDN / Edge Cache', 'Sem cache inicial'],
                        placeholder: 'Ex: Redis para sessões e consultas frequentes'
                    },
                    {
                        id: `q${startIndex + 1}`,
                        category: 'Observabilidade & Logs',
                        question: 'Como serão estruturados os logs e métricas de diagnóstico?',
                        options: ['Logs estruturados JSON (Pino/Winston)', 'OpenTelemetry + Grafana', 'Sentry (Error Tracking)', 'Console simples'],
                        placeholder: 'Ex: Pino com logs JSON estruturados'
                    },
                    {
                        id: `q${startIndex + 2}`,
                        category: 'CI/CD & Containers',
                        question: 'Qual o ambiente de execução e pipeline de entrega contínua?',
                        options: ['Docker + GitHub Actions', 'Kubernetes / Helm', 'Serverless / Lambdas', 'Deploy direto na VM'],
                        placeholder: 'Ex: Dockerfile multi-stage com GitHub Actions'
                    },
                    {
                        id: `q${startIndex + 3}`,
                        category: 'Resiliência & Falhas',
                        question: 'Como a aplicação lidará com falhas de dependências externas?',
                        options: ['Retries com Exponential Backoff', 'Circuit Breaker', 'Dead Letter Queue', 'Fail fast com erro 500'],
                        placeholder: 'Ex: Retries com backoff exponencial'
                    }
                ] : [
                    {
                        id: 'q1',
                        category: 'Persistência & Dados',
                        question: 'Qual a estratégia principal de banco de dados para a aplicação?',
                        options: ['PostgreSQL (Relacional)', 'MongoDB (Documentos)', 'SQLite / Arquivo Local', 'Sem banco / Stateless'],
                        placeholder: 'Ex: PostgreSQL com Prisma ORM'
                    },
                    {
                        id: 'q2',
                        category: 'Estilo de Comunicação & API',
                        question: 'Qual o padrão de interface de comunicação adotado?',
                        options: ['RESTful JSON API', 'GraphQL', 'gRPC / Protocol Buffers', 'Event-Driven (WebSockets/Filas)'],
                        placeholder: 'Ex: RESTful API documentada com OpenAPI/Swagger'
                    },
                    {
                        id: 'q3',
                        category: 'Autenticação & Segurança',
                        question: 'Como será gerenciada a autenticação e autorização de usuários/serviços?',
                        options: ['JWT (Stateless Bearer Token)', 'Session Cookies (Stateful)', 'OAuth2 / OpenID Connect', 'API Keys simples'],
                        placeholder: 'Ex: JWT com refresh tokens em cookies seguros'
                    },
                    {
                        id: 'q4',
                        category: 'Arquitetura de Código',
                        question: 'Qual padrão estrutural de organização de pastas e camadas será seguido?',
                        options: ['Clean Architecture / Hexagonal', 'Modular Monolith por Domínios', 'MVC Clássico', 'Microserviços Independentes'],
                        placeholder: 'Ex: Clean Architecture com Domain, Application e Infra'
                    }
                ];
                return new Promise(resolve => setTimeout(() => resolve(json({
                    success: true,
                    questions,
                    provider: 'groq',
                    model: 'openai/gpt-oss-120b'
                })), 500));
            }
            if (u.includes('/validate-answers')) {
                const answers = Array.isArray(reqBody.answers) ? reqBody.answers : [];
                const questions = Array.isArray(reqBody.questions) ? reqBody.questions : [];
                for (let i = 0; i < answers.length; i++) {
                    const ans = answers[i];
                    const val = (ans.answer || '').trim();
                    const q = questions.find(x => String(x.id) === String(ans.id)) || questions[i] || {};
                    if (val.length < 3) {
                        return Promise.resolve(json({
                            success: true,
                            valid: false,
                            issue: {
                                questionId: ans.id,
                                questionTitle: q.question || 'Decisão Técnica',
                                category: q.category || 'Decisão Técnica',
                                invalidAnswer: val || '(vazia)',
                                reason: `A resposta "${val}" é muito curta e não define uma decisão arquitetural para o projeto.`,
                                suggestion: q.options && q.options[0] ? q.options[0] : 'Defina uma tecnologia válida'
                            }
                        }));
                    }
                    const gibberish = /^(asdf|qwerty|123|teste|batata|sei\s*la|qualquer)$/i.test(val.toLowerCase());
                    if (gibberish) {
                        return Promise.resolve(json({
                            success: true,
                            valid: false,
                            issue: {
                                questionId: ans.id,
                                questionTitle: q.question || 'Decisão Técnica',
                                category: q.category || 'Decisão Técnica',
                                invalidAnswer: val,
                                reason: `A resposta "${val}" não parece fazer sentido técnico para esta pergunta.`,
                                suggestion: q.options && q.options[0] ? q.options[0] : 'Informe uma tecnologia real'
                            }
                        }));
                    }
                }
                return Promise.resolve(json({ success: true, valid: true }));
            }
            if (u.includes('/draft') || u.includes('/refine')) {
                const name = reqBody.name || 'novo-projeto';
                const stack = reqBody.stack || 'Node.js / TypeScript';
                return new Promise(resolve => setTimeout(() => resolve(json({
                    success: true,
                    contracts: {
                        projectMd: `# ${name}\n\n- **Stack Principal**: ${stack}\n- **Status**: 🟢 Em Planejamento / Ativo\n\n## Visão Geral\nProjeto criado no AI Second Brain com governança assistida por IA.`,
                        architectureMd: `# Arquitetura — ${name}\n\n## Camadas & Padrões\nArquitetura modular com separação clara de responsabilidades seguindo os padrões do AI Second Brain.`,
                        currentStateMd: `# Estado Atual — ${name}\n\n## Status: 🟢 Inicializado com Sucesso\n\n### O que já foi definido\n- [x] Contratos iniciais estabelecidos via Sabatina Técnica\n\n### Próximos Passos\n- [ ] Configuração do ambiente local\n- [ ] Implementação do primeiro módulo core`,
                        adrMd: `# ADR-0001: Definição da Stack Inicial\n\n## Contexto\nInicialização do projeto ${name} com ${stack}.\n\n## Decisão\nAdotada stack recomendada com governança de contratos vivos.\n\n## Consequências\nAlinhamento com as regras determinísticas do AI Second Brain.`
                    },
                    provider: 'groq',
                    model: 'openai/gpt-oss-120b'
                })), 800));
            }
            if (u.includes('/commit')) {
                toast('🔒 Demo somente leitura — em instalação local o projeto seria gravado em projects/.');
                return Promise.resolve(json({
                    success: true,
                    projectPath: `c:/Projetos/SaaS/Google Antigravity/Projetos/AI_SECOND_BRAIN/projects/${reqBody.name || 'demo'}`,
                    folderName: reqBody.name || 'demo',
                    gitInitialized: true
                }));
            }
        }
        if (u.startsWith('/api/projects/new')) {
            let reqBody = {};
            try { reqBody = JSON.parse(opts?.body || '{}'); } catch(e) {}
            toast('🔒 Demo somente leitura — projeto simulado em memória.');
            return Promise.resolve(json({
                success: true,
                name: reqBody.name || 'demo',
                path: `c:/Projetos/SaaS/Google Antigravity/Projetos/AI_SECOND_BRAIN/projects/${reqBody.name || 'demo'}`,
                stack: reqBody.stack || 'Node.js / TypeScript'
            }));
        }
        if (u.startsWith('/api/brain/ask') || u.startsWith('/api/brain/search')) {
            let reqBody = {};
            let categoryFilter = '';
            if (opts?.body) {
                try {
                    reqBody = JSON.parse(opts.body);
                    categoryFilter = (reqBody.categoryFilter || '').toLowerCase().trim();
                } catch(e) {}
            } else if (u.includes('?')) {
                const sp = new URLSearchParams(u.split('?')[1]);
                reqBody.query = sp.get('q') || '';
                reqBody.scope = sp.get('scope') || '';
                categoryFilter = (sp.get('category') || sp.get('categoryFilter') || '').toLowerCase().trim();
            }
            const q = (reqBody.query || '').toLowerCase().trim();
            const scope = (reqBody.scope || '').trim();
            const allFiles = (window.VAULT_SNAPSHOT && window.VAULT_SNAPSHOT.files) || [];

            const scored = allFiles.map(f => {
                let score = 0;
                const pathLower = f.path.toLowerCase();
                const contentLower = (f.content || '').toLowerCase();
                const title = f.path.split('/').pop().replace(/\.md$/i, '');
                
                const terms = q.split(/\s+/).filter(t => t.length > 2);
                terms.forEach(term => {
                    if (pathLower.includes(term)) score += 15;
                    const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
                    score += Math.min(matches, 10) * 2;
                });

                if (pathLower.includes('adr') || pathLower.includes('decision')) score *= 1.5;
                if (pathLower.includes('current_state')) score *= 1.4;
                if (pathLower.includes('project.md')) score *= 1.3;

                const rawPathNorm = pathLower.replace(/\\/g, '/');
                if (scope && !rawPathNorm.includes(`projects/${scope.toLowerCase()}/`) && !rawPathNorm.startsWith(`projects/${scope.toLowerCase()}`)) {
                    return { ...f, title, score: -1 };
                }

                if (categoryFilter && categoryFilter !== 'all') {
                    let fileCat = 'other';
                    const fileName = rawPathNorm.split('/').pop() || '';
                    if (rawPathNorm.includes('/research/') || rawPathNorm.startsWith('research/')) {
                        fileCat = 'research';
                    } else if (rawPathNorm.includes('/decisions/') || rawPathNorm.startsWith('decisions/') || fileName.startsWith('adr-') || fileName.startsWith('adr_')) {
                        fileCat = 'decision';
                    } else if (rawPathNorm.startsWith('.agents/rules/') || rawPathNorm.endsWith('agents.md') || rawPathNorm.endsWith('gemini.md') || rawPathNorm.includes('/rules/')) {
                        fileCat = 'rules';
                    } else if (rawPathNorm.includes('lessons_learned') || rawPathNorm.includes('lessons-learned') || fileName === 'lessons.md' || rawPathNorm.includes('/memory/lessons')) {
                        fileCat = 'lessons';
                    } else if (rawPathNorm.endsWith('project.md') || rawPathNorm.endsWith('current_state.md') || rawPathNorm.endsWith('architecture.md')) {
                        fileCat = 'project';
                    }

                    if (fileCat !== categoryFilter) {
                        return { ...f, title, score: -1 };
                    }
                }

                return { ...f, title, score };
            }).filter(f => f.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);

            const isBroadQuery = q.split(/\s+/).filter(Boolean).length <= 2;
            const synthesisLimit = Math.min(scored.length, isBroadQuery ? 7 : 5);

            const sources = scored.map((f, idx) => {
                const lines = (f.content || '').split('\n').filter(l => l.trim().length > 10 && !l.startsWith('#'));
                const snippet = lines.slice(0, 3).join(' ').slice(0, 260) + '...';
                return {
                    path: f.path,
                    title: f.title,
                    icon: f.path.includes('adr') ? '⚖️' : (f.path.includes('PROJECT') ? '📦' : '📄'),
                    score: f.score,
                    snippet,
                    isSynthesized: idx < synthesisLimit
                };
            });

            if (u.startsWith('/api/brain/search')) {
                return Promise.resolve(json({ success: true, count: sources.length, results: sources }));
            }

            let answer = '';
            if (sources.length === 0) {
                let filterHint = '';
                if (categoryFilter && categoryFilter !== 'all') {
                    const catNames = {
                        decision: '⚖️ ADRs (Decisões Arquiteturais)',
                        research: '🔬 Research Lab (Pesquisas)',
                        rules: '🛡️ Regras Universais',
                        lessons: '🧠 Lições Aprendidas',
                        project: '📦 Contratos de Projetos'
                    };
                    filterHint += ` na categoria **${catNames[categoryFilter] || categoryFilter}**`;
                }
                if (scope) {
                    filterHint += ` no projeto **${scope}**`;
                }
                answer = `Não foram encontrados documentos relevantes no cofre com informações sobre **"${reqBody.query}"**${filterHint}.\n\n💡 **Dica de Usabilidade**: Tente alternar a categoria para **[Todas as Categorias]** ou o escopo para **[Global]** para expandir a busca a outros documentos do Segundo Cérebro.`;
            } else {
                const synthSources = sources.filter(s => s.isSynthesized);
                answer = `Com base na recuperação verificada do vault (${synthSources.length} fonte${synthSources.length > 1 ? 's' : ''} sintetizada${synthSources.length > 1 ? 's' : ''} de ${sources.length} encontrada${sources.length > 1 ? 's' : ''}):\n\n`;
                synthSources.forEach(s => {
                    answer += `- **[${s.title}](${s.path})**: ${s.snippet}\n\n`;
                });
                answer += `\n> *Consulta processada em modo de demonstração sobre o snapshot estático com Zero Fabricação.*`;
            }

            return new Promise(resolve => setTimeout(() => resolve(json({
                success: true,
                query: reqBody.query,
                answer,
                answerMarkdown: answer,
                sources,
                totalFound: scored.length,
                synthesizedCount: Math.min(scored.length, synthesisLimit),
                inferenceMs: 820
            })), 600));
        }
        toast('🔒 Demo somente leitura — instale localmente para criar, editar e rodar o Research Lab.');
        return Promise.resolve(json({ ok: false, error: 'Modo demonstração (somente leitura)' }, 403));
    };
    window.EventSource = function () { return { addEventListener() { }, close() { } }; };
    document.addEventListener('DOMContentLoaded', () => {
        const b = document.createElement('div'); b.id = 'demo-bar';
        b.innerHTML = '<span><i></i>Demo ao vivo · vault de exemplo · somente leitura</span><a href="../landing/index.html">← Landing</a><a href="https://github.com/alfredorcamara/ai-second-brain" target="_blank" rel="noopener">Baixar no GitHub ↗</a>';
        document.body.appendChild(b);
        const s = document.createElement('style');
        s.textContent = '#demo-bar{position:fixed;z-index:99999;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:16px;align-items:center;padding:9px 18px;border-radius:999px;background:#0a1122ee;border:1px solid #ffc76b55;color:#e8ecf5;font:600 12.5px system-ui,sans-serif;backdrop-filter:blur(10px);box-shadow:0 10px 40px #000a}#demo-bar i{display:inline-block;width:8px;height:8px;margin-right:8px;border-radius:50%;background:#2cff9a;box-shadow:0 0 10px #2cff9a}#demo-bar a{color:#ffc76b;text-decoration:none}#demo-bar a:hover{color:#fff}#demo-toast{position:fixed;z-index:99999;left:50%;top:18px;transform:translate(-50%,-20px);opacity:0;padding:12px 20px;border-radius:12px;background:#0a1122f2;border:1px solid #ffc76b66;color:#fff;font:600 13px system-ui,sans-serif;transition:.35s;pointer-events:none}#demo-toast.on{opacity:1;transform:translate(-50%,0)}@media(max-width:640px){#demo-bar{flex-wrap:wrap;justify-content:center;width:92vw;border-radius:18px}}';
        document.head.appendChild(s);
    });
})();
