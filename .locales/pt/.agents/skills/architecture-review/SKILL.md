---
name: architecture-review
description: >-
  Revisão de arquitetura para projetos existentes ou novas propostas arquiteturais.
  Use quando o usuário quiser revisar, avaliar ou propor mudanças na arquitetura
  de um projeto, incluindo padrões, decisões técnicas e trade-offs.
---

# Architecture Review

## Checklist de Revisão

### 1. Contexto
- [ ] Li o `PROJECT.md` e `ARCHITECTURE.md`
- [ ] Li decisões anteriores em `DECISIONS/`
- [ ] Entendo os requisitos não-funcionais

### 2. Princípios
- [ ] Single Responsibility em cada camada
- [ ] Dependency Inversion (abstrações, não implementações)
- [ ] Separation of Concerns clara
- [ ] YAGNI — não sobre-engenharia

### 3. Qualidades Arquiteturais

| Qualidade | Perguntas |
|-----------|-----------|
| **Manutenibilidade** | O código é fácil de mudar? |
| **Testabilidade** | Cada componente pode ser testado isolado? |
| **Observabilidade** | Consigo saber o que está acontecendo em produção? |
| **Resiliência** | O que acontece quando X falha? |
| **Performance** | A latência é aceitável? |
| **Segurança** | Os dados estão protegidos? |
| **Escalabilidade** | Funciona com 10x mais carga? |

### 4. Se envolve IA
- [ ] Decision Gate aplicado (skill: `ai-decision-gate`)
- [ ] Provider abstraído via interface
- [ ] Fallback configurado
- [ ] Validação de output implementada
- [ ] Observabilidade de IA configurada

### 5. Documentar

- Crie ADR para cada decisão tomada.
- Atualize `ARCHITECTURE.md` se houve mudanças.
- Registre em memória.
