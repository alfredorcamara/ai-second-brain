// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Main Application Controller
// ═══════════════════════════════════════════════════

// ── State ─────────────────────────────────────────
let currentView = 'dashboard'; // dashboard | graph | doc
let currentPath = null;
let graph = null;
let sidebarCollapsed = false;

// ── Initialize ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    buildSidebar();
    buildStats();
    initGraph();
    setupEventListeners();
    showDashboard();
});

// ── Sidebar ───────────────────────────────────────
function buildSidebar() {
    const nav = document.getElementById('sidebarNav');
    let html = '';

    for (const section of BRAIN_DATA.sections) {
        html += `
            <div class="nav-section" data-section="${section.id}">
                <div class="nav-section-header" onclick="toggleSection('${section.id}')">
                    <svg class="chevron" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.7 13.7l5-5a1 1 0 000-1.4l-5-5a1 1 0 00-1.4 1.4L8.58 8l-4.3 4.3a1 1 0 001.42 1.4z"/>
                    </svg>
                    <span>${section.icon} ${section.label}</span>
                    ${section.badge ? `<span class="nav-item-badge count">${section.badge}</span>` : ''}
                </div>
                <div class="nav-section-items" id="section-${section.id}">
                    ${section.items.map(item => `
                        <div class="nav-item" data-path="${item.path}" onclick="navigateTo('${item.path}')">
                            <span class="nav-item-icon">${item.icon}</span>
                            <span class="nav-item-label">${item.label}</span>
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
    const stats = document.getElementById('brainStats');
    stats.innerHTML = `
        <div class="stat">
            <span class="stat-value">37</span>
            <span class="stat-label">Arquivos</span>
        </div>
        <div class="stat">
            <span class="stat-value">8</span>
            <span class="stat-label">Skills</span>
        </div>
        <div class="stat">
            <span class="stat-value">3</span>
            <span class="stat-label">Projetos</span>
        </div>
    `;
}

function toggleSection(sectionId) {
    const items = document.getElementById(`section-${sectionId}`);
    const chevron = items.previousElementSibling.querySelector('.chevron');

    if (items.classList.contains('collapsed')) {
        items.classList.remove('collapsed');
        items.style.maxHeight = items.scrollHeight + 'px';
        chevron.classList.remove('collapsed');
    } else {
        items.classList.add('collapsed');
        items.style.maxHeight = '0';
        chevron.classList.add('collapsed');
    }
}

// ── Navigation ────────────────────────────────────
function navigateTo(path) {
    currentPath = path;

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.path === path);
    });

    // Handle special paths
    if (path === 'dashboard') {
        showDashboard();
        return;
    }

    if (path === 'graph') {
        showView('graph');
        return;
    }

    // Check if document exists
    const doc = BRAIN_DATA.documents[path];
    if (doc) {
        showDocument(doc, path);
    } else {
        // Show a generic page
        showGenericPage(path);
    }
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

        // Resize graph
        if (graph) {
            setTimeout(() => graph._setupCanvas(), 100);
        }
    }
}

