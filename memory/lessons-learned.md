# Lições Aprendidas

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

## 2026-10-19 — Redesign de Modais Densos com Zero Scroll & Injeção de Contexto de Origem (SPECS)

### Lição 19: Blindagem contra crescimento vertical ("Zero Scroll") em modais de onboarding
**Contexto**: O modal do Quickstart Studio no Passo 2 acumulava Nome, Stack, Descrição, checkbox de Git e área de especificações, fazendo com que os botões de ação finais (`Modo Assistido` e `Modo Express`) exigissem rolagem vertical em telas comuns de notebook.
**Aprendizado**: Agrupar campos correlatos em grid de 2 colunas (`.qs-grid-row-2` para Nome e Stack) e emparelhar a descrição com a checkbox de `git init` em linha (`.qs-grid-row-desc-git`) reduz o footprint vertical em mais de 40%. Alojar a área de especificação em um accordion retrátil com dropzone compacta e aba para colar texto permite suporte completo a documentos sem comprometer o layout principal.
**Ação**: Priorize agrupamento relacional e blocos expansíveis para manter ações de submissão sempre visíveis na dobra do modal.

### Lição 20: Persistência de documentos de origem em SPECS/ e economia de tokens na sabatina IA
**Contexto**: Documentos de requisitos (PRDs, JSONs de schema, anotações de negócio) fornecidos pelo usuário no início de um projeto corriam o risco de se perder após a geração dos contratos ou forçar o Arquiteto IA a fazer perguntas cujas respostas já constavam nas notas.
**Aprendizado**: Criar uma subpasta oficial `SPECS/` no projeto novo e referenciar os arquivos no `PROJECT.md` garante rastreabilidade histórica. Injetar o conteúdo dessas specs diretamente no prompt do Grill Studio evita que a IA alucine ou faça perguntas redundantes, focando a sabatina estritamente nos pontos arquiteturais não cobertos.
**Ação**: Sempre salve arquivos de briefing em `SPECS/` e alimente a IA com seu contexto antes de iniciar questionamentos.

### Lição 21: Gargalo de JSON escaping em contratos densos de governança e síntese multi-passo com roteamento cirúrgico
**Contexto**: Ao processar documentos de especificação técnica extensos e detalhados (ex: 60KB com dicionário SQL Server completo, RF-01..12 e contratos REST), tentar solicitar os 4 contratos de governança simultaneamente dentro de um objeto JSON `{ "projectMd": "...", ... }` causava estouro de limite de tokens (`maxTokens`), loops degenerativos de repetição de quebras `\n\n---` dentro de strings escapadas e falhas de `JSON.parse`, gerando contratos resumidos e superficiais.
**Aprendizado**:
1. *Roteamento Cirúrgico de SPECS*: Dividir o documento de especificação por seções Markdown semânticas. Seções de negócio (Escopo, RFs, RNs, Personas, Critérios de Aceite) alimentam o gerador de `PROJECT.md`. Seções de infraestrutura (Tabelas SQL, tipos, constraints, endpoints REST, persistência, concorrência, segurança) alimentam `ARCHITECTURE.md`.
2. *Markdown Puro vs JSON Escaping*: Arquivos técnicos de alta densidade (com tabelas, código e exemplos de payload) devem ser gerados em chamadas dedicadas com retorno em Markdown puro ou marcadores limpos (`<<<TAG>>>`), eliminando 100% dos erros de escape de aspas e contrabarras.
3. *Resiliência de Balde de Tokens (TPM)*: Modelos modernos de raciocínio (ex: `gpt-oss-120b`) utilizam tokens internos de raciocínio que contam para o limite de saída e TPM do provedor. No `ai-gateway.js`, o cálculo de backoff deve garantir `Math.max(waitSeconds, Math.ceil(parsedWait))` e tolerar esperas de 15s a 60s para recarga do balde por minuto de provedores em nuvem como a Groq.
### Lição 22: Propagação Universal de Falhas de Cota (429) e Rastreamento de Telemetria de Rate Limits (RPM/TPM)
**Contexto**: O modal universal de erro de IA (`#aiErrorModal`) e o banner contextual do modal de configurações (`#aiSettingsQuotaBanner`) haviam sido acoplados apenas ao Quickstart Studio. Quando ocorria esgotamento de taxa (429 / falta de créditos) durante o Research Lab (`/research/:slug/run`), o backend capturava e retornava HTTP 500 genérico sem metadados de cota, e o frontend exibia o erro apenas no corpo do modal da pesquisa sem acionar a classe `.quota-exceeded` no botão da topbar (`#btnAiGatewayModal`) nem exibir o banner de cota no configurador.
**Aprendizado**:
1. *Ponto Único de Propagação*: O tratamento de erro de cota deve ser universal (`markAiInferenceError`). Qualquer endpoint consumidor de IA (Research Lab, Ask Brain, Session Capture, Quickstart) deve propagar `quotaExceeded`, `isRateLimit`, `retryAfter` e `providerName` preservando o status HTTP 429.
2. *Persistência no Gateway*: O `scripts/ai-gateway.js` deve manter em memória o estado `lastGatewayError` retornado no `getConfig()` para que o Cockpit Web saiba imediatamente do estado de cota esgotada mesmo após recarregar a página ou navegar entre abas.
3. *Limites de Saldo vs Cabeçalhos de Taxa*: Provedores como Anthropic e OpenAI não fornecem endpoints públicos para consulta de saldo financeiro (USD) via chaves de inferência padrão (`sk-ant-...`), mas retornam cabeçalhos ricos de telemetria (`anthropic-ratelimit-tokens-remaining`, `x-ratelimit-remaining-tokens`) a cada resposta, permitindo monitorar o balde de tokens e requisições em tempo real.
**Ação**: Sempre utilize propagação centralizada de erros de inferência e monitore cabeçalhos de rate-limit HTTP para feedback preditivo de cota.

---


## 2026-09-27 — Fundação do AI Second Brain

### Lição 1: Formato nativo importa
**Contexto**: A versão 1 usava estrutura genérica (CLAUDE.md).
**Aprendizado**: Cada ferramenta (Antigravity, Claude Code, Cursor) tem seu formato nativo de customização. Usar o formato nativo garante que as features da ferramenta funcionem corretamente (descoberta automática de skills, rules, etc).
**Ação**: Sempre adapte o AI Second Brain para o formato da ferramenta em uso.

### Lição 2: AIJev não substitui código determinístico
**Contexto**: Tentação de usar AIJev para tudo que envolve decisão.
**Aprendizado**: Se uma regra pode ser escrita em código (if/else, switch), não precisa de AIJev. AIJev é para decisões que envolvem contexto complexo ou probabilidades.
**Ação**: Decision Gate obrigatório antes de integrar qualquer IA.

### Lição 3: LLM não é a resposta para tudo
**Contexto**: Tendência de chamar LLM para cada problema.
**Aprendizado**: LLM é caro, lento e não-determinístico. Use apenas quando realmente precisa de geração de texto ou raciocínio aberto.
**Ação**: Sempre pergunte "isso pode ser feito sem IA?" antes de usar LLM.

---

## 2026-10-02 — Motor do Research Lab & Resiliência de Inferência

### Lição 4: Catálogos de modelos de IA são efêmeros
**Contexto**: Ao configurar o Groq para o Research Lab, modelos consagrados como `llama-3.3-70b-versatile` já estavam descontinuados/deprecados no provedor.
**Aprendizado**: Provedores de nuvem (especialmente inferência rápida como Groq) alteram IDs e disponibilidade de modelos com frequência. Consultar a API de modelos (`GET /openai/v1/models`) em tempo de diagnóstico ou adotar modelos com alta janela de contexto (ex: `openai/gpt-oss-120b`) previne erros `404 model_decommissioned`.
**Ação**: Sempre incluir verificação de status e permitir parametrização do modelo via `.env` (`GROQ_MODEL`).

