# Decisões Globais

> Decisões que afetam todos os projetos do AI Second Brain.

## ADR-G001: Adoção do AI Decision Gate Pattern
- **Status**: Aceita
- **Data**: 2026-09-27
- **Descrição**: Todo projeto que utilizar IA deve passar pelo Decision Gate
  para determinar se a tarefa é determinística, classificação/decisão, ou geração.
- **Detalhes**: Ver `.agents/rules/01-ai-decision.md` e `knowledge/ai/AIJEV.md`

## ADR-G002: AI Gateway como abstração unificada
- **Status**: Aceita
- **Data**: 2026-09-27
- **Descrição**: Todo acesso a IA deve ser feito através de interfaces abstratas
  (`IDecisionProvider`, `IGenerativeAIProvider`) para desacoplar de providers.
- **Detalhes**: Ver `knowledge/ai/AI_GATEWAY.md`

## ADR-G003: Formato Antigravity nativo para AI Second Brain
- **Status**: Aceita
- **Data**: 2026-09-27
- **Descrição**: O AI Second Brain utiliza o formato nativo do Antigravity
  (Rules, Skills, Plugins) em vez de formatos genéricos.
- **Motivo**: Garante descoberta automática e funcionamento correto das features.

## ADR-G004: Documentação como código
- **Status**: Aceita
- **Data**: 2026-09-27
- **Descrição**: Toda documentação vive no repositório, versionada com Git,
  em formato Markdown.

## ADR-G005: Research Lab Engine com Groq Cloud & Prompt Vivo
- **Status**: Aceita
- **Data**: 2026-10-02
- **Descrição**: O Research Lab é adotado como subsistema do AI Second Brain para pesquisa autônoma e catalogação de conhecimento de projetos em Markdown. A inferência de refinamento de briefing e decomposição de temas utiliza o Groq Cloud via módulo HTTP nativo sem dependências npm (`scripts/groq-client.js`). O conceito de "Prompt Vivo" é estabelecido: o usuário pode refinar e alterar a intenção a qualquer momento, mantendo versionamento em `_meta.json` (`definitionHistory`) para permitir re-pesquisa incremental.
- **Detalhes**: Ver `docs/RESEARCH_LAB.md` e artefatos de decisão do Research Lab.

## ADR-G006: AI Gateway Multi-Provedor com Arquitetura BYOK (Bring Your Own Key)
- **Status**: Aceita
- **Data**: 2026-10-09
- **Descrição**: O AI Second Brain desacopla a camada cognitiva de qualquer fornecedor de IA exclusivo, implementando uma arquitetura universal BYOK (`Bring Your Own Key`) no cliente nativo `scripts/ai-gateway.js`.
- **Motivo**: 
  1. **Soberania e Liberdade do Desenvolvedor**: Permitir alternar livremente entre Groq Cloud (gratuito e veloz), OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), OpenRouter (+300 modelos), Ollama Local (100% offline e sem custos) e endpoints customizados.
  2. **Privacidade e Segurança**: As credenciais nunca transitam para nuvens externas de telemetria; são gravadas atomicamente no arquivo `.env` local na máquina do usuário e protegidas no `.gitignore`.
  3. **Zero Dependências**: Toda a comunicação HTTP/HTTPS com APIs OpenAI-compatible e Anthropic `/v1/messages` utiliza exclusivamente as bibliotecas nativas `http` e `https` do Node.js.
  4. **Resiliência a Falhas e Cota (429)**: Ping ao vivo de latência e detecção automática de esgotamento de créditos com interceptador gráfico guiando a troca de provedor sem interromper o fluxo de trabalho.
- **Detalhes**: Ver `scripts/ai-gateway.js`, `server.js` e modais em `docs/brain-ui/index.html`.

