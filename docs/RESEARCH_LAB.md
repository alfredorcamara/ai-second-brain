# Research Lab — Laboratório de Conhecimento Autônomo

> **Subsistema de Pesquisa Inteligente e Catalogação Contínua do AI Second Brain**  
> Documento de Referência Arquitetural e Operacional

---

## 1. Visão Geral

O **Research Lab** é um subsistema do AI Second Brain que permite a cada projeto criar **Laboratórios de Pesquisa Temática**.

Em vez de buscas genéricas ou conversas efêmeras, o Research Lab opera de maneira autônoma e contextualizada:
1. O desenvolvedor define livremente um tema ou dúvida tecnológica para o seu projeto.
2. A IA (Groq Cloud) lê os contratos existentes do projeto (`PROJECT.md`, `ARCHITECTURE.md`) e refina o briefing, garantindo que a pesquisa atenda às restrições e objetivos reais daquele projeto.
3. O tema é decomposto em sub-tópicos com taxonomia clara.
4. O motor cataloga todo o conhecimento em arquivos `.md` organizados e versionados no disco sob a pasta do projeto.
5. Os arquivos gerados alimentam o Grafo Neural 3D do projeto e a memória de longo prazo.

---

## 2. As Duas Camadas de Conhecimento

Cada laboratório de pesquisa separa os aprendizados em duas camadas complementares:

```
projects/<nome-do-projeto>/RESEARCH/<slug-da-pesquisa>/
├── _meta.json                # Metadados, status e histórico de definições (Prompt Vivo)
├── OVERVIEW.md               # Panorama executivo e mapa neural dos tópicos
├── knowledge/                # CAMADA 1: CONHECIMENTO TEÓRICO E CONCEITUAL
│   ├── regras_fundamentais.md
│   ├── estado_da_arte.md
│   └── analise_comparativa.md
└── actionable/               # CAMADA 2: ESPECIFICAÇÕES APLICÁVEIS AO PROJETO
    ├── arquitetura_proposta.md
    ├── schema_sugerido.md
    └── regras_de_negocio.md
```

- **Camada 1 (`knowledge/`)**: O "quê" e o "porquê". Princípios, estado da arte, referências de mercado, fundamentos conceituais.
- **Camada 2 (`actionable/`)**: O "como aplicar no projeto". Especificações técnicas, pseudocódigo, decisões de schema e regras adaptadas à stack real do projeto.

---

## 3. O Conceito de "Prompt Vivo"

A definição de uma pesquisa não é estática. No AI Second Brain, adotamos o conceito de **Prompt Vivo**:
- O desenvolvedor pode reescrever a intenção ou ajustar o foco a qualquer momento.
- A IA pode sugerir melhorias no texto ("✨ Melhorar com IA") levando em conta o estado atual da governança.
- Cada nova versão da definição é registrada em `definitionHistory` dentro de `_meta.json`.
- Pesquisas futuras ou re-execuções comparam o histórico para identificar contradições, novidades ou complementações necessárias, sem perder o histórico anterior.

---

## 4. Arquitetura Técnica & Stack

- **Motor de Inferência**: [Groq Cloud](https://groq.com)
  - **Modelo padrão**: `openai/gpt-oss-120b` (128k de contexto, inferência de alta velocidade)
  - **Configuração**: Chave gerenciada em `.env` (`GROQ_API_KEY`) com fallback seguro
- **Zero Dependências**: Cliente nativo implementado em `scripts/groq-client.js` usando os módulos padrão do Node.js (`https`, `fs`, `path`).
- **Sanitização de Saída**: Tratamento defensivo de fences markdown (` ```json `) e extração de estruturas válidas.

---

## 5. Endpoints da API REST (`server.js`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/ai/status` | Retorna o status de configuração do Groq (ativo/inativo, modelo e máscara da chave) |
| `POST` | `/api/ai/refine-prompt` | Refina uma intenção bruta do usuário usando o contexto de `PROJECT.md` e `ARCHITECTURE.md` |
| `POST` | `/api/ai/decompose` | Decompõe o tema em lista de sub-tópicos com categoria (`knowledge` ou `actionable`) |
| `GET` | `/api/projects/:name/research` | Lista todos os laboratórios de pesquisa criados para o projeto indicado |
| `POST` | `/api/projects/:name/research` | Cria a estrutura física no disco para um novo laboratório (`_meta.json`, `OVERVIEW.md`, pastas) |
| `POST` | `/api/projects/:name/research/:slug/definition` | Atualiza a definição do laboratório com histórico versionado (Prompt Vivo) |
| `POST` | `/api/projects/:name/research/:slug/run` | Dispara o motor autônomo de síntese técnica e gravação dos arquivos `.md` no disco |
| `GET` | `/api/projects/:name/research/:slug/status` | Retorna se a pesquisa autônoma está em execução no momento |

---

## 6. Roadmap de Implementação

- [x] **Etapa 1: Backend & Motor Groq** (Concluído em 2026-10-02)
  - Módulo nativo `scripts/groq-client.js`
  - Endpoints REST no `server.js`
  - Proteção de variáveis em `.env` e `.gitignore`
  - Testes de integração validados com sucesso
- [x] **Etapa 2: Interface Visual (Brain UI - UX/UI UAU)** (Concluído em 2026-10-02)
  - Aba dedicada `🔬 Research Lab` no Project Workspace com contador no badge
  - Hero Banner espacial com glassmorphism, pulso de status Groq Cloud e métricas
  - Modal interativo de criação com botão mágico `✨ Melhorar com IA (Groq)`
  - Split View Comparador "Antes vs Depois" com aceitação/edição em 1 clique
  - Prévia de decomposição temática com chips luminosos (`knowledge` vs `actionable`)
  - Cards 3D de laboratórios com caixa do Prompt Vivo, contadores e ações rápidas
  - Modal de Prompt Vivo com linha do tempo de versões anteriores (`definitionHistory`)
  - Integração nativa com Windows Explorer para abrir pastas de pesquisa físicas
  - Correção de layout eliminando qualquer sobreposição do título com o badge `🟢 Ativo`
- [x] **Etapa 3: Motor de Execução Autônoma e Síntese de Conhecimento** (Concluído em 2026-10-02)
  - Motor de pesquisa autônoma implementado em `scripts/research-engine.js`
  - Síntese de artigos técnicos aprofundados com arquitetura, exemplos práticos de código, schemas de banco e trade-offs
  - Taxonomia em duas camadas: gravação física em `knowledge/` e `actionable/`
  - Resiliência com auto-retry e detecção de TPM limit na API da Groq Cloud
  - Resumabilidade inteligente: arquivos pré-existentes são preservados sem retrabalho
  - Consolidação automática em `OVERVIEW.md` com links relativos navegáveis
  - Integração com o Grafo Neural 3D (`scripts/scan-vault.js`) com ícones específicos para cada camada de pesquisa

