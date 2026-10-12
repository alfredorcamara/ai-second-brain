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

// ── Environment Detection & Online Demo Protection ─────
function isLocalEnvironment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' || 
           window.location.hostname === '::1';
}
window.isLocalEnvironment = isLocalEnvironment;

function showOnlineDemoNotice(actionName = 'esta ação') {
    showToast(`🌐 Modo Demonstração Online: Para ${actionName}, execute o projeto localmente com "npm start".`, 'warning', 6000);
}
window.showOnlineDemoNotice = showOnlineDemoNotice;

// ── AI Engine Support & Agnostic Architecture ──────
const AI_ENGINES = {
    antigravity: {
        id: 'antigravity',
        name: 'GOOGLE ANTIGRAVITY',
        label: 'Google Antigravity',
        icon: '🪐',
        gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        border: '1px solid rgba(139, 92, 246, 0.5)',
        shadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
        bridgeFile: 'GEMINI.md'
    },
    cursor: {
        id: 'cursor',
        name: 'CURSOR AI',
        label: 'Cursor AI',
        icon: '⚡',
        gradient: 'linear-gradient(135deg, #0284c7, #06b6d4)',
        border: '1px solid rgba(14, 165, 233, 0.5)',
        shadow: '0 4px 16px rgba(14, 165, 233, 0.35)',
        bridgeFile: '.cursorrules'
    },
    claude: {
        id: 'claude',
        name: 'CLAUDE CODE',
        label: 'Claude Code',
        icon: '🤖',
        gradient: 'linear-gradient(135deg, #d97706, #ea580c)',
        border: '1px solid rgba(234, 88, 12, 0.5)',
        shadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
        bridgeFile: 'CLAUDE.md'
    },
    windsurf: {
        id: 'windsurf',
        name: 'WINDSURF CASCADE',
        label: 'Windsurf (Cascade)',
        icon: '🏄',
        gradient: 'linear-gradient(135deg, #0d9488, #10b981)',
        border: '1px solid rgba(16, 185, 129, 0.5)',
        shadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
        bridgeFile: '.windsurfrules'
    },
    copilot: {
        id: 'copilot',
        name: 'GITHUB COPILOT',
        label: 'GitHub Copilot',
        icon: '🐙',
        gradient: 'linear-gradient(135deg, #24292f, #334155)',
        border: '1px solid rgba(148, 163, 184, 0.4)',
        shadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
        bridgeFile: '.github/copilot-instructions.md'
    },
    cline: {
        id: 'cline',
        name: 'ROO CODE / CLINE',
        label: 'Roo Code / Cline',
        icon: '🦾',
        gradient: 'linear-gradient(135deg, #6366f1, #db2777)',
        border: '1px solid rgba(219, 39, 119, 0.5)',
        shadow: '0 4px 16px rgba(219, 39, 119, 0.35)',
        bridgeFile: '.clinerules'
    },
    universal: {
        id: 'universal',
        name: 'AI AGENT LAYER',
        label: 'Universal (Agnóstico)',
        icon: '🌐',
        gradient: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
        border: '1px solid rgba(99, 102, 241, 0.5)',
        shadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
        bridgeFile: 'UNIVERSAL'
    }
};

function getSelectedAiEngine() {
    return localStorage.getItem('selectedAiEngine') || 'antigravity';
}

function onAiEngineChange(engineKey, silent = false) {
    const engine = AI_ENGINES[engineKey] || AI_ENGINES.universal;
    localStorage.setItem('selectedAiEngine', engineKey);

    // Grava escolha no disco em brain.config.json
    fetch('/api/engine/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineKey, engine })
    }).catch(e => console.warn('Não foi possível gravar brain.config.json no disco:', e));

    const selectEl = document.getElementById('aiEngineSelect');
    if (selectEl && selectEl.value !== engineKey) {
        selectEl.value = engineKey;
    }

    const box = document.getElementById('archPrimaryBox');
    const iconEl = document.getElementById('archEngineIcon');
    const nameEl = document.getElementById('archEngineName');

    if (box) {
        box.style.background = engine.gradient;
        box.style.border = engine.border;
        box.style.boxShadow = engine.shadow;
    }
    if (iconEl) iconEl.textContent = engine.icon;
    if (nameEl) nameEl.textContent = engine.name;

    // Se estiver no Workspace de um projeto, atualiza o botão contextual de ponte
    const bridgeBtn = document.getElementById('pwContextualBridgeBtn');
    if (bridgeBtn) {
        bridgeBtn.innerHTML = `⚡ Gerar Ponte (${engine.label})`;
    }

    if (!silent) {
        // Verifica se há um projeto ativo e se o arquivo de ponte já existe no disco
        const projName = (typeof currentProjectData !== 'undefined' && currentProjectData && currentProjectData.name) || 
                         (typeof currentProject !== 'undefined' && currentProject) || null;

        if (projName && engine.bridgeFile && engine.bridgeFile !== 'UNIVERSAL') {
            const files = (window.VAULT && window.VAULT.data && window.VAULT.data.files) || [];
            const fullBridgePath = `projects/${projName}/${engine.bridgeFile}`.toLowerCase();
            const exists = files.some(f => f.path.toLowerCase() === fullBridgePath);

            if (exists) {
                showSecondBrainToast(`✓ ${engine.icon} <strong>${engine.label}</strong> ativo! A ponte <code>${engine.bridgeFile}</code> já está pronta no projeto.`);
            } else {
                // Notificação Proativa com Ação Rápida em 1 Clique!
                showAiBridgePrompt(projName, engineKey);
            }
        } else {
            showSecondBrainToast(`${engine.icon} Motor padrão: <strong>${engine.label}</strong> (Gravado no disco em brain.config.json)!`);
        }
    }
}

function dismissAiBridgePrompt() {
    const el = document.getElementById('aiBridgePromptBanner');
    if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px) scale(0.95)';
        el.style.transition = 'all 0.2s ease';
        setTimeout(() => el.remove(), 200);
    }
}

function showAiBridgePrompt(projectName, engineKey) {
    dismissAiBridgePrompt();
    const engine = AI_ENGINES[engineKey];
    if (!engine || !engine.bridgeFile || engine.bridgeFile === 'UNIVERSAL') return;

    const banner = document.createElement('div');
    banner.id = 'aiBridgePromptBanner';
    banner.className = 'ai-bridge-prompt-banner';
    banner.innerHTML = `
        <div class="ai-bridge-prompt-content">
            <span class="ai-bridge-prompt-icon">${engine.icon}</span>
            <div>
                <div class="ai-bridge-prompt-title">Ativar ${engine.label} no projeto?</div>
                <div class="ai-bridge-prompt-desc">
                    O projeto <strong>${projectName}</strong> ainda não possui a ponte <code>${engine.bridgeFile}</code>. Deseja gerá-la agora para a IA começar a obedecer as regras?
                </div>
            </div>
        </div>
        <div class="ai-bridge-prompt-actions">
            <button type="button" class="btn-prompt btn-prompt-secondary" onclick="dismissAiBridgePrompt()">Deixar para depois</button>
            <button type="button" class="btn-prompt btn-prompt-primary" onclick="confirmGenerateBridgeFromPrompt('${projectName}', '${engineKey}')">
                ⚡ Criar ${engine.bridgeFile}
            </button>
        </div>
    `;

    document.body.appendChild(banner);

    setTimeout(() => {
        const b = document.getElementById('aiBridgePromptBanner');
        if (b === banner) dismissAiBridgePrompt();
    }, 15000);
}

async function confirmGenerateBridgeFromPrompt(projectName, engineKey) {
    dismissAiBridgePrompt();
    await generateAiBridge(projectName, engineKey);
    const bridgesList = document.getElementById('pwBridgesList');
    if (bridgesList) {
        bridgesList.innerHTML = renderProjectBridgesChips(projectName);
    }
}

window.showAiBridgePrompt = showAiBridgePrompt;
window.dismissAiBridgePrompt = dismissAiBridgePrompt;
window.confirmGenerateBridgeFromPrompt = confirmGenerateBridgeFromPrompt;
window.onAiEngineChange = onAiEngineChange;
window.getSelectedAiEngine = getSelectedAiEngine;
window.AI_ENGINES = AI_ENGINES;

function openAiEngineHelpModal() {
    const modal = document.getElementById('aiEngineHelpModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeAiEngineHelpModal() {
    const modal = document.getElementById('aiEngineHelpModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleAiEngineHelpBackdropClick(event) {
    if (event.target && event.target.id === 'aiEngineHelpModal') {
        closeAiEngineHelpModal();
    }
}

// Suporte à tecla ESC para fechar o modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('aiEngineHelpModal');
        if (modal && modal.style.display === 'flex') {
            closeAiEngineHelpModal();
        }
    }
});

window.openAiEngineHelpModal = openAiEngineHelpModal;
window.closeAiEngineHelpModal = closeAiEngineHelpModal;
window.handleAiEngineHelpBackdropClick = handleAiEngineHelpBackdropClick;

function renderProjectBridgesChips(projectName) {
    const files = (window.VAULT && window.VAULT.data && window.VAULT.data.files) || [];
    const prefix = `projects/${projectName}/`;
    const projFiles = files.filter(f => f.path.startsWith(prefix));

    const bridges = [
        { key: 'cursor', file: '.cursorrules', label: '.cursorrules', icon: '⚡' },
        { key: 'claude', file: 'CLAUDE.md', label: 'CLAUDE.md', icon: '🤖' },
        { key: 'windsurf', file: '.windsurfrules', label: '.windsurfrules', icon: '🏄' },
        { key: 'antigravity', file: 'GEMINI.md', label: 'GEMINI.md', icon: '🪐' },
        { key: 'copilot', file: '.github/copilot-instructions.md', label: 'copilot-instructions.md', icon: '🐙' },
        { key: 'cline', file: '.clinerules', label: '.clinerules', icon: '🦾' }
    ];

    return bridges.map(b => {
        const fullPath = `${prefix}${b.file}`;
        const exists = projFiles.some(f => f.path.toLowerCase() === fullPath.toLowerCase());

        if (exists) {
            return `
                <span class="pw-bridge-chip active" onclick="navigateTo('${fullPath}')" title="Ponte ativa! Clique para visualizar ${b.file}">
                    ✓ ${b.icon} ${b.label}
                </span>
            `;
        } else {
            return `
                <span class="pw-bridge-chip pending" onclick="generateAiBridge('${projectName}', '${b.key}')" title="Clique para gerar ponte para ${b.file}">
                    + ${b.icon} ${b.label}
                </span>
            `;
        }
    }).join('');
}
window.renderProjectBridgesChips = renderProjectBridgesChips;

async function generateAiBridge(projectName, engineKey) {
    const projName = projectName || (currentProjectData ? currentProjectData.name : currentProject);
    if (!projName) return;

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('gerar arquivos de ponte de IA no disco local');
        return;
    }

    const engine = AI_ENGINES[engineKey] || AI_ENGINES[getSelectedAiEngine()] || AI_ENGINES.cursor;

    const bridgeTemplates = {
        cursor: {
            filename: '.cursorrules',
            content: `# Diretrizes para Cursor AI — ${projName}\n\n> Este projeto é governado pelo **AI Second Brain**.\n> Antes de implementar código ou alterar arquitetura, consulte os contratos oficiais:\n\n## Contratos de Governança Obrigatórios\n- 📄 **Visão & Stack**: \`projects/${projName}/PROJECT.md\`\n- 💾 **Estado Atual & Roadmap**: \`projects/${projName}/CURRENT_STATE.md\`\n- 🏗️ **Padrões de Arquitetura**: \`projects/${projName}/ARCHITECTURE.md\`\n- ⚖️ **Histórico de Decisões (ADRs)**: \`projects/${projName}/DECISIONS/\`\n\n## Regras Mandatórias para o Cursor\n1. Respeite os padrões de código e arquitetura definidos.\n2. NUNCA altere a arquitetura sem registrar um novo ADR em \`projects/${projName}/DECISIONS/\`.\n3. Mantenha \`CURRENT_STATE.md\` sincronizado com as tarefas concluídas.\n4. Se a tarefa envolver IA, avalie regras determinísticas antes de usar LLMs.\n`
        },
        claude: {
            filename: 'CLAUDE.md',
            content: `# Instruções para Claude Code — ${projName}\n\n> Projeto governado pelo **AI Second Brain**.\n\n## Contratos de Arquitetura & Contexto\n- Leia \`projects/${projName}/PROJECT.md\` para visão do produto e stack.\n- Leia \`projects/${projName}/CURRENT_STATE.md\` para ver o que está pronto e pendente.\n- Leia \`projects/${projName}/ARCHITECTURE.md\` antes de criar componentes.\n- Consulte \`projects/${projName}/DECISIONS/\` para decisões anteriores.\n\n## Diretrizes de Operação\n- Não invente regras que contradigam os contratos de arquitetura.\n- Registre novas decisões em \`projects/${projName}/DECISIONS/\`.\n- Atualize o estado atual ao término de cada sessão.\n`
        },
        windsurf: {
            filename: '.windsurfrules',
            content: `# Regras para Windsurf (Cascade) — ${projName}\n\n> Projeto governado pelo ecossistema AI Second Brain.\n\n## Referências Obrigatórias\n- \`projects/${projName}/PROJECT.md\`: Visão geral e stack.\n- \`projects/${projName}/CURRENT_STATE.md\`: Estado do ciclo e tarefas ativas.\n- \`projects/${projName}/ARCHITECTURE.md\`: Desenho de componentes e padrões.\n- \`projects/${projName}/DECISIONS/\`: Histórico formal de ADRs.\n`
        },
        antigravity: {
            filename: 'GEMINI.md',
            content: `# Instruções para Google Antigravity — ${projName}\n\n> Este projeto é governado pelo AI Second Brain.\n\n## Regras Mandatórias\n1. Consulte \`projects/${projName}/PROJECT.md\` e \`ARCHITECTURE.md\` antes de codificar.\n2. Siga as regras globais em \`.agents/rules/\`.\n3. Atualize \`projects/${projName}/CURRENT_STATE.md\` e registre decisões em \`DECISIONS/\`.\n`
        },
        copilot: {
            filename: '.github/copilot-instructions.md',
            content: `# Diretrizes para GitHub Copilot — ${projName}\n\n> Projeto governado pelo AI Second Brain.\n\n## Contratos de Arquitetura\n- Consulte os contratos \`PROJECT.md\`, \`CURRENT_STATE.md\` e \`ARCHITECTURE.md\` em \`projects/${projName}/\`.\n- Siga os padrões documentados e registre decisões em \`DECISIONS/\`.\n`
        },
        cline: {
            filename: '.clinerules',
            content: `# Diretrizes para Roo Code / Cline — ${projName}\n\n> Projeto governado pelo AI Second Brain.\n\n## Contratos Obrigatórios\n- Leia \`projects/${projName}/PROJECT.md\` e \`ARCHITECTURE.md\`.\n- Mantenha \`CURRENT_STATE.md\` atualizado.\n- Registre decisões em \`projects/${projName}/DECISIONS/\`.\n`
        }
    };

    try {
        if (engineKey === 'universal') {
            const list = ['cursor', 'claude', 'windsurf', 'antigravity', 'copilot', 'cline'];
            for (const key of list) {
                const b = bridgeTemplates[key];
                await fetch('/api/file/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: `projects/${projName}/${b.filename}`,
                        content: b.content
                    })
                });
            }
            showSecondBrainToast(`🌐 Todas as pontes de IA foram geradas com sucesso para <strong>${projName}</strong>!`);
        } else {
            const b = bridgeTemplates[engineKey] || bridgeTemplates.cursor;
            await fetch('/api/file/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: `projects/${projName}/${b.filename}`,
                    content: b.content
                })
            });
            showSecondBrainToast(`✨ Ponte para <strong>${engine.label}</strong> (${b.filename}) gerada em ${projName}!`);
        }

        // Recarrega o vault e o workspace
        if (window.VAULT) await window.VAULT.init();
        if (currentView === 'project-workspace') {
            await openProjectWorkspace(projName, 'overview');
        }
    } catch (err) {
        alert('Erro ao gerar ponte de IA: ' + err.message);
    }
}
window.generateAiBridge = generateAiBridge;

// ── Universal Brain Dialog System (Confirmations & Prompts) ────
let _brainConfirmResolver = null;

/**
 * Diálogo Universal de Alta Fidelidade para Confirmações e Respostas do Usuário
 */
function showBrainConfirm(options = {}) {
    return new Promise((resolve) => {
        _brainConfirmResolver = resolve;

        const modal = document.getElementById('brainConfirmModal');
        if (!modal) {
            const ok = window.confirm(options.message ? options.message.replace(/<[^>]*>?/gm, '') : (options.title || 'Confirmar?'));
            resolve(ok);
            return;
        }

        const card = modal.querySelector('.brain-dialog-card');
        const iconEl = document.getElementById('brainConfirmIcon');
        const badgeEl = document.getElementById('brainConfirmBadge');
        const titleEl = document.getElementById('brainConfirmTitle');
        const messageEl = document.getElementById('brainConfirmMessage');
        const inputWrap = document.getElementById('brainConfirmInputWrap');
        const inputEl = document.getElementById('brainConfirmInput');
        const cancelBtn = document.getElementById('brainConfirmCancelBtn');
        const okBtn = document.getElementById('brainConfirmOkBtn');

        const isDanger = options.danger !== false;
        const withInput = !!options.withInput;

        if (card) {
            card.className = `brain-dialog-card ${isDanger ? 'dialog-danger' : 'dialog-primary'}`;
        }

        if (iconEl) {
            iconEl.textContent = options.icon || (withInput ? '💬' : (isDanger ? '🗑️' : '❓'));
        }

        if (badgeEl) {
            badgeEl.textContent = options.badge || (withInput ? 'ENTRADA REQUERIDA' : (isDanger ? '⚠️ EXCLUSÃO PERMANENTE' : 'CONFIRMAÇÃO'));
        }

        if (titleEl) {
            titleEl.textContent = options.title || 'Confirmar Ação';
        }

        if (messageEl) {
            messageEl.innerHTML = options.message || 'Tem certeza que deseja prosseguir com esta ação?';
        }

        if (cancelBtn) {
            cancelBtn.textContent = options.cancelText || 'Cancelar';
            cancelBtn.style.display = options.singleButton ? 'none' : 'inline-flex';
        }

        if (okBtn) {
            okBtn.textContent = options.confirmText || (isDanger ? 'Excluir' : 'Confirmar');
            okBtn.className = `btn btn-dialog ${isDanger ? 'btn-danger-glow' : 'btn-primary-glow'}`;
        }

        if (inputWrap && inputEl) {
            if (withInput) {
                inputWrap.style.display = 'block';
                inputEl.value = options.defaultValue || '';
                inputEl.placeholder = options.inputPlaceholder || 'Digite sua resposta...';
                setTimeout(() => {
                    inputEl.focus();
                    if (inputEl.value) inputEl.select();
                }, 100);
            } else {
                inputWrap.style.display = 'none';
                inputEl.value = '';
            }
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleKeyDown);
                resolveBrainConfirm(withInput ? null : false);
            } else if (e.key === 'Enter' && (!inputWrap || inputWrap.style.display === 'none' || document.activeElement === inputEl)) {
                e.preventDefault();
                document.removeEventListener('keydown', handleKeyDown);
                onBrainConfirmOkClicked();
            }
        };
        modal._keyHandler = handleKeyDown;
        document.addEventListener('keydown', handleKeyDown);
    });
}

function onBrainConfirmOkClicked() {
    const inputWrap = document.getElementById('brainConfirmInputWrap');
    const inputEl = document.getElementById('brainConfirmInput');
    if (inputWrap && inputWrap.style.display !== 'none' && inputEl) {
        resolveBrainConfirm(inputEl.value.trim());
    } else {
        resolveBrainConfirm(true);
    }
}

function resolveBrainConfirm(result) {
    const modal = document.getElementById('brainConfirmModal');
    if (modal) {
        if (modal._keyHandler) {
            document.removeEventListener('keydown', modal._keyHandler);
            modal._keyHandler = null;
        }
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    if (_brainConfirmResolver) {
        const r = _brainConfirmResolver;
        _brainConfirmResolver = null;
        r(result);
    }
}

function handleBrainConfirmBackdropClick(e) {
    if (e.target && e.target.id === 'brainConfirmModal') {
        const inputWrap = document.getElementById('brainConfirmInputWrap');
        const withInput = inputWrap && inputWrap.style.display !== 'none';
        resolveBrainConfirm(withInput ? null : false);
    }
}

function showBrainAlert(options = {}) {
    return showBrainConfirm({
        title: options.title || 'Aviso do Sistema',
        message: options.message || '',
        badge: options.badge || 'INFORMAÇÃO',
        icon: options.icon || (options.type === 'error' ? '⚠️' : 'ℹ️'),
        confirmText: options.okText || 'Entendido',
        danger: options.type === 'error',
        singleButton: true
    });
}

// Substitui alert nativo do navegador por Toast elegante e não-intrusivo
window.alert = function(msg) {
    if (typeof showToast === 'function') {
        const text = String(msg || '');
        const isError = /erro|falha|error|failed|incorreto|obrigat|atenção|não encontrad/i.test(text);
        showToast(text, isError ? 'error' : 'info', 4500);
    } else {
        console.warn('[SecondBrain Alert]', msg);
    }
};

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
    try {
        const engineRes = await fetch('/api/engine/current');
        if (engineRes.ok) {
            const engineConfig = await engineRes.json();
            if (engineConfig && engineConfig.activeEngine) {
                localStorage.setItem('selectedAiEngine', engineConfig.activeEngine);
            }
        }
    } catch (e) {}
    onAiEngineChange(getSelectedAiEngine(), true);
    if (window.location.hash === '#graph' || window.location.search.includes('view=graph')) {
        showView('graph');
    } else {
        showDashboard();
    }
});

// ── Sidebar ───────────────────────────────────────
function isAnyChildActive(item, activePath) {
    if (!item || !item.children || !activePath) return false;
    return item.children.some(c => {
        if (c.path === activePath) return true;
        if (c.isGroup && c.children) return isAnyChildActive(c, activePath);
        return false;
    });
}

