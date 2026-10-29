# Histórico de Sessões da Plataforma — AI Second Brain

## Sessões Recentes
- **Data**: 2026-10-28
  - **Estratégia de Engajamento Comunitário & Apoio Open Source (v1.4.2)**:
    - **Demanda**: Solucionar o descompasso entre o alto volume de clones (mais de 219 cloners únicos em 14 dias) e a baixa conversão de estrelas no GitHub (~4 estrelas), decorrente de ~97% dos usuários clonarem e rodarem localmente sem abrir a página do repositório no navegador.
    - **Solução Implementada**:
      1. *Cockpit Toast Inteligente (`#starFeedbackToast`)*: Notificação não-bloqueante no canto inferior direito disparada no maior momento de valor (ao concluir o Quickstart Studio) e como fallback na 3ª sessão, com persistência no `localStorage` (opções "Dar Estrela" e "Já dei" silenciam para sempre; "Depois" agenda lembrete após 14 dias).
      2. *Link Fixo na Sidebar*: Botão dourado translúcido (`⭐ Apoiar no GitHub`) no rodapé da barra lateral abaixo do badge de versão.
      3. *Terminal Onboarding (`server.js`)*: Inclusão de link amigável no banner do console ao rodar `npm start` / `start-brain.bat`.
      4. *Landing Page & Analytics*: Navbar atualizada com botão `⭐ Star no GitHub`, callout de alta intenção (`.star-callout`) logo abaixo da caixa do comando `git clone`, e telemetria de conversão em `analytics.js` mapeando `quickstart_star_callout`.
      5. *Instruções para Agentes de IA*: Orientações integradas em `AGENTS.md`, `CLAUDE.md` e `GEMINI.md` para recomendação cortês de apoio após sessões com sucesso. Badges de Stargazers, Release e Licença adicionados ao `README.md`.
      6. *Paridade e Versionamento*: Sincronizado integralmente entre `AI_SECOND_BRAIN` e `AI_SECOND_BRAIN-SITE` e versionado para `v1.4.2`.

- **Data**: 2026-10-26
  - **Desacoplamento em Dois Repositórios (Core vs Site/Demo) sob Pasta Mãe AI_SECOND_BRAIN_CENTRAL**:
    - **Demanda**: Isolar os arquivos pesados de marketing e vídeos (~30 MB) da Landing Page do repositório principal de código para viabilizar um clone ultraleve (< 10 MB) para desenvolvedores, preservando paridade automática Cockpit -> Demo e integridade de links sem 404.
    - **Solução Implementada**:
      1. *Estruturação Central*: Criada pasta raiz AI_SECOND_BRAIN_CENTRAL contendo AI_SECOND_BRAIN (Core/Cockpit) e AI_SECOND_BRAIN-SITE (Landing Page e Demo interativa pública).
      2. *Automação de Replicação (
pm run sync:demo)*: Criado scripts/sync-demo.js que sincroniza App Core, CSS e Assets visuais do Cockpit para a Demo pública com preservação obrigatória do vault-data.js isolado (zero vazamento de projetos locais).
      3. *Redirecionador Inteligente*: Criado scripts/apply-landing-redirect.js com meta-refresh e preservação de query parameters/UTMs para redirecionar tráfego antigo sem quebras.
      4. *Validação & Integridade*: Caminhos absolutos e linter de versão do doctor.js ajustados. 100% dos links e 37 scripts aprovados com 0 erros.

- **Data**: 2026-10-25
  - **Instrumentação de Métricas de Conversão & Captura de UTMs na Landing Page (`docs/brain-ui/landing/`)**:
    - **Demanda**: Solucionar o "ponto cego" entre o tráfego da Cloudflare e as métricas do GitHub (views, clones e stars), medindo a intenção real dos visitantes da landing page através de eventos qualificados e atribuição de campanhas (UTMs).
    - **Solução Implementada**:
      1. *Módulo de Telemetria Resiliente (`docs/brain-ui/landing/js/analytics.js`)*: Criado motor sem dependências e sem cookies intrusivos que unifica o rastreamento via Event Bus (`window.trackBrainEvent(eventName, payload)`), com suporte a Cloudflare Zaraz, GA4, Plausible, Umami e dispatch de `CustomEvent` no DOM.
      2. *Captura & Propagação de UTMs*: Leitura automática de `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` e `initial_referrer` persistidos em `sessionStorage`. Enriquecimento automático de links de saída para o repositório GitHub com o parâmetro `?ref=landing_${utm_source}`, permitindo rastreabilidade direta na aba *Traffic / Referring Sites* do GitHub.
      3. *Event Delegation nos Pontos Críticos do Funil*:
         - **Fundo de Funil (Alta Intenção)**: `click_github_cta` (Hero, Navbar, Rodapé), `click_github_release` (pill v1.4.1) e `copy_install_command` (cópia do comando `git clone`).
         - **Meio de Funil (Experimentação & Demonstração)**: `demo_interact` (carregamento inline do cockpit e abertura em tela cheia) e `video_play` (pitch 16:9, reels 9:16 e expansão).
         - **Topo de Funil (Engajamento & Objeções)**: `problem_tab_toggle` (comparador com/sem memória), `feature_card_click` (cards Quickstart e superpoderes), `faq_question_expand` (dúvidas expandidas no FAQ), `language_toggle` (PT/EN) e `graph_3d_explore` (modo imersivo).
      4. *Validação & Integridade*: Integrado com `defer` em `docs/brain-ui/landing/index.html`. `npm run doctor` executado com 100% de sucesso (34 scripts verificados, 0 links quebrados).

- **Data**: 2026-10-22
  - **Otimização de Core Web Vitals na Landing Page (LCP, INP e CLS via Cloudflare Analytics)**:
    - **Diagnóstico & Causa Raiz**:
      1. Relatório oficial do Cloudflare Web Analytics revelou LCP crítico no P75 (5.800 ms, com Element Render Delay de 4.370 ms e até 31.8s no P99), INP com 21% de interações ruins (picos de 944 ms em cards e 400 ms em modais) e CLS pontual em `#vantagens` (0.425) e `#ai-gateway` (0.134).
      2. As causas raízes identificadas foram: poster do player de vídeo inline usando PNG não comprimido de 304 KB (`og-image.png`); 9 cards de vídeo com `preload="auto"` saturando rede e decodificador no boot; ausência de dimensões explícitas e aspect-ratio nos diagramas SVG de `#arquitetura` empurrando seções inferiores; ausência de pausa do loop Three.js em `features-modal.js` gerando contenção de thread durante abertura de modais; e retomada simultânea de 9 vídeos via `play()` no fechamento de modais.
    - **Soluções Implementadas**:
      1. *LCP*: Geração de poster WebP de alta eficiência (`promo-poster.webp`, 52 KB, redução de 83% no payload) para os players de vídeo inline e lightbox; inclusão de `<link rel="preload" as="image">` com `fetchpriority="high"` e dimensões explícitas `width="165" height="90"` no logo da navbar; e adição de `defer` em todos os scripts JavaScript para desbloquear a primeira pintura do DOM.
      2. *INP*: Integração de `IntersectionObserver` inteligente para os 9 cards de vídeo, garantindo que apenas cards visíveis no viewport sejam reproduzidos; pausa do grafo Three.js (`window.__brain.g.stop()`) e de todos os vídeos de fundo ao abrir qualquer modal técnico ou de vídeo; e retomada cirúrgica apenas dos vídeos que estão dentro da viewport ao fechar modais.
      3. *CLS*: Definição de `min-height: clamp(260px, 50vw, 540px)` no `.diagram-frame` e `aspect-ratio: 920 / 520` nos diagramas `.diag` da seção `#arquitetura`, eliminando saltos de layout nas seções inferiores; `aspect-ratio: 1208 / 658` no `.brand-brain-img`; `contain: layout paint` em `.card-video-header` e `contain: strict` em `.card-video-media-wrap`; e `content-visibility: auto` nas seções `#demo` e `#faq`.
      4. *Eliminação de Travamento em Vídeos Verticais 9:16 (`MemoriaPersistente-9x16.mp4` e `pergunte-cerebro-card-promo-9x16.mp4`)*:
         - **Causa Raiz Parte 1 (Vídeo)**: Remotion exportou com GOP aberto de 8.33s (apenas 6 keyframes em 34s) e perfil 1080x1920 High 5.0. No streaming web, a ausência de I-frames impedia a recuperação rápida do decodificador.
         - **Causa Raiz Parte 2 (Modal / Compositor GPU)**: O vídeo rodava 100% fluido em tela cheia porque o Chromium promovia o elemento para DirectComposition Hardware Overlay independente. No entanto, dentro do modal, a combinação de `overflow: hidden` + `border-radius: 20px` no container pai desqualificava o vídeo do overlay de hardware, forçando o Chromium a fazer rasterização Skia por software e mascaramento a cada frame. Além disso, `box-shadow` pulsante contínuo no cabeçalho invalidava o paint, a proporção 380px gerava altura fracionária (675.55px) e o backdrop semi-transparente impedia o Occlusion Culling.
         - **Correção**:
           - Vídeos re-codificados para 720x1280, GOP fixo de 1.0s (`-g 30`), H.264 Main 3.1 com `+faststart` e espaço de cor `bt709`.
           - Remoção de `overflow: hidden` do dialog do modal, aplicando `border-radius` apenas no cabeçalho e rodapé (mantendo o vídeo retangular puro para DirectComposition);
           - Redução da largura para 360px (proporção exata inteira de 360×640 sem subpixel rounding);
           - Remoção de transforms 3D residuais no modal ativo (`transform: none`) e no elemento de vídeo;
           - Backdrop opaco sólido (`#04060e`) ativando Occlusion Culling (GPU descarta renderização da página de fundo);
           - Desativação do `box-shadow` animado no `.video-live-dot` do modal e início de reprodução via `requestAnimationFrame`.
      5. *Frame congelado até trocar o foco do browser (localhost)*: áudio contínuo com imagem parada = compositor sem apresentar frames (não é decodificação). Correção: `body.promo-modal-open` + `visibility:hidden` nos irmãos do modal (remove ~30 `backdrop-filter` e o canvas WebGL da composição), `play()` após o fade-in (270ms), `disablePictureInPicture`/`disableRemotePlayback` no player e hardening do Range/abort de stream em `server.js` (Range sufixo `bytes=-N`, `fileStream.destroy()` no `close`).
      6. *Refinamento Visual do Botão de Vídeo 9:16*: Texto simplificado de "Vídeo Demo (9:16)" para "Assista" (e "Watch" no dicionário i18n) e padding ajustado para `5px 13px 5px 5px`, aproximando o ícone circular de play da borda esquerda arredondada da cápsula.
      7. *Reabrir o mesmo vídeo não tocava*: `currentSrc` ficava obsoleto após `removeAttribute('src')` + `load()` no fechamento, então a abertura não reatribuía o `src`. Corrigido comparando com `getAttribute('src')` e sempre atualizando o poster (`extra.js`).
      8. *Validação*: `npm run doctor` executado com 100% de sucesso (33 scripts íntegros, links validados, 0 links ou assets quebrados).

- **Data**: 2026-10-21
  - **Agnosticismo de IA no Cockpit & Documentação da Solução (Universal AI Gateway BYOK)**:
    - **Diagnóstico & Causa Raiz**:
      1. No *Research Lab*, o hero banner continha texto acoplado citando nominalmente fornecedor de IA, e o status pill da IA não permitia ação direta.
      2. No leitor de documentação da solução embutido no Cockpit (`<!-- Corpo Principal da Documentação -->` em `docs/brain-ui/index.html` e `demo/index.html`), o pill superior exibia `Motor: Groq Cloud (120b) + SSE` e a FAQ continha pergunta vinculada a provedor específico com fallback para modelo inexistente (`openai/gpt-oss-20b`).
    - **Soluções Implementadas**:
      1. *Research Lab Interativo*: O pill de status da IA no hero tornou-se clicável (`.rl-ai-clickable` com `openAiSettingsModal()`), abrindo instantaneamente o modal de configurações de IA com animação e engrenagem rotativa. O texto descritivo foi neutralizado para referenciar a IA conectada via AI Gateway.
      2. *Agnosticismo nos Documentos Markdown & Vault*: `RESEARCH_LAB.md`, `SOLUCAO_AI_SECOND_BRAIN.md`, `GUIA_TECNICO_AI_DECISION_GATE_JEV.md` e `decisao_groq_provider.md` atualizados para refletir o Universal AI Gateway (BYOK), e o snapshot `vault-data.js` regenerado com zero resquícios acoplados.
      3. *Documentação da Solução (Cockpit)*:
         - **Hero Meta Pill**: Atualizado para `🔬 Motor: Universal AI Gateway (BYOK) + SSE`.
         - **Capítulo 03 (Governança & Roteamento)**: Adicionado callout ilustrando a camada generativa 100% desacoplada via BYOK (Groq, OpenAI, Claude, Gemini, DeepSeek, OpenRouter e Ollama local offline).
         - **Capítulo 07 (FAQ Técnico)**: Atualizada a pergunta para "O que acontece se o provedor de IA atual ficar indisponível ou atingir a cota?", detalhando o monitoramento de rate limit (429), backoff exponencial, troca com 1 clique de provedor e execução 100% offline do motor de regras AIJev.
      4. *Neutralização Global de Resquícios em Modais, Terminais e Diagramas SVG*:
         - **Diagramas Arquiteturais SVG**: Os diagramas da documentação (`ai-decision-routing.svg` e `research-two-layers.svg`) exibiam no desenho `Groq Cloud (120b)` e `Groq (120b/20b)`. Ambos foram atualizados em todas as instâncias (`docs/brain-ui/assets/diagrams/`, `demo/` e `landing/`) para `Universal AI Gateway` e `Universal AI Gateway + Validação`.
         - **Remoção de Jargão `(BYOK)` da UI Visível**: Eliminado o sufixo `(BYOK)` do botão do modal de erro (`#btnAiErrorOpenConfig`), do Hero pill da documentação e de callouts explicativos, mantendo uma experiência limpa e amigável.
         - **Modal de Erro (`#aiErrorProviderText`)**: Alterado texto estático inicial de `Groq Cloud` para `Provedor de IA`.
         - **Modal de Nova Pesquisa (`#btnAiRefine`)**: Substituído `Melhorar com IA (Groq)` por `Melhorar com IA` e adicionada sincronização dinâmica no `openResearchModal` para exibir o nome do provedor ativo.
         - **Modal de Configurações (`#aiQuotaBannerText`)**: Removido acoplamento de texto a `Groq Cloud`, tornando o aviso de rate limit neutro.
         - **Terminal Standby (`#aiModalTerminalOutput`)**: Atualizado de `ENGINE: GROQ [STANDBY]` para `ENGINE: AI GATEWAY [STANDBY]`.
         - **Placeholder de Modelo Customizado**: Atualizado de `openai/gpt-oss-120b` para `gemini-2.5-flash, gpt-4o, claude-3-7-sonnet...`.
         - **Comentários de Servidor**: Cabeçalho de `server.js` atualizado para Universal AI Gateway.
      5. *Ajustes Visuais no Diagrama SVG de Roteamento de Decisão (`ai-decision-routing.svg`)*:
         - **Linha Tracejada passando por baixo do centro dos Badges SIM**: Os 3 badges `SIM ➔` voltaram a ficar perfeitamente centralizados no eixo horizontal do fluxo (`y=195`, `y=335`, `y=450`), agora com fundo 100% sólido/opaco e sombra de profundidade (`filter="url(#cardShadow)"`), fazendo com que a linha tracejada animada passe por trás/por baixo do badge, sem riscar ou sobrepor o texto "SIM".
         - **Enquadramento do Texto da 3ª Linha na Caixa "LLM com Governança"**: Expandida a largura dos 3 cards de resultado de 260px para 285px (`x=600`), unificada a altura para 80px e ajustado o tamanho da fonte do subtítulo de governança para 9px (`● Uso consciente: Apenas onde gera valor real`), eliminando o transbordamento do texto e garantindo respiro e margem interna perfeita.
         - **Paridade e Cache-Buster**: Replicado de forma 100% idêntica em `docs/brain-ui/assets/diagrams/`, `demo/assets/diagrams/` e `landing/assets/diagrams/`, com bumping de cache (`?v=4`) no `index.html`, `demo/index.html` e `landing/index.html`.
      6. *Paridade e Integridade*: 100% sincronizado entre `docs/brain-ui/`, `demo/` e `landing/`. `npm run doctor` e `npm run scan` aprovados com 0 erros.

