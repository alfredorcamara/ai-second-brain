# JobSentinel

## Visão Geral
Sistema de observabilidade inteligente para SQL Server Agent Jobs.
Transforma monitoramento passivo em inteligência operacional ativa.

## Stack
- **Backend**: .NET 8, C#, ASP.NET Core Web API
- **Banco**: SQL Server (monitoramento de Jobs do SQL Agent)
- **IA**: AIJev para decisões, LLM para explicações
- **Frontend**: Portal web para visualização

## Objetivos
1. Monitorar SQL Agent Jobs em tempo real
2. Detectar e classificar falhas automaticamente
3. Decidir ações com AIJev (escalar, alertar, retry)
4. Gerar explicações contextualizadas com LLM quando necessário
5. Prover portal para visibilidade operacional

## Arquitetura de IA

```
SQL JOB FALHOU
      │
      ▼
  EVENTO DETECTADO
      │
      ▼
  NORMALIZAÇÃO (dados estruturados)
      │
      ▼
  REGRAS DETERMINÍSTICAS (filtros simples)
      │
      ▼
  AIJEV / DECISION GATE
      │
      ├── operação normal → registra
      ├── incidente conhecido → alerta
      ├── necessita humano → escala
      └── necessita explicação
              │
              ▼
            LLM
              │
              ▼
          VALIDAÇÃO
              │
              ▼
        EXPLICAÇÃO NO PORTAL
```

## Status
- [ ] Arquitetura definida
- [ ] POC de monitoramento
- [ ] Decision Gate implementado
- [ ] AI Gateway configurado
- [ ] Portal básico
- [ ] Testes

## Links
- Arquitetura: `ARCHITECTURE.md`
- Estado atual: `CURRENT_STATE.md`
- Decisões: `DECISIONS/`
- IA: `AI/`
