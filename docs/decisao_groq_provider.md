# Decisão: Groq como Provedor de IA para o Research Lab

> **Data**: 2026-10-02  
> **Status**: ✅ Aprovada  
> **Contexto**: Escolha do provedor de IA para o motor de pesquisa e refinamento de prompts do Research Lab

---

## Decisão

Utilizar a **API do Groq** (https://groq.com) como motor de IA para:
1. **Refinamento de Prompts** — Melhorar as definições de pesquisa escritas pelo usuário
2. **Decomposição de Tópicos** — Quebrar um assunto em sub-tópicos pesquisáveis
3. **Síntese de Pesquisa** — Organizar e gerar os `.md` de conhecimento

## Por que Groq?

| Critério | Groq | Justificativa |
|----------|------|---------------|
| **Velocidade** | ⚡ Extremamente rápida | LPU (Language Processing Unit) — hardware dedicado para inferência |
| **Custo** | 🟢 Free tier generoso | Rate limits razoáveis para uso de desenvolvimento |
| **Compatibilidade** | ✅ API compatível com OpenAI | Mesmo formato de request/response — fácil de trocar provedor se necessário |
| **Modelos** | 🟢 Open-source de qualidade | Llama 3.3 70B, Mixtral, etc. |
| **Privacidade** | 🟢 Dados não usados para treino | Política clara de dados |

## Modelo Selecionado

**`llama-3.3-70b-versatile`** — Modelo principal para todas as operações do Research Lab.

| Propriedade | Valor |
|-------------|-------|
| Contexto | 128K tokens |
| Output máximo | ~32K tokens |
| Velocidade | ~250 tokens/s |
| Qualidade | Alta — equivalente a modelos proprietários para tarefas de síntese |

**Fallback**: `llama-3.1-8b-instant` — Para operações simples (decomposição rápida de tópicos) quando velocidade é mais importante que profundidade.

## Configuração de Segurança

```
✅ API Key armazenada em .env (NÃO commitada)
✅ .gitignore atualizado com .env, .env.local, .env.*.local
⚠️  Recomendação: regenerar a chave no painel do Groq
```

### Arquivos configurados

| Arquivo | O que faz |
|---------|-----------|
| [.env](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/.env) | Armazena `GROQ_API_KEY` e configurações |
| [.gitignore](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/.gitignore) | Protege `.env` de ser commitado |

## Integração com o Server.js

A API do Groq é compatível com o formato OpenAI. A integração no [server.js](file:///c:/Projetos/SaaS/Google%20Antigravity/Projetos/AI_SECOND_BRAIN/server.js) será via `fetch` nativo do Node.js (sem dependências externas):

```javascript
// Exemplo de chamada — Refinamento de Prompt
async function refineResearchPrompt(userText, projectContext) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `Você é um assistente especializado em refinar definições de pesquisa 
                    para um laboratório de conhecimento. O projeto atual tem o seguinte contexto:
                    
                    ${projectContext}
                    
                    Sua tarefa: reescrever o texto do usuário para que seja uma definição 
                    de pesquisa clara, estruturada e focada no que é relevante para o projeto.
                    Mantenha a linguagem acessível — deve parecer que o próprio usuário escreveu, 
                    só que com mais clareza. Adicione bullet points de foco e exclusões.`
                },
                {
                    role: 'user',
                    content: userText
                }
            ],
            temperature: 0.7,
            max_tokens: 2048
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}
```

## Use Cases no Research Lab

### 1. Refinamento de Prompt (✨ Melhorar com IA)
- **Input**: Texto livre do usuário
- **Contexto**: PROJECT.md + ARCHITECTURE.md do projeto
- **Output**: Definição refinada e estruturada
- **Modelo**: `llama-3.3-70b-versatile`
- **Tokens estimados**: ~500-1000 por refinamento

### 2. Síntese de Pesquisa
- **Input**: Conteúdo de web search + definição do usuário
- **Output**: Arquivo `.md` estruturado com knowledge + actionable
- **Modelo**: `llama-3.3-70b-versatile`
- **Tokens estimados**: ~2000-4000 por arquivo gerado

## Risco e Mitigação

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Rate limit atingido | Média | Queue de requests com retry + exponential backoff |
| Modelo descontinuado | Baixa | API compatível com OpenAI — trocar modelo é mudar 1 variável |
| Qualidade insuficiente | Baixa | Fallback para modelo maior ou provedor alternativo |
| Chave exposta | Mitigada | `.env` + `.gitignore` configurados |
