# Especificação Oficial: Template de Artigos do Blog (Design System & Arquitetura Bilíngue)

> **Status:** Canônico / Golden Master (v1.5.0)  
> **Referências Oficiais de Código:**  
> - 🇧🇷 Versão PT: [`AI_SECOND_BRAIN-SITE/blog/pt/quando-nao-usar-llm.html`](../../../AI_SECOND_BRAIN-SITE/blog/pt/quando-nao-usar-llm.html)  
> - 🇺🇸 Versão EN: [`AI_SECOND_BRAIN-SITE/blog/en/when-not-to-use-llms.html`](../../../AI_SECOND_BRAIN-SITE/blog/en/when-not-to-use-llms.html)  
> **Escopo:** Exclusivo do site/landing page (`AI_SECOND_BRAIN-SITE/blog/`). Não faz parte do pacote de distribuição de código que os desenvolvedores baixam no produto central.  
> **Localização:** Memória interna de construção da solução, em `AI_SECOND_BRAIN/docs/internals/` (excluída de ZIP/releases via `export-ignore` no `.gitattributes`). Esta é a **única fonte de verdade**; o `AI_SECOND_BRAIN-SITE/AGENTS.md` apenas aponta para cá.

---

## 1. Visão Geral e Arquitetura Multilíngue

Todos os artigos do blog do **AI Second Brain** seguem um modelo **híbrido e bilíngue**:
1. **Identidade Global do Site:** Compartilham estritamente o mesmo cabeçalho (`<nav class="nav">`), sistema de cores cósmico (*Dark Cosmos*), tipografia oficial (*Outfit*, *Playfair Display*, *JetBrains Mono*) e rodapé padronizado (`<footer>`).
2. **Separação Canônica por Idioma (`/pt/` e `/en/`):** Os artigos em português residem em `blog/pt/` e as versões traduzidas para o inglês em `blog/en/`. A raiz `blog/index.html` atua como um **roteador cliente de alta velocidade** que lê o `localStorage('asb-lang')` e o `navigator.language` para despachar o usuário imediatamente ao hub correto.
3. **Alternância Recíproca e Preservação de Navegação (`PT ⇄ EN`):** O seletor no cabeçalho inspeciona as tags `<link rel="alternate" hreflang="...">` do documento e troca de página instantaneamente para o artigo correspondente no outro idioma, funcionando de forma transparente tanto no GitHub Pages quanto ao navegar em arquivos locais (`file:///`).
4. **Experiência Interativa Rica:** Incorporam elementos visuais dinâmicos (fundo de partículas em canvas, caixas de diálogo simuladas, fluxogramas SVG com traços luminosos, números com contagem dinâmica, digitação de terminal e checklists elegantes).

---

## 2. Mapa dos 8 Artigos Canônicos (Mapeamento PT ⇄ EN)

| # | Artigo em Português (`blog/pt/`) | Artigo em Inglês (`blog/en/`) |
|---|---|---|
| 1 | `zero-ms-custo-zero.html` | `zero-ms-and-zero-cost.html` |
| 2 | `quando-nao-usar-llm.html` | `when-not-to-use-llms.html` |
| 3 | `por-que-vibe-coding-morre.html` | `why-vibe-coding-dies.html` |
| 4 | `document-rot-risco-segundo-cerebro.html` | `document-rot-second-brain.html` |
| 5 | `seu-agente-de-ia-tem-amnesia.html` | `does-your-ai-agent-have-amnesia.html` |
| 6 | `conhecimento-e-acao-duas-camadas.html` | `knowledge-and-action-two-layers.html` |
| 7 | `pesquisa-com-ia-que-retoma-de-onde-parou.html` | `resilient-ai-research-resuming-jobs.html` |
| 8 | `research-lab-documentacao-tecnica.html` | `research-lab-self-writing-documentation.html` |
| Hub | `index.html` | `index.html` |

---

## 3. Anatomia Estrutural Obrigatória (DOM Tree)

