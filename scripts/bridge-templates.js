'use strict';
/**
 * AI SECOND BRAIN — Bridge Templates (fonte única das pontes de IA)
 *
 * Todas as pontes (.cursorrules, CLAUDE.md, GEMINI.md, AGENTS.md, .windsurfrules,
 * .clinerules e .github/copilot-instructions.md) são geradas aqui, com o MESMO corpo.
 * Apenas o título muda por ferramenta.
 *
 * Princípio de Fonte Única de Verdade (SSOT):
 *   A ponte atua estritamente como ROTEADOR e CONSTITUIÇÃO DE REGRAS (estática).
 *   Ela NÃO duplica estado, stack ou decisões — força a IA a ler os contratos reais.
 *
 * Usado por:
 *   - scripts/create-project.js    (greenfield CLI)
 *   - scripts/link-project.js      (brownfield CLI)
 *   - scripts/quickstart-grill.js  (sabatina técnica)
 *   - server.js                    (criação Express e endpoint /api/projects/:name/bridges)
 *
 * Zero dependências externas.
 */

const fs = require('fs');
const path = require('path');
const { tr } = require('./i18n-cli');

const BRIDGES = {
    cursor: { file: '.cursorrules', tool: 'Cursor AI' },
    claude: { file: 'CLAUDE.md', tool: 'Claude Code' },
    windsurf: { file: '.windsurfrules', tool: 'Windsurf (Cascade)' },
    antigravity: { file: 'GEMINI.md', tool: 'Google Antigravity' },
    copilot: { file: '.github/copilot-instructions.md', tool: 'GitHub Copilot' },
    cline: { file: '.clinerules', tool: 'Cline / Roo Code' },
    agents: { file: 'AGENTS.md', tool: 'Agentes de IA (padrão AGENTS.md)' }
};

const ALL_KEYS = Object.keys(BRIDGES);

function normalizePrefix(prefix, projectName) {
    let p = (prefix === undefined || prefix === null || String(prefix).trim() === '')
        ? `projects/${projectName}/`
        : String(prefix).trim().replace(/\\/g, '/');
    if (!p.endsWith('/')) p += '/';
    return p;
}

