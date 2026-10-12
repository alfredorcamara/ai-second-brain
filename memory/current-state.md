# Estado Atual do AI Second Brain

> Última atualização: 2026-10-12

## Status do Framework: 🟢 Operacional & Cockpit Avançado + 🔬 Research Lab + ⚡ AI Gateway Multi-Provedor (BYOK Ativo) + 🧠 Session Capture com IA

O AI Second Brain está estruturado como uma plataforma universal de governança e desenvolvimento com IA, livre de acoplamento a projetos específicos e equipada com um portal web moderno, motor de pesquisa autônoma resiliente, AI Gateway multi-provedor (BYOK) e captura inteligente de sessões.

## Estrutura do Workspace

| Diretório | Papel | Estado |
|---|---|---|
| `.agents/rules/` | Regras universais de governança (IA, Segurança, Docs) | ✅ Agnósticas |
| `.agents/skills/` | Workflows reutilizáveis para Antigravity | ✅ 8 skills ativas |
| `knowledge/` | Base de conhecimento em IA, Arquitetura e Segurança | ✅ 100% universal |
| `projects/` | Projetos conectados pelo desenvolvedor | 🟢 Suporta Greenfield & Brownfield + RESEARCH/ |
| `memory/` | Memória de continuidade entre sessões | ✅ Operacional |
| `templates/` | Modelos para novos projetos, specs e ADRs | ✅ Disponíveis |
| `docs/brain-ui/` | Portal web interativo de visualização e governança | 🚀 UX/UI com Project Workspace, Grafo 3D, AI BYOK & Session Capture |
| `scripts/` | Utilitários de infraestrutura e clientes IA nativos | ⚡ Zero-deps (Scan, AI Gateway, Research Engine, Session Capture) |

## Sessões Recentes
- **Data**: 2026-10-12
  - **Sincronização & Atualização Completa das Documentações de Usuário e Landing Page**:
    - **Landing Page (`docs/brain-ui/landing/index.html` e `i18n.dict.js`)**:
      - Atualizado Bento Grid (`#vantagens`) com novos cards dedicados ao **Session Capture com IA (Draft & Commit)** e ao **Prompt Bootstrap & IDE Hooks (VS Code / Cursor)**.
      - Atualizado Quickstart Studio (`#projeto`) destacando a criação guiada com `git init` automático, `.gitignore` seguro contra segredos, pontes multi-IA e flexibilidade total de stack.
      - Adicionada pergunta e resposta no FAQ técnico sobre a sanitização automática de segredos (`.env`, tokens) e supervisão humana obrigatória antes da gravação de memória.
      - Tradução bilíngue (PT/EN) 100% sincronizada no dicionário `landing/js/i18n.dict.js`.
    - **Documentação da Solução do Cockpit (`docs/brain-ui/index.html` e `demo/index.html`)**:
      - Capítulo 5 (Ciclo de Vida Hands-on): Etapa 1 atualizada com Prompt Bootstrap e botões de IDE; Etapa 4 atualizada com o fluxo Draft & Commit de Session Capture com IA.
      - Capítulo 7 (Checklists & FAQ): Adicionado item técnico esclarecendo a sanitização de dados e segurança do Session Capture.
    - **Manuais Oficiais (`docs/COMO_UTILIZAR_O_PROJETO.md` e `README.md`)**:
      - Seção 4 de `COMO_UTILIZAR_O_PROJETO.md` enriquecida com a "Opção A: Fluxo Visual pelo Cockpit Web" e "Opção B: Fluxo Conversacional via Terminal/Chat".
      - Seção 6 atualizada com a estrutura exata do Prompt Bootstrap gerado pelo Cockpit.
      - `README.md` atualizado na seção "Comece em 3 Minutos" com os novos atalhos e recursos operacionais.
    - **Validação & Paridade**:
      - Executado `npm run scan` atualizando `vault-data.js` e espelhado em `demo/`.
      - Executado `npm run doctor` com 100% de integridade (0 links quebrados, todos os contratos válidos).

  - **Implementação das 5 Oportunidades Práticas de Melhoria de UX & Conexão com IDEs**:
    - **1. Inicialização Automática do Git no Quickstart (`git init`)**:
      - Adicionado checkbox `[x] Inicializar repositório Git local automaticamente (git init)` no formulário de criação de projeto (`#qsFormNew`).
      - Backend `server.js` dispara `git init -b main` (com fallback para `git init`) gerando imediatamente o `.gitignore` e as pontes de governança para versionamento instantâneo.
    - **2. Input Livre e Flexível de Stack Tecnológica**:
      - O campo de Stack Tecnológica no modal Quickstart foi transformado em um `<input type="text" id="qsNewStack">` editável, permitindo digitação livre de stacks combinadas/customizadas enquanto preserva os chips rápidos como atalhos inteligentes de preenchimento.
    - **3. Disparadores Diretos de IDE no Project Workspace (`open-ide`)**:
      - Adicionados botões de ação rápida no cabeçalho do projeto: `💻 VS Code`, `⚡ Cursor` e `📂 Pasta`.
      - Endpoint `POST /api/system/open-ide` executa o comando nativo no sistema operacional com fallback seguro e toast de confirmação.
    - **4. Prompt Bootstrap de Início de Sessão em 1 Clique**:
      - Botão `✨ Copiar Prompt para Agente` no cabeçalho do projeto copia imediatamente para a área de transferência um prompt formatado contendo as regras absolutas, stack e contratos (`PROJECT.md`, `CURRENT_STATE.md`, `DECISIONS/`, `LESSONS_LEARNED.md`) para alimentar qualquer agente de IA sem amnésia.
    - **5. Feedback Visual Ativo de Inferência com Mensagens Rotativas**:
      - No modal de Session Capture (`#scStepLoading`), implementado loop de mensagens rotativas dinâmicas ("Lendo commits...", "Cruzando contratos...", "Consultando lições aprendidas...", "Sintetizando resumo...") e steps sincronizados com efeito glow neon suave, eliminando a sensação de travamento durante a inferência.
    - **Paridade Estrita & Linter Verde**:
      - Todas as alterações replicadas com 100% de paridade entre `docs/brain-ui/` e `docs/brain-ui/demo/` (incluindo interceptação de mock em `demo-mode.js`).
      - `npm run doctor`: 100% dos links e arquivos válidos (0 erros).

  - **Implementação Profissional do Session Capture (Registrar Sessão com IA)**:
    - **Módulo Nativo de Captura (`scripts/session-capture.js`)**:
      - Coleta determinística de dados do projeto: commits desde a última sessão registrada, arquivos modificados não commitados, diffstat com censura mandatória de arquivos confidenciais (`.env`, chaves privadas, secrets).
      - Leitura e estruturação dos contratos (`PROJECT.md`, `CURRENT_STATE.md`, `LESSONS_LEARNED.md` e sessões recentes).
      - Algoritmo de normalização e validação defensiva contra o estado real do projeto, impedindo duplicações ou inclusão de itens especulativos.
      - Gravação física atômica: cria `MEMORY/sessions/AAAA-MM-DD-titulo.md` (nunca sobrescreve sessões existentes do mesmo dia), atualiza cirurgicamente `CURRENT_STATE.md` (remanejando itens concluídos de "Próximos Passos" para "O que já foi definido", adicionando novas pendências e preservando quebras de linha CRLF/LF) e anexa aprendizados em `LESSONS_LEARNED.md`.
    - **Extensão do AI Gateway (`scripts/ai-gateway.js`)**:
      - Nova função `summarizeSession(contextText, options)` com prompt especializado (`SYSTEM_PROMPTS.sessionCapture`) governado pelas regras de *Zero Fabricação*.
      - Suporte à opção `skipCache: true` para o botão "🔄 Regenerar" na interface de revisão.
      - Correção preventiva da variável `isModelNotFound` no manipulador de erros do gateway.
    - **Endpoints REST no Backend (`server.js`)**:
      - `POST /api/projects/:name/session/draft`: Coleta determinística + inferência com IA para gerar o rascunho. Nada é gravado em disco nesta etapa.
      - `POST /api/projects/:name/session/commit`: Gravação atômica após aprovação e ajustes do usuário. Dispara invalidação de snapshot do vault e evento SSE em tempo real.
    - **Interface de Alta Fidelidade no Cockpit e Modal de Revisão (`docs/brain-ui/`)**:
      - Card promocional destacado na aba **Memória & Saúde** do Project Workspace com botão `🧠 Registrar Sessão`.
      - Modal interativo (`#sessionCaptureModal`) em 3 etapas fluidas: Entrada (informações Git + notas do usuário) → Carregamento (orbe neon animado) → Revisão completa item a item com checkboxes e campos editáveis.
      - Paridade absoluta com a demonstração pública em `docs/brain-ui/demo/` através de mocks no `demo-mode.js`.
  - **Correção da Numeração Sequencial de Decisões Arquiteturais (ADRs)**:
    - Em `docs/brain-ui/app.js` e `docs/brain-ui/demo/app.js`, função `createNewDecisionRecord` atualizada para inspecionar os ADRs existentes do projeto e calcular o próximo número sequencial (`NNN-nova-decisao.md`), eliminando a sobrescrita do arquivo `001-stack-inicial.md`.

