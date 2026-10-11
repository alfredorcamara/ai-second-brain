# Lições Aprendidas

## 2026-09-27 — Criação do AI Second Brain

### Lição 1: Formato nativo importa
**Contexto**: A versão 1 usava estrutura genérica (CLAUDE.md).
**Aprendizado**: Cada ferramenta (Antigravity, Claude Code, Cursor) tem seu
formato nativo de customização. Usar o formato nativo garante que as features
da ferramenta funcionem corretamente (descoberta automática de skills, rules, etc).
**Ação**: Sempre adapte o AI Second Brain para o formato da ferramenta em uso.

### Lição 2: AIJev não substitui código determinístico
**Contexto**: Tentação de usar AIJev para tudo que envolve decisão.
**Aprendizado**: Se uma regra pode ser escrita em código (if/else, switch),
não precisa de AIJev. AIJev é para decisões que envolvem contexto complexo
ou probabilidades.
**Ação**: Decision Gate obrigatório antes de integrar qualquer IA.

### Lição 3: LLM não é a resposta para tudo
**Contexto**: Tendência de chamar LLM para cada problema.
**Aprendizado**: LLM é caro, lento e não-determinístico. Use apenas quando
realmente precisa de geração de texto ou raciocínio aberto.
**Ação**: Sempre pergunte "isso pode ser feito sem IA?" antes de usar LLM.

### Lição 4: Catálogos de modelos de IA são efêmeros
**Contexto**: Ao configurar o Groq para o Research Lab, modelos consagrados como `llama-3.3-70b-versatile` já estavam descontinuados/deprecados no provedor.
**Aprendizado**: Provedores de nuvem (especialmente inferência rápida como Groq) alteram IDs e disponibilidade de modelos com frequência. Consultar a API de modelos (`GET /openai/v1/models`) em tempo de diagnóstico ou adotar modelos com alta janela de contexto (ex: `openai/gpt-oss-120b`) previne erros `404 model_decommissioned`.
**Ação**: Sempre incluir verificação de status e permitir parametrização do modelo via `.env` (`GROQ_MODEL`).

### Lição 5: Parsing defensivo de JSON gerado por LLMs
**Contexto**: A decomposição de tópicos exige retorno estritamente em JSON estruturado, mas LLMs frequentemente adicionam blocos ` ```json ... ``` ` ou texto introdutório.
**Aprendizado**: Clientes HTTP nativos devem sanitizar markdown fences e extrair blocos `{...}` ou `[...]` antes do `JSON.parse`.
**Ação**: Implementar regex de desempacotamento de markdown fence e fallback antes de falhar a requisição.

### Lição 6: Precedência de cache em localStorage e codificação UTF-8 no Windows
**Contexto**: O inicializador `.bat` exibia `ÔÇö` em vez de `—` no CMD, e o visualizador carregava um cache estático do `localStorage` mostrando 34 arquivos desordenados em vez de conectar ao servidor local ao vivo.
**Aprendizado**: 
1. No Windows, o interpretador CMD roda por padrão em página de código OEM (CP850 / CP437). Scripts `.bat` contendo caracteres UTF-8 devem obrigatoriamente executar `chcp 65001 >nul` no topo.
2. Em SPAs que suportam tanto servidor local quanto pasta offline, caches em `localStorage` não devem ter precedência sobre o servidor local em `localhost`. Race conditions durante a subida de processos exigem auto-reconexão com retentativas, e qualquer gerador offline deve manter paridade estrita de arquitetura de dados (árvore hierárquica) com o backend.
**Ação**: Sempre forçar UTF-8 em scripts de console e implementar auto-reconexão e limpeza automática de caches obsoletos no cliente web.

### Lição 7: Atualização atômica de variáveis de ambiente em tempo de execução
**Contexto**: Ao salvar uma nova chave de API ou trocar de provedor via modal BYOK, reiniciar o servidor interromperia a sessão web do usuário.
**Aprendizado**: É possível manter persistência física em arquivo `.env` (preservando comentários e adicionando chaves atômicas) e sincronizar imediatamente o objeto `process.env` em memória no mesmo tick de execução. Isso permite que rotas subsequentes utilizem as novas credenciais sem exigir restart do Node.js.
**Ação**: Sempre sincronizar `fs.writeFileSync('.env')` com mutação direta em `process.env[key] = value` para configurações de infraestrutura hot-swappable.