### Lição 5: Parsing defensivo de JSON gerado por LLMs
**Contexto**: A decomposição de tópicos exige retorno estritamente em JSON estruturado, mas LLMs frequentemente adicionam blocos ` ```json ... ``` ` ou texto introdutório.
**Aprendizado**: Clientes HTTP nativos devem sanitizar markdown fences e extrair blocos `{...}` ou `[...]` antes do `JSON.parse`.
**Ação**: Implementar regex de desempacotamento de markdown fence e fallback antes de falhar a requisição.

---

## 2026-10-08 — Console UTF-8 no Windows & Resiliência de Cache

### Lição 6: Precedência de cache em localStorage e codificação UTF-8 no Windows
**Contexto**: O inicializador `.bat` exibia `ÔÇö` em vez de `—` no CMD, e o visualizador carregava um cache estático do `localStorage` mostrando 34 arquivos desordenados em vez de conectar ao servidor local ao vivo.
**Aprendizado**: 
1. No Windows, o interpretador CMD roda por padrão em página de código OEM (CP850 / CP437). Scripts `.bat` contendo caracteres UTF-8 devem obrigatoriamente executar `chcp 65001 >nul` no topo.
2. Em SPAs que suportam tanto servidor local quanto pasta offline, caches em `localStorage` não devem ter precedência sobre o servidor local em `localhost`. Race conditions durante a subida de processos exigem auto-reconexão com retentativas, e qualquer gerador offline deve manter paridade estrita de arquitetura de dados (árvore hierárquica) com o backend.
**Ação**: Sempre forçar UTF-8 em scripts de console e implementar auto-reconexão e limpeza automática de caches obsoletos no cliente web.

---

## 2026-10-09 — AI Gateway Multi-Provedor (BYOK)

### Lição 7: Atualização atômica de variáveis de ambiente em tempo de execução
**Contexto**: Ao salvar uma nova chave de API ou trocar de provedor via modal BYOK, reiniciar o servidor interromperia a sessão web do usuário.
**Aprendizado**: É possível manter persistência física em arquivo `.env` (preservando comentários e adicionando chaves atômicas) e sincronizar imediatamente o objeto `process.env` em memória no mesmo tick de execução. Isso permite que rotas subsequentes utilizem as novas credenciais sem exigir restart do Node.js.
**Ação**: Sempre sincronizar `fs.writeFileSync('.env')` com mutação direta em `process.env[key] = value` para configurações de infraestrutura hot-swappable.

### Lição 8: Normalização de protocolos de IA (OpenAI vs Anthropic) sem dependências
**Contexto**: Diferentes provedores utilizam convenções distintas: a maioria segue o padrão `/v1/chat/completions` da OpenAI, enquanto a Anthropic exige `/v1/messages` com cabeçalho `x-api-key` e `anthropic-version`.
**Aprendizado**: Uma camada de abstração com zero dependências externas pode mapear transparentemente o formato de request e unificar a extração de resposta (`content[0].text` vs `choices[0].message.content`), mantendo o restante da aplicação agnóstico ao provedor escolhido.
**Ação**: Centralizar a tradução de payloads no gateway unificado e tratar `429` (Rate Limit) de maneira uniforme para disparar telas de contingência guiada.

### Lição 9: Isolamento estrito entre o Vault de Demonstração Pública e Dados Locais
**Contexto**: A sincronização automática da varredura local com a pasta da demo pública sobrescreveu o projeto de demonstração (`demo-app`) com os projetos locais reais do desenvolvedor, arriscando expor dados privados.
**Aprendizado**: O ambiente de demonstração estático (`docs/brain-ui/demo/`) da landing page e o ambiente local de desenvolvimento do workspace devem manter isolamento estrito de dados: o gerador `build_demo_vault.py` produz dados ilustrativos limpos (`demo-app`) para a web pública, enquanto o `scan-vault.js` mapeia os projetos reais do usuário apenas para o visualizador privado no `localhost`.
**Ação**: Isolar completamente geradores de dados estáticos para demonstração pública de scripts de varredura do disco local.

---

## 2026-10-10 — Robustez do Portal BYOK, Normalização & Terminal Console

### Lição 10: Normalização de Catálogo de Modelos (Strings vs Objetos) no Teste de Conexão BYOK
**Contexto**: No modal de configuração de IA (BYOK), o endpoint `/api/ai/test` retornava uma lista de strings de IDs de modelos, enquanto a interface web esperava objetos com propriedades `.id` e `.name`. Isso gerava opções `<option value="undefined">undefined</option>` no dropdown, impedindo a visualização dos modelos detectados.
**Aprendizado**: O backend de Gateway e o cliente frontend devem operar de forma defensiva e simétrica: o backend deve normalizar modelos como objetos tipados `{ id, name, contextWindow }`, filtrar modelos incompatíveis (áudio/guardrails em Groq e embeddings em OpenAI) e ordenar os recomendados no topo. O frontend, por sua vez, deve suportar tanto strings primitivas quanto objetos, apresentar contadores e chips de seleção rápida em 1 clique, e restaurar com segurança o modelo selecionado.
**Ação**: Sempre normalizar estruturas de modelos em `{ id, name, contextWindow }` no gateway, aplicar parsing polimórfico no JavaScript client e enriquecer a UX com badges e chips rápidos.

### Lição 11: Eliminação de Hardcoding de Modelos e Desacoplamento de UI
**Contexto**: Presença de presets estáticos de modelos criava dependência de atualizações manuais no código fonte e induzia falsas expectativas caso o usuário não tivesse acesso a determinados modelos em sua conta.
**Aprendizado**: Provedores de IA evoluem seus catálogos continuamente; fixar nomes em código gera débito técnico imediato. O gateway deve operar de forma dinâmica, descobrindo os modelos disponíveis em tempo real através da API do provedor (`GET /models` / `/api/tags`) a partir do teste de conexão acionado pelo usuário.
**Ação**: Desacoplar formulários de configuração de listas estáticas no código e validar via handshake real com a API do provedor.

### Lição 12: Feedback Monocromático Estrito e Estados Reativos em Consoles Web de Diagnóstico
**Contexto**: No modal de configuração de IA (BYOK), o terminal ao vivo utilizava classes estáticas de cor (`.t-matrix` verde) para prefixos como `$` e rodapés `"LOCAL .ENV ENCRYPTION"`. Em caso de erro de conexão, a linha de erro aparecia mesclada com verde e vermelho, e trocar o provedor exibia prematuramente `[OK] CHAT COMPLETION READY` antes do clique no botão "Testar".
**Aprendizado**:
1. Componentes de terminal que simulam CLI em aplicações web devem implementar uma máquina de estados visual estrita (`idle`, `testing`, `success`, `error`).
2. Estados de falha devem forçar 100% dos nós filhos (incluindo prompts e rodapés) para a cor de alerta (`#f87171`), e estados de sucesso para a cor de validação (`#00f59b`), impedindo poluição visual ou incoerência semântica.
3. Trocas de contexto pelo usuário (ex: alterar o provedor no dropdown) devem reativamente zerar o estado para standby (`is-idle`), limpando feedbacks anteriores e informando o próximo passo (`[IDLE] Clique em "Testar" para validar a chave`).
**Ação**: Centralizar a renderização de status de consoles em funções unificadas (`updateAiTerminalStatus`), forçar regras CSS com seletores descendentes defensivos (`.ai-terminal-output.is-error *`) e garantir que eventos `change` em selects sempre restaurem o estado para neutro/aguardando validação.