function renderNavItem(item, depth = 0) {
    if (item.isGroup && Array.isArray(item.children) && item.children.length > 0) {
        const isChildActive = currentPath && isAnyChildActive(item, currentPath);
        const isTopProject = item.isProject || depth === 0;
        const count = item.childrenCount !== undefined ? item.childrenCount : item.children.length;
        const isCollapsed = (item.startCollapsed !== undefined ? item.startCollapsed : true) && !isChildActive;

        // Ação ao clicar no título da pasta/grupo
        let titleAction = '';
        if (isTopProject) {
            titleAction = `onclick="event.stopPropagation(); openProjectWorkspace('${escapeHtml(item.label)}', 'overview')" title="Abrir Workspace de ${escapeHtml(item.label)}"`;
        } else if (item.isSubfolder) {
            titleAction = `onclick="toggleTreeGroup('${item.id}', event)" title="Expandir/Recolher ${escapeHtml(item.title || item.label)}"`;
        } else if (item.path) {
            titleAction = `onclick="event.stopPropagation(); navigateTo('${escapeHtml(item.path)}')" title="${escapeHtml(item.title || item.label)}"`;
        } else {
            titleAction = `onclick="toggleTreeGroup('${item.id}', event)" title="${escapeHtml(item.title || item.label)}"`;
        }

        let displayLabel = item.label || '';
        if (item.icon && displayLabel.startsWith(item.icon)) {
            displayLabel = displayLabel.slice(item.icon.length).trim();
        }

        return `
            <div class="nav-tree-group tree-level-${depth} ${isChildActive ? 'has-active' : ''}" id="tree-group-${item.id}">
                <div class="nav-tree-header ${depth > 0 ? 'subfolder-header' : ''}" onclick="toggleTreeGroup('${item.id}', event)">
                    <svg class="tree-chevron ${isCollapsed ? 'collapsed' : ''}" id="chevron-${item.id}" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.7 13.7l5-5a1 1 0 000-1.4l-5-5a1 1 0 00-1.4 1.4L8.58 8l-4.3 4.3a1 1 0 001.42 1.4z"/>
                    </svg>
                    <span class="nav-item-icon">${item.icon || (depth > 0 ? '📁' : '🚀')}</span>
                    <span class="nav-item-label tree-folder-title" ${titleAction}>
                        ${escapeHtml(displayLabel)}
                    </span>
                    ${isTopProject ? `
                        <div class="nav-project-actions">
                            <button class="nav-act-btn" onclick="event.stopPropagation(); openProjectWorkspace('${escapeHtml(item.label)}', 'graph')" title="Grafo Neural">🔮</button>
                            <button class="nav-act-btn" onclick="event.stopPropagation(); openProjectWorkspace('${escapeHtml(item.label)}', 'settings')" title="Gerenciar Projeto">⚙️</button>
                        </div>
                    ` : ''}
                    <span class="nav-item-badge count" title="${count} arquivos">${count}</span>
                </div>
                <div class="nav-tree-children ${isCollapsed ? 'collapsed' : ''}" id="tree-children-${item.id}">
                    ${item.children.map(child => renderNavItem(child, depth + 1)).join('')}
                </div>
            </div>
        `;
    }

    let leafLabel = item.label || item.title || item.name || '';
    if (item.icon && leafLabel.startsWith(item.icon)) {
        leafLabel = leafLabel.slice(item.icon.length).trim();
    }

    return `
        <div class="nav-item nav-tree-child ${currentPath === item.path ? 'active' : ''}" data-path="${item.path}" onclick="navigateTo('${item.path}')" title="${escapeHtml(item.title || item.label)}">
            <span class="nav-item-icon">${item.icon || '📄'}</span>
            <span class="nav-item-label">${escapeHtml(leafLabel)}</span>
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
        if (!section.items || section.items.length === 0) continue;
        const badgeCount = section.badge !== undefined ? section.badge : section.items.length;
        const isChildActive = currentPath && isAnyChildActive(section, currentPath);
        const isCollapsed = (section.startCollapsed !== undefined ? section.startCollapsed : true) && !isChildActive;
        html += `
            <div class="nav-section nav-tree-group ${isChildActive ? 'has-active' : ''}" data-section="${section.id}" id="tree-group-sec_${section.id}">
                <div class="nav-section-header nav-tree-header" onclick="toggleSection('${section.id}')">
                    <svg class="tree-chevron ${isCollapsed ? 'collapsed' : ''}" id="chevron-sec_${section.id}" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.7 13.7l5-5a1 1 0 000-1.4l-5-5a1 1 0 00-1.4 1.4L8.58 8l-4.3 4.3a1 1 0 001.42 1.4z"/>
                    </svg>
                    <span class="nav-item-icon">${section.icon}</span>
                    <span class="nav-item-label tree-folder-title">${escapeHtml(section.label)}</span>
                    ${badgeCount !== undefined ? `<span class="nav-item-badge count">${badgeCount}</span>` : ''}
                </div>
                <div class="nav-section-items nav-tree-children ${isCollapsed ? 'collapsed' : ''}" id="section-${section.id}">
                    ${section.items.map(item => renderNavItem(item, 1)).join('')}
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

// ── Criador Interativo de ADR (Architecture Decision Record) ─
async function createNewDecisionRecord(projectName) {
    const projName = projectName || (currentProjectData ? currentProjectData.name : currentProject);
    if (!projName) return;

    const today = new Date().toISOString().split('T')[0];

    // Numeração sequencial determinística: nunca sobrescreve um ADR existente
    let existingDecisions = [];
    if (currentProjectData && currentProjectData.name === projName && Array.isArray(currentProjectData.decisions)) {
        existingDecisions = currentProjectData.decisions.map(d => d.name);
    } else if (isLocalEnvironment()) {
        try {
            const resDet = await fetch(`/api/projects/${encodeURIComponent(projName)}/details`);
            if (resDet.ok) {
                const det = await resDet.json();
                existingDecisions = (det.decisions || []).map(d => d.name);
            }
        } catch (e) {}
    }
    const maxAdrNum = existingDecisions.reduce((max, n) => {
        const m = /^(?:ADR-)?(\d+)/i.exec(n);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    const isFirstAdr = maxAdrNum === 0;
    const adrNum = String(maxAdrNum + 1).padStart(3, '0');
    const adrFileName = isFirstAdr ? '001-stack-inicial.md' : `${adrNum}-nova-decisao.md`;

    const nextAdrTemplate = `# ADR-${adrNum}: [Título da decisão]

> **Projeto**: ${projName}  
> **Data**: ${today}  
> **Status**: Proposta  

## Contexto
[Qual problema ou necessidade motivou esta decisão?]

## Decisão
[O que foi decidido?]

## Consequências
- **Positivas**: 
- **Trade-offs / Riscos**: 

## Alternativas Consideradas
- 
`;

    const defaultTemplate = !isFirstAdr ? nextAdrTemplate : `# ADR-001: Escolha da Stack e Padrões Iniciais de Arquitetura

> **Projeto**: ${projName}  
> **Data**: ${today}  
> **Status**: Aceita (Decidido)  

## Contexto
O projeto necessita de uma fundação tecnológica clara, modular e alinhada com as diretrizes do ecossistema AI Second Brain.
Precisamos garantir que qualquer agente de Inteligência Artificial ou desenvolvedor conheça os motivos das escolhas técnicas sem desconstruir o código legado.

## Decisão
Foi decidido adotar a stack e os padrões documentados em \`PROJECT.md\` e \`ARCHITECTURE.md\`.
Quaisquer decisões futuras que alterem bibliotecas essenciais, conexões de banco de dados ou provedores de IA devem ser registradas em novos ADRs numerados nesta mesma pasta.

## Consequências
- **Positivas**: Padronização técnica, contratos vivos respeitados por agentes de IA e previsibilidade do roadmap.
- **Trade-offs / Riscos**: Exige manutenção disciplinada do arquivo \`CURRENT_STATE.md\` e documentação de novos ADRs a cada grande mudança.

## Alternativas Consideradas
- **Desenvolvimento sem contratos**: Rejeitado por gerar alucinações em agentes de IA e perda de memória de arquitetura entre sessões.
`;

    // Abre o editor markdown direto para salvar
    openFileEditor(`projects/${projName}/DECISIONS/${adrFileName}`, defaultTemplate, async () => {
        showSecondBrainToast('⚖️ Decisão arquitetural registrada com sucesso no disco!');
        if (currentView === 'project-workspace') {
            await openProjectWorkspace(projName, 'overview');
        } else {
            renderDashboardProjects();
        }
    });
}
window.createNewDecisionRecord = createNewDecisionRecord;

// ── Explainer de Governança do Projeto ────────────
function showGovernanceExplainer(folderName, govPercent, hasProjectMd, hasCurrentState, hasArchitecture, hasDecisions) {
    const contracts = [
        { name: 'PROJECT.md', desc: 'Identidade, visão do produto, proposta de valor e stack técnica.', ok: hasProjectMd, weight: 25 },
        { name: 'CURRENT_STATE.md', desc: 'Status atual do desenvolvimento, backlog e próximos passos imediatos.', ok: hasCurrentState, weight: 25 },
        { name: 'ARCHITECTURE.md', desc: 'Desenho de arquitetura, contratos técnicos e fluxos do sistema.', ok: hasArchitecture, weight: 25 },
        { name: 'DECISIONS/ (ADRs)', desc: 'Registro formal de decisões técnicas tomadas (ex.: escolha de libs, banco, arquitetura).', ok: hasDecisions, weight: 25 }
    ];

    const listHtml = contracts.map(c => `
        <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; margin-bottom: 8px; border-radius: 8px; background: ${c.ok ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)'}; border: 1px solid ${c.ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.25)'};">
            <span style="font-size: 16px; line-height: 1;">${c.ok ? '✅' : '⚠️'}</span>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <strong style="color: ${c.ok ? '#34d399' : '#fbbf24'}; font-size: 13px; font-family: var(--font-mono, monospace);">${c.name}</strong>
                    <span style="font-size: 11px; font-weight: 700; color: ${c.ok ? '#10b981' : 'var(--text-tertiary)'};">+${c.weight}% (${c.ok ? 'Ativo' : 'Pendente'})</span>
                </div>
                <p style="margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${c.desc}</p>
            </div>
        </div>
    `).join('');

    const message = `
        <div style="text-align: left; font-size: 13px; line-height: 1.5;">
            <p style="margin-top: 0; color: var(--text-secondary);">
                A <strong>Governança de Arquitetura</strong> representa o nível de conformidade e clareza estrutural do projeto.
                Ela garante que agentes de Inteligência Artificial e desenvolvedores operem com <strong>contexto exato</strong>, sem alucinações e sem retrabalho.
            </p>
            <div style="margin: 14px 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary);">
                Composição do Score (${govPercent}% Conforme):
            </div>
            ${listHtml}
            ${!hasDecisions ? `
                <div style="margin-top: 14px; text-align: center;">
                    <button type="button" class="btn" onclick="resolveBrainConfirm(true); createNewDecisionRecord('${folderName}');" style="padding: 10px 20px; font-size: 12px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 8px; color: #fff; cursor: pointer; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); display: inline-flex; align-items: center; gap: 8px;">
                        <span>➕</span> Registrar Decisão Inicial (ADR-001) para 100%
                    </button>
                </div>
            ` : ''}
            <p style="margin-bottom: 0; margin-top: 12px; font-size: 12px; color: var(--text-tertiary); background: rgba(255, 255, 255, 0.04); padding: 8px 12px; border-radius: 6px;">
                💡 <em>Dica: As decisões são salvas em <code>projects/${folderName}/DECISIONS/</code> como Architecture Decision Records (ADRs).</em>
            </p>
        </div>
    `;

    showBrainConfirm({
        title: `Governança de ${folderName}`,
        badge: 'GOVERNANÇA & CONTRATOS VIVOS',
        icon: '🛡️',
        danger: false,
        singleButton: true,
        confirmText: 'Entendido',
        message: message
    });
}
window.showGovernanceExplainer = showGovernanceExplainer;

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

    const countBadge = document.getElementById('dashProjectsCountBadge');
    if (countBadge) {
        countBadge.textContent = projectsList.length;
    }

    if (projectsList.length === 0) {
        // Nenhum projeto conectado:
        slot.innerHTML = `
            <div class="dash-card status-card" onclick="openQuickstartWizard()" style="cursor: pointer; grid-column: 1 / -1; border: 1px dashed rgba(99, 102, 241, 0.45); padding: 32px;">
                <div class="status-indicator" style="background: var(--accent-primary); box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);"></div>
                <div class="card-content">
                    <h3 style="margin: 0 0 6px 0; font-size: 16px;">Nenhum Projeto Conectado</h3>
                    <p style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px;">O workspace está limpo e agnóstico. Use o Quickstart Studio para criar ou conectar um projeto agora mesmo.</p>
                    <span class="status-badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">
                        ✨ Clique aqui para iniciar o Quickstart de 3 minutos
                    </span>
                </div>
                <div class="card-icon" style="opacity: 0.8; font-size: 32px;">🚀</div>
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
        let statusClass = 'active';
        let statusColor = 'green';

        const contentLower = (proj.content || '').toLowerCase();
        if (contentLower.includes('em planejamento') || contentLower.includes('planejamento')) {
            statusBadge = 'Planejamento';
            statusClass = 'planning';
            statusColor = 'yellow';
        } else if (contentLower.includes('em conceituação') || contentLower.includes('conceituação') || contentLower.includes('ideia')) {
            statusBadge = 'Conceituação';
            statusClass = 'concept';
            statusColor = 'red';
        } else if (contentLower.includes('produção') || contentLower.includes('em produção')) {
            statusBadge = 'Produção';
            statusClass = 'active';
            statusColor = 'green';
        }

        let desc = 'Projeto arquitetado e governado pelos contratos do AI Second Brain.';
        const overviewMatch = (proj.content || '').match(/##\s+Visão Geral\s*\n+([^\n#]+)/i);
        if (overviewMatch && overviewMatch[1]) {
            desc = overviewMatch[1].trim();
        }

        let stack = 'Livre';
        const stackMatch = (proj.content || '').match(/-\s+\*\*Stack[^*]*\*\*:\s*([^\r\n]+)/i);
        if (stackMatch && stackMatch[1]) stack = stackMatch[1].trim();

        // Stack icon
        let stackIcon = '💻';
        const stackLower = stack.toLowerCase();
        if (stackLower.includes('node') || stackLower.includes('type') || stackLower.includes('ts') || stackLower.includes('js') || stackLower.includes('script')) {
            stackIcon = '⚡';
        } else if (stackLower.includes('python') || stackLower.includes('fastapi') || stackLower.includes('django') || stackLower.includes('flask')) {
            stackIcon = '🐍';
        } else if (stackLower.includes('react') || stackLower.includes('next') || stackLower.includes('vue') || stackLower.includes('angular')) {
            stackIcon = '⚛️';
        } else if (stackLower.includes('go') || stackLower.includes('golang')) {
            stackIcon = '🐹';
        } else if (stackLower.includes('rust')) {
            stackIcon = '🦀';
        } else if (stackLower.includes('c#') || stackLower.includes('.net') || stackLower.includes('csharp')) {
            stackIcon = '🎯';
        } else if (stackLower.includes('java') || stackLower.includes('kotlin')) {
            stackIcon = '☕';
        }

        // Estatísticas do projeto
        const projPrefix = `projects/${folderName}/`;
        const projFiles = files.filter(f => f.path.startsWith(projPrefix));
        const totalDocs = projFiles.length;

        // Labs de Pesquisa
        const researchFiles = projFiles.filter(f => f.path.toLowerCase().includes('/research/'));
        const researchSlugs = new Set();
        researchFiles.forEach(f => {
            const sub = f.path.substring((projPrefix + 'RESEARCH/').length);
            const labPart = sub.split('/')[0];
            if (labPart) researchSlugs.add(labPart.replace(/\.md$/i, ''));
        });
        const totalLabs = researchSlugs.size;

        // Contratos de Governança
        const hasProjectMd = projFiles.some(f => f.path.toLowerCase().endsWith('/project.md'));
        const hasCurrentState = projFiles.some(f => f.path.toLowerCase().endsWith('/current_state.md'));
        const hasArchitecture = projFiles.some(f => f.path.toLowerCase().endsWith('/architecture.md'));
        const decisionFiles = projFiles.filter(f => f.path.toLowerCase().includes('/decisions/') && f.path.toLowerCase().endsWith('.md') && !f.path.toLowerCase().endsWith('readme.md'));
        const hasDecisions = decisionFiles.length > 0 || projFiles.some(f => f.path.toLowerCase().includes('/decisions/'));

        const contractsFound = (hasProjectMd ? 1 : 0) + (hasCurrentState ? 1 : 0) + (hasArchitecture ? 1 : 0) + (hasDecisions ? 1 : 0);
        const govPercent = Math.round((contractsFound / 4) * 100);

        let govBarColor = 'linear-gradient(90deg, #6366f1, #10b981)';
        if (govPercent < 50) {
            govBarColor = 'linear-gradient(90deg, #f59e0b, #ef4444)';
        } else if (govPercent < 75) {
            govBarColor = 'linear-gradient(90deg, #6366f1, #06b6d4)';
        }

        html += `
            <div class="dash-card proj-dashboard-card" onclick="openProjectWorkspace('${folderName}')">
                <div>
                    <!-- Header (Apenas o nome do projeto e status, sem avatar) -->
                    <div class="proj-card-header">
                        <div class="proj-card-main-info">
                            <div class="proj-card-title-row">
                                <h3 class="proj-card-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
                                <span class="proj-status-chip ${statusClass}">
                                    <span class="proj-pulse-dot ${statusColor}"></span>
                                    ${statusBadge}
                                </span>
                            </div>
                            <div class="proj-card-sub-row">
                                <span class="proj-card-path">projects/${folderName}/</span>
                                <span class="proj-stack-chip" title="Stack de Tecnologia">
                                    <span>${stackIcon}</span> ${escapeHtml(stack)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Descrição -->
                    <p class="proj-card-desc" style="margin-top: 12px;" title="${escapeHtml(desc)}">
                        ${escapeHtml(desc)}
                    </p>
                </div>

                <!-- Barra de Governança com Explicação e Breakdown dos 4 Contratos -->
                <div class="proj-gov-container" onclick="event.stopPropagation(); showGovernanceExplainer('${folderName}', ${govPercent}, ${hasProjectMd}, ${hasCurrentState}, ${hasArchitecture}, ${hasDecisions})" style="cursor: pointer;" title="Clique para ver o detalhamento do cálculo de governança">
                    <div class="proj-gov-header">
                        <span class="proj-gov-label">
                            <span>🛡️</span> Governança de Arquitetura
                            <span class="proj-gov-info-btn" title="O que significa este percentual?">ℹ️</span>
                        </span>
                        <span class="proj-gov-val">${govPercent}% Conforme</span>
                    </div>
                    <div class="proj-gov-track">
                        <div class="proj-gov-fill" style="width: ${govPercent}%; background: ${govBarColor};"></div>
                    </div>
                    <!-- Pílulas dos 4 Contratos (+25% cada) -->
                    <div class="proj-gov-pills">
                        <span class="gov-pill ${hasProjectMd ? 'valid' : 'pending'}" onclick="event.stopPropagation(); ${hasProjectMd ? `navigateTo('projects/${folderName}/PROJECT.md')` : `initializeContract('PROJECT.md')`}" title="${hasProjectMd ? '✓ PROJECT.md ativo (Clique para visualizar)' : '⚠️ Clique para inicializar PROJECT.md'}">
                            ${hasProjectMd ? '✓' : '⚠️'} PROJECT
                        </span>
                        <span class="gov-pill ${hasCurrentState ? 'valid' : 'pending'}" onclick="event.stopPropagation(); ${hasCurrentState ? `navigateTo('projects/${folderName}/CURRENT_STATE.md')` : `initializeContract('CURRENT_STATE.md')`}" title="${hasCurrentState ? '✓ CURRENT_STATE.md ativo (Clique para visualizar)' : '⚠️ Clique para inicializar CURRENT_STATE.md'}">
                            ${hasCurrentState ? '✓' : '⚠️'} STATE
                        </span>
                        <span class="gov-pill ${hasArchitecture ? 'valid' : 'pending'}" onclick="event.stopPropagation(); ${hasArchitecture ? `navigateTo('projects/${folderName}/ARCHITECTURE.md')` : `initializeContract('ARCHITECTURE.md')`}" title="${hasArchitecture ? '✓ ARCHITECTURE.md ativo (Clique para visualizar)' : '⚠️ Clique para inicializar ARCHITECTURE.md'}">
                            ${hasArchitecture ? '✓' : '⚠️'} ARCH
                        </span>
                        <span class="gov-pill ${hasDecisions ? 'valid' : 'pending'}" onclick="event.stopPropagation(); ${hasDecisions ? `openProjectWorkspace('${folderName}', 'overview')` : `createNewDecisionRecord('${folderName}')`}" title="${hasDecisions ? '✓ Decisões registradas (Clique para ver no Workspace)' : '⚠️ Clique para registrar a primeira decisão (ADR-001) e bater 100%!'}">
                            ${hasDecisions ? '✓' : '➕'} DECISIONS
                        </span>
                    </div>
                </div>

                <!-- Quick Stats Strip -->
                <div class="proj-quick-stats">
                    <div class="pqs-chip" title="Documentos e especificações indexados">
                        <span>📄</span> <strong>${totalDocs}</strong> docs
                    </div>
                    <div class="pqs-chip" title="Pesquisas e Experimentos de IA">
                        <span>🔬</span> <strong>${totalLabs}</strong> ${totalLabs === 1 ? 'lab' : 'labs'}
                    </div>
                    <div class="pqs-chip" title="Contratos vivos (PROJECT, CURRENT_STATE, ARCHITECTURE, DECISIONS)">
                        <span>🛡️</span> <strong>${contractsFound}/4</strong> contratos
                    </div>
                </div>

                <!-- Ações Rápidas -->
                <div class="dash-card-actions" style="margin-top: 2px;">
                    <button class="btn-dash-act primary" onclick="event.stopPropagation(); openProjectWorkspace('${folderName}', 'overview')" title="Abrir Dashboard Completo">
                        🚀 Workspace
                    </button>
                    <button class="btn-dash-act neural-act" onclick="event.stopPropagation(); openProjectWorkspace('${folderName}', 'graph')" title="Explorar Grafo Neural 3D">
                        🔮 Grafo 3D
                    </button>
                    ${totalLabs > 0 ? `
                        <button class="btn-dash-act lab-act" onclick="event.stopPropagation(); openProjectWorkspace('${folderName}', 'research')" title="Ver Experimentos de Pesquisa">
                            🔬 Labs (${totalLabs})
                        </button>
                    ` : `
                        <button class="btn-dash-act" onclick="event.stopPropagation(); openProjectWorkspace('${folderName}', 'settings')" title="Configurar Projeto">
                            ⚙️ Gerenciar
                        </button>
                    `}
                </div>
            </div>
        `;
    });

    slot.innerHTML = html;
}

function toggleSection(sectionId) {
    const items = document.getElementById(`section-${sectionId}`);
    if (!items) return;
    const chevron = document.getElementById(`chevron-sec_${sectionId}`) || (items.previousElementSibling ? items.previousElementSibling.querySelector('.tree-chevron, .chevron') : null);

    if (items.classList.contains('collapsed')) {
        items.classList.remove('collapsed');
        if (chevron) chevron.classList.remove('collapsed');
    } else {
        items.classList.add('collapsed');
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

    // Se houver busca ativa no menu lateral, limpa o filtro e restaura a árvore completa canônica
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        const dropdown = document.getElementById('searchResultsDropdown');
        const clearBtn = document.getElementById('btnSidebarSearchClear');
        searchInput.value = '';
        if (dropdown) dropdown.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
        buildSidebar();
    }

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.path === path);
    });

    // Auto-expand all parent tree groups recursively if navigating to a nested item
    const activeItem = document.querySelector(`.nav-item[data-path="${path}"]`);
    if (activeItem) {
        let parentGroup = activeItem.closest('.nav-tree-group');
        while (parentGroup) {
            parentGroup.classList.add('has-active');
            const children = parentGroup.querySelector('.nav-tree-children');
            const chevron = parentGroup.querySelector('.tree-chevron');
            if (children && children.classList.contains('collapsed')) {
                children.classList.remove('collapsed');
                if (chevron) chevron.classList.remove('collapsed');
            }
            parentGroup = parentGroup.parentElement ? parentGroup.parentElement.closest('.nav-tree-group') : null;
        }
        try {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (_) {}
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

    if (path === 'solution-docs') {
        showSolutionDocs();
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
    document.getElementById('solutionDocsView')?.classList.remove('active');
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
        document.getElementById('solutionDocsView')?.classList.remove('active');
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

function showSolutionDocs() {
    currentView = 'docs';
    document.getElementById('dashboardOverlay')?.classList.remove('active');
    document.getElementById('graphView')?.classList.remove('active');
    document.getElementById('docView')?.classList.remove('active');
    document.getElementById('projectWorkspaceView')?.classList.remove('active');
    document.getElementById('viewToggle')?.classList.remove('active');

    const sdocs = document.getElementById('solutionDocsView');
    if (sdocs) {
        sdocs.classList.add('active');
        sdocs.scrollTop = 0;
    }
    const bodyScroll = document.getElementById('sdocBodyScroll');
    if (bodyScroll) {
        bodyScroll.scrollTop = 0;
    }

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.path === 'solution-docs');
    });

    updateBreadcrumbs([
        { label: '🧠 Visão Geral', path: 'dashboard' },
        { label: '📘 Documentação da Solução', path: 'solution-docs' }
    ]);

    // Setup scroll spy for TOC highlighting
    setupDocScrollSpy();
}

let _docScrollSpyInitialized = false;
function setupDocScrollSpy() {
    if (_docScrollSpyInitialized) return;
    const bodyScroll = document.getElementById('sdocBodyScroll');
    const sdocs = document.getElementById('solutionDocsView');
    const scrollTarget = (sdocs && sdocs.scrollHeight > sdocs.clientHeight) ? sdocs : bodyScroll;
    if (!scrollTarget) return;

    _docScrollSpyInitialized = true;
    scrollTarget.addEventListener('scroll', () => {
        const chapters = document.querySelectorAll('.sdoc-chapter');
        const tocLinks = document.querySelectorAll('.sdoc-toc-link');
        if (!chapters.length || !tocLinks.length) return;

        let currentCapId = '';
        chapters.forEach(ch => {
            const rect = ch.getBoundingClientRect();
            if (rect.top <= 200 && rect.bottom >= 80) {
                currentCapId = ch.id;
            }
        });

        if (currentCapId) {
            tocLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${currentCapId}`);
            });
        }
    }, { passive: true });
}

