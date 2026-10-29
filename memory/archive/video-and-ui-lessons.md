# Lições de Performance Audiovisual e UI — AI Second Brain

## 2026-10-22 — Reabrir o mesmo vídeo no modal não tocava

### Lição 25: `currentSrc` fica obsoleto após `removeAttribute('src')` + `load()`
**Contexto**: Ao fechar o modal 9:16 o player tinha o `src` removido (para liberar o decodificador). Reabrir o mesmo vídeo não tocava; abrir o outro vídeo funcionava.
**Aprendizado**: Após `removeAttribute('src')` + `load()`, o `video.currentSrc` pode manter a URL anterior. A checagem `currentSrc.endsWith(src)` concluiu que o vídeo já estava carregado, não reatribuiu o `src` e o `play()` rodou em um player sem fonte. Com outro vídeo a comparação falhava e o `src` era definido.
**Ação**: Para decidir se reatribui a fonte, compare com `getAttribute('src')` (null após remover), nunca com `currentSrc`. Teste sempre o ciclo abrir → fechar → reabrir o mesmo item.

## 2026-10-22 — Frame de vídeo congelado até trocar o foco do browser (starvation do compositor)

### Lição 24: Vídeo em modal só atualiza o frame ao trocar o foco da janela
**Contexto**: No localhost, o vídeo 9:16 no modal tinha áudio contínuo, mas a imagem travava e só avançava quando o usuário saía e voltava ao browser. Em tela cheia nunca travava.
**Aprendizado**: Áudio contínuo + imagem parada indica que o *decodificador está saudável* e o **compositor não está apresentando frames** (starvation de GPU/thread de composição), não problema de arquivo. Trocar o foco força um novo ciclo de composição, por isso o frame "anda". A causa é a página de fundo continuar na árvore de composição: dezenas de `backdrop-filter: blur()` (nav, cards, FAQ, diagramas) e o canvas WebGL Three.js disputam a GPU com o vídeo. Backdrop opaco não resolve (o Chromium ainda compõe as camadas atrás). Tela cheia funciona porque desanexa o vídeo da página.
**Ação**: Ao abrir um modal de vídeo, remova a página da composição (`body.modal-open > *:not(.modal) { visibility: hidden }`), pause WebGL e inicie o `play()` só após o fade-in do modal. Desative PiP/Remote Playback no `<video>` do modal. No servidor local, trate Range sufixo (`bytes=-N`) e destrua o stream no `close` da resposta.

## 2026-10-22 — Otimização de Vídeos Web em Modais: GOP (Keyframe Interval), Resolução e GPU

### Lição 23: Travamento de Vídeo MP4 na Web por Intervalo Excessivo de Keyframes (GOP) e GPU Blur
**Contexto**: O vídeo vertical promocional `MemoriaPersistente-9x16.mp4` e seu análogo `pergunte-cerebro-card-promo-9x16.mp4` travavam continuamente durante a reprodução no navegador, gerando picos de INP (312ms+) e engasgos visuais graves.
**Aprendizado**:
1. *Keyframe Interval / GOP em Vídeos Web*: Renderizações automáticas (como Remotion ou perfis padrão de exportação) frequentemente utilizam GOPs abertos de até 250 quadros (~8,3 segundos). No navegador, quando ocorrem micro-quedas de rede ou descarte de frames, o decodificador é forçado a reprocessar centenas de frames dependentes antes de renderizar o próximo quadro, congelando a tela. Fixar o GOP em 1.0 segundo (`-g 30 -keyint_min 30 -sc_threshold 0`) cria pontos de recuperação imediatos a cada 1s.
2. *Superdimensionamento de Resolução*: Exibir um vídeo 1080x1920 (High Profile 5.0) dentro de um modal com largura máxima de 380px consome o triplo de decodificação de GPU desnecessariamente. Reduzir para 720x1280 (Main Profile 3.1) reduz a carga do decodificador em mais de 55% com nitidez idêntica em telas Retina.
3. *Contenção de Renderização GPU (backdrop-filter)*: Aplicar `backdrop-filter: blur(10px)` no container do modal força o compositor da GPU a reprocessar o filtro de desfoque sobre a viewport a cada quadro do vídeo decodificado. Usar fundo com opacidade sem blur elimina o congelamento do compositor.
4. *Desqualificação de Hardware Overlay por Overflow:Hidden e Border-Radius*: Em navegadores baseados em Chromium, se um elemento `<video>` está dentro de um container com `overflow: hidden` e `border-radius`, o motor gráfico é impedido de promover o vídeo para DirectComposition / Hardware Overlay (camada de hardware direta da GPU). O browser é obrigado a aplicar shaders de corte com cópia contínua de textura via CPU/GPU Skia. Em tela cheia (`:fullscreen`), o vídeo sai do fluxo DOM e é promovido a DirectComposition sem clip, rodando a 60fps sem engasgos.
5. *Dimensões Inteiras (360×640) vs Resampling Subpixel*: Um container de 380px com `aspect-ratio: 9/16` gera altura fracionária (675.55px), forçando interpolação bilinear da GPU a cada frame. Padronizar para 360px resulta em exatos 640px inteiros (padrão de telas mobile).
6. *Occlusion Culling*: Um backdrop semi-transparente (ex: 0.96) impede que o compositor descarte os nós do DOM atrás do modal. Usar cor sólida opaca (#04060e) com `isolation: isolate` permite ao Chromium ignorar o redesenho dos cards de fundo.
**Ação**: Para qualquer vídeo HTML5 na web, codifique com GOP de 1s (`-g fps`), Profile Main/3.1 com `faststart`, evite `overflow: hidden` com `border-radius` sobre o container direto de vídeo (aplique raios apenas no header/footer), defina dimensões de proporção inteira (ex: 360×640) e remova animações contínuas de `box-shadow` no cabeçalho do modal.

