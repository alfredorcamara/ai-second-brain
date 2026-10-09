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