Todo novo arquivo de artigo `.html` criado nas pastas `blog/pt/` ou `blog/en/` DEVE seguir rigorosamente esta árvore de tags:

```html
<!DOCTYPE html>
<html lang="pt-BR"> <!-- ou lang="en" para a pasta en/ -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>[Título do Artigo com Destaque] — AI Second Brain</title>
  <meta name="description" content="[Descrição concisa para SEO e redes sociais]">
  <link rel="icon" href="../../assets/favicon.svg">

  <!-- Links canônicos e alternados recíprocos OBRIGATÓRIOS -->
  <link rel="canonical" href="https://alfredorcamara.github.io/ai-second-brain-site/blog/pt/[slug-pt].html">
  <link rel="alternate" hreflang="pt-BR" href="https://alfredorcamara.github.io/ai-second-brain-site/blog/pt/[slug-pt].html">
  <link rel="alternate" hreflang="en" href="https://alfredorcamara.github.io/ai-second-brain-site/blog/en/[slug-en].html">
  <meta name="theme-color" content="#03060f">

  <!-- OpenGraph / Social Meta Tags (OBRIGATÓRIO) -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="[Título persuasivo do artigo]">
  <meta property="og:description" content="[Descrição concisa e instigante de 1-2 linhas]">
  <meta property="og:image" content="https://alfredorcamara.github.io/ai-second-brain-site/assets/banner-grafo-3d.webp">
  <meta property="og:url" content="https://alfredorcamara.github.io/ai-second-brain-site/blog/pt/[slug-pt].html">
  <meta property="og:site_name" content="AI Second Brain">
  <meta property="og:locale" content="pt_BR"> <!-- no EN: en_US -->

  <!-- Twitter Cards (OBRIGATÓRIO) -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="[Título direto para Twitter/X]">
  <meta name="twitter:description" content="[Descrição concisa para Twitter/X]">
  <meta name="twitter:image" content="https://alfredorcamara.github.io/ai-second-brain-site/assets/banner-grafo-3d.webp">

  <!-- Fontes Google: Outfit, Playfair Display, JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <!-- Stylesheets Obrigatórios com caminhos relativos de 2 níveis: -->
  <link rel="stylesheet" href="../../css/landing.css">
  <link rel="stylesheet" href="../../css/extra.css">
  <link rel="stylesheet" href="../blog.css">

  <style>
    /* Estilos escopados exclusivamente para os componentes visuais do artigo */
  </style>
</head>
<body>

  <!-- 1. NAVBAR PADRÃO DO SITE -->
  <nav class="nav">
    <a class="brand" href="../../index.html" aria-label="AI Second Brain">
      <img src="../../assets/ai-second-brain-logo-animado.svg" alt="AI Second Brain Logo" class="brand-brain-img" width="165" height="90">
    </a>
    <div class="links">
      <a href="../../index.html">Início</a> <!-- ou Home -->
      <a href="index.html" style="color: var(--gold);">← Blog &amp; Artigos</a>
      <a href="../../demo/index.html" target="_blank" rel="noopener">Demo 3D</a>
      <button class="lang-btn" id="lang-btn" type="button" title="Alternar idioma / Switch language (PT ⇄ EN)" data-no-i18n>
        <span class="lang-globe">🌐</span>
        <span class="lang-opt active" data-lang-opt="pt">PT</span>
        <span class="lang-sep">|</span>
        <span class="lang-opt" data-lang-opt="en">EN</span>
      </button>
      <a class="btn sm star-nav-btn" href="https://github.com/alfredorcamara/ai-second-brain" target="_blank" rel="noopener">⭐ Star no GitHub</a>
    </div>
  </nav>

  <!-- 2. CANVAS DE PARTÍCULAS EM SEGUNDO PLANO -->
  <div class="canvas-bg-wrapper" aria-hidden="true">
    <canvas id="cv"></canvas>
  </div>

  <!-- 3. CONTEÚDO DO ARTIGO -->
  <main class="article-page">
    <article class="article-shell">

      <!-- 3.1. BREADCRUMBS -->
      <nav class="article-breadcrumbs" aria-label="Navegação estrutural">
        <a href="../../index.html">Início</a>
        <span class="sep">/</span>
        <a href="index.html">Blog</a>
        <span class="sep">/</span>
        <span class="current">[Categoria]</span>
      </nav>

      <!-- 3.2. CABEÇALHO DO ARTIGO -->
      <header class="article-header">
        <span class="article-badge">[Categoria] · [X] min de leitura</span>
        <h1 class="article-title">[Texto inicial] <em>[Palavra ou Expressão de Maior Impacto em #e8b84b]</em> [Restante do título]</h1>
        <p class="article-lead">[Subtítulo / Lead Explicativo de 2 linhas]</p>
        <div class="article-author-row">
          <div class="author-info">
            <div class="creator-avatar sm">
              <img src="https://github.com/alfredorcamara.png" alt="Alfredo R. Câmara" loading="lazy" onerror="this.style.display='none'">
              <div class="creator-avatar-fallback">AC</div>
            </div>
            <div class="author-details">
              <span class="author-name">Alfredo R. Câmara</span>
              <span class="author-role">Criador do AI Second Brain</span>
            </div>
          </div>
          <div class="article-specs">
            <span>📅 [Data de Publicação]</span>
            <span>·</span>
            <span>⚡ [Sub-tema ou Tecnologia]</span>
          </div>
        </div>
      </header>

      <!-- 3.3. BARRA DE AÇÃO (COPIAR TEXTO) -->
      <div class="article-action-row">
        <button id="cp" class="copy-article-btn" type="button">📋 Copiar texto do artigo</button>
      </div>

      <!-- 3.4. CORPO DO ARTIGO -->
      <div class="article-body" id="art">
        <!-- Parágrafos, Grids, Chats, SVGs, Barras, Stats, Código, Checklist, Citações -->
      </div>

      <!-- 3.5. CARD DE BIO DO AUTOR -->
      <section class="article-bio-card">
        <!-- Foto, Descrição, Links GitHub e LinkedIn -->
      </section>

      <!-- 3.6. NAVEGAÇÃO ENTRE ARTIGOS -->
      <nav class="article-navigation" aria-label="Outros artigos">
        <!-- Próximo Artigo e Veja Também -->
      </nav>

      <!-- 3.7. CARD DE CTA FINAL (POSICIONADO ABAIXO DA NAVEGAÇÃO) -->
      <section class="article-cta-box rv">
        <img class="cta-logo" src="../../assets/ai-second-brain-logo-animado.svg" alt="AI Second Brain" width="210" height="115">
        <h3 class="cta-title">Conheça o AI Second Brain</h3>
        <p class="cta-desc">[Chamada para ação]</p>
        <div class="cta-buttons">
          <a class="cta-btn primary" href="../../demo/index.html" target="_blank" rel="noopener">🌐 Abrir Demo 3D ao Vivo</a>
          <a class="cta-btn secondary" href="https://github.com/alfredorcamara/ai-second-brain" target="_blank" rel="noopener">⭐ Ver no GitHub</a>
        </div>
        <div class="cta-au">
          Criado e mantido com paixão por <strong>Alfredo R. Câmara</strong> (<a href="https://github.com/alfredorcamara" target="_blank" rel="noopener">@alfredorcamara</a> · <a href="https://www.linkedin.com/in/alfredo-rodrigues-c%C3%A2mara-0a564162/" target="_blank" rel="noopener">LinkedIn</a>)<br>
          <em>Transformando agentes de IA em engenheiros de software sêniores com memória viva e governança contínua.</em>
        </div>
      </section>

      <!-- 3.8. HASHTAGS -->
      <p class="tags">
        #InteligenciaArtificial #AgentesDeIA #EngenhariaDeSoftware #LLM #DevTools #Arquitetura #Cursor #ClaudeCode
      </p>

    </article>
  </main>

  <!-- 4. RODAPÉ OFICIAL DO SITE (PADRÃO CONSOLIDADO) -->
  <footer>
    <div class="footer-links">
      <a href="../../index.html">Início</a> <!-- no EN: Home -->
      <a href="index.html">Blog</a>
      <a href="../../demo/index.html" target="_blank" rel="noopener">Demo 3D</a>
      <a href="https://github.com/alfredorcamara/ai-second-brain/issues" target="_blank" rel="noopener">Issues</a>
      <a href="https://github.com/alfredorcamara/ai-second-brain/discussions" target="_blank" rel="noopener">Discussões</a>
      <a href="../../index.html#faq">FAQ</a>
      <a href="https://github.com/alfredorcamara" target="_blank" rel="noopener">Criador: Alfredo R. Câmara</a>
    </div>
    <div class="footer-content">
      <span>AI Second Brain — O Sistema Operacional de Memória para Agentes de IA</span>
      <span class="footer-sep">·</span>
      <span>Criado por <a href="https://github.com/alfredorcamara" target="_blank" rel="noopener" class="footer-author">Alfredo R. Câmara</a></span>
      <span class="footer-sep">·</span>
      <span>Código Aberto sob Licença FSL-1.1-MIT</span>
    </div>
  </footer>

  <!-- 5. SCRIPTS INTERATIVOS, I18N E DADOS DO AUTOR -->
  <script src="../../js/i18n.dict.js"></script>
  <script src="../../js/i18n.js"></script>
  <script src="../author.js"></script>
  <script>/* Canvas de partículas, IntersectionObserver, Contadores, Clipboard */</script>
</body>
</html>
```

