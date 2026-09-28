# AI SECOND BRAIN — ALFREDO AI OS

> Este arquivo é o cérebro central do seu sistema de desenvolvimento com IA.
> Qualquer agente que trabalhar neste workspace deve seguir estas instruções.

---

## IDENTIDADE

Você é o agente de desenvolvimento do Alfredo. Você opera dentro de um sistema
estruturado chamado **AI Second Brain** que organiza conhecimento, decisões,
memória e regras para todos os projetos.

---

## ANTES DE EXECUTAR QUALQUER TAREFA

1. **Entenda o projeto** — Leia o `PROJECT.md` do projeto relevante em `projects/`.
2. **Leia as regras aplicáveis** — Verifique `.agents/rules/` para restrições.
3. **Leia o estado atual** — Consulte `CURRENT_STATE.md` do projeto.
4. **Leia decisões anteriores** — Verifique `DECISIONS/` do projeto.
5. **Identifique o tipo da tarefa** — Classifique antes de agir.

---

## CLASSIFICAÇÃO DE TAREFAS

Toda tarefa deve ser classificada antes da execução:

| Tipo | Descrição | Ação |
|------|-----------|------|
| **A. Determinística** | Lógica clara, sem ambiguidade | → Código/Regra |
| **B. Classificação** | Categorizar dados/eventos | → Avaliar AIJev/Jev |
| **C. Decisão** | Escolher entre alternativas | → Avaliar AIJev/Jev |
| **D. Geração** | Criar conteúdo/texto/código | → LLM |
| **E. Raciocínio aberto** | Análise exploratória | → LLM |
| **F. Execução** | Rodar script/deploy/build | → Código |
| **G. Investigação** | Debug/análise de logs | → Skill específica |

---

## REGRAS DE ROTEAMENTO DE IA

```
NOVA TAREFA
    │
    ▼
┌─────────────────┐
│ É determinística?│
└────────┬────────┘
         │
    SIM ─┴──────► CÓDIGO/REGRA
         │
    NÃO
         ▼
  É DECISÃO/CLASSIFICAÇÃO?
         │
    ┌────┴────┐
   SIM      NÃO
    │         │
    ▼         ▼
  AIJEV     PRECISA GERAR?
    │         │
    ▼    ┌────┴────┐
  REGRA SIM      NÃO
  DE     │        │
  NEGÓCIO▼        ▼
        LLM      AÇÃO
         │
         ▼
     VALIDAÇÃO
         │
         ▼
       AÇÃO
```

---

## REGRAS ABSOLUTAS

1. **NUNCA** utilize LLM simplesmente porque ele está disponível.
2. **NUNCA** utilize AIJev artificialmente quando código determinístico for suficiente.
3. **NUNCA** invente contexto que não existe na documentação do projeto.
   - Jamais crie arquivos, regras de negócio, telas, mecânicas ou especificações especulativas sem solicitação expressa do desenvolvedor.
   - Se uma informação, documento ou projeto ainda não foi detalhado pelo Alfredo, declare expressamente como "Não definido / Em conceituação" ou pergunte antes de agir.
   - O Segundo Cérebro serve para refletir a realidade dos projetos e decisões reais, NUNCA para fabricar conteúdo fictício ou preencher diretórios artificialmente.
4. **NUNCA** execute ações destrutivas sem confirmação explícita.
5. **NUNCA** altere arquitetura sem consultar decisões existentes.
6. **SEMPRE** valide o resultado de qualquer operação de IA.
7. **SEMPRE** atualize a memória após implementações significativas.
8. **SEMPRE** registre decisões arquiteturais relevantes.

---

## ANTES DE CRIAR NOVA INTEGRAÇÃO DE IA

Avalie cada item obrigatoriamente:

- [ ] AIJev é aplicável? → Consulte `knowledge/ai/AIJEV.md`
- [ ] Qual modelo é adequado? → Consulte `knowledge/ai/MODEL_SELECTION.md`
- [ ] Custo estimado?
- [ ] Latência aceitável?
- [ ] Segurança dos dados? → Consulte `.agents/rules/03-security.md`
- [ ] Fallback definido?
- [ ] Validação implementada?
- [ ] Observabilidade configurada?

---

## DEPOIS DA IMPLEMENTAÇÃO

1. Testar
2. Revisar
3. Atualizar documentação do projeto
4. Atualizar memória (`memory/`)
5. Registrar decisões relevantes (`decisions/`)

---

## GESTÃO DE PROJETOS

Os projetos conectados a este Segundo Cérebro residem em `projects/`. O workspace suporta qualquer tecnologia, linguagem ou domínio.

- **Novos Projetos**: Crie a pasta em `projects/<nome>/` utilizando o template `templates/project.md`.
- **Projetos Existentes**: Conecte repositórios externos via junções/symlinks conforme documentado em `docs/COMO_UTILIZAR_O_PROJETO.md`.

---

## REFERÊNCIAS

- AIJev: https://aijev.org/pt/
- Knowledge Base: `knowledge/`
- Templates: `templates/`
- Skills: `.agents/skills/`
- Rules: `.agents/rules/`
