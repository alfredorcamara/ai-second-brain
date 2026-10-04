# Estado Atual do AI Second Brain

> Última atualização: 2026-10-02

## Status do Framework: 🟢 Operacional & UX/UI Avançado + 🔬 Research Lab 100% Funcional (Etapas 1, 2 e 3 Concluídas)

O AI Second Brain está estruturado como uma plataforma universal de governança e desenvolvimento com IA, livre de acoplamento a projetos específicos e equipada com um portal web moderno e motor de pesquisa autônoma resiliente.

## Estrutura do Workspace

| Diretório | Papel | Estado |
|---|---|---|
| `.agents/rules/` | Regras universais de governança (IA, Segurança, Docs) | ✅ Agnósticas |
| `.agents/skills/` | Workflows reutilizáveis para Antigravity | ✅ 8 skills ativas |
| `knowledge/` | Base de conhecimento em IA, Arquitetura e Segurança | ✅ 100% universal |
| `projects/` | Projetos conectados pelo desenvolvedor | 🟢 Suporta Greenfield & Brownfield + RESEARCH/ |
| `memory/` | Memória de continuidade entre sessões | ✅ Operacional |
| `templates/` | Modelos para novos projetos, specs e ADRs | ✅ Disponíveis |
| `docs/brain-ui/` | Portal web interativo de visualização e governança | 🚀 UX/UI com Project Workspace & Grafo 3D |
| `scripts/` | Utilitários de infraestrutura e clientes IA nativos | ⚡ Zero-deps (Scan, Groq Client, Research Engine) |