### Lição 13: Transparência de Parâmetros de Gateway (Cache TTL e Retentativas) na UX e no Backend
**Contexto**: No passo 4 do configurador BYOK existiam inputs para `Cache` (ex: `24h`) e `Tentativas` (ex: `2`). O desenvolvedor precisava de clareza sobre se esses valores tinham efeito real na execução das APIs e de contextualização visual imediata no modal para entender a finalidade de cada um.
**Aprendizado**:
1. Parâmetros de resiliência e otimização de custo (como retries e TTL de cache) só têm valor se forem ativamente honrados pelo engine: retries com backoff exponencial protegem contra rate limits (`429`) e oscilações de rede; enquanto o hashing (SHA-256) de prompts idênticos em cache em memória elimina chamadas redundantes, poupa tokens da cota do usuário e atinge latência de 0ms.
2. Em interfaces técnicas (BYOK/DevTools), expor cards explicativos dedicados ao lado dos parâmetros reduz a carga cognitiva, esclarece trade-offs de desempenho e reforça a confiança na plataforma.
**Ação**: Sempre acoplar parâmetros de configuração a camadas concretas de execução no engine de gateway e fornecer cards explicativos com métricas esperadas (ex: latência 0ms, tolerância a HTTP 429) na interface do usuário.

---

## 2026-10-11 — Descoberta Dinâmica em Tempo Real, Blindagem Universal & Pontes Standalone

### Lição 14: Zero Catálogos Estáticos de Modelos — Descoberta Dinâmica em Tempo Real com Auto-Trigger na Abertura
**Contexto**: A introdução temporária de um catálogo fixo de fallback (`AI_DEFAULT_MODELS_BY_PROVIDER`) para preencher o select antes do clique em "Testar" gerou discrepâncias (ex: textos verdes indicando conexão antes de os modelos estarem populados) e violou a filosofia fundamental de flexibilidade BYOK do AI Second Brain.
**Aprendizado**:
1. Catálogos estáticos de modelos de IA no frontend ou backend são antipadrões graves: APIs de IA evoluem semanalmente com novos lançamentos e deprecações, além de permissões variáveis por conta/chave.
2. Em interfaces de configuração com chave já salva, a UX correta e elegante é **provocar/disparar o teste de conexão (`testCurrentAiConnection()`) automaticamente na própria abertura da tela (`openAiSettingsModal`)**. O usuário presencia o handshake em tempo real, a latência autêntica é aferida e o seletor é populado com modelos vivos direto da API.
3. Se o usuário não possuir chave configurada, o seletor deve exibir exclusivamente o placeholder neutro orientativo (*"Clique em 'Testar' acima para listar os modelos disponíveis..."*) e manter o terminal em standby (`[IDLE]`), sem induzir falsos sucessos.
4. A versão demo deve adotar **exatamente a mesma arquitetura**: mocks de transporte de rede (`demo-mode.js`) interceptam a rota de teste e retornam respostas simuladas com latência realista, permitindo que o mesmo código JS rode com 100% de paridade em ambos os ambientes sem bifurcação nem catálogos fixos no código da UI.
**Ação**: NUNCA utilizar listas estáticas de modelos de IA em código JavaScript ou HTML. Sempre buscar modelos dinamicamente via requisição de teste provocada na abertura do modal ou por ação do usuário, assegurando paridade total entre o ambiente local e a demo pública.

### Lição 15: Governança Universal Agnóstica (AGENTS.md) e Pontes Automáticas em Projetos Vinculados (Standalone)
**Contexto**: Inicialmente a governança residia apenas em `GEMINI.md`. Ao operar com outras ferramentas (Cursor, Claude Code, Windsurf, Cline, Copilot) ou quando o desenvolvedor abria o repositório vinculado em uma janela isolada da IDE, o agente não lia as diretrizes nem as lições aprendidas do Segundo Cérebro.
**Aprendizado**:
1. O AI Second Brain é agnóstico tanto a linguagens/stacks quanto a ferramentas e provedores de IA. O padrão universal aberto deve ser o **`AGENTS.md`**, reconhecido por qualquer agente de ponta.
2. Para ferramentas com arquivos de configuração proprietários, deve haver pontes nativas (`.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`) que instruem o agente a seguir as mesmas regras absolutas e a consultar obrigatoriamente a memória antes de agir.
3. A governança não pode se limitar ao Cockpit Central: os utilitários de criação e vinculação de projetos (`scripts/link-project.js` e `scripts/create-project.js`) devem injetar automaticamente as pontes de governança diretamente na raiz física do projeto vinculado. Assim, mesmo em modo Standalone, o agente respeita as regras e decisões arquiteturais.
**Ação**: Sempre manter governança multiplataforma espelhada em todas as pontes e automatizar a geração de arquivos de ponte durante o vínculo de novos repositórios.

### Lição 16: Dois Níveis de Lições Aprendidas — Prevenção da "Amnésia por Sessão Antiga"
**Contexto**: Registrar aprendizados apenas em arquivos diários de sessões passadas (`MEMORY/sessions/`) fazia com que o agente esquecesse erros antigos quando o histórico acumulava dezenas de sessões, pois nenhuma IA relê todo o histórico passado a cada novo prompt.
**Aprendizado**:
1. Para manter a alta coesão e evitar estouro de tokens, as lições aprendidas devem ser divididas em dois níveis explícitos:
   - **Nível 1 (Global/Framework)** em `memory/lessons-learned.md`: armazena regras universais de engenharia, arquitetura e integrações de IA que se aplicam a qualquer projeto.
   - **Nível 2 (Local/Do Projeto)** em `projects/<projeto>/LESSONS_LEARNED.md`: armazena armadilhas técnicas, regras de negócio e bugs específicos daquela base de código (ex: peculiaridades de schemas de banco, rotas de webhooks, bibliotecas da stack).
2. O arquivo local viaja junto com o repositório no Git do projeto, garantindo que mesmo ao abrir a pasta isoladamente em outro editor, o agente sempre leia os erros que nunca devem ser repetidos antes de gerar código.
**Ação**: Todo projeto novo ou vinculado deve nascer com seu próprio `LESSONS_LEARNED.md`, e todas as pontes de IA devem instruir mandatoriamente a consulta deste arquivo antes de agir.

---

### Lição 17: Isolamento Estrito de Base URL entre Provedores e Integridade de Cache em Memória
**Contexto**: O AI Gateway apresentou erro 500 em `/api/ai/config` por ausência da declaração `cachedModelsByProvider`, e requisições para a Groq herdaram `AI_BASE_URL` da Anthropic salvo no `.env`, gerando falso positivo no terminal (0 modelos detectados como "Catálogo pronto") e erro 400 ao salvar.
**Aprendizado**:
1. Variáveis globais referenciadas em módulos de gateway devem possuir declaração atômica no topo do escopo (`const cachedModelsByProvider = {}`), prevenindo `ReferenceError` em rotas HTTP.
2. Parâmetros como `baseUrl` pertencem ao provedor ativo: provedores padrão de nuvem (`groq`, `openai`, `anthropic`, `openrouter`) devem utilizar estritamente suas URLs oficiais mapeadas no catálogo, e nunca herdar parâmetros customizados de outros provedores armazenados anteriormente no `.env`. Apenas provedores locais ou configuráveis (`ollama`, `custom`) devem aceitar e persistir URLs customizadas.
3. Consoles e terminais web não podem emitir estado `success` com 0 modelos detectados quando o provedor requer modelos para operar. Se a detecção retornar 0 modelos ou falhar, o sistema deve apresentar estado de erro explícito com mensagem amigável, orientando a inserção da chave correta e impedindo tentativas de salvamento inconsistentes.
**Ação**: Isolar o escopo de `baseUrl` por provedor, validar retorno mínimo de modelos antes de declarar conexão bem-sucedida e aplicar validações preventivas no frontend antes de disparar endpoints de teste e gravação.

