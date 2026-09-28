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

### Cenário 1: Começar a trabalhar em um projeto

1. Abra o workspace AI_SECOND_BRAIN no Antigravity.
2. Diga: "Quero trabalhar no [NomeDoProjeto]. Me dê o contexto atual."
3. O agente vai:
   - Ler `projects/[NomeDoProjeto]/PROJECT.md`
   - Ler `projects/[NomeDoProjeto]/CURRENT_STATE.md`
   - Ler decisões em `DECISIONS/`
   - Ler memórias de sessões anteriores
   - Te dar um resumo atualizado

### Cenário 2: Implementar uma nova feature com IA

1. Diga: "Quero adicionar uma funcionalidade de classificação inteligente ao [NomeDoProjeto]."
2. O agente ativa a skill `ai-decision-gate` automaticamente.
3. Classifica a tarefa:
   - É determinística? → Código puro / Regra de negócio
   - É classificação ou decisão? → Avaliar AIJev / Árvore de decisão
   - É raciocínio aberto ou geração? → LLM via AI Gateway
4. Propõe a arquitetura antes de escrever qualquer código.
5. Após implementar e validar, atualiza memória e documentação.

### Cenário 3: Investigar um bug ou incidente

1. Diga: "O módulo X está falhando com o erro Y."
2. O agente ativa a skill `bug-investigation`.
3. Segue o processo estruturado de investigação (hipótese → teste → causa raiz).
4. Registra a resolução e atualiza `memory/lessons-learned.md`.

### Cenário 4: Onboarding de um novo projeto

1. Diga: "Quero iniciar um novo projeto chamado MeuNovoApp."
2. O agente ativa a skill `project-onboarding`.
3. Cria a estrutura padronizada em `projects/MeuNovoApp/`.
4. Preenche os templates contratuais com as especificações que você definir.

### Cenário 5: Revisão de arquitetura

1. Diga: "Revise a arquitetura do [NomeDoProjeto]."
2. O agente ativa a skill `architecture-review`.
3. Verifica checklist de qualidades arquiteturais (desacoplamento, segurança, resiliência).
4. Registra findings e recomendações em um novo ADR.

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