- **Data**: 2026-10-11
  - **Refinamento do Botão de Validação com Ícone Fiel e Efeito Cintilante Suave**:
    - **Ajuste da Geometria do Ícone à Referência do Usuário**:
      - Substituída a geometria anterior pelo ícone oficial Heroicons v2 Outline Key (`M15.75 5.25a3 3...`) com traçado de 1.8px em `docs/brain-ui/index.html` e `docs/brain-ui/demo/index.html`, replicando com exatidão a haste diagonal, dentes escalonados e cabeça arredondada da imagem fornecida pelo desenvolvedor.
    - **Suavização do Efeito Cintilante (Eliminação de Excessos)**:
      - Em `docs/brain-ui/style.css` e `docs/brain-ui/demo/style.css`:
        - Eliminados os halos exagerados de 32px e os fundos em gradiente radial que estouravam a interface.
        - Preservado o fundo estritamente escuro `#060a13` do botão.
        - Definido um brilho respiratório calibrado (+20% de ganho luminoso):
          - Sucesso (`.is-valid`): borda esmeralda (`rgba(16, 185, 129, 0.8)`), ícone `#10b981` com `drop-shadow(0 0 3px rgba(16, 185, 129, 0.72))` e `box-shadow` pulsando entre 5px e 11px (`@keyframes sparklingGreen` em ciclo ágil de 1.9s).
          - Falha (`.is-invalid`): borda carmesim (`rgba(239, 68, 68, 0.8)`), ícone `#ef4444` com `drop-shadow(0 0 3px rgba(239, 68, 68, 0.72))` e `box-shadow` pulsando entre 5px e 11px (`@keyframes sparklingRed` em ciclo ágil de 1.9s).
        - Estado hover neutro com borda suave translúcida, alinhado à estética dark do sistema.
    - **Validação Visual & Integridade**:
      - Comprovado visualmente no navegador com browser subagent: capturados screenshots dos estados de sucesso e erro demonstrando fidelidade à imagem de referência e a calibração de +20% no brilho.
      - `npm run doctor`: 100% dos links e arquivos íntegros (0 erros).

  - **Sincronização Fiel dos Parâmetros do `.env`, Validação Estrita e Estilização Escura das Setas de Retries**:
    - **Sincronização com `.env` na Abertura do Modal de IA**:
      - Em `docs/brain-ui/app.js` e `docs/brain-ui/demo/app.js` (`openAiSettingsModal`), os campos `#aiCacheHoursInput` e `#aiMaxRetriesInput` passam a ser populados fielmente a partir de `cfg.cacheHours` e `cfg.maxRetries` lidos em tempo real do `.env` via `/api/ai/config`.
      - Em `scripts/ai-gateway.js` (`getConfig` e `saveConfig`), corrigido o fallback `|| 2` que impedia o valor legítimo `0` de retries; agora tratados com validação de número inteiro positivo (`>= 0`).
    - **Validação Defensiva e Restrição de Digitação em Camadas**:
      - **Frontend (Interatividade & Sanitização)**: Função `setupAiParamsInputValidation` bloqueia teclas proibidas (`-`, `+`, `e`, `.`, `,` em retries; letras espúrias em cache) via `keydown`, sanitiza colagem via `input` (clamp entre 0 e 5 para retries e formato `${hours}h` entre 1h e 720h para cache no `blur`).
      - **Frontend (Pré-Salvamento)**: `handleSaveAiSettings` valida estritamente ambos os parâmetros antes de qualquer disparo de rede; se inválidos, exibe feedback no terminal, aplica classe de erro `.input-error` com animação de shake e impede a submissão.
      - **Backend (API & Gateway)**: `saveConfig` em `scripts/ai-gateway.js` e `/api/ai/save` em `server.js` validam intervalos permitidos (Cache: 1 a 720 horas; Retries: 0 a 10 tentativas), retornando HTTP 400 com mensagem amigável caso haja inconsistência.
    - **Estilização Escura das Setas (Spin Buttons) de Retries**:
      - Adicionado `color-scheme: dark;` em `.ai-param-detail-input-wrap .ai-param-input[type="number"]` em `docs/brain-ui/style.css` e `docs/brain-ui/demo/style.css`.
      - Customizados `::-webkit-inner-spin-button` e `::-webkit-outer-spin-button` com filtros escuros harmônicos e transições suaves, integrando o controle nativo ao visual dark da interface e eliminando setas/fundos claros.
    - **Restauração e Blindagem do Fundo Escuro na Caixa de API Key (`#aiApiKeyInput`)**:
      - Corrigido o comportamento do Chromium em que campos `type="password"` ativavam o gerenciador de credenciais do navegador e aplicavam `-webkit-autofill` com fundo claro (`rgb(232, 240, 254)`).
      - Aplicada blindagem CSS com `-webkit-box-shadow: 0 0 0 1000px #060a13 inset !important`, `-webkit-text-fill-color: #f8fafc !important`, `color-scheme: dark !important` e `background: #060a13 !important` em `docs/brain-ui/style.css` e `docs/brain-ui/demo/style.css`.
      - Atualizado o HTML (`docs/brain-ui/index.html` e `demo/index.html`) com `placeholder="gsk_... ou cole sua chave de API"` e `autocomplete="new-password"` evitando que o navegador trate como senha de login com fundo branco.
    - **Validação End-to-End**:
      - Testado no navegador via browser subagent com comprovação visual dos valores `24h` e `4`, setas escuras, caixa de API Key escura (#060a13) e validação em tempo real.
      - `npm run doctor`: 100% dos links e arquivos íntegros (0 erros).

  - **Correção Crítica no AI Gateway (BYOK), Eliminação de ReferenceError e Blindagem de Base URL**:
    - **Resolução do `ReferenceError: cachedModelsByProvider is not defined`**:
      - Restaurada a declaração explícita de `const cachedModelsByProvider = {}` no topo de `scripts/ai-gateway.js`, eliminando as respostas HTTP 500 em `/api/ai/config` e HTTP 400 em `/api/ai/test` e `/api/ai/save`.
    - **Isolamento Estrito de `baseUrl` por Provedor**:
      - Corrigido o vazamento de `AI_BASE_URL` entre provedores no `.env`: agora apenas provedores configuráveis (`ollama` e `custom`) herdam ou gravam URLs customizadas; provedores padrão de nuvem (`groq`, `openai`, `anthropic`, `openrouter`) utilizam estritamente suas URLs oficiais da API, prevenindo que requisições para a Groq fossem roteadas para a URL da Anthropic.
    - **Propagação Fiel de Erros HTTP e Prevenção de Falsos Positivos**:
      - O bloco `testConnection` não silencia mais erros de autenticação (401/403) ou cota (429) no endpoint `/models`.
      - Se nenhum modelo de chat for detectado, o sistema rejeita o teste com erro amigável em vez de gerar estado falso de sucesso com "Catálogo pronto".
    - **Validação Preventiva no Frontend (`docs/brain-ui/app.js` e `docs/brain-ui/demo/app.js`)**:
      - Se o usuário não digitou chave e o provedor não possui chave salva no `.env`, o clique em "Testar" ou "Salvar" exibe erro claro no terminal e foca no input sem disparar requisições inválidas de rede.
      - Se nenhum modelo foi selecionado, o botão "Salvar e Ativar" orienta a testar e escolher um modelo compatível.
      - Ao trocar de provedor no select, o input `baseUrl` é devidamente limpo para provedores de nuvem.
    - **Hot-Reload de Módulo no Servidor (`server.js`)**:
      - Implementada a função `getAiGateway()` com invalidação dinâmica de cache do Node.js (`delete require.cache`), permitindo que alterações nas regras do gateway sejam refletidas em tempo real sem crash.

  - **Auditoria e Fidelidade Estrita de Documentos na Landing Page (`docs/brain-ui/landing/`)**:
    - **Eliminação de Referências a Arquivos Fictícios / Placeholders**:
      - Em conformidade estrita com a regra universal de *Zero Fabricação*, eliminados todos os nomes de arquivos inexistentes que estavam exibidos na interface da landing page (`nucleo.md`, `seguranca.md`, `decisao-ia.md`, `ai-decision-gate.md`, `new-feature.md`, `bug-investigation.md`, `estado.md`, `licoes.md`, `sessao-13.md`, `adr-001.md`, etc.).
    - **Mapeamento Preciso para Arquivos Reais do Workspace**:
      - **Camada 01 (`rules/`)**: Substituído por `00-core.md`, `01-ai-decision.md` e `03-security.md`.
      - **Camada 02 (`skills/`)**: Substituído por `ai-decision-gate/SKILL.md`, `new-feature/SKILL.md` e `bug-investigation/SKILL.md`.
      - **Camada 03 (`memory/`)**: Substituído por `current-state.md`, `lessons-learned.md` e `README.md`.
      - **Camada 04 (`decisions/`)**: Substituído por `GLOBAL_DECISIONS.md`, `001-stack-inicial.md` e `decisao_groq_provider.md`.
      - **Terminal Chat Mockup**: Atualizado para ler e citar `memory/current-state.md`, `decisions/GLOBAL_DECISIONS.md` e `.agents/rules/03-security.md`.
      - **Research Lab**: Caminhos atualizados para o padrão real `projects/<projeto>/RESEARCH/<tema>/knowledge/` e `actionable/`.
      - **Quickstart Studio**: Card de estrutura atualizado incluindo `LESSONS_LEARNED.md`.
    - **Correção Estrutural no Grafo Neural 3D e Leitor Lateral (`js/data.js`)**:
      - Corrigido bug de renderização no Three.js (`CanvasGradient.addColorStop`) causado pela ausência de ícone/cor na pasta `templates`.
      - Adicionado o atributo `realPath` em todos os nós do catálogo para exibir o caminho físico exato no cabeçalho do leitor Markdown lateral (`#reader`).
      - Eventos de clique nos chips da landing page (`.chip[data-node]`) integrados para abrir diretamente o documento real correspondente no leitor.
    - **Paridade i18n & Validação de Integridade**:
      - Chaves do dicionário bilíngue `js/i18n.dict.js` sincronizadas.
      - Validação com `npm run doctor`: 100% dos links e 98 arquivos Markdown verificados com sucesso (0 erros).

  - **Eliminação de Listas Fixas e Busca de Modelos 100% Dinâmica em Tempo Real com Gatilho Automático na Abertura**:
    - **Remoção Total de Hardcoding de Modelos**:
      - Eliminado o catálogo fixo `AI_DEFAULT_MODELS_BY_PROVIDER` em `docs/brain-ui/app.js` e `docs/brain-ui/demo/app.js`.
      - Eliminados `DEFAULT_MODELS_BY_PROVIDER` e `cachedModelsByProvider` em `scripts/ai-gateway.js`.
      - Removidas as opções `<option>` fixas de modelo em `docs/brain-ui/index.html` e `docs/brain-ui/demo/index.html`, iniciando o `<select id="aiModelSelect">` exclusivamente com o placeholder neutro orientativo (*"Clique em 'Testar' acima para listar os modelos disponíveis..."*).
    - **Gatilho Reativo Automático ao Abrir o Modal (`openAiSettingsModal`)**:
      - Ao abrir a tela de configurações de IA, se o usuário já possui chave salva no `.env` (ou for um provedor local sem chave como Ollama), o sistema agora dispara imediatamente `testCurrentAiConnection()` em tempo real.
      - A interface executa a animação de terminal ao vivo (`testing` -> handshake HTTP e medição de latência), envia a requisição para a API do provedor (ou mock interceptor no demo), recebe os modelos vivos da conta e popula dinamicamente o `<select id="aiModelSelect">`, selecionando o modelo ativo da configuração.
      - Se o usuário não tiver chave configurada (ou mudar para provedor sem chave), o terminal permanece em estado `idle` amigável e o select aguarda o preenchimento da chave e clique em Testar.
    - **Paridade Estrita entre Produção Local e Versão Demo**:
      - O arquivo `demo-mode.js` intercepta requisições `fetch('/api/ai/test')` simulando latência realista (~142ms) e lista de modelos compatíveis. O mesmo código JavaScript de `app.js` roda de forma 100% idêntica nos dois ambientes, sem bifurcações de lógica nem catálogos estáticos no frontend.
    - **Refinamentos de Interface do Modal BYOK**:
      - Substituição do chip redundante abaixo do botão Testar pelo botão alternador `✏️ Digitar ID manualmente` (`#btnToggleManualModel`).
      - Centralização vertical perfeita da seta customizada do select (`.ai-select-arrow`) via `top: 50%` e `transform: translateY(-50%)`.
      - Manutenção do título limpo `"3. Modelo de IA"`, deixando a contagem de modelos exclusivamente no console do terminal à direita.
    - **Resiliência do Servidor HTTP Local (`server.js`)**:
      - Tratamento para rotas de diretório estático (ex: `/demo/`), resolvendo automaticamente para `index.html` caso o caminho solicitado seja uma pasta.
  - **Governança Agnóstica Universal e Blindagem Multi-IA**:
    - **Criação do Padrão Universal Aberto `AGENTS.md`**: Implementado na raiz do workspace como padrão compatível com qualquer agente do mercado.
    - **Extensão da Governança e Lições Aprendidas para Todas as Pontes**: Blindagem ativa e consulta mandatória à memória registradas em `GEMINI.md`, `AGENTS.md`, `.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`, `.agents/rules/00-core.md` e `.agents/rules/01-ai-decision.md`.
    - **Automação de Pontes Standalone**: Os utilitários CLI `scripts/link-project.js` e `scripts/create-project.js` agora criam automaticamente as pontes de governança no repositório de destino, garantindo que o agente continue governado mesmo se o projeto for aberto de forma isolada fora do Segundo Cérebro.
  - **Sincronização e Atualização da Landing Page (`docs/brain-ui/landing/`)**:
    - **Reflexo do AI Gateway Multi-Provedor**: Seção "Feito para não quebrar" atualizada destacando auto-descoberta dinâmica de modelos, suporte a OpenAI, Anthropic, Gemini, Groq, DeepSeek, OpenRouter e Ollama local, e recuperação inteligente de rate limit.
    - **Atualização do FAQ**: Perguntas e respostas enriquecidas para destacar o padrão aberto `AGENTS.md`, suporte multi-IA com pontes nativas, privacidade local com BYOK/Ollama e esclarecimento cristalino dos modos Cockpit Central vs Standalone.
    - **Paridade Bilíngue 100% no Dicionário i18n (`js/i18n.dict.js`)**: Todas as chaves sincronizadas em inglês, testadas via Chromium headless CDP com zero chaves de conteúdo ausentes.
  - **Catálogo Dedicado de Lições Aprendidas por Projeto (`LESSONS_LEARNED.md`)**:
    - **Separação Arquitetural Estrita de Escopo**: Eliminação da "Amnésia das Sessões Antigas" através de um arquivo dedicado por projeto para registrar pegadinhas técnicas, bugs de libs e contratos específicos de domínio sem poluir a governança global.
    - **Novo Template Oficial**: Adicionado `templates/lessons-learned.md` e atualizado `templates/project.md`.
    - **Automação nos Comandos CLI**: Atualizados `scripts/create-project.js` e `scripts/link-project.js` para inicializarem automaticamente `LESSONS_LEARNED.md` e pontes multi-IA completas em projetos novos ou vinculados.
    - **Blindagem em Todas as Pontes de IA**: Atualizados `AGENTS.md`, `GEMINI.md`, `.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.clinerules` e `copilot-instructions.md` com regra mandatória de consultar o `LESSONS_LEARNED.md` local do projeto antes de alterar código.
    - **Inicialização em Projetos Ativos**: Criados `projects/teste_alfredo_22/LESSONS_LEARNED.md` e `projects/Alfredo_teste/LESSONS_LEARNED.md` com validação de 100% dos links no linter `doctor`.

- **Data**: 2026-10-10
  - **Refinamento do Modal BYOK e Feedback Reativo do Console Terminal**:
    - **Consolidação Total de Feedback no Terminal Console (`.ai-card-terminal` / `.ai-terminal-output`)**:
      - **Remoção da Caixa Duplicada da Esquerda (`#aiTestFeedback`)**: Eliminada a antiga caixa verde/vermelha que aparecia abaixo do campo de chave. A coluna esquerda agora permanece limpa, contínua e sem saltos visuais.
      - **Terminal Rico na Coluna Direita com Informações Completas**: O terminal ao vivo agora concentra 100% da telemetria de conexão em formato CLI avançado:
        - `idle`: `$ ENGINE: <PROV> [STANDBY]` · `[IDLE] Clique em "Testar" para validar a API Key` · `LOCAL .ENV ENCRYPTION · ISOLADO`.
        - `testing`: `$ CONNECTING TO <PROV> ENGINE...` · `[WAIT] Handshake HTTP e medição de latência...` · `[SCAN] Descobrindo catálogo de modelos na conta...`.
        - `success`: `$ CONNECTED TO <PROV> [AUTHENTICATED]` · `[OK] Conexão bem-sucedida · Latência: <ms>ms` · `[OK] Modelos detectados · <n> modelos compatíveis` · `LOCAL .ENV ENCRYPTION · PRONTO PARA ATIVAR`.
        - `error`: `$ ERROR CONNECTING TO <PROV> [FAILED]` · `[FAIL] <mensagem amigável de erro>` · `LOCAL .ENV ENCRYPTION · VERIFIQUE A CHAVE`.
    - **Layout Balanceado e Parâmetros com Contexto Integrado**:
      - Seção `4. Parâmetros de Execução` na coluna esquerda enriquecida com cards dedicados para `Cache TTL` e `Tentativas (Retries)` com inputs alinhados e explicações objetivas de impacto (0ms de latência e resiliência a HTTP 429).
      - Coluna direita otimizada com cards de `Security & Privacidade` e `Scope & Governança` detalhados com bullets de segurança, garantindo altura simétrica e harmônica com a coluna esquerda sem espaços vazios.
    - **Padronização Visual com os Demais Modais do Sistema**:
      - Borda externa e sombras ajustadas com tonalidade azul-marinho escura (#0a101d / #111a2e / #1a253c), idêntica aos outros modais do AI Second Brain.
      - Botão fechar padronizado em formato circular arredondado (`.ai-card-close-btn`).
      - Inclusão do asset animado vetorial `assets/cerebro_neon_animado.svg` no card de cabeçalho do gateway.
      - Alinhamento horizontal do rodapé (`.ai-settings-footer`) alinhado às margens dos inputs.
    - **Paridade Absoluta 100% entre Local (`docs/brain-ui/`) e Demo Pública (`docs/brain-ui/demo/`)**:
      - Replicação exata de todas as regras de CSS (`style.css`), lógica JavaScript (`app.js`), marcação HTML (`index.html`) e suporte a mock com validação realista no `demo-mode.js`.

- **Data**: 2026-10-09
  - **AI Gateway Multi-Provedor (BYOK — Bring Your Own Key)**:
    - **Módulo Nativo Universal (`scripts/ai-gateway.js`)**: Cliente HTTP/HTTPS sem dependências externas, unificando os principais provedores de IA do mercado:
      - **Groq Cloud**: Gratuito, ultra-rápido LPU (`openai/gpt-oss-120b` padrão, `openai/gpt-oss-20b` fallback, `qwen/qwen3.8-27b`).
      - **OpenAI**: Flagship multimodal e raciocínio (`gpt-4o-mini`, `gpt-4o`, `o1-mini`).
      - **Anthropic Claude**: Análise densa de código e arquitetura (`claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`).
      - **OpenRouter**: Acesso a centenas de modelos abertos e proprietários (`deepseek/deepseek-chat`, `deepseek-r1`, `qwen-2.5-72b`).
      - **Ollama Local**: 100% offline, privado na máquina do usuário, custo zero (`llama3.2`, `deepseek-r1`, `qwen2.5-coder`).
      - **Endpoint Customizado**: Compatível com qualquer servidor local ou proxy corporativo OpenAI-Compatible.
    - **Resiliência e Auto-Recuperação de Modelos Descontinuados**:
      - Auto-fallback inteligente no `scripts/ai-gateway.js` quando o provedor retorna erro de modelo inexistente ou sem acesso (`does not exist or you do not have access to it` / 404). O gateway redireciona transparentemente a requisição para o modelo padrão ou de contingência sem abortar a síntese.
      - Sincronização estrita de catálogo Groq com os modelos ativos da conta (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`).
    - **Endpoints REST no Backend (`server.js`)**:
      - `GET /api/ai/config` e `GET /api/ai/status`: Retorna o provedor ativo, máscara segura da chave (ex: `gsk_••••••••Zvrf`), status de configuração e catálogo de provedores/modelos recomendados.
      - `POST /api/ai/test`: Realiza ping em tempo real na API do provedor com a chave informada, mede a latência em milissegundos e retorna a lista viva de modelos disponíveis da conta do usuário.
      - `POST /api/ai/save`: Gravação atômica das variáveis no arquivo `.env` físico e atualização imediata de `process.env` em memória sem necessidade de reiniciar o processo Node.js. Suporte a parâmetros avançados (`cacheHours`, `maxRetries`).
      - **Interceptador de Cota 429**: Detecção de `Rate Limit / Quota Exceeded` propagando flag `quotaExceeded: true` para a interface gráfica.
    - **Tríade de Modais UX de Alta Fidelidade no Cockpit (`docs/brain-ui/` e `docs/brain-ui/demo/`)**:
      - **Pill Luminoso na Topbar (`#btnAiGatewayModal`)**: Exibe o status ao vivo da IA (`⚡ Groq Cloud • openai/gpt-oss-120b` com dot verde conectado; `✨ Conectar IA (BYOK)` em tom dourado quando não configurado; pulso vermelho em erro de cota).
      - **Modal 1: Boas-Vindas & Onboarding (`#aiWelcomeModal`)**: Card escuro com robô neon pulsante convidando o desenvolvedor a conectar seu cérebro digital, acionado suavemente na primeira visita.
      - **Modal 2: Central BYOK (`#aiSettingsModal`)**: Formulário em 4 etapas:
        1. Seletor de provedor com ícones.
        2. Input de chave com cadeado, botão de visibilidade olho (👁️), botão de teste (🔑) com feedback dinâmico de latência (ex: *✓ Conexão bem-sucedida! Latência: 355ms*).
        3. Dropdown de modelos populado dinamicamente via ping da API.
        4. Configurações avançadas (Expiração de cache em horas e tentativas máximas).
        - **Card Verde de Privacidade**: Garante armazenamento 100% local no `.env` sob proteção do `.gitignore`.
        - **Card Azul de Escopo**: Esclarece o raio de ação da IA (Research Lab, refinamento de briefing e grafo).
        - **Botão "Salvar e Ativar ⚡"**: Salva a configuração e dispara evento no sistema.
      - **Modal 3: Alerta de Cota Esgotada (`#aiQuotaModal`)**: Modal automático com cabeçalho de aviso, título dourado *"Cota de IA Esgotada!"*, caixa de recomendações (trocar para Groq gratuito, Claude ou Ollama local) e botão de redirecionamento para o configurador.
    - **Efeito UAU: Pulso Sináptico no Grafo 3D Three.js**:
      - Função `triggerSynapticPulse()` conectada a `graph.pulseSurge()` e `projectGraph.pulseSurge()` no `neuron-graph.js`, provocando uma aceleração visual nos impulsos elétricos das sinapses e nós ao ativar ou salvar uma chave.
    - **Correção e Enriquecimento do Catálogo de Modelos Dinâmico (Modal BYOK)**:
      - **Resolução do Bug de Modelos "Undefined"**: Identificado que o frontend esperava array de objetos `{ id, name }`, enquanto o gateway retornava array de strings. Implementado parsing polimórfico defensivo no frontend (`app.js` e `demo/app.js`) e normalização rica no backend (`scripts/ai-gateway.js`).
      - **Filtragem Inteligente Universal de Modelos**: O backend agora descarta automaticamente modelos incompatíveis com chat/completions (áudio `whisper`, classificadores de moderação, guardrails, embeddings, imagem) garantindo que apenas modelos capazes de responder a prompts do Research Lab e síntese fiquem disponíveis.
      - **Layout Limpo \u0026 Alternador de Entrada Manual**: Removidos os chips redundantes abaixo do select. A interface agora conta com badge contextualizado (`#aiModelCountBadge`), dropdown enriquecido com janela de contexto (ex: `128k contexto`) e botão alternador para digitação manual do ID do modelo (`#btnToggleManualModel` / `#aiCustomModelWrap`) para suporte flexível a modelos customizados/beta.
      - **Suporte ao Modo Demonstração (`demo-mode.js`)**: Interceptação de `/api/ai/test` no mock offline evitando erro 403 e populando o catálogo dinâmico mesmo em ambientes estáticos (GitHub Pages).
      - **Eliminação de Modelos Hardcoded (Arquitetura 100% Dinâmica)**:
        - Removidos presets fixos (`defaultModel`, `recommendedModels`, `fallbackModel`) de `scripts/ai-gateway.js`, `app.js` e `demo/app.js`. O configurador agora depende exclusivamente da resposta em tempo real da API do provedor ativo via teste de conexão.
        - Se o usuário não testou a conexão ou não selecionou um modelo, o seletor exibe instrução amigável e impede inferências sem modelo válido.
      - **Restauração e Isolamento do Vault de Demonstração (`demo-app`)**:
        - Restaurado o arquivo `docs/brain-ui/demo/vault-data.js` via gerador isolado `build_demo_vault.py`, garantindo que a landing page pública exiba o projeto ilustrativo `demo-app` (35 arquivos de demonstração) e nunca exponha os projetos reais e locais do desenvolvedor (`teste_alfredo_22`, `Alfredo_teste`).
  - **Refinamentos Visuais e Documentação**:
    - **Dark Scrollbars**: Padronização dos scrollbars em tom escuro de luxo (#1e293b / #090d16) em todos os blocos de terminal e documentações.
    - **Card do Criador**: Seção de autoria e comunidade valorizando a criação do projeto.
    - **Internacionalização (i18n)**: Seletor de idioma PT/EN funcional em toda a landing page.
    - **Licenciamento Open Source**: Inclusão de `LICENSE` MIT e `.env.example` sem expor segredos.

- **Data**: 2026-10-08
  - **Correção de Codificação do Terminal e Resiliência do Vault Manager**:
    - **Terminal Windows (`start-brain.bat`)**: Inclusão de `chcp 65001 >nul` ativando UTF-8 nativo no CMD, eliminando a exibição de `ÔÇö` no lugar do travessão `—` e ícones.
    - **Prioridade e Invalidação de Cache Local (`docs/brain-ui/vault.js`)**: Servidor local em `localhost` agora tem precedência estrita. Ao conectar com sucesso ao vivo, caches obsoletos no `localStorage` são limpos para evitar poluição visual.
    - **Auto-Reconexão em Background**: Se o navegador carregar antes do Node.js concluir a subida do socket, o visualizador tenta auto-reconectar periodicamente e migra de forma transparente para `🟢 Ao Vivo (Disco)` sem necessidade de recarregar a página manualmente.
    - **Árvore de Projetos Hierárquica em Modo Pasta**: Função `_buildVaultFromFiles` reescrita para espelhar a lógica de agrupamento do `scan-vault.js` (isolando projetos, contratos na raiz, subpastas `RESEARCH` e `BACKUPS`), eliminando a exibição plana de 34 arquivos avulsos sob `MEUS PROJETOS`.
    - **Botão de Ação Rápida no Badge**: Disponibilizado botão `✕ Limpar Cache` diretamente no badge quando em modo de pasta em cache.
- **Data**: 2026-10-02
  - **Research Lab (Laboratório de Conhecimento Autônomo) — Etapa 3 (Motor de Execução Autônoma, Resiliência & Síntese Markdown)**:
    - **Motor Autônomo (`scripts/research-engine.js`)**: Executa a varredura completa da taxonomia de subtópicos, gerando documentos `.md` profundos, estruturados com código, schemas SQL/Prisma e boas práticas.
    - **Taxonomia de Duas Camadas**: Arquivos organizados automaticamente em `knowledge/` (fundamentos e padrões conceituais) e `actionable/` (código, implementação, schemas e testes).
    - **Resiliência e Recuperação de Rate Limit no Groq Client (`scripts/groq-client.js`)**:
      - Parser automático de cabeçalho e mensagens de erro ("Please try again in X.XXs").
      - Backoff com tempo extra de segurança (+2s) e retentativas automáticas até 3x sem abortar o lote.
      - Fallback inteligente de modelo para `openai/gpt-oss-20b` caso o modelo de 120b sature a cota TPM.
      - Pausa estratégica de 6s entre arquivos para evitar saturação do bucket de tokens por minuto da camada gratuita.
      - Resumabilidade inteligente: arquivos já existentes no disco são preservados e reaproveitados automaticamente caso uma execução seja retomada.
    - **Consolidação em `OVERVIEW.md` e `_meta.json`**: Gera índice completo do laboratório com links markdown relativos clicáveis para cada documento e marca `status: "completed"`.
    - **Integração com Grafo Neural 3D (`scripts/scan-vault.js`)**: Mapeamento de nós do laboratório com ícones dedicados (`🔬` para pastas/overview, `📘` para knowledge e `🛠️` para actionable) orbitando a estrela central do projeto.
    - **Validação Prática Real**: Execução completa no projeto `teste_alfredo_22` gerando 9 arquivos técnicos completos (8 em `knowledge/` e 1 em `actionable/`) totalizando mais de 100KB de documentação técnica gerada autonomamente.
    - **Catálogo de Subtópicos & Documentos Conectado ao Disco**:
      - Corrigido o modal de subtópicos (`openDecomposeModal`): eliminado o gatilho redundante de consulta à IA quando a pesquisa já possui arquivos gerados no disco.
      - O modal agora renderiza fielmente todos os arquivos reais existentes em `knowledge/` e `actionable/` (9 de 9 no caso do Bolo de Banana).
      - Adicionados botões de ação direta em cada documento: `✏️ Editar / Ler` (abre no Live Markdown Editor para visualização e edição imediata com salvamento no disco via Ctrl+S) e `🗑️ Excluir` (remove o arquivo do disco, atualiza `_meta.json` e o `OVERVIEW.md`).
      - Adicionado botão de exclusão completa do laboratório de pesquisa (`🗑️`) no cabeçalho de cada card de pesquisa.
      - Novos endpoints backend: `POST /api/projects/:name/research/:slug/file/delete` e `POST /api/projects/:name/research/:slug/delete`.
  - **Research Lab — Etapa 2 (UX/UI UAU no Brain Visualizer)**:
    - **Aba Dedicada `🔬 Research Lab` no Project Workspace**: Integrada à navegação com pílula de contagem dinâmica (`#pwResearchTabBadge`).
    - **Hero Banner com Glassmorphism Espacial**: Header com gradiente cósmico, badge pulsante verde de status da Groq Cloud (`openai/gpt-oss-120b`), latência média de inferência (~1.5s) e botão de ação primária `✨ Nova Pesquisa no Lab`.
    - **Cards Métricos do Lab**: Mapeamento em tempo real do total de pesquisas ativas, documentos em `knowledge/`, especificações em `actionable/` e latência.
    - **Empty State Futurista**: Orbe atômico pulsante em CSS, texto explicativo e botões de atalho para prompts rápidos de 1 clique (Microsserviços Event-Driven, Auth JWT, Cache & Redis).
    - **Grid de Cards de Laboratório**: Cards com efeito hover 3D, indicador de status `🟢 Ativo`, caixa expansível do **Prompt Vivo** com tag de versão (`v1`, `v2`), badges das duas camadas (`knowledge/` e `actionable/`) e botões de ação (`▶️ Pesquisar Agora`, `🔮 Grafo 3D`, `🧩 Subtópicos`, `📄 OVERVIEW.md`, `📂 Abrir Pasta`).
    - **Correção de Layout Responsivo**: Ajustado `.rl-card-title-text` com `word-break: break-word` e badge `🟢 Ativo` fixado à direita com `flex-shrink: 0`, eliminando qualquer sobreposição visual.
    - **Modal de Criação "Nova Pesquisa" com Efeito UAU**:
      - Campo de tema com chips de presets rápidos.
      - Botão com faíscas animadas `✨ Melhorar com IA (Groq)`.
      - **Split View Comparador "Antes vs Depois"**: Painel lado a lado contrastando a ideia bruta com o briefing estruturado pela IA.
      - Painel de pré-visualização de decomposição temática com subtópicos categorizados em chips azuis (`knowledge`) e verdes (`actionable`).
    - **Modal de "Prompt Vivo" & Histórico de Versões**: Interface de linha do tempo com todas as versões passadas do briefing (`definitionHistory`), data/hora e re-refinamento com IA.
  - **Research Lab — Etapa 1 (Backend & IA Groq)**:
    - **Módulo Nativo Groq (`scripts/groq-client.js`)**: Cliente HTTP nativo zero-dependência para a API do Groq Cloud (`api.groq.com`), com carregador próprio de `.env`, timeout de 60s, sanitização de markdown fences e parsing robusto de JSON.
    - **Modelo Ativo**: Suporte para `openai/gpt-oss-120b`, `openai/gpt-oss-20b` e `qwen/qwen3.8-27b`.
    - **Prompt Vivo & Refinamento Contextual (`refineResearchPrompt`)**: Algoritmo de enriquecimento que lê automaticamente os contratos do projeto (`PROJECT.md`, `ARCHITECTURE.md`) e transforma intenções livres do usuário em briefings de pesquisa estruturados de alto impacto.
    - **Decomposição em Subtópicos (`decomposeResearchTopic`)**: Divisão do tema de pesquisa em sub-tópicos com taxonomia definida.
    - **Endpoints REST Implementados no `server.js`**: `/api/ai/status`, `/api/ai/refine-prompt`, `/api/ai/decompose`, `/api/projects/:name/research`, `/api/projects/:name/research/:slug/definition`, `/api/projects/:name/research/:slug/run`.

- **Data**: 2026-10-01 (Madrugada)
  - **Gravação Física de Backups & Integração Nativa com Windows Explorer**:
    - Backend grava fisicamente os arquivos gerados em `projects/<projeto>/BACKUPS/` (`dossie_governanca_<projeto>.md` e `backup_governanca_<projeto>.json`).
    - Novos endpoints `/api/system/open-folder` e `/api/system/open-file` para abrir a pasta no Windows Explorer (`explorer.exe /select`) ou o arquivo no app padrão (`cmd /c start`).
    - Correção do download do navegador mantendo o Blob URL ativo por 10s para permitir que o Chromium conclua a gravação sem abortar.
    - Card enriquecido na aba *Backup & Exportação* com caminho absoluto no disco, botão direto para abrir no Explorer, botões para abrir cada arquivo, baixar e copiar caminhos.
  - **Interatividade Total nos Cards do Project Workspace**:
    - Edição rápida inline no card *Visão Geral & Contratos* para alterar Objetivo, Stack e Status com gravação direta no disco.
    - Seletor de status do ciclo com pílulas luminosas conectadas ao `CURRENT_STATE.md`.
    - Checklist interativo (*O que já foi definido*) com alternância, retorno ao roadmap e exclusão.
    - Roadmap dinâmico (*Próximos Passos*) com botão "✓ Concluir" em 1 clique e input inline com tecla Enter.
    - Sistema de Toast visual com glassmorphism para feedback instantâneo de gravação.
  - **Contratos de Governança 100% Dinâmicos**:
    - Backend inspeciona arquivos físicos reais no disco, exibindo apenas documentos existentes (`PROJECT.md`, `CURRENT_STATE.md`, etc.).
    - Identificação de contratos recomendados ausentes (ex: `ARCHITECTURE.md`) com ação de inicialização com 1 clique (`+ Inicializar ARCHITECTURE.md`).
    - Layout e botões dos chips de governança reformulados com `.btn-gov`, eliminando quebras de linha e desproporções.
  - **Correções Estruturais & Backend**:
    - Correção do aninhamento de modais no HTML que impedia a exibição do Live Markdown Editor.
    - Correção na rota `GET /api/file` no `server.js` com verificação de método HTTP estrita, eliminando erro `400 Bad Request` no salvamento.
- **Data**: 2026-09-30
  - **Quickstart Studio (Modal de 3 Minutos)**: Onboarding guiado no portal web para criar projetos do zero ou vincular pastas existentes via junções NTFS sem terminal.
  - **Sidebar "Dois Mundos"**: Reorganização visual clara separando "MEUS PROJETOS" no topo e "CÉREBRO & GOVERNANÇA" abaixo com divisor neon.
  - **Project Workspace (Página Dedicada do Projeto)**: Hub com 5 abas (Visão Geral, Memória & Saúde, Grafo Neural 3D, Backup & Exportação de Dossiê, Gerenciamento & Desvinculação Segura).
  - **Grafo Neural 3D (Three.js)**: Grafo orbital onde o projeto é o Sol Central conectado a seus arquivos locais e satélites de governança.
  - **Grafo Global com Clusters Galácticos**: Projetos agrupados em clusters orbitais interligados por regras comuns.
  - **APIs de Ciclo de Vida**: Endpoints backend para diagnóstico de memória, arquivamento seguro em `.archive/`, exportação de backup (.md e .json) e desvinculação não destrutiva.