---

### Lição 18: Sincronização Bidirecional de Parâmetros de Ambiente, Blindagem de Autofill e Validação Defensiva
**Contexto**: Parâmetros de execução (`AI_CACHE_TTL_HOURS` e `AI_MAX_RETRIES`) alterados no `.env` não eram refletidos ao reabrir o modal visual, campos de senha herdavam fundo claro invasivo do autofill do navegador, e valores numéricos permitiam fallback silencioso para `2` quando definidos como `0` (desativar retries).
**Aprendizado**:
1. **Sincronização Fiel de Estado**: Todo modal de configuração deve ler e aplicar ativamente todos os valores retornados pelo endpoint de configuração (`GET /api/ai/config`) aos elementos do DOM, sem depender de valores padrão estáticos declarados no HTML.
2. **Tratamento de Falsy em Números**: Operadores de coalescência ou fallback como `parseInt(x) || 2` convertem incorretamente o valor legítimo `0` para `2`. Valores numéricos inteiros devem ser validados com `!isNaN(n) && n >= min && n <= max`.
3. **Blindagem contra Autofill Claro no Dark Mode**: Campos de credenciais (`type="password"`) sofrem interferência da folha de estilos nativa do Chromium (`:-webkit-autofill`), que sobrescreve fundos escuros com tons claros (`rgb(232, 240, 254)`). A blindagem exige `color-scheme: dark !important`, `box-shadow inset` e substituição de placeholders genéricos como `"Password"` por textos descritivos acompanhados de `autocomplete="new-password"`.
4. **Validação em Camadas (Frontend e Backend)**: Validações de limites (ex: TTL entre 1h e 720h, Retries entre 0 e 5) devem ocorrer em três camadas coordenadas: na interatividade (`keydown`/`input`), no pré-salvamento no cliente (com feedback visual e foco) e no backend (retornando HTTP 400 antes de gravar no disco).
**Ação**: Sempre aplicar leitura explícita no modal, blindar inputs de senhas contra autofill e validar intervalos de dados em todas as camadas da aplicação.

---

## 2026-10-12 — Session Capture com IA & Higienização Determinística

### Lição 19: Separação Estrita em Duas Etapas (Draft vs Commit) e Proteção de Segredos na Coleta Git
**Contexto**: A automação do registro diário de sessões e atualização de memória precisava capturar o contexto do repositório (Git) sem vazar chaves de API/arquivos confidenciais para a IA e sem gravar arquivos precipitadamente antes da conferência do desenvolvedor.
**Aprendizado**:
1. **Separação em Duas Fases**: Toda ação de IA que altera memória e contratos vivos deve seguir a separação estrita: `/session/draft` (somente leitura: reúne contexto e pede redação em JSON tipado ao LLM) e `/session/commit` (gravação física: executada apenas após clique explícito de aprovação humana no modal de revisão).
2. **Higienização Determinística de Segredos**: Ao ler telemetria Git (nomes de arquivos modificados e diffstat), nunca se deve enviar o código-fonte integral (patches). Além disso, nomes de arquivos que combinem com padrões de credenciais (`.env`, `.pem`, `.key`, `id_rsa`, `secrets.*`) devem ser censurados antes da montagem do prompt para a IA.
3. **Atualização Cirúrgica de Markdown**: Modificações no `CURRENT_STATE.md` devem ser seletivas — preservando comentários, seções adicionais e quebras de linha (`CRLF` ou `LF`) originais, apenas remanejando itens concluídos de "Próximos Passos" para "O que já foi definido" e recalculando a numeração.
**Ação**: Sempre aplicar o padrão Draft-then-Commit com revisão humana item a item em automações de memória e higienizar qualquer entrada Git contra padrões de segredos.
### Lição 20: Redução de Fricção no Ciclo de Vida: Disparo Direto de IDEs, Prompt Bootstrap e Feedback de Inferência
**Contexto**: A simulação prática com um desenvolvedor iniciante revelou três atritos na experiência real: alternância manual entre navegador e terminal para abrir a IDE (`code .`), necessidade de redigir manualmente instruções de contexto ao agente de IA na primeira sessão, e sensação de travamento durante os 2 a 4 segundos de inferência do LLM no modal de captura.
**Aprendizado**:
1. **Acoplamento Físico com a IDE do Desenvolvedor**: A interface web não deve ser um silo isolado. Endpoints de sistema seguros (`/api/system/open-ide`) permitindo abrir o projeto diretamente no VS Code ou Cursor AI via `cmd.exe /c code` (com fallback seguro para explorador de arquivos) eliminam atrito de linha de comando.
2. **Prompt Bootstrap em 1 Clique**: Desenvolvedores frequentemente sofrem de amnésia ao abrir uma nova janela na IDE. Disponibilizar um botão que copia imediatamente um prompt contextualizado com as regras absolutas, stack e referências aos contratos acelera o início produtivo do trabalho.
3. **Feedback Ativo e Rotativo em Chamadas Longas de IA**: Inferências de IA para síntese de documentos levam de 1,5 a 5 segundos. Um spinner estático gera insegurança de que a aplicação travou. Substituir por mensagens rotativas sincronizadas com as fases de trabalho ("Lendo commits...", "Cruzando contratos...", "Sintetizando resumo...") transmite transparência e melhora a percepção de performance.
**Ação**: Sempre fornecer atalhos de abertura no ambiente local do usuário, prompts de início pré-parametrizados e indicadores de progresso com mensagens de estado dinâmicas em todas as operações de inferência.

---

## 2026-10-13 — Ergonomia de Ferramentas Locais & Abertura Nativa

### Lição 21: Evitar catálogos opinativos de software quando o SO já resolve nativamente
**Contexto**: O cabeçalho do Workspace de Projetos continha um split button com menu suspenso de 6 editores de código (VS Code, Cursor, Antigravity, Windsurf, JetBrains, Explorer).
**Aprendizado**: Catálogos estáticos ou semi-estáticos de IDEs sempre parecem arbitrários ou incompletos diante da diversidade de ferramentas do mercado (Neovim, Zed, Sublime, Visual Studio, etc.) e trazem complexidade desnecessária para web apps locais (menus suspensos que podem sofrer clipping de overflow, detecção frágil de CLIs no PATH e necessidade de persistência de preferências). Um único hiperlink nativo com ícone de pasta (`📂`) que aciona o Explorador de Arquivos do sistema operacional (`Invoke-Item` / `explorer.exe`) reduz a poluição visual a zero e dá liberdade irrestrita para o desenvolvedor abrir o projeto com qualquer ferramenta através do menu de contexto nativo do SO.
**Ação**: Priorize abertura nativa pelo explorador de arquivos e caminhos copiáveis (`Clipboard`) em vez de construir lançadores embutidos com listas de aplicativos.

---

## 2026-10-14 — Fonte Única da Verdade (SSOT) para Configurações & Circuit Breakers

