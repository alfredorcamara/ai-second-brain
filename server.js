/**
 * AI SECOND BRAIN — Live Vault Server
 * Zero-dependency local server that:
 * 1. Serves the Brain Visualizer UI
 * 2. Scans and serves all Markdown files across all subfolders dynamically
 * 3. Provides live file watching (SSE) so changes made by AI or user reflect instantly!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { scanVault } = require('./scripts/scan-vault');

const PORT = process.env.PORT || 3333;
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
function setupWatcher() {
    try {
        fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
            if (!filename) return;
            if (filename.includes('node_modules') || filename.includes('.git')) return;
            if (filename.endsWith('.md')) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    console.log(`⚡ [Watcher] Arquivo alterado: ${filename}`);
                    broadcastEvent('vault-updated', { file: filename, time: Date.now() });
                }, 300);
            }
        });
        console.log('👀 [Watcher] Monitorando alterações em tempo real nos arquivos Markdown...');
    } catch (e) {
        console.warn('⚠️ [Watcher] Watch recursivo não suportado neste ambiente:', e.message);
    }
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // API: Dynamic Vault Scan
    if (pathname === '/api/vault') {
        try {
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

    // If file is not in docs/brain-ui, check if it's in ROOT (e.g. raw markdown or assets)
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
});

server.listen(PORT, () => {
    console.log('\n🧠 ═══════════════════════════════════════════════════════');
    console.log(`   AI SECOND BRAIN — SERVIDOR AO VIVO EM EXECUÇÃO`);
    console.log(`   🔗 URL: http://localhost:${PORT}`);
    console.log('   📂 Varrendo todos os arquivos e subpastas em tempo real');
    console.log('═══════════════════════════════════════════════════════════\n');
    setupWatcher();
});
