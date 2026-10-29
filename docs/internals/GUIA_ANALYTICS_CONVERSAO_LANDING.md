# 📊 Guia de Analytics & Métricas de Conversão da Landing Page

> Este documento detalha a arquitetura de telemetria, o funil completo de conversão e as regras de instrumentação da Landing Page oficial do **AI Second Brain** (`docs/brain-ui/landing/`).

---

## 🎯 1. Objetivo & Visão Geral

Antes desta instrumentação, existia uma **ponta cega** entre os números de visitas da Cloudflare e as métricas do GitHub (Visualizações, Clones e Estrelas). Sabia-se que a página recebia tráfego, mas não era possível identificar quais visitantes realmente demonstravam interesse em rodar o projeto ou acessar o código.

O módulo [`docs/brain-ui/landing/js/analytics.js`](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/brain-ui/landing/js/analytics.js) resolve isso através de:
1. **Captura e persistência automática de parâmetros de campanha (UTMs)**.
2. **Rastreamento de intenção em 3 níveis do funil** (Fundo, Meio e Topo).
3. **Propagação de atribuição para o GitHub**: links externos recebem automaticamente a origem (ex: `?ref=landing_linkedin`), permitindo visualização na aba *Referring Sites* do GitHub.
4. **Despachante agnóstico (Event Bus)**: compatível com Cloudflare Zaraz, GA4, Plausible, Umami e dispatch de `CustomEvent` no DOM.
5. **Zero dependências e 100% privacy-first**: sem cookies invasivos ou impacto de performance (executado com `defer`).

---

## 🌪️ 2. O Funil Completo de Conversão

```
[ Campanhas / Redes Sociais com UTMs ]
                 │
                 ▼
      [ Visita à Landing Page ]  ──►  page_view_landing
                 │
  ┌──────────────┼───────────────────────────┐
  ▼              ▼                           ▼
[ TOPO ]      [ MEIO ]                    [ FUNDO ]
Engajamento   Experimentação              Alta Intenção
(Tabs/FAQ)    (Demo / Vídeos)             (GitHub / Clone)
  │              │                           │
  ├─ tab_sem/com ├─ demo_interact (inline)   ├─ click_github_cta (Hero/Nav/Footer)
  ├─ feature_card├─ demo_interact (full)     ├─ click_github_release (v1.4.1)
  └─ faq_expand  └─ video_play (Pitch/Reels) └─ copy_install_command (git clone)
```

---

## 📋 3. Dicionário de Eventos Automatizados

### 🔴 Prioridade 1: Fundo de Funil (Alta Intenção → Repo & Instalação)
Estes são os eventos de maior valor. Devem ser correlacionados com os picos de Clones e Stars no GitHub Insights.

| Evento | Seletor HTML / Gatilho | Propriedades Enviadas | Significado de Negócio |
| :--- | :--- | :--- | :--- |
| `click_github_cta` | `a[href*="github.com/.../ai-second-brain"]` (Hero, Navbar, Rodapé) | `location` (`hero_cta`, `navbar`, `footer_final_cta`), `cta_text`, `url`, `utm_*` | Usuário decidiu abrir o repositório no GitHub para explorar ou estrelar. |
| `copy_install_command` | `<button id="copy" class="copy-btn">` | `section: 'quickstart_install'`, `has_node: true`, `utm_*` | **Maior indicador de adoção**: o desenvolvedor copiou o comando `git clone` para rodar no terminal. |
| `click_github_release` | `<a class="hero-version-pill">` | `url`, `location: 'hero_version_pill'`, `utm_*` | Interesse no changelog e notas da versão oficial. |

---

### 🟡 Prioridade 2: Meio de Funil (Experimentação & Demonstração)
Visitantes avaliando a ferramenta antes de decidir pela instalação local.

| Evento | Seletor HTML / Gatilho | Propriedades Enviadas | Significado de Negócio |
| :--- | :--- | :--- | :--- |
| `demo_interact` | `<button id="load-demo">` | `type: 'load_inline_cockpit'`, `utm_*` | Carregou o Cockpit interativo embutido no navegador. |
| `demo_interact` | `<a href="../demo/index.html">` | `type: 'open_fullscreen'`, `utm_*` | Abriu a demonstração em tela cheia para testar a interface. |
| `video_play` | `<button id="hero-video-btn">` | `video_id: 'pitch_hero_16x9'`, `format: 'modal_dialog'` | Assistiu ao vídeo de apresentação de 1 minuto (Pitch). |
| `video_play` | `#btn-memoria-persistente-video-9x16`<br>`#btn-pergunte-cerebro-video-9x16` | `video_id: 'reels_...'`, `format: 'vertical_9x16'` | Assistiu aos vídeos de demonstração em formato vertical (Reels/Shorts). |
| `video_play` | `<button id="inline-video-expand">` | `video_id: 'inline_showcase_expand'`, `format: 'expanded'` | Expandiu o vídeo do showcase para assistir com maior detalhe. |