### Lição 8: Normalização de protocolos de IA (OpenAI vs Anthropic) sem dependências
**Contexto**: Diferentes provedores utilizam convenções distintas: a maioria segue o padrão `/v1/chat/completions` da OpenAI, enquanto a Anthropic exige `/v1/messages` com cabeçalho `x-api-key` e `anthropic-version`.
**Aprendizado**: Uma camada de abstração com zero dependências externas pode mapear transparentemente o formato de request e unificar a extração de resposta (`content[0].text` vs `choices[0].message.content`), mantendo o restante da aplicação agnóstico ao provedor escolhido.
**Ação**: Centralizar a tradução de payloads no gateway unificado e tratar `429` (Rate Limit) de maneira uniforme para disparar telas de contingência guiada.

### Lição 10: Normalização de Catálogo de Modelos (Strings vs Objetos) no Teste de Conexão BYOK
**Contexto**: No modal de configuração de IA (BYOK), o endpoint `/api/ai/test` retornava uma lista de strings de IDs de modelos, enquanto a interface web esperava objetos com propriedades `.id` e `.name`. Isso gerava opções `<option value="undefined">undefined</option>` no dropdown, impedindo a visualização dos modelos detectados.
**Aprendizado**: O backend de Gateway e o cliente frontend devem operar de forma defensiva e simétrica: o backend deve normalizar modelos como objetos tipados `{ id, name, contextWindow }`, filtrar modelos incompatíveis (áudio/guardrails em Groq e embeddings em OpenAI) e ordenar os recomendados no topo. O frontend, por sua vez, deve suportar tanto strings primitivas quanto objetos, apresentar contadores e chips de seleção rápida em 1 clique, e restaurar com segurança o modelo selecionado.
**Ação**: Sempre normalizar estruturas de modelos em `{ id, name, contextWindow }` no gateway, aplicar parsing polimórfico no JavaScript client e enriquecer a UX com badges e chips rápidos.

### Lição 11: Eliminação de Hardcoding de Modelos e Isolamento entre Vault Local e Demo Pública
**Contexto**: A presença de modelos de IA fixos em código gerava acoplamento artificial, enquanto a sincronização do scanner local com a pasta da demo pública sobrescreveu o projeto de demonstração (`demo-app`) com os projetos locais reais do desenvolvedor.
**Aprendizado**:
1. Provedores de IA evoluem seus catálogos continuamente; fixar nomes em código gera débito técnico imediato. O gateway deve operar de forma 100% dinâmica, descobrindo os modelos disponíveis em tempo real através da API do provedor (`GET /models` / `/api/tags`) a partir do teste de conexão acionado pelo usuário.
2. O ambiente de demonstração estático (`demo/`) da landing page e o ambiente local de desenvolvimento do workspace devem manter isolamento estrito de dados: o gerador `build_demo_vault.py` produz dados ilustrativos limpos (`demo-app`) para a web pública, enquanto o `scan-vault.js` mapeia os projetos reais do usuário apenas para o visualizador privado.
**Ação**: Remover listas estáticas de modelos de todos os arquivos de configuração e código, e manter os geradores de dados da demo pública completamente isolados da varredura do disco local.

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

### Lição 14: Zero Catálogos Estáticos de Modelos — Descoberta Dinâmica em Tempo Real com Auto-Trigger na Abertura
**Contexto**: A introdução temporária de um catálogo fixo de fallback (`AI_DEFAULT_MODELS_BY_PROVIDER`) para preencher o select antes do clique em "Testar" gerou discrepâncias (ex: textos verdes indicando conexão antes de os modelos estarem populados) e violou a filosofia fundamental de flexibilidade BYOK do AI Second Brain.
**Aprendizado**:
1. Catálogos estáticos de modelos de IA no frontend ou backend são antipadrões graves: APIs de IA evoluem semanalmente com novos lançamentos e deprecações, além de permissões variáveis por conta/chave.
2. Em interfaces de configuração com chave já salva, a UX correta e elegante é **provocar/disparar o teste de conexão (`testCurrentAiConnection()`) automaticamente na própria abertura da tela (`openAiSettingsModal`)**. O usuário presencia o handshake em tempo real, a latência autêntica é aferida e o seletor é populado com modelos vivos direto da API.
3. Se o usuário não possuir chave configurada, o seletor deve exibir exclusivamente o placeholder neutro orientativo (*"Clique em 'Testar' acima para listar os modelos disponíveis..."*) e manter o terminal em standby (`[IDLE]`), sem induzir falsos sucessos.
4. A versão demo deve adotar **exatamente a mesma arquitetura**: mocks de transporte de rede (`demo-mode.js`) interceptam a rota de teste e retornam respostas simuladas com latência realista, permitindo que o mesmo código JS rode com 100% de paridade em ambos os ambientes sem bifurcação nem catálogos fixos no código da UI.
**Ação**: NUNCA utilizar listas estáticas de modelos de IA em código JavaScript ou HTML. Sempre buscar modelos dinamicamente via requisição de teste provocada na abertura do modal ou por ação do usuário, assegurando paridade total entre o ambiente local e a demo pública.