function buildBridgeContent({ projectName, tool = 'agents', pathPrefix, rootDir } = {}) {
    const meta = BRIDGES[tool] || BRIDGES.agents;
    const p = normalizePrefix(pathPrefix, projectName);
    const isHubPath = p === `projects/${projectName}/`;

    const globalLessons = isHubPath && rootDir
        ? tr(`\n6. Lições globais do framework: \`memory/lessons-learned.md\``, `\n6. Framework global lessons: \`memory/lessons-learned.md\``)
        : '';

    return tr(
`# Instruções para ${meta.tool} — ${projectName}

> Projeto governado pelo **AI Second Brain**. Estas regras valem para TODA resposta e TODA alteração de código neste repositório.
> **Fonte Única de Verdade (SSOT):** Esta ponte define apenas o roteamento e as regras inegociáveis. Ela **não** armazena estado nem stack para evitar desatualização. É obrigatório ler os contratos abaixo antes de agir.

## 1. Contratos de Leitura Obrigatória (nesta ordem)
1. \`${p}PROJECT.md\` — visão do produto, stack oficial e regras de negócio
2. \`${p}ARCHITECTURE.md\` — desenho de componentes, fluxos de dados e padrões
3. \`${p}CURRENT_STATE.md\` — estado atual, o que está pronto, em andamento e bloqueado
4. \`${p}DECISIONS/\` — decisões arquiteturais imutáveis (ADRs) vigentes
5. \`${p}LESSONS_LEARNED.md\` — erros e incidentes que não podem ser repetidos${globalLessons}

## 2. Regras Absolutas de Governança
- **Bloqueio de leitura:** NUNCA assuma a stack, proponha código ou altere a arquitetura sem antes ler \`${p}PROJECT.md\`, \`${p}ARCHITECTURE.md\` e \`${p}CURRENT_STATE.md\`.
- **Zero fabricação:** NUNCA invente bibliotecas, telas, endpoints, tabelas ou regras de negócio que não estejam nos contratos ou no pedido explícito do desenvolvedor.
- **Transparência sobre lacunas:** Se uma informação não estiver documentada nos contratos, diga explicitamente: *"não consta nos contratos"* e pergunte antes de assumir.
- **Proteção de stack e arquitetura:** NUNCA proponha tecnologia fora da stack oficial nem altere a arquitetura sem antes sugerir o registro de um novo ADR em \`${p}DECISIONS/\`.
- **Código determinístico primeiro (AI Decision Gate):** Prefira regras e código determinístico a chamadas de IA/LLM quando uma solução direta resolver.
- **Segurança:** NUNCA grave segredos, chaves de API, tokens ou senhas em código, logs ou documentação.
- **Catálogos dinâmicos:** NUNCA crie listas fixas (hardcoded) de modelos de IA; catálogos de modelos devem ser obtidos dinamicamente via API.

## 3. Ciclo de Atualização da Memória (ao concluir uma tarefa)
1. Proponha a atualização de \`${p}CURRENT_STATE.md\` (itens concluídos, próximos passos e bloqueios).
2. Se houve decisão técnica ou escolha de biblioteca/padrão, proponha um novo ADR em \`${p}DECISIONS/\`.
3. Se foi corrigido um bug ou incidente relevante, proponha o registro em \`${p}LESSONS_LEARNED.md\`.
4. **Humano no controle:** Nunca grave alterações nos contratos sem a confirmação do desenvolvedor.

## 4. Verificação de Aderência
Se o desenvolvedor perguntar *"o que dizem suas instruções do projeto?"*, leia os contratos da Seção 1 e responda citando o nome do projeto, a stack oficial lida de \`${p}PROJECT.md\`, o status atual lido de \`${p}CURRENT_STATE.md\` e as regras das Seções 2 e 3.
`,
`# Instructions for ${meta.tool} — ${projectName}

> Project governed by **AI Second Brain**. These rules apply to EVERY answer and EVERY code change in this repository.
> **Single Source of Truth (SSOT):** This bridge defines routing and non-negotiable rules only. It does **not** store state or stack to prevent drift. Reading the contracts below before acting is mandatory.

## 1. Mandatory Contracts to Read (in this order)
1. \`${p}PROJECT.md\` — product vision, official stack and business rules
2. \`${p}ARCHITECTURE.md\` — component design, data flows and patterns
3. \`${p}CURRENT_STATE.md\` — current state, what is done, in progress and blocked
4. \`${p}DECISIONS/\` — active immutable Architecture Decision Records (ADRs)
5. \`${p}LESSONS_LEARNED.md\` — mistakes and incidents that must not be repeated${globalLessons}

## 2. Absolute Governance Rules
- **Read gate:** NEVER assume the stack, propose code or change architecture without first reading \`${p}PROJECT.md\`, \`${p}ARCHITECTURE.md\` and \`${p}CURRENT_STATE.md\`.
- **Zero fabrication:** NEVER invent libraries, screens, endpoints, tables or business rules that are not in the contracts or in the developer's explicit request.
- **Gap transparency:** If information is not documented in the contracts, state explicitly: *"not in the contracts"* and ask before assuming.
- **Stack & architecture protection:** NEVER propose technology outside the official stack or change the architecture without first suggesting a new ADR in \`${p}DECISIONS/\`.
- **Deterministic code first (AI Decision Gate):** Prefer deterministic rules and code over AI/LLM calls when a direct solution solves it.
- **Security:** NEVER write secrets, API keys, tokens or passwords in code, logs or documentation.
- **Dynamic catalogs:** NEVER hardcode lists of AI models; model catalogs must be fetched dynamically via API.

## 3. Memory Update Cycle (when finishing a task)
1. Propose updating \`${p}CURRENT_STATE.md\` (completed items, next steps and blockers).
2. If a technical decision or library/pattern choice was made, propose a new ADR in \`${p}DECISIONS/\`.
3. If a relevant bug or incident was fixed, propose recording it in \`${p}LESSONS_LEARNED.md\`.
4. **Human in the loop:** Never write changes to the contracts without the developer's confirmation.

## 4. Adherence Check
If the developer asks *"what do your project instructions say?"*, read the contracts in Section 1 and answer citing the project name, the official stack read from \`${p}PROJECT.md\`, the current status read from \`${p}CURRENT_STATE.md\`, and the rules in Sections 2 and 3.
`);
}

/**
 * Obtém a chave da ferramenta de IA ativa configurada em brain.config.json.
 * Mapeia o motor selecionado na Arquitetura do Sistema para a chave correspondente em BRIDGES.
 * @param {string} [rootDir] Diretório raiz do AI Second Brain
 * @returns {string} Chave válida de BRIDGES (ex: 'copilot', 'cursor', 'antigravity', etc.)
 */