---

## 4. Catálogo de Componentes Interativos

### 4.1. Caixas de Conversa Animadas (`.chats`)
Utilizadas para contrastar cenários (ex.: *"Sem Segundo Cérebro"* vs *"Com AI Second Brain"*).
```html
<div class="chats">
  <div class="chat bad rv">
    <h4>Sem Segundo Cérebro (LLM Ingênuo)</h4>
    <div class="m u" style="--i:0">“Pergunta do usuário...”</div>
    <div class="m a" style="--i:1">“Resposta com alto custo e esquecimento...”</div>
    <div class="res" style="color:#f87171">⚠️ Métrica negativa ou alerta de perda.</div>
  </div>
  <div class="chat good rv">
    <h4>Com AI Second Brain</h4>
    <div class="m u" style="--i:0">“Pergunta do usuário...”</div>
    <div class="m a" style="--i:1">“Execução precisa com memória e 0 ms...”</div>
    <div class="res" style="color:#4ade80">✨ Métrica positiva ou ganho tangível.</div>
  </div>
</div>
```

### 4.2. Checklist Compacto em Linhas (`ul.ck`)
Linhas limpas com separador horizontal e ícone `✓` no amarelo/dourado oficial (`var(--gold)`):
```html
<ul class="ck rv">
  <li>Item 1 com explicação clara?</li>
  <li>Item 2 usando a interface <code>NomeDaInterface</code>?</li>
</ul>
```
**Regra CSS crítica:** Deve usar `margin: 0 !important; padding: 6px 0 6px 26px !important;` para evitar que a regra genérica de listas do blog espaçe excessivamente as linhas.

