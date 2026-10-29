# GUIA TÉCNICO: PADRONIZAÇÃO DE CARDS COM VÍDEO CINEMÁTICO NO CABEÇALHO

> **Propósito deste documento**: Definir o Procedimento Operacional Padrão (SOP) para transformar qualquer um dos 9 cards da seção `#vantagens` ("Superpoderes do Sistema") da Landing Page do **AI Second Brain** em um card com cabeçalho de vídeo cinemático em loop de alto brilho, alta legibilidade e ultra-otimização de performance, sincronizado com o modal de detalhes técnicos (`#feature-modal`).
> 
> **Regra de Acionamento**: Quando o usuário solicitar:  
> *"Faça o mesmo trabalho para o card X (nome do card)"* ou *"Aplique o padrão de vídeo no card X"*, siga rigorosamente os 4 passos deste guia.

---

## 1. Visão Geral da Arquitetura Visual do Card

O padrão estabelecido no **Card 1 ("Memória Persistente Real")** e aprovado pelo desenvolvedor possui a seguinte anatomia:

```
┌─────────────────────────────────────────────────────────────┐
│ .card.card-video-featured                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ .card-video-header (altura fixa: 195px)                 │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ <video class="card-video-media" autoplay loop ...>  │ │ │
│ │ │ (Vídeo 400x224, 100% nítido, contrast=1.2, sat=1.35) │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ .card-video-header-overlay (gradiente escuro na base)   │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ .card-video-header-content (sobreposto ao vídeo)    │ │ │
│ │ │  • .card-video-badge (Pill com dot bioluminescente) │ │ │
│ │ │  • <h3>Título da Funcionalidade</h3>                │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ .card-video-body (padding: 20px 24px 24px)              │ │
│ │  • <p>Texto descritivo factual da funcionalidade</p>    │ │
│ │  • .card-more-btn ("Ver arquitetura detalhada ↗")      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Anatomia do Cabeçalho do Modal com Vídeo (`.feature-modal-header.has-video`)

Quando o modal expande um card que possui vídeo, o cabeçalho adota regras estritas de layout:

1. **Sem Ícone à Esquerda**: O container de ícone (`.feature-modal-icon-stage`) é **ocultado** (`display: none !important`), pois o vídeo de fundo panorâmico já é o herói visual.
2. **Texto Alinhado à Esquerda**: O bloco textual (`.feature-modal-header-text`) inicia diretamente na margem esquerda (onde antes ficava o ícone), aproveitando toda a largura do banner.
3. **Botão Fechar (`✕`) Fixo no Topo Direito**: O botão `.feature-modal-close` permanece estritamente fixo no canto superior direito (`position: absolute; top: 22px; right: 24px; z-index: 10;`), idêntico à referência dos cards estáticos.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ .feature-modal-header.has-video                                 [ ✕ Topo ]  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ [Vídeo Panorâmico 800x250 em loop silencioso de fundo (opacity: 0.85)]  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│  [DOT] BADGE DA FUNCIONALIDADE                                              │
│  Título da Funcionalidade (Inicia alinhado à esquerda, sem ícone)           │
│  Subtítulo explicativo factual ocupando toda a largura útil                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mapa dos 9 Cards da Bento Grid (`#vantagens`)

Cada card possui um identificador único no DOM (`data-feature`) e no JavaScript (`FEATURES_DATA[i].id`), acompanhado de sua cor temática e do seu papel no sistema:

| # | `id` / `data-feature` | Título do Card | Cor Temática (`--c`) | Tag Sugerida para o Cabeçalho |
|---|---|---|---|---|
| **01** | `memoria-persistente` | Memória Persistente Real | `#38bdf8` (Cyan) | `Memória Neural Ativa` *(Concluído)* |
| **02** | `session-capture` | Session Capture com IA | `#10b981` (Esmeralda) | `Automação & Ciclo Git` *(Concluído)* |
| **03** | `decision-gate` | AI Decision Gate & Motor JEV | `#a3e635` (Verde Limão) | `Zero Tokens / 0ms` *(Concluído)* |
| **04** | `prompt-bootstrap` | Prompt Bootstrap & Workspace | `#6366f1` (Índigo) | `Context Injection` *(Concluído)* |
| **05** | `governanca-owasp` | Governança & OWASP | `rgb(113, 175, 255)` (Azul Neon) | `Segurança & Anti-Leak` *(Concluído)* |
| **06** | `agnostico-stack` | 100% Agnóstico de Stack | `#ffc76b` (Âmbar/Dourado) | `Universal / Multi-Stack` *(Concluído)* |
| **07** | `zero-lock-in` | Zero Lock-In (Puro Markdown) | `#22d3ee` (Ciano Neon / Turquesa) | `Git & Open Formats` *(Concluído)* |
| **08** | `grafo-3d` | Grafo Espacial 3D Vivo | `#c084fc` (Púrpura/Violeta) | `Neurônios & Sinapses 3D` *(Concluído)* |
| **09** | `pergunte-cerebro` | Pergunte ao Cérebro (Ctrl+K) | `rgb(72, 102, 236)` (Azul Brilhante) | `Busca Semântica & BYOK` *(Concluído)* |