- **Data**: 2026-10-20
  - **Quickstart AI Synthesis Cockpit — Transparência Total e Telemetria em Tempo Real**:
    - **Diagnóstico & Causa Raiz**:
      1. Durante a criação de um novo projeto (com ou sem anexo de especificações, ex: `requisitos_cadastro_clientes_node_typescript_sqlserver.md`), o processo de síntese neural multi-passo leva de 1.5 a 3 minutos para produzir `PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md` e `ADR-0001`.
      2. A interface anterior exibia apenas um spinner circular estático com o texto fixo "Sintetizando contratos de governança...", sem nenhum indicador de progresso, sem tempo decorrido, e com os botões inferiores desabilitados, criando a impressão de que a tela estava completamente congelada ou travada.
    - **Soluções Implementadas**:
      1. *Quickstart AI Synthesis Cockpit*: Novo container interativo com glassmorphism de luxo (`.qs-synth-cockpit`) substituindo o spinner estático.
      2. *Header com Telemetria Dinâmica*:
         - Anel orbital giratório com pulso de IA bioluminescente (`.qs-synth-spinner-ring` e `.qs-synth-center-icon`).
         - Título dinâmico: "Arquiteto de IA Projetando a Governança" com badge de etapa (`Etapa 1 de 4`).
         - Pílula do motor de IA ativo (`🧠 Modelo: Groq / llama-3.3-70b-versatile`).
         - Pílula do documento anexado em análise (`📄 requisitos_...md`).
         - Cronômetro progressivo em tempo real (`⏱️ 00:34s`).
      3. *Barra de Progresso com Laser Shimmer*:
         - Trilho com gradiente de alta precisão (índigo → violeta → ciano) e efeito laser de varredura contínua (`.qs-synth-progress-laser`).
         - Percentual e legenda de status atualizados dinamicamente.
      4. *Pipeline de Contratos em Tempo Real (Grid de 4 Cards)*:
         - Cards específicos para **Extração de Requisitos**, **PROJECT.md**, **ARCHITECTURE.md** e **CURRENT_STATE.md & ADR-0001**.
         - Estados visuais distintos: `⏳ Na fila` (pendente), `⚡ Sintetizando com IA...` (ativo com glow e mini-spinner) e `✓ Concluído` (com métricas de caracteres/tamanho gerado em KB).
      5. *Terminal / Console de Telemetria Técnica ("Live Architecture Stream")*:
         - Console estilo terminal Mac/Linux com header de 3 bolinhas coloridas (red/yellow/green) e tag `● LIVE STREAM`.
         - Log monospace com timestamps (`[00:15]`) registrando cada ação do arquiteto neural, extração de entidades, RFs e tabelas SQL.
      6. *Streaming de Eventos em Tempo Real (SSE)*:
         - `scripts/quickstart-grill.js`: `generateDraft` agora recebe callback `onProgress` emitindo eventos em cada etapa da síntese multi-passo.
         - `server.js`: Rota `POST /api/projects/quickstart/draft` dispara `broadcastEvent('quickstart-progress', ...)` via Server-Sent Events.
         - `vault.js`: Adicionado listener para `quickstart-progress` chamando `handleQuickstartLiveProgress(info)`.
         - `app.js`: Suporte dual com fallback preditivo para garantir que a tela continue viva e animada sob qualquer condição de rede.
      7. *Gestão dos Botões de Ação*: Durante a síntese, os botões inferiores são ocultados para evitar dúvidas de usabilidade, e reaparecem suavemente quando os contratos são liberados para revisão.
      8. *Paridade e Integridade*: 100% sincronizado entre `docs/brain-ui/` e `docs/brain-ui/demo/`. `npm run doctor` aprovado com 100% de integridade.

- **Data**: 2026-10-19
  - **Sincronização da Versão no Boot Screen (v2.4 -> v1.2.0) & Redesign Tipográfico do Modal Changelog**:
    - **Diagnóstico & Causa Raiz**:
      1. A tela de splash/carregamento inicial exibia o texto estático `AI Operacional OS • v2.4`, gerando estranheza quanto à origem da numeração (era um placeholder legado estático escrito no HTML).
      2. No modal "O que há de novo?", os links estavam em azul nativo de navegador (`#0000ee`), criando baixo contraste e poluição visual contra o fundo escuro.
      3. A renderização do Markdown via `marked.parse` gerava HTML cru sem regras de estilização específicas: títulos `H1` repetidos desnecessariamente, parágrafos colados sem espaçamento, itens de lista sem margens e sub-listas aninhadas sem indentação ou diferenciação visual, tornando a leitura densa e desorganizada.
    - **Soluções Implementadas**:
      1. *Boot Screen Dinâmico*: Substituído o texto estático por `<span id="bootVersionText">` em `index.html` e `demo/index.html`. O `applyVersionToUI(data)` agora hidrata a versão dinamicamente direto do `package.json`.
      2. *Links Dark Glassmorphism*: Links estilizados em lavanda/índigo suave (`#818cf8` e hover `#a5b4fc` com text-shadow glow suave), eliminando qualquer resquício do azul padrão.
      3. *Layout e Tipografia Respirável*:
         - Banners de release (`h2`) com borda índigo de 4px, fundo em gradiente e cantos arredondados.
         - Seções (`h3`) estilizadas como tags de categoria (`🚀 Adicionado`, `🛡️ Corrigido`).
         - Itens principais de lista (`ul > li`) convertidos em cards leves com marcadores `◆` em `#818cf8` e espaçamento confortável.
         - Sublistas aninhadas (`ul ul`) em árvore visual com linha conectora lateral (`border-left: 2px solid rgba(99, 102, 241, 0.25)`) e marcadores `↳` em índigo.
         - Sub-sublistas (`ul ul ul`) com marcadores `–` em violeta.
         - Código inline destacado com fundo e borda sutis (`code`).
         - Remoção inteligente do título `H1` duplicado no corpo do modal.
      4. *Paridade Estrita*: 100% sincronizado entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `style.css`, `app.js`).
      5. *Validação*: `npm run doctor` e `node --check` aprovados com 100% de sucesso.

  - **Correção da Visibilidade do Modal Changelog & Versão 100% Dinâmica**:
    - **Diagnóstico & Causa Raiz**:
      1. Ao clicar em "Novidades ✨" no badge da sidebar ou topbar, a função `openChangelogModal()` executava normalmente, mas nenhum modal aparecia na tela.
      2. O elemento `#modalChangelog` utilizava classes inexistentes (`.modal-backdrop` e `.modal-content`). Como a aplicação define `body { height: 100vh; overflow: hidden; }` e `.modal-backdrop` não tinha `position: fixed; inset: 0; z-index: 10050`, o modal era renderizado como elemento estático no fim de 3.750 linhas de HTML, completamente fora do campo visual do desenvolvedor e transparente.
      3. O endpoint `/api/system/changelog` no `server.js` continha `version: '1.2.0'` fixo no JSON sem consultar o `package.json`, e `server.js` / `scripts/doctor.js` mantinham `'1.2.0'` como fallbacks estáticos desnecessários.
    - **Soluções Implementadas**:
      1. *Backdrop e Posicionamento Fixo*: Atualizado `#modalChangelog` para a classe canônica `.editor-modal-backdrop.changelog-modal-backdrop` (`position: fixed; inset: 0; z-index: 10050; backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center;`).
      2. *Estilização Dark Luxury Completa*: Aplicado gradiente escuro, borda bioluminescente suave, sombra profunda (`box-shadow: 0 30px 90px rgba(0, 0, 0, 0.95)`), animação de pop (`brainDialogPop`), cabeçalho `.changelog-modal-header` e botão de fechar `.changelog-close-btn` com hover avermelhado.
      3. *Fonte Única da Verdade (SSOT)*: Removidas todas as ocorrências de `'1.2.0'` hardcoded do backend. Endpoints `/api/system/version` e `/api/system/changelog` leem dinamicamente do `package.json` com fallback neutro (`'0.0.0'`).
      4. *Paridade Estrita*: 100% sincronizado entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `style.css`, `app.js`).
      5. *Validação*: `npm run doctor` aprovado com 0 erros em 129 arquivos Markdown e 32 scripts JS.

  - **Notificação de Atualizações, Modal Changelog & Badge de Versão (v1.2.0)**:
    - **Demanda do Usuário**:
      1. Como desenvolvedores e usuários que já clonaram o repositório ficarão sabendo das correções, melhorias e novas versões lançadas?
    - **Soluções Implementadas**:
      1. *Badge de Versão no Cockpit*: No rodapé da sidebar e na topbar, exibição de pílula de versão `v1.2.0 • Novidades ✨` com visual moderno dark glassmorphism.
      2. *Detecção Ativa de Atualizações via Git*: Endpoint `/api/system/version` e o CLI `scripts/doctor.js` checam se a cópia local está atrás de `origin/main` (`behind`). Se houver commits novos, o badge passa a pulsar em dourado/amarelo (`Atualização ⚡`) e orienta a execução de `git pull origin main`.
      3. *Modal "O que há de novo?"*: Ao clicar no badge, um modal interativo renderiza o `CHANGELOG.md` estruturado (SemVer / Keep a Changelog), permitindo copiar o comando `git pull origin main` em 1 clique e acessar a página de releases no GitHub.
      4. *Endpoints REST*: `/api/system/version` e `/api/system/changelog` no `server.js` com fallbacks completos e modo estático no `demo-mode.js`.
      5. *Doctor CLI*: `npm run doctor` exibe a versão atual instalada e alerta proativamente se houver atualizações disponíveis no repositório remoto.
      6. *Paridade Estrita*: 100% de paridade entre `docs/brain-ui/` e `docs/brain-ui/demo/`.

  - **Desacoplamento Universal de Provedores no Research Lab & Correção de Mensagens Hardcoded da Groq**:
    - **Diagnóstico & Causa Raiz**:
      1. Ao utilizar o Google Gemini (`gemini-3.8-flash`) no Research Lab ("Síntese em Tempo Real: Bolo de Banana"), o modal exibiu o badge fixo `GROQ CLOUD • SÍNTESE AUTÔNOMA EM TEMPO REAL` e um erro informando que o modelo "selecionado" não estava disponível no provedor Groq Cloud.
      2. No frontend (`docs/brain-ui/app.js` e `demo/app.js`), o modal de síntese em tempo real (`startLiveResearchFromModal`), os banners do hero, as métricas e os botões de refinamento continham rótulos estáticos mencionando "Groq Cloud" em vez de ler dinamicamente o provedor ativo configurado em `window.AI_GATEWAY_CONFIG.providerName`.
      3. No backend (`scripts/research-engine.js`), o motor importava `./groq-client` com fallbacks para "Groq Cloud" e cadência fixa referenciando a Groq, e em `server.js` as rotas de refinamento e decomposição invocavam diretamente o adaptador legado `groq.*`.
      4. O processo do servidor Node.js em background (`PID 26592`) estava em execução contínua desde as 16:15 com instâncias legadas dos módulos em cache (`require.cache`).
    - **Soluções Implementadas**:
      1. *Frontend 100% Dinâmico*: Todos os elementos do Research Lab (badge do hero, pílula de status, latência, modal de síntese em tempo real `.rl-live-engine-tag`, avisos de modo demo e eventos SSE) agora interpolam `activeProvName` dinamicamente a partir do provedor ativo (`Google Gemini`, `Anthropic Claude`, `OpenAI`, etc.).
      2. *Motor Desacoplado (`scripts/research-engine.js`)*: Atualizado para importar diretamente `./ai-gateway`, gravando metadados enriquecidos (`model` e `provider` reais) no frontmatter dos documentos gerados.
      3. *Rotas do Servidor Atualizadas (`server.js`)*: Chamadas de `refineResearchPrompt` e `decomposeResearchTopic` migradas para `getAiGateway()`, e recarregamento limpo de `research-engine` com invalidação de cache em cada disparo.
      4. *Reinicialização do Servidor*: O processo stale foi finalizado e reiniciado limpo na porta 3333; teste real executado com sucesso e os 8 documentos do Bolo de Banana foram gerados via Google Gemini (`gemini-3.8-flash`).
      5. *Paridade e Integridade*: 100% de paridade garantida entre `app.js` e `demo/app.js`, e `npm run doctor` aprovado com 0 erros em 126 arquivos.

  - **Sinalização Universal de Cota Esgotada (429 Rate Limit / Créditos) & Telemetria do AI Gateway**:
    - **Diagnóstico & Causa Raiz**:
      1. Ao utilizar o Anthropic Claude (`claude-sonnet-4-6`) no Research Lab ("Síntese em Tempo Real: Bolo de Banana"), o usuário recebeu a notificação de falta de créditos/limite de requisições, mas o botão no topo (`#btnAiGatewayModal`) continuou verde e o banner contextual `#aiSettingsQuotaBanner` permaneceu oculto ao abrir as configurações de IA.
      2. O `markAiInferenceError` e a injeção da classe `.quota-exceeded` haviam sido vinculados anteriormente apenas ao Quickstart Studio. O endpoint de execução do laboratório (`/api/projects/:name/research/:slug/run`) no `server.js` capturava a exceção e respondia com HTTP 500 genérico, descartando os metadados ricos (`statusCode: 429`, `isRateLimit: true`, `quotaExceeded: true`, `retryAfter`, `providerName`).
      3. No frontend (`startLiveResearchFromModal`), o erro era capturado apenas localmente para atualizar o DOM interno do modal e disparar um toast, sem invocar o estado global do botão ou persistir o erro.
      4. `updateAiGatewayPillUI` limpava incondicionalmente a classe `.quota-exceeded` ao recarregar a configuração, porque o backend não persistia o último erro da sessão do gateway.
    - **Soluções Implementadas**:
      1. *Propagação Universal de Status no Backend (`server.js`)*: Os endpoints `/research/:slug/run`, `/api/ai/refine-prompt`, `/api/ai/decompose`, `/session/draft` e `/brain/ask` agora preservam o status HTTP 429 e retornam JSON rico com `isRateLimit`, `quotaExceeded`, `retryAfter` e `providerName`.
      2. *Memória de Erro no AI Gateway (`scripts/ai-gateway.js`)*: Adicionado `lastGatewayError` persistido em memória que é retornado no `getConfig()` e limpo automaticamente ao salvar nova configuração com sucesso ou em inferência bem-sucedida. Implementada extração de telemetria dos cabeçalhos HTTP (`anthropic-ratelimit-tokens-remaining`, `x-ratelimit-remaining-tokens`).
      3. *Função Universal no Frontend (`markAiInferenceError` em `docs/brain-ui/app.js` e `demo/app.js`)*: Centraliza o tratamento de erros de inferência; adiciona imediatamente a classe `.quota-exceeded` (vermelho pulsante) no botão `#btnAiGatewayModal`, atualiza o tooltip (`title`) identificando o provedor e modelo esgotados, e sincroniza `#aiSettingsQuotaBanner`.
      4. *Tratamento em Todas as Telas*: Integrado em `startLiveResearchFromModal`, `triggerAiRefinePrompt`, `triggerAiDecompose`, `triggerLiveDefinitionRefine`, `generateSessionDraftWithAi` e `executeAskBrainQuery`.
      5. *Exibição de Cota no Mini-Console BYOK*: O terminal do modal exibe dinamicamente a cota de tokens/min e requisições/min detectadas nos cabeçalhos de resposta quando disponíveis.
      6. *Paridade Estrita*: 100% sincronizado entre `docs/brain-ui/app.js` e `docs/brain-ui/demo/app.js`.

  - **Expansão do AI Gateway (BYOK): Integração Nativa de Google Gemini & Solução para Rate Limits**:
    - **Demanda do Usuário**:
      1. Durante a síntese de documentos volumosos de requisitos, o usuário notou que a API gratuita da Groq atingiu os limites de tokens por minuto (TPM), questionando se isso havia prejudicado os testes de geração de contratos.
      2. O usuário gerou e forneceu uma chave de API do Google Gemini para testes no AI Second Brain, visando evitar as limitações de taxa frequentes da Groq.
      3. O usuário tentou abrir o modal de configuração de IA (BYOK) no Cockpit Web, mas não localizou a opção para Google Gemini, questionando se o provedor já era suportado.
    - **Diagnóstico & Causa Raiz**:
      1. Os testes na Groq haviam sido concluídos com 100% de integridade graças à síntese multi-passo em Markdown puro, mas a cota por minuto da Groq gratuita (6.000 TPM) de fato exigia backoff com frequência em arquivos extensos.
      2. O usuário estava 100% correto: o Google Gemini não existia na lista de opções do `<select id="aiProviderSelect">`, nem no dicionário `AI_PROVIDER_PRESETS` do frontend, nem no `scripts/ai-gateway.js`.
      3. No backend, existia um acoplamento sutil: `config.baseUrl` lido do `.env` sobrescrevia `provider.baseUrl` quando um novo provedor era chamado sem especificar `baseUrl`, fazendo chamadas para o Gemini vazarem para o endpoint da Groq com chave incorreta (HTTP 401).
      4. A API do Gemini retorna mensagens de erro em formato de array de objetos (`[{ "error": { ... } }]`), o que tornava `parsed.error?.message` indefinido se não houvesse suporte a arrays no extrator HTTP.
    - **Implementação**:
      1. *Backend (`scripts/ai-gateway.js`)*:
         - Provedor `gemini` adicionado a `PROVIDERS` com base URL `https://generativelanguage.googleapis.com/v1beta/openai` (compatível com a especificação OpenAI REST).
         - Descoberta dinâmica de modelos (`GET /models`) com sanitização de IDs (remoção do prefixo `models/`) e filtragem de modelos de chat.
         - Correção de isolamento: `baseUrl` de provedores pré-definidos (Gemini, Groq, OpenAI, Anthropic, OpenRouter) não é mais sobrescrita pelo `AI_BASE_URL` residual do `.env`.
         - Extrator `makeHttpRequest` atualizado para ler `(Array.isArray(parsed) && parsed[0]?.error?.message) || parsed.error?.message`.
         - Chave do usuário configurada com sucesso no `.env` e testada via inferência real (`gemini-3.8-flash`), atingindo 423ms de latência e 37 modelos detectados dinamicamente.
      2. *Frontend & Cockpit Web (`docs/brain-ui/` e `docs/brain-ui/demo/`)*:
         - Adicionado `<option value="gemini">Google Gemini (Gemini 3.8 Flash, Pro & 1M+ Contexto)</option>` ao seletor `#aiProviderSelect`.
         - Adicionado preset `gemini` a `AI_PROVIDER_PRESETS` com ícone ✨, tag `Multimodal · 1M+ Contexto · Gratuito` e base URL oficial.
         - Atualizado `demo-mode.js` com mocks dinâmicos de Gemini para garantir 100% de paridade estrita no GitHub Pages.

  - **Quickstart Studio: Síntese Multi-Passo de Alta Densidade Técnica para Anexos de Requisitos (SPECS) & Resiliência do Gateway**:
    - **Demanda**: Quando o usuário anexa documentos de requisitos extensos e completos (ex: 60KB com dicionário SQL Server, RFs e contratos REST), os contratos de governança gerados no Quickstart Studio resultavam em documentos muito vagos e superficiais, ou falhavam com `resposta não contém JSON válido` devido a estouro de tokens/loops de escape de JSON. Era imperativo garantir que a documentação gerada fosse completa, técnica e de nível profissional, transcrevendo fielmente todos os RFs, RNs, tabelas do SQL Server e endpoints REST.
    - **Diagnóstico & Causa Raiz**:
      1. Tentativa de empacotar 4 documentos Markdown altamente densos dentro de um único objeto JSON (`{ "projectMd": "...", ... }`) causava estouro da janela de `maxTokens` (3000-4000) e loops de repetição de quebras `\n\n---` dentro de strings escapadas.
      2. Modelos de raciocínio como `openai/gpt-oss-120b` consomem centenas de tokens internos invisíveis de raciocínio, reduzindo a capacidade útil de geração.
      3. O `ai-gateway.js` descartava o backoff exponencial quando o cabeçalho `retry-after` vinha com valores baixos (ex: 1s), esgotando as retentativas em segundos, e abortava com `quotaExceeded` para qualquer espera acima de 10s (sendo que esperas normais de TPM da Groq variam entre 15s e 45s).
    - **Implementação**:
      1. *Roteamento Cirúrgico de Especificações (`extractScopeSpecs` & `extractArchitectureSpecs`)*:
         - Particionamento semântico do documento de especificação Markdown: seções de negócio (Objetivo, Escopo, RF-001..RF-012, RN-001..RN-020, Personas, Critérios de Aceite) alimentam o Passo 1 (`PROJECT.md`). Seções de infraestrutura (Tabelas SQL Server, colunas, tipos, constraints, endpoints REST, persistência, concorrência, segurança) alimentam o Passo 2 (`ARCHITECTURE.md`).
      2. *Síntese Multi-Passo em Markdown Puro (Sem JSON Escaping)*:
         - **Passo 1 (`PROJECT.md`)**: Chamada dedicada solicitando Markdown puro com mapeamento exaustivo de todos os Requisitos Funcionais, Regras de Negócio e Matriz RBAC.
         - **Passo 2 (`ARCHITECTURE.md`)**: Chamada dedicada solicitando Markdown puro com Dicionário de Dados SQL Server completo (dbo.Cliente, dbo.ClienteEndereco, etc.), Contratos de API REST, Concorrência (`rowversion`/`If-Match`), Segurança e AI Decision Gate.
         - **Passo 3 (`CURRENT_STATE.md` & `ADR-0001`)**: Chamada focada utilizando marcadores limpos `<<<CURRENT_STATE_MD>>>` e `<<<ADR_MD>>>`, gerando Roadmap acionável com checkboxes `- [ ]` e registro MADR de decisão técnica.
      3. *Resiliência de Inferência no AI Gateway (`scripts/ai-gateway.js`)*:
         - Backoff aprimorado com `Math.max(waitSeconds, Math.ceil(parsedWait))`, garantindo intervalo mínimo exponencial (4s, 8s, 16s...).
         - Limite de tolerância para espera de recarga do balde por minuto (TPM) ampliado para 60s, evitando abortos falsos de cota esgotada durante inferências intensivas.
      4. *Otimização do "Prompt Vivo" (`refineDraft`)*:
         - Quando o motor JEV determina alteração em documento único (`isSingleDoc`), apenas o documento-alvo é injetado e retornado no JSON, economizando mais de 70% dos tokens de entrada e saída.
      5. *Validação*:
         - Teste end-to-end com a especificação real de 60KB (`requisitos_cadastro_clientes_node_typescript_sqlserver.md`), gerando com sucesso: `PROJECT.md` com 17.399 caracteres, `ARCHITECTURE.md` com 21.385 caracteres, `CURRENT_STATE.md` com 2.667 caracteres e `ADR-0001` com 4.281 caracteres.

  - **Quickstart Studio: Redesign Compacto do Passo 2 (Configuração) & Gestão de Documentos de Origem (SPECS Accordion - Proposta 1)**:
    - **Demanda**: Permitir que desenvolvedores anexem ou colem documentos de requisitos e especificações de negócio/sistema (`.md`, `.txt`, `.json`, até 5 arquivos, máx 1MB total) durante a inicialização de projetos do zero, blindando o modal contra crescimento vertical desnecessário ("Zero Scroll"), persistindo-os na pasta oficial `projects/<nome>/SPECS/`, e enriquecendo a formulação de contratos e sabatina técnica pelo Grill Studio IA.
    - **Implementação**:
      1. *Layout Refinado com Foco Ergonômico (Zero Scroll)*:
         - **Campos Principais em Largura Total (100%)**: `Nome do Projeto` e `Descrição Rápida (Opcional)` retornaram para largura total, oferecendo espaçamento natural, digitação confortável e visualização completa de frases de negócio sem quebras forçadas.
         - **Bloco Expansível 1 (`#qsTechAccordion`) — Stack Tecnológica & Git**: Substituição do mosaico de chips por uma caixa de seleção (`<select id="qsNewStackSelect">`) curada com stacks modernas (`Node.js / TS`, `C# / .NET 9`, `Python`, `React / Next.js`, `Go`, `Rust`, `Java / Spring Boot`, `PHP / Laravel` e `Outra / Stack Personalizada...`). Quando "Outra" é selecionada, revela suavemente um input de texto livre com foco automático. Inclui checkbox inline de `git init` e cabeçalho com live badge dinâmico (`#qsTechBadge`, ex: `Rust • Git ✓` ou `Node.js / TS • Git ✓`).
         - **Bloco Expansível 2 (`#qsSpecsAccordion`) — Requisitos & Especificações (SPECS)**: Mantido logo abaixo em linha fina com badge roxo `SPECS`, contador de arquivos, abas de Upload Drag-and-drop e Colar Texto/PRD (`requisitos.md`).
         - **Cards de Ação Permanentes**: `Modo Assistido com IA` e `Modo Express` permanecem 100% visíveis na base do modal sem nenhum scroll em repouso.
      2. *Backend & Grill Engine (`server.js` & `scripts/quickstart-grill.js`)*:
         - Endpoint `/api/projects/new` (Express) e `/api/projects/quickstart/commit` (Assisted) criam a subpasta `projects/<nome>/SPECS/` no disco e gravam todos os documentos recebidos.
         - O arquivo de governança `PROJECT.md` ganha a seção `## Especificações & Requisitos de Origem (SPECS)` com links markdown relativos clicáveis para cada arquivo em `SPECS/`.
         - A engine de sabatina IA (`quickstart-grill.js`) injeta `specsContext` no prompt do Arquiteto Grill, evitando perguntas redundantes sobre o que já está especificado nos arquivos e adaptando os 4 contratos (`PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, `ADR-0001`) aos requisitos reais informados.
      3. *Paridade e Validação Visual*:
         - Ajuste ergonômico de proximidade entre os blocos expansíveis: redução do espaçamento entre `#qsTechAccordion` e `#qsSpecsAccordion` para 3px quando recolhidos (com transição suave para 8px ao expandir), criando um agrupamento coeso e harmonioso das opções de configuração secundárias.
         - Campo de Stack Personalizada Aprimorado: remoção do texto explicativo redundante abaixo do input e ampliação de `#qsNewStackCustom` para 100% da largura útil (`.qs-custom-stack-input`), com padding confortável (10px 14px), tipografia 13.5px e anel de foco índigo de alto contraste.
         - Catálogo de Stacks com `<optgroup>` semânticos: expansão da lista para 14 stacks essenciais agrupadas por categoria (Web & Fullstack, Backend & APIs, Mobile & Multiplataforma incluindo .NET MAUI da Microsoft, e Personalizada), com styling dark glass e tipografia índigo nos grupos.
         - Validação Obrigatória de Stack Personalizada com Modal Padrão (`showBrainAlert`): caso o dev escolha "Outra / Stack Personalizada" e não informe o nome da stack ao avançar, o sistema bloqueia a submissão, abre automaticamente o accordion caso recolhido, aciona animação shake de erro (`input-error-shake`) e exibe o modal de alerta padrão do projeto (`#brainConfirmModal`) com badge `PREENCHIMENTO REQUERIDO`, ícone `✏️` e foco automático no input após confirmação.
         - Editor de Documentos Expandido em SPECS e Descrição Rápida (`openExpandedSpecsEditor` & `openExpandedDescEditor`): inclusão do botão "⛶ Expandir Visão" alinhado à direita no cabeçalho de "Descrição Rápida (Opcional)" e na aba "Colar Texto / PRD". Ambos abrem o editor de documentos nativo do projeto (`#fileEditorModal`), permitindo digitação e formatação confortável em tela cheia com barra de ferramentas Markdown (H2, H3, Negrito, Itálico, Listas, Checklists, Código, Citação), abas de Escrita e Pré-visualização formatada, zoom personalizável e sincronização bidirecional em tempo real ao salvar/concluir.
         - Campo `qsNewDesc` como `<textarea>` com Alça de Redimensionamento (`resize: vertical`): conversão de `<input type="text">` para `<textarea class="qs-desc-textarea">` com alça nativa no canto inferior direito, permitindo expansão manual de altura no modal (min 48px, max 180px) sem quebrar o layout compacto padrão.
         - Sincronização rigorosa e idempotente mantida entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `style.css`, `app.js`).
         - Validação sintática com `node --check` em todos os scripts JS.
         - Teste automatizado de criação de projeto com subpasta SPECS e teste visual via navegador headless (`browser_subagent`) confirmando a renderização ampla do Nome/Descrição, expansão dinâmica do `<select>` e badge em tempo real.