---

### 🟢 Prioridade 3: Topo de Funil (Engajamento & Objeções)
Mede o interesse pelo conteúdo, validação de dores e dúvidas frequentes.

| Evento | Seletor HTML / Gatilho | Propriedades Enviadas | Significado de Negócio |
| :--- | :--- | :--- | :--- |
| `page_view_landing` | Carregamento inicial da página | `has_campaign` (boolean), `referrer`, `lang`, `utm_*` | Visita qualificada na landing page. |
| `problem_tab_toggle` | `<button id="tab-sem">` e `<button id="tab-com">` | `mode: 'sem'` ou `'com'`, `utm_*` | Alternou o comparador de amnésia (Com vs Sem Segundo Cérebro). |
| `feature_card_click` | `.qs-journey-card`, `[data-feature]` | `feature: '<id_do_card>'`, `utm_*` | Clicou para ver detalhes da Entrada Dual, Sabatina com IA ou Contratos. |
| `faq_question_expand` | `<div class="faq"> details summary` | `question: '<texto_da_duvida>'`, `utm_*` | Expandiu uma dúvida frequente (ex: se é grátis, requisitos de infra). |
| `language_toggle` | `<button id="lang-btn">` | `target_lang: 'en'` ou `'pt'`, `utm_*` | Mede demanda de visitantes internacionais vs Brasil. |
| `graph_3d_explore` | `#hero-explore-btn`, `#btn-explore` | `source: 'hero-explore-btn'` | Engajou com o visualizador 3D do grafo neural de neurônios. |

---

## 🏷️ 4. Padrão de Links com UTM para Redes Sociais

Analytics são estritamente sensíveis a maiúsculas e minúsculas (`LinkedIn` ≠ `linkedin`). Use sempre **minúsculas** e siga o padrão abaixo ao criar posts:

### Estrutura Recomendada:
```
https://alfredorcamara.github.io/ai-second-brain/?utm_source={REDE}&utm_medium={FORMATO}&utm_campaign={CAMPANHA}
```

### Exemplos Prontos para Copiar:

| Canal / Rede | Link Pronto para Publicação |
| :--- | :--- |
| **LinkedIn (Post Principal)** | `https://alfredorcamara.github.io/ai-second-brain/?utm_source=linkedin&utm_medium=social&utm_campaign=ai_second_brain` |
| **LinkedIn (Artigo Técnico)** | `https://alfredorcamara.github.io/ai-second-brain/?utm_source=linkedin&utm_medium=article&utm_campaign=ai_decision_gate` |
| **X / Twitter** | `https://alfredorcamara.github.io/ai-second-brain/?utm_source=twitter&utm_medium=social&utm_campaign=ai_second_brain` |
| **Reddit (r/LocalLLaMA / r/ChatGPTCoding)** | `https://alfredorcamara.github.io/ai-second-brain/?utm_source=reddit&utm_medium=community&utm_campaign=ai_second_brain` |
| **Dev.to / Artigo Blog** | `https://alfredorcamara.github.io/ai-second-brain/?utm_source=devto&utm_medium=referral&utm_campaign=ai_second_brain` |
| **WhatsApp / Mensagem Direta** | `https://alfredorcamara.github.io/ai-second-brain/?utm_source=whatsapp&utm_medium=dm&utm_campaign=ai_second_brain` |

---

## 💻 5. Como Testar & Validar Localmente (Modo Debug)

O script possui um **modo de depuração visual** que exibe os disparos diretamente no Console do navegador:

1. Abra a página com o parâmetro de debug:
   ```
   http://localhost:3000/?utm_source=linkedin&utm_medium=social&utm_campaign=teste&debug_analytics=1
   ```
   *(Em `localhost` ou `127.0.0.1`, o modo debug ativa automaticamente).*

2. Pressione **F12** e abra a aba **Console**.

3. Clique em **"Baixar no GitHub"** ou no botão **"Copiar"** do terminal. Você verá no console:
   ```text
   [Brain Analytics] 🎯 click_github_cta {
     location: "hero_cta",
     cta_text: "Baixar no GitHub",
     url: "https://github.com/alfredorcamara/ai-second-brain?ref=landing_linkedin",
     utm_source: "linkedin",
     utm_campaign: "teste"
   }
   ```

---

## 📈 6. Cruzamento com o GitHub Insights

Como o GitHub não aceita scripts de rastreamento externos, o acompanhamento deve ser feito cruzando:

1. **Volume de Cliques na Landing Page** (`click_github_cta` + `copy_install_command` no Analytics).
2. **GitHub Insights → Traffic**:
   - **Views & Unique Visitors**: compare os dias de disparo de campanhas com os picos do repositório.
   - **Referring Sites**: verifique as entradas originadas em `alfredorcamara.github.io` ou `ref=landing_linkedin`.
   - **Git Clones & Unique Cloners**: meça a taxa de conversão final entre quem clicou em `copy_install_command` na landing page e os clones reais no Git.