## Sessões Recentes
- **Data**: 2026-10-02
  - **Research Lab (Laboratório de Conhecimento Autônomo) — Etapa 3 (Motor de Execução Autônoma, Resiliência & Síntese Markdown)**:
    - **Motor Autônomo (`scripts/research-engine.js`)**: Executa a varredura completa da taxonomia de subtópicos, gerando documentos `.md` profundos, estruturados com código, schemas SQL/Prisma e boas práticas.
    - **Taxonomia de Duas Camadas**: Arquivos organizados automaticamente em `knowledge/` (fundamentos e padrões conceituais) e `actionable/` (código, implementação, schemas e testes).
    - **Resiliência e Recuperação de Rate Limit no Groq Client (`scripts/groq-client.js`)**:
      - Parser automático de cabeçalho e mensagens de erro ("Please try again in X.XXs").
      - Backoff com tempo extra de segurança (+2s) e retentativas automáticas até 3x sem abortar o lote.
      - Fallback inteligente de modelo para `openai/gpt-oss-20b` caso o modelo de 120b sature a cota TPM.
      - Pausa estratégica de 6s entre arquivos para evitar saturação do bucket de tokens por minuto da camada gratuita.
      - Resumabilidade inteligente: arquivos já existentes no disco são preservados e reaproveitados automaticamente caso uma execução seja retomada.
    - **Consolidação em `OVERVIEW.md` e `_meta.json`**: Gera índice completo do laboratório com links markdown relativos clicáveis para cada documento e marca `status: "completed"`.
    - **Integração com Grafo Neural 3D (`scripts/scan-vault.js`)**: Mapeamento de nós do laboratório com ícones dedicados (`🔬` para pastas/overview, `📘` para knowledge e `🛠️` para actionable) orbitando a estrela central do projeto.
    - **Validação Prática Real**: Execução completa no projeto `teste_alfredo_22` gerando 9 arquivos técnicos completos (8 em `knowledge/` e 1 em `actionable/`) totalizando mais de 100KB de documentação técnica gerada autonomamente.
    - **Catálogo de Subtópicos & Documentos Conectado ao Disco**:
      - Corrigido o modal de subtópicos (`openDecomposeModal`): eliminado o gatilho redundante de consulta à IA quando a pesquisa já possui arquivos gerados no disco.
      - O modal agora renderiza fielmente todos os arquivos reais existentes em `knowledge/` e `actionable/` (9 de 9 no caso do Bolo de Banana).
      - Adicionados botões de ação direta em cada documento: `✏️ Editar / Ler` (abre no Live Markdown Editor para visualização e edição imediata com salvamento no disco via Ctrl+S) e `🗑️ Excluir` (remove o arquivo do disco, atualiza `_meta.json` e o `OVERVIEW.md`).
      - Adicionado botão de exclusão completa do laboratório de pesquisa (`🗑️`) no cabeçalho de cada card de pesquisa.
      - Novos endpoints backend: `POST /api/projects/:name/research/:slug/file/delete` e `POST /api/projects/:name/research/:slug/delete`.
  - **Research Lab — Etapa 2 (UX/UI UAU no Brain Visualizer)**:
    - **Aba Dedicada `🔬 Research Lab` no Project Workspace**: Integrada à navegação com pílula de contagem dinâmica (`#pwResearchTabBadge`).
    - **Hero Banner com Glassmorphism Espacial**: Header com gradiente cósmico, badge pulsante verde de status da Groq Cloud (`openai/gpt-oss-120b`), latência média de inferência (~1.5s) e botão de ação primária `✨ Nova Pesquisa no Lab`.
    - **Cards Métricos do Lab**: Mapeamento em tempo real do total de pesquisas ativas, documentos em `knowledge/`, especificações em `actionable/` e latência.
    - **Empty State Futurista**: Orbe atômico pulsante em CSS, texto explicativo e botões de atalho para prompts rápidos de 1 clique (Microsserviços Event-Driven, Auth JWT, Cache & Redis).
    - **Grid de Cards de Laboratório**: Cards com efeito hover 3D, indicador de status `🟢 Ativo`, caixa expansível do **Prompt Vivo** com tag de versão (`v1`, `v2`), badges das duas camadas (`knowledge/` e `actionable/`) e botões de ação (`▶️ Pesquisar Agora`, `🔮 Grafo 3D`, `🧩 Subtópicos`, `📄 OVERVIEW.md`, `📂 Abrir Pasta`).
    - **Correção de Layout Responsivo**: Ajustado `.rl-card-title-text` com `word-break: break-word` e badge `🟢 Ativo` fixado à direita com `flex-shrink: 0`, eliminando qualquer sobreposição visual.
    - **Modal de Criação "Nova Pesquisa" com Efeito UAU**:
      - Campo de tema com chips de presets rápidos.
      - Botão com faíscas animadas `✨ Melhorar com IA (Groq)`.
      - **Split View Comparador "Antes vs Depois"**: Painel lado a lado contrastando a ideia bruta com o briefing estruturado pela IA.
      - Painel de pré-visualização de decomposição temática com subtópicos categorizados em chips azuis (`knowledge`) e verdes (`actionable`).
    - **Modal de "Prompt Vivo" & Histórico de Versões**: Interface de linha do tempo com todas as versões passadas do briefing (`definitionHistory`), data/hora e re-refinamento com IA.
  - **Research Lab — Etapa 1 (Backend & IA Groq)**:
    - **Módulo Nativo Groq (`scripts/groq-client.js`)**: Cliente HTTP nativo zero-dependência para a API do Groq Cloud (`api.groq.com`), com carregador próprio de `.env`, timeout de 60s, sanitização de markdown fences e parsing robusto de JSON.
    - **Modelo Ativo**: Suporte para `openai/gpt-oss-120b`, `openai/gpt-oss-20b` e `qwen/qwen3.8-27b`.
    - **Prompt Vivo & Refinamento Contextual (`refineResearchPrompt`)**: Algoritmo de enriquecimento que lê automaticamente os contratos do projeto (`PROJECT.md`, `ARCHITECTURE.md`) e transforma intenções livres do usuário em briefings de pesquisa estruturados de alto impacto.
    - **Decomposição em Subtópicos (`decomposeResearchTopic`)**: Divisão do tema de pesquisa em sub-tópicos com taxonomia definida.
    - **Endpoints REST Implementados no `server.js`**: `/api/ai/status`, `/api/ai/refine-prompt`, `/api/ai/decompose`, `/api/projects/:name/research`, `/api/projects/:name/research/:slug/definition`, `/api/projects/:name/research/:slug/run`.