- **Data**: 2026-10-18
  - **Jornada do Quickstart Interativa (3 Atos), Streaming de Vídeo HTTP 206 & Player Modal Vertical 9:16 (Reels)**:
    - **Demanda**: Modernizar a seção `#projeto` da Landing Page para refletir fielmente a jornada real de criação/vinculação do Quickstart Studio em 3 atos clicáveis conectados ao modal técnico de arquitetura; otimizar o servidor nativo Node.js (`server.js`) para suportar streaming de vídeo fluido com HTTP 206 Partial Content (Range requests); e integrar botão de vídeo vertical 9:16 no card do "Pergunte ao Cérebro" com modal dedicado dark glass e pausa automática de GPU.
    - **Implementação**:
      1. *Streaming de Vídeo HTTP 206 Partial Content (`server.js`)*:
         - Adicionados tipos MIME `.mp4` (`video/mp4`), `.webm` (`video/webm`) e `.jpeg`.
         - Implementado parser de cabeçalho `Range: bytes=start-end`, cálculo de chunks sob demanda e resposta com status `206 Partial Content`, cabeçalhos `Content-Range: bytes ${start}-${end}/${fileSize}`, `Accept-Ranges: bytes`, `Content-Length` e stream particionado via `fs.createReadStream(filePath, { start, end })`.
         - Configurado `Cache-Control: public, max-age=3600` para mídias estáticas (`.mp4`, `.webm`, `.jpg`, `.png`, `.jpeg`), garantindo scrubbing e seek instantâneos sem travamentos ou alto consumo de RAM no servidor.
      2. *Redesign da Jornada de Abertura / Quickstart na Landing Page (`#projeto`)*:
         - Substituídos os 3 cards estáticos anteriores por 3 Atos Interativos de Onboarding fiéis ao sistema real:
           - *Ato 1: Greenfield vs Brownfield (`qs-greenfield-symlink`)*: Mini-cards interativos de criação do zero com `git init` vs vinculação de repositório via Symlink NTFS nativo sem duplicação de arquivos, com pílulas de modo Express (50ms) vs Sabatina Grill (IA).
           - *Ato 2: Sabatina Técnica Grill Studio (`qs-sabatina-grill`)*: Simulação dinâmica da pergunta arquitetural adaptativa, chips de seleção rápida, barra de progresso (75%, 3 de 4 decisões, até 8 com audit badge) e link para anatomia técnica.
           - *Ato 3: 4 Contratos Vivos & Prompt Vivo (`qs-contratos-jev`)*: Abas dos 4 contratos (`PROJECT`, `ARCH`, `STATE`, `ADR-0001`), prompt dock do motor local JEV com botão "↺ Desfazer" e link para o modelo de contratos.
         - *Extensão do Modal Dinâmico de Arquitetura (`features-modal.js`)*: Criada coleção `QUICKSTART_DATA` com detalhamento em 5 seções técnicas para cada ato (o que é na prática, funcionamento por baixo dos panos, arquivos reais do workspace, métricas de impacto e exemplos práticos de código). A navegação interna e contadores adaptam-se dinamicamente à lista ativa (`FEATURES_DATA` ou `QUICKSTART_DATA`).
      3. *Modal Dedicado de Vídeo Vertical 9:16 (Reels / Shorts) & Ações Duplas no Rodapé*:
         - *Ações Duplas no Rodapé (`.card-footer-actions`)*: No Card 09 da Bento Grid ("Pergunte ao Cérebro"), o rodapé agora abriga lado a lado o link "Ver arquitetura ↗" e o botão `.card-video-9x16-btn` ("▶ Vídeo Demo (9:16)").
         - *Modal Vertical 9:16 (`#promo-video-modal-9x16`)*: Construído player responsivo em formato 9:16 vertical de smartphone em dark glass luxury com borda cobalto `rgb(72, 102, 236)`, backdrop blur de 10px, controle de reprodução nativo e fechamento via botão ✕, clique no backdrop ou tecla `ESC`.
         - *Acessibilidade WAI-ARIA & Ciclo de Foco (Inert)*: Eliminada a violação de acessibilidade Chromium (`Blocked aria-hidden on an element because its descendant retained focus`). O ciclo de fechamento de todos os modais e painéis (`#promo-video-modal-9x16`, `#feature-modal`, `#video-modal`, `#reader`) agora restaura o foco no botão de origem ou executa `blur()` no elemento ativo *antes* de definir `aria-hidden="true"`, e pareia o estado fechado com o atributo nativo `inert`, garantindo conformidade rigorosa com a especificação W3C WAI-ARIA.
         - *Liberação Total de Recursos de GPU*: Ao abrir o modal vertical (ou o modal de pitch 16:9), a renderização contínua do grafo 3D Three.js e os vídeos em loop de todos os cards da página são pausados imediatamente (`g.stop()` e `.pause()`), liberando a GPU do dispositivo para decodificação limpa do vídeo, sendo reativados ao fechar.
         - *Prevenção Defensiva de Conflitos*: O manipulador de clique nos cards verifica `.card-video-9x16-btn` e utiliza `stopPropagation`, garantindo que o clique no botão 9:16 abra apenas o player de vídeo sem disparar indevidamente o modal de arquitetura.
      4. *Guia Técnico e i18n*:
         - `docs/GUIA_PADRONIZACAO_CARDS_VIDEO.md` estendido com a subseção 2.1 documentando as ações duplas no rodapé e padronização do botão vertical 9:16.
         - Dicionário `i18n.dict.js` atualizado com termos bilíngues (PT/EN) para botões e legendas dos novos componentes.
  - **Conclusão de 100% dos 9 Cards com Vídeo Cinemático & Redesign da Seção "Exemplo no Dia a Dia"**:
    - **Finalização dos Cards 5 a 9 na Bento Grid (`#vantagens`)**:
      - *Card 05 (`governanca-owasp`)*: Integrado cabeçalho de vídeo em loop `governanca-owasp-card.mp4` e modal `governanca-owasp-modal.mp4`, cor temática `rgb(113, 175, 255)` (Azul Neon), badge `Segurança & Anti-Leak`.
      - *Card 06 (`agnostico-stack`)*: Integrado `agnostico-stack-card.mp4` e `agnostico-stack-modal.mp4`, cor temática `#ffc76b` (Âmbar/Dourado), badge `Universal / Multi-Stack`.
      - *Card 07 (`zero-lock-in`)*: Integrado `zero-lock-in-card.mp4` e `zero-lock-in-modal.mp4`, cor alinhada para `#22d3ee` (Ciano Neon / Turquesa Elétrico) para harmonia 100% com o tema do vídeo do Git/Markdown, badge `Git & Open Formats`.
      - *Card 08 (`grafo-3d`)*: Integrado `grafo-3d-card.mp4` e `grafo-3d-modal.mp4`, cor temática `#c084fc` (Púrpura/Violeta Bioluminescente), badge `Neurônios & Sinapses 3D`.
      - *Card 09 (`pergunte-cerebro`)*: Integrado `pergunte-cerebro-card.mp4` e `pergunte-cerebro-modal.mp4`, cor temática `rgb(72, 102, 236)` (Azul Cobalto Brilhante), badge `Busca Semântica & BYOK`.
    - **Redesign & Modernização Visual da Seção "⚡ Exemplo no Dia a Dia"**:
      - *Window Chrome de Terminal macOS / IDE*: Substituído o bloco de código cru por container `.fm-code-container` com barra superior de controle com 3 dots coloridos (`● ● ●`), badge dinâmico de contexto (`.fm-code-badge`) e botão de ação interativo com ícone **`Copiar`** com feedback visual (`✓ Copiado!`).
      - *Syntax Highlighting Customizado*: Implementada função `highlightSnippet` colorindo semanticamente comentários (`//` e `#`), prompts de terminal e queries (`>` e `$`), tags de ranking/status entre colchetes (`[RANK 1]`, `[PASS]`, `[DIFF]`), caminhos e código inline em backticks, e strings/citações.
      - *Conteúdo Factual e Prático*: Reformulado o snippet do Card 9 para simular a consulta real no Ctrl+K, exibindo a query em linguagem natural, o ranking BM25 ponderado com multiplicadores de governança (ADRs x1.8, Regras x1.5) e a resposta com Zero Fabricação e links para arquivos auditados. Snippets de todos os cards foram enriquecidos.
    - **Atualização do SOP e Governança**:
      - `docs/GUIA_PADRONIZACAO_CARDS_VIDEO.md` atualizado com todos os 9 cards marcados como `*(Concluído)*` e paleta de cores revisada.
