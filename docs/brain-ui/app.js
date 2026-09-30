// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Main Application Controller
// Fully dynamic: connects to Vault, Live Server & Markdown
// ═══════════════════════════════════════════════════

// ── State ─────────────────────────────────────────
let currentView = 'dashboard'; // dashboard | graph | doc
let currentPath = null;
let graph = null;
let sidebarCollapsed = false;

// ── Initialize ────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Dynamic Vault (Live Server -> Folder -> Snapshot)
    if (window.VAULT) {
        await window.VAULT.init();
        window.VAULT.onVaultUpdated = (info) => {
            console.log('🔄 [App] Recarregando interface após atualização do Vault:', info);
            refreshApp();
        };
    }

    // 2. Build UI from Vault data
    buildSidebar();
    buildStats();
    renderDashboardProjects();
    initGraph();
    setupEventListeners();
    setupSearch();
    showDashboard();
});

// ── Sidebar ───────────────────────────────────────
function renderNavItem(item) {
    if (item.isGroup && Array.isArray(item.children) && item.children.length > 0) {
        const isChildActive = currentPath && item.children.some(c => c.path === currentPath);
        return `
            <div class="nav-tree-group ${isChildActive ? 'has-active' : ''}" id="tree-group-${item.id}">
                <div class="nav-tree-header" onclick="toggleTreeGroup('${item.id}', event)">
                    <svg class="tree-chevron" id="chevron-${item.id}" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.7 13.7l5-5a1 1 0 000-1.4l-5-5a1 1 0 00-1.4 1.4L8.58 8l-4.3 4.3a1 1 0 001.42 1.4z"/>
                    </svg>
                    <span class="nav-item-icon">${item.icon || '📁'}</span>
                    <span class="nav-item-label tree-folder-title" onclick="event.stopPropagation(); navigateTo('${item.path}')" title="Abrir ${item.label}">
                        ${item.label}
                    </span>
                    <span class="nav-item-badge count" title="${item.children.length} arquivos no projeto">${item.children.length}</span>
                </div>
                <div class="nav-tree-children" id="tree-children-${item.id}">
                    ${item.children.map(child => `
                        <div class="nav-item nav-tree-child ${currentPath === child.path ? 'active' : ''}" data-path="${child.path}" onclick="navigateTo('${child.path}')" title="${child.title || child.label}">
                            <span class="nav-item-icon">${child.icon || '📄'}</span>
                            <span class="nav-item-label">${child.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    return `
        <div class="nav-item ${currentPath === item.path ? 'active' : ''}" data-path="${item.path}" onclick="navigateTo('${item.path}')">
            <span class="nav-item-icon">${item.icon || '📄'}</span>
            <span class="nav-item-label">${item.label || item.title || item.name}</span>
            ${item.status ? `<span class="nav-item-badge count" style="width:8px;height:8px;padding:0;border-radius:50;background:var(--${item.status === 'yellow' ? 'warning' : 'danger'})"></span>` : ''}
        </div>
    `;
}

function buildSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    const sections = (window.VAULT && window.VAULT.data && window.VAULT.data.sections) || [];
    let html = '';

    for (const section of sections) {
        const badgeCount = section.badge !== undefined ? section.badge : section.items.length;
        html += `
            <div class="nav-section" data-section="${section.id}">
                <div class="nav-section-header" onclick="toggleSection('${section.id}')">
                    <svg class="chevron" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.7 13.7l5-5a1 1 0 000-1.4l-5-5a1 1 0 00-1.4 1.4L8.58 8l-4.3 4.3a1 1 0 001.42 1.4z"/>
                    </svg>
                    <span>${section.icon} ${section.label}</span>
                    ${badgeCount !== undefined ? `<span class="nav-item-badge count">${badgeCount}</span>` : ''}
                </div>
                <div class="nav-section-items" id="section-${section.id}">
                    ${section.items.map(item => renderNavItem(item)).join('')}
                </div>
            </div>
        `;
    }

    nav.innerHTML = html;
}

function buildStats() {
    const statsEl = document.getElementById('brainStats');
    const s = (window.VAULT && window.VAULT.data && window.VAULT.data.stats) || {
        totalFiles: 40,
        skillsCount: 8,
        projectsCount: 9,
        rulesCount: 7,
        knowledgeCount: 5,
        decisionsCount: 1,
        memoryCount: 2
    };

    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stat">
                <span class="stat-value">${s.totalFiles || 40}</span>
                <span class="stat-label">Arquivos</span>
            </div>
            <div class="stat">
                <span class="stat-value">${s.skillsCount || 8}</span>
                <span class="stat-label">Skills</span>
            </div>
            <div class="stat">
                <span class="stat-value">${s.projectsCount || 9}</span>
                <span class="stat-label">Projetos</span>
            </div>
        `;
    }

    // Dashboard Hero Metrics
    const setMetric = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.textContent = val;
    };

    setMetric('metricRules', s.rulesCount || 5);
    setMetric('metricSkills', s.skillsCount || 8);
    setMetric('metricProjects', s.projectsCount || 0);
    setMetric('metricKnowledge', s.knowledgeCount || 6);
    setMetric('metricDecisions', s.decisionsCount || 1);
    setMetric('metricMemory', s.memoryCount || 2);
}

// ── Dynamic Projects Dashboard Rendering ──────────
function renderDashboardProjects() {
    const slot = document.getElementById('dynamicProjectsSlot');
    if (!slot) return;

    const files = (window.VAULT && window.VAULT.data && window.VAULT.data.files) || [];
    
    // Identifica projetos reais em projects/<pasta>/...
    const projectFiles = files.filter(f => {
        if (!f.path.startsWith('projects/')) return false;
        const parts = f.path.split('/');
        return parts.length > 2 && parts[parts.length - 1].toLowerCase() === 'project.md';
    });

    let projectsMap = new Map();
    if (projectFiles.length > 0) {
        projectFiles.forEach(f => {
            const folderName = f.path.split('/')[1];
            projectsMap.set(folderName, f);
        });
    } else {
        files.filter(f => f.path.startsWith('projects/') && f.path.split('/').length > 2).forEach(f => {
            const folderName = f.path.split('/')[1];
            if (!projectsMap.has(folderName)) {
                projectsMap.set(folderName, f);
            }
        });
    }

    const projectsList = Array.from(projectsMap.values());

    if (projectsList.length === 0) {
        // NENHUM PROJETO CADASTRADO NO MOMENTO:
        slot.innerHTML = `
            <div class="dash-card status-card" onclick="openQuickstartWizard()" style="cursor: pointer; grid-column: span 2; border: 1px dashed rgba(99, 102, 241, 0.45);">
                <div class="status-indicator" style="background: var(--accent-primary); box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);"></div>
                <div class="card-content">
                    <h3>Nenhum Projeto Conectado</h3>
                    <p>O workspace está limpo e agnóstico. Use o Quickstart Studio para criar ou conectar um projeto agora mesmo.</p>
                    <span class="status-badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">
                        ✨ Clique aqui para iniciar o Quickstart de 3 minutos
                    </span>
                </div>
                <div class="card-icon" style="opacity: 0.8;">🚀</div>
            </div>
        `;
        return;
    }

    // GERA OS CARDS DINAMICAMENTE PARA CADA PROJETO REAL EXISTENTE:
    let html = '';
    projectsList.forEach(proj => {
        const title = proj.title || proj.path.split('/')[1];
        
        let statusBadge = 'Ativo';
        let statusClass = 'planning';
        let statusColor = 'green';

        const contentLower = (proj.content || '').toLowerCase();
        if (contentLower.includes('em planejamento') || contentLower.includes('planejamento')) {
            statusBadge = 'Em planejamento';
            statusClass = 'planning';
            statusColor = 'yellow';
        } else if (contentLower.includes('em conceituação') || contentLower.includes('conceituação') || contentLower.includes('ideia')) {
            statusBadge = 'Em conceituação';
            statusClass = 'concept';
            statusColor = 'red';
        } else if (contentLower.includes('produção') || contentLower.includes('em produção')) {
            statusBadge = 'Em produção';
            statusClass = 'success';
            statusColor = 'green';
        }

        let desc = 'Projeto conectado ao AI Second Brain';
        const overviewMatch = (proj.content || '').match(/##\s+Visão Geral\s*\n+([^\n#]+)/i);
        if (overviewMatch && overviewMatch[1]) {
            desc = overviewMatch[1].trim();
        }

        html += `
            <div class="dash-card status-card" onclick="navigateTo('${proj.path}')">
                <div class="status-indicator ${statusColor}"></div>
                <div class="card-content">
                    <h3>${title}</h3>
                    <p>${desc}</p>
                    <span class="status-badge ${statusClass}">${statusBadge}</span>
                </div>
                <div class="card-icon">${proj.icon || '🚀'}</div>
            </div>
        `;
    });

    slot.innerHTML = html;
}

function toggleSection(sectionId) {
    const items = document.getElementById(`section-${sectionId}`);
    if (!items) return;
    const chevron = items.previousElementSibling ? items.previousElementSibling.querySelector('.chevron') : null;

    if (items.classList.contains('collapsed')) {
        items.classList.remove('collapsed');
        items.style.maxHeight = 'none';
        if (chevron) chevron.classList.remove('collapsed');
    } else {
        items.classList.add('collapsed');
        items.style.maxHeight = '0';
        if (chevron) chevron.classList.add('collapsed');
    }
}

function toggleTreeGroup(groupId, event) {
    if (event) event.stopPropagation();
    const children = document.getElementById(`tree-children-${groupId}`);
    const chevron = document.getElementById(`chevron-${groupId}`);
    if (!children) return;

    if (children.classList.contains('collapsed')) {
        children.classList.remove('collapsed');
        if (chevron) chevron.classList.remove('collapsed');
    } else {
        children.classList.add('collapsed');
        if (chevron) chevron.classList.add('collapsed');
    }
}

// ── Navigation ────────────────────────────────────
function navigateTo(path) {
    currentPath = path;

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.path === path);
    });

    // Auto-expand parent tree group if navigating to a nested item
    const activeItem = document.querySelector(`.nav-item[data-path="${path}"]`);
    if (activeItem) {
        const parentGroup = activeItem.closest('.nav-tree-group');
        if (parentGroup) {
            parentGroup.classList.add('has-active');
            const children = parentGroup.querySelector('.nav-tree-children');
            const chevron = parentGroup.querySelector('.tree-chevron');
            if (children && children.classList.contains('collapsed')) {
                children.classList.remove('collapsed');
                if (chevron) chevron.classList.remove('collapsed');
            }
        }
    }

    // Special paths
    if (path === 'dashboard') {
        showDashboard();
        return;
    }

    if (path === 'graph') {
        showView('graph');
        return;
    }

    // 1. Fetch from Dynamic Vault
    if (window.VAULT) {
        const file = window.VAULT.getFile(path);
        if (file) {
            showDynamicDocument(file);
            return;
        }
    }

    // 2. Folder/Category Index page listing child files
    showGenericPage(path);
}

function showDashboard() {
    currentView = 'dashboard';
    document.getElementById('dashboardOverlay').classList.add('active');
    document.getElementById('graphView').classList.remove('active');
    document.getElementById('docView').classList.remove('active');
    document.getElementById('viewToggle').classList.remove('active');
    updateBreadcrumbs([{ label: '🧠 Visão Geral', path: 'dashboard' }]);
}

function showView(view) {
    if (view === 'graph') {
        currentView = 'graph';
        document.getElementById('dashboardOverlay').classList.remove('active');
        document.getElementById('graphView').classList.add('active');
        document.getElementById('docView').classList.remove('active');
        document.getElementById('viewToggle').classList.add('active');
        updateBreadcrumbs([
            { label: '🧠 Visão Geral', path: 'dashboard' },
            { label: '🔮 Grafo Neural', path: 'graph' }
        ]);

        // Resize graph canvas
        if (graph) {
            setTimeout(() => graph._setupCanvas(), 100);
        }
    }
}

function showDynamicDocument(file) {
    currentView = 'doc';
    document.getElementById('dashboardOverlay').classList.remove('active');
    document.getElementById('graphView').classList.remove('active');
    document.getElementById('docView').classList.add('active');
    document.getElementById('viewToggle').classList.remove('active');

    const container = document.getElementById('docContainer');
    const renderedContent = window.VAULT.renderMarkdown(file.content, file.path);
    const sizeKb = (file.size / 1024).toFixed(1);

    container.innerHTML = `
        <div class="doc-meta">
            <span class="doc-meta-item">${file.icon} ${(file.category || 'DOC').toUpperCase()}</span>
            <span class="doc-meta-item">📁 ${file.path}</span>
            <span class="doc-meta-item">⚡ ${sizeKb} KB</span>
            ${file.mtime ? `<span class="doc-meta-item">🕒 ${new Date(file.mtime).toLocaleDateString('pt-BR')}</span>` : ''}
        </div>
        <div class="doc-markdown-body">
            ${renderedContent}
        </div>
    `;

    // Breadcrumbs
    const parts = file.path.split('/');
    const breadcrumbs = [{ label: '🧠 Visão Geral', path: 'dashboard' }];
    let accum = '';
    for (let i = 0; i < parts.length; i++) {
        accum += (i > 0 ? '/' : '') + parts[i];
        breadcrumbs.push({
            label: parts[i],
            path: accum
        });
    }
    updateBreadcrumbs(breadcrumbs);

    // Scroll to top
    document.getElementById('docView').scrollTop = 0;
}


function showGenericPage(path) {
    currentView = 'doc';
    document.getElementById('dashboardOverlay').classList.remove('active');
    document.getElementById('graphView').classList.remove('active');
    document.getElementById('docView').classList.add('active');
    document.getElementById('viewToggle').classList.remove('active');

    const parts = path.split('/');
    const name = parts[parts.length - 1];
    const childFiles = getItemsForPath(path);

    const container = document.getElementById('docContainer');
    container.innerHTML = `
        <div class="doc-meta">
            <span class="doc-meta-item">📁 ${path}</span>
            <span class="doc-meta-item">📊 ${childFiles.length} arquivos nesta pasta</span>
        </div>
        <h1>${name}</h1>
        <p style="color:var(--text-secondary); margin-bottom: 24px;">Arquivos Markdown descobertos dinamicamente nesta seção:</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
            ${childFiles.map(item => `
                <div onclick="navigateTo('${item.path}')" 
                     style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 18px; cursor: pointer; transition: all 0.2s;" 
                     onmouseover="this.style.borderColor='var(--text-accent)'; this.style.transform='translateY(-2px)'" 
                     onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='none'">
                    <div style="font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 6px;">${item.icon || '📄'} ${item.label || item.title || item.name}</div>
                    <div style="font-size: 12px; color: var(--text-tertiary); font-family: var(--font-mono);">${item.path}</div>
                </div>
            `).join('')}
        </div>
    `;

    const breadcrumbs = [{ label: '🧠 Visão Geral', path: 'dashboard' }];
    let accum = '';
    for (let i = 0; i < parts.length; i++) {
        accum += (i > 0 ? '/' : '') + parts[i];
        breadcrumbs.push({ label: parts[i], path: accum });
    }
    updateBreadcrumbs(breadcrumbs);
}

function getItemsForPath(path) {
    if (!path) return [];
    const clean = path.toLowerCase().replace(/\\/g, '/');

    // Check in dynamic vault files
    if (window.VAULT && window.VAULT.data && window.VAULT.data.files) {
        const matches = window.VAULT.data.files.filter(f => {
            const p = f.path.toLowerCase().replace(/\\/g, '/');
            return p.startsWith(clean) || f.category.toLowerCase() === clean;
        });
        if (matches.length > 0) {
            return matches.map(f => ({
                path: f.path,
                label: f.title,
                icon: f.icon,
                size: f.size
            }));
        }
    }

    // Fallback to sections
    const sections = (window.VAULT && window.VAULT.data && window.VAULT.data.sections) || [];
    for (const section of sections) {
        if (section.id === path || section.items.some(i => i.path.startsWith(path))) {
            return section.items;
        }
    }
    return [];
}

function updateBreadcrumbs(items) {
    const el = document.getElementById('breadcrumbs');
    if (!el) return;
    el.innerHTML = items.map((item, i) => {
        const isLast = i === items.length - 1;
        return `
            ${i > 0 ? '<span class="breadcrumb-separator">›</span>' : ''}
            <span class="breadcrumb-item ${isLast ? 'active' : ''}"
                  onclick="navigateTo('${item.path}')">${item.label}</span>
        `;
    }).join('');
}

// ── Graph ─────────────────────────────────────────
function initGraph() {
    const canvas = document.getElementById('graphCanvas');
    const tooltip = document.getElementById('graphTooltip');
    if (!canvas) return;

    graph = new BrainGraph(canvas, tooltip);

    const nodes = (window.VAULT && window.VAULT.data && window.VAULT.data.graphNodes) || [];
    const edges = (window.VAULT && window.VAULT.data && window.VAULT.data.graphEdges) || [];
    const colors = (window.VAULT && window.VAULT.data && window.VAULT.data.groupColors) || {};

    graph.loadData(nodes, edges, colors);

    // Update HUD Node Count
    const nodeCountEl = document.getElementById('hudNodeCount');
    if (nodeCountEl) {
        nodeCountEl.textContent = nodes.length;
    }

    // Camera update callback for HUD
    graph.onCameraChange = (state) => {
        const zoomEl = document.getElementById('hudZoomPill');
        const rotEl = document.getElementById('hudRotationPill');
        const orbitBtn = document.getElementById('btnAutoOrbit');

        if (zoomEl) zoomEl.textContent = `🔍 ${state.zoomPercent}%`;
        if (rotEl) rotEl.textContent = `🌍 3D Planeta`;
        if (orbitBtn) orbitBtn.classList.toggle('active', state.autoOrbit);
    };

    // Single click: highlight
    graph.onNodeClick = (node) => {
        const hudNode = document.getElementById('hudSelectedNode');
        if (!hudNode) return;
        if (node) {
            hudNode.textContent = `🎯 ${node.label} (duplo-clique para abrir)`;
            hudNode.style.color = '#38bdf8';
        } else {
            hudNode.textContent = `⚡ Duplo-clique para abrir`;
            hudNode.style.color = '#c4b5fd';
        }
    };

    // Double click: open document
    graph.onNodeDblClick = (node) => {
        if (!node) return;
        if (node.path) {
            navigateTo(node.path);
        } else if (node.id) {
            navigateTo(node.id);
        }
    };

    graph.start();
}

function refreshApp() {
    buildSidebar();
    buildStats();
    renderDashboardProjects();

    if (graph) {
        const nodes = (window.VAULT && window.VAULT.data && window.VAULT.data.graphNodes) || [];
        const edges = (window.VAULT && window.VAULT.data && window.VAULT.data.graphEdges) || [];
        const colors = (window.VAULT && window.VAULT.data && window.VAULT.data.groupColors) || {};
        graph.loadData(nodes, edges, colors);

        const nodeCountEl = document.getElementById('hudNodeCount');
        if (nodeCountEl) nodeCountEl.textContent = nodes.length;
    }

    if (currentPath && currentView === 'doc') {
        navigateTo(currentPath);
    }
}

// ── Search & Filters ──────────────────────────────
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'searchResultsDropdown';
        dropdown.className = 'search-dropdown';
        searchInput.parentElement.parentElement.appendChild(dropdown);
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        filterSidebar(query.toLowerCase());

        if (!query) {
            dropdown.style.display = 'none';
            return;
        }

        const results = window.VAULT ? window.VAULT.search(query) : [];
        if (results.length === 0) {
            dropdown.innerHTML = `<div style="padding: 12px; color: var(--text-tertiary); font-size: 13px;">Nenhum arquivo encontrado para "${query}"</div>`;
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = results.map(r => `
            <div class="search-result-item" onclick="navigateTo('${r.file.path}'); document.getElementById('searchResultsDropdown').style.display='none'; document.getElementById('searchInput').value='';">
                <div class="search-result-title">${r.file.icon} ${r.file.title}</div>
                <div class="search-result-path">${r.file.path}</div>
                <div class="search-result-snippet">${r.snippet}</div>
            </div>
        `).join('');
        dropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

function filterSidebar(query) {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.nav-section');
    const treeGroups = document.querySelectorAll('.nav-tree-group');

    if (!query) {
        navItems.forEach(el => el.style.display = '');
        sections.forEach(el => el.style.display = '');
        treeGroups.forEach(el => el.style.display = '');
        return;
    }

    sections.forEach(section => {
        let hasVisible = false;

        // 1. Filtra itens simples (não-filhos de árvores)
        section.querySelectorAll('.nav-item:not(.nav-tree-child)').forEach(item => {
            const label = (item.querySelector('.nav-item-label')?.textContent || '').toLowerCase();
            const match = label.includes(query);
            item.style.display = match ? '' : 'none';
            if (match) hasVisible = true;
        });

        // 2. Filtra grupos de árvore (projetos)
        section.querySelectorAll('.nav-tree-group').forEach(group => {
            let groupHasVisible = false;
            const headerLabel = (group.querySelector('.nav-tree-header .nav-item-label')?.textContent || '').toLowerCase();
            const groupMatch = headerLabel.includes(query);

            group.querySelectorAll('.nav-tree-child').forEach(child => {
                const childLabel = (child.querySelector('.nav-item-label')?.textContent || '').toLowerCase();
                const match = groupMatch || childLabel.includes(query);
                child.style.display = match ? '' : 'none';
                if (match) groupHasVisible = true;
            });

            group.style.display = groupHasVisible ? '' : 'none';
            if (groupHasVisible) {
                hasVisible = true;
                const childrenContainer = group.querySelector('.nav-tree-children');
                const chevron = group.querySelector('.tree-chevron');
                if (childrenContainer) childrenContainer.classList.remove('collapsed');
                if (chevron) chevron.classList.remove('collapsed');
            }
        });

        section.style.display = hasVisible ? '' : 'none';

        if (hasVisible) {
            const itemsContainer = section.querySelector('.nav-section-items');
            const chevron = section.querySelector('.chevron');
            if (itemsContainer) {
                itemsContainer.classList.remove('collapsed');
                itemsContainer.style.maxHeight = 'none';
            }
            if (chevron) chevron.classList.remove('collapsed');
        }
    });
}

// ── Event Listeners ───────────────────────────────
function setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebarCollapsed = !sidebarCollapsed;
            sidebar.classList.toggle('collapsed', sidebarCollapsed);

            setTimeout(() => {
                if (graph) graph._setupCanvas();
            }, 450);
        });
    }

    // View toggle
    const viewToggle = document.getElementById('viewToggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', () => {
            if (currentView === 'graph') {
                showDashboard();
            } else {
                showView('graph');
            }
        });
    }

    // Folder connect button
    const btnConnect = document.getElementById('btnConnectFolder');
    const folderInput = document.getElementById('folderPickerInput');
    if (btnConnect && folderInput) {
        btnConnect.addEventListener('click', () => folderInput.click());
        folderInput.addEventListener('change', async function() {
            if (window.VAULT) {
                await window.VAULT.connectFolderFromInput(this);
                refreshApp();
            }
        });
    }

    // ── Graph HUD Buttons ─────────────────────────────
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnRotateLeft = document.getElementById('btnRotateLeft');
    const btnRotateRight = document.getElementById('btnRotateRight');
    const btnAutoOrbit = document.getElementById('btnAutoOrbit');
    const btnShake = document.getElementById('btnShake');
    const btnResetView = document.getElementById('btnResetView');

    if (btnZoomIn) btnZoomIn.addEventListener('click', () => graph && graph.zoomIn());
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => graph && graph.zoomOut());
    if (btnRotateLeft) btnRotateLeft.addEventListener('click', () => graph && graph.rotateBy(-Math.PI / 8));
    if (btnRotateRight) btnRotateRight.addEventListener('click', () => graph && graph.rotateBy(Math.PI / 8));
    if (btnAutoOrbit) btnAutoOrbit.addEventListener('click', () => {
        if (graph) {
            const isActive = graph.toggleAutoOrbit();
            btnAutoOrbit.classList.toggle('active', isActive);
        }
    });
    if (btnShake) btnShake.addEventListener('click', () => graph && graph.reheat(1.0));
    if (btnResetView) btnResetView.addEventListener('click', () => graph && graph.resetView());

    // Icon Toggle
    const toggleIcons = document.getElementById('toggleIcons');
    if (toggleIcons) {
        toggleIcons.addEventListener('change', (e) => {
            if (graph) {
                graph.setShowIcons(e.target.checked);
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const searchInput = document.getElementById('searchInput');

        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) searchInput.focus();
            return;
        }

        if (searchInput && document.activeElement === searchInput) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInput.blur();
                filterSidebar('');
                const dropdown = document.getElementById('searchResultsDropdown');
                if (dropdown) dropdown.style.display = 'none';
            }
            return;
        }

        if (currentView === 'graph' && graph) {
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                graph.zoomIn();
            } else if (e.key === '-' || e.key === '_') {
                e.preventDefault();
                graph.zoomOut();
            } else if (e.key === '0') {
                e.preventDefault();
                graph.resetView();
            } else if (e.key.toLowerCase() === 'r') {
                e.preventDefault();
                graph.rotateBy(e.shiftKey ? -Math.PI / 8 : Math.PI / 8);
            } else if (e.key.toLowerCase() === 'o') {
                e.preventDefault();
                const isActive = graph.toggleAutoOrbit();
                if (btnAutoOrbit) btnAutoOrbit.classList.toggle('active', isActive);
            } else if (e.code === 'Space') {
                e.preventDefault();
                graph.reheat(1.0);
            } else if (e.key.toLowerCase() === 'i') {
                e.preventDefault();
                if (toggleIcons) {
                    toggleIcons.checked = !toggleIcons.checked;
                    graph.setShowIcons(toggleIcons.checked);
                }
            }
        }

        if (e.key === 'Escape') {
            const qsModal = document.getElementById('quickstartModal');
            if (qsModal && qsModal.style.display !== 'none') {
                closeQuickstartWizard();
                return;
            }
            if (currentView !== 'dashboard') {
                showDashboard();
            }
        }
    });

    // Setup Stack Chips for Quickstart Studio
    const chipsContainer = document.getElementById('qsStackChips');
    if (chipsContainer) {
        chipsContainer.querySelectorAll('.qs-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chipsContainer.querySelectorAll('.qs-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const stackVal = chip.dataset.stack || chip.textContent.trim();
                const hiddenInput = document.getElementById('qsNewStack');
                if (hiddenInput) hiddenInput.value = stackVal;
            });
        });
    }
}

// ═══════════════════════════════════════════════════
// QUICKSTART STUDIO CONTROLLER
// ═══════════════════════════════════════════════════
let quickstartMode = 'new';
let quickstartStep = 1;
let pathValidationTimer = null;

function openQuickstartWizard(defaultMode = null) {
    const modal = document.getElementById('quickstartModal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Reset fields
    const nameInput = document.getElementById('qsNewName');
    const descInput = document.getElementById('qsNewDesc');
    const linkNameInput = document.getElementById('qsLinkName');
    const linkPathInput = document.getElementById('qsLinkPath');

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (linkNameInput) linkNameInput.value = '';
    if (linkPathInput) linkPathInput.value = '';

    const feedback = document.getElementById('qsPathFeedback');
    if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'qs-path-feedback';
        feedback.innerHTML = '';
    }

    if (defaultMode) {
        selectQuickstartMode(defaultMode);
    } else {
        goToQuickstartStep(1);
    }
}

function closeQuickstartWizard() {
    const modal = document.getElementById('quickstartModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleModalBackdropClick(e) {
    if (e.target && e.target.id === 'quickstartModal') {
        closeQuickstartWizard();
    }
}

function goToQuickstartStep(step) {
    quickstartStep = step;

    // Stepper indicators
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`qsStepIndicator${i}`);
        const line = document.getElementById(`qsStepLine${i}`);
        if (ind) {
            ind.classList.toggle('active', i === step);
            ind.classList.toggle('completed', i < step);
        }
        if (line) {
            line.classList.toggle('active', i < step);
        }
    }

    // Panes
    document.querySelectorAll('.qs-step-pane').forEach(p => p.classList.remove('active'));
    const targetPane = document.getElementById(`qsPaneStep${step}`);
    if (targetPane) targetPane.classList.add('active');

    const titleEl = document.getElementById('qsTitle');
    if (titleEl) {
        if (step === 1) {
            titleEl.textContent = 'Adicionar Projeto ao AI Second Brain';
        } else if (step === 2) {
            titleEl.textContent = quickstartMode === 'new' 
                ? 'Criar Novo Projeto com IA' 
                : 'Vincular Repositório Existente';
        } else if (step === 3) {
            titleEl.textContent = 'Projeto Conectado com Sucesso!';
        }
    }
}

function selectQuickstartMode(mode) {
    quickstartMode = mode;
    const formNew = document.getElementById('qsFormNew');
    const formLink = document.getElementById('qsFormLink');

    if (mode === 'new') {
        if (formNew) formNew.style.display = 'flex';
        if (formLink) formLink.style.display = 'none';
        goToQuickstartStep(2);
        setTimeout(() => document.getElementById('qsNewName')?.focus(), 100);
    } else {
        if (formNew) formNew.style.display = 'none';
        if (formLink) formLink.style.display = 'flex';
        goToQuickstartStep(2);
        setTimeout(() => document.getElementById('qsLinkPath')?.focus(), 100);
    }
}

async function pasteClipboardPath() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            const pathInput = document.getElementById('qsLinkPath');
            if (pathInput) {
                pathInput.value = text.trim();
                validatePathLive();
            }
        }
    } catch (err) {
        const pathInput = document.getElementById('qsLinkPath');
        if (pathInput) pathInput.focus();
    }
}

function debounceValidatePath() {
    clearTimeout(pathValidationTimer);
    pathValidationTimer = setTimeout(validatePathLive, 350);
}

async function validatePathLive() {
    const input = document.getElementById('qsLinkPath');
    const feedback = document.getElementById('qsPathFeedback');
    const nameInput = document.getElementById('qsLinkName');
    if (!input || !feedback) return;

    const val = input.value.trim().replace(/^["']|["']$/g, '');
    if (!val) {
        feedback.style.display = 'none';
        return;
    }

    feedback.style.display = 'flex';
    feedback.className = 'qs-path-feedback';
    feedback.innerHTML = '<span class="status-dot snapshot" style="margin-right:6px"></span> Verificando caminho no computador...';

    try {
        const res = await fetch('/api/projects/validate-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: val })
        });
        const data = await res.json();

        if (data.valid) {
            feedback.className = 'qs-path-feedback valid';
            let extra = '';
            if (data.hasGit) extra += ' • Git';
            if (data.hasPackageJson) extra += ' • Node.js';
            if (data.hasCsproj) extra += ' • .NET';
            feedback.innerHTML = `✓ Pasta válida (${data.fileCount} itens)${extra}`;

            // Preenche nome sugerido se vazio
            if (nameInput && !nameInput.value.trim() && data.suggestedName) {
                nameInput.value = data.suggestedName;
            }
        } else {
            feedback.className = 'qs-path-feedback invalid';
            feedback.innerHTML = `✕ ${data.message || 'Pasta não encontrada no disco.'}`;
        }
    } catch (err) {
        feedback.className = 'qs-path-feedback invalid';
        feedback.innerHTML = `✕ Não foi possível conectar ao servidor local.`;
    }
}

async function submitQuickstartNew(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitNew');
    const nameInput = document.getElementById('qsNewName');
    const stackInput = document.getElementById('qsNewStack');
    const descInput = document.getElementById('qsNewDesc');

    const name = nameInput ? nameInput.value.trim() : '';
    const stack = stackInput ? stackInput.value.trim() : 'Node.js / TypeScript';
    const desc = descInput ? descInput.value.trim() : '';

    if (!name) {
        alert('Por favor, digite um nome para o projeto.');
        return;
    }

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="status-dot snapshot" style="margin-right:6px"></span> Criando projeto com IA...';

    try {
        const res = await fetch('/api/projects/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, stack, description: desc })
        });
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Erro ao criar projeto.');
            btn.disabled = false;
            btn.innerHTML = originalText;
            return;
        }

        renderQuickstartSuccess({
            name: data.name,
            path: data.path,
            mode: 'new',
            stack: stack
        });
    } catch (err) {
        alert('Erro ao conectar com servidor local: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function submitQuickstartLink(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitLink');
    const nameInput = document.getElementById('qsLinkName');
    const pathInput = document.getElementById('qsLinkPath');

    const name = nameInput ? nameInput.value.trim() : '';
    const pathVal = pathInput ? pathInput.value.trim() : '';

    if (!name || !pathVal) {
        alert('Por favor, informe o nome e a pasta de origem.');
        return;
    }

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="status-dot snapshot" style="margin-right:6px"></span> Vinculando repositório...';

    try {
        const res = await fetch('/api/projects/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, targetPath: pathVal })
        });
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Erro ao vincular repositório.');
            btn.disabled = false;
            btn.innerHTML = originalText;
            return;
        }

        renderQuickstartSuccess({
            name: data.name,
            path: data.path,
            mode: 'link'
        });
    } catch (err) {
        alert('Erro ao conectar com servidor local: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function renderQuickstartSuccess(info) {
    goToQuickstartStep(3);

    const titleEl = document.getElementById('qsSuccessTitle');
    const msgEl = document.getElementById('qsSuccessMsg');
    const artifactsEl = document.getElementById('qsSuccessArtifacts');
    const openDocBtn = document.getElementById('btnOpenProjectDoc');

    if (titleEl) titleEl.textContent = `Projeto '${info.name}' Conectado!`;
    if (msgEl) {
        msgEl.innerHTML = info.mode === 'new'
            ? `A estrutura completa do projeto foi inicializada em <code>projects/${info.name}</code> com governança, stack <strong>${info.stack || 'Livre'}</strong> e memória de sessões.`
            : `O repositório foi vinculado via junção nativa em <code>projects/${info.name}</code> sem mover seus arquivos de lugar. O Segundo Cérebro agora governa este projeto em tempo real.`;
    }

    if (artifactsEl) {
        artifactsEl.innerHTML = `
            <div class="qs-artifact-item">
                <span class="qs-artifact-icon">📄</span>
                <span><code>projects/${info.name}/PROJECT.md</code></span>
                <span class="qs-artifact-tag">Visão Geral & Contratos</span>
            </div>
            <div class="qs-artifact-item">
                <span class="qs-artifact-icon">💾</span>
                <span><code>projects/${info.name}/CURRENT_STATE.md</code></span>
                <span class="qs-artifact-tag">Estado Atual</span>
            </div>
            ${info.mode === 'new' ? `
            <div class="qs-artifact-item">
                <span class="qs-artifact-icon">🏗️</span>
                <span><code>projects/${info.name}/ARCHITECTURE.md</code></span>
                <span class="qs-artifact-tag">Arquitetura</span>
            </div>
            <div class="qs-artifact-item">
                <span class="qs-artifact-icon">⚖️</span>
                <span><code>projects/${info.name}/DECISIONS/</code></span>
                <span class="qs-artifact-tag">Decisões Técnicas</span>
            </div>
            <div class="qs-artifact-item">
                <span class="qs-artifact-icon">🧮</span>
                <span><code>projects/${info.name}/MEMORY/sessions/</code></span>
                <span class="qs-artifact-tag">Memória de Sessões</span>
            </div>
            ` : ''}
        `;
    }

    if (openDocBtn) {
        openDocBtn.onclick = () => {
            closeQuickstartWizard();
            navigateTo(info.path);
        };
    }

    // Atualiza imediatamente a interface e o visualizador
    if (window.VAULT) {
        window.VAULT.refresh().then(() => {
            refreshApp();
        });
    }
}