function scrollToDocCap(capId, event) {
    if (event) event.preventDefault();
    const target = document.getElementById(capId);
    if (!target) return;

    // Highlight active link in TOC
    document.querySelectorAll('.sdoc-toc-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${capId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Smooth scroll inside sdocBodyScroll, solutionDocsView or document
    const bodyScroll = document.getElementById('sdocBodyScroll');
    const sdocs = document.getElementById('solutionDocsView');
    
    if (bodyScroll && bodyScroll.scrollHeight > bodyScroll.clientHeight) {
        const topPos = target.offsetTop - bodyScroll.offsetTop - 16;
        bodyScroll.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
    } else if (sdocs && sdocs.scrollHeight > sdocs.clientHeight) {
        const topPos = target.offsetTop - sdocs.offsetTop - 16;
        sdocs.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
    } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showDynamicDocument(file) {
    currentView = 'doc';
    document.getElementById('dashboardOverlay')?.classList.remove('active');
    document.getElementById('graphView')?.classList.remove('active');
    document.getElementById('docView')?.classList.add('active');
    document.getElementById('projectWorkspaceView')?.classList.remove('active');
    document.getElementById('solutionDocsView')?.classList.remove('active');
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
    document.getElementById('dashboardOverlay')?.classList.remove('active');
    document.getElementById('graphView')?.classList.remove('active');
    document.getElementById('docView')?.classList.add('active');
    document.getElementById('projectWorkspaceView')?.classList.remove('active');
    document.getElementById('solutionDocsView')?.classList.remove('active');
    document.getElementById('viewToggle')?.classList.remove('active');

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

// ── Dynamic Graph Category & Color Customization Panel ─────────
function setupGraphCategoryPanel(opts) {
    const wrap = document.getElementById(opts.wrapId);
    const trigger = document.getElementById(opts.triggerId);
    const triggerLabel = document.getElementById(opts.triggerLabelId);
    const triggerBadge = document.getElementById(opts.triggerBadgeId);
    const dropdown = document.getElementById(opts.dropdownId);
    const list = document.getElementById(opts.listId);
    const resetBtn = document.getElementById(opts.resetBtnId);
    const closeBtn = document.getElementById(opts.closeBtnId);
    const searchInput = document.getElementById(opts.searchInputId);
    const searchBadge = document.getElementById(opts.searchBadgeId);
    const countEl = document.getElementById(opts.nodeCountElId);
    const getGraph = opts.getGraphInstance;

    if (!wrap || !trigger || !dropdown || !list) return;

    const g = (typeof getGraph === 'function') ? getGraph() : getGraph;
    if (!g || typeof g.getDynamicCategories !== 'function') return;

    const { totalDocs, categories } = g.getDynamicCategories();

    // Toggle dropdown
    trigger.onclick = (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display !== 'none';
        dropdown.style.display = isOpen ? 'none' : 'flex';
        wrap.classList.toggle('open', !isOpen);
    };

    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display = 'none';
            wrap.classList.remove('open');
        };
    }

    // Fechar ao clicar fora
    if (!wrap._docClickHandler) {
        wrap._docClickHandler = (e) => {
            if (!wrap.contains(e.target)) {
                dropdown.style.display = 'none';
                wrap.classList.remove('open');
            }
        };
        document.addEventListener('click', wrap._docClickHandler);
    }

    // Botão Resetar Cores
    if (resetBtn) {
        resetBtn.onclick = (e) => {
            e.stopPropagation();
            try {
                if (window.resetToDefaultColors) {
                    window.resetToDefaultColors();
                } else {
                    localStorage.removeItem('ai_second_brain_graph_colors');
                }
                const palette = window.HIERARCHY_PALETTE || {};
                categories.forEach(cat => {
                    const defaultFill = (palette[cat.key] && palette[cat.key].fill) || '#8b5cf6';
                    g.updateGroupColor(cat.key, defaultFill);
                    cat.color = defaultFill;
                });
                renderList();
                showToast('🎨 Cores restauradas para o padrão original!', 'success', 2500);
            } catch (err) {}
        };
    }

    function renderList() {
        const activeKey = g.currentCategory || 'all';

        // Atualiza trigger
        if (activeKey !== 'all') {
            const activeCat = categories.find(c => c.key === activeKey);
            trigger.classList.add('is-filtering');
            if (triggerLabel) triggerLabel.textContent = activeCat ? `${activeCat.icon} ${activeCat.label}` : 'Filtrado';
            if (triggerBadge) triggerBadge.textContent = activeCat ? activeCat.docCount : 0;
        } else {
            trigger.classList.remove('is-filtering');
            if (triggerLabel) triggerLabel.textContent = 'Camadas';
            if (triggerBadge) triggerBadge.textContent = categories.length;
        }

        // Gera HTML
        let html = `
            <div class="cat-item ${activeKey === 'all' ? 'is-active' : ''}" data-key="all">
                <div class="cat-item-left">
                    <span class="cat-item-icon">🌌</span>
                    <span class="cat-item-name">Todos os Documentos</span>
                </div>
                <span class="cat-item-count">${totalDocs}</span>
            </div>
        `;

        categories.forEach(cat => {
            const isActive = activeKey === cat.key;
            const curColor = (g.groupColors && g.groupColors[cat.key] && g.groupColors[cat.key].fill) || cat.color;

            html += `
                <div class="cat-item ${isActive ? 'is-active' : ''}" data-key="${cat.key}">
                    <div class="cat-item-left">
                        <div class="cat-item-color-box" title="Clique para trocar a cor desta camada">
                            <input type="color" class="cat-color-input" value="${curColor}" data-group="${cat.key}">
                            <span class="cat-color-swatch" style="background-color: ${curColor}; box-shadow: 0 0 8px ${curColor}55;"></span>
                        </div>
                        <span class="cat-item-icon">${cat.icon}</span>
                        <span class="cat-item-name">${cat.label}</span>
                    </div>
                    <span class="cat-item-count">${cat.docCount}</span>
                </div>
            `;
        });

        list.innerHTML = html;

        // Binds de hover e clique para filtrar
        list.querySelectorAll('.cat-item').forEach(itemEl => {
            const key = itemEl.getAttribute('data-key');

            itemEl.onmouseenter = () => {
                if (key !== 'all') g.highlightCategory(key);
            };
            itemEl.onmouseleave = () => {
                g.clearCategoryHighlight();
            };

            itemEl.onclick = (e) => {
                if (e.target.closest('.cat-item-color-box')) return;

                const nextKey = (g.currentCategory === key || key === 'all') ? null : key;
                const filterRes = g.setCategoryFilter(nextKey);

                renderList();

                if (filterRes.isFiltering) {
                    if (searchBadge) {
                        searchBadge.textContent = `${filterRes.matchedCount} de ${filterRes.totalCount}`;
                        searchBadge.style.display = 'inline-block';
                    }
                    if (countEl) countEl.textContent = `${filterRes.matchedCount} de ${filterRes.totalCount}`;
                } else {
                    if (searchBadge && (!searchInput || !searchInput.value.trim())) {
                        searchBadge.style.display = 'none';
                    }
                    if (countEl) countEl.textContent = `${filterRes.totalCount}`;
                }
            };
        });

        // Binds do seletor de cor interativo
        list.querySelectorAll('.cat-color-input').forEach(colorInput => {
            const groupKey = colorInput.getAttribute('data-group');
            const swatch = colorInput.nextElementSibling;

            const handleColorChange = (e) => {
                e.stopPropagation();
                const newHex = colorInput.value;
                if (swatch) {
                    swatch.style.backgroundColor = newHex;
                    swatch.style.boxShadow = `0 0 8px ${newHex}55`;
                }

                const cat = categories.find(c => c.key === groupKey);
                if (cat) cat.color = newHex;
                if (window.HIERARCHY_PALETTE && window.HIERARCHY_PALETTE[groupKey]) {
                    window.HIERARCHY_PALETTE[groupKey].fill = newHex;
                    window.HIERARCHY_PALETTE[groupKey].stroke = newHex;
                }

                g.updateGroupColor(groupKey, newHex);

                try {
                    const saved = JSON.parse(localStorage.getItem('ai_second_brain_graph_colors') || '{}');
                    saved[groupKey] = newHex;
                    localStorage.setItem('ai_second_brain_graph_colors', JSON.stringify(saved));
                } catch (err) {}
            };

            colorInput.oninput = handleColorChange;
            colorInput.onchange = handleColorChange;
        });
    }

    renderList();
}

function initGraph() {
    const canvas = document.getElementById('graphCanvas');
    const tooltip = document.getElementById('graphTooltip');
    if (!canvas) return;

    graph = new BrainGraph(canvas, tooltip);

    let nodes = (window.VAULT && window.VAULT.data && window.VAULT.data.graphNodes) || [];
    let edges = (window.VAULT && window.VAULT.data && window.VAULT.data.graphEdges) || [];
    let colors = (window.VAULT && window.VAULT.data && window.VAULT.data.groupColors) || {};

    const allFiles = (window.VAULT && window.VAULT.data && window.VAULT.data.files) || [];
    if (typeof window.buildHierarchyGraph === 'function' && allFiles.length > 0) {
        const hg = window.buildHierarchyGraph(allFiles, {
            rootId: 'brain',
            rootLabel: 'AI Second Brain',
            rootIcon: '🧠',
            fileLabel: 'title'
        });
        nodes = hg.nodes;
        edges = hg.edges;
        colors = hg.colors;
    }

    graph.loadData(nodes, edges, colors);

    // Inicializa painel dinâmico de categorias e cores
    setupGraphCategoryPanel({
        wrapId: 'graphCatPanelWrap',
        triggerId: 'graphCatTrigger',
        triggerLabelId: 'graphCatTriggerLabel',
        triggerBadgeId: 'graphCatTriggerBadge',
        dropdownId: 'graphCatDropdown',
        listId: 'graphCatList',
        resetBtnId: 'btnGraphResetColors',
        closeBtnId: 'btnGraphCloseCat',
        searchInputId: 'graphSearchInput',
        searchBadgeId: 'graphSearchBadge',
        nodeCountElId: 'hudNodeCount',
        getGraphInstance: () => graph
    });

    if (typeof updateNodeStyleUI === 'function') {
        updateNodeStyleUI(graph.nodeStyle);
    }

    // Update HUD Node Count
    const nodeCountEl = document.getElementById('hudNodeCount');
    if (nodeCountEl) {
        nodeCountEl.textContent = nodes.length;
    }

    // Auto-órbita ativada por padrão
    const orbitBtn = document.getElementById('btnAutoOrbit');
    if (orbitBtn) orbitBtn.classList.add('active');
    const rotEl = document.getElementById('hudRotationPill');
    if (rotEl) {
        rotEl.textContent = '🪐 Em Órbita';
        rotEl.style.color = '#38bdf8';
    }

    // Camera update callback for HUD
    graph.onCameraChange = (state) => {
        const zoomEl = document.getElementById('hudZoomPill');
        const rEl = document.getElementById('hudRotationPill');
        const oBtn = document.getElementById('btnAutoOrbit');

        if (zoomEl) zoomEl.textContent = `🔍 ${state.zoomPercent}%`;
        const isOrbit = Boolean(state.autoRotate || state.autoOrbit);
        if (rEl) {
            if (isOrbit) {
                rEl.textContent = '🪐 Em Órbita';
                rEl.style.color = '#38bdf8';
            } else {
                rEl.textContent = '🌍 3D Planeta';
                rEl.style.color = '';
            }
        }
        if (oBtn) oBtn.classList.toggle('active', isOrbit);
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

    // Double click: open document or focus folder
    graph.onNodeDblClick = (node) => {
        if (!node) return;
        if (node.isFolder) {
            graph.focusNode(node);
            return;
        }
        if (node.path) {
            navigateTo(node.path);
        } else if (node.id) {
            navigateTo(node.id);
        }
    };

    graph.start();
}

// ── Graph Fullscreen Helpers ───────────────────────
function setupFullscreenButton(btnId, containerEl, getGraphInstance) {
    const btn = document.getElementById(btnId);
    if (!btn || !containerEl) return;

    btn.onclick = () => {
        const isFs = document.fullscreenElement === containerEl || containerEl.classList.contains('is-fullscreen');
        if (isFs) {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
            containerEl.classList.remove('is-fullscreen');
            btn.classList.remove('fullscreen-active');
        } else {
            if (containerEl.requestFullscreen) {
                containerEl.requestFullscreen().catch(() => {
                    containerEl.classList.add('is-fullscreen');
                    btn.classList.add('fullscreen-active');
                });
            } else {
                containerEl.classList.add('is-fullscreen');
                btn.classList.add('fullscreen-active');
            }
        }
        setTimeout(() => {
            const g = (typeof getGraphInstance === 'function') ? getGraphInstance() : getGraphInstance;
            if (g && typeof g.resize === 'function') g.resize();
        }, 100);
    };
}

// Escuta mudanças de fullscreen para sincronizar ícones e redimensionar Three.js
document.addEventListener('fullscreenchange', () => {
    const fsEl = document.fullscreenElement;
    const globalView = document.getElementById('graphView');
    const pwWrap = document.querySelector('.pw-graph-wrapper');
    const btnFs = document.getElementById('btnFullscreen');
    const btnPwFs = document.getElementById('btnPwFullscreen');

    if (btnFs) btnFs.classList.toggle('fullscreen-active', fsEl === globalView);
    if (btnPwFs) btnPwFs.classList.toggle('fullscreen-active', fsEl === pwWrap);

    setTimeout(() => {
        if (graph && typeof graph.resize === 'function') graph.resize();
        if (projectGraph && typeof projectGraph.resize === 'function') projectGraph.resize();
    }, 80);
});

// ── Graph Real-time Document Search Helper ────────
function setupGraphSearch(inputId, clearBtnId, badgeId, countElId, getGraphInstance) {
    const input = document.getElementById(inputId);
    const clearBtn = document.getElementById(clearBtnId);
    const badge = document.getElementById(badgeId);
    const countEl = document.getElementById(countElId);

    if (!input) return;

    const performFilter = () => {
        const g = (typeof getGraphInstance === 'function') ? getGraphInstance() : getGraphInstance;
        if (!g || typeof g.filterNodes !== 'function') return;

        const val = input.value || '';
        const hasText = val.trim().length > 0;

        if (clearBtn) clearBtn.style.display = hasText ? 'flex' : 'none';

        const res = g.filterNodes(val);

        if (res.isFiltering) {
            if (badge) {
                badge.textContent = `${res.matchedCount} encontrado${res.matchedCount === 1 ? '' : 's'}`;
                badge.style.display = 'inline-block';
            }
            if (countEl) {
                countEl.textContent = `${res.matchedCount} de ${res.totalCount}`;
            }
        } else {
            if (badge) badge.style.display = 'none';
            if (countEl) {
                countEl.textContent = `${res.totalCount}`;
            }
        }
    };

    input.addEventListener('input', performFilter);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.value = '';
            performFilter();
            input.blur();
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            performFilter();
            input.focus();
        });
    }
}

function refreshApp() {
    buildSidebar();
    buildStats();
    renderDashboardProjects();

    if (graph) {
        let nodes = (window.VAULT && window.VAULT.data && window.VAULT.data.graphNodes) || [];
        let edges = (window.VAULT && window.VAULT.data && window.VAULT.data.graphEdges) || [];
        let colors = (window.VAULT && window.VAULT.data && window.VAULT.data.groupColors) || {};

        const allFiles = (window.VAULT && window.VAULT.data && window.VAULT.data.files) || [];
        if (typeof window.buildHierarchyGraph === 'function' && allFiles.length > 0) {
            const hg = window.buildHierarchyGraph(allFiles, {
                rootId: 'brain',
                rootLabel: 'AI Second Brain',
                rootIcon: '🧠',
                fileLabel: 'title'
            });
            nodes = hg.nodes;
            edges = hg.edges;
            colors = hg.colors;
        }

        graph.loadData(nodes, edges, colors);

        setupGraphCategoryPanel({
            wrapId: 'graphCatPanelWrap',
            triggerId: 'graphCatTrigger',
            triggerLabelId: 'graphCatTriggerLabel',
            triggerBadgeId: 'graphCatTriggerBadge',
            dropdownId: 'graphCatDropdown',
            listId: 'graphCatList',
            resetBtnId: 'btnGraphResetColors',
            closeBtnId: 'btnGraphCloseCat',
            searchInputId: 'graphSearchInput',
            searchBadgeId: 'graphSearchBadge',
            nodeCountElId: 'hudNodeCount',
            getGraphInstance: () => graph
        });

        const nodeCountEl = document.getElementById('hudNodeCount');
        if (nodeCountEl) nodeCountEl.textContent = nodes.length;
    }

    if (currentPath && currentView === 'doc') {
        navigateTo(currentPath);
    }
}

// ── Search & Filters ──────────────────────────────
function clearSidebarFilter() {
    const searchInput = document.getElementById('searchInput');
    const dropdown = document.getElementById('searchResultsDropdown');
    const clearBtn = document.getElementById('btnSidebarSearchClear');

    if (searchInput) searchInput.value = '';
    if (dropdown) dropdown.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';

    // Reconstroi completamente a barra lateral no seu formato original e estruturado
    buildSidebar();

    // Se houver um documento ativo, garante destaque e expansão das pastas ancestrais
    if (currentPath) {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.path === currentPath);
        });
        const activeItem = document.querySelector(`.nav-item[data-path="${currentPath}"]`);
        if (activeItem) {
            let parentGroup = activeItem.closest('.nav-tree-group');
            while (parentGroup) {
                parentGroup.classList.add('has-active');
                const children = parentGroup.querySelector('.nav-tree-children');
                const chevron = parentGroup.querySelector('.tree-chevron');
                if (children && children.classList.contains('collapsed')) {
                    children.classList.remove('collapsed');
                    if (chevron) chevron.classList.remove('collapsed');
                }
                parentGroup = parentGroup.parentElement ? parentGroup.parentElement.closest('.nav-tree-group') : null;
            }
        }
    }
}
window.clearSidebarFilter = clearSidebarFilter;

function onSearchResultClick(path) {
    clearSidebarFilter();
    navigateTo(path);
}
window.onSearchResultClick = onSearchResultClick;

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const clearBtn = document.getElementById('btnSidebarSearchClear');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearSidebarFilter();
            searchInput.focus();
        });
    }

    let dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'searchResultsDropdown';
        dropdown.className = 'search-dropdown';
        searchInput.parentElement.parentElement.appendChild(dropdown);
    }

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearSidebarFilter();
            searchInput.blur();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        if (!query) {
            clearSidebarFilter();
            return;
        }

        if (clearBtn) clearBtn.style.display = 'flex';
        filterSidebar(query.toLowerCase());

        const results = window.VAULT ? window.VAULT.search(query) : [];
        if (results.length === 0) {
            dropdown.innerHTML = `<div style="padding: 12px; color: var(--text-tertiary); font-size: 13px;">Nenhum arquivo encontrado para "${escapeHtml(query)}"</div>`;
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = results.map(r => `
            <div class="search-result-item" onclick="onSearchResultClick('${escapeHtml(r.file.path)}')">
                <div class="search-result-title">${r.file.icon || '📄'} ${escapeHtml(r.file.title)}</div>
                <div class="search-result-path">${escapeHtml(r.file.path)}</div>
                <div class="search-result-snippet">${r.snippet}</div>
            </div>
        `).join('');
        dropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target) && (!clearBtn || !clearBtn.contains(e.target))) {
            dropdown.style.display = 'none';
        }
    });
}

