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