---

## 3. Procedimento Operacional Passo a Passo

Ao receber o comando para aplicar o vídeo em um card específico (ex: `card-2`, `session-capture`), execute as 4 etapas sequenciais:

---

### ETAPA 1: Otimização Extrema de Vídeo com FFmpeg

> [!IMPORTANT]
> **Regra de Ouro da Performance, Duração & Compressão**:
> 1. **Duração Máxima**: Os vídeos devem ter no **máximo 5 segundos de duração** (`-t 5`). Loops concisos de 3 a 5 segundos transmitem a essência do recurso visual sem consumir CPU, VRAM ou largura de banda desnecessárias.
> 2. **Resolução 1:1**: Nunca use vídeos em resolução Full HD (1080p) ou arquivos acima de 500 KB para elementos decorativos de UI. Reduza a resolução para bater 1:1 com a área de visualização em tela.
> 3. **Compressão H.264 de Alta Precisão via FFmpeg**: Deve ser aplicada obrigatoriamente a compressão H.264 de alta precisão via FFmpeg (`libx264`, preset `slow`, `yuv420p` e `+faststart`). Esse padrão elimina overhead de CPU, ativa a aceleração nativa de hardware da GPU nos navegadores e impede travamentos em tela cheia.

### Automação Rápida via Python (`scripts/optimize_card_videos.py`)

Para não precisar rodar comandos manuais de FFmpeg, utilize o script oficial. Ele gera o trio de arquivos padronizados (`<nome>-card.mp4`, `<nome>-modal.mp4`, `<nome>-poster.jpg`), **salva por padrão na mesma pasta do vídeo original** e possui as opções de nome personalizado e `--landing`:

```bash
# 1. Processar com o NOME ORIGINAL (salva na mesma pasta do vídeo):
python scripts/optimize_card_videos.py "C:/Users/alfre/Downloads/meu_video.mp4"

# 2. Processar indicando um NOME PERSONALIZADO (ex: prompt-bootstrap):
#    Gera automaticamente: prompt-bootstrap-card.mp4, prompt-bootstrap-modal.mp4, prompt-bootstrap-poster.jpg
python scripts/optimize_card_videos.py "Video Project 9.mp4" "prompt-bootstrap"
# ou usando a flag -n:
python scripts/optimize_card_videos.py "Video Project 9.mp4" -n "prompt-bootstrap"

# 3. Processar com nome personalizado e salvar DIRETO na Landing Page:
python scripts/optimize_card_videos.py "Video Project 9.mp4" "prompt-bootstrap" --landing

# 4. Processar TODOS os vídeos da pasta atual de uma vez (salva na própria pasta):
python scripts/optimize_card_videos.py --batch
python scripts/optimize_card_videos.py --batch --landing
```

---

### Execução Manual via FFmpeg (Comandos de Referência)

Caso prefira rodar os comandos individualmente no **PowerShell**, execute os 3 passos:

#### 1.1. Vídeo do Card (`<nome>-card.mp4`):
* **Duração**: Máximo **5 segundos** (`-t 5`).
* **Dimensões**: `400x224` (proporção 16:9 ajustada para o cabeçalho do card de ~350x195px).
* **Filtros**: Realce sutil de contraste (`1.25`), brilho (`+0.03`) e saturação (`1.35`) para o vídeo brilhar intensamente no tema escuro.
* **Comando PowerShell**:
```powershell
ffmpeg -y -ss 00:00:00 -i "caminho/do/video-origem.mp4" -t 5 -vf "scale=400:224,eq=contrast=1.25:brightness=0.03:saturation=1.35" -an -c:v libx264 -crf 27 -preset slow -movflags +faststart "docs/brain-ui/landing/assets/video/<nome>-card.mp4"
```
* **Tamanho esperado**: **~90 KB a 180 KB**.

