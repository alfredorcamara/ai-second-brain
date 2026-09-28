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
    initGraph();
    setupEventListeners();
    setupSearch();
    showDashboard();
});

// ── Sidebar ───────────────────────────────────────
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
                    ${badgeCount ? `<span class="nav-item-badge count">${badgeCount}</span>` : ''}
                </div>
                <div class="nav-section-items" id="section-${section.id}">
                    ${section.items.map(item => `
                        <div class="nav-item ${currentPath === item.path ? 'active' : ''}" data-path="${item.path}" onclick="navigateTo('${item.path}')">
                            <span class="nav-item-icon">${item.icon || '📄'}</span>
                            <span class="nav-item-label">${item.label || item.title || item.name}</span>
                            ${item.status ? `<span class="nav-item-badge count" style="width:8px;height:8px;padding:0;border-radius:50;background:var(--${item.status === 'yellow' ? 'warning' : 'danger'})"></span>` : ''}
                        </div>
                    `).join('')}
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

    setMetric('metricRules', s.rulesCount || 7);
    setMetric('metricSkills', s.skillsCount || 8);
    setMetric('metricProjects', s.projectsCount || 9);
    setMetric('metricKnowledge', s.knowledgeCount || 5);
    setMetric('metricDecisions', s.decisionsCount || 1);
    setMetric('metricMemory', s.memoryCount || 2);
}

function toggleSection(sectionId) {
    const items = document.getElementById(`section-${sectionId}`);
    if (!items) return;
    const chevron = items.previousElementSibling ? items.previousElementSibling.querySelector('.chevron') : null;

    if (items.classList.contains('collapsed')) {
        items.classList.remove('collapsed');
        items.style.maxHeight = items.scrollHeight + 'px';
        if (chevron) chevron.classList.remove('collapsed');
    } else {
        items.classList.add('collapsed');
        items.style.maxHeight = '0';
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

    if (!query) {
        navItems.forEach(el => el.style.display = '');
        sections.forEach(el => el.style.display = '');
        return;
    }

    sections.forEach(section => {
        let hasVisible = false;
        const items = section.querySelectorAll('.nav-item');
        items.forEach(item => {
            const label = item.querySelector('.nav-item-label').textContent.toLowerCase();
            const match = label.includes(query);
            item.style.display = match ? '' : 'none';
            if (match) hasVisible = true;
        });

        section.style.display = hasVisible ? '' : 'none';

        if (hasVisible) {
            const itemsContainer = section.querySelector('.nav-section-items');
            const chevron = section.querySelector('.chevron');
            if (itemsContainer) {
                itemsContainer.classList.remove('collapsed');
                itemsContainer.style.maxHeight = itemsContainer.scrollHeight + 'px';
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
            if (currentView !== 'dashboard') {
                showDashboard();
            }
        }
    });
}