- **Data**: 2026-10-17
  - **Alinhamento de Integridade e Enriquecimento: Prompt Bootstrap & Acesso ao Workspace (Landing Page)**:
    - **Demanda**: Correção de discrepância no Slide 4 do modal de features (`features-modal.js`), que prometia "Deep Links para IDEs" e abertura direta em VS Code/Cursor via navegador — funcionalidades que haviam sido descontinuadas/removidas no redesign minimalista do cabeçalho de 13/10/2026.
    - **Implementação**:
      1. *Ajuste Conceitual & Fiel à Realidade*: Slide 4 renomeado para "Prompt Bootstrap & Acesso Rápido ao Workspace", destacando a geração em menos de 50ms do payload de contexto sem amnésia e a abertura nativa no Explorador de Arquivos (`explorer.exe`) via `POST /api/system/open-ide`.
      2. *Correção de Caminhos Reais*: Atualizados ponteiros de arquivos no modal de `docs/brain-ui/js/app.js` para o caminho correto `docs/brain-ui/app.js`.
      3. *Enriquecimento das Seções de Destaque*:
         - **Impacto & Ganhos Reais**: Adicionadas métricas de 1 Clique & 0 Tokens Desperdiçados, 100% Agnóstico de Ferramenta e Zero Amnésia / Governança Imediata.
         - **Exemplo no Dia a Dia**: Exibido o snippet com o payload cirúrgico real gerado no clipboard por `copySessionStartPrompt()` e o trigger de abertura nativa.
      4. *Sincronização da Landing Page*: Atualizados card correspondente em `docs/brain-ui/landing/index.html` e dicionário `docs/brain-ui/landing/js/i18n.dict.js`.
  - **Padronização de Cards com Vídeo no Cabeçalho & Ultra-Otimização de Mídia (Cards 1, 2, 3 & 4)**:
    - **Demanda**: Desenvolver padrão visual onde o cabeçalho do card na Bento Grid (`#vantagens`) possui um banner cinemático em loop com texto/badge sobrepostos, replicável para os 9 cards, com otimização extrema de peso e resolução para máxima performance web.
    - **Implementação**:
      1. *Card 1 ("Memória Persistente Real")*: `.card-video-header` (altura 195px) com vídeo H.264 de alto brilho, overlay gradiente na base, badge temática bioluminescente (`#38bdf8`) e título sobreposto.
      2. *Card 2 ("Session Capture com IA")*: Padrão estético e funcional com acento esmeralda (`#10b981`), badge `Automação & Ciclo Git` e integração aos vídeos otimizados `session-capture-card.mp4` e `session-capture-modal.mp4`.
      3. *Card 3 ("AI Decision Gate & Motor JEV")*: Padrão estético e funcional com acento verde-limão elétrico (`#a3e635`), badge `Zero Tokens / 0ms` e integração aos vídeos otimizados `decision-gate-card.mp4` e `decision-gate-modal.mp4`.
      4. *Card 4 ("Prompt Bootstrap & Workspace")*: Padrão estético e funcional com acento índigo (`#6366f1`), badge `Context Injection` e integração aos vídeos otimizados `prompt-bootstrap-card.mp4` (75 KB) e `prompt-bootstrap-modal.mp4` (219 KB) com poster `prompt-bootstrap-poster.jpg` (10,6 KB).
      5. *Arquitetura Dinâmica Multi-Cores (`--card-accent`)*: Refatorado CSS em `extra.css` para utilizar variáveis CSS dinâmicas (`--card-accent`), permitindo que cada card e modal herdem automaticamente sua paleta temática sem duplicação de regras.
      6. *Ajustes Cirúrgicos de Cabeçalho do Modal*:
         - Container de ícone à esquerda ocultado (`.feature-modal-icon-stage { display: none !important; }`), com o bloco textual ocupando toda a margem esquerda.
         - Botão Fechar (`✕`) rigorosamente posicionado no topo superior direito (`position: absolute; top: 22px; right: 24px; z-index: 10;`).
      6. *Otimização Extrema de Vídeo (FFmpeg)*:
         - `synapse-card.mp4`: Reduzido de 427 KB para 133,8 KB (400x224, -68,7%).
         - `synapse-modal.mp4`: Reduzido de 1.488 KB para 375,6 KB (800x250, crop panorâmico do cabeçalho, -74,8%).
         - `synapse-poster.jpg`: Reduzido de 22,5 KB para 14,2 KB (-38,5%).
         - `session-capture-card.mp4`: Reduzido de 7,8 MB para 217,5 KB (400x224, -97,2%).
         - `session-capture-modal.mp4`: Reduzido de 7,8 MB para 410,5 KB (800x250, crop panorâmico central, -94,7%).
         - `session-capture-poster.jpg`: 23,5 KB.
         - `decision-gate-card.mp4`: Reduzido de 11,9 MB para 239,9 KB (400x224, 5.0s, -98,0%).
         - `decision-gate-modal.mp4`: Reduzido de 11,9 MB para 536,8 KB (800x250, 5.0s, -95,5%).
         - `decision-gate-poster.jpg`: 16,0 KB.
         - Economia cumulativa de tráfego nos 3 primeiros cards: **~20,0 MB economizados (>94% de redução)**.
      7. *Guia Técnico Universal e Procedimento Padrão (SOP)*: Atualizado `docs/GUIA_PADRONIZACAO_CARDS_VIDEO.md` com as diretrizes mandatórias de: (a) Duração máxima de 5 segundos (`-t 5`), e (b) Aplicação mandatória de compressão H.264 de alta precisão via FFmpeg (`libx264`, preset `slow`, `yuv420p`, `+faststart`).
      8. *Modal Dinâmico Multi-Vídeo (`features-modal.js`)*: Suporte a `headerVideoSrc` e `headerVideoPoster` individuais por feature, com troca dinâmica de fonte, preload sob demanda e pause automático ao fechar ou trocar de slide.
      9. *Compressão H.264 de Alta Precisão Universal em Todos os Vídeos da Pasta*:
         - `Promo-16x9.mp4`: Reduzido de 29,17 MB para 12,46 MB (-57,3%) com 100% de aceleração por GPU (`yuv420p`, zero travamentos em tela cheia).
         - `Reels-9x16.mp4`: Reduzido de 8,33 MB para 3,62 MB (-57,5%) com aceleração nativa mobile e áudio AAC 160k.
         - `session-capture-card.mp4`: Reduzido para 160,2 KB (5.0s, alta precisão H.264).
         - `session-capture-modal.mp4`: Reduzido para 311,0 KB (5.0s, alta precisão H.264).
         - `synapse-card.mp4`: Reduzido para 117,1 KB (5.0s, alta precisão H.264).
         - `synapse-modal.mp4`: Reduzido para 345,8 KB (5.0s, alta precisão H.264).
         - `decision-gate-card.mp4`: 239,9 KB (5.0s).
         - `decision-gate-modal.mp4`: 536,8 KB (5.0s).
         - **Economia Total do Catálogo de Vídeos**: **Mais de 26 MB eliminados** sem perda de qualidade visual. Original de Reels salvo em `Reels-9x16-original.mp4.bak`.
      10. *Automação via CLI em Python (`scripts/optimize_card_videos.py`)*: Criado utilitário Python de zero dependências externas para automatizar o processamento e padronização universal de vídeos (`-card.mp4`, `-modal.mp4` e `-poster.jpg`). Suporta:
          - Nome personalizado opcional passado diretamente como segundo argumento (`python scripts/optimize_card_videos.py "video.mp4" "prompt-bootstrap"`) ou via flag `-n`/`--name`.
          - Sanitização inteligente automática que remove extensões acidentais (`.mp4`) ou sufixos duplicados (`-modal`, `-card`, `-poster`).
          - Se nenhum nome for fornecido, mantém o nome do arquivo original.
          - Salva por padrão na mesma pasta do vídeo de origem (ou direto na pasta oficial da Landing Page via flag `--landing`/`-l`).
          - Suporte completo a modo em lote (`--batch`).
  - **Guia Técnico Canônico & FAQ de Engenharia: AI Decision Gate & Motor JEV**:
    - **Demanda**: Criação de documento executivo e técnico exaustivo respondendo à dúvida do desenvolvedor sobre a observância do AI Decision Gate e Motor JEV por IAs em IDEs (Claude Code, Cursor, Antigravity, Windsurf) e o passo a passo prático para implementar o padrão na sua própria aplicação.
    - **Implementação**:
      1. Criado documento canônico [`docs/GUIA_TECNICO_AI_DECISION_GATE_JEV.md`](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/GUIA_TECNICO_AI_DECISION_GATE_JEV.md) com 8 seções estruturadas:
         - *A Pergunta Real do Desenvolvedor*: Formulação explícita da dúvida e contexto.
         - *Mecanismo de Observância pelas IEs*: Explicação do contexto de sistema, injeção de governança (`AGENTS.md`, `GEMINI.md`, `.cursorrules`), e resolução para janelas satélites isoladas ("Ponte de Governança").
         - *Desmistificação do JEV*: Combate ao anti-padrão do LLM ingênuo, padrão Identificar -> Decidir -> Validar -> Opcionalmente Gerar.
         - *Passo a Passo de Código Real*: Implementação canônica da interface `IDecisionProvider`, classe determinística `RulesDecisionProvider` (0ms, 0 tokens) e integração no service em C#/.NET e TypeScript/Node.js.
         - *Exemplo Real no Repositório*: Rastreamento do motor ativo em `scripts/decision-provider.js` e `scripts/quickstart-grill.js` (interceptação de `AMBIGUOUS_PAYMENTS` e `AMBIGUOUS_AUTH`).
         - *Catálogo de Prompts Prontos*: Instruções copiar-e-colar para orientar IAs de qualquer IDE a construir o gate.
         - *Business Case & Checklist*: Comparativo de ganhos (-70% tokens, 0ms latência) e checklist de conformidade.
      2. Vinculada referência cruzada em [`knowledge/ai/AIJEV.md`](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/knowledge/ai/AIJEV.md).
