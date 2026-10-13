# Lições Aprendidas

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

