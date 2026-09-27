# ADR-0001: AI Decision Gate como padrão de roteamento de IA

## Status
Aceita

## Data
2026-09-27

## Contexto
O JobSentinel precisa utilizar IA para analisar falhas de SQL Jobs,
mas não deve chamar GPT/LLM para cada evento. Precisamos de uma
estratégia que determine automaticamente quando usar IA e qual tipo.

## Decisão
Adotar o padrão AI Decision Gate que classifica cada tarefa:
1. Determinística → Código/Regras
2. Classificação/Decisão → AIJev/Jev
3. Geração/Explicação → LLM

Todo acesso a IA passa pelo AI Gateway, que abstrai os providers.

## Consequências
- Redução de custos com IA (não chama LLM desnecessariamente)
- Melhor performance (regras determinísticas são mais rápidas)
- Rastreabilidade de decisões
- Necessidade de implementar e manter o AI Gateway
- Necessidade de definir regras de roteamento

## Alternativas Consideradas
1. **Chamar LLM sempre** — Rejeitada: custo alto, latência, sem rastreabilidade.
2. **Apenas regras** — Rejeitada: perde capacidade de explicação contextual.
3. **AIJev apenas** — Rejeitada: não cobre geração de texto.