- **Data**: 2026-10-01 (Madrugada)
  - **Gravação Física de Backups & Integração Nativa com Windows Explorer**:
    - Backend grava fisicamente os arquivos gerados em `projects/<projeto>/BACKUPS/` (`dossie_governanca_<projeto>.md` e `backup_governanca_<projeto>.json`).
    - Novos endpoints `/api/system/open-folder` e `/api/system/open-file` para abrir a pasta no Windows Explorer (`explorer.exe /select`) ou o arquivo no app padrão (`cmd /c start`).
    - Correção do download do navegador mantendo o Blob URL ativo por 10s para permitir que o Chromium conclua a gravação sem abortar.
    - Card enriquecido na aba *Backup & Exportação* com caminho absoluto no disco, botão direto para abrir no Explorer, botões para abrir cada arquivo, baixar e copiar caminhos.
  - **Interatividade Total nos Cards do Project Workspace**:
    - Edição rápida inline no card *Visão Geral & Contratos* para alterar Objetivo, Stack e Status com gravação direta no disco.
    - Seletor de status do ciclo com pílulas luminosas conectadas ao `CURRENT_STATE.md`.
    - Checklist interativo (*O que já foi definido*) com alternância, retorno ao roadmap e exclusão.
    - Roadmap dinâmico (*Próximos Passos*) com botão "✓ Concluir" em 1 clique e input inline com tecla Enter.
    - Sistema de Toast visual com glassmorphism para feedback instantâneo de gravação.
  - **Contratos de Governança 100% Dinâmicos**:
    - Backend inspeciona arquivos físicos reais no disco, exibindo apenas documentos existentes (`PROJECT.md`, `CURRENT_STATE.md`, etc.).
    - Identificação de contratos recomendados ausentes (ex: `ARCHITECTURE.md`) com ação de inicialização com 1 clique (`+ Inicializar ARCHITECTURE.md`).
    - Layout e botões dos chips de governança reformulados com `.btn-gov`, eliminando quebras de linha e desproporções.
  - **Correções Estruturais & Backend**:
    - Correção do aninhamento de modais no HTML que impedia a exibição do Live Markdown Editor.
    - Correção na rota `GET /api/file` no `server.js` com verificação de método HTTP estrita, eliminando erro `400 Bad Request` no salvamento.
- **Data**: 2026-09-30
  - **Quickstart Studio (Modal de 3 Minutos)**: Onboarding guiado no portal web para criar projetos do zero ou vincular pastas existentes via junções NTFS sem terminal.
  - **Sidebar "Dois Mundos"**: Reorganização visual clara separando "MEUS PROJETOS" no topo e "CÉREBRO & GOVERNANÇA" abaixo com divisor neon.
  - **Project Workspace (Página Dedicada do Projeto)**: Hub com 5 abas (Visão Geral, Memória & Saúde, Grafo Neural 3D, Backup & Exportação de Dossiê, Gerenciamento & Desvinculação Segura).
  - **Grafo Neural 3D (Three.js)**: Grafo orbital onde o projeto é o Sol Central conectado a seus arquivos locais e satélites de governança.
  - **Grafo Global com Clusters Galácticos**: Projetos agrupados em clusters orbitais interligados por regras comuns.
  - **APIs de Ciclo de Vida**: Endpoints backend para diagnóstico de memória, arquivamento seguro em `.archive/`, exportação de backup (.md e .json) e desvinculação não destrutiva.