### 4.3. Citação de Impacto (`<blockquote>`)
Frase forte de fechamento com borda lateral amarela e texto em negrito itálico:
```html
<blockquote class="rv">
  <strong>Saber quando não chamar um modelo é uma disciplina de engenharia, não uma limitação.</strong>
</blockquote>
```

### 4.4. Estatísticas com Contadores Dinâmicos (`.stats`)
Contam automaticamente de 0 até o número alvo via JavaScript `IntersectionObserver`:
```html
<div class="stats rv">
  <div><b data-n="3">0</b>faixas de execução</div>
  <div><b data-n="0">0</b>ms nos casos conhecidos</div>
</div>
```

### 4.5. Terminal com Digitação Datilografada (`.code`)
Simula comandos de terminal sendo digitados caractere por caractere ou linhas de log sequenciais:
```html
<div class="code rv">
  <pre><span class="ty" style="--w:38ch">agy brain status --project meu-saas</span></pre>
</div>
```

### 4.6. Card de Conversão Final (`.article-cta-box`)
* **Fundo:** Escuro sólido cósmico (`#02040a`), sem degradês claros.
* **Disposição:** Vertical (`flex-direction: column !important; align-items: center !important; text-align: center !important;`).
* **Logo:** Oficial animado (`../../assets/ai-second-brain-logo-animado.svg`), largura `210px`, centralizado no topo.
* **Título e Texto:** Centralizados verticalmente abaixo do logo (nunca em linha lateral).
* **Posição na página:** Localizado **abaixo da navegação de artigos** (`article-navigation`).

