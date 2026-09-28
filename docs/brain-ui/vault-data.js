// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Dynamic Vault Snapshot
// Auto-generated: 2026-09-27T23:39:19.136Z
// ═══════════════════════════════════════════════════

window.VAULT_SNAPSHOT = {
  "timestamp": 1790552359135,
  "files": [
    {
      "id": "_agents_rules_00-core_md",
      "path": ".agents/rules/00-core.md",
      "name": "00-core.md",
      "title": "Regras Fundamentais do AI Second Brain",
      "category": "rules",
      "icon": "⚙️",
      "size": 1585,
      "mtime": 1790519709341.0762,
      "outgoingLinks": [],
      "content": "# Regras Fundamentais do AI Second Brain\n\n> Estas regras são aplicadas a **todo** trabalho realizado neste workspace.\n\n## Identidade\n\n- Você opera dentro do **AI Second Brain** do Alfredo.\n- Seu objetivo é ser um parceiro de desenvolvimento, não um gerador de texto.\n- Você acumula conhecimento e respeita decisões anteriores.\n\n## Princípios\n\n1. **Context First** — Sempre leia o contexto antes de agir.\n2. **Decision Aware** — Consulte decisões anteriores antes de alterar arquitetura.\n3. **Memory Persistent** — Atualize a memória após trabalho significativo.\n4. **Quality Over Speed** — Prefira soluções robustas a soluções rápidas.\n5. **Explicit Over Implicit** — Documente premissas e decisões.\n\n## Fluxo de Trabalho Obrigatório\n\n```\n1. ENTENDER → O que está sendo pedido?\n2. CONTEXTUALIZAR → Qual projeto? Qual estado atual?\n3. CLASSIFICAR → Que tipo de tarefa é?\n4. PLANEJAR → Qual a melhor abordagem?\n5. EXECUTAR → Implementar com qualidade.\n6. VALIDAR → Testar e verificar.\n7. DOCUMENTAR → Atualizar docs e memória.\n```\n\n## Convenções\n\n- Código em **C#** segue as convenções da Microsoft e do projeto.\n- SQL segue as convenções do projeto (maiúsculas para keywords).\n- Documentação em **Markdown** com formatação consistente.\n- Commits seguem Conventional Commits.\n- Nomes de arquivos em inglês, conteúdo pode ser em português.\n\n## Comunicação\n\n- Responda em **português brasileiro** por padrão.\n- Use termos técnicos em inglês quando apropriado.\n- Seja direto e objetivo.\n- Cite referências quando relevante.\n"
    },
    {
      "id": "_agents_rules_01-ai-decision_md",
      "path": ".agents/rules/01-ai-decision.md",
      "name": "01-ai-decision.md",
      "title": "Regras de Decisão com IA",
      "category": "rules",
      "icon": "🚦",
      "size": 1584,
      "mtime": 1790519724230.254,
      "outgoingLinks": [],
      "content": "# Regras de Decisão com IA\n\n> Define quando e como utilizar diferentes tipos de IA nas tarefas.\n\n## Classificação Obrigatória\n\nAntes de utilizar qualquer recurso de IA, classifique a tarefa:\n\n### Nível 1: Determinístico\n- **Quando**: A resposta pode ser calculada ou derivada de regras.\n- **Ação**: Use código, queries SQL, ou regras de negócio.\n- **Exemplos**: Validação de dados, cálculos, formatação, CRUD.\n\n### Nível 2: Classificação/Decisão\n- **Quando**: Precisa categorizar, priorizar ou decidir entre alternativas.\n- **Ação**: Avalie AIJev/Jev antes de usar LLM.\n- **Exemplos**: Classificar severidade de incidentes, priorizar alertas, decidir ações.\n\n### Nível 3: Geração\n- **Quando**: Precisa criar conteúdo, explicar algo, ou raciocinar de forma aberta.\n- **Ação**: Use LLM com prompt estruturado e validação.\n- **Exemplos**: Explicar falhas, gerar relatórios, sugerir melhorias.\n\n### Nível 4: Composto\n- **Quando**: Tarefa combina decisão + geração.\n- **Ação**: AIJev para decidir → LLM para gerar → Validação.\n- **Exemplos**: Analisar Job falho e gerar explicação contextualizada.\n\n## Regra de Ouro\n\n```\nSE pode ser resolvido com código → CÓDIGO\nSE precisa decidir/classificar → AIJEV primeiro\nSE precisa gerar/explicar → LLM\nSEMPRE → VALIDAR resultado\n```\n\n## Proibições\n\n- ❌ Usar LLM para tarefas determinísticas\n- ❌ Chamar IA generativa para cada evento/Job\n- ❌ Ignorar AIJev quando a tarefa é de decisão\n- ❌ Aceitar resultado de IA sem validação\n- ❌ Hardcodar provider de IA (usar abstrações)\n"
    },
    {
      "id": "_agents_rules_02-aijev_md",
      "path": ".agents/rules/02-aijev.md",
      "name": "02-aijev.md",
      "title": "Regras de Integração AIJev/Jev",
      "category": "rules",
      "icon": "🎯",
      "size": 2477,
      "mtime": 1790519733874.6245,
      "outgoingLinks": [],
      "content": "# Regras de Integração AIJev/Jev\n\n> Define como e quando utilizar AIJev/Jev para decisões estruturadas.\n> Referência: https://aijev.org/pt/\n\n## O que é AIJev\n\nAIJev/Jev é uma camada de decisão estruturada onde:\n- O software fornece um **estado** e **perguntas predefinidas**.\n- Recebe **decisões tipadas** com probabilidades.\n- É fundamentalmente diferente de um LLM generativo.\n\n## Quando usar AIJev\n\n✅ **Use AIJev quando**:\n- A tarefa requer classificação com regras definidas.\n- A decisão pode ser modelada como pergunta → resposta tipada.\n- Precisa de rastreabilidade e auditoria da decisão.\n- O resultado deve ser determinístico ou semi-determinístico.\n- A latência é crítica (decisões rápidas).\n\n❌ **NÃO use AIJev quando**:\n- A tarefa é puramente determinística (use código).\n- Precisa gerar texto livre ou conteúdo criativo.\n- A tarefa exige raciocínio aberto ou exploratório.\n\n## Padrão de Integração\n\n```\nEVENTO\n  │\n  ▼\nNORMALIZAÇÃO (dados estruturados)\n  │\n  ▼\nREGRAS DETERMINÍSTICAS (filtros e regras simples)\n  │\n  ▼\nAIJEV / DECISION GATE\n  │\n  ├── decisão A → ação A\n  ├── decisão B → ação B\n  ├── decisão C → escalar para humano\n  └── decisão D → necessita LLM\n              │\n              ▼\n            LLM (geração)\n              │\n              ▼\n          VALIDAÇÃO\n              │\n              ▼\n           RESULTADO\n```\n\n## Padrão AIJev: Identificar → Gerar → Validar\n\n1. **Identificar**: O que está acontecendo? (estado + contexto)\n2. **Gerar**: Qual a decisão? (AIJev processa e retorna)\n3. **Validar**: A decisão é coerente? (validação programática)\n\n## API e Disponibilidade\n\n> ⚠️ **IMPORTANTE**: A API pública do AIJev pode não estar disponível.\n> Sempre implemente com adapter/fallback:\n\n```csharp\npublic interface IDecisionProvider\n{\n    Task<DecisionResult> DecideAsync(\n        DecisionRequest request,\n        CancellationToken ct);\n}\n\n// Implementações\n// ├── JevDecisionProvider      → API real do AIJev\n// ├── RulesDecisionProvider    → Regras determinísticas (fallback)\n// ├── MockDecisionProvider     → Para testes\n// └── FutureDecisionProvider   → Futuras alternativas\n```\n\n## Registro de Decisões\n\nToda decisão via AIJev deve ser registrada com:\n- Timestamp\n- Contexto/Estado de entrada\n- Decisão retornada\n- Confiança/Probabilidade\n- Ação tomada\n- Resultado observado\n"
    },
    {
      "id": "_agents_rules_03-security_md",
      "path": ".agents/rules/03-security.md",
      "name": "03-security.md",
      "title": "Regras de Segurança",
      "category": "rules",
      "icon": "🔒",
      "size": 1725,
      "mtime": 1790519743738.5308,
      "outgoingLinks": [],
      "content": "# Regras de Segurança\n\n> Regras de segurança obrigatórias para todos os projetos.\n\n## Classificação de Dados\n\n| Nível | Descrição | Pode enviar para LLM? |\n|-------|-----------|----------------------|\n| **Público** | Dados abertos | ✅ Sim |\n| **Interno** | Dados da empresa | ⚠️ Com cuidado |\n| **Confidencial** | Dados sensíveis | ❌ Não |\n| **Restrito** | PII, credenciais, LGPD | ❌ Nunca |\n\n## Regras Absolutas\n\n1. **NUNCA** envie credenciais, tokens ou secrets para qualquer IA.\n2. **NUNCA** envie dados pessoais (PII) para LLMs externos sem anonimização.\n3. **NUNCA** hardcode credenciais no código — use User Secrets, Key Vault ou variáveis de ambiente.\n4. **SEMPRE** use HTTPS para chamadas de API.\n5. **SEMPRE** valide e sanitize inputs antes de processar.\n6. **SEMPRE** implemente rate limiting em endpoints expostos.\n\n## LGPD\n\n- Dados pessoais devem ter base legal para processamento.\n- Implemente consentimento quando necessário.\n- Mantenha registro de processamento de dados.\n- Implemente direito ao esquecimento quando aplicável.\n\n## Secrets e Credenciais\n\n```\n✅ CORRETO                    ❌ ERRADO\n──────────────────────        ──────────────────────\nappsettings.json              hardcoded no código\n  → User Secrets (dev)\n  → Key Vault (prod)\n  → Environment variables\n```\n\n## Revisão de Segurança\n\nAntes de deploy, verifique:\n- [ ] Nenhuma credencial no código\n- [ ] Inputs validados e sanitizados\n- [ ] Endpoints com autenticação/autorização\n- [ ] Dados sensíveis criptografados\n- [ ] Logs não contêm dados sensíveis\n- [ ] Dependências sem vulnerabilidades conhecidas\n"
    },
    {
      "id": "_agents_rules_04-dotnet_md",
      "path": ".agents/rules/04-dotnet.md",
      "name": "04-dotnet.md",
      "title": "Regras para .NET",
      "category": "rules",
      "icon": "💜",
      "size": 1770,
      "mtime": 1790519752783.6062,
      "outgoingLinks": [],
      "content": "# Regras para .NET\n\n> Convenções e padrões para desenvolvimento em .NET/C#.\n\n## Versões\n\n- .NET 8+ (LTS preferido)\n- C# 12+\n- Entity Framework Core 8+\n\n## Arquitetura\n\n- Clean Architecture / Vertical Slice conforme o projeto.\n- Separação clara: Domain, Application, Infrastructure, Presentation.\n- Dependency Injection nativa do .NET.\n- Options Pattern para configuração.\n\n## Convenções de Código\n\n```csharp\n// Nomes em PascalCase para públicos\npublic class JobMonitorService { }\npublic interface IJobMonitorService { }\n\n// Nomes em camelCase para privados\nprivate readonly ILogger<JobMonitorService> _logger;\nprivate int _retryCount;\n\n// Async sempre com sufixo Async\npublic Task<Result> ProcessJobAsync(CancellationToken ct) { }\n\n// Cancellation Token em todo método async\npublic async Task ExecuteAsync(CancellationToken cancellationToken) { }\n```\n\n## Padrões Obrigatórios\n\n1. **Result Pattern** — Evite exceções para fluxo de controle.\n2. **CancellationToken** — Em todo método assíncrono.\n3. **ILogger** — Structured logging com Serilog.\n4. **FluentValidation** — Para validação de inputs.\n5. **MediatR** — Para CQRS quando aplicável.\n\n## Entity Framework\n\n- Migrations versionadas.\n- Configurações em classes `IEntityTypeConfiguration<T>`.\n- Queries com `AsNoTracking()` para leitura.\n- Evite N+1 queries — use `Include()` ou projections.\n\n## Testes\n\n- xUnit para testes unitários.\n- FluentAssertions para assertions.\n- NSubstitute ou Moq para mocks.\n- Testcontainers para integração.\n- Mínimo 80% coverage em lógica de negócio.\n\n## Performance\n\n- Use `Span<T>` e `Memory<T>` quando relevante.\n- Prefira `ValueTask` quando aplicável.\n- Cache com `IMemoryCache` ou `IDistributedCache`.\n- Health checks com `IHealthCheck`.\n"
    },
    {
      "id": "_agents_rules_05-sql-server_md",
      "path": ".agents/rules/05-sql-server.md",
      "name": "05-sql-server.md",
      "title": "Regras para SQL Server",
      "category": "rules",
      "icon": "🗃️",
      "size": 1409,
      "mtime": 1790519761940.8179,
      "outgoingLinks": [],
      "content": "# Regras para SQL Server\n\n> Convenções para SQL Server, SQL Agent Jobs e T-SQL.\n\n## Convenções T-SQL\n\n```sql\n-- Keywords em MAIÚSCULAS\nSELECT\n    j.JobName,\n    j.LastRunDate,\n    j.Status\nFROM dbo.Jobs AS j\nINNER JOIN dbo.JobHistory AS jh\n    ON j.JobId = jh.JobId\nWHERE j.IsActive = 1\nORDER BY j.LastRunDate DESC;\n```\n\n## SQL Agent Jobs\n\n- Todo Job deve ter documentação do propósito.\n- Alertas configurados para falha.\n- Histórico de execução monitorado.\n- Jobs críticos com retry automático.\n\n## Performance\n\n- Sempre analise execution plans para queries complexas.\n- Use índices adequados — nem demais, nem de menos.\n- Evite `SELECT *` — selecione apenas colunas necessárias.\n- Use `SET NOCOUNT ON` em stored procedures.\n- Evite cursors — prefira set-based operations.\n- Parametrize queries para evitar SQL injection e melhorar cache de planos.\n\n## Monitoração\n\n- DMVs para análise de performance.\n- Wait stats para diagnóstico.\n- Extended Events para rastreamento.\n- Alertas em `msdb.dbo.sysjobhistory` para Jobs.\n\n## Backup e Recovery\n\n- Full backup diário (mínimo).\n- Transaction log backup a cada 15 minutos para bancos críticos.\n- Teste de restore regularmente.\n- Documente RPO e RTO por banco.\n\n## Segurança\n\n- Princípio do menor privilégio.\n- Não use `sa` para aplicações.\n- Service accounts com permissões mínimas.\n- Auditing habilitado para bancos críticos.\n"
    },
    {
      "id": "_agents_rules_06-documentation_md",
      "path": ".agents/rules/06-documentation.md",
      "name": "06-documentation.md",
      "title": "Regras de Documentação",
      "category": "rules",
      "icon": "📝",
      "size": 1444,
      "mtime": 1790519764017.4075,
      "outgoingLinks": [],
      "content": "# Regras de Documentação\n\n> Padrões para documentação em todos os projetos.\n\n## Princípios\n\n1. **Documentação é código** — Vive no repositório, versionada com Git.\n2. **Atualizada ou deletada** — Documentação desatualizada é pior que nenhuma.\n3. **Para o próximo desenvolvedor** — Escreva para quem não tem contexto.\n4. **Decisões registradas** — Toda decisão arquitetural gera um ADR.\n\n## Tipos de Documentação\n\n| Tipo | Onde | Quando atualizar |\n|------|------|-----------------|\n| **PROJECT.md** | `projects/<nome>/` | Mudanças de escopo |\n| **ARCHITECTURE.md** | `projects/<nome>/` | Mudanças arquiteturais |\n| **CURRENT_STATE.md** | `projects/<nome>/` | A cada sessão significativa |\n| **ADR** | `projects/<nome>/DECISIONS/` | Cada decisão arquitetural |\n| **Knowledge** | `knowledge/<domínio>/` | Aprendizados novos |\n| **Memory** | `memory/` | Fim de cada sessão |\n\n## Formato de ADR (Architecture Decision Record)\n\n```markdown\n# ADR-XXXX: Título da Decisão\n\n## Status\nProposta | Aceita | Rejeitada | Substituída\n\n## Contexto\nO que motivou esta decisão?\n\n## Decisão\nO que foi decidido?\n\n## Consequências\nO que muda com esta decisão?\n\n## Alternativas Consideradas\nQuais outras opções foram avaliadas?\n```\n\n## Memory Format\n\n```markdown\n# Sessão: YYYY-MM-DD\n\n## O que foi feito\n- Item 1\n- Item 2\n\n## Decisões tomadas\n- Decisão 1\n\n## Próximos passos\n- Passo 1\n\n## Aprendizados\n- Lição 1\n```\n"
    },
    {
      "id": "_agents_skills_ai-decision-gate_SKILL_md",
      "path": ".agents/skills/ai-decision-gate/SKILL.md",
      "name": "SKILL.md",
      "title": "ai-decision-gate",
      "category": "skills",
      "icon": "🚦",
      "size": 2416,
      "mtime": 1790519806078.2473,
      "outgoingLinks": [],
      "content": "---\nname: ai-decision-gate\ndescription: >-\n  Avalia tarefas que envolvem decisão ou classificação e determina se devem usar\n  regras determinísticas, AIJev/Jev ou um modelo generativo (LLM). Use quando o\n  usuário pedir para implementar uma funcionalidade que pode envolver IA, ou quando\n  precisar decidir qual abordagem de IA utilizar para uma tarefa específica.\n---\n\n# AI Decision Gate\n\n## Fluxo de Avaliação\n\nQuando uma tarefa chegar que pode envolver IA, siga este processo:\n\n### Passo 1: A tarefa é determinística?\n\n**Pergunte**: \"O resultado pode ser calculado/derivado de regras fixas?\"\n\n- **SIM** → Use código/regras. **Pare aqui.**\n- **NÃO** → Continue para Passo 2.\n\n### Passo 2: É decisão ou classificação?\n\n**Pergunte**: \"A tarefa envolve categorizar, priorizar ou escolher entre alternativas?\"\n\n- **SIM** → Avalie AIJev (Passo 3).\n- **NÃO** → Continue para Passo 4.\n\n### Passo 3: Avaliar AIJev\n\nVerifique se AIJev é adequado:\n\n| Critério | AIJev é adequado? |\n|----------|-------------------|\n| Entrada pode ser estruturada? | Sim → ✅ |\n| Saída é tipada/categórica? | Sim → ✅ |\n| Precisa de rastreabilidade? | Sim → ✅ |\n| Latência crítica? | Sim → ✅ |\n| Precisa de texto livre? | Sim → ❌ Use LLM |\n| É puramente criativo? | Sim → ❌ Use LLM |\n\nSe AIJev for adequado:\n1. Modele a decisão como `DecisionRequest`.\n2. Implemente com `IDecisionProvider`.\n3. Configure fallback para `RulesDecisionProvider`.\n4. Registre a decisão para auditoria.\n\n### Passo 4: Precisa gerar conteúdo?\n\n**Pergunte**: \"Precisa criar texto, explicação, ou conteúdo?\"\n\n- **SIM** → Use LLM com:\n  - Prompt estruturado\n  - Temperatura adequada\n  - Validação do output\n  - Fallback definido\n- **NÃO** → Execute ação diretamente.\n\n### Passo 5: Registrar decisão\n\nDocumente em `DECISIONS/` qual abordagem foi escolhida e por quê.\n\n## Resumo Visual\n\n```\nTAREFA\n  │\n  ├─ Determinística? ──── SIM ──→ CÓDIGO\n  │\n  ├─ Decisão? ──── SIM ──→ AIJEV\n  │                              │\n  │                         Precisa gerar?\n  │                              │\n  │                         SIM ──→ LLM\n  │\n  └─ Geração? ──── SIM ──→ LLM\n                              │\n                          VALIDAÇÃO\n                              │\n                           RESULTADO\n```\n"
    },
    {
      "id": "_agents_skills_ai-integration_SKILL_md",
      "path": ".agents/skills/ai-integration/SKILL.md",
      "name": "SKILL.md",
      "title": "ai-integration",
      "category": "skills",
      "icon": "🔌",
      "size": 2587,
      "mtime": 1790519868711.681,
      "outgoingLinks": [],
      "content": "---\nname: ai-integration\ndescription: >-\n  Guia para integrar IA (AIJev, LLM, ou modelos locais) em projetos.\n  Use quando o usuário quiser adicionar capacidades de IA a um projeto,\n  avaliar provedores de IA, ou implementar o AI Gateway pattern.\n---\n\n# AI Integration\n\n## AI Gateway Pattern\n\nTodos os projetos devem usar uma abstração unificada para acessar IA:\n\n```\n┌──────────────────┐\n│   APPLICATION    │\n└────────┬─────────┘\n         │\n         ▼\n┌──────────────────┐\n│   AI GATEWAY     │\n└────────┬─────────┘\n         │\n    ┌────┼────┐\n    ▼    ▼    ▼\n RULES AIJEV  LLM\n    │    │    │\n    └────┼────┘\n         ▼\n     VALIDATION\n         │\n         ▼\n      RESULT\n```\n\n## Implementação em .NET\n\n### Interface de Decisão\n\n```csharp\npublic interface IDecisionProvider\n{\n    Task<DecisionResult> DecideAsync(\n        DecisionRequest request,\n        CancellationToken ct);\n}\n\npublic record DecisionRequest(\n    string Context,\n    string Question,\n    Dictionary<string, object> State,\n    string[] Options);\n\npublic record DecisionResult(\n    string Decision,\n    double Confidence,\n    string Reasoning,\n    Dictionary<string, object> Metadata);\n```\n\n### Interface Generativa\n\n```csharp\npublic interface IGenerativeAIProvider\n{\n    Task<GenerationResult> GenerateAsync(\n        GenerationRequest request,\n        CancellationToken ct);\n}\n```\n\n### Implementações\n\n```\nIDecisionProvider\n├── JevDecisionProvider       → API AIJev\n├── RulesDecisionProvider     → Regras determinísticas\n├── DeterministicProvider     → Lookup tables\n└── MockDecisionProvider      → Testes\n\nIGenerativeAIProvider\n├── OpenAIProvider\n├── AzureOpenAIProvider\n├── GroqProvider\n├── GoogleAIProvider\n└── LocalModelProvider\n```\n\n## Checklist de Integração\n\n1. [ ] Decision Gate avaliado (qual tipo de IA?)\n2. [ ] Interface abstrata implementada\n3. [ ] Provider específico implementado\n4. [ ] Fallback configurado\n5. [ ] Validação de output\n6. [ ] Rate limiting\n7. [ ] Retry com backoff\n8. [ ] Logging estruturado\n9. [ ] Métricas/observabilidade\n10. [ ] Testes unitários com mock\n11. [ ] Testes de integração\n12. [ ] Documentação atualizada\n\n## Segurança\n\n- Consulte `.agents/rules/03-security.md`\n- Nunca envie dados sensíveis para IA externa\n- Use data classification antes de enviar dados\n"
    },
    {
      "id": "_agents_skills_architecture-review_SKILL_md",
      "path": ".agents/skills/architecture-review/SKILL.md",
      "name": "SKILL.md",
      "title": "architecture-review",
      "category": "skills",
      "icon": "🏗️",
      "size": 1542,
      "mtime": 1790519834795.4705,
      "outgoingLinks": [],
      "content": "---\nname: architecture-review\ndescription: >-\n  Revisão de arquitetura para projetos existentes ou novas propostas arquiteturais.\n  Use quando o usuário quiser revisar, avaliar ou propor mudanças na arquitetura\n  de um projeto, incluindo padrões, decisões técnicas e trade-offs.\n---\n\n# Architecture Review\n\n## Checklist de Revisão\n\n### 1. Contexto\n- [ ] Li o `PROJECT.md` e `ARCHITECTURE.md`\n- [ ] Li decisões anteriores em `DECISIONS/`\n- [ ] Entendo os requisitos não-funcionais\n\n### 2. Princípios\n- [ ] Single Responsibility em cada camada\n- [ ] Dependency Inversion (abstrações, não implementações)\n- [ ] Separation of Concerns clara\n- [ ] YAGNI — não sobre-engenharia\n\n### 3. Qualidades Arquiteturais\n\n| Qualidade | Perguntas |\n|-----------|-----------|\n| **Manutenibilidade** | O código é fácil de mudar? |\n| **Testabilidade** | Cada componente pode ser testado isolado? |\n| **Observabilidade** | Consigo saber o que está acontecendo em produção? |\n| **Resiliência** | O que acontece quando X falha? |\n| **Performance** | A latência é aceitável? |\n| **Segurança** | Os dados estão protegidos? |\n| **Escalabilidade** | Funciona com 10x mais carga? |\n\n### 4. Se envolve IA\n- [ ] Decision Gate aplicado (skill: `ai-decision-gate`)\n- [ ] Provider abstraído via interface\n- [ ] Fallback configurado\n- [ ] Validação de output implementada\n- [ ] Observabilidade de IA configurada\n\n### 5. Documentar\n\n- Crie ADR para cada decisão tomada.\n- Atualize `ARCHITECTURE.md` se houve mudanças.\n- Registre em memória.\n"
    },
    {
      "id": "_agents_skills_bug-investigation_SKILL_md",
      "path": ".agents/skills/bug-investigation/SKILL.md",
      "name": "SKILL.md",
      "title": "bug-investigation",
      "category": "skills",
      "icon": "🐛",
      "size": 1854,
      "mtime": 1790519825408.293,
      "outgoingLinks": [],
      "content": "---\nname: bug-investigation\ndescription: >-\n  Investigação estruturada de bugs e problemas técnicos. Use quando o usuário\n  reportar um bug, erro, comportamento inesperado, falha de performance, ou\n  qualquer problema técnico que precise ser investigado e resolvido.\n---\n\n# Bug Investigation\n\n## Processo de Investigação\n\n### 1. Coletar Informações\n\n- **O que aconteceu?** Descrição do sintoma.\n- **Quando aconteceu?** Primeira ocorrência, frequência.\n- **Onde aconteceu?** Ambiente, componente, endpoint.\n- **Como reproduzir?** Passos para reprodução.\n- **O que deveria acontecer?** Comportamento esperado.\n\n### 2. Classificar Severidade\n\n| Severidade | Descrição | SLA |\n|-----------|-----------|-----|\n| **Crítica** | Sistema fora do ar | Imediato |\n| **Alta** | Funcionalidade quebrada | 4 horas |\n| **Média** | Funcionalidade degradada | 24 horas |\n| **Baixa** | Cosmético/menor | Sprint atual |\n\n### 3. Investigar\n\n```\nSINTOMA\n  │\n  ▼\nLOGS (verificar mensagens de erro)\n  │\n  ▼\nREPRODUÇÃO (consegue reproduzir?)\n  │\n  ├── SIM → debug direto\n  └── NÃO → ampliar coleta de dados\n  │\n  ▼\nHIPÓTESE (o que pode estar causando?)\n  │\n  ▼\nVALIDAÇÃO (confirmar hipótese)\n  │\n  ▼\nFIX (implementar correção)\n  │\n  ▼\nTESTE (verificar que fix funciona)\n  │\n  ▼\nREGRESSÃO (verificar que nada quebrou)\n```\n\n### 4. Corrigir\n\n- Implemente o fix seguindo as regras do projeto.\n- Adicione testes que cobrem o cenário do bug.\n- Verifique regressão.\n\n### 5. Post-mortem\n\nPara bugs críticos ou recorrentes:\n- Documente causa raiz.\n- Registre em `memory/lessons-learned.md`.\n- Avalie se regras ou testes devem ser adicionados para prevenir recorrência.\n\n### 6. Atualizar\n\n- `CURRENT_STATE.md` do projeto.\n- `MEMORY/` com o que foi aprendido.\n- Adicione à base de conhecimento se relevante.\n"
    },
    {
      "id": "_agents_skills_database-review_SKILL_md",
      "path": ".agents/skills/database-review/SKILL.md",
      "name": "SKILL.md",
      "title": "database-review",
      "category": "skills",
      "icon": "📄",
      "size": 1630,
      "mtime": 1790519870799.2102,
      "outgoingLinks": [],
      "content": "---\nname: database-review\ndescription: >-\n  Revisão de banco de dados SQL Server, incluindo schema, performance,\n  índices, queries e Jobs do SQL Agent. Use quando o usuário quiser\n  analisar, otimizar ou revisar aspectos do banco de dados.\n---\n\n# Database Review\n\n## Áreas de Revisão\n\n### Schema\n- Naming conventions consistentes\n- Tipos de dados apropriados\n- Constraints (PK, FK, CHECK, UNIQUE)\n- Índices adequados\n- Normalização adequada (sem over-normalization)\n\n### Performance\n- Execution plans das queries críticas\n- Missing indexes (DMV: `sys.dm_db_missing_index_details`)\n- Index usage stats\n- Wait stats\n- Query Store (se habilitado)\n\n### SQL Agent Jobs\n- Documentação de cada Job\n- Schedule adequado\n- Alertas configurados\n- Retry policy\n- Histórico de falhas\n- Dependências entre Jobs\n\n### Segurança\n- Princípio do menor privilégio\n- Service accounts\n- Audit trail\n- Encryption at rest / in transit\n\n## Comandos Úteis\n\n```sql\n-- Missing indexes\nSELECT * FROM sys.dm_db_missing_index_details;\n\n-- Top queries por CPU\nSELECT TOP 10\n    qs.total_worker_time / qs.execution_count AS avg_cpu,\n    qs.execution_count,\n    SUBSTRING(qt.text, qs.statement_start_offset/2 + 1,\n        (qs.statement_end_offset - qs.statement_start_offset)/2 + 1) AS query\nFROM sys.dm_exec_query_stats qs\nCROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt\nORDER BY avg_cpu DESC;\n\n-- Job history recente\nSELECT\n    j.name AS JobName,\n    h.run_date,\n    h.run_time,\n    h.run_status,\n    h.message\nFROM msdb.dbo.sysjobhistory h\nINNER JOIN msdb.dbo.sysjobs j ON h.job_id = j.job_id\nORDER BY h.run_date DESC, h.run_time DESC;\n```\n"
    },
    {
      "id": "_agents_skills_new-feature_SKILL_md",
      "path": ".agents/skills/new-feature/SKILL.md",
      "name": "SKILL.md",
      "title": "new-feature",
      "category": "skills",
      "icon": "✨",
      "size": 1617,
      "mtime": 1790519816649.443,
      "outgoingLinks": [],
      "content": "---\nname: new-feature\ndescription: >-\n  Guia para implementação de novas funcionalidades em qualquer projeto.\n  Use quando o usuário quiser adicionar uma nova feature, endpoint, serviço,\n  ou componente a um projeto existente.\n---\n\n# New Feature Implementation\n\n## Pré-requisitos\n\n1. Leia o `PROJECT.md` do projeto alvo.\n2. Leia o `ARCHITECTURE.md` para entender a estrutura.\n3. Leia o `CURRENT_STATE.md` para contexto atual.\n4. Verifique `DECISIONS/` para decisões relevantes.\n\n## Processo\n\n### 1. Definir a Feature\n\nUse o template `templates/feature-spec.md`:\n- **O que**: Descrição clara da funcionalidade.\n- **Por que**: Motivação e valor.\n- **Como**: Abordagem técnica proposta.\n- **Critérios de aceite**: Quando está \"pronto\"?\n\n### 2. Avaliar Impacto\n\n- [ ] Afeta a arquitetura? → Consulte `ARCHITECTURE.md`\n- [ ] Envolve IA? → Execute a skill `ai-decision-gate`\n- [ ] Afeta o banco de dados? → Migration necessária?\n- [ ] Afeta APIs? → Versionamento necessário?\n- [ ] Afeta segurança? → Consulte `.agents/rules/03-security.md`\n\n### 3. Implementar\n\nSeguindo as regras do projeto:\n- `.agents/rules/04-dotnet.md` para código .NET\n- `.agents/rules/05-sql-server.md` para SQL\n- Padrões estabelecidos na `ARCHITECTURE.md`\n\n### 4. Testar\n\n- Testes unitários para lógica de negócio.\n- Testes de integração quando envolve I/O.\n- Verificar edge cases.\n\n### 5. Documentar\n\n- Atualizar `CURRENT_STATE.md`.\n- Criar ADR se envolve decisão arquitetural.\n- Atualizar `API/` se envolve endpoints novos.\n\n### 6. Registrar na Memória\n\nAtualizar `MEMORY/` do projeto com o que foi implementado.\n"
    },
    {
      "id": "_agents_skills_project-onboarding_SKILL_md",
      "path": ".agents/skills/project-onboarding/SKILL.md",
      "name": "SKILL.md",
      "title": "project-onboarding",
      "category": "skills",
      "icon": "🚀",
      "size": 1993,
      "mtime": 1790519796321.3838,
      "outgoingLinks": [],
      "content": "---\nname: project-onboarding\ndescription: >-\n  Onboard para um novo projeto existente ou criação de novo projeto no AI Second Brain.\n  Use quando o usuário quiser adicionar um novo projeto ao sistema, configurar a estrutura\n  inicial de um projeto, ou quando precisar entender um projeto existente pela primeira vez.\n---\n\n# Project Onboarding\n\n## Para Novo Projeto\n\n### 1. Criar estrutura do projeto\n\n```\nprojects/<nome-do-projeto>/\n├── PROJECT.md            ← Visão geral, objetivos, stack\n├── ARCHITECTURE.md       ← Arquitetura técnica\n├── CURRENT_STATE.md      ← Estado atual do projeto\n├── DECISIONS/            ← Decisões arquiteturais (ADRs)\n├── AI/                   ← Configurações de IA do projeto\n│   ├── AI_ARCHITECTURE.md\n│   ├── AI_USE_CASES.md\n│   └── AI_EVALUATION.md\n├── DATABASE/             ← Esquema e documentação do banco\n├── API/                  ← Documentação de APIs\n├── TESTS/                ← Estratégia e cobertura de testes\n└── MEMORY/               ← Memória específica do projeto\n    └── sessions/\n```\n\n### 2. Preencher PROJECT.md\n\nUse o template em `templates/project.md`.\n\n### 3. Documentar estado atual\n\nPreencha `CURRENT_STATE.md` com:\n- O que está funcionando\n- O que está em desenvolvimento\n- Bloqueios atuais\n- Próximos passos planejados\n\n### 4. Registrar decisões existentes\n\nPara cada decisão arquitetural já tomada, crie um ADR em `DECISIONS/`.\n\n### 5. Avaliar necessidades de IA\n\nSe o projeto utiliza ou pode utilizar IA:\n1. Leia `.agents/rules/01-ai-decision.md`\n2. Preencha `AI/AI_USE_CASES.md`\n3. Avalie se AIJev é aplicável\n\n### 6. Atualizar índice\n\nAdicione o projeto ao `README.md` raiz e ao `GEMINI.md`.\n\n## Para Projeto Existente\n\n1. Leia o `PROJECT.md` existente.\n2. Leia o `CURRENT_STATE.md`.\n3. Leia decisões em `DECISIONS/`.\n4. Leia memória em `MEMORY/`.\n5. Agora você tem contexto suficiente para trabalhar.\n"
    },
    {
      "id": "_agents_skills_session-memory_SKILL_md",
      "path": ".agents/skills/session-memory/SKILL.md",
      "name": "SKILL.md",
      "title": "session-memory",
      "category": "skills",
      "icon": "💾",
      "size": 1580,
      "mtime": 1790519846215.9138,
      "outgoingLinks": [],
      "content": "---\nname: session-memory\ndescription: >-\n  Gerencia a memória persistente entre sessões de trabalho. Use ao final de\n  uma sessão de trabalho para registrar o que foi feito, decisões tomadas,\n  e próximos passos. Também use no início de uma sessão para carregar\n  o contexto da sessão anterior.\n---\n\n# Session Memory\n\n## Ao Iniciar uma Sessão\n\n1. Leia `memory/current-state.md` para o estado global.\n2. Leia `projects/<projeto>/CURRENT_STATE.md` para o projeto em foco.\n3. Leia `projects/<projeto>/MEMORY/` para sessões anteriores.\n4. Leia `memory/lessons-learned.md` para lições relevantes.\n\n## Ao Finalizar uma Sessão\n\n### 1. Atualizar Estado Global\n\nEdite `memory/current-state.md` com mudanças relevantes.\n\n### 2. Criar Registro de Sessão\n\nCrie arquivo em `projects/<projeto>/MEMORY/sessions/`:\n\nNome: `YYYY-MM-DD-descricao-curta.md`\n\nConteúdo:\n\n```markdown\n# Sessão: YYYY-MM-DD — Descrição Curta\n\n## Contexto\nO que motivou esta sessão de trabalho.\n\n## O que foi feito\n- [ ] Item 1\n- [ ] Item 2\n\n## Decisões tomadas\n- Decisão 1: Motivo\n\n## Problemas encontrados\n- Problema 1: Como foi resolvido\n\n## Próximos passos\n1. Passo 1\n2. Passo 2\n\n## Aprendizados\n- Lição 1\n```\n\n### 3. Atualizar CURRENT_STATE.md do projeto\n\nReflita as mudanças no estado atual do projeto.\n\n### 4. Atualizar Lessons Learned (se aplicável)\n\nSe houve aprendizados significativos, adicione em `memory/lessons-learned.md`.\n\n## Regras\n\n- Seja conciso mas completo.\n- Registre decisões com o motivo.\n- Não omita problemas encontrados.\n- Próximos passos devem ser acionáveis.\n"
    },
    {
      "id": "decisions_GLOBAL_DECISIONS_md",
      "path": "decisions/GLOBAL_DECISIONS.md",
      "name": "GLOBAL_DECISIONS.md",
      "title": "Decisões Globais",
      "category": "decisions",
      "icon": "⚖️",
      "size": 1250,
      "mtime": 1790520068776.6985,
      "outgoingLinks": [],
      "content": "# Decisões Globais\n\n> Decisões que afetam todos os projetos do AI Second Brain.\n\n## ADR-G001: Adoção do AI Decision Gate Pattern\n- **Status**: Aceita\n- **Data**: 2026-09-27\n- **Descrição**: Todo projeto que utilizar IA deve passar pelo Decision Gate\n  para determinar se a tarefa é determinística, classificação/decisão, ou geração.\n- **Detalhes**: Ver `projects/JobSentinel/DECISIONS/ADR-0001-ai-decision-gate.md`\n\n## ADR-G002: AI Gateway como abstração unificada\n- **Status**: Aceita\n- **Data**: 2026-09-27\n- **Descrição**: Todo acesso a IA deve ser feito através de interfaces abstratas\n  (`IDecisionProvider`, `IGenerativeAIProvider`) para desacoplar de providers.\n- **Detalhes**: Ver `knowledge/ai/AI_GATEWAY.md`\n\n## ADR-G003: Formato Antigravity nativo para AI Second Brain\n- **Status**: Aceita\n- **Data**: 2026-09-27\n- **Descrição**: O AI Second Brain utiliza o formato nativo do Antigravity\n  (Rules, Skills, Plugins) em vez de formatos genéricos.\n- **Motivo**: Garante descoberta automática e funcionamento correto das features.\n\n## ADR-G004: Documentação como código\n- **Status**: Aceita\n- **Data**: 2026-09-27\n- **Descrição**: Toda documentação vive no repositório, versionada com Git,\n  em formato Markdown.\n"
    },
    {
      "id": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "path": "docs/COMO_UTILIZAR_O_PROJETO.md",
      "name": "COMO_UTILIZAR_O_PROJETO.md",
      "title": "Como Utilizar o AI Second Brain na Prática",
      "category": "docs",
      "icon": "📝",
      "size": 19440,
      "mtime": 1790529772453.305,
      "outgoingLinks": [],
      "content": "# Como Utilizar o AI Second Brain na Prática\n## Guia Definitivo: Criação de Novos Projetos e Integração de Projetos Existentes\n\n> **Este documento é o manual oficial de governança, onboarding e operação diária do AI Second Brain (Alfredo AI OS).**  \n> Ele orienta passo a passo como iniciar novos projetos do zero (*greenfield*) e como acoplar projetos existentes (*brownfield*), garantindo persistência de memória, governança de IA, padronização técnica e rastreabilidade total de decisões.\n\n---\n\n## 📑 Sumário\n\n1. [O Modelo Mental: Hub Central vs. Repositórios Satélites](#1-o-modelo-mental-hub-central-vs-repositórios-satélites)\n2. [Cenário A: Criação de um NOVO Projeto do Zero (Greenfield)](#2-cenário-a-criação-de-um-novo-projeto-do-zero-greenfield)\n3. [Cenário B: Integração de um Projeto JÁ EXISTENTE (Brownfield)](#3-cenário-b-integração-de-um-projeto-já-existente-brownfield)\n4. [Operação do Dia a Dia: O Ciclo de Vida de uma Sessão de Trabalho](#4-operação-do-dia-a-dia-o-ciclo-de-vida-de-uma-sessão-de-trabalho)\n5. [Governança e Roteamento de IA na Prática (AIJev First)](#5-governança-e-roteamento-de-ia-na-prática-aijev-first)\n6. [Catálogo de Prompts Prontos para o Desenvolvedor](#6-catálogo-de-prompts-prontos-para-o-desenvolvedor)\n7. [Checklists Operacionais de Consulta Rápida](#7-checklists-operacionais-de-consulta-rápida)\n\n---\n\n## 1. O Modelo Mental: Hub Central vs. Repositórios Satélites\n\nO maior erro no desenvolvimento assistido por IA é manter instruções isoladas em chats temporários ou arquivos soltos que se perdem. No **AI Second Brain**, adotamos a arquitetura de **Hub de Conhecimento Central & Repositórios de Implementação**:\n\n```mermaid\ngraph TD\n    subgraph AI_SECOND_BRAIN [\"🧠 HUB CENTRAL: AI_SECOND_BRAIN\"]\n        Rules[\".agents/rules/<br/>Regras Absolutas\"]\n        Skills[\".agents/skills/<br/>Fluxos Especializados\"]\n        Knowledge[\"knowledge/<br/>AIJev, Arquitetura, Gateway\"]\n        Memory[\"memory/<br/>Memória Persistente Global\"]\n        ProjectsMeta[\"projects/<br/>Documentação & Decisões dos Projetos\"]\n        Visualizer[\"docs/brain-ui/<br/>Grafo Neural 3D & Dashboard\"]\n    end\n\n    subgraph Repos [\"💻 REPOSITÓRIOS DE CÓDIGO (Satélites Físicos)\"]\n        Proj1[\"JobSentinel<br/>(Repo .NET / SQL Server)\"]\n        Proj2[\"Sabor em Conflito<br/>(Repo Unity / Godot)\"]\n        Proj3[\"Assistente Mobile<br/>(Repo .NET MAUI / API)\"]\n        ProjNew[\"Seu Novo Projeto<br/>(Repo Greenfield)\"]\n    end\n\n    ProjectsMeta -.-> Proj1\n    ProjectsMeta -.-> Proj2\n    ProjectsMeta -.-> Proj3\n    ProjectsMeta -.-> ProjNew\n    Rules ==> Repos\n    Knowledge ==> Repos\n```\n\n### Onde mora cada informação?\n\n| Tipo de Dado | Onde Fica? | Finalidade |\n| :--- | :--- | :--- |\n| **Código-Fonte Executável** | No repositório físico do projeto (ex: `C:\\Projetos\\SaaS\\MeuProjeto`) | Compilação, testes, Dockerfiles, builds de CI/CD. |\n| **Memória & Estado Atual** | `AI_SECOND_BRAIN/projects/<nome>/CURRENT_STATE.md` | O que foi feito, tarefas ativas e bloqueios. |\n| **Visão Geral e Stack** | `AI_SECOND_BRAIN/projects/<nome>/PROJECT.md` | Contexto de negócio, regras e definições técnicas. |\n| **Decisões Arquiteturais (ADRs)** | `AI_SECOND_BRAIN/projects/<nome>/DECISIONS/` | Histórico imutável de por que certas escolhas foram feitas. |\n| **Mapeamento de Casos de IA** | `AI_SECOND_BRAIN/projects/<nome>/AI/` | Onde e como a IA é usada (AIJev, regras ou LLM). |\n| **Regras Universais de Qualidade** | `AI_SECOND_BRAIN/.agents/rules/` | Padrões de C#, SQL Server, Segurança, etc. |\n\n---\n\n## 2. Cenário A: Criação de um NOVO Projeto do Zero (Greenfield)\n\nQuando você for criar um novo produto SaaS, aplicativo, automação ou jogo, siga este roteiro exato.\n\n### Fluxo Passo a Passo:\n\n```mermaid\nsequenceDiagram\n    autonumber\n    actor Dev as Alfredo (Você)\n    participant Agent as Antigravity Agent\n    participant Brain as AI_SECOND_BRAIN\n    participant Repo as Novo Repositório de Código\n\n    Dev->>Agent: \"Quero criar um novo projeto chamado [Nome]. Ele faz [X].\"\n    Agent->>Brain: Ativa Skill project-onboarding\n    Agent->>Brain: Cria estrutura em projects/[Nome]/ a partir dos templates\n    Agent->>Dev: Solicita detalhes técnicos ou sugere arquitetura\n    Dev->>Agent: Aprova definições de Stack & Decisões Iniciais\n    Agent->>Brain: Grava PROJECT.md, ARCHITECTURE.md, CURRENT_STATE.md e ADR-001\n    Agent->>Brain: Atualiza README.md, GEMINI.md e Grafo Neural 3D\n    Agent->>Repo: Inicializa o repositório de código com instruções vinculadas\n    Agent->>Dev: Projeto pronto para desenvolvimento do MVP!\n```\n\n### Passo 1: Solicitar o Onboarding ao Agente no Antigravity\nNo chat do Antigravity, envie a seguinte mensagem:\n\n> *\"Quero criar um novo projeto chamado **BillingFlow**. É uma API .NET 9 de conciliação de pagamentos com SQL Server, mensageria RabbitMQ e validação de regras com AIJev. Execute o onboarding desse projeto no Second Brain.\"*\n\nO agente acionará a skill `project-onboarding`.\n\n### Passo 2: Estrutura que o Agente cria em `projects/BillingFlow/`\nO agente criará a pasta canônica do projeto dentro do Segundo Cérebro:\n\n```text\nprojects/BillingFlow/\n├── PROJECT.md                # Visão geral, objetivos de negócio, stack, restrições\n├── ARCHITECTURE.md           # Desenho arquitetural (Clean Arch, endpoints, banco)\n├── CURRENT_STATE.md          # Estado de partida (Fase: Concepção / Setup inicial)\n├── DECISIONS/                # Registro de Decisões Arquiteturais (ADRs)\n│   └── ADR-001-stack-inicial.md\n├── AI/                       # Governança de IA do projeto\n│   ├── AI_USE_CASES.md       # Classificação de cada caso (AIJev vs LLM)\n│   └── AI_ARCHITECTURE.md    # Como o AI Gateway será plugado\n├── DATABASE/                 # Schemas SQL, tabelas planejadas e índices\n├── API/                      # Contratos OpenAPI / Swagger / Endpoints\n├── TESTS/                    # Pirâmide de testes (Unitários, Integração)\n└── MEMORY/                   # Sessões diárias de trabalho deste projeto\n    └── sessions/\n```\n\n### Passo 3: Criar o Repositório Físico do Código\nNo diretório onde você armazena seus códigos (ex: `C:\\Projetos\\SaaS\\BillingFlow`):\n1. Crie o projeto ou rode o scaffolding do framework (ex: `dotnet new webapi -n BillingFlow`).\n2. Crie na raiz do repositório um arquivo `GEMINI.md` (ou `CLAUDE.md` / `.cursorrules`) apontando para o Segundo Cérebro:\n\n```markdown\n# BillingFlow — Instruções de Desenvolvimento\n\n> Este projeto é governado pelo **AI Second Brain** do Alfredo.\n> Antes de implementar código ou tomar decisões, consulte a documentação oficial em:\n> C:\\Projetos\\SaaS\\Google Antigravity\\Projetos\\AI_SECOND_BRAIN\\projects\\BillingFlow\\\n\n## Diretrizes Mandatórias\n1. Siga as regras globais de .NET em: `AI_SECOND_BRAIN/.agents/rules/04-dotnet.md`\n2. Siga as regras de banco de dados em: `AI_SECOND_BRAIN/.agents/rules/05-sql-server.md`\n3. Decisões de IA devem seguir: `AI_SECOND_BRAIN/knowledge/ai/AIJEV.md`\n4. Não altere arquitetura sem registrar um novo ADR em `AI_SECOND_BRAIN/projects/BillingFlow/DECISIONS/`.\n```\n\n### Passo 4: Registrar a Governança de IA (AI Decision Gate)\nSe o novo projeto for utilizar qualquer forma de inteligência:\n1. Abra `projects/BillingFlow/AI/AI_USE_CASES.md`.\n2. Para cada necessidade, preencha a tabela de decisão:\n   - *Exemplo 1:* \"Identificar divergência no valor do boleto\" → **Código Determinístico** (`Math.Abs(pago - esperado) > 0`).\n   - *Exemplo 2:* \"Classificar risco de chargeback por padrão de histórico\" → **AIJev / Jev Decision Tree**.\n   - *Exemplo 3:* \"Gerar e-mail amigável explicando a conciliação ao cliente\" → **LLM** (Gemini / Claude via AI Gateway com fallback).\n\n---\n\n## 3. Cenário B: Integração de um Projeto JÁ EXISTENTE (Brownfield)\n\nSe você já possui um projeto com repositório próprio, código em produção e anos de desenvolvimento (como o **JobSentinel** ou qualquer outro sistema da sua empresa), **você não precisa reescrever o código nem mover a pasta física do repositório**. \n\nO objetivo do Segundo Cérebro é ser a **memória e inteligência governante** desse projeto.\n\n### Fluxo de Adoção para Projetos Existentes:\n\n```mermaid\ngraph LR\n    A[\"1. Varredura Não-Destrutiva<br/>(Ler código existente)\"] --> B[\"2. Criar Pasta Satélite<br/>(projects/NomeProjeto/)\"]\n    B --> C[\"3. Documentar Stack Real<br/>(PROJECT.md)\"]\n    C --> D[\"4. Mapear Decisões Passadas<br/>(ADRs Retroativos)\"]\n    D --> E[\"5. Registrar Estado Atual<br/>(CURRENT_STATE.md)\"]\n    E --> F[\"6. Adicionar Ponte GEMINI.md<br/>(No repo do projeto)\"]\n```\n\n### Passo 1: Executar a Varredura Inicial com o Agente\nAbra o repositório existente no Antigravity ou passe o caminho do projeto para o agente:\n\n> *\"Tenho um projeto existente em `C:\\Projetos\\SaaS\\MeuSistemaLegado`. Preciso que faça o onboarding dele no AI Second Brain. Analise a stack, o banco de dados, os endpoints e crie a documentação correspondente em `projects/MeuSistemaLegado/`.\"*\n\nO agente executará a skill `project-onboarding` em modo brownfield:\n1. Lê o `.csproj`, `package.json`, scripts SQL e Dockerfiles existentes.\n2. Identifica bibliotecas de ORM (ex: Dapper, EF Core), serviços externos e autenticação.\n3. Não modifica **nenhuma linha** de código do sistema legado.\n\n### Passo 2: Criar os ADRs Retroativos (Crucial!)\nUm dos maiores riscos ao usar IA em código legado é o agente tentar \"reescrever tudo\" usando padrões modernos que quebram o sistema em produção (por exemplo, querer substituir Dapper por EF Core ou trocar SQL Server por PostgreSQL).\n\nPara blindar o projeto contra isso, crie ADRs retroativos:\n- `DECISIONS/001-uso-de-dapper-e-procedures.md`:\n  > *\"Decisão: O projeto utiliza Dapper com Stored Procedures por requisitos de alta performance e compatibilidade com o legado. O agente de IA NUNCA deve tentar substituir Dapper por Entity Framework sem autorização expressa do Alfredo.\"*\n\n### Passo 3: Registrar Bloqueios e Débitos Técnicos em `CURRENT_STATE.md`\nNo arquivo `projects/<nome>/CURRENT_STATE.md`, liste exatamente o estado operacional real:\n- O que está 100% testado e funcionando.\n- Quais são os \"pontos sensíveis\" (onde mexer com cuidado).\n- Quais são os bugs conhecidos que ainda não foram corrigidos.\n- Qual é o próximo objetivo prioritário.\n\n---\n\n## 4. Operação do Dia a Dia: O Ciclo de Vida de uma Sessão de Trabalho\n\nPara que o Segundo Cérebro funcione como uma extensão real da sua memória, toda sessão de desenvolvimento deve seguir o ciclo de 3 fases:\n\n```\n┌─────────────────────────────────────────────────────────────┐\n│ 1. ENTRADA (Context Loading)                                │\n│ \"Vou trabalhar no JobSentinel na feature de alertas por     │\n│ Teams. Carregue o estado atual e decisões pendentes.\"       │\n└──────────────────────────────┬──────────────────────────────┘\n                               │\n                               ▼\n┌─────────────────────────────────────────────────────────────┐\n│ 2. DESENVOLVIMENTO (Skills & Governança)                    │\n│ Implementação -> Testes -> Validação -> Revisão             │\n└──────────────────────────────┬──────────────────────────────┘\n                               │\n                               ▼\n┌─────────────────────────────────────────────────────────────┐\n│ 3. SAÍDA (Memory Flush & Sync)                              │\n│ \"Finalizamos por hoje. Atualize CURRENT_STATE.md e registre │\n│ a sessão na memória.\"                                       │\n└─────────────────────────────────────────────────────────────┘\n```\n\n### 1. Início da Sessão\nAntes de pedir código, peça o contexto:\n> *\"Vou trabalhar no [Nome do Projeto]. Me apresente o estado atual e os próximos passos.\"*\n\nO agente lê:\n- `projects/[Nome]/CURRENT_STATE.md`\n- As últimas 3 sessões em `projects/[Nome]/MEMORY/sessions/`\n- As decisões relevantes em `projects/[Nome]/DECISIONS/`\n\n### 2. Durante a Sessão\nO agente utiliza as skills adequadas para cada atividade:\n- **Vai criar endpoint ou serviço?** → Aciona a skill `new-feature`.\n- **Apareceu um erro/bug?** → Aciona a skill `bug-investigation`.\n- **Vai adicionar uma consulta SQL pesada?** → Aciona a skill `database-review`.\n- **A feature envolve inteligência ou decisão?** → Aciona a skill `ai-decision-gate`.\n\n### 3. Fim da Sessão (Memory Flush)\nNunca encerre o Antigravity sem registrar a sessão. Envie:\n> *\"Fechando os trabalhos de hoje no [Nome do Projeto]. Salve a memória da sessão e atualize o CURRENT_STATE.\"*\n\nO agente:\n1. Cria `projects/[Nome]/MEMORY/sessions/YYYY-MM-DD-resumo.md`.\n2. Atualiza `CURRENT_STATE.md` com os itens concluídos e o que ficou pendente.\n3. Se foi tomada uma decisão arquitetural relevante, cria o novo ADR correspondente.\n\n---\n\n## 5. Governança e Roteamento de IA na Prática (AIJev First)\n\nUma das diretrizes centrais do seu sistema é a **política AIJev First**. Quando um projeto precisa resolver um problema de decisão, classificação ou automação, o agente deve seguir rigorosamente a árvore de roteamento:\n\n```mermaid\nflowchart TD\n    Task([Nova Demanda do Projeto]) --> Q1{É 100% determinística?<br/>Matemática, lógica booleana?}\n    Q1 -- SIM --> Code[Implementar CÓDIGO PURO / REGRA DE NEGÓCIO<br/>Sem custo de IA, latência zero]\n    Q1 -- NÃO --> Q2{É uma Decisão ou Classificação?<br/>Ex: Aprovar/Recusar, Categorizar, Rotear?}\n    \n    Q2 -- SIM --> AIJev[Avaliar AIJev / Jev<br/>Árvore de decisão explicável, rápida e barata]\n    AIJev --> AIJevFit{AIJev atende os requisitos?}\n    AIJevFit -- SIM --> ImplAIJev[Implementar via AIJev Pattern]\n    AIJevFit -- NÃO --> AI_Gateway\n    \n    Q2 -- NÃO --> Q3{Precisa gerar texto, código ou sintetizar linguagem?}\n    Q3 -- SIM --> AI_Gateway[AI Gateway Pattern<br/>Provedor Primário: Claude / Gemini<br/>Fallback automático + Cache + Observabilidade]\n    Q3 -- NÃO --> Action[Execução de Script / Automação]\n```\n\n### Tabela Prática de Escolha Técnica:\n\n| Necessidade | Tecnologia Recomendada | Por quê? |\n| :--- | :--- | :--- |\n| Validação de formulários, cálculos tributários, regras de autenticação | **Código C# / TypeScript Puro** | Custo zero, sem falhas de interpretação, determinismo 100%. |\n| Classificação de severidade de erros de SQL Jobs | **AIJev / Jev First** | Muito mais rápido que LLM, sem custo de tokens, 100% auditável. |\n| Detecção de anomalias em volume de transações | **AIJev / Algoritmo Estatístico** | Latência em milissegundos e comportamento previsível. |\n| Diagnóstico detalhado em linguagem natural de por que um job falhou | **LLM (Claude 3.5 Sonnet / Gemini 1.5 Pro)** | Capacidade de raciocínio aberto e contextualização de stack traces. |\n| Chatbot de suporte ao usuário final | **LLM com RAG via AI Gateway** | Respostas conversacionais alimentadas pela base de conhecimento. |\n\n---\n\n## 6. Catálogo de Prompts Prontos para o Desenvolvedor\n\nGuarde esta seção para copiar e colar no Antigravity:\n\n### Para Iniciar um Novo Projeto:\n```text\nAtive a skill project-onboarding. Quero criar um novo projeto chamado [NOME].\nObjetivo: [Descreva em 2 frases o que ele faz].\nStack pretendida: [.NET / React / Python / SQL Server / etc.].\nEle utilizará IA para: [Descreva onde entra a inteligência, se houver].\nCrie a estrutura completa em projects/[NOME]/ com os templates preenchidos.\n```\n\n### Para Plugar um Projeto Existente:\n```text\nAtive a skill project-onboarding para um projeto existente localizado em [CAMINHO_DO_PROJETO].\nAnalise a estrutura atual sem alterar código, identifique a stack e crie a documentação\ncorrespondente em projects/[NOME_DO_PROJETO]/. Em seguida, extraia as 3 principais\ndecisões de arquitetura já consolidadas para salvar como ADRs iniciais.\n```\n\n### Para Iniciar o Dia de Trabalho:\n```text\nVou focar no projeto [NOME] hoje.\nLeia o CURRENT_STATE.md e as últimas decisões em DECISIONS/.\nMe apresente:\n1. O que foi feito recentemente.\n2. Quais são as tarefas prioritárias de hoje.\n3. Há algum bloqueio registrado?\n```\n\n### Para Implementar uma Nova Feature com IA:\n```text\nQuero adicionar a seguinte funcionalidade no projeto [NOME]:\n[Descreva a feature].\nPasse pela skill ai-decision-gate: analise se ela deve ser determinística, usar AIJev ou LLM.\nApresente a proposta de implementação antes de escrever o código.\n```\n\n### Para Encerrar a Sessão e Salvar a Memória:\n```text\nAtive a skill session-memory. Finalizamos a sessão de trabalho no projeto [NOME].\nO que fizemos: [Breve lista ou deixe o agente listar a partir do git diff].\nDecisões tomadas: [Liste se houver].\nPróximos passos: [Liste o que faremos amanhã].\nGrave o arquivo de sessão e atualize o CURRENT_STATE.md do projeto.\n```\n\n---\n\n## 7. Checklists Operacionais de Consulta Rápida\n\n### ✅ Checklist: Novo Projeto (Greenfield)\n- [ ] Criada a pasta `projects/<nome-do-projeto>/` no Second Brain.\n- [ ] Preenchido `PROJECT.md` com objetivo, stack e restrições.\n- [ ] Preenchido `ARCHITECTURE.md` com os diagramas de componentes.\n- [ ] Preenchido `CURRENT_STATE.md` com a milestone inicial.\n- [ ] Registrado `DECISIONS/001-stack-inicial.md`.\n- [ ] Se tiver IA, preenchido `AI/AI_USE_CASES.md` avaliando AIJev First.\n- [ ] Criado o repositório de código e adicionado `GEMINI.md` apontando para o Second Brain.\n- [ ] Adicionado o projeto à tabela de projetos em `README.md` e `GEMINI.md` raiz.\n- [ ] Visualizado e testado o novo nó no **Grafo Neural 3D** (`docs/brain-ui/`).\n\n### ✅ Checklist: Projeto Existente (Brownfield)\n- [ ] Mapeado repositório original sem modificar código.\n- [ ] Criada pasta satélite `projects/<nome-existente>/`.\n- [ ] Documentada a stack real em `PROJECT.md` (versões exatas de runtime e libs).\n- [ ] Registrados os ADRs retroativos das decisões que **não podem ser violadas**.\n- [ ] Registrados os débitos técnicos e pontos críticos em `CURRENT_STATE.md`.\n- [ ] Adicionado arquivo de contexto no repositório de código (`GEMINI.md` / `.cursorrules`).\n- [ ] Avaliadas oportunidades de melhoria de IA com AI Gateway.\n\n### ✅ Checklist: Fim de Turno / Manutenção Contínua\n- [ ] Código testado e com build verde no repositório.\n- [ ] Skill `session-memory` executada para gerar o arquivo diário.\n- [ ] `CURRENT_STATE.md` atualizado com o progresso real.\n- [ ] Nenhuma decisão arquitetural ficou \"apenas no chat\" — todas viraram ADR.\n- [ ] Commit e push realizados no repositório do projeto e no `AI_SECOND_BRAIN`.\n"
    },
    {
      "id": "docs_GUIA_PRATICO_md",
      "path": "docs/GUIA_PRATICO.md",
      "name": "GUIA_PRATICO.md",
      "title": "Guia Prático do AI Second Brain",
      "category": "docs",
      "icon": "📝",
      "size": 3228,
      "mtime": 1790529909439.6448,
      "outgoingLinks": [
        "file:///c:/projetos/saas/google%20antigravity/projetos/ai_second_brain/docs/como_utilizar_o_projeto.md"
      ],
      "content": "# Guia Prático do AI Second Brain\n\n> 📖 **Para o manual detalhado com passo a passo para novos projetos e projetos legados:**  \n> Consulte o documento oficial completo em: **[COMO_UTILIZAR_O_PROJETO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/COMO_UTILIZAR_O_PROJETO.md)**\n\n## O que é o Segundo Cérebro?\n\nO conceito de \"segundo cérebro\" vem da ideia de **externalizar o conhecimento\nque está na sua cabeça** para um sistema organizado e pesquisável. Em vez de\ndepender da memória humana para lembrar decisões, contextos, padrões e lições\naprendidas, você documenta tudo em um formato que:\n\n1. **Persiste** — Não se perde entre sessões.\n2. **É pesquisável** — Encontre rapidamente o que precisa.\n3. **É acionável** — O agente de IA usa o conhecimento para trabalhar melhor.\n4. **Evolui** — Acumula conhecimento ao longo do tempo.\n\n## Como usar na prática\n\n### Cenário 1: Começar a trabalhar no JobSentinel\n\n1. Abra o workspace AI_SECOND_BRAIN no Antigravity.\n2. Diga: \"Quero trabalhar no JobSentinel. Me dê o contexto atual.\"\n3. O agente vai:\n   - Ler `projects/JobSentinel/PROJECT.md`\n   - Ler `projects/JobSentinel/CURRENT_STATE.md`\n   - Ler decisões em `DECISIONS/`\n   - Ler memória anterior\n   - Te dar um resumo atualizado\n\n### Cenário 2: Implementar uma nova feature\n\n1. Diga: \"Quero adicionar análise de falhas com IA ao JobSentinel.\"\n2. O agente ativa a skill `ai-decision-gate` automaticamente.\n3. Classifica a tarefa:\n   - Detectar falha → Código/Regras\n   - Classificar falha → AIJev\n   - Explicar falha → LLM\n4. Propõe implementação seguindo o AI Gateway pattern.\n5. Após implementar, atualiza memória e documentação.\n\n### Cenário 3: Investigar um bug\n\n1. Diga: \"O Job X está falhando com erro Y.\"\n2. O agente ativa a skill `bug-investigation`.\n3. Segue o processo estruturado de investigação.\n4. Registra a resolução em memória e lessons-learned.\n\n### Cenário 4: Novo projeto\n\n1. Diga: \"Quero adicionar um novo projeto chamado Z.\"\n2. O agente ativa a skill `project-onboarding`.\n3. Cria toda a estrutura de pastas e arquivos.\n4. Preenche templates com suas informações.\n\n### Cenário 5: Revisão de arquitetura\n\n1. Diga: \"Revise a arquitetura do JobSentinel.\"\n2. O agente ativa a skill `architecture-review`.\n3. Verifica checklist de qualidades arquiteturais.\n4. Registra findings e recomendações.\n\n## Fluxo de uma sessão de trabalho\n\n```\nINÍCIO DA SESSÃO\n      │\n      ▼\n  CONTEXTO (ler estado atual, memória, decisões)\n      │\n      ▼\n  TRABALHO (implementar, debugar, revisar)\n      │\n      ▼\n  REGISTRO (atualizar memória, documentação)\n      │\n      ▼\nFIM DA SESSÃO\n```\n\n## Manutenção do Segundo Cérebro\n\n### Diária\n- Atualizar `CURRENT_STATE.md` dos projetos em foco.\n- Registrar sessão em `MEMORY/sessions/`.\n\n### Semanal\n- Revisar `memory/current-state.md` global.\n- Verificar se lições aprendidas foram registradas.\n\n### Por Sprint\n- Atualizar roadmap dos projetos.\n- Revisar decisões pendentes.\n- Avaliar se knowledge base precisa de atualizações.\n\n### Por Trimestre\n- Revisar arquitetura dos projetos.\n- Avaliar se skills precisam de ajustes.\n- Limpar memória obsoleta.\n"
    },
    {
      "id": "GEMINI_md",
      "path": "GEMINI.md",
      "name": "GEMINI.md",
      "title": "AI SECOND BRAIN — ALFREDO AI OS",
      "category": "core",
      "icon": "🧠",
      "size": 3873,
      "mtime": 1790519654099.0344,
      "outgoingLinks": [],
      "content": "# AI SECOND BRAIN — ALFREDO AI OS\n\n> Este arquivo é o cérebro central do seu sistema de desenvolvimento com IA.\n> Qualquer agente que trabalhar neste workspace deve seguir estas instruções.\n\n---\n\n## IDENTIDADE\n\nVocê é o agente de desenvolvimento do Alfredo. Você opera dentro de um sistema\nestruturado chamado **AI Second Brain** que organiza conhecimento, decisões,\nmemória e regras para todos os projetos.\n\n---\n\n## ANTES DE EXECUTAR QUALQUER TAREFA\n\n1. **Entenda o projeto** — Leia o `PROJECT.md` do projeto relevante em `projects/`.\n2. **Leia as regras aplicáveis** — Verifique `.agents/rules/` para restrições.\n3. **Leia o estado atual** — Consulte `CURRENT_STATE.md` do projeto.\n4. **Leia decisões anteriores** — Verifique `DECISIONS/` do projeto.\n5. **Identifique o tipo da tarefa** — Classifique antes de agir.\n\n---\n\n## CLASSIFICAÇÃO DE TAREFAS\n\nToda tarefa deve ser classificada antes da execução:\n\n| Tipo | Descrição | Ação |\n|------|-----------|------|\n| **A. Determinística** | Lógica clara, sem ambiguidade | → Código/Regra |\n| **B. Classificação** | Categorizar dados/eventos | → Avaliar AIJev/Jev |\n| **C. Decisão** | Escolher entre alternativas | → Avaliar AIJev/Jev |\n| **D. Geração** | Criar conteúdo/texto/código | → LLM |\n| **E. Raciocínio aberto** | Análise exploratória | → LLM |\n| **F. Execução** | Rodar script/deploy/build | → Código |\n| **G. Investigação** | Debug/análise de logs | → Skill específica |\n\n---\n\n## REGRAS DE ROTEAMENTO DE IA\n\n```\nNOVA TAREFA\n    │\n    ▼\n┌─────────────────┐\n│ É determinística?│\n└────────┬────────┘\n         │\n    SIM ─┴──────► CÓDIGO/REGRA\n         │\n    NÃO\n         ▼\n  É DECISÃO/CLASSIFICAÇÃO?\n         │\n    ┌────┴────┐\n   SIM      NÃO\n    │         │\n    ▼         ▼\n  AIJEV     PRECISA GERAR?\n    │         │\n    ▼    ┌────┴────┐\n  REGRA SIM      NÃO\n  DE     │        │\n  NEGÓCIO▼        ▼\n        LLM      AÇÃO\n         │\n         ▼\n     VALIDAÇÃO\n         │\n         ▼\n       AÇÃO\n```\n\n---\n\n## REGRAS ABSOLUTAS\n\n1. **NUNCA** utilize LLM simplesmente porque ele está disponível.\n2. **NUNCA** utilize AIJev artificialmente quando código determinístico for suficiente.\n3. **NUNCA** invente contexto que não existe na documentação do projeto.\n4. **NUNCA** execute ações destrutivas sem confirmação explícita.\n5. **NUNCA** altere arquitetura sem consultar decisões existentes.\n6. **SEMPRE** valide o resultado de qualquer operação de IA.\n7. **SEMPRE** atualize a memória após implementações significativas.\n8. **SEMPRE** registre decisões arquiteturais relevantes.\n\n---\n\n## ANTES DE CRIAR NOVA INTEGRAÇÃO DE IA\n\nAvalie cada item obrigatoriamente:\n\n- [ ] AIJev é aplicável? → Consulte `knowledge/ai/AIJEV.md`\n- [ ] Qual modelo é adequado? → Consulte `knowledge/ai/MODEL_SELECTION.md`\n- [ ] Custo estimado?\n- [ ] Latência aceitável?\n- [ ] Segurança dos dados? → Consulte `.agents/rules/03-security.md`\n- [ ] Fallback definido?\n- [ ] Validação implementada?\n- [ ] Observabilidade configurada?\n\n---\n\n## DEPOIS DA IMPLEMENTAÇÃO\n\n1. Testar\n2. Revisar\n3. Atualizar documentação do projeto\n4. Atualizar memória (`memory/`)\n5. Registrar decisões relevantes (`decisions/`)\n\n---\n\n## PROJETOS ATIVOS\n\n| Projeto | Tipo | Stack |\n|---------|------|-------|\n| **JobSentinel** | Observabilidade SQL Jobs | .NET, SQL Server, API |\n| **Sabor em Conflito** | Jogo Mobile | Game Design, Unity/Godot |\n| **Assistente Mobile** | App Mobile | .NET MAUI, API |\n\n---\n\n## REFERÊNCIAS\n\n- AIJev: https://aijev.org/pt/\n- Knowledge Base: `knowledge/`\n- Templates: `templates/`\n- Skills: `.agents/skills/`\n- Rules: `.agents/rules/`\n"
    },
    {
      "id": "knowledge_ai_AIJEV_md",
      "path": "knowledge/ai/AIJEV.md",
      "name": "AIJEV.md",
      "title": "AIJev / Jev — Referência",
      "category": "knowledge",
      "icon": "🎯",
      "size": 1519,
      "mtime": 1790519904844.7039,
      "outgoingLinks": [],
      "content": "# AIJev / Jev — Referência\n\n> Fonte: https://aijev.org/pt/\n\n## O que é\n\nAIJev/Jev é uma **camada de decisão estruturada** para software:\n- O software fornece um **estado** e **perguntas predefinidas**.\n- Recebe **decisões tipadas** com probabilidades.\n- Diferente de um LLM que gera texto livre.\n\n## Quando usar\n\n| Cenário | Use AIJev? | Alternativa |\n|---------|-----------|-------------|\n| Classificar evento | ✅ Sim | - |\n| Priorizar alerta | ✅ Sim | - |\n| Decidir ação | ✅ Sim | - |\n| Gerar texto | ❌ Não | LLM |\n| Responder pergunta | ❌ Não | LLM |\n| Cálculo determinístico | ❌ Não | Código |\n\n## Padrão: Identificar → Gerar → Validar\n\n1. **Identificar**: O que está acontecendo? (estado + contexto)\n2. **Gerar**: Qual a decisão? (AIJev processa)\n3. **Validar**: A decisão é coerente? (validação programática)\n\n## Integração com .NET\n\n```csharp\n// Abstração\npublic interface IDecisionProvider\n{\n    Task<DecisionResult> DecideAsync(\n        DecisionRequest request,\n        CancellationToken ct);\n}\n\n// Uso\nvar request = new DecisionRequest(\n    Context: \"SQL Job 'BackupProd' falhou\",\n    Question: \"Qual a ação adequada?\",\n    State: new() { [\"errorCode\"] = 1234, [\"retries\"] = 3 },\n    Options: [\"retry\", \"alert\", \"escalate\", \"explain\"]\n);\n\nvar result = await _decisionProvider.DecideAsync(request, ct);\n```\n\n## Disponibilidade\n\n> ⚠️ A API pública do AIJev direciona para solicitação de acesso.\n> Sempre implemente com fallback para `RulesDecisionProvider`.\n"
    },
    {
      "id": "knowledge_ai_AI_GATEWAY_md",
      "path": "knowledge/ai/AI_GATEWAY.md",
      "name": "AI_GATEWAY.md",
      "title": "AI Gateway Pattern",
      "category": "knowledge",
      "icon": "🔌",
      "size": 3424,
      "mtime": 1790519921212.2817,
      "outgoingLinks": [],
      "content": "# AI Gateway Pattern\n\n## Conceito\n\nO AI Gateway é uma abstração que desacopla seus projetos de provedores\nespecíficos de IA. Todo acesso a IA passa por uma interface unificada.\n\n## Arquitetura\n\n```\n┌──────────────────────────────────────────────────┐\n│                   APPLICATION                     │\n├──────────────────────────────────────────────────┤\n│                   AI GATEWAY                      │\n│                                                   │\n│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │\n│  │  Decision    │  │  Generative  │  │ Embed   │ │\n│  │  Provider    │  │  Provider    │  │ Provider│ │\n│  └──────┬──────┘  └──────┬───────┘  └────┬────┘ │\n│         │                │               │       │\n│  ┌──────┴──────┐  ┌──────┴───────┐  ┌────┴────┐ │\n│  │ AIJev       │  │ OpenAI       │  │ OpenAI  │ │\n│  │ Rules       │  │ Azure OpenAI │  │ Local   │ │\n│  │ Deterministic│  │ Groq         │  │         │ │\n│  │ Mock        │  │ Google AI    │  │         │ │\n│  │             │  │ Local        │  │         │ │\n│  └─────────────┘  └──────────────┘  └─────────┘ │\n├──────────────────────────────────────────────────┤\n│                  CROSS-CUTTING                    │\n│  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │\n│  │ Logging │ │ Retry  │ │ Cache  │ │ Metrics  │ │\n│  └─────────┘ └────────┘ └────────┘ └──────────┘ │\n└──────────────────────────────────────────────────┘\n```\n\n## Benefícios\n\n1. **Desacoplamento** — Troque de provider sem mudar código do app.\n2. **Fallback** — Se um provider falhar, use outro.\n3. **Observabilidade** — Métricas centralizadas de uso de IA.\n4. **Custo** — Controle e roteamento por custo/qualidade.\n5. **Segurança** — Ponto único para aplicar regras de dados.\n\n## Implementação Base\n\n```csharp\n// Program.cs / DI Registration\nservices.AddAIGateway(options =>\n{\n    options.DefaultDecisionProvider = \"rules\";\n    options.DefaultGenerativeProvider = \"openai\";\n    \n    options.AddDecisionProvider<RulesDecisionProvider>(\"rules\");\n    options.AddDecisionProvider<JevDecisionProvider>(\"jev\");\n    \n    options.AddGenerativeProvider<OpenAIProvider>(\"openai\");\n    options.AddGenerativeProvider<GroqProvider>(\"groq\");\n    \n    options.EnableFallback = true;\n    options.EnableRetry = true;\n    options.EnableMetrics = true;\n});\n```\n"
    },
    {
      "id": "knowledge_ai_MODEL_SELECTION_md",
      "path": "knowledge/ai/MODEL_SELECTION.md",
      "name": "MODEL_SELECTION.md",
      "title": "Seleção de Modelos de IA",
      "category": "knowledge",
      "icon": "📄",
      "size": 1676,
      "mtime": 1790519919152.0444,
      "outgoingLinks": [],
      "content": "# Seleção de Modelos de IA\n\n## Critérios de Seleção\n\n| Critério | Peso | Descrição |\n|----------|------|-----------|\n| **Qualidade** | Alto | Precisão e relevância do output |\n| **Custo** | Alto | Custo por token/request |\n| **Latência** | Médio | Tempo de resposta |\n| **Privacidade** | Alto | Onde os dados são processados |\n| **Disponibilidade** | Médio | Uptime e limites de rate |\n\n## Modelos Recomendados por Caso de Uso\n\n### Decisão/Classificação\n1. **AIJev/Jev** — Decisões estruturadas (preferido)\n2. **Regras determinísticas** — Fallback\n3. **GPT-4o-mini / Gemini Flash** — Se necessário LLM\n\n### Geração de Texto/Código\n1. **Claude Opus** — Qualidade máxima (via Antigravity Pro)\n2. **GPT-4o** — Alta qualidade, boa velocidade\n3. **Gemini 2.5 Pro** — Bom equilíbrio\n4. **Groq (Llama)** — Velocidade extrema, menor qualidade\n\n### Análise de Código\n1. **Claude Opus** — Melhor para código complexo\n2. **GPT-4o** — Alternativa sólida\n3. **Gemini 2.5 Pro** — Janela de contexto grande\n\n### Embeddings\n1. **text-embedding-3-small** — Custo baixo\n2. **text-embedding-3-large** — Maior qualidade\n\n## Providers\n\n| Provider | Modelos | Uso Primário |\n|----------|---------|-------------|\n| **Antigravity Pro** | Claude, Gemini | Desenvolvimento |\n| **OpenAI** | GPT-4o, o1, embeddings | Geração, análise |\n| **Azure OpenAI** | GPT-4o (deploy próprio) | Produção enterprise |\n| **Groq** | Llama, Mixtral | Velocidade, custo |\n| **Local** | Ollama, LM Studio | Privacidade total |\n\n## Regra de Ouro\n\n> Comece sempre com o modelo mais simples e barato que atenda.\n> Escale para modelos maiores apenas se necessário.\n"
    },
    {
      "id": "knowledge_architecture_PATTERNS_md",
      "path": "knowledge/architecture/PATTERNS.md",
      "name": "PATTERNS.md",
      "title": "Padrões de Arquitetura",
      "category": "knowledge",
      "icon": "🏗️",
      "size": 1042,
      "mtime": 1790519928186.2683,
      "outgoingLinks": [],
      "content": "# Padrões de Arquitetura\n\n## Clean Architecture\n\n```\nPresentation (API/UI)\n    │\n    ▼\nApplication (Use Cases, CQRS)\n    │\n    ▼\nDomain (Entities, Value Objects, Interfaces)\n    │\n    ▼\nInfrastructure (EF, APIs externas, IA)\n```\n\n## Padrões Frequentes\n\n| Padrão | Quando usar |\n|--------|------------|\n| **CQRS** | Separação de leitura/escrita |\n| **Repository** | Abstração de acesso a dados |\n| **Unit of Work** | Transações consistentes |\n| **Result Pattern** | Retorno sem exceções |\n| **Options Pattern** | Configuração tipada |\n| **Mediator** | Desacoplamento de handlers |\n| **Strategy** | Algoritmos intercambiáveis |\n| **Factory** | Criação complexa de objetos |\n| **Observer** | Eventos e notificações |\n| **Circuit Breaker** | Resiliência em chamadas externas |\n\n## Decisão de Padrão\n\nAntes de escolher um padrão, pergunte:\n1. O projeto já usa este padrão? (consistência)\n2. A complexidade é justificada? (YAGNI)\n3. Facilita testes? (testabilidade)\n4. Outro dev entenderia? (manutenibilidade)\n"
    },
    {
      "id": "knowledge_global_INDEX_md",
      "path": "knowledge/global/INDEX.md",
      "name": "INDEX.md",
      "title": "Índice de Conhecimento Global",
      "category": "knowledge",
      "icon": "📄",
      "size": 837,
      "mtime": 1790519926105.4395,
      "outgoingLinks": [],
      "content": "# Índice de Conhecimento Global\n\n## Estrutura\n\n```\nknowledge/\n├── global/          ← Conhecimento transversal\n│   └── INDEX.md     ← Este arquivo\n├── ai/              ← Inteligência Artificial\n│   ├── AIJEV.md\n│   ├── MODEL_SELECTION.md\n│   └── AI_GATEWAY.md\n├── architecture/    ← Padrões de arquitetura\n│   └── PATTERNS.md\n├── dotnet/          ← .NET e C#\n│   └── PATTERNS.md\n├── sql-server/      ← SQL Server\n│   └── PATTERNS.md\n└── security/        ← Segurança\n    └── OWASP.md\n```\n\n## Como Usar\n\n- Antes de implementar algo, consulte a área relevante.\n- Se aprender algo novo e significativo, adicione aqui.\n- Cada arquivo deve ser autocontido e referenciável.\n- Não duplique informação — linke para a fonte.\n"
    },
    {
      "id": "memory_current-state_md",
      "path": "memory/current-state.md",
      "name": "current-state.md",
      "title": "Estado Atual do AI Second Brain",
      "category": "memory",
      "icon": "💾",
      "size": 840,
      "mtime": 1790520017862.212,
      "outgoingLinks": [],
      "content": "# Estado Atual do AI Second Brain\n\n> Última atualização: 2026-09-27\n\n## Projetos Ativos\n\n| Projeto | Status | Prioridade |\n|---------|--------|-----------|\n| **JobSentinel** | 🟡 Em planejamento | Alta |\n| **Sabor em Conflito** | 🔴 Em conceituação | Média |\n| **Assistente Mobile** | 🔴 Em conceituação | Média |\n\n## Foco Atual\n- Estruturação do AI Second Brain\n- Definição da arquitetura do JobSentinel\n- Estabelecimento do AI Decision Gate pattern\n\n## Sessão Mais Recente\n- **Data**: 2026-09-27\n- **O que foi feito**: Criação completa do AI Second Brain v2 para Antigravity Pro\n- **Decisões**: Adoção do formato nativo Antigravity (Rules, Skills, Plugins)\n\n## Temas em Andamento\n- AI Gateway pattern para todos os projetos\n- AIJev como decisor primário (com fallback)\n- Documentação como código (versionada)\n"
    },
    {
      "id": "memory_lessons-learned_md",
      "path": "memory/lessons-learned.md",
      "name": "lessons-learned.md",
      "title": "Lições Aprendidas",
      "category": "memory",
      "icon": "💾",
      "size": 1198,
      "mtime": 1790520024918.1943,
      "outgoingLinks": [],
      "content": "# Lições Aprendidas\n\n## 2026-09-27 — Criação do AI Second Brain\n\n### Lição 1: Formato nativo importa\n**Contexto**: A versão 1 usava estrutura genérica (CLAUDE.md).\n**Aprendizado**: Cada ferramenta (Antigravity, Claude Code, Cursor) tem seu\nformato nativo de customização. Usar o formato nativo garante que as features\nda ferramenta funcionem corretamente (descoberta automática de skills, rules, etc).\n**Ação**: Sempre adapte o AI Second Brain para o formato da ferramenta em uso.\n\n### Lição 2: AIJev não substitui código determinístico\n**Contexto**: Tentação de usar AIJev para tudo que envolve decisão.\n**Aprendizado**: Se uma regra pode ser escrita em código (if/else, switch),\nnão precisa de AIJev. AIJev é para decisões que envolvem contexto complexo\nou probabilidades.\n**Ação**: Decision Gate obrigatório antes de integrar qualquer IA.\n\n### Lição 3: LLM não é a resposta para tudo\n**Contexto**: Tendência de chamar LLM para cada problema.\n**Aprendizado**: LLM é caro, lento e não-determinístico. Use apenas quando\nrealmente precisa de geração de texto ou raciocínio aberto.\n**Ação**: Sempre pergunte \"isso pode ser feito sem IA?\" antes de usar LLM.\n"
    },
    {
      "id": "projects_Assistente-Mobile_CURRENT_STATE_md",
      "path": "projects/Assistente-Mobile/CURRENT_STATE.md",
      "name": "CURRENT_STATE.md",
      "title": "Assistente Mobile — Estado Atual",
      "category": "projects",
      "icon": "💾",
      "size": 257,
      "mtime": 1790519995761.6575,
      "outgoingLinks": [],
      "content": "# Assistente Mobile — Estado Atual\n\n> Última atualização: 2026-09-27\n\n## Status Geral: 🔴 Em conceituação\n\n## Próximos passos\n1. Definir escopo do MVP\n2. Definir arquitetura (Clean Architecture + MAUI)\n3. Criar wireframes\n4. Configurar AI Gateway\n"
    },
    {
      "id": "projects_Assistente-Mobile_PROJECT_md",
      "path": "projects/Assistente-Mobile/PROJECT.md",
      "name": "PROJECT.md",
      "title": "Assistente Mobile",
      "category": "projects",
      "icon": "📱",
      "size": 535,
      "mtime": 1790519993689.4812,
      "outgoingLinks": [],
      "content": "# Assistente Mobile\n\n## Visão Geral\nAplicativo mobile assistente pessoal com IA.\n\n## Stack\n- **Frontend**: .NET MAUI\n- **Backend**: ASP.NET Core Web API\n- **IA**: LLM para assistência, AIJev para decisões\n\n## Objetivos\n1. App mobile funcional com .NET MAUI\n2. Backend API robusto\n3. Integração com IA via AI Gateway\n4. UX/UI premium\n\n## Status\n- [ ] Arquitetura definida\n- [ ] Backend API\n- [ ] App MAUI base\n- [ ] AI Gateway integrado\n- [ ] UX/UI design\n\n## Links\n- Arquitetura: `ARCHITECTURE.md`\n- UX/UI: `UX_UI.md`\n- IA: `AI/`\n"
    },
    {
      "id": "projects_JobSentinel_AI_AI_USE_CASES_md",
      "path": "projects/JobSentinel/AI/AI_USE_CASES.md",
      "name": "AI_USE_CASES.md",
      "title": "JobSentinel — Casos de Uso de IA",
      "category": "projects",
      "icon": "⚡",
      "size": 1260,
      "mtime": 1790519984308.5986,
      "outgoingLinks": [],
      "content": "# JobSentinel — Casos de Uso de IA\n\n## Caso 1: Classificação de Falha de Job\n\n| Aspecto | Detalhe |\n|---------|---------|\n| **Tipo** | Classificação |\n| **Abordagem** | AIJev primeiro, fallback para regras |\n| **Input** | Erro do Job, histórico, contexto |\n| **Output** | Categoria de falha + ação recomendada |\n| **Latência** | < 200ms |\n\n## Caso 2: Explicação de Falha\n\n| Aspecto | Detalhe |\n|---------|---------|\n| **Tipo** | Geração |\n| **Abordagem** | LLM (somente quando Decision Gate autoriza) |\n| **Input** | Erro, contexto, histórico, decisão do AIJev |\n| **Output** | Explicação em linguagem humana |\n| **Latência** | < 5s |\n\n## Caso 3: Detecção de Padrões\n\n| Aspecto | Detalhe |\n|---------|---------|\n| **Tipo** | Análise/Classificação |\n| **Abordagem** | Regras + AIJev para edge cases |\n| **Input** | Histórico de execuções (janela temporal) |\n| **Output** | Padrões identificados + alertas |\n| **Latência** | Batch (não real-time) |\n\n## Caso 4: Recomendação de Ação\n\n| Aspecto | Detalhe |\n|---------|---------|\n| **Tipo** | Decisão |\n| **Abordagem** | AIJev |\n| **Input** | Classificação da falha + estado do sistema |\n| **Output** | Ação recomendada (retry, alert, escalate) |\n| **Latência** | < 200ms |\n"
    },
    {
      "id": "projects_JobSentinel_ARCHITECTURE_md",
      "path": "projects/JobSentinel/ARCHITECTURE.md",
      "name": "ARCHITECTURE.md",
      "title": "JobSentinel — Arquitetura",
      "category": "projects",
      "icon": "🏗️",
      "size": 4494,
      "mtime": 1790519962746.4512,
      "outgoingLinks": [],
      "content": "# JobSentinel — Arquitetura\n\n## Visão Geral\n\n```\n┌─────────────────────────────────────────────────┐\n│                SQL SERVER                        │\n│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │\n│  │  Job A   │  │  Job B   │  │  Job N   │      │\n│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │\n│       └──────────────┼──────────────┘            │\n│                      │                           │\n│              msdb.dbo.sysjobhistory              │\n└──────────────────────┼───────────────────────────┘\n                       │\n                       ▼\n┌──────────────────────────────────────────────────┐\n│              JOBSENTINEL API                      │\n│                                                   │\n│  ┌──────────────┐                                │\n│  │  Collector    │  ← Polling ou Event            │\n│  └──────┬───────┘                                │\n│         ▼                                         │\n│  ┌──────────────┐                                │\n│  │  Normalizer   │  ← Dados estruturados          │\n│  └──────┬───────┘                                │\n│         ▼                                         │\n│  ┌──────────────┐                                │\n│  │  Rule Engine  │  ← Regras determinísticas      │\n│  └──────┬───────┘                                │\n│         ▼                                         │\n│  ┌──────────────┐                                │\n│  │  AI Gateway   │  ← Decision Gate               │\n│  │  ├─ AIJev     │                                │\n│  │  ├─ Rules     │                                │\n│  │  └─ LLM      │                                │\n│  └──────┬───────┘                                │\n│         ▼                                         │\n│  ┌──────────────┐                                │\n│  │  Action Eng.  │  ← Executa decisão             │\n│  └──────┬───────┘                                │\n│         ▼                                         │\n│  ┌──────────────┐                                │\n│  │  Notifier     │  ← Alertas e notificações      │\n│  └──────────────┘                                │\n└──────────────────────┬───────────────────────────┘\n                       │\n                       ▼\n┌──────────────────────────────────────────────────┐\n│                   PORTAL                          │\n│  Dashboard │ Jobs │ Incidentes │ Explicações      │\n└──────────────────────────────────────────────────┘\n```\n\n## Camadas\n\n| Camada | Responsabilidade |\n|--------|-----------------|\n| **Collector** | Coletar dados do SQL Agent |\n| **Normalizer** | Estruturar e enriquecer dados |\n| **Rule Engine** | Aplicar regras determinísticas |\n| **AI Gateway** | Decisões inteligentes (AIJev/LLM) |\n| **Action Engine** | Executar ações decididas |\n| **Notifier** | Notificações e alertas |\n| **Portal** | Visualização para humanos |\n\n## Tecnologias\n\n- ASP.NET Core 8 Web API\n- Entity Framework Core\n- SQL Server (fonte + storage)\n- Serilog (logging)\n- SignalR (real-time no portal)\n- Health Checks\n"
    },
    {
      "id": "projects_JobSentinel_CURRENT_STATE_md",
      "path": "projects/JobSentinel/CURRENT_STATE.md",
      "name": "CURRENT_STATE.md",
      "title": "JobSentinel — Estado Atual",
      "category": "projects",
      "icon": "💾",
      "size": 760,
      "mtime": 1790519971060.5354,
      "outgoingLinks": [],
      "content": "# JobSentinel — Estado Atual\n\n> Última atualização: 2026-09-27\n\n## Status Geral: 🟡 Em planejamento\n\n## O que está definido\n- Conceito e visão do produto\n- Filosofia de uso de IA (AIJev First)\n- Estrutura do AI Second Brain\n\n## O que está em desenvolvimento\n- Arquitetura técnica detalhada\n- Definição dos componentes principais\n- AI Decision Gate pattern\n\n## Bloqueios\n- Definir abordagem de coleta (polling vs event)\n- Avaliar disponibilidade da API AIJev\n- Escolher stack do portal (Blazor vs React)\n\n## Próximos passos\n1. Finalizar arquitetura e criar ADRs\n2. Criar POC de coleta do SQL Agent\n3. Implementar AI Gateway base\n4. Criar portal MVP\n\n## Métricas\n- Cobertura de testes: N/A (não iniciado)\n- Endpoints: N/A\n- Jobs monitorados: N/A\n"
    },
    {
      "id": "projects_JobSentinel_DECISIONS_ADR-0001-ai-decision-gate_md",
      "path": "projects/JobSentinel/DECISIONS/ADR-0001-ai-decision-gate.md",
      "name": "ADR-0001-ai-decision-gate.md",
      "title": "ADR-0001: AI Decision Gate como padrão de roteamento de IA",
      "category": "projects",
      "icon": "🚦",
      "size": 1111,
      "mtime": 1790519979260.4194,
      "outgoingLinks": [],
      "content": "# ADR-0001: AI Decision Gate como padrão de roteamento de IA\n\n## Status\nAceita\n\n## Data\n2026-09-27\n\n## Contexto\nO JobSentinel precisa utilizar IA para analisar falhas de SQL Jobs,\nmas não deve chamar GPT/LLM para cada evento. Precisamos de uma\nestratégia que determine automaticamente quando usar IA e qual tipo.\n\n## Decisão\nAdotar o padrão AI Decision Gate que classifica cada tarefa:\n1. Determinística → Código/Regras\n2. Classificação/Decisão → AIJev/Jev\n3. Geração/Explicação → LLM\n\nTodo acesso a IA passa pelo AI Gateway, que abstrai os providers.\n\n## Consequências\n- Redução de custos com IA (não chama LLM desnecessariamente)\n- Melhor performance (regras determinísticas são mais rápidas)\n- Rastreabilidade de decisões\n- Necessidade de implementar e manter o AI Gateway\n- Necessidade de definir regras de roteamento\n\n## Alternativas Consideradas\n1. **Chamar LLM sempre** — Rejeitada: custo alto, latência, sem rastreabilidade.\n2. **Apenas regras** — Rejeitada: perde capacidade de explicação contextual.\n3. **AIJev apenas** — Rejeitada: não cobre geração de texto.\n"
    },
    {
      "id": "projects_JobSentinel_PROJECT_md",
      "path": "projects/JobSentinel/PROJECT.md",
      "name": "PROJECT.md",
      "title": "JobSentinel",
      "category": "projects",
      "icon": "⚡",
      "size": 1554,
      "mtime": 1790519956642.1892,
      "outgoingLinks": [],
      "content": "# JobSentinel\n\n## Visão Geral\nSistema de observabilidade inteligente para SQL Server Agent Jobs.\nTransforma monitoramento passivo em inteligência operacional ativa.\n\n## Stack\n- **Backend**: .NET 8, C#, ASP.NET Core Web API\n- **Banco**: SQL Server (monitoramento de Jobs do SQL Agent)\n- **IA**: AIJev para decisões, LLM para explicações\n- **Frontend**: Portal web para visualização\n\n## Objetivos\n1. Monitorar SQL Agent Jobs em tempo real\n2. Detectar e classificar falhas automaticamente\n3. Decidir ações com AIJev (escalar, alertar, retry)\n4. Gerar explicações contextualizadas com LLM quando necessário\n5. Prover portal para visibilidade operacional\n\n## Arquitetura de IA\n\n```\nSQL JOB FALHOU\n      │\n      ▼\n  EVENTO DETECTADO\n      │\n      ▼\n  NORMALIZAÇÃO (dados estruturados)\n      │\n      ▼\n  REGRAS DETERMINÍSTICAS (filtros simples)\n      │\n      ▼\n  AIJEV / DECISION GATE\n      │\n      ├── operação normal → registra\n      ├── incidente conhecido → alerta\n      ├── necessita humano → escala\n      └── necessita explicação\n              │\n              ▼\n            LLM\n              │\n              ▼\n          VALIDAÇÃO\n              │\n              ▼\n        EXPLICAÇÃO NO PORTAL\n```\n\n## Status\n- [ ] Arquitetura definida\n- [ ] POC de monitoramento\n- [ ] Decision Gate implementado\n- [ ] AI Gateway configurado\n- [ ] Portal básico\n- [ ] Testes\n\n## Links\n- Arquitetura: `ARCHITECTURE.md`\n- Estado atual: `CURRENT_STATE.md`\n- Decisões: `DECISIONS/`\n- IA: `AI/`\n"
    },
    {
      "id": "projects_Sabor-em-Conflito_CURRENT_STATE_md",
      "path": "projects/Sabor-em-Conflito/CURRENT_STATE.md",
      "name": "CURRENT_STATE.md",
      "title": "Sabor em Conflito — Estado Atual",
      "category": "projects",
      "icon": "💾",
      "size": 263,
      "mtime": 1790519991301.589,
      "outgoingLinks": [],
      "content": "# Sabor em Conflito — Estado Atual\n\n> Última atualização: 2026-09-27\n\n## Status Geral: 🔴 Em conceituação\n\n## Próximos passos\n1. Finalizar game design document\n2. Definir art direction\n3. Escolher engine (Unity vs Godot)\n4. Criar protótipo de gameplay\n"
    },
    {
      "id": "projects_Sabor-em-Conflito_PROJECT_md",
      "path": "projects/Sabor-em-Conflito/PROJECT.md",
      "name": "PROJECT.md",
      "title": "Sabor em Conflito",
      "category": "projects",
      "icon": "🎮",
      "size": 601,
      "mtime": 1790519986963.3054,
      "outgoingLinks": [],
      "content": "# Sabor em Conflito\n\n## Visão Geral\nJogo mobile de estratégia culinária.\n\n## Stack\n- **Engine**: A definir (Unity / Godot)\n- **Backend**: A definir\n- **IA**: Possível uso em NPCs e balanceamento\n\n## Objetivos\n1. Game design definido e documentado\n2. Direção artística estabelecida\n3. Gameplay principal implementado\n4. Personagens e mapas desenhados\n\n## Status\n- [ ] Game design document\n- [ ] Art direction\n- [ ] Prototype\n- [ ] Core gameplay\n- [ ] Characters\n- [ ] Maps\n\n## Links\n- Game Design: `GAME_DESIGN.md`\n- Art Direction: `ART_DIRECTION.md`\n- Characters: `CHARACTERS/`\n- Maps: `MAPS/`\n"
    },
    {
      "id": "README_md",
      "path": "README.md",
      "name": "README.md",
      "title": "AI Second Brain — Alfredo AI OS",
      "category": "core",
      "icon": "🧠",
      "size": 3698,
      "mtime": 1790529951123.9373,
      "outgoingLinks": [
        "file:///c:/projetos/saas/google%20antigravity/projetos/ai_second_brain/docs/como_utilizar_o_projeto.md"
      ],
      "content": "# AI Second Brain — Alfredo AI OS\n\n> Sistema de segundo cérebro para desenvolvimento com IA, otimizado para Google Antigravity Pro.\n\n## O que é\n\nO AI Second Brain é uma estrutura de conhecimento, decisões, memória e governança\nque transforma o agente de IA de um chatbot genérico em um parceiro de desenvolvimento\nque entende o contexto, respeita regras e acumula conhecimento ao longo do tempo.\n\n## Estrutura\n\n```\nAI_SECOND_BRAIN/\n│\n├── GEMINI.md                    ← Cérebro central\n├── README.md                    ← Este arquivo\n│\n├── .agents/                     ← Customizações Antigravity\n│   ├── rules/                   ← Regras persistentes\n│   ├── skills/                  ← Workflows reutilizáveis\n│   └── plugins/                 ← Plugin do AI OS\n│\n├── knowledge/                   ← Base de conhecimento\n│   ├── global/                  ← Conhecimento transversal\n│   ├── ai/                      ← IA, modelos, AIJev\n│   ├── architecture/            ← Padrões e decisões\n│   ├── dotnet/                  ← .NET, C#, Entity Framework\n│   ├── sql-server/              ← SQL Server, Jobs, Performance\n│   └── security/                ← Segurança, LGPD, OWASP\n│\n├── projects/                    ← Projetos ativos\n│   ├── JobSentinel/\n│   ├── Sabor-em-Conflito/\n│   └── Assistente-Mobile/\n│\n├── decisions/                   ← Decisões arquiteturais globais\n├── memory/                      ← Memória persistente\n├── templates/                   ← Templates reutilizáveis\n└── docs/                        ← Documentação do sistema\n    └── brain-ui/                ← Interface de visualização\n```\n\n## Como usar\n\n> 📘 **Manual Prático Completo:**  \n> Veja o passo a passo detalhado para criar novos projetos ou plugar projetos existentes em: **[docs/COMO_UTILIZAR_O_PROJETO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/COMO_UTILIZAR_O_PROJETO.md)**.\n\n### 1. Abra este workspace no Antigravity\nO `GEMINI.md` será carregado automaticamente como regra raiz.\n\n### 2. As regras são aplicadas automaticamente\nQuando você trabalhar em qualquer arquivo, as regras de `.agents/rules/` serão\ndescobertas e aplicadas conforme o contexto.\n\n### 3. Skills são ativadas sob demanda\nO agente identifica automaticamente quando uma skill é relevante e a ativa.\nVocê também pode invocar manualmente.\n\n### 4. Projetos têm contexto próprio\nCada projeto em `projects/` tem seu `PROJECT.md`, estado atual, decisões e memória.\n\n### 5. A memória persiste entre sessões\nApós cada sessão significativa, o agente atualiza `memory/` com o estado atual.\n\n## Filosofia\n\n```\nALFREDO AI OS\n       │\n  ┌────┴─────────────────┐\n  │                      │\nANTIGRAVITY         KNOWLEDGE\n  │                      │\n  ┌────┼────┐    ┌────┼────┐\n  │    │    │    │    │    │\nRULES SKILLS AGENTS GLOBAL PROJECT MEMORY\n  │    │    │    │    │    │\n  └────┴────┴────┴────┴────┘\n           │\n       AI GATEWAY\n           │\n    ┌──────┼──────┐\n    │      │      │\n  AIJEV   LLM  LOCAL AI\n    │      │      │\n    └──────┼──────┘\n           │\n     SEUS PROJETOS\n           │\n  ┌────────┼────────┐\n  ▼        ▼        ▼\nJobSentinel  Sabor  Assistente\n```\n"
    },
    {
      "id": "templates_ai-use-case_md",
      "path": "templates/ai-use-case.md",
      "name": "ai-use-case.md",
      "title": "Template: Caso de Uso de IA",
      "category": "templates",
      "icon": "📋",
      "size": 1205,
      "mtime": 1790520044213.0144,
      "outgoingLinks": [],
      "content": "# Template: Caso de Uso de IA\n\n## Informações\n\n| Campo | Valor |\n|-------|-------|\n| **Projeto** | |\n| **Caso de Uso** | |\n| **Tipo** | Classificação / Decisão / Geração / Análise |\n| **Abordagem** | AIJev / LLM / Regras / Composta |\n| **Data** | |\n\n## Decision Gate\n\n### A tarefa é determinística?\n- [ ] Sim → Use código. Não precisa de IA.\n- [ ] Não → Continue.\n\n### É classificação/decisão?\n- [ ] Sim → Avalie AIJev.\n- [ ] Não → Continue.\n\n### Precisa gerar conteúdo?\n- [ ] Sim → Use LLM.\n- [ ] Não → Execute ação diretamente.\n\n## Especificação\n\n### Input\nDescreva o que entra no sistema de IA.\n\n### Output esperado\nDescreva o que deve sair.\n\n### Validação\nComo validar que o output está correto?\n\n### Fallback\nO que acontece se a IA falhar?\n\n## Avaliação\n\n| Critério | Valor |\n|----------|-------|\n| **Modelo recomendado** | |\n| **Custo estimado** | |\n| **Latência máxima** | |\n| **Taxa de erro aceitável** | |\n| **Dados sensíveis envolvidos?** | Sim / Não |\n| **Fallback implementado?** | Sim / Não |\n\n## Implementação\n\n```csharp\n// Interface a utilizar:\n// IDecisionProvider para classificação/decisão\n// IGenerativeAIProvider para geração\n```\n"
    },
    {
      "id": "templates_feature-spec_md",
      "path": "templates/feature-spec.md",
      "name": "feature-spec.md",
      "title": "Template: Especificação de Feature",
      "category": "templates",
      "icon": "✨",
      "size": 1050,
      "mtime": 1790520030815.8667,
      "outgoingLinks": [],
      "content": "# Template: Especificação de Feature\n\n## Informações Gerais\n\n| Campo | Valor |\n|-------|-------|\n| **Projeto** | |\n| **Feature** | |\n| **Autor** | |\n| **Data** | |\n| **Prioridade** | Alta / Média / Baixa |\n| **Status** | Proposta / Aprovada / Em desenvolvimento / Concluída |\n\n## O que (What)\nDescrição clara e concisa da funcionalidade.\n\n## Por que (Why)\nQual problema resolve? Qual valor entrega?\n\n## Como (How)\nAbordagem técnica proposta.\n\n### Componentes afetados\n- [ ] Backend API\n- [ ] Frontend\n- [ ] Banco de dados\n- [ ] IA\n- [ ] Infra\n\n### IA envolvida?\n- [ ] Sim → Execute a skill `ai-decision-gate`\n- [ ] Não\n\n## Critérios de Aceite\n1. Critério 1\n2. Critério 2\n3. Critério 3\n\n## Riscos e Dependências\n| Risco | Probabilidade | Impacto | Mitigação |\n|-------|--------------|---------|-----------|\n| | | | |\n\n## Estimativa\n| Aspecto | Estimativa |\n|---------|-----------|\n| **Complexidade** | Baixa / Média / Alta |\n| **Esforço** | X horas/dias |\n| **Risco** | Baixo / Médio / Alto |\n\n## Notas\nObservações adicionais.\n"
    },
    {
      "id": "templates_project_md",
      "path": "templates/project.md",
      "name": "project.md",
      "title": "Template: Projeto",
      "category": "templates",
      "icon": "📋",
      "size": 883,
      "mtime": 1790520038978.9402,
      "outgoingLinks": [],
      "content": "# Template: Projeto\n\n## Informações Gerais\n\n| Campo | Valor |\n|-------|-------|\n| **Nome** | |\n| **Tipo** | Web API / Mobile / Game / SaaS |\n| **Stack** | |\n| **Status** | Conceituação / Planejamento / Desenvolvimento / Produção |\n| **Início** | |\n\n## Visão\nO que este projeto faz e por que existe?\n\n## Objetivos\n1. Objetivo 1\n2. Objetivo 2\n3. Objetivo 3\n\n## Stack Técnico\n- **Backend**: \n- **Frontend**: \n- **Banco**: \n- **IA**: \n- **Infra**: \n\n## Roadmap\n- [ ] Fase 1: MVP\n- [ ] Fase 2: Funcionalidades principais\n- [ ] Fase 3: Polish e escala\n\n## Estrutura do Projeto no AI Second Brain\n```\nprojects/<nome>/\n├── PROJECT.md\n├── ARCHITECTURE.md\n├── CURRENT_STATE.md\n├── DECISIONS/\n├── AI/\n├── DATABASE/\n├── API/\n├── TESTS/\n└── MEMORY/\n    └── sessions/\n```\n\n## Links\n- Repositório: \n- Documentação: \n- Board: \n"
    },
    {
      "id": "templates_session-memory_md",
      "path": "templates/session-memory.md",
      "name": "session-memory.md",
      "title": "Template: Session Memory",
      "category": "templates",
      "icon": "💾",
      "size": 693,
      "mtime": 1790520051317.2375,
      "outgoingLinks": [],
      "content": "# Template: Session Memory\n\n## Sessão: YYYY-MM-DD — Descrição Curta\n\n### Projeto\nNome do projeto trabalhado.\n\n### Contexto\nO que motivou esta sessão de trabalho.\n\n### O que foi feito\n- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3\n\n### Decisões tomadas\n| Decisão | Motivo | ADR? |\n|---------|--------|------|\n| | | Sim/Não |\n\n### Problemas encontrados\n| Problema | Resolução | Prevenção |\n|----------|-----------|-----------|\n| | | |\n\n### Código alterado\n- Arquivo 1: descrição da mudança\n- Arquivo 2: descrição da mudança\n\n### Próximos passos\n1. Passo 1\n2. Passo 2\n3. Passo 3\n\n### Aprendizados\n- Lição 1\n- Lição 2\n\n### Tempo\n- Início: HH:MM\n- Fim: HH:MM\n- Duração: X horas\n"
    }
  ],
  "sections": [
    {
      "id": "overview",
      "label": "Visão Geral",
      "icon": "🧠",
      "items": [
        {
          "id": "dashboard",
          "label": "Dashboard",
          "icon": "📊",
          "path": "dashboard"
        },
        {
          "id": "graph",
          "label": "Grafo Neural",
          "icon": "🔮",
          "path": "graph"
        }
      ]
    },
    {
      "id": "rules",
      "label": "Rules",
      "icon": "📏",
      "items": [
        {
          "id": "_agents_rules_00-core_md",
          "label": "Regras Fundamentais do AI Second Brain",
          "icon": "⚙️",
          "path": ".agents/rules/00-core.md",
          "size": 1585
        },
        {
          "id": "_agents_rules_01-ai-decision_md",
          "label": "Regras de Decisão com IA",
          "icon": "🚦",
          "path": ".agents/rules/01-ai-decision.md",
          "size": 1584
        },
        {
          "id": "_agents_rules_02-aijev_md",
          "label": "Regras de Integração AIJev/Jev",
          "icon": "🎯",
          "path": ".agents/rules/02-aijev.md",
          "size": 2477
        },
        {
          "id": "_agents_rules_03-security_md",
          "label": "Regras de Segurança",
          "icon": "🔒",
          "path": ".agents/rules/03-security.md",
          "size": 1725
        },
        {
          "id": "_agents_rules_04-dotnet_md",
          "label": "Regras para .NET",
          "icon": "💜",
          "path": ".agents/rules/04-dotnet.md",
          "size": 1770
        },
        {
          "id": "_agents_rules_05-sql-server_md",
          "label": "Regras para SQL Server",
          "icon": "🗃️",
          "path": ".agents/rules/05-sql-server.md",
          "size": 1409
        },
        {
          "id": "_agents_rules_06-documentation_md",
          "label": "Regras de Documentação",
          "icon": "📝",
          "path": ".agents/rules/06-documentation.md",
          "size": 1444
        }
      ],
      "badge": 7
    },
    {
      "id": "skills",
      "label": "Skills",
      "icon": "⚡",
      "items": [
        {
          "id": "_agents_skills_ai-decision-gate_SKILL_md",
          "label": "ai-decision-gate",
          "icon": "🚦",
          "path": ".agents/skills/ai-decision-gate/SKILL.md",
          "size": 2416
        },
        {
          "id": "_agents_skills_ai-integration_SKILL_md",
          "label": "ai-integration",
          "icon": "🔌",
          "path": ".agents/skills/ai-integration/SKILL.md",
          "size": 2587
        },
        {
          "id": "_agents_skills_architecture-review_SKILL_md",
          "label": "architecture-review",
          "icon": "🏗️",
          "path": ".agents/skills/architecture-review/SKILL.md",
          "size": 1542
        },
        {
          "id": "_agents_skills_bug-investigation_SKILL_md",
          "label": "bug-investigation",
          "icon": "🐛",
          "path": ".agents/skills/bug-investigation/SKILL.md",
          "size": 1854
        },
        {
          "id": "_agents_skills_database-review_SKILL_md",
          "label": "database-review",
          "icon": "📄",
          "path": ".agents/skills/database-review/SKILL.md",
          "size": 1630
        },
        {
          "id": "_agents_skills_new-feature_SKILL_md",
          "label": "new-feature",
          "icon": "✨",
          "path": ".agents/skills/new-feature/SKILL.md",
          "size": 1617
        },
        {
          "id": "_agents_skills_project-onboarding_SKILL_md",
          "label": "project-onboarding",
          "icon": "🚀",
          "path": ".agents/skills/project-onboarding/SKILL.md",
          "size": 1993
        },
        {
          "id": "_agents_skills_session-memory_SKILL_md",
          "label": "session-memory",
          "icon": "💾",
          "path": ".agents/skills/session-memory/SKILL.md",
          "size": 1580
        }
      ],
      "badge": 8
    },
    {
      "id": "projects",
      "label": "Projects",
      "icon": "📁",
      "items": [
        {
          "id": "projects_Assistente-Mobile_CURRENT_STATE_md",
          "label": "Assistente Mobile — Estado Atual",
          "icon": "💾",
          "path": "projects/Assistente-Mobile/CURRENT_STATE.md",
          "size": 257
        },
        {
          "id": "projects_Assistente-Mobile_PROJECT_md",
          "label": "Assistente Mobile",
          "icon": "📱",
          "path": "projects/Assistente-Mobile/PROJECT.md",
          "size": 535
        },
        {
          "id": "projects_JobSentinel_AI_AI_USE_CASES_md",
          "label": "JobSentinel — Casos de Uso de IA",
          "icon": "⚡",
          "path": "projects/JobSentinel/AI/AI_USE_CASES.md",
          "size": 1260
        },
        {
          "id": "projects_JobSentinel_ARCHITECTURE_md",
          "label": "JobSentinel — Arquitetura",
          "icon": "🏗️",
          "path": "projects/JobSentinel/ARCHITECTURE.md",
          "size": 4494
        },
        {
          "id": "projects_JobSentinel_CURRENT_STATE_md",
          "label": "JobSentinel — Estado Atual",
          "icon": "💾",
          "path": "projects/JobSentinel/CURRENT_STATE.md",
          "size": 760
        },
        {
          "id": "projects_JobSentinel_DECISIONS_ADR-0001-ai-decision-gate_md",
          "label": "ADR-0001: AI Decision Gate como padrão de roteamento de IA",
          "icon": "🚦",
          "path": "projects/JobSentinel/DECISIONS/ADR-0001-ai-decision-gate.md",
          "size": 1111
        },
        {
          "id": "projects_JobSentinel_PROJECT_md",
          "label": "JobSentinel",
          "icon": "⚡",
          "path": "projects/JobSentinel/PROJECT.md",
          "size": 1554
        },
        {
          "id": "projects_Sabor-em-Conflito_CURRENT_STATE_md",
          "label": "Sabor em Conflito — Estado Atual",
          "icon": "💾",
          "path": "projects/Sabor-em-Conflito/CURRENT_STATE.md",
          "size": 263
        },
        {
          "id": "projects_Sabor-em-Conflito_PROJECT_md",
          "label": "Sabor em Conflito",
          "icon": "🎮",
          "path": "projects/Sabor-em-Conflito/PROJECT.md",
          "size": 601
        }
      ],
      "badge": 9
    },
    {
      "id": "knowledge",
      "label": "Knowledge",
      "icon": "📚",
      "items": [
        {
          "id": "knowledge_ai_AI_GATEWAY_md",
          "label": "AI Gateway Pattern",
          "icon": "🔌",
          "path": "knowledge/ai/AI_GATEWAY.md",
          "size": 3424
        },
        {
          "id": "knowledge_ai_AIJEV_md",
          "label": "AIJev / Jev — Referência",
          "icon": "🎯",
          "path": "knowledge/ai/AIJEV.md",
          "size": 1519
        },
        {
          "id": "knowledge_ai_MODEL_SELECTION_md",
          "label": "Seleção de Modelos de IA",
          "icon": "📄",
          "path": "knowledge/ai/MODEL_SELECTION.md",
          "size": 1676
        },
        {
          "id": "knowledge_architecture_PATTERNS_md",
          "label": "Padrões de Arquitetura",
          "icon": "🏗️",
          "path": "knowledge/architecture/PATTERNS.md",
          "size": 1042
        },
        {
          "id": "knowledge_global_INDEX_md",
          "label": "Índice de Conhecimento Global",
          "icon": "📄",
          "path": "knowledge/global/INDEX.md",
          "size": 837
        }
      ],
      "badge": 5
    },
    {
      "id": "decisions",
      "label": "Decisions",
      "icon": "⚖️",
      "items": [
        {
          "id": "decisions_GLOBAL_DECISIONS_md",
          "label": "Decisões Globais",
          "icon": "⚖️",
          "path": "decisions/GLOBAL_DECISIONS.md",
          "size": 1250
        }
      ],
      "badge": 1
    },
    {
      "id": "memory",
      "label": "Memory",
      "icon": "🧮",
      "items": [
        {
          "id": "memory_current-state_md",
          "label": "Estado Atual do AI Second Brain",
          "icon": "💾",
          "path": "memory/current-state.md",
          "size": 840
        },
        {
          "id": "memory_lessons-learned_md",
          "label": "Lições Aprendidas",
          "icon": "💾",
          "path": "memory/lessons-learned.md",
          "size": 1198
        }
      ],
      "badge": 2
    },
    {
      "id": "templates",
      "label": "Templates",
      "icon": "📋",
      "items": [
        {
          "id": "templates_ai-use-case_md",
          "label": "Template: Caso de Uso de IA",
          "icon": "📋",
          "path": "templates/ai-use-case.md",
          "size": 1205
        },
        {
          "id": "templates_feature-spec_md",
          "label": "Template: Especificação de Feature",
          "icon": "✨",
          "path": "templates/feature-spec.md",
          "size": 1050
        },
        {
          "id": "templates_project_md",
          "label": "Template: Projeto",
          "icon": "📋",
          "path": "templates/project.md",
          "size": 883
        },
        {
          "id": "templates_session-memory_md",
          "label": "Template: Session Memory",
          "icon": "💾",
          "path": "templates/session-memory.md",
          "size": 693
        }
      ],
      "badge": 4
    },
    {
      "id": "docs",
      "label": "Docs & Guias",
      "icon": "📖",
      "items": [
        {
          "id": "docs_COMO_UTILIZAR_O_PROJETO_md",
          "label": "Como Utilizar o AI Second Brain na Prática",
          "icon": "📝",
          "path": "docs/COMO_UTILIZAR_O_PROJETO.md",
          "size": 19440
        },
        {
          "id": "docs_GUIA_PRATICO_md",
          "label": "Guia Prático do AI Second Brain",
          "icon": "📝",
          "path": "docs/GUIA_PRATICO.md",
          "size": 3228
        }
      ],
      "badge": 2
    },
    {
      "id": "core",
      "label": "Sistema / Core",
      "icon": "⚙️",
      "items": [
        {
          "id": "GEMINI_md",
          "label": "AI SECOND BRAIN — ALFREDO AI OS",
          "icon": "🧠",
          "path": "GEMINI.md",
          "size": 3873
        },
        {
          "id": "README_md",
          "label": "AI Second Brain — Alfredo AI OS",
          "icon": "🧠",
          "path": "README.md",
          "size": 3698
        }
      ],
      "badge": 2
    }
  ],
  "graphNodes": [
    {
      "id": "brain",
      "label": "AI Second Brain",
      "group": "core",
      "size": 28,
      "icon": "🧠",
      "path": "dashboard"
    },
    {
      "id": "hub-rules",
      "label": "Rules Cortex",
      "group": "rules",
      "size": 18,
      "icon": "📏",
      "path": "rules"
    },
    {
      "id": "hub-skills",
      "label": "Skills Engine",
      "group": "skills",
      "size": 18,
      "icon": "⚡",
      "path": "skills"
    },
    {
      "id": "hub-projects",
      "label": "Projects Hub",
      "group": "projects",
      "size": 18,
      "icon": "📁",
      "path": "projects"
    },
    {
      "id": "hub-knowledge",
      "label": "Knowledge Base",
      "group": "knowledge",
      "size": 18,
      "icon": "📚",
      "path": "knowledge"
    },
    {
      "id": "hub-decisions",
      "label": "Decisions Ledger",
      "group": "decisions",
      "size": 16,
      "icon": "⚖️",
      "path": "decisions"
    },
    {
      "id": "hub-memory",
      "label": "Memory Bank",
      "group": "memory",
      "size": 16,
      "icon": "🧮",
      "path": "memory"
    },
    {
      "id": "hub-templates",
      "label": "Templates",
      "group": "templates",
      "size": 16,
      "icon": "📋",
      "path": "templates"
    },
    {
      "id": "hub-docs",
      "label": "Documentation",
      "group": "docs",
      "size": 16,
      "icon": "📖",
      "path": "docs"
    },
    {
      "id": "_agents_rules_00-core_md",
      "label": "Regras Fundamentais do AI Second Brain",
      "group": "rules",
      "size": 9,
      "icon": "⚙️",
      "path": ".agents/rules/00-core.md"
    },
    {
      "id": "_agents_rules_01-ai-decision_md",
      "label": "Regras de Decisão com IA",
      "group": "rules",
      "size": 9,
      "icon": "🚦",
      "path": ".agents/rules/01-ai-decision.md"
    },
    {
      "id": "_agents_rules_02-aijev_md",
      "label": "Regras de Integração AIJev/Jev",
      "group": "rules",
      "size": 12,
      "icon": "🎯",
      "path": ".agents/rules/02-aijev.md"
    },
    {
      "id": "_agents_rules_03-security_md",
      "label": "Regras de Segurança",
      "group": "rules",
      "size": 9,
      "icon": "🔒",
      "path": ".agents/rules/03-security.md"
    },
    {
      "id": "_agents_rules_04-dotnet_md",
      "label": "Regras para .NET",
      "group": "rules",
      "size": 9,
      "icon": "💜",
      "path": ".agents/rules/04-dotnet.md"
    },
    {
      "id": "_agents_rules_05-sql-server_md",
      "label": "Regras para SQL Server",
      "group": "rules",
      "size": 9,
      "icon": "🗃️",
      "path": ".agents/rules/05-sql-server.md"
    },
    {
      "id": "_agents_rules_06-documentation_md",
      "label": "Regras de Documentação",
      "group": "rules",
      "size": 9,
      "icon": "📝",
      "path": ".agents/rules/06-documentation.md"
    },
    {
      "id": "_agents_skills_ai-decision-gate_SKILL_md",
      "label": "ai-decision-gate",
      "group": "skills",
      "size": 12,
      "icon": "🚦",
      "path": ".agents/skills/ai-decision-gate/SKILL.md"
    },
    {
      "id": "_agents_skills_ai-integration_SKILL_md",
      "label": "ai-integration",
      "group": "skills",
      "size": 12,
      "icon": "🔌",
      "path": ".agents/skills/ai-integration/SKILL.md"
    },
    {
      "id": "_agents_skills_architecture-review_SKILL_md",
      "label": "architecture-review",
      "group": "skills",
      "size": 9,
      "icon": "🏗️",
      "path": ".agents/skills/architecture-review/SKILL.md"
    },
    {
      "id": "_agents_skills_bug-investigation_SKILL_md",
      "label": "bug-investigation",
      "group": "skills",
      "size": 9,
      "icon": "🐛",
      "path": ".agents/skills/bug-investigation/SKILL.md"
    },
    {
      "id": "_agents_skills_database-review_SKILL_md",
      "label": "database-review",
      "group": "skills",
      "size": 9,
      "icon": "📄",
      "path": ".agents/skills/database-review/SKILL.md"
    },
    {
      "id": "_agents_skills_new-feature_SKILL_md",
      "label": "new-feature",
      "group": "skills",
      "size": 9,
      "icon": "✨",
      "path": ".agents/skills/new-feature/SKILL.md"
    },
    {
      "id": "_agents_skills_project-onboarding_SKILL_md",
      "label": "project-onboarding",
      "group": "skills",
      "size": 9,
      "icon": "🚀",
      "path": ".agents/skills/project-onboarding/SKILL.md"
    },
    {
      "id": "_agents_skills_session-memory_SKILL_md",
      "label": "session-memory",
      "group": "skills",
      "size": 9,
      "icon": "💾",
      "path": ".agents/skills/session-memory/SKILL.md"
    },
    {
      "id": "decisions_GLOBAL_DECISIONS_md",
      "label": "Decisões Globais",
      "group": "decisions",
      "size": 9,
      "icon": "⚖️",
      "path": "decisions/GLOBAL_DECISIONS.md"
    },
    {
      "id": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "label": "Como Utilizar o AI Second Brain na Prática",
      "group": "docs",
      "size": 12,
      "icon": "📝",
      "path": "docs/COMO_UTILIZAR_O_PROJETO.md"
    },
    {
      "id": "docs_GUIA_PRATICO_md",
      "label": "Guia Prático do AI Second Brain",
      "group": "docs",
      "size": 12,
      "icon": "📝",
      "path": "docs/GUIA_PRATICO.md"
    },
    {
      "id": "GEMINI_md",
      "label": "AI SECOND BRAIN — ALFREDO AI OS",
      "group": "core",
      "size": 12,
      "icon": "🧠",
      "path": "GEMINI.md"
    },
    {
      "id": "knowledge_ai_AIJEV_md",
      "label": "AIJev / Jev — Referência",
      "group": "knowledge",
      "size": 9,
      "icon": "🎯",
      "path": "knowledge/ai/AIJEV.md"
    },
    {
      "id": "knowledge_ai_AI_GATEWAY_md",
      "label": "AI Gateway Pattern",
      "group": "knowledge",
      "size": 12,
      "icon": "🔌",
      "path": "knowledge/ai/AI_GATEWAY.md"
    },
    {
      "id": "knowledge_ai_MODEL_SELECTION_md",
      "label": "Seleção de Modelos de IA",
      "group": "knowledge",
      "size": 9,
      "icon": "📄",
      "path": "knowledge/ai/MODEL_SELECTION.md"
    },
    {
      "id": "knowledge_architecture_PATTERNS_md",
      "label": "Padrões de Arquitetura",
      "group": "knowledge",
      "size": 9,
      "icon": "🏗️",
      "path": "knowledge/architecture/PATTERNS.md"
    },
    {
      "id": "knowledge_global_INDEX_md",
      "label": "Índice de Conhecimento Global",
      "group": "knowledge",
      "size": 9,
      "icon": "📄",
      "path": "knowledge/global/INDEX.md"
    },
    {
      "id": "memory_current-state_md",
      "label": "Estado Atual do AI Second Brain",
      "group": "memory",
      "size": 9,
      "icon": "💾",
      "path": "memory/current-state.md"
    },
    {
      "id": "memory_lessons-learned_md",
      "label": "Lições Aprendidas",
      "group": "memory",
      "size": 9,
      "icon": "💾",
      "path": "memory/lessons-learned.md"
    },
    {
      "id": "projects_Assistente-Mobile_CURRENT_STATE_md",
      "label": "Assistente Mobile — Estado Atual",
      "group": "projects",
      "size": 9,
      "icon": "💾",
      "path": "projects/Assistente-Mobile/CURRENT_STATE.md"
    },
    {
      "id": "projects_Assistente-Mobile_PROJECT_md",
      "label": "Assistente Mobile",
      "group": "projects",
      "size": 9,
      "icon": "📱",
      "path": "projects/Assistente-Mobile/PROJECT.md"
    },
    {
      "id": "projects_JobSentinel_AI_AI_USE_CASES_md",
      "label": "JobSentinel — Casos de Uso de IA",
      "group": "projects",
      "size": 9,
      "icon": "⚡",
      "path": "projects/JobSentinel/AI/AI_USE_CASES.md"
    },
    {
      "id": "projects_JobSentinel_ARCHITECTURE_md",
      "label": "JobSentinel — Arquitetura",
      "group": "projects",
      "size": 12,
      "icon": "🏗️",
      "path": "projects/JobSentinel/ARCHITECTURE.md"
    },
    {
      "id": "projects_JobSentinel_CURRENT_STATE_md",
      "label": "JobSentinel — Estado Atual",
      "group": "projects",
      "size": 9,
      "icon": "💾",
      "path": "projects/JobSentinel/CURRENT_STATE.md"
    },
    {
      "id": "projects_JobSentinel_DECISIONS_ADR-0001-ai-decision-gate_md",
      "label": "ADR-0001: AI Decision Gate como padrão de roteamento de IA",
      "group": "projects",
      "size": 9,
      "icon": "🚦",
      "path": "projects/JobSentinel/DECISIONS/ADR-0001-ai-decision-gate.md"
    },
    {
      "id": "projects_JobSentinel_PROJECT_md",
      "label": "JobSentinel",
      "group": "projects",
      "size": 9,
      "icon": "⚡",
      "path": "projects/JobSentinel/PROJECT.md"
    },
    {
      "id": "projects_Sabor-em-Conflito_CURRENT_STATE_md",
      "label": "Sabor em Conflito — Estado Atual",
      "group": "projects",
      "size": 9,
      "icon": "💾",
      "path": "projects/Sabor-em-Conflito/CURRENT_STATE.md"
    },
    {
      "id": "projects_Sabor-em-Conflito_PROJECT_md",
      "label": "Sabor em Conflito",
      "group": "projects",
      "size": 9,
      "icon": "🎮",
      "path": "projects/Sabor-em-Conflito/PROJECT.md"
    },
    {
      "id": "README_md",
      "label": "AI Second Brain — Alfredo AI OS",
      "group": "core",
      "size": 12,
      "icon": "🧠",
      "path": "README.md"
    },
    {
      "id": "templates_ai-use-case_md",
      "label": "Template: Caso de Uso de IA",
      "group": "templates",
      "size": 9,
      "icon": "📋",
      "path": "templates/ai-use-case.md"
    },
    {
      "id": "templates_feature-spec_md",
      "label": "Template: Especificação de Feature",
      "group": "templates",
      "size": 9,
      "icon": "✨",
      "path": "templates/feature-spec.md"
    },
    {
      "id": "templates_project_md",
      "label": "Template: Projeto",
      "group": "templates",
      "size": 9,
      "icon": "📋",
      "path": "templates/project.md"
    },
    {
      "id": "templates_session-memory_md",
      "label": "Template: Session Memory",
      "group": "templates",
      "size": 9,
      "icon": "💾",
      "path": "templates/session-memory.md"
    }
  ],
  "graphEdges": [
    {
      "from": "brain",
      "to": "hub-rules"
    },
    {
      "from": "brain",
      "to": "hub-skills"
    },
    {
      "from": "brain",
      "to": "hub-projects"
    },
    {
      "from": "brain",
      "to": "hub-knowledge"
    },
    {
      "from": "brain",
      "to": "hub-decisions"
    },
    {
      "from": "brain",
      "to": "hub-memory"
    },
    {
      "from": "brain",
      "to": "hub-templates"
    },
    {
      "from": "brain",
      "to": "hub-docs"
    },
    {
      "from": "hub-rules",
      "to": "_agents_rules_00-core_md"
    },
    {
      "from": "hub-rules",
      "to": "_agents_rules_01-ai-decision_md"
    },
    {
      "from": "hub-rules",
      "to": "_agents_rules_02-aijev_md"
    },
    {
      "from": "hub-rules",
      "to": "_agents_rules_03-security_md"
    },
    {
      "from": "hub-rules",
      "to": "_agents_rules_04-dotnet_md"
    },
    {
      "from": "hub-rules",
      "to": "_agents_rules_05-sql-server_md"
    },
    {
      "from": "hub-rules",
      "to": "_agents_rules_06-documentation_md"
    },
    {
      "from": "hub-skills",
      "to": "_agents_skills_ai-decision-gate_SKILL_md"
    },
    {
      "from": "hub-skills",
      "to": "_agents_skills_ai-integration_SKILL_md"
    },
    {
      "from": "hub-skills",
      "to": "_agents_skills_architecture-review_SKILL_md"
    },
    {
      "from": "hub-skills",
      "to": "_agents_skills_bug-investigation_SKILL_md"
    },
    {
      "from": "hub-skills",
      "to": "_agents_skills_database-review_SKILL_md"
    },
    {
      "from": "hub-skills",
      "to": "_agents_skills_new-feature_SKILL_md"
    },
    {
      "from": "hub-skills",
      "to": "_agents_skills_project-onboarding_SKILL_md"
    },
    {
      "from": "hub-skills",
      "to": "_agents_skills_session-memory_SKILL_md"
    },
    {
      "from": "hub-decisions",
      "to": "decisions_GLOBAL_DECISIONS_md"
    },
    {
      "from": "hub-docs",
      "to": "docs_COMO_UTILIZAR_O_PROJETO_md"
    },
    {
      "from": "hub-docs",
      "to": "docs_GUIA_PRATICO_md"
    },
    {
      "from": "brain",
      "to": "GEMINI_md"
    },
    {
      "from": "hub-knowledge",
      "to": "knowledge_ai_AIJEV_md"
    },
    {
      "from": "hub-knowledge",
      "to": "knowledge_ai_AI_GATEWAY_md"
    },
    {
      "from": "hub-knowledge",
      "to": "knowledge_ai_MODEL_SELECTION_md"
    },
    {
      "from": "hub-knowledge",
      "to": "knowledge_architecture_PATTERNS_md"
    },
    {
      "from": "hub-knowledge",
      "to": "knowledge_global_INDEX_md"
    },
    {
      "from": "hub-memory",
      "to": "memory_current-state_md"
    },
    {
      "from": "hub-memory",
      "to": "memory_lessons-learned_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_JobSentinel_AI_AI_USE_CASES_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_JobSentinel_DECISIONS_ADR-0001-ai-decision-gate_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "brain",
      "to": "README_md"
    },
    {
      "from": "hub-templates",
      "to": "templates_ai-use-case_md"
    },
    {
      "from": "hub-templates",
      "to": "templates_feature-spec_md"
    },
    {
      "from": "hub-templates",
      "to": "templates_project_md"
    },
    {
      "from": "hub-templates",
      "to": "templates_session-memory_md"
    },
    {
      "from": "_agents_rules_04-dotnet_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "_agents_rules_04-dotnet_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "_agents_rules_04-dotnet_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "_agents_rules_04-dotnet_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "_agents_rules_04-dotnet_md",
      "to": "templates_project_md"
    },
    {
      "from": "_agents_rules_06-documentation_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "_agents_rules_06-documentation_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "_agents_rules_06-documentation_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "_agents_rules_06-documentation_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "_agents_rules_06-documentation_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "_agents_rules_06-documentation_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "_agents_rules_06-documentation_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "_agents_rules_06-documentation_md",
      "to": "templates_project_md"
    },
    {
      "from": "_agents_skills_ai-integration_SKILL_md",
      "to": "_agents_rules_03-security_md"
    },
    {
      "from": "_agents_skills_architecture-review_SKILL_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "_agents_skills_architecture-review_SKILL_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "_agents_skills_architecture-review_SKILL_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "_agents_skills_architecture-review_SKILL_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "_agents_skills_architecture-review_SKILL_md",
      "to": "templates_project_md"
    },
    {
      "from": "_agents_skills_bug-investigation_SKILL_md",
      "to": "memory_lessons-learned_md"
    },
    {
      "from": "_agents_skills_bug-investigation_SKILL_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_bug-investigation_SKILL_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_bug-investigation_SKILL_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "_agents_rules_03-security_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "_agents_rules_04-dotnet_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "_agents_rules_05-sql-server_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "templates_feature-spec_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "templates_project_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "_agents_rules_01-ai-decision_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "GEMINI_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_JobSentinel_AI_AI_USE_CASES_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "README_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "templates_project_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "memory_current-state_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "memory_lessons-learned_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "templates_project_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "templates_session-memory_md"
    },
    {
      "from": "decisions_GLOBAL_DECISIONS_md",
      "to": "_agents_rules_01-ai-decision_md"
    },
    {
      "from": "decisions_GLOBAL_DECISIONS_md",
      "to": "knowledge_ai_AI_GATEWAY_md"
    },
    {
      "from": "decisions_GLOBAL_DECISIONS_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "decisions_GLOBAL_DECISIONS_md",
      "to": "projects_JobSentinel_DECISIONS_ADR-0001-ai-decision-gate_md"
    },
    {
      "from": "decisions_GLOBAL_DECISIONS_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "decisions_GLOBAL_DECISIONS_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "decisions_GLOBAL_DECISIONS_md",
      "to": "templates_project_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "_agents_rules_04-dotnet_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "_agents_rules_05-sql-server_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "GEMINI_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "knowledge_ai_AI_GATEWAY_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_JobSentinel_AI_AI_USE_CASES_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "README_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "templates_project_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "templates_session-memory_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "docs_COMO_UTILIZAR_O_PROJETO_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "memory_current-state_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "memory_lessons-learned_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "templates_project_md"
    },
    {
      "from": "GEMINI_md",
      "to": "_agents_rules_03-security_md"
    },
    {
      "from": "GEMINI_md",
      "to": "knowledge_ai_MODEL_SELECTION_md"
    },
    {
      "from": "GEMINI_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "GEMINI_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "GEMINI_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "GEMINI_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "GEMINI_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "GEMINI_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "GEMINI_md",
      "to": "templates_project_md"
    },
    {
      "from": "knowledge_ai_MODEL_SELECTION_md",
      "to": "GEMINI_md"
    },
    {
      "from": "knowledge_architecture_PATTERNS_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "knowledge_global_INDEX_md",
      "to": "knowledge_ai_AI_GATEWAY_md"
    },
    {
      "from": "knowledge_global_INDEX_md",
      "to": "knowledge_ai_MODEL_SELECTION_md"
    },
    {
      "from": "knowledge_global_INDEX_md",
      "to": "knowledge_architecture_PATTERNS_md"
    },
    {
      "from": "knowledge_global_INDEX_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "projects_Assistente-Mobile_CURRENT_STATE_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "projects_Assistente-Mobile_PROJECT_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "projects_JobSentinel_PROJECT_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "projects_JobSentinel_PROJECT_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "projects_JobSentinel_PROJECT_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "projects_JobSentinel_PROJECT_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "README_md",
      "to": "docs_COMO_UTILIZAR_O_PROJETO_md"
    },
    {
      "from": "README_md",
      "to": "GEMINI_md"
    },
    {
      "from": "README_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "README_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "README_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "README_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    },
    {
      "from": "README_md",
      "to": "templates_project_md"
    },
    {
      "from": "templates_project_md",
      "to": "projects_Assistente-Mobile_CURRENT_STATE_md"
    },
    {
      "from": "templates_project_md",
      "to": "projects_Assistente-Mobile_PROJECT_md"
    },
    {
      "from": "templates_project_md",
      "to": "projects_JobSentinel_ARCHITECTURE_md"
    },
    {
      "from": "templates_project_md",
      "to": "projects_JobSentinel_CURRENT_STATE_md"
    },
    {
      "from": "templates_project_md",
      "to": "projects_JobSentinel_PROJECT_md"
    },
    {
      "from": "templates_project_md",
      "to": "projects_Sabor-em-Conflito_CURRENT_STATE_md"
    },
    {
      "from": "templates_project_md",
      "to": "projects_Sabor-em-Conflito_PROJECT_md"
    }
  ],
  "groupColors": {
    "core": {
      "fill": "#6366f1",
      "stroke": "#818cf8",
      "glow": "rgba(99, 102, 241, 0.4)"
    },
    "rules": {
      "fill": "#f59e0b",
      "stroke": "#fbbf24",
      "glow": "rgba(245, 158, 11, 0.35)"
    },
    "skills": {
      "fill": "#10b981",
      "stroke": "#34d399",
      "glow": "rgba(16, 185, 129, 0.35)"
    },
    "projects": {
      "fill": "#8b5cf6",
      "stroke": "#a78bfa",
      "glow": "rgba(139, 92, 246, 0.35)"
    },
    "knowledge": {
      "fill": "#3b82f6",
      "stroke": "#60a5fa",
      "glow": "rgba(59, 130, 246, 0.35)"
    },
    "decisions": {
      "fill": "#14b8a6",
      "stroke": "#2dd4bf",
      "glow": "rgba(20, 184, 166, 0.35)"
    },
    "memory": {
      "fill": "#ec4899",
      "stroke": "#f472b6",
      "glow": "rgba(236, 72, 153, 0.35)"
    },
    "templates": {
      "fill": "#f97316",
      "stroke": "#fb923c",
      "glow": "rgba(249, 115, 22, 0.35)"
    },
    "docs": {
      "fill": "#06b6d4",
      "stroke": "#22d3ee",
      "glow": "rgba(6, 182, 212, 0.35)"
    }
  },
  "stats": {
    "totalFiles": 40,
    "rulesCount": 7,
    "skillsCount": 8,
    "projectsCount": 9,
    "knowledgeCount": 5,
    "decisionsCount": 1,
    "memoryCount": 2,
    "templatesCount": 4,
    "docsCount": 2,
    "totalNodes": 49,
    "totalEdges": 173
  }
};
