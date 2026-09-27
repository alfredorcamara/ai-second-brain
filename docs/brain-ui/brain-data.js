// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Data Model
// All brain data for the visualizer
// ═══════════════════════════════════════════════════

const BRAIN_DATA = {
    // ── Navigation Structure ──────────────────────
    sections: [
        {
            id: 'overview',
            label: 'Visão Geral',
            icon: '🧠',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊', path: 'dashboard' },
                { id: 'graph', label: 'Grafo Neural', icon: '🔮', path: 'graph' },
            ]
        },
        {
            id: 'rules',
            label: 'Rules',
            icon: '📏',
            badge: 7,
            items: [
                { id: 'rule-core', label: '00 Core', icon: '⚙️', path: 'rules/00-core' },
                { id: 'rule-ai', label: '01 AI Decision', icon: '🤖', path: 'rules/01-ai-decision' },
                { id: 'rule-aijev', label: '02 AIJev', icon: '🎯', path: 'rules/02-aijev' },
                { id: 'rule-security', label: '03 Security', icon: '🔒', path: 'rules/03-security' },
                { id: 'rule-dotnet', label: '04 .NET', icon: '💜', path: 'rules/04-dotnet' },
                { id: 'rule-sql', label: '05 SQL Server', icon: '🗃️', path: 'rules/05-sql-server' },
                { id: 'rule-docs', label: '06 Documentation', icon: '📝', path: 'rules/06-documentation' },
            ]
        },
        {
            id: 'skills',
            label: 'Skills',
            icon: '⚡',
            badge: 8,
            items: [
                { id: 'skill-onboarding', label: 'Project Onboarding', icon: '🚀', path: 'skills/project-onboarding' },
                { id: 'skill-decision', label: 'AI Decision Gate', icon: '🚦', path: 'skills/ai-decision-gate' },
                { id: 'skill-feature', label: 'New Feature', icon: '✨', path: 'skills/new-feature' },
                { id: 'skill-bug', label: 'Bug Investigation', icon: '🐛', path: 'skills/bug-investigation' },
                { id: 'skill-arch', label: 'Architecture Review', icon: '🏗️', path: 'skills/architecture-review' },
                { id: 'skill-memory', label: 'Session Memory', icon: '💾', path: 'skills/session-memory' },
                { id: 'skill-ai', label: 'AI Integration', icon: '🔌', path: 'skills/ai-integration' },
                { id: 'skill-db', label: 'Database Review', icon: '🗄️', path: 'skills/database-review' },
            ]
        },
        {
            id: 'knowledge',
            label: 'Knowledge',
            icon: '📚',
            badge: 6,
            items: [
                { id: 'know-index', label: 'Índice Global', icon: '📋', path: 'knowledge/global' },
                { id: 'know-aijev', label: 'AIJev', icon: '🎯', path: 'knowledge/ai/aijev' },
                { id: 'know-models', label: 'Seleção de Modelos', icon: '🧬', path: 'knowledge/ai/models' },
                { id: 'know-gateway', label: 'AI Gateway', icon: '🌐', path: 'knowledge/ai/gateway' },
                { id: 'know-arch', label: 'Padrões de Arquitetura', icon: '🏛️', path: 'knowledge/architecture' },
            ]
        },
        {
            id: 'projects',
            label: 'Projects',
            icon: '📁',
            badge: 3,
            items: [
                { id: 'proj-jobsentinel', label: 'JobSentinel', icon: '⚡', path: 'projects/JobSentinel', status: 'yellow' },
                { id: 'proj-sabor', label: 'Sabor em Conflito', icon: '🎮', path: 'projects/Sabor-em-Conflito', status: 'red' },
                { id: 'proj-assistente', label: 'Assistente Mobile', icon: '📱', path: 'projects/Assistente-Mobile', status: 'red' },
            ]
        },
        {
            id: 'decisions',
            label: 'Decisions',
            icon: '⚖️',
            items: [
                { id: 'dec-global', label: 'Decisões Globais', icon: '🌍', path: 'decisions/global' },
                { id: 'dec-adr001', label: 'ADR-0001 Decision Gate', icon: '📄', path: 'decisions/adr-0001' },
            ]
        },
        {
            id: 'memory',
            label: 'Memory',
            icon: '🧮',
            items: [
                { id: 'mem-state', label: 'Estado Atual', icon: '📍', path: 'memory/current-state' },
                { id: 'mem-lessons', label: 'Lições Aprendidas', icon: '💡', path: 'memory/lessons-learned' },
            ]
        },
        {
            id: 'templates',
            label: 'Templates',
            icon: '📋',
            items: [
                { id: 'tmpl-feature', label: 'Feature Spec', icon: '📐', path: 'templates/feature-spec' },
                { id: 'tmpl-project', label: 'Project', icon: '📁', path: 'templates/project' },
                { id: 'tmpl-ai', label: 'AI Use Case', icon: '🤖', path: 'templates/ai-use-case' },
                { id: 'tmpl-session', label: 'Session Memory', icon: '💾', path: 'templates/session-memory' },
            ]
        },
    ],

    // ── Graph Nodes ───────────────────────────────
    graphNodes: [
        // Core
        { id: 'brain', label: 'AI Second Brain', group: 'core', size: 30, x: 0.5, y: 0.5 },

        // Rules
        { id: 'rules', label: 'Rules', group: 'rules', size: 20, x: 0.2, y: 0.25 },
        { id: 'r-core', label: 'Core', group: 'rules', size: 10, x: 0.08, y: 0.15 },
        { id: 'r-ai', label: 'AI Decision', group: 'rules', size: 10, x: 0.12, y: 0.32 },
        { id: 'r-aijev', label: 'AIJev', group: 'rules', size: 10, x: 0.06, y: 0.28 },
        { id: 'r-security', label: 'Security', group: 'rules', size: 10, x: 0.15, y: 0.12 },
        { id: 'r-dotnet', label: '.NET', group: 'rules', size: 10, x: 0.22, y: 0.14 },
        { id: 'r-sql', label: 'SQL Server', group: 'rules', size: 10, x: 0.28, y: 0.18 },

        // Skills
        { id: 'skills', label: 'Skills', group: 'skills', size: 20, x: 0.8, y: 0.25 },
        { id: 's-onboard', label: 'Onboarding', group: 'skills', size: 10, x: 0.88, y: 0.15 },
        { id: 's-decision', label: 'Decision Gate', group: 'skills', size: 12, x: 0.92, y: 0.28 },
        { id: 's-feature', label: 'New Feature', group: 'skills', size: 10, x: 0.85, y: 0.35 },
        { id: 's-bug', label: 'Bug Investigation', group: 'skills', size: 10, x: 0.78, y: 0.12 },
        { id: 's-arch', label: 'Arch Review', group: 'skills', size: 10, x: 0.72, y: 0.18 },
        { id: 's-memory', label: 'Session Memory', group: 'skills', size: 10, x: 0.92, y: 0.38 },

        // Knowledge
        { id: 'knowledge', label: 'Knowledge', group: 'knowledge', size: 20, x: 0.2, y: 0.75 },
        { id: 'k-aijev', label: 'AIJev', group: 'knowledge', size: 10, x: 0.08, y: 0.68 },
        { id: 'k-models', label: 'Model Selection', group: 'knowledge', size: 10, x: 0.12, y: 0.82 },
        { id: 'k-gateway', label: 'AI Gateway', group: 'knowledge', size: 10, x: 0.06, y: 0.78 },
        { id: 'k-patterns', label: 'Patterns', group: 'knowledge', size: 10, x: 0.22, y: 0.88 },

        // Projects
        { id: 'projects', label: 'Projects', group: 'projects', size: 20, x: 0.8, y: 0.75 },
        { id: 'p-jobsentinel', label: 'JobSentinel', group: 'projects', size: 14, x: 0.88, y: 0.68 },
        { id: 'p-sabor', label: 'Sabor em Conflito', group: 'projects', size: 12, x: 0.92, y: 0.82 },
        { id: 'p-assistente', label: 'Assistente Mobile', group: 'projects', size: 12, x: 0.78, y: 0.88 },

        // Memory & Decisions
        { id: 'memory', label: 'Memory', group: 'memory', size: 16, x: 0.35, y: 0.88 },
        { id: 'decisions', label: 'Decisions', group: 'decisions', size: 16, x: 0.65, y: 0.88 },

        // AI Gateway
        { id: 'gateway', label: 'AI Gateway', group: 'ai', size: 18, x: 0.5, y: 0.3 },
        { id: 'aijev', label: 'AIJev/Jev', group: 'ai', size: 14, x: 0.38, y: 0.18 },
        { id: 'llm', label: 'LLM', group: 'ai', size: 14, x: 0.5, y: 0.15 },
        { id: 'local-ai', label: 'Local AI', group: 'ai', size: 12, x: 0.62, y: 0.18 },
    ],

    // ── Graph Edges ───────────────────────────────
    graphEdges: [
        // Brain connections
        { from: 'brain', to: 'rules' },
        { from: 'brain', to: 'skills' },
        { from: 'brain', to: 'knowledge' },
        { from: 'brain', to: 'projects' },
        { from: 'brain', to: 'memory' },
        { from: 'brain', to: 'decisions' },
        { from: 'brain', to: 'gateway' },

        // Rules
        { from: 'rules', to: 'r-core' },
        { from: 'rules', to: 'r-ai' },
        { from: 'rules', to: 'r-aijev' },
        { from: 'rules', to: 'r-security' },
        { from: 'rules', to: 'r-dotnet' },
        { from: 'rules', to: 'r-sql' },

        // Skills
        { from: 'skills', to: 's-onboard' },
        { from: 'skills', to: 's-decision' },
        { from: 'skills', to: 's-feature' },
        { from: 'skills', to: 's-bug' },
        { from: 'skills', to: 's-arch' },
        { from: 'skills', to: 's-memory' },

        // Knowledge
        { from: 'knowledge', to: 'k-aijev' },
        { from: 'knowledge', to: 'k-models' },
        { from: 'knowledge', to: 'k-gateway' },
        { from: 'knowledge', to: 'k-patterns' },

        // Projects
        { from: 'projects', to: 'p-jobsentinel' },
        { from: 'projects', to: 'p-sabor' },
        { from: 'projects', to: 'p-assistente' },

        // AI Gateway
        { from: 'gateway', to: 'aijev' },
        { from: 'gateway', to: 'llm' },
        { from: 'gateway', to: 'local-ai' },

        // Cross connections
        { from: 'r-ai', to: 's-decision' },
        { from: 'r-aijev', to: 'k-aijev' },
        { from: 'r-aijev', to: 'aijev' },
        { from: 's-decision', to: 'gateway' },
        { from: 'k-gateway', to: 'gateway' },
        { from: 'p-jobsentinel', to: 'gateway' },
        { from: 'p-jobsentinel', to: 'r-sql' },
        { from: 'p-jobsentinel', to: 'r-dotnet' },
        { from: 'p-assistente', to: 'r-dotnet' },
        { from: 's-memory', to: 'memory' },
        { from: 'decisions', to: 'p-jobsentinel' },
    ],

    // ── Group Colors ──────────────────────────────
    groupColors: {
        core: { fill: '#6366f1', stroke: '#818cf8', glow: 'rgba(99, 102, 241, 0.4)' },
        rules: { fill: '#f59e0b', stroke: '#fbbf24', glow: 'rgba(245, 158, 11, 0.3)' },
        skills: { fill: '#10b981', stroke: '#34d399', glow: 'rgba(16, 185, 129, 0.3)' },
        knowledge: { fill: '#3b82f6', stroke: '#60a5fa', glow: 'rgba(59, 130, 246, 0.3)' },
        projects: { fill: '#8b5cf6', stroke: '#a78bfa', glow: 'rgba(139, 92, 246, 0.3)' },
        memory: { fill: '#ec4899', stroke: '#f472b6', glow: 'rgba(236, 72, 153, 0.3)' },
        decisions: { fill: '#14b8a6', stroke: '#2dd4bf', glow: 'rgba(20, 184, 166, 0.3)' },
        ai: { fill: '#f97316', stroke: '#fb923c', glow: 'rgba(249, 115, 22, 0.3)' },
    },

    // ── Document Content ──────────────────────────
    documents: {
        'rules/00-core': {
            title: '00 — Regras Core',
            type: 'Rule',
            icon: '⚙️',
            content: `
                <h1>Regras Fundamentais do AI Second Brain</h1>
                <blockquote><p>Estas regras são aplicadas a <strong>todo</strong> trabalho realizado neste workspace.</p></blockquote>

                <h2>Princípios</h2>
                <ol>
                    <li><strong>Context First</strong> — Sempre leia o contexto antes de agir.</li>
                    <li><strong>Decision Aware</strong> — Consulte decisões anteriores antes de alterar arquitetura.</li>
                    <li><strong>Memory Persistent</strong> — Atualize a memória após trabalho significativo.</li>
                    <li><strong>Quality Over Speed</strong> — Prefira soluções robustas a soluções rápidas.</li>
                    <li><strong>Explicit Over Implicit</strong> — Documente premissas e decisões.</li>
                </ol>

                <h2>Fluxo de Trabalho Obrigatório</h2>
                <pre>1. ENTENDER → O que está sendo pedido?
2. CONTEXTUALIZAR → Qual projeto? Qual estado atual?
3. CLASSIFICAR → Que tipo de tarefa é?
4. PLANEJAR → Qual a melhor abordagem?
5. EXECUTAR → Implementar com qualidade.
6. VALIDAR → Testar e verificar.
7. DOCUMENTAR → Atualizar docs e memória.</pre>

                <h2>Convenções</h2>
                <ul>
                    <li>Código em <strong>C#</strong> segue as convenções da Microsoft.</li>
                    <li>SQL segue as convenções do projeto (maiúsculas para keywords).</li>
                    <li>Documentação em <strong>Markdown</strong> com formatação consistente.</li>
                    <li>Commits seguem Conventional Commits.</li>
                </ul>
            `
        },
        'rules/01-ai-decision': {
            title: '01 — AI Decision',
            type: 'Rule',
            icon: '🤖',
            content: `
                <h1>Regras de Decisão com IA</h1>
                <blockquote><p>Define quando e como utilizar diferentes tipos de IA nas tarefas.</p></blockquote>

                <h2>Classificação Obrigatória</h2>
                <table>
                    <tr><th>Nível</th><th>Tipo</th><th>Ação</th></tr>
                    <tr><td>1</td><td>Determinístico</td><td>Código/Regras</td></tr>
                    <tr><td>2</td><td>Classificação/Decisão</td><td>AIJev/Jev</td></tr>
                    <tr><td>3</td><td>Geração</td><td>LLM com validação</td></tr>
                    <tr><td>4</td><td>Composto</td><td>AIJev → LLM → Validação</td></tr>
                </table>

                <h2>Regra de Ouro</h2>
                <pre>SE pode ser resolvido com código → CÓDIGO
SE precisa decidir/classificar → AIJEV primeiro
SE precisa gerar/explicar → LLM
SEMPRE → VALIDAR resultado</pre>

                <h2>Proibições</h2>
                <ul>
                    <li>❌ Usar LLM para tarefas determinísticas</li>
                    <li>❌ Chamar IA generativa para cada evento/Job</li>
                    <li>❌ Ignorar AIJev quando a tarefa é de decisão</li>
                    <li>❌ Aceitar resultado de IA sem validação</li>
                </ul>
            `
        },
        'rules/02-aijev': {
            title: '02 — AIJev/Jev',
            type: 'Rule',
            icon: '🎯',
            content: `
                <h1>Regras de Integração AIJev/Jev</h1>
                <blockquote><p>AIJev é uma camada de decisão estruturada. Ref: <a href="https://aijev.org/pt/">aijev.org</a></p></blockquote>

                <h2>Quando usar</h2>
                <table>
                    <tr><th>Cenário</th><th>AIJev?</th><th>Alternativa</th></tr>
                    <tr><td>Classificar evento</td><td>✅ Sim</td><td>—</td></tr>
                    <tr><td>Priorizar alerta</td><td>✅ Sim</td><td>—</td></tr>
                    <tr><td>Decidir ação</td><td>✅ Sim</td><td>—</td></tr>
                    <tr><td>Gerar texto</td><td>❌ Não</td><td>LLM</td></tr>
                    <tr><td>Cálculo fixo</td><td>❌ Não</td><td>Código</td></tr>
                </table>

                <h2>Padrão: Identificar → Gerar → Validar</h2>
                <ol>
                    <li><strong>Identificar</strong>: O que está acontecendo? (estado + contexto)</li>
                    <li><strong>Gerar</strong>: Qual a decisão? (AIJev processa)</li>
                    <li><strong>Validar</strong>: A decisão é coerente? (validação programática)</li>
                </ol>
            `
        },
        'projects/JobSentinel': {
            title: 'JobSentinel',
            type: 'Project',
            icon: '⚡',
            content: `
                <h1>JobSentinel</h1>
                <div class="doc-meta">
                    <span class="doc-meta-item">🟡 Em planejamento</span>
                    <span class="doc-meta-item">⚡ .NET 8</span>
                    <span class="doc-meta-item">🗃️ SQL Server</span>
                </div>
                <p>Sistema de observabilidade inteligente para SQL Server Agent Jobs. Transforma monitoramento passivo em inteligência operacional ativa.</p>

                <h2>Arquitetura de IA</h2>
                <pre>SQL JOB FALHOU
      │
      ▼
  EVENTO DETECTADO
      │
      ▼
  NORMALIZAÇÃO
      │
      ▼
  REGRAS DETERMINÍSTICAS
      │
      ▼
  AIJEV / DECISION GATE
      │
      ├── operação normal → registra
      ├── incidente conhecido → alerta
      ├── necessita humano → escala
      └── necessita explicação
              │
              ▼
            LLM → VALIDAÇÃO → PORTAL</pre>

                <h2>Objetivos</h2>
                <ol>
                    <li>Monitorar SQL Agent Jobs em tempo real</li>
                    <li>Detectar e classificar falhas automaticamente</li>
                    <li>Decidir ações com AIJev</li>
                    <li>Gerar explicações contextualizadas com LLM</li>
                    <li>Portal para visibilidade operacional</li>
                </ol>
            `
        },
        'projects/Sabor-em-Conflito': {
            title: 'Sabor em Conflito',
            type: 'Project',
            icon: '🎮',
            content: `
                <h1>Sabor em Conflito</h1>
                <div class="doc-meta">
                    <span class="doc-meta-item">🔴 Em conceituação</span>
                    <span class="doc-meta-item">🎮 Game</span>
                </div>
                <p>Jogo mobile de estratégia culinária.</p>
                <h2>Próximos Passos</h2>
                <ol>
                    <li>Finalizar game design document</li>
                    <li>Definir art direction</li>
                    <li>Escolher engine (Unity vs Godot)</li>
                    <li>Criar protótipo de gameplay</li>
                </ol>
            `
        },
        'projects/Assistente-Mobile': {
            title: 'Assistente Mobile',
            type: 'Project',
            icon: '📱',
            content: `
                <h1>Assistente Mobile</h1>
                <div class="doc-meta">
                    <span class="doc-meta-item">🔴 Em conceituação</span>
                    <span class="doc-meta-item">📱 .NET MAUI</span>
                </div>
                <p>Aplicativo mobile assistente pessoal com IA.</p>
                <h2>Próximos Passos</h2>
                <ol>
                    <li>Definir escopo do MVP</li>
                    <li>Definir arquitetura (Clean Architecture + MAUI)</li>
                    <li>Criar wireframes</li>
                    <li>Configurar AI Gateway</li>
                </ol>
            `
        },
        'knowledge/ai/aijev': {
            title: 'AIJev / Jev — Referência',
            type: 'Knowledge',
            icon: '🎯',
            content: `
                <h1>AIJev / Jev</h1>
                <blockquote><p>Camada de decisão estruturada para software. <a href="https://aijev.org/pt/">aijev.org</a></p></blockquote>
                <p>O software fornece um <strong>estado</strong> e <strong>perguntas predefinidas</strong>, e recebe <strong>decisões tipadas</strong> com probabilidades.</p>

                <h2>Integração .NET</h2>
                <pre>public interface IDecisionProvider
{
    Task&lt;DecisionResult&gt; DecideAsync(
        DecisionRequest request,
        CancellationToken ct);
}

// Implementações:
// ├── JevDecisionProvider      → API AIJev
// ├── RulesDecisionProvider    → Fallback
// └── MockDecisionProvider     → Testes</pre>
            `
        },
        'knowledge/ai/gateway': {
            title: 'AI Gateway Pattern',
            type: 'Knowledge',
            icon: '🌐',
            content: `
                <h1>AI Gateway Pattern</h1>
                <p>Abstração que desacopla seus projetos de provedores específicos de IA.</p>

                <h2>Benefícios</h2>
                <ol>
                    <li><strong>Desacoplamento</strong> — Troque de provider sem mudar código</li>
                    <li><strong>Fallback</strong> — Se um provider falhar, use outro</li>
                    <li><strong>Observabilidade</strong> — Métricas centralizadas</li>
                    <li><strong>Custo</strong> — Controle e roteamento</li>
                    <li><strong>Segurança</strong> — Ponto único para regras de dados</li>
                </ol>

                <h2>Arquitetura</h2>
                <pre>APPLICATION
    │
    ▼
AI GATEWAY
    │
    ┌──────┼──────┐
    ▼      ▼      ▼
 RULES   AIJEV   LLM
    │      │      │
    └──────┼──────┘
           ▼
       VALIDATION
           │
           ▼
        RESULT</pre>
            `
        },
        'knowledge/ai/models': {
            title: 'Seleção de Modelos de IA',
            type: 'Knowledge',
            icon: '🧬',
            content: `
                <h1>Seleção de Modelos</h1>
                <h2>Por Caso de Uso</h2>
                <table>
                    <tr><th>Caso</th><th>Recomendado</th></tr>
                    <tr><td>Decisão/Classificação</td><td>AIJev → Regras → GPT-4o-mini</td></tr>
                    <tr><td>Geração de Texto/Código</td><td>Claude Opus → GPT-4o</td></tr>
                    <tr><td>Análise de Código</td><td>Claude Opus → Gemini 2.5 Pro</td></tr>
                    <tr><td>Embeddings</td><td>text-embedding-3-small</td></tr>
                </table>

                <h2>Regra de Ouro</h2>
                <blockquote><p>Comece sempre com o modelo mais simples e barato que atenda. Escale apenas se necessário.</p></blockquote>
            `
        },
        'decisions/global': {
            title: 'Decisões Globais',
            type: 'Decision',
            icon: '🌍',
            content: `
                <h1>Decisões Globais</h1>
                <table>
                    <tr><th>ADR</th><th>Decisão</th><th>Status</th></tr>
                    <tr><td>G001</td><td>AI Decision Gate como padrão de roteamento</td><td>✅ Aceita</td></tr>
                    <tr><td>G002</td><td>AI Gateway como abstração unificada</td><td>✅ Aceita</td></tr>
                    <tr><td>G003</td><td>Formato Antigravity nativo para AI Second Brain</td><td>✅ Aceita</td></tr>
                    <tr><td>G004</td><td>Documentação como código</td><td>✅ Aceita</td></tr>
                </table>
            `
        },
        'memory/current-state': {
            title: 'Estado Atual',
            type: 'Memory',
            icon: '📍',
            content: `
                <h1>Estado Atual do AI Second Brain</h1>
                <div class="doc-meta">
                    <span class="doc-meta-item">📅 2026-09-27</span>
                </div>
                <h2>Projetos</h2>
                <table>
                    <tr><th>Projeto</th><th>Status</th><th>Prioridade</th></tr>
                    <tr><td>JobSentinel</td><td>🟡 Em planejamento</td><td>Alta</td></tr>
                    <tr><td>Sabor em Conflito</td><td>🔴 Em conceituação</td><td>Média</td></tr>
                    <tr><td>Assistente Mobile</td><td>🔴 Em conceituação</td><td>Média</td></tr>
                </table>
                <h2>Foco Atual</h2>
                <ul>
                    <li>Estruturação do AI Second Brain</li>
                    <li>Definição da arquitetura do JobSentinel</li>
                    <li>Estabelecimento do AI Decision Gate pattern</li>
                </ul>
            `
        },
    }
};
