# Regras de Documentação

> Padrões para documentação em todos os projetos.

## Princípios

1. **Documentação é código** — Vive no repositório, versionada com Git.
2. **Atualizada ou deletada** — Documentação desatualizada é pior que nenhuma.
3. **Para o próximo desenvolvedor** — Escreva para quem não tem contexto.
4. **Decisões registradas** — Toda decisão arquitetural gera um ADR.
5. **Zero invenção de contexto** — NUNCA crie documentação especulativa, requisitos fictícios ou placeholders para simular progresso. Se um projeto ou funcionalidade ainda está em fase de ideia, a documentação deve registrar unicamente essa realidade.

## Tipos de Documentação

| Tipo | Onde | Quando atualizar |
|------|------|-----------------|
| **PROJECT.md** | `projects/<nome>/` | Mudanças de escopo |
| **ARCHITECTURE.md** | `projects/<nome>/` | Mudanças arquiteturais |
| **CURRENT_STATE.md** | `projects/<nome>/` | A cada sessão significativa |
| **ADR** | `projects/<nome>/DECISIONS/` | Cada decisão arquitetural |
| **Knowledge** | `knowledge/<domínio>/` | Aprendizados novos |
| **Memory** | `memory/` | Fim de cada sessão |

## Formato de ADR (Architecture Decision Record)

```markdown
# ADR-XXXX: Título da Decisão

## Status
Proposta | Aceita | Rejeitada | Substituída

## Contexto
O que motivou esta decisão?

## Decisão
O que foi decidido?

## Consequências
O que muda com esta decisão?

## Alternativas Consideradas
Quais outras opções foram avaliadas?
```

## Memory Format

```markdown
# Sessão: YYYY-MM-DD

## O que foi feito
- Item 1
- Item 2

## Decisões tomadas
- Decisão 1

## Próximos passos
- Passo 1

## Aprendizados
- Lição 1
```
