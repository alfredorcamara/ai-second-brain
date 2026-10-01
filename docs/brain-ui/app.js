// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Main Application Controller
// Fully dynamic: connects to Vault, Live Server & Markdown
// ═══════════════════════════════════════════════════

// ── State ─────────────────────────────────────────
let currentView = 'dashboard'; // dashboard | graph | doc
let currentPath = null;
let graph = null;
let sidebarCollapsed = false;

// ── Toast Notification System ─────────────────────
function showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('globalToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'globalToastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span style="font-size: 16px;">${icon}</span><span style="flex: 1; line-height: 1.4;">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (container.contains(toast)) container.removeChild(toast);
        }, 250);
    }, duration);
}

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
                    <span class="nav-item-icon">${item.icon || '🚀'}</span>
                    <span class="nav-item-label tree-folder-title" onclick="event.stopPropagation(); openProjectWorkspace('${item.label}', 'overview')" title="Abrir Workspace de ${item.label}">
                        ${item.label}
                    </span>
                    <div class="nav-project-actions">
                        <button class="nav-act-btn" onclick="event.stopPropagation(); openProjectWorkspace('${item.label}', 'graph')" title="Constelação Neural">🔮</button>
                        <button class="nav-act-btn" onclick="event.stopPropagation(); openProjectWorkspace('${item.label}', 'settings')" title="Gerenciar Projeto">⚙️</button>
                    </div>
                    <span class="nav-item-badge count" title="${item.children.length} arquivos">${item.children.length}</span>
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
    const projectSection = sections.find(s => s.id === 'projects');
    const frameworkSections = sections.filter(s => s.id !== 'projects');

    let html = '';

    // ── MUNDO 1: MEUS PROJETOS (Destaque Primário) ────
    const projectsCount = (projectSection && projectSection.badge !== undefined) 
        ? projectSection.badge 
        : (projectSection ? projectSection.items.filter(i => i.isGroup).length : 0);

    html += `
        <div class="sidebar-world-header">
            <span class="world-title">🚀 MEUS PROJETOS <span class="nav-item-badge count" style="margin-left:4px">${projectsCount}</span></span>
            <button class="world-add-btn" onclick="openQuickstartWizard()" title="Conectar ou Criar Novo Projeto">+ Novo</button>
        </div>
    `;

    if (projectSection && projectSection.items && projectSection.items.length > 0) {
        html += `
            <div class="nav-section-items" id="section-projects" style="margin-bottom: 8px;">
                ${projectSection.items.map(item => renderNavItem(item)).join('')}
            </div>
        `;
    } else {
        html += `
            <div style="padding: 10px 16px; font-size: 12px; color: var(--text-tertiary);">
                Nenhum projeto conectado.<br>
                <a href="javascript:void(0)" onclick="openQuickstartWizard()" style="color: var(--accent-tertiary); font-weight: 600;">+ Adicionar com Quickstart</a>
            </div>
        `;
    }

    // ── DIVISOR: CÉREBRO & FRAMEWORK ──────────────────
    html += `
        <div class="sidebar-divider">
            <span class="divider-label">CÉREBRO & GOVERNANÇA</span>
            <span class="divider-line"></span>
        </div>
    `;

    // ── MUNDO 2: CÉREBRO / FRAMEWORK (Secundário) ─────
    for (const section of frameworkSections) {
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
        // Nenhum projeto conectado:
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

    // Gera cards acionáveis para cada projeto
    let html = '';
    projectsList.forEach(proj => {
        const folderName = proj.path.split('/')[1];
        const title = proj.title || folderName;
        
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

        let desc = 'Projeto governado pelo AI Second Brain';
        const overviewMatch = (proj.content || '').match(/##\s+Visão Geral\s*\n+([^\n#]+)/i);
        if (overviewMatch && overviewMatch[1]) {
            desc = overviewMatch[1].trim();
        }

        let stack = 'Livre';
        const stackMatch = (proj.content || '').match(/-\s+\*\*Stack[^*]*\*\*:\s*([^\r\n]+)/i);
        if (stackMatch && stackMatch[1]) stack = stackMatch[1].trim();

        html += `
            <div class="dash-card status-card" onclick="openProjectWorkspace('${folderName}')" style="cursor: pointer;">
                <div class="status-indicator ${statusColor}"></div>
                <div class="card-content">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <h3 style="margin:0;">${title}</h3>
                        <span class="status-badge" style="font-size:10px; padding:1px 6px;">${stack}</span>
                    </div>
                    <p style="margin-bottom:8px;">${desc}</p>
                    <span class="status-badge ${statusClass}">${statusBadge}</span>
                    
                    <div class="dash-card-actions">
                        <button class="btn-dash-act primary" onclick="event.stopPropagation(); openProjectWorkspace('${folderName}', 'overview')">
                            🚀 Abrir Workspace
                        </button>
                        <button class="btn-dash-act" onclick="event.stopPropagation(); openProjectWorkspace('${folderName}', 'graph')">
                            🔮 Constelação
                        </button>
                        <button class="btn-dash-act" onclick="event.stopPropagation(); openProjectWorkspace('${folderName}', 'settings')">
                            ⚙️ Gerenciar
                        </button>
                    </div>
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
    document.getElementById('dashboardOverlay')?.classList.add('active');
    document.getElementById('graphView')?.classList.remove('active');
    document.getElementById('docView')?.classList.remove('active');
    document.getElementById('projectWorkspaceView')?.classList.remove('active');
    document.getElementById('viewToggle')?.classList.remove('active');
    updateBreadcrumbs([{ label: '🧠 Visão Geral', path: 'dashboard' }]);
}

function showView(view) {
    if (view === 'graph') {
        currentView = 'graph';
        document.getElementById('dashboardOverlay')?.classList.remove('active');
        document.getElementById('graphView')?.classList.add('active');
        document.getElementById('docView')?.classList.remove('active');
        document.getElementById('projectWorkspaceView')?.classList.remove('active');
        document.getElementById('viewToggle')?.classList.add('active');
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
    document.getElementById('dashboardOverlay')?.classList.remove('active');
    document.getElementById('graphView')?.classList.remove('active');
    document.getElementById('docView')?.classList.add('active');
    document.getElementById('projectWorkspaceView')?.classList.remove('active');
    document.getElementById('viewToggle')?.classList.remove('active');

    const container = document.getElementById('docContainer');
    const renderedContent = window.VAULT.renderMarkdown(file.content, file.path);
    const sizeKb = (file.size / 1024).toFixed(1);

    container.innerHTML = `
        <div class="doc-meta">
            <span class="doc-meta-item">${file.icon} ${(file.category || 'DOC').toUpperCase()}</span>
            <span class="doc-meta-item">📁 ${file.path}</span>
            <span class="doc-meta-item">⚡ ${sizeKb} KB</span>
            ${file.mtime ? `<span class="doc-meta-item">🕒 ${new Date(file.mtime).toLocaleDateString('pt-BR')}</span>` : ''}
            <button class="btn-edit-glow" style="margin-left: auto; padding: 4px 12px; font-size: 11px;" onclick="openFileEditor('${file.path}', null, () => navigateTo('${file.path}'))">
                ✏️ Editar este Arquivo
            </button>
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

// ═══════════════════════════════════════════════════
// PROJECT DEDICATED WORKSPACE (PROJECT HUB) CONTROLLER
// ═══════════════════════════════════════════════════
let currentProject = null;
let currentProjectData = null;
let currentProjectTab = 'overview';
let projectGraph = null;

async function openProjectWorkspace(projectName, defaultTab = 'overview') {
    currentProject = projectName;
    currentView = 'project-workspace';

    // Ajusta visibilidade das telas
    document.getElementById('dashboardOverlay')?.classList.remove('active');
    document.getElementById('graphView')?.classList.remove('active');
    document.getElementById('docView')?.classList.remove('active');
    document.getElementById('viewToggle')?.classList.remove('active');

    const pwView = document.getElementById('projectWorkspaceView');
    if (pwView) {
        pwView.classList.add('active');
        pwView.scrollTop = 0;
    }

    // Preenche placeholders iniciais
    const titleEl = document.getElementById('pwTitle');
    const pathEl = document.getElementById('pwRealPath');
    const badgeType = document.getElementById('pwTypeBadge');
    const badgeStack = document.getElementById('pwStackBadge');
    const badgeStatus = document.getElementById('pwStatusBadge');

    if (titleEl) titleEl.textContent = projectName;
    if (pathEl) pathEl.textContent = 'Carregando detalhes do projeto...';
    if (badgeType) badgeType.textContent = 'Carregando...';

    updateBreadcrumbs([
        { label: '🧠 Visão Geral', path: 'dashboard' },
        { label: `🚀 ${projectName}`, path: `workspace:${projectName}` }
    ]);

    // Busca detalhes completos no backend
    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectName)}/details`);
        if (!res.ok) throw new Error('Não foi possível obter dados do projeto.');
        currentProjectData = await res.json();

        if (titleEl) titleEl.textContent = currentProjectData.name;
        if (pathEl) pathEl.textContent = currentProjectData.realPath || 'Caminho local';
        if (badgeType) {
            badgeType.textContent = currentProjectData.isJunction ? 'Brownfield 🔗 (Vínculo Externo)' : 'Greenfield 🚀 (Nativo)';
        }
        if (badgeStack) badgeStack.textContent = currentProjectData.stack || 'Livre';
        if (badgeStatus) badgeStatus.textContent = currentProjectData.status || 'Ativo';

        const openDocBtn = document.getElementById('btnPwOpenDoc');
        if (openDocBtn) {
            openDocBtn.onclick = () => navigateTo(`projects/${projectName}/PROJECT.md`);
        }

        switchProjectTab(defaultTab);
    } catch (err) {
        console.error('Erro ao carregar projeto:', err);
        if (pathEl) pathEl.textContent = 'Erro ao conectar ao projeto.';
        const overviewEl = document.getElementById('pwOverviewContent');
        if (overviewEl) {
            overviewEl.innerHTML = `
                <div class="pw-card" style="border-color: var(--danger);">
                    <h3 style="color:var(--danger)">Erro ao carregar detalhes do projeto</h3>
                    <p>${err.message}</p>
                    <button class="btn btn-secondary" onclick="showDashboard()">Voltar ao Dashboard</button>
                </div>
            `;
        }
    }
}

function switchProjectTab(tabId) {
    currentProjectTab = tabId;

    // Atualiza botões das abas
    document.querySelectorAll('#pwTabs .pw-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Atualiza painéis
    document.querySelectorAll('.pw-tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    const targetPaneMap = {
        'overview': 'pwPaneOverview',
        'memory': 'pwPaneMemory',
        'graph': 'pwPaneGraph',
        'backup': 'pwPaneBackup',
        'settings': 'pwPaneSettings'
    };

    const targetId = targetPaneMap[tabId];
    if (targetId) {
        document.getElementById(targetId)?.classList.add('active');
    }

    const tabLabels = {
        'overview': 'Visão Geral',
        'memory': 'Memória & Saúde',
        'graph': 'Constelação Neural',
        'backup': 'Backup & Exportação',
        'settings': 'Gerenciar & Desvincular'
    };

    updateBreadcrumbs([
        { label: '🧠 Visão Geral', path: 'dashboard' },
        { label: `🚀 ${currentProject}`, path: `workspace:${currentProject}` },
        { label: tabLabels[tabId] || 'Aba', path: `workspace:${currentProject}:${tabId}` }
    ]);

    if (!currentProjectData) return;

    if (tabId === 'overview') renderProjectOverviewTab();
    if (tabId === 'memory') renderProjectMemoryTab();
    if (tabId === 'graph') renderProjectGraphTab();
    if (tabId === 'backup') renderProjectBackupTab();
    if (tabId === 'settings') renderProjectSettingsTab();
}

let isOverviewEditing = false;

function toggleOverviewQuickEdit(enable) {
    isOverviewEditing = enable;
    renderProjectOverviewTab();
}

async function saveOverviewQuickEdit() {
    if (!currentProjectData) return;
    const vision = (document.getElementById('pwEditVision')?.value || '').trim();
    const stack = (document.getElementById('pwEditStack')?.value || '').trim();
    const status = (document.getElementById('pwEditStatus')?.value || '').trim();

    let projectMd = currentProjectData.projectMd || `# ${currentProjectData.name}\n\n`;

    // Atualiza ou insere Visão Geral
    if (/##\s+Visão Geral/i.test(projectMd)) {
        projectMd = projectMd.replace(/##\s+Visão Geral\s*\n+([^#]+)/i, `## Visão Geral\n${vision}\n\n`);
    } else {
        projectMd = projectMd.replace(/(#[^\n\r]+)/, `$1\n\n## Visão Geral\n${vision}\n`);
    }

    // Atualiza Stack
    if (/-\s+\*\*Stack[^*]*\*\*:[^\n\r]*/i.test(projectMd)) {
        projectMd = projectMd.replace(/-\s+\*\*Stack[^*]*\*\*:[^\n\r]*/i, `- **Stack**: ${stack}`);
    } else if (/##\s+Informações Gerais/i.test(projectMd)) {
        projectMd = projectMd.replace(/(##\s+Informações Gerais[^\n\r]*)/i, `$1\n- **Stack**: ${stack}`);
    }

    // Atualiza Status
    if (/-\s+\*\*Status\*\*:[^\n\r]*/i.test(projectMd)) {
        projectMd = projectMd.replace(/-\s+\*\*Status\*\*:[^\n\r]*/i, `- **Status**: ${status}`);
    } else if (/##\s+Informações Gerais/i.test(projectMd)) {
        projectMd = projectMd.replace(/(##\s+Informações Gerais[^\n\r]*)/i, `$1\n- **Status**: ${status}`);
    }

    try {
        const res = await fetch('/api/file/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: `projects/${currentProjectData.name}/PROJECT.md`,
                content: projectMd
            })
        });
        if (!res.ok) throw new Error('Falha ao salvar no disco.');

        currentProjectData.projectMd = projectMd;
        if (stack) currentProjectData.stack = stack;
        if (status) currentProjectData.status = status;

        const badgeStack = document.getElementById('pwStackBadge');
        if (badgeStack && stack) badgeStack.textContent = stack;
        const badgeStatus = document.getElementById('pwStatusBadge');
        if (badgeStatus && status) badgeStatus.textContent = status;

        isOverviewEditing = false;
        renderProjectOverviewTab();
        showSecondBrainToast('✨ Visão Geral do Projeto atualizada com sucesso no disco!');
    } catch (err) {
        alert('Erro ao salvar: ' + err.message);
    }
}

// Helpers para Estado Atual & Roadmap
function parseCurrentStateSections(md) {
    const raw = md || '';
    
    // Status
    let status = '🟢 Ativo / Em Desenvolvimento';
    const statusMatch = raw.match(/##\s+Status:\s*([^\n\r]+)/i);
    if (statusMatch && statusMatch[1]) status = statusMatch[1].trim();

    // Defined items
    let definedItems = [];
    const definedMatch = raw.match(/##\s+O que já foi definido\s*\n+([\s\S]*?)(?=##|$)/i);
    if (definedMatch && definedMatch[1]) {
        definedItems = definedMatch[1]
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('-') || line.startsWith('*'))
            .map(line => line.replace(/^[-*]\s*(\[[ xX]\]\s*)?/, '').trim())
            .filter(Boolean);
    }

    // Next steps
    let nextSteps = [];
    const nextStepsMatch = raw.match(/##\s+Próximos Passos\s*\n+([\s\S]*?)(?=##|$)/i);
    if (nextStepsMatch && nextStepsMatch[1]) {
        nextSteps = nextStepsMatch[1]
            .split('\n')
            .map(line => line.trim())
            .filter(line => /^\d+\.|\*|-/.test(line))
            .map(line => line.replace(/^(\d+\.|[-*])\s*/, '').trim())
            .filter(Boolean);
    }

    return { status, definedItems, nextSteps };
}

function buildCurrentStateMarkdown(projectName, status, definedItems, nextSteps) {
    const today = new Date().toISOString().split('T')[0];
    let md = `# ${projectName} — Estado Atual\n\n`;
    md += `> Última atualização: ${today}\n\n`;
    md += `## Status: ${status}\n\n`;

    md += `## O que já foi definido\n`;
    if (definedItems.length === 0) {
        md += `- [x] Inicialização no AI Second Brain com governança ativa.\n`;
    } else {
        definedItems.forEach(item => {
            md += `- [x] ${item}\n`;
        });
    }
    md += `\n`;

    md += `## Próximos Passos\n`;
    if (nextSteps.length === 0) {
        md += `1. Definir os próximos passos do projeto.\n`;
    } else {
        nextSteps.forEach((step, idx) => {
            md += `${idx + 1}. ${step}\n`;
        });
    }
    md += `\n`;

    return md;
}

async function saveCurrentStateChanges(newMd, successMsg = '💾 Estado Atual atualizado no disco!') {
    if (!currentProjectData) return;
    try {
        const res = await fetch('/api/file/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: `projects/${currentProjectData.name}/CURRENT_STATE.md`,
                content: newMd
            })
        });
        if (!res.ok) throw new Error('Falha ao salvar no disco.');

        currentProjectData.currentStateMd = newMd;
        renderProjectOverviewTab();
        showSecondBrainToast(successMsg);
    } catch (err) {
        alert('Erro ao atualizar: ' + err.message);
    }
}

async function updateCurrentStateStatus(newStatus) {
    if (!currentProjectData) return;
    const { definedItems, nextSteps } = parseCurrentStateSections(currentProjectData.currentStateMd);
    const newMd = buildCurrentStateMarkdown(currentProjectData.name, newStatus, definedItems, nextSteps);
    currentProjectData.status = newStatus;
    const badgeStatus = document.getElementById('pwStatusBadge');
    if (badgeStatus) badgeStatus.textContent = newStatus;
    await saveCurrentStateChanges(newMd, `🟢 Status alterado para: ${newStatus}`);
}

async function addNewNextStep() {
    const input = document.getElementById('pwNewStepInput');
    const val = (input?.value || '').trim();
    if (!val || !currentProjectData) return;

    const { status, definedItems, nextSteps } = parseCurrentStateSections(currentProjectData.currentStateMd);
    nextSteps.push(val);
    const newMd = buildCurrentStateMarkdown(currentProjectData.name, status, definedItems, nextSteps);
    await saveCurrentStateChanges(newMd, '🎯 Novo próximo passo adicionado ao Roadmap!');
}

async function completeNextStep(index) {
    if (!currentProjectData) return;
    const { status, definedItems, nextSteps } = parseCurrentStateSections(currentProjectData.currentStateMd);
    if (index >= 0 && index < nextSteps.length) {
        const item = nextSteps.splice(index, 1)[0];
        definedItems.push(item);
        const newMd = buildCurrentStateMarkdown(currentProjectData.name, status, definedItems, nextSteps);
        await saveCurrentStateChanges(newMd, '🎉 Passo concluído e movido para "O que já foi definido"!');
    }
}

async function deleteNextStep(index) {
    if (!currentProjectData) return;
    const { status, definedItems, nextSteps } = parseCurrentStateSections(currentProjectData.currentStateMd);
    if (index >= 0 && index < nextSteps.length) {
        nextSteps.splice(index, 1);
        const newMd = buildCurrentStateMarkdown(currentProjectData.name, status, definedItems, nextSteps);
        await saveCurrentStateChanges(newMd, '🗑️ Próximo passo removido.');
    }
}

async function demoteDefinedItem(index) {
    if (!currentProjectData) return;
    const { status, definedItems, nextSteps } = parseCurrentStateSections(currentProjectData.currentStateMd);
    if (index >= 0 && index < definedItems.length) {
        const item = definedItems.splice(index, 1)[0];
        nextSteps.push(item);
        const newMd = buildCurrentStateMarkdown(currentProjectData.name, status, definedItems, nextSteps);
        await saveCurrentStateChanges(newMd, '↩️ Item retornado para Próximos Passos.');
    }
}

async function deleteDefinedItem(index) {
    if (!currentProjectData) return;
    const { status, definedItems, nextSteps } = parseCurrentStateSections(currentProjectData.currentStateMd);
    if (index >= 0 && index < definedItems.length) {
        definedItems.splice(index, 1);
        const newMd = buildCurrentStateMarkdown(currentProjectData.name, status, definedItems, nextSteps);
        await saveCurrentStateChanges(newMd, '🗑️ Item definido removido.');
    }
}

async function addNewDefinedItem() {
    const input = document.getElementById('pwNewDefinedInput');
    const val = (input?.value || '').trim();
    if (!val || !currentProjectData) return;

    const { status, definedItems, nextSteps } = parseCurrentStateSections(currentProjectData.currentStateMd);
    definedItems.push(val);
    const newMd = buildCurrentStateMarkdown(currentProjectData.name, status, definedItems, nextSteps);
    await saveCurrentStateChanges(newMd, '✓ Marco adicionado aos itens definidos!');
}

function showSecondBrainToast(message) {
    let toast = document.getElementById('sbGlobalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'sbGlobalToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: rgba(17, 17, 27, 0.95);
            border: 1px solid rgba(99, 102, 241, 0.4);
            border-radius: 10px;
            padding: 12px 18px;
            color: #ffffff;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.25);
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0;
            transform: translateY(12px);
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }

    toast.innerHTML = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
    }, 2800);
}

function renderProjectOverviewTab() {
    const el = document.getElementById('pwOverviewContent');
    if (!el || !currentProjectData) return;

    const d = currentProjectData;

    // Extrai a descrição da Visão Geral (removendo markdown cru repetitivo)
    let visionText = 'Projeto conectado e governado pelo AI Second Brain.';
    const overviewMatch = (d.projectMd || '').match(/##\s+Visão Geral\s*\n+([^#]+)/i);
    if (overviewMatch && overviewMatch[1]) {
        visionText = overviewMatch[1].trim();
    }

    // Extrai dados do CURRENT_STATE.md
    const { status: currentStatusText, definedItems, nextSteps } = parseCurrentStateSections(d.currentStateMd);

    const statusOptions = [
        { label: '🟢 Planejamento', val: '🟢 Em Planejamento / Ativo' },
        { label: '🚀 Desenvolvimento', val: '🚀 Em Desenvolvimento Ativo' },
        { label: '🟡 Testes', val: '🟡 Em Testes / Homologação' },
        { label: '✅ Concluído', val: '✅ Em Produção / Concluído' },
        { label: '⏸️ Pausado', val: '⏸️ Pausado' }
    ];

    el.innerHTML = `
        <div class="pw-metrics-row">
            <div class="pw-metric-card">
                <div class="pw-metric-icon">📊</div>
                <div>
                    <div class="pw-metric-val">${d.totalProjectFiles}</div>
                    <div class="pw-metric-lbl">Arquivos no Projeto</div>
                </div>
            </div>
            <div class="pw-metric-card">
                <div class="pw-metric-icon">💾</div>
                <div>
                    <div class="pw-metric-val">${d.memorySizeKb} KB</div>
                    <div class="pw-metric-lbl">Tamanho da Governança</div>
                </div>
            </div>
            <div class="pw-metric-card">
                <div class="pw-metric-icon">⚖️</div>
                <div>
                    <div class="pw-metric-val">${d.decisionsCount}</div>
                    <div class="pw-metric-lbl">Decisões Registradas</div>
                </div>
            </div>
            <div class="pw-metric-card">
                <div class="pw-metric-icon">🧮</div>
                <div>
                    <div class="pw-metric-val">${d.sessionsCount}</div>
                    <div class="pw-metric-lbl">Sessões de Memória</div>
                </div>
            </div>
        </div>

        <div class="pw-overview-grid">
            <!-- Card 1: Visão Geral & Contratos -->
            <div class="pw-card">
                <div class="pw-card-header">
                    <span class="pw-card-title">📄 Visão Geral & Contratos</span>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-edit-glow" onclick="toggleOverviewQuickEdit(!isOverviewEditing)">
                            ${isOverviewEditing ? '✕ Cancelar' : '⚡ Edição Rápida'}
                        </button>
                        <button class="btn-edit-glow" style="background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15);" onclick="editProjectMd()">
                            📝 Editor Markdown
                        </button>
                    </div>
                </div>

                ${isOverviewEditing ? `
                    <!-- Modo de Edição Rápida da Visão Geral -->
                    <div class="pw-edit-form-wrap">
                        <div class="pw-form-group">
                            <label class="pw-form-label">Objetivo / Missão do Projeto</label>
                            <textarea id="pwEditVision" class="pw-form-textarea" rows="4" placeholder="Descreva os objetivos principais deste projeto...">${visionText}</textarea>
                        </div>

                        <div class="pw-form-row">
                            <div class="pw-form-group">
                                <label class="pw-form-label">Stack Tecnológica</label>
                                <input id="pwEditStack" class="pw-form-input" placeholder="Ex: Node.js, React, Python..." value="${d.stack || ''}">
                            </div>
                            <div class="pw-form-group">
                                <label class="pw-form-label">Status Operacional</label>
                                <select id="pwEditStatus" class="pw-form-select">
                                    ${statusOptions.map(opt => `
                                        <option value="${opt.val}" ${currentStatusText.includes(opt.label.split(' ')[1]) ? 'selected' : ''}>${opt.val}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="pw-form-actions">
                            <button class="btn btn-primary" onclick="saveOverviewQuickEdit()">
                                💾 Salvar no PROJECT.md
                            </button>
                            <button class="btn btn-secondary" onclick="toggleOverviewQuickEdit(false)">
                                Cancelar
                            </button>
                        </div>
                    </div>
                ` : `
                    <!-- Box da Visão Geral / Missão do Sistema -->
                    <div class="pw-vision-box">
                        <div class="pw-vision-title">Objetivo do Projeto</div>
                        <div class="pw-vision-text">${visionText}</div>
                    </div>

                    <!-- Grid de Especificações Rápidas -->
                    <div class="pw-specs-grid">
                        <div class="pw-spec-item">
                            <span class="pw-spec-label">Stack Tecnológica</span>
                            <span class="pw-spec-value" style="color:#34d399;">${d.stack}</span>
                        </div>
                        <div class="pw-spec-item">
                            <span class="pw-spec-label">Tipo de Integração</span>
                            <span class="pw-spec-value" style="color:#818cf8;">${d.isJunction ? 'Brownfield (Externo)' : 'Greenfield (Nativo)'}</span>
                        </div>
                        <div class="pw-spec-item">
                            <span class="pw-spec-label">Status Operacional</span>
                            <span class="pw-spec-value" style="color:#38bdf8;">${currentStatusText}</span>
                        </div>
                        <div class="pw-spec-item">
                            <span class="pw-spec-label">Repositório Físico</span>
                            <span class="pw-spec-value" style="font-family:var(--font-mono); font-size:11px; color:#cbd5e1;" title="${d.realPath}">
                                ${d.realPath.length > 25 ? '...' + d.realPath.slice(-22) : d.realPath}
                            </span>
                        </div>
                    </div>

                    <!-- Contratos e Documentos de Governança Dinâmicos -->
                    <div style="margin-top: 14px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em;">
                                Contratos de Governança (${(d.governanceFiles || []).length})
                            </span>
                            <span style="font-size: 10px; color: var(--text-tertiary);">Verificados no disco</span>
                        </div>
                        <div class="pw-gov-artifacts">
                            ${(d.governanceFiles || []).length === 0 ? `
                                <div style="font-size: 12px; color: var(--text-tertiary); font-style: italic; padding: 6px 0;">
                                    Nenhum contrato de governança detectado na pasta deste projeto.
                                </div>
                            ` : (d.governanceFiles || []).map(file => `
                                <div class="pw-gov-chip">
                                    <div class="pw-gov-chip-left">
                                        <span class="pw-gov-chip-title">${file.icon} ${file.name}</span>
                                        <span class="pw-gov-chip-sub">(${file.title})</span>
                                        <span class="pw-gov-chip-badge">${file.sizeKb} KB</span>
                                    </div>
                                    <div class="pw-gov-chip-actions">
                                        <button type="button" class="btn-gov" onclick="navigateTo('${file.path}')">👁️ Ver</button>
                                        <button type="button" class="btn-gov primary" onclick="openFileEditor('${file.path}', null, () => openProjectWorkspace('${d.name}', 'overview'))">✏️ Editar</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        ${(d.missingContracts || []).length > 0 ? `
                            <div style="margin-top: 12px; display:flex; flex-direction:column; gap:6px;">
                                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em;">
                                    Contratos Recomendados Disponíveis
                                </span>
                                ${d.missingContracts.map(mc => `
                                    <div class="pw-gov-chip-missing">
                                        <div class="pw-gov-chip-left">
                                            <span class="pw-gov-chip-title" style="color:var(--text-secondary);">${mc.icon} ${mc.name}</span>
                                            <span class="pw-gov-chip-sub">(${mc.title})</span>
                                            <span class="pw-gov-chip-badge" style="color:#94a3b8;">Não criado</span>
                                        </div>
                                        <div class="pw-gov-chip-actions">
                                            <button type="button" class="btn-gov create" onclick="initializeContract('${mc.name}')">
                                                + Inicializar ${mc.name}
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `}
            </div>

            <!-- Card 2: Estado Atual & Roadmap Ativo -->
            <div class="pw-card">
                <div class="pw-card-header">
                    <span class="pw-card-title">💾 Estado Atual & Roadmap Ativo</span>
                    <button class="btn-edit-glow" onclick="editCurrentStateMd()">
                        📝 Editor Markdown Completo
                    </button>
                </div>

                <!-- Status Atual com seletor interativo -->
                <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div class="status-indicator green" style="width:10px; height:10px;"></div>
                        <div style="font-size:10px; text-transform:uppercase; color:var(--text-tertiary); font-weight:700;">Status do Ciclo: <span style="color:#e0f2fe; font-size:12px;">${currentStatusText}</span></div>
                    </div>
                    <!-- Seletor Rápido de Status -->
                    <div class="pw-status-pills">
                        ${statusOptions.map(opt => `
                            <button type="button" class="pw-status-pill ${currentStatusText.includes(opt.label.split(' ')[1]) ? 'active' : ''}" onclick="updateCurrentStateStatus('${opt.val}')">
                                ${opt.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- O que já foi definido (Checklist Interativo) -->
                <div>
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-tertiary); letter-spacing: 0.05em;">
                            ✓ O que já foi definido (${definedItems.length})
                        </span>
                        <span style="font-size:10px; color:var(--text-tertiary);">Clique no ✓ para retornar ao roadmap</span>
                    </div>
                    <div class="pw-roadmap-list">
                        ${definedItems.map((item, idx) => `
                            <div class="pw-roadmap-item">
                                <button type="button" class="pw-roadmap-check interactive" title="Clique para mover de volta para Próximos Passos" onclick="demoteDefinedItem(${idx})">✓</button>
                                <span style="color:#e2e8f0; flex:1;">${item}</span>
                                <button type="button" class="pw-item-del-btn" title="Excluir este item" onclick="deleteDefinedItem(${idx})">✕</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="pw-add-row" style="margin-top: 8px;">
                        <input type="text" id="pwNewDefinedInput" class="pw-inline-input" placeholder="+ Adicionar marco concluído..." onkeydown="if(event.key==='Enter') addNewDefinedItem()">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="addNewDefinedItem()">Adicionar</button>
                    </div>
                </div>

                <!-- Próximos Passos (Roadmap Interativo) -->
                <div style="margin-top: 18px;">
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #f59e0b; letter-spacing: 0.05em;">
                            🎯 Próximos Passos (${nextSteps.length})
                        </span>
                        <span style="font-size:10px; color:var(--text-tertiary);">Ações imediatas</span>
                    </div>
                    <div class="pw-roadmap-list">
                        ${nextSteps.length === 0 ? `
                            <div style="font-size:12px; color:var(--text-tertiary); font-style:italic; padding:8px 0;">Nenhum próximo passo pendente. Parabéns! Adicione novos abaixo.</div>
                        ` : nextSteps.map((step, idx) => `
                            <div class="pw-roadmap-item" style="border-left: 2px solid #f59e0b;">
                                <span class="pw-roadmap-step">${idx + 1}</span>
                                <span style="color:#f8fafc; font-weight: 500; flex:1;">${step}</span>
                                <button type="button" class="btn-step-done" title="Concluir passo (move para 'O que já foi definido')" onclick="completeNextStep(${idx})">✓ Concluir</button>
                                <button type="button" class="pw-item-del-btn" title="Excluir passo" onclick="deleteNextStep(${idx})">✕</button>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Input interativo para adicionar novo passo -->
                    <div class="pw-add-row">
                        <input type="text" id="pwNewStepInput" class="pw-inline-input" placeholder="Digite uma nova meta / próximo passo e pressione Enter..." onkeydown="if(event.key==='Enter') addNewNextStep()">
                        <button type="button" class="btn btn-primary btn-sm" onclick="addNewNextStep()">+ Adicionar Passo</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function editProjectMd() {
    if (!currentProjectData) return;
    openFileEditor(`projects/${currentProjectData.name}/PROJECT.md`, currentProjectData.projectMd, onProjectMdSaved);
}

function editCurrentStateMd() {
    if (!currentProjectData) return;
    openFileEditor(`projects/${currentProjectData.name}/CURRENT_STATE.md`, currentProjectData.currentStateMd, onCurrentStateSaved);
}

function editArchMd() {
    if (!currentProjectData) return;
    openFileEditor(`projects/${currentProjectData.name}/ARCHITECTURE.md`, currentProjectData.archMd, onArchMdSaved);
}

function onProjectMdSaved(newContent) {
    if (currentProjectData) {
        currentProjectData.projectMd = newContent;
        // Atualiza stack e status se alterados
        const stackMatch = newContent.match(/-\s+\*\*Stack[^*]*\*\*:\s*([^\r\n]+)/i);
        if (stackMatch) currentProjectData.stack = stackMatch[1].trim();
        const statusMatch = newContent.match(/-\s+\*\*Status\*\*:\s*([^\r\n]+)/i);
        if (statusMatch) currentProjectData.status = statusMatch[1].trim();

        const badgeStack = document.getElementById('pwStackBadge');
        if (badgeStack) badgeStack.textContent = currentProjectData.stack;
        const badgeStatus = document.getElementById('pwStatusBadge');
        if (badgeStatus) badgeStatus.textContent = currentProjectData.status;

        renderProjectOverviewTab();
    }
}

function onCurrentStateSaved(newContent) {
    if (currentProjectData) {
        currentProjectData.currentStateMd = newContent;
        renderProjectOverviewTab();
    }
}

function onArchMdSaved(newContent) {
    if (currentProjectData) {
        currentProjectData.archMd = newContent;
        currentProjectData.hasArchitecture = true;
        renderProjectOverviewTab();
    }
}

async function initializeContract(contractName) {
    if (!currentProjectData) return;
    const safeName = currentProjectData.name;
    const today = new Date().toISOString().split('T')[0];
    let template = '';

    if (contractName === 'ARCHITECTURE.md') {
        template = `# ${safeName} — Arquitetura da Solução\n\n> Visão arquitetural, padrões e design do sistema.\n> Inicializado em: ${today}\n\n## 1. Visão Geral da Arquitetura\nDescreva a estrutura, camadas e componentes principais da solução.\n\n## 2. Stack Tecnológica\n- **Linguagem / Framework**: ${currentProjectData.stack || 'Não especificada'}\n\n## 3. Padrões & Princípios Adotados\n- Código idiomático e desacoplado.\n- Se utilizar IA: aplicar o AI Decision Gate (\`.agents/rules/01-ai-decision.md\`).\n\n## 4. Estrutura de Diretórios\n\`\`\`\nsrc/\n  api/\n  services/\n\`\`\`\n`;
    } else {
        template = `# ${safeName} — ${contractName.replace(/\.md$/i, '')}\n\n> Documento de governança criado em: ${today}\n\n## Conteúdo\n`;
    }

    try {
        const res = await fetch('/api/file/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: `projects/${safeName}/${contractName}`,
                content: template
            })
        });
        if (!res.ok) throw new Error('Falha ao criar o arquivo no disco.');

        showSecondBrainToast(`✨ ${contractName} inicializado com sucesso no disco!`);
        // Recarrega os dados reais atualizados do projeto
        await openProjectWorkspace(safeName, 'overview');
        // Abre imediatamente o editor para permitir personalização
        openFileEditor(`projects/${safeName}/${contractName}`, template, () => openProjectWorkspace(safeName, 'overview'));
    } catch (err) {
        alert('Erro ao criar contrato: ' + err.message);
    }
}

function renderProjectMemoryTab() {
    const el = document.getElementById('pwMemoryContent');
    if (!el || !currentProjectData) return;

    const d = currentProjectData;

    el.innerHTML = `
        <div class="pw-metrics-row">
            <div class="pw-metric-card">
                <div class="pw-metric-icon">🧮</div>
                <div>
                    <div class="pw-metric-val">${d.memorySizeKb} KB</div>
                    <div class="pw-metric-lbl">Memória & Governança Total</div>
                </div>
            </div>
            <div class="pw-metric-card">
                <div class="pw-metric-icon">⏱️</div>
                <div>
                    <div class="pw-metric-val">${d.sessionsCount}</div>
                    <div class="pw-metric-lbl">Sessões Ativas em MEMORY/</div>
                </div>
            </div>
            <div class="pw-metric-card">
                <div class="pw-metric-icon">📦</div>
                <div>
                    <div class="pw-metric-val">${d.archivedCount}</div>
                    <div class="pw-metric-lbl">Sessões Arquivadas (.archive)</div>
                </div>
            </div>
            <div class="pw-metric-card">
                <div class="pw-metric-icon">⚖️</div>
                <div>
                    <div class="pw-metric-val">${d.decisionsCount}</div>
                    <div class="pw-metric-lbl">Decisões Arquiteturais</div>
                </div>
            </div>
        </div>

        <div class="pw-card" style="margin-bottom: 20px;">
            <div class="pw-card-header">
                <span class="pw-card-title">🧹 Otimização & Limpeza de Memória</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 12px; font-size: 13px;">
                À medida que você trabalha com as IAs (LLMs), o histórico de sessões anteriores cresce. Para economizar tokens de contexto sem perder nada, você pode arquivar sessões antigas com 1 clique.
            </p>
            <div class="pw-action-box">
                <div class="pw-action-info">
                    <h4>Arquivar Sessões Antigas com Segurança</h4>
                    <p>Move as sessões de <code>MEMORY/sessions/</code> para <code>MEMORY/.archive/</code> com timestamp e registra no <code>CURRENT_STATE.md</code>.</p>
                </div>
                <button class="btn btn-secondary" onclick="clearProjectMemory()" id="btnClearMemoryBtn" ${d.sessionsCount === 0 ? 'disabled' : ''}>
                    🧹 Arquivar ${d.sessionsCount} Sessões
                </button>
            </div>
        </div>

        <div class="pw-overview-grid">
            <div class="pw-card">
                <div class="pw-card-header">
                    <span class="pw-card-title">🕒 Histórico de Sessões Recentes</span>
                </div>
                ${d.sessions && d.sessions.length > 0 ? `
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${d.sessions.map(s => `
                            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.03); border-radius:6px; font-size:12px;">
                                <span style="font-family:var(--font-mono); color:#c4b5fd;">📄 ${s.name}</span>
                                <span style="color:var(--text-tertiary);">${(s.size / 1024).toFixed(1)} KB</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="color:var(--text-tertiary); font-size:13px; padding:12px 0;">
                        Nenhuma sessão de trabalho registrada ainda em <code>MEMORY/sessions/</code>.
                    </div>
                `}
            </div>

            <div class="pw-card">
                <div class="pw-card-header">
                    <span class="pw-card-title">⚖️ Decisões Registradas (DECISIONS/)</span>
                </div>
                ${d.decisions && d.decisions.length > 0 ? `
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${d.decisions.map(dec => `
                            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.03); border-radius:6px; font-size:12px;">
                                <span style="font-family:var(--font-mono); color:#34d399;">⚖️ ${dec.name}</span>
                                <span style="color:var(--text-tertiary);">${(dec.size / 1024).toFixed(1)} KB</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="color:var(--text-tertiary); font-size:13px; padding:12px 0;">
                        Nenhuma decisão registrada ainda em <code>DECISIONS/</code>. Use o template de Decisões para adicionar.
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderProjectGraphTab() {
    const canvas = document.getElementById('projectGraphCanvas');
    const tooltip = document.getElementById('projectGraphTooltip');
    if (!canvas || !currentProjectData) return;

    if (!projectGraph) {
        projectGraph = new BrainGraph(canvas, tooltip);

        const btnZoomIn = document.getElementById('btnPwZoomIn');
        const btnZoomOut = document.getElementById('btnPwZoomOut');
        const btnReset = document.getElementById('btnPwResetView');

        if (btnZoomIn) btnZoomIn.onclick = () => projectGraph && projectGraph.zoomIn();
        if (btnZoomOut) btnZoomOut.onclick = () => projectGraph && projectGraph.zoomOut();
        if (btnReset) btnReset.onclick = () => projectGraph && projectGraph.resetView();

        projectGraph.onCameraChange = (state) => {
            const zEl = document.getElementById('pwHudZoomPill');
            if (zEl) zEl.textContent = `🔍 ${state.zoomPercent}%`;
        };

        projectGraph.onNodeDblClick = (node) => {
            if (node && node.path) navigateTo(node.path);
        };
    }

    // Monta a constelação radial do projeto
    const projectName = currentProjectData.name;
    const allFiles = (window.VAULT && window.VAULT.data && window.VAULT.data.files) || [];

    // Nós locais do projeto
    const localFiles = allFiles.filter(f => f.path.startsWith(`projects/${projectName}/`));

    // Regras e conhecimentos aplicáveis do framework
    const frameworkNodes = allFiles.filter(f => {
        return f.category === 'rules' || 
               f.category === 'skills' || 
               (f.category === 'knowledge' && (f.path.includes('aijev') || f.path.includes('model')));
    });

    const nodes = [
        {
            id: `proj_${projectName}`,
            label: projectName,
            group: 'projects',
            size: 32,
            icon: '🚀',
            path: `projects/${projectName}/PROJECT.md`
        }
    ];

    const edges = [];

    // Adiciona arquivos locais
    localFiles.forEach(f => {
        nodes.push({
            id: f.id,
            label: f.name || f.title,
            group: 'projects',
            size: 14,
            icon: f.icon || '📄',
            path: f.path
        });
        edges.push({ from: `proj_${projectName}`, to: f.id });
    });

    // Adiciona satélites de governança do framework
    frameworkNodes.slice(0, 10).forEach(f => {
        nodes.push({
            id: `fw_${f.id}`,
            label: f.title,
            group: f.category,
            size: 11,
            icon: f.icon || '⚙️',
            path: f.path
        });
        edges.push({ from: `proj_${projectName}`, to: `fw_${f.id}` });
    });

    const colors = (window.VAULT && window.VAULT.data && window.VAULT.data.groupColors) || {};
    projectGraph.loadData(nodes, edges, colors);
    projectGraph.start();

    const countEl = document.getElementById('pwGraphNodeCount');
    if (countEl) countEl.textContent = nodes.length;

    setTimeout(() => {
        if (projectGraph) {
            projectGraph._setupCanvas();
            projectGraph.resetView();
        }
    }, 150);
}

async function renderProjectBackupTab() {
    const el = document.getElementById('pwBackupContent');
    if (!el || !currentProjectData) return;

    el.innerHTML = `
        <div class="pw-card" style="margin-bottom: 20px; border-left: 4px solid var(--accent-primary);">
            <div class="pw-card-header">
                <span class="pw-card-title">📦 Gerar & Exportar Dossiê de Governança</span>
                <span class="pw-badge" id="pwBackupDiskBadge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">
                    ● Sincronizando com o Disco...
                </span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 13px;">
                Exporte todo o conhecimento, decisões, arquitetura e estado atual do projeto em formatos padronizados para backup ou compartilhamento com outras IAs.
            </p>

            <div id="pwBackupDiskDetails" style="margin-bottom: 18px;">
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 16px; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); font-size: 13px;">
                    <span class="status-dot snapshot" style="margin-right: 8px;"></span> Gravando arquivos na pasta BACKUPS...
                </div>
            </div>

            <div id="pwBackupActionsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
                <!-- Preenchido dinamicamente com os caminhos dos arquivos -->
            </div>
        </div>

        <div class="pw-card">
            <div class="pw-card-header">
                <span class="pw-card-title">📄 Pré-visualização do Dossiê Consolidado</span>
                <span style="font-size:12px; color:var(--text-tertiary);" id="pwBackupStatus">Gerando dados...</span>
            </div>
            <div id="pwBackupPreview" style="max-height: 400px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); white-space: pre-wrap;">
                Carregando prévia do dossiê...
            </div>
        </div>
    `;

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProjectData.name)}/backup`, { method: 'POST' });
        const backupData = await res.json();
        if (!res.ok) throw new Error(backupData.error || 'Erro ao gerar backup');

        const previewEl = document.getElementById('pwBackupPreview');
        const statusEl = document.getElementById('pwBackupStatus');
        const badgeEl = document.getElementById('pwBackupDiskBadge');
        const diskDetailsEl = document.getElementById('pwBackupDiskDetails');
        const actionsGridEl = document.getElementById('pwBackupActionsGrid');

        const localFiles = backupData.localFiles || {};
        const backupsDir = localFiles.backupsDir || '';
        const mdFile = localFiles.markdown || {};
        const jsonFile = localFiles.json || {};

        if (badgeEl) {
            badgeEl.textContent = '● Gravado Fisicamente no Disco';
        }

        if (statusEl) {
            statusEl.textContent = `${Object.keys(backupData.files || {}).length} arquivos de governança empacotados`;
        }

        if (previewEl) {
            previewEl.textContent = backupData.consolidatedMarkdown || JSON.stringify(backupData, null, 2);
        }

        // Renderiza detalhes da pasta no disco
        if (diskDetailsEl && backupsDir) {
            const safeDir = backupsDir.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            diskDetailsEl.innerHTML = `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 16px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                        <div style="font-size: 13px; font-weight: 600; color: #fff; display: flex; align-items: center; gap: 8px;">
                            <span>📁 Pasta de Destino no Computador:</span>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="openSystemFolder('${safeDir}')" title="Abrir pasta no Windows Explorer">
                            📂 Abrir Pasta no Windows Explorer
                        </button>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 8px 12px; font-family: var(--font-mono); font-size: 12px; color: #a78bfa; word-break: break-all; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <span>${backupsDir}</span>
                        <button class="btn btn-ghost btn-xs" onclick="copyToClipboard('${safeDir}')" title="Copiar caminho da pasta">📋 Copiar</button>
                    </div>
                </div>
            `;
        }

        // Renderiza cards dos 2 arquivos
        if (actionsGridEl) {
            const mdSafePath = (mdFile.path || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            const jsonSafePath = (jsonFile.path || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            const mdSizeKb = mdFile.size ? `${(mdFile.size / 1024).toFixed(1)} KB` : '';
            const jsonSizeKb = jsonFile.size ? `${(jsonFile.size / 1024).toFixed(1)} KB` : '';

            actionsGridEl.innerHTML = `
                <!-- Card Markdown -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                        <strong style="color: #60a5fa; font-size: 13px;">📄 Dossiê Consolidado (.md)</strong>
                        <span style="font-size: 11px; color: var(--text-tertiary);">${mdSizeKb}</span>
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; word-break: break-all;">
                        ${mdFile.filename || `dossie_governanca_${currentProjectData.name}.md`}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="downloadProjectBackup('markdown')">
                                📥 Baixar para Downloads
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="openSystemFile('${mdSafePath}')" title="Abrir arquivo no computador">
                                📄 Abrir Arquivo
                            </button>
                        </div>
                        <button class="btn btn-ghost btn-xs" onclick="copyToClipboard('${mdSafePath}')" style="color: var(--text-tertiary); text-align: left;">
                            📋 Copiar caminho do arquivo .md
                        </button>
                    </div>
                </div>

                <!-- Card JSON -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                        <strong style="color: #34d399; font-size: 13px;">📦 Pacote Completo (.json)</strong>
                        <span style="font-size: 11px; color: var(--text-tertiary);">${jsonSizeKb}</span>
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; word-break: break-all;">
                        ${jsonFile.filename || `backup_governanca_${currentProjectData.name}.json`}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="downloadProjectBackup('json')">
                                📥 Baixar para Downloads
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="openSystemFile('${jsonSafePath}')" title="Abrir arquivo no computador">
                                📄 Abrir Arquivo
                            </button>
                        </div>
                        <button class="btn btn-ghost btn-xs" onclick="copyToClipboard('${jsonSafePath}')" style="color: var(--text-tertiary); text-align: left;">
                            📋 Copiar caminho do arquivo .json
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        const previewEl = document.getElementById('pwBackupPreview');
        if (previewEl) previewEl.textContent = 'Erro ao gerar pré-visualização: ' + err.message;
        showToast('Erro ao sincronizar backup: ' + err.message, 'error');
    }
}

function renderProjectSettingsTab() {
    const el = document.getElementById('pwSettingsContent');
    if (!el || !currentProjectData) return;

    const d = currentProjectData;

    el.innerHTML = `
        <div class="pw-card" style="margin-bottom: 20px;">
            <div class="pw-card-header">
                <span class="pw-card-title">⚙️ Propriedades do Repositório</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:13px;">
                <div>
                    <span style="color:var(--text-tertiary);">Nome do Projeto:</span>
                    <strong style="color:#fff; margin-left:8px;">${d.name}</strong>
                </div>
                <div>
                    <span style="color:var(--text-tertiary);">Tipo de Integração:</span>
                    <span style="margin-left:8px;" class="pw-badge">${d.isJunction ? 'Brownfield 🔗 (Junção NTFS)' : 'Greenfield 🚀 (Pasta Nativa)'}</span>
                </div>
                <div>
                    <span style="color:var(--text-tertiary);">Caminho Original:</span>
                    <code style="margin-left:8px; color:#c4b5fd;">${d.realPath}</code>
                </div>
                <div>
                    <span style="color:var(--text-tertiary);">Stack Declarada:</span>
                    <span style="margin-left:8px; color:#34d399;">${d.stack}</span>
                </div>
            </div>
        </div>

        <div class="pw-card pw-danger-card">
            <div class="pw-card-header">
                <span class="pw-card-title">⚠️ Zona de Gerenciamento & Desvinculação</span>
            </div>
            <p style="color: #fca5a5; font-size: 13px; margin-bottom: 16px;">
                ${d.isJunction 
                    ? 'Este projeto está conectado via Junção NTFS. Desvincular irá apenas desconectar o projeto do AI Second Brain. <strong>Nenhum arquivo ou linha de código da sua pasta original será apagado.</strong>' 
                    : 'Este projeto foi criado na pasta local do Segundo Cérebro. Desvincular irá movê-lo com segurança para a lixeira (.trash/).'}
            </p>
            <div class="pw-action-box" style="border-color: rgba(239, 68, 68, 0.3);">
                <div class="pw-action-info">
                    <h4 style="color:#fca5a5;">Desvincular '${d.name}' do Segundo Cérebro</h4>
                    <p style="color:var(--text-secondary);">Remove a junção e o monitoramento em tempo real. Seus arquivos em <code>${d.realPath}</code> permanecem intactos.</p>
                </div>
                <button class="btn-danger-outline" onclick="unlinkProject()">
                    🔗 Desfazer Vínculo do Projeto
                </button>
            </div>
        </div>
    `;
}

// ── Project Action Handlers ───────────────────────
function copyProjectPath() {
    if (!currentProjectData || !currentProjectData.realPath) return;
    navigator.clipboard.writeText(currentProjectData.realPath).then(() => {
        const btn = document.getElementById('btnPwCopyPath');
        if (btn) {
            const original = btn.textContent;
            btn.textContent = '✓ Copiado!';
            setTimeout(() => btn.textContent = original, 2000);
        }
    }).catch(() => {
        alert('Caminho: ' + currentProjectData.realPath);
    });
}

async function clearProjectMemory() {
    if (!currentProject) return;
    const conf = confirm(`Deseja arquivar as sessões de memória do projeto '${currentProject}'?\n\nTodas as sessões serão salvas com segurança em MEMORY/.archive/ com carimbo de data/hora.`);
    if (!conf) return;

    const btn = document.getElementById('btnClearMemoryBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Arquivando...';
    }

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/clear-memory`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao arquivar sessões.');

        alert(`✓ Sucesso! ${data.movedCount} sessões foram arquivadas em .archive/.`);
        // Recarrega detalhes do projeto
        await openProjectWorkspace(currentProject, 'memory');
    } catch (err) {
        alert('Erro ao arquivar memória: ' + err.message);
        if (btn) btn.disabled = false;
    }
}

async function downloadProjectBackup(type = 'markdown') {
    if (!currentProject) return;
    try {
        showToast('Iniciando geração do download...', 'info', 2000);
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/backup`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao gerar backup');

        let blob, filename;
        if (type === 'markdown') {
            blob = new Blob([data.consolidatedMarkdown || ''], { type: 'text/markdown;charset=utf-8' });
            filename = data.localFiles?.markdown?.filename || `dossie_governanca_${currentProject}.md`;
        } else {
            blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
            filename = data.localFiles?.json?.filename || `backup_governanca_${currentProject}.json`;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // IMPORTANTE: Não revogar o blob imediatamente! O Chromium precisa de alguns segundos para
        // iniciar o stream de download para a pasta Downloads do sistema operacional.
        setTimeout(() => {
            if (document.body.contains(a)) document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 10000);

        showToast(`✓ Download de '${filename}' iniciado! Verifique a pasta Downloads.`, 'success', 5000);
    } catch (err) {
        showToast('Erro ao baixar backup: ' + err.message, 'error', 4000);
        alert('Erro ao baixar backup: ' + err.message);
    }
}

async function openSystemFolder(targetPath) {
    if (!targetPath) return;
    try {
        showToast('📂 Solicitando abertura no Windows Explorer...', 'info', 2500);
        const res = await fetch('/api/system/open-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: targetPath })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao abrir pasta no sistema');
        showToast('✓ Pasta aberta com sucesso no Windows Explorer!', 'success', 3500);
    } catch (err) {
        showToast('Falha ao abrir pasta: ' + err.message, 'error', 4000);
    }
}

async function openSystemFile(targetPath) {
    if (!targetPath) return;
    try {
        showToast('📄 Abrindo arquivo no computador...', 'info', 2500);
        const res = await fetch('/api/system/open-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: targetPath })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao abrir arquivo');
        showToast('✓ Arquivo aberto no aplicativo padrão do Windows!', 'success', 3500);
    } catch (err) {
        showToast('Falha ao abrir arquivo: ' + err.message, 'error', 4000);
    }
}

async function copyToClipboard(text) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        showToast('✓ Caminho copiado para a área de transferência!', 'success', 3000);
    } catch (err) {
        prompt('Copie o caminho:', text);
    }
}

async function unlinkProject() {
    if (!currentProject) return;
    const confirmName = prompt(`Para confirmar a desvinculação, digite o nome do projeto '${currentProject}':`);
    if (confirmName !== currentProject) {
        if (confirmName !== null) alert('Nome digitado incorreto. Operação cancelada.');
        return;
    }

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/unlink`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao desvincular projeto.');

        alert(data.message || 'Projeto desvinculado com sucesso.');
        showDashboard();
        if (window.VAULT) {
            await window.VAULT.refresh();
            refreshApp();
        }
    } catch (err) {
        alert('Erro ao desvincular: ' + err.message);
    }
}

// ═══════════════════════════════════════════════════
// LIVE MARKDOWN EDITOR CONTROLLER
// ═══════════════════════════════════════════════════
let activeEditingPath = null;
let onEditorSavedCallback = null;
let currentEditorTab = 'write';

async function openFileEditor(filePath, initialContent = null, onSaved = null) {
    activeEditingPath = filePath;
    onEditorSavedCallback = onSaved;
    currentEditorTab = 'write';

    const modal = document.getElementById('fileEditorModal');
    const pathEl = document.getElementById('editorFilePath');
    const titleEl = document.getElementById('editorModalTitle');
    const textarea = document.getElementById('editorTextarea');
    const statusText = document.getElementById('editorStatusText');
    const btnSave = document.getElementById('btnSaveFile');

    if (!modal || !textarea) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const filename = filePath.split('/').pop();
    if (titleEl) titleEl.textContent = `Editando: ${filename}`;
    if (pathEl) pathEl.textContent = filePath;
    if (statusText) statusText.innerHTML = '<span class="status-dot snapshot"></span> Carregando conteúdo...';
    if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = '<span>💾 Salvar no Disco</span>';
    }

    switchEditorTab('write');

    if (initialContent !== null && initialContent !== undefined) {
        textarea.value = initialContent;
        if (statusText) statusText.innerHTML = '<span class="status-dot" style="background:#10b981"></span> Pronto para editar';
        setTimeout(() => textarea.focus(), 100);
    } else {
        try {
            const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
            if (!res.ok) throw new Error('Não foi possível ler o arquivo.');
            const text = await res.text();
            textarea.value = text;
            if (statusText) statusText.innerHTML = '<span class="status-dot" style="background:#10b981"></span> Pronto para editar';
            setTimeout(() => textarea.focus(), 100);
        } catch (err) {
            textarea.value = `# ${filename}\n\n`;
            if (statusText) statusText.innerHTML = `<span class="status-dot" style="background:#f59e0b"></span> Arquivo novo ou vazio. Pronto para criar.`;
        }
    }

    // Configura atalhos no textarea: Ctrl+S para salvar e Tab para indentação
    textarea.onkeydown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveFileContent();
            return;
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 2;
        }
    };
}

function switchEditorTab(tab) {
    currentEditorTab = tab;
    const btnWrite = document.getElementById('btnEditorTabWrite');
    const btnPrev = document.getElementById('btnEditorTabPreview');
    const textarea = document.getElementById('editorTextarea');
    const preview = document.getElementById('editorPreviewPane');
    const toolbar = document.getElementById('editorToolbar');

    if (btnWrite) btnWrite.classList.toggle('active', tab === 'write');
    if (btnPrev) btnPrev.classList.toggle('active', tab === 'preview');

    if (tab === 'write') {
        if (textarea) textarea.style.display = 'block';
        if (preview) preview.style.display = 'none';
        if (toolbar) toolbar.style.display = 'flex';
        textarea?.focus();
    } else {
        if (textarea) textarea.style.display = 'none';
        if (preview) {
            preview.style.display = 'block';
            const val = textarea ? textarea.value : '';
            const html = window.VAULT && window.VAULT.renderMarkdown 
                ? window.VAULT.renderMarkdown(val, activeEditingPath) 
                : `<pre>${val.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
            preview.innerHTML = `<div class="doc-preview-inner">${html}</div>`;
        }
        if (toolbar) toolbar.style.display = 'none';
    }
}

function insertEditorSyntax(type) {
    const textarea = document.getElementById('editorTextarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = textarea.value.substring(start, end);
    let insert = '';
    let cursorOffset = 0;

    switch (type) {
        case 'h2':
            insert = `\n## ${sel || 'Título'}\n`;
            cursorOffset = insert.length;
            break;
        case 'h3':
            insert = `\n### ${sel || 'Subtítulo'}\n`;
            cursorOffset = insert.length;
            break;
        case 'bold':
            insert = `**${sel || 'texto em negrito'}**`;
            cursorOffset = insert.length;
            break;
        case 'italic':
            insert = `*${sel || 'texto em itálico'}*`;
            cursorOffset = insert.length;
            break;
        case 'bullet':
            insert = `\n- ${sel || 'Item da lista'}`;
            cursorOffset = insert.length;
            break;
        case 'task':
            insert = `\n- [ ] ${sel || 'Nova tarefa'}`;
            cursorOffset = insert.length;
            break;
        case 'code':
            insert = sel ? `\`${sel}\`` : `\n\`\`\`javascript\n// seu código aqui\n\`\`\`\n`;
            cursorOffset = insert.length;
            break;
        case 'quote':
            insert = `\n> ${sel || 'Citação ou nota de governança'}\n`;
            cursorOffset = insert.length;
            break;
    }

    textarea.value = textarea.value.substring(0, start) + insert + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
    textarea.focus();
}

async function saveFileContent() {
    if (!activeEditingPath) return;

    const textarea = document.getElementById('editorTextarea');
    const btnSave = document.getElementById('btnSaveFile');
    const statusText = document.getElementById('editorStatusText');
    const content = textarea ? textarea.value : '';

    if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = '<span class="status-dot snapshot"></span> Salvando no disco...';
    }

    try {
        const res = await fetch('/api/file/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: activeEditingPath,
                content: content
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao salvar arquivo.');

        if (statusText) {
            statusText.innerHTML = `<span class="status-dot" style="background:#10b981"></span> ✓ Salvo no disco às ${new Date().toLocaleTimeString('pt-BR')}`;
        }

        if (btnSave) {
            btnSave.innerHTML = '<span>✓ Salvo!</span>';
            setTimeout(() => {
                btnSave.disabled = false;
                btnSave.innerHTML = '<span>💾 Salvar no Disco</span>';
            }, 1200);
        }

        // Executa callback se houver
        if (typeof onEditorSavedCallback === 'function') {
            onEditorSavedCallback(content);
        }

        // Notifica o Vault para atualizar arquivos locais se necessário
        if (window.VAULT && window.VAULT.data && window.VAULT.data.files) {
            const targetFile = window.VAULT.data.files.find(f => f.path === activeEditingPath);
            if (targetFile) targetFile.content = content;
        }

    } catch (err) {
        alert('Erro ao salvar no disco: ' + err.message);
        if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<span>💾 Salvar no Disco</span>';
        }
        if (statusText) {
            statusText.innerHTML = `<span class="status-dot" style="background:#ef4444"></span> Erro ao salvar: ${err.message}`;
        }
    }
}

function closeFileEditor() {
    const modal = document.getElementById('fileEditorModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleEditorBackdropClick(e) {
    if (e.target && e.target.id === 'fileEditorModal') {
        closeFileEditor();
    }
}