### Lição 22: Fonte Única da Verdade (SSOT) real: elimine cópias redundantes e use fallbacks apenas como safety nets
**Contexto**: A caixa de listagem de status de projetos na barra de busca divergia das opções do formulário de edição rápida e dos chips de status dos cards. Para resolver, criou-se `config/project-statuses.json`, mas inicialmente geraram-se cópias espelho em `docs/brain-ui/` e `demo/`.
**Aprendizado**:
1. **Evitar Espelhos Físicos Redundantes**: Duplicar arquivos de configuração em múltiplas pastas "por conveniência" destrói o princípio de Fonte Única da Verdade (SSOT). Cria ambiguidade (*"qual arquivo devo editar?"*) e riscos de descontinuidade (*"se eu editar na UI, vai valer?"*). A configuração deve residir em um único lugar (`config/`) e ser injetada no pipeline de build/scan ou servida pela API.
2. **Papel Estrito de Constantes Padrão (`DEFAULT_*`)**: Constantes padrão hardcoded no código JavaScript não devem competir com a fonte de dados. Elas devem atuar estritamente como *circuit breakers / defensive fallbacks* de engenharia para evitar quebras com erro de runtime (`undefined` ou tela preta) caso o arquivo de configuração seja excluído, corrompido ou esteja temporariamente vazio. Em condições normais de operação, 100% dos dados devem fluir da configuração dinâmica.
**Ação**: Mantenha sempre um único arquivo de configuração editável no projeto, compile-o no snapshot/API e use defaults no código apenas como fallback de resiliência.

---

## 2026-10-14 — Percepção de Performance & Synaptic Boot HUD

### Lição 23: Percepção de Performance em SPAs — Instant Pre-Render (0ms) e Synaptic Boot HUD
**Contexto**: O carregamento inicial da página aguardava a resposta de rede do endpoint `/api/vault` antes de construir o menu lateral e os cards de projetos, deixando a interface temporariamente vazia e gerando uma falsa impressão de lentidão no projeto.
**Aprendizado**:
1. **Instant Pre-Render (0ms)**: O carregamento de dados já presentes em memória (`window.VAULT_SNAPSHOT`) deve ocorrer de forma síncrona no constructor do `VaultManager` e no primeiro ciclo de `DOMContentLoaded`, pré-renderizando 100% da árvore de navegação e dos cards em 0ms.
2. **Synaptic Boot HUD (Efeito UAU)**: A inclusão de um overlay visual de inicialização de alta fidelidade com micro-telemetria, anéis orbitais neon pulsantes e barra de progresso preenche a fração de segundo em que o servidor em disco sincroniza, transformando uma espera vazia em uma experiência de cockpit e carregamento de sistema operacional de IA.
3. **Defensividade com Skeletons Shimmer**: A presença de skeletons no HTML original garante que mesmo se o overlay não estiver disponível ou for desativado, o layout da página não sofra shifts bruscos.
**Ação**: Sempre realizar instant pre-render a partir do snapshot em memória antes de requisições assíncronas de rede e utilizar loaders com identidade visual rica e telemetria real.

---

## 2026-10-14 — Ergonomia de Modais & Accordion Inteligente na Sabatina Técnica

### Lição 24: Ergonomia em Modais Verticais: Eliminação de Double-Scroll através de Accordion Inteligente / Modo Focado
**Contexto**: A sabatina técnica com IA (Grill Studio) renderizava todas as 4 a 8 perguntas simultaneamente como cards expandidos em uma lista vertical. Isso empurrava as ações finais de síntese e aprofundamento para fora da área visível da tela, forçando o usuário a rolar continuamente o modal e perder o contexto dos botões de avanço.
**Aprendizado**:
1. **Double-Scroll é Anti-Padrão Crítico de UX**: Janelas modais que exigem scroll interno para encontrar os botões de ação geram atrito cognitivo e sensação de interface pesada e engessada.
2. **Modo Focado (Accordion Inteligente com Auto-Avanço)**: Manter apenas a pergunta em foco expandida e as demais colapsadas em barras resumo informativas (~40px) reduz a altura vertical em mais de 60%. O container cabe integralmente em `~320px`, mantendo as caixas de ação e a barra de progresso sempre visíveis (*above the fold*).
3. **Preservação de Estado no DOM**: Elementos de formulário (`<input>`) devem permanecer no DOM durante transições de accordion, alternando visibilidade via CSS em vez de reconstrução de nós, garantindo que respostas parciais nunca sejam perdidas.
4. **Auto-Avanço Cadenciado (220ms)**: O avanço automático para a próxima pergunta após o clique em uma opção dá agilidade extrema (*feeling de formulário moderno estilo Typeform*), e o delay de 220ms fornece o feedback visual tátil necessário de que a opção foi selecionada antes da transição.
**Ação**: Para formulários sequenciais ou sabatinas técnicas dentro de modais, adote accordions inteligentes de foco único com persistência de inputs no DOM e barras de progresso visíveis.

---

## 2026-10-15 — Validação de Sintaxe em Pipelines de Sincronização & Resiliência de Boot

### Lição 25: Resiliência do Synaptic Boot HUD e Integridade Sintática Estrita em Arquivos Espelhados
**Contexto**: Ao carregar a demonstração embutida na Landing Page (`docs/brain-ui/landing/index.html`), o modal de inicialização (`#brainBootOverlay`) ficava travado em 0% sem sair da tela. A investigação revelou um `SyntaxError: Unexpected end of input` em `docs/brain-ui/demo/app.js` causado por um trecho duplicado incompleto deixado na sincronização manual com `docs/brain-ui/app.js`.
**Aprendizado**:
1. **O Risco dos Erros de Parse no Boot**: Telas de carregamento visual dependem do runtime JavaScript para registrar eventos e chamar a função de encerramento (`dismissBootScreen()`). Se o arquivo JavaScript principal contiver um erro de sintaxe, o navegador aborta a execução antes do parsing de qualquer função ou listener de `DOMContentLoaded`. O layout estático do loader fica congelado para sempre sem que o usuário entenda o motivo.
2. **Paridade Byte-a-Byte Estrita**: O arquivo `app.js` do ambiente de demonstração (`demo/`) e do cockpit local (`brain-ui/`) compartilham a mesma lógica central (diferindo apenas na interceptação do `demo-mode.js`). Sincronizações parciais ou manuais criam divergências sutis e quebras acidentais de sintaxe.
3. **Validação Automatizada de Sintaxe no Linter**: O linter de integridade do projeto (`scripts/doctor.js`) deve validar não apenas referências Markdown e contratos de governança, mas também a integridade sintática de 100% dos scripts JavaScript do cliente via motor nativo de parsing (`vm.Script` / `node --check`).
**Ação**: Sempre sincronizar arquivos idênticos de forma atômica e integral, e incluir verificação sintática de scripts no `doctor.js` para blindar o workspace contra erros de parse.

---

## 2026-10-16 — Escala / Zoom Dinâmico em Visualizadores de Contratos & Estabilidade Geométrica

