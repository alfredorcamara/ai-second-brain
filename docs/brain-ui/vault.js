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

        // Pré-carregamento síncrono imediato do Snapshot (0ms de latência)
        if (typeof window !== 'undefined' && window.VAULT_SNAPSHOT) {
            this._loadSnapshot();
        }
    }

    async init() {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '::1';

        // 1. Tenta conectar ao Servidor Ao Vivo (/api/vault)
        const isLive = await this._tryLiveServer();
        if (isLive) {
            // Em ambiente local, se conectou ao vivo, remove cache antigo de pasta para evitar conflito de estado
            if (isLocal) {
                try { localStorage.removeItem('ai_second_brain_custom_vault'); } catch (e) {}
            }
            return;
        }

        // 2. Se falhar, tenta carregar pasta local do cache
        const hasCached = this._tryLoadCachedFolder();
        if (hasCached) {
            // Se estamos no localhost mas caímos no cache (ex: servidor ainda iniciando), inicia auto-reconexão
            if (isLocal) {
                this._startLiveServerAutoReconnect();
            }
            return;
        }

        // 3. Fallback para Snapshot embutido
        this._loadSnapshot();
        if (isLocal) {
            this._startLiveServerAutoReconnect();
        }
    }

    async _tryLiveServer(retryCount = 0) {
        try {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '::1';
            const timeoutMs = isLocal ? 7000 : 1500;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
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
            // Se estiver no localhost e falhar na primeira tentativa (ex: servidor ainda subindo), tenta novamente
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '::1';
            if (isLocal && retryCount < 2) {
                await new Promise(r => setTimeout(r, 800));
                return await this._tryLiveServer(retryCount + 1);
            }
        }
        return false;
    }

    _startLiveServerAutoReconnect() {
        if (this._reconnectTimer) return;
        let attempts = 0;
        this._reconnectTimer = setInterval(async () => {
            attempts++;
            if (attempts > 12 || this.mode === 'live') {
                clearInterval(this._reconnectTimer);
                this._reconnectTimer = null;
                return;
            }
            try {
                const res = await fetch('/api/vault');
                if (res.ok) {
                    clearInterval(this._reconnectTimer);
                    this._reconnectTimer = null;
                    const vaultData = await res.json();
                    this.mode = 'live';
                    try { localStorage.removeItem('ai_second_brain_custom_vault'); } catch (e) {}
                    this._setData(vaultData);
                    this._setupSSE();
                    console.log('🟢 [Vault] Servidor Ao Vivo detectado! Conexão migrada para o disco.');
                    if (this.onVaultUpdated) this.onVaultUpdated({ reason: 'live-server-reconnected' });
                }
            } catch (e) {}
        }, 1500);
    }

    clearFolderCache() {
        try { localStorage.removeItem('ai_second_brain_custom_vault'); } catch (e) {}
        window.location.reload();
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
            this.eventSource.addEventListener('research-progress', (event) => {
                try {
                    const info = JSON.parse(event.data);
                    if (typeof handleResearchLiveProgress === 'function') {
                        handleResearchLiveProgress(info);
                    }
                } catch (e) {}
            });
            this.eventSource.addEventListener('quickstart-progress', (event) => {
                try {
                    const info = JSON.parse(event.data);
                    if (typeof handleQuickstartLiveProgress === 'function') {
                        handleQuickstartLiveProgress(info);
                    }
                } catch (e) {}
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
            badge.innerHTML = `<span class="status-dot folder"></span> Pasta em Cache <button onclick="window.VAULT.clearFolderCache()" title="Limpar cache e conectar ao Servidor Ao Vivo" style="margin-left:6px;padding:1px 6px;border-radius:10px;background:rgba(255,255,255,0.12);border:none;color:inherit;cursor:pointer;font-size:10px;">✕ Limpar Cache</button>`;
            badge.title = 'Lendo arquivos da pasta em cache. Clique em Limpar Cache para voltar ao Servidor Ao Vivo.';
        } else {
            const isOnlineDemo = !window.location.hostname || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && window.location.hostname !== '::1');
            if (isOnlineDemo) {
                badge.className = 'vault-status online-demo';
                badge.innerHTML = `<span class="status-dot"></span> 🌐 Modo Demo (${Math.round(this.filesByPath.size / 3)} docs)`;
                badge.title = 'Visualizador Web Estático (Portfólio / Vercel / GitHub Pages). Para editar no disco e abrir pastas no Windows, execute localmente com "start-brain.bat".';
            } else {
                badge.className = 'vault-status snapshot';
                badge.innerHTML = `<span class="status-dot snapshot"></span> Snapshot (${this.filesByPath.size / 3 | 0} docs)`;
                badge.title = 'Visualizando snapshot local dos arquivos. Inicie "start-brain.bat" para modo ao vivo.';
            }
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
            { id: 'overview', label: 'Visão Geral', icon: '🧠', startCollapsed: true, items: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊', path: 'dashboard' },
                { id: 'graph', label: 'Grafo Neural', icon: '🔮', path: 'graph' },
                { id: 'solution-docs', label: 'Documentação da Solução', icon: '📘', path: 'solution-docs' },
            ]},
            { id: 'rules', label: 'Rules', icon: '📏', startCollapsed: true, items: [] },
            { id: 'skills', label: 'Skills', icon: '⚡', startCollapsed: true, items: [] },
            { id: 'agents', label: 'Agents', icon: '🤖', startCollapsed: true, items: [] },
            { id: 'projects', label: 'Projects', icon: '📁', startCollapsed: true, items: [] },
            { id: 'knowledge', label: 'Knowledge', icon: '📚', startCollapsed: true, items: [] },
            { id: 'decisions', label: 'Decisions', icon: '⚖️', startCollapsed: true, items: [] },
            { id: 'memory', label: 'Memory', icon: '🧮', startCollapsed: true, items: [] },
            { id: 'templates', label: 'Templates', icon: '📋', startCollapsed: true, items: [] },
            { id: 'docs', label: 'Docs & Guias', icon: '📖', startCollapsed: true, items: [] },
            { id: 'core', label: 'Sistema / Core', icon: '⚙️', startCollapsed: true, items: [] },
        ];

        const sectionsMap = new Map();
        sectionDefs.forEach(s => sectionsMap.set(s.id, s));

        const projectFilesMap = new Map();
        let projectsGuideItem = null;

        function formatSlugTitle(slug) {
            if (!slug) return '';
            return slug
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
        }

        files.forEach(f => {
            if (f.category === 'projects') {
                const parts = f.path.split('/');
                if (parts.length <= 2) {
                    projectsGuideItem = {
                        id: f.id,
                        label: 'Guia de Projetos',
                        icon: '📖',
                        path: f.path,
                        size: f.size
                    };
                } else {
                    const projName = parts[1];
                    if (!projectFilesMap.has(projName)) {
                        projectFilesMap.set(projName, []);
                    }
                    projectFilesMap.get(projName).push(f);
                }
            } else {
                const sec = sectionsMap.get(f.category) || sectionsMap.get('core');
                sec.items.push({
                    id: f.id,
                    label: f.title,
                    icon: f.icon,
                    path: f.path,
                    size: f.size
                });
            }
        });

        const projectGroups = new Map();

        for (const [projName, pFiles] of projectFilesMap.entries()) {
            const rootFiles = [];
            const backupFiles = [];
            const researchFilesMap = new Map();
            const otherFoldersMap = new Map();

            let mainProjectPath = `projects/${projName}/PROJECT.md`;

            pFiles.forEach(f => {
                const parts = f.path.split('/');
                if (parts.length === 3) {
                    let label = f.name;
                    let icon = f.icon;
                    if (f.name.toLowerCase() === 'project.md') {
                        label = 'PROJECT.md (Visão Geral)';
                        icon = '📄';
                        mainProjectPath = f.path;
                    } else if (f.name.toLowerCase() === 'current_state.md') {
                        label = 'CURRENT_STATE.md (Estado Atual)';
                        icon = '💾';
                    } else if (f.name.toLowerCase() === 'architecture.md') {
                        label = 'ARCHITECTURE.md (Arquitetura)';
                        icon = '🏗️';
                    }
                    rootFiles.push({
                        id: f.id,
                        label: label,
                        title: f.title,
                        icon: icon,
                        path: f.path,
                        size: f.size
                    });
                } else if (parts[2].toUpperCase() === 'BACKUPS') {
                    backupFiles.push(f);
                } else if (parts[2].toUpperCase() === 'RESEARCH') {
                    const slug = parts[3] || 'geral';
                    if (!researchFilesMap.has(slug)) {
                        researchFilesMap.set(slug, []);
                    }
                    researchFilesMap.get(slug).push(f);
                } else {
                    const folder = parts[2];
                    if (!otherFoldersMap.has(folder)) {
                        otherFoldersMap.set(folder, []);
                    }
                    otherFoldersMap.get(folder).push(f);
                }
            });

            rootFiles.sort((a, b) => {
                const priority = (p) => {
                    const pLower = p.toLowerCase();
                    if (pLower.endsWith('project.md')) return 1;
                    if (pLower.endsWith('current_state.md')) return 2;
                    if (pLower.endsWith('architecture.md')) return 3;
                    return 10;
                };
                return priority(a.path) - priority(b.path) || a.label.localeCompare(b.label);
            });

            const children = [...rootFiles];

            if (backupFiles.length > 0) {
                children.push({
                    id: `sub_${projName}_backups`,
                    label: 'BACKUPS',
                    icon: '📦',
                    isGroup: true,
                    isSubfolder: true,
                    startCollapsed: true,
                    childrenCount: backupFiles.length,
                    children: backupFiles.map(f => ({
                        id: f.id,
                        label: f.name,
                        title: f.title,
                        icon: '📄',
                        path: f.path,
                        size: f.size
                    }))
                });
            }

            if (researchFilesMap.size > 0) {
                const researchFolders = [];
                let totalResearchFiles = 0;

                for (const [slug, rFiles] of researchFilesMap.entries()) {
                    totalResearchFiles += rFiles.length;
                    const overviewFile = rFiles.find(f => f.name.toLowerCase() === 'overview.md');
                    let researchTitle = formatSlugTitle(slug);
                    if (overviewFile && overviewFile.title && !overviewFile.title.includes('Laboratório')) {
                        researchTitle = overviewFile.title.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/u, '').trim();
                        if (!researchTitle) researchTitle = formatSlugTitle(slug);
                    }

                    rFiles.sort((a, b) => {
                        if (a.name.toLowerCase() === 'overview.md') return -1;
                        if (b.name.toLowerCase() === 'overview.md') return 1;
                        const numA = (a.name.match(/^(\d+)/) || [])[1];
                        const numB = (b.name.match(/^(\d+)/) || [])[1];
                        if (numA && numB) return parseInt(numA, 10) - parseInt(numB, 10);
                        if (numA && !numB) return -1;
                        if (!numA && numB) return 1;
                        return a.path.localeCompare(b.path);
                    });

                    const formattedFiles = rFiles.map(f => {
                        let label = f.title || f.name;
                        let icon = f.icon;
                        if (f.name.toLowerCase() === 'overview.md') {
                            label = 'OVERVIEW.md (Visão Geral)';
                            icon = '📄';
                        } else if (f.path.includes('/actionable/')) {
                            icon = '🛠️';
                            const numMatch = f.name.match(/^(\d+)-(.*)\.md$/i);
                            if (numMatch) label = `${numMatch[1]} - ${f.title}`;
                        } else if (f.path.includes('/knowledge/')) {
                            icon = '📘';
                            const numMatch = f.name.match(/^(\d+)-(.*)\.md$/i);
                            if (numMatch) label = `${numMatch[1]} - ${f.title}`;
                        }

                        return {
                            id: f.id,
                            label: label,
                            title: `${f.title} (${f.path})`,
                            icon: icon,
                            path: f.path,
                            size: f.size
                        };
                    });

                    researchFolders.push({
                        id: `sub_${projName}_res_${slug.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
                        label: researchTitle,
                        icon: '🔬',
                        isGroup: true,
                        isSubfolder: true,
                        startCollapsed: true,
                        path: overviewFile ? overviewFile.path : rFiles[0].path,
                        childrenCount: formattedFiles.length,
                        children: formattedFiles
                    });
                }

                children.push({
                    id: `sub_${projName}_research_root`,
                    label: 'RESEARCH',
                    icon: '🔬',
                    isGroup: true,
                    isSubfolder: true,
                    isResearchRoot: true,
                    projectName: projName,
                    startCollapsed: true,
                    childrenCount: totalResearchFiles,
                    children: researchFolders
                });
            }

            for (const [folderName, oFiles] of otherFoldersMap.entries()) {
                let icon = '📁';
                if (folderName.toUpperCase() === 'DECISIONS') icon = '⚖️';
                if (folderName.toUpperCase() === 'MEMORY') icon = '💾';

                children.push({
                    id: `sub_${projName}_${folderName.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
                    label: folderName,
                    icon: icon,
                    isGroup: true,
                    isSubfolder: true,
                    startCollapsed: true,
                    childrenCount: oFiles.length,
                    children: oFiles.map(f => ({
                        id: f.id,
                        label: f.name,
                        title: f.title,
                        icon: f.icon || '📄',
                        path: f.path,
                        size: f.size
                    }))
                });
            }

            projectGroups.set(projName, {
                id: `proj_${projName}`,
                label: projName,
                icon: '🚀',
                isGroup: true,
                isProject: true,
                startCollapsed: true,
                path: mainProjectPath,
                totalFilesCount: pFiles.length,
                childrenCount: pFiles.length,
                children: children
            });
        }

        const projectsSec = sectionsMap.get('projects');
        if (projectsSec) {
            projectsSec.items = [];
            if (projectsGuideItem) {
                projectsSec.items.push(projectsGuideItem);
            }
            const sortedGroups = Array.from(projectGroups.values()).sort((a, b) => a.label.localeCompare(b.label));
            sortedGroups.forEach(g => {
                projectsSec.items.push(g);
            });
            projectsSec.badge = projectGroups.size;
        }

        sectionDefs.forEach(s => {
            if (s.id !== 'overview' && s.id !== 'projects') {
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
                projectsCount: projectGroups.size,
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