### 4.7. Destaque Visual Obrigatório no Título do Artigo (`.article-title em`)
No título principal de todo artigo (`<h1 class="article-title">`), a palavra-chave ou a expressão que representa o ponto de maior tensão, curiosidade ou tese central **DEVE obrigatoriamente estar envolvida pela tag `<em>`**.
* **Cor Canônica de Destaque:** `#e8b84b` (dourado/âmbar cósmico oficial).
* **Estilização CSS:** `color: #e8b84b; font-style: italic;` (já implementada nativamente em `blog.css`).
* **Exemplos de aplicação nos títulos:**
  * `Quando <em>NÃO</em> usar LLM: o portão de decisão que poupa tokens e latência`
  * `Por que o vibe coding <em>costuma morrer</em> aos 3 meses`
  * `<em>0 ms e custo zero</em>: as tarefas que você não deveria mandar para uma IA`
  * `Document rot: o risco que pode <em>matar qualquer segundo cérebro</em> e as 3 defesas que adotei`
  * `Research Lab: a documentação técnica que <em>se escreve sozinha</em>`

### 4.8. Centralização dos Dados do Autor (`author.json` + `author.js`)
Para evitar a necessidade de editar dezenas de arquivos HTML ao atualizar a biografia do criador, os dados residem centralizados em:
* **`AI_SECOND_BRAIN-SITE/blog/author.json`**: Fonte da verdade em formato estruturado (nome, links, bio em PT e EN).
* **`AI_SECOND_BRAIN-SITE/blog/author.js`**: Loader leve que expõe `window.AUTHOR_DATA` e hidrata automaticamente em tempo de execução os elementos `<p class="author-bio" data-author-bio>`. Funciona 100% livre de bloqueios de CORS tanto na web (GitHub Pages) quanto ao abrir localmente via `file:///`.
* **`AI_SECOND_BRAIN-SITE/blog/sync-author.js`**: Script utilitário executável via `node AI_SECOND_BRAIN-SITE/blog/sync-author.js` para propagar atualizações de `author.json` diretamente para `author.js` e para o HTML estático de todos os 16 artigos (assegurando SEO impecável e zero layout shift).

### 4.9. Metatags Sociais Obrigatórias (Open Graph & Twitter Cards)
Todo artigo gerado DEVE conter o bloco completo de metadados sociais para garantir que, ao ser compartilhado no LinkedIn, X/Twitter, Facebook ou WhatsApp, exiba automaticamente seu título, resumo e imagem de capa oficial:
* **`og:type`**: Sempre `"article"`.
* **`og:title` & `twitter:title`**: Título instigante e direto.
* **`og:description` & `twitter:description`**: Resumo magnético de 1 a 2 frases.
* **`og:image` & `twitter:image`**: **URL absoluta obrigatória** apontando para o banner oficial:  
  `https://alfredorcamara.github.io/ai-second-brain-site/assets/banner-grafo-3d.webp`
