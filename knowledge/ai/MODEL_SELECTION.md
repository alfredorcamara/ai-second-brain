# Seleção de Modelos de IA

## Critérios de Seleção

| Critério | Peso | Descrição |
|----------|------|-----------|
| **Qualidade** | Alto | Precisão e relevância do output |
| **Custo** | Alto | Custo por token/request |
| **Latência** | Médio | Tempo de resposta |
| **Privacidade** | Alto | Onde os dados são processados |
| **Disponibilidade** | Médio | Uptime e limites de rate |

## Modelos Recomendados por Caso de Uso

### Decisão/Classificação
1. **AIJev/Jev** — Decisões estruturadas (preferido)
2. **Regras determinísticas** — Fallback
3. **GPT-4o-mini / Gemini Flash** — Se necessário LLM

### Geração de Texto/Código
1. **Claude Opus** — Qualidade máxima (via Antigravity Pro)
2. **GPT-4o** — Alta qualidade, boa velocidade
3. **Gemini 2.5 Pro** — Bom equilíbrio
4. **Groq (Llama)** — Velocidade extrema, menor qualidade

### Análise de Código
1. **Claude Opus** — Melhor para código complexo
2. **GPT-4o** — Alternativa sólida
3. **Gemini 2.5 Pro** — Janela de contexto grande

### Embeddings
1. **text-embedding-3-small** — Custo baixo
2. **text-embedding-3-large** — Maior qualidade

## Providers

| Provider | Modelos | Uso Primário |
|----------|---------|-------------|
| **Antigravity Pro** | Claude, Gemini | Desenvolvimento |
| **OpenAI** | GPT-4o, o1, embeddings | Geração, análise |
| **Azure OpenAI** | GPT-4o (deploy próprio) | Produção enterprise |
| **Groq** | Llama, Mixtral | Velocidade, custo |
| **Local** | Ollama, LM Studio | Privacidade total |

## Regra de Ouro

> Comece sempre com o modelo mais simples e barato que atenda.
> Escale para modelos maiores apenas se necessário.