function filterSidebar(query) {
    if (!query) {
        clearSidebarFilter();
        return;
    }

    const clearBtn = document.getElementById('btnSidebarSearchClear');
    if (clearBtn) clearBtn.style.display = 'flex';

    // 1. Filtra itens folhas (arquivos navegáveis)
    const leafItems = document.querySelectorAll('#sidebarNav .nav-item:not(.nav-tree-header)');
    leafItems.forEach(item => {
        const label = (item.querySelector('.nav-item-label')?.textContent || item.textContent || '').toLowerCase();
        const match = label.includes(query);
        item.style.display = match ? '' : 'none';
    });

    // 2. Filtra grupos em árvore de baixo para cima (maior profundidade primeiro)
    const treeGroups = Array.from(document.querySelectorAll('#sidebarNav .nav-tree-group'));
    treeGroups.sort((a, b) => {
        const depthA = parseInt((a.className.match(/tree-level-(\d+)/) || [0, 0])[1], 10) || 0;
        const depthB = parseInt((b.className.match(/tree-level-(\d+)/) || [0, 0])[1], 10) || 0;
        return depthB - depthA;
    });

    treeGroups.forEach(group => {
        const headerLabel = (group.querySelector(':scope > .nav-tree-header .nav-item-label')?.textContent || '').toLowerCase();
        const headerMatch = headerLabel.includes(query);

        // Verifica se há nós filhos (arquivos ou subgrupos) visíveis
        const hasVisibleChild = Array.from(group.querySelectorAll(':scope > .nav-tree-children > .nav-item, :scope > .nav-tree-children > .nav-tree-group'))
            .some(el => el.style.display !== 'none');

        const hasVisible = headerMatch || hasVisibleChild;

        if (headerMatch) {
            // Se o nome da pasta corresponde à busca, exibe seus itens filhos
            group.querySelectorAll('.nav-item, .nav-tree-group').forEach(el => el.style.display = '');
        }

        group.style.display = hasVisible ? '' : 'none';

        if (hasVisible) {
            const childrenContainer = group.querySelector(':scope > .nav-tree-children');
            const chevron = group.querySelector(':scope > .nav-tree-header .tree-chevron');
            if (childrenContainer) childrenContainer.classList.remove('collapsed');
            if (chevron) chevron.classList.remove('collapsed');
        }
    });

    // 3. Filtra seções principais de governança (.nav-section)
    const sections = document.querySelectorAll('#sidebarNav .nav-section');
    sections.forEach(sec => {
        const hasVisible = Array.from(sec.querySelectorAll('.nav-item, .nav-tree-group'))
            .some(el => el.style.display !== 'none');
        sec.style.display = hasVisible ? '' : 'none';
        if (hasVisible) {
            const items = sec.querySelector('.nav-section-items');
            const chevron = sec.querySelector('.tree-chevron, .chevron');
            if (items) items.classList.remove('collapsed');
            if (chevron) chevron.classList.remove('collapsed');
        }
    });

    // 4. Cabeçalho de projetos e divisores
    const projectsSec = document.getElementById('section-projects');
    const projectsVisible = projectsSec && Array.from(projectsSec.querySelectorAll('.nav-tree-group, .nav-item'))
        .some(el => el.style.display !== 'none');
    if (projectsSec) projectsSec.style.display = projectsVisible ? '' : 'none';

    const worldHeader = document.querySelector('.sidebar-world-header');
    if (worldHeader) worldHeader.style.display = projectsVisible ? '' : 'none';

    const divider = document.querySelector('.sidebar-divider');
    const frameworkVisible = Array.from(sections).some(s => s.style.display !== 'none');
    if (divider) divider.style.display = frameworkVisible ? '' : 'none';
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

    // Fullscreen do Grafo Global
    setupFullscreenButton('btnFullscreen', document.getElementById('graphView'), () => graph);

    // Pesquisa de documentos em tempo real no Grafo Global
    setupGraphSearch('graphSearchInput', 'btnGraphSearchClear', 'graphSearchBadge', 'hudNodeCount', () => graph);

    // Node Style Toggle (Esferas vs Neurônios)
    function updateNodeStyleUI(style) {
        const isNeuron = style === 'neuron';
        const iconEl = document.getElementById('nodeStyleIcon');
        const pwIconEl = document.getElementById('pwNodeStyleIcon');
        const btn = document.getElementById('btnToggleNodeStyle');
        const pwBtn = document.getElementById('btnPwToggleNodeStyle');

        if (iconEl) iconEl.textContent = isNeuron ? '🧠' : '🪐';
        if (pwIconEl) pwIconEl.textContent = isNeuron ? '🧠' : '🪐';
        if (btn) btn.title = isNeuron ? 'Estilo atual: 🧠 Neurônios (clique para Esferas)' : 'Estilo atual: 🪐 Esferas (clique para Neurônios)';
        if (pwBtn) pwBtn.title = isNeuron ? 'Estilo atual: 🧠 Neurônios (clique para Esferas)' : 'Estilo atual: 🪐 Esferas (clique para Neurônios)';
    }
    window.updateNodeStyleUI = updateNodeStyleUI;

    const btnToggleNodeStyle = document.getElementById('btnToggleNodeStyle');
    if (btnToggleNodeStyle) {
        btnToggleNodeStyle.addEventListener('click', () => {
            if (graph) {
                const next = graph.toggleNodeStyle();
                if (projectGraph) projectGraph.setNodeStyle(next);
                updateNodeStyleUI(next);
            }
        });
    }

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

        // Nunca interceptar teclas enquanto o usuário digita em qualquer campo editável
        // (pesquisa do grafo, editor Markdown, formulários) ou compõe acentos (dead keys / IME)
        const ae = document.activeElement;
        const isEditable = ae && (
            ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable
        );
        if (isEditable || e.isComposing || e.key === 'Dead' || e.keyCode === 229) {
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
            } else if (e.key.toLowerCase() === 'n') {
                e.preventDefault();
                let next = 'sphere';
                if (graph) {
                    next = graph.toggleNodeStyle();
                    if (projectGraph) projectGraph.setNodeStyle(next);
                } else if (projectGraph) {
                    next = projectGraph.toggleNodeStyle();
                }
                updateNodeStyleUI(next);
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
                const stackInput = document.getElementById('qsNewStack');
                if (stackInput) {
                    stackInput.value = stackVal;
                    if (stackVal === 'Livre / Multi-stack') {
                        stackInput.focus();
                        stackInput.select();
                    }
                }
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
    const initGitCheckbox = document.getElementById('qsNewInitGit');

    const name = nameInput ? nameInput.value.trim() : '';
    const stack = stackInput ? stackInput.value.trim() : 'Node.js / TypeScript';
    const desc = descInput ? descInput.value.trim() : '';
    const initGit = initGitCheckbox ? initGitCheckbox.checked : true;

    if (!name) {
        alert('Por favor, digite um nome para o projeto.');
        return;
    }

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('criar projetos no disco rígido');
        return;
    }

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="status-dot snapshot" style="margin-right:6px"></span> Criando projeto com IA...';

    try {
        const res = await fetch('/api/projects/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, stack, description: desc, initGit })
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

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('vincular repositórios locais do seu computador');
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
    document.getElementById('solutionDocsView')?.classList.remove('active');
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

        // Atualiza contador de pesquisas no badge da aba
        fetch(`/api/projects/${encodeURIComponent(projectName)}/research`)
            .then(r => r.json())
            .then(data => {
                const badge = document.getElementById('pwResearchTabBadge');
                if (badge && data && data.researches) {
                    badge.textContent = data.researches.length;
                    badge.style.display = data.researches.length > 0 ? 'inline-block' : 'none';
                }
            })
            .catch(() => {});

        switchProjectTab(defaultTab);

    } catch (err) {
        // Modo offline (index.html aberto via file:// ou servidor indisponível):
        // monta os dados mínimos do projeto a partir do snapshot embutido, para o grafo funcionar.
        try {
            const snap = ((window.VAULT && window.VAULT.data && window.VAULT.data.files) || [])
                .filter(f => f.path && f.path.startsWith(`projects/${projectName}/`));
            if (snap.length) {
                console.warn('Backend indisponível — usando snapshot embutido do projeto:', projectName);
                currentProjectData = {
                    name: projectName, realPath: 'Modo offline (snapshot embutido)', isJunction: false,
                    stack: 'Livre', status: 'Offline', decisions: [], sessions: [], sessionsCount: 0,
                    governanceFiles: [], missingContracts: [], memorySizeKb: 0, decisionsCount: 0,
                    archivedCount: 0, totalProjectFiles: snap.length, projectMd: null, currentStateMd: null
                };
                if (titleEl) titleEl.textContent = projectName;
                if (pathEl) pathEl.textContent = currentProjectData.realPath;
                if (badgeType) badgeType.textContent = 'Greenfield 🚀 (Offline)';
                if (badgeStack) badgeStack.textContent = 'Livre';
                if (badgeStatus) badgeStatus.textContent = 'Offline';
                const openDocBtn = document.getElementById('btnPwOpenDoc');
                if (openDocBtn) openDocBtn.onclick = () => navigateTo(`projects/${projectName}/PROJECT.md`);
                switchProjectTab(defaultTab);
                return;
            }
        } catch (offlineErr) {
            console.error('Falha no modo offline do projeto:', offlineErr);
        }
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
        'research': 'pwPaneResearch',
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
        'research': '🔬 Research Lab',
        'memory': 'Memória & Saúde',
        'graph': 'Grafo Neural',
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
    if (tabId === 'research') renderProjectResearchTab();
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
        const stepText = nextSteps[index];
        const ok = await showBrainConfirm({
            title: 'Excluir Próximo Passo',
            badge: '🎯 ROADMAP &middot; EXCLUSÃO',
            icon: '🗑️',
            message: `Tem certeza que deseja remover este próximo passo do roadmap?<br><br><em>"${escapeHtml(stepText)}"</em>`,
            confirmText: 'Excluir Passo',
            cancelText: 'Cancelar',
            danger: true
        });
        if (!ok) return;

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
        const itemText = definedItems[index];
        const ok = await showBrainConfirm({
            title: 'Excluir Item Definido',
            badge: '✓ CHECKLIST &middot; EXCLUSÃO',
            icon: '🗑️',
            message: `Tem certeza que deseja remover este item concluído?<br><br><em>"${escapeHtml(itemText)}"</em>`,
            confirmText: 'Excluir Item',
            cancelText: 'Cancelar',
            danger: true
        });
        if (!ok) return;

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

                        <!-- Seção de Decisões Arquiteturais (ADRs) -->
                        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
                                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em;">
                                    Decisões Arquiteturais / ADRs (${(d.decisions || []).length})
                                </span>
                                <button type="button" class="btn-gov create" onclick="createNewDecisionRecord('${d.name}')" style="font-size: 10px; padding: 3px 8px;">
                                    + Nova Decisão (ADR)
                                </button>
                            </div>
                            <div class="pw-gov-artifacts">
                                ${(d.decisions || []).length === 0 ? `
                                    <div class="pw-gov-chip-missing">
                                        <div class="pw-gov-chip-left">
                                            <span class="pw-gov-chip-title" style="color:var(--text-secondary);">⚖️ Nenhuma decisão registrada</span>
                                            <span class="pw-gov-chip-sub">projects/${d.name}/DECISIONS/</span>
                                            <span class="pw-gov-chip-badge" style="color:#fbbf24;">Pendente (+25%)</span>
                                        </div>
                                        <div class="pw-gov-chip-actions">
                                            <button type="button" class="btn-gov create" onclick="createNewDecisionRecord('${d.name}')">
                                                + Registrar Decisão (ADR-001)
                                            </button>
                                        </div>
                                    </div>
                                ` : (d.decisions || []).map(dec => `
                                    <div class="pw-gov-chip">
                                        <div class="pw-gov-chip-left">
                                            <span class="pw-gov-chip-title">⚖️ ${dec.name}</span>
                                            <span class="pw-gov-chip-sub">(Decisão Arquitetural)</span>
                                            <span class="pw-gov-chip-badge">${(dec.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <div class="pw-gov-chip-actions">
                                            <button type="button" class="btn-gov" onclick="navigateTo('projects/${d.name}/DECISIONS/${dec.name}')">👁️ Ver</button>
                                            <button type="button" class="btn-gov primary" onclick="openFileEditor('projects/${d.name}/DECISIONS/${dec.name}', null, () => openProjectWorkspace('${d.name}', 'overview'))">✏️ Editar</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Seção de Pontes de Contexto para IDEs (Agnosticidade Real) -->
                        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                                <div>
                                    <div style="display:flex; align-items:center; gap: 6px;">
                                        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #38bdf8; letter-spacing: 0.05em;">
                                            🔌 Pontes de IA para IDEs (.cursorrules, CLAUDE.md, etc.)
                                        </span>
                                        <button type="button" class="ai-engine-help-btn mini" onclick="openAiEngineHelpModal()" title="Como funcionam as pontes de IA no disco?">?</button>
                                    </div>
                                    <span style="font-size: 10px; color: var(--text-tertiary); display: block; margin-top: 2px;">
                                        Conecta este projeto à sua IDE para que o agente leia os contratos automaticamente
                                    </span>
                                </div>
                                <div style="display:flex; gap:6px;">
                                    <button type="button" class="btn-gov create" id="pwContextualBridgeBtn" onclick="generateAiBridge('${d.name}', getSelectedAiEngine())" style="font-size: 10px; padding: 4px 10px; background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #38bdf8;">
                                        ⚡ Gerar Ponte (${AI_ENGINES[getSelectedAiEngine()] ? AI_ENGINES[getSelectedAiEngine()].label : 'Ativa'})
                                    </button>
                                    <button type="button" class="btn-gov" onclick="generateAiBridge('${d.name}', 'universal')" style="font-size: 10px; padding: 4px 10px;" title="Gera arquivos de pontes para todas as IDEs suportadas simultaneamente">
                                        🌐 Todas as IDEs
                                    </button>
                                </div>
                            </div>
                            <!-- Chips das pontes existentes no projeto -->
                            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;" id="pwBridgesList">
                                ${renderProjectBridgesChips(d.name)}
                            </div>
                        </div>
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

        <div class="pw-card sc-launch-card" style="margin-bottom: 20px;">
            <div class="pw-card-header">
                <span class="pw-card-title">🧠 Registrar Sessão com IA</span>
                <span class="sc-ai-chip">✨ IA</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 12px; font-size: 13px;">
                Terminou de trabalhar? A IA lê seus commits, os arquivos alterados e suas notas e propõe o registro da sessão, as atualizações do roadmap e as lições aprendidas. Você revisa item a item antes de gravar.
            </p>
            <div class="pw-action-box">
                <div class="pw-action-info">
                    <h4>Memória sem esforço manual</h4>
                    <p>Gera <code>MEMORY/sessions/</code>, atualiza o <code>CURRENT_STATE.md</code> e sugere entradas para <code>LESSONS_LEARNED.md</code>. Nada é gravado sem sua confirmação.</p>
                </div>
                <button class="btn btn-primary" id="btnOpenSessionCapture" onclick="openSessionCaptureModal()">
                    🧠 Registrar Sessão
                </button>
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
        const btnRotateLeft = document.getElementById('btnPwRotateLeft');
        const btnRotateRight = document.getElementById('btnPwRotateRight');
        const btnAutoOrbit = document.getElementById('btnPwAutoOrbit');
        const btnShake = document.getElementById('btnPwShake');
        const btnReset = document.getElementById('btnPwResetView');
        const toggleIcons = document.getElementById('togglePwIcons');

        if (btnZoomIn) btnZoomIn.onclick = () => projectGraph && projectGraph.zoomIn();
        if (btnZoomOut) btnZoomOut.onclick = () => projectGraph && projectGraph.zoomOut();
        if (btnRotateLeft) btnRotateLeft.onclick = () => projectGraph && projectGraph.rotateBy(-Math.PI / 8);
        if (btnRotateRight) btnRotateRight.onclick = () => projectGraph && projectGraph.rotateBy(Math.PI / 8);
        if (btnAutoOrbit) {
            btnAutoOrbit.onclick = () => {
                if (!projectGraph) return;
                const running = projectGraph.toggleAutoOrbit();
                btnAutoOrbit.classList.toggle('active', running);
            };
        }
        if (btnShake) btnShake.onclick = () => projectGraph && projectGraph.reheat(1.0);
        if (btnReset) btnReset.onclick = () => projectGraph && projectGraph.resetView();
        if (toggleIcons) {
            toggleIcons.onchange = (e) => {
                if (projectGraph) projectGraph.setShowIcons(e.target.checked);
            };
        }
        const btnPwToggleStyle = document.getElementById('btnPwToggleNodeStyle');
        if (btnPwToggleStyle) {
            btnPwToggleStyle.onclick = () => {
                if (!projectGraph) return;
                const next = projectGraph.toggleNodeStyle();
                if (graph) graph.setNodeStyle(next);
                if (typeof updateNodeStyleUI === 'function') updateNodeStyleUI(next);
            };
        }

        // Fullscreen do Grafo do Projeto
        setupFullscreenButton('btnPwFullscreen', document.querySelector('.pw-graph-wrapper'), () => projectGraph);

        // Pesquisa de documentos em tempo real no Grafo do Projeto
        setupGraphSearch('pwGraphSearchInput', 'btnPwGraphSearchClear', 'pwGraphSearchBadge', 'pwGraphNodeCount', () => projectGraph);

        projectGraph.onCameraChange = (state) => {
            const zEl = document.getElementById('pwHudZoomPill');
            if (zEl) zEl.textContent = `🔍 ${state.zoomPercent}%`;
            const rEl = document.getElementById('pwHudRotationPill');
            const oBtn = document.getElementById('btnPwAutoOrbit');
            const isOrbit = Boolean(state.autoRotate || state.autoOrbit);

            if (rEl) {
                if (isOrbit) {
                    rEl.textContent = '🪐 Em Órbita';
                    rEl.style.color = '#38bdf8';
                } else {
                    rEl.textContent = '🌍 3D Planeta';
                    rEl.style.color = '';
                }
            }
            if (oBtn) oBtn.classList.toggle('active', isOrbit);
        };

        projectGraph.onNodeDblClick = (node) => {
            if (!node) return;
            if (node.isFolder) {
                projectGraph.focusNode(node);
                return;
            }
            if (node.path) navigateTo(node.path);
        };
    }

    // Monta o grafo orbital 3D hierárquico estritamente com os documentos locais do projeto
    const projectName = currentProjectData.name;
    const allFiles = (window.VAULT && window.VAULT.data && window.VAULT.data.files) || [];

    // Nós estritamente locais do projeto (arquivos dentro de projects/<projectName>/)
    const localFiles = allFiles.filter(f => f.path.startsWith(`projects/${projectName}/`));

    let nodes = [];
    let edges = [];
    let colors = {};

    if (typeof window.buildHierarchyGraph === 'function' && localFiles.length > 0) {
        const hg = window.buildHierarchyGraph(localFiles, {
            rootId: `proj_${projectName}`,
            rootLabel: projectName,
            rootIcon: '🚀',
            rootPrefix: `projects/${projectName}/`,
            fileLabel: 'name'
        });
        nodes = hg.nodes;
        edges = hg.edges;
        colors = hg.colors;
    } else {
        nodes = [
            {
                id: `proj_${projectName}`,
                label: projectName,
                group: 'projects',
                size: 32,
                icon: '🚀',
                path: `projects/${projectName}/PROJECT.md`,
                isCentral: true
            }
        ];
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
        colors = (window.VAULT && window.VAULT.data && window.VAULT.data.groupColors) || {};
    }

    projectGraph.loadData(nodes, edges, colors);
    projectGraph.start();

    // Inicializa painel dinâmico de categorias e cores no Grafo do Projeto
    setupGraphCategoryPanel({
        wrapId: 'pwGraphCatPanelWrap',
        triggerId: 'pwGraphCatTrigger',
        triggerLabelId: 'pwGraphCatTriggerLabel',
        triggerBadgeId: 'pwGraphCatTriggerBadge',
        dropdownId: 'pwGraphCatDropdown',
        listId: 'pwGraphCatList',
        resetBtnId: 'btnPwGraphResetColors',
        closeBtnId: 'btnPwGraphCloseCat',
        searchInputId: 'pwGraphSearchInput',
        searchBadgeId: 'pwGraphSearchBadge',
        nodeCountElId: 'pwGraphNodeCount',
        getGraphInstance: () => projectGraph
    });

    // Sincroniza estado inicial dos botões e do toggle de ícones
    const toggleIcons = document.getElementById('togglePwIcons');
    if (toggleIcons && projectGraph) {
        projectGraph.setShowIcons(toggleIcons.checked);
    }
    if (typeof updateNodeStyleUI === 'function' && projectGraph) {
        updateNodeStyleUI(projectGraph.nodeStyle);
    }
    const btnAutoOrbit = document.getElementById('btnPwAutoOrbit');
    if (btnAutoOrbit && projectGraph) {
        btnAutoOrbit.classList.add('active');
    }
    const rEl = document.getElementById('pwHudRotationPill');
    if (rEl) {
        rEl.textContent = '🪐 Em Órbita';
        rEl.style.color = '#38bdf8';
    }

    // Reseta o campo de pesquisa do projeto ao abrir
    const searchInput = document.getElementById('pwGraphSearchInput');
    const searchClear = document.getElementById('btnPwGraphSearchClear');
    const searchBadge = document.getElementById('pwGraphSearchBadge');
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';
    if (searchBadge) searchBadge.style.display = 'none';

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

async function openProjectInIde(ide = 'code') {
    const project = currentProjectData ? currentProjectData.name : currentProject;
    if (!project) return;

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice(`abrir o projeto no editor (${ide.toUpperCase()})`);
        return;
    }

    try {
        const res = await fetch('/api/system/open-ide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName: project, ide })
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            showToast(`⚠️ ${data.error || 'Não foi possível disparar o editor.'}`, 'warning', 4000);
            return;
        }

        const editorName = ide === 'cursor' ? 'Cursor AI' : ide === 'code' ? 'VS Code' : 'Explorador de Arquivos';
        showToast(`💻 Projeto aberto no ${editorName}!`, 'success', 3500);
    } catch (err) {
        showToast(`❌ Falha ao comunicar com o servidor: ${err.message}`, 'error', 4000);
    }
}
window.openProjectInIde = openProjectInIde;

async function copySessionStartPrompt() {
    const d = currentProjectData;
    if (!d) return;

    const btn = document.getElementById('btnPwCopyPrompt');
    const projectName = d.name;
    const realPath = d.realPath || `C:\\Projetos\\...\\${projectName}`;
    const stack = d.stack || 'Não especificada';

    const promptText = `Você está atuando no projeto **${projectName}**, governado pelas regras e memória do AI Second Brain.
Stack Principal: ${stack}
Diretório do Projeto: ${realPath}

ANTES DE EXECUTAR QUALQUER TAREFA:
1. Consulte a visão geral e arquitetura em: \`PROJECT.md\`
2. Consulte o estado atual e tarefas ativas em: \`CURRENT_STATE.md\`
3. Consulte as decisões arquiteturais consolidadas em: \`DECISIONS/\`
4. Consulte as lições aprendidas em: \`memory/lessons-learned.md\` e \`LESSONS_LEARNED.md\`
5. REGRAS ABSOLUTAS:
   - Prioridade Determinística: SEMPRE utilize código puro/regras de negócio antes de recorrer a LLMs.
   - Zero Fabricação: NUNCA invente contexto ou especificações que não existem na documentação.
   - Catálogos 100% Dinâmicos: NUNCA crie listas fixas de modelos no código ou HTML.
   - Respeito a Decisões: Não altere a arquitetura sem registrar um novo ADR em \`DECISIONS/\`.

Me apresente um resumo rápido de onde o projeto parou e qual é o próximo passo recomendado para continuarmos.`;

    try {
        await navigator.clipboard.writeText(promptText);
        showToast(`✨ Prompt de início para o agente copiado para a área de transferência!`, 'success', 4000);
        if (btn) {
            const originalText = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = '✓ Prompt Copiado!';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = originalText;
            }, 2500);
        }
    } catch (err) {
        showToast(`Não foi possível copiar o prompt: ${err.message}`, 'error');
    }
}
window.copySessionStartPrompt = copySessionStartPrompt;

async function clearProjectMemory() {
    if (!currentProject) return;
    const conf = await showBrainConfirm({
        title: 'Arquivar Memórias do Projeto',
        badge: '📦 SESSÕES DE MEMÓRIA',
        icon: '📦',
        message: `Deseja arquivar as sessões de memória do projeto <strong>'${escapeHtml(currentProject)}'</strong>?<br><br>Todas as sessões serão salvas com segurança em <code>MEMORY/.archive/</code> com carimbo de data/hora.`,
        confirmText: 'Sim, Arquivar Sessões',
        cancelText: 'Cancelar',
        danger: false
    });
    if (!conf) return;

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('arquivar arquivos de memória no disco');
        return;
    }

    const btn = document.getElementById('btnClearMemoryBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Arquivando...';
    }

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/clear-memory`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao arquivar sessões.');

        showToast(`✓ Sucesso! ${data.movedCount} sessões foram arquivadas em .archive/.`, 'success', 4000);
        // Recarrega detalhes do projeto
        await openProjectWorkspace(currentProject, 'memory');
    } catch (err) {
        showToast('Erro ao arquivar memória: ' + err.message, 'error', 5000);
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
    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('abrir pastas no Windows Explorer');
        return;
    }
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
    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('abrir arquivos no computador');
        return;
    }
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
        await showBrainConfirm({
            title: 'Copiar Caminho',
            badge: 'ÁREA DE TRANSFERÊNCIA',
            icon: '📋',
            message: 'Não foi possível copiar automaticamente. Selecione e copie o caminho abaixo:',
            withInput: true,
            defaultValue: text,
            confirmText: 'Concluído',
            singleButton: true,
            danger: false
        });
    }
}

async function unlinkProject() {
    if (!currentProject) return;
    const confirmName = await showBrainConfirm({
        title: 'Desvincular Projeto',
        badge: '⚠️ AÇÃO CRÍTICA &middot; DESVINCULAR',
        icon: '⚠️',
        message: `Esta ação desvinculará o projeto <strong>${escapeHtml(currentProject)}</strong> deste cérebro. Seus arquivos locais no disco permanecerão intactos.<br><br>Para confirmar, digite exatamente o nome do projeto (<strong>${escapeHtml(currentProject)}</strong>) abaixo:`,
        confirmText: 'Confirmar Desvinculação',
        cancelText: 'Cancelar',
        danger: true,
        withInput: true,
        inputPlaceholder: `Digite "${currentProject}" para confirmar`
    });
    if (!confirmName) return; // cancelado

    if (confirmName !== currentProject) {
        showToast('Nome digitado não confere. Desvinculação cancelada.', 'error', 4000);
        return;
    }

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('desvincular repositórios no disco rígido');
        return;
    }

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/unlink`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao desvincular projeto.');

        showToast(data.message || 'Projeto desvinculado com sucesso.', 'success', 4000);
        showDashboard();
        if (window.VAULT) {
            await window.VAULT.refresh();
            refreshApp();
        }
    } catch (err) {
        showToast('Erro ao desvincular: ' + err.message, 'error', 5000);
    }
}

// ═══════════════════════════════════════════════════
// LIVE MARKDOWN EDITOR CONTROLLER
// ═══════════════════════════════════════════════════
let activeEditingPath = null;
let onEditorSavedCallback = null;
let currentEditorTab = 'preview';

