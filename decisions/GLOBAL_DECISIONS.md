# Decisões Globais

> Decisões que afetam todos os projetos do AI Second Brain.

## ADR-G001: Adoção do AI Decision Gate Pattern
- **Status**: Aceita
- **Data**: 2026-09-27
- **Descrição**: Todo projeto que utilizar IA deve passar pelo Decision Gate
  para determinar se a tarefa é determinística, classificação/decisão, ou geração.
- **Detalhes**: Ver `.agents/rules/01-ai-decision.md` e `knowledge/ai/AIJEV.md`

## ADR-G002: AI Gateway como abstração unificada
- **Status**: Aceita
- **Data**: 2026-09-27
- **Descrição**: Todo acesso a IA deve ser feito através de interfaces abstratas
  (`IDecisionProvider`, `IGenerativeAIProvider`) para desacoplar de providers.
- **Detalhes**: Ver `knowledge/ai/AI_GATEWAY.md`

## ADR-G003: Formato Antigravity nativo para AI Second Brain
- **Status**: Aceita
- **Data**: 2026-09-27
- **Descrição**: O AI Second Brain utiliza o formato nativo do Antigravity
  (Rules, Skills, Plugins) em vez de formatos genéricos.
- **Motivo**: Garante descoberta automática e funcionamento correto das features.

## ADR-G004: Documentação como código
- **Status**: Aceita
- **Data**: 2026-09-27
- **Descrição**: Toda documentação vive no repositório, versionada com Git,
  em formato Markdown.

## ADR-G005: Research Lab Engine com Groq Cloud & Prompt Vivo
- **Status**: Aceita
- **Data**: 2026-10-02
- **Descrição**: O Research Lab é adotado como subsistema do AI Second Brain para pesquisa autônoma e catalogação de conhecimento de projetos em Markdown. A inferência de refinamento de briefing e decomposição de temas utiliza o Groq Cloud via módulo HTTP nativo sem dependências npm (`scripts/groq-client.js`). O conceito de "Prompt Vivo" é estabelecido: o usuário pode refinar e alterar a intenção a qualquer momento, mantendo versionamento em `_meta.json` (`definitionHistory`) para permitir re-pesquisa incremental.
- **Detalhes**: Ver `docs/RESEARCH_LAB.md` e artefatos de decisão do Research Lab.

## ADR-G006: AI Gateway Multi-Provedor com Arquitetura BYOK (Bring Your Own Key)
- **Status**: Aceita
- **Data**: 2026-10-09
- **Descrição**: O AI Second Brain desacopla a camada cognitiva de qualquer fornecedor de IA exclusivo, implementando uma arquitetura universal BYOK (`Bring Your Own Key`) no cliente nativo `scripts/ai-gateway.js`.
- **Motivo**: 
  1. **Soberania e Liberdade do Desenvolvedor**: Permitir alternar livremente entre Groq Cloud (gratuito e veloz), OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), OpenRouter (+300 modelos), Ollama Local (100% offline e sem custos) e endpoints customizados.
  2. **Privacidade e Segurança**: As credenciais nunca transitam para nuvens externas de telemetria; são gravadas atomicamente no arquivo `.env` local na máquina do usuário e protegidas no `.gitignore`.
  3. **Zero Dependências**: Toda a comunicação HTTP/HTTPS com APIs OpenAI-compatible e Anthropic `/v1/messages` utiliza exclusivamente as bibliotecas nativas `http` e `https` do Node.js.
  4. **Resiliência a Falhas e Cota (429)**: Ping ao vivo de latência e detecção automática de esgotamento de créditos com interceptador gráfico guiando a troca de provedor sem interromper o fluxo de trabalho.
- **Detalhes**: Ver `scripts/ai-gateway.js`, `server.js` e modais em `docs/brain-ui/index.html`.

## ADR-G007: Captura de Sessão Assistida por IA com Revisão Humana Obrigatória (Session Capture)
- **Status**: Aceita
- **Data**: 2026-10-12
- **Descrição**: A captura de memória diária de projetos conectados passa a ser assistida por IA através de um pipeline em duas etapas coordenadas:
  1. **Coleta Determinística & Rascunho IA (Somente Leitura)**: `POST /api/projects/:name/session/draft` lê dados de telemetria Git (commits, nomes de arquivos modificados, diffstat com censura de arquivos sensíveis como `.env`), snapshot de contratos (`PROJECT.md`, `CURRENT_STATE.md`, `LESSONS_LEARNED.md`) e notas opcionais do desenvolvedor. A IA atua exclusivamente na redação e estruturação em JSON tipado. **Nada é gravado no disco nesta etapa**.
  2. **Revisão Humana Interativa & Gravação Atômica**: O desenvolvedor revisa título, markdown de resumo, checkboxes de passos concluídos, novos passos e lições aprendidas sugeridas. Apenas sob clique explícito em "Gravar na memória", o endpoint `POST /api/projects/:name/session/commit` realiza gravação física no disco (`MEMORY/sessions/AAAA-MM-DD-titulo.md`), atualiza cirurgicamente `CURRENT_STATE.md` (remanejando itens concluídos e preservando seções adicionais e estilo CRLF) e anexa novas lições a `LESSONS_LEARNED.md`.
- **Motivo**: Elimina o atrito do registro manual de sessões e a amnésia de contexto entre agentes sem risco de alucinação ou perda de controle, respeitando o princípio de *Zero Fabricação*.
- **Detalhes**: Ver `scripts/session-capture.js`, `scripts/ai-gateway.js` e interface em `docs/brain-ui/`.



