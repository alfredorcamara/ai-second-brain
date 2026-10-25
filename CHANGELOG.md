# Changelog — AI Second Brain

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico (SemVer)](https://semver.org/lang/pt-BR/).

---

## [1.4.1] — 2026-10-25

### ⚖️ Governança & Licenciamento
- **Transição para Functional Source License (FSL-1.1-MIT)**:
  - Adotada a licença `FSL-1.1-MIT` (Source-Available / Fair-Code) garantindo que o software permaneça gratuito e aberto para desenvolvedores, pesquisa, estudos e uso produtivo interno, com vedação explícita à exploração comercial concorrente desautorizada por terceiros.
  - Período de proteção comercial estabelecido em **4 anos** a partir do lançamento de cada versão, convertendo-se automaticamente em MIT permissivo após esse prazo.
  - Registro formal da **ADR-G012** em `decisions/GLOBAL_DECISIONS.md`.
- **Adoção de Contrato de Licença de Colaborador (CLA)**:
  - Criação do `CLA.md` e do guia de colaboração `CONTRIBUTING.md`, resguardando a propriedade intelectual e garantindo a soberania do autor para manutenção e evolução do ecossistema.

### 🎨 Design & UI/UX (Landing Page)
- **Refinamento dos Cards do Catálogo Dinâmico**:
  - Adicionado rótulo informativo sutil `Exemplos` acima dos modelos recomendados.
  - Adoção de nomes comerciais legíveis (ex.: `Llama 3.3 70B`, `DeepSeek R1 (70B)`, `Gemini 2.5 Flash`) em substituição aos IDs brutos de API, eliminando quebras indesejadas de linha.
  - Reestruturação em contêineres dedicados (`.profile-example-row`) com espaçamento vertical confortável e tipografia mono ajustada.
- **Seção Comunidade**:
  - Badge aprimorado para `COLABORAÇÃO & COMUNIDADE` e título refinado para `Construído com você.` (com paridade integral em inglês no dicionário `i18n.dict.js`).
  - Rodapé atualizado para refletir a nova licença `FSL-1.1-MIT`.

---

## [1.4.0] — 2026-10-21

### 🚀 Adicionado & Aprimorado
- **Agnosticismo Total de IA na Solução (Universal AI Gateway)**:
  - **Status Pill Interativo no Research Lab**: O pill de status da IA no hero banner (`#rlConnectedAiPill`) agora é clicável (`.rl-ai-clickable`) com micro-animação de engrenagem (`gear-spin-hover`), permitindo ao usuário abrir diretamente o modal de configurações de IA (`openAiSettingsModal()`) com 1 clique.
  - **Neutralização Universal no Cockpit e Documentação**:
    - Hero da documentação da solução (`index.html` e `demo/index.html`) atualizado para `🔬 Motor: Universal AI Gateway + SSE`.
    - No Capítulo 3 (Governança & Roteamento), novo callout explicando a camada generativa universalmente desacoplada (Groq, OpenAI, Anthropic Claude, Google Gemini, DeepSeek, OpenRouter e Ollama local offline).
    - No Capítulo 7 (FAQ Técnico), reformulação completa da pergunta sobre indisponibilidade de IA, detalhando tratamento automático de TPM/RPM (HTTP 429), backoff exponencial, troca transparente de fornecedor e independência do motor de regras AIJev.
    - Modal de Nova Pesquisa (`#btnAiRefine`): Botão "Melhorar com IA" agora reflete dinamicamente em tempo real o provedor ativo.
    - Modal de Erro (`#aiErrorProviderText`) e Terminais de Diagnóstico: Textos acoplados substituídos por designações neutras do AI Gateway.
  - **Diagramas Arquiteturais Desacoplados**:
    - `research-two-layers.svg`: Atualizado para referenciar o `Universal AI Gateway`.
    - `ai-decision-routing.svg`: Atualizado para `Universal AI Gateway + Validação`.
  - **Documentação Markdown & Vault**:
    - `RESEARCH_LAB.md`, `SOLUCAO_AI_SECOND_BRAIN.md`, `GUIA_TECNICO_AI_DECISION_GATE_JEV.md` e `decisao_groq_provider.md` revisados e neutralizados.
    - Snapshot `vault-data.js` regenerado com zero resquícios de fornecedores específicos.

### 🛡️ Corrigido
- **Acessibilidade WAI-ARIA & Ciclo de Foco em Modais (Inert Attribute)**:
  - **Prevenção da Violação Chromium (`Blocked aria-hidden because its descendant retained focus`)**:
    - Ajustado o ciclo de vida de fechamento em todos os modais da Landing Page (`#promo-video-modal-9x16`, `#feature-modal`, `#video-modal`) e gaveta de leitura Markdown (`#reader`), restaurando o foco para o elemento disparador ou executando `blur()` defensivo **antes** de atribuir `aria-hidden="true"`.
    - Adoção nativa do atributo `inert` em todos os contêineres modais quando inativos, prevenindo interações indesejadas, foco de teclado fantasma e leituras desnecessárias por tecnologias assistivas.
- **Refinamento Visual & Geométrico no Diagrama `ai-decision-routing.svg`**:
  - **Alinhamento e Camada dos Badges "SIM ➔"**:
    - Badges `SIM ➔` perfeitamente centralizados no eixo horizontal de cada decisão (`y = 195`, `y = 335`, `y = 450`).
    - Aplicação de preenchimento 100% sólido/opaco (`#06130e`, `#05121c`, `#130815`) e sombra de profundidade (`filter="url(#cardShadow)"`), garantindo que as linhas animadas passem de forma limpa e contínua **por trás/por baixo** do badge pelo centro, sem atravessar nem riscar o texto do "SIM".
  - **Enquadramento da Caixa "LLM com Governança"**:
    - Largura dos cards de resultado expandida de 260px para 285px (`x = 600`), com altura unificada em 80px.
    - Tamanho da fonte do subtítulo (`● Uso consciente: Apenas onde gera valor real`) ajustado para 9px, eliminando o transbordamento para fora da borda do card e garantindo margem interna e acabamento de alto padrão.
- **Paridade Estrita 100%**:
  - Sincronização rigorosa de todos os diagramas, templates e scripts entre `docs/brain-ui/`, `docs/brain-ui/demo/` e `docs/brain-ui/landing/`.

---

## [1.3.0] — 2026-10-21

### 🚀 Adicionado
- **Cockpit de Síntese Neural em Tempo Real (Quickstart AI Synthesis Cockpit)**:
  - Eliminação da sensação de tela congelada/opaca durante a geração dos contratos de governança.
  - Streaming de telemetria técnica via Server-Sent Events (SSE `/api/vault/events` com evento `quickstart-progress`) diretamente do motor de inferência em `server.js` e `scripts/quickstart-grill.js`.
  - Esteira visual de 4 cards interativos em pipeline (`📑 Extração de Requisitos`, `📄 PROJECT.md`, `🏗️ ARCHITECTURE.md`, `⚖️ CURRENT_STATE.md & ADR-0001`) com spinners animados, badges de status (`Pendente`, `Analisando / Gerando`, `Concluído`) e transições visuais fluidas.
  - Console de telemetria técnica integrado com exibição em tempo real de logs de execução, modelo ativo, cronômetro de elapsed time e medidor de velocidade/tokens gerados.
  - Modal expandido para `1040px` com `repeat(4, minmax(0, 1fr))` garantindo visualização 100% visível dos 4 cards sem cortes horizontais e conversão responsiva 2x2.
- **Guarda Anti-Fechamento Involuntário & Confirmação de Saída do Quickstart Studio**:
  - Isolamento de cliques acidentais no backdrop escuro via rastreamento de `mousedown` (`qsBackdropMouseDownTarget`), eliminando fechamentos fantasmas ao selecionar texto ou alternar entre campos do formulário.
  - Modal de confirmação inteligente (`#qsConfirmExitModal`) para cliques fora do modal, botão `✕` e tecla `Escape`, protegendo o desenvolvedor contra a perda de respostas da sabatina e especificações preenchidas no Passo 2.
  - Isenção automática de confirmação no Passo 3 ("Conectado!"): após clicar no botão verde *"💾 Aprovar e Criar Projeto no Disco"*, o modal pode ser concluído imediatamente sem prompt confirmatório.

### 🛡️ Corrigido
- **Resiliência a Escopo e Variáveis Globais**:
  - Blindagem da função `hasQuickstartProgress()` com checagens estritas `typeof ... !== 'undefined'`, prevenindo `ReferenceError` em qualquer cenário de ciclo de vida.
- **Paridade Estrita 100%**:
  - Sincronização rigorosa de layout, comportamento e eventos entre o ambiente local (`docs/brain-ui/`) e a versão demo (`docs/brain-ui/demo/`).

---

## [1.2.0] — 2026-10-19

### 🚀 Adicionado
- **Suporte Nativo ao Google Gemini**: Integração direta no AI Gateway (BYOK) com suporte à família `gemini-3.8-flash`, `gemini-flash-latest`, `gemini-3.5-flash-lite`, e modelos de alto contexto (1M+ tokens).
- **Curadoria e Agrupamento Semântico Dinâmico de Modelos**:
  - Classificação automática e dinâmica via API sem hardcoding em três grupos no `<select>`:
    - 🌟 *Recomendados para Arquitetura & Raciocínio*
    - ⚡ *Rápidos & Baixa Latência*
    - 🛠️ *Abertos & Código (Open-Weights)*
  - Filtro inteligente que descarta automaticamente modelos irrelevantes para engenharia de software (áudio, imagem/vídeo, transcrição, robótica, moderação, descontinuados).
- **Telemetria e Sinalização Visual de Cota Esgotada (HTTP 429 Rate Limit / Créditos)**:
  - Botão de IA na Topbar (`#btnAiGatewayModal`) passa a pulsar em vermelho (`.quota-exceeded`) imediatamente ao detectar falta de crédito ou limite por minuto em qualquer operação.
  - Banner contextual `#aiSettingsQuotaBanner` exibido com destaque dentro do modal de configurações indicando exatamente qual modelo/provedor esgotou e orientando como alternar em 1 clique.
  - Extração de cabeçalhos de taxa dos provedores (`tokensRemaining`, `requestsRemaining`, `retryAfter`) exibidos no mini-console do modal.
- **Badge de Versão, Detecção Automática de Atualizações & Modal Changelog**:
  - Badge dinâmico no Cockpit (`#versionBadgeSidebar` e `#versionBadgeTopbar`) exibindo a versão ativa (`v1.2.0`) e novidades.
  - Verificação ativa via endpoint `/api/system/version` se a cópia local está defasada em relação ao `origin/main`, ativando badge dourado pulsante (`Atualização ⚡`) e orientação de `git pull origin main`.
  - Modal interativo "O que há de novo?" (`#changelogModal`) renderizando o `CHANGELOG.md` estruturado, botão de 1 clique para copiar `git pull origin main` e link para a página oficial de releases.
  - Checagem preventiva integrada ao CLI do sistema (`npm run doctor`).
- **Pasta de Exemplos de Entrada**: Inclusão de `docs/Exemplos/` contendo casos de uso reais de requisitos complexos para teste do Quickstart e Research Lab.

### 🛡️ Corrigido
- **Desacoplamento Universal do Research Lab**:
  - Eliminados todos os textos estáticos que mencionavam a Groq Cloud na síntese em tempo real, banners de hero, métricas de latência e progresso SSE. O modal agora exibe dinamicamente o provedor ativo (ex: `GOOGLE GEMINI • SÍNTESE AUTÔNOMA EM TEMPO REAL`).
  - `scripts/research-engine.js` desacoplado do cliente legado da Groq, invocando o `aiGateway` diretamente.
  - Frontmatter dos arquivos Markdown gerados passa a persistir com fidelidade o provedor e modelo reais utilizados (`model: "gemini-3.8-flash"`, `provider: "Google Gemini"`).
- **Invalidação de Cache de Módulos no Servidor Node.js**:
  - Invalidação dinâmica de `require.cache` nas rotas do Research Lab em `server.js` para garantir que alterações no `.env` e scripts de inferência tenham efeito imediato sem necessidade de reinício manual.
- **Paridade Estrita**: 100% de sincronismo e paridade visual e funcional entre o Cockpit local ([`docs/brain-ui/app.js`](docs/brain-ui/app.js)) e o modo online ([`docs/brain-ui/demo/app.js`](docs/brain-ui/demo/app.js)).

---

## [1.1.0] — 2026-10-18

### 🚀 Adicionado
- **Suporte a HTTP 206 Partial Content (Range Requests)**: Streaming fluido de vídeos `.mp4` e `.webm` no servidor nativo Node.js com suporte a scrubbing e buffer progressivo sem download redundante.
- **Player Vertical 9:16 (Bento Grid Cinemática)**: Suporte a demonstrações em formato mobile-first/shorts com pausa automática de animações Three.js em segundo plano para economia de GPU.
- **Quickstart Studio em 3 Atos**: Fluxo progressivo de onboarding de novos projetos (Briefing → Sabatina Técnica / Grill → Contratos de Governança).

### 🛡️ Corrigido
- **Isolamento de Cliques em Cards**: Eliminação de disparo concorrente de modais em cards com múltiplos gatilhos interativos via `stopPropagation`.
- **Estabilidade Geométrica de Visualizadores de Contratos**: Compensação inversa de zoom (`calc(100% / ratio)`) eliminando faixas vazias ou encolhimento de layout em minutas extensas.

---

## [1.0.0] — 2026-10-03

### 🚀 Lançamento Inicial
- Fundação do **AI Second Brain**: plataforma agnóstica de governança e desenvolvimento assistido por IA.
- Portal Cockpit Web com visualização orbital em Grafo 3D (Three.js/WebGL).
- Research Lab de síntese autônoma em duas camadas (`knowledge/` e `actionable/`).
- Session Capture para registro estruturado de sessões com IA e git diff.
- Mecanismo "Pergunte ao Cérebro" (Spotlight `Ctrl+K`) com busca semântica estrita e Zero Fabricação.
- Regras universais, skills para agentes e linter de contratos (`npm run doctor`).