## ADR-G007: Captura de Sessão Assistida por IA com Revisão Humana Obrigatória (Session Capture)
- **Status**: Aceita
- **Data**: 2026-10-12
- **Descrição**: A captura de memória diária de projetos conectados passa a ser assistida por IA através de um pipeline em duas etapas coordenadas:
  1. **Coleta Determinística & Rascunho IA (Somente Leitura)**: `POST /api/projects/:name/session/draft` lê dados de telemetria Git (commits, nomes de arquivos modificados, diffstat com censura de arquivos sensíveis como `.env`), snapshot de contratos (`PROJECT.md`, `CURRENT_STATE.md`, `LESSONS_LEARNED.md`) e notas opcionais do desenvolvedor. A IA atua exclusivamente na redação e estruturação em JSON tipado. **Nada é gravado no disco nesta etapa**.
  2. **Revisão Humana Interativa & Gravação Atômica**: O desenvolvedor revisa título, markdown de resumo, checkboxes de passos concluídos, novos passos e lições aprendidas sugeridas. Apenas sob clique explícito em "Gravar na memória", o endpoint `POST /api/projects/:name/session/commit` realiza gravação física no disco (`MEMORY/sessions/AAAA-MM-DD-titulo.md`), atualiza cirurgicamente `CURRENT_STATE.md` (remanejando itens concluídos e preservando seções adicionais e estilo CRLF) e anexa novas lições a `LESSONS_LEARNED.md`.
- **Motivo**: Elimina o atrito do registro manual de sessões e a amnésia de contexto entre agentes sem risco de alucinação ou perda de controle, respeitando o princípio de *Zero Fabricação*.
- **Detalhes**: Ver `scripts/session-capture.js`, `scripts/ai-gateway.js` e interface em `docs/brain-ui/`.

## ADR-G008: Otimizações Práticas de Usabilidade e Conexão com IDEs no Ciclo de Vida do Desenvolvedor
- **Status**: Aceita
- **Data**: 2026-10-12
- **Descrição**: Consolidação de 5 melhorias essenciais de usabilidade identificadas na simulação prática de onboarding de projeto:
  1. **Inicialização Automática de Repositório Git (`git init`)**: O modal Quickstart oferece opção de disparar `git init`, gerando o `.gitignore` padrão e vinculando os contratos de governança desde o primeiro segundo.
  2. **Stack Tecnológica Flexível com Sugestões Rápidas**: O campo de Stack Tecnológica no Quickstart torna-se um input de texto livre editável, mantendo chips clicáveis como atalhos para preenchimento ágil.
  3. **Disparadores Nativos de IDE (`open-ide`)**: O cabeçalho do Project Workspace ganha botões diretos para abrir o projeto no VS Code, Cursor AI ou Explorador de Arquivos local com fallback seguro.
  4. **Prompt Bootstrap de Início de Sessão em 1 Clique**: Botão "Copiar Prompt para Agente" gera e copia para o clipboard uma instrução parametrizada contendo o caminho do projeto, contratos e regras absolutas para alimentar qualquer agente de IA sem amnésia.
  5. **Feedback Visual Ativo de Inferência com Mensagens Rotativas**: O modal de Session Capture exibe etapas sincronizadas e animação contínua durante o tempo de resposta da IA, eliminando a sensação de travamento e aumentando a previsibilidade operacional.
- **Motivo**: Reduz drasticamente o atrito entre o Cockpit Visual do Second Brain e o fluxo real de codificação na IDE, garantindo que o desenvolvedor comece e feche sessões com velocidade máxima.
- **Detalhes**: Ver `server.js`, `docs/brain-ui/app.js`, `docs/brain-ui/demo/app.js` e `docs/relatorio_usabilidade_dev_journey.md`.