async function openFileEditor(filePath, initialContent = null, onSaved = null, defaultTab = 'preview') {
    activeEditingPath = filePath;
    onEditorSavedCallback = onSaved;
    currentEditorTab = defaultTab;

    const modal = document.getElementById('fileEditorModal');
    const pathEl = document.getElementById('editorFilePath');
    const titleEl = document.getElementById('editorModalTitle');
    const badgeEl = document.getElementById('editorBadgeText');
    const textarea = document.getElementById('editorTextarea');
    const statusText = document.getElementById('editorStatusText');
    const btnSave = document.getElementById('btnSaveFile');

    if (!modal || !textarea) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const filename = filePath.split('/').pop();
    if (titleEl) titleEl.textContent = defaultTab === 'write' ? `Editando: ${filename}` : `Visualizando: ${filename}`;
    if (badgeEl) badgeEl.textContent = defaultTab === 'write' ? '✏️ EDITOR INTEGRADO' : '👁️ PRÉ-VISUALIZAÇÃO';
    if (pathEl) pathEl.textContent = filePath;
    if (statusText) statusText.innerHTML = '<span class="status-dot snapshot"></span> Carregando conteúdo...';
    if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = '<span>💾 Salvar no Disco</span>';
    }

    if (initialContent !== null && initialContent !== undefined) {
        textarea.value = initialContent;
        switchEditorTab(defaultTab);
    } else {
        try {
            const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
            if (!res.ok) throw new Error('Não foi possível ler o arquivo.');
            const text = await res.text();
            textarea.value = text;
            switchEditorTab(defaultTab);
        } catch (err) {
            textarea.value = `# ${filename}\n\n`;
            switchEditorTab('write');
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
    const statusText = document.getElementById('editorStatusText');
    const titleEl = document.getElementById('editorModalTitle');
    const badgeEl = document.getElementById('editorBadgeText');
    const filename = (activeEditingPath || '').split('/').pop();

    if (btnWrite) btnWrite.classList.toggle('active', tab === 'write');
    if (btnPrev) btnPrev.classList.toggle('active', tab === 'preview');

    if (tab === 'write') {
        if (textarea) textarea.style.display = 'block';
        if (preview) preview.style.display = 'none';
        if (toolbar) toolbar.style.display = 'flex';
        if (badgeEl) badgeEl.textContent = '✏️ EDITOR INTEGRADO';
        if (titleEl && filename) titleEl.textContent = `Editando: ${filename}`;
        if (statusText) statusText.innerHTML = '<span class="status-dot" style="background:#10b981"></span> Modo de Edição (Ctrl+S para salvar)';
        textarea?.focus();
    } else {
        if (textarea) textarea.style.display = 'none';
        if (preview) {
            preview.style.display = 'block';
            preview.scrollTop = 0;
            const val = textarea ? textarea.value : '';
            const html = window.VAULT && window.VAULT.renderMarkdown 
                ? window.VAULT.renderMarkdown(val, activeEditingPath) 
                : `<pre>${val.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
            preview.innerHTML = `<div class="doc-preview-inner">${html}</div>`;
        }
        if (toolbar) toolbar.style.display = 'none';
        if (badgeEl) badgeEl.textContent = '👁️ PRÉ-VISUALIZAÇÃO';
        if (titleEl && filename) titleEl.textContent = `Visualizando: ${filename}`;
        if (statusText) statusText.innerHTML = '<span class="status-dot" style="background:#10b981"></span> Modo de Pré-visualização (clique em "Escrever" para editar)';
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

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('salvar alterações diretamente no disco rígido');
        if (statusText) {
            statusText.innerHTML = `<span class="status-dot snapshot"></span> 🌐 Modo Demo: edições não são salvas no disco em produção.`;
        }
        return;
    }

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

/* ═══════════════════════════════════════════════════
   RESEARCH LAB — CONTROLLERS & IA INTERACTIONS
   ═══════════════════════════════════════════════════ */

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let currentResearchesList = [];
let activeResearchSlug = null;
let lastRefinedPromptText = '';


/**
 * Renderiza a aba principal do Research Lab
 */
async function renderProjectResearchTab() {
    const container = document.getElementById('pwResearchContent');
    if (!container || !currentProject) return;

    container.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color: var(--text-tertiary);">
            <div class="ai-sparkles" style="font-size:32px; margin-bottom:12px; display:inline-block;">🔬</div>
            <div>Carregando laboratório de conhecimento e inteligência...</div>
        </div>
    `;

    try {
        // Busca pesquisas e status da IA em paralelo
        const [researchRes, aiStatusRes] = await Promise.all([
            fetch(`/api/projects/${encodeURIComponent(currentProject)}/research`),
            fetch('/api/ai/status')
        ]);

        const researchData = researchRes.ok ? await researchRes.json() : { researches: [] };
        const aiStatus = aiStatusRes.ok ? await aiStatusRes.json() : { ready: false, model: 'openai/gpt-oss-120b' };

        currentResearchesList = researchData.researches || [];

        // Atualiza pílula da aba
        const tabBadge = document.getElementById('pwResearchTabBadge');
        if (tabBadge) {
            tabBadge.textContent = currentResearchesList.length;
            tabBadge.style.display = currentResearchesList.length > 0 ? 'inline-block' : 'none';
        }

        // Calcula métricas
        let totalKnowledge = 0;
        let totalActionable = 0;
        currentResearchesList.forEach(r => {
            totalKnowledge += (r.knowledgeFiles || []).length;
            totalActionable += (r.actionableFiles || []).length;
        });

        // Monta o Hero Banner
        const aiBadgeHtml = aiStatus.ready
            ? `<span class="rl-ai-status-pill"><span class="pulse-dot"></span> Groq Cloud Conectado (${aiStatus.model})</span>`
            : `<span class="rl-ai-status-pill" style="border-color:rgba(245,158,11,0.3); color:#fcd34d;"><span class="pulse-dot" style="background:#f59e0b; box-shadow:0 0 8px #f59e0b;"></span> Chave Groq Ausente (.env)</span>`;

        let html = `
            <!-- Hero Banner do Research Lab -->
            <div class="rl-hero-banner">
                <div class="rl-hero-content">
                    <div class="rl-hero-text">
                        <div class="rl-hero-badge-row">
                            <span class="rl-hero-badge">🔬 LABORATÓRIO DE CONHECIMENTO</span>
                            ${aiBadgeHtml}
                        </div>
                        <h2 class="rl-hero-title">
                            <span>Laboratório de Pesquisa Autônoma</span>
                        </h2>
                        <p class="rl-hero-desc">
                            Pesquise temas profundos, consulte a IA (Groq Cloud) para refinar briefings com o contexto real de <strong>${escapeHtml(currentProject)}</strong>, decomponha em subtópicos e catalogue tudo em arquivos <code>.md</code> de conhecimento e ação.
                        </p>
                    </div>
                    <button class="btn-new-research-glow" onclick="openResearchModal()">
                        <span class="ai-sparkles">✨</span>
                        <span>Nova Pesquisa no Lab</span>
                    </button>
                </div>
            </div>

            <!-- Métricas Rápidas -->
            <div class="rl-metrics-row">
                <div class="rl-metric-card">
                    <div class="rl-metric-icon">🔬</div>
                    <div>
                        <div class="rl-metric-val">${currentResearchesList.length}</div>
                        <div class="rl-metric-lbl">Pesquisas Ativas</div>
                    </div>
                </div>
                <div class="rl-metric-card">
                    <div class="rl-metric-icon">📘</div>
                    <div>
                        <div class="rl-metric-val">${totalKnowledge}</div>
                        <div class="rl-metric-lbl">Docs em knowledge/</div>
                    </div>
                </div>
                <div class="rl-metric-card">
                    <div class="rl-metric-icon">🛠️</div>
                    <div>
                        <div class="rl-metric-val">${totalActionable}</div>
                        <div class="rl-metric-lbl">Specs em actionable/</div>
                    </div>
                </div>
                <div class="rl-metric-card">
                    <div class="rl-metric-icon">⚡</div>
                    <div>
                        <div class="rl-metric-val">~1.5s</div>
                        <div class="rl-metric-lbl">Latência de Inferência (Groq)</div>
                    </div>
                </div>
            </div>
        `;

        // Renderiza lista de pesquisas ou empty state
        if (currentResearchesList.length === 0) {
            html += `
                <div class="rl-empty-state">
                    <div class="rl-empty-orb">🔬</div>
                    <h3 class="rl-empty-title">Nenhum laboratório criado para este projeto ainda</h3>
                    <p class="rl-empty-desc">
                        Crie pesquisas autônomas para mapear tecnologias, arquiteturas, padrões de projeto ou regras de negócio complexas. A IA gerará a documentação estruturada diretamente no disco.
                    </p>

                    <div class="rl-quick-prompts-title">💡 Ideias rápidas para começar agora</div>
                    <div class="rl-quick-prompts-grid">
                        <button type="button" class="rl-quick-prompt-btn" onclick="startQuickResearch('Arquitetura de Microsserviços e Event-Driven com Filas', 'Quero mapear os melhores padrões para mensageria resiliente, filas RabbitMQ/Kafka, idempotência e dead-letter queues adaptadas para nossa stack.')">
                            ⚡ Arquitetura Event-Driven & Filas
                        </button>
                        <button type="button" class="rl-quick-prompt-btn" onclick="startQuickResearch('Segurança, JWT com Refresh Tokens e OAuth2', 'Pesquise sobre as melhores práticas de autenticação segura, rotação de chaves JWT, prevenção de replay attacks e proteção contra vazamento.')">
                            🛡️ Autenticação Segura & Tokens
                        </button>
                        <button type="button" class="rl-quick-prompt-btn" onclick="startQuickResearch('Estratégias de Caching Distribuído e Resiliência', 'Quero entender padrões de caching distribuído (Cache-Aside, Write-Through), estratégias de invalidação, controle de concorrência e Redis.')">
                            🚀 Caching Distribuído & Redis
                        </button>
                    </div>

                    <button class="btn btn-primary" onclick="openResearchModal()" style="padding: 12px 24px; font-weight:700;">
                        ✨ Criar Primeira Pesquisa com IA
                    </button>
                </div>
            `;
        } else {
            html += `
                <div class="rl-grid">
                    ${currentResearchesList.map(r => renderResearchCardHtml(r)).join('')}
                </div>
            `;
        }

        container.innerHTML = html;

    } catch (err) {
        console.error('Erro ao renderizar aba de pesquisa:', err);
        container.innerHTML = `
            <div class="pw-card" style="border-color: var(--danger);">
                <h3 style="color:var(--danger)">Erro ao carregar o Research Lab</h3>
                <p>${escapeHtml(err.message)}</p>
                <button class="btn btn-secondary" onclick="renderProjectResearchTab()">Tentar Novamente</button>
            </div>
        `;
    }
}

/**
 * Renderiza o HTML de um Card de Pesquisa individual com as 5 melhorias visuais
 */
function renderResearchCardHtml(r) {
    const meta = r.meta || {};
    const topic = r.topic || meta.topic || r.slug;
    const definition = r.definition || meta.definition || 'Sem definição cadastrada.';
    const history = meta.definitionHistory || [];
    const versionNum = history.length > 0 ? history.length : 1;
    const knowledgeCount = (r.knowledgeFiles || []).length;
    const actionableCount = (r.actionableFiles || []).length;
    const totalDocs = knowledgeCount + actionableCount + (r.hasOverview ? 1 : 0);
    const sizeFormatted = r.totalSizeKb && parseFloat(r.totalSizeKb) > 0 ? `${r.totalSizeKb} KB` : '0 KB';

    return `
        <div class="rl-card" id="card-research-${escapeHtml(r.slug)}">
            <!-- Melhoria 3: Barra Neon de Progresso Vivo (Shimmer) -->
            <div class="rl-card-shimmer-bar" id="shimmer-research-${escapeHtml(r.slug)}"></div>

            <div>
                <div class="rl-card-top">
                    <div class="rl-card-title-wrap">
                        <div class="rl-card-icon">🔬</div>
                        <div class="rl-card-title-text">
                            <h3 class="rl-card-title">${escapeHtml(topic)}</h3>
                            <span class="rl-card-slug" title="projects/${escapeHtml(currentProject)}/RESEARCH/${escapeHtml(r.slug)}">projects/${escapeHtml(currentProject)}/RESEARCH/${escapeHtml(r.slug)}</span>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                        <span class="rl-card-status-badge ${r.status === 'completed' ? 'completed' : ''}" id="status-badge-${escapeHtml(r.slug)}">${r.status === 'completed' ? '✓ Concluído' : '🟢 Ativo'}</span>
                        <!-- Melhoria 5: Lixeira discreta com hover seguro e alerta -->
                        <button class="btn-rl-del" title="Excluir este laboratório de pesquisa e seus arquivos" onclick="confirmDeleteResearchLab('${escapeHtml(r.slug)}', '${escapeHtml(topic).replace(/'/g, "\\'")}')">🗑️</button>
                    </div>
                </div>

                <!-- Prompt Vivo Box -->
                <div class="rl-card-prompt-box">
                    <div class="rl-card-prompt-header">
                        <span class="rl-prompt-vivo-tag">
                            <span>✨ Prompt Vivo</span>
                            <span class="rl-version-pill">v${versionNum}</span>
                        </span>
                        <button class="btn-rl-action" style="padding: 2px 7px; font-size:10px;" onclick="openPromptVivoModal('${escapeHtml(r.slug)}')">
                            ✏️ Ajustar
                        </button>
                    </div>
                    <div class="rl-card-prompt-text" title="${escapeHtml(definition)}">
                        ${escapeHtml(definition)}
                    </div>
                </div>

                <!-- Camadas de Arquivos Interativas -->
                <div class="rl-card-layers">
                    <div class="rl-layer-chip knowledge" onclick="openDecomposeModal('${escapeHtml(r.slug)}')" style="cursor: pointer;" title="Clique para explorar os ${knowledgeCount} arquivos conceituais em knowledge/">
                        <span class="rl-layer-chip-icon">📘</span>
                        <div>
                            <div class="rl-layer-chip-count">${knowledgeCount}</div>
                            <div class="rl-layer-chip-label">knowledge/</div>
                        </div>
                    </div>
                    <div class="rl-layer-chip actionable" onclick="openDecomposeModal('${escapeHtml(r.slug)}')" style="cursor: pointer;" title="Clique para explorar as ${actionableCount} especificações práticas em actionable/">
                        <span class="rl-layer-chip-icon">🛠️</span>
                        <div>
                            <div class="rl-layer-chip-count">${actionableCount}</div>
                            <div class="rl-layer-chip-label">actionable/</div>
                        </div>
                    </div>
                </div>

                <!-- Melhoria 2: Badge de Volume Total & Métricas Consolidadas -->
                <div class="rl-card-metrics-strip">
                    <span class="rl-metric-pill" title="Total de documentos técnicos gerados no disco">
                        <span class="rl-pill-dot ${totalDocs > 0 ? 'green' : ''}"></span>
                        <strong>${totalDocs}</strong> ${totalDocs === 1 ? 'arquivo gerado' : 'arquivos gerados'}
                    </span>
                    <span class="rl-metric-pill" title="Tamanho total em disco">
                        💾 <strong>${sizeFormatted}</strong>
                    </span>
                    ${r.status === 'completed' ? `<span class="rl-metric-pill success" title="Todos os arquivos foram compilados e estão prontos no disco">✨ 100% Indexado</span>` : ''}
                </div>
            </div>

            <!-- Ações do Card (Grid Harmônico e Proporcional com Melhoria 1: Acentos Temáticos) -->
            <div class="rl-card-actions">
                <button class="btn-rl-action primary" onclick="startResearchExecution('${escapeHtml(r.slug)}')">
                    <span>${r.status === 'completed' ? '🔄' : '▶️'}</span> ${r.status === 'completed' ? 'Recalcular / Atualizar' : 'Pesquisar Agora'}
                </button>
                <button class="btn-rl-action btn-rl-subtopics" onclick="openDecomposeModal('${escapeHtml(r.slug)}')" title="Ver estrutura detalhada de subtópicos e arquivos">
                    <span>🧩</span> Subtópicos & Arquivos
                </button>
                <!-- Melhoria 4: Mini Preview ao passar o mouse em OVERVIEW.md -->
                <button class="btn-rl-action btn-rl-overview" 
                        onclick="openOverviewDoc('${escapeHtml(r.slug)}')" 
                        onmouseenter="showOverviewPreview(event, '${escapeHtml(r.slug)}', '${escapeHtml(topic).replace(/'/g, "\\'")}', '${escapeHtml(definition).replace(/'/g, "\\'")}', ${knowledgeCount}, ${actionableCount}, '${sizeFormatted}')"
                        onmouseleave="hideOverviewPreview()"
                        title="Abrir documento mestre OVERVIEW.md">
                    <span>📄</span> OVERVIEW.md
                </button>
                <button class="btn-rl-action btn-rl-graph" onclick="switchProjectTab('graph')" title="Visualizar este laboratório orbitando o projeto no Grafo Neural 3D">
                    <span>🔮</span> Grafo Neural
                </button>
                <button class="btn-rl-action btn-rl-folder" onclick="openResearchFolderInExplorer('${escapeHtml(r.slug)}')" title="Abrir pasta física da pesquisa no Windows Explorer">
                    <span>📂</span> Abrir Pasta
                </button>
            </div>
        </div>
    `;
}

// ── Melhoria 4: Popover de Prévia Rápida do OVERVIEW.md ────────
let overviewPreviewTimeout = null;

function showOverviewPreview(e, slug, topic, definition, knowledgeCount, actionableCount, sizeFormatted) {
    clearTimeout(overviewPreviewTimeout);
    let popover = document.getElementById('rlOverviewPreviewPopover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'rlOverviewPreviewPopover';
        popover.className = 'rl-overview-preview-popover';
        document.body.appendChild(popover);
    }

    const shortDef = (definition && definition !== 'Sem definição cadastrada.')
        ? (definition.length > 130 ? definition.substring(0, 130) + '...' : definition)
        : 'Visão executiva e mapa neural consolidado dos tópicos deste laboratório.';

    popover.innerHTML = `
        <div class="rl-opp-header">
            <span class="rl-opp-badge">📄 OVERVIEW.md</span>
            <span class="rl-opp-topic">${escapeHtml(topic)}</span>
        </div>
        <div class="rl-opp-body">${escapeHtml(shortDef)}</div>
        <div class="rl-opp-footer">
            <span>📘 <strong>${knowledgeCount}</strong> knowledge</span>
            <span class="rl-opp-dot">•</span>
            <span>🛠️ <strong>${actionableCount}</strong> actionable</span>
            <span class="rl-opp-dot">•</span>
            <span>💾 <strong>${sizeFormatted}</strong></span>
        </div>
        <div class="rl-opp-hint">👆 Clique para abrir no Editor Markdown</div>
    `;

    const target = e.currentTarget || e.target;
    const rect = target.getBoundingClientRect();
    popover.style.display = 'block';

    const popWidth = 280;
    let left = rect.left + (rect.width / 2) - (popWidth / 2);
    if (left < 10) left = 10;
    if (left + popWidth > window.innerWidth - 10) left = window.innerWidth - popWidth - 10;

    let top = rect.top - popover.offsetHeight - 8;
    if (top < 10) {
        top = rect.bottom + 8;
    }

    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
}

function hideOverviewPreview() {
    overviewPreviewTimeout = setTimeout(() => {
        const popover = document.getElementById('rlOverviewPreviewPopover');
        if (popover) popover.style.display = 'none';
    }, 150);
}

async function startResearchExecution(slug) {
    if (!currentProject || !slug) return;
    const research = (currentResearchesList || []).find(r => r.slug === slug);
    const topic = research ? (research.topic || research.meta?.topic || slug) : slug;
    
    // Melhoria 3: Ativa estado gerando no card de fundo
    const card = document.getElementById(`card-research-${slug}`);
    if (card) {
        card.classList.add('is-generating');
        const badge = document.getElementById(`status-badge-${slug}`);
        if (badge) {
            badge.className = 'rl-card-status-badge generating';
            badge.innerHTML = `<span class="rl-pulse-dot"></span> ⚡ Sintetizando...`;
        }
    }
    
    await startLiveResearchFromModal(slug, topic);
}



/**
 * Atalho rápido do empty state
 */
function startQuickResearch(topic, definition) {
    openResearchModal();
    const topicInput = document.getElementById('rlTopicInput');
    const defInput = document.getElementById('rlDefinitionInput');
    if (topicInput) topicInput.value = topic;
    if (defInput) defInput.value = definition;
}

/**
 * Abre o modal de criação de pesquisa
 */
function openResearchModal() {
    const modal = document.getElementById('researchModal');
    if (!modal) return;

    // Reseta form
    document.getElementById('rlCreateForm')?.reset();
    document.getElementById('rlRefineSplitView').style.display = 'none';
    document.getElementById('rlDecomposeResults').style.display = 'none';
    document.getElementById('rlDecomposeResults').innerHTML = '';

    const sub = document.getElementById('researchModalSub');
    if (sub) {
        sub.innerHTML = `A IA contextualizará sua pesquisa com os contratos e arquitetura de <strong>${escapeHtml(currentProject)}</strong>.`;
    }

    const statusEl = document.getElementById('rlModalStatus');
    if (statusEl) {
        statusEl.innerHTML = `<span class="status-dot snapshot"></span> Pronto para criar laboratório`;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('rlTopicInput')?.focus(), 100);
}

function closeResearchModal() {
    const modal = document.getElementById('researchModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleResearchBackdropClick(e) {
    if (e.target && e.target.id === 'researchModal') {
        closeResearchModal();
    }
}

function applyTopicPreset(topicText) {
    const input = document.getElementById('rlTopicInput');
    if (input) {
        input.value = topicText;
        document.getElementById('rlDefinitionInput')?.focus();
    }
}

/**
 * Aciona o refinamento de prompt com IA (Groq Cloud)
 */
async function triggerAiRefinePrompt() {
    const topic = (document.getElementById('rlTopicInput')?.value || '').trim();
    const rawPrompt = (document.getElementById('rlDefinitionInput')?.value || '').trim();
    const btn = document.getElementById('btnAiRefine');
    const statusEl = document.getElementById('rlModalStatus');

    if (!rawPrompt) {
        alert('Por favor, digite uma ideia ou intenção inicial no campo abaixo antes de pedir ajuda à IA.');
        document.getElementById('rlDefinitionInput')?.focus();
        return;
    }

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('consultar a API do Groq Cloud');
        return;
    }

    if (btn) {
        btn.classList.add('loading');
        btn.querySelector('.ai-btn-text').textContent = 'Consultando Groq Cloud...';
        btn.querySelector('.ai-spinner').style.display = 'inline-block';
    }

    if (statusEl) {
        statusEl.innerHTML = `<span class="pulse-dot"></span> Groq Cloud analisando contexto de ${escapeHtml(currentProject)}...`;
    }

    try {
        const res = await fetch('/api/ai/refine-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: rawPrompt,
                projectName: currentProject,
                topic: topic
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Falha ao consultar a API de IA.');
        }

        const data = await res.json();
        lastRefinedPromptText = data.refinedPrompt || '';

        // Exibe no Split View
        document.getElementById('rlOriginalText').textContent = rawPrompt;
        document.getElementById('rlRefinedText').textContent = lastRefinedPromptText;
        document.getElementById('rlRefineSplitView').style.display = 'block';

        if (statusEl) {
            statusEl.innerHTML = `<span class="status-dot" style="background:#10b981"></span> Sugestão da IA pronta em ${data.inferenceMs || 1500}ms!`;
        }

        showSecondBrainToast('✨ Briefing enriquecido pela IA com base nos contratos do projeto!');

    } catch (err) {
        alert('Erro ao refinar com IA: ' + err.message);
        if (statusEl) {
            statusEl.innerHTML = `<span class="status-dot" style="background:#ef4444"></span> Erro: ${escapeHtml(err.message)}`;
        }
    } finally {
        if (btn) {
            btn.classList.remove('loading');
            btn.querySelector('.ai-btn-text').textContent = 'Melhorar com IA (Groq)';
            btn.querySelector('.ai-spinner').style.display = 'none';
        }
    }
}

function acceptRefinedPrompt() {
    if (!lastRefinedPromptText) return;
    const defInput = document.getElementById('rlDefinitionInput');
    if (defInput) defInput.value = lastRefinedPromptText;
    document.getElementById('rlRefineSplitView').style.display = 'none';
    showSecondBrainToast('✓ Sugestão da IA aplicada com sucesso ao Prompt Vivo!');
}

function acceptAndEditRefinedPrompt() {
    acceptRefinedPrompt();
    document.getElementById('rlDefinitionInput')?.focus();
}

function dismissRefinedPrompt() {
    document.getElementById('rlRefineSplitView').style.display = 'none';
}

/**
 * Pré-visualiza a decomposição de tópicos com IA antes de criar
 */
async function triggerPreviewDecompose() {
    const topic = (document.getElementById('rlTopicInput')?.value || '').trim();
    const definition = (document.getElementById('rlDefinitionInput')?.value || '').trim();
    const resultsContainer = document.getElementById('rlDecomposeResults');
    const btn = document.getElementById('btnPreviewDecompose');

    if (!topic || !definition) {
        alert('Preencha o tema e a intenção da pesquisa antes de visualizar a decomposição.');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.querySelector('span:first-child').textContent = 'Decompondo com IA...';
        btn.querySelector('.ai-spinner').style.display = 'inline-block';
    }

    try {
        const res = await fetch('/api/ai/decompose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, definition })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Erro na decomposição.');
        }

        const data = await res.json();
        const subtopics = data.subtopics || [];

        if (subtopics.length === 0) {
            resultsContainer.innerHTML = `<div style="color:var(--text-tertiary); font-size:12px;">Nenhum subtópico gerado.</div>`;
        } else {
            resultsContainer.innerHTML = `
                <div class="rl-subtopic-list">
                    ${subtopics.map(st => `
                        <div class="rl-subtopic-item">
                            <div class="rl-subtopic-top">
                                <span class="rl-subtopic-name">${escapeHtml(st.title || st.name)}</span>
                                <span class="rl-subtopic-layer-badge ${st.layer === 'actionable' ? 'actionable' : 'knowledge'}">
                                    ${st.layer === 'actionable' ? '🛠️ Actionable' : '📘 Knowledge'}
                                </span>
                            </div>
                            <div class="rl-subtopic-desc">${escapeHtml(st.description || st.goal || '')}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        resultsContainer.style.display = 'block';
        showSecondBrainToast(`🔮 ${subtopics.length} subtópicos mapeados em duas camadas!`);

    } catch (err) {
        alert('Erro ao decompor tópicos: ' + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.querySelector('span:first-child').textContent = '🔮 Pré-visualizar Subtópicos';
            btn.querySelector('.ai-spinner').style.display = 'none';
        }
    }
}

/**
 * Cria o laboratório físico no disco
 */
async function submitCreateResearch(e) {
    e.preventDefault();
    const topic = (document.getElementById('rlTopicInput')?.value || '').trim();
    const definition = (document.getElementById('rlDefinitionInput')?.value || '').trim();
    const btnSubmit = document.getElementById('btnSubmitResearch');
    const statusEl = document.getElementById('rlModalStatus');

    if (!topic || !definition) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.querySelector('.btn-spinner').style.display = 'inline-block';
        btnSubmit.querySelector('span:last-child').textContent = 'Criando no Disco...';
    }

    if (statusEl) {
        statusEl.innerHTML = `<span class="pulse-dot"></span> Gravando pastas e contratos físicos no disco...`;
    }

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, definition })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Falha ao criar laboratório.');
        }

        const data = await res.json();
        closeResearchModal();
        showSecondBrainToast(`🚀 Laboratório "${escapeHtml(topic)}" criado com sucesso no disco!`);

        // Recarrega a aba
        await renderProjectResearchTab();

    } catch (err) {
        alert('Erro ao criar pesquisa: ' + err.message);
        if (statusEl) {
            statusEl.innerHTML = `<span class="status-dot" style="background:#ef4444"></span> Erro: ${escapeHtml(err.message)}`;
        }
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.querySelector('.btn-spinner').style.display = 'none';
            btnSubmit.querySelector('span:last-child').textContent = '🚀 Inicializar Laboratório';
        }
    }
}

/**
 * Abre o modal de Prompt Vivo para ajustar briefing e ver histórico
 */
function openPromptVivoModal(slug) {
    activeResearchSlug = slug;
    const modal = document.getElementById('promptVivoModal');
    if (!modal) return;

    const research = currentResearchesList.find(r => r.slug === slug);
    if (!research) {
        alert('Pesquisa não encontrada.');
        return;
    }

    const meta = research.meta || {};
    const topic = research.topic || meta.topic || slug;
    const currentDef = research.definition || meta.definition || '';
    const history = meta.definitionHistory || [];

    const titleEl = document.getElementById('pvModalTitle');
    if (titleEl) titleEl.textContent = `Evolução: ${topic}`;

    const textarea = document.getElementById('pvTextarea');
    if (textarea) textarea.value = currentDef;

    // Renderiza a timeline de histórico
    const timelineList = document.getElementById('pvTimelineList');
    if (timelineList) {
        if (history.length === 0) {
            timelineList.innerHTML = `
                <div style="font-size:12px; color:var(--text-tertiary);">
                    Esta pesquisa ainda está na versão inicial (v1).
                </div>
            `;
        } else {
            timelineList.innerHTML = history.slice().reverse().map(h => `
                <div class="pv-timeline-item">
                    <div class="pv-timeline-top">
                        <span class="pv-timeline-ver">Versão ${h.version || 1}</span>
                        <span class="pv-timeline-date">${h.timestamp ? new Date(h.timestamp).toLocaleString('pt-BR') : 'Data não informada'}</span>
                    </div>
                    <div class="pv-timeline-text">${escapeHtml(h.definition || '')}</div>
                </div>
            `).join('');
        }
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePromptVivoModal() {
    const modal = document.getElementById('promptVivoModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handlePromptVivoBackdropClick(e) {
    if (e.target && e.target.id === 'promptVivoModal') {
        closePromptVivoModal();
    }
}

/**
 * Refina a definição atual no modal de Prompt Vivo com IA
 */
async function triggerPvAiRefine() {
    const textarea = document.getElementById('pvTextarea');
    const promptText = (textarea?.value || '').trim();
    const btn = document.getElementById('btnPvAiRefine');
    const statusEl = document.getElementById('pvModalStatus');

    if (!promptText) return;

    if (btn) {
        btn.classList.add('loading');
        btn.querySelector('span:nth-child(2)').textContent = 'Refinando...';
        btn.querySelector('.ai-spinner').style.display = 'inline-block';
    }

    try {
        const res = await fetch('/api/ai/refine-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: promptText,
                projectName: currentProject,
                topic: activeResearchSlug
            })
        });

        if (!res.ok) throw new Error('Falha ao refinar com IA.');
        const data = await res.json();

        if (textarea && data.refinedPrompt) {
            textarea.value = data.refinedPrompt;
            showSecondBrainToast('✨ Definição refinada pela IA com sucesso!');
        }
    } catch (err) {
        alert('Erro ao refinar com IA: ' + err.message);
    } finally {
        if (btn) {
            btn.classList.remove('loading');
            btn.querySelector('span:nth-child(2)').textContent = 'Refinar com IA';
            btn.querySelector('.ai-spinner').style.display = 'none';
        }
    }
}

/**
 * Salva a nova versão da definição (Prompt Vivo)
 */
async function submitPromptVivoUpdate(e) {
    e.preventDefault();
    if (!activeResearchSlug || !currentProject) return;

    const newDef = (document.getElementById('pvTextarea')?.value || '').trim();
    const btn = document.getElementById('btnSubmitPv');
    const statusEl = document.getElementById('pvModalStatus');

    if (!newDef) {
        alert('A definição não pode ficar vazia.');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.querySelector('.btn-spinner').style.display = 'inline-block';
    }

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/research/${encodeURIComponent(activeResearchSlug)}/definition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ definition: newDef })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Falha ao atualizar definição.');
        }

        const data = await res.json();
        closePromptVivoModal();
        showSecondBrainToast(`✨ Prompt Vivo atualizado para versão ${data.version || ''}!`);

        // Recarrega a aba
        await renderProjectResearchTab();

    } catch (err) {
        alert('Erro ao salvar nova versão: ' + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.querySelector('.btn-spinner').style.display = 'none';
        }
    }
}

/**
 * Abre o catálogo de subtópicos e documentos de uma pesquisa
 */
