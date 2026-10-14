/**
 * AI SECOND BRAIN — Live Vault Server
 * Zero-dependency local server that:
 * 1. Serves the Brain Visualizer UI
 * 2. Scans and serves all Markdown files across all subfolders dynamically
 * 3. Provides live file watching (SSE) so changes made by AI or user reflect instantly!
 * 4. Handles port busy (EADDRINUSE) gracefully with auto-fallback to next port!
 * 5. Research Lab — AI-powered knowledge synthesis via Groq API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { scanVault } = require('./scripts/scan-vault');
const groq = require('./scripts/groq-client');
const aiGateway = require('./scripts/ai-gateway');
const researchEngine = require('./scripts/research-engine');

const INITIAL_PORT = parseInt(process.env.PORT, 10) || 3333;

const ROOT_DIR = __dirname;
const UI_DIR = path.join(ROOT_DIR, 'docs', 'brain-ui');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.md': 'text/markdown; charset=utf-8'
};

// SSE Clients for live file changes
const sseClients = new Set();


function updateSnapshotIfConfigured(vault) {
    if (process.env.PERSIST_LOCAL_SNAPSHOT === 'true') {
        try {
            updateSnapshotIfConfigured(vault);
        } catch (e) {
            console.warn('⚠️ Falha ao salvar snapshot local:', e.message);
        }
    }
}

function broadcastEvent(type, data) {
    const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of sseClients) {
        try {
            res.write(message);
        } catch (e) {
            sseClients.delete(res);
        }
    }
}

// Watch workspace for changes in markdown files
let debounceTimer = null;
let watcherActive = false;

function setupWatcher() {
    if (watcherActive) return;
    try {
        fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
            if (!filename) return;
            if (filename.includes('node_modules') || filename.includes('.git')) return;
            // Dispara se for arquivo Markdown ou alteração estrutural em pastas vitais ou configs
            if (filename.endsWith('.md') || filename.includes('projects') || filename.includes('knowledge') || filename.includes('decisions') || filename.includes('memory') || filename.includes('config')) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    console.log(`⚡ [Watcher] Alteração detectada no Vault (${eventType}): ${filename}`);
                    broadcastEvent('vault-updated', { file: filename, eventType, time: Date.now() });
                }, 250);
            }
        });
        watcherActive = true;
        console.log('👀 [Watcher] Monitorando alterações em tempo real nos arquivos Markdown...');
    } catch (e) {
        console.warn('⚠️ [Watcher] Watch recursivo não suportado neste ambiente:', e.message);
    }
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 2e6) { // 2MB max
                req.destroy();
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

async function handleRequest(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    if (pathname === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }


    // API: Validação de Caminho no Disco em Tempo Real
    if (pathname === '/api/projects/validate-path' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            let rawPath = (body.path || '').trim();
            // Remove aspas de copiar caminho no Windows
            rawPath = rawPath.replace(/^["']|["']$/g, '');

            if (!rawPath) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ valid: false, message: 'Digite ou cole o caminho de uma pasta no seu computador.' }));
                return;
            }

            const resolved = path.resolve(rawPath);
            if (!fs.existsSync(resolved)) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ valid: false, message: 'Diretório não encontrado no disco.' }));
                return;
            }

            const stat = fs.statSync(resolved);
            if (!stat.isDirectory()) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ valid: false, message: 'O caminho informado não é uma pasta.' }));
                return;
            }

            let fileCount = 0;
            let hasGit = false;
            let hasPackageJson = false;
            let hasCsproj = false;
            try {
                const entries = fs.readdirSync(resolved);
                fileCount = entries.length;
                hasGit = entries.includes('.git');
                hasPackageJson = entries.includes('package.json');
                hasCsproj = entries.some(e => e.endsWith('.csproj'));
            } catch (e) {}

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                valid: true,
                resolvedPath: resolved,
                fileCount,
                hasGit,
                hasPackageJson,
                hasCsproj,
                suggestedName: path.basename(resolved).replace(/[^a-zA-Z0-9_\-]/g, '-')
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ valid: false, message: err.message }));
        }
        return;
    }

    // API: Criar Novo Projeto (Greenfield)
    if (pathname === '/api/projects/new' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const rawName = (body.name || '').trim();
            const stack = (body.stack || 'Não definida').trim();
            const description = (body.description || 'Projeto criado no AI Second Brain').trim();

            if (!rawName) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Nome do projeto é obrigatório.' }));
                return;
            }

            const safeName = rawName.replace(/[^a-zA-Z0-9_\-]/g, '-');
            const projectsDir = path.join(ROOT_DIR, 'projects');
            const targetFolder = path.join(projectsDir, safeName);

            if (fs.existsSync(targetFolder)) {
                res.writeHead(409, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Já existe um projeto chamado '${safeName}'.` }));
                return;
            }

            // Cria diretórios da governança
            fs.mkdirSync(targetFolder, { recursive: true });
            fs.mkdirSync(path.join(targetFolder, 'DECISIONS'), { recursive: true });
            fs.mkdirSync(path.join(targetFolder, 'MEMORY', 'sessions'), { recursive: true });

            const today = new Date().toISOString().split('T')[0];

            // 1. PROJECT.md
            const projectMd = `# ${safeName}

## Visão Geral
${description}

## Informações Gerais
- **Tipo**: Greenfield / Projeto Novo
- **Stack Inicial**: ${stack}
- **Status**: 🟢 Em Planejamento / Ativo
- **Data de Criação**: ${today}

## Links & Governança
- Estado Atual: [CURRENT_STATE.md](CURRENT_STATE.md)
- Arquitetura: [ARCHITECTURE.md](ARCHITECTURE.md)
- Lições Aprendidas: [LESSONS_LEARNED.md](LESSONS_LEARNED.md)
- Decisões Técnicas: \`DECISIONS/\`
- Memória de Sessões: \`MEMORY/sessions/\`
`;

            // 2. CURRENT_STATE.md
            const currentStateMd = `# ${safeName} — Estado Atual

> Última atualização: ${today}

## Status: 🟢 Em Planejamento / Ativo

## O que já foi definido
- [x] Inicialização no AI Second Brain com governança e memória ativa.
- [x] Stack selecionada: **${stack}**.

## Próximos Passos
1. Definir os requisitos centrais do sistema.
2. Registrar a primeira decisão de arquitetura em \`DECISIONS/\`.
`;

            // 3. ARCHITECTURE.md
            const archMd = `# ${safeName} — Arquitetura da Solução

> Visão arquitetural, padrões e design do sistema.

## 1. Stack Tecnológica
- **Linguagem / Framework**: ${stack}

## 2. Princípios Adotados
- Código idiomático, modular e testável.
- Se utilizar IA: aplicar o AI Decision Gate (\`.agents/rules/01-ai-decision.md\`).
`;

            // 4. LESSONS_LEARNED.md (Local do Projeto — Nível 2)
            const lessonsLearnedMd = `# ${safeName} — Lições Aprendidas

> Este documento registra erros, armadilhas técnicas e aprendizados específicos deste projeto.
> Qualquer agente de IA ou desenvolvedor deve consultar este arquivo antes de alterar código neste repositório.

## Histórico de Lições Aprendidas
<!-- Registre novos aprendizados seguindo o formato: -->
<!-- ### YYYY-MM-DD — Título do Aprendizado -->
<!-- - Contexto: O que motivou o problema -->
<!-- - Causa Raiz: Motivo técnico da falha -->
<!-- - O que NÃO fazer: Padrão a evitar -->
<!-- - Padrão Correto: Solução validada e obrigatória -->
`;

            // 5. Pontes Multi-IA (para modo Cockpit ou Standalone)
            const bridgeContent = `# Governança de IA — ${safeName}

> Este projeto é governado pelo AI Second Brain.
> Cérebro Central: \`${ROOT_DIR}\`

## ANTES DE EXECUTAR QUALQUER TAREFA
1. Consulte o estado atual em: [CURRENT_STATE.md](CURRENT_STATE.md)
2. Consulte os requisitos e visão geral em: [PROJECT.md](PROJECT.md)
3. Consulte as decisões arquiteturais em: DECISIONS/
4. Consulte as lições aprendidas deste projeto em: [LESSONS_LEARNED.md](LESSONS_LEARNED.md)
5. Consulte as lições aprendidas globais em: \`${path.join(ROOT_DIR, 'memory', 'lessons-learned.md')}\`
6. REGRAS ABSOLUTAS:
   - NUNCA crie catálogos ou listas fixas/hardcoded de modelos de IA no código ou HTML. O catálogo deve ser 100% dinâmico via API em tempo real.
   - Sempre utilize código determinístico antes de recorrer a LLMs.
   - NUNCA invente contexto ou regras especulativas sem solicitação expressa do desenvolvedor.
`;

            // 6. .gitignore padrão do projeto
            const gitignoreContent = `# Dependências & Build
node_modules/
bin/
obj/
dist/
build/
.cache/

# Variáveis de ambiente & Segredos
.env
.env.*
*.key
*.pem

# Sistema Operacional & IDE
.DS_Store
Thumbs.db
.vs/
.vscode/
`;

            fs.writeFileSync(path.join(targetFolder, 'PROJECT.md'), projectMd, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, 'CURRENT_STATE.md'), currentStateMd, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, 'ARCHITECTURE.md'), archMd, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, 'LESSONS_LEARNED.md'), lessonsLearnedMd, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, 'AGENTS.md'), bridgeContent, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, 'GEMINI.md'), bridgeContent, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, '.cursorrules'), bridgeContent, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, 'CLAUDE.md'), bridgeContent, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, '.gitignore'), gitignoreContent, 'utf-8');

            // 7. git init opcional (se solicitado pelo usuário)
            let gitInitialized = false;
            if (body.initGit !== false) {
                try {
                    const { execSync } = require('child_process');
                    execSync('git init -b main', { cwd: targetFolder, timeout: 5000, stdio: 'ignore' });
                    gitInitialized = true;
                } catch (e) {
                    try {
                        const { execSync } = require('child_process');
                        execSync('git init', { cwd: targetFolder, timeout: 5000, stdio: 'ignore' });
                        gitInitialized = true;
                    } catch (_) {}
                }
            }

            // Atualiza snapshot do Vault
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            // Dispara evento SSE
            broadcastEvent('vault-updated', { project: safeName, type: 'new-project', time: Date.now() });

            res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                name: safeName,
                path: `projects/${safeName}/PROJECT.md`,
                message: `Projeto '${safeName}' criado com sucesso!`
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // ============================================================
    // QUICKSTART GRILL — Sabatina Técnica e Refinamento de Contratos
    // ============================================================

    // API: Quickstart Grill — Sabatina Dinâmica
    if (pathname === '/api/projects/quickstart/questions' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            delete require.cache[require.resolve('./scripts/quickstart-grill')];
            const grill = require('./scripts/quickstart-grill');
            const result = await grill.generateQuestions(getAiGateway(), body);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, ...result }));
        } catch (err) {
            console.error('❌ [Quickstart Grill] Erro ao gerar perguntas:', err.message);
            res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // API: Quickstart Grill — Validação Semântica de Respostas da Sabatina
    if (pathname === '/api/projects/quickstart/validate-answers' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            delete require.cache[require.resolve('./scripts/quickstart-grill')];
            const grill = require('./scripts/quickstart-grill');
            const result = await grill.validateAnswers(getAiGateway(), body.projectInfo, body.questions, body.answers);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, ...result }));
        } catch (err) {
            console.error('❌ [Quickstart Grill] Erro ao validar respostas:', err.message);
            res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // API: Quickstart Grill — Rascunho dos Contratos
    if (pathname === '/api/projects/quickstart/draft' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            delete require.cache[require.resolve('./scripts/quickstart-grill')];
            const grill = require('./scripts/quickstart-grill');
            const result = await grill.generateDraft(getAiGateway(), body, body.answers);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, ...result }));
        } catch (err) {
            console.error('❌ [Quickstart Grill] Erro ao gerar rascunho:', err.message);
            res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // API: Quickstart Grill — Refinamento ("Prompt Vivo")
    if (pathname === '/api/projects/quickstart/refine' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            delete require.cache[require.resolve('./scripts/quickstart-grill')];
            const grill = require('./scripts/quickstart-grill');
            const result = await grill.refineDraft(getAiGateway(), body, body.contracts, body.feedback);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, ...result }));
        } catch (err) {
            console.error('❌ [Quickstart Grill] Erro ao refinar contratos:', err.message);
            res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // API: Quickstart Grill — Gravação Atômica (Commit)
    if (pathname === '/api/projects/quickstart/commit' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            delete require.cache[require.resolve('./scripts/quickstart-grill')];
            const grill = require('./scripts/quickstart-grill');
            const result = grill.commitProject(ROOT_DIR, body, body.contracts, { initGit: body.initGit });

            // Atualiza snapshot do Vault e notifica SSE
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { project: result.name, type: 'new-project', time: Date.now() });

            res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                name: result.name,
                path: result.path,
                message: `Projeto '${result.name}' criado com sucesso!`
            }));
        } catch (err) {
            console.error('❌ [Quickstart Grill] Erro ao gravar projeto:', err.message);
            res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // API: Vincular Repositório Existente (Brownfield)
    if (pathname === '/api/projects/link' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const rawName = (body.name || '').trim();
            let targetPathRaw = (body.targetPath || '').trim();
            targetPathRaw = targetPathRaw.replace(/^["']|["']$/g, '');

            if (!rawName || !targetPathRaw) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Nome e caminho da pasta são obrigatórios.' }));
                return;
            }

            const targetAbsolutePath = path.resolve(targetPathRaw);
            if (!fs.existsSync(targetAbsolutePath) || !fs.statSync(targetAbsolutePath).isDirectory()) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'O caminho de origem não existe ou não é uma pasta válida.' }));
                return;
            }

            const safeName = rawName.replace(/[^a-zA-Z0-9_\-]/g, '-');
            const projectsDir = path.join(ROOT_DIR, 'projects');
            const destLinkPath = path.join(projectsDir, safeName);

            try {
                if (fs.existsSync(destLinkPath) || fs.lstatSync(destLinkPath)) {
                    res.writeHead(409, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ error: `Já existe um projeto ou vínculo com o nome '${safeName}'.` }));
                    return;
                }
            } catch (e) {}

            // Cria junção NTFS (Windows) ou symlink dir (Linux/Mac)
            const isWindows = process.platform === 'win32';
            fs.symlinkSync(targetAbsolutePath, destLinkPath, isWindows ? 'junction' : 'dir');

            // Inicializa PROJECT.md e CURRENT_STATE.md se não existirem
            const projectMdPath = path.join(destLinkPath, 'PROJECT.md');
            const currentStateMdPath = path.join(destLinkPath, 'CURRENT_STATE.md');
            const today = new Date().toISOString().split('T')[0];

            if (!fs.existsSync(projectMdPath)) {
                const starterProjectMd = `# ${safeName}

## Visão Geral
Projeto externo vinculado ao AI Second Brain.

## Informações Gerais
- **Tipo**: Brownfield / Repositório Externo
- **Localização Original**: \`${targetAbsolutePath}\`
- **Status**: 🟢 Ativo / Vinculado
- **Data de Vinculação**: ${today}

## Links & Documentação
- Estado Atual: [CURRENT_STATE.md](CURRENT_STATE.md)
`;
                fs.writeFileSync(projectMdPath, starterProjectMd, 'utf-8');
            }

            if (!fs.existsSync(currentStateMdPath)) {
                const starterCurrentStateMd = `# ${safeName} — Estado Atual

> Última atualização: ${today}

## Status: 🟢 Ativo / Vinculado ao AI Second Brain
- Repositório conectado e pronto para desenvolvimento com IA.
`;
                fs.writeFileSync(currentStateMdPath, starterCurrentStateMd, 'utf-8');
            }

            // Atualiza snapshot do Vault
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            // Dispara evento SSE
            broadcastEvent('vault-updated', { project: safeName, type: 'link-project', time: Date.now() });

            res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                name: safeName,
                path: `projects/${safeName}/PROJECT.md`,
                message: `Repositório '${safeName}' vinculado com sucesso!`
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Detalhes e Diagnóstico de Memória de um Projeto Específico
    if (pathname.startsWith('/api/projects/') && pathname.endsWith('/details') && req.method === 'GET') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const projectDir = path.join(ROOT_DIR, 'projects', projectName);

            if (!fs.existsSync(projectDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Projeto '${projectName}' não encontrado.` }));
                return;
            }

            let isJunction = false;
            let realPath = projectDir;
            try {
                const lstat = fs.lstatSync(projectDir);
                if (lstat.isSymbolicLink()) {
                    isJunction = true;
                    realPath = fs.readlinkSync(projectDir);
                }
            } catch (e) {}

            // Lê arquivos principais de governança e outros contratos dinamicamente
            const projectMdPath = path.join(projectDir, 'PROJECT.md');
            const currentStateMdPath = path.join(projectDir, 'CURRENT_STATE.md');
            const archMdPath = path.join(projectDir, 'ARCHITECTURE.md');

            const hasProjectMd = fs.existsSync(projectMdPath);
            const hasCurrentState = fs.existsSync(currentStateMdPath);
            const hasArchitecture = fs.existsSync(archMdPath);

            const projectMd = hasProjectMd ? fs.readFileSync(projectMdPath, 'utf-8') : '';
            const currentStateMd = hasCurrentState ? fs.readFileSync(currentStateMdPath, 'utf-8') : '';
            const archMd = hasArchitecture ? fs.readFileSync(archMdPath, 'utf-8') : '';

            // Contratos de Governança Dinâmicos
            const KNOWN_CONTRACTS = {
                'PROJECT.md': { title: 'Visão Geral & Requisitos', icon: '📄' },
                'CURRENT_STATE.md': { title: 'Estado Atual & Roadmap', icon: '💾' },
                'ARCHITECTURE.md': { title: 'Padrões & Design', icon: '🏗️' }
            };

            const governanceFiles = [];
            let totalGovBytes = 0;

            // 1. Adiciona contratos padrão que REALMENTE existem no disco
            for (const [filename, meta] of Object.entries(KNOWN_CONTRACTS)) {
                const fullP = path.join(projectDir, filename);
                if (fs.existsSync(fullP)) {
                    try {
                        const stat = fs.statSync(fullP);
                        totalGovBytes += stat.size;
                        governanceFiles.push({
                            name: filename,
                            title: meta.title,
                            icon: meta.icon,
                            sizeKb: (stat.size / 1024).toFixed(1),
                            mtime: stat.mtime,
                            path: `projects/${projectName}/${filename}`,
                            exists: true
                        });
                    } catch (e) {}
                }
            }

            // 2. Lê qualquer outro arquivo Markdown no diretório raiz do projeto
            try {
                const rootEntries = fs.readdirSync(projectDir);
                for (const entry of rootEntries) {
                    if (entry.endsWith('.md') && !KNOWN_CONTRACTS[entry]) {
                        const fullP = path.join(projectDir, entry);
                        try {
                            const stat = fs.statSync(fullP);
                            totalGovBytes += stat.size;
                            governanceFiles.push({
                                name: entry,
                                title: entry.replace(/\.md$/i, ''),
                                icon: '📋',
                                sizeKb: (stat.size / 1024).toFixed(1),
                                mtime: stat.mtime,
                                path: `projects/${projectName}/${entry}`,
                                exists: true
                            });
                        } catch (e) {}
                    }
                }
            } catch (e) {}

            // 3. Identifica contratos recomendados que AINDA NÃO EXISTEM
            const missingContracts = [];
            for (const [filename, meta] of Object.entries(KNOWN_CONTRACTS)) {
                const fullP = path.join(projectDir, filename);
                if (!fs.existsSync(fullP)) {
                    missingContracts.push({
                        name: filename,
                        title: meta.title,
                        icon: meta.icon,
                        path: `projects/${projectName}/${filename}`,
                        exists: false
                    });
                }
            }

            // Decisões
            const decisionsDir = path.join(projectDir, 'DECISIONS');
            const decisions = [];
            if (fs.existsSync(decisionsDir)) {
                try {
                    const decFiles = fs.readdirSync(decisionsDir);
                    for (const df of decFiles) {
                        if (df.endsWith('.md')) {
                            const p = path.join(decisionsDir, df);
                            const stat = fs.statSync(p);
                            decisions.push({ name: df, size: stat.size, mtime: stat.mtime });
                        }
                    }
                } catch (e) {}
            }

            // Memória / Sessões
            const memoryDir = path.join(projectDir, 'MEMORY', 'sessions');
            const sessions = [];
            if (fs.existsSync(memoryDir)) {
                try {
                    const sessFiles = fs.readdirSync(memoryDir);
                    for (const sf of sessFiles) {
                        if (sf.endsWith('.md')) {
                            const p = path.join(memoryDir, sf);
                            const stat = fs.statSync(p);
                            sessions.push({ name: sf, size: stat.size, mtime: stat.mtime });
                        }
                    }
                } catch (e) {}
            }

            // Arquivos arquivados
            const archiveDir = path.join(projectDir, 'MEMORY', '.archive');
            let archivedCount = 0;
            if (fs.existsSync(archiveDir)) {
                try {
                    archivedCount = fs.readdirSync(archiveDir).length;
                } catch (e) {}
            }

            // Soma tamanho das decisões e sessões ao total de governança
            decisions.forEach(d => totalGovBytes += d.size);
            sessions.forEach(s => totalGovBytes += s.size);

            // Contagem rápida de arquivos do projeto real
            let totalProjectFiles = 0;
            try {
                const countFiles = (dir, depth = 0) => {
                    if (depth > 4) return;
                    const items = fs.readdirSync(dir, { withFileTypes: true });
                    for (const item of items) {
                        if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'bin' || item.name === 'obj') continue;
                        if (item.isDirectory()) {
                            countFiles(path.join(dir, item.name), depth + 1);
                        } else {
                            totalProjectFiles++;
                        }
                    }
                };
                countFiles(projectDir);
            } catch (e) {}

            // Extração de metadados do PROJECT.md
            let stack = 'Não especificada';
            let status = 'Ativo';
            let description = 'Projeto no AI Second Brain';

            const stackMatch = projectMd.match(/-\s+\*\*Stack[^*]*\*\*:\s*([^\r\n]+)/i);
            if (stackMatch) stack = stackMatch[1].trim();

            const statusMatch = projectMd.match(/-\s+\*\*Status\*\*:\s*([^\r\n]+)/i);
            if (statusMatch) status = statusMatch[1].trim();

            const overviewMatch = projectMd.match(/##\s+Visão Geral\s*\n+([^\n#]+)/i);
            if (overviewMatch) description = overviewMatch[1].trim();

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                name: projectName,
                isJunction,
                realPath,
                stack,
                status,
                description,
                totalProjectFiles,
                memorySizeKb: (totalGovBytes / 1024).toFixed(1),
                decisionsCount: decisions.length,
                sessionsCount: sessions.length,
                archivedCount,
                hasProjectMd,
                hasCurrentState,
                hasArchitecture,
                governanceFiles,
                missingContracts,
                decisions,
                sessions,
                projectMd,
                currentStateMd,
                archMd
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Limpar / Arquivar Memória de Sessões do Projeto
    if (pathname.startsWith('/api/projects/') && pathname.endsWith('/clear-memory') && req.method === 'POST') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const projectDir = path.join(ROOT_DIR, 'projects', projectName);

            if (!fs.existsSync(projectDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Projeto '${projectName}' não encontrado.` }));
                return;
            }

            const sessionsDir = path.join(projectDir, 'MEMORY', 'sessions');
            const archiveBase = path.join(projectDir, 'MEMORY', '.archive');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const archiveDest = path.join(archiveBase, `sessions_${timestamp}`);

            let movedCount = 0;
            if (fs.existsSync(sessionsDir)) {
                fs.mkdirSync(archiveDest, { recursive: true });
                const files = fs.readdirSync(sessionsDir);
                for (const f of files) {
                    if (f.endsWith('.md')) {
                        fs.renameSync(path.join(sessionsDir, f), path.join(archiveDest, f));
                        movedCount++;
                    }
                }
            }

            // Anota a limpeza no CURRENT_STATE.md sem perder dados críticos
            const currentStateMdPath = path.join(projectDir, 'CURRENT_STATE.md');
            if (fs.existsSync(currentStateMdPath)) {
                let currentContent = fs.readFileSync(currentStateMdPath, 'utf-8');
                const logEntry = `\n\n> 🧹 *Memória de sessões arquivada em ${new Date().toLocaleString('pt-BR')} (${movedCount} sessões movidas para .archive/)*\n`;
                currentContent += logEntry;
                fs.writeFileSync(currentStateMdPath, currentContent, 'utf-8');
            }

            // Atualiza snapshot
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { project: projectName, type: 'clear-memory', time: Date.now() });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                movedCount,
                archivePath: archiveDest,
                message: `${movedCount} sessões arquivadas com segurança.`
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Gerar Dossiê de Backup do Projeto
    if (pathname.startsWith('/api/projects/') && pathname.endsWith('/backup') && req.method === 'POST') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const projectDir = path.join(ROOT_DIR, 'projects', projectName);

            if (!fs.existsSync(projectDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Projeto '${projectName}' não encontrado.` }));
                return;
            }

            const backupData = {
                project: projectName,
                timestamp: new Date().toISOString(),
                exportedAt: new Date().toLocaleString('pt-BR'),
                files: {}
            };

            const collectFiles = (dir, relBase = '') => {
                if (!fs.existsSync(dir)) return;
                const items = fs.readdirSync(dir, { withFileTypes: true });
                for (const item of items) {
                    const full = path.join(dir, item.name);
                    const rel = relBase ? `${relBase}/${item.name}` : item.name;
                    if (item.isDirectory()) {
                        if (item.name !== 'node_modules' && item.name !== '.git' && item.name !== 'bin' && item.name !== 'obj' && item.name !== 'BACKUPS' && item.name !== '.archive' && item.name !== '.trash') {
                            collectFiles(full, rel);
                        }
                    } else if (item.name.endsWith('.md') || item.name.endsWith('.json')) {
                        try {
                            backupData.files[rel] = fs.readFileSync(full, 'utf-8');
                        } catch (e) {}
                    }
                }
            };

            collectFiles(projectDir);

            // Gera também uma versão consolidada em Markdown do dossiê completo
            let consolidatedMarkdown = `# DOSSIÊ DE GOVERNANÇA: ${projectName.toUpperCase()}\n`;
            consolidatedMarkdown += `> Exportado automaticamente pelo AI Second Brain em ${backupData.exportedAt}\n\n`;

            for (const [filename, content] of Object.entries(backupData.files)) {
                consolidatedMarkdown += `\n---\n## 📄 Arquivo: \`${filename}\`\n\n${content}\n`;
            }

            backupData.consolidatedMarkdown = consolidatedMarkdown;

            // Salva fisicamente os arquivos na pasta BACKUPS do projeto
            const backupsDir = path.join(projectDir, 'BACKUPS');
            fs.mkdirSync(backupsDir, { recursive: true });

            const mdFilename = `dossie_governanca_${projectName}.md`;
            const mdPath = path.join(backupsDir, mdFilename);
            fs.writeFileSync(mdPath, consolidatedMarkdown, 'utf-8');

            const jsonFilename = `backup_governanca_${projectName}.json`;
            const jsonPath = path.join(backupsDir, jsonFilename);

            backupData.localFiles = {
                backupsDir: path.normalize(backupsDir),
                markdown: {
                    filename: mdFilename,
                    path: path.normalize(mdPath),
                    size: Buffer.byteLength(consolidatedMarkdown, 'utf-8')
                },
                json: {
                    filename: jsonFilename,
                    path: path.normalize(jsonPath)
                }
            };

            // Grava o JSON incluindo os metadados do backup e caminhos locais
            const jsonContent = JSON.stringify(backupData, null, 2);
            fs.writeFileSync(jsonPath, jsonContent, 'utf-8');
            backupData.localFiles.json.size = Buffer.byteLength(jsonContent, 'utf-8');

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(backupData));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Desvincular ou Excluir Projeto do Segundo Cérebro
    if (pathname.startsWith('/api/projects/') && pathname.endsWith('/unlink') && req.method === 'POST') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const projectDir = path.join(ROOT_DIR, 'projects', projectName);

            if (!fs.existsSync(projectDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Projeto '${projectName}' não encontrado.` }));
                return;
            }

            let wasJunction = false;
            try {
                const lstat = fs.lstatSync(projectDir);
                if (lstat.isSymbolicLink()) {
                    wasJunction = true;
                    // No Windows, fs.unlinkSync remove a junção NTFS SEM remover o diretório original!
                    fs.unlinkSync(projectDir);
                } else {
                    // Projeto local (greenfield): move para pasta de lixeira de segurança
                    const trashDir = path.join(ROOT_DIR, 'projects', '.trash');
                    fs.mkdirSync(trashDir, { recursive: true });
                    const trashDest = path.join(trashDir, `${projectName}_${Date.now()}`);
                    fs.renameSync(projectDir, trashDest);
                }
            } catch (unlinkErr) {
                // Fallback para rmdir se unlink falhar na junção
                try {
                    fs.rmdirSync(projectDir);
                } catch (rmErr) {
                    throw new Error(`Falha ao desvincular projeto: ${unlinkErr.message}`);
                }
            }

            // Atualiza snapshot
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { project: projectName, type: 'unlink-project', time: Date.now() });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                wasJunction,
                message: wasJunction 
                    ? `Vínculo com '${projectName}' desfeito com sucesso! Seus arquivos originais foram mantidos intactos.`
                    : `Projeto '${projectName}' desvinculado e arquivado com sucesso.`
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Dynamic Vault Scan
    if (pathname === '/api/vault') {
        try {
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(vault));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Project Statuses Configuration (Fonte Única da Verdade)
    if (pathname === '/api/config/project-statuses') {
        const statusesPath = path.join(ROOT_DIR, 'config', 'project-statuses.json');
        if (req.method === 'GET') {
            try {
                if (fs.existsSync(statusesPath)) {
                    const data = fs.readFileSync(statusesPath, 'utf-8');
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(data);
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify([]));
                }
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        if (req.method === 'POST') {
            try {
                const body = await readJsonBody(req);
                if (!Array.isArray(body)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Payload deve ser uma lista de status.' }));
                    return;
                }
                fs.mkdirSync(path.dirname(statusesPath), { recursive: true });
                fs.writeFileSync(statusesPath, JSON.stringify(body, null, 2), 'utf-8');

                // Atualiza snapshot do Vault
                delete require.cache[require.resolve('./scripts/scan-vault')];
                const { scanVault } = require('./scripts/scan-vault');
                const vault = scanVault(ROOT_DIR);
                updateSnapshotIfConfigured(vault);

                broadcastEvent('vault-updated', { type: 'statuses-updated', time: Date.now() });

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, message: 'Status atualizados com sucesso.' }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }
    }

    // API: Live Server-Sent Events (SSE)
    if (pathname === '/api/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write('retry: 5000\n\n');
        sseClients.add(res);

        req.on('close', () => {
            sseClients.delete(res);
        });
        return;
    }

    // API: Fetch single raw file content
    if (pathname === '/api/file' && req.method === 'GET') {
        const filePathParam = parsedUrl.searchParams.get('path');
        if (!filePathParam) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing path parameter' }));
            return;
        }

        const safePath = path.resolve(ROOT_DIR, filePathParam);
        if (!safePath.startsWith(ROOT_DIR)) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Access denied' }));
            return;
        }

        if (fs.existsSync(safePath)) {
            const content = fs.readFileSync(safePath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
            res.end(content);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'File not found' }));
        }
        return;
    }

    // API: Salvar conteúdo de arquivo Markdown diretamente no disco
    if ((pathname === '/api/file' || pathname === '/api/file/save') && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const relPath = (body.path || '').trim();
            const content = body.content !== undefined ? body.content : '';

            if (!relPath) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Caminho do arquivo é obrigatório.' }));
                return;
            }

            const safePath = path.resolve(ROOT_DIR, relPath);
            if (!safePath.startsWith(ROOT_DIR)) {
                res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Acesso negado: fora do diretório do Segundo Cérebro.' }));
                return;
            }

            // Garante que o diretório pai existe
            fs.mkdirSync(path.dirname(safePath), { recursive: true });
            fs.writeFileSync(safePath, content, 'utf-8');

            // Atualiza snapshot do Vault
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { file: relPath, type: 'file-saved', time: Date.now() });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                path: relPath,
                message: 'Arquivo salvo com sucesso no disco!',
                size: Buffer.byteLength(content, 'utf-8'),
                mtime: Date.now()
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Selecionar e Gravar Motor de IA em brain.config.json no disco
    if (pathname === '/api/engine/select' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const engineKey = (body.engineKey || 'universal').trim();
            const engine = body.engine || {};

            const configData = {
                activeEngine: engineKey,
                engineName: engine.name || engineKey.toUpperCase(),
                label: engine.label || engineKey,
                icon: engine.icon || '🌐',
                bridgeFile: engine.bridgeFile || 'UNIVERSAL',
                updatedAt: new Date().toISOString()
            };

            const configPath = path.join(ROOT_DIR, 'brain.config.json');
            fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');

            broadcastEvent('engine-changed', configData);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, config: configData }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Obter Motor de IA Atual gravado no disco
    if (pathname === '/api/engine/current' && req.method === 'GET') {
        try {
            const configPath = path.join(ROOT_DIR, 'brain.config.json');
            if (fs.existsSync(configPath)) {
                const configContent = fs.readFileSync(configPath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(configContent);
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ activeEngine: 'antigravity' }));
            }
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Abrir Pasta no Explorador de Arquivos do Sistema Operacional (Windows Explorer / Finder)
    if (pathname === '/api/system/open-folder' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            let targetPath = (body.path || '').trim();

            if (!targetPath) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Caminho não fornecido.' }));
                return;
            }

            if (!path.isAbsolute(targetPath)) {
                targetPath = path.resolve(ROOT_DIR, targetPath);
            }

            if (!fs.existsSync(targetPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Caminho não encontrado no disco: ${targetPath}` }));
                return;
            }

            const cleanPath = path.normalize(targetPath).replace(/["'`$|;&<>]/g, '');

            if (process.platform === 'win32') {
                const stat = fs.statSync(cleanPath);
                console.log(`📂 [System] Abrindo pasta/arquivo no Windows Explorer: ${cleanPath}`);
                if (stat.isDirectory()) {
                    exec(`powershell.exe -NoProfile -Command "Invoke-Item -LiteralPath '${cleanPath.replace(/'/g, "''")}'"`, (err) => {
                        if (err) {
                            console.error('Falha Invoke-Item, tentando start/explorer:', err);
                            exec(`cmd.exe /c start "" "${cleanPath}"`);
                        }
                    });
                } else {
                    exec(`explorer.exe /select,"${cleanPath}"`);
                }
            } else if (process.platform === 'darwin') {
                exec(`open -R "${cleanPath}"`);
            } else {
                exec(`xdg-open "${path.dirname(cleanPath)}"`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, path: cleanPath }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Abrir Arquivo no Sistema Operacional (Aplicativo Padrão)
    if (pathname === '/api/system/open-file' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            let targetPath = (body.path || '').trim();

            if (!targetPath) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Caminho não fornecido.' }));
                return;
            }

            if (!path.isAbsolute(targetPath)) {
                targetPath = path.resolve(ROOT_DIR, targetPath);
            }

            if (!fs.existsSync(targetPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Arquivo não encontrado no disco: ${targetPath}` }));
                return;
            }

            const cleanPath = path.normalize(targetPath).replace(/["'`$|;&<>]/g, '');

            if (process.platform === 'win32') {
                exec(`cmd.exe /c start "" "${cleanPath}"`);
            } else if (process.platform === 'darwin') {
                exec(`open "${cleanPath}"`);
            } else {
                exec(`xdg-open "${cleanPath}"`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, path: cleanPath }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Abrir Projeto na IDE Externa (VS Code / Cursor)
    if (pathname === '/api/system/open-ide' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            let targetPath = (body.path || '').trim();
            if (!targetPath && body.projectName) {
                targetPath = path.join(ROOT_DIR, 'projects', body.projectName);
            }
            const preferredIde = (body.ide || 'code').toLowerCase(); // 'code', 'cursor', 'explorer'

            if (!targetPath) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Caminho ou nome do projeto não fornecido.' }));
                return;
            }

            if (!path.isAbsolute(targetPath)) {
                targetPath = path.resolve(ROOT_DIR, targetPath);
            }

            if (!fs.existsSync(targetPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Caminho não encontrado no disco: ${targetPath}` }));
                return;
            }

            const cleanPath = path.normalize(targetPath).replace(/["'`$|;&<>]/g, '');

            if (preferredIde === 'explorer' || preferredIde === 'pasta') {
                if (process.platform === 'win32') {
                    exec(`powershell.exe -NoProfile -Command "Invoke-Item -LiteralPath '${cleanPath.replace(/'/g, "''")}'"`, (err) => {
                        if (err) exec(`cmd.exe /c start "" "${cleanPath}"`);
                    });
                } else if (process.platform === 'darwin') {
                    exec(`open "${cleanPath}"`);
                } else {
                    exec(`xdg-open "${cleanPath}"`);
                }
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, path: cleanPath, ide: 'explorer' }));
                return;
            }

            const ideCommandMap = {
                'cursor': 'cursor',
                'code': 'code',
                'vscode': 'code',
                'antigravity': 'agy',
                'windsurf': 'windsurf',
                'idea': 'idea',
                'jetbrains': 'idea',
                'pycharm': 'pycharm',
                'webstorm': 'webstorm'
            };
            const ideCmd = ideCommandMap[preferredIde] || 'code';

            console.log(`💻 [System] Abrindo projeto na IDE (${ideCmd}): ${cleanPath}`);

            if (process.platform === 'win32') {
                exec(`cmd.exe /c ${ideCmd} "${cleanPath}"`, (err) => {
                    if (err) {
                        console.warn(`⚠️ [System] Falha ao abrir com ${ideCmd}, tentando fallback para code/explorer:`, err.message);
                        if (ideCmd !== 'code') {
                            exec(`cmd.exe /c code "${cleanPath}"`, (err2) => {
                                if (err2) exec(`cmd.exe /c start "" "${cleanPath}"`);
                            });
                        } else {
                            exec(`cmd.exe /c start "" "${cleanPath}"`);
                        }
                    }
                });
            } else if (process.platform === 'darwin') {
                exec(`${ideCmd} "${cleanPath}"`, (err) => {
                    if (err) exec(`open "${cleanPath}"`);
                });
            } else {
                exec(`${ideCmd} "${cleanPath}"`, (err) => {
                    if (err) exec(`xdg-open "${cleanPath}"`);
                });
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, path: cleanPath, ide: ideCmd }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // ============================================================
    // RESEARCH LAB — AI-Powered Knowledge Synthesis
    // ============================================================

    // Utilitário para carregar dinamicamente o AI Gateway com hot-reload de módulo
    function getAiGateway() {
        try {
            delete require.cache[require.resolve('./scripts/ai-gateway')];
        } catch (_) {}
        return require('./scripts/ai-gateway');
    }

    // API: Check AI Configuration Status (compatível com /status e /config)
    if ((pathname === '/api/ai/status' || pathname === '/api/ai/config') && req.method === 'GET') {
        try {
            const config = getAiGateway().getConfig();
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                ...config,
                // retrocompatibilidade com campos legados
                apiKeyPreview: config.apiKeyMasked
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // API: Test AI Connection & Fetch Models (Live BYOK Ping)
    if (pathname === '/api/ai/test' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const result = await getAiGateway().testConnection({
                provider: body.provider,
                apiKey: body.apiKey,
                baseUrl: body.baseUrl,
                model: body.model
            });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        } catch (err) {
            const statusCode = err.statusCode || 400;
            res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: false,
                error: err.message,
                statusCode,
                quotaExceeded: !!err.quotaExceeded
            }));
        }
        return;
    }

    // API: Save AI Gateway Configuration to .env
    if (pathname === '/api/ai/save' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const updated = getAiGateway().saveConfig({
                provider: body.provider,
                apiKey: body.apiKey,
                model: body.model,
                baseUrl: body.baseUrl,
                maxTokens: body.maxTokens,
                temperature: body.temperature,
                cacheHours: body.cacheHours,
                maxRetries: body.maxRetries
            });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                message: 'Configuração de IA salva e ativada com sucesso.',
                config: updated
            }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // API: Refine Research Prompt with AI
    if (pathname === '/api/ai/refine-prompt' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const userText = (body.text || body.prompt || '').trim();
            const projectName = (body.project || body.projectName || '').trim();

            if (!userText) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Texto da pesquisa é obrigatório.' }));
                return;
            }

            // Build project context from PROJECT.md and ARCHITECTURE.md
            let projectContext = 'Nenhum projeto específico selecionado.';
            if (projectName) {
                const projectDir = path.join(ROOT_DIR, 'projects', projectName);
                const parts = [];
                const projectMdPath = path.join(projectDir, 'PROJECT.md');
                const archMdPath = path.join(projectDir, 'ARCHITECTURE.md');
                if (fs.existsSync(projectMdPath)) {
                    parts.push('--- PROJECT.md ---\n' + fs.readFileSync(projectMdPath, 'utf-8'));
                }
                if (fs.existsSync(archMdPath)) {
                    parts.push('--- ARCHITECTURE.md ---\n' + fs.readFileSync(archMdPath, 'utf-8'));
                }
                if (parts.length > 0) {
                    projectContext = parts.join('\n\n');
                } else {
                    projectContext = `Projeto: ${projectName} (sem documentação de contexto disponível)`;
                }
            }

            console.log(`🧠 [Research Lab] Refinando prompt para projeto '${projectName || 'global'}' (${userText.length} chars)`);

            const result = await groq.refineResearchPrompt(userText, projectContext);

            console.log(`✅ [Research Lab] Prompt refinado — ${result.usage.total_tokens || '?'} tokens usados`);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                original: userText,
                refined: result.refined,
                refinedPrompt: result.refined,
                model: result.model,
                usage: result.usage
            }));

        } catch (err) {
            console.error('❌ [Research Lab] Erro no refinamento:', err.message);
            const status = err.statusCode === 429 || err.quotaExceeded ? 429 : (err.statusCode || 500);
            res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ 
                error: err.message, 
                quotaExceeded: status === 429,
                statusCode: status 
            }));
        }
        return;
    }

    // API: Decompose Research Topic into Sub-topics
    if (pathname === '/api/ai/decompose' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const definition = (body.definition || body.prompt || body.text || '').trim();
            const projectName = (body.project || body.projectName || '').trim();

            if (!definition) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Definição da pesquisa é obrigatória.' }));
                return;
            }


            // Build project context
            let projectContext = 'Nenhum projeto específico selecionado.';
            if (projectName) {
                const projectDir = path.join(ROOT_DIR, 'projects', projectName);
                const parts = [];
                const projectMdPath = path.join(projectDir, 'PROJECT.md');
                const archMdPath = path.join(projectDir, 'ARCHITECTURE.md');
                if (fs.existsSync(projectMdPath)) {
                    parts.push('--- PROJECT.md ---\n' + fs.readFileSync(projectMdPath, 'utf-8'));
                }
                if (fs.existsSync(archMdPath)) {
                    parts.push('--- ARCHITECTURE.md ---\n' + fs.readFileSync(archMdPath, 'utf-8'));
                }
                if (parts.length > 0) {
                    projectContext = parts.join('\n\n');
                }
            }

            console.log(`🔬 [Research Lab] Decompondo tópico para '${projectName || 'global'}'`);

            const result = await groq.decomposeResearchTopic(definition, projectContext);

            console.log(`✅ [Research Lab] ${result.subtopics.length} sub-tópicos identificados`);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                subtopics: result.subtopics,
                estimatedFiles: result.estimatedFiles,
                researchDepth: result.researchDepth,
                model: result.model,
                usage: result.usage
            }));
        } catch (err) {
            console.error('❌ [Research Lab] Erro na decomposição:', err.message);
            const status = err.statusCode === 429 || err.quotaExceeded ? 429 : (err.statusCode || 500);
            res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ 
                error: err.message, 
                quotaExceeded: status === 429,
                statusCode: status 
            }));
        }
        return;
    }

    // ============================================================
    // SESSION CAPTURE — Registro de sessão assistido por IA
    // Fluxo: /session/draft (somente leitura + IA) → revisão humana → /session/commit (grava)
    // ============================================================
    const sessionRouteMatch = pathname.match(/^\/api\/projects\/([^/]+)\/session\/(draft|commit)$/);
    if (sessionRouteMatch && req.method === 'POST') {
        const sessionProject = decodeURIComponent(sessionRouteMatch[1]);
        const sessionAction = sessionRouteMatch[2];
        const sendJson = (status, payload) => {
            res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(payload));
        };

        try {
            delete require.cache[require.resolve('./scripts/session-capture')];
            const sessionCapture = require('./scripts/session-capture');
            const body = await readJsonBody(req);

            if (sessionAction === 'draft') {
                const input = await sessionCapture.prepareDraftInput(ROOT_DIR, sessionProject, body.notes);
                console.log(`🧠 [Session Capture] Gerando rascunho para '${input.name}' (git: ${input.gitSummary.available ? input.gitSummary.commits + ' commits, ' + input.gitSummary.changedFiles + ' arquivos' : 'indisponível'})`);

                const startedAt = Date.now();
                const ai = await getAiGateway().summarizeSession(input.promptText, { skipCache: !!body.regenerate });
                const draft = sessionCapture.normalizeDraft(ai.draft, input.state);

                console.log(`✅ [Session Capture] Rascunho pronto em ${Date.now() - startedAt}ms`);
                sendJson(200, {
                    success: true,
                    project: input.name,
                    draft,
                    git: input.gitSummary,
                    model: ai.model,
                    provider: ai.provider,
                    usage: ai.usage,
                    inferenceMs: Date.now() - startedAt
                });
                return;
            }

            // commit
            const result = sessionCapture.commitSession(ROOT_DIR, sessionProject, body);

            try {
                delete require.cache[require.resolve('./scripts/scan-vault')];
                const { scanVault } = require('./scripts/scan-vault');
                const vault = scanVault(ROOT_DIR);
                updateSnapshotIfConfigured(vault);
            } catch (snapErr) {
                console.warn('⚠️ [Session Capture] Falha ao atualizar snapshot do vault:', snapErr.message);
            }
            broadcastEvent('vault-updated', { project: sessionProject, type: 'session-capture', time: Date.now() });

            console.log(`💾 [Session Capture] Sessão gravada: ${result.sessionFile}`);
            sendJson(200, { success: true, ...result });
        } catch (err) {
            console.error(`❌ [Session Capture] Erro (${sessionAction}):`, err.message);
            const status = err.statusCode === 429 || err.quotaExceeded ? 429 : (err.statusCode || 500);
            sendJson(status, {
                success: false,
                error: err.message,
                quotaExceeded: status === 429,
                statusCode: status
            });
        }
        return;
    }

    // ============================================================
    // PERGUNTE AO CÉREBRO — Q&A Semântico & Busca com Citações
    // ============================================================
    if (pathname === '/api/brain/ask' && req.method === 'POST') {
        const sendJson = (status, payload) => {
            res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(payload));
        };

        try {
            delete require.cache[require.resolve('./scripts/brain-search')];
            const brainSearch = require('./scripts/brain-search');
            const body = await readJsonBody(req);
            const query = (body.query || '').trim();

            if (!query) {
                sendJson(400, { success: false, error: 'A pergunta não pode ficar vazia.' });
                return;
            }

            const projectTarget = body.projectName || body.scope || '';
            const categoryTarget = body.categoryFilter || body.category || '';
            console.log(`🔍 [Pergunte ao Cérebro] Consulta recebida: "${query}" (projeto: ${projectTarget || 'geral'}, categoria: ${categoryTarget || 'todas'})`);
            const answer = await brainSearch.askBrain(ROOT_DIR, query, {
                projectName: projectTarget,
                categoryFilter: categoryTarget,
                fastOnly: !!body.fastOnly
            });

            sendJson(200, answer);
        } catch (err) {
            console.error('❌ [Pergunte ao Cérebro] Erro:', err.message);
            const status = err.statusCode === 429 || err.quotaExceeded ? 429 : (err.statusCode || 500);
            sendJson(status, {
                success: false,
                error: err.message,
                quotaExceeded: status === 429,
                statusCode: status
            });
        }
        return;
    }

    if (pathname === '/api/brain/search' && req.method === 'GET') {
        try {
            delete require.cache[require.resolve('./scripts/brain-search')];
            const brainSearch = require('./scripts/brain-search');
            const q = parsedUrl.searchParams.get('q') || '';
            const project = parsedUrl.searchParams.get('project') || parsedUrl.searchParams.get('scope') || '';
            const category = parsedUrl.searchParams.get('category') || parsedUrl.searchParams.get('categoryFilter') || '';

            const results = brainSearch.retrieveRelevantSnippets(ROOT_DIR, q, {
                projectName: project,
                categoryFilter: category,
                limit: 10
            });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                query: q,
                results: results.map(r => ({
                    path: r.file.path,
                    title: r.file.title,
                    category: r.file.category,
                    icon: r.file.icon,
                    score: r.score,
                    snippet: r.snippet
                }))
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // API: List Research Labs for a Project
    if (pathname.startsWith('/api/projects/') && pathname.endsWith('/research') && req.method === 'GET') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const projectDir = path.join(ROOT_DIR, 'projects', projectName);
            const researchDir = path.join(projectDir, 'RESEARCH');

            if (!fs.existsSync(projectDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Projeto '${projectName}' não encontrado.` }));
                return;
            }

            const researches = [];

            if (fs.existsSync(researchDir)) {
                const entries = fs.readdirSync(researchDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        const researchPath = path.join(researchDir, entry.name);
                        const metaPath = path.join(researchPath, '_meta.json');
                        const overviewPath = path.join(researchPath, 'OVERVIEW.md');

                        let meta = { topic: entry.name, status: 'active', created: null };
                        if (fs.existsSync(metaPath)) {
                            try {
                                meta = { ...meta, ...JSON.parse(fs.readFileSync(metaPath, 'utf-8')) };
                            } catch (e) {}
                        }

                        // Count files in research folder
                        let fileCount = 0;
                        let totalSize = 0;
                        try {
                            const files = fs.readdirSync(researchPath);
                            for (const f of files) {
                                if (f.endsWith('.md')) {
                                    fileCount++;
                                    try {
                                        totalSize += fs.statSync(path.join(researchPath, f)).size;
                                    } catch (e) {}
                                }
                            }
                        } catch (e) {}

                        let knowledgeFiles = [];
                        let actionableFiles = [];
                        try {
                            const kDir = path.join(researchPath, 'knowledge');
                            if (fs.existsSync(kDir)) {
                                knowledgeFiles = fs.readdirSync(kDir).filter(f => f.endsWith('.md'));
                                for (const kf of knowledgeFiles) {
                                    try { totalSize += fs.statSync(path.join(kDir, kf)).size; } catch (e) {}
                                }
                            }
                        } catch (e) {}
                        try {
                            const aDir = path.join(researchPath, 'actionable');
                            if (fs.existsSync(aDir)) {
                                actionableFiles = fs.readdirSync(aDir).filter(f => f.endsWith('.md'));
                                for (const af of actionableFiles) {
                                    try { totalSize += fs.statSync(path.join(aDir, af)).size; } catch (e) {}
                                }
                            }
                        } catch (e) {}

                        researches.push({
                            slug: entry.name,
                            topic: meta.topic,
                            definition: meta.definition || '',
                            status: meta.status,
                            created: meta.created,
                            fileCount,
                            knowledgeFiles,
                            actionableFiles,
                            meta,
                            totalSizeKb: (totalSize / 1024).toFixed(1),
                            hasOverview: fs.existsSync(overviewPath),
                            path: `projects/${projectName}/RESEARCH/${entry.name}`
                        });
                    }
                }
            }


            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                project: projectName,
                researchCount: researches.length,
                researches
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Create New Research Lab for a Project
    if (pathname.startsWith('/api/projects/') && pathname.endsWith('/research') && req.method === 'POST') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const projectDir = path.join(ROOT_DIR, 'projects', projectName);

            if (!fs.existsSync(projectDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Projeto '${projectName}' não encontrado.` }));
                return;
            }

            const body = await readJsonBody(req);
            const topic = (body.topic || '').trim();
            const definition = (body.definition || '').trim();

            if (!topic || !definition) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Tópico e definição são obrigatórios.' }));
                return;
            }

            const slug = topic.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 60);

            const researchDir = path.join(projectDir, 'RESEARCH', slug);

            if (fs.existsSync(researchDir)) {
                res.writeHead(409, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Já existe uma pesquisa '${slug}' neste projeto.` }));
                return;
            }

            // Create research directory structure
            fs.mkdirSync(path.join(researchDir, 'knowledge'), { recursive: true });
            fs.mkdirSync(path.join(researchDir, 'actionable'), { recursive: true });

            const now = new Date().toISOString();

            // Save metadata
            const meta = {
                topic,
                definition,
                status: 'created',
                created: now,
                lastUpdated: now,
                project: projectName,
                definitionHistory: [
                    { text: definition, timestamp: now, version: 1 }
                ]
            };
            fs.writeFileSync(path.join(researchDir, '_meta.json'), JSON.stringify(meta, null, 2), 'utf-8');

            // Create initial OVERVIEW.md
            const overviewMd = `# 🔬 ${topic}\n\n> Pesquisa criada em ${new Date().toLocaleDateString('pt-BR')}\n> Projeto: **${projectName}**\n\n## Definição\n\n${definition}\n\n## Status: 🟡 Aguardando pesquisa\n\n---\n\n*Os arquivos de conhecimento serão gerados aqui conforme a pesquisa avançar.*\n`;
            fs.writeFileSync(path.join(researchDir, 'OVERVIEW.md'), overviewMd, 'utf-8');

            // Update vault snapshot
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { project: projectName, type: 'new-research', research: slug, time: Date.now() });

            console.log(`🔬 [Research Lab] Nova pesquisa criada: '${topic}' em ${projectName}`);

            res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                slug,
                topic,
                path: `projects/${projectName}/RESEARCH/${slug}`,
                research: {
                    slug,
                    topic,
                    definition,
                    status: meta.status,
                    created: now,
                    fileCount: 0,
                    knowledgeFiles: [],
                    actionableFiles: [],
                    meta
                },
                message: `Laboratório de pesquisa '${topic}' criado com sucesso!`
            }));

        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Update Research Definition (Prompt Vivo)
    if (pathname.startsWith('/api/projects/') && pathname.includes('/research/') && pathname.endsWith('/definition') && req.method === 'POST') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const researchSlug = decodeURIComponent(parts[5] || '');
            const researchDir = path.join(ROOT_DIR, 'projects', projectName, 'RESEARCH', researchSlug);
            const metaPath = path.join(researchDir, '_meta.json');

            if (!fs.existsSync(metaPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Pesquisa não encontrada.' }));
                return;
            }

            const body = await readJsonBody(req);
            const newDefinition = (body.definition || '').trim();

            if (!newDefinition) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Nova definição é obrigatória.' }));
                return;
            }

            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            const now = new Date().toISOString();
            const version = (meta.definitionHistory?.length || 0) + 1;

            meta.definition = newDefinition;
            meta.lastUpdated = now;
            if (!meta.definitionHistory) meta.definitionHistory = [];
            meta.definitionHistory.push({ text: newDefinition, timestamp: now, version });

            fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

            console.log(`✏️ [Research Lab] Definição atualizada (v${version}): '${meta.topic}'`);

            broadcastEvent('vault-updated', { project: projectName, type: 'research-updated', research: researchSlug, time: Date.now() });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                version,
                definition: newDefinition,
                message: `Definição atualizada para versão ${version}.`
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Run Research Execution (Etapa 3 - Autônoma)
    if (pathname.startsWith('/api/projects/') && pathname.includes('/research/') && pathname.endsWith('/run') && req.method === 'POST') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const researchSlug = decodeURIComponent(parts[5] || '');

            broadcastEvent('research-started', { project: projectName, slug: researchSlug, time: Date.now() });

            // Executa a pesquisa chamando o motor
            const result = await researchEngine.runResearchLab(projectName, researchSlug, (progress) => {
                broadcastEvent('research-progress', { project: projectName, slug: researchSlug, ...progress, time: Date.now() });
            });

            // Atualiza o snapshot do Vault após geração dos novos arquivos
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { project: projectName, type: 'research-completed', slug: researchSlug, time: Date.now() });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        } catch (err) {
            console.error('❌ [Research Lab] Erro na execução da pesquisa:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Check Research Status
    if (pathname.startsWith('/api/projects/') && pathname.includes('/research/') && pathname.endsWith('/status') && req.method === 'GET') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const researchSlug = decodeURIComponent(parts[5] || '');
            const running = researchEngine.isResearchRunning(projectName, researchSlug);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ running }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Delete a specific file from a research lab
    if (pathname.startsWith('/api/projects/') && pathname.includes('/research/') && pathname.endsWith('/file/delete') && req.method === 'POST') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const researchSlug = decodeURIComponent(parts[5] || '');
            const researchDir = path.join(ROOT_DIR, 'projects', projectName, 'RESEARCH', researchSlug);

            const body = await readJsonBody(req);
            const relPath = (body.relPath || '').trim(); // e.g. "knowledge/01-fundamentos-nutricao-bolos.md"

            if (!relPath || relPath.includes('..') || relPath.startsWith('/') || relPath.startsWith('\\')) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Caminho de arquivo inválido.' }));
                return;
            }

            const targetFilePath = path.join(researchDir, relPath);
            if (!fs.existsSync(targetFilePath)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Arquivo não encontrado no disco.' }));
                return;
            }

            fs.unlinkSync(targetFilePath);

            // Atualiza _meta.json se existir
            const metaPath = path.join(researchDir, '_meta.json');
            if (fs.existsSync(metaPath)) {
                try {
                    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                    const filename = path.basename(relPath);
                    if (meta.generatedFiles) {
                        meta.generatedFiles = meta.generatedFiles.filter(f => f.file !== filename && f.path !== relPath);
                        meta.generatedFilesCount = meta.generatedFiles.length;
                    }
                    meta.lastUpdated = new Date().toISOString();
                    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
                } catch(e) {}
            }

            // Atualiza OVERVIEW.md se existir (remove linhas que referenciam o arquivo)
            const overviewPath = path.join(researchDir, 'OVERVIEW.md');
            if (fs.existsSync(overviewPath)) {
                try {
                    let ovContent = fs.readFileSync(overviewPath, 'utf-8');
                    const filename = path.basename(relPath);
                    const lines = ovContent.split('\n');
                    const filtered = lines.filter(line => !line.includes(`(${relPath})`) && !line.includes(`(${filename})`));
                    fs.writeFileSync(overviewPath, filtered.join('\n'), 'utf-8');
                } catch(e) {}
            }

            // Atualiza snapshot do Vault
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { project: projectName, type: 'research-file-deleted', time: Date.now() });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: `Arquivo '${path.basename(relPath)}' excluído com sucesso.` }));
        } catch(err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Delete an entire research lab
    if (pathname.startsWith('/api/projects/') && pathname.includes('/research/') && (pathname.endsWith('/delete') || req.method === 'DELETE')) {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const researchSlug = decodeURIComponent(parts[5] || '');
            const researchDir = path.join(ROOT_DIR, 'projects', projectName, 'RESEARCH', researchSlug);

            if (!fs.existsSync(researchDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Laboratório de pesquisa não encontrado.' }));
                return;
            }

            fs.rmSync(researchDir, { recursive: true, force: true });

            // Atualiza snapshot do Vault
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { project: projectName, type: 'research-deleted', time: Date.now() });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: `Pesquisa '${researchSlug}' excluída com sucesso.` }));
        } catch(err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Update research subtopics
    if (pathname.startsWith('/api/projects/') && pathname.includes('/research/') && pathname.endsWith('/subtopics') && req.method === 'POST') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const researchSlug = decodeURIComponent(parts[5] || '');
            const researchDir = path.join(ROOT_DIR, 'projects', projectName, 'RESEARCH', researchSlug);

            if (!fs.existsSync(researchDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Laboratório de pesquisa não encontrado.' }));
                return;
            }

            const body = await readJsonBody(req);
            const subtopics = body.subtopics || [];

            const metaPath = path.join(researchDir, '_meta.json');
            let meta = {};
            if (fs.existsSync(metaPath)) {
                try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')); } catch(e) {}
            }

            meta.subtopics = subtopics;
            meta.lastUpdated = new Date().toISOString();
            fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

            // Atualiza snapshot do Vault
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { project: projectName, type: 'research-subtopics-updated', time: Date.now() });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, subtopics }));
        } catch(err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Delete all generated files in a research lab (keeps definition and _meta.json)
    if (pathname.startsWith('/api/projects/') && pathname.includes('/research/') && pathname.endsWith('/clear-files') && req.method === 'POST') {
        try {
            const parts = pathname.split('/');
            const projectName = decodeURIComponent(parts[3] || '');
            const researchSlug = decodeURIComponent(parts[5] || '');
            const researchDir = path.join(ROOT_DIR, 'projects', projectName, 'RESEARCH', researchSlug);

            if (!fs.existsSync(researchDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Laboratório de pesquisa não encontrado.' }));
                return;
            }

            let deletedCount = 0;
            const knowledgeDir = path.join(researchDir, 'knowledge');
            const actionableDir = path.join(researchDir, 'actionable');

            if (fs.existsSync(knowledgeDir)) {
                const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));
                for (const f of files) {
                    try {
                        fs.unlinkSync(path.join(knowledgeDir, f));
                        deletedCount++;
                    } catch(e) {}
                }
            }

            if (fs.existsSync(actionableDir)) {
                const files = fs.readdirSync(actionableDir).filter(f => f.endsWith('.md'));
                for (const f of files) {
                    try {
                        fs.unlinkSync(path.join(actionableDir, f));
                        deletedCount++;
                    } catch(e) {}
                }
            }

            // Atualiza _meta.json mantendo a definição e limpando arquivos gerados
            const metaPath = path.join(researchDir, '_meta.json');
            if (fs.existsSync(metaPath)) {
                try {
                    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                    meta.generatedFiles = [];
                    meta.generatedFilesCount = 0;
                    meta.status = 'ready';
                    meta.lastUpdated = new Date().toISOString();
                    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
                } catch(e) {}
            }

            // Atualiza OVERVIEW.md se existir
            const overviewPath = path.join(researchDir, 'OVERVIEW.md');
            if (fs.existsSync(overviewPath)) {
                try {
                    const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf-8')) : {};
                    const topic = meta.topic || researchSlug;
                    const cleanOverview = `# 🔬 Laboratório de Pesquisa: ${topic}\n\n> Status: 🟡 Pronto para Pesquisa (0 arquivos gerados)\n\n## 📋 Definição da Pesquisa\n${meta.definition || ''}\n\n## 📑 Índice de Documentos\n\n_Nenhum documento gerado ainda._\n`;
                    fs.writeFileSync(overviewPath, cleanOverview, 'utf-8');
                } catch(e) {}
            }

            // Atualiza snapshot do Vault
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            updateSnapshotIfConfigured(vault);

            broadcastEvent('vault-updated', { project: projectName, type: 'research-files-cleared', time: Date.now() });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: `Todos os ${deletedCount} arquivos foram excluídos com sucesso.`, deletedCount }));
        } catch(err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }


    // Static Files: docs/brain-ui
    let relativeFile = pathname === '/' ? '/index.html' : pathname;
    let filePath = path.join(UI_DIR, relativeFile);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
        let rootCandidate = path.join(ROOT_DIR, relativeFile);
        if (fs.existsSync(rootCandidate) && rootCandidate.startsWith(ROOT_DIR)) {
            if (fs.statSync(rootCandidate).isDirectory()) {
                rootCandidate = path.join(rootCandidate, 'index.html');
            }
            if (fs.existsSync(rootCandidate)) {
                filePath = rootCandidate;
            }
        }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': mime,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 — Arquivo não encontrado');
    }
}

function openBrowser(url) {
    if (process.platform === 'win32') {
        exec(`start ${url}`);
    } else if (process.platform === 'darwin') {
        exec(`open ${url}`);
    } else {
        exec(`xdg-open ${url}`);
    }
}

function startServer(port, maxAttempts = 10) {
    const server = http.createServer(handleRequest);

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            // Check if our server is already answering on this port
            const checkReq = http.get(`http://localhost:${port}/api/vault`, (res) => {
                if (res.statusCode === 200) {
                    console.log('\n🧠 ═══════════════════════════════════════════════════════');
                    console.log(`   🟢 O AI SECOND BRAIN JÁ ESTÁ EM EXECUÇÃO NA PORTA ${port}!`);
                    console.log(`   🔗 URL: http://localhost:${port}`);
                    console.log('═══════════════════════════════════════════════════════════\n');
                    openBrowser(`http://localhost:${port}`);
                    return;
                }
                // Port busy with something else, try next port
                console.log(`⚠️ Porta ${port} ocupada. Tentando porta ${port + 1}...`);
                startServer(port + 1, maxAttempts - 1);
            });

            checkReq.on('error', () => {
                console.log(`⚠️ Porta ${port} em uso (soquete fechando). Tentando porta ${port + 1}...`);
                startServer(port + 1, maxAttempts - 1);
            });
        } else {
            console.error('❌ Erro no servidor:', err);
        }
    });

    server.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log('\n🧠 ═══════════════════════════════════════════════════════');
        console.log(`   AI SECOND BRAIN — SERVIDOR AO VIVO EM EXECUÇÃO`);
        console.log(`   🔗 URL: ${url}`);
        console.log('   📂 Varrendo todos os arquivos e subpastas em tempo real');
        console.log('═══════════════════════════════════════════════════════════\n');
        setupWatcher();
        openBrowser(url);
    });
}

startServer(INITIAL_PORT);
