# AIJev / Jev — Referência

> Fonte: https://aijev.org/pt/

## O que é

AIJev/Jev é uma **camada de decisão estruturada** para software:
- O software fornece um **estado** e **perguntas predefinidas**.
- Recebe **decisões tipadas** com probabilidades.
- Diferente de um LLM que gera texto livre.

## Quando usar

| Cenário | Use AIJev? | Alternativa |
|---------|-----------|-------------|
| Classificar evento | ✅ Sim | - |
| Priorizar alerta | ✅ Sim | - |
| Decidir ação | ✅ Sim | - |
| Gerar texto | ❌ Não | LLM |
| Responder pergunta | ❌ Não | LLM |
| Cálculo determinístico | ❌ Não | Código |

## Padrão: Identificar → Gerar → Validar

1. **Identificar**: O que está acontecendo? (estado + contexto)
2. **Gerar**: Qual a decisão? (AIJev processa)
3. **Validar**: A decisão é coerente? (validação programática)

## Implementação Canônica Nativa no AI Second Brain (`RulesDecisionProvider`)

O AI Second Brain inclui uma implementação canônica e nativa em Node.js localizada em [`scripts/decision-provider.js`](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/scripts/decision-provider.js).

Ela executa com **latência de 0ms, custo zero de tokens e 100% offline**, servindo como provedor padrão de alta performance:

```javascript
const { RulesDecisionProvider, defaultDecisionProvider } = require('./scripts/decision-provider');

// Execução síncrona determinística (0ms)
const result = defaultDecisionProvider.decideSync({
    context: 'quickstart-refine',
    question: 'incluir dicionario de dados da tabela de clientes',
    state: { projectInfo, contracts, clarification: null },
    options: ['PROJECT.md', 'ARCHITECTURE.md', 'CURRENT_STATE.md', 'ADR-0001']
});

console.log(result);
// {
//   decision: 'PROCEED',
//   ruleId: 'JEV-RULE-ARCH-DATA',
//   intentClass: 'ARCHITECTURE_DATA',
//   confidence: 0.96,
//   rationale: 'Detectada alteração técnica de arquitetura, dados ou endpoints. Isolação estrita em ARCHITECTURE.md.',
//   targetDocs: ['ARCHITECTURE.md'],
//   clarification: null
// }
```

### Características do `RulesDecisionProvider`:
1. **Rastreabilidade e Auditoria Total**: Cada decisão carrega `ruleId`, probabilidade numérica tipada (`confidence`) e justificativa determinística (`rationale`).
2. **Detecção de Ambiguidade Técnica (*Human-in-the-Loop*)**: Se o usuário fornecer instruções vagas para domínios sensíveis (Pagamentos, Mensageria, Autenticação, Infraestrutura), o provedor retorna `decision: 'CLARIFY'`, gerando pergunta técnica direcionada e opções para preenchimento obrigatório antes de qualquer chamada generativa.
3. **Composição Dinâmica Multi-Target**: Suporta isolamento cirúrgico de um único documento ou autorização combinada de múltiplos contratos sem poluição cruzada.

## Integração com .NET

```csharp
// Abstração
public interface IDecisionProvider
{
    Task<DecisionResult> DecideAsync(
        DecisionRequest request,
        CancellationToken ct);
}

// Uso
var request = new DecisionRequest(
    Context: "SQL Job 'BackupProd' falhou",
    Question: "Qual a ação adequada?",
    State: new() { ["errorCode"] = 1234, ["retries"] = 3 },
    Options: ["retry", "alert", "escalate", "explain"]
);

var result = await _decisionProvider.DecideAsync(request, ct);
```

## Disponibilidade

> 💡 **Implementação Local Garantida**: Enquanto a API remota do aijev.org opera com solicitação de acesso privada, o AI Second Brain opera 100% desacoplado através do `RulesDecisionProvider` nativo em `scripts/decision-provider.js`, garantindo autonomia total.