### Lição 26: Escala Proporcional (Zoom) e Estabilidade Geométrica em Viewers de Documentos Extensos
**Contexto**: Minutas de contratos de governança (`PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, `ADR-0001`) contêm muitas seções, tabelas e diagramas. No visualizador do Quickstart e no editor expandido, o tamanho padrão de fonte forçava rolagem excessiva. O usuário solicitou visualização em escala menor (zoom padrão de 80%) com botões de ajuste estilo *capsule pill* (`+`, `80%`, `−`).
**Aprendizado**:
1. **Compensação Geométrica Inversa de Dimensões**: Ao aplicar `zoom: ratio` (ex: `0.8`), as dimensões do elemento no layout box encolhem proporcionalmente. Se a altura ou largura estiver configurada como fixa ou `100%`, o container resultante sofre encolhimento visual na tela (deixando faixas vazias na base do modal ou encurtando o card). A solução matemática é aplicar dimensões inversamente proporcionais: `width: calc(100% / ratio)`, `height: calc(100% / ratio)` e `max-height: Math.round(targetHeight / ratio) + 'px'`. Com isso, a caixa física na tela permanece 100% estável e preenche o modal perfeitamente em qualquer zoom de 50% a 150%.
2. **Coluna de Leitura Adaptativa (`.doc-preview-inner`)**: Textos em Markdown centralizados com `max-width: 820px` colapsariam para apenas `656px` sob escala de 80%. Ao aplicar `max-width: calc(820px / ratio)`, a largura de linha física na tela é preservada rigorosamente em 820px, permitindo que mais palavras caibam por linha sem quebrar o ritmo de leitura.
3. **Ergonomia e Sincronização de Estado**: Manter a mesma porcentagem de escala sincronizada bidirecionalmente entre o card compacto e o modal expandido em tela cheia elimina descontinuidades perceptivas, oferecendo ao desenvolvedor uma experiência fluida de inspeção panorâmica.
**Ação**: Ao criar controles de zoom ou escala em elementos de visualização/edição, compense sempre a largura, altura e colunas centrais inversamente à razão de escala (`1 / ratio`) para evitar saltos ou distorções de layout.

---

## 2026-10-16 — Governança JEV Nativa Local & Resiliência a Rate Limits de IA

### Lição 27: Roteamento Determinístico de Contratos e Decisão via Regras Locais (JEV Nativo / RulesDecisionProvider)
**Contexto**: O refinamento iterativo de contratos de governança no Quickstart Studio ("Prompt Vivo") aplicava qualquer instrução do usuário simultaneamente em todos os 4 contratos (`PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, `ADR-0001`), duplicando tabelas e escopos técnicos e gerando desperdício desnecessário de tokens.
**Aprendizado**:
1. **Prioridade Determinística Estrita**: Nunca utilize LLM para decidir quais arquivos alterar quando padrões léxicos e intenções determinísticas resolvem com 100% de precisão. O motor de regras local `RulesDecisionProvider` executa de forma síncrona com latência de 0ms, custo zero de tokens e funcionamento 100% offline.
2. **Isolamento Cirúrgico e Composição Multi-Target**: Instruções sobre esquemas de banco e tabelas pertencem exclusivamente a `ARCHITECTURE.md`; escopo pertence a `PROJECT.md`; roadmap pertence a `CURRENT_STATE.md`; e decisões técnicas pertencem a `ADR-0001`. Solicitações compostas devem autorizar apenas os contratos estritamente citados, blindando os demais com guardrails programáticos.
3. **Detecção de Ambiguidade Técnica (Human-in-the-Loop)**: Instruções vagas sobre temas críticos (como pagamentos, autenticação ou mensageria) não devem ser encaminhadas ao LLM com suposições cegas. O motor JEV deve interceptar essas solicitações, formular a dúvida técnica e exigir clarificação humana com opções de preenchimento rápido em 1 clique antes de qualquer chamada generativa.
**Ação**: Sempre aplicar o motor `RulesDecisionProvider` antes de qualquer mutação de múltiplos arquivos assistida por IA, mantendo rastreabilidade numérica (`ruleId`, `confidence`, `rationale`) e diálogo de clarificação humana quando a ambiguidade for detectada.

### Lição 28: Resiliência em Rate Limits de Provedores de IA, AbortController e Eliminação de Discrepâncias de UX
**Contexto**: Ao esgotar créditos/tokens na Groq Cloud durante a Sabatina Técnica, a tela do Cockpit congelava indefinidamente com o spinner girando, o layout colapsava ao clicar em "← Voltar aos dados", e o botão da topbar pulsava vermelho enquanto o console do modal de configurações exibia "Conexão bem-sucedida" em verde.
**Aprendizado**:
1. **A Armadilha do `sleep` Longo em Rate Limits**: Backends de gateway nunca devem dormir passivamente quando o cabeçalho `retry-after` do provedor indicar tempos longos (como 20 minutos). A retentativa com espera deve ser limitada a no máximo 10s; acima disso, o backend deve abortar imediatamente e retornar um erro HTTP 429 estruturado com metadados para que o frontend reaja em milissegundos.
2. **Cancelamento Ativo com `AbortController`**: Ao navegar para fora de uma tela com operação de IA em andamento, o frontend deve abortar imediatamente a requisição `fetch` ativa via `AbortController`, limpando classes de loading (`is-loading-questions`, `grill-mode`) e forçando a restauração das dimensões do layout.
3. **Discrepância Cognitiva entre Model Discovery e Chat Inference**: A rota `GET /models` apenas autentica a chave de API e não consome cota de inferência de chat (`POST /chat/completions`). O modal de configurações de IA (BYOK) não pode depender apenas do teste de listagem de modelos para atestar a saúde do sistema: deve exibir um **Banner de Alerta Contextual** quando houver falha recente de cota (429), orientando o desenvolvedor a alternar o modelo ativo ou o provedor.
**Ação**: Sempre proteger gateways de IA com limites estritos de espera em `retry-after`, utilizar `AbortController` para cancelar requisições em trânsito no frontend e exibir alertas explícitos no configurador BYOK quando a inferência do modelo ativo estiver com cota esgotada.

---

## 2026-10-18 — Streaming de Vídeo HTTP 206, Otimização de GPU & Quickstart 3 Atos

### Lição 29: Suporte a HTTP 206 Partial Content (Range Requests) para Streaming Fluido de Vídeo em Servidores Zero-Deps
**Contexto**: Ao reproduzir arquivos `.mp4` ou `.webm` na Landing Page e nos modais através do servidor nativo Node.js (`server.js`), os navegadores (Chrome, Safari, Edge) realizavam requisições com o cabeçalho `Range: bytes=start-end`. Como o servidor respondia estaticamente com `200 OK` e o arquivo inteiro via pipe, operações de seek/scrubbing travavam e causavam downloads redundantes de arquivos de múltiplos megabytes.
**Aprendizado**:
1. **Navegadores Modernos Exigem Range Requests para Mídia**: Para reproduzir vídeos com busca temporal, buffer progressivo e reprodução fluida, navegadores esperam status `HTTP 206 Partial Content` com cabeçalhos `Content-Range: bytes ${start}-${end}/${fileSize}`, `Accept-Ranges: bytes` e `Content-Length: chunksize`.
2. **Chunking com Streams Nativos do Node.js (`fs.createReadStream`)**: Tratar o cabeçalho `req.headers.range` extraindo `start` e `end` e injetando no `fs.createReadStream(filePath, { start, end })` permite atender qualquer requisição parcial instantaneamente, com latência zero e consumo de memória virtualmente nulo no servidor.
3. **Cache Distinto para Mídia vs Documentos**: Enquanto arquivos de aplicação (`.html`, `.json`) devem ter `no-cache` para refletir o estado ao vivo do workspace, mídias binárias (`.mp4`, `.webm`, `.jpg`, `.png`) devem receber `Cache-Control: public, max-age=3600`, poupando ciclos de I/O em loops de exibição.
**Ação**: Em servidores nativos HTTP sem dependências externas, sempre implementar manipulação de `Range` com resposta 206 para arquivos de áudio/vídeo e cache público para assets estáticos pesados.