* **`og:url`**: URL canônica completa do artigo.
* **`og:site_name`**: `"AI Second Brain"`.
* **`og:locale`**: `"pt_BR"` para artigos na pasta `blog/pt/` e `"en_US"` para artigos na pasta `blog/en/`.
* **`twitter:card`**: Sempre `"summary_large_image"`.
* **Script Utilitário de Lote:** O script `AI_SECOND_BRAIN-SITE/blog/update-og-meta.js` audita e sincroniza em lote as metatags de todos os artigos e hubs. O gerador de artigos do AI Second Brain deve incorporar essas tags nativamente na geração de cada novo artigo.

---

## 5. Lições Aprendidas & O Que NUNCA Fazer (Anti-Patterns)

| Anti-Pattern (O que NUNCA fazer) | Efeito Indesejado | Solução Canônica Obrigatória |
| :--- | :--- | :--- |
| ❌ Usar URLs relativas em `og:image` (ex.: `../assets/og-image.png`) | Redes sociais (LinkedIn, Twitter, WhatsApp) não carregam imagens relativas e o card fica sem capa. | Usar sempre URL absoluta: `https://alfredorcamara.github.io/ai-second-brain-site/assets/banner-grafo-3d.webp`. |
| ❌ Omitir `og:url` ou `og:locale` | Prejudica a prévia no LinkedIn e pode forçar idioma errado na pré-visualização. | Incluir sempre `og:url` absoluto e `og:locale` correspondente (`pt_BR` ou `en_US`). |
| ❌ Deixar o título sem termo em destaque com `<em>` | Título monocromático, sem hierarquia visual e perde o gancho de curiosidade. | Envolver a palavra-chave mais impactante em `<em>`, recebendo `#e8b84b`. |
| ❌ Misturar arquivos PT e EN na mesma pasta `blog/` | Quebra o roteamento por idioma e polui URLs. | Colocar artigos PT em `blog/pt/` e artigos EN em `blog/en/`. |
| ❌ Usar caminhos relativos de 1 nível (`../assets/`) dentro de subpastas de idioma | Quebra imagens, folhas de estilo e scripts (`404 Not Found`). | Em `blog/pt/` e `blog/en/`, use sempre 2 níveis: `../../assets/`, `../../css/`, `../blog.css`. |
| ❌ Esquecer as tags `<link rel="alternate">` | Impede SEO internacional e quebra a alternância do botão `PT ⇄ EN`. | Declarar sempre as tags recíprocas com `hreflang="pt-BR"` e `hreflang="en"`. |
| ❌ Adicionar estilos globais em `body .nav` ou `body { font-family: Georgia }` | Quebra a barra superior do site, distorce logos e fontes dos botões. | Deixar a `.nav` governada 100% por `landing.css` e `blog.css`. |
| ❌ Usar a classe genérica `.cta` no card final | Conflita com o flexbox global da landing page, empurrando o logo para a esquerda e o texto para a direita. | Usar sempre a classe escopada `.article-cta-box`. |
| ❌ Injetar SVGs em Base64 de 30KB | Incha o HTML e causa estouro de largura (1200px na tela). | Usar sempre a tag `<img>` referenciando `../../assets/ai-second-brain-logo-animado.svg`. |
| ❌ Deixar a lista `ul.ck` sem `margin: 0 !important` | Cria um vão vertical exagerado entre as linhas por herança de `.article-body li`. | Aplicar o CSS compacto oficial com `margin: 0 !important; padding: 6px 0 !important`. |
| ❌ Colocar `target="_blank"` nos links internos dos artigos | Abre nova aba desnecessariamente a cada clique em artigos. | Artigos abrem na mesma aba. Apenas **Demo 3D** e **GitHub** usam `target="_blank"`. |
| ❌ Colocar o CTA dentro do texto do artigo | Quebra o fluxo de leitura antes da bio e navegação de próximos artigos. | Posicionar o `.article-cta-box` logo após o `article-navigation`. |
| ❌ Omitir ou alterar a estrutura do rodapé | Despadroniza a experiência em relação ao resto da plataforma. | Seguir rigorosamente o padrão de 2 linhas (`footer-links` e `footer-content`). |