async function openDecomposeModal(slug) {
    const modal = document.getElementById('decomposeModal');
    if (!modal || !currentProject) return;

    activeResearchSlug = slug;
    const research = currentResearchesList.find(r => r.slug === slug);
    if (!research) {
        alert('Pesquisa não encontrada.');
        return;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Se estiver em execução ao vivo ativa para esta mesma pesquisa, preserva a tela de live progress
    if (isResearchRunningLive && activeLiveSlug === slug) {
        return;
    }

    renderDecomposeModalContent(research);
}

function formatTitleFromFilename(fn) {
    if (!fn) return '';
    return fn.replace(/^\d+-/, '')
             .replace(/\.md$/, '')
             .replace(/-/g, ' ')
             .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Renderiza o conteúdo do modal de subtópicos e arquivos da pesquisa
 */
function renderDecomposeModalContent(research) {
    const titleEl = document.getElementById('decModalTitle');
    const subEl = document.getElementById('decModalSub');
    const contentEl = document.getElementById('decModalContent');
    if (!contentEl) return;

    const meta = research.meta || {};
    const slug = research.slug;
    const topic = research.topic || meta.topic || slug;
    const definition = research.definition || meta.definition || '';

    if (titleEl) titleEl.textContent = `Subtópicos & Arquivos: ${topic}`;

    // Verifica se já existem arquivos gerados no disco ou em meta
    const generated = meta.generatedFiles || [];
    const knowledgeFiles = research.knowledgeFiles || [];
    const actionableFiles = research.actionableFiles || [];
    const hasFiles = generated.length > 0 || knowledgeFiles.length > 0 || actionableFiles.length > 0;

    if (hasFiles) {
        // Monta a lista completa a partir dos arquivos reais
        let allItems = [];

        if (generated.length > 0) {
            allItems = generated.map(g => ({
                title: g.title,
                description: g.description,
                layer: g.layer,
                path: g.path, // e.g. "knowledge/01-..."
                file: g.file || (g.path ? g.path.split('/').pop() : '')
            }));
        } else {
            // Fallback: se meta não tiver generatedFiles mas as pastas tiverem arquivos no disco
            knowledgeFiles.forEach(kf => {
                allItems.push({
                    title: formatTitleFromFilename(kf),
                    description: 'Documento conceitual em knowledge/',
                    layer: 'knowledge',
                    path: `knowledge/${kf}`,
                    file: kf
                });
            });
            actionableFiles.forEach(af => {
                allItems.push({
                    title: formatTitleFromFilename(af),
                    description: 'Especificação técnica em actionable/',
                    layer: 'actionable',
                    path: `actionable/${af}`,
                    file: af
                });
            });
        }

        if (subEl) {
            subEl.innerHTML = `<strong>${allItems.length} documentos catalogados</strong> no disco em <code>knowledge/</code> e <code>actionable/</code>. Clique no nome do arquivo para ler e editar.`;
        }

        contentEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding: 4px 2px; flex-wrap:wrap; gap:8px;">
                <div style="font-size:12px; color:var(--text-secondary);">
                    Local físico: <code style="font-size:11px; background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">projects/${escapeHtml(currentProject)}/RESEARCH/${escapeHtml(slug)}/</code>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button class="btn-rl-action" onclick="openResearchFolderInExplorer('${escapeHtml(slug)}')">
                        <span>📂</span> Abrir Pasta no Explorer
                    </button>
                    <button class="btn-rl-action btn-rl-action-danger" onclick="confirmDeleteAllResearchFiles('${escapeHtml(slug)}', '${escapeHtml(topic).replace(/'/g, "\\'")}')" title="Excluir todos os arquivos gerados desta pesquisa">
                        <span>🗑️</span> Excluir Todos os Arquivos
                    </button>
                </div>
            </div>

            <div class="rl-subtopic-list">
                ${allItems.map(item => {
                    const fullRelPath = `projects/${currentProject}/RESEARCH/${slug}/${item.path}`;
                    const layerTooltip = item.layer === 'actionable'
                        ? '🛠️ Actionable — Especificação prática e código adaptado à stack'
                        : '📘 Knowledge — Conhecimento teórico e conceitual';
                    return `
                        <div class="rl-subtopic-item live-doc-card">
                            <div class="rl-subtopic-top">
                                <div style="display:flex; align-items:flex-start; gap:10px; min-width:0; flex:1;">
                                    <span class="rl-layer-icon-tip" title="${layerTooltip}">
                                        ${item.layer === 'actionable' ? '🛠️' : '📘'}
                                    </span>
                                    <div style="min-width:0; flex:1;">
                                        <a class="rl-subtopic-link" onclick="openFileEditor('${escapeHtml(fullRelPath)}'); closeDecomposeModal();" title="Clique para ler ou editar este documento">
                                            ${escapeHtml(item.title)}
                                        </a>
                                        <div style="font-family:var(--font-mono); font-size:10px; color:var(--text-tertiary); margin-top:2px;">${escapeHtml(item.file)}</div>
                                    </div>
                                </div>
                                <button class="btn-subtopic-del" onclick="confirmDeleteResearchFile('${escapeHtml(slug)}', '${escapeHtml(item.path)}', '${escapeHtml(item.title).replace(/'/g, "\\'")}')" title="Excluir arquivo do disco">
                                    🗑️
                                </button>
                            </div>

                            <div class="rl-subtopic-desc" style="margin-top:6px;">${escapeHtml(item.description || 'Documento catalogado pela pesquisa autônoma.')}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        return;
    }

    // Se NÃO tiver arquivos gerados ainda: exibe os subtópicos salvos no meta
    const subtopics = meta.subtopics || [];

    if (subtopics.length > 0) {
        if (subEl) {
            subEl.innerHTML = `Planejamento de <strong>${subtopics.length} subtópicos</strong> cadastrados. Clique em <em>Pesquisar Agora</em> para que a IA sintetize e gere os arquivos físicos.`;
        }

        contentEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
                <div style="font-size:12px; color:var(--text-secondary);">
                    Local físico: <code style="font-size:11px; background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">projects/${escapeHtml(currentProject)}/RESEARCH/${escapeHtml(slug)}/</code>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button class="btn-rl-action" onclick="openResearchFolderInExplorer('${escapeHtml(slug)}')">
                        <span>📂</span> Abrir Pasta no Explorer
                    </button>
                    <button class="btn-decompose-preview" onclick="forceReDecompose('${escapeHtml(slug)}', '${escapeHtml(topic).replace(/'/g, "\\'")}', '${escapeHtml(definition).replace(/'/g, "\\'")}')" title="Pede à IA para gerar uma nova divisão temática de subtópicos">
                        <span>🔄 Re-decompor com IA</span>
                    </button>
                    <button class="btn-rl-action primary" onclick="startLiveResearchFromModal('${escapeHtml(slug)}', '${escapeHtml(topic).replace(/'/g, "\\'")}')" title="Executar pesquisa e gerar arquivos físicos no disco com acompanhamento ao vivo">
                        <span>▶️</span> Pesquisar Agora
                    </button>
                </div>
            </div>
            <div class="rl-subtopic-list">
                ${subtopics.map(st => {
                    const layerTooltip = st.layer === 'actionable'
                        ? '🛠️ Actionable — Especificação prática e código adaptado à stack'
                        : '📘 Knowledge — Conhecimento teórico e conceitual';
                    return `
                        <div class="rl-subtopic-item">
                            <div class="rl-subtopic-top">
                                <div style="display:flex; align-items:flex-start; gap:10px; min-width:0; flex:1;">
                                    <span class="rl-layer-icon-tip" title="${layerTooltip}">
                                        ${st.layer === 'actionable' ? '🛠️' : '📘'}
                                    </span>
                                    <div style="min-width:0; flex:1;">
                                        <div class="rl-subtopic-name" style="color:#ffffff; font-weight:700; font-size:13.5px;">${escapeHtml(st.title || st.name)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="rl-subtopic-desc" style="margin-top:6px;">${escapeHtml(st.description || st.goal || '')}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        return;
    }

    // Caso não tenha nem arquivos e nem subtopics no meta: aciona a IA
    forceReDecompose(slug, topic, definition);
}

// ═══════════════════════════════════════════════════
// RESEARCH LAB — SÍNTESE EM TEMPO REAL & PROGRESSO AO VIVO
// ═══════════════════════════════════════════════════

let isResearchRunningLive = false;
let activeLiveSlug = null;

/**
 * Inicia a execução da pesquisa em modo ao vivo mantendo o modal aberto com animação
 */
async function startLiveResearchFromModal(slug, topic) {
    const proj = currentProject || (currentProjectData && currentProjectData.name);
    if (!proj || !slug) return;

    const modal = document.getElementById('decomposeModal');
    if (!modal) return;

    activeResearchSlug = slug;
    activeLiveSlug = slug;
    isResearchRunningLive = true;

    // Garante que o modal está visível
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Obtém o objeto da pesquisa
    const research = (currentResearchesList || []).find(r => r.slug === slug) || { slug, topic };
    const meta = research.meta || {};
    const effectiveTopic = topic || research.topic || meta.topic || slug;
    const subtopics = meta.subtopics || [];

    const titleEl = document.getElementById('decModalTitle');
    const subEl = document.getElementById('decModalSub');
    const contentEl = document.getElementById('decModalContent');

    if (titleEl) titleEl.textContent = `Síntese em Tempo Real: ${effectiveTopic}`;
    if (subEl) subEl.innerHTML = `O motor neural está sintetizando e catalogando os documentos no disco. Acompanhe o progresso de cada tópico ao vivo.`;

    // Renderiza a interface de execução ao vivo com o painel de progresso e os cards
    let subtopicsHtml = '';
    if (subtopics.length > 0) {
        subtopicsHtml = subtopics.map((st, i) => {
            const index = i + 1;
            const layerTooltip = st.layer === 'actionable'
                ? '🛠️ Actionable — Especificação prática e código adaptado à stack'
                : '📘 Knowledge — Conhecimento teórico e conceitual';
            return `
                <div id="rl-live-card-${index}" class="rl-subtopic-item live-pending" data-index="${index}">
                    <div class="rl-subtopic-top">
                        <div style="display:flex; align-items:flex-start; gap:10px; min-width:0; flex:1;">
                            <span class="rl-layer-icon-tip" title="${layerTooltip}">
                                ${st.layer === 'actionable' ? '🛠️' : '📘'}
                            </span>
                            <div style="min-width:0; flex:1;">
                                <div id="rl-live-card-title-${index}" class="rl-live-card-title" style="color:#ffffff; font-weight:700; font-size:13.5px;">${escapeHtml(st.title || st.name)}</div>
                                <div id="rl-live-card-file-${index}" style="font-family:var(--font-mono); font-size:10px; color:var(--text-tertiary); margin-top:2px;">
                                    ${st.layer === 'actionable' ? 'actionable/' : 'knowledge/'}...
                                </div>
                            </div>
                        </div>
                        <span id="rl-live-badge-${index}" class="rl-live-badge pending">⏳ Na Fila</span>
                    </div>
                    <div class="rl-subtopic-desc" style="margin-top:6px;">${escapeHtml(st.description || st.goal || '')}</div>
                </div>
            `;
        }).join('');
    } else {
        subtopicsHtml = `
            <div id="rl-live-loading-subtopics" style="text-align:center; padding:30px 20px; color:var(--text-tertiary);">
                <div class="rl-live-spinner" style="width:24px; height:24px; margin-bottom:10px;"></div>
                <div>Aguardando mapeamento de subtópicos pela IA...</div>
            </div>
        `;
    }

    contentEl.innerHTML = `
        <div class="rl-live-progress-container">
            <div class="rl-live-progress-top">
                <div class="rl-live-engine-tag">
                    <span class="rl-live-dot-pulse"></span>
                    <span>Groq Cloud &middot; Síntese Autônoma em Tempo Real</span>
                </div>
                <div id="rlLiveCounter" class="rl-live-counter">0 / ${subtopics.length || '?'} concluídos (0%)</div>
            </div>
            <div id="rlLiveStatusHeadline" class="rl-live-headline">
                <span class="rl-live-spinner"></span>
                <span id="rlLiveStatusText">Inicializando motor de pesquisa com IA...</span>
            </div>
            <div id="rlLiveStatusSub" class="rl-live-sub">
                Conectando ao modelo neural e preparando a síntese no disco...
            </div>
            <div class="rl-live-bar-track">
                <div id="rlLiveBarFill" class="rl-live-bar-fill" style="width: 0%;"></div>
            </div>
            <div id="rlLiveCompletedActions" style="display:none; margin-top:14px;"></div>
        </div>

        <div id="rlLiveListContainer" class="rl-subtopic-list">
            ${subtopicsHtml}
        </div>
    `;

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('executar o motor autônomo de síntese da Groq');
        isResearchRunningLive = false;
        return;
    }

    // Dispara a chamada ao servidor
    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(proj)}/research/${encodeURIComponent(slug)}/run`, {
            method: 'POST'
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Falha ao iniciar motor de pesquisa.');
        }

        const data = await res.json();
        console.log('✅ Pesquisa concluída com sucesso:', data);
        finalizeLiveResearch(slug, effectiveTopic, data);

    } catch (err) {
        console.error('❌ Erro na execução da pesquisa:', err);
        const headline = document.getElementById('rlLiveStatusHeadline');
        const sub = document.getElementById('rlLiveStatusSub');
        if (headline) {
            headline.innerHTML = `⚠️ <span style="color:#ef4444;">Erro na execução</span>`;
        }
        if (sub) {
            sub.innerHTML = `${escapeHtml(err.message)} <br><button class="btn-rl-action" style="margin-top:8px;" onclick="startLiveResearchFromModal('${escapeHtml(slug)}', '${escapeHtml(effectiveTopic).replace(/'/g, "\\'")}')">🔄 Tentar Novamente</button>`;
        }
        showToast('Erro ao executar pesquisa: ' + err.message, 'error', 6000);
    } finally {
        isResearchRunningLive = false;
    }
}

/**
 * Handler invocado via SSE em tempo real a cada evento do motor de pesquisa
 */
function handleResearchLiveProgress(info) {
    if (!info) return;
    console.log('⚡ [Live Research SSE]:', info);

    const headlineText = document.getElementById('rlLiveStatusText');
    const headline = document.getElementById('rlLiveStatusHeadline');
    const sub = document.getElementById('rlLiveStatusSub');
    const bar = document.getElementById('rlLiveBarFill');
    const counter = document.getElementById('rlLiveCounter');

    if (info.step === 'decomposing') {
        if (headlineText) headlineText.textContent = 'Mapeando árvore de subtópicos com IA...';
        if (sub) sub.textContent = 'Consultando o modelo neural Groq Cloud para taxonomia de conhecimento...';
    }

    if (info.step === 'decomposed' && Array.isArray(info.subtopics)) {
        const listContainer = document.getElementById('rlLiveListContainer');
        if (listContainer) {
            listContainer.innerHTML = info.subtopics.map((st, i) => {
                const index = i + 1;
                const layerTooltip = st.layer === 'actionable'
                    ? '🛠️ Actionable — Especificação prática e código adaptado à stack'
                    : '📘 Knowledge — Conhecimento teórico e conceitual';
                return `
                    <div id="rl-live-card-${index}" class="rl-subtopic-item live-pending" data-index="${index}">
                        <div class="rl-subtopic-top">
                            <div style="display:flex; align-items:flex-start; gap:10px; min-width:0; flex:1;">
                                <span class="rl-layer-icon-tip" title="${layerTooltip}">
                                    ${st.layer === 'actionable' ? '🛠️' : '📘'}
                                </span>
                                <div style="min-width:0; flex:1;">
                                    <div id="rl-live-card-title-${index}" class="rl-live-card-title" style="color:#ffffff; font-weight:700; font-size:13.5px;">${escapeHtml(st.title || st.name)}</div>
                                    <div id="rl-live-card-file-${index}" style="font-family:var(--font-mono); font-size:10px; color:var(--text-tertiary); margin-top:2px;">
                                        ${st.layer === 'actionable' ? 'actionable/' : 'knowledge/'}...
                                    </div>
                                </div>
                            </div>
                            <span id="rl-live-badge-${index}" class="rl-live-badge pending">⏳ Na Fila</span>
                        </div>
                        <div class="rl-subtopic-desc" style="margin-top:6px;">${escapeHtml(st.description || st.goal || '')}</div>
                    </div>
                `;
            }).join('');
        }
        if (counter) counter.textContent = `0 / ${info.total} concluídos (0%)`;
    }

    if (info.step === 'synthesizing') {
        const curr = info.current || 1;
        const total = info.total || 8;
        const pct = Math.max(3, Math.round(((curr - 1) / total) * 100));

        if (headline) {
            headline.innerHTML = `<span class="rl-live-spinner"></span> <span>Sintetizando [${curr}/${total}]: ${escapeHtml(info.subtopic || '')}</span>`;
        }
        if (sub) {
            sub.textContent = `Pesquisando fundamentos, boas práticas e gerando documentação técnica em ${info.layer || 'knowledge'}/...`;
        }
        if (bar) bar.style.width = pct + '%';
        if (counter) counter.textContent = `${curr - 1} / ${total} concluídos (${pct}%)`;

        // Atualiza o card específico
        const card = document.getElementById(`rl-live-card-${curr}`);
        if (card) {
            card.classList.remove('live-pending');
            card.classList.remove('live-completed');
            card.classList.add('live-active');

            const badge = document.getElementById(`rl-live-badge-${curr}`);
            if (badge) {
                badge.className = 'rl-live-badge active';
                badge.innerHTML = `<span class="rl-live-spinner"></span> Sintetizando com IA...`;
            }
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    if (info.step === 'file-generated') {
        const curr = info.current || 1;
        const total = info.total || 8;
        const pct = Math.round((curr / total) * 100);

        if (headline) {
            headline.innerHTML = `<span>✓ [${curr}/${total}] Arquivo gerado: ${escapeHtml(info.file || '')}</span>`;
        }
        if (sub) {
            sub.textContent = `Gravação física realizada com sucesso no disco em ${escapeHtml(info.path || '')}.`;
        }
        if (bar) bar.style.width = pct + '%';
        if (counter) counter.textContent = `${curr} / ${total} concluídos (${pct}%)`;

        // Atualiza o card para completed
        const card = document.getElementById(`rl-live-card-${curr}`);
        if (card) {
            card.classList.remove('live-pending');
            card.classList.remove('live-active');
            card.classList.add('live-completed');

            const badge = document.getElementById(`rl-live-badge-${curr}`);
            if (badge) {
                badge.className = 'rl-live-badge completed';
                badge.innerHTML = `✅ Gerado ${info.reused ? '(Reaproveitado)' : ''}`;
            }

            const fileEl = document.getElementById(`rl-live-card-file-${curr}`);
            if (fileEl && info.path) {
                fileEl.style.color = '#34d399';
                fileEl.textContent = info.path;
            }

            const titleEl = document.getElementById(`rl-live-card-title-${curr}`);
            if (titleEl && info.path) {
                const fullRelPath = `projects/${currentProject}/RESEARCH/${info.slug || activeLiveSlug}/${info.path}`;
                titleEl.innerHTML = `<a class="rl-subtopic-link" onclick="openFileEditor('${escapeHtml(fullRelPath)}'); closeDecomposeModal();" title="Clique para ler ou editar este documento">${escapeHtml(info.subtopic || '')}</a>`;
            }
        }
    }

    if (info.step === 'completed') {
        finalizeLiveResearch(info.slug || activeLiveSlug, info.topic, info);
    }
}
window.handleResearchLiveProgress = handleResearchLiveProgress;

/**
 * Finaliza visualmente a pesquisa em tempo real com estado comemorativo e ações rápidas
 */
async function finalizeLiveResearch(slug, topic, data) {
    const headline = document.getElementById('rlLiveStatusHeadline');
    const sub = document.getElementById('rlLiveStatusSub');
    const bar = document.getElementById('rlLiveBarFill');
    const counter = document.getElementById('rlLiveCounter');
    const actionsBox = document.getElementById('rlLiveCompletedActions');

    if (headline) {
        headline.innerHTML = `🎉 <span>Síntese Concluída com Sucesso!</span>`;
    }
    if (sub) {
        const count = data?.generatedCount || data?.total || 8;
        sub.innerHTML = `Todos os <strong>${count} documentos</strong> foram sintetizados e gravados no disco em <code>knowledge/</code> e <code>actionable/</code>.`;
    }
    if (bar) {
        bar.style.width = '100%';
        bar.classList.add('completed-glow');
    }
    if (counter) {
        counter.textContent = `100% Concluído`;
    }

    if (actionsBox) {
        actionsBox.style.display = 'flex';
        actionsBox.style.gap = '10px';
        actionsBox.style.flexWrap = 'wrap';
        actionsBox.style.alignItems = 'center';
        actionsBox.innerHTML = `
            <button class="btn-rl-action" onclick="openResearchFolderInExplorer('${escapeHtml(slug)}')">
                <span>📂</span> Abrir Pasta no Explorer
            </button>
            <button class="btn-rl-action" onclick="openOverviewDoc('${escapeHtml(slug)}'); closeDecomposeModal();">
                <span>📄</span> Ver OVERVIEW.md
            </button>
            <button class="btn-rl-action primary" onclick="refreshAndRenderDecomposeModal('${escapeHtml(slug)}')">
                <span>✓</span> Ver Catálogo Completo &amp; Gerenciar
            </button>
        `;
    }

    showSecondBrainToast(`🎉 Pesquisa concluída! Arquivos salvos e prontos para navegação.`);

    // Recarrega lista e atualiza aba no background
    const proj = currentProject || (currentProjectData && currentProjectData.name);
    if (proj) {
        try {
            const rRes = await fetch(`/api/projects/${encodeURIComponent(proj)}/research`);
            if (rRes.ok) {
                const rData = await rRes.json();
                currentResearchesList = rData.researches || [];
                renderProjectResearchTab();
            }
        } catch(e) {}
    }
}

async function refreshAndRenderDecomposeModal(slug) {
    const proj = currentProject || (currentProjectData && currentProjectData.name);
    if (!proj) return;
    try {
        const rRes = await fetch(`/api/projects/${encodeURIComponent(proj)}/research`);
        if (rRes.ok) {
            const rData = await rRes.json();
            currentResearchesList = rData.researches || [];
            const updated = currentResearchesList.find(r => r.slug === slug);
            if (updated) {
                renderDecomposeModalContent(updated);
            }
        }
    } catch(e) {}
}

let currentProposedSubtopics = null;


/**
 * Consulta a IA para gerar novos subtópicos sob demanda
 */
async function forceReDecompose(slug, topic, definition) {
    const subEl = document.getElementById('decModalSub');
    const contentEl = document.getElementById('decModalContent');
    if (!contentEl) return;

    if (subEl) subEl.textContent = 'Mapeando nova proposta de subtópicos com o modelo Groq Cloud...';

    contentEl.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color: var(--text-tertiary);">
            <div class="ai-sparkles" style="font-size:32px; margin-bottom:12px; display:inline-block;">🔮</div>
            <div>Consultando IA para mapear subtópicos estruturados...</div>
        </div>
    `;

    try {
        const res = await fetch('/api/ai/decompose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, definition })
        });

        if (!res.ok) throw new Error('Não foi possível decompor este tema.');
        const data = await res.json();
        const subtopics = data.subtopics || [];
        currentProposedSubtopics = subtopics;

        if (subEl) {
            subEl.innerHTML = `✨ A IA sugeriu <strong>${subtopics.length} novos subtópicos</strong>. Clique em <em>Aplicar Proposta</em> para salvar no contrato da pesquisa.`;
        }

        contentEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
                <div style="font-size:12px; color:var(--text-secondary);">
                    Local físico: <code style="font-size:11px; background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">projects/${escapeHtml(currentProject)}/RESEARCH/${escapeHtml(slug)}/</code>
                </div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <button class="btn-rl-action" onclick="openResearchFolderInExplorer('${escapeHtml(slug)}')">
                        <span>📂</span> Abrir Pasta no Explorer
                    </button>
                    <button class="btn-decompose-preview" onclick="cancelProposedSubtopics('${escapeHtml(slug)}')" title="Descarta esta proposta e volta ao plano anterior">
                        <span>↩️</span> Manter Anterior
                    </button>
                    <button class="btn-decompose-preview" onclick="forceReDecompose('${escapeHtml(slug)}', '${escapeHtml(topic).replace(/'/g, "\\'")}', '${escapeHtml(definition).replace(/'/g, "\\'")}')" title="Pede para a IA gerar uma proposta diferente">
                        <span>🔄</span> Gerar Nova Proposta
                    </button>
                    <button class="btn-rl-action primary" onclick="applyProposedSubtopics('${escapeHtml(slug)}', '${escapeHtml(topic).replace(/'/g, "\\'")}')" title="Salva esta nova estrutura de subtópicos no contrato da pesquisa">
                        <span>✅</span> Aplicar Proposta
                    </button>
                </div>
            </div>
            <div class="rl-subtopic-list">
                ${subtopics.map(st => {
                    const layerTooltip = st.layer === 'actionable'
                        ? '🛠️ Actionable — Especificação prática e código adaptado à stack'
                        : '📘 Knowledge — Conhecimento teórico e conceitual';
                    return `
                        <div class="rl-subtopic-item">
                            <div class="rl-subtopic-top">
                                <div style="display:flex; align-items:flex-start; gap:10px; min-width:0; flex:1;">
                                    <span class="rl-layer-icon-tip" title="${layerTooltip}">
                                        ${st.layer === 'actionable' ? '🛠️' : '📘'}
                                    </span>
                                    <div style="min-width:0; flex:1;">
                                        <div class="rl-subtopic-name" style="color:#ffffff; font-weight:700; font-size:13.5px;">${escapeHtml(st.title || st.name)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="rl-subtopic-desc" style="margin-top:6px;">${escapeHtml(st.description || st.goal || '')}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (err) {
        contentEl.innerHTML = `
            <div style="color:var(--danger); padding:16px;">
                Erro ao decompor tópicos: ${escapeHtml(err.message)}
            </div>
        `;
    }
}

/**
 * Aplica os subtópicos propostos pela IA salvando-os no _meta.json do projeto
 */
async function applyProposedSubtopics(slug, topic) {
    if (!currentProposedSubtopics || currentProposedSubtopics.length === 0) return;
    const proj = currentProject || (currentProjectData && currentProjectData.name);
    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(proj)}/research/${encodeURIComponent(slug)}/subtopics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subtopics: currentProposedSubtopics })
        });
        if (!res.ok) throw new Error('Falha ao salvar novos subtópicos.');
        
        showSecondBrainToast('✅ Nova estrutura de subtópicos salva no contrato da pesquisa!');

        // Atualiza a lista em memória
        const rRes = await fetch(`/api/projects/${encodeURIComponent(proj)}/research`);
        if (rRes.ok) {
            const data = await rRes.json();
            currentResearchesList = data.researches || [];
            const updated = currentResearchesList.find(r => r.slug === slug);
            if (updated) {
                renderDecomposeModalContent(updated);
            }
        }
    } catch (err) {
        showToast('Erro ao aplicar proposta: ' + err.message, 'error', 4000);
    }
}

/**
 * Descarta a proposta gerada e recarrega os subtópicos salvos no contrato
 */
async function cancelProposedSubtopics(slug) {
    const proj = currentProject || (currentProjectData && currentProjectData.name);
    const updated = (currentResearchesList || []).find(r => r.slug === slug);
    if (updated) {
        renderDecomposeModalContent(updated);
        showToast('↩️ Proposta descartada. Plano anterior preservado.', 'info', 3000);
    } else {
        closeDecomposeModal();
    }
}

/**
 * Exclui um documento individual da pesquisa
 */
async function confirmDeleteResearchFile(slug, relPath, title) {
    const ok = await showBrainConfirm({
        title: 'Excluir Documento',
        badge: '🗑️ EXCLUSÃO PERMANENTE',
        icon: '🗑️',
        message: `Tem certeza que deseja excluir o documento <strong>"${escapeHtml(title)}"</strong>?<br><br><span style="color:var(--text-tertiary); font-size:12px; font-family:var(--font-mono);">${escapeHtml(relPath)}</span><br><br>Esta ação removerá o arquivo físico do disco e atualizará o índice <code>OVERVIEW.md</code>.`,
        confirmText: 'Excluir Documento',
        cancelText: 'Cancelar',
        danger: true
    });
    if (!ok) return;

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('excluir arquivos físicos do disco');
        return;
    }

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/research/${encodeURIComponent(slug)}/file/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ relPath })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Erro ao excluir arquivo.');
        }

        showSecondBrainToast(`🗑️ Documento "${title}" excluído do disco com sucesso!`);

        // Recarrega pesquisas do projeto para sincronizar tudo
        const researchRes = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/research`);
        if (researchRes.ok) {
            const data = await researchRes.json();
            currentResearchesList = data.researches || [];
            const updated = currentResearchesList.find(r => r.slug === slug);
            if (updated) {
                renderDecomposeModalContent(updated);
            } else {
                closeDecomposeModal();
            }
            // Atualiza contadores no card
            renderProjectResearchTab();
        }
    } catch (err) {
        showToast('Erro ao excluir: ' + err.message, 'error', 5000);
    }
}

/**
 * Exclui permanentemente um laboratório de pesquisa e todos os seus arquivos
 */
async function confirmDeleteResearchLab(slug, topic) {
    const ok = await showBrainConfirm({
        title: 'Excluir Laboratório de Pesquisa',
        badge: '⚠️ ATENÇÃO &middot; EXCLUSÃO TOTAL',
        icon: '⚠️',
        message: `Tem certeza que deseja excluir permanentemente o laboratório <strong>"${escapeHtml(topic)}"</strong>?<br><br>Todos os arquivos em <code>knowledge/</code> e <code>actionable/</code> desta pesquisa serão apagados do disco.`,
        confirmText: 'Excluir Laboratório e Arquivos',
        cancelText: 'Cancelar',
        danger: true
    });
    if (!ok) return;

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('excluir laboratórios de pesquisa no disco');
        return;
    }

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(currentProject)}/research/${encodeURIComponent(slug)}/delete`, {
            method: 'POST'
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Erro ao excluir pesquisa.');
        }

        showSecondBrainToast(`🗑️ Laboratório "${topic}" excluído com sucesso!`);
        await renderProjectResearchTab();
    } catch (err) {
        showToast('Erro ao excluir laboratório: ' + err.message, 'error', 5000);
    }
}