- **Data**: 2026-10-16
  - **Cards Interativos de Superpoderes & Modal de Detalhamento Técnico na Landing Page**:
    - **Demanda**: Permitir ao usuário clicar em qualquer card da seção `#vantagens` ("Superpoderes do Sistema") para abrir um modal rico, profundo e 100% embasado na realidade técnica do que o projeto faz.
    - **Implementação**:
      1. *Enriquecimento dos Cards da Bento Grid*: Adicionado indicador visual de ação (`.card-more-btn`: "Ver arquitetura detalhada ↗"), atributos semânticos (`role="button"`, `tabindex="0"`, `aria-haspopup="dialog"`) e micro-interações de elevação/hover.
      2. *Modal Técnico Factual (`#feature-modal`)*: Criado modal responsivo no padrão glassmorphism dark contendo:
         - *Cabeçalho*: Ícone estilizado com iluminação própria, badge de domínio e tagline.
         - *Seções Estruturadas*: "O que é na prática", "Como funciona por baixo dos panos" (passo a passo numerado), "Arquivos & Estrutura Real" (com caminhos reais do workspace), "Impacto & Ganhos Mensuráveis" e "Exemplo no dia a dia" (blocos de código/rotas reais).
         - *Navegação Intuitiva*: Botões "← Anterior" e "Próximo →" com contador dinâmico (ex: `1 / 9`), permitindo navegar pelos 9 superpoderes sem fechar o modal.
         - *Acessibilidade & Teclado*: Suporte a `ESC` para fechar, setas direcionais `←` e `→` para alternar entre os cards, e restauração de foco ao fechar.
      3. *Internacionalização (i18n)*: Conteúdo 100% bilíngue (Português e Inglês), com re-renderização em tempo real caso o usuário alterne o idioma da página.
      4. *Arquivos Envolvidos*: `docs/brain-ui/landing/index.html`, `docs/brain-ui/landing/css/extra.css`, `docs/brain-ui/landing/js/features-modal.js` e `docs/brain-ui/landing/js/i18n.dict.js`.
  - **Integração Audiovisual na Landing Page (Vídeo Pitch 16:9 & Reels 9:16)**:
    - **Combinação Harmônica das 3 Abordagens**:
      1. *Gatilho no Hero*: Botão `Assistir Pitch (1 min)` ao lado do CTA principal com gradiente cyan/violet e efeito glassmorphic para visualização sem sair do topo.
      2. *Modal Lightbox Cinemático*: Abertura fluida com backdrop blur 16px, título emoldurado, parada automática de áudio/vídeo ao fechar (via botão ✕, clique fora ou tecla ESC).
      3. *Seção Dedicada "Em Ação" (`#video-showcase`)*: Card dark luxury em formato cockpit/terminal posicionado estrategicamente antes da Demo interativa, com indicador pulsante ao vivo e botão "Expandir".
      4. *Adaptação Responsiva Dinâmica*: Alternância inteligente entre `Promo-16x9.mp4` (Desktop widescreen) e `Reels-9x16.mp4` (Mobile vertical nativo para smartphones).
      5. *Zero Impacto em Performance*: `preload="none"` em ambos os reprodutores, prevenindo o download imediato de ~29 MB no carregamento inicial da landing page.
      6. *Navegação & i18n*: Adicionado atalho `#video-showcase` ("Vídeo" / "Video") na barra de navegação e suporte bilíngue completo no dicionário `i18n.dict.js`.
  - **Resiliência a Falhas de IA, Tratamento de Quota / 429 e Modal Universal de Erro de IA (`#aiErrorModal`)**:
    - **Diagnóstico & Causa Raiz**:
      - *Congelamento do Backend*: No `scripts/ai-gateway.js`, quando a API da Groq retornava status 429 com cabeçalho `retry-after: 1243` (~20 minutos), o backend executava `await new Promise(r => setTimeout(r, waitSeconds * 1000))`, deixando o Node.js dormindo por até 20 minutos, a requisição HTTP pendente e a interface web congelada com o spinner infinito.
      - *Layout Quebrado ao Clicar em "← Voltar aos dados"*: Ao clicar em voltar enquanto a IA processava, o CSS continha `:has(...)` em `#qsGrillLoadingQuestions:not([style*="display: none"])`. Como `#qsGrillLoadingQuestions` ainda tinha `display: flex` inline mesmo com o container pai oculto, o card do modal permanecia preso em `height: auto !important; max-height: 480px;`, quebrando o layout do formulário do Passo 2.
      - *Falta de Comunicação ao Usuário*: Não havia um modal informativo no padrão visual do projeto para orientar o desenvolvedor sobre falta de créditos, limites de requisição ou chaves inválidas.
    - **Solução Definitiva**:
      - **Guarda de Timeout / Rate-Limit no AI Gateway (`scripts/ai-gateway.js`)**: O tempo de espera de retentativa foi limitado a no máximo 10s. Acima disso (ou ao esgotar retentativas), lança imediatamente um erro rico contendo `statusCode: 429`, `isRateLimit: true`, `quotaExceeded: true`, `retryAfter: waitSeconds` e `providerName`.
      - **Correção de Layout e Cancelamento com `AbortController` (`app.js` & `style.css`)**:
        - `backFromGrillQuestions()` agora cancela a requisição ativa via `AbortController`, remove as classes `grill-mode` e `is-loading-questions`, restaura `wide` para o formulário e força `loadingEl.style.display = 'none'`.
        - O seletor CSS foi escopado para `#qsGrillQuestionsPane:not([style*="display: none"]) #qsGrillLoadingQuestions`.
      - **Modal Universal de Erro de IA (`#aiErrorModal`)**:
        - Design glassmorphic escuro alinhado à identidade visual do projeto.
        - Badges semânticos dinâmicos (Cota Esgotada / 429, Chave Inválida / 401, Modelo Indisponível / 404, Timeout / 408, Falha Geral).
        - Chip identificando o provedor ativo e modelo utilizado.
        - Exibição da causa raiz técnica e, para 429, cálculo amigável do tempo de reset (`retryAfter`).
        - Orientação acionável com botão de 1 clique `⚙️ Abrir Configurações de IA (BYOK)` permitindo alternar de provedor instantaneamente (OpenAI, Claude, Ollama local gratuito ou OpenRouter).
        - Fechamento seguro via tecla ESC e clique no backdrop.
      - **Banner Contextual de Cota Esgotada no Modal de Configurações (`#aiSettingsQuotaBanner`)**:
        - Eliminada a discrepância cognitiva entre o botão pulsar vermelho na barra superior e o terminal interno exibir "Conexão bem-sucedida" (devido ao fato de que listar modelos não consome créditos de chat).
        - Implementado banner de alerta em vermelho/âmbar (`#aiSettingsQuotaBanner`) no topo do formulário BYOK explicitando que o modelo ativo atingiu o limite de taxa de requisições/tokens e sugerindo a troca de modelo no Passo 3 ou de provedor no Passo 1.
        - Tooltip (`title`) dinâmico e autoexplicativo no botão da topbar (`#btnAiGatewayModal`) identificando o provedor e modelo esgotados.
        - Reatividade positiva imediata ao selecionar outro modelo ou provedor (atualizando o banner para "Novo modelo selecionado! Clique em Salvar e Ativar").
        - Limpeza automática do estado `quota-exceeded` ao salvar nova configuração com sucesso.
      - **Landing Page & Paridade 100%**:
        - Atualização da landing page destacando a governança com motor JEV e prompt vivo cirúrgico.
        - Paridade estrita mantida entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `style.css`, `app.js`).

  - **Motor JEV Nativo Local (`RulesDecisionProvider` / AI Decision Gate) & Refinamento Cirúrgico no Prompt Vivo**:
    - **Contexto & Diagnóstico**:
      - A interface do Quickstart Studio (Passo 2.B e Editor Expandido) apresentava o aviso *"A IA aplicará cirurgicamente sua instrução em todos os 4 contratos simultaneamente sem recarregar a tela"*, duplicando inadvertidamente alterações técnicas (ex: dicionário de dados de cliente) em todos os 4 contratos (`PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, `ADR-0001`).
      - Havia necessidade de governança determinística antes da chamada ao LLM (Nível 4 Composto), roteamento cirúrgico de documentos, detecção de ambiguidade com diálogo de clarificação humana (*Human-in-the-Loop*) e reversão ágil (*Undo*).
    - **Solução Implementada (5 Melhorias do JEV Nativo Local - Opção C)**:
      1. **Módulo Canônico `scripts/decision-provider.js` (`IDecisionProvider` & `RulesDecisionProvider`)**: Desacoplado da UI, executável de forma síncrona (`decideSync`) ou assíncrona (`decide`), com latência de 0ms, custo zero de tokens e 100% offline.
      2. **Rastreabilidade e Explicabilidade Numérica**: Retorna `ruleId` (ex: `JEV-RULE-ARCH-DATA`, `JEV-RULE-MULTI-COMPOUND`), `intentClass`, `confidence` (ex: 96%) e `rationale` detalhado para auditoria.
      3. **Composição Dinâmica Multi-Target**: Reconhece solicitações compostas (ex: escopo em `PROJECT.md` + roadmap em `CURRENT_STATE.md`) autorizando cirurgicamente múltiplos documentos combinados sem poluir os demais.
      4. **Gatilhos de Ambiguidade Técnica**: Intercepta solicitações vagas de Autenticação (`AMBIGUOUS_AUTH`), Infraestrutura/Deploy (`AMBIGUOUS_INFRA`), Pagamentos (`AMBIGUOUS_PAYMENTS`) e Mensageria (`AMBIGUOUS_MESSAGING`), abrindo o modal de clarificação com chips clicáveis de 1 clique e resposta mandatória antes do LLM.
      5. **Interface Visual & Paridade Estrita**:
         - Atualização do aviso no Passo 2.B e Editor Expandido.
         - Modal `#qsClarificationModal` com chips interativos de sugestão rápida.
         - Auto-switch automático da aba para o contrato modificado com animação `.tab-flash-active`.
         - Botão `↺ Desfazer` (Undo) baseado no snapshot `previousGrillDraft`.
         - 100% sincronizado entre `docs/brain-ui/` e `docs/brain-ui/demo/`.

  - **Controle de Escala / Zoom Dinâmico nos Contratos de Governança (Quickstart & Modal Expandido)**:
    - **Contexto & Diagnóstico de UX**:
      - Os contratos de governança gerados pela IA no Grill Studio (`PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, `ADR-0001`) são documentos ricos e extensos, contendo seções de arquitetura, tabelas de decisão e diagramas.
      - Na visualização original em 100% de escala, o texto grande demandava rolagem constante tanto no card do Quickstart quanto no modal expandido.
      - O usuário solicitou um efeito de escala reduzida (inspirado no efeito visual da demonstração da landing page), com valor padrão de 80%, controlado por um botão em formato de pílula (*capsule pill*) exibindo `+`, a porcentagem centralizada e `−`.
    - **Solução Definitiva & Arquitetura de Interface**:
      - **Componente Visual Capsule Pill (`.qs-zoom-pill`)**:
        - Construído com estética *dark glass* (`#0d1117`, bordas com opacidade sutil, cantos 999px e divisores discretos entre botões).
        - Botão `+` à esquerda (aumenta o zoom em +10%), indicador de porcentagem centralizado com valor padrão de `80%` (e atalho de clique para redefinir para 80%), e botão `−` à direita (reduz o zoom em -10%). Limites calibrados entre 50% e 150%.
        - Suporte a zoom via roda do mouse com Ctrl pressionado (`Ctrl + Wheel`) para ergonomia máxima de navegação.
      - **Visualizador do Card Quickstart (`.qs-contract-viewer-card`)**:
        - Botão de zoom posicionado imediatamente antes de `⛶ Expandir`.
        - Afeta simultaneamente a pré-visualização (`#qsContractPreviewPane`) e o editor manual (`#qsContractTextarea`).
        - Estabilidade física do card: altura máxima calculada dinamicamente via `Math.round(340 / ratio) + 'px'`, mantendo o card em exatos 340px visuais na tela independentemente do zoom aplicado, evitando saltos verticais ou deslocamento dos botões inferiores.
      - **Modal Expandido em Tela Cheia (`#fileEditorModal`)**:
        - Botão de zoom inserido em `.editor-header-actions` ao lado dos seletores de modo.
        - Afeta `#editorPreviewPane` e `#editorTextarea`.
        - Compensação geométrica de 100%: largura e altura definidas como `calc(100% / ratio)` para preencher a área útil do modal sem gaps.
        - Coluna central de leitura (`.doc-preview-inner`) com largura proporcional (`calc(820px / ratio)`), preservando a largura de linha recomendada de 820px.
        - Sincronização bidirecional entre o card Quickstart e o modal expandido ao abrir (`openExpandedContractModal`) e fechar (`closeExpandedContractModal`).
      - **100% Paridade & Integridade**:
        - Sincronizado integralmente entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `style.css`, `app.js`).
        - Validação automatizada via `npm run doctor` com 100% de aprovação (0 erros).

- **Data**: 2026-10-15
  - **Correção Cirúrgica do Loading da Sabatina (Grill Studio) & Cache Inteligente de Economia de Tokens**:
    - **Diagnóstico & Causa Raiz**:
      - *Causa Raiz 1 (Exibição Simultânea de Loading + Progresso/Perguntas)*: No arquivo `style.css`, a classe `.qs-grill-questions-container` continha `display: flex !important;`. Essa diretiva com `!important` impedia que o JavaScript ocultasse o container durante o carregamento (`containerEl.style.display = 'none'` era sumariamente ignorado pelo navegador). Com isso, a barra de progresso e a lista de perguntas permaneciam visíveis ao mesmo tempo que o spinner de formulando perguntas.
      - *Causa Raiz 2 (Re-requisição Redundante de IA & Sobreposição ao Voltar)*: Ao voltar para a etapa anterior ("← Voltar aos dados") e clicar novamente em "Sabatina Técnica", o fluxo disparava uma nova requisição à IA descartando as perguntas anteriores, enquanto o spinner girava sobre os cards já existentes no DOM.
    - **Solução Definitiva & Economia de Tokens (Alinhamento com AGENTS.md / GEMINI.md)**:
      - **Remoção de `!important` do Container**: Removido `!important` de `.qs-grill-questions-container` no CSS (`display: flex; flex-direction: column;`), permitindo controle determinístico e alternância limpa entre loading (`display: flex` / `none`) e container. O container agora inicia com `style="display: none;"` no HTML.
      - **Cache Inteligente de Perguntas (0 Tokens / 0ms de Latência)**: Antes de chamar a API da IA, o sistema verifica se é exatamente o mesmo projeto (`name`, `stack`, `description`) e se já existem perguntas geradas. Em caso positivo, restaura instantaneamente as perguntas sem acionar o LLM e preserva 100% das respostas já digitadas pelo usuário no formulário.
      - **Ação Explícita para Refazer com IA via Modal Nativo (`showBrainConfirm`) & UX Polida**: Adicionado botão no banner (`#qsGrillSummaryBanner`). Em vez do `confirm()` nativo do navegador, a confirmação utiliza o **Modal Universal do AI Second Brain (`#brainConfirmModal`)**, com cabeçalho limpo sem badges ou ícones repetidos: ícone hero alinhado e centralizado (44x44px), título claro e direto (*"Descartar respostas e refazer sabatina?"*) sem duplicação de frases.
      - **Ícone SVG Animado de Atualização & Modal sem Caixa Envolvente**:
        - **Criação & Otimização do Artefato SVG Animado (`assets/icon-refresh-animated.svg`)**: Desenvolvido ícone vetorial SVG nativo com arcos duplos em gradiente neon (`#38bdf8` -> `#818cf8` -> `#c084fc`), filtro de neon glow (`feGaussianBlur`), rotação orbital fluida linear contínua via `@keyframes rotateRefresh` (1.4s) e núcleo neural central pulsante via `@keyframes pulseCore`. Calibrado com arcos abertos de 120° (deixando amplos vãos de ~40° entre as setas para eliminar o aspecto de anel fechado/"colado"), pontas de seta proeminentes em chevron/triângulo de 10.5px com preenchimento em gradiente total, ocupando 95% do viewBox edge-to-edge com máxima percepção de dinamismo e rotação.
        - **Remoção da Caixa Envolvente (`.brain-dialog-icon-wrap.no-box`)**: O container quadrado que envolvia o ícone no cabeçalho do diálogo universal (`#brainConfirmModal`) foi removido quando configurado com `noIconBox: true` ou `iconSvg`, eliminando fundo cinza/azul, bordas e sombras internas, deixando apenas o elemento SVG flutuando e animando em perfeita harmonia ao lado do título da ação (*"Formular novas perguntas com IA?"*).
        - **Suporte Extensível no Diálogo Universal (`showBrainConfirm`)**: A função agora suporta `options.iconSvg` e `options.noIconBox`, limpando automaticamente os estados transitórios no fechamento (`resolveBrainConfirm`).
        - **100% de Paridade e Integridade**: Espelhado entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`assets/`, `style.css`, `app.js`) com `npm run doctor` 100% aprovado.
      - **Encolhimento Proporcional do Modal Durante o Loading (`is-loading-questions`)**: Quando a IA está preparando as perguntas, o modal card ajusta sua altura dinamicamente para `height: auto !important; max-height: 480px;`, eliminando o vazio escuro vertical desnecessário. Assim que as perguntas são carregadas, expande suavemente de volta para `90vh` com os cards da sabatina.
      - **Paridade e Integridade**: Aplicado de forma espelhada em `docs/brain-ui/` e `docs/brain-ui/demo/` (`style.css`, `index.html`, `app.js`) com `npm run doctor` 100% aprovado.
  - **Scrollbar Responsivo & Botões Flutuantes/Fixos na Minuta de Contratos (Grill Studio - "Contratos Prontos para Revisão")**:
    - **Diagnóstico & Causa Raiz pelo Screenshot**:
      - Na tela *"📄 Contratos Prontos para Revisão"*, o preview do contrato gerado (ex: `PROJECT.md`) se expandia verticalmente e empurrava a caixa de refinamento (*"Prompt Vivo"*) e a barra de ações (*"Voltar"* e *"💾 Aprovar e Criar Projeto no Disco"*) para fora da base do modal.
      - A causa raiz era que a regra do CSS `.quickstart-modal-card.grill-mode .qs-body` e `.quickstart-modal-card:has(#qsGrillDraftPane) .qs-body` aplicava `overflow: hidden !important;`, impedindo qualquer barra de rolagem e deixando o usuário impossibilitado de alcançar o botão para aprovar e criar o projeto.
    - **Solução Definitiva**:
      - **Desacoplamento de Overflow**: O bloqueio `overflow: hidden !important;` foi restrito única e exclusivamente à Sabatina de Perguntas (`#qsGrillQuestionsPane`).
      - **Ativação do Scrollbar do Modal na Revisão de Contratos**: Criada classe `.draft-mode` e regras para `.quickstart-modal-card:has(#qsGrillDraftPane)` garantindo `max-height: calc(88vh - 150px) !important; overflow-y: auto !important;` no `.qs-body`.
      - **Botões de Ação Fixos/Sticky**: A barra `#qsGrillDraftPane .qs-form-actions` ganhou `position: sticky; bottom: -20px;` com fundo dark glass translúcido e blur, garantindo que o botão *"💾 Aprovar e Criar Projeto no Disco"* permaneça **100% visível e clicável** na base do modal a todo momento, independente da rolagem.
      - **Calibração de Altura**: Reduzido o teto do preview (`.qs-contract-preview-pane` para `max-height: 320px`) para melhor ergonomia visual em telas compactas.
      - **100% Paridade & Doctor**: Sincronizado em `docs/brain-ui/` e `docs/brain-ui/demo/` (`style.css` e `app.js`).
  - **Scrollbar Responsivo do Modal em Todas as Etapas (Etapa 3 "Conectado!" & Desacoplamento de Grill Mode)**:
    - **Diagnóstico & Causa Raiz**:
      - Na Etapa 3 (*"Conectado!"*), ao redimensionar a janela do navegador verticalmente ou em resoluções menores, a barra de rolagem do modal não aparecia e os botões de ação inferiores (*"Abrir Documentação"*, *"Ver no Grafo Neural 3D"*, *"Concluir"*) ficavam cortados fora da tela.
      - *Causa Raiz 1 (JS)*: Em `goToQuickstartStep(step)`, havia a condição `if (step <= 2) { resetQuickstartGrillPanes(); }`. Quando o assistente transicionava para o Passo 3 (`step === 3`), o reset não era invocado, mantendo as classes `.grill-mode` no card e `.grill-active` no body do modal.
      - *Causa Raiz 2 (CSS)*: Os seletores `.quickstart-modal-card.grill-mode .qs-body` e `.qs-body.grill-active` possuíam `overflow: hidden !important;`, e seletores como `:has(#qsGrillDraftPane:not([style*="display: none"]))` permaneciam ativos mesmo com o pane pai oculto, travando a rolagem do modal no Passo 3.
    - **Solução Definitiva**:
      - **Reset Universal nas Trocas de Passo**: `goToQuickstartStep` e `renderQuickstartSuccess` agora garantem a limpeza de `.grill-mode` e `.grill-active` e redefinição dos panes sempre que se navega para a Etapa 3 ou Etapa 1.
      - **Escopo Estrito de Grill Mode no CSS**: As regras de altura fixa (`height: 90vh`) e `overflow: hidden !important;` foram estritamente escopadas a `#qsPaneStep2.active`, impedindo que afetem a Etapa 1 ou a Etapa 3.
      - **Garantia de Scroll Fluido**: Regra com `max-height: calc(88vh - 150px) !important; overflow-y: auto !important;` no `.qs-body` para `#qsPaneStep3.active` e `#qsPaneStep1.active` com scrollbar em neon dark glass, assegurando que o usuário alcance todos os botões e artefatos ao redimensionar a janela.
      - **Paridade 100%**: Sincronizado integralmente em `docs/brain-ui/` e `docs/brain-ui/demo/` (`style.css` e `app.js`).
  - **Correção da Exibição Inicial do PROJECT.md nos Contratos do Grill Studio**:
    - **Causa Raiz**: No switch de abas dos contratos gerados, caso a textarea de edição estivesse vazia no momento do switch, ocorria sobrescrita do draft em memória. Adicionada guarda estrita (`currentQsContractMode === 'write'`) e fallback polimórfico de chaves (`projectMd || parsed['PROJECT.md']`).
  - **Correção Definitiva do Rodapé Fixo (Ações de Sabatina) & Cadeia Flex sem Vazamento no Grill Studio**:
    - **Diagnóstico & Causa Raiz**:
      - Quando a sabatina carregava 8 perguntas, os botões/caixas de ação inferiores (*"Aprofundar Sabatina"* e *"Gerar Contratos com IA"*) deixavam de ficar visíveis na tela como um rodapé fixo, sendo empurrados e cortados para fora do modal.
      - A causa raiz estava no fato de `.qs-step-pane.active` ser `display: block;` com altura automática (`height: auto`). Em CSS flexbox, quando um elemento intermediário na árvore tem `display: block` e altura indefinida, a porcentagem `height: 100%` do `#qsGrillQuestionsPane` falha em resolver contra um limite restrito, permitindo que o container de perguntas se expandisse livremente para abrigar todos os cards verticalmente. Isso empurrava as caixas de ação para além dos `820px` do modal, onde eram cortadas pelo `overflow: hidden` do `.qs-body`.
    - **Solução Definitiva (Cadeia Flex 100% Ininterrupta & Rodapé Ancorado)**:
      - **Cadeia Flex Vertical**: Configurado `.quickstart-modal-card.grill-mode`, `.qs-body.grill-active` e `.qs-step-pane.active` com `display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden;`.
      - **Scroll Exclusivo na Lista**: O container `#qsGrillQuestionsList` agora absorve rigorosamente todo o scroll do modal com `flex: 1; min-height: 0; overflow-y: auto;`.
      - **Rodapé Fixo Permanente**: As caixas `#qsGrillActionCards` ganharam `flex-shrink: 0; margin-top: auto;` e tipografia otimizada com clamp de 2 linhas na descrição, garantindo que o rodapé permaneça 100% ancorado e perfeitamente visível na base do modal tanto com 4 quanto com 8 perguntas.
      - **Validação E2E**: Testado visualmente via navegador automatizado com captura de screenshots (`grill_studio_8_questions_fixed_footer_1792091617601.png`), e paridade 100% validada em `docs/brain-ui/` e `docs/brain-ui/demo/` com `npm run doctor`.
  - **Padronização Visual Perfeita (Proporções Idênticas) & Container de Scroll Dedicado no Grill Studio**:
    - **Diagnóstico & Causa Raiz das Anomalias**:
      - *Deformação de Proporções*: O modo compacto (`.is-dense`) reduzia paddings e fontes quando havia mais de 4 perguntas, quebrando a harmonia visual em relação ao estado inicial de 4 perguntas.
      - *Desaparecimento do Cabeçalho e Botão*: Ao expandir uma pergunta como a 7, `inputEl.focus()` forçava a rolagem do container nativo para o input, empurrando o topo do card (onde fica o cabeçalho com número, categoria e botão de alternância `▲`) para fora da área visível do scroll.
      - *Colisão de IDs*: Perguntas complementares retornadas pelo LLM podiam repetir chaves de ID (`q1`, `q2`), fazendo com que `document.getElementById` capturasse os cards errados e travasse o toggle.
    - **Solução Definitiva (100% de Proporção & Scrollbar Próprio)**:
      - **Remoção Completa do `.is-dense`**: Todas as perguntas mantêm rigorosamente a mesma altura, espaçamento, tipografia e proporções elegantes do estado de 4 perguntas.
      - **Container de Scroll Dedicado (`.qs-grill-questions-list`)**: Altura máxima calibrada (`max-height: 420px`) com scrollbar customizado em glassmorphism dark (largura de 6px e thumb roxo translúcido). Com 4 perguntas, nenhuma barra de rolagem aparece (100% idêntico ao original). Com 8 perguntas, a barra surge suavemente.
      - **Garantia de Visibilidade do Cabeçalho**: Implementado `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` no card expandido e `inputEl.focus({ preventScroll: true })`. O cabeçalho e botão de recolher (`▲`) NUNCA somem da tela.
      - **IDs Determinísticos Universais**: Renumeração sequencial estrita (`q1` a `q8`) impedindo qualquer colisão de elementos no DOM.
      - **Paridade 100%**: Sincronizado em `docs/brain-ui/` e `docs/brain-ui/demo/` (`style.css` e `app.js`), e `scripts/quickstart-grill.js`. Validado com `npm run doctor` com 100% de sucesso.
  - **Correção da Geração de Perguntas Complementares no Grill Studio (Perguntas Vazias e Toast Incorreto)**:
    - **Diagnóstico & Causa Raiz**:
      - Ao clicar em *"Aprofundar Sabatina (+ Perguntas)"*, na primeira tentativa a IA retornava a mensagem *"O Arquiteto de IA considerou que as perguntas atuais já cobrem os pontos críticos"*, e na segunda tentativa gerava 4 perguntas com títulos e corpos vazios no acordeão (exibindo apenas o número e o badge de status).
      - *Causa Raiz 1 (Schema ausente no prompt)*: O prompt de rodadas complementares (`isComplementary = true`) não continha o bloco `FORMATO DE RESPOSTA (JSON)` especificando as chaves esperadas (`questions`, `id`, `category`, `question`, `options`, `placeholder`). Como o prompt estava em português, o LLM gerava chaves em português (`pergunta`, `categoria`, `opcoes`) ou envolvia em `{ "perguntas": [...] }`.
      - *Causa Raiz 2 (Falta de normalização)*: Em `scripts/quickstart-grill.js`, `parsed.questions` era lido diretamente. Quando o LLM retornava `{ "perguntas": [...] }`, o array resultava vazio (`[]`), disparando o toast enganoso de que não precisava de mais perguntas. Quando retornava `{ "questions": [{ "pergunta": "..." }] }`, o array continha 4 itens, mas `q.question` era `undefined`, fazendo o frontend desenhar cards sem texto de pergunta.
    - **Solução Definitiva & Resiliência Dupla (Backend + Frontend)**:
      - **Normalizador Polimórfico (`normalizeQuestionItem`)**: Criada função no backend que mapeia variações de chaves (`question`, `pergunta`, `title`, `texto`, `enunciado`) e garante que `question`, `category`, `options` e `placeholder` sempre sejam strings válidas não-vazias.
      - **Contrato JSON Explícito no Prompt**: Injetado schema rigoroso de resposta com chaves padronizadas e IDs sequenciais (`q5..q8`).
      - **Fallback Complementar Automático**: Se o LLM falhar, estiver offline ou responder estrutura vazia, o backend injeta imediatamente as 4 perguntas complementares clássicas (Performance, Logs/Observabilidade, CI/CD e Resiliência).
      - **Defesa no Cliente**: Atualizadas as funções `renderGrillQuestions` e `requestMoreGrillQuestions` em `docs/brain-ui/` e `docs/brain-ui/demo/` (`app.js`), garantindo que itens com texto inválido sejam descartados e títulos nunca fiquem em branco.
  - **Alinhamento Dinâmico de Domínio no Grill Studio & Smart Nudge Visual no Quickstart**:
    - **Governança sem Bloqueios Frustrantes**: Preservada a liberdade do desenvolvedor de usar nomes temáticos, cotidianos ou codinomes (ex: *bolo-de-banana*, *celery*, *flask*), sem falsos positivos ou bloqueios arbitrários via IA.
    - **Alinhamento Cirúrgico de Domínio (Grill Engine)**:
      - Atualizado o prompt do Arquiteto de IA em `scripts/quickstart-grill.js` (`generateQuestions` e `generateDraft`): caso o nome seja temático/abstrato ou falte descrição, a primeira pergunta (`q1`) obrigatoriamente alinha o domínio de negócio e objetivo de software (ex: *App de receitas*, *E-commerce/PDV de confeitaria*, *Codinome para microsserviço/API interna*, *Ferramenta interna*).
      - O fallback determinístico de `generateQuestions` também detecta ausência de descrição e prioriza pergunta de domínio e escopo inicial com resiliência a falhas de rede.
    - **Smart Nudge Visual no Formulário**:
      - Adicionado componente interativo `.qs-desc-nudge` logo abaixo do campo "Descrição Rápida (Opcional)" em `docs/brain-ui/` e `docs/brain-ui/demo/`.
      - Enquanto vazio, orienta suavemente como uma breve descrição ajuda a calibrar a arquitetura sem ambiguidades.
      - Ao digitar (`length >= 8`), o nudge transiciona para o estado `.filled` com tema esmeralda e confirmação visual ("*Contexto registrado!*").
    - **100% de Paridade e Doctor Válido**:
      - Sincronizado em `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `style.css`, `app.js`), validado com `npm run doctor` com 100% de integridade.
  - **Correção do Travamento no Modal de Carregamento da Demo na Landing Page (Synaptic Boot HUD & Paridade 100%)**:
    - **Diagnóstico & Causa Raiz**:
      - Ao clicar em "Carregar Demo ao Vivo" na Landing Page (`docs/brain-ui/landing/index.html`), o modal cinematográfico de carregamento (`#brainBootOverlay`) permanecia congelado indefinidamente em `0%` (*"Inicializando conexões..."*).
      - O console do DevTools revelava o erro crítico: `Uncaught SyntaxError: Unexpected end of input app.js:10105`.
      - A causa raiz foi a presença de um fragmento duplicado e incompleto da função `startGrillQuestionsFlow` (linhas 3540-3554) colado inadvertidamente antes de `let currentGrillValidationIssue = null;` no arquivo `docs/brain-ui/demo/app.js`. Como o bloco `{` nunca era fechado, o motor V8 abortava a compilação do script inteiro em tempo de parse, impedindo a execução dos listeners de `DOMContentLoaded`, a inicialização do `VaultManager` e a chamada final de `dismissBootScreen()`.
    - **Solução Definitiva & Paridade Absoluta (100%)**:
      - Removido o bloco órfão e sincronizado integralmente `docs/brain-ui/demo/app.js` com a versão master consolidada `docs/brain-ui/app.js`, restabelecendo 100% de paridade byte-a-byte entre os ambientes local e público de demonstração.
      - Validação de integridade sintática via `node --check` sobre todos os 25 scripts JavaScript de `docs/brain-ui/` com 100% de conformidade (`OK`).
    - **Ajuste de UX e Ergonomia no Frame da Demonstração (Posicionamento do Botão "Descarregar ✕")**:
      - Realocado o botão flutuante `.unload` para o interior da barra superior da janela simulada (`.browser-bar`), posicionado imediatamente à esquerda do link `Abrir em tela cheia ↗`.
      - Elimina qualquer sobreposição visual com o cabeçalho e controles internos do Cockpit (`#btnAiGatewayModal` e status da demo), garantindo harmonia visual e facilidade de descarregamento da demo com 1 clique.
      - Estilizado em dark glass com pílula translúcida suave e micro-interação hover em tom carmesim (`#fca5a5`), perfeitamente integrado à barra de navegação da janela do navegador simulado.
