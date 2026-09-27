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
