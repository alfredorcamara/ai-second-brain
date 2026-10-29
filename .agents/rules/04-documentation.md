# Regras de Documentação

> Padrões para documentação em todos os projetos.

## Princípios

1. **Documentação é código** — Vive no repositório, versionada com Git.
2. **Atualizada ou deletada** — Documentação desatualizada é pior que nenhuma.
3. **Para o próximo desenvolvedor** — Escreva para quem não tem contexto.
4. **Decisões registradas** — Toda decisão arquitetural gera um ADR.
5. **Zero invenção de contexto** — NUNCA crie documentação especulativa, requisitos fictícios ou placeholders para simular progresso. Se um projeto ou funcionalidade ainda está em fase de ideia, a documentação deve registrar unicamente essa realidade.
6. **Localização Estrita de Cada Documento** — SEMPRE consulte e respeite onde cada documento deve residir antes de criá-lo:
   - `docs/` (raiz): **Exclusivo para os guias e manuais oficiais úteis para quem baixar o projeto** (ex: `COMO_UTILIZAR_O_PROJETO.md`, `GUIA_PRATICO.md`, `SOLUCAO_AI_SECOND_BRAIN.md`). NUNCA coloque relatórios de testes internos, sprints ou rascunhos de construção aqui.
   - `docs/internals/`: **Documentos de construção da ferramenta, relatórios de usabilidade (Dev Journey), planos de trabalho, rascunhos e debates de engenharia** entre Alfredo e a IA. Esta pasta é ignorada pelo `scan-vault.js` e `doctor.js` para manter o Cockpit 100% limpo para os desenvolvedores.
   - `decisions/GLOBAL_DECISIONS.md`: Registro oficial consolidado das decisões arquiteturais globais (ADRs).
   - `memory/`: Memória operacional perene da plataforma (somente `current-state.md`, `lessons-learned.md` e `README.md`; históricos extensos ficam em `memory/sessions/` e `memory/archive/`).
   - `projects/<nome>/`: Documentação e decisões estritamente isoladas dos projetos dos usuários.

## Tipos de Documentação

| Tipo | Onde | Finalidade / Público | Quando atualizar |
|------|------|----------------------|-----------------|
| **Manuais Oficiais** | `docs/` (raiz) | Usuários do Cockpit (Guias públicos) | Evoluções da plataforma |
| **Artefatos de Construção** | `docs/internals/` | Uso interno Alfredo/IA (Histórico de engenharia) | Sprints, testes de usabilidade, debates |
| **ADR Global** | `decisions/GLOBAL_DECISIONS.md` | Governança geral da plataforma | Decisões arquiteturais globais |
| **PROJECT.md** | `projects/<nome>/` | Visão e escopo do projeto do usuário | Mudanças de escopo |
| **ARCHITECTURE.md** | `projects/<nome>/` | Desenho técnico do projeto do usuário | Mudanças arquiteturais |
| **CURRENT_STATE.md** | `projects/<nome>/` | Status operacional do projeto do usuário | A cada sessão de trabalho |
| **ADR Local** | `projects/<nome>/DECISIONS/` | Decisões técnicas do projeto do usuário | Cada decisão arquitetural |
| **Knowledge** | `knowledge/<domínio>/` | Base de conhecimento transversal | Aprendizados novos |
| **Memory Plataforma** | `memory/` | Estado e governança perene do framework | Fim de cada sessão |

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