- **Data**: 2026-10-14
  - **Opção 3: Modo Focado / Accordion Inteligente na Sabatina Técnica (Grill Studio)**:
    - **Solução Definitiva para Eliminação de Rolagem e Double-Scroll**:
      - As perguntas centrais do Passo 2.A (Sabatina Técnica) foram transformadas em um Accordion Inteligente interativo, onde apenas 1 pergunta permanece expandida por vez (ou todas colapsadas em formato de checklist quando respondidas).
      - Altura do container calibrada para `max-height: 380px` (com overflow suave interno apenas se necessário), garantindo que 1 card aberto (~180px) + 3 barras colapsadas (3x 42px = 126px) caibam com folga em ~320px, mantendo as duas caixas de ação inferiores ("Aprofundar Sabatina" e "Gerar Contratos com IA") 100% visíveis sem qualquer necessidade de rolar a janela do modal.
    - **Barra de Progresso e Métricas em Tempo Real**:
      - Componente `#qsGrillProgressWrap` acima da lista de perguntas exibe a porcentagem exata e contagem de decisões tomadas (ex: `3 de 4 decisões tomadas (75%)`).
      - Ao atingir 100%, exibe selo esmeralda de conclusão e ativa um pulso luminoso suave (`.ready-to-generate`) no card de sintetizar contratos.
    - **Navegação Fluida & Transições Inteligentes**:
      - Selecionar uma opção (chip) salva a escolha, atualiza o badge e status da pergunta, e avança automaticamente (após 220ms) para a próxima pergunta pendente.
      - Digitar resposta personalizada permite avançar pressionando `Enter` no input ou clicando no botão `Avançar ↵`.
      - Clicar no cabeçalho de qualquer pergunta expande/colapsa instantaneamente sem perder nenhum valor digitado (`<input>` preservado no DOM).
    - **Integração com Modal de Auditoria e Correções**:
      - Se o usuário tentar gerar contratos com perguntas em branco ou respostas incoerentes, o sistema expande e foca automaticamente na pergunta apontada pela IA ou pelo modal de auditoria.
      - Ao clicar em "Aplicar Sugestão", o valor é preenchido, o preview atualizado e o accordion avança suavemente para a próxima pergunta.
    - **100% de Paridade entre Ambientes**:
      - Sincronização rigorosa e idêntica entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `style.css`, `app.js`).
      - Validado pelo linter de integridade do workspace (`npm run doctor` com 100% de sucesso e `npm run scan` atualizado).
  - **Ação Direta no Modo de Inicialização do Projeto (Remoção dos Botões Inferiores do Passo 2)**:
    - **Remoção de Botões Redundantes**: Removidos os botões inferiores (`Voltar` e `Iniciar Sabatina com IA →`) no Passo 2 ("Criando Projeto do Zero"), reduzindo atrito e cliques desnecessários. A navegação de retorno já está elegantemente disponível no topo do modal (`← Trocar modo`).
    - **Cards como Triggers Diretos**: As duas caixas de "Modo de Inicialização do Projeto" (`cardModeAssisted` e `cardModeExpress`) tornaram-se gatilhos acionáveis imediatos:
      - Clicar em **🎯 Modo Assistido com IA (Grill Studio)** valida o nome do projeto (com shake/highlight e foco caso vazio) e transiciona diretamente para a sabatina técnica de IA.
      - Clicar em **⚡ Modo Express (50ms)** valida o nome e cria o projeto instantaneamente no disco via endpoint determinístico, exibindo feedback no card e abrindo a tela de sucesso.
    - **100% Paridade & Acessibilidade**: Implementado em `docs/brain-ui/` e `docs/brain-ui/demo/` com suporte a teclado (Enter/Space) e animação `.input-error-shake`.
  - **Refinamento de UX do Quickstart Grill Studio (Caixas de Ação, Auditoria de Respostas e Redução de Largura)**:
    - **Redução da Largura do Modal (-30%)**:
      - Calibrado `max-width` da classe `.quickstart-modal-card.wide` para `740px` (redução de ~30% em relação aos `1040px` anteriores) e o card padrão para `720px`, criando uma proporção muito mais confortável e focada para leitura e resposta.
    - **Substituição dos Botões por Duas Caixas de Ação (Estilo Cards do Passo 2)**:
      - Substituídos os botões convencionais de rodapé (`Voltar` e `Gerar Contratos`) por duas caixas interativas (`.qs-grill-action-cards`):
        - **Caixa 1 (`cardGrillMoreQuestions`)**: Pergunta se o desenvolvedor deseja que o Arquiteto de IA formule mais perguntas técnicas (até +4 perguntas complementares, limite de 8), preservando integralmente todas as respostas já digitadas/selecionadas.
        - **Caixa 2 (`cardGrillGenerateContracts`)**: Representa a ação de conclusão da sabatina e síntese dos 4 contratos com IA.
    - **Auditoria Obrigatória & Modal de Resposta Inválida/Fora de Contexto**:
      - Bloqueio preventivo caso qualquer pergunta fique em branco, com alerta orientativo.
      - Validação semântica e determinística via `POST /api/projects/quickstart/validate-answers` (`scripts/quickstart-grill.js`), detectando respostas sem sentido, gírias vazias ou desconexas da decisão arquitetural.
      - Modal de auditoria em alta fidelidade (`#qsGrillValidationModal`) apresentando a pergunta, resposta informada, diagnóstico do Arquiteto e sugestão prática com 2 exemplos rápidos, além de atalho para aplicar a sugestão em 1 clique ou focar na resposta para edição.
    - **100% de Paridade e Suporte Offline**:
      - Sincronização rigorosa entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `app.js`, `style.css`, `demo-mode.js`).
  - **Quickstart Dual-Mode & Grill Studio (Sabatina Dinâmica com IA & Refinamento "Prompt Vivo")**:
    - **Liberdade de Escolha do Desenvolvedor (Dual-Mode)**:
      - O Quickstart Studio (`+ Novo Projeto`) agora oferece dois caminhos claros de inicialização no Passo 2:
        - **`⚡ Modo Express (50ms)`**: Criação instantânea e 100% determinística com contratos padrão limpos para preenchimento manual.
        - **`🎯 Modo Assistido com IA (Grill Studio)`**: Sabatina técnica conduzida pela IA para eliminar ambiguidades, gerar contratos ricos e roadmap ativo antes da gravação.
    - **Sabatina Dinâmica Não-Engessada (Grill Engine)**:
      - O novo módulo `scripts/quickstart-grill.js` formula de 3 a 4 perguntas cirúrgicas adaptadas à stack e ao domínio do projeto via endpoint `POST /api/projects/quickstart/questions`.
      - Cada pergunta traz chips de resposta rápida e campo de texto livre para flexibilidade máxima.
    - **Síntese de Contratos & Visualizador Interativo**:
      - `POST /api/projects/quickstart/draft` gera os 4 contratos de governança fundamentais (`PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md` com roadmap em 3 marcos e `DECISIONS/ADR-0001-stack-inicial.md`).
      - As abas do modal permitem navegar e editar diretamente o Markdown dos contratos.
    - **Barra de Refinamento Iterativo ("Prompt Vivo")**:
      - O desenvolvedor pode digitar instruções em linguagem natural (ex: *"Mudar banco para PostgreSQL e adicionar autenticação JWT"*) e acionar o botão **`✨ Melhorar com IA`** (`POST /api/projects/quickstart/refine`), que ajusta cirurgicamente todos os contratos em tempo real antes de qualquer gravação.
    - **Aprovação Humana Obrigatória & Gravação Atômica**:
      - A gravação física só ocorre após clique explícito em `💾 Aprovar e Criar Projeto no Disco` (`POST /api/projects/quickstart/commit`), garantindo conformidade com a regra de *Zero Fabricação*.
    - **Skill de IDE e Template Global**:
      - Criada a skill nativa `.agents/skills/grill-with-docs/SKILL.md` para uso conversacional no chat de IDEs (Claude Code, Cursor, Antigravity).
      - Criado o template de vocabulário de domínio em `templates/glossary.md`.
    - **Paridade e Validação**:
      - 100% de paridade entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `app.js`, `style.css`).
      - Validado em navegador real via subagente com captura de screenshot.
  - **Experiência de Carregamento & Percepção de Performance (Synaptic Boot HUD & Instant Pre-Render)**:
    - **Diagnóstico da Percepção de Lentidão**:
      - Identificado que o carregamento da página aguardava a resposta de rede do endpoint assíncrono `/api/vault` antes de chamar `buildSidebar()`, `buildStats()` e `renderDashboardProjects()`. Durante esse intervalo de 300-800ms, o usuário deparava-se com o menu e a área de projetos completamente em branco e sem feedback, criando a falsa impressão de que a plataforma era lenta.
    - **Instant Pre-Render a 0ms (Zero Tela em Branco)**:
      - O constructor de `VaultManager` (`vault.js`) agora carrega síncronamente os dados do snapshot estático (`window.VAULT_SNAPSHOT`) assim que o script é instanciado.
      - No evento `DOMContentLoaded` (`app.js`), o menu lateral, métricas do cérebro e cards de projetos são montados e desenhados a 0ms, garantindo que o DOM já esteja 100% pronto e pintado em segundo plano.
    - **Synaptic Boot HUD ("Efeito UAU")**:
      - Criado overlay cinematográfico de alta fidelidade visual (`#brainBootOverlay`) com backdrop escuro e blur de 24px (`backdrop-filter`), anéis concêntricos orbitais neon em contra-rotação (`.ring-1`, `.ring-2`, `.ring-3`) e o ícone de cérebro com pulso elétrico (`assets/cerebro_neon_animado.svg`).
      - Barra de progresso com shimmer de gradiente ciano/esmeralda/índigo (`.brain-boot-progress-fill`) com telemetria viva (`[●] Cofre Ativo`, `[●] Contratos Vivos`, `[●] AI Gateways`) e mensagens de transição contextualizadas.
      - Transição de encerramento suave (`.boot-fade-out`) com micro-pausa de 260ms no 100% e fade-out com desfoque e escala, revelando a interface já totalmente montada.
    - **Placeholders Defensivos Shimmer (Skeletons)**:
      - Adicionados skeletons com animação de varredura de luz (`skeletonSweep`) no HTML nativo tanto para a barra de navegação (`.nav-skeleton-wrap`) quanto para a grade de projetos (`.skeleton-card`), prevenindo qualquer layout shift (CLS).
    - **Paridade Absoluta 100%**:
      - Implementado identicamente em `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `app.js`, `style.css`, `vault.js`).
  - **Unificação da Fonte Única da Verdade para Status de Projetos (`config/project-statuses.json`)**:
    - **Criação do Catálogo Central (SSOT / DRY)**:
      - Criado o arquivo `config/project-statuses.json` contendo a especificação unificada de status (`id`, `label`, `fullText`, `icon`, `color`, `badgeClass`, `description`, `aliases`), permitindo que qualquer desenvolvedor altere, adicione ou remova status sem tocar em código JS ou CSS.
      - Status padronizados: `🟢 Em Planejamento / Ativo` (planning), `🚀 Em Desenvolvimento Ativo` (active), `🟡 Em Testes / Homologação` (testing), `✅ Em Produção / Concluído` (production) e `⏸️ Pausado` (paused).
    - **Sincronização 100% Dinâmica entre Filtros e Edição Rápida**:
      - A caixa de listagem de status na pesquisa do Dashboard (`#projStatusFilter`) e a edição rápida do Project Workspace (`#pwEditStatus`) agora compartilham exatamente as mesmas opções, ícones, descrições e ordem através da função `getProjectStatuses()`.
      - O card do projeto (`.proj-status-chip`) agora renderiza dinamicamente a pílula de status e o dot pulsante a partir do status oficial resolvido (`resolveProjectStatus`), suportando classes de cores dedicadas (`.paused` em âmbar e `.testing` em azul).
    - **Eliminação de Duplicidades e Circuit Breaker de Resiliência**:
      - Eliminadas cópias físicas redundantes de `project-statuses.json`, mantendo exclusivamente `config/project-statuses.json` como arquivo fonte.
      - A constante `DEFAULT_PROJECT_STATUSES` no JavaScript atua estritamente como fallback defensivo de engenharia caso o JSON seja deletado, esteja vazio ou corrompido, garantindo que o visualizador nunca quebre com erro de runtime.
    - **Infraestrutura e Backend**:
      - `scripts/scan-vault.js` lê `config/project-statuses.json` e o embute diretamente em `window.VAULT_SNAPSHOT.projectStatuses`.
      - `server.js` adicionou rotas `GET /api/config/project-statuses` e `POST /api/config/project-statuses` com hot-reload automático (SSE) quando o arquivo de configuração for modificado.
    - **Paridade Absoluta 100% & Validação**:
      - Todas as alterações aplicadas com 100% de paridade entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `app.js`, `style.css`).
      - Validado via testes automatizados e `npm run doctor` com 100% de integridade (0 erros).
