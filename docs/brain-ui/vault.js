// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Dynamic Vault Manager
// Handles file discovery, markdown parsing, live sync
// ═══════════════════════════════════════════════════

class VaultManager {
    constructor() {
        this.mode = 'snapshot'; // 'live' | 'folder' | 'snapshot'
        this.data = null;
        this.filesByPath = new Map();
        this.filesById = new Map();
        this.eventSource = null;
        this.onVaultUpdated = null;
        this.activeFilePath = null;
    }

    async init() {
        // 1. Try to connect to Live Server (/api/vault)
        const isLive = await this._tryLiveServer();
        if (isLive) return;

        // 2. Try to load cached folder from localStorage
        const hasCached = this._tryLoadCachedFolder();
        if (hasCached) return;

        // 3. Fallback to pre-indexed Snapshot
        this._loadSnapshot();
    }

    async _tryLiveServer() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            const res = await fetch('/api/vault', { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const vaultData = await res.json();
                this.mode = 'live';
                this._setData(vaultData);
                this._setupSSE();
                console.log('🟢 [Vault] Conectado ao Servidor Ao Vivo (/api/vault)');
                return true;
            }
        } catch (e) {
            // Live server not running, continue to fallbacks
        }
        return false;
    }

    _setupSSE() {
        if (this.eventSource) return;
        try {
            this.eventSource = new EventSource('/api/events');
            this.eventSource.addEventListener('vault-updated', async (event) => {
                const info = JSON.parse(event.data);
                console.log('⚡ [Vault] Evento recebido: arquivo alterado', info);
                await this.refresh();
                if (this.onVaultUpdated) this.onVaultUpdated(info);
            });
        } catch (e) {
            console.warn('[Vault] SSE não suportado:', e);
        }
    }

    async refresh() {
        if (this.mode === 'live') {
            try {
                const res = await fetch('/api/vault');
                if (res.ok) {
                    const vaultData = await res.json();
                    this._setData(vaultData);
                }
            } catch (e) {
                console.error('[Vault] Erro ao atualizar do servidor:', e);
            }
        }
    }

    _tryLoadCachedFolder() {
        try {
            const cached = localStorage.getItem('ai_second_brain_custom_vault');
            if (cached) {
                const parsed = JSON.parse(cached);
                this.mode = 'folder';
                this._setData(parsed);
                console.log('📁 [Vault] Carregado de pasta local em cache');
                return true;
            }
        } catch (e) {
            console.warn('[Vault] Erro ao ler cache local:', e);
        }
        return false;
    }

    _loadSnapshot() {
        if (window.VAULT_SNAPSHOT) {
            this.mode = 'snapshot';
            this._setData(window.VAULT_SNAPSHOT);
            console.log('💾 [Vault] Carregado Snapshot embutido (40 arquivos)');
        } else {
            console.warn('[Vault] Snapshot não encontrado');
        }
    }

    _setData(vaultData) {
        this.data = vaultData;
        this.filesByPath.clear();
        this.filesById.clear();

        if (vaultData.files) {
            for (const file of vaultData.files) {
                const normalized = file.path.replace(/\\/g, '/');
                this.filesByPath.set(normalized, file);
                this.filesByPath.set(normalized.toLowerCase(), file);
                this.filesById.set(file.id, file);

                // Also allow lookup by filename (e.g. "00-core.md" or "00-core")
                const baseName = file.name.toLowerCase();
                const baseNameNoExt = baseName.replace(/\.md$/, '');
                if (!this.filesByPath.has(baseName)) this.filesByPath.set(baseName, file);
                if (!this.filesByPath.has(baseNameNoExt)) this.filesByPath.set(baseNameNoExt, file);
            }
        }

        this._updateStatusBadge();
    }

    _updateStatusBadge() {
        const badge = document.getElementById('vaultStatusBadge');
        if (!badge) return;

        if (this.mode === 'live') {
            badge.className = 'vault-status live';
            badge.innerHTML = `<span class="status-dot live"></span> Ao Vivo (Disco)`;
            badge.title = 'Conectado diretamente aos arquivos do projeto no disco com hot-reload.';
        } else if (this.mode === 'folder') {
            badge.className = 'vault-status folder';
            badge.innerHTML = `<span class="status-dot folder"></span> Pasta Conectada`;
            badge.title = 'Lendo arquivos da pasta selecionada pelo navegador.';
        } else {
            badge.className = 'vault-status snapshot';
            badge.innerHTML = `<span class="status-dot snapshot"></span> Snapshot (${this.filesByPath.size / 3 | 0} docs)`;
            badge.title = 'Visualizando snapshot local dos arquivos. Inicie "node server.js" para modo ao vivo.';
        }
    }

    // ── In-Browser Folder Picker ──────────────────────
    async connectFolderFromInput(inputElement) {
        const filesList = inputElement.files;
        if (!filesList || filesList.length === 0) return;

        const mdFiles = [];
        let rootPrefix = '';

        // Detect root folder prefix
        const firstPath = filesList[0].webkitRelativePath || filesList[0].name;
        if (firstPath.includes('/')) {
            rootPrefix = firstPath.split('/')[0] + '/';
        }

        for (let i = 0; i < filesList.length; i++) {
            const f = filesList[i];
            const fullRel = (f.webkitRelativePath || f.name).replace(/\\/g, '/');
            if (!fullRel.toLowerCase().endsWith('.md')) continue;
            if (fullRel.includes('node_modules/') || fullRel.includes('.git/')) continue;

            const cleanRel = rootPrefix && fullRel.startsWith(rootPrefix) ? fullRel.slice(rootPrefix.length) : fullRel;
            const content = await f.text();

            mdFiles.push({
                relPath: cleanRel,
                name: f.name,
                size: f.size,
                mtime: f.lastModified,
                content: content
            });
        }

        if (mdFiles.length === 0) {
            alert('Nenhum arquivo Markdown (.md) encontrado na pasta selecionada.');
            return;
        }

        // Build dynamic vault structure
        const vault = this._buildVaultFromFiles(mdFiles);
        this.mode = 'folder';
        this._setData(vault);

        // Save to localStorage (if within storage limit, otherwise just in-memory)
        try {
            localStorage.setItem('ai_second_brain_custom_vault', JSON.stringify(vault));
        } catch (e) {
            console.warn('[Vault] Tamanho excedeu localStorage, mantido na memória:', e);
        }

        if (this.onVaultUpdated) {
            this.onVaultUpdated({ reason: 'folder-connected' });
        }
    }

    _buildVaultFromFiles(rawFiles) {
        const files = [];

        rawFiles.forEach(f => {
            const title = this._extractTitle(f.content, f.name);
            const category = this._getCategory(f.relPath);
            const icon = this._getIcon(f.relPath, title, category);
            const outgoingLinks = this._extractLinks(f.content);

            files.push({
                id: f.relPath.replace(/[^a-zA-Z0-9_-]/g, '_'),
                path: f.relPath,
                name: f.name,
                title: title,
                category: category,
                icon: icon,
                size: f.size,
                mtime: f.mtime,
                outgoingLinks: outgoingLinks,
                content: f.content
            });
        });

        // Navigation Sections
        const sectionDefs = [
            { id: 'overview', label: 'Visão Geral', icon: '🧠', items: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊', path: 'dashboard' },
                { id: 'graph', label: 'Grafo Neural', icon: '🔮', path: 'graph' },
            ]},
            { id: 'rules', label: 'Rules', icon: '📏', items: [] },
            { id: 'skills', label: 'Skills', icon: '⚡', items: [] },
            { id: 'agents', label: 'Agents', icon: '🤖', items: [] },
            { id: 'projects', label: 'Projects', icon: '📁', items: [] },
            { id: 'knowledge', label: 'Knowledge', icon: '📚', items: [] },
            { id: 'decisions', label: 'Decisions', icon: '⚖️', items: [] },
            { id: 'memory', label: 'Memory', icon: '🧮', items: [] },
            { id: 'templates', label: 'Templates', icon: '📋', items: [] },
            { id: 'docs', label: 'Docs & Guias', icon: '📖', items: [] },
            { id: 'core', label: 'Sistema / Core', icon: '⚙️', items: [] },
        ];

        const sectionsMap = new Map();
        sectionDefs.forEach(s => sectionsMap.set(s.id, s));

        files.forEach(f => {
            const sec = sectionsMap.get(f.category) || sectionsMap.get('core');
            sec.items.push({
                id: f.id,
                label: f.title,
                icon: f.icon,
                path: f.path,
                size: f.size
            });
        });

        sectionDefs.forEach(s => {
            if (s.id !== 'overview') {
                s.badge = s.items.length;
                s.items.sort((a, b) => a.path.localeCompare(b.path));
            }
        });

        const activeSections = sectionDefs.filter(s => s.items.length > 0);

        // Graph
        const graphNodes = [
            { id: 'brain', label: 'AI Second Brain', group: 'core', size: 28, icon: '🧠', path: 'dashboard' }
        ];
        const graphEdges = [];

        const categoryHubs = {
            'core': { id: 'hub-core', label: 'System Core', group: 'core', size: 18, icon: '⚙️' },
            'rules': { id: 'hub-rules', label: 'Rules Cortex', group: 'rules', size: 18, icon: '📏' },
            'skills': { id: 'hub-skills', label: 'Skills Engine', group: 'skills', size: 18, icon: '⚡' },
            'agents': { id: 'hub-agents', label: 'Agents Hub', group: 'agents', size: 18, icon: '🤖' },
            'projects': { id: 'hub-projects', label: 'Projects Hub', group: 'projects', size: 18, icon: '📁' },
            'knowledge': { id: 'hub-knowledge', label: 'Knowledge Base', group: 'knowledge', size: 18, icon: '📚' },
            'decisions': { id: 'hub-decisions', label: 'Decisions Ledger', group: 'decisions', size: 16, icon: '⚖️' },
            'memory': { id: 'hub-memory', label: 'Memory Bank', group: 'memory', size: 16, icon: '🧮' },
            'templates': { id: 'hub-templates', label: 'Templates', group: 'templates', size: 16, icon: '📋' },
            'docs': { id: 'hub-docs', label: 'Documentation', group: 'docs', size: 16, icon: '📖' },
        };

        Object.entries(categoryHubs).forEach(([cat, hub]) => {
            if (files.some(f => f.category === cat)) {
                graphNodes.push({ ...hub, path: cat });
                graphEdges.push({ from: 'brain', to: hub.id });
            }
        });

        files.forEach(f => {
            const hub = categoryHubs[f.category];
            graphNodes.push({
                id: f.id,
                label: f.title,
                group: f.category,
                size: f.size > 2000 ? 12 : 9,
                icon: f.icon,
                path: f.path
            });
            if (hub) graphEdges.push({ from: hub.id, to: f.id });
            else graphEdges.push({ from: 'brain', to: f.id });
        });

        files.forEach(f => {
            files.forEach(target => {
                if (f.id === target.id) return;
                const base = target.name.replace(/\.md$/, '').toLowerCase();
                if (f.outgoingLinks.some(l => l.includes(base)) || (f.content.toLowerCase().includes(base) && base.length > 5)) {
                    graphEdges.push({ from: f.id, to: target.id });
                }
            });
        });

        return {
            timestamp: Date.now(),
            files,
            sections: activeSections,
            graphNodes,
            graphEdges,
            groupColors: window.VAULT_SNAPSHOT ? window.VAULT_SNAPSHOT.groupColors : {},
            stats: {
                totalFiles: files.length,
                totalNodes: graphNodes.length,
                totalEdges: graphEdges.length
            }
        };
    }

    _extractTitle(content, fallbackName) {
        const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (fmMatch) {
            const titleMatch = fmMatch[1].match(/(?:name|title):\s*([^\r\n]+)/i);
            if (titleMatch) return titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
        }
        const h1Match = content.match(/^#\s+([^\r\n]+)/m);
        if (h1Match) return h1Match[1].trim();
        return fallbackName.replace(/\.md$/i, '');
    }

    _extractLinks(content) {
        const links = new Set();
        const wikiMatches = content.matchAll(/\[\[(.*?)\]\]/g);
        for (const m of wikiMatches) links.add(m[1].trim().toLowerCase());
        const mdMatches = content.matchAll(/\[(?:.*?)\]\((.*?\.md.*?)\)/g);
        for (const m of mdMatches) links.add(m[1].split('#')[0].trim().toLowerCase());
        return Array.from(links);
    }

    _getCategory(relPath) {
        const p = relPath.toLowerCase().replace(/\\/g, '/');
        const clean = p.startsWith('.agents/') ? p.slice('.agents/'.length) : p;

        if (clean.startsWith('rules/')) return 'rules';
        if (clean.startsWith('skills/')) return 'skills';
        if (clean.startsWith('agents/') || clean.includes('agent')) return 'agents';
        if (p.startsWith('projects/')) return 'projects';
        if (p.startsWith('knowledge/')) return 'knowledge';
        if (p.startsWith('decisions/')) return 'decisions';
        if (p.startsWith('memory/')) return 'memory';
        if (p.startsWith('templates/')) return 'templates';
        if (p.startsWith('docs/')) return 'docs';
        return 'core';
    }

    _getIcon(relPath, title, category) {
        const p = relPath.toLowerCase().replace(/\\/g, '/');
        const clean = p.startsWith('.agents/') ? p.slice('.agents/'.length) : p;

        if (p.includes('gemini.md') || p.includes('readme.md')) return '🧠';
        if (category === 'agents' || clean.startsWith('agents/') || clean.includes('agent')) return '🤖';
        if (p.includes('core')) return '⚙️';
        if (p.includes('ai-decision') || p.includes('decision-gate')) return '🚦';
        if (p.includes('aijev')) return '🎯';
        if (p.includes('security')) return '🔒';
        if (p.includes('dotnet')) return '💜';
        if (p.includes('database')) return '🗄️';
        if (p.includes('sql')) return '🗃️';
        if (p.includes('documentation') || p.includes('docs')) return '📝';
        if (p.includes('onboarding')) return '🚀';
        if (p.includes('feature')) return '✨';
        if (p.includes('bug')) return '🐛';
        if (p.includes('arch')) return '🏗️';
        if (p.includes('memory') || p.includes('state')) return '💾';
        if (p.includes('integration') || p.includes('gateway')) return '🔌';
        if (p.includes('models')) return '🧬';
        if (p.includes('api') || p.includes('backend')) return '⚡';
        if (p.includes('game') || p.includes('jogo')) return '🎮';
        if (p.includes('mobile') || p.includes('app')) return '📱';
        if (p.includes('web') || p.includes('saas') || p.includes('frontend')) return '🌐';
        if (p.includes('decision') || p.includes('adr')) return '⚖️';
        if (p.includes('lesson')) return '💡';
        if (p.includes('template')) return '📋';
        if (p.includes('guia') || p.includes('como-utilizar')) return '📖';
        return '📄';
    }

    // ── Document Access & Rendering ───────────────────
    getFile(pathOrId) {
        if (!pathOrId) return null;
        const normalized = pathOrId.replace(/\\/g, '/');
        return this.filesByPath.get(normalized) ||
               this.filesByPath.get(normalized.toLowerCase()) ||
               this.filesById.get(pathOrId) ||
               this._fuzzyFindFile(normalized);
    }

    _fuzzyFindFile(term) {
        const clean = term.toLowerCase().replace(/\.md$/, '');
        for (const [key, file] of this.filesByPath.entries()) {
            if (key.includes(clean) || file.title.toLowerCase().includes(clean)) {
                return file;
            }
        }
        return null;
    }

    renderMarkdown(markdown, currentPath) {
        if (!markdown) return '';

        // Extract and strip YAML frontmatter
        let body = markdown;
        let frontmatterHtml = '';
        const fmMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (fmMatch) {
            body = markdown.slice(fmMatch[0].length);
            const lines = fmMatch[1].split('\n').filter(l => l.includes(':'));
            if (lines.length > 0) {
                frontmatterHtml = `
                    <div class="doc-frontmatter">
                        ${lines.map(l => {
                            const [k, ...v] = l.split(':');
                            return `<div class="fm-item"><span class="fm-key">${k.trim()}:</span> <span class="fm-val">${v.join(':').trim()}</span></div>`;
                        }).join('')}
                    </div>
                `;
            }
        }

        // Parse with marked.js
        let html = '';
        if (window.marked && typeof window.marked.parse === 'function') {
            try {
                if (typeof window.marked.setOptions === 'function') {
                    window.marked.setOptions({ gfm: true, breaks: false });
                }
            } catch (e) {}
            html = window.marked.parse(body);
        } else {
            // Basic fallback if marked not loaded
            html = `<pre>${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        }

        // Post-process Checklists (- [ ] / - [x])
        html = html.replace(/<li>\s*\[ \]\s*/gi, '<li class="task-list-item"><input type="checkbox" disabled> ');
        html = html.replace(/<li>\s*\[x\]\s*/gi, '<li class="task-list-item"><input type="checkbox" checked disabled> ');

        // Post-process Wikilinks [[target]] -> clickable navigation
        html = html.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
            const target = p1.trim();
            return `<a href="#" class="wikilink" onclick="VAULT.navigateToTarget('${target}'); return false;"><span class="wikilink-icon">🔗</span> ${target}</a>`;
        });

        // Post-process Markdown Links [text](something.md) -> internal navigation
        html = html.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]+)"/gi, (match, href) => {
            if (href.endsWith('.md') || href.startsWith('./') || href.startsWith('../') || (!href.startsWith('http') && !href.startsWith('#'))) {
                return `<a href="#" onclick="VAULT.navigateToTarget('${href}'); return false;"`;
            }
            return match;
        });

        // GitHub Callouts (> [!NOTE], > [!IMPORTANT], etc.)
        html = html.replace(/<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]([\s\S]*?)<\/blockquote>/gi, (match, type, content) => {
            const lower = type.toLowerCase();
            const icons = { note: 'ℹ️', tip: '💡', important: '❗', warning: '⚠️', caution: '🛑' };
            return `
                <div class="callout callout-${lower}">
                    <div class="callout-header">${icons[lower] || '📌'} ${type}</div>
                    <div class="callout-body"><p>${content.trim()}</p></div>
                </div>
            `;
        });

        return frontmatterHtml + html;
    }

    navigateToTarget(target) {
        const file = this.getFile(target);
        if (file) {
            window.navigateTo(file.path);
        } else {
            console.log('Navigating to target:', target);
            window.navigateTo(target);
        }
    }

    // ── Search Engine ─────────────────────────────────
    search(query) {
        if (!query || query.trim().length === 0) return [];
        const q = query.toLowerCase().trim();
        const results = [];

        for (const file of this.data.files || []) {
            let score = 0;
            const titleLower = file.title.toLowerCase();
            const pathLower = file.path.toLowerCase();
            const contentLower = file.content.toLowerCase();

            if (titleLower === q) score += 100;
            else if (titleLower.startsWith(q)) score += 60;
            else if (titleLower.includes(q)) score += 40;

            if (pathLower.includes(q)) score += 20;

            let snippet = '';
            const contentIdx = contentLower.indexOf(q);
            if (contentIdx !== -1) {
                score += 15;
                const start = Math.max(0, contentIdx - 40);
                const end = Math.min(file.content.length, contentIdx + q.length + 60);
                snippet = file.content.slice(start, end).replace(/\n/g, ' ');
            }

            if (score > 0) {
                results.push({
                    file,
                    score,
                    snippet: snippet ? `...${snippet}...` : file.title
                });
            }
        }

        return results.sort((a, b) => b.score - a.score).slice(0, 12);
    }
}

// Global singleton instance
window.VAULT = new VaultManager();