## ADR-G009: Motor de Decisão JEV Nativo (RulesDecisionProvider) e Refinamento Cirúrgico com Clarificação Humana
- **Status**: Aceita
- **Data**: 2026-10-16
- **Descrição**: O refinamento iterativo de contratos de governança no Quickstart Studio ("Prompt Vivo") passa a ser governado pelo motor de decisão local `RulesDecisionProvider` (baseado no padrão JEV / Nível 4 Composto), eliminando a poluição cruzada entre documentos e implementando o fluxo *Human-in-the-Loop* para ambiguidades técnicas:
  1. **Motor Local Canônico (`scripts/decision-provider.js`)**: Implementa a interface universal `IDecisionProvider` do padrão JEV com execução determinística (`decideSync`), latência de 0ms, custo zero de tokens e funcionamento 100% offline.
  2. **Isolamento Cirúrgico de Contratos**: Instruções sobre tabelas, esquemas SQL, entidades ou endpoints afetam **exclusivamente** `ARCHITECTURE.md`. Instruções sobre escopo afetam `PROJECT.md`, roadmap afeta `CURRENT_STATE.md` e decisões técnicas afetam `ADR-0001`. Guardrails programáticos asseguram que contratos não autorizados permaneçam idênticos.
  3. **Detecção de Ambiguidade Técnica & Clarificação Humana**: Solicitações vagas sobre pagamentos (`AMBIGUOUS_PAYMENTS`), mensageria (`AMBIGUOUS_MESSAGING`), autenticação (`AMBIGUOUS_AUTH`) ou deploy (`AMBIGUOUS_INFRA`) não acionam o LLM; abrem instantaneamente o modal `#qsClarificationModal` exibindo a dúvida técnica formulada pelo Arquiteto de IA e opções de resposta rápida em chips de 1 clique com preenchimento obrigatório.
  4. **Explicabilidade Numérica e Auditoria**: Toda decisão retorna `ruleId`, `confidence` numérica (0.0 a 1.0) e `rationale` em linguagem natural.
  5. **Auto-Switch de Aba com Destaque Visual & Botão Desfazer (Undo)**: A interface web transiciona automaticamente para a aba do documento alterado com animação `.tab-flash-active` e oferece botão `↺ Desfazer` persistido em `previousGrillDraft`.
- **Motivo**: Garante precisão cirúrgica na governança dos contratos, respeita o princípio de *Zero Fabricação*, evita desperdício de tokens e previne que solicitações parciais corrompam a arquitetura do software.
- **Detalhes**: Ver `scripts/decision-provider.js`, `scripts/quickstart-grill.js`, `server.js`, `docs/brain-ui/app.js`, `knowledge/ai/AIJEV.md` e `docs/plano_trabalho_prompt_vivo_cirurgico.md`.

## ADR-G010: Resiliência em Rate Limits de Provedores de IA, AbortController e Modal Informativo de Cota (BYOK)
- **Status**: Aceita
- **Data**: 2026-10-16
- **Descrição**: Blindagem universal do AI Gateway e Cockpit contra congelamento e inconsistências em cenários de Rate Limit (HTTP 429) ou esgotamento de créditos de inferência:
  1. **Teto de Espera em Retries (`scripts/ai-gateway.js`)**: Backends nunca dormem indefinidamente quando provedores de IA enviam `retry-after` extenso (como 20 minutos na Groq Cloud). O tempo de espera com retentativa foi limitado a no máximo 10s. Acima desse limite, o gateway lança imediatamente erro 429 estruturado com metadados (`quotaExceeded`, `isRateLimit`, `retryAfter`, `providerName`).
  2. **Cancelamento Ativo com `AbortController` (`docs/brain-ui/app.js`)**: Ações do usuário para sair ou voltar durante carregamentos de IA abortam ativamente as requisições `fetch` em andamento, impedindo que requisições zumbis tentem atualizar o DOM após o descarte da tela.
  3. **Correção Geométrica de Layout**: Classes colapsantes (`.is-loading-questions`, `.grill-mode`) são escopadas com precisão no CSS e limpas deterministamente no retorno de navegação, prevenindo compressão residual do modal.
  4. **Modal Universal de Erro de IA (`#aiErrorModal`)**: Apresenta diagnóstico claro com badges semânticos (429, 401, 404, 408), tempo estimado de redefinição da cota e botão direto para abrir as Configurações de IA (BYOK) sem perda de contexto.
  5. **Banner Contextual no Modal BYOK (`#aiSettingsQuotaBanner`)**: Resolve a discrepância cognitiva entre o teste de autenticação de chave (que usa `GET /models` e retorna 200 OK) e a exaustão de cota de inferência de chat (`POST /chat/completions`), alertando explicitamente o desenvolvedor sobre a exaustão de cota no modelo ativo e fornecendo orientação para troca de modelo ou provedor.