### Lição 30: Gerenciamento Ativo de Recursos de GPU (WebGL/Three.js) e Isolamento de Cliques em Cards com Ações Múltiplas
**Contexto**: A Landing Page possui um grafo neural 3D em Three.js animando continuamente na tela e múltiplos cards com vídeos em loop. Ao abrir modais pesados de vídeo (como o player 9:16 vertical), dispositivos móveis ou máquinas com GPU integrada sofriam engasgos e perda de frames. Além disso, no Card 09 que possui tanto ação de "Ver arquitetura ↗" quanto botão de "▶ Vídeo Demo (9:16)", cliques no botão de vídeo disparavam ambos os modais simultaneamente.
**Aprendizado**:
1. **Pausa Mandatória de Loops WebGL durante Vídeos em Tela Cheia / Modais**: Pausar a rotação do grafo 3D (`g.stop()`) e pausar os vídeos dos cards em segundo plano (`video.pause()`) ao abrir qualquer modal de vídeo libera 100% da aceleração de decodificação de hardware da GPU, garantindo reprodução a 60fps sem travamentos. Ao fechar o modal, basta retomar (`g.start()` e `video.play()`).
2. **Isolamento Estrito de Eventos em Cards Clicáveis (`stopPropagation` + Verificação de Alvo)**: Quando um card inteiro é clicável (atuando como `role="button"` para um modal técnico) mas contém botões de ação específicos em seu interior, a delegação de eventos deve verificar `e.target.closest('.card-video-9x16-btn, [data-prevent-feature-modal]')` e acionar `e.stopPropagation()` / `e.preventDefault()`. Isso blinda a interface contra sobreposição acidental de modais.
**Ação**: Sempre gerenciar ativamente o ciclo de vida de renderizadores WebGL e loops de vídeo de fundo durante a exibição de mídia em primeiro plano, e isolar programaticamente gatilhos secundários em cards interativos.

---

## 2026-10-19 — Expansão Multiprovedor AI Gateway: Suporte Nativo a Google Gemini

### Lição 31: Integração Nativa de Provedores de Alta Janela (Google Gemini) e Isolamento Estrito de Base URL
**Contexto**: Durante o processamento de uploads densos de requisitos (ex: 61KB), o plano gratuito da Groq atingiu os limites de tokens por minuto (TPM), levando o usuário a fornecer uma chave de API do Google Gemini. Ao abrir o modal de configuração de IA, o usuário não encontrou a opção do Gemini, e ao tentar integrar o endpoint OpenAI-compatible do Gemini (`v1beta/openai`), requisições falhavam com HTTP 401 por vazamento do `AI_BASE_URL` da Groq previamente persistido no `.env`.
**Aprendizado**:
1. **Isolamento Estrito de `baseUrl` por Provedor**: Em arquiteturas multi-provedor com BYOK, o backend nunca deve permitir que `config.baseUrl` (herdado do provedor ativo anterior no `.env`) sobrescreva a URL padrão de um provedor em nuvem recém-selecionado (`gemini`, `groq`, `openai`, etc.). Apenas provedores locais ou personalizados (`ollama`, `custom`) devem ler e persistir `AI_BASE_URL` customizada.
2. **Tratamento Resiliente de Erros em Array da API Gemini**: Ao reportar modelos obsoletos ou erros (ex: 404 para `gemini-2.5-flash`), a API do Gemini retorna o corpo em formato de array de objetos (`[{ "error": { "code": 404, "message": "..." } }]`). Clientes HTTP que esperam apenas `parsed.error?.message` de objetos raiz perdem a mensagem original e geram erros genéricos. O extrator de erros deve verificar `(Array.isArray(parsed) && parsed[0]?.error?.message) || parsed.error?.message`.
3. **Catálogo 100% Dinâmico com Sanitização de IDs**: A API do Gemini retorna nomes de modelos com prefixo `models/` (ex: `models/gemini-3.8-flash`). O gateway deve sanitizar os identificadores para uso transparente no dropdown e na inferência, preservando a regra absoluta de Zero Fabricação e descoberta via `GET /models`.
4. **Resolução de Gargalos de Taxa (TPM)**: O Google Gemini oferece uma janela de contexto massiva (1M+ a 2M+ de tokens) e limites de requisição generosos no plano gratuito, tornando-o ideal para tarefas de alta densidade textual como a Sabatina Técnica (Grill with Docs) e síntese de contratos de governança.
**Ação**: Implementar sempre sanitização de IDs e detecção de formato de erro em array para novos provedores no AI Gateway, isolando URLs de base e garantindo 100% de paridade entre a interface local e o modo demo.

### Lição 32: Curadoria e Classificação Semântica Dinâmica de Modelos por Finalidade de Engenharia
**Contexto**: Ao listar os modelos retornados pela API do Google Gemini (`GET /models`), a lista continha 37 modelos, dos quais mais da metade eram incompatíveis com a finalidade do projeto (modelos de robótica `robotics`, agentes de desktop `computer-use`, áudio/streaming via WebSockets `live`, modelos mortos/descontinuados como `gemini-2.5-flash` que retornam 404 para novas contas, ou pipelines autônomos de 20 minutos como `deep-research`). O usuário destacou com precisão que só faz sentido ter na lista modelos capazes de cumprir a finalidade do projeto, e que essa curadoria precisa ser dinâmica e universal para qualquer provedor de IA.
**Aprendizado**:
1. **Filtro Universal por Propósito de Engenharia de Software**: O AI Second Brain atua em síntese de arquitetura, contratos, código, sabatina técnica e Q&A semântico. Provedores de IA retornam todos os modelos da conta em uma única lista genérica. Um gateway inteligente deve aplicar filtros universais que descartam:
   - Áudio, fala e transcrição (`whisper`, `audio`, `tts`, `speech`, `transcribe`).
   - Protocolos bidirecionais de streaming/WebSockets (`live`, `streaming`, `realtime`, `bidi`).
   - Mídia pura e geração de imagem/vídeo (`veo`, `lyria`, `dall-e`, `sora`, `flux`, `diffusion`, `image-preview`, `-image`).
   - Embeddings e representação vetorial (`embed`, `embedding`, `text-embedding`, `similarity`).
   - Moderação e guardrails (`guard`, `moderation`, `safeguard`, `safety`, `censor`).
   - Classificadores e rerankers (`reward`, `rerank`, `scorer`).
   - Automação de SO e robótica (`computer-use`, `robotics`).
   - Modelos comprovadamente mortos/aposentados pelos provedores (ex: `gemini-2.5-flash`).
2. **Agrupamento Semântico Dinâmico via `<optgroup>`**: Uma lista linear de 30 nomes desorienta o desenvolvedor. Ao categorizar dinamicamente os modelos aprovados em grupos semânticos:
   - 🌟 *Recomendados para Arquitetura & Raciocínio* (`gemini-3.8-flash`, `gemini-flash-latest`, `gpt-oss-120b`, `gpt-4o`, `claude-3-5-sonnet`).
   - ⚡ *Rápidos & Baixa Latência* (`gemini-3.5-flash-lite`, `gpt-4o-mini`, `llama-3.1-8b-instant`, `claude-3-5-haiku`).
   - 🛠️ *Abertos & Código (Open-Weights)* (`gemma-4-31b-it`, `qwen-2.5-32b`, `deepseek-r1`).
   O desenvolvedor identifica imediatamente o melhor modelo para o seu objetivo de engenharia, com o modelo principal sempre posicionado com prioridade máxima.
3. **Resiliência a Modelos que Nascem e Morrem Diariamente**: Como os provedores lançam versões e descontinuam modelos antigos continuamente, a heurística baseada em padrões semânticos de finalidade textual (e exclusão de padrões incompatíveis) mantém o sistema adaptável e autônomo sem requerer hardcoding de listas fechadas.
**Ação**: Sempre aplicar filtros por finalidade de engenharia e agrupamento semântico dinâmico em qualquer provedor conectado ao AI Gateway, eliminando ruído e garantindo que apenas modelos 100% funcionais e adequados apareçam para seleção.