function closeDecomposeModal() {
    const modal = document.getElementById('decomposeModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleDecomposeBackdropClick(e) {
    if (e.target && e.target.id === 'decomposeModal') {
        closeDecomposeModal();
    }
}

/**
 * Abre o arquivo OVERVIEW.md da pesquisa no editor/visualizador do Brain UI
 */
function openOverviewDoc(slug) {
    const path = `projects/${currentProject}/RESEARCH/${slug}/OVERVIEW.md`;
    if (typeof navigateTo === 'function') {
        navigateTo(path);
    } else {
        openFileEditor(path);
    }
}

/**
 * Abre a pasta da pesquisa no Windows Explorer
 */
async function openResearchFolderInExplorer(slug) {
    const proj = currentProject || (currentProjectData && currentProjectData.name);
    if (!proj) {
        showToast('Projeto não selecionado.', 'error');
        return;
    }
    const folderPath = `projects/${proj}/RESEARCH/${slug}`;
    await openSystemFolder(folderPath);
}

/**
 * Exclui todos os arquivos gerados de uma pesquisa após confirmação explícita do usuário
 */
async function confirmDeleteAllResearchFiles(slug, topic) {
    const ok = await showBrainConfirm({
        title: 'Excluir Todos os Arquivos',
        badge: '⚠️ EXCLUSÃO EM MASSA',
        icon: '🗑️',
        message: `Tem certeza que deseja excluir <strong>TODOS os arquivos</strong> do laboratório <strong>"${escapeHtml(topic)}"</strong>?<br><br>Todos os documentos gerados em <code>knowledge/</code> e <code>actionable/</code> serão permanentemente excluídos do disco.<br><br><em>A definição, prompt vivo e histórico de versões serão preservados.</em>`,
        confirmText: 'Excluir Todos os Arquivos',
        cancelText: 'Cancelar',
        danger: true
    });
    if (!ok) return;

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('excluir arquivos gerados no disco');
        return;
    }

    try {
        const proj = currentProject || (currentProjectData && currentProjectData.name);
        const res = await fetch(`/api/projects/${encodeURIComponent(proj)}/research/${encodeURIComponent(slug)}/clear-files`, {
            method: 'POST'
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Erro ao excluir arquivos.');
        }

        const data = await res.json();
        showSecondBrainToast(`🗑️ Todos os arquivos da pesquisa "${topic}" foram excluídos do disco!`);

        // Recarrega pesquisas do projeto para sincronizar tudo
        const researchRes = await fetch(`/api/projects/${encodeURIComponent(proj)}/research`);
        if (researchRes.ok) {
            const rData = await researchRes.json();
            currentResearchesList = rData.researches || [];
            const updated = currentResearchesList.find(r => r.slug === slug);
            if (updated) {
                renderDecomposeModalContent(updated);
            } else {
                closeDecomposeModal();
            }
            // Atualiza contadores no card
            renderProjectResearchTab();
        }
    } catch (err) {
        showToast('Erro ao excluir arquivos: ' + err.message, 'error', 5000);
    }
}

// ════════════════════════════════════════════════════════════
// AI GATEWAY MULTI-PROVEDOR (BYOK) — CONTROLLER COMPLETO
// Experiência UX/UI de Alta Fidelidade com Teste ao Vivo & Synaptic Pulse
// ════════════════════════════════════════════════════════════

const AI_PROVIDER_PRESETS = {
    groq: {
        name: 'Groq Cloud',
        icon: '🌐',
        tag: 'Gratuito & Ultra-rápido LPU',
        placeholder: 'Cole sua chave aqui...',
        requiresKey: true,
        baseUrl: 'https://api.groq.com/openai/v1'
    },
    openai: {
        name: 'OpenAI',
        icon: '🧠',
        tag: 'GPT & Raciocínio Avançado',
        placeholder: 'Cole sua chave aqui...',
        requiresKey: true,
        baseUrl: 'https://api.openai.com/v1'
    },
    anthropic: {
        name: 'Anthropic Claude',
        icon: '⚡',
        tag: 'Claude & Análise Profunda',
        placeholder: 'Cole sua chave aqui...',
        requiresKey: true,
        baseUrl: 'https://api.anthropic.com/v1'
    },
    openrouter: {
        name: 'OpenRouter',
        icon: '🚀',
        tag: 'Multi-modelos & Hub Unificado',
        placeholder: 'Cole sua chave aqui...',
        requiresKey: true,
        baseUrl: 'https://openrouter.ai/api/v1'
    },
    ollama: {
        name: 'Ollama Local',
        icon: '🦙',
        tag: '100% Local · Sem Nuvem · Zero Custo',
        placeholder: '(Não requer chave para Ollama local)',
        requiresKey: false,
        baseUrl: 'http://localhost:11434/v1'
    },
    custom: {
        name: 'Endpoint Customizado',
        icon: '⚙️',
        tag: 'OpenAI-Compatible REST API',
        placeholder: 'Cole sua chave aqui (se necessária)...',
        requiresKey: false,
        baseUrl: 'http://localhost:8000/v1'
    }
};

window.AI_GATEWAY_CONFIG = null;

/**
 * Carrega a configuração e status da IA e atualiza o badge na Topbar
 */
async function loadAiGatewayStatus() {
    try {
        const res = await fetch('/api/ai/config');
        if (!res.ok) throw new Error('Não foi possível obter configuração de IA.');
        const config = await res.json();
        window.AI_GATEWAY_CONFIG = config;
        updateAiGatewayPillUI(config);

        if (!config.configured && !localStorage.getItem('ai_onboarding_shown') && isLocalEnvironment()) {
            localStorage.setItem('ai_onboarding_shown', '1');
            setTimeout(() => {
                openAiWelcomeModal();
            }, 800);
        }
    } catch (err) {
        console.warn('⚠️ [AI Gateway] Modo offline ou demo web:', err.message);
        const demoConfig = {
            configured: false,
            provider: 'groq',
            providerName: 'Groq Cloud',
            model: 'llama-3.3-70b-versatile'
        };
        window.AI_GATEWAY_CONFIG = demoConfig;
        updateAiGatewayPillUI(demoConfig);
    }
}

/**
 * Atualiza o Pill na Topbar (#btnAiGatewayModal)
 */
function updateAiGatewayPillUI(config) {
    const btn = document.getElementById('btnAiGatewayModal');
    const label = document.getElementById('aiStatusPillProvider');
    const dot = document.getElementById('aiStatusPillDot');
    if (!btn || !label) return;

    btn.classList.remove('connected', 'unconfigured', 'quota-exceeded');

    if (config.configured) {
        btn.classList.add('connected');
        const shortModel = (config.model || '').split('/').pop();
        label.textContent = `⚡ ${config.providerName || config.provider} • ${shortModel}`;
        btn.title = `Motor Ativo: ${config.providerName || config.provider} (${config.model || 'Padrão'}). Clique para gerenciar BYOK.`;
        if (dot) dot.className = 'status-dot live';
    } else {
        btn.classList.add('unconfigured');
        label.textContent = `Conectar IA (BYOK)`;
        btn.title = `Nenhuma IA configurada. Clique para conectar Groq, OpenAI, Claude ou Ollama.`;
        if (dot) dot.className = 'status-dot snapshot';
    }
}

/**
 * Dispara o Pulso Sináptico 3D no Three.js
 */
function triggerSynapticPulse() {
    console.log('⚡ [AI Gateway] Disparando pulso sináptico nos neurônios do Grafo 3D!');
    if (graph && typeof graph.pulseSurge === 'function') {
        graph.pulseSurge();
    }
    if (projectGraph && typeof projectGraph.pulseSurge === 'function') {
        projectGraph.pulseSurge();
    }
}
window.triggerSynapticPulse = triggerSynapticPulse;

/**
 * Modal 1: Onboarding / Boas-Vindas ("Conectar Cérebro Digital")
 */
function openAiWelcomeModal() {
    const modal = document.getElementById('aiWelcomeModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeAiWelcomeModal() {
    const modal = document.getElementById('aiWelcomeModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleAiWelcomeBackdropClick(e) {
    if (e.target && e.target.id === 'aiWelcomeModal') {
        closeAiWelcomeModal();
    }
}

function proceedFromWelcomeToSettings() {
    closeAiWelcomeModal();
    openAiSettingsModal();
}

/**
 * Modal 2: Principal BYOK (Configuração de IA)
 */
/**
 * Popula e sincroniza as opções do dropdown de modelos de IA
 */
function populateAiModelSelect(modelList, selectedModelId) {
    const modelSelect = document.getElementById('aiModelSelect');
    const customInput = document.getElementById('aiCustomModelInput');
    if (!modelSelect || !Array.isArray(modelList) || modelList.length === 0) return;

    const previousVal = selectedModelId || (isManualModelMode && customInput?.value.trim() ? customInput.value.trim() : modelSelect.value);
    modelSelect.innerHTML = '';

    modelList.forEach(m => {
        let id = '';
        let label = '';
        if (typeof m === 'string') {
            id = m;
            label = m;
        } else if (m && typeof m === 'object') {
            id = m.id || m.name || m.value || '';
            const name = m.name || m.label || m.displayName || m.display_name || id;
            const ctx = m.contextWindow ? ` — ${Math.round(m.contextWindow / 1024)}k contexto` : '';
            label = (name && name !== id && !name.includes(id)) 
                ? `${name} (${id})${ctx}` 
                : `${id}${ctx}`;
        }
        if (!id) return;

        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = label;
        modelSelect.appendChild(opt);
    });

    const optionsArray = Array.from(modelSelect.options);
    if (previousVal && optionsArray.some(o => o.value === previousVal)) {
        modelSelect.value = previousVal;
    } else if (modelSelect.options.length > 0) {
        modelSelect.selectedIndex = 0;
    }

    if (customInput && (!customInput.value || !isManualModelMode)) {
        customInput.value = modelSelect.value;
    }
}

async function openAiSettingsModal() {
    const modal = document.getElementById('aiSettingsModal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const feedback = document.getElementById('aiTestFeedback');
    if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'ai-test-feedback';
        feedback.innerHTML = '';
    }

    try {
        const res = await fetch('/api/ai/config');
        if (res.ok) {
            window.AI_GATEWAY_CONFIG = await res.json();
        }
    } catch (e) {}

    const cfg = window.AI_GATEWAY_CONFIG || { provider: 'groq' };

    const providerSelect = document.getElementById('aiProviderSelect');
    if (providerSelect && cfg.provider) {
        providerSelect.value = cfg.provider;
    }

    onProviderSelectChange();

    const keyInput = document.getElementById('aiApiKeyInput');
    if (keyInput) {
        keyInput.value = cfg.apiKeyMasked || '';
        keyInput.dataset.isMasked = cfg.hasKey ? 'true' : 'false';
        if (!keyInput.dataset.hasInputKeyReset) {
            keyInput.dataset.hasInputKeyReset = 'true';
            keyInput.addEventListener('input', () => {
                keyInput.dataset.isMasked = 'false';
                setAiTestButtonStatus('idle');
                const prov = document.getElementById('aiProviderSelect')?.value || 'groq';
                updateAiTerminalStatus('idle', { provider: prov });
            });
        }
    }

    if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'ai-test-feedback';
        feedback.innerHTML = '';
    }

    const modelStepTitle = document.getElementById('aiModelStepTitle');
    if (modelStepTitle) {
        modelStepTitle.textContent = '3. Modelo de IA';
    }

    const baseUrlInput = document.getElementById('aiBaseUrlInput');
    if (baseUrlInput) {
        baseUrlInput.value = cfg.baseUrl || '';
    }

    // Reseta modo de modelo para o padrão (dropdown dinâmico)
    setManualModelMode(false);

    // Sincroniza mudanças no dropdown com o input manual alternativo
    const modelSelect = document.getElementById('aiModelSelect');
    const customModelInput = document.getElementById('aiCustomModelInput');

    if (customModelInput && cfg.model) {
        customModelInput.value = cfg.model;
    }

    if (modelSelect && !modelSelect.dataset.hasInputSync) {
        modelSelect.dataset.hasInputSync = 'true';
        modelSelect.addEventListener('change', () => {
            const input = document.getElementById('aiCustomModelInput');
            if (input && modelSelect.value) {
                input.value = modelSelect.value;
            }
        });
    }

    // Sincroniza Parâmetros de Execução com a configuração real do .env
    const cacheInput = document.getElementById('aiCacheHoursInput');
    if (cacheInput) {
        const hours = (cfg.cacheHours !== undefined && cfg.cacheHours !== null && !isNaN(cfg.cacheHours)) 
            ? cfg.cacheHours 
            : 24;
        cacheInput.value = `${hours}h`;
        cacheInput.closest('.ai-param-detail-input-wrap')?.classList.remove('input-error');
    }

    const retriesInput = document.getElementById('aiMaxRetriesInput');
    if (retriesInput) {
        const retries = (cfg.maxRetries !== undefined && cfg.maxRetries !== null && !isNaN(cfg.maxRetries)) 
            ? cfg.maxRetries 
            : 2;
        retriesInput.value = retries;
        retriesInput.closest('.ai-param-detail-input-wrap')?.classList.remove('input-error');
    }

    // Inicializa restrições de digitação e validação contínua nos parâmetros
    setupAiParamsInputValidation();

    // Ao abrir a tela: se já configurado com chave válida (ou provedor local sem chave),
    // provoca automaticamente o botão testar para validar a conexão, medir a latência real
    // e carregar os modelos disponíveis diretamente da API em tempo real (zero listas fixas)
    const preset = AI_PROVIDER_PRESETS[cfg.provider] || AI_PROVIDER_PRESETS.groq;
    const canAutoTest = (cfg.hasKey && cfg.configured) || (!preset.requiresKey && cfg.configured);

    if (canAutoTest) {
        testCurrentAiConnection();
    } else {
        updateAiTerminalStatus('idle', {
            provider: cfg.provider || 'groq'
        });
    }
}

/**
 * Atualiza o estado visual do botão de teste de chave (ícone de chave com neon cintilante)
 * @param {'idle' | 'testing' | 'success' | 'valid' | 'error' | 'invalid'} status
 */
function setAiTestButtonStatus(status) {
    const btn = document.getElementById('btnTestAiConnection');
    if (!btn) return;

    btn.classList.remove('is-testing', 'is-valid', 'is-success', 'is-invalid', 'is-error');

    if (status === 'testing') {
        btn.classList.add('is-testing');
        btn.disabled = true;
        btn.title = 'Testando conexão e validando chave...';
    } else if (status === 'success' || status === 'valid') {
        btn.classList.add('is-valid');
        btn.disabled = false;
        btn.title = 'Provedor e chave validados com sucesso (Conectado)';
    } else if (status === 'error' || status === 'invalid') {
        btn.classList.add('is-invalid');
        btn.disabled = false;
        btn.title = 'Falha na validação da chave (Clique para tentar novamente)';
    } else {
        btn.disabled = false;
        btn.title = 'Testar e validar chave da API';
    }
}

/**
 * Atualiza o Console do Terminal ao Vivo no Modal de Configuração de IA
 * @param {'idle' | 'testing' | 'success' | 'error'} status 
 * @param {Object} details 
 */
function updateAiTerminalStatus(status, details = {}) {
    const term = document.getElementById('aiModalTerminalOutput');
    if (!term) return;

    // Sincroniza o botão da chave com o status
    setAiTestButtonStatus(status);

    const card = term.closest('.ai-card-terminal') || document.getElementById('aiModalTerminalCard');
    const providerRaw = details.provider || document.getElementById('aiProviderSelect')?.value || 'groq';
    const providerPreset = (window.AI_PROVIDER_PRESETS && window.AI_PROVIDER_PRESETS[providerRaw]) || {};
    const providerName = providerPreset.name || providerRaw.toUpperCase();
    const providerUpper = providerRaw.toUpperCase();

    // Remove todas as classes de estado anteriores
    const stateClasses = ['is-idle', 'is-testing', 'is-success', 'is-error'];
    if (card) {
        card.classList.remove(...stateClasses);
        card.classList.add(`is-${status}`);
    }
    term.classList.remove(...stateClasses);
    term.classList.add(`is-${status}`);

    if (status === 'idle') {
        term.innerHTML = `<code><span class="t-dim">$</span> ENGINE: ${escapeHtml(providerUpper)} [STANDBY]
<span class="t-amber">[IDLE]</span> Clique no botão da chave para validar a API Key
<span class="t-dim">LOCAL .ENV ENCRYPTION · ISOLADO</span></code>`;
    } else if (status === 'testing') {
        term.innerHTML = `<code><span class="t-cyan">$</span> CONNECTING TO ${escapeHtml(providerUpper)} ENGINE...
<span class="t-cyan">[WAIT]</span> Handshake HTTP e medição de latência...
<span class="t-cyan">[SCAN]</span> Descobrindo catálogo de modelos na conta...
<span class="t-dim">LOCAL .ENV ENCRYPTION</span></code>`;
    } else if (status === 'success') {
        const latency = details.latencyMs ? `${details.latencyMs}ms` : 'sub-100ms';
        const models = details.modelCount !== undefined ? details.modelCount : 0;
        const modelsText = models > 0 ? `${models} modelo${models > 1 ? 's' : ''} compatíve${models > 1 ? 'is' : 'l'}` : '0 modelos detectados';
        term.innerHTML = `<code><span class="t-matrix">$</span> CONNECTED TO ${escapeHtml(providerUpper)} [AUTHENTICATED]
<span class="t-matrix">[OK]</span> Conexão bem-sucedida · Latência: ${escapeHtml(latency)}
<span class="t-matrix">[OK]</span> Modelos detectados · ${escapeHtml(modelsText)}
<span class="t-matrix">LOCAL .ENV ENCRYPTION · PRONTO PARA ATIVAR</span></code>`;
    } else if (status === 'error') {
        const errorMsg = details.error || `Informe uma API Key para o provedor ${providerName}`;
        term.innerHTML = `<code><span class="t-red">$</span> ERROR CONNECTING TO ${escapeHtml(providerUpper)} [FAILED]
<span class="t-red">[FAIL]</span> ${escapeHtml(errorMsg)}
<span class="t-red">LOCAL .ENV ENCRYPTION · VERIFIQUE A CHAVE</span></code>`;
    }
}

function closeAiSettingsModal() {
    const modal = document.getElementById('aiSettingsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleAiSettingsBackdropClick(e) {
    if (e.target && e.target.id === 'aiSettingsModal') {
        closeAiSettingsModal();
    }
}

/**
 * Evento disparado ao trocar de Provedor
 */
function onProviderSelectChange() {
    const providerSelect = document.getElementById('aiProviderSelect');
    if (!providerSelect) return;

    const providerId = providerSelect.value;
    const preset = AI_PROVIDER_PRESETS[providerId] || AI_PROVIDER_PRESETS.groq;

    const iconEl = document.getElementById('aiProviderIcon');
    if (iconEl) iconEl.textContent = preset.icon;

    const keyInput = document.getElementById('aiApiKeyInput');
    const keyGroup = document.getElementById('aiApiKeyGroup');
    const keySubtitle = document.getElementById('aiKeySubtitle');
    if (keyInput) {
        keyInput.placeholder = preset.placeholder;
        if (window.AI_GATEWAY_CONFIG?.hasKey && window.AI_GATEWAY_CONFIG?.provider === providerId) {
            keyInput.value = window.AI_GATEWAY_CONFIG.apiKeyMasked || '';
            keyInput.dataset.isMasked = 'true';
        } else {
            keyInput.value = '';
            keyInput.dataset.isMasked = 'false';
        }
    }

    if (keySubtitle) {
        keySubtitle.innerHTML = preset.requiresKey
            ? `Sua chave é criptografada em repouso no <code>.env</code> local e usada apenas para processar suas pesquisas.`
            : `O provedor <strong>${preset.name}</strong> roda localmente e não requer autenticação na nuvem.`;
    }

    // Exibe Base URL se Ollama ou Custom
    const baseUrlGroup = document.getElementById('aiBaseUrlGroup');
    const baseUrlInput = document.getElementById('aiBaseUrlInput');
    if (baseUrlGroup) {
        const showUrl = providerId === 'ollama' || providerId === 'custom';
        baseUrlGroup.style.display = showUrl ? 'flex' : 'none';
        if (baseUrlInput) {
            if (showUrl) {
                baseUrlInput.value = (window.AI_GATEWAY_CONFIG?.provider === providerId ? window.AI_GATEWAY_CONFIG.baseUrl : '') || preset.baseUrl || '';
            } else {
                baseUrlInput.value = '';
            }
        }
    }

    // Popula modelos no Dropdown (100% dinâmico via API) — Restaura modelos se já carregados para este provedor
    const modelSelect = document.getElementById('aiModelSelect');
    const customModelInput = document.getElementById('aiCustomModelInput');
    const savedCfg = window.AI_GATEWAY_CONFIG;
    const isCurrentActiveProvider = savedCfg && savedCfg.provider === providerId && Array.isArray(savedCfg.models) && savedCfg.models.length > 0;

    if (modelSelect) {
        if (isCurrentActiveProvider) {
            populateAiModelSelect(savedCfg.models, savedCfg.model);
        } else {
            modelSelect.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Clique no botão da chave acima para listar os modelos disponíveis...';
            modelSelect.appendChild(opt);
            if (customModelInput) customModelInput.value = '';
        }
    }

    // Ao mudar o provedor, zera completamente os textos de feedback e contadores
    const feedback = document.getElementById('aiTestFeedback');
    if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'ai-test-feedback';
        feedback.innerHTML = '';
    }

    const modelStepTitle = document.getElementById('aiModelStepTitle');
    if (modelStepTitle) {
        modelStepTitle.textContent = '3. Modelo de IA';
    }

    const badge = document.getElementById('aiModelCountBadge');
    if (badge) badge.style.display = 'none';

    // Atualiza o Mini Console: SUCCESS se é o provedor já autenticado, IDLE caso contrário
    if (isCurrentActiveProvider && savedCfg.hasKey && savedCfg.configured) {
        updateAiTerminalStatus('success', {
            provider: providerId,
            latencyMs: savedCfg.latencyMs,
            modelCount: savedCfg.models.length
        });
    } else {
        updateAiTerminalStatus('idle', { provider: providerId });
    }
}

/**
 * Alternância entre Seleção por Dropdown e Digitação Manual de Modelo
 */
let isManualModelMode = false;

function setManualModelMode(active) {
    isManualModelMode = !!active;
    const selectWrap = document.getElementById('aiModelSelectWrap');
    const customWrap = document.getElementById('aiCustomModelWrap');
    const toggleBtn = document.getElementById('btnToggleManualModel');
    const select = document.getElementById('aiModelSelect');
    const input = document.getElementById('aiCustomModelInput');

    if (isManualModelMode) {
        if (selectWrap) selectWrap.style.display = 'none';
        if (customWrap) customWrap.style.display = 'block';
        if (toggleBtn) toggleBtn.innerHTML = '📋 Selecionar da lista de modelos disponíveis';
        if (input && select && select.value && !input.value) {
            input.value = select.value;
        }
        if (input) input.focus();
    } else {
        if (selectWrap) selectWrap.style.display = 'block';
        if (customWrap) customWrap.style.display = 'none';
        if (toggleBtn) toggleBtn.innerHTML = '✏️ Digitar ID manualmente';
        if (input && input.value.trim() && select) {
            const val = input.value.trim();
            const exists = Array.from(select.options).some(o => o.value === val);
            if (!exists) {
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = `${val} (Manual)`;
                select.appendChild(opt);
            }
            select.value = val;
        }
    }
}

function toggleManualModelMode() {
    setManualModelMode(!isManualModelMode);
}

/**
 * Alternar visibilidade da API Key (olho)
 */
function toggleAiKeyVisibility() {
    const input = document.getElementById('aiApiKeyInput');
    const btn = document.getElementById('btnToggleAiKeyVisibility');
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        if (btn) btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    } else {
        input.type = 'password';
        if (btn) btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }
}

/**
 * Testa a conexão com a API em tempo real (Ping BYOK)
 */
async function testCurrentAiConnection() {
    const provider = document.getElementById('aiProviderSelect')?.value || 'groq';
    let apiKey = document.getElementById('aiApiKeyInput')?.value || '';
    const keyInput = document.getElementById('aiApiKeyInput');
    const baseUrl = document.getElementById('aiBaseUrlInput')?.value || '';
    const model = document.getElementById('aiModelSelect')?.value || '';
    const providerPreset = AI_PROVIDER_PRESETS[provider] || AI_PROVIDER_PRESETS.groq;

    const isCurrentProvSaved = !!(window.AI_GATEWAY_CONFIG?.hasKey && window.AI_GATEWAY_CONFIG?.provider === provider);

    // Se o campo ainda tem a máscara de bolinhas ou se está vazio mas a chave já está salva no .env
    if ((keyInput && keyInput.dataset.isMasked === 'true' && apiKey.includes('••••')) || (!apiKey && isCurrentProvSaved)) {
        apiKey = ''; // O backend lerá a chave salva do process.env
    }

    if (providerPreset.requiresKey && !apiKey && !isCurrentProvSaved) {
        updateAiTerminalStatus('error', {
            provider,
            error: `Informe uma API Key para o provedor ${providerPreset.name || provider.toUpperCase()}`
        });
        keyInput?.focus();
        return;
    }

    const btn = document.getElementById('btnTestAiConnection');
    setAiTestButtonStatus('testing');
    updateAiTerminalStatus('testing', { provider });

    try {
        const res = await fetch('/api/ai/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, apiKey, baseUrl, model })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            const modelList = Array.isArray(data.models) ? data.models : [];
            const modelCount = modelList.length;

            if (modelCount === 0) {
                updateAiTerminalStatus('error', {
                    provider,
                    error: `Conectado, mas nenhum modelo de chat compatível foi detectado para ${providerPreset.name || provider.toUpperCase()}.`
                });
                return;
            }

            updateAiTerminalStatus('success', {
                provider,
                latencyMs: data.latencyMs,
                modelCount
            });

            const modelStepTitle = document.getElementById('aiModelStepTitle');
            if (modelStepTitle) {
                modelStepTitle.textContent = '3. Modelo de IA';
            }

            const badge = document.getElementById('aiModelCountBadge');
            if (badge) badge.style.display = 'none';

            // Atualiza cache de modelos e latência na sessão
            if (window.AI_GATEWAY_CONFIG) {
                window.AI_GATEWAY_CONFIG.models = modelList;
                window.AI_GATEWAY_CONFIG.modelCount = modelCount;
                window.AI_GATEWAY_CONFIG.latencyMs = data.latencyMs;
            }

            // Popula os modelos retornados pela API se disponíveis
            const modelSelect = document.getElementById('aiModelSelect');
            const customInput = document.getElementById('aiCustomModelInput');
            if (modelSelect && modelCount > 0) {
                const configuredModel = window.AI_GATEWAY_CONFIG?.model || '';
                const previousVal = isManualModelMode && customInput?.value.trim()
                    ? customInput.value.trim()
                    : (modelSelect.value || configuredModel || model);
                populateAiModelSelect(modelList, previousVal);
            }
        } else {
            const modelStepTitle = document.getElementById('aiModelStepTitle');
            if (modelStepTitle) {
                modelStepTitle.textContent = '3. Modelo de IA';
            }

            const errorMsg = data.error || (data.details ? data.details : `Informe uma API Key para o provedor ${providerPreset.name || provider.toUpperCase()}`);

            updateAiTerminalStatus('error', {
                provider,
                error: errorMsg
            });

            if (data.quotaExceeded || res.status === 429) {
                setTimeout(() => {
                    closeAiSettingsModal();
                    showQuotaExceededModal(data.error);
                }, 1200);
            }
        }
    } catch (err) {
        const modelStepTitle = document.getElementById('aiModelStepTitle');
        if (modelStepTitle) {
            modelStepTitle.textContent = '3. Modelo de IA';
        }

        updateAiTerminalStatus('error', {
            provider,
            error: err.message || 'Falha de rede ao conectar'
        });
    } finally {
        if (btn && !btn.classList.contains('is-testing')) {
            btn.disabled = false;
        }
    }
}

/**
 * Configura restrição de digitação, sanitização e normalização para os parâmetros de IA
 */
function setupAiParamsInputValidation() {
    const cacheInput = document.getElementById('aiCacheHoursInput');
    const retriesInput = document.getElementById('aiMaxRetriesInput');

    if (cacheInput && !cacheInput.dataset.hasValidation) {
        cacheInput.dataset.hasValidation = 'true';

        // Previne caracteres inválidos na digitação (permite apenas 0-9, h, H e teclas de navegação)
        cacheInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const allowedControlKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter', 'Escape'
            ];
            if (allowedControlKeys.includes(e.key)) return;

            // Permite 'h' ou 'H' se ainda não houver 'h' no campo
            if ((e.key === 'h' || e.key === 'H') && !cacheInput.value.toLowerCase().includes('h')) {
                return;
            }

            // Permite dígitos de 0 a 9
            if (/^[0-9]$/.test(e.key)) {
                return;
            }

            e.preventDefault();
        });

        // Limpa erros e caracteres espúrios no input (ex: colar via clipboard)
        cacheInput.addEventListener('input', () => {
            cacheInput.closest('.ai-param-detail-input-wrap')?.classList.remove('input-error');
            let val = cacheInput.value.replace(/[^0-9hH]/g, '');
            const digits = val.replace(/\D/g, '');
            const hasH = /h/i.test(val);
            cacheInput.value = hasH ? `${digits}h` : digits;
        });

        // No blur, normaliza o formato para ${horas}h e assegura intervalo permitido (1h a 720h)
        cacheInput.addEventListener('blur', () => {
            const wrap = cacheInput.closest('.ai-param-detail-input-wrap');
            const digits = cacheInput.value.replace(/\D/g, '');
            let hours = parseInt(digits, 10);
            if (isNaN(hours) || hours < 1) {
                hours = 1;
            } else if (hours > 720) {
                hours = 720;
            }
            cacheInput.value = `${hours}h`;
            wrap?.classList.remove('input-error');
        });
    }

    if (retriesInput && !retriesInput.dataset.hasValidation) {
        retriesInput.dataset.hasValidation = 'true';

        // Bloqueia teclas proibidas em input number: '-', '+', 'e', 'E', '.', ','
        retriesInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const allowedControlKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End', 'Enter', 'Escape'
            ];
            if (allowedControlKeys.includes(e.key)) return;

            // Bloqueia expressamente sinais e notação científica
            if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
                e.preventDefault();
                return;
            }

            // Permite dígitos de 0 a 9
            if (/^[0-9]$/.test(e.key)) {
                return;
            }

            e.preventDefault();
        });

        // Garante que o valor digitado fique estritamente entre 0 e 5
        retriesInput.addEventListener('input', () => {
            retriesInput.closest('.ai-param-detail-input-wrap')?.classList.remove('input-error');
            let val = retriesInput.value.replace(/\D/g, '');
            if (val !== '') {
                let n = parseInt(val, 10);
                if (n > 5) n = 5;
                if (n < 0) n = 0;
                retriesInput.value = n;
            }
        });

        retriesInput.addEventListener('blur', () => {
            const wrap = retriesInput.closest('.ai-param-detail-input-wrap');
            if (retriesInput.value === '' || isNaN(parseInt(retriesInput.value, 10))) {
                retriesInput.value = '2';
            } else {
                let n = parseInt(retriesInput.value, 10);
                if (n > 5) n = 5;
                if (n < 0) n = 0;
                retriesInput.value = n;
            }
            wrap?.classList.remove('input-error');
        });
    }
}