- **Data**: 2026-10-13
  - **Redesign Minimalista do Cabeçalho do Project Workspace (Abertura Nativa & Zero Poluição)**:
    - **Remoção de Dropdowns Arbitrários**: Eliminado o split button e o catálogo fixo de IDEs, adotando uma abordagem limpa e agnóstica de ferramenta.
    - **Abertura Nativa via Hiperlink**: A linha de caminho do projeto foi simplificada para `📂 [caminho]`, atuando como um hiperlink que aciona o Explorador de Arquivos nativo (`explorer.exe`) ao clicar.
    - **Limpeza do Cabeçalho Superior**: Removido o botão redundante `📄 Ver Markdown`, concentrando as ações do topo unicamente no essencial `🧠 Dashboard Geral`.
    - **Alinhamento das Ações**: O botão `📋 Copiar Caminho` foi posicionado imediatamente à esquerda de `✨ Copiar Prompt para Agente`.
    - **Paridade Absoluta 100%**: Sincronizado integralmente entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `app.js`, `style.css`).
  - **Implementação da Toolbar de Governança de Projetos (Busca em Tempo Real, Filtros Dinâmicos e Ordenação)**:
    - **Toolbar Executiva em Dark Glassmorphism (`.proj-toolbar-wrap`)**:
      - Adicionada barra de controles integrada entre o cabeçalho de *Projetos Sob Governança* e a grade de cards (`#dynamicProjectsSlot`), com fundo translúcido (`rgba(20, 24, 38, 0.75)`), blur de 14px, bordas suaves e acentos luminosos em índigo/esmeralda.
    - **Omnisearch Instantâneo em Tempo Real (`#projSearchInput`)**:
      - Busca inteligente e tolerante a maiúsculas/minúsculas e acentos pesquisando simultaneamente em 4 dimensões: Nome do Projeto, Caminho da Pasta (`projects/...`), Descrição oficial e Stack de Tecnologia.
      - Botão de limpeza rápida `✕` (`#projSearchClearBtn`) dinâmico e badge visual `[/]`.
      - **Atalhos Globais de Teclado (`/` e `Esc`)**: Pressionar `/` em qualquer ponto do Dashboard rola suavemente a tela (`scrollIntoView({ behavior: 'smooth', block: 'center' })`) e foca diretamente no campo de busca com seleção de texto. Pressionar `Esc` limpa o filtro e desfoca o campo. Tratamento robusto contra falsos positivos de modais e total compatibilidade com teclados ABNT2 (`e.code === 'Slash'`, `'NumpadDivide'`).
    - **Filtro 100% Dinâmico por Stack Tecnológica (`#projStackFilter`)**:
      - Descoberta automática de stacks a partir dos contratos `PROJECT.md` dos projetos reais conectados, sem nenhuma lista fixa/hardcoded (respeitando rigorosamente a regra de *Zero Fabricação* e *Catálogos Dinâmicos*).
      - Exibe contagem de projetos por tecnologia (ex.: `Node.js / TypeScript (2)`, `C# / .NET (1)`).
    - **Filtro por Status Operacional (`#projStatusFilter`)**:
      - Segmentação rápida por ciclo de vida do projeto: `Todos os Status`, `🟢 Ativo / Produção`, `🟡 Planejamento`, `🔴 Conceituação`.
    - **Filtro por Saúde de Governança de Arquitetura (`#projGovFilter`)**:
      - Segmentação por maturidade dos 4 contratos vivos: `Todas as Conformidades`, `🛡️ 100% Conforme (Ouro)`, `⚠️ Pendente (< 100%)`, `🔬 Com Research Labs`.
    - **Ordenação Inteligente (`#projSortSelect`)**:
      - Modos de classificação rápida: `Nome (A → Z)`, `Nome (Z → A)`, `Governança (Maior → Menor)`, `Mais Documentos Indexados`, `Mais Labs de Pesquisa`.
    - **Contador Dinâmico e Feedback Reativo de Filtros (`#projResultsCounter` & `#btnProjResetFilters`)**:
      - Exibe telemetria em tempo real: `"Exibindo X de Y projetos"` e badge no cabeçalho atualizado (`X / Y`).
      - Botão contextual `↺ Limpar Filtros` exibido apenas quando filtros ou ordenações não-padrão estão ativos.
    - **Empty State Sofisticado (`.dash-projects-empty-card`)**:
      - Apresenta card com ícone de lupa, mensagem orientativa amigável e botão `↺ Limpar Filtros e Ver Todos (N)` para restauração em 1 clique quando uma busca não retorna resultados.
    - **Paridade Absoluta 100% & Correção de Escopo de Renderização (`renderSingleProjectCardHtml`)**:
      - Replicado integralmente em `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `app.js`, `style.css`).
      - **Bugfix (Exibição de Projetos no Demo/Landing)**: Corrigida inconsistência de escopo em `docs/brain-ui/demo/app.js` onde referências a `folderName` nas pílulas de governança foram atualizadas para `p.folderName`, eliminando o `ReferenceError` que impedia a montagem dos cards de projeto no slot dinâmico da demonstração. Restabelecida a exibição imediata do projeto de exemplo (`demo-app`).
  - **Refinamento de UX, Consistência de Ícones de IA e Central de Ajuda Cognitiva**:
    - **Modais Educativos nos Cards de Governança (`#aiDecisionFlowHelpModal` & `#brainMetricsHelpModal`)**:
      - Adicionados modais explicativos de alta fidelidade visual nos cards *AI Decision Flow* e *Métricas do Cérebro*, detalhando a hierarquia determinística (Código determinístico vs AIJev vs LLM vs Validação) e o papel prático das 6 métricas fundamentais (Regras, Skills, Projetos, Conhecimento, Decisões, Memória).
      - Redesenhados os botões de ajuda `?` em estilo minimalista e translúcido (ghost button com ícone vetorial SVG Heroicons e efeito hover suave), substituindo o antigo botão circular sólido.
    - **Redesign dos Cards de Projetos ("Projetos Sob Governança")**:
      - **Ajuste Semântico de Título**: Seção atualizada de *"Meus Projetos Governamentais"* para **"Projetos Sob Governança"**, eliminando a ambiguidade com órgãos governamentais e alinhando ao conceito de governança de software por IA.
      - **Grid 2x2 Luminous para os 4 Contratos**: Os 4 contratos essenciais (`PROJECT`, `STATE`, `ARCH`, `DECISIONS`) organizados em layout 2x2 de alta escaneabilidade com tipografia nítida (11px monospace), preenchimento translúcido com glow neon esmeralda para contratos válidos (`✓`) e destaque âmbar para pendências (`+ DECISIONS`).
      - **Dock Unificado de Métricas**: Substituição das 3 caixas cinzas pesadas por uma faixa única com divisórias translúcidas discretas integrando `docs indexados`, `labs de pesquisa` e `proporção de contratos`.
      - **Hierarquia de Ações Refinada**: Botão `🚀 Workspace` com destaque luminoso de ação primária, e `🪐 Grafo 3D` / `🔬 Labs` / `⚙️ Gerenciar` como ações secundárias em estilo dark glass sofisticado.
      - **Sanitização de Dados**: Corrigida a duplicação textual no `PROJECT.md` do `OmniHealth_AI`.
      - **Modernização Vetorial de Ícones de Governança (`.proj-gov-shield-icon` & `.proj-gov-info-btn`)**: Substituídos os emojis estáticos de sistema operacional (`🛡️` e `ℹ️`) por ícones SVG vetoriais de alta fidelidade: escudo de segurança geométrico com checkmark de conformidade em índigo luminoso (`#818cf8`) com drop-shadow sináptico, e botão de informação minimalista com traçado vetorial nítido de 10px, fundo dark glass translúcido e microinteração hover com glow e escala suave.
      - **Paridade Absoluta 100%**: Espelhado em `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `app.js`, `style.css`).
    - **Interatividade Contextual no AI Decision Flow (`#aiDecisionFlowHelpModal`)**:
      - **Abertura e Rolagem por Bloco do Fluxograma**: Todos os nós (`TAREFA`, `Determinística?`, `Decisão?`, `Geração?`, `VALIDAÇÃO`) e ramificações (`SIM → CÓDIGO`, `SIM → AIJEV`, `SIM → LLM`) do card *AI Decision Flow* tornados interativos e clicáveis.
      - **Navegação Direcionada com Destaque Luminoso**: Ao clicar em qualquer etapa, a função `openAiDecisionFlowHelpModal(stepId)` abre o modal, executa rolagem suave (`scrollIntoView`) centralizando na etapa correspondente e dispara um pulso luminoso violeta (`@keyframes flowStepPulse`) de orientação visual.
      - **Affordance & Micro-interações**: Adicionado `cursor: pointer`, ganho de brilho no hover, elevação suave (`translateY(-2px)`) e sombras dinâmicas via `filter: drop-shadow` compatíveis com o formato poligonal `clip-path` dos nós de decisão.
      - **Acessibilidade Completa**: Configurados atributos semânticos (`role="button"`, `tabindex="0"`), tooltips explicativos (`title="..."`) e atalhos de teclado (`Enter` e `Espaço`).
    - **Remoção de Jargão `(BYOK)` do Título de Configuração de IA**:
      - Título do modal atualizado de `Configuração de IA (BYOK)` para simplesmente `Configuração de IA`, reduzindo atrito cognitivo e jargões corporativos na UI, mantendo o conceito técnico registrado nos ADRs de arquitetura.
    - **Correção de Layout e Respiro na Barra de Busca da Sidebar (`✨ IA`)**:
      - Identificado e corrigido comportamento de flexbox no `.search-box input` com adição de `min-width: 0;`, eliminando o esmagamento do botão contra a borda direita e prevenindo quebra de texto em duas linhas.
      - Calibrado espaçamento simétrico e respiro elegante de ~14px em relação à borda do container.
    - **Redimensionamento e Centralização da Logo da Sidebar**:
      - Logo ajustada para 90% com `justify-content: center;` no container flex `.logo`, garantindo harmonia visual e margens laterais equilibradas na sidebar.
    - **Harmonização do Pill de Status de IA na Topbar (`#btnAiGatewayModal`)**:
      - Removida a duplicidade de ícones (`✨` + `⚡`), eliminando o raio extra gerado por concatenação de string no JavaScript.
      - Substituído o emoji estático pelo mesmo SVG vetorial refinado de constelação/brilho de IA utilizado no modal (`.ai-pill-sparkle-svg`), com herança dinâmica de cor via `stroke="currentColor"`.
    - **Ajuste Fino na Landing Page**:
      - Atualizado o rótulo de autoria no footer para `"Criado & Mantido por"` (e `"Created & Maintained by"` em inglês), alinhando ao padrão universal de projetos open-source.
    - **Paridade Absoluta & Integridade**:
      - Alterações replicadas integralmente com 100% de paridade em `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `app.js`, `style.css`).
      - Validado via linter de integridade `npm run doctor` com 100% dos links e arquivos válidos (0 erros).
- **Data**: 2026-10-12
  - **Isolamento Estrito do Vault de Demonstração na Landing Page (`build:demo`)**:
    - **Diagnóstico & Correção**: O snapshot de demonstração (`docs/brain-ui/demo/vault-data.js`) havia sido sobrescrito com o vault completo do workspace local, expondo indevidamente os projetos privados do usuário na demonstração embutida da landing page.
    - **Restauração do Vault de Demonstração**: Regenerado o `docs/brain-ui/demo/vault-data.js` via `python docs/brain-ui/demo/tools/build_demo_vault.py`, restaurando o cofre ilustrativo curado (35 arquivos de demonstração) contendo exclusivamente o projeto governado `demo-app`.
    - **Automação no `package.json`**: Adicionado o script `"build:demo": "python docs/brain-ui/demo/tools/build_demo_vault.py"` para permitir rebuild e manutenção imediata sem risco de sobrescrita acidental pelo `scan-vault.js`.
    - **Comprovação Visual**: Validado no navegador via browser subagent com captura de tela demonstrando que a demonstração na landing page exibe exclusivamente `demo-app (1 projeto governamental)`.
  - **Progressive Disclosure & Central de Ajuda Cognitiva ("? Como Funciona")**:
    - **Botão e Modal Dedicado de Arquitetura RAG (`#askBrainHelpModal`)**:
      - Adicionado botão `? Como Funciona` no cabeçalho do modal "Pergunte ao Cérebro" com abertura em camada superior (`z-index: 10050`).
      - Ao fechar via ✕, backdrop ou tecla ESC, retorna suavemente para o modal de busca sem fechar o fluxo de consulta.
      - Explicações claras e organizadas em cards visuais para o desenvolvedor:
        - **Inteligência do Ranking**: Adaptação de TF-IDF/BM25 com multiplicadores de governança (2.4x ADRs, 2.2x Estado Atual, 2.0x Contratos e Lições, 1.8x Regras, 1.5x Actionable, 1.0x Research) e pontuação estrutural (match exato, cabeçalhos `# H1`/`## H2`, nome de arquivo e bônus de cobertura).
        - **Padrão Ouro RAG (Top 5 a 7)**: O efeito "Lost in the Middle" dos LLMs (evitando alucinações), janela de contexto/latência (~1.2s com Zero Fabricação) e ergonomia do dev.
        - **Progressive Disclosure Ativo**: Recuperação de até 12 fontes, síntese nos documentos principais e expansão suave de fontes adicionais com 1 clique (`📄 Ver mais N fontes encontradas (+N)`).
    - **Paridade Absoluta & Integridade**: Sincronizado em `docs/brain-ui/` e `docs/brain-ui/demo/`; validado com subagente de browser no Chromium real; `npm run scan` e `npm run doctor` com 100% de integridade (0 erros).
  - **Refinamento Crítico de Usabilidade & Arquitetura Cognitiva (v3.2 — Soluções para os 6 Pontos do Usuário)**:
    - **1. Remoção de Sugestões Estáticas**: Eliminada a linha `#askBrainSuggestionsRow` para despoluir o cabeçalho e eliminar ruído visual ("banner blindness").
    - **2. População Dinâmica do Escopo de Projetos**: Corrigida a descoberta de projetos no `<select id="askBrainScopeSelect">` lendo as pastas reais de `projects/` a partir dos arquivos do vault (`window.VAULT.data.files` e `window.VAULT_SNAPSHOT`), habilitando a filtragem por projetos reais (`Alfredo_teste`, `teste_alfredo_22`, etc.).
    - **3. Transformação dos Chips de Categoria em Dropdown Escalável**: Substituídos os botões soltos por `<select id="askBrainCategorySelect">`, criando uma barra de controles compacta em linha única (`📁 Escopo:` e `🏷️ Categoria:`) infinitamente expansível para novas tipologias sem quebras visuais.
    - **4. Interceptação de Links na Resposta Sintetizada**: Todos os links markdown internos gerados na resposta da IA (`#askAnswerContent a`) agora são interceptados com `e.preventDefault()` e roteados para `openAskSourceDoc(href)`, abrindo diretamente no leitor nativo do Cockpit com syntax highlighting e fundo escuro profissional, eliminando a abertura de arquivos crus/telas pretas no navegador.
    - **5. Filtro Estrito de Categoria (Hard Filter & Zero Fabricação)**: O motor de busca (`scripts/brain-search.js` e `demo-mode.js`) agora descarta 100% de qualquer documento que não pertença à categoria selecionada (descarte estrito), e gera mensagem amigável e orientativa quando não houver ocorrências na categoria restrita, eliminando misturas indevidas de Research em buscas por Regras. Corrigido também falso positivo sutil onde a substring `'adr'` dentro de palavras em português como `'padroes'` (`03-arquitetura-padroes-design.md`) fazia arquivos do Research Lab serem erroneamente rotulados como ADRs.
    - **6. Avaliação Arquitetural Modal vs Chat**: Mapeada a estratégia de evolução híbrida: preservação do modal rápido `Ctrl+K` para lookups instantâneos de um tiro + evolução para suporte a threads/follow-up de perguntas encadeadas.
    - **Validação Automatizada & Saúde Técnica**: Validado no Chromium com subagente de browser; `npm run scan` e `npm run doctor` com 100% de conformidade (0 erros).
  - **Refinamento de UX & Alta Fidelidade Visual ("Pergunte ao Cérebro" & Fontes Citadas)**:
    - **Reestruturação Visual "UAU" da Seção "Trechos & Fontes Citadas"**:
      - Eliminação total de quebras e distorções nos botões (`📖 Abrir Doc`, `🪐 No Grafo`, `📋 Copiar Citação`) utilizando layout flexbox blindado (`flex-shrink: 0`, `white-space: nowrap`) e ícones minimalistas.
      - Caminho do arquivo movido para linha dedicada com visual de terminal (`📁 projects/...`) e truncamento inteligente.
      - Legibilidade tipográfica aprimorada com `white-space: pre-wrap` e parágrafos reais.
      - **Marcação Automática de Destaques (`<mark class="ask-kw-highlight">`)**: Termos da consulta realçados em âmbar suave para escaneabilidade instantânea.
      - **Accordion Inteligente**: Exibição inicial compacta com efeito gradiente de fade-out inferior + botão de alternância `👁️ Expandir Trecho Completo` ⇄ `🔼 Recolher Trecho`.
      - **Acentos e Badges por Categoria**: Púrpura (ADRs), Ciano (Research Lab), Verde (Regras), Âmbar (Lições Aprendidas), Azul (Projetos/Contratos).
    - **Filtro Rápido por Tipo de Documento no Modal "Pergunte ao Cérebro"**:
      - Adicionados chips interativos de categoria: `[Todos]`, `[⚖️ ADRs]`, `[🔬 Research]`, `[🛡️ Regras]`, `[🧠 Lições]`, `[📦 Contratos]`.
      - Boost ponderado de relevância (+80 pts / 1.8x) ou penalidade (-60 pts) no algoritmo de busca determinística de snippets (`scripts/brain-search.js` e `server.js`).
    - **Histórico de Buscas Recentes da Sessão**:
      - Persistência das últimas 5 buscas da sessão em `sessionStorage` (`#askBrainRecentsRow`).
      - Renderização de pílulas interativas clicáveis com atalho para reconsulta imediata e botão de limpeza (`Limpar`).
    - **Micro-Feedback Visual nos Botões de Cópia**:
      - Micro-animação pulsante nos botões de citação individual e botão geral de resposta: transição imediata para `✓` verde / `✓ Copiada!` pulsante por 1.8 segundos com keyframe `@keyframes copiedPulse`.
    - **Paridade 100% no Modo Demo**:
      - Sincronização completa em `docs/brain-ui/demo/app.js`, `style.css` e `demo-mode.js` para execução estática offline no GitHub Pages.
    - **Validação Visual & Automação**:
      - Validado via teste automatizado de navegação real com gravação de sessão WebP e capturas de tela.
      - Linter de integridade `npm run doctor` e scanner `npm run scan` com 100% de conformidade (0 erros).
  - **Implementação da Fricção 5: Busca Global de Conteúdo ("Pergunte ao Cérebro")**:
    - **Motor Determinístico de Recuperação & Citações (`scripts/brain-search.js`)**:
      - Algoritmo de busca por palavras-chave com descarte de stopwords, pesos calibrados por relevância de contrato (ADR 2.4x, `CURRENT_STATE.md` 2.2x, `PROJECT.md` 2.0x, lições aprendidas 2.0x, regras 1.8x).
      - Extração inteligente de snippets (até 1400 caracteres) ancorada em cabeçalhos Markdown e parágrafos correspondentes para não perder contexto de bullets e listas.
      - Prompt especializado do sistema com imposição rigorosa de **Zero Fabricação**: citação explícita das fontes e recusa formal caso a informação não esteja documentada no vault.
    - **Endpoints REST no Backend (`server.js`)**:
      - `POST /api/brain/ask`: Orquestra a recuperação de trechos e síntese com IA via Gateway em tempo real.
      - `GET /api/brain/search`: Busca rápida determinística pura retornando trechos e scores sem inferência de LLM.
    - **Interface de Alta Fidelidade no Cockpit (`docs/brain-ui/` e `docs/brain-ui/demo/`)**:
      - Botão destacado na topbar (`✨ Pergunte ao Cérebro Ctrl+K`).
      - Botão rápido na barra de busca da sidebar (`✨ IA`).
      - Atalho global de teclado `Ctrl+K` / `Cmd+K` para abrir e fechar o modal instantaneamente.
      - Modal interativo (`#askBrainModal`) com glassmorphism, orbe neon pulsante de carregamento com frases rotativas, seletor de escopo de projeto e sugestões rápidas em chips.
      - Renderização rica de resposta sintetizada com botão `📋 Copiar Resposta` e suporte completo a Markdown.
      - Cards de fontes citadas com prévia de snippet e botões de ação:
        - `📖 Abrir Doc`: Navega diretamente para o arquivo markdown no leitor visual.
        - `🪐 No Grafo`: Alterna para a visualização orbital 3D do Three.js, foca no documento pesquisado e dispara o pulso sináptico nos neurônios.
    - **Paridade Absoluta com o Modo Demonstração (`docs/brain-ui/demo/demo-mode.js`)**:
      - Interceptação de `/api/brain/ask` e `/api/brain/search` executando busca e recuperação determinística offline sobre o `window.VAULT_SNAPSHOT` no GitHub Pages.
    - **Validação End-to-End**:
      - Validado via Node.js e no navegador real através de agente de testes (`browser_subagent`) comprovando renderização de resposta, badges e ausência de erros.
      - `npm run doctor`: 100% dos links e contratos válidos (0 erros).
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
    - **Quickstart AI Synthesis Cockpit (Cockpit de Síntese Neural em Tempo Real)**:
      - **Otimização do Cabeçalho & Despoluição**:
        - Título principal (`Arquiteto de IA Projetando a Governança`) e ícone `[⚡]` mantidos estritamente na mesma linha horizontal com `white-space: nowrap` e container flex.
        - Removidos chips redundantes do cabeçalho (`especificação.md` e `🧠 Modelo: Groq...`), pois os detalhes da especificação pertencem ao Card 1 e o modelo é registrado no console de telemetria.
        - Cronômetro decorrido (`⏱️ 00:00`) posicionado no topo alinhado à extrema direita via `space-between`.
      - **Esteira de 4 Cards 100% Visível (Eliminação do Corte do 4º Card)**:
        - Diagnóstico: A soma do `min-content` dos 4 cards somava ~1020px enquanto o modal draft estava limitado a `920px`, forçando o corte do 4º card (`CURRENT_STATE.md & ADR`) sob `overflow: hidden`.
        - Solução: Modal expandido para `max-width: 1040px` (`width: 94vw`), padding do cockpit otimizado (`18px 20px`), e grid configurado com `grid-template-columns: repeat(4, minmax(0, 1fr))` e `min-width: 0` nos cards.
        - Layout dos cards com tipografia e badges ajustados (`9px`), status em linha compacta e atributo `title` nativo nos nomes dos arquivos como tooltip informativo.
        - Breakpoint responsivo em `@media (max-width: 860px)` converte suavemente para Grid 2x2.
        - Sincronização e paridade 100% entre `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html` e `style.css`).
      - **Guarda Anti-Fechamento Involuntário & Confirmação de Saída do Quickstart Studio**:
        - **Proteção de Mousedown/Click no Backdrop & Resiliência a Escopo**: Implementado rastreamento de alvo em `mousedown` (`qsBackdropMouseDownTarget`). Se o usuário inicia um clique dentro de um campo ou seleciona texto e solta o cursor na área externa do modal, o evento de clique no backdrop é ignorado, eliminando fechamentos fantasmas enquanto o usuário digita ou transita entre campos. A função `hasQuickstartProgress()` foi blindada com checagens estritas via `typeof` para todos os estados (`attachedSpecsFiles`, `currentGrillQuestions`, `currentGrillDraft`, `quickstartStep`), eliminando erros de referência (`ReferenceError`) ao inspecionar o progresso.
        - **Confirmação Visual Inteligente (`#qsConfirmExitModal`)**: Se o usuário já iniciou o preenchimento (Passo 2 com formulário, sabatina técnica, síntese neural ou revisão de contratos), qualquer tentativa de saída (clique no backdrop, botão `✕` ou tecla `Escape`) aciona um diálogo de confirmação elegante em dark glass com foco primário em *"← Continuar Preenchendo"* e opção de *"Sim, Descartar e Sair"*.
        - **Isenção do Botão Verde (Passo 3 Conectado!)**: Quando o usuário clica no botão verde *"💾 Aprovar e Criar Projeto no Disco"* e os arquivos são gravados com sucesso, o fluxo transiciona para o Passo 3 (`quickstartStep === 3`). Nesta etapa os arquivos já estão salvos, permitindo fechamento imediato sem prompt confirmatório.
        - **Paridade 100%**: Sincronizado integralmente em `docs/brain-ui/` e `docs/brain-ui/demo/` (`index.html`, `style.css` e `app.js`).
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

## Landing — canais de contato (2026-10-24)
- Decisão: sem formulário de contato; canal principal = GitHub Issues/PRs; dúvidas = GitHub Discussions; contato privado discreto (e-mail ofuscado via JS + LinkedIn) na seção #comunidade. Formulário completo adiado até haver volume fora do GitHub.
- Arquivos: landing/index.html, js/extra.js, js/i18n.dict.js, css/extra.css.
