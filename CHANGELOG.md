# Changelog — AI Second Brain

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico (SemVer)](https://semver.org/lang/pt-BR/).

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
