// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Dynamic Vault Snapshot
// Auto-generated: 2026-09-28T19:05:54.271Z
// ═══════════════════════════════════════════════════

window.VAULT_SNAPSHOT = {
  "timestamp": 1790622354271,
  "files": [
    {
      "id": "_agents_rules_00-core_md",
      "path": ".agents/rules/00-core.md",
      "name": "00-core.md",
      "title": "Regras Fundamentais do AI Second Brain",
      "category": "rules",
      "icon": "⚙️",
      "size": 1911,
      "mtime": 1790609679156.6394,
      "outgoingLinks": [],
      "content": "# Regras Fundamentais do AI Second Brain\n\n> Estas regras são aplicadas a **todo** trabalho realizado neste workspace.\n\n## Identidade\n\n- Você opera dentro do **AI Second Brain** do Alfredo.\n- Seu objetivo é ser um parceiro de desenvolvimento, não um gerador de texto.\n- Você acumula conhecimento e respeita decisões anteriores.\n\n## Princípios\n\n1. **Context First** — Sempre leia o contexto antes de agir.\n2. **Decision Aware** — Consulte decisões anteriores antes de alterar arquitetura.\n3. **Memory Persistent** — Atualize a memória após trabalho significativo.\n4. **Quality Over Speed** — Prefira soluções robustas a soluções rápidas.\n5. **Explicit Over Implicit** — Documente premissas e decisões.\n6. **Zero Fabrication** — NUNCA invente contexto que não existe na documentação do projeto. Não gere arquivos, lore, telas ou especificações especulativas para preencher lacunas. Se algo não existe, declare expressamente como não definido.\n\n## Fluxo de Trabalho Obrigatório\n\n```\n1. ENTENDER → O que está sendo pedido?\n2. CONTEXTUALIZAR → Qual projeto? Qual estado atual?\n3. CLASSIFICAR → Que tipo de tarefa é?\n4. PLANEJAR → Qual a melhor abordagem?\n5. EXECUTAR → Implementar com qualidade.\n6. VALIDAR → Testar e verificar.\n7. DOCUMENTAR → Atualizar docs e memória.\n```\n\n## Convenções\n\n- O código deve seguir os padrões idiomáticos oficiais da linguagem e ecossistema adotados no projeto.\n- Commits seguem Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`).\n- Documentação técnica em **Markdown** com formatação padronizada e links verificáveis.\n- Nomes de arquivos técnicos em inglês quando aplicável, conteúdo e documentação em português.\n\n## Comunicação\n\n- Responda em **português brasileiro** por padrão.\n- Use termos técnicos em inglês quando apropriado.\n- Seja direto e objetivo.\n- Cite referências quando relevante.\n"
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
      "id": "_agents_rules_04-documentation_md",
      "path": ".agents/rules/04-documentation.md",
      "name": "04-documentation.md",
      "title": "Regras de Documentação",
      "category": "rules",
      "icon": "📝",
      "size": 1706,
      "mtime": 1790604219838.682,
      "outgoingLinks": [],
      "content": "# Regras de Documentação\n\n> Padrões para documentação em todos os projetos.\n\n## Princípios\n\n1. **Documentação é código** — Vive no repositório, versionada com Git.\n2. **Atualizada ou deletada** — Documentação desatualizada é pior que nenhuma.\n3. **Para o próximo desenvolvedor** — Escreva para quem não tem contexto.\n4. **Decisões registradas** — Toda decisão arquitetural gera um ADR.\n5. **Zero invenção de contexto** — NUNCA crie documentação especulativa, requisitos fictícios ou placeholders para simular progresso. Se um projeto ou funcionalidade ainda está em fase de ideia, a documentação deve registrar unicamente essa realidade.\n\n## Tipos de Documentação\n\n| Tipo | Onde | Quando atualizar |\n|------|------|-----------------|\n| **PROJECT.md** | `projects/<nome>/` | Mudanças de escopo |\n| **ARCHITECTURE.md** | `projects/<nome>/` | Mudanças arquiteturais |\n| **CURRENT_STATE.md** | `projects/<nome>/` | A cada sessão significativa |\n| **ADR** | `projects/<nome>/DECISIONS/` | Cada decisão arquitetural |\n| **Knowledge** | `knowledge/<domínio>/` | Aprendizados novos |\n| **Memory** | `memory/` | Fim de cada sessão |\n\n## Formato de ADR (Architecture Decision Record)\n\n```markdown\n# ADR-XXXX: Título da Decisão\n\n## Status\nProposta | Aceita | Rejeitada | Substituída\n\n## Contexto\nO que motivou esta decisão?\n\n## Decisão\nO que foi decidido?\n\n## Consequências\nO que muda com esta decisão?\n\n## Alternativas Consideradas\nQuais outras opções foram avaliadas?\n```\n\n## Memory Format\n\n```markdown\n# Sessão: YYYY-MM-DD\n\n## O que foi feito\n- Item 1\n- Item 2\n\n## Decisões tomadas\n- Decisão 1\n\n## Próximos passos\n- Passo 1\n\n## Aprendizados\n- Lição 1\n```\n"
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
      "icon": "📄",
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
      "icon": "🗄️",
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
      "size": 1248,
      "mtime": 1790609892439.0444,
      "outgoingLinks": [],
      "content": "# Decisões Globais\n\n> Decisões que afetam todos os projetos do AI Second Brain.\n\n## ADR-G001: Adoção do AI Decision Gate Pattern\n- **Status**: Aceita\n- **Data**: 2026-09-27\n- **Descrição**: Todo projeto que utilizar IA deve passar pelo Decision Gate\n  para determinar se a tarefa é determinística, classificação/decisão, ou geração.\n- **Detalhes**: Ver `.agents/rules/01-ai-decision.md` e `knowledge/ai/AIJEV.md`\n\n## ADR-G002: AI Gateway como abstração unificada\n- **Status**: Aceita\n- **Data**: 2026-09-27\n- **Descrição**: Todo acesso a IA deve ser feito através de interfaces abstratas\n  (`IDecisionProvider`, `IGenerativeAIProvider`) para desacoplar de providers.\n- **Detalhes**: Ver `knowledge/ai/AI_GATEWAY.md`\n\n## ADR-G003: Formato Antigravity nativo para AI Second Brain\n- **Status**: Aceita\n- **Data**: 2026-09-27\n- **Descrição**: O AI Second Brain utiliza o formato nativo do Antigravity\n  (Rules, Skills, Plugins) em vez de formatos genéricos.\n- **Motivo**: Garante descoberta automática e funcionamento correto das features.\n\n## ADR-G004: Documentação como código\n- **Status**: Aceita\n- **Data**: 2026-09-27\n- **Descrição**: Toda documentação vive no repositório, versionada com Git,\n  em formato Markdown.\n"
    },
    {
      "id": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "path": "docs/COMO_UTILIZAR_O_PROJETO.md",
      "name": "COMO_UTILIZAR_O_PROJETO.md",
      "title": "Como Utilizar o AI Second Brain na Prática",
      "category": "docs",
      "icon": "📝",
      "size": 19447,
      "mtime": 1790609964421.4382,
      "outgoingLinks": [],
      "content": "# Como Utilizar o AI Second Brain na Prática\n## Guia Definitivo: Criação de Novos Projetos e Integração de Projetos Existentes\n\n> **Este documento é o manual oficial de governança, onboarding e operação diária do AI Second Brain (Alfredo AI OS).**  \n> Ele orienta passo a passo como iniciar novos projetos do zero (*greenfield*) e como acoplar projetos existentes (*brownfield*), garantindo persistência de memória, governança de IA, padronização técnica e rastreabilidade total de decisões.\n\n---\n\n## 📑 Sumário\n\n1. [O Modelo Mental: Hub Central vs. Repositórios Satélites](#1-o-modelo-mental-hub-central-vs-repositórios-satélites)\n2. [Cenário A: Criação de um NOVO Projeto do Zero (Greenfield)](#2-cenário-a-criação-de-um-novo-projeto-do-zero-greenfield)\n3. [Cenário B: Integração de um Projeto JÁ EXISTENTE (Brownfield)](#3-cenário-b-integração-de-um-projeto-já-existente-brownfield)\n4. [Operação do Dia a Dia: O Ciclo de Vida de uma Sessão de Trabalho](#4-operação-do-dia-a-dia-o-ciclo-de-vida-de-uma-sessão-de-trabalho)\n5. [Governança e Roteamento de IA na Prática (AIJev First)](#5-governança-e-roteamento-de-ia-na-prática-aijev-first)\n6. [Catálogo de Prompts Prontos para o Desenvolvedor](#6-catálogo-de-prompts-prontos-para-o-desenvolvedor)\n7. [Checklists Operacionais de Consulta Rápida](#7-checklists-operacionais-de-consulta-rápida)\n\n---\n\n## 1. O Modelo Mental: Hub Central vs. Repositórios Satélites\n\nO maior erro no desenvolvimento assistido por IA é manter instruções isoladas em chats temporários ou arquivos soltos que se perdem. No **AI Second Brain**, adotamos a arquitetura de **Hub de Conhecimento Central & Repositórios de Implementação**:\n\n```mermaid\ngraph TD\n    subgraph AI_SECOND_BRAIN [\"🧠 HUB CENTRAL: AI_SECOND_BRAIN\"]\n        Rules[\".agents/rules/<br/>Regras Absolutas\"]\n        Skills[\".agents/skills/<br/>Fluxos Especializados\"]\n        Knowledge[\"knowledge/<br/>AIJev, Arquitetura, Gateway\"]\n        Memory[\"memory/<br/>Memória Persistente Global\"]\n        ProjectsMeta[\"projects/<br/>Documentação & Decisões dos Projetos\"]\n        Visualizer[\"docs/brain-ui/<br/>Grafo Neural 3D & Dashboard\"]\n    end\n\n    subgraph Repos [\"💻 REPOSITÓRIOS DE CÓDIGO (Satélites Físicos)\"]\n        Proj1[\"API / Backend<br/>(Repo Node / Go / .NET)\"]\n        Proj2[\"Game<br/>(Repo Unity / Godot)\"]\n        Proj3[\"App Mobile<br/>(Repo Flutter / React Native)\"]\n        ProjNew[\"Seu Novo Projeto<br/>(Repo Greenfield)\"]\n    end\n\n    ProjectsMeta -.-> Proj1\n    ProjectsMeta -.-> Proj2\n    ProjectsMeta -.-> Proj3\n    ProjectsMeta -.-> ProjNew\n    Rules ==> Repos\n    Knowledge ==> Repos\n```\n\n### Onde mora cada informação?\n\n| Tipo de Dado | Onde Fica? | Finalidade |\n| :--- | :--- | :--- |\n| **Código-Fonte Executável** | No repositório físico do projeto (ex: `C:\\Projetos\\SaaS\\MeuProjeto`) | Compilação, testes, Dockerfiles, builds de CI/CD. |\n| **Memória & Estado Atual** | `AI_SECOND_BRAIN/projects/<nome>/CURRENT_STATE.md` | O que foi feito, tarefas ativas e bloqueios. |\n| **Visão Geral e Stack** | `AI_SECOND_BRAIN/projects/<nome>/PROJECT.md` | Contexto de negócio, regras e definições técnicas. |\n| **Decisões Arquiteturais (ADRs)** | `AI_SECOND_BRAIN/projects/<nome>/DECISIONS/` | Histórico imutável de por que certas escolhas foram feitas. |\n| **Mapeamento de Casos de IA** | `AI_SECOND_BRAIN/projects/<nome>/AI/` | Onde e como a IA é usada (AIJev, regras ou LLM). |\n| **Regras Universais de Qualidade** | `AI_SECOND_BRAIN/.agents/rules/` | Padrões de C#, SQL Server, Segurança, etc. |\n\n---\n\n## 2. Cenário A: Criação de um NOVO Projeto do Zero (Greenfield)\n\nQuando você for criar um novo produto SaaS, aplicativo, automação ou jogo, siga este roteiro exato.\n\n### Fluxo Passo a Passo:\n\n```mermaid\nsequenceDiagram\n    autonumber\n    actor Dev as Alfredo (Você)\n    participant Agent as Antigravity Agent\n    participant Brain as AI_SECOND_BRAIN\n    participant Repo as Novo Repositório de Código\n\n    Dev->>Agent: \"Quero criar um novo projeto chamado [Nome]. Ele faz [X].\"\n    Agent->>Brain: Ativa Skill project-onboarding\n    Agent->>Brain: Cria estrutura em projects/[Nome]/ a partir dos templates\n    Agent->>Dev: Solicita detalhes técnicos ou sugere arquitetura\n    Dev->>Agent: Aprova definições de Stack & Decisões Iniciais\n    Agent->>Brain: Grava PROJECT.md, ARCHITECTURE.md, CURRENT_STATE.md e ADR-001\n    Agent->>Brain: Atualiza README.md, GEMINI.md e Grafo Neural 3D\n    Agent->>Repo: Inicializa o repositório de código com instruções vinculadas\n    Agent->>Dev: Projeto pronto para desenvolvimento do MVP!\n```\n\n### Passo 1: Solicitar o Onboarding ao Agente no Antigravity\nNo chat do Antigravity, envie a seguinte mensagem:\n\n> *\"Quero criar um novo projeto chamado **BillingFlow**. É uma API .NET 9 de conciliação de pagamentos com SQL Server, mensageria RabbitMQ e validação de regras com AIJev. Execute o onboarding desse projeto no Second Brain.\"*\n\nO agente acionará a skill `project-onboarding`.\n\n### Passo 2: Estrutura que o Agente cria em `projects/BillingFlow/`\nO agente criará a pasta canônica do projeto dentro do Segundo Cérebro:\n\n```text\nprojects/BillingFlow/\n├── PROJECT.md                # Visão geral, objetivos de negócio, stack, restrições\n├── ARCHITECTURE.md           # Desenho arquitetural (Clean Arch, endpoints, banco)\n├── CURRENT_STATE.md          # Estado de partida (Fase: Concepção / Setup inicial)\n├── DECISIONS/                # Registro de Decisões Arquiteturais (ADRs)\n│   └── ADR-001-stack-inicial.md\n├── AI/                       # Governança de IA do projeto\n│   ├── AI_USE_CASES.md       # Classificação de cada caso (AIJev vs LLM)\n│   └── AI_ARCHITECTURE.md    # Como o AI Gateway será plugado\n├── DATABASE/                 # Schemas SQL, tabelas planejadas e índices\n├── API/                      # Contratos OpenAPI / Swagger / Endpoints\n├── TESTS/                    # Pirâmide de testes (Unitários, Integração)\n└── MEMORY/                   # Sessões diárias de trabalho deste projeto\n    └── sessions/\n```\n\n### Passo 3: Criar o Repositório Físico do Código\nNo diretório onde você armazena seus códigos (ex: `C:\\Projetos\\SaaS\\BillingFlow`):\n1. Crie o projeto ou rode o scaffolding do framework (ex: `dotnet new webapi -n BillingFlow`).\n2. Crie na raiz do repositório um arquivo `GEMINI.md` (ou `CLAUDE.md` / `.cursorrules`) apontando para o Segundo Cérebro:\n\n```markdown\n# BillingFlow — Instruções de Desenvolvimento\n\n> Este projeto é governado pelo **AI Second Brain** do Alfredo.\n> Antes de implementar código ou tomar decisões, consulte a documentação oficial em:\n> C:\\Projetos\\SaaS\\Google Antigravity\\Projetos\\AI_SECOND_BRAIN\\projects\\BillingFlow\\\n\n## Diretrizes Mandatórias\n1. Siga as regras globais de .NET em: `AI_SECOND_BRAIN/.agents/rules/04-dotnet.md`\n2. Siga as regras de banco de dados em: `AI_SECOND_BRAIN/.agents/rules/05-sql-server.md`\n3. Decisões de IA devem seguir: `AI_SECOND_BRAIN/knowledge/ai/AIJEV.md`\n4. Não altere arquitetura sem registrar um novo ADR em `AI_SECOND_BRAIN/projects/BillingFlow/DECISIONS/`.\n```\n\n### Passo 4: Registrar a Governança de IA (AI Decision Gate)\nSe o novo projeto for utilizar qualquer forma de inteligência:\n1. Abra `projects/BillingFlow/AI/AI_USE_CASES.md`.\n2. Para cada necessidade, preencha a tabela de decisão:\n   - *Exemplo 1:* \"Identificar divergência no valor do boleto\" → **Código Determinístico** (`Math.Abs(pago - esperado) > 0`).\n   - *Exemplo 2:* \"Classificar risco de chargeback por padrão de histórico\" → **AIJev / Jev Decision Tree**.\n   - *Exemplo 3:* \"Gerar e-mail amigável explicando a conciliação ao cliente\" → **LLM** (Gemini / Claude via AI Gateway com fallback).\n\n---\n\n## 3. Cenário B: Integração de um Projeto JÁ EXISTENTE (Brownfield)\n\nSe você já possui um projeto com repositório próprio, código em produção e anos de desenvolvimento (como uma API legado, um app existente ou qualquer outro sistema da sua empresa), **você não precisa reescrever o código nem mover a pasta física do repositório**. \n\nO objetivo do Segundo Cérebro é ser a **memória e inteligência governante** desse projeto.\n\n### Fluxo de Adoção para Projetos Existentes:\n\n```mermaid\ngraph LR\n    A[\"1. Varredura Não-Destrutiva<br/>(Ler código existente)\"] --> B[\"2. Criar Pasta Satélite<br/>(projects/NomeProjeto/)\"]\n    B --> C[\"3. Documentar Stack Real<br/>(PROJECT.md)\"]\n    C --> D[\"4. Mapear Decisões Passadas<br/>(ADRs Retroativos)\"]\n    D --> E[\"5. Registrar Estado Atual<br/>(CURRENT_STATE.md)\"]\n    E --> F[\"6. Adicionar Ponte GEMINI.md<br/>(No repo do projeto)\"]\n```\n\n### Passo 1: Executar a Varredura Inicial com o Agente\nAbra o repositório existente no Antigravity ou passe o caminho do projeto para o agente:\n\n> *\"Tenho um projeto existente em `C:\\Projetos\\SaaS\\MeuSistemaLegado`. Preciso que faça o onboarding dele no AI Second Brain. Analise a stack, o banco de dados, os endpoints e crie a documentação correspondente em `projects/MeuSistemaLegado/`.\"*\n\nO agente executará a skill `project-onboarding` em modo brownfield:\n1. Lê o `.csproj`, `package.json`, scripts SQL e Dockerfiles existentes.\n2. Identifica bibliotecas de ORM (ex: Dapper, EF Core), serviços externos e autenticação.\n3. Não modifica **nenhuma linha** de código do sistema legado.\n\n### Passo 2: Criar os ADRs Retroativos (Crucial!)\nUm dos maiores riscos ao usar IA em código legado é o agente tentar \"reescrever tudo\" usando padrões modernos que quebram o sistema em produção (por exemplo, querer substituir Dapper por EF Core ou trocar SQL Server por PostgreSQL).\n\nPara blindar o projeto contra isso, crie ADRs retroativos:\n- `DECISIONS/001-uso-de-dapper-e-procedures.md`:\n  > *\"Decisão: O projeto utiliza Dapper com Stored Procedures por requisitos de alta performance e compatibilidade com o legado. O agente de IA NUNCA deve tentar substituir Dapper por Entity Framework sem autorização expressa do Alfredo.\"*\n\n### Passo 3: Registrar Bloqueios e Débitos Técnicos em `CURRENT_STATE.md`\nNo arquivo `projects/<nome>/CURRENT_STATE.md`, liste exatamente o estado operacional real:\n- O que está 100% testado e funcionando.\n- Quais são os \"pontos sensíveis\" (onde mexer com cuidado).\n- Quais são os bugs conhecidos que ainda não foram corrigidos.\n- Qual é o próximo objetivo prioritário.\n\n---\n\n## 4. Operação do Dia a Dia: O Ciclo de Vida de uma Sessão de Trabalho\n\nPara que o Segundo Cérebro funcione como uma extensão real da sua memória, toda sessão de desenvolvimento deve seguir o ciclo de 3 fases:\n\n```\n┌─────────────────────────────────────────────────────────────┐\n│ 1. ENTRADA (Context Loading)                                │\n│ \"Vou trabalhar no [NomeDoProjeto] na feature de autenticação.│\n│ Carregue o estado atual e decisões pendentes.\"               │\n└──────────────────────────────┬──────────────────────────────┘\n                               │\n                               ▼\n┌─────────────────────────────────────────────────────────────┐\n│ 2. DESENVOLVIMENTO (Skills & Governança)                    │\n│ Implementação -> Testes -> Validação -> Revisão             │\n└──────────────────────────────┬──────────────────────────────┘\n                               │\n                               ▼\n┌─────────────────────────────────────────────────────────────┐\n│ 3. SAÍDA (Memory Flush & Sync)                              │\n│ \"Finalizamos por hoje. Atualize CURRENT_STATE.md e registre │\n│ a sessão na memória.\"                                       │\n└─────────────────────────────────────────────────────────────┘\n```\n\n### 1. Início da Sessão\nAntes de pedir código, peça o contexto:\n> *\"Vou trabalhar no [Nome do Projeto]. Me apresente o estado atual e os próximos passos.\"*\n\nO agente lê:\n- `projects/[Nome]/CURRENT_STATE.md`\n- As últimas 3 sessões em `projects/[Nome]/MEMORY/sessions/`\n- As decisões relevantes em `projects/[Nome]/DECISIONS/`\n\n### 2. Durante a Sessão\nO agente utiliza as skills adequadas para cada atividade:\n- **Vai criar endpoint ou serviço?** → Aciona a skill `new-feature`.\n- **Apareceu um erro/bug?** → Aciona a skill `bug-investigation`.\n- **Vai adicionar uma consulta SQL pesada?** → Aciona a skill `database-review`.\n- **A feature envolve inteligência ou decisão?** → Aciona a skill `ai-decision-gate`.\n\n### 3. Fim da Sessão (Memory Flush)\nNunca encerre o Antigravity sem registrar a sessão. Envie:\n> *\"Fechando os trabalhos de hoje no [Nome do Projeto]. Salve a memória da sessão e atualize o CURRENT_STATE.\"*\n\nO agente:\n1. Cria `projects/[Nome]/MEMORY/sessions/YYYY-MM-DD-resumo.md`.\n2. Atualiza `CURRENT_STATE.md` com os itens concluídos e o que ficou pendente.\n3. Se foi tomada uma decisão arquitetural relevante, cria o novo ADR correspondente.\n\n---\n\n## 5. Governança e Roteamento de IA na Prática (AIJev First)\n\nUma das diretrizes centrais do seu sistema é a **política AIJev First**. Quando um projeto precisa resolver um problema de decisão, classificação ou automação, o agente deve seguir rigorosamente a árvore de roteamento:\n\n```mermaid\nflowchart TD\n    Task([Nova Demanda do Projeto]) --> Q1{É 100% determinística?<br/>Matemática, lógica booleana?}\n    Q1 -- SIM --> Code[Implementar CÓDIGO PURO / REGRA DE NEGÓCIO<br/>Sem custo de IA, latência zero]\n    Q1 -- NÃO --> Q2{É uma Decisão ou Classificação?<br/>Ex: Aprovar/Recusar, Categorizar, Rotear?}\n    \n    Q2 -- SIM --> AIJev[Avaliar AIJev / Jev<br/>Árvore de decisão explicável, rápida e barata]\n    AIJev --> AIJevFit{AIJev atende os requisitos?}\n    AIJevFit -- SIM --> ImplAIJev[Implementar via AIJev Pattern]\n    AIJevFit -- NÃO --> AI_Gateway\n    \n    Q2 -- NÃO --> Q3{Precisa gerar texto, código ou sintetizar linguagem?}\n    Q3 -- SIM --> AI_Gateway[AI Gateway Pattern<br/>Provedor Primário: Claude / Gemini<br/>Fallback automático + Cache + Observabilidade]\n    Q3 -- NÃO --> Action[Execução de Script / Automação]\n```\n\n### Tabela Prática de Escolha Técnica:\n\n| Necessidade | Tecnologia Recomendada | Por quê? |\n| :--- | :--- | :--- |\n| Validação de formulários, cálculos tributários, regras de autenticação | **Código C# / TypeScript Puro** | Custo zero, sem falhas de interpretação, determinismo 100%. |\n| Classificação de severidade de erros de SQL Jobs | **AIJev / Jev First** | Muito mais rápido que LLM, sem custo de tokens, 100% auditável. |\n| Detecção de anomalias em volume de transações | **AIJev / Algoritmo Estatístico** | Latência em milissegundos e comportamento previsível. |\n| Diagnóstico detalhado em linguagem natural de por que um job falhou | **LLM (Claude 3.5 Sonnet / Gemini 1.5 Pro)** | Capacidade de raciocínio aberto e contextualização de stack traces. |\n| Chatbot de suporte ao usuário final | **LLM com RAG via AI Gateway** | Respostas conversacionais alimentadas pela base de conhecimento. |\n\n---\n\n## 6. Catálogo de Prompts Prontos para o Desenvolvedor\n\nGuarde esta seção para copiar e colar no Antigravity:\n\n### Para Iniciar um Novo Projeto:\n```text\nAtive a skill project-onboarding. Quero criar um novo projeto chamado [NOME].\nObjetivo: [Descreva em 2 frases o que ele faz].\nStack pretendida: [.NET / React / Python / SQL Server / etc.].\nEle utilizará IA para: [Descreva onde entra a inteligência, se houver].\nCrie a estrutura completa em projects/[NOME]/ com os templates preenchidos.\n```\n\n### Para Plugar um Projeto Existente:\n```text\nAtive a skill project-onboarding para um projeto existente localizado em [CAMINHO_DO_PROJETO].\nAnalise a estrutura atual sem alterar código, identifique a stack e crie a documentação\ncorrespondente em projects/[NOME_DO_PROJETO]/. Em seguida, extraia as 3 principais\ndecisões de arquitetura já consolidadas para salvar como ADRs iniciais.\n```\n\n### Para Iniciar o Dia de Trabalho:\n```text\nVou focar no projeto [NOME] hoje.\nLeia o CURRENT_STATE.md e as últimas decisões em DECISIONS/.\nMe apresente:\n1. O que foi feito recentemente.\n2. Quais são as tarefas prioritárias de hoje.\n3. Há algum bloqueio registrado?\n```\n\n### Para Implementar uma Nova Feature com IA:\n```text\nQuero adicionar a seguinte funcionalidade no projeto [NOME]:\n[Descreva a feature].\nPasse pela skill ai-decision-gate: analise se ela deve ser determinística, usar AIJev ou LLM.\nApresente a proposta de implementação antes de escrever o código.\n```\n\n### Para Encerrar a Sessão e Salvar a Memória:\n```text\nAtive a skill session-memory. Finalizamos a sessão de trabalho no projeto [NOME].\nO que fizemos: [Breve lista ou deixe o agente listar a partir do git diff].\nDecisões tomadas: [Liste se houver].\nPróximos passos: [Liste o que faremos amanhã].\nGrave o arquivo de sessão e atualize o CURRENT_STATE.md do projeto.\n```\n\n---\n\n## 7. Checklists Operacionais de Consulta Rápida\n\n### ✅ Checklist: Novo Projeto (Greenfield)\n- [ ] Criada a pasta `projects/<nome-do-projeto>/` no Second Brain.\n- [ ] Preenchido `PROJECT.md` com objetivo, stack e restrições.\n- [ ] Preenchido `ARCHITECTURE.md` com os diagramas de componentes.\n- [ ] Preenchido `CURRENT_STATE.md` com a milestone inicial.\n- [ ] Registrado `DECISIONS/001-stack-inicial.md`.\n- [ ] Se tiver IA, preenchido `AI/AI_USE_CASES.md` avaliando AIJev First.\n- [ ] Criado o repositório de código e adicionado `GEMINI.md` apontando para o Second Brain.\n- [ ] Adicionado o projeto à tabela de projetos em `README.md` e `GEMINI.md` raiz.\n- [ ] Visualizado e testado o novo nó no **Grafo Neural 3D** (`docs/brain-ui/`).\n\n### ✅ Checklist: Projeto Existente (Brownfield)\n- [ ] Mapeado repositório original sem modificar código.\n- [ ] Criada pasta satélite `projects/<nome-existente>/`.\n- [ ] Documentada a stack real em `PROJECT.md` (versões exatas de runtime e libs).\n- [ ] Registrados os ADRs retroativos das decisões que **não podem ser violadas**.\n- [ ] Registrados os débitos técnicos e pontos críticos em `CURRENT_STATE.md`.\n- [ ] Adicionado arquivo de contexto no repositório de código (`GEMINI.md` / `.cursorrules`).\n- [ ] Avaliadas oportunidades de melhoria de IA com AI Gateway.\n\n### ✅ Checklist: Fim de Turno / Manutenção Contínua\n- [ ] Código testado e com build verde no repositório.\n- [ ] Skill `session-memory` executada para gerar o arquivo diário.\n- [ ] `CURRENT_STATE.md` atualizado com o progresso real.\n- [ ] Nenhuma decisão arquitetural ficou \"apenas no chat\" — todas viraram ADR.\n- [ ] Commit e push realizados no repositório do projeto e no `AI_SECOND_BRAIN`.\n"
    },
    {
      "id": "docs_GUIA_PRATICO_md",
      "path": "docs/GUIA_PRATICO.md",
      "name": "GUIA_PRATICO.md",
      "title": "Guia Prático do AI Second Brain",
      "category": "docs",
      "icon": "📝",
      "size": 3602,
      "mtime": 1790609910246.1472,
      "outgoingLinks": [
        "file:///c:/projetos/saas/google%20antigravity/projetos/ai_second_brain/docs/como_utilizar_o_projeto.md"
      ],
      "content": "# Guia Prático do AI Second Brain\n\n> 📖 **Para o manual detalhado com passo a passo para novos projetos e projetos legados:**  \n> Consulte o documento oficial completo em: **[COMO_UTILIZAR_O_PROJETO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/COMO_UTILIZAR_O_PROJETO.md)**\n\n## O que é o Segundo Cérebro?\n\nO conceito de \"segundo cérebro\" vem da ideia de **externalizar o conhecimento\nque está na sua cabeça** para um sistema organizado e pesquisável. Em vez de\ndepender da memória humana para lembrar decisões, contextos, padrões e lições\naprendidas, você documenta tudo em um formato que:\n\n1. **Persiste** — Não se perde entre sessões.\n2. **É pesquisável** — Encontre rapidamente o que precisa.\n3. **É acionável** — O agente de IA usa o conhecimento para trabalhar melhor.\n4. **Evolui** — Acumula conhecimento ao longo do tempo.\n\n## Como usar na prática\n\n### Cenário 1: Começar a trabalhar em um projeto\n\n1. Abra o workspace AI_SECOND_BRAIN no Antigravity.\n2. Diga: \"Quero trabalhar no [NomeDoProjeto]. Me dê o contexto atual.\"\n3. O agente vai:\n   - Ler `projects/[NomeDoProjeto]/PROJECT.md`\n   - Ler `projects/[NomeDoProjeto]/CURRENT_STATE.md`\n   - Ler decisões em `DECISIONS/`\n   - Ler memórias de sessões anteriores\n   - Te dar um resumo atualizado\n\n### Cenário 2: Implementar uma nova feature com IA\n\n1. Diga: \"Quero adicionar uma funcionalidade de classificação inteligente ao [NomeDoProjeto].\"\n2. O agente ativa a skill `ai-decision-gate` automaticamente.\n3. Classifica a tarefa:\n   - É determinística? → Código puro / Regra de negócio\n   - É classificação ou decisão? → Avaliar AIJev / Árvore de decisão\n   - É raciocínio aberto ou geração? → LLM via AI Gateway\n4. Propõe a arquitetura antes de escrever qualquer código.\n5. Após implementar e validar, atualiza memória e documentação.\n\n### Cenário 3: Investigar um bug ou incidente\n\n1. Diga: \"O módulo X está falhando com o erro Y.\"\n2. O agente ativa a skill `bug-investigation`.\n3. Segue o processo estruturado de investigação (hipótese → teste → causa raiz).\n4. Registra a resolução e atualiza `memory/lessons-learned.md`.\n\n### Cenário 4: Onboarding de um novo projeto\n\n1. Diga: \"Quero iniciar um novo projeto chamado MeuNovoApp.\"\n2. O agente ativa a skill `project-onboarding`.\n3. Cria a estrutura padronizada em `projects/MeuNovoApp/`.\n4. Preenche os templates contratuais com as especificações que você definir.\n\n### Cenário 5: Revisão de arquitetura\n\n1. Diga: \"Revise a arquitetura do [NomeDoProjeto].\"\n2. O agente ativa a skill `architecture-review`.\n3. Verifica checklist de qualidades arquiteturais (desacoplamento, segurança, resiliência).\n4. Registra findings e recomendações em um novo ADR.\n\n## Fluxo de uma sessão de trabalho\n\n```\nINÍCIO DA SESSÃO\n      │\n      ▼\n  CONTEXTO (ler estado atual, memória, decisões)\n      │\n      ▼\n  TRABALHO (implementar, debugar, revisar)\n      │\n      ▼\n  REGISTRO (atualizar memória, documentação)\n      │\n      ▼\nFIM DA SESSÃO\n```\n\n## Manutenção do Segundo Cérebro\n\n### Diária\n- Atualizar `CURRENT_STATE.md` dos projetos em foco.\n- Registrar sessão em `MEMORY/sessions/`.\n\n### Semanal\n- Revisar `memory/current-state.md` global.\n- Verificar se lições aprendidas foram registradas.\n\n### Por Sprint\n- Atualizar roadmap dos projetos.\n- Revisar decisões pendentes.\n- Avaliar se knowledge base precisa de atualizações.\n\n### Por Trimestre\n- Revisar arquitetura dos projetos.\n- Avaliar se skills precisam de ajustes.\n- Limpar memória obsoleta.\n"
    },
    {
      "id": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md",
      "path": "docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md",
      "name": "VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md",
      "title": "Análise Estratégica: Utilidade Real e Relevância do AI Second Brain",
      "category": "docs",
      "icon": "📝",
      "size": 17528,
      "mtime": 1790560897278.723,
      "outgoingLinks": [],
      "content": "# Análise Estratégica: Utilidade Real e Relevância do AI Second Brain\n\n> **Documento de Avaliação Crítica, Viabilidade Técnica e Recepção de Mercado**  \n> **Data:** Setembro de 2026  \n> **Autor/Contexto:** Alfredo AI OS / AI Second Brain Architecture Review\n\n---\n\n## 1. Contexto e Pergunta Original\n\nEste documento formaliza a avaliação crítica sobre a viabilidade, utilidade prática e potencial de mercado da estratégia de **AI Second Brain** (Segundo Cérebro para Desenvolvimento com IA). \n\nAbaixo encontra-se a transcrição literal da dúvida levantada pelo criador do projeto:\n\n> **Pergunta:**  \n> *\"De forma clara e objetiva e sem inventar a resposta, preciso saber se este projeto e essa estratégia 'segundo cérebro' é realmente útil para projetos que são construídos com IA? É relevante para outros desenvolvedores, acha que eles iriam achar relevante?\"*\n\n---\n\n## 2. Resposta Executiva Original na Íntegra\n\nSendo totalmente direto, objetivo e realista: **sim, a estratégia é real e extremamente útil**, mas **não para todo tipo de desenvolvedor da mesma forma**. \n\nAbaixo está a análise honesta do porquê funciona, onde estão os pontos fortes, as críticas que outros desenvolvedores fariam e quem realmente acharia isso valioso.\n\n### 2.1. Por que é realmente útil para projetos construídos com IA?\nO maior gargalo atual do desenvolvimento com agentes (Google Antigravity, Cursor, Claude Code, Windsurf) não é a capacidade do modelo de gerar código, mas sim:\n\n1. **Amnésia e perda de contexto:** Cada nova sessão ou janela de contexto reinicia o agente. Sem um registro externo, ele esquece *por que* certa biblioteca foi escolhida, quais bugs já foram corrigidos e quais decisões de design foram tomadas.\n2. **\"Context Drift\" e código duplicado:** Sem regras e histórico centralizados, o agente tende a reinventar a roda a cada prompt, criando classes duplicadas, violando padrões de arquitetura e desfazendo correções anteriores.\n3. **Falta de governança no uso de IA:** Desenvolvedores tendem a jogar tudo para LLMs caros e lentos (alucinação, latência, custo), quando uma regra determinística ou um motor de regras (como o AIJev) resolveria com latência zero e custo zero.\n\nAo adotar a estrutura montada no projeto (com `CURRENT_STATE.md`, ADRs, roteamento de tarefas e skills), resolve-se a maior dor de quem programa com IA: **consistência de longo prazo**.\n\n### 2.2. Outros desenvolvedores achariam relevante?\nA recepção depende fundamentalmente do **perfil** do desenvolvedor:\n\n#### A. Quem acharia EXTREMAMENTE relevante (Seu público-alvo):\n* **Indie Hackers e Solo Founders:** Pessoas que mantêm 3, 5 ou mais microsaas sozinhos. Para esse perfil, a troca de contexto entre projetos é brutal. Ter um \"segundo cérebro\" que armazena onde parou, o estado e as regras de cada projeto é um multiplicador de produtividade imenso.\n* **Tech Leads e Engenheiros Sêniores:** Profissionais que já perceberam que o *\"vibe coding\"* (gerar código no improviso sem documentar) cria sistemas incontroláveis após algumas semanas. Eles valorizam ADRs (registros de decisões), linters de comportamento e governança de custo.\n* **Consultores e Freelancers:** Quem atende múltiplos clientes e precisa aplicar padrões de qualidade idênticos em dezenas de repositórios diferentes.\n\n#### B. Quem torceria o nariz ou acharia burocrático:\n* **\"Vibe Coders\" e iniciantes:** Quem usa IA apenas para criar protótipos descartáveis ou tarefas simples de fim de semana achará a estrutura \"pesada\" ou burocrática.\n* **Times focados em um único monorepo:** Para quem trabalha apenas em um grande projeto fechado, a separação em um \"Hub Central fora do repo\" gera uma pergunta comum: *\"Por que não colocar essas pastas (`.agents`, `docs/decisions`) direto dentro do próprio repositório de código?\"*\n\n### 2.3. As críticas e desafios reais dessa abordagem (Sem ilusões)\nSe você for apresentar ou compartilhar essa estratégia com a comunidade técnica, precisa estar ciente dos dois principais pontos de fricção:\n\n1. **O risco do \"Document Rot\" (Documentação desatualizada):**\n   * O sistema só tem valor se o estado atual (`CURRENT_STATE.md`) e a memória forem atualizados com disciplina ao final das sessões. Se o desenvolvedor ou o agente esquecerem de atualizar, a IA passará a tomar decisões baseadas em premissas defasadas. *(O uso de skills como `session-memory` mitiga isso, mas exige o hábito de rodar ao encerrar a tarefa).*\n2. **Fricção de repositório central vs. repositório do projeto:**\n   * Na comunidade de IA hoje, muitos preferem a abordagem de colocar arquivos como `AGENTS.md`, `.cursorrules` ou `CLAUDE.md` **diretamente dentro da raiz de cada projeto individual**. \n   * A sua abordagem de **Hub Central** faz sentido quando você gerencia um *portfólio* de projetos com padrões comuns, mas pode parecer um passo extra para quem prefere tudo em um Git só.\n\n### 2.4. Tabela de Veredito Executivo\n\n| Pergunta | Resposta Objetiva |\n| :--- | :--- |\n| **A estratégia é útil?** | **Sim.** Reduz o tempo de setup a cada sessão de 15 minutos de explicação para 1 comando de leitura de estado, além de evitar regressões arquiteturais. |\n| **Tem valor para outros?** | **Sim.** O mercado está saindo da fase do \"olha o que a IA gerou em 5 minutos\" e entrando na fase da ressaca técnica (\"como eu mantenho esse código vivo por 6 meses?\"). Essa estrutura responde exatamente a essa segunda fase. |\n| **O que torna a sua abordagem única?** | A integração explícita entre **decisão de custo/governança** (não usar LLM quando código/AIJev resolve) e a **persistência de memória ativa**. A maioria das pessoas só cria arquivos de regras estáticas, sem gerenciar o estado da sessão. |\n\n---\n\n## 3. Expansão Analítica: O Cenário Técnico Profundo\n\nPara compreender além da superfície por que essa estratégia se sustenta no estado da arte da engenharia de software contemporânea, precisamos examinar a trajetória da indústria com o uso de LLMs e Agentes Autônomos.\n\n```mermaid\ntimeline\n    title A Evolução do Desenvolvimento de Software com IA\n    2022 - 2023 : Fase 1: Chat Solto : ChatGPT e Copilot Inline : Geração de snippets isolados : Zero retenção de contexto\n    2023 - 2024 : Fase 2: Vibe Coding : Cursor, Windsurf e Claude Code : Prompt-driven coding : Débito técnico rápido e sem regras\n    2024 - 2025 : Fase 3: Regras Locais : Arquivos .cursorrules e AGENTS.md : Primeiras tentativas de conter o caos\n    2025 - 2026 : Fase 4: Agentic OS & Memória : Hubs de Conhecimento, ADRs e Governança : IA com memória persistente e custo controlado\n```\n\n### 3.1. A \"Ressaca Técnica\" do Vibe Coding\n\nEm 2023 e 2024, a euforia do *\"vibe coding\"* (programar conversando livremente com a IA sem documentar ou planejar) dominou as redes. Criavam-se protótipos funcionais em poucas horas. \n\nPorém, em projetos com ciclo de vida real (> 3 a 6 meses), o *vibe coding* colapsa sob três forças destrutivas:\n\n1. **A Lei da Entropia Acelerada por IA:**\n   Um desenvolvedor humano introduz débito técnico lentamente, na velocidade de digitação humana. Um agente de IA com múltiplos arquivos abertos pode introduzir milhares de linhas de débito técnico em minutos. Ele cria classes utilitárias que já existiam, muda a biblioteca de autenticação no meio do caminho ou esquece como tratar erros no banco de dados.\n2. **A Ilusão da Janela de Contexto Gigante (1M+ Tokens):**\n   Mesmo com modelos de ponta suportando janelas imensas, o fenômeno de *Lost in the Middle* e o custo de inferência tornam inviável despejar 500 mil tokens de código toda vez que uma pequena alteração é solicitada. **Contexto curado e cirúrgico supera contexto massivo em 100% dos benchmarks práticos de engenharia.**\n3. **A Amnésia do \"Porquê\":**\n   O Git mostra *o que* mudou (`diff`). O Git não explica com clareza *por que* o agente substituiu uma query LINQ por Dapper há três semanas atrás. Sem ADRs (`DECISIONS/`), o próximo agente desfaz a otimização achando que está \"limpando o código\".\n\n---\n\n## 4. Os 5 Pilares de Valor do AI Second Brain\n\nO projeto **AI Second Brain** atua como uma camada de abstração entre a inteligência volátil dos LLMs e a estabilidade exigida pelos sistemas de produção:\n\n```mermaid\ngraph TD\n    subgraph Caos [\"❌ Desenvolvimento com IA Sem Estrutura\"]\n        C1[\"Chat Volátil\"] --> C2[\"Perda de Decisões\"]\n        C2 --> C3[\"Alucinação Arquitetural\"]\n        C3 --> C4[\"Custo Alto de LLM para Tudo\"]\n        C4 --> C5[\"Débito Técnico Incontrolável\"]\n    end\n\n    subgraph Ordem [\"✅ Com AI Second Brain\"]\n        S1[\"Hub Central / GEMINI.md\"] --> S2[\"Memória & CURRENT_STATE.md\"]\n        S2 --> S3[\"ADRs Imutáveis (DECISIONS/)\"]\n        S3 --> S4[\"Roteamento: Determinístico vs AIJev vs LLM\"]\n        S4 --> S5[\"Código Sustentável e Reprodutível\"]\n    end\n```\n\n### 1. Persistência de Estado Trans-Sessão (`CURRENT_STATE.md`)\n* **Problema:** Ao abrir o editor na segunda-feira de manhã, o desenvolvedor gasta de 10 a 20 minutos relembrando o agente: *\"estávamos refatorando a fila do RabbitMQ, o bug do SQL Server já foi mitigado, faltam os testes da controller...\"*.\n* **Solução no Second Brain:** O arquivo `CURRENT_STATE.md` mantém as tarefas ativas, tarefas concluídas e impedimentos. A primeira ação do agente é ler esse arquivo. O tempo de retomada de contexto cai de 15 minutos para **5 segundos**.\n\n### 2. Governança e Roteamento de IA (AIJev First)\n* **Problema:** Desenvolvedores utilizam chamadas de LLM para tarefas que poderiam ser resolvidas por código determinístico ou regras de decisão. Isso introduz latência (1-3 segundos por requisição), contas de API exorbitantes e risco de alucinação em produção.\n* **Solução no Second Brain:** A árvore de decisão obriga o agente a avaliar:\n  1. *É determinístico?* → Código/Regex/Regra de Negócio tradicional.\n  2. *É decisão/classificação tabular?* → Avaliar **AIJev/Jev** (determinismo, alta performance, custo zero de token).\n  3. *Precisa de raciocínio aberto ou linguagem natural?* → LLM generativo, com validação e fallback obrigatórios.\n\n### 3. Rastreabilidade Arquitetural Imutável (ADRs)\n* **Problema:** Regressões arquiteturais causadas por agentes que propõem refatorações que violam restrições contratuais, limitações de banco ou decisões prévias.\n* **Solução no Second Brain:** O diretório `DECISIONS/` em cada projeto armazena ADRs numeradas. Antes de mudar um padrão, a regra mestra (`GEMINI.md`) exige consulta às decisões existentes.\n\n### 4. Reuso Transversal de Regras e Skills\n* **Problema:** O desenvolvedor precisa configurar arquivos `.cursorrules` ou prompts em cada novo repositório que cria, repetindo regras sobre boas práticas de SQL Server, Entity Framework, injeção de dependência e segurança.\n* **Solução no Second Brain:** Regras em `.agents/rules/` e skills em `.agents/skills/` são centralizadas e compartilhadas por todos os projetos satélites.\n\n### 5. Blindagem Cognitiva para Desenvolvedores Solo\n* **Problema:** Desenvolvedores solo e pequenos times sofrem com fadiga de decisão e sobrecarga cognitiva ao navegar entre múltiplos domínios (ex: backend C#, frontend mobile MAUI, game design).\n* **Solução no Second Brain:** O cérebro central atua como um \"co-fundador técnico\" que mantém a especificação de cada projeto organizada, permitindo que o desenvolvedor alterne entre projetos sem perder o fio da meada.\n\n---\n\n## 5. Como a Comunidade e Outros Desenvolvedores Receberiam Isso\n\nAo expor esse projeto em comunidades como GitHub, Hacker News, Reddit (r/LocalLlama, r/Cursor), YouTube ou LinkedIn, a recepção dividirá o público em nichos bem definidos:\n\n### Matriz de Recepção por Perfil\n\n| Perfil de Desenvolvedor | Nível de Interesse | Principal Ponto de Atração | Principal Objeção Potencial | Resposta Recomendada à Objeção |\n| :--- | :---: | :--- | :--- | :--- |\n| **Indie Hacker / Solo Founder** | 🔥 **Altíssimo (9/10)** | Gerenciar 3 a 10 microsaas sem enlouquecer na troca de contexto. | *\"Manter os arquivos de estado dá trabalho manual.\"* | *\"Mostre que as skills automatizam o registro ao final da sessão via prompt único.\"* |\n| **Tech Lead / Staff Engineer** | 🔥 **Altíssimo (9/10)** | Governança, redução de alucinações, ADRs e controle de custos de LLM. | *\"Já usamos Wiki/Notion/Jira na empresa.\"* | *\"Notion e Jira não são alimentados de forma nativa e contextualizada na IDE pelo agente.\"* |\n| **Consultor / Software House** | 🚀 **Alto (8/10)** | Aplicar padrões idênticos de qualidade e segurança em múltiplos clientes. | *\"Cada cliente tem um repositório Git separado e fechado.\"* | *\"O modelo satélite foi desenhado exatamente para manter os clientes isolados do hub de conhecimento.\"* |\n| **Dev de Produto Único (Monorepo)** | ⚖️ **Médio (5/10)** | Gosta das regras e da memória, mas prefere tudo dentro do próprio repo. | *\"Prefiro colocar `.agents/` direto no repositório do projeto.\"* | *\"Totalmente viável: o Second Brain pode funcionar como hub exportador ou templates portáveis.\"* |\n| **Vibe Coder / Hobbysta** | ❄️ **Baixo (2/10)** | Não quer burocracia, prefere prototipar rápido e descartar o código depois. | *\"Documentar antes de codar mata minha criatividade com a IA.\"* | *\"O foco aqui não é protótipo de fim de semana, mas sistemas que precisam faturar e rodar por anos.\"* |\n\n---\n\n## 6. Comparativo Arquitetural: Hub Central vs. Arquitetura \"In-Repo\"\n\nUma das discussões mais ricas que qualquer desenvolvedor sênior fará sobre o seu projeto é a decisão entre **Hub Central** (sua abordagem) versus **Colocação no Repositório** (a abordagem comum de arquivos `.cursorrules` ou `CLAUDE.md` na raiz do código).\n\n```mermaid\ngraph LR\n    subgraph Abordagem_InRepo [\"Abordagem 1: In-Repo (.cursorrules na raiz)\"]\n        R1[\"Repo A (.rules)\"]\n        R2[\"Repo B (.rules duplicadas)\"]\n        R3[\"Repo C (.rules desatualizadas)\"]\n    end\n\n    subgraph Abordagem_Hub [\"Abordagem 2: Hub Central (AI Second Brain)\"]\n        H[\"AI_SECOND_BRAIN<br/>(Regras, Memória, Decisões, Conhecimento)\"]\n        H --> PA[\"Projeto A\"]\n        H --> PB[\"Projeto B\"]\n        H --> PC[\"Projeto C\"]\n    end\n```\n\n### Prós e Contras das Abordagens\n\n| Critério | In-Repo (Tudo dentro do Repo de Código) | Hub Central (AI Second Brain) |\n| :--- | :--- | :--- |\n| **Portabilidade de Regras** | Baixa: Regras precisam ser copiadas e coladas entre dezenas de repositórios. | **Alta:** Regras globais (segurança, SQL, C#) residem em um só lugar. |\n| **Versionamento com o Código** | **Perfeito:** O Git do projeto guarda o histórico exato do código e das regras juntos. | Exige sincronização entre o commit do satélite e a atualização do estado no hub. |\n| **Visão Portfólio (Multi-SaaS)** | Inexistente: Não há visão consolidada de status entre projetos diferentes. | **Excelente:** Dashboard 3D e pasta `projects/` oferecem status de todo o portfólio. |\n| **Isolamento de Segredos/IP** | Risco de subir regras com dados de clientes para repositórios públicos. | **Seguro:** As anotações de negócio ficam no seu Second Brain privado. |\n\n> **Conclusão Técnica:**  \n> A abordagem de **Hub Central** é superior para o desenvolvedor que gerencia um **ecossistema de produtos**. A abordagem **In-Repo** é superior para times grandes focados em um único produto monolítico. O seu projeto atende perfeitamente ao primeiro grupo.\n\n---\n\n## 7. A Chave do Sucesso: Como Evitar o \"Document Rot\"\n\nO único risco real que pode fazer o AI Second Brain perder sua utilidade é o **Document Rot** (quando o código evolui, mas os arquivos `CURRENT_STATE.md` e `DECISIONS/` não são atualizados, tornando o cérebro um registro obsoleto).\n\nPara garantir que o projeto continue sendo extremamente útil na prática, foram estabelecidas três defesas automáticas:\n\n1. **A Skill `session-memory`:**  \n   Ao invés de obrigar o desenvolvedor a digitar relatórios manuais de fim de expediente, o comando `/learn` ou o encerramento da sessão aciona a skill que resume e persiste o que foi feito automaticamente.\n2. **A Skill `project-onboarding`:**  \n   Inicializa toda a estrutura formal de novos projetos via um único prompt padronizado.\n3. **A Regra Raiz (`GEMINI.md`):**  \n   Faz com que qualquer agente que abra o workspace seja forçado a ler o estado antes de propor código e atualizar o estado após implementar features significativas.\n\n---\n\n## 8. Conclusão e Próximos Passos Recomendados\n\n### Vale a pena manter e investir neste projeto?\n**Com certeza absoluta.** O AI Second Brain ataca a fronteira mais importante do desenvolvimento moderno: a transição de *brinquedos de IA gerando código descartável* para *sistemas de engenharia disciplinados, auditáveis e sustentáveis com IA*.\n\n### Recomendações para compartilhar com a comunidade:\n1. **Criar um Template Open Source:** Disponibilizar uma versão sanitizada deste repositório no GitHub (ex: `antigravity-ai-second-brain-template`) para que outros devs possam clonar e usar.\n2. **Escrever um Artigo Técnico / Post:** Título sugerido: *\"Por que Vibe Coding morre aos 3 meses: Como estruturei um Segundo Cérebro para Agentes de IA\"*.\n3. **Enfatizar o AI Gateway / AIJev:** A diferenciação de custo (saber quando NÃO usar LLM) é um dos tópicos mais quentes da indústria de software em 2026.\n"
    },
    {
      "id": "GEMINI_md",
      "path": "GEMINI.md",
      "name": "GEMINI.md",
      "title": "AI SECOND BRAIN — ALFREDO AI OS",
      "category": "core",
      "icon": "🧠",
      "size": 4498,
      "mtime": 1790609745196.535,
      "outgoingLinks": [],
      "content": "# AI SECOND BRAIN — ALFREDO AI OS\n\n> Este arquivo é o cérebro central do seu sistema de desenvolvimento com IA.\n> Qualquer agente que trabalhar neste workspace deve seguir estas instruções.\n\n---\n\n## IDENTIDADE\n\nVocê é o agente de desenvolvimento do Alfredo. Você opera dentro de um sistema\nestruturado chamado **AI Second Brain** que organiza conhecimento, decisões,\nmemória e regras para todos os projetos.\n\n---\n\n## ANTES DE EXECUTAR QUALQUER TAREFA\n\n1. **Entenda o projeto** — Leia o `PROJECT.md` do projeto relevante em `projects/`.\n2. **Leia as regras aplicáveis** — Verifique `.agents/rules/` para restrições.\n3. **Leia o estado atual** — Consulte `CURRENT_STATE.md` do projeto.\n4. **Leia decisões anteriores** — Verifique `DECISIONS/` do projeto.\n5. **Identifique o tipo da tarefa** — Classifique antes de agir.\n\n---\n\n## CLASSIFICAÇÃO DE TAREFAS\n\nToda tarefa deve ser classificada antes da execução:\n\n| Tipo | Descrição | Ação |\n|------|-----------|------|\n| **A. Determinística** | Lógica clara, sem ambiguidade | → Código/Regra |\n| **B. Classificação** | Categorizar dados/eventos | → Avaliar AIJev/Jev |\n| **C. Decisão** | Escolher entre alternativas | → Avaliar AIJev/Jev |\n| **D. Geração** | Criar conteúdo/texto/código | → LLM |\n| **E. Raciocínio aberto** | Análise exploratória | → LLM |\n| **F. Execução** | Rodar script/deploy/build | → Código |\n| **G. Investigação** | Debug/análise de logs | → Skill específica |\n\n---\n\n## REGRAS DE ROTEAMENTO DE IA\n\n```\nNOVA TAREFA\n    │\n    ▼\n┌─────────────────┐\n│ É determinística?│\n└────────┬────────┘\n         │\n    SIM ─┴──────► CÓDIGO/REGRA\n         │\n    NÃO\n         ▼\n  É DECISÃO/CLASSIFICAÇÃO?\n         │\n    ┌────┴────┐\n   SIM      NÃO\n    │         │\n    ▼         ▼\n  AIJEV     PRECISA GERAR?\n    │         │\n    ▼    ┌────┴────┐\n  REGRA SIM      NÃO\n  DE     │        │\n  NEGÓCIO▼        ▼\n        LLM      AÇÃO\n         │\n         ▼\n     VALIDAÇÃO\n         │\n         ▼\n       AÇÃO\n```\n\n---\n\n## REGRAS ABSOLUTAS\n\n1. **NUNCA** utilize LLM simplesmente porque ele está disponível.\n2. **NUNCA** utilize AIJev artificialmente quando código determinístico for suficiente.\n3. **NUNCA** invente contexto que não existe na documentação do projeto.\n   - Jamais crie arquivos, regras de negócio, telas, mecânicas ou especificações especulativas sem solicitação expressa do desenvolvedor.\n   - Se uma informação, documento ou projeto ainda não foi detalhado pelo Alfredo, declare expressamente como \"Não definido / Em conceituação\" ou pergunte antes de agir.\n   - O Segundo Cérebro serve para refletir a realidade dos projetos e decisões reais, NUNCA para fabricar conteúdo fictício ou preencher diretórios artificialmente.\n4. **NUNCA** execute ações destrutivas sem confirmação explícita.\n5. **NUNCA** altere arquitetura sem consultar decisões existentes.\n6. **SEMPRE** valide o resultado de qualquer operação de IA.\n7. **SEMPRE** atualize a memória após implementações significativas.\n8. **SEMPRE** registre decisões arquiteturais relevantes.\n\n---\n\n## ANTES DE CRIAR NOVA INTEGRAÇÃO DE IA\n\nAvalie cada item obrigatoriamente:\n\n- [ ] AIJev é aplicável? → Consulte `knowledge/ai/AIJEV.md`\n- [ ] Qual modelo é adequado? → Consulte `knowledge/ai/MODEL_SELECTION.md`\n- [ ] Custo estimado?\n- [ ] Latência aceitável?\n- [ ] Segurança dos dados? → Consulte `.agents/rules/03-security.md`\n- [ ] Fallback definido?\n- [ ] Validação implementada?\n- [ ] Observabilidade configurada?\n\n---\n\n## DEPOIS DA IMPLEMENTAÇÃO\n\n1. Testar\n2. Revisar\n3. Atualizar documentação do projeto\n4. Atualizar memória (`memory/`)\n5. Registrar decisões relevantes (`decisions/`)\n\n---\n\n## GESTÃO DE PROJETOS\n\nOs projetos conectados a este Segundo Cérebro residem em `projects/`. O workspace suporta qualquer tecnologia, linguagem ou domínio.\n\n- **Novos Projetos**: Crie a pasta em `projects/<nome>/` utilizando o template `templates/project.md`.\n- **Projetos Existentes**: Conecte repositórios externos via junções/symlinks conforme documentado em `docs/COMO_UTILIZAR_O_PROJETO.md`.\n\n---\n\n## REFERÊNCIAS\n\n- AIJev: https://aijev.org/pt/\n- Knowledge Base: `knowledge/`\n- Templates: `templates/`\n- Skills: `.agents/skills/`\n- Rules: `.agents/rules/`\n"
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
      "icon": "📄",
      "size": 3528,
      "mtime": 1790609729688.0989,
      "outgoingLinks": [],
      "content": "# AI Gateway Pattern\n\n## Conceito\n\nO AI Gateway é uma abstração arquitetural que desacopla sua aplicação de provedores específicos de inteligência artificial. Todo acesso a modelos ou motores de decisão passa por interfaces unificadas.\n\nIsso se aplica a qualquer stack: **Node.js/TypeScript, Python, Go, C#/.NET, Rust, Java, etc.**\n\n## Arquitetura\n\n```\n┌──────────────────────────────────────────────────┐\n│                   APPLICATION                     │\n├──────────────────────────────────────────────────┤\n│                   AI GATEWAY                      │\n│                                                   │\n│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │\n│  │  Decision    │  │  Generative  │  │ Embed   │ │\n│  │  Provider    │  │  Provider    │  │ Provider│ │\n│  └──────┬──────┘  └──────┬───────┘  └────┬────┘ │\n│         │                │               │       │\n│  ┌──────┴──────┐  ┌──────┴───────┐  ┌────┴────┐ │\n│  │ AIJev       │  │ OpenAI       │  │ OpenAI  │ │\n│  │ Deterministic│  │ Anthropic    │  │ Local   │ │\n│  │ Custom Rules│  │ Google Gemini│  │ Ollama  │ │\n│  │ Mock/Test   │  │ Ollama/Local │  │         │ │\n│  └─────────────┘  └──────────────┘  └─────────┘ │\n├──────────────────────────────────────────────────┤\n│                  CROSS-CUTTING                    │\n│  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │\n│  │ Logging │ │ Retry  │ │ Cache  │ │ Metrics  │ │\n│  └─────────┘ └────────┘ └────────┘ └──────────┘ │\n└──────────────────────────────────────────────────┘\n```\n\n## Benefícios Fundamentais\n\n1. **Desacoplamento**: Troque de OpenAI para Claude, Gemini ou modelo local sem alterar regras de negócio.\n2. **Resiliência e Fallback**: Se uma API externa oscilar ou sofrer rate limit, o gateway recorre automaticamente a um provedor secundário ou regras determinísticas locais.\n3. **Observabilidade Centralizada**: Auditoria de tokens, custos financeiros e latência em um único ponto.\n4. **Governança de Privacidade**: Sanitização obrigatória de dados sensíveis antes do envio para qualquer API de terceiro.\n\n## Contratos Agnósticos de Exemplo\n\n```typescript\n// Contrato de Decisão Estruturada (AIJev / Regras)\ninterface IDecisionProvider {\n  decide(request: DecisionRequest): Promise<DecisionResult>;\n}\n\n// Contrato de Geração Livre / Raciocínio (LLM)\ninterface IGenerativeProvider {\n  generate(prompt: string, options?: GenerationOptions): Promise<string>;\n}\n```\n"
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
      "size": 1126,
      "mtime": 1790609714776.8743,
      "outgoingLinks": [],
      "content": "# Índice de Conhecimento Global\n\n> Base de conhecimento transversal sobre inteligência artificial, arquitetura de software e segurança para qualquer tipo de projeto.\n\n## Estrutura\n\n```\nknowledge/\n├── global/          ← Conhecimento transversal e índice\n│   └── INDEX.md\n├── ai/              ← Inteligência Artificial e Roteamento\n│   ├── AIJEV.md\n│   ├── MODEL_SELECTION.md\n│   └── AI_GATEWAY.md\n├── architecture/    ← Padrões universais de arquitetura de software\n│   └── PATTERNS.md\n└── security/        ← Segurança de APIs e proteção de dados com IA\n    └── OWASP.md\n```\n\n## Como Usar\n\n- **Universal por Padrão**: As bases em `knowledge/` tratam de princípios fundamentais agnósticos a linguagens (Clean Architecture, Decision Gate, OWASP LLM).\n- **Expansão Sob Demanda**: Conforme novos projetos em stacks específicas forem conectados, o desenvolvedor pode documentar decisões e aprendizados locais ou adicionar subpastas próprias.\n- **Zero Ruído**: Cada arquivo é autocontido e livre de acoplamento a um projeto específico.\n"
    },
    {
      "id": "knowledge_security_OWASP_md",
      "path": "knowledge/security/OWASP.md",
      "name": "OWASP.md",
      "title": "Segurança, OWASP & Proteção de Dados com IA",
      "category": "knowledge",
      "icon": "🔒",
      "size": 2552,
      "mtime": 1790602721015.545,
      "outgoingLinks": [],
      "content": "# Segurança, OWASP & Proteção de Dados com IA\n\n> Referência de segurança aplicada a APIs, dados sensíveis e integração com Inteligência Artificial.\n\n## 1. OWASP Top 10 — Diretrizes para Projetos\n\n| Risco OWASP | Mitigação Prática nos Projetos |\n|---|---|\n| **A01: Broken Access Control** | Autenticação via JWT/OAuth2; autorização baseada em roles/policies em cada endpoint do controller ou minimal API. |\n| **A02: Cryptographic Failures** | TLS 1.3 obrigatório para todas as comunicações HTTP; secrets e chaves de criptografia gerenciados via Azure Key Vault / User Secrets. |\n| **A03: Injection (SQL / Prompt)** | Parametrização estrita de queries via EF Core / Dapper; sanitização e delimitação de system prompts ao chamar LLMs. |\n| **A04: Insecure Design** | Adoção do AI Decision Gate pattern: tarefas críticas não são delegadas cegamente a modelos probabilísticos. |\n| **A05: Security Misconfiguration** | Headers de segurança (HSTS, CSP, X-Frame-Options); desativação de páginas de erro com stack trace em produção. |\n| **A06: Vulnerable Components** | `dotnet list package --vulnerable` e `npm audit` integrados ao pipeline de CI. |\n| **A07: Identification Failures** | Rate limiting nos endpoints de autenticação e proteção contra brute force. |\n| **A08: Software Integrity Failures** | Validação de assinaturas de pacotes e verificação de integridade de dependências. |\n| **A09: Logging & Monitoring Failures** | Structured logging com Serilog; métricas com OpenTelemetry; alertas para anomalias. |\n| **A10: SSRF** | Validação e whitelist de URLs externas antes de realizar requisições via `IHttpClientFactory`. |\n\n## 2. OWASP Top 10 para Aplicações com LLM\n\n1. **Prompt Injection**: Nunca concatene dados não confiáveis diretamente no bloco de instruções do sistema. Utilize delimitadores (ex: `\"\"\"input_do_usuario\"\"\"`) e declare claramente a hierarquia de comandos.\n2. **Insecure Output Handling**: Nunca execute código retornado por LLMs ou passe saídas de LLM diretamente para interpretadores SQL/Shell sem validação programática rigorosa.\n3. **Data Privacy & Exfiltration (LGPD)**: É estritamente proibido enviar PII (CPF, e-mails de clientes, senhas, chaves de API) para endpoints públicos de LLM. Anonimize os logs antes de solicitar análise ao modelo.\n4. **Denial of Wallet**: Defina quotas de tokens por requisição, timeouts agressivos e rate limiting nos serviços que invocam APIs de IA generativa.\n\n---\n*Referência relacionada:* `.agents/rules/03-security.md`\n"
    },
    {
      "id": "memory_current-state_md",
      "path": "memory/current-state.md",
      "name": "current-state.md",
      "title": "Estado Atual do AI Second Brain",
      "category": "memory",
      "icon": "💾",
      "size": 1347,
      "mtime": 1790609817138.4517,
      "outgoingLinks": [],
      "content": "# Estado Atual do AI Second Brain\n\n> Última atualização: 2026-09-28\n\n## Status do Framework: 🟢 Pronto & Agnóstico\n\nO AI Second Brain está estruturado como uma plataforma universal de desenvolvimento com IA, livre de acoplamento a projetos específicos ou stacks pré-determinadas.\n\n## Estrutura do Workspace\n\n| Diretório | Papel | Estado |\n|---|---|---|\n| `.agents/rules/` | Regras universais de governança (IA, Segurança, Docs) | ✅ Agnósticas |\n| `.agents/skills/` | Workflows reutilizáveis para Antigravity | ✅ 8 skills ativas |\n| `knowledge/` | Base de conhecimento em IA, Arquitetura e Segurança | ✅ 100% universal |\n| `projects/` | Projetos conectados pelo desenvolvedor | 🟢 Limpo (pronto para receber) |\n| `memory/` | Memória de continuidade entre sessões | ✅ Operacional |\n| `templates/` | Modelos para novos projetos, specs e ADRs | ✅ Disponíveis |\n\n## Sessão Mais Recente\n- **Data**: 2026-09-28\n- **O que foi feito**: \n  - Desacoplamento completo do Segundo Cérebro: remoção de projetos específicos e regras presas a stacks (.NET, SQL Server).\n  - Transformação da solução em um framework universal aplicável a qualquer linguagem ou tecnologia.\n  - Saneamento da pasta `projects/` para receber novos projetos sob demanda do usuário.\n  - Fortalecimento da regra de \"Zero Fabricação de Contexto\".\n"
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
      "id": "projects_Alfredo_teste_CURRENT_STATE_md",
      "path": "projects/Alfredo_teste/CURRENT_STATE.md",
      "name": "CURRENT_STATE.md",
      "title": "Alfredo_teste — Estado Atual",
      "category": "projects",
      "icon": "💾",
      "size": 187,
      "mtime": 1790621882745.2295,
      "outgoingLinks": [],
      "content": "# Alfredo_teste — Estado Atual\n\n> Última atualização: 2026-09-28\n\n## Status: 🟢 Ativo / Vinculado ao AI Second Brain\n- Repositório conectado e pronto para desenvolvimento com IA.\n"
    },
    {
      "id": "projects_Alfredo_teste_PROJECT_md",
      "path": "projects/Alfredo_teste/PROJECT.md",
      "name": "PROJECT.md",
      "title": "Alfredo_teste",
      "category": "projects",
      "icon": "📄",
      "size": 326,
      "mtime": 1790621882745.2295,
      "outgoingLinks": [
        "current_state.md"
      ],
      "content": "# Alfredo_teste\n\n## Visão Geral\nProjeto externo vinculado ao AI Second Brain.\n\n## Informações Gerais\n- **Tipo**: Brownfield / Repositório Externo\n- **Localização Original**: `C:\\Projetos\\temp2`\n- **Status**: 🟢 Ativo / Em Desenvolvimento\n\n## Links & Documentação\n- Estado Atual: [CURRENT_STATE.md](CURRENT_STATE.md)\n"
    },
    {
      "id": "projects_README_md",
      "path": "projects/README.md",
      "name": "README.md",
      "title": "Diretório de Projetos — AI Second Brain",
      "category": "projects",
      "icon": "🧠",
      "size": 1398,
      "mtime": 1790609688984.4578,
      "outgoingLinks": [],
      "content": "# Diretório de Projetos — AI Second Brain\n\n> Este diretório armazena o contexto, a governança e a memória dos seus projetos.\n\n## Como funciona\n\nPor padrão, este diretório vem **limpo e agnóstico**, pronto para receber qualquer tipo de projeto:\n- APIs / Microservices (Node.js, Go, .NET, Python, Java, Rust)\n- Aplicações Web e SaaS (React, Next.js, Vue, Svelte)\n- Aplicativos Mobile (Flutter, React Native, MAUI, Swift, Kotlin)\n- Jogos (Unity, Godot, Unreal Engine)\n- Scripts, Automações e Engenharia de Dados\n\n---\n\n## Como conectar um projeto\n\nVocê pode utilizar qualquer um dos dois modos descritos no manual:\n\n### Modo 1: Projeto Criado Aqui (Greenfield)\n1. Crie uma pasta para o seu projeto: `projects/<nome-do-projeto>/`\n2. Copie o template `templates/project.md` para `projects/<nome-do-projeto>/PROJECT.md`\n3. Crie o arquivo de estado inicial `projects/<nome-do-projeto>/CURRENT_STATE.md`\n\n### Modo 2: Conectar Projeto Existente (Brownfield via Symlink / Junção)\nSe o seu código-fonte já vive em outro repositório Git no seu computador (ex: `C:\\Projetos\\MeuSistema`):\n1. Crie uma junção NTFS no Windows:\n   ```cmd\n   mklink /J \"projects\\MeuSistema\" \"C:\\Projetos\\MeuSistema\"\n   ```\n2. Adicione os arquivos de contexto (`PROJECT.md`, `CURRENT_STATE.md`) na raiz do seu projeto. O AI Second Brain passará a ler e governar seu projeto automaticamente sem duplicar arquivos.\n"
    },
    {
      "id": "README_md",
      "path": "README.md",
      "name": "README.md",
      "title": "AI Second Brain — Alfredo AI OS",
      "category": "core",
      "icon": "🧠",
      "size": 5125,
      "mtime": 1790619944362.8787,
      "outgoingLinks": [
        "file:///c:/projetos/saas/google%20antigravity/projetos/ai_second_brain/docs/como_utilizar_o_projeto.md",
        "file:///c:/projetos/saas/google%20antigravity/projetos/ai_second_brain/docs/valor_e_relevancia_do_segundo_cerebro.md"
      ],
      "content": "# AI Second Brain — Alfredo AI OS\n\n> Sistema de segundo cérebro para desenvolvimento com IA, otimizado para Google Antigravity Pro.\n\n## O que é\n\nO AI Second Brain é uma estrutura de conhecimento, decisões, memória e governança\nque transforma o agente de IA de um chatbot genérico em um parceiro de desenvolvimento\nque entende o contexto, respeita regras e acumula conhecimento ao longo do tempo.\n\n## 🚀 Comece em 3 Minutos\n\n```bash\n# 1. Clone o repositório\ngit clone https://github.com/alfredorcamara/ai-second-brain.git\ncd ai-second-brain\n\n# 2. Crie seu primeiro projeto (Greenfield) OU vincule um repositório existente (Brownfield)\nnpm run project:new meu-saas          # Cria a pasta em projects/ com templates prontos\n# OU\nnpm run project:link meu-repo \"C:\\Projetos\\MeuRepo\" # Conecta via junção sem duplicar arquivos\n\n# 3. Inicie o Cockpit Visual (Grafo 3D & Dashboard em tempo real)\nnpm start\n\n# 4. Abra o workspace no Google Antigravity e comece a desenvolver!\n```\n\n## Estrutura\n\n```\nAI_SECOND_BRAIN/\n│\n├── GEMINI.md                    ← Cérebro central\n├── README.md                    ← Este arquivo\n│\n├── .agents/                     ← Customizações Antigravity\n│   ├── rules/                   ← Regras persistentes\n│   ├── skills/                  ← Workflows reutilizáveis\n│   └── plugins/                 ← Plugin do AI OS\n│\n├── knowledge/                   ← Base de conhecimento universal\n│   ├── global/                  ← Conhecimento transversal e índice\n│   ├── ai/                      ← IA, modelos, roteamento, AIJev\n│   ├── architecture/            ← Padrões universais de arquitetura\n│   └── security/                ← Segurança com IA, OWASP, privacidade\n│\n├── projects/                    ← Seus projetos (APIs, SaaS, Mobile, Jogos)\n│\n├── decisions/                   ← Decisões arquiteturais globais\n├── memory/                      ← Memória persistente\n├── templates/                   ← Templates reutilizáveis\n└── docs/                        ← Documentação do sistema\n    └── brain-ui/                ← Interface de visualização\n```\n\n## Como usar\n\n> 📘 **Manual Prático Completo:**  \n> Veja o passo a passo detalhado para criar novos projetos ou plugar projetos existentes em: **[docs/COMO_UTILIZAR_O_PROJETO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/COMO_UTILIZAR_O_PROJETO.md)**.  \n>  \n> 🧠 **Análise Crítica & Relevância de Mercado:**  \n> Entenda por que esta estratégia é essencial para projetos construídos com IA e como ela é percebida pela comunidade em: **[docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md)**.\n\n### 1. Abra este workspace no Antigravity\nO `GEMINI.md` será carregado automaticamente como regra raiz.\n\n### 2. As regras são aplicadas automaticamente\nQuando você trabalhar em qualquer arquivo, as regras de `.agents/rules/` serão\ndescobertas e aplicadas conforme o contexto.\n\n### 3. Skills são ativadas sob demanda\nO agente identifica automaticamente quando uma skill é relevante e a ativa.\nVocê também pode invocar manualmente.\n\n### 4. Projetos têm contexto próprio\nCada projeto em `projects/` tem seu `PROJECT.md`, estado atual, decisões e memória.\n\n### 5. A memória persiste entre sessões\nApós cada sessão significativa, o agente atualiza `memory/` com o estado atual.\n\n## Comandos Operacionais\n\n| Comando | Descrição |\n|---|---|\n| `npm run project:new <nome>` | Cria um novo projeto em `projects/<nome>/` com contratos e templates prontos |\n| `npm run project:link <nome> <caminho>` | Vincula um repositório Git externo existente via junção NTFS / symlink |\n| `npm start` *(ou `start-brain.bat`)* | Inicia o Live Vault Server (SSE) e abre o Visualizador 3D no navegador |\n| `npm run doctor` *(ou `npm run check`)* | Executa o linter de integridade: valida links quebrados, contratos de projetos e knowledge |\n| `npm run scan` | Atualiza o snapshot JSON estático do cofre para o visualizador offline |\n\n## Filosofia\n\n```\nALFREDO AI OS\n       │\n  ┌────┴─────────────────┐\n  │                      │\nANTIGRAVITY         KNOWLEDGE\n  │                      │\n  ┌────┼────┐    ┌────┼────┐\n  │    │    │    │    │    │\nRULES SKILLS AGENTS GLOBAL PROJECT MEMORY\n  │    │    │    │    │    │\n  └────┴────┴────┴────┴────┘\n           │\n       AI GATEWAY\n           │\n    ┌──────┼──────┐\n    │      │      │\n  AIJEV   LLM  LOCAL AI\n    │      │      │\n    └──────┼──────┘\n           │\n     SEUS PROJETOS\n           │\n  ┌────────┼────────┐\n  ▼        ▼        ▼\nAPIs/Backend  SaaS/Web    Jogos/Apps\n```\n"
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
          "size": 1911
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
          "id": "_agents_rules_04-documentation_md",
          "label": "Regras de Documentação",
          "icon": "📝",
          "path": ".agents/rules/04-documentation.md",
          "size": 1706
        }
      ],
      "badge": 5
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
          "icon": "📄",
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
          "icon": "🗄️",
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
          "id": "projects_Alfredo_teste_CURRENT_STATE_md",
          "label": "Alfredo_teste — Estado Atual",
          "icon": "💾",
          "path": "projects/Alfredo_teste/CURRENT_STATE.md",
          "size": 187
        },
        {
          "id": "projects_Alfredo_teste_PROJECT_md",
          "label": "Alfredo_teste",
          "icon": "📄",
          "path": "projects/Alfredo_teste/PROJECT.md",
          "size": 326
        },
        {
          "id": "projects_README_md",
          "label": "Diretório de Projetos — AI Second Brain",
          "icon": "🧠",
          "path": "projects/README.md",
          "size": 1398
        }
      ],
      "badge": 3
    },
    {
      "id": "knowledge",
      "label": "Knowledge",
      "icon": "📚",
      "items": [
        {
          "id": "knowledge_ai_AI_GATEWAY_md",
          "label": "AI Gateway Pattern",
          "icon": "📄",
          "path": "knowledge/ai/AI_GATEWAY.md",
          "size": 3528
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
          "size": 1126
        },
        {
          "id": "knowledge_security_OWASP_md",
          "label": "Segurança, OWASP & Proteção de Dados com IA",
          "icon": "🔒",
          "path": "knowledge/security/OWASP.md",
          "size": 2552
        }
      ],
      "badge": 6
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
          "size": 1248
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
          "size": 1347
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
          "size": 19447
        },
        {
          "id": "docs_GUIA_PRATICO_md",
          "label": "Guia Prático do AI Second Brain",
          "icon": "📝",
          "path": "docs/GUIA_PRATICO.md",
          "size": 3602
        },
        {
          "id": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md",
          "label": "Análise Estratégica: Utilidade Real e Relevância do AI Second Brain",
          "icon": "📝",
          "path": "docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md",
          "size": 17528
        }
      ],
      "badge": 3
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
          "size": 4498
        },
        {
          "id": "README_md",
          "label": "AI Second Brain — Alfredo AI OS",
          "icon": "🧠",
          "path": "README.md",
          "size": 5125
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
      "id": "hub-core",
      "label": "System Core",
      "group": "core",
      "size": 18,
      "icon": "⚙️",
      "path": "core"
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
      "id": "_agents_rules_04-documentation_md",
      "label": "Regras de Documentação",
      "group": "rules",
      "size": 9,
      "icon": "📝",
      "path": ".agents/rules/04-documentation.md"
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
      "icon": "📄",
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
      "icon": "🗄️",
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
      "id": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md",
      "label": "Análise Estratégica: Utilidade Real e Relevância do AI Second Brain",
      "group": "docs",
      "size": 12,
      "icon": "📝",
      "path": "docs/VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO.md"
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
      "icon": "📄",
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
      "id": "knowledge_security_OWASP_md",
      "label": "Segurança, OWASP & Proteção de Dados com IA",
      "group": "knowledge",
      "size": 12,
      "icon": "🔒",
      "path": "knowledge/security/OWASP.md"
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
      "id": "projects_Alfredo_teste_CURRENT_STATE_md",
      "label": "Alfredo_teste — Estado Atual",
      "group": "projects",
      "size": 9,
      "icon": "💾",
      "path": "projects/Alfredo_teste/CURRENT_STATE.md"
    },
    {
      "id": "projects_Alfredo_teste_PROJECT_md",
      "label": "Alfredo_teste",
      "group": "projects",
      "size": 9,
      "icon": "📄",
      "path": "projects/Alfredo_teste/PROJECT.md"
    },
    {
      "id": "projects_README_md",
      "label": "Diretório de Projetos — AI Second Brain",
      "group": "projects",
      "size": 9,
      "icon": "🧠",
      "path": "projects/README.md"
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
      "to": "hub-core"
    },
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
      "to": "_agents_rules_04-documentation_md"
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
      "from": "hub-docs",
      "to": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md"
    },
    {
      "from": "hub-core",
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
      "from": "hub-knowledge",
      "to": "knowledge_security_OWASP_md"
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
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "hub-projects",
      "to": "projects_README_md"
    },
    {
      "from": "hub-core",
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
      "from": "_agents_rules_04-documentation_md",
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "_agents_rules_04-documentation_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "_agents_rules_04-documentation_md",
      "to": "templates_project_md"
    },
    {
      "from": "_agents_skills_ai-integration_SKILL_md",
      "to": "_agents_rules_03-security_md"
    },
    {
      "from": "_agents_skills_architecture-review_SKILL_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
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
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "_agents_rules_03-security_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_new-feature_SKILL_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
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
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "_agents_skills_project-onboarding_SKILL_md",
      "to": "projects_README_md"
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
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "_agents_skills_session-memory_SKILL_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
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
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "GEMINI_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "knowledge_ai_AI_GATEWAY_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "docs_COMO_UTILIZAR_O_PROJETO_md",
      "to": "projects_README_md"
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
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "docs_GUIA_PRATICO_md",
      "to": "templates_project_md"
    },
    {
      "from": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md",
      "to": "GEMINI_md"
    },
    {
      "from": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md",
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md",
      "to": "templates_project_md"
    },
    {
      "from": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md",
      "to": "templates_session-memory_md"
    },
    {
      "from": "GEMINI_md",
      "to": "_agents_rules_03-security_md"
    },
    {
      "from": "GEMINI_md",
      "to": "docs_COMO_UTILIZAR_O_PROJETO_md"
    },
    {
      "from": "GEMINI_md",
      "to": "knowledge_ai_MODEL_SELECTION_md"
    },
    {
      "from": "GEMINI_md",
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "GEMINI_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "GEMINI_md",
      "to": "templates_project_md"
    },
    {
      "from": "knowledge_ai_AI_GATEWAY_md",
      "to": "GEMINI_md"
    },
    {
      "from": "knowledge_ai_MODEL_SELECTION_md",
      "to": "GEMINI_md"
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
      "from": "knowledge_security_OWASP_md",
      "to": "_agents_rules_03-security_md"
    },
    {
      "from": "memory_current-state_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "memory_current-state_md",
      "to": "templates_project_md"
    },
    {
      "from": "projects_Alfredo_teste_PROJECT_md",
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "projects_README_md",
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "projects_README_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "projects_README_md",
      "to": "templates_project_md"
    },
    {
      "from": "README_md",
      "to": "docs_COMO_UTILIZAR_O_PROJETO_md"
    },
    {
      "from": "README_md",
      "to": "docs_VALOR_E_RELEVANCIA_DO_SEGUNDO_CEREBRO_md"
    },
    {
      "from": "README_md",
      "to": "GEMINI_md"
    },
    {
      "from": "README_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
    },
    {
      "from": "README_md",
      "to": "projects_README_md"
    },
    {
      "from": "README_md",
      "to": "templates_project_md"
    },
    {
      "from": "templates_project_md",
      "to": "projects_Alfredo_teste_CURRENT_STATE_md"
    },
    {
      "from": "templates_project_md",
      "to": "projects_Alfredo_teste_PROJECT_md"
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
    "agents": {
      "fill": "#06b6d4",
      "stroke": "#22d3ee",
      "glow": "rgba(6, 182, 212, 0.35)"
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
    "totalFiles": 34,
    "rulesCount": 5,
    "skillsCount": 8,
    "projectsCount": 3,
    "knowledgeCount": 6,
    "decisionsCount": 1,
    "memoryCount": 2,
    "templatesCount": 4,
    "docsCount": 3,
    "totalNodes": 44,
    "totalEdges": 116
  }
};