function showDocument(doc, path) {
    currentView = 'doc';
    document.getElementById('dashboardOverlay').classList.remove('active');
    document.getElementById('graphView').classList.remove('active');
    document.getElementById('docView').classList.add('active');
    document.getElementById('viewToggle').classList.remove('active');

    const container = document.getElementById('docContainer');
    container.innerHTML = `
        <div class="doc-meta">
            <span class="doc-meta-item">${doc.icon} ${doc.type}</span>
            <span class="doc-meta-item">📁 ${path}</span>
        </div>
        ${doc.content}
    `;

    // Build breadcrumbs
    const parts = path.split('/');
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

    const container = document.getElementById('docContainer');
    container.innerHTML = `
        <div class="doc-meta">
            <span class="doc-meta-item">📁 ${path}</span>
        </div>
        <h1>${name}</h1>
        <p>Navegue pela sidebar para ver os documentos disponíveis nesta seção.</p>
        <h2>Arquivos nesta área</h2>
        <ul>
            ${getItemsForPath(path).map(item =>
                `<li><a href="#" onclick="navigateTo('${item.path}');return false;" style="color:var(--text-accent);text-decoration:none">${item.icon} ${item.label}</a></li>`
            ).join('')}
        </ul>
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
    for (const section of BRAIN_DATA.sections) {
        if (section.id === path || section.items.some(i => i.path.startsWith(path))) {
            return section.items;
        }
    }
    return [];
}

function updateBreadcrumbs(items) {
    const el = document.getElementById('breadcrumbs');
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

    graph = new BrainGraph(canvas, tooltip);
    graph.loadData(
        BRAIN_DATA.graphNodes,
        BRAIN_DATA.graphEdges,
        BRAIN_DATA.groupColors
    );

    // Update HUD Node Count
    const nodeCountEl = document.getElementById('hudNodeCount');
    if (nodeCountEl) {
        nodeCountEl.textContent = BRAIN_DATA.graphNodes.length;
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

    // Single click: select and highlight node in 3D graph (does NOT navigate away)
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

    // Double click: open / navigate to node details
    graph.onNodeDblClick = (node) => {
        // Map node to a navigable path
        const mapping = {
            'brain': 'dashboard',
            'rules': 'rules/00-core',
            'r-core': 'rules/00-core',
            'r-ai': 'rules/01-ai-decision',
            'r-aijev': 'rules/02-aijev',
            'r-security': 'rules/03-security',
            'r-dotnet': 'rules/04-dotnet',
            'r-sql': 'rules/05-sql-server',
            'skills': 'skills/project-onboarding',
            's-onboard': 'skills/project-onboarding',
            's-decision': 'skills/ai-decision-gate',
            's-feature': 'skills/new-feature',
            's-bug': 'skills/bug-investigation',
            's-arch': 'skills/architecture-review',
            's-memory': 'skills/session-memory',
            'knowledge': 'knowledge/global',
            'k-aijev': 'knowledge/ai/aijev',
            'k-models': 'knowledge/ai/models',
            'k-gateway': 'knowledge/ai/gateway',
            'k-patterns': 'knowledge/architecture',
            'projects': 'projects/JobSentinel',
            'p-jobsentinel': 'projects/JobSentinel',
            'p-sabor': 'projects/Sabor-em-Conflito',
            'p-assistente': 'projects/Assistente-Mobile',
            'memory': 'memory/current-state',
            'decisions': 'decisions/global',
            'gateway': 'knowledge/ai/gateway',
            'aijev': 'knowledge/ai/aijev',
            'llm': 'knowledge/ai/models',
            'local-ai': 'knowledge/ai/models',
        };

        const path = mapping[node.id];
        if (path) {
            navigateTo(path);
        }
    };

    graph.start();
}

// ── Event Listeners ───────────────────────────────
function setupEventListeners() {
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);

        // Resize graph after animation
        setTimeout(() => {
            if (graph) graph._setupCanvas();
        }, 450);
    });

    // View toggle
    document.getElementById('viewToggle').addEventListener('click', () => {
        if (currentView === 'graph') {
            showDashboard();
        } else {
            showView('graph');
        }
    });

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

    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterSidebar(query);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
            return;
        }

        // If typing inside search input, ignore graph shortcuts
        if (document.activeElement === searchInput) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInput.blur();
                filterSidebar('');
            }
            return;
        }

        // Graph navigation shortcuts when graph view is active
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
            }
        }

        // Escape to go back to dashboard
        if (e.key === 'Escape') {
            if (currentView !== 'dashboard') {
                showDashboard();
            }
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

        // Expand sections with matches
        if (hasVisible) {
            const itemsContainer = section.querySelector('.nav-section-items');
            const chevron = section.querySelector('.chevron');
            itemsContainer.classList.remove('collapsed');
            itemsContainer.style.maxHeight = itemsContainer.scrollHeight + 'px';
            if (chevron) chevron.classList.remove('collapsed');
        }
    });
}