function getActiveBridgeKey(rootDir) {
    const root = rootDir || path.resolve(__dirname, '..');
    const configPath = path.join(root, 'brain.config.json');
    try {
        if (fs.existsSync(configPath)) {
            const raw = fs.readFileSync(configPath, 'utf-8');
            const data = JSON.parse(raw);
            if (data && data.activeEngine) {
                const key = String(data.activeEngine).trim().toLowerCase();
                if (key === 'universal' || key === 'agents') return 'agents';
                if (BRIDGES[key]) return key;
            }
        }
    } catch (_) {}
    return 'agents';
}

/**
 * Retorna as ferramentas padrão para criação de novos projetos.
 * Por padrão, retorna apenas a ponte correspondente ao motor de IA ativo na Arquitetura do Sistema.
 * @param {string} [rootDir]
 * @returns {string[]}
 */
function getDefaultBridgeTools(rootDir) {
    const active = getActiveBridgeKey(rootDir);
    return [active];
}

/**
 * Grava pontes no diretório do projeto.
 * @param {object} o
 * @param {string} o.projectDir   Pasta física do projeto (projects/<nome>)
 * @param {string} o.projectName
 * @param {string} [o.rootDir]    Diretório raiz do AI Second Brain
 * @param {string[]} [o.tools]    Chaves de BRIDGES (padrão: ponte do motor ativo na Arquitetura do Sistema)
 * @param {string} [o.pathPrefix] Prefixo dos caminhos dentro das pontes
 * @param {boolean} [o.overwrite] Sobrescrever existentes (padrão: false)
 * @returns {{created:string[], skipped:string[]}}
 */
function writeBridges({ projectDir, projectName, rootDir, tools, pathPrefix, overwrite = false }) {
    let effectiveTools;
    if (tools && tools.length) {
        effectiveTools = (tools.includes('--all') || tools.includes('all')) ? ALL_KEYS : tools;
    } else {
        effectiveTools = getDefaultBridgeTools(rootDir);
    }
    const keys = effectiveTools.filter(k => BRIDGES[k]);
    const created = [];
    const skipped = [];
    for (const key of keys) {
        const dest = path.join(projectDir, BRIDGES[key].file);
        if (!overwrite && fs.existsSync(dest)) { skipped.push(BRIDGES[key].file); continue; }
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, buildBridgeContent({ projectName, tool: key, pathPrefix, rootDir }), 'utf-8');
        created.push(BRIDGES[key].file);
    }
    return { created, skipped };
}

/**
 * Remove pontes do diretório do projeto com segurança (apenas arquivos oficiais de BRIDGES).
 */
function deleteBridges({ projectDir, tools }) {
    const keys = (tools && tools.length ? tools : ALL_KEYS).filter(k => BRIDGES[k]);
    const deleted = [];
    for (const key of keys) {
        const rel = BRIDGES[key].file;
        const dest = path.join(projectDir, rel);
        if (fs.existsSync(dest)) {
            try {
                fs.unlinkSync(dest);
                deleted.push(rel);
                if (rel.startsWith('.github/')) {
                    const ghDir = path.join(projectDir, '.github');
                    if (fs.existsSync(ghDir) && fs.readdirSync(ghDir).length === 0) {
                        fs.rmdirSync(ghDir);
                    }
                }
            } catch (e) { /* ignora erro individual */ }
        }
    }
    return { deleted };
}

module.exports = {
    BRIDGES,
    ALL_KEYS,
    buildBridgeContent,
    writeBridges,
    deleteBridges,
    normalizePrefix,
    getActiveBridgeKey,
    getDefaultBridgeTools
};

if (require.main === module) {
    const rootDir = path.resolve(__dirname, '..');
    const target = process.argv[2];
    const prefix = process.argv[3];
    const projectsRoot = path.join(rootDir, 'projects');
    const names = target && target !== '--all'
        ? [target]
        : fs.readdirSync(projectsRoot, { withFileTypes: true })
            .filter(d => d.isDirectory() && !d.name.startsWith('.'))
            .map(d => d.name);
    for (const name of names) {
        const dir = path.join(projectsRoot, name);
        if (!fs.existsSync(dir)) continue;
        const res = writeBridges({ projectDir: dir, projectName: name, rootDir, pathPrefix: prefix, overwrite: true, tools: ALL_KEYS });
        console.log(`[bridges] ${name}: ${res.created.length} arquivos atualizados`);
    }
}
