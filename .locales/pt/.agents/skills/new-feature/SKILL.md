---
name: new-feature
description: >-
  Guia para implementação de novas funcionalidades em qualquer projeto.
  Use quando o usuário quiser adicionar uma nova feature, endpoint, serviço,
  ou componente a um projeto existente.
---

# New Feature Implementation

## Pré-requisitos

1. Leia o `PROJECT.md` do projeto alvo.
2. Leia o `ARCHITECTURE.md` para entender a estrutura.
3. Leia o `CURRENT_STATE.md` para contexto atual.
4. Verifique `DECISIONS/` para decisões relevantes.

## Processo

### 1. Definir a Feature

Use o template `templates/feature-spec.md`:
- **O que**: Descrição clara da funcionalidade.
- **Por que**: Motivação e valor.
- **Como**: Abordagem técnica proposta.
- **Critérios de aceite**: Quando está "pronto"?

### 2. Avaliar Impacto

- [ ] Afeta a arquitetura? → Consulte `ARCHITECTURE.md`
- [ ] Envolve IA? → Execute a skill `ai-decision-gate`
- [ ] Afeta o banco de dados? → Migration necessária?
- [ ] Afeta APIs? → Versionamento necessário?
- [ ] Afeta segurança? → Consulte `.agents/rules/03-security.md`

### 3. Implementar

Seguindo as regras do projeto:
- `.agents/rules/04-dotnet.md` para código .NET
- `.agents/rules/05-sql-server.md` para SQL
- Padrões estabelecidos na `ARCHITECTURE.md`

### 4. Testar

- Testes unitários para lógica de negócio.
- Testes de integração quando envolve I/O.
- Verificar edge cases.

### 5. Documentar

- Atualizar `CURRENT_STATE.md`.
- Criar ADR se envolve decisão arquitetural.
- Atualizar `API/` se envolve endpoints novos.

### 6. Registrar na Memória

Atualizar `MEMORY/` do projeto com o que foi implementado.
