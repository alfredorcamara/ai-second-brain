/**
 * AI SECOND BRAIN — Live Vault Server
 * Zero-dependency local server that:
 * 1. Serves the Brain Visualizer UI
 * 2. Scans and serves all Markdown files across all subfolders dynamically
 * 3. Provides live file watching (SSE) so changes made by AI or user reflect instantly!
 * 4. Handles port busy (EADDRINUSE) gracefully with auto-fallback to next port!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { scanVault } = require('./scripts/scan-vault');

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
            // Dispara se for arquivo Markdown ou alteração estrutural em pastas vitais
            if (filename.endsWith('.md') || filename.includes('projects') || filename.includes('knowledge') || filename.includes('decisions') || filename.includes('memory')) {
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

            // PROJECT.md
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
- Decisões Técnicas: \`DECISIONS/\`
- Memória de Sessões: \`MEMORY/sessions/\`
`;

            // CURRENT_STATE.md
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

            // ARCHITECTURE.md
            const archMd = `# ${safeName} — Arquitetura da Solução

> Visão arquitetural, padrões e design do sistema.

## 1. Stack Tecnológica
- **Linguagem / Framework**: ${stack}

## 2. Princípios Adotados
- Código idiomático e desacoplado.
- Se utilizar IA: aplicar o AI Decision Gate (\`.agents/rules/01-ai-decision.md\`).
`;

            fs.writeFileSync(path.join(targetFolder, 'PROJECT.md'), projectMd, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, 'CURRENT_STATE.md'), currentStateMd, 'utf-8');
            fs.writeFileSync(path.join(targetFolder, 'ARCHITECTURE.md'), archMd, 'utf-8');

            // Atualiza snapshot do Vault
            delete require.cache[require.resolve('./scripts/scan-vault')];
            const { scanVault } = require('./scripts/scan-vault');
            const vault = scanVault(ROOT_DIR);
            const snapshotPath = path.join(UI_DIR, 'vault-data.js');
            fs.writeFileSync(snapshotPath, `window.VAULT_SNAPSHOT = ${JSON.stringify(vault, null, 2)};\n`, 'utf-8');

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
            const snapshotPath = path.join(UI_DIR, 'vault-data.js');
            fs.writeFileSync(snapshotPath, `window.VAULT_SNAPSHOT = ${JSON.stringify(vault, null, 2)};\n`, 'utf-8');

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
    if (pathname === '/api/file') {
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

    // Static Files: docs/brain-ui
    let relativeFile = pathname === '/' ? '/index.html' : pathname;
    let filePath = path.join(UI_DIR, relativeFile);

    if (!fs.existsSync(filePath)) {
        const rootCandidate = path.join(ROOT_DIR, relativeFile);
        if (fs.existsSync(rootCandidate) && rootCandidate.startsWith(ROOT_DIR)) {
            filePath = rootCandidate;
        }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
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