- **Motivo**: Previne travamentos da interface, garante previsibilidade operacional em limites de cota e fornece orientação direta de autocura para o usuário.
- **Detalhes**: Ver `scripts/ai-gateway.js`, `server.js`, `docs/brain-ui/app.js`, `docs/brain-ui/demo/app.js`, `docs/brain-ui/index.html` e `docs/brain-ui/style.css`.

## ADR-G011: Integração Audiovisual da Landing Page com Abordagem Híbrida e Responsiva (Hero, Lightbox, Showcase & 16:9/9:16)
- **Status**: Aceita
- **Data**: 2026-10-16
- **Descrição**: Integração de recursos audiovisuais (vídeos promocionais/pitch) na landing page pública do AI Second Brain através de uma abordagem híbrida não concorrente:
  1. **Gatilho de Alto Impacto no Hero (Abordagem A)**: Adição do botão `[ ▷ Assistir Pitch (1 min) ]` junto aos CTAs do topo, abrindo a apresentação audiovisual em um Modal Lightbox cinemático sob demanda, sem competir visualmente com o Grafo Neural 3D interativo do fundo.
  2. **Seção Dedicada "Em Ação" (Abordagem B)**: Bloco `#video-showcase` em formato de cockpit dark luxury posicionado estrategicamente antes da Demo interativa, servindo como demonstração guiada para os visitantes que exploram a página verticalmente.
  3. **Adaptação Responsiva Dinâmica (Abordagem C)**: Alternância de mídia nativa entre desktop (`Promo-16x9.mp4`, 16:9 widescreen) e smartphone (`Reels-9x16.mp4`, 9:16 vertical nativo).
  4. **Performance e Lazy Loading Rigoroso**: Adoção de `preload="none"` em ambos os reprodutores, garantindo que os ~29 MB de vídeo não impactem o First Contentful Paint (FCP) ou a pontuação de performance no Lighthouse.
  5. **Controle Auditivo e Acessibilidade**: O modal pausa a reprodução automaticamente ao ser fechado (via botão ✕, clique no backdrop ou tecla ESC), prevenindo ruídos ou reproduções fantasmas em segundo plano.
- **Motivo**: Aumenta a conversão de novos usuários e a clareza do produto sem redundância cognitiva com as seções analíticas e sem degradar o tempo de carregamento da página.
- **Detalhes**: Ver `docs/brain-ui/landing/index.html`, `docs/brain-ui/landing/css/extra.css`, `docs/brain-ui/landing/js/extra.js` e `docs/brain-ui/landing/js/i18n.dict.js`.
 
## ADR-G012: Transição de Licenciamento para FSL-1.1-MIT (Source-Available) e Adoção de CLA
- **Status**: Aceita
- **Data**: 2026-10-25
- **Descrição**: Transição do modelo de licenciamento do repositório da licença permissiva MIT para a **Functional Source License, Version 1.1 (FSL-1.1-MIT)**, acompanhada da formalização de um **Contributor License Agreement (CLA)**:
  1. **Proteção Comercial Sem Barreiras de Adoção**: O código permanece 100% público, auditável e gratuito para desenvolvedores, pesquisadores, estudantes e empresas que utilizam o produto internamente.
  2. **Bloqueio de Exploração Concorrente Desautorizada**: É expressamente vedado a terceiros empacotar ou revender o software como produto ou serviço comercial concorrente sem prévia autorização e acordo comercial com o autor.
  3. **Conversão Temporária para MIT (4 anos)**: Cada versão publicada sob a FSL converte-se automaticamente em MIT permissivo 4 anos após o lançamento, assegurando previsibilidade e compromisso com o ecossistema de software.
  4. **Preservação de Direitos via CLA (`CLA.md`)**: Contribuições externas via Pull Request concedem ao mantenedor e detentor original dos direitos autorais (Alfredo R. Câmara) licença ampla de distribuição, sublicenciamento e eventual monetização, evitando fragmentação de direitos de propriedade intelectual.
- **Motivo**: Proteger o esforço intelectual e de engenharia contra exploração predatória por terceiros mantendo a comunidade livre para usar e aprender.
- **Detalhes**: Ver `LICENSE`, `CLA.md`, `CONTRIBUTING.md` e `package.json`.



