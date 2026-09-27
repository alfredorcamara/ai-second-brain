# JobSentinel — Casos de Uso de IA

## Caso 1: Classificação de Falha de Job

| Aspecto | Detalhe |
|---------|---------|
| **Tipo** | Classificação |
| **Abordagem** | AIJev primeiro, fallback para regras |
| **Input** | Erro do Job, histórico, contexto |
| **Output** | Categoria de falha + ação recomendada |
| **Latência** | < 200ms |

## Caso 2: Explicação de Falha

| Aspecto | Detalhe |
|---------|---------|
| **Tipo** | Geração |
| **Abordagem** | LLM (somente quando Decision Gate autoriza) |
| **Input** | Erro, contexto, histórico, decisão do AIJev |
| **Output** | Explicação em linguagem humana |
| **Latência** | < 5s |

## Caso 3: Detecção de Padrões

| Aspecto | Detalhe |
|---------|---------|
| **Tipo** | Análise/Classificação |
| **Abordagem** | Regras + AIJev para edge cases |
| **Input** | Histórico de execuções (janela temporal) |
| **Output** | Padrões identificados + alertas |
| **Latência** | Batch (não real-time) |

## Caso 4: Recomendação de Ação

| Aspecto | Detalhe |
|---------|---------|
| **Tipo** | Decisão |
| **Abordagem** | AIJev |
| **Input** | Classificação da falha + estado do sistema |
| **Output** | Ação recomendada (retry, alert, escalate) |
| **Latência** | < 200ms |
