# Lições Aprendidas Universais — AI Second Brain

> Registros perenes de engenharia, governança e integração com IA.
> Devem ser consultados pelo desenvolvedor e por qualquer agente de IA antes de arquitetar código.

---

## 🏛️ Princípios Dourados de Governança com IA

1. **Zero Fabricação**: O modelo NUNCA deve inventar bibliotecas inexistentes, rotas especulativas ou regras que não constam nos contratos.
2. **Código Determinístico Antes de LLM (JEV-First)**: Se uma tarefa puder ser resolvida com regras determinísticas, regex ou código tradicional, não use IA generativa.
3. **Catálogos 100% Dinâmicos**: NUNCA crie listas fixas (hardcoded) de modelos de IA no código ou HTML. O catálogo deve ser consultado em tempo real via API do provedor.
4. **Isolamento de Segredos**: Credenciais e chaves de API NUNCA são gravadas no Git; pertencem exclusivamente ao arquivo local `.env`.

---

## 📐 Lições Arquiteturais do Framework

### Lição: Roteamento Cirúrgico de Especificações e Limites de Token
- **Contexto**: Documentos de especificação extensos passados inteiramente para o modelo geravam estouro de tokens de saída (`max_tokens`) e loops de repetição.
- **Padrão Correto**: Roteamento semântico de seções. Escopo e regras de negócio alimentam o `PROJECT.md`. Esquemas de banco, tabelas e endpoints alimentam `ARCHITECTURE.md`. Arquivos com código de alta densidade devem ser gerados em chamadas dedicadas com retorno limpo.

### Lição: Propagação Universal de Falhas de Cota (429) e Resiliência BYOK
- **Contexto**: Quando ocorria limite de taxa (`429 Rate Limit`), chamadas genéricas retornavam HTTP 500 sem metadados claros, causando sensação de travamento na interface.
- **Padrão Correto**: Todos os módulos de IA devem propagar `quotaExceeded`, `isRateLimit`, `retryAfter` e `providerName` preservando o status HTTP 429. O cliente local deve alertar o usuário e sugerir troca de modelo ou provedor.

### Lição: Preservação de Documentos de Origem em `SPECS/`
- **Contexto**: Documentos de briefing ou PRDs fornecidos no início do projeto corriam o risco de ser esquecidos após a geração dos contratos.
- **Padrão Correto**: Salvar cópias de briefing em `SPECS/` do projeto garante rastreabilidade e impede que a IA faça perguntas redundantes durante sabatinas técnicas.

---

## 🗄️ Arquivo de Lições Específicas
- [Lições de Performance Audiovisual e UI (MP4, GOP e Compositor)](archive/video-and-ui-lessons.md)