/**
 * Salvar e Ativar Configurações de IA
 */
async function handleSaveAiSettings(e) {
    if (e) e.preventDefault();

    const provider = document.getElementById('aiProviderSelect')?.value || 'groq';
    let apiKey = document.getElementById('aiApiKeyInput')?.value || '';
    const keyInput = document.getElementById('aiApiKeyInput');
    const baseUrl = document.getElementById('aiBaseUrlInput')?.value || '';
    let model = '';
    if (isManualModelMode) {
        model = (document.getElementById('aiCustomModelInput')?.value || '').trim();
    } else {
        model = (document.getElementById('aiModelSelect')?.value || '').trim();
    }
    if (!model) {
        model = (document.getElementById('aiModelSelect')?.value || document.getElementById('aiCustomModelInput')?.value || '').trim();
    }
    const preset = AI_PROVIDER_PRESETS[provider] || AI_PROVIDER_PRESETS.groq;
    const isCurrentProvSaved = !!(window.AI_GATEWAY_CONFIG?.hasKey && window.AI_GATEWAY_CONFIG?.provider === provider);

    if (preset.requiresKey && !apiKey && !isCurrentProvSaved) {
        updateAiTerminalStatus('error', {
            provider,
            error: `Informe uma API Key para o provedor ${preset.name || provider.toUpperCase()}`
        });
        keyInput?.focus();
        return;
    }

    if (!model) {
        updateAiTerminalStatus('error', {
            provider,
            error: 'Selecione ou informe um modelo de IA antes de salvar e ativar.'
        });
        const select = document.getElementById('aiModelSelect');
        select?.focus();
        return;
    }

    // Validação defensiva mandatória de Cache TTL (1h a 720h)
    const cacheInput = document.getElementById('aiCacheHoursInput');
    const cacheWrap = cacheInput?.closest('.ai-param-detail-input-wrap');
    const cacheDigits = (cacheInput?.value || '').replace(/\D/g, '');
    const cacheHours = parseInt(cacheDigits, 10);

    if (!cacheDigits || isNaN(cacheHours) || cacheHours < 1 || cacheHours > 720) {
        cacheWrap?.classList.add('input-error');
        updateAiTerminalStatus('error', {
            provider,
            error: 'Parâmetro inválido: Cache TTL deve ser um número inteiro entre 1h e 720h (máx. 30 dias).'
        });
        cacheInput?.focus();
        return;
    }

    // Validação defensiva mandatória de Retries (0 a 5)
    const retriesInput = document.getElementById('aiMaxRetriesInput');
    const retriesWrap = retriesInput?.closest('.ai-param-detail-input-wrap');
    const retriesRaw = (retriesInput?.value || '').trim();
    const retriesDigits = retriesRaw.replace(/\D/g, '');
    const maxRetries = parseInt(retriesDigits, 10);

    if (retriesRaw === '' || isNaN(maxRetries) || maxRetries < 0 || maxRetries > 5) {
        retriesWrap?.classList.add('input-error');
        updateAiTerminalStatus('error', {
            provider,
            error: 'Parâmetro inválido: Tentativas Automáticas (Retries) deve ser um número entre 0 e 5.'
        });
        retriesInput?.focus();
        return;
    }

    if (keyInput && keyInput.dataset.isMasked === 'true' && apiKey.includes('••••')) {
        apiKey = '';
    }

    const btn = document.getElementById('btnSaveAiSettings');
    const spinner = document.getElementById('aiSaveSpinner');
    const btnText = document.getElementById('aiSaveBtnText');

    if (btn) btn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';
    if (btnText) btnText.textContent = 'Salvando e Ativando...';

    try {
        const res = await fetch('/api/ai/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                provider,
                apiKey,
                baseUrl,
                model,
                cacheHours,
                maxRetries
            })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Erro ao gravar configurações.');
        }

        window.AI_GATEWAY_CONFIG = data.config;
        updateAiGatewayPillUI(data.config);

        closeAiSettingsModal();

        const provName = AI_PROVIDER_PRESETS[provider]?.name || provider;
        showToast(`⚡ Cérebro Digital Conectado: ${provName} ativado com sucesso!`, 'success', 5000);
        triggerSynapticPulse();

        if (currentView === 'project-workspace' && currentProjectTab === 'research') {
            renderProjectResearchTab();
        }

    } catch (err) {
        alert('Erro ao salvar configuração de IA: ' + err.message);
    } finally {
        if (btn) btn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (btnText) btnText.textContent = 'Salvar e Ativar ⚡';
    }
}

/**
 * Modal 3: Alerta de Cota de IA Esgotada (429 Rate Limit)
 */
function showQuotaExceededModal(customMsg) {
    const modal = document.getElementById('aiQuotaModal');
    if (!modal) return;

    if (customMsg) {
        const descEl = modal.querySelector('.ai-quota-desc');
        if (descEl) descEl.textContent = customMsg;
    }

    const btn = document.getElementById('btnAiGatewayModal');
    if (btn) {
        btn.classList.add('quota-exceeded');
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAiQuotaModal() {
    const modal = document.getElementById('aiQuotaModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleAiQuotaBackdropClick(e) {
    if (e.target && e.target.id === 'aiQuotaModal') {
        closeAiQuotaModal();
    }
}

function proceedFromQuotaToSettings() {
    closeAiQuotaModal();
    openAiSettingsModal();
}

// Fechamento via tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const welcome = document.getElementById('aiWelcomeModal');
        const settings = document.getElementById('aiSettingsModal');
        const quota = document.getElementById('aiQuotaModal');

        if (quota && quota.style.display === 'flex') {
            closeAiQuotaModal();
            return;
        }
        if (settings && settings.style.display === 'flex') {
            closeAiSettingsModal();
            return;
        }
        if (welcome && welcome.style.display === 'flex') {
            closeAiWelcomeModal();
            return;
        }
    }
});

// Exportações globais de controle
window.loadAiGatewayStatus = loadAiGatewayStatus;
window.openAiWelcomeModal = openAiWelcomeModal;
window.closeAiWelcomeModal = closeAiWelcomeModal;
window.handleAiWelcomeBackdropClick = handleAiWelcomeBackdropClick;
window.proceedFromWelcomeToSettings = proceedFromWelcomeToSettings;
window.openAiSettingsModal = openAiSettingsModal;
window.closeAiSettingsModal = closeAiSettingsModal;
window.handleAiSettingsBackdropClick = handleAiSettingsBackdropClick;
window.onProviderSelectChange = onProviderSelectChange;
window.toggleAiKeyVisibility = toggleAiKeyVisibility;
window.toggleManualModelMode = toggleManualModelMode;
window.setManualModelMode = setManualModelMode;
window.testCurrentAiConnection = testCurrentAiConnection;
window.updateAiTerminalStatus = updateAiTerminalStatus;
window.handleSaveAiSettings = handleSaveAiSettings;
window.showQuotaExceededModal = showQuotaExceededModal;
window.closeAiQuotaModal = closeAiQuotaModal;
window.handleAiQuotaBackdropClick = handleAiQuotaBackdropClick;
window.proceedFromQuotaToSettings = proceedFromQuotaToSettings;

// ═══════════════════════════════════════════════════════════
// SESSION CAPTURE — Registrar Sessão com IA
// Fluxo: coleta determinística (git + contratos) → IA redige rascunho →
// revisão humana item a item → só então grava (sessão, CURRENT_STATE, lições).
// ═══════════════════════════════════════════════════════════
let sessionCaptureState = { project: null, notes: '', draft: null, model: '', busy: false };

function scEl(id) { return document.getElementById(id); }

function setSessionCaptureStep(step) {
    const map = { input: 'scStepInput', loading: 'scStepLoading', review: 'scStepReview' };
    Object.entries(map).forEach(([key, id]) => {
        const el = scEl(id);
        if (el) el.style.display = key === step ? 'block' : 'none';
    });
    const show = (id, visible) => { const el = scEl(id); if (el) el.style.display = visible ? '' : 'none'; };
    show('btnScGenerate', step === 'input');
    show('btnScRegenerate', step === 'review');
    show('btnScCommit', step === 'review');
    const sub = scEl('scModalSub');
    if (sub) {
        sub.textContent = step === 'review'
            ? 'Revise e ajuste o rascunho. Nada é gravado em disco até você confirmar.'
            : step === 'loading'
                ? 'A IA está lendo o contexto do projeto…'
                : 'A IA lê seus commits, arquivos alterados e notas e propõe o registro da sessão.';
    }
}

function setSessionCaptureStatus(html) {
    const el = scEl('scStatus');
    if (el) el.innerHTML = html || '';
}

function openSessionCaptureModal() {
    const project = currentProjectData ? currentProjectData.name : currentProject;
    if (!project) return;
    sessionCaptureState = { project, notes: '', draft: null, model: '', busy: false };

    const notesInput = scEl('scNotesInput');
    if (notesInput) notesInput.value = '';
    const projLabel = scEl('scProjectLabel');
    if (projLabel) projLabel.textContent = project;

    setSessionCaptureStep('input');
    setSessionCaptureStatus('');
    const modal = scEl('sessionCaptureModal');
    if (modal) modal.style.display = 'flex';
    setTimeout(() => notesInput && notesInput.focus(), 60);
}

async function closeSessionCaptureModal(force = false) {
    const st = sessionCaptureState;
    if (st.busy && !force) return;
    if (!force && st.draft) {
        const ok = await showBrainConfirm({
            title: 'Descartar rascunho da sessão?',
            badge: '🧠 SESSÃO',
            icon: '🧠',
            message: 'O rascunho gerado pela IA ainda não foi gravado e será perdido.',
            confirmText: 'Descartar',
            cancelText: 'Continuar revisando',
            danger: true
        });
        if (!ok) return;
    }
    const modal = scEl('sessionCaptureModal');
    if (modal) modal.style.display = 'none';
    sessionCaptureState = { project: null, notes: '', draft: null, model: '', busy: false };
}

function handleSessionCaptureBackdropClick(event) {
    if (event.target && event.target.id === 'sessionCaptureModal') closeSessionCaptureModal();
}

async function generateSessionDraft(regenerate = false) {
    const st = sessionCaptureState;
    if (!st.project || st.busy) return;

    if (!regenerate) {
        st.notes = (scEl('scNotesInput')?.value || '').trim();
    }

    st.busy = true;
    setSessionCaptureStep('loading');
    setSessionCaptureStatus('<span class="pulse-dot"></span> Consultando a IA…');
    const btnGen = scEl('btnScGenerate');
    if (btnGen) btnGen.disabled = true;

    // Feedback visual dinâmico com mensagens rotativas
    let scLoadingMsgIdx = 0;
    const scLoadingMessages = [
        { msg: '🔍 Lendo commits e arquivos alterados no Git...', step: 1 },
        { msg: '📄 Cruzando com contratos (PROJECT.md, CURRENT_STATE.md)...', step: 2 },
        { msg: '⚖️ Consultando lições aprendidas e ADRs existentes...', step: 3 },
        { msg: '✨ Sintetizando resumo de governança com IA para sua revisão...', step: 4 }
    ];
    const updateScLoadingState = (idx) => {
        const item = scLoadingMessages[idx % scLoadingMessages.length];
        const liveMsg = scEl('scLoadingLiveMsg');
        if (liveMsg) liveMsg.textContent = item.msg;
        for (let i = 1; i <= 4; i++) {
            const stepEl = scEl(`scStep${i}`);
            if (stepEl) {
                stepEl.classList.toggle('active', i === item.step);
                stepEl.classList.toggle('completed', i < item.step);
            }
        }
    };
    updateScLoadingState(0);
    clearInterval(window._scLoadingTimer);
    window._scLoadingTimer = setInterval(() => {
        scLoadingMsgIdx++;
        updateScLoadingState(scLoadingMsgIdx);
    }, 2200);

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(st.project)}/session/draft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: st.notes, regenerate: !!regenerate })
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            setSessionCaptureStep('input');
            if (res.status === 429 || data.quotaExceeded) {
                setSessionCaptureStatus('<span class="status-dot" style="background:#f59e0b"></span> Cota de IA esgotada.');
                showQuotaExceededModal(data.error);
                return;
            }
            const needsConfig = /Chave de API|modelo de IA|Nenhum modelo/i.test(data.error || '');
            setSessionCaptureStatus(
                `<span class="status-dot" style="background:#ef4444"></span> ${escapeHtml(data.error || 'Falha ao gerar o rascunho.')}` +
                (needsConfig ? ' <button type="button" class="sc-link-btn" onclick="openAiSettingsModal()">Abrir configurações de IA</button>' : '')
            );
            return;
        }

        st.draft = data.draft;
        st.model = data.model || '';
        renderSessionReview(data);
        setSessionCaptureStep('review');
        setSessionCaptureStatus(`<span class="status-dot" style="background:#10b981"></span> Rascunho pronto em ${data.inferenceMs || '?'}ms`);
    } catch (err) {
        setSessionCaptureStep('input');
        setSessionCaptureStatus(`<span class="status-dot" style="background:#ef4444"></span> ${escapeHtml(err.message)}`);
    } finally {
        if (window._scLoadingTimer) {
            clearInterval(window._scLoadingTimer);
            window._scLoadingTimer = null;
        }
        st.busy = false;
        if (btnGen) btnGen.disabled = false;
    }
}

function renderSessionReview(data) {
    const el = scEl('scStepReview');
    const d = data.draft;
    if (!el || !d) return;

    const git = data.git || {};
    const gitChip = git.available
        ? `🌿 ${escapeHtml(git.branch || 'git')} · ${git.commits} commit(s)${git.since ? ' desde ' + escapeHtml(git.since) : ''} · ${git.changedFiles} arquivo(s) não commitado(s)`
        : `⚠️ Git indisponível — baseado apenas nas suas notas`;
    const aiChip = `✨ ${escapeHtml(data.provider || 'ia')} · ${escapeHtml(data.model || '')}`;

    const itemRows = (items, cls) => items.map(text => `
        <label class="sc-item-row">
            <input type="checkbox" class="sc-chk ${cls}" checked>
            <input type="text" class="rl-form-input sc-item-input" value="${escapeHtml(text)}" maxlength="220">
        </label>`).join('');

    const completedHtml = d.completedSteps.length ? d.completedSteps.map(s => `
        <label class="sc-item-row">
            <input type="checkbox" class="sc-chk sc-completed" checked data-text="${escapeHtml(s.text)}">
            <span class="sc-item-text"><s>${escapeHtml(s.text)}</s> <em>→ mover para “Já definido”</em></span>
        </label>`).join('') : '<div class="sc-empty">Nenhum próximo passo concluído com evidência nesta sessão.</div>';

    const lessonsHtml = d.lessons.length ? d.lessons.map((l, i) => `
        <label class="sc-lesson">
            <input type="checkbox" class="sc-chk sc-lesson-chk" checked data-index="${i}">
            <span>
                <strong>${escapeHtml(l.title)}</strong>
                <span class="sc-lesson-text">${escapeHtml(l.learning)}</span>
                ${l.action ? `<span class="sc-lesson-action">Ação: ${escapeHtml(l.action)}</span>` : ''}
            </span>
        </label>`).join('') : '<div class="sc-empty">Nenhuma lição não óbvia identificada.</div>';

    const adrHtml = d.adrCandidates.length ? `
        <div class="sc-section">
            <div class="sc-section-title">⚖️ Possíveis decisões arquiteturais <span class="sc-badge">sugestão</span></div>
            <ul class="sc-adr-list">${d.adrCandidates.map(a => `<li><strong>${escapeHtml(a.title)}</strong>${a.reason ? ' — ' + escapeHtml(a.reason) : ''}</li>`).join('')}</ul>
            <span class="rl-hint">Registre-as depois em <code>DECISIONS/</code> pelo botão de decisão arquitetural do projeto.</span>
        </div>` : '';

    el.innerHTML = `
        <div class="sc-chips">
            <span class="sc-chip">${gitChip}</span>
            <span class="sc-chip sc-chip-ai">${aiChip}</span>
        </div>

        <div class="rl-form-group">
            <label class="rl-form-label" for="scTitleInput">Título da sessão</label>
            <input id="scTitleInput" class="rl-form-input" type="text" maxlength="90" value="${escapeHtml(d.title)}">
        </div>

        <div class="rl-form-group">
            <label class="rl-form-label" for="scSummaryInput">Registro da sessão <span class="rl-hint" style="display:inline;margin-left:6px;">(Markdown · editável) → <code>MEMORY/sessions/</code></span></label>
            <textarea id="scSummaryInput" class="rl-form-textarea sc-summary" rows="10">${escapeHtml(d.summaryMarkdown)}</textarea>
        </div>

        <div class="sc-section">
            <div class="sc-section-title">✅ Próximos passos concluídos</div>
            ${completedHtml}
        </div>

        <div class="sc-section">
            <div class="sc-section-title">📌 Novos itens “Já definido”</div>
            ${d.newDefinedItems.length ? itemRows(d.newDefinedItems, 'sc-defined') : '<div class="sc-empty">Nenhum item novo.</div>'}
        </div>

        <div class="sc-section">
            <div class="sc-section-title">🎯 Novos próximos passos <span class="sc-badge">somente pendências citadas</span></div>
            ${d.newNextSteps.length ? itemRows(d.newNextSteps, 'sc-next') : '<div class="sc-empty">Nenhuma pendência nova identificada.</div>'}
        </div>

        <div class="sc-section">
            <div class="sc-section-title">📚 Lições aprendidas <span class="sc-badge">→ LESSONS_LEARNED.md</span></div>
            ${lessonsHtml}
        </div>

        ${adrHtml}
    `;
}

async function commitSessionDraft() {
    const st = sessionCaptureState;
    if (!st.project || !st.draft || st.busy) return;

    const root = scEl('scStepReview');
    const checkedValues = cls => Array.from(root.querySelectorAll(`.${cls}:checked`))
        .map(chk => chk.closest('.sc-item-row')?.querySelector('.sc-item-input')?.value.trim() || '')
        .filter(Boolean);

    const payload = {
        title: (scEl('scTitleInput')?.value || '').trim(),
        summaryMarkdown: (scEl('scSummaryInput')?.value || '').trim(),
        completedSteps: Array.from(root.querySelectorAll('.sc-completed:checked')).map(chk => chk.dataset.text),
        newDefinedItems: checkedValues('sc-defined'),
        newNextSteps: checkedValues('sc-next'),
        lessons: Array.from(root.querySelectorAll('.sc-lesson-chk:checked')).map(chk => st.draft.lessons[parseInt(chk.dataset.index, 10)]).filter(Boolean),
        model: st.model
    };

    if (!payload.title || !payload.summaryMarkdown) {
        setSessionCaptureStatus('<span class="status-dot" style="background:#ef4444"></span> Título e registro da sessão não podem ficar vazios.');
        return;
    }

    const btn = scEl('btnScCommit');
    st.busy = true;
    if (btn) { btn.disabled = true; btn.textContent = 'Gravando…'; }

    try {
        const res = await fetch(`/api/projects/${encodeURIComponent(st.project)}/session/commit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Falha ao gravar a sessão.');

        const project = st.project;
        const parts = [`sessão ${data.sessionFileName}`];
        if (data.movedSteps) parts.push(`${data.movedSteps} passo(s) concluído(s)`);
        if (data.addedSteps) parts.push(`${data.addedSteps} novo(s) passo(s)`);
        if (data.lessonsAdded) parts.push(`${data.lessonsAdded} lição(ões)`);
        showSecondBrainToast(`🧠 Memória atualizada: ${parts.join(' · ')}`);

        st.busy = false;
        await closeSessionCaptureModal(true);
        await openProjectWorkspace(project, 'memory');
    } catch (err) {
        setSessionCaptureStatus(`<span class="status-dot" style="background:#ef4444"></span> ${escapeHtml(err.message)}`);
    } finally {
        st.busy = false;
        if (btn) { btn.disabled = false; btn.textContent = '💾 Gravar na memória'; }
    }
}

window.openSessionCaptureModal = openSessionCaptureModal;
window.closeSessionCaptureModal = closeSessionCaptureModal;
window.handleSessionCaptureBackdropClick = handleSessionCaptureBackdropClick;
window.generateSessionDraft = generateSessionDraft;
window.commitSessionDraft = commitSessionDraft;


// Carrega status da IA automaticamente após carregar a interface
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAiGatewayStatus);
} else {
    loadAiGatewayStatus();
}





