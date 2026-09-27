# Guia Prático do AI Second Brain

> 📖 **Para o manual detalhado com passo a passo para novos projetos e projetos legados:**  
> Consulte o documento oficial completo em: **[COMO_UTILIZAR_O_PROJETO.md](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/docs/COMO_UTILIZAR_O_PROJETO.md)**

## O que é o Segundo Cérebro?

O conceito de "segundo cérebro" vem da ideia de **externalizar o conhecimento
que está na sua cabeça** para um sistema organizado e pesquisável. Em vez de
depender da memória humana para lembrar decisões, contextos, padrões e lições
aprendidas, você documenta tudo em um formato que:

1. **Persiste** — Não se perde entre sessões.
2. **É pesquisável** — Encontre rapidamente o que precisa.
3. **É acionável** — O agente de IA usa o conhecimento para trabalhar melhor.
4. **Evolui** — Acumula conhecimento ao longo do tempo.

## Como usar na prática

### Cenário 1: Começar a trabalhar no JobSentinel

1. Abra o workspace AI_SECOND_BRAIN no Antigravity.
2. Diga: "Quero trabalhar no JobSentinel. Me dê o contexto atual."
3. O agente vai:
   - Ler `projects/JobSentinel/PROJECT.md`
   - Ler `projects/JobSentinel/CURRENT_STATE.md`
   - Ler decisões em `DECISIONS/`
   - Ler memória anterior
   - Te dar um resumo atualizado

### Cenário 2: Implementar uma nova feature

1. Diga: "Quero adicionar análise de falhas com IA ao JobSentinel."
2. O agente ativa a skill `ai-decision-gate` automaticamente.
3. Classifica a tarefa:
   - Detectar falha → Código/Regras
   - Classificar falha → AIJev
   - Explicar falha → LLM
4. Propõe implementação seguindo o AI Gateway pattern.
5. Após implementar, atualiza memória e documentação.

### Cenário 3: Investigar um bug

1. Diga: "O Job X está falhando com erro Y."
2. O agente ativa a skill `bug-investigation`.
3. Segue o processo estruturado de investigação.
4. Registra a resolução em memória e lessons-learned.

### Cenário 4: Novo projeto

1. Diga: "Quero adicionar um novo projeto chamado Z."
2. O agente ativa a skill `project-onboarding`.
3. Cria toda a estrutura de pastas e arquivos.
4. Preenche templates com suas informações.

### Cenário 5: Revisão de arquitetura

1. Diga: "Revise a arquitetura do JobSentinel."
2. O agente ativa a skill `architecture-review`.
3. Verifica checklist de qualidades arquiteturais.
4. Registra findings e recomendações.

## Fluxo de uma sessão de trabalho

```
INÍCIO DA SESSÃO
      │
      ▼
  CONTEXTO (ler estado atual, memória, decisões)
      │
      ▼
  TRABALHO (implementar, debugar, revisar)
      │
      ▼
  REGISTRO (atualizar memória, documentação)
      │
      ▼
FIM DA SESSÃO
```

## Manutenção do Segundo Cérebro

### Diária
- Atualizar `CURRENT_STATE.md` dos projetos em foco.
- Registrar sessão em `MEMORY/sessions/`.

### Semanal
- Revisar `memory/current-state.md` global.
- Verificar se lições aprendidas foram registradas.

### Por Sprint
- Atualizar roadmap dos projetos.
- Revisar decisões pendentes.
- Avaliar se knowledge base precisa de atualizações.

### Por Trimestre
- Revisar arquitetura dos projetos.
- Avaliar se skills precisam de ajustes.
- Limpar memória obsoleta.
