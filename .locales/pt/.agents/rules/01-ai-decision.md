# Regras de Decisão com IA

> Define quando e como utilizar diferentes tipos de IA nas tarefas.

## Classificação Obrigatória

Antes de utilizar qualquer recurso de IA, classifique a tarefa:

### Nível 1: Determinístico
- **Quando**: A resposta pode ser calculada ou derivada de regras.
- **Ação**: Use código, queries SQL, ou regras de negócio.
- **Exemplos**: Validação de dados, cálculos, formatação, CRUD.

### Nível 2: Classificação/Decisão
- **Quando**: Precisa categorizar, priorizar ou decidir entre alternativas.
- **Ação**: Avalie AIJev/Jev antes de usar LLM.
- **Exemplos**: Classificar severidade de incidentes, priorizar alertas, decidir ações.

### Nível 3: Geração
- **Quando**: Precisa criar conteúdo, explicar algo, ou raciocinar de forma aberta.
- **Ação**: Use LLM com prompt estruturado e validação.
- **Exemplos**: Explicar falhas, gerar relatórios, sugerir melhorias.

### Nível 4: Composto
- **Quando**: Tarefa combina decisão + geração.
- **Ação**: AIJev para decidir → LLM para gerar → Validação.
- **Exemplos**: Analisar Job falho e gerar explicação contextualizada.

## Regra de Ouro

```
SE pode ser resolvido com código → CÓDIGO
SE precisa decidir/classificar → AIJEV primeiro
SE precisa gerar/explicar → LLM
SEMPRE → VALIDAR resultado
```

## Proibições

- ❌ Usar LLM para tarefas determinísticas
- ❌ Chamar IA generativa para cada evento/Job
- ❌ Ignorar AIJev quando a tarefa é de decisão
- ❌ Aceitar resultado de IA sem validação
- ❌ Hardcodar provider de IA (usar abstrações)
- ❌ Hardcodar listas ou catálogos de modelos de IA (catálogo deve ser 100% dinâmico via API)