#### 1.2. Vídeo do Cabeçalho do Modal (`<nome>-modal.mp4`):
* **Duração**: Máximo **5 segundos** (`-t 5`).
* **Dimensões**: `800x250` (formato panorâmico widescreen 3.2:1 para encaixar no cabeçalho do modal sem desperdício de pixels verticais).
* **Crop inteligente**: Cortar verticalmente no centro da ação visual antes de escalar (`crop=in_w:in_w*(250/800):0:(in_h-(in_w*(250/800)))/2`).
* **Comando PowerShell**:
```powershell
ffmpeg -y -ss 00:00:00 -i "caminho/do/video-origem.mp4" -t 5 -vf "crop=in_w:in_w*(250/800):0:(in_h-(in_w*(250/800)))/2,scale=800:250,eq=contrast=1.22:brightness=0.03:saturation=1.3" -an -c:v libx264 -crf 26 -preset slow -movflags +faststart "docs/brain-ui/landing/assets/video/<nome>-modal.mp4"
```
* **Tamanho esperado**: **~280 KB a 480 KB**.

#### 1.3. Poster Frame (`<nome>-poster.jpg`):
* **Dimensões**: `400x224` (evita tela preta ou flash antes do primeiro frame do vídeo carregar).
* **Comando PowerShell**:
```powershell
ffmpeg -y -i "docs/brain-ui/landing/assets/video/<nome>-card.mp4" -ss 00:00:02 -vframes 1 -q:v 3 "docs/brain-ui/landing/assets/video/<nome>-poster.jpg"
```
* **Tamanho esperado**: **~10 KB a 15 KB**.

---

### ETAPA 2: Atualização do HTML (`index.html`)

No arquivo `docs/brain-ui/landing/index.html`, localize o card alvo na seção `<section class="sec" id="vantagens">` através de `data-feature="<id-do-card>"` e substitua sua estrutura interna:

#### Código a Inserir no Card:
```html
<div class="card card-video-featured rv" data-feature="<id-do-card>" tabindex="0" role="button" aria-haspopup="dialog" aria-label="Ver detalhes de <Nome do Card>">
  <div class="card-video-header">
    <div class="card-video-media-wrap">
      <video class="card-video-media" autoplay loop muted playsinline preload="auto" poster="assets/video/<nome>-poster.jpg">
        <source src="assets/video/<nome>-card.mp4" type="video/mp4">
      </video>
      <div class="card-video-header-overlay"></div>
    </div>
    <div class="card-video-header-content">
      <div class="card-video-badge" style="color: <cor-hex>; border-color: color-mix(in srgb, <cor-hex> 40%, transparent);">
        <span class="card-video-badge-dot" style="background: <cor-hex>; box-shadow: 0 0 8px <cor-hex>;"></span>
        <span><Texto da Tag></span>
      </div>
      <h3><Título do Card></h3>
    </div>
  </div>
  <div class="card-video-body">
    <p><Texto descritivo factual></p>
    <div class="card-more-btn"><span>Ver arquitetura detalhada</span> <i>↗</i></div>
  </div>
</div>
```

#### 2.1. Extensão Opcional: Ações Duplas no Rodapé (Botão de Vídeo Vertical 9:16)
Quando o card dispuser de uma demonstração prática gravada em formato vertical 9:16 (como o **Card 09 "Pergunte ao Cérebro"** com `pergunte-cerebro-card-promo-9x16.mp4`), o rodapé `.card-video-body` utiliza o contêiner de ações duplas `.card-footer-actions`:

```html
<div class="card-footer-actions">
  <div class="card-more-btn"><span>Ver arquitetura</span> <i>↗</i></div>
  <button type="button" class="card-video-9x16-btn" id="btn-<nome>-video-9x16"
    data-video-src="assets/video/<nome>-promo-9x16.mp4"
    data-video-poster="assets/video/<nome>-promo-poster.jpg"
    aria-label="Assistir demonstração rápida em vídeo 9:16">
    <span class="btn-video-icon">▶</span>
    <span>Vídeo Demo (9:16)</span>
  </button>
</div>
```

* **Prevenção de Conflito de Cliques**: No `features-modal.js`, a rotina `initCards` verifica se o clique/tecla teve origem no botão `.card-video-9x16-btn`, prevenindo o borbulhamento (`stopPropagation`) para que o modal técnico de arquitetura não seja acionado conjuntamente. O botão aciona com exclusividade o modal vertical `#promo-video-modal-9x16`.

---

### ETAPA 3: Registro do Vídeo no Modal (`features-modal.js`)

No arquivo `docs/brain-ui/landing/js/features-modal.js`, atualize a entrada do card correspondente no array `FEATURES_DATA`:

```javascript
{
  id: '<id-do-card>',
  color: '<cor-hex>',
  hasHeaderVideo: true,
  headerVideoSrc: 'assets/video/<nome>-modal.mp4',
  headerVideoPoster: 'assets/video/<nome>-poster.jpg',
  // ... restantes dos campos (badge, title, tagline, whatItIs, howItWorks, realFiles, metrics, codeSnippet)
}
```

E garanta que na função `renderFeature(index)`, caso `f.hasHeaderVideo` seja verdadeiro, a fonte do vídeo do modal seja atualizada dinamicamente para o arquivo específico do card em exibição:

```javascript
if (headerVideoBg && headerVideo) {
  if (f.hasHeaderVideo && f.headerVideoSrc) {
    headerVideoBg.style.display = 'block';
    if (headerEl) headerEl.classList.add('has-video');
    const sourceEl = headerVideo.querySelector('source');
    if (sourceEl && sourceEl.getAttribute('src') !== f.headerVideoSrc) {
      sourceEl.setAttribute('src', f.headerVideoSrc);
      if (f.headerVideoPoster) headerVideo.setAttribute('poster', f.headerVideoPoster);
      headerVideo.load();
    }
    headerVideo.currentTime = 0;
    headerVideo.play().catch(() => {});
  } else {
    headerVideoBg.style.display = 'none';
    if (headerEl) headerEl.classList.remove('has-video');
    headerVideo.pause();
  }
}
```

#### 3.1. Regras de CSS Mandatórias do Cabeçalho do Modal (`extra.css`):
Para garantir que o cabeçalho fique limpo e com o botão de fechar no local correto, as seguintes regras em `css/extra.css` devem ser mantidas:

```css
/* Cabeçalho do Modal no modo com vídeo */
.feature-modal-header.has-video .feature-modal-header-main {
  position: relative;
  z-index: 2;
  gap: 0; /* Remove o espaçamento do ícone ausente */
}

/* 1. Remove o ícone à esquerda (o vídeo já é o herói visual) */
.feature-modal-header.has-video .feature-modal-icon-stage {
  display: none !important;
}

/* 2. Texto inicia alinhado à esquerda na posição original do ícone */
.feature-modal-header.has-video .feature-modal-header-text {
  padding-left: 0;
}

/* 3. Botão Fechar (✕) estritamente fixo no topo direito */
.feature-modal-header.has-video .feature-modal-close {
  position: absolute !important;
  top: 22px !important;
  right: 24px !important;
  z-index: 10 !important;
}
```

---

### ETAPA 4: Validação & Verificação

1. **Testar Tamanho dos Arquivos**:
   Execute `Get-ChildItem docs/brain-ui/landing/assets/video/` e confirme que a soma de `<nome>-card.mp4` + `<nome>-modal.mp4` não ultrapassa **550 KB**.
2. **Conferir no Navegador**:
   - O card na Bento Grid exibe o vídeo em loop claro, vibrante e nítido.
   - O texto do título está 100% legível por cima do vídeo, protegido pelo gradiente escuro de base.
   - Ao clicar no card, o modal abre exibindo o vídeo em banner panorâmico perfeitamente enquadrado.
   - **No cabeçalho do modal**: Não há ícone à esquerda; o texto inicia direto da margem esquerda.
   - **Botão de fechar (✕)**: Permanece fixo no topo e à direita (`top: 22px; right: 24px;`), exatamente como nos cards sem vídeo (ex: *Session Capture*).
   - Ao navegar com as setas para outros cards, o vídeo do modal pausa ou troca de arquivo sem travar o navegador.
   - Ao fechar o modal, a reprodução de fundo do modal é interrompida imediatamente.

---

## 4. Tabela de Referência Rápida para o Agente

| Parâmetro | Card (Grade) | Modal (Expandido) |
|---|---|---|
| **Duração Máxima** | **Máximo de 5 segundos** (`-t 5`) | **Máximo de 5 segundos** (`-t 5`) |
| **Resolução Recomendada** | `400 x 224` px | `800 x 250` px |
| **Proporção (Aspect Ratio)** | ~ 16:9 | ~ 3.2:1 (Panorâmico) |
| **Codec de Vídeo** | H.264 / AVC (High Profile) | H.264 / AVC (High Profile) |
| **CRF (Qualidade)** | `27` | `26` |
| **Áudio** | Descartado (`-an`) | Descartado (`-an`) |
| **Peso Alvo (File Size)** | **100 KB – 240 KB** | **280 KB – 500 KB** |
| **Modo de Exibição CSS** | `object-fit: cover; opacity: 1;` | `object-fit: cover; opacity: 0.85;` |
| **Carregamento (Preload)** | `preload="auto"` | `preload="none"` |