---

## 2026-10-19 — Desacoplamento Universal de Provedores no Research Lab

### Lição 33: Desacoplamento Universal de Provedores no Research Lab e Ciclo de Vida do Servidor
**Contexto**: O usuário configurou uma chave de API do Google Gemini (`gemini-3.8-flash`), mas ao iniciar a síntese autônoma de um laboratório de pesquisa ("Bolo de Banana"), o modal exibiu o badge fixo `GROQ CLOUD • SÍNTESE AUTÔNOMA EM TEMPO REAL` e um erro informando que o modelo não estava disponível no provedor Groq Cloud.
**Aprendizado**:
1. **Eliminação de Referências de Fornecedor Hardcoded em Recursos Legados**: Recursos concebidos originalmente para um único provedor (como o Research Lab inicial com Groq) devem ser completamente agnósticos quando o sistema evolui para um AI Gateway Universal. Textos estáticos em HTML/JS (ex: `Groq Cloud Conectado`, `Latência de Inferência (Groq)`, `Melhorar com IA (Groq)`, badges de modais) criam confusão cognitiva imediata no usuário quando outro provedor (Google Gemini, Claude, OpenAI) está ativo. 100% dos textos de interface devem interpolar dinamicamente `activeProvName = window.AI_GATEWAY_CONFIG.providerName`.
2. **Ciclo de Vida de Módulos Node.js em Servidores de Longa Duração**: Processos Node.js que mantêm `require('./scripts/research-engine')` em memória desde o boot mantêm o cache estático de bibliotecas antigas. Sempre que rotas dinâmicas como `/run` forem executadas, deve-se limpar o cache do módulo (`delete require.cache[...]`) ou chamar o singleton dinâmico `getAiGateway()`, garantindo que a configuração mais recente do `.env` e dos scripts seja imediatamente utilizada sem necessidade de reinicialização manual.
3. **Persistência de Metadados Claros nos Arquivos de Conhecimento**: Os arquivos Markdown gerados pelo motor autônomo devem gravar fielmente em seu frontmatter tanto o modelo quanto o provedor real utilizado (`model: "gemini-3.8-flash"`, `provider: "Google Gemini"`), garantindo auditabilidade e governança transparente em todo o cofre.
---

## 2026-10-21 — Acessibilidade WAI-ARIA & Ciclo de Foco em Modais (Inert Attribute)

### Lição 34: Blindagem contra violações de `aria-hidden` ("Blocked aria-hidden because its descendant retained focus")
**Contexto**: Ao fechar um modal de vídeo (`#promo-video-modal-9x16`, `#feature-modal` ou `#video-modal`) clicando no botão de fechar (`✕`), navegadores modernos baseados em Chromium (Chrome 122+) emitiam no console o erro/bloqueio:
`Blocked aria-hidden on an element because its descendant retained focus. The focus must not be hidden from assistive technology users. Avoid using aria-hidden on a focused element or its ancestor. Consider using the inert attribute instead...`
**Aprendizado**:
1. **Ordem de Operações no Desmonte/Fechamento de Modais**: Quando o usuário clica no botão de fechar ou pressiona a tecla Enter nele, o botão retém o foco ativo no navegador (`document.activeElement`). Se a função de fechamento invocar `modal.setAttribute('aria-hidden', 'true')` antes de retirar o foco do elemento filho, a especificação WAI-ARIA bloqueia a mutação para proteger leitores de tela e usuários de tecnologia assistiva. O foco DEVE ser explicitamente restaurado para o elemento disparador original (`triggerBtn.focus()`) ou desarmado (`blur()`) ANTES de alterar o atributo `aria-hidden` para `'true'`.
2. **Adoção do Atributo Nativo `inert`**: Modais fechados ou em estado inicial no HTML devem possuir `aria-hidden="true"` e o atributo booleano nativo `inert`. Ao abrir o modal, remove-se `inert` (`modal.removeAttribute('inert')`) e define-se `aria-hidden="false"`. Ao fechar, após transferir o foco, define-se `aria-hidden="true"` e adiciona-se `modal.setAttribute('inert', '')`. Isso impede nativamente que o modal receba eventos de teclado, cliques e leitura assistiva quando inativo.
---

## 2026-10-22 — Otimização de Core Web Vitals na Landing Page (Cloudflare Web Analytics)

### Lição 35: Otimização de LCP, INP e CLS em Páginas com Mídia Múltipla, WebGL e Modais
**Contexto**: A análise de dados de campo (RUM - Real User Monitoring) coletados via Cloudflare Web Analytics na landing page pública revelou gargalos críticos de Core Web Vitals: LCP no P75 de 5.800 ms (com Element Render Delay de 4.370 ms e poster de vídeo gerando LCP de até 31.8s), INP com 21% de interações lentas (picos de 944 ms ao clicar em cards de vídeo destacados e 400 ms ao abrir modais) e CLS pontual em `#vantagens` (0.425) e `#ai-gateway` (0.134).
**Aprendizado**:
1. **Compressão Agressiva de Posters de Vídeo (WebP)**: O uso de imagens PNG de alta resolução (`og-image.png`, 304 KB) como `poster` de players de vídeo causa atrasos severos no LCP em conexões móveis. A conversão para WebP (`promo-poster.webp`, 52 KB) reduziu o peso em 83% com preservação visual impecável.
2. **Priorização de Imagens no Viewport Superior (LCP)**: Logos ou imagens vetoriais no topo da página devem receber `fetchpriority="high"`, `<link rel="preload" as="image">` no `<head>` e dimensões explícitas (`width` e `height`) com `aspect-ratio` no CSS para que o navegador renderize o elemento imediatamente sem esperar reflows de CSS ou parsing completo de scripts.
3. **Prevenção de CLS em Diagramas e Mídia Dinâmica**: Imagens e diagramas SVG com `loading="lazy"` empurram todo o conteúdo abaixo deles quando terminam de carregar se o container pai não reservar o espaço vertical. Declarar `min-height: clamp(...)` no container (`.diagram-frame`) e `aspect-ratio: 920 / 520` nas imagens elimina 100% dos saltos de layout em seções inferiores (`#ai-gateway` e `#vantagens`).
4. **Isolamento de CPU/GPU e Grafo Three.js (INP)**: Ao abrir modais detalhados, o loop de animação do Three.js (`window.__brain.g`) DEVE ser pausado (`g.stop()`). Se o WebGL continuar renderizando a 60fps enquanto o JavaScript manipula centenas de nós DOM e syntax highlighting do modal, o Presentation Delay do navegador dispara para quase 1 segundo.
5. **Reprodução sob Demanda de Mídia com `IntersectionObserver`**: Tags `<video>` com `preload="auto"` e `autoplay` disputam a banda de rede e os decodificadores de hardware simultaneamente no boot da página. A configuração correta é `preload="none"` combinada com um `IntersectionObserver` que aciona `.play()` apenas quando o card cruza o viewport e `.pause()` ao sair. Ao fechar modais, nunca chame `.play()` em todos os vídeos em lote; retome apenas os que estão visíveis na tela.
**Ação**: Em páginas com WebGL e múltiplos cards de vídeo, sempre utilize `preload="none"`, `IntersectionObserver` para controle de reprodução, compressão WebP em posters, reserva explícita de `min-height`/`aspect-ratio` para evitar CLS e pausa do loop 3D durante exibição de modais.











