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

function openAiDecisionFlowHelpModal(stepId) {
    const modal = document.getElementById('aiDecisionFlowHelpModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        if (stepId) {
            const target = document.getElementById(`aiFlowStep_${stepId}`);
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.remove('ai-step-highlight-pulse');
                    void target.offsetWidth;
                    target.classList.add('ai-step-highlight-pulse');
                    setTimeout(() => {
                        target.classList.remove('ai-step-highlight-pulse');
                    }, 2400);
                }, 100);
            }
        }
    }
}

function closeAiDecisionFlowHelpModal() {
    const modal = document.getElementById('aiDecisionFlowHelpModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleAiDecisionFlowHelpBackdropClick(event) {
    if (event.target && event.target.id === 'aiDecisionFlowHelpModal') {
        closeAiDecisionFlowHelpModal();
    }
}

function openBrainMetricsHelpModal() {
    const modal = document.getElementById('brainMetricsHelpModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeBrainMetricsHelpModal() {
    const modal = document.getElementById('brainMetricsHelpModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleBrainMetricsHelpBackdropClick(event) {
    if (event.target && event.target.id === 'brainMetricsHelpModal') {
        closeBrainMetricsHelpModal();
    }
}

// Suporte à tecla ESC para fechar modais de ajuda e atalhos globais
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('projSearchInput');
        if (searchInput && document.activeElement === searchInput) {
            clearProjectSearch();
            searchInput.blur();
            return;
        }

        const engineModal = document.getElementById('aiEngineHelpModal');
        if (engineModal && engineModal.style.display === 'flex') {
            closeAiEngineHelpModal();
        }
        const flowModal = document.getElementById('aiDecisionFlowHelpModal');
        if (flowModal && flowModal.style.display === 'flex') {
            closeAiDecisionFlowHelpModal();
        }
        const metricsModal = document.getElementById('brainMetricsHelpModal');
        if (metricsModal && metricsModal.style.display === 'flex') {
            closeBrainMetricsHelpModal();
        }
    } else if ((e.key === '/' || e.code === 'Slash' || e.code === 'NumpadDivide') && (currentView === 'dashboard' || document.getElementById('dashboardOverlay')?.classList.contains('active'))) {
        const activeTag = (document.activeElement && document.activeElement.tagName) || '';
        const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';

        // Verifica se há algum modal aberto no momento
        const isModalOpen = Array.from(document.querySelectorAll('.modal, .brain-dialog-overlay, .ai-welcome-modal')).some(m => {
            return m.style.display === 'flex' || m.style.display === 'block';
        });

        if (!isInput && !isModalOpen) {
            const searchInput = document.getElementById('projSearchInput');
            if (searchInput) {
                e.preventDefault();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                searchInput.focus();
                searchInput.select();
            }
        }
    } else if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.closest && e.target.closest('.flow-diagram')) {
        const btn = e.target.closest('[role="button"]');
        if (btn) {
            e.preventDefault();
            btn.click();
        }
    }
});

window.openAiEngineHelpModal = openAiEngineHelpModal;
window.closeAiEngineHelpModal = closeAiEngineHelpModal;
window.handleAiEngineHelpBackdropClick = handleAiEngineHelpBackdropClick;

window.openAiDecisionFlowHelpModal = openAiDecisionFlowHelpModal;
window.closeAiDecisionFlowHelpModal = closeAiDecisionFlowHelpModal;
window.handleAiDecisionFlowHelpBackdropClick = handleAiDecisionFlowHelpBackdropClick;

window.openBrainMetricsHelpModal = openBrainMetricsHelpModal;
window.closeBrainMetricsHelpModal = closeBrainMetricsHelpModal;
window.handleBrainMetricsHelpBackdropClick = handleBrainMetricsHelpBackdropClick;

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
        const iconWrap = document.getElementById('brainConfirmIconWrap');
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

        if (iconWrap) {
            if (options.noIconBox || options.iconSvg) {
                iconWrap.classList.add('no-box');
            } else {
                iconWrap.classList.remove('no-box');
            }
        }

        if (iconEl) {
            if (options.iconSvg) {
                iconEl.innerHTML = `<img src="${options.iconSvg}" class="brain-dialog-svg-icon" alt="${options.iconAlt || 'Atualizando'}">`;
            } else {
                iconEl.textContent = options.icon || (withInput ? '💬' : (isDanger ? '🗑️' : '❓'));
            }
        }

        if (badgeEl) {
            let badgeText = '';
            if (options.badge === false || options.badge === null || options.badge === '') {
                badgeText = '';
            } else if (typeof options.badge === 'string') {
                // Remove qualquer emoji repetido no início do badge
                badgeText = options.badge.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s•·&middot;]+/u, '').trim();
            } else {
                badgeText = withInput ? 'ENTRADA REQUERIDA' : '';
            }

            if (badgeText) {
                badgeEl.innerHTML = badgeText;
                badgeEl.style.display = 'inline-block';
            } else {
                badgeEl.innerHTML = '';
                badgeEl.style.display = 'none';
            }
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
        const iconWrap = document.getElementById('brainConfirmIconWrap');
        if (iconWrap) {
            iconWrap.classList.remove('no-box');
        }
        const qsModal = document.getElementById('quickstartModal');
        const isQuickstartOpen = qsModal && qsModal.style.display !== 'none';
        document.body.style.overflow = isQuickstartOpen ? 'hidden' : '';
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
window.alert = function (msg) {
    if (typeof showToast === 'function') {
        const text = String(msg || '');
        const isError = /erro|falha|error|failed|incorreto|obrigat|atenção|não encontrad/i.test(text);
        showToast(text, isError ? 'error' : 'info', 4500);
    } else {
        console.warn('[SecondBrain Alert]', msg);
    }
};

// ── Synaptic Boot HUD Controller (Efeito UAU) ───────
function updateBootProgress(percent, message, activeDotId) {
    const fill = document.getElementById('brainBootProgressFill');
    const stepText = document.getElementById('brainBootStepText');
    const pctText = document.getElementById('brainBootPercentText');

    if (fill) fill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    if (stepText && message) stepText.textContent = message;
    if (pctText) pctText.textContent = `${Math.round(percent)}%`;

    if (activeDotId) {
        const dot = document.getElementById(activeDotId);
        if (dot) dot.classList.add('active');
    }
}

async function dismissBootScreen() {
    const overlay = document.getElementById('brainBootOverlay');
    if (!overlay) return;

    updateBootProgress(100, 'Sinapses prontas. Bem-vindo!', 'bootTelDotAI');
    await new Promise(r => setTimeout(r, 260));

    overlay.classList.add('boot-fade-out');
    setTimeout(() => {
        if (overlay && overlay.parentNode) {
            overlay.style.display = 'none';
        }
    }, 550);
}

// ── Initialize ────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // 0. Synaptic Boot HUD (Feedback imediato com estética premium)
    try {
        const _cachedVer = localStorage.getItem('ai_second_brain_system_version');
        if (_cachedVer) applyVersionToUI({ version: _cachedVer });
    } catch (_) { }
    initSystemVersionCheck();
    updateBootProgress(20, 'Carregando cofre neural e contratos...');

    // 1. Instant Pre-Render (0ms) a partir do Snapshot em memória
    // Menu e Projetos são montados imediatamente por trás do HUD, eliminando qualquer tela em branco
    if (window.VAULT && window.VAULT.data) {
        buildSidebar();
        buildStats();
        renderDashboardProjects();
    }

    // 2. Conexão ao vivo com o servidor (/api/vault)
    if (window.VAULT) {
        updateBootProgress(55, 'Conectando ao cofre ao vivo (/api/vault)...', 'bootTelDotVault');
        await window.VAULT.init();
        window.VAULT.onVaultUpdated = (info) => {
            console.log('🔄 [App] Recarregando interface após atualização do Vault:', info);
            refreshApp();
        };
    }

    // 3. Atualiza componentes com os dados mais recentes do disco
    updateBootProgress(85, 'Sincronizando projetos sob governança e telemetria...', 'bootTelDotContracts');
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
    } catch (e) { }
    onAiEngineChange(getSelectedAiEngine(), true);

    if (window.location.hash === '#graph' || window.location.search.includes('view=graph')) {
        showView('graph');
    } else {
        showDashboard();
    }

    // 4. Conclui com animação cinematográfica suave
    await dismissBootScreen();
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
        } catch (e) { }
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

// ── Dynamic Projects Dashboard Rendering & Filtering ──────
let allDashboardProjects = [];
let projectFilterState = {
    search: '',
    status: 'all',
    stack: 'all',
    governance: 'all',
    sort: 'name_asc'
};

// ── Fonte Única da Verdade para Status de Projetos ──────
const DEFAULT_PROJECT_STATUSES = [
    {
        id: "planning",
        label: "Planejamento",
        fullText: "🟢 Em Planejamento / Ativo",
        icon: "🟢",
        color: "yellow",
        badgeClass: "planning",
        description: "Fase inicial de concepção e especificação de requisitos",
        aliases: ["planejamento", "planeja", "planning", "em planejamento"]
    },
    {
        id: "active",
        label: "Desenvolvimento",
        fullText: "🚀 Em Desenvolvimento Ativo",
        icon: "🚀",
        color: "green",
        badgeClass: "active",
        description: "Em desenvolvimento ativo de código e features",
        aliases: ["desenvolvimento", "desenvolv", "development", "dev"]
    },
    {
        id: "testing",
        label: "Testes",
        fullText: "🟡 Em Testes / Homologação",
        icon: "🟡",
        color: "blue",
        badgeClass: "testing",
        description: "Fase de QA, homologação e testes de regressão",
        aliases: ["testes", "teste", "homologação", "homologaç", "qa", "staging"]
    },
    {
        id: "production",
        label: "Concluído",
        fullText: "✅ Em Produção / Concluído",
        icon: "✅",
        color: "green",
        badgeClass: "active",
        description: "Entregue em produção e operacional",
        aliases: ["produção", "produç", "concluído", "conclu", "done", "finished"]
    },
    {
        id: "paused",
        label: "Pausado",
        fullText: "⏸️ Pausado",
        icon: "⏸️",
        color: "amber",
        badgeClass: "paused",
        description: "Projeto temporariamente pausado ou em espera",
        aliases: ["pausado", "pausa", "paused", "standby", "hold"]
    }
];

function getProjectStatuses() {
    if (window.VAULT && window.VAULT.data && Array.isArray(window.VAULT.data.projectStatuses) && window.VAULT.data.projectStatuses.length > 0) {
        return window.VAULT.data.projectStatuses;
    }
    if (window.VAULT_SNAPSHOT && Array.isArray(window.VAULT_SNAPSHOT.projectStatuses) && window.VAULT_SNAPSHOT.projectStatuses.length > 0) {
        return window.VAULT_SNAPSHOT.projectStatuses;
    }
    return DEFAULT_PROJECT_STATUSES;
}

function resolveProjectStatus(rawStatus, fallbackContent = '') {
    const statuses = getProjectStatuses();
    const str = (rawStatus || '').trim();
    const lower = str.toLowerCase();

    if (lower) {
        // 1. Tenta match por alias específico
        for (const st of statuses) {
            if (st.aliases && st.aliases.some(a => lower.includes(a.toLowerCase()))) {
                return st;
            }
        }
        // 2. Tenta match por fullText, label ou id
        for (const st of statuses) {
            if (lower.includes(st.label.toLowerCase()) || lower.includes(st.id.toLowerCase()) || lower.includes(st.fullText.toLowerCase())) {
                return st;
            }
        }
    }

    // 3. Fallback procurando termos no corpo se não houver linha explícita de status
    if (fallbackContent) {
        const contentLower = fallbackContent.toLowerCase();
        for (const st of statuses) {
            if (st.aliases && st.aliases.some(a => contentLower.includes(a.toLowerCase()))) {
                return st;
            }
        }
    }

    // 4. Se houver um status customizado novo, limpa emojis e formata dinamicamente
    if (str) {
        const clean = str
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
            .replace(/^[^\w\u00C0-\u00FF]+/g, '')
            .trim();
        if (clean) {
            return {
                id: clean.toLowerCase().replace(/\s+/g, '-'),
                label: clean.split('/')[0].trim(),
                fullText: str,
                icon: '🟢',
                color: 'green',
                badgeClass: 'active',
                description: str
            };
        }
    }

    // 5. Default
    return statuses.find(s => s.id === 'active') || statuses[0] || DEFAULT_PROJECT_STATUSES[1];
}

function populateProjectStatusFilterSelect() {
    const select = document.getElementById('projStatusFilter');
    if (!select) return;
    const statuses = getProjectStatuses();
    const currentVal = projectFilterState.status || 'all';

    let html = `<option value="all">Todos os Status</option>`;
    statuses.forEach(s => {
        const isSelected = currentVal === s.id ? 'selected' : '';
        const displayText = s.fullText.includes(s.icon) ? s.fullText : `${s.icon} ${s.fullText}`;
        html += `<option value="${escapeHtml(s.id)}" ${isSelected}>${escapeHtml(displayText)}</option>`;
    });
    select.innerHTML = html;
}

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

    const toolbar = document.getElementById('projToolbarWrap');

    if (projectsList.length === 0) {
        allDashboardProjects = [];
        if (toolbar) toolbar.style.display = 'none';

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

    if (toolbar) toolbar.style.display = 'flex';

    // Popula o select de Status dinamicamente a partir da Fonte Única da Verdade (JSON)
    populateProjectStatusFilterSelect();

    // Mapeia e enriquece todos os projetos
    allDashboardProjects = projectsList.map(proj => {
        const folderName = proj.path.split('/')[1];
        const title = proj.title || folderName;

        // Estatísticas e arquivos do projeto
        const projPrefix = `projects/${folderName}/`;
        const projFiles = files.filter(f => f.path.startsWith(projPrefix));
        const totalDocs = projFiles.length;

        // Extrai status diretamente dos contratos PROJECT.md ou CURRENT_STATE.md
        const statusMatch = (proj.content || '').match(/-\s+\*\*Status\*\*:\s*([^\r\n]+)/i);
        const currentStateFile = projFiles.find(f => f.path.toLowerCase().endsWith('/current_state.md'));
        const stateStatusMatch = (currentStateFile?.content || '').match(/##\s+Status:\s*([^\r\n]+)/i);

        const rawStatus = (statusMatch && statusMatch[1])
            ? statusMatch[1].trim()
            : ((stateStatusMatch && stateStatusMatch[1]) ? stateStatusMatch[1].trim() : '');

        // Resolução determinística baseada na configuração JSON de status
        const resolved = resolveProjectStatus(rawStatus, proj.content);
        const statusBadge = resolved.label;
        const statusClass = resolved.badgeClass;
        const statusColor = resolved.color;
        const statusId = resolved.id;
        const statusFullText = resolved.fullText;

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

        return {
            folderName,
            title,
            statusBadge,
            statusClass,
            statusColor,
            statusId,
            statusFullText,
            desc,
            stack,
            stackIcon,
            totalDocs,
            totalLabs,
            hasProjectMd,
            hasCurrentState,
            hasArchitecture,
            hasDecisions,
            contractsFound,
            govPercent,
            govBarColor
        };
    });

    // Popula o select de Stacks de forma dinâmica
    updateProjectStacksFilterSelect();

    // Aplica filtros e renderiza
    applyDashboardProjectFilters();
}

function updateProjectStacksFilterSelect() {
    const stackSelect = document.getElementById('projStackFilter');
    if (!stackSelect) return;

    const stackCounts = new Map();
    allDashboardProjects.forEach(p => {
        const s = p.stack || 'Livre';
        stackCounts.set(s, (stackCounts.get(s) || 0) + 1);
    });

    const sortedStacks = Array.from(stackCounts.keys()).sort((a, b) => a.localeCompare(b));
    const currentVal = projectFilterState.stack;

    let html = `<option value="all">Todas as Stacks (${allDashboardProjects.length})</option>`;
    sortedStacks.forEach(s => {
        const count = stackCounts.get(s);
        const isSelected = currentVal === s ? 'selected' : '';
        html += `<option value="${escapeHtml(s)}" ${isSelected}>${escapeHtml(s)} (${count})</option>`;
    });

    stackSelect.innerHTML = html;
}

function renderSingleProjectCardHtml(p) {
    return `
        <div class="dash-card proj-dashboard-card" onclick="openProjectWorkspace('${p.folderName}')">
            <div>
                <!-- Header (Apenas o nome do projeto e status, sem avatar) -->
                <div class="proj-card-header">
                    <div class="proj-card-main-info">
                        <div class="proj-card-title-row">
                            <h3 class="proj-card-title" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</h3>
                            <span class="proj-status-chip ${p.statusClass}">
                                <span class="proj-pulse-dot ${p.statusColor}"></span>
                                ${p.statusBadge}
                            </span>
                        </div>
                        <div class="proj-card-sub-row">
                            <span class="proj-card-path">projects/${p.folderName}/</span>
                            <span class="proj-stack-chip" title="Stack de Tecnologia">
                                <span>${p.stackIcon}</span> ${escapeHtml(p.stack)}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Descrição -->
                <p class="proj-card-desc" style="margin-top: 12px;" title="${escapeHtml(p.desc)}">
                    ${escapeHtml(p.desc)}
                </p>
            </div>

            <!-- Barra de Governança com Explicação e Breakdown dos 4 Contratos -->
            <div class="proj-gov-container" onclick="event.stopPropagation(); showGovernanceExplainer('${p.folderName}', ${p.govPercent}, ${p.hasProjectMd}, ${p.hasCurrentState}, ${p.hasArchitecture}, ${p.hasDecisions})" style="cursor: pointer;" title="Clique para ver o detalhamento do cálculo de governança">
                <div class="proj-gov-header">
                    <span class="proj-gov-label">
                        <span class="proj-gov-shield-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <path d="m9 12 2 2 4-4"></path>
                            </svg>
                        </span>
                        Governança de Arquitetura
                        <span class="proj-gov-info-btn" title="O que significa este percentual? (Clique para ver o detalhamento)" aria-label="Informações sobre governança">
                            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        </span>
                    </span>
                    <span class="proj-gov-val ${p.govPercent === 100 ? 'is-100' : 'is-partial'}">${p.govPercent}% Conforme</span>
                </div>
                <div class="proj-gov-track">
                    <div class="proj-gov-fill" style="width: ${p.govPercent}%; background: ${p.govBarColor};"></div>
                </div>
                <!-- Pílulas dos 4 Contratos (+25% cada) -->
                <div class="proj-gov-pills">
                    <span class="gov-pill ${p.hasProjectMd ? 'valid' : 'pending'}" onclick="event.stopPropagation(); ${p.hasProjectMd ? `navigateTo('projects/${p.folderName}/PROJECT.md')` : `initializeContract('PROJECT.md')`}" title="${p.hasProjectMd ? '✓ PROJECT.md ativo (Clique para visualizar)' : '⚠️ Clique para inicializar PROJECT.md'}">
                        ${p.hasProjectMd ? '✓ PROJECT' : '+ PROJECT'}
                    </span>
                    <span class="gov-pill ${p.hasCurrentState ? 'valid' : 'pending'}" onclick="event.stopPropagation(); ${p.hasCurrentState ? `navigateTo('projects/${p.folderName}/CURRENT_STATE.md')` : `initializeContract('CURRENT_STATE.md')`}" title="${p.hasCurrentState ? '✓ CURRENT_STATE.md ativo (Clique para visualizar)' : '⚠️ Clique para inicializar CURRENT_STATE.md'}">
                        ${p.hasCurrentState ? '✓ STATE' : '+ STATE'}
                    </span>
                    <span class="gov-pill ${p.hasArchitecture ? 'valid' : 'pending'}" onclick="event.stopPropagation(); ${p.hasArchitecture ? `navigateTo('projects/${p.folderName}/ARCHITECTURE.md')` : `initializeContract('ARCHITECTURE.md')`}" title="${p.hasArchitecture ? '✓ ARCHITECTURE.md ativo (Clique para visualizar)' : '⚠️ Clique para inicializar ARCHITECTURE.md'}">
                        ${p.hasArchitecture ? '✓ ARCH' : '+ ARCH'}
                    </span>
                    <span class="gov-pill ${p.hasDecisions ? 'valid' : 'pending'}" onclick="event.stopPropagation(); ${p.hasDecisions ? `openProjectWorkspace('${p.folderName}', 'overview')` : `createNewDecisionRecord('${p.folderName}')`}" title="${p.hasDecisions ? '✓ Decisões registradas (Clique para ver no Workspace)' : '⚠️ Clique para registrar a primeira decisão (ADR-001) e bater 100%!'}">
                        ${p.hasDecisions ? '✓ DECISIONS' : '+ DECISIONS'}
                    </span>
                </div>
            </div>

            <!-- Quick Stats Strip -->
            <div class="proj-quick-stats">
                <div class="pqs-chip" title="Documentos e especificações indexados">
                    <span>📄</span> <strong>${p.totalDocs}</strong> docs
                </div>
                <div class="pqs-chip" title="Pesquisas e Experimentos de IA">
                    <span>🔬</span> <strong>${p.totalLabs}</strong> ${p.totalLabs === 1 ? 'lab' : 'labs'}
                </div>
                <div class="pqs-chip" title="Contratos vivos (PROJECT, CURRENT_STATE, ARCHITECTURE, DECISIONS)">
                    <span>🛡️</span> <strong>${p.contractsFound}/4</strong> contratos
                </div>
            </div>

            <!-- Ações Rápidas -->
            <div class="dash-card-actions" style="margin-top: 2px;">
                <button class="btn-dash-act primary" onclick="event.stopPropagation(); openProjectWorkspace('${p.folderName}', 'overview')" title="Abrir Dashboard Completo">
                    🚀 Workspace
                </button>
                <button class="btn-dash-act neural-act" onclick="event.stopPropagation(); openProjectWorkspace('${p.folderName}', 'graph')" title="Explorar Grafo Neural 3D">
                    🔮 Grafo 3D
                </button>
                ${p.totalLabs > 0 ? `
                    <button class="btn-dash-act lab-act" onclick="event.stopPropagation(); openProjectWorkspace('${p.folderName}', 'research')" title="Ver Experimentos de Pesquisa">
                        🔬 Labs (${p.totalLabs})
                    </button>
                ` : `
                    <button class="btn-dash-act" onclick="event.stopPropagation(); openProjectWorkspace('${p.folderName}', 'settings')" title="Configurar Projeto">
                        ⚙️ Gerenciar
                    </button>
                `}
            </div>
        </div>
    `;
}

function applyDashboardProjectFilters() {
    const slot = document.getElementById('dynamicProjectsSlot');
    if (!slot) return;

    if (allDashboardProjects.length === 0) return;

    const query = (projectFilterState.search || '').trim().toLowerCase();
    const statusFilter = projectFilterState.status || 'all';
    const stackFilter = projectFilterState.stack || 'all';
    const govFilter = projectFilterState.governance || 'all';
    const sortVal = projectFilterState.sort || 'name_asc';

    // 1. Filtragem
    let filtered = allDashboardProjects.filter(p => {
        // Busca textual
        if (query) {
            const matchTitle = (p.title || '').toLowerCase().includes(query);
            const matchFolder = (p.folderName || '').toLowerCase().includes(query);
            const matchDesc = (p.desc || '').toLowerCase().includes(query);
            const matchStack = (p.stack || '').toLowerCase().includes(query);
            if (!matchTitle && !matchFolder && !matchDesc && !matchStack) {
                return false;
            }
        }

        // Filtro por Status
        if (statusFilter !== 'all') {
            if (p.statusId !== statusFilter && p.statusClass !== statusFilter) return false;
        }

        // Filtro por Stack
        if (stackFilter !== 'all') {
            if (p.stack !== stackFilter) return false;
        }

        // Filtro por Governança
        if (govFilter === '100') {
            if (p.govPercent !== 100) return false;
        } else if (govFilter === 'partial') {
            if (p.govPercent >= 100) return false;
        } else if (govFilter === 'labs') {
            if (p.totalLabs <= 0) return false;
        }

        return true;
    });

    // 2. Ordenação
    filtered.sort((a, b) => {
        if (sortVal === 'name_asc') {
            return (a.title || a.folderName).localeCompare(b.title || b.folderName);
        } else if (sortVal === 'name_desc') {
            return (b.title || b.folderName).localeCompare(a.title || a.folderName);
        } else if (sortVal === 'gov_desc') {
            if (b.govPercent !== a.govPercent) return b.govPercent - a.govPercent;
            return (a.title || a.folderName).localeCompare(b.title || b.folderName);
        } else if (sortVal === 'docs_desc') {
            if (b.totalDocs !== a.totalDocs) return b.totalDocs - a.totalDocs;
            return (a.title || a.folderName).localeCompare(b.title || b.folderName);
        } else if (sortVal === 'labs_desc') {
            if (b.totalLabs !== a.totalLabs) return b.totalLabs - a.totalLabs;
            return (a.title || a.folderName).localeCompare(b.title || b.folderName);
        }
        return 0;
    });

    // 3. Atualização dos Contadores e Controles na UI
    const totalCount = allDashboardProjects.length;
    const filteredCount = filtered.length;
    const isFiltered = query !== '' || statusFilter !== 'all' || stackFilter !== 'all' || govFilter !== 'all';

    const countBadge = document.getElementById('dashProjectsCountBadge');
    if (countBadge) {
        countBadge.textContent = isFiltered ? `${filteredCount} / ${totalCount}` : totalCount;
    }

    const counterEl = document.getElementById('projResultsCounter');
    if (counterEl) {
        if (isFiltered) {
            counterEl.innerHTML = `Exibindo <strong>${filteredCount}</strong> de <strong>${totalCount}</strong> projetos`;
        } else {
            counterEl.innerHTML = `Total de <strong>${totalCount}</strong> projetos conectados`;
        }
    }

    const resetBtn = document.getElementById('btnProjResetFilters');
    if (resetBtn) {
        resetBtn.style.display = (isFiltered || sortVal !== 'name_asc') ? 'inline-flex' : 'none';
    }

    const clearSearchBtn = document.getElementById('projSearchClearBtn');
    const searchKbdHint = document.getElementById('projSearchKbdHint');
    if (clearSearchBtn && searchKbdHint) {
        if (query) {
            clearSearchBtn.style.display = 'inline-flex';
            searchKbdHint.style.display = 'none';
        } else {
            clearSearchBtn.style.display = 'none';
            searchKbdHint.style.display = 'inline-block';
        }
    }

    // 4. Renderização dos Cards ou Empty State
    if (filtered.length === 0) {
        slot.innerHTML = `
            <div class="dash-projects-empty-card" style="grid-column: 1 / -1;">
                <div class="proj-empty-icon">🔍</div>
                <h3 class="proj-empty-title">Nenhum projeto encontrado</h3>
                <p class="proj-empty-desc">
                    Nenhum workspace sob governança corresponde aos termos ou filtros selecionados.
                </p>
                <div class="proj-empty-actions">
                    <button type="button" class="btn-proj-reset-filters" onclick="resetProjectFilters()" style="display: inline-flex;">
                        <span>↺</span> Limpar Filtros e Ver Todos (${totalCount})
                    </button>
                </div>
            </div>
        `;
        return;
    }

    let html = '';
    filtered.forEach(p => {
        html += renderSingleProjectCardHtml(p);
    });

    slot.innerHTML = html;
}

function handleProjectFilterChange() {
    const statusSelect = document.getElementById('projStatusFilter');
    const stackSelect = document.getElementById('projStackFilter');
    const govSelect = document.getElementById('projGovFilter');
    const sortSelect = document.getElementById('projSortSelect');

    if (statusSelect) projectFilterState.status = statusSelect.value;
    if (stackSelect) projectFilterState.stack = stackSelect.value;
    if (govSelect) projectFilterState.governance = govSelect.value;
    if (sortSelect) projectFilterState.sort = sortSelect.value;

    applyDashboardProjectFilters();
}

function handleProjectSearchInput(e) {
    projectFilterState.search = e ? e.target.value : '';
    applyDashboardProjectFilters();
}

function clearProjectSearch() {
    const input = document.getElementById('projSearchInput');
    if (input) {
        input.value = '';
        projectFilterState.search = '';
        input.focus();
    }
    applyDashboardProjectFilters();
}

function resetProjectFilters() {
    projectFilterState = {
        search: '',
        status: 'all',
        stack: 'all',
        governance: 'all',
        sort: 'name_asc'
    };

    const input = document.getElementById('projSearchInput');
    const statusSelect = document.getElementById('projStatusFilter');
    const stackSelect = document.getElementById('projStackFilter');
    const govSelect = document.getElementById('projGovFilter');
    const sortSelect = document.getElementById('projSortSelect');

    if (input) input.value = '';
    if (statusSelect) statusSelect.value = 'all';
    if (stackSelect) stackSelect.value = 'all';
    if (govSelect) govSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'name_asc';

    applyDashboardProjectFilters();
}

window.handleProjectFilterChange = handleProjectFilterChange;
window.handleProjectSearchInput = handleProjectSearchInput;
window.clearProjectSearch = clearProjectSearch;
window.resetProjectFilters = resetProjectFilters;
window.renderDashboardProjects = renderDashboardProjects;
window.applyDashboardProjectFilters = applyDashboardProjectFilters;

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
        } catch (_) { }
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
            if (typeof g.clearCategoryHighlight === 'function') g.clearCategoryHighlight();
        };
    }

    // Fechar ao clicar fora
    if (!wrap._docClickHandler) {
        wrap._docClickHandler = (e) => {
            if (!wrap.contains(e.target)) {
                dropdown.style.display = 'none';
                wrap.classList.remove('open');
                if (typeof g.clearCategoryHighlight === 'function') g.clearCategoryHighlight();
            }
        };
        document.addEventListener('click', wrap._docClickHandler);
    }

    // Botão Resetar Cores
    if (resetBtn) {
        resetBtn.onclick = (e) => {
            e.stopPropagation();
            if (typeof g.clearCategoryHighlight === 'function') g.clearCategoryHighlight();
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
            } catch (err) { }
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

        // Limpa destaque caso o cursor saia de toda a lista
        list.onmouseleave = () => {
            if (typeof g.clearCategoryHighlight === 'function') g.clearCategoryHighlight();
        };

        // Binds de hover e clique para filtrar
        list.querySelectorAll('.cat-item').forEach(itemEl => {
            const key = itemEl.getAttribute('data-key');

            itemEl.onmouseenter = () => {
                if (key !== 'all') {
                    if (typeof g.highlightCategory === 'function') g.highlightCategory(key);
                } else {
                    if (typeof g.clearCategoryHighlight === 'function') g.clearCategoryHighlight();
                }
            };
            itemEl.onmouseleave = () => {
                if (typeof g.clearCategoryHighlight === 'function') g.clearCategoryHighlight();
            };

            itemEl.onclick = (e) => {
                if (e.target.closest('.cat-item-color-box')) return;

                if (typeof g.clearCategoryHighlight === 'function') g.clearCategoryHighlight();
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
                } catch (err) { }
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
                document.exitFullscreen().catch(() => { });
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
        folderInput.addEventListener('change', async function () {
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
    if (btnShake) btnShake.addEventListener('click', () => {
        if (graph) {
            if (typeof graph.pulseSurge === 'function') graph.pulseSurge();
            else graph.reheat(1.0);
        }
    });
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
            const confirmModal = document.getElementById('qsConfirmExitModal');
            if (confirmModal && confirmModal.style.display !== 'none') {
                cancelQuickstartExit();
                return;
            }

            const valModal = document.getElementById('qsGrillValidationModal');
            if (valModal && valModal.style.display !== 'none') {
                closeGrillValidationModal(true);
                return;
            }

            const clarifyModal = document.getElementById('qsClarificationModal');
            if (clarifyModal && clarifyModal.style.display !== 'none') {
                closeClarificationModal();
                return;
            }

            const aiErrModal = document.getElementById('aiErrorModal');
            if (aiErrModal && aiErrModal.style.display !== 'none') {
                closeAiErrorModal();
                return;
            }

            const qsModal = document.getElementById('quickstartModal');
            if (qsModal && qsModal.style.display !== 'none') {
                requestCloseQuickstartWizard();
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

function onQuickstartDescInput(val) {
    const nudge = document.getElementById('qsDescNudge');
    if (!nudge) return;
    const text = (val || '').trim();
    if (text.length >= 8) {
        nudge.classList.add('filled');
        nudge.innerHTML = `
            <span class="qs-nudge-icon">✨</span>
            <span class="qs-nudge-text">
                <strong>Contexto registrado!</strong> A Sabatina da IA usará este objetivo para calibrar perguntas e contratos sob medida.
            </span>
        `;
    } else {
        nudge.classList.remove('filled');
        nudge.innerHTML = `
            <span class="qs-nudge-icon">💡</span>
            <span class="qs-nudge-text">
                <strong>Dica:</strong> Uma breve descrição (ex: <em>"App de receitas de bolos"</em> ou <em>"Microsserviço de pagamentos"</em>) ajuda o Grill Studio a entender o domínio de negócio e gerar contratos cirúrgicos sem suposições.
            </span>
        `;
    }
}

function openQuickstartWizard(defaultMode = null) {
    const modal = document.getElementById('quickstartModal');
    if (!modal) return;

    // Registra listener de mousedown no modal para prevenir fechamento involuntário ao arrastar o mouse entre campos
    if (!modal.dataset.backdropGuarded) {
        modal.dataset.backdropGuarded = 'true';
        modal.addEventListener('mousedown', (e) => {
            qsBackdropMouseDownTarget = e.target;
        });
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Reset fields
    const nameInput = document.getElementById('qsNewName');
    const descInput = document.getElementById('qsNewDesc');
    const linkNameInput = document.getElementById('qsLinkName');
    const linkPathInput = document.getElementById('qsLinkPath');

    if (nameInput) nameInput.value = '';
    if (descInput) {
        descInput.value = '';
        onQuickstartDescInput('');
    }
    if (linkNameInput) linkNameInput.value = '';
    if (linkPathInput) linkPathInput.value = '';

    const feedback = document.getElementById('qsPathFeedback');
    if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'qs-path-feedback';
        feedback.innerHTML = '';
    }

    // Reset Sabatina / Grill state
    currentGrillQuestions = [];
    currentGrillProjectInfo = null;
    currentGrillValidationIssue = null;
    resetQuickstartTech();
    resetQuickstartSpecs();
    const grillListEl = document.getElementById('qsGrillQuestionsList');
    if (grillListEl) grillListEl.innerHTML = '';
    const grillContainerEl = document.getElementById('qsGrillQuestionsContainer');
    if (grillContainerEl) grillContainerEl.style.display = 'none';

    if (defaultMode) {
        selectQuickstartMode(defaultMode);
    } else {
        goToQuickstartStep(1);
    }
}

let qsBackdropMouseDownTarget = null;

function hasQuickstartProgress() {
    // 1. Se o usuário está no Passo 3 ("Conectado!"), os arquivos já foram
    // gravados com sucesso no disco pelo botão verde ("💾 Aprovar e Criar Projeto no Disco"). Não há risco de perda.
    if (typeof quickstartStep !== 'undefined' && quickstartStep === 3) return false;

    // 2. Se avançou para o Passo 2 (formulário Greenfield/Brownfield, sabatina, síntese ou revisão de contratos),
    // o usuário já avançou e está preenchendo etapas ativas.
    if (typeof quickstartStep !== 'undefined' && quickstartStep === 2) return true;

    // 3. Se por qualquer motivo está no Passo 1, mas já possui dados preenchidos
    const nameVal = document.getElementById('qsNewName')?.value?.trim() ||
        document.getElementById('qsLinkName')?.value?.trim();
    if (nameVal) return true;

    const descVal = document.getElementById('qsNewDesc')?.value?.trim();
    if (descVal) return true;

    const pathVal = document.getElementById('qsLinkPath')?.value?.trim();
    if (pathVal) return true;

    if (typeof attachedSpecsFiles !== 'undefined' && Array.isArray(attachedSpecsFiles) && attachedSpecsFiles.length > 0) return true;
    if (typeof currentGrillQuestions !== 'undefined' && Array.isArray(currentGrillQuestions) && currentGrillQuestions.length > 0) return true;
    if (typeof currentGrillDraft !== 'undefined' && currentGrillDraft && (currentGrillDraft.projectMd || currentGrillDraft.architectureMd || currentGrillDraft.currentStateMd)) return true;

    return false;
}

function requestCloseQuickstartWizard() {
    const modal = document.getElementById('quickstartModal');
    if (!modal || modal.style.display === 'none') return;

    if (!hasQuickstartProgress()) {
        forceCloseQuickstartWizard();
    } else {
        openQuickstartExitConfirm();
    }
}

function openQuickstartExitConfirm() {
    const confirmModal = document.getElementById('qsConfirmExitModal');
    if (confirmModal) {
        confirmModal.style.display = 'flex';
        const cancelBtn = document.getElementById('btnCancelQuickstartExit');
        if (cancelBtn) cancelBtn.focus();
    } else {
        const confirmed = window.confirm(
            'Deseja realmente sair? Todas as informações preenchidas e contratos em elaboração serão descartados.'
        );
        if (confirmed) {
            forceCloseQuickstartWizard();
        }
    }
}

function cancelQuickstartExit() {
    const confirmModal = document.getElementById('qsConfirmExitModal');
    if (confirmModal) {
        confirmModal.style.display = 'none';
    }
}

function confirmQuickstartExit() {
    cancelQuickstartExit();
    forceCloseQuickstartWizard();
}

function handleConfirmExitBackdrop(e) {
    if (e.target && e.target.id === 'qsConfirmExitModal') {
        cancelQuickstartExit();
    }
}

function forceCloseQuickstartWizard() {
    cancelQuickstartExit();
    const modal = document.getElementById('quickstartModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        const card = modal.querySelector('.quickstart-modal-card');
        if (card) {
            card.classList.remove('wide', 'grill-mode', 'draft-mode');
        }
    }
    const headerBackBtn = document.getElementById('qsHeaderBackBtn');
    if (headerBackBtn) headerBackBtn.style.display = 'none';
    resetQuickstartTech();
    resetQuickstartSpecs();
    resetQuickstartGrillPanes();
    quickstartStep = 1;
}

function closeQuickstartWizard(force = false) {
    if (force || !hasQuickstartProgress()) {
        forceCloseQuickstartWizard();
    } else {
        requestCloseQuickstartWizard();
    }
}

function handleModalBackdropClick(e) {
    // Previne fechar o modal se o clique começou dentro de algum campo/card e soltou fora (ex: seleção de texto ou clique em campo adjacente)
    if (e.target && e.target.id === 'quickstartModal' && qsBackdropMouseDownTarget && qsBackdropMouseDownTarget.id === 'quickstartModal') {
        requestCloseQuickstartWizard();
    }
    qsBackdropMouseDownTarget = null;
}

window.requestCloseQuickstartWizard = requestCloseQuickstartWizard;
window.forceCloseQuickstartWizard = forceCloseQuickstartWizard;
window.cancelQuickstartExit = cancelQuickstartExit;
window.confirmQuickstartExit = confirmQuickstartExit;
window.handleConfirmExitBackdrop = handleConfirmExitBackdrop;
window.hasQuickstartProgress = hasQuickstartProgress;

function onHeaderBackClick() {
    const dPane = document.getElementById('qsGrillDraftPane');
    const qPane = document.getElementById('qsGrillQuestionsPane');

    if (dPane && dPane.style.display !== 'none') {
        backToGrillQuestions();
    } else if (qPane && qPane.style.display !== 'none') {
        backFromGrillQuestions();
    } else {
        goToQuickstartStep(1);
    }
}

function goToQuickstartStep(step) {
    quickstartStep = step;
    resetQuickstartGrillPanes();

    const modalCard = document.querySelector('.quickstart-modal-card');
    if (modalCard) {
        modalCard.classList.toggle('wide', step === 2);
        if (step !== 2) {
            modalCard.classList.remove('grill-mode');
        }
    }

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
                ? 'Criando Projeto do Zero'
                : 'Vincular Repositório Existente';
        } else if (step === 3) {
            titleEl.textContent = 'Projeto Conectado com Sucesso!';
        }
    }

    const headerBackBtn = document.getElementById('qsHeaderBackBtn');
    if (headerBackBtn) {
        headerBackBtn.style.display = (step === 2) ? 'inline-flex' : 'none';
        headerBackBtn.textContent = '← Trocar modo';
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

// ============================================================
// QUICKSTART GRILL ENGINE & DUAL-MODE LOGIC
// ============================================================

let quickstartSubMode = 'assisted'; // 'assisted' | 'express'
let currentGrillProjectInfo = null;
let currentGrillQuestions = [];
let currentGrillDraft = { projectMd: '', architectureMd: '', currentStateMd: '', adrMd: '' };
let previousGrillDraft = null; // Snapshot para Desfazer (Undo)
let activeClarificationContext = null; // Contexto de Clarificação ativa (Human-in-the-Loop)
let currentActiveContract = 'projectMd';
let currentQsContractMode = 'preview'; // 'preview' | 'write'
let currentQsContractZoom = 80; // Escala padrão: 80%
let isQuickstartEditorActive = false;

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function setQuickstartSubMode(mode) {
    quickstartSubMode = mode;
    const cardAssisted = document.getElementById('cardModeAssisted');
    const cardExpress = document.getElementById('cardModeExpress');
    if (cardAssisted) cardAssisted.classList.toggle('active', mode === 'assisted');
    if (cardExpress) cardExpress.classList.toggle('active', mode === 'express');
}

/* ==========================================================================
   Quickstart: Tech Accordion (Stack & Git)
   ========================================================================== */
function toggleQuickstartTechAccordion() {
    const accordion = document.getElementById('qsTechAccordion');
    const body = document.getElementById('qsTechBody');
    const toggleText = document.getElementById('qsTechToggleText');
    if (!accordion || !body) return;

    const isOpen = accordion.classList.toggle('open');
    body.style.display = isOpen ? 'block' : 'none';
    if (toggleText) {
        toggleText.textContent = isOpen ? 'Recolher −' : 'Expandir +';
    }
}

function onQuickstartStackSelectChange(val) {
    const customWrap = document.getElementById('qsCustomStackWrap');
    const customInput = document.getElementById('qsNewStackCustom');
    if (val === 'custom') {
        if (customWrap) customWrap.style.display = 'block';
        if (customInput) customInput.focus();
    } else {
        if (customWrap) customWrap.style.display = 'none';
    }
    updateTechAccordionBadge();
}

function onQuickstartCustomStackInput(val) {
    updateTechAccordionBadge();
}

function getSelectedStackValue() {
    const select = document.getElementById('qsNewStackSelect');
    if (!select) return 'Node.js / TypeScript';
    if (select.value === 'custom') {
        const customInput = document.getElementById('qsNewStackCustom');
        return customInput ? customInput.value.trim() : '';
    }
    return select.value;
}

function updateTechAccordionBadge() {
    const badge = document.getElementById('qsTechBadge');
    if (!badge) return;
    const select = document.getElementById('qsNewStackSelect');
    const isCustom = select && select.value === 'custom';
    const customInput = document.getElementById('qsNewStackCustom');
    const customVal = customInput ? customInput.value.trim() : '';
    const gitCheckbox = document.getElementById('qsNewInitGit');
    const isGit = gitCheckbox ? gitCheckbox.checked : true;

    let shortStack = '';
    if (isCustom) {
        shortStack = customVal ? customVal : 'Definir Stack *';
    } else {
        shortStack = select ? select.value : 'Node.js / TypeScript';
    }

    if (shortStack.length > 20) shortStack = shortStack.substring(0, 18) + '...';

    badge.textContent = `${shortStack} • Git ${isGit ? '✓' : '✕'}`;

    if (isCustom && !customVal) {
        badge.style.borderColor = 'rgba(244, 63, 94, 0.4)';
        badge.style.color = '#fb7185';
        badge.style.background = 'rgba(244, 63, 94, 0.1)';
    } else {
        badge.style.borderColor = '';
        badge.style.color = '';
        badge.style.background = '';
    }
}

function resetQuickstartTech() {
    const select = document.getElementById('qsNewStackSelect');
    if (select) select.value = 'Node.js / TypeScript';

    const customWrap = document.getElementById('qsCustomStackWrap');
    if (customWrap) customWrap.style.display = 'none';

    const customInput = document.getElementById('qsNewStackCustom');
    if (customInput) customInput.value = '';

    const gitCheckbox = document.getElementById('qsNewInitGit');
    if (gitCheckbox) gitCheckbox.checked = true;

    const accordion = document.getElementById('qsTechAccordion');
    const body = document.getElementById('qsTechBody');
    const toggleText = document.getElementById('qsTechToggleText');
    if (accordion) accordion.classList.remove('open');
    if (body) body.style.display = 'none';
    if (toggleText) toggleText.textContent = 'Expandir +';

    updateTechAccordionBadge();
}

/* ==========================================================================
   Quickstart: SPECS Accordion & Attachment Management
   ========================================================================== */
let attachedSpecsFiles = []; // { filename: string, content: string, size: number }

function toggleQuickstartSpecsAccordion() {
    const accordion = document.getElementById('qsSpecsAccordion');
    const body = document.getElementById('qsSpecsBody');
    const toggleText = document.getElementById('qsSpecsToggleText');
    if (!accordion || !body) return;

    const isOpen = accordion.classList.toggle('open');
    body.style.display = isOpen ? 'block' : 'none';
    if (toggleText) {
        toggleText.textContent = isOpen ? 'Recolher −' : 'Expandir +';
    }
}

function switchSpecsTab(tab) {
    const btnUpload = document.getElementById('btnSpecsTabUpload');
    const btnPaste = document.getElementById('btnSpecsTabPaste');
    const paneUpload = document.getElementById('paneSpecsTabUpload');
    const panePaste = document.getElementById('paneSpecsTabPaste');

    if (btnUpload) btnUpload.classList.toggle('active', tab === 'upload');
    if (btnPaste) btnPaste.classList.toggle('active', tab === 'paste');
    if (paneUpload) paneUpload.style.display = tab === 'upload' ? 'block' : 'none';
    if (panePaste) panePaste.style.display = tab === 'paste' ? 'block' : 'none';
}

function handleSpecsDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('qsSpecsDropzone');
    if (dropzone) dropzone.classList.add('drag-active');
}

function handleSpecsDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('qsSpecsDropzone');
    if (dropzone) dropzone.classList.remove('drag-active');
}

function handleSpecsDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('qsSpecsDropzone');
    if (dropzone) dropzone.classList.remove('drag-active');
    if (e.dataTransfer && e.dataTransfer.files) {
        processSpecsFiles(e.dataTransfer.files);
    }
}

function handleSpecsFileInputChange(e) {
    if (e.target && e.target.files) {
        processSpecsFiles(e.target.files);
        e.target.value = ''; // permite re-selecionar o mesmo arquivo se quiser
    }
}

function formatFileSize(bytes) {
    if (!bytes || bytes < 1024) return (bytes || 0) + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function processSpecsFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const allowedExtensions = ['.md', '.txt', '.json'];
    const maxFiles = 5;
    const maxTotalBytes = 1024 * 1024; // 1MB

    let currentTotalBytes = attachedSpecsFiles.reduce((acc, f) => acc + (f.size || 0), 0);

    for (const file of files) {
        if (attachedSpecsFiles.length >= maxFiles) {
            const msg = `Limite de até ${maxFiles} arquivos de especificação atingido.`;
            if (typeof showToast === 'function') showToast(msg, 'warning', 4000);
            else alert(msg);
            break;
        }

        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            const msg = `Arquivo "${file.name}" ignorado. Formatos aceitos: .md, .txt, .json`;
            if (typeof showToast === 'function') showToast(msg, 'warning', 4000);
            else alert(msg);
            continue;
        }

        if (currentTotalBytes + file.size > maxTotalBytes) {
            const msg = `Arquivo "${file.name}" ultrapassa o limite total de 1 MB de especificações.`;
            if (typeof showToast === 'function') showToast(msg, 'warning', 4000);
            else alert(msg);
            break;
        }

        // Evita duplicata com mesmo nome
        const existingIdx = attachedSpecsFiles.findIndex(f => f.filename.toLowerCase() === file.name.toLowerCase());
        try {
            const content = await readFileAsText(file);
            const specItem = {
                filename: file.name,
                content: content,
                size: file.size
            };
            if (existingIdx >= 0) {
                currentTotalBytes -= attachedSpecsFiles[existingIdx].size;
                attachedSpecsFiles[existingIdx] = specItem;
            } else {
                attachedSpecsFiles.push(specItem);
            }
            currentTotalBytes += file.size;
        } catch (err) {
            console.error('Erro ao ler arquivo de especificação:', err);
        }
    }

    renderSpecsChips();
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function removeSpecsFile(index) {
    if (index >= 0 && index < attachedSpecsFiles.length) {
        attachedSpecsFiles.splice(index, 1);
        renderSpecsChips();
    }
}

function onSpecsPasteInput() {
    updateSpecsCounter();
}

function renderSpecsChips() {
    const chipsContainer = document.getElementById('qsSpecsFileChips');
    if (!chipsContainer) return;

    if (!attachedSpecsFiles.length) {
        chipsContainer.innerHTML = '';
        chipsContainer.style.display = 'none';
        updateSpecsCounter();
        return;
    }

    chipsContainer.style.display = 'flex';
    chipsContainer.innerHTML = attachedSpecsFiles.map((file, idx) => {
        const icon = file.filename.endsWith('.json') ? '🔧' : (file.filename.endsWith('.txt') ? '📝' : '📄');
        return `
            <div class="qs-spec-chip" title="${escapeHtml(file.filename)} (${formatFileSize(file.size)})">
                <span class="qs-spec-chip-icon">${icon}</span>
                <span class="qs-spec-chip-name">${escapeHtml(file.filename)}</span>
                <span class="qs-spec-chip-size">${formatFileSize(file.size)}</span>
                <button type="button" class="qs-spec-chip-remove" onclick="removeSpecsFile(${idx})" title="Remover arquivo">✕</button>
            </div>
        `;
    }).join('');

    updateSpecsCounter();
}

function updateSpecsCounter() {
    const counter = document.getElementById('qsSpecsCounter');
    if (!counter) return;

    const totalSpecs = getCollectedSpecs();
    if (totalSpecs.length > 0) {
        counter.style.display = 'inline-block';
        counter.textContent = `${totalSpecs.length} ${totalSpecs.length === 1 ? 'arquivo' : 'arquivos'}`;
    } else {
        counter.style.display = 'none';
        counter.textContent = '0 arquivos';
    }
}

function getCollectedSpecs() {
    const list = [...attachedSpecsFiles];

    // Verifica se há texto colado na aba Colar
    const pasteTextarea = document.getElementById('qsPasteTextarea');
    const pasteFilenameInput = document.getElementById('qsPasteFilename');
    if (pasteTextarea && pasteTextarea.value.trim().length > 0) {
        const rawName = (pasteFilenameInput && pasteFilenameInput.value.trim()) || 'requisitos.md';
        let safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
        if (!safeName.match(/\.(md|txt|json)$/i)) safeName += '.md';

        const content = pasteTextarea.value.trim();
        const exists = list.some(f => f.filename.toLowerCase() === safeName.toLowerCase());
        if (!exists) {
            list.push({
                filename: safeName,
                content: content,
                size: new Blob([content]).size
            });
        }
    }

    return list;
}

function resetQuickstartSpecs() {
    attachedSpecsFiles = [];
    const fileInput = document.getElementById('qsSpecsFileInput');
    if (fileInput) fileInput.value = '';

    const pasteTextarea = document.getElementById('qsPasteTextarea');
    if (pasteTextarea) pasteTextarea.value = '';

    const pasteFilename = document.getElementById('qsPasteFilename');
    if (pasteFilename) pasteFilename.value = 'requisitos.md';

    const accordion = document.getElementById('qsSpecsAccordion');
    const body = document.getElementById('qsSpecsBody');
    const toggleText = document.getElementById('qsSpecsToggleText');
    if (accordion) accordion.classList.remove('open');
    if (body) body.style.display = 'none';
    if (toggleText) toggleText.textContent = 'Expandir +';

    switchSpecsTab('upload');
    renderSpecsChips();
}

/* ==========================================================================
   Quickstart: Expanded Specs Document Editor Modal
   ========================================================================== */
let isQuickstartSpecsEditorActive = false;

function openExpandedSpecsEditor() {
    isQuickstartSpecsEditorActive = true;
    const modal = document.getElementById('fileEditorModal');
    if (!modal) return;

    const pasteTextarea = document.getElementById('qsPasteTextarea');
    const filenameInput = document.getElementById('qsPasteFilename');
    const rawName = (filenameInput && filenameInput.value.trim()) || 'requisitos.md';
    let safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!safeName.match(/\.(md|txt|json)$/i)) safeName += '.md';
    const content = pasteTextarea ? pasteTextarea.value : '';

    activeEditingPath = 'SPECS/' + safeName;
    currentEditorTab = 'write';

    modal.classList.add('on-top');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Oculta seções do Grill/Contratos e exibe ações de Specs
    const qsTabsWrap = document.getElementById('editorQuickstartTabsWrap');
    const qsRefineBox = document.getElementById('editorQuickstartRefineBox');
    const stdActions = document.getElementById('editorStandardActions');
    const qsActions = document.getElementById('editorQuickstartActions');
    const specsActions = document.getElementById('editorSpecsActions');

    if (qsTabsWrap) qsTabsWrap.style.display = 'none';
    if (qsRefineBox) qsRefineBox.style.display = 'none';
    if (stdActions) stdActions.style.display = 'none';
    if (qsActions) qsActions.style.display = 'none';
    if (specsActions) specsActions.style.display = 'flex';

    // Header info
    const titleEl = document.getElementById('editorModalTitle');
    const badgeEl = document.getElementById('editorBadgeText');
    const pathEl = document.getElementById('editorFilePath');
    const statusText = document.getElementById('editorStatusText');
    const textarea = document.getElementById('editorTextarea');

    if (titleEl) titleEl.textContent = `Documento de Especificação: ${safeName}`;
    if (badgeEl) badgeEl.textContent = '📄 SPECS & REQUISITOS';
    if (pathEl) pathEl.textContent = `SPECS/${safeName}`;
    if (statusText) statusText.innerHTML = '<span class="status-dot" style="background:#6366f1"></span> Editando documento em tela cheia (Ctrl+S para concluir)';

    if (textarea) {
        textarea.value = content;
        textarea.placeholder = 'Cole ou digite aqui os requisitos de sistema, histórias de usuário ou PRD em Markdown, Texto ou JSON...';

        textarea.onkeydown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                applyExpandedSpecsEditor();
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

    switchEditorTab('write');
    applyEditorZoom(currentEditorZoom || 80);
}

function applyExpandedSpecsEditor() {
    const editorTextarea = document.getElementById('editorTextarea');
    const pasteTextarea = document.getElementById('qsPasteTextarea');
    if (editorTextarea && pasteTextarea) {
        pasteTextarea.value = editorTextarea.value;
        onSpecsPasteInput();
    }
    closeExpandedSpecsEditor();
    if (typeof showToast === 'function') {
        showToast('✓ Especificação atualizada com sucesso!', 'success', 2500);
    }
}

function closeExpandedSpecsEditor() {
    isQuickstartSpecsEditorActive = false;
    const modal = document.getElementById('fileEditorModal');
    if (modal) {
        modal.classList.remove('on-top');
        modal.style.display = 'none';
    }

    const qsModal = document.getElementById('quickstartModal');
    const isQsOpen = qsModal && qsModal.style.display !== 'none';
    document.body.style.overflow = isQsOpen ? 'hidden' : '';

    const stdActions = document.getElementById('editorStandardActions');
    const specsActions = document.getElementById('editorSpecsActions');
    if (stdActions) stdActions.style.display = 'flex';
    if (specsActions) specsActions.style.display = 'none';

    const pasteTextarea = document.getElementById('qsPasteTextarea');
    if (pasteTextarea) {
        setTimeout(() => pasteTextarea.focus(), 80);
    }
}

/* ==========================================================================
   Quickstart: Expanded Project Description Editor Modal
   ========================================================================== */
let isQuickstartDescEditorActive = false;

function openExpandedDescEditor() {
    isQuickstartDescEditorActive = true;
    const modal = document.getElementById('fileEditorModal');
    if (!modal) return;

    const descInput = document.getElementById('qsNewDesc');
    const nameInput = document.getElementById('qsNewName');
    const projectName = (nameInput && nameInput.value.trim()) || 'Novo Projeto';
    const content = descInput ? descInput.value : '';

    activeEditingPath = 'PROJECT.md';
    currentEditorTab = 'write';

    modal.classList.add('on-top');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Oculta seções do Grill e exibe ações
    const qsTabsWrap = document.getElementById('editorQuickstartTabsWrap');
    const qsRefineBox = document.getElementById('editorQuickstartRefineBox');
    const stdActions = document.getElementById('editorStandardActions');
    const qsActions = document.getElementById('editorQuickstartActions');
    const specsActions = document.getElementById('editorSpecsActions');

    if (qsTabsWrap) qsTabsWrap.style.display = 'none';
    if (qsRefineBox) qsRefineBox.style.display = 'none';
    if (stdActions) stdActions.style.display = 'none';
    if (qsActions) qsActions.style.display = 'none';
    if (specsActions) specsActions.style.display = 'flex';

    // Header info
    const titleEl = document.getElementById('editorModalTitle');
    const badgeEl = document.getElementById('editorBadgeText');
    const pathEl = document.getElementById('editorFilePath');
    const statusText = document.getElementById('editorStatusText');
    const textarea = document.getElementById('editorTextarea');

    if (titleEl) titleEl.textContent = `Descrição: ${projectName}`;
    if (badgeEl) badgeEl.textContent = '📝 DESCRIÇÃO DO PROJETO';
    if (pathEl) pathEl.textContent = `PROJECT.md (Visão Geral & Domínio)`;
    if (statusText) statusText.innerHTML = '<span class="status-dot" style="background:#6366f1"></span> Editando descrição em tela cheia (Ctrl+S para concluir)';

    if (textarea) {
        textarea.value = content;
        textarea.placeholder = 'Descreva os objetivos de negócio, problemas a resolver, funcionalidades chave ou arquitetura esperada para guiar o Arquiteto IA...';

        textarea.onkeydown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                applyExpandedDescEditor();
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

    switchEditorTab('write');
    applyEditorZoom(currentEditorZoom || 80);
}

function applyExpandedDescEditor() {
    const editorTextarea = document.getElementById('editorTextarea');
    const descInput = document.getElementById('qsNewDesc');
    if (editorTextarea && descInput) {
        descInput.value = editorTextarea.value.trim();
        onQuickstartDescInput(descInput.value);
    }
    closeExpandedDescEditor();
    if (typeof showToast === 'function') {
        showToast('✓ Descrição atualizada com sucesso!', 'success', 2500);
    }
}

function closeExpandedDescEditor() {
    isQuickstartDescEditorActive = false;
    const modal = document.getElementById('fileEditorModal');
    if (modal) {
        modal.classList.remove('on-top');
        modal.style.display = 'none';
    }

    const qsModal = document.getElementById('quickstartModal');
    const isQsOpen = qsModal && qsModal.style.display !== 'none';
    document.body.style.overflow = isQsOpen ? 'hidden' : '';

    const stdActions = document.getElementById('editorStandardActions');
    const specsActions = document.getElementById('editorSpecsActions');
    if (stdActions) stdActions.style.display = 'flex';
    if (specsActions) specsActions.style.display = 'none';

    const descInput = document.getElementById('qsNewDesc');
    if (descInput) {
        setTimeout(() => descInput.focus(), 80);
    }
}

function onEditorSpecsActionsCancel() {
    if (isQuickstartDescEditorActive) {
        closeExpandedDescEditor();
    } else if (isQuickstartSpecsEditorActive) {
        closeExpandedSpecsEditor();
    }
}

function onEditorSpecsActionsApply() {
    if (isQuickstartDescEditorActive) {
        applyExpandedDescEditor();
    } else if (isQuickstartSpecsEditorActive) {
        applyExpandedSpecsEditor();
    }
}

async function triggerQuickstartChoice(mode) {
    quickstartSubMode = mode;
    const nameInput = document.getElementById('qsNewName');
    const descInput = document.getElementById('qsNewDesc');
    const initGitCheckbox = document.getElementById('qsNewInitGit');

    const name = nameInput ? nameInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const initGit = initGitCheckbox ? initGitCheckbox.checked : true;
    const specs = getCollectedSpecs();

    if (!name) {
        if (nameInput) {
            nameInput.focus();
            nameInput.classList.add('input-error-shake');
            setTimeout(() => nameInput.classList.remove('input-error-shake'), 600);
        }
        if (typeof showToast === 'function') {
            showToast('Por favor, informe o nome do projeto para prosseguir.', 'warning', 4500);
        } else {
            alert('Por favor, digite um nome para o projeto.');
        }
        return;
    }

    const select = document.getElementById('qsNewStackSelect');
    const isCustom = select && select.value === 'custom';
    const customInput = document.getElementById('qsNewStackCustom');
    const customVal = customInput ? customInput.value.trim() : '';

    if (isCustom && !customVal) {
        const techAccordion = document.getElementById('qsTechAccordion');
        const techBody = document.getElementById('qsTechBody');
        const techToggleText = document.getElementById('qsTechToggleText');
        if (techAccordion && techBody && techBody.style.display === 'none') {
            techAccordion.classList.add('open');
            techBody.style.display = 'block';
            if (techToggleText) techToggleText.textContent = 'Recolher −';
        }

        if (customInput) {
            customInput.classList.add('input-error-shake');
            setTimeout(() => customInput.classList.remove('input-error-shake'), 600);
        }

        await showBrainAlert({
            title: 'Stack Tecnológica Obrigatória',
            badge: 'PREENCHIMENTO REQUERIDO',
            icon: '✏️',
            message: 'Você selecionou a opção <strong>Outra / Stack Personalizada</strong>.<br><br>Por favor, informe a linguagem, framework ou stack tecnológica do projeto no campo correspondente antes de continuar.',
            okText: 'Informar Stack',
            type: 'warning'
        });

        setTimeout(() => {
            if (customInput) customInput.focus();
        }, 100);
        return;
    }

    const stack = getSelectedStackValue();

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice('criar projetos no disco rígido');
        return;
    }

    if (mode === 'assisted') {
        const spAssisted = document.getElementById('spinnerModeAssisted');
        if (spAssisted) spAssisted.style.display = 'inline-block';
        startGrillQuestionsFlow({ name, stack, description: desc, initGit, specs });
        return;
    }

    if (mode === 'express') {
        const cardExpress = document.getElementById('cardModeExpress');
        const spinnerExpress = document.getElementById('spinnerModeExpress');
        const textExpress = document.getElementById('textModeExpress');
        const origText = textExpress ? textExpress.innerHTML : '⚡ Criar Projeto Imediato (50ms) →';

        if (cardExpress) cardExpress.classList.add('disabled');
        if (spinnerExpress) spinnerExpress.style.display = 'inline-block';
        if (textExpress) textExpress.textContent = 'Criando projeto (Express)...';

        try {
            const res = await fetch('/api/projects/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, stack, description: desc, initGit, specs })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Erro ao criar projeto.');
                if (cardExpress) cardExpress.classList.remove('disabled');
                if (spinnerExpress) spinnerExpress.style.display = 'none';
                if (textExpress) textExpress.innerHTML = origText;
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
            if (cardExpress) cardExpress.classList.remove('disabled');
            if (spinnerExpress) spinnerExpress.style.display = 'none';
            if (textExpress) textExpress.innerHTML = origText;
        }
    }
}

function resetQuickstartGrillPanes() {
    const modal = document.getElementById('quickstartModal');
    const modalCard = modal ? modal.querySelector('.quickstart-modal-card') : document.querySelector('.quickstart-modal-card');
    if (modalCard) modalCard.classList.remove('grill-mode', 'draft-mode', 'wide', 'is-loading-questions');

    const qsBody = document.querySelector('.qs-body');
    if (qsBody) qsBody.classList.remove('grill-active');

    const formNew = document.getElementById('qsFormNew');
    const qPane = document.getElementById('qsGrillQuestionsPane');
    const dPane = document.getElementById('qsGrillDraftPane');
    const spAssisted = document.getElementById('spinnerModeAssisted');
    const spExpress = document.getElementById('spinnerModeExpress');
    const cardExpress = document.getElementById('cardModeExpress');
    const textExpress = document.getElementById('textModeExpress');
    if (spAssisted) spAssisted.style.display = 'none';
    if (spExpress) spExpress.style.display = 'none';
    if (cardExpress) cardExpress.classList.remove('disabled');
    if (textExpress) textExpress.textContent = '⚡ Criar Projeto Imediato (50ms) →';

    if (formNew && quickstartMode === 'new') formNew.style.display = 'flex';
    if (qPane) qPane.style.display = 'none';
    if (dPane) dPane.style.display = 'none';
    switchQsContractMode('preview');
    if (quickstartStep === 2) {
        const headerBackBtn = document.getElementById('qsHeaderBackBtn');
        if (headerBackBtn) {
            headerBackBtn.style.display = 'inline-flex';
            headerBackBtn.textContent = '← Trocar modo';
        }
        const titleEl = document.getElementById('qsTitle');
        if (titleEl) {
            titleEl.textContent = quickstartMode === 'new'
                ? 'Criando Projeto do Zero'
                : 'Vincular Repositório Existente';
        }
    }
}

function backFromGrillQuestions() {
    // 1. Cancela qualquer requisição in-flight de formulação de perguntas com IA
    if (window._currentGrillQuestionsAbortController) {
        try { window._currentGrillQuestionsAbortController.abort(); } catch (_) { }
        window._currentGrillQuestionsAbortController = null;
    }

    const modal = document.getElementById('quickstartModal');
    const modalCard = modal ? modal.querySelector('.quickstart-modal-card') : document.querySelector('.quickstart-modal-card');
    if (modalCard) {
        modalCard.classList.remove('grill-mode', 'is-loading-questions', 'draft-mode');
        if (quickstartStep === 2) {
            modalCard.classList.add('wide');
        } else {
            modalCard.classList.remove('wide');
        }
    }

    const qsBody = document.querySelector('.qs-body');
    if (qsBody) qsBody.classList.remove('grill-active');

    const formNew = document.getElementById('qsFormNew');
    const qPane = document.getElementById('qsGrillQuestionsPane');
    const loadingEl = document.getElementById('qsGrillLoadingQuestions');
    const containerEl = document.getElementById('qsGrillQuestionsContainer');
    const actionCardsEl = document.getElementById('qsGrillActionCards');
    const spAssisted = document.getElementById('spinnerModeAssisted');
    const spExpress = document.getElementById('spinnerModeExpress');
    const cardExpress = document.getElementById('cardModeExpress');
    const textExpress = document.getElementById('textModeExpress');

    // Desativa elementos de carregamento e spinners
    if (loadingEl) loadingEl.style.display = 'none';
    if (containerEl) containerEl.style.display = 'none';
    if (actionCardsEl) actionCardsEl.style.display = 'none';
    if (spAssisted) spAssisted.style.display = 'none';
    if (spExpress) spExpress.style.display = 'none';
    if (cardExpress) cardExpress.classList.remove('disabled');
    if (textExpress) textExpress.textContent = '⚡ Criar Projeto Imediato (50ms) →';

    if (formNew) formNew.style.display = 'flex';
    if (qPane) qPane.style.display = 'none';
    const headerBackBtn = document.getElementById('qsHeaderBackBtn');
    if (headerBackBtn) {
        headerBackBtn.style.display = 'inline-flex';
        headerBackBtn.textContent = '← Trocar modo';
    }
    const titleEl = document.getElementById('qsTitle');
    if (titleEl) {
        titleEl.textContent = quickstartMode === 'new'
            ? 'Criando Projeto do Zero'
            : 'Vincular Repositório Existente';
    }
}

function backToGrillQuestions() {
    if (qsSynthInterval) {
        clearInterval(qsSynthInterval);
        qsSynthInterval = null;
    }
    const modal = document.getElementById('quickstartModal');
    const modalCard = modal ? modal.querySelector('.quickstart-modal-card') : document.querySelector('.quickstart-modal-card');
    if (modalCard) modalCard.classList.remove('draft-mode');

    const qPane = document.getElementById('qsGrillQuestionsPane');
    const dPane = document.getElementById('qsGrillDraftPane');
    if (qPane) qPane.style.display = 'flex';
    if (dPane) dPane.style.display = 'none';
    const headerBackBtn = document.getElementById('qsHeaderBackBtn');
    if (headerBackBtn) {
        headerBackBtn.style.display = 'inline-flex';
        headerBackBtn.textContent = '← Voltar aos dados';
    }
    const titleEl = document.getElementById('qsTitle');
    if (titleEl) {
        titleEl.textContent = '🎯 Sabatina Técnica com IA (Grill Studio)';
    }
}

function onQsContractTextareaInput() {
    const textarea = document.getElementById('qsContractTextarea');
    if (textarea && currentActiveContract && currentGrillDraft) {
        currentGrillDraft[currentActiveContract] = textarea.value;
    }
}

function switchQsContractMode(mode) {
    const prevMode = currentQsContractMode;
    currentQsContractMode = mode;
    const btnPreview = document.getElementById('btnQsContractTabPreview');
    const btnWrite = document.getElementById('btnQsContractTabWrite');
    const previewPane = document.getElementById('qsContractPreviewPane');
    const textarea = document.getElementById('qsContractTextarea');

    if (btnPreview) btnPreview.classList.toggle('active', mode === 'preview');
    if (btnWrite) btnWrite.classList.toggle('active', mode === 'write');

    if (mode === 'preview') {
        if (prevMode === 'write' && textarea && currentActiveContract && currentGrillDraft) {
            currentGrillDraft[currentActiveContract] = textarea.value;
        }
        if (textarea) textarea.style.display = 'none';
        if (previewPane) {
            previewPane.style.display = 'block';
            updateQsContractPreviewContent();
        }
    } else {
        if (previewPane) previewPane.style.display = 'none';
        if (textarea) {
            textarea.style.display = 'block';
            textarea.value = (currentGrillDraft && currentGrillDraft[currentActiveContract]) || '';
            textarea.focus();
        }
    }
}

function updateQsContractPreviewContent() {
    const previewPane = document.getElementById('qsContractPreviewPane');
    if (!previewPane || !currentGrillDraft || !currentActiveContract) return;

    const rawMarkdown = currentGrillDraft[currentActiveContract] || '';
    const fakePath = `projects/${(currentGrillProjectInfo && currentGrillProjectInfo.name) || 'projeto'}/${currentActiveContract}.md`;

    let renderedHtml = '';
    if (window.VAULT && typeof window.VAULT.renderMarkdown === 'function') {
        renderedHtml = window.VAULT.renderMarkdown(rawMarkdown, fakePath);
    } else if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
        renderedHtml = marked.parse(rawMarkdown);
    } else {
        renderedHtml = `<pre>${escapeHtml(rawMarkdown)}</pre>`;
    }

    previewPane.innerHTML = `<div class="doc-preview-inner">${renderedHtml}</div>`;
}

function applyQsContractZoom(zoomPercent) {
    const clamped = Math.min(150, Math.max(50, Math.round(zoomPercent)));
    currentQsContractZoom = clamped;

    const valEl = document.getElementById('qsContractZoomVal');
    if (valEl) valEl.textContent = clamped + '%';

    const btnPlus = document.getElementById('btnQsZoomPlus');
    const btnMinus = document.getElementById('btnQsZoomMinus');
    if (btnPlus) btnPlus.disabled = clamped >= 150;
    if (btnMinus) btnMinus.disabled = clamped <= 50;

    const ratio = clamped / 100;
    const card = document.querySelector('.qs-contract-viewer-card');
    if (card) {
        card.style.setProperty('--qs-contract-zoom', ratio);
    }

    const previewPane = document.getElementById('qsContractPreviewPane');
    const textarea = document.getElementById('qsContractTextarea');

    if (previewPane) {
        previewPane.style.zoom = ratio;
        previewPane.style.maxHeight = Math.round(340 / ratio) + 'px';
        previewPane.style.minHeight = Math.round(180 / ratio) + 'px';
    }
    if (textarea) {
        textarea.style.zoom = ratio;
        textarea.style.maxHeight = Math.round(340 / ratio) + 'px';
        textarea.style.minHeight = Math.round(180 / ratio) + 'px';
    }

    try {
        localStorage.setItem('qs_contract_zoom', String(clamped));
    } catch (_) { }
}

function adjustQsContractZoom(delta) {
    applyQsContractZoom((currentQsContractZoom || 80) + delta);
}

function resetQsContractZoom() {
    applyQsContractZoom(80);
}

function initQsContractZoomControls() {
    try {
        const saved = localStorage.getItem('qs_contract_zoom');
        if (saved) {
            const parsed = parseInt(saved, 10);
            if (!isNaN(parsed) && parsed >= 50 && parsed <= 150) {
                currentQsContractZoom = parsed;
            }
        }
    } catch (_) { }

    applyQsContractZoom(currentQsContractZoom || 80);

    const handleWheelZoom = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            adjustQsContractZoom(e.deltaY < 0 ? 10 : -10);
        }
    };

    const preview = document.getElementById('qsContractPreviewPane');
    const textarea = document.getElementById('qsContractTextarea');
    if (preview) preview.addEventListener('wheel', handleWheelZoom, { passive: false });
    if (textarea) textarea.addEventListener('wheel', handleWheelZoom, { passive: false });
}

let currentEditorZoom = 80;

function applyEditorZoom(zoomPercent) {
    const clamped = Math.min(150, Math.max(50, Math.round(zoomPercent)));
    currentEditorZoom = clamped;

    const valEl = document.getElementById('editorZoomVal');
    if (valEl) valEl.textContent = clamped + '%';

    const btnPlus = document.getElementById('btnEditorZoomPlus');
    const btnMinus = document.getElementById('btnEditorZoomMinus');
    if (btnPlus) btnPlus.disabled = clamped >= 150;
    if (btnMinus) btnMinus.disabled = clamped <= 50;

    const ratio = clamped / 100;
    const modal = document.getElementById('fileEditorModal');
    if (modal) {
        modal.style.setProperty('--editor-zoom', ratio);
    }

    const previewPane = document.getElementById('editorPreviewPane');
    const textarea = document.getElementById('editorTextarea');

    if (previewPane) {
        previewPane.style.zoom = ratio;
        previewPane.style.width = (100 / ratio) + '%';
        previewPane.style.height = (100 / ratio) + '%';
    }
    if (textarea) {
        textarea.style.zoom = ratio;
        textarea.style.width = (100 / ratio) + '%';
        textarea.style.height = (100 / ratio) + '%';
    }

    try {
        localStorage.setItem('editor_zoom', String(clamped));
    } catch (_) { }
}

function adjustEditorZoom(delta) {
    applyEditorZoom((currentEditorZoom || 80) + delta);
}

function resetEditorZoom() {
    applyEditorZoom(80);
}

function initEditorZoomControls() {
    try {
        const saved = localStorage.getItem('editor_zoom');
        if (saved) {
            const parsed = parseInt(saved, 10);
            if (!isNaN(parsed) && parsed >= 50 && parsed <= 150) {
                currentEditorZoom = parsed;
            }
        }
    } catch (_) { }

    applyEditorZoom(currentEditorZoom || 80);

    const handleWheelZoom = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            adjustEditorZoom(e.deltaY < 0 ? 10 : -10);
        }
    };

    const preview = document.getElementById('editorPreviewPane');
    const textarea = document.getElementById('editorTextarea');
    if (preview) preview.addEventListener('wheel', handleWheelZoom, { passive: false });
    if (textarea) textarea.addEventListener('wheel', handleWheelZoom, { passive: false });
}

function openExpandedContractModal() {
    if (!currentGrillDraft || !currentActiveContract) return;

    // Save any draft edits from quickstart textarea
    const qsTextarea = document.getElementById('qsContractTextarea');
    if (qsTextarea) {
        currentGrillDraft[currentActiveContract] = qsTextarea.value;
    }

    isQuickstartEditorActive = true;
    const modal = document.getElementById('fileEditorModal');
    if (!modal) return;

    modal.classList.add('on-top');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Show Quickstart specific elements in fileEditorModal
    const qsTabsWrap = document.getElementById('editorQuickstartTabsWrap');
    const qsRefineBox = document.getElementById('editorQuickstartRefineBox');
    const stdActions = document.getElementById('editorStandardActions');
    const qsActions = document.getElementById('editorQuickstartActions');

    if (qsTabsWrap) qsTabsWrap.style.display = 'block';
    if (qsRefineBox) qsRefineBox.style.display = 'flex';
    if (stdActions) stdActions.style.display = 'none';
    if (qsActions) qsActions.style.display = 'flex';

    updateEditorContractTabs(currentActiveContract);
    loadContractIntoEditor(currentActiveContract, currentQsContractMode || 'preview');
    applyEditorZoom(currentQsContractZoom || currentEditorZoom || 80);
}

function closeExpandedContractModal() {
    isQuickstartEditorActive = false;
    const modal = document.getElementById('fileEditorModal');
    if (modal) {
        modal.classList.remove('on-top');
        modal.style.display = 'none';
    }

    // Save editor textarea to currentGrillDraft
    const editorTextarea = document.getElementById('editorTextarea');
    if (editorTextarea && currentActiveContract && currentGrillDraft) {
        currentGrillDraft[currentActiveContract] = editorTextarea.value;
    }

    // Restore standard fileEditorModal elements
    const qsTabsWrap = document.getElementById('editorQuickstartTabsWrap');
    const qsRefineBox = document.getElementById('editorQuickstartRefineBox');
    const stdActions = document.getElementById('editorStandardActions');
    const qsActions = document.getElementById('editorQuickstartActions');

    if (qsTabsWrap) qsTabsWrap.style.display = 'none';
    if (qsRefineBox) qsRefineBox.style.display = 'none';
    if (stdActions) stdActions.style.display = 'flex';
    if (qsActions) qsActions.style.display = 'none';

    // Sync back to Quickstart card
    const qsTextarea = document.getElementById('qsContractTextarea');
    if (qsTextarea && currentGrillDraft) {
        qsTextarea.value = currentGrillDraft[currentActiveContract] || '';
    }
    updateQsContractPreviewContent();
    switchQsContractMode(currentEditorTab || 'preview');
    applyQsContractZoom(currentEditorZoom || currentQsContractZoom || 80);

    // Keep body overflow hidden because quickstartModal is still open
    document.body.style.overflow = 'hidden';
}

function selectEditorContractTab(contractKey) {
    const editorTextarea = document.getElementById('editorTextarea');
    if (editorTextarea && currentActiveContract && currentGrillDraft) {
        currentGrillDraft[currentActiveContract] = editorTextarea.value;
    }

    currentActiveContract = contractKey;
    updateEditorContractTabs(contractKey);

    // Also update Quickstart tabs in background
    document.querySelectorAll('.qs-contract-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-contract') === contractKey);
    });

    const badge = document.getElementById('qsContractViewerBadge');
    const names = {
        projectMd: 'VISUALIZANDO PROJECT.md (Visão & Escopo)',
        architectureMd: 'VISUALIZANDO ARCHITECTURE.md (Padrões & Camadas)',
        currentStateMd: 'VISUALIZANDO CURRENT_STATE.md (Roadmap Ativo)',
        adrMd: 'VISUALIZANDO ADR-0001 (Decisão de Stack Inicial)'
    };
    if (badge) badge.textContent = names[contractKey] || 'CONTRATO DE GOVERNANÇA';

    loadContractIntoEditor(contractKey, currentEditorTab || 'preview');
}

function updateEditorContractTabs(contractKey) {
    const tabsContainer = document.getElementById('editorContractTabs');
    if (tabsContainer) {
        tabsContainer.querySelectorAll('.qs-contract-tab').forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-contract') === contractKey);
        });
    }
}

function loadContractIntoEditor(contractKey, mode = 'preview') {
    const editorTextarea = document.getElementById('editorTextarea');
    const titleEl = document.getElementById('editorModalTitle');
    const badgeEl = document.getElementById('editorBadgeText');
    const pathEl = document.getElementById('editorFilePath');
    const statusText = document.getElementById('editorStatusText');

    const fileMap = {
        projectMd: 'PROJECT.md',
        architectureMd: 'ARCHITECTURE.md',
        currentStateMd: 'CURRENT_STATE.md',
        adrMd: 'DECISIONS/0001-stack-inicial.md'
    };
    const filename = fileMap[contractKey] || 'DOCUMENTO.md';
    const projName = (currentGrillProjectInfo && currentGrillProjectInfo.name) || 'projeto';
    const filePath = `projects/${projName}/${filename}`;

    activeEditingPath = filePath;
    if (pathEl) pathEl.textContent = filePath;
    if (titleEl) titleEl.textContent = `Contrato de Governança: ${filename}`;
    if (badgeEl) badgeEl.textContent = mode === 'write' ? '✏️ EDITOR DE CONTRATO' : '👁️ PRÉ-VISUALIZAÇÃO DE CONTRATO';
    if (statusText) statusText.innerHTML = '<span class="status-dot snapshot"></span> Rascunho assistido por IA (Grill Studio)';

    const content = (currentGrillDraft && currentGrillDraft[contractKey]) || '';
    if (editorTextarea) editorTextarea.value = content;

    switchEditorTab(mode);
}

// ============================================================
// JEV FIRST & SURGICAL REFINEMENT HELPERS (PROMPT VIVO)
// ============================================================

function docToContractKey(docName) {
    if (!docName) return null;
    const lower = String(docName).toLowerCase();
    if (lower.includes('architecture')) return 'architectureMd';
    if (lower.includes('project')) return 'projectMd';
    if (lower.includes('current_state') || lower.includes('current-state')) return 'currentStateMd';
    if (lower.includes('adr') || lower.includes('decisions')) return 'adrMd';
    return null;
}

function handleClarificationModalBackdrop(e) {
    if (e && e.target && e.target.id === 'qsClarificationModal') {
        closeClarificationModal();
    }
}

function closeClarificationModal() {
    const modal = document.getElementById('qsClarificationModal');
    if (modal) modal.style.display = 'none';
    activeClarificationContext = null;
}

function selectClarifyOption(val) {
    const input = document.getElementById('qsClarifyAnswerInput');
    if (input) {
        input.value = val;
        onClarifyInputChange();
        input.focus();
    }
}

function onClarifyInputChange() {
    const input = document.getElementById('qsClarifyAnswerInput');
    const err = document.getElementById('qsClarifyInputError');
    if (input && input.value.trim().length > 0) {
        input.classList.remove('error');
        if (err) err.style.display = 'none';
    }
}

function openClarificationModal(data, sourceModal) {
    activeClarificationContext = {
        feedback: data.feedback || (sourceModal === 'expanded' ? (document.getElementById('editorQsRefineInput') || {}).value : (document.getElementById('qsRefineInput') || {}).value) || '',
        sourceModal: sourceModal,
        question: data.question || 'A IA precisa de mais detalhes para prosseguir.',
        reason: data.reason || ''
    };

    const origFbEl = document.getElementById('qsClarifyOriginalFeedback');
    const qTextEl = document.getElementById('qsClarifyQuestionText');
    const reasonTextEl = document.getElementById('qsClarifyReasonText');
    const reasonRowEl = document.getElementById('qsClarifyReasonRow');
    const optionsRowEl = document.getElementById('qsClarifyOptionsRow');
    const optionsContainer = document.getElementById('qsClarifyOptionsContainer');
    const answerInput = document.getElementById('qsClarifyAnswerInput');
    const inputError = document.getElementById('qsClarifyInputError');

    const reasonText = data.reason || data.rationale || '';
    if (origFbEl) origFbEl.textContent = `"${activeClarificationContext.feedback}"`;
    if (qTextEl) qTextEl.textContent = data.question || 'A IA precisa de mais informações para refinar.';
    if (reasonTextEl) reasonTextEl.textContent = reasonText;
    if (reasonRowEl) reasonRowEl.style.display = reasonText ? 'flex' : 'none';

    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        const opts = data.suggestedOptions || data.options || [];
        if (Array.isArray(opts) && opts.length > 0) {
            opts.forEach(opt => {
                const chip = document.createElement('span');
                chip.className = 'qs-clarify-chip';
                chip.textContent = opt;
                chip.onclick = () => selectClarifyOption(opt);
                optionsContainer.appendChild(chip);
            });
            if (optionsRowEl) optionsRowEl.style.display = 'flex';
        } else {
            if (optionsRowEl) optionsRowEl.style.display = 'none';
        }
    }

    if (answerInput) {
        answerInput.value = '';
        answerInput.classList.remove('error');
    }
    if (inputError) inputError.style.display = 'none';

    const modal = document.getElementById('qsClarificationModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            if (answerInput) answerInput.focus();
        }, 100);
    }
}

async function submitClarificationAndRefine() {
    if (!activeClarificationContext) return;
    const input = document.getElementById('qsClarifyAnswerInput');
    const err = document.getElementById('qsClarifyInputError');
    const btn = document.getElementById('btnSubmitClarification');
    const answer = input ? input.value.trim() : '';

    if (!answer) {
        if (input) {
            input.classList.add('error');
            input.focus();
        }
        if (err) err.style.display = 'block';
        return;
    }

    const { feedback, sourceModal } = activeClarificationContext;
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner" style="display:inline-block"></span> Processando...';

    try {
        const res = await fetch('/api/projects/quickstart/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentGrillProjectInfo,
                contracts: currentGrillDraft,
                feedback: feedback,
                clarification: answer
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.error || 'Erro ao refinar contratos.');
            err.statusCode = res.status;
            err.quotaExceeded = data.quotaExceeded;
            err.isRateLimit = data.isRateLimit;
            err.authError = data.authError;
            err.retryAfter = data.retryAfter;
            err.providerName = data.providerName;
            throw err;
        }

        if (data.status === 'needs_clarification') {
            openClarificationModal({ ...data, feedback }, sourceModal);
            return;
        }

        closeClarificationModal();
        handleRefineSuccess(data, sourceModal);
    } catch (err) {
        showAiErrorModal(err, { context: 'quickstart-clarification' });
    } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

function handleRefineSuccess(data, sourceModal) {
    // 1. Snapshot do rascunho anterior para Desfazer (Undo)
    previousGrillDraft = JSON.parse(JSON.stringify(currentGrillDraft));

    // 2. Atualizar rascunho ativo
    currentGrillDraft = data.contracts;

    // 3. Exibir botões de Desfazer
    const btnUndo = document.getElementById('btnUndoGrillRefine');
    const btnEditorUndo = document.getElementById('btnEditorUndoGrillRefine');
    if (btnUndo) btnUndo.style.display = 'inline-flex';
    if (btnEditorUndo) btnEditorUndo.style.display = 'inline-flex';

    // 4. Identificar documento prioritário para auto-switch de aba
    const targetDocs = data.targetDocs || data.modifiedDocs || [];
    let switchKey = null;
    if (targetDocs.length > 0) {
        switchKey = docToContractKey(targetDocs[0]);
    }

    // 5. Aplicar auto-switch de aba com animação de destaque (flash)
    if (sourceModal === 'expanded') {
        if (switchKey && typeof selectEditorContractTab === 'function') {
            selectEditorContractTab(switchKey);
        } else {
            loadContractIntoEditor(currentActiveContract, currentEditorTab || 'preview');
        }
        const activeTabEl = document.querySelector('#editorContractTabs .qs-contract-tab.active');
        if (activeTabEl) {
            activeTabEl.classList.remove('tab-flash-active');
            void activeTabEl.offsetWidth; // trigger reflow
            activeTabEl.classList.add('tab-flash-active');
            setTimeout(() => activeTabEl.classList.remove('tab-flash-active'), 1200);
        }
        // Sincronizar textarea e preview em segundo plano
        const qsTextarea = document.getElementById('qsContractTextarea');
        if (qsTextarea) qsTextarea.value = currentGrillDraft[currentActiveContract] || '';
        updateQsContractPreviewContent();
    } else {
        if (switchKey && typeof selectContractTab === 'function') {
            selectContractTab(switchKey);
        } else {
            const textarea = document.getElementById('qsContractTextarea');
            if (textarea) textarea.value = currentGrillDraft[currentActiveContract] || '';
            updateQsContractPreviewContent();
        }
        const activeTabEl = document.querySelector('.qs-contract-preview-box .qs-contract-tab.active');
        if (activeTabEl) {
            activeTabEl.classList.remove('tab-flash-active');
            void activeTabEl.offsetWidth; // trigger reflow
            activeTabEl.classList.add('tab-flash-active');
            setTimeout(() => activeTabEl.classList.remove('tab-flash-active'), 1200);
        }
    }

    // 6. Limpar campos de input
    const inputEl = document.getElementById('qsRefineInput');
    const editorInputEl = document.getElementById('editorQsRefineInput');
    if (inputEl) inputEl.value = '';
    if (editorInputEl) editorInputEl.value = '';

    // 7. Notificar sucesso cirúrgico
    let successMsg = '✨ Contratos refinados com sucesso!';
    if (targetDocs && targetDocs.length > 0) {
        successMsg = `✨ IA refinou cirurgicamente: ${targetDocs.join(', ')}`;
    }
    if (typeof showToast === 'function') {
        showToast(successMsg);
    } else {
        alert(successMsg);
    }
}

function undoGrillRefine() {
    if (!previousGrillDraft) return;

    // Alternar entre rascunho anterior e atual
    const temp = currentGrillDraft;
    currentGrillDraft = previousGrillDraft;
    previousGrillDraft = temp;

    // Atualizar UI
    if (isQuickstartEditorActive) {
        loadContractIntoEditor(currentActiveContract, currentEditorTab || 'preview');
        const qsTextarea = document.getElementById('qsContractTextarea');
        if (qsTextarea) qsTextarea.value = currentGrillDraft[currentActiveContract] || '';
        updateQsContractPreviewContent();
    } else {
        const textarea = document.getElementById('qsContractTextarea');
        if (textarea) textarea.value = currentGrillDraft[currentActiveContract] || '';
        updateQsContractPreviewContent();
    }

    if (typeof showToast === 'function') {
        showToast('↺ Ajuste da IA desfeito com sucesso!');
    } else {
        alert('↺ Ajuste da IA desfeito com sucesso!');
    }
}

async function submitExpandedGrillRefine() {
    const inputEl = document.getElementById('editorQsRefineInput');
    const btn = document.getElementById('btnEditorGrillRefine');
    const editorTextarea = document.getElementById('editorTextarea');
    const fb = inputEl ? inputEl.value.trim() : '';

    if (!fb) {
        alert('Por favor, digite o que você gostaria de melhorar nos contratos.');
        if (inputEl) inputEl.focus();
        return;
    }

    if (editorTextarea && currentActiveContract && currentGrillDraft) {
        currentGrillDraft[currentActiveContract] = editorTextarea.value;
    }

    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner" style="display:inline-block"></span> Refinando...';

    try {
        const res = await fetch('/api/projects/quickstart/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentGrillProjectInfo,
                contracts: currentGrillDraft,
                feedback: fb
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.error || 'Erro ao refinar contratos.');
            err.statusCode = res.status;
            err.quotaExceeded = data.quotaExceeded;
            err.isRateLimit = data.isRateLimit;
            err.authError = data.authError;
            err.retryAfter = data.retryAfter;
            err.providerName = data.providerName;
            throw err;
        }

        if (data.status === 'needs_clarification') {
            openClarificationModal({ ...data, feedback: fb }, 'expanded');
            return;
        }

        handleRefineSuccess(data, 'expanded');
    } catch (err) {
        showAiErrorModal(err, { context: 'quickstart-refine-expanded' });
    } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

function commitFromExpandedModal() {
    const editorTextarea = document.getElementById('editorTextarea');
    if (editorTextarea && currentActiveContract && currentGrillDraft) {
        currentGrillDraft[currentActiveContract] = editorTextarea.value;
    }
    closeExpandedContractModal();
    commitGrillProject();
}

let currentGrillValidationIssue = null;

async function confirmResetGrillQuestions() {
    if (!currentGrillProjectInfo) return;
    const hasAnswers = (currentGrillQuestions || []).some((q, idx) => {
        const qid = String(q.id || `q${idx + 1}`);
        const el = document.getElementById(`qsInput_${qid}`);
        return el && el.value.trim().length > 0;
    });

    const ok = await showBrainConfirm({
        title: hasAnswers ? 'Descartar respostas e refazer sabatina?' : 'Formular novas perguntas com IA?',
        icon: hasAnswers ? '⚠️' : null,
        iconSvg: hasAnswers ? null : 'assets/icon-refresh-animated.svg',
        noIconBox: !hasAnswers,
        badge: false, // Sem badge repetitivo: título limpo e alinhado perfeitamente ao ícone
        message: hasAnswers
            ? 'Você já preencheu respostas para as perguntas atuais deste projeto.<br><br>Deseja realmente <strong>descartar as respostas</strong> e solicitar que o Arquiteto de IA formule <strong>4 novas perguntas</strong>?'
            : 'Deseja solicitar que o Arquiteto de IA analise a stack e formule <strong>4 novas perguntas cirúrgicas</strong> para este projeto?',
        confirmText: hasAnswers ? 'Descartar e Refazer' : 'Sim, Formular Novas',
        cancelText: 'Manter Atuais',
        danger: hasAnswers
    });

    if (ok) {
        startGrillQuestionsFlow(currentGrillProjectInfo, true);
    }
}

async function startGrillQuestionsFlow(projectInfo, forceRegenerate = false) {
    const spAssisted = document.getElementById('spinnerModeAssisted');
    if (spAssisted) spAssisted.style.display = 'none';

    // 1. Salva respostas existentes preenchidas pelo usuário para não perder ao navegar
    const currentAnswersMap = {};
    (currentGrillQuestions || []).forEach((q, idx) => {
        const qid = String(q.id || `q${idx + 1}`);
        const el = document.getElementById(`qsInput_${qid}`);
        if (el && el.value.trim()) {
            currentAnswersMap[qid] = el.value.trim();
        }
    });

    // 2. Verifica se é exatamente o mesmo projeto
    const isSameProject = currentGrillProjectInfo &&
        currentGrillProjectInfo.name === projectInfo.name &&
        currentGrillProjectInfo.stack === projectInfo.stack &&
        (currentGrillProjectInfo.description || '') === (projectInfo.description || '') &&
        JSON.stringify(currentGrillProjectInfo.specs || []) === JSON.stringify(projectInfo.specs || []);

    const hasExistingQuestions = Array.isArray(currentGrillQuestions) && currentGrillQuestions.length > 0;

    currentGrillProjectInfo = projectInfo;
    currentGrillValidationIssue = null;

    const modal = document.getElementById('quickstartModal');
    const modalCard = modal ? modal.querySelector('.quickstart-modal-card') : document.querySelector('.quickstart-modal-card');
    if (modalCard) modalCard.classList.add('wide', 'grill-mode');

    const qsBody = document.querySelector('.qs-body');
    if (qsBody) qsBody.classList.add('grill-active');

    const formNew = document.getElementById('qsFormNew');
    const qPane = document.getElementById('qsGrillQuestionsPane');
    const loadingEl = document.getElementById('qsGrillLoadingQuestions');
    const containerEl = document.getElementById('qsGrillQuestionsContainer');
    const actionCardsEl = document.getElementById('qsGrillActionCards');
    const bannerEl = document.getElementById('qsGrillSummaryBanner');

    if (formNew) formNew.style.display = 'none';
    if (qPane) qPane.style.display = 'flex';

    const headerBackBtn = document.getElementById('qsHeaderBackBtn');
    if (headerBackBtn) {
        headerBackBtn.style.display = 'inline-flex';
        headerBackBtn.textContent = '← Voltar aos dados';
    }
    const titleEl = document.getElementById('qsTitle');
    if (titleEl) {
        titleEl.textContent = '🎯 Sabatina Técnica com IA (Grill Studio)';
    }

    if (bannerEl) {
        bannerEl.innerHTML = `
            <div class="qs-grill-summary-tags">
                <span class="qs-grill-summary-item"><strong>Projeto:</strong> ${escapeHtml(projectInfo.name)}</span>
                <span class="qs-grill-summary-item"><strong>Stack:</strong> ${escapeHtml(projectInfo.stack)}</span>
                ${projectInfo.description ? `<span class="qs-grill-summary-item"><strong>Foco:</strong> ${escapeHtml(projectInfo.description)}</span>` : ''}
                ${projectInfo.specs && projectInfo.specs.length > 0 ? `<span class="qs-grill-summary-item" style="color: #a5b4fc; border-color: rgba(99, 102, 241, 0.4);"><strong>SPECS:</strong> ${projectInfo.specs.length} ${projectInfo.specs.length === 1 ? 'doc' : 'docs'}</span>` : ''}
            </div>
            <button type="button" class="qs-grill-reset-btn" id="qsGrillResetBtn" onclick="confirmResetGrillQuestions()" title="Descartar respostas e formular novas perguntas com IA" style="display: none;">
                🔄 Refazer perguntas com IA
            </button>
        `;
    }

    const resetBtn = document.getElementById('qsGrillResetBtn');

    // 3. Cache Inteligente de Token: se NÃO foi forçado a regenerar E é o mesmo projeto E já temos perguntas
    if (!forceRegenerate && isSameProject && hasExistingQuestions) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (containerEl) containerEl.style.display = 'flex';
        if (actionCardsEl) actionCardsEl.style.display = 'grid';
        if (resetBtn) resetBtn.style.display = 'inline-flex';
        renderGrillQuestions(currentGrillQuestions, currentAnswersMap);
        updateGrillActionCardsState();
        return;
    }

    // 4. Fluxo de chamada com IA (primeira vez, projeto alterado ou refazer explícito)
    if (loadingEl) loadingEl.style.display = 'flex';
    if (containerEl) containerEl.style.display = 'none';
    if (actionCardsEl) actionCardsEl.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
    if (modalCard) modalCard.classList.add('is-loading-questions');

    // Limpa a lista de cards no DOM para que nada fique visível sob o spinner de carregamento
    const listEl = document.getElementById('qsGrillQuestionsList');
    if (listEl) listEl.innerHTML = '';

    if (window._currentGrillQuestionsAbortController) {
        try { window._currentGrillQuestionsAbortController.abort(); } catch (_) { }
    }
    window._currentGrillQuestionsAbortController = new AbortController();

    try {
        const res = await fetch('/api/projects/quickstart/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectInfo),
            signal: window._currentGrillQuestionsAbortController.signal
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.error || 'Erro ao formular perguntas.');
            err.statusCode = res.status;
            err.quotaExceeded = data.quotaExceeded;
            err.isRateLimit = data.isRateLimit;
            err.authError = data.authError;
            err.retryAfter = data.retryAfter;
            err.providerName = data.providerName;
            throw err;
        }

        currentGrillQuestions = data.questions || [];
        renderGrillQuestions(currentGrillQuestions);
    } catch (err) {
        if (err.name === 'AbortError') return;
        showAiErrorModal(err, { context: 'quickstart-questions' });
        backFromGrillQuestions();
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
        if (modalCard) modalCard.classList.remove('is-loading-questions');
        if (qPane && qPane.style.display !== 'none') {
            if (containerEl) containerEl.style.display = 'flex';
            if (actionCardsEl) actionCardsEl.style.display = 'grid';
            if (resetBtn) resetBtn.style.display = 'inline-flex';
            updateGrillActionCardsState();
        }
    }
}

function updateGrillActionCardsState() {
    const cardMore = document.getElementById('cardGrillMoreQuestions');
    const badgeMore = document.getElementById('badgeMoreQuestions');
    const textMore = document.getElementById('textMoreQuestions');

    if (!cardMore) return;
    if (currentGrillQuestions && currentGrillQuestions.length >= 8) {
        if (badgeMore) badgeMore.textContent = 'Máx 8';
        if (textMore) textMore.textContent = '✓ Sabatina completa (8 perguntas)';
        cardMore.classList.add('disabled');
    } else {
        const remaining = 8 - (currentGrillQuestions ? currentGrillQuestions.length : 0);
        if (badgeMore) badgeMore.textContent = `Até +${Math.min(4, remaining)}`;
        if (textMore) textMore.textContent = '🎯 Gerar mais perguntas com IA →';
        cardMore.classList.remove('disabled');
    }
}

function formatGrillCategory(cat) {
    if (!cat || typeof cat !== 'string') return 'Decisão';
    const raw = cat.trim();
    if (!raw) return 'Decisão';

    // Normaliza para análise semântica: sem acentos, maiúsculo
    const clean = raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();

    const hasWord = (w) => new RegExp(`(^|[^A-Z0-9])${w}([^A-Z0-9]|$)`).test(clean);

    // 1. Detecção Semântica por Domínio de Arquitetura (cobre variações dinâmicas de IA)
    // Arquitetura e Protocolos (deve vir antes de UI para não casar 'UI' em 'ARQUITETURA')
    if (clean.includes('ARQUITET') || clean.includes('ESTILO') || clean.includes('MICROSSERV') || hasWord('API') || hasWord('REST') || hasWord('GRAPHQL') || hasWord('GRPC')) return 'Arquitetura';
    if (clean.includes('ERRO') || clean.includes('RESILIEN') || clean.includes('FALLBACK') || clean.includes('CIRCUIT')) return 'Resiliência';
    if (clean.includes('LOG') || clean.includes('METRIC') || clean.includes('OBSERV') || clean.includes('TELEMETR') || clean.includes('MONITOR')) return 'Logs & Métricas';
    if (clean.includes('CACHE') || clean.includes('PERF') || clean.includes('LATEN') || clean.includes('ESCALAB')) return 'Cache & Perf';
    if (clean.includes('BANCO') || clean.includes('DADO') || clean.includes('PERSIST') || clean.includes('SQL') || clean.includes('STORAGE') || clean.includes('ORM')) return 'Persistência';
    if (clean.includes('AUTENTIC') || clean.includes('AUTORIZ') || clean.includes('LOGIN') || clean.includes('TOKEN') || hasWord('AUTH') || hasWord('JWT') || clean.includes('PERMISS')) return 'Autenticação';
    if (clean.includes('SEGURAN') || clean.includes('SECURITY') || clean.includes('CRIPTO') || clean.includes('VAULT')) return 'Segurança';
    if (clean.includes('FILA') || clean.includes('MENSAG') || clean.includes('QUEUE') || clean.includes('EVENT') || clean.includes('STREAM') || clean.includes('KAFKA') || clean.includes('RABBIT')) return 'Mensageria';
    if (clean.includes('TEST') || clean.includes('QUALID') || hasWord('QA') || clean.includes('MOCK') || clean.includes('COVERAGE')) return 'Testes & QA';
    if (clean.includes('DEPLOY') || clean.includes('CI/CD') || clean.includes('CI-CD') || clean.includes('DOCKER') || clean.includes('CONTAINER') || clean.includes('KUBERNET') || clean.includes('INFRA') || clean.includes('DEVOPS')) return 'Deploy & CI/CD';
    if (clean.includes('FRONTEND') || clean.includes('FRONT-END') || clean.includes('FRONT') || clean.includes('LAYOUT') || clean.includes('INTERFACE') || clean.includes('MOBILE') || hasWord('UI') || hasWord('UX') || hasWord('TELA')) return 'Frontend / UI';
    if (clean.includes('INTEGRA') || clean.includes('WEBHOOK') || clean.includes('TERCEIR') || clean.includes('PAGAMENT') || clean.includes('GATEWAY')) return 'Integrações';
    if (clean.includes('DOMIN') || clean.includes('PROPOS') || clean.includes('ESCOPO') || clean.includes('NEGOCIO') || clean.includes('MVP') || clean.includes('OBJETIV')) return 'Domínio & Foco';

    // 2. Se já for uma palavra curta (<= 14 chars), formata em Title Case suave
    if (raw.length <= 14) {
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    }

    // 3. Fallback inteligente para termos desconhecidos: divide por separadores
    const words = raw.split(/[\s&/+\-]+/).filter(w => w.length > 2 && !['para', 'com', 'dos', 'das', 'uma', 'seu', 'sua', 'the', 'and', 'for'].includes(w.toLowerCase()));
    if (words.length > 0) {
        const first = words[0];
        if (first.length <= 14) {
            return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
        }
        return first.slice(0, 12) + '...';
    }

    return raw.slice(0, 12) + '...';
}

let currentGrillActiveQid = null;

function renderGrillQuestions(questions, prefilledAnswers = {}) {
    const listEl = document.getElementById('qsGrillQuestionsList');
    if (!listEl) return;
    listEl.innerHTML = '';

    // Garante que cada pergunta possua ID único e estritamente sequencial (q1, q2, ...)
    (questions || []).forEach((q, idx) => {
        q.id = `q${idx + 1}`;
    });

    // Determina qual deve ser a primeira pergunta aberta (a primeira vazia, ou a primeira se todas preenchidas)
    let firstUnansweredQid = null;
    for (let i = 0; i < questions.length; i++) {
        const qid = String(questions[i].id || `q${i + 1}`);
        const val = (prefilledAnswers[qid] || prefilledAnswers[`q${i + 1}`] || prefilledAnswers[i] || '').trim();
        if (!val && firstUnansweredQid === null) {
            firstUnansweredQid = qid;
            break;
        }
    }
    currentGrillActiveQid = firstUnansweredQid !== null ? firstUnansweredQid : String(questions[0]?.id || 'q1');

    questions.forEach((q, idx) => {
        const qid = String(q.id || `q${idx + 1}`);
        const existingVal = (prefilledAnswers[qid] || prefilledAnswers[`q${idx + 1}`] || prefilledAnswers[idx] || '').trim();
        const isActive = (qid === currentGrillActiveQid);
        const isAnswered = existingVal.length > 0;
        const questionText = String(q.question || q.pergunta || q.title || q.texto || '').trim();
        const rawCategoryText = String(q.category || q.categoria || 'Decisão').trim();
        const categoryText = formatGrillCategory(rawCategoryText);

        const card = document.createElement('div');
        card.className = `qs-grill-q-card ${isActive ? 'is-active' : 'is-collapsed'}`;
        card.id = `qsQCard_${qid}`;

        const rawOptions = q.options || q.opcoes || [];
        const optionsHtml = (Array.isArray(rawOptions) ? rawOptions : []).map((opt) => {
            const isSelected = existingVal && (existingVal.toLowerCase() === String(opt).toLowerCase());
            return `
                <button type="button" class="qs-q-chip ${isSelected ? 'selected' : ''}" data-qid="${qid}" data-val="${escapeHtml(opt)}" onclick="selectGrillChip('${qid}', '${escapeHtml(opt)}')">
                    ${escapeHtml(opt)}
                </button>
            `;
        }).join('');

        card.innerHTML = `
            <div class="qs-acc-header" onclick="toggleGrillAccordion('${qid}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleGrillAccordion('${qid}');}">
                <div class="qs-acc-header-left">
                    <span class="qs-acc-status-icon ${isAnswered ? 'is-done' : (isActive ? 'is-current' : 'is-pending')}" id="qsAccIcon_${qid}">
                        ${isAnswered ? '✓' : (idx + 1)}
                    </span>
                    <span class="qs-grill-q-cat" title="${escapeHtml(rawCategoryText)}">${escapeHtml(categoryText)}</span>
                    <div class="qs-acc-preview-wrap">
                        <span class="${isAnswered ? 'qs-acc-ans-text' : 'qs-acc-pending-text'}" id="qsAccPreview_${qid}">
                            ${isAnswered ? escapeHtml(existingVal) : escapeHtml(questionText || 'Decisão Arquitetural')}
                        </span>
                    </div>
                </div>
                <div class="qs-acc-header-right">
                    <span class="qs-acc-badge done" id="qsAccBadge_${qid}" style="${isAnswered ? '' : 'display: none;'}">
                        ✓ Definido
                    </span>
                    <span class="qs-acc-toggle-icon">▼</span>
                </div>
            </div>
            <div class="qs-acc-body" id="qsAccBody_${qid}">
                <h4 class="qs-grill-q-title">${escapeHtml(questionText || 'Decisão Arquitetural')}</h4>
                ${optionsHtml ? `<div class="qs-grill-q-chips" id="qsChips_${qid}">${optionsHtml}</div>` : ''}
                <div class="qs-acc-input-wrap">
                    <input type="text" class="qs-q-input" id="qsInput_${qid}" 
                        value="${escapeHtml(existingVal)}"
                        placeholder="${escapeHtml(q.placeholder || q.exemplo || 'Digite sua resposta customizada...')}"
                        oninput="onGrillInputTyped('${qid}')"
                        onkeydown="onGrillInputKeydown(event, '${qid}')">
                    <button type="button" class="btn-acc-advance" onclick="advanceGrillAccordion('${qid}')" title="Confirmar e avançar">
                        Avançar ↵
                    </button>
                </div>
            </div>
        `;
        listEl.appendChild(card);
    });

    updateGrillAccordionProgress();
}

function setGrillAccordionActive(targetQid, focusInput = false) {
    currentGrillActiveQid = String(targetQid);
    if (!currentGrillQuestions) return;

    currentGrillQuestions.forEach((q, idx) => {
        const qid = String(q.id || `q${idx + 1}`);
        const card = document.getElementById(`qsQCard_${qid}`);
        const icon = document.getElementById(`qsAccIcon_${qid}`);
        const inputEl = document.getElementById(`qsInput_${qid}`);
        const val = inputEl ? inputEl.value.trim() : '';
        const isAnswered = val.length > 0;
        const isActive = (qid === currentGrillActiveQid);

        if (card) {
            card.classList.toggle('is-active', isActive);
            card.classList.toggle('is-collapsed', !isActive);
        }
        if (icon) {
            icon.className = `qs-acc-status-icon ${isAnswered ? 'is-done' : (isActive ? 'is-current' : 'is-pending')}`;
            icon.textContent = isAnswered ? '✓' : (idx + 1);
        }
    });

    // Rola suavemente APENAS dentro da lista de perguntas (qsGrillQuestionsList),
    // mantendo o cabeçalho, categoria e botão de toggle sempre 100% visíveis no enquadramento
    const listEl = document.getElementById('qsGrillQuestionsList');
    const activeCard = document.getElementById(`qsQCard_${targetQid}`);
    if (listEl && activeCard) {
        setTimeout(() => {
            const cardTop = activeCard.offsetTop - listEl.offsetTop;
            const cardBottom = cardTop + activeCard.offsetHeight;
            const scrollPos = listEl.scrollTop;
            const listHeight = listEl.clientHeight;

            if (cardTop < scrollPos) {
                listEl.scrollTo({ top: Math.max(0, cardTop - 6), behavior: 'smooth' });
            } else if (cardBottom > scrollPos + listHeight) {
                listEl.scrollTo({ top: cardBottom - listHeight + 8, behavior: 'smooth' });
            }
        }, 40);
    }

    if (focusInput) {
        setTimeout(() => {
            const inputEl = document.getElementById(`qsInput_${targetQid}`);
            if (inputEl) {
                inputEl.focus({ preventScroll: true });
            }
        }, 80);
    }

    updateGrillAccordionProgress();
}

function toggleGrillAccordion(qid) {
    qid = String(qid);
    if (currentGrillActiveQid === qid) {
        currentGrillActiveQid = null;
        const card = document.getElementById(`qsQCard_${qid}`);
        if (card) {
            card.classList.remove('is-active');
            card.classList.add('is-collapsed');
        }
        const icon = document.getElementById(`qsAccIcon_${qid}`);
        if (icon) {
            const inputEl = document.getElementById(`qsInput_${qid}`);
            const isAnswered = inputEl && inputEl.value.trim().length > 0;
            const idx = (currentGrillQuestions || []).findIndex((x, i) => String(x.id || `q${i + 1}`) === qid);
            icon.className = `qs-acc-status-icon ${isAnswered ? 'is-done' : 'is-pending'}`;
            icon.textContent = isAnswered ? '✓' : (idx + 1);
        }
        updateGrillAccordionProgress();
    } else {
        setGrillAccordionActive(qid, true);
    }
}

function selectGrillChip(qid, val) {
    qid = String(qid);
    const chipsWrap = document.getElementById(`qsChips_${qid}`);
    const inputEl = document.getElementById(`qsInput_${qid}`);
    if (chipsWrap) {
        chipsWrap.querySelectorAll('.qs-q-chip').forEach(c => {
            c.classList.toggle('selected', c.getAttribute('data-val') === val);
        });
    }
    if (inputEl) {
        inputEl.value = val;
    }

    updateGrillCardPreview(qid, val);
    updateGrillAccordionProgress();

    // Transição suave para a próxima pergunta
    setTimeout(() => {
        advanceGrillAccordion(qid);
    }, 220);
}

function onGrillInputTyped(qid) {
    qid = String(qid);
    const inputEl = document.getElementById(`qsInput_${qid}`);
    const chipsWrap = document.getElementById(`qsChips_${qid}`);
    const val = inputEl ? inputEl.value.trim() : '';

    if (chipsWrap) {
        const valLower = val.toLowerCase();
        chipsWrap.querySelectorAll('.qs-q-chip').forEach(c => {
            const chipVal = (c.getAttribute('data-val') || '').toLowerCase();
            c.classList.toggle('selected', chipVal === valLower);
        });
    }

    updateGrillCardPreview(qid, val);
    updateGrillAccordionProgress();
}

function onGrillInputKeydown(e, qid) {
    if (e.key === 'Enter') {
        e.preventDefault();
        advanceGrillAccordion(qid);
    }
}

function advanceGrillAccordion(currentQid) {
    currentQid = String(currentQid);
    if (!currentGrillQuestions || currentGrillQuestions.length === 0) return;

    const currentIdx = currentGrillQuestions.findIndex((q, i) => String(q.id || `q${i + 1}`) === currentQid);

    // Procura próxima pergunta vazia após a atual
    let nextQid = null;
    for (let i = currentIdx + 1; i < currentGrillQuestions.length; i++) {
        const qid = String(currentGrillQuestions[i].id || `q${i + 1}`);
        const inputEl = document.getElementById(`qsInput_${qid}`);
        if (!inputEl || !inputEl.value.trim()) {
            nextQid = qid;
            break;
        }
    }

    // Se não encontrou após a atual, busca desde o começo
    if (!nextQid) {
        for (let i = 0; i < currentIdx; i++) {
            const qid = String(currentGrillQuestions[i].id || `q${i + 1}`);
            const inputEl = document.getElementById(`qsInput_${qid}`);
            if (!inputEl || !inputEl.value.trim()) {
                nextQid = qid;
                break;
            }
        }
    }

    if (nextQid) {
        setGrillAccordionActive(nextQid, true);
    } else {
        // Todas estão respondidas: colapsa todas para visão geral e foca no botão de gerar contratos
        currentGrillActiveQid = null;
        currentGrillQuestions.forEach((q, idx) => {
            const qid = String(q.id || `q${idx + 1}`);
            const card = document.getElementById(`qsQCard_${qid}`);
            if (card) {
                card.classList.remove('is-active');
                card.classList.add('is-collapsed');
            }
        });
        updateGrillAccordionProgress();
    }
}

function updateGrillCardPreview(qid, val) {
    qid = String(qid);
    const previewEl = document.getElementById(`qsAccPreview_${qid}`);
    const badgeEl = document.getElementById(`qsAccBadge_${qid}`);
    const iconEl = document.getElementById(`qsAccIcon_${qid}`);
    const isAnswered = val && val.trim().length > 0;

    const q = (currentGrillQuestions || []).find((x, i) => String(x.id || `q${i + 1}`) === qid);
    const qTitle = q ? (q.question || q.pergunta || 'Decisão Arquitetural') : 'Decisão Arquitetural';

    if (previewEl) {
        previewEl.className = isAnswered ? 'qs-acc-ans-text' : 'qs-acc-pending-text';
        previewEl.textContent = isAnswered ? val.trim() : qTitle;
    }
    if (badgeEl) {
        badgeEl.className = 'qs-acc-badge done';
        badgeEl.textContent = '✓ Definido';
        badgeEl.style.display = isAnswered ? 'inline-flex' : 'none';
    }
    if (iconEl) {
        const isActive = (qid === currentGrillActiveQid);
        iconEl.className = `qs-acc-status-icon ${isAnswered ? 'is-done' : (isActive ? 'is-current' : 'is-pending')}`;
        const idx = (currentGrillQuestions || []).findIndex((x, i) => String(x.id || `q${i + 1}`) === qid);
        iconEl.textContent = isAnswered ? '✓' : (idx + 1);
    }
}

function updateGrillAccordionProgress() {
    if (!currentGrillQuestions || currentGrillQuestions.length === 0) return;

    let answeredCount = 0;
    const total = currentGrillQuestions.length;

    currentGrillQuestions.forEach((q, idx) => {
        const qid = String(q.id !== undefined ? q.id : idx);
        const inputEl = document.getElementById(`qsInput_${qid}`);
        if (inputEl && inputEl.value.trim().length > 0) {
            answeredCount++;
        }
    });

    const percent = Math.round((answeredCount / total) * 100);
    const progressWrap = document.getElementById('qsGrillProgressWrap');
    const counterEl = document.getElementById('qsGrillProgressCounter');
    const barEl = document.getElementById('qsGrillProgressBar');
    const cardGen = document.getElementById('cardGrillGenerateContracts');

    if (progressWrap) progressWrap.style.display = 'block';
    if (barEl) barEl.style.width = `${percent}%`;

    if (counterEl) {
        if (answeredCount === total) {
            counterEl.className = 'qs-grill-progress-counter all-done';
            counterEl.innerHTML = `✓ Todas as ${total} decisões tomadas! (100%)`;
        } else {
            counterEl.className = 'qs-grill-progress-counter';
            counterEl.textContent = `${answeredCount} de ${total} decisões tomadas (${percent}%)`;
        }
    }

    if (cardGen) {
        cardGen.classList.toggle('ready-to-generate', answeredCount === total);
    }
}

async function requestMoreGrillQuestions() {
    if (!currentGrillProjectInfo || !currentGrillQuestions) return;
    const cardMore = document.getElementById('cardGrillMoreQuestions');
    const spinnerMore = document.getElementById('spinnerMoreQuestions');
    const textMore = document.getElementById('textMoreQuestions');

    if (currentGrillQuestions.length >= 8) {
        showToast('⚠️ Limite de 8 perguntas atingido. Prossiga para a geração dos contratos.');
        return;
    }

    // Salvar respostas preenchidas até agora para não perder
    const currentAnswersMap = {};
    currentGrillQuestions.forEach((q, idx) => {
        const qid = String(q.id || `q${idx + 1}`);
        const el = document.getElementById(`qsInput_${qid}`);
        if (el && el.value.trim()) {
            currentAnswersMap[qid] = el.value.trim();
        }
    });

    if (spinnerMore) spinnerMore.style.display = 'inline-block';
    if (textMore) textMore.textContent = 'Formulando +4 perguntas com IA...';
    if (cardMore) cardMore.classList.add('disabled');

    try {
        const res = await fetch('/api/projects/quickstart/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentGrillProjectInfo,
                existingQuestions: currentGrillQuestions
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.error || 'Erro ao formular perguntas adicionais.');
            err.statusCode = res.status;
            err.quotaExceeded = data.quotaExceeded;
            err.isRateLimit = data.isRateLimit;
            err.authError = data.authError;
            err.retryAfter = data.retryAfter;
            err.providerName = data.providerName;
            throw err;
        }

        const rawIncoming = Array.isArray(data.questions) ? data.questions : [];
        const normalizedIncoming = rawIncoming.map((nq, idx) => {
            const questionText = String(nq.question || nq.pergunta || nq.title || nq.texto || '').trim();
            const categoryText = String(nq.category || nq.categoria || 'Decisão Técnica').trim();
            const rawOpts = nq.options || nq.opcoes || [];
            const opts = Array.isArray(rawOpts) && rawOpts.length > 0
                ? rawOpts.map(o => String(o).trim())
                : ['Padrão da Stack', 'Customizado', 'Não aplicável no MVP'];
            const ph = String(nq.placeholder || nq.exemplo || 'Descreva sua abordagem técnica...').trim();
            const nextIdx = currentGrillQuestions.length + idx + 1;
            return {
                id: `q${nextIdx}`,
                category: categoryText,
                question: questionText,
                options: opts,
                placeholder: ph
            };
        }).filter(nq => nq.question && nq.question.length > 3);

        // Filtra para não adicionar perguntas com texto idêntico ao já existente
        let newQuestions = normalizedIncoming.filter(nq =>
            !currentGrillQuestions.some(eq => {
                const eqText = String(eq.question || eq.pergunta || eq.title || '').toLowerCase().trim();
                const nqText = nq.question.toLowerCase().trim();
                return eqText === nqText;
            })
        );

        // Fallback defensivo no cliente se a IA não gerou perguntas novas válidas
        if (newQuestions.length === 0) {
            const baseIdx = currentGrillQuestions.length + 1;
            const clientFallback = [
                {
                    id: `q${baseIdx}`,
                    category: 'Performance & Cache',
                    question: 'Qual será a estratégia de cache e otimização de latência?',
                    options: ['Redis Distribuído', 'Cache em Memória Local', 'CDN / Edge Cache', 'Sem cache inicial'],
                    placeholder: 'Ex: Redis para sessões e consultas frequentes'
                },
                {
                    id: `q${baseIdx + 1}`,
                    category: 'Observabilidade & Logs',
                    question: 'Como serão estruturados os logs e métricas de diagnóstico?',
                    options: ['Logs estruturados JSON (Pino/Winston)', 'OpenTelemetry + Grafana', 'Sentry (Error Tracking)', 'Console simples'],
                    placeholder: 'Ex: Pino com logs JSON estruturados'
                },
                {
                    id: `q${baseIdx + 2}`,
                    category: 'CI/CD & Containers',
                    question: 'Qual o ambiente de execução e pipeline de entrega contínua?',
                    options: ['Docker + GitHub Actions', 'Kubernetes / Helm', 'Serverless / Lambdas', 'Deploy direto na VM'],
                    placeholder: 'Ex: Dockerfile multi-stage com GitHub Actions'
                },
                {
                    id: `q${baseIdx + 3}`,
                    category: 'Resiliência & Falhas',
                    question: 'Como a aplicação lidará com falhas de dependências externas?',
                    options: ['Retries com Exponential Backoff', 'Circuit Breaker', 'Dead Letter Queue', 'Fail fast com erro 500'],
                    placeholder: 'Ex: Retries com backoff exponencial'
                }
            ];
            const maxNeeded = Math.max(0, 8 - currentGrillQuestions.length);
            newQuestions = clientFallback.slice(0, Math.min(4, maxNeeded));
        }

        // Garante que não ultrapasse o limite de 8 perguntas e renumera estritamente os IDs
        const remainingSlots = Math.max(0, 8 - currentGrillQuestions.length);
        const toAdd = newQuestions.slice(0, remainingSlots).map((nq, idx) => {
            const newIndex = currentGrillQuestions.length + idx + 1;
            return {
                ...nq,
                id: `q${newIndex}`
            };
        });

        if (toAdd.length > 0) {
            const firstNewId = toAdd[0].id;
            currentGrillQuestions = currentGrillQuestions.concat(toAdd);
            renderGrillQuestions(currentGrillQuestions, currentAnswersMap);
            showToast(`✨ +${toAdd.length} perguntas adicionadas à sabatina!`);

            setTimeout(() => {
                const firstNewEl = document.getElementById(`qsQCard_${firstNewId}`);
                if (firstNewEl) {
                    firstNewEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    firstNewEl.classList.add('newly-added');
                    setTimeout(() => firstNewEl.classList.remove('newly-added'), 1800);
                }
            }, 100);
        }
    } catch (err) {
        showAiErrorModal(err, { context: 'quickstart-more-questions' });
    } finally {
        if (spinnerMore) spinnerMore.style.display = 'none';
        updateGrillActionCardsState();
    }
}

async function submitGrillAnswers() {
    if (!currentGrillQuestions || currentGrillQuestions.length === 0) return;

    // 1. Coleta das respostas e validação de preenchimento obrigatório
    const answers = [];
    let emptyQuestion = null;

    for (let idx = 0; idx < currentGrillQuestions.length; idx++) {
        const q = currentGrillQuestions[idx];
        const qid = q.id || idx;
        const inputEl = document.getElementById(`qsInput_${qid}`);
        const val = inputEl ? inputEl.value.trim() : '';

        if (!val) {
            emptyQuestion = { q, idx, qid };
            break;
        }

        answers.push({
            id: qid,
            category: q.category,
            question: q.question,
            answer: val
        });
    }

    // Se houver pergunta vazia, interrompe imediatamente e apresenta modal no padrão do projeto
    if (emptyQuestion) {
        setGrillAccordionActive(emptyQuestion.qid, true);
        const sample = emptyQuestion.q.options && emptyQuestion.q.options[0]
            ? emptyQuestion.q.options[0]
            : (emptyQuestion.q.placeholder || 'uma resposta descritiva');
        openGrillValidationModal({
            questionId: emptyQuestion.qid,
            questionTitle: emptyQuestion.q.question,
            category: emptyQuestion.q.category || 'Decisão Técnica',
            invalidAnswer: '(não respondida)',
            reason: `A Pergunta ${emptyQuestion.idx + 1} precisa ser respondida antes de avançar. Todas as perguntas são obrigatórias para que a IA gere contratos sólidos e sem ambiguidades.`,
            suggestion: `Você pode escolher uma das opções sugeridas (ex: "${sample}") ou descrever a estratégia técnica desejada.`
        });
        return;
    }

    // 2. Validação Semântica de cada resposta via Backend / IA
    const cardGen = document.getElementById('cardGrillGenerateContracts');
    const spinnerGen = document.getElementById('spinnerGenerateContracts');
    const textGen = document.getElementById('textGenerateContracts');

    if (spinnerGen) spinnerGen.style.display = 'inline-block';
    if (textGen) textGen.textContent = 'Auditando coerência com IA...';
    if (cardGen) cardGen.classList.add('disabled');

    try {
        const valRes = await fetch('/api/projects/quickstart/validate-answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectInfo: currentGrillProjectInfo,
                questions: currentGrillQuestions,
                answers
            })
        });
        const valData = await valRes.json();

        if (valData && valData.valid === false && valData.issue) {
            // Resposta incorreta ou fora de contexto detectada!
            if (valData.issue.questionId !== undefined) {
                setGrillAccordionActive(valData.issue.questionId, true);
            }
            openGrillValidationModal(valData.issue);
            return;
        }
    } catch (valErr) {
        console.warn('⚠️ Falha ao auditar respostas com IA, prosseguindo com fallback:', valErr.message);
    } finally {
        if (spinnerGen) spinnerGen.style.display = 'none';
        if (textGen) textGen.textContent = '✨ Sintetizar contratos vivos →';
        if (cardGen) cardGen.classList.remove('disabled');
    }

    // 3. Todas as respostas válidas -> Gerar Contratos com IA
    await executeGenerateDraftFlow(answers);
}

// ═════════════════════════════════════════════════════════════════════════════
// QUICKSTART AI SYNTHESIS COCKPIT CONTROLLER
// ═════════════════════════════════════════════════════════════════════════════
let qsSynthInterval = null;
let qsSynthStartTime = 0;
let qsSynthProgress = 8;
let qsSynthCurrentStage = 1;

function formatSynthTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function appendQuickstartConsoleLog(msg, type = 'info') {
    const logBox = document.getElementById('qsSynthConsoleLog');
    if (!logBox) return;

    const elapsed = qsSynthStartTime ? formatSynthTime(Date.now() - qsSynthStartTime) : '00:00';
    const line = document.createElement('div');
    line.className = `qs-synth-log-line ${type === 'done' ? 'is-done' : type === 'highlight' ? 'is-highlight' : ''}`;

    const ts = document.createElement('span');
    ts.className = 'qs-synth-log-ts';
    ts.textContent = `[${elapsed}]`;

    const txt = document.createElement('span');
    txt.className = 'qs-synth-log-msg';
    txt.textContent = msg;

    line.appendChild(ts);
    line.appendChild(txt);
    logBox.appendChild(line);

    logBox.scrollTop = logBox.scrollHeight;
}

function startQuickstartSynthesisCockpit(projectInfo, answers) {
    if (qsSynthInterval) {
        clearInterval(qsSynthInterval);
        qsSynthInterval = null;
    }

    qsSynthStartTime = Date.now();
    qsSynthProgress = 8;
    qsSynthCurrentStage = 1;

    // 1. Cronômetro e barra
    const timerVal = document.getElementById('qsSynthTimerVal');
    if (timerVal) timerVal.textContent = '00:00';

    const bar = document.getElementById('qsSynthProgressBar');
    const pct = document.getElementById('qsSynthProgressPct');
    if (bar) bar.style.width = '8%';
    if (pct) pct.textContent = '8%';

    const stepText = document.getElementById('qsSynthCurrentStepText');
    if (stepText) stepText.textContent = 'Iniciando análise de especificações...';

    const stageBadge = document.getElementById('qsSynthStageBadge');
    if (stageBadge) stageBadge.textContent = 'Etapa 1 de 4';

    // 2. Contexto do Modelo e Especificações para Telemetria
    const provName = window.AI_GATEWAY_CONFIG?.providerName ||
        (window.AI_GATEWAY_CONFIG?.provider ? window.AI_GATEWAY_CONFIG.provider.toUpperCase() : 'IA Neural');
    const activeModel = window.AI_GATEWAY_CONFIG?.model || 'Ativo';

    const specs = Array.isArray(projectInfo?.specs) ? projectInfo.specs : [];
    const hasSpecs = specs.length > 0;

    // 4. Reset dos 4 cards de pipeline
    const cardSpecs = document.getElementById('qsSynthCardSpecs');
    const badgeSpecs = document.getElementById('qsSynthBadgeSpecs');
    const metricsSpecs = document.getElementById('qsSynthMetricsSpecs');

    const cardProj = document.getElementById('qsSynthCardProject');
    const badgeProj = document.getElementById('qsSynthBadgeProject');
    const metricsProj = document.getElementById('qsSynthMetricsProject');

    const cardArch = document.getElementById('qsSynthCardArch');
    const badgeArch = document.getElementById('qsSynthBadgeArch');
    const metricsArch = document.getElementById('qsSynthMetricsArch');

    const cardGov = document.getElementById('qsSynthCardGov');
    const badgeGov = document.getElementById('qsSynthBadgeGov');
    const metricsGov = document.getElementById('qsSynthMetricsGov');

    if (hasSpecs) {
        if (cardSpecs) { cardSpecs.className = 'qs-synth-card live-active'; }
        if (badgeSpecs) { badgeSpecs.className = 'qs-synth-badge active'; badgeSpecs.innerHTML = '<span class="qs-synth-mini-spinner"></span> Analisando'; }
        if (metricsSpecs) metricsSpecs.textContent = 'Processando documento...';
    } else {
        if (cardSpecs) { cardSpecs.className = 'qs-synth-card live-completed'; }
        if (badgeSpecs) { badgeSpecs.className = 'qs-synth-badge completed'; badgeSpecs.textContent = '✓ Dispensado'; }
        if (metricsSpecs) metricsSpecs.textContent = 'Sem anexo (Geração direta)';
    }

    if (cardProj) { cardProj.className = 'qs-synth-card live-pending'; }
    if (badgeProj) { badgeProj.className = 'qs-synth-badge pending'; badgeProj.textContent = '⏳ Na fila'; }
    if (metricsProj) metricsProj.textContent = 'Aguardando...';

    if (cardArch) { cardArch.className = 'qs-synth-card live-pending'; }
    if (badgeArch) { badgeArch.className = 'qs-synth-badge pending'; badgeArch.textContent = '⏳ Na fila'; }
    if (metricsArch) metricsArch.textContent = 'Aguardando...';

    if (cardGov) { cardGov.className = 'qs-synth-card live-pending'; }
    if (badgeGov) { badgeGov.className = 'qs-synth-badge pending'; badgeGov.textContent = '⏳ Na fila'; }
    if (metricsGov) metricsGov.textContent = 'Aguardando...';

    // 5. Console de Telemetria
    const logBox = document.getElementById('qsSynthConsoleLog');
    if (logBox) logBox.innerHTML = '';

    appendQuickstartConsoleLog(`🚀 Pipeline de governança ativado para o projeto "${projectInfo?.name || 'projeto'}" (${projectInfo?.stack || 'Geral'})`, 'highlight');
    if (hasSpecs) {
        const specKb = Math.round(((specs[0]?.content?.length || 0) / 1024) * 10) / 10;
        appendQuickstartConsoleLog(`📄 Especificação técnica vinculada: ${specs[0]?.name || 'especificação.md'} (${specKb} KB)`, 'info');
        appendQuickstartConsoleLog(`🔍 Extraindo requisitos funcionais (RFs), regras de negócio (RNs) e modelo relacional...`, 'info');
    }
    appendQuickstartConsoleLog(`🧠 Modelo neural conectado: ${provName} (${activeModel})`, 'info');

    // 6. Cronômetro progressivo em tempo real
    let ticks = 0;
    qsSynthInterval = setInterval(() => {
        const elapsedMs = Date.now() - qsSynthStartTime;
        if (timerVal) timerVal.textContent = formatSynthTime(elapsedMs);
        ticks++;

        // Simulação preditiva de fallback suave para garantir dinamismo caso SSE oscile
        if (hasSpecs) {
            if (ticks === 12 && qsSynthCurrentStage === 1) {
                handleQuickstartLiveProgress({
                    step: 'project-start',
                    stage: 2,
                    totalStages: 4,
                    pct: 28,
                    detail: 'Sintetizando PROJECT.md: Escopo MVP, RF-001..RF-012 e critérios de aceite...',
                    log: '✍️ [Passo 1/3] Sintetizando PROJECT.md com mapeamento de requisitos funcionais...'
                });
            } else if (ticks === 45 && qsSynthCurrentStage === 2) {
                handleQuickstartLiveProgress({
                    step: 'arch-start',
                    stage: 3,
                    totalStages: 4,
                    pct: 58,
                    detail: 'Arquitetando ARCHITECTURE.md: Dicionário SQL Server, contratos REST e concorrência...',
                    log: '🏗️ [Passo 2/3] Projetando schema relacional SQL, endpoints REST e concorrência otimista...'
                });
            } else if (ticks === 85 && qsSynthCurrentStage === 3) {
                handleQuickstartLiveProgress({
                    step: 'gov-start',
                    stage: 4,
                    totalStages: 4,
                    pct: 82,
                    detail: 'Formalizando CURRENT_STATE.md e ADR-0001 no padrão MADR...',
                    log: '⚖️ [Passo 3/3] Estruturando roadmap com 3 marcos práticos e decisão de arquitetura...'
                });
            } else if (ticks === 120 && qsSynthCurrentStage === 4) {
                appendQuickstartConsoleLog('⚡ Consolidando validações e revisando contratos de governança com IA...', 'info');
            }
        } else {
            if (ticks === 8 && qsSynthCurrentStage === 1) {
                handleQuickstartLiveProgress({
                    step: 'synthesis-start',
                    stage: 1,
                    totalStages: 2,
                    pct: 35,
                    detail: 'Sintetizando PROJECT.md, ARCHITECTURE.md, CURRENT_STATE.md e ADR-0001...',
                    log: '⚡ Consultando IA para formalização dos 4 contratos de governança...'
                });
            }
        }
    }, 1000);
}

function handleQuickstartLiveProgress(info) {
    if (!info) return;

    if (info.stage) qsSynthCurrentStage = info.stage;

    // Atualiza barra de progresso
    if (typeof info.pct === 'number') {
        qsSynthProgress = Math.max(qsSynthProgress, info.pct);
        const bar = document.getElementById('qsSynthProgressBar');
        const pct = document.getElementById('qsSynthProgressPct');
        if (bar) bar.style.width = `${qsSynthProgress}%`;
        if (pct) pct.textContent = `${qsSynthProgress}%`;
    }

    // Badge de estágio
    const stageBadge = document.getElementById('qsSynthStageBadge');
    if (stageBadge && info.stage && info.totalStages) {
        stageBadge.textContent = `Etapa ${info.stage} de ${info.totalStages}`;
    }

    // Texto do passo atual
    const stepText = document.getElementById('qsSynthCurrentStepText');
    if (stepText && (info.detail || info.title)) {
        stepText.textContent = info.detail || info.title;
    }

    // Atualiza cards específicos de acordo com o step
    const cardSpecs = document.getElementById('qsSynthCardSpecs');
    const badgeSpecs = document.getElementById('qsSynthBadgeSpecs');
    const metricsSpecs = document.getElementById('qsSynthMetricsSpecs');

    const cardProj = document.getElementById('qsSynthCardProject');
    const badgeProj = document.getElementById('qsSynthBadgeProject');
    const metricsProj = document.getElementById('qsSynthMetricsProject');

    const cardArch = document.getElementById('qsSynthCardArch');
    const badgeArch = document.getElementById('qsSynthBadgeArch');
    const metricsArch = document.getElementById('qsSynthMetricsArch');

    const cardGov = document.getElementById('qsSynthCardGov');
    const badgeGov = document.getElementById('qsSynthBadgeGov');
    const metricsGov = document.getElementById('qsSynthMetricsGov');

    if (info.step === 'specs-start') {
        if (cardSpecs) cardSpecs.className = 'qs-synth-card live-active';
        if (badgeSpecs) { badgeSpecs.className = 'qs-synth-badge active'; badgeSpecs.innerHTML = '<span class="qs-synth-mini-spinner"></span> Analisando'; }
        if (metricsSpecs) metricsSpecs.textContent = 'Mapeando entidades e RFs...';
    } else if (info.step === 'project-start') {
        if (cardSpecs) cardSpecs.className = 'qs-synth-card live-completed';
        if (badgeSpecs) { badgeSpecs.className = 'qs-synth-badge completed'; badgeSpecs.textContent = '✓ Mapeado'; }
        if (metricsSpecs) metricsSpecs.textContent = 'RFs e RNs extraídos';

        if (cardProj) cardProj.className = 'qs-synth-card live-active';
        if (badgeProj) { badgeProj.className = 'qs-synth-badge active'; badgeProj.innerHTML = '<span class="qs-synth-mini-spinner"></span> Sintetizando'; }
        if (metricsProj) metricsProj.textContent = 'Escrevendo escopo e RFs...';
    } else if (info.step === 'project-done') {
        if (cardProj) cardProj.className = 'qs-synth-card live-completed';
        if (badgeProj) { badgeProj.className = 'qs-synth-badge completed'; badgeProj.textContent = '✓ Concluído'; }
        if (metricsProj && info.chars) metricsProj.textContent = `${Math.round(info.chars / 1024 * 10) / 10} KB gerados`;
    } else if (info.step === 'arch-start') {
        if (cardProj) cardProj.className = 'qs-synth-card live-completed';
        if (badgeProj) { badgeProj.className = 'qs-synth-badge completed'; badgeProj.textContent = '✓ Concluído'; }

        if (cardArch) cardArch.className = 'qs-synth-card live-active';
        if (badgeArch) { badgeArch.className = 'qs-synth-badge active'; badgeArch.innerHTML = '<span class="qs-synth-mini-spinner"></span> Modelando'; }
        if (metricsArch) metricsArch.textContent = 'Dicionário SQL e REST...';
    } else if (info.step === 'arch-done') {
        if (cardArch) cardArch.className = 'qs-synth-card live-completed';
        if (badgeArch) { badgeArch.className = 'qs-synth-badge completed'; badgeArch.textContent = '✓ Concluído'; }
        if (metricsArch && info.chars) metricsArch.textContent = `${Math.round(info.chars / 1024 * 10) / 10} KB gerados`;
    } else if (info.step === 'gov-start') {
        if (cardArch) cardArch.className = 'qs-synth-card live-completed';
        if (badgeArch) { badgeArch.className = 'qs-synth-badge completed'; badgeArch.textContent = '✓ Concluído'; }

        if (cardGov) cardGov.className = 'qs-synth-card live-active';
        if (badgeGov) { badgeGov.className = 'qs-synth-badge active'; badgeGov.innerHTML = '<span class="qs-synth-mini-spinner"></span> Formalizando'; }
        if (metricsGov) metricsGov.textContent = 'Roadmap e ADR-0001...';
    } else if (info.step === 'completed') {
        if (cardGov) cardGov.className = 'qs-synth-card live-completed';
        if (badgeGov) { badgeGov.className = 'qs-synth-badge completed'; badgeGov.textContent = '✓ Concluído'; }
        if (metricsGov) metricsGov.textContent = 'Pronto para revisão';
    }

    if (info.log) {
        appendQuickstartConsoleLog(info.log, info.step === 'completed' ? 'done' : 'info');
    }
}

async function completeQuickstartSynthesisCockpit(data) {
    if (qsSynthInterval) {
        clearInterval(qsSynthInterval);
        qsSynthInterval = null;
    }

    // Progresso 100%
    const bar = document.getElementById('qsSynthProgressBar');
    const pct = document.getElementById('qsSynthProgressPct');
    const stepText = document.getElementById('qsSynthCurrentStepText');
    const stageBadge = document.getElementById('qsSynthStageBadge');

    if (bar) bar.style.width = '100%';
    if (pct) pct.textContent = '100%';
    if (stepText) stepText.textContent = '✨ Todos os contratos de governança foram sintetizados com sucesso!';
    if (stageBadge) stageBadge.textContent = 'Concluído';

    // Todos os cards concluídos
    const markDone = (cardId, badgeId, metricsId, text) => {
        const card = document.getElementById(cardId);
        const badge = document.getElementById(badgeId);
        const metrics = document.getElementById(metricsId);
        if (card) card.className = 'qs-synth-card live-completed';
        if (badge) { badge.className = 'qs-synth-badge completed'; badge.textContent = '✓ Concluído'; }
        if (metrics && text) metrics.textContent = text;
    };

    const c = data.contracts || {};
    markDone('qsSynthCardSpecs', 'qsSynthBadgeSpecs', 'qsSynthMetricsSpecs', 'Análise profunda concluída');
    markDone('qsSynthCardProject', 'qsSynthBadgeProject', 'qsSynthMetricsProject', `${Math.round(((c.projectMd || '').length / 1024) * 10) / 10} KB`);
    markDone('qsSynthCardArch', 'qsSynthBadgeArch', 'qsSynthMetricsArch', `${Math.round(((c.architectureMd || '').length / 1024) * 10) / 10} KB`);
    markDone('qsSynthCardGov', 'qsSynthBadgeGov', 'qsSynthMetricsGov', `${Math.round((((c.currentStateMd || '').length + (c.adrMd || '').length) / 1024) * 10) / 10} KB`);

    appendQuickstartConsoleLog('✨ Todos os 4 contratos de governança foram sintetizados com sucesso! Carregando painel de revisão e governança...', 'done');

    // Pausa suave de 600ms para o dev ver a conclusão
    await new Promise(r => setTimeout(r, 600));
}

window.handleQuickstartLiveProgress = handleQuickstartLiveProgress;

async function executeGenerateDraftFlow(answers) {
    const modal = document.getElementById('quickstartModal');
    const modalCard = modal ? modal.querySelector('.quickstart-modal-card') : document.querySelector('.quickstart-modal-card');
    if (modalCard) modalCard.classList.add('draft-mode');

    const qPane = document.getElementById('qsGrillQuestionsPane');
    const dPane = document.getElementById('qsGrillDraftPane');
    const loadingEl = document.getElementById('qsGrillLoadingDraft');
    const wrapEl = document.getElementById('qsGrillDraftContentWrap');
    const btnCommit = document.getElementById('btnCommitGrill');
    const draftActions = document.querySelector('#qsGrillDraftPane .qs-form-actions');

    if (qPane) qPane.style.display = 'none';
    if (dPane) dPane.style.display = 'flex';
    if (loadingEl) loadingEl.style.display = 'flex';
    if (wrapEl) wrapEl.style.display = 'none';
    if (draftActions) draftActions.style.display = 'none';
    if (btnCommit) btnCommit.disabled = true;

    const headerBackBtn = document.getElementById('qsHeaderBackBtn');
    if (headerBackBtn) {
        headerBackBtn.style.display = 'inline-flex';
        headerBackBtn.textContent = '← Ajustar respostas';
    }
    const titleEl = document.getElementById('qsTitle');
    if (titleEl) {
        titleEl.textContent = '⚡ Síntese Neural de Governança';
    }
    const subtitleEl = document.getElementById('qsSubtitle');
    const originalSubtitle = subtitleEl ? subtitleEl.textContent : '';
    if (subtitleEl) {
        subtitleEl.textContent = 'O Arquiteto de IA está processando requisitos e consolidando os contratos vivos...';
    }

    // Inicia Cockpit interativo
    startQuickstartSynthesisCockpit(currentGrillProjectInfo, answers);

    try {
        const res = await fetch('/api/projects/quickstart/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentGrillProjectInfo,
                answers
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.error || 'Erro ao gerar contratos.');
            err.statusCode = res.status;
            err.quotaExceeded = data.quotaExceeded;
            err.isRateLimit = data.isRateLimit;
            err.authError = data.authError;
            err.retryAfter = data.retryAfter;
            err.providerName = data.providerName;
            throw err;
        }

        const rawContracts = data.contracts || {};
        currentGrillDraft = {
            projectMd: rawContracts.projectMd || rawContracts['PROJECT.md'] || rawContracts['project.md'] || rawContracts.project || '',
            architectureMd: rawContracts.architectureMd || rawContracts['ARCHITECTURE.md'] || rawContracts['architecture.md'] || rawContracts.architecture || '',
            currentStateMd: rawContracts.currentStateMd || rawContracts['CURRENT_STATE.md'] || rawContracts['current_state.md'] || rawContracts.currentState || '',
            adrMd: rawContracts.adrMd || rawContracts['ADR-0001'] || rawContracts['ADR-0001.md'] || rawContracts.adr || ''
        };

        // Finaliza Cockpit
        await completeQuickstartSynthesisCockpit(data);

        const badge = document.getElementById('qsGrillDraftModelBadge');
        if (badge) badge.textContent = `✨ ${data.provider ? data.provider.toUpperCase() : 'IA'} (${data.model || 'ativo'})`;

        if (titleEl) titleEl.textContent = '📄 Contratos Prontos para Revisão';
        if (subtitleEl) subtitleEl.textContent = originalSubtitle || 'Governança, decisões de arquitetura e memória persistente em menos de 3 minutos.';

        if (loadingEl) loadingEl.style.display = 'none';
        if (wrapEl) wrapEl.style.display = 'flex';
        if (draftActions) draftActions.style.display = 'flex';
        if (btnCommit) btnCommit.disabled = false;

        currentActiveContract = 'projectMd';
        currentQsContractMode = 'preview';
        const qsTextarea = document.getElementById('qsContractTextarea');
        if (qsTextarea) {
            qsTextarea.value = currentGrillDraft.projectMd || '';
        }
        selectContractTab('projectMd');
        switchQsContractMode('preview');
        applyQsContractZoom(currentQsContractZoom || 80);
    } catch (err) {
        if (qsSynthInterval) { clearInterval(qsSynthInterval); qsSynthInterval = null; }
        showAiErrorModal(err, { context: 'quickstart-draft' });
        backToGrillQuestions();
    } finally {
        if (qsSynthInterval) { clearInterval(qsSynthInterval); qsSynthInterval = null; }
        if (loadingEl && wrapEl && wrapEl.style.display === 'flex') {
            loadingEl.style.display = 'none';
        }
        const dPane = document.getElementById('qsGrillDraftPane');
        if (dPane && dPane.style.display !== 'none' && wrapEl && wrapEl.style.display === 'flex') {
            if (draftActions) draftActions.style.display = 'flex';
            if (btnCommit) btnCommit.disabled = false;
        }
    }
}

function openGrillValidationModal(issue) {
    currentGrillValidationIssue = issue;
    const modal = document.getElementById('qsGrillValidationModal');
    if (!modal) return;

    const qText = document.getElementById('qsValQuestionText');
    const aText = document.getElementById('qsValAnswerText');
    const rText = document.getElementById('qsValReasonText');
    const sText = document.getElementById('qsValSuggestionText');

    if (qText) qText.textContent = `[${issue.category || 'Decisão Técnica'}] ${issue.questionTitle || ''}`;
    if (aText) aText.textContent = `"${issue.invalidAnswer || ''}"`;
    if (rText) rText.textContent = issue.reason || 'A resposta informada não define uma estratégia técnica válida para o projeto.';
    if (sText) sText.textContent = issue.suggestion || 'Defina uma tecnologia, biblioteca ou abordagem arquitetural compatível.';

    modal.style.display = 'flex';
}

function closeGrillValidationModal(focusInput = false) {
    const modal = document.getElementById('qsGrillValidationModal');
    if (modal) modal.style.display = 'none';

    if (focusInput && currentGrillValidationIssue && currentGrillValidationIssue.questionId !== undefined) {
        const qid = currentGrillValidationIssue.questionId;
        setGrillAccordionActive(qid, true);
        setTimeout(() => {
            const cardEl = document.getElementById(`qsQCard_${qid}`);
            const inputEl = document.getElementById(`qsInput_${qid}`);
            if (cardEl) {
                cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cardEl.classList.add('qs-q-card-alert');
                setTimeout(() => cardEl.classList.remove('qs-q-card-alert'), 2400);
            }
            if (inputEl) {
                inputEl.focus();
                inputEl.select();
            }
        }, 80);
    }
}

function handleGrillValModalBackdrop(e) {
    if (e.target && e.target.id === 'qsGrillValidationModal') {
        closeGrillValidationModal(true);
    }
}

function applyGrillSuggestion() {
    if (!currentGrillValidationIssue || currentGrillValidationIssue.questionId === undefined) {
        closeGrillValidationModal();
        return;
    }
    const qid = currentGrillValidationIssue.questionId;
    const sug = currentGrillValidationIssue.suggestion || '';

    let cleanVal = sug;
    const quoteMatch = sug.match(/"([^"]+)"/);
    if (quoteMatch) {
        cleanVal = quoteMatch[1];
    } else if (sug.includes('ex:')) {
        cleanVal = sug.split('ex:')[1].trim().replace(/\.$/, '');
    } else if (sug.includes(':')) {
        cleanVal = sug.split(':')[1].trim().replace(/\.$/, '');
    }

    setGrillAccordionActive(qid, false);
    const inputEl = document.getElementById(`qsInput_${qid}`);
    if (inputEl) {
        inputEl.value = cleanVal;
        onGrillInputTyped(qid);
    }

    closeGrillValidationModal(false);
    showToast('✓ Sugestão recomendada aplicada à resposta!');

    setTimeout(() => {
        advanceGrillAccordion(qid);
    }, 250);
}

function selectContractTab(contractKey) {
    const textarea = document.getElementById('qsContractTextarea');
    if (currentQsContractMode === 'write' && textarea && currentActiveContract && currentGrillDraft) {
        currentGrillDraft[currentActiveContract] = textarea.value;
    }

    currentActiveContract = contractKey;
    document.querySelectorAll('.qs-contract-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-contract') === contractKey);
    });

    const badge = document.getElementById('qsContractViewerBadge');
    const names = {
        projectMd: 'VISUALIZANDO PROJECT.md (Visão & Escopo)',
        architectureMd: 'VISUALIZANDO ARCHITECTURE.md (Padrões & Camadas)',
        currentStateMd: 'VISUALIZANDO CURRENT_STATE.md (Roadmap Ativo)',
        adrMd: 'VISUALIZANDO ADR-0001 (Decisão de Stack Inicial)'
    };
    if (badge) badge.textContent = names[contractKey] || 'CONTRATO DE GOVERNANÇA';

    if (textarea) {
        textarea.value = (currentGrillDraft && currentGrillDraft[contractKey]) || '';
    }
    updateQsContractPreviewContent();
}

async function submitGrillRefine() {
    const inputEl = document.getElementById('qsRefineInput');
    const btn = document.getElementById('btnGrillRefine');
    const textarea = document.getElementById('qsContractTextarea');
    const fb = inputEl ? inputEl.value.trim() : '';

    if (!fb) {
        alert('Por favor, digite o que você gostaria de melhorar nos contratos.');
        if (inputEl) inputEl.focus();
        return;
    }

    if (textarea && currentActiveContract && currentGrillDraft) {
        currentGrillDraft[currentActiveContract] = textarea.value;
    }

    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner" style="display:inline-block"></span> Refinando...';

    try {
        const res = await fetch('/api/projects/quickstart/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentGrillProjectInfo,
                contracts: currentGrillDraft,
                feedback: fb
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.error || 'Erro ao refinar contratos.');
            err.statusCode = res.status;
            err.quotaExceeded = data.quotaExceeded;
            err.isRateLimit = data.isRateLimit;
            err.authError = data.authError;
            err.retryAfter = data.retryAfter;
            err.providerName = data.providerName;
            throw err;
        }

        if (data.status === 'needs_clarification') {
            openClarificationModal({ ...data, feedback: fb }, 'compact');
            return;
        }

        handleRefineSuccess(data, 'compact');
    } catch (err) {
        showAiErrorModal(err, { context: 'quickstart-refine' });
    } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

async function commitGrillProject() {
    const btn = document.getElementById('btnCommitGrill');
    const textarea = document.getElementById('qsContractTextarea');
    if (textarea && currentActiveContract) {
        currentGrillDraft[currentActiveContract] = textarea.value;
    }

    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner" style="display:inline-block"></span> Criando no disco...';

    try {
        const res = await fetch('/api/projects/quickstart/commit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentGrillProjectInfo,
                contracts: currentGrillDraft
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao gravar projeto.');

        const dPane = document.getElementById('qsGrillDraftPane');
        if (dPane) dPane.style.display = 'none';

        renderQuickstartSuccess({
            name: data.name,
            path: data.path,
            mode: 'new',
            stack: currentGrillProjectInfo.stack
        });
    } catch (err) {
        alert('Erro ao gravar projeto no disco: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

async function submitQuickstartNew(e) {
    if (e && e.preventDefault) e.preventDefault();
    await triggerQuickstartChoice(quickstartSubMode || 'assisted');
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
    resetQuickstartGrillPanes();
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

    // Dispara convite gentil e discreto de Star no momento de sucesso
    if (typeof checkAndTriggerStarToast === 'function') {
        checkAndTriggerStarToast(1500);
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

        updateIdeMainButtonUI();

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
            .catch(() => { });

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

    // Sincroniza Status no CURRENT_STATE.md
    let currentStateMd = currentProjectData.currentStateMd || '';
    if (currentStateMd && status) {
        if (/##\s+Status:\s*[^\n\r]*/i.test(currentStateMd)) {
            currentStateMd = currentStateMd.replace(/##\s+Status:\s*[^\n\r]*/i, `## Status: ${status}`);
        } else {
            currentStateMd = currentStateMd.replace(/(#[^\n\r]+)/, `$1\n\n## Status: ${status}\n`);
        }
    }

    try {
        const resProject = await fetch('/api/file/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: `projects/${currentProjectData.name}/PROJECT.md`,
                content: projectMd
            })
        });
        if (!resProject.ok) throw new Error('Falha ao salvar PROJECT.md no disco.');

        if (currentStateMd && status) {
            const resState = await fetch('/api/file/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: `projects/${currentProjectData.name}/CURRENT_STATE.md`,
                    content: currentStateMd
                })
            });
            if (!resState.ok) throw new Error('Falha ao sincronizar CURRENT_STATE.md no disco.');
            currentProjectData.currentStateMd = currentStateMd;
        }

        currentProjectData.projectMd = projectMd;
        if (stack) currentProjectData.stack = stack;
        if (status) currentProjectData.status = status;

        if (window.VAULT && window.VAULT.data && window.VAULT.data.files) {
            const pFile = window.VAULT.data.files.find(f => f.path === `projects/${currentProjectData.name}/PROJECT.md`);
            if (pFile) pFile.content = projectMd;
            const sFile = window.VAULT.data.files.find(f => f.path === `projects/${currentProjectData.name}/CURRENT_STATE.md`);
            if (sFile && currentStateMd) sFile.content = currentStateMd;
        }
        renderDashboardProjects();

        const badgeStack = document.getElementById('pwStackBadge');
        if (badgeStack && stack) badgeStack.textContent = stack;
        const badgeStatus = document.getElementById('pwStatusBadge');
        if (badgeStatus && status) badgeStatus.textContent = status;

        isOverviewEditing = false;
        renderProjectOverviewTab();
        showSecondBrainToast('✨ Visão Geral e Status atualizados com sucesso no disco!');
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
    const activeProjectStatus = d.status || currentStatusText || '🟢 Em Planejamento / Ativo';
    const statusOptions = getProjectStatuses();
    const resolvedActiveStatus = resolveProjectStatus(activeProjectStatus, d.projectMd);

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
                                    ${statusOptions.map(opt => {
        const isSelected = (opt.id === resolvedActiveStatus.id) ? 'selected' : '';
        const displayText = opt.fullText.includes(opt.icon) ? opt.fullText : `${opt.icon} ${opt.fullText}`;
        return `<option value="${escapeHtml(opt.fullText)}" ${isSelected}>${escapeHtml(displayText)}</option>`;
    }).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="pw-form-actions">
                            <button class="btn btn-primary" onclick="saveOverviewQuickEdit()">
                                💾 Salvar Visão Geral & Status
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
                            <span class="pw-spec-value" style="color:#38bdf8;">${activeProjectStatus}</span>
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

            <!-- Card 2: Roadmap Ativo -->
            <div class="pw-card">
                <div class="pw-card-header">
                    <span class="pw-card-title">🎯 Roadmap Ativo</span>
                    <button class="btn-edit-glow" onclick="editCurrentStateMd()">
                        📝 Editor Markdown Completo
                    </button>
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
        if (btnShake) btnShake.onclick = () => {
            if (projectGraph) {
                if (typeof projectGraph.pulseSurge === 'function') projectGraph.pulseSurge();
                else projectGraph.reheat(1.0);
            }
        };
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
function openProjectFolder(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    openProjectInIde('explorer');
}

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

const IDE_REGISTRY = {
    'code': { label: 'VS Code', icon: '💻', cmd: 'code' },
    'cursor': { label: 'Cursor', icon: '⚡', cmd: 'cursor' },
    'antigravity': { label: 'Antigravity', icon: '🪐', cmd: 'antigravity' },
    'windsurf': { label: 'Windsurf', icon: '🌊', cmd: 'windsurf' },
    'idea': { label: 'JetBrains', icon: '🧩', cmd: 'idea' },
    'explorer': { label: 'Pasta', icon: '📂', cmd: 'explorer' }
};

function getPreferredIde() {
    return localStorage.getItem('sb_preferred_ide') || 'code';
}

function setPreferredIde(ide) {
    if (!IDE_REGISTRY[ide]) ide = 'code';
    localStorage.setItem('sb_preferred_ide', ide);
    updateIdeMainButtonUI(ide);
}

function updateIdeMainButtonUI(ide = getPreferredIde()) {
    const info = IDE_REGISTRY[ide] || IDE_REGISTRY['code'];
    const iconEl = document.getElementById('pwIdeMainIcon');
    const labelEl = document.getElementById('pwIdeMainLabel');
    const mainBtn = document.getElementById('pwIdeMainBtn');
    if (iconEl) iconEl.textContent = info.icon;
    if (labelEl) labelEl.textContent = info.label;
    if (mainBtn) mainBtn.title = `Abrir projeto no ${info.label}${ide === 'code' ? ' (Padrão)' : ''}`;

    document.querySelectorAll('.pw-ide-menu-item').forEach(item => {
        const itemIde = item.getAttribute('data-ide');
        item.classList.toggle('active', itemIde === ide);
    });
}

function triggerPreferredIde() {
    const ide = getPreferredIde();
    openProjectInIde(ide);
}

function toggleIdeDropdown(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('pwIdeMenu');
    const arrowBtn = document.getElementById('pwIdeArrowBtn');
    if (!menu) return;
    const isShown = menu.style.display !== 'none';
    menu.style.display = isShown ? 'none' : 'block';
    if (arrowBtn) arrowBtn.setAttribute('aria-expanded', !isShown ? 'true' : 'false');
}

function closeIdeDropdown() {
    const menu = document.getElementById('pwIdeMenu');
    const arrowBtn = document.getElementById('pwIdeArrowBtn');
    if (menu) menu.style.display = 'none';
    if (arrowBtn) arrowBtn.setAttribute('aria-expanded', 'false');
}

function selectAndLaunchIde(ide, icon, label) {
    const chk = document.getElementById('pwSaveIdeAsDefaultCheckbox');
    if (chk && chk.checked) {
        setPreferredIde(ide);
    }
    closeIdeDropdown();
    openProjectInIde(ide);
}

document.addEventListener('click', (e) => {
    const wrap = document.getElementById('pwIdeDropdownWrap');
    if (wrap && !wrap.contains(e.target)) {
        closeIdeDropdown();
    }
});

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

        const editorNames = {
            'code': 'VS Code',
            'cursor': 'Cursor AI',
            'antigravity': 'Google Antigravity',
            'windsurf': 'Windsurf',
            'idea': 'JetBrains',
            'explorer': 'Explorador de Arquivos'
        };
        const editorName = editorNames[ide] || 'VS Code';
        showToast(`💻 Projeto aberto no ${editorName}!`, 'success', 3500);
    } catch (err) {
        showToast(`❌ Falha ao comunicar com o servidor: ${err.message}`, 'error', 4000);
    }
}
window.openProjectInIde = openProjectInIde;
window.triggerPreferredIde = triggerPreferredIde;
window.toggleIdeDropdown = toggleIdeDropdown;
window.closeIdeDropdown = closeIdeDropdown;
window.selectAndLaunchIde = selectAndLaunchIde;
window.updateIdeMainButtonUI = updateIdeMainButtonUI;

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
    applyEditorZoom(currentEditorZoom || 80);

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
        if (badgeEl) {
            badgeEl.textContent = isQuickstartDescEditorActive
                ? '📝 DESCRIÇÃO DO PROJETO'
                : (isQuickstartSpecsEditorActive ? '📄 SPECS & REQUISITOS' : '✏️ EDITOR INTEGRADO');
        }
        if (titleEl && filename) titleEl.textContent = `Editando: ${filename}`;
        if (statusText) statusText.innerHTML = (isQuickstartDescEditorActive || isQuickstartSpecsEditorActive)
            ? '<span class="status-dot" style="background:#6366f1"></span> Editando documento (Ctrl+S para concluir)'
            : '<span class="status-dot" style="background:#10b981"></span> Modo de Edição (Ctrl+S para salvar)';
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
        if (badgeEl) {
            badgeEl.textContent = isQuickstartDescEditorActive
                ? '👁️ PRÉ-VISUALIZAÇÃO DESCRIÇÃO'
                : (isQuickstartSpecsEditorActive ? '👁️ PRÉ-VISUALIZAÇÃO SPECS' : '👁️ PRÉ-VISUALIZAÇÃO');
        }
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
    if (isQuickstartDescEditorActive) {
        applyExpandedDescEditor();
        return;
    }
    if (isQuickstartSpecsEditorActive) {
        applyExpandedSpecsEditor();
        return;
    }
    if (isQuickstartEditorActive) {
        closeExpandedContractModal();
        return;
    }
    const modal = document.getElementById('fileEditorModal');
    if (modal) {
        modal.classList.remove('on-top');
        modal.style.display = 'none';
        const qsModal = document.getElementById('quickstartModal');
        const isQsOpen = qsModal && qsModal.style.display !== 'none';
        document.body.style.overflow = isQsOpen ? 'hidden' : '';
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

        // Monta o Hero Banner dinâmico com o provedor de IA ativo
        const activeProvName = window.AI_GATEWAY_CONFIG?.providerName || aiStatus.providerName || (aiStatus.provider ? aiStatus.provider.toUpperCase() : 'IA');
        const activeModelName = window.AI_GATEWAY_CONFIG?.model || aiStatus.model || 'Ativo';
        const isReady = (aiStatus.configured !== false && aiStatus.ready !== false && (aiStatus.hasKey || aiStatus.provider === 'ollama' || aiStatus.configured));

        const aiBadgeHtml = isReady
            ? `<span class="rl-ai-status-pill rl-ai-clickable" onclick="openAiSettingsModal()" role="button" tabindex="0" title="IA Conectada: ${escapeHtml(activeProvName)} (${escapeHtml(activeModelName)}). Clique para alternar ou configurar."><span class="pulse-dot"></span> ${escapeHtml(activeProvName)} Conectado (${escapeHtml(activeModelName)}) <span class="ai-pill-gear">⚙️</span></span>`
            : `<span class="rl-ai-status-pill rl-ai-clickable rl-ai-missing" onclick="openAiSettingsModal()" role="button" tabindex="0" style="border-color:rgba(245,158,11,0.3); color:#fcd34d;" title="Chave ${escapeHtml(activeProvName)} ausente no .env. Clique para configurar."><span class="pulse-dot" style="background:#f59e0b; box-shadow:0 0 8px #f59e0b;"></span> Chave ${escapeHtml(activeProvName)} Ausente (.env) <span class="ai-pill-gear">⚙️</span></span>`;

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
                            Pesquise temas profundos, consulte a IA conectada para refinar briefings com o contexto real de <strong>${escapeHtml(currentProject)}</strong>, decomponha em subtópicos e catalogue tudo em arquivos <code>.md</code> de conhecimento e ação.
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
                        <div class="rl-metric-lbl">Latência de Inferência (${escapeHtml(activeProvName)})</div>
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

    const refineBtnText = document.querySelector('#btnAiRefine .ai-btn-text');
    if (refineBtnText) {
        const pName = window.AI_GATEWAY_CONFIG?.providerName || (window.AI_GATEWAY_CONFIG?.provider ? window.AI_GATEWAY_CONFIG.provider.toUpperCase() : '');
        refineBtnText.textContent = pName ? `Melhorar com IA (${pName})` : 'Melhorar com IA';
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
 * Aciona o refinamento de prompt com IA Conectada ao Projeto
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

    const activeProvName = window.AI_GATEWAY_CONFIG?.providerName || (window.AI_GATEWAY_CONFIG?.provider ? window.AI_GATEWAY_CONFIG.provider.toUpperCase() : 'IA');

    if (!isLocalEnvironment()) {
        showOnlineDemoNotice(`consultar a API de IA (${activeProvName})`);
        return;
    }

    if (btn) {
        btn.classList.add('loading');
        btn.querySelector('.ai-btn-text').textContent = `Consultando ${activeProvName}...`;
        btn.querySelector('.ai-spinner').style.display = 'inline-block';
    }

    if (statusEl) {
        statusEl.innerHTML = `<span class="pulse-dot"></span> ${escapeHtml(activeProvName)} analisando contexto de ${escapeHtml(currentProject)}...`;
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
            const errObj = new Error(errData.error || 'Falha ao consultar a API de IA.');
            errObj.statusCode = res.status;
            errObj.isRateLimit = res.status === 429 || !!errData.isRateLimit || !!errData.quotaExceeded;
            errObj.quotaExceeded = errObj.isRateLimit;
            errObj.retryAfter = errData.retryAfter;
            errObj.providerName = errData.providerName;
            markAiInferenceError(errObj, { context: 'refine-prompt' });
            if (res.status === 429 || errData.quotaExceeded) {
                showQuotaExceededModal(errData.error);
                if (statusEl) {
                    statusEl.innerHTML = `<span class="status-dot" style="background:#f59e0b"></span> Cota de IA Esgotada!`;
                }
                return;
            }
            throw errObj;
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
            const pName = window.AI_GATEWAY_CONFIG?.providerName || (window.AI_GATEWAY_CONFIG?.provider ? window.AI_GATEWAY_CONFIG.provider.toUpperCase() : 'IA');
            btn.querySelector('.ai-btn-text').textContent = `Melhorar com IA (${pName})`;
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
            const errObj = new Error(errData.error || 'Erro na decomposição.');
            errObj.statusCode = res.status;
            errObj.isRateLimit = res.status === 429 || !!errData.isRateLimit || !!errData.quotaExceeded;
            errObj.quotaExceeded = errObj.isRateLimit;
            errObj.retryAfter = errData.retryAfter;
            errObj.providerName = errData.providerName;
            markAiInferenceError(errObj, { context: 'decompose' });
            if (res.status === 429 || errData.quotaExceeded) {
                showQuotaExceededModal(errData.error);
                return;
            }
            throw errObj;
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

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errObj = new Error(errData.error || 'Falha ao refinar com IA.');
            errObj.statusCode = res.status;
            errObj.isRateLimit = res.status === 429 || !!errData.isRateLimit || !!errData.quotaExceeded;
            errObj.quotaExceeded = errObj.isRateLimit;
            errObj.retryAfter = errData.retryAfter;
            errObj.providerName = errData.providerName;
            markAiInferenceError(errObj, { context: 'definition-refine' });
            throw errObj;
        }
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

    const activeProvName = window.AI_GATEWAY_CONFIG?.providerName || (window.AI_GATEWAY_CONFIG?.provider ? window.AI_GATEWAY_CONFIG.provider.toUpperCase() : 'IA');

    contentEl.innerHTML = `
        <div class="rl-live-progress-container">
            <div class="rl-live-progress-top">
                <div class="rl-live-engine-tag">
                    <span class="rl-live-dot-pulse"></span>
                    <span>${escapeHtml(activeProvName.toUpperCase())} &middot; Síntese Autônoma em Tempo Real</span>
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
        showOnlineDemoNotice(`executar o motor autônomo de síntese de IA (${activeProvName})`);
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
            const errObj = new Error(errData.error || 'Falha ao iniciar motor de pesquisa.');
            errObj.statusCode = res.status;
            errObj.isRateLimit = res.status === 429 || !!errData.isRateLimit || !!errData.quotaExceeded;
            errObj.quotaExceeded = errObj.isRateLimit;
            errObj.retryAfter = errData.retryAfter;
            errObj.providerName = errData.providerName;
            markAiInferenceError(errObj, { context: 'research-run' });
            throw errObj;
        }

        const data = await res.json();
        console.log('✅ Pesquisa concluída com sucesso:', data);
        finalizeLiveResearch(slug, effectiveTopic, data);

    } catch (err) {
        console.error('❌ Erro na execução da pesquisa:', err);
        markAiInferenceError(err, { context: 'research-run' });
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

    const activeProvName = window.AI_GATEWAY_CONFIG?.providerName || (window.AI_GATEWAY_CONFIG?.provider ? window.AI_GATEWAY_CONFIG.provider.toUpperCase() : 'IA');

    if (info.step === 'decomposing') {
        if (headlineText) headlineText.textContent = 'Mapeando árvore de subtópicos com IA...';
        if (sub) sub.textContent = `Consultando o modelo neural ${activeProvName} para taxonomia de conhecimento...`;
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
        } catch (e) { }
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
    } catch (e) { }
}

let currentProposedSubtopics = null;


/**
 * Consulta a IA para gerar novos subtópicos sob demanda
 */
async function forceReDecompose(slug, topic, definition) {
    const subEl = document.getElementById('decModalSub');
    const contentEl = document.getElementById('decModalContent');
    if (!contentEl) return;

    const activeProvName = window.AI_GATEWAY_CONFIG?.providerName || (window.AI_GATEWAY_CONFIG?.provider ? window.AI_GATEWAY_CONFIG.provider.toUpperCase() : 'IA');
    if (subEl) subEl.textContent = `Mapeando nova proposta de subtópicos com o modelo ${activeProvName}...`;

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

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errObj = new Error(errData.error || 'Não foi possível decompor este tema.');
            errObj.statusCode = res.status;
            errObj.isRateLimit = res.status === 429 || !!errData.isRateLimit || !!errData.quotaExceeded;
            errObj.quotaExceeded = errObj.isRateLimit;
            errObj.retryAfter = errData.retryAfter;
            errObj.providerName = errData.providerName;
            markAiInferenceError(errObj, { context: 'decompose-existing' });
            throw errObj;
        }
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
    gemini: {
        name: 'Google Gemini',
        icon: '✨',
        tag: 'Multimodal · 1M+ Contexto · Gratuito',
        placeholder: 'Cole sua chave de API Gemini aqui...',
        requiresKey: true,
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai'
    },
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

        // Se a IA não estiver configurada e for a primeira vez no Cockpit, exibe onboarding suave
        if (!config.configured && !localStorage.getItem('ai_onboarding_shown') && isLocalEnvironment()) {
            localStorage.setItem('ai_onboarding_shown', '1');
            setTimeout(() => {
                openAiWelcomeModal();
            }, 800);
        }
    } catch (err) {
        console.warn('⚠️ [AI Gateway] Modo offline ou demo web:', err.message);
        // Fallback gracioso para modo demonstração
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

    const quotaErr = (config && config.lastError && (config.lastError.isRateLimit || config.lastError.quotaExceeded)) ? config.lastError :
        (lastAiInferenceError && (lastAiInferenceError.isRateLimit || lastAiInferenceError.quotaExceeded)) ? lastAiInferenceError : null;

    if (quotaErr) {
        btn.classList.add('quota-exceeded');
        const prov = quotaErr.providerName || quotaErr.provider || config.providerName || config.provider || 'Anthropic Claude';
        const model = quotaErr.model || config.model || '';
        const shortModel = model ? model.split('/').pop() : '';
        label.textContent = `${prov} • ${shortModel || 'Cota Esgotada'}`;
        btn.title = `⚠️ Cota/Rate Limit (429) esgotado em ${prov}${shortModel ? ' (' + shortModel + ')' : ''}. Clique para abrir as configurações e trocar de modelo ou provedor.`;
        if (dot) dot.className = 'status-dot live';
        return;
    }

    if (config.configured) {
        btn.classList.add('connected');
        const shortModel = (config.model || '').split('/').pop();
        label.textContent = `${config.providerName || config.provider} • ${shortModel}`;
        btn.title = `Motor Ativo: ${config.providerName || config.provider} (${config.model || 'Padrão'}). Clique para configurar IA.`;
        if (dot) dot.className = 'status-dot live';
    } else {
        btn.classList.add('unconfigured');
        label.textContent = `Conectar IA`;
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
 * Popula e sincroniza as opções do dropdown de modelos de IA
 */
function populateAiModelSelect(modelList, selectedModelId) {
    const modelSelect = document.getElementById('aiModelSelect');
    const customInput = document.getElementById('aiCustomModelInput');
    if (!modelSelect || !Array.isArray(modelList) || modelList.length === 0) return;

    const previousVal = selectedModelId || (isManualModelMode && customInput?.value.trim() ? customInput.value.trim() : modelSelect.value);
    modelSelect.innerHTML = '';

    // Agrupamento semântico dinâmico por finalidade
    const categoryLabels = {
        recommended: '🌟 Recomendados para Arquitetura & Raciocínio',
        fast: '⚡ Rápidos & Baixa Latência',
        code: '🛠️ Abertos & Código (Open-Weights)',
        general: '📦 Outros Modelos de Chat'
    };

    const groups = {};
    modelList.forEach(m => {
        let id = '';
        let name = '';
        let ctx = '';
        let category = 'general';

        if (typeof m === 'string') {
            id = m;
            name = m;
        } else if (m && typeof m === 'object') {
            id = m.id || m.name || m.value || '';
            name = m.name || m.label || m.displayName || m.display_name || id;
            ctx = m.contextWindow ? ` — ${Math.round(m.contextWindow / 1024)}k contexto` : '';
            category = m.category || 'general';
        }
        if (!id) return;

        if (!groups[category]) groups[category] = [];
        const label = (name && name !== id && !name.includes(id))
            ? `${name} (${id})${ctx}`
            : `${id}${ctx}`;

        groups[category].push({ id, label });
    });

    const categoryKeys = ['recommended', 'fast', 'code', 'general'].filter(k => groups[k] && groups[k].length > 0);
    const useOptGroups = categoryKeys.length > 1;

    if (useOptGroups) {
        categoryKeys.forEach(catKey => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = categoryLabels[catKey] || catKey;
            groups[catKey].forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.id;
                opt.textContent = item.label;
                optgroup.appendChild(opt);
            });
            modelSelect.appendChild(optgroup);
        });
    } else {
        (groups[categoryKeys[0]] || []).forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = item.label;
            modelSelect.appendChild(opt);
        });
    }

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

/**
 * Modal 2: Principal BYOK (Configuração de IA)
 */
async function openAiSettingsModal() {
    const modal = document.getElementById('aiSettingsModal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Renderiza banner contextual de alerta se a cota/taxa foi esgotada
    if (typeof renderAiSettingsQuotaBanner === 'function') {
        renderAiSettingsQuotaBanner();
    }

    // Limpa feedbacks anteriores
    const feedback = document.getElementById('aiTestFeedback');
    if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'ai-test-feedback';
        feedback.innerHTML = '';
    }

    // Carrega dados frescos da configuração
    try {
        const res = await fetch('/api/ai/config');
        if (res.ok) {
            window.AI_GATEWAY_CONFIG = await res.json();
            updateAiGatewayPillUI(window.AI_GATEWAY_CONFIG);
            if (typeof renderAiSettingsQuotaBanner === 'function') {
                renderAiSettingsQuotaBanner();
            }
        }
    } catch (e) { }

    const cfg = window.AI_GATEWAY_CONFIG || { provider: 'groq' };

    const providerSelect = document.getElementById('aiProviderSelect');
    if (providerSelect && cfg.provider) {
        providerSelect.value = cfg.provider;
    }

    // Configura inputs baseado no provedor
    onProviderSelectChange();

    // Se já tiver chave configurada, insere máscara visual e exibe badge de conexão ativa
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

    // Base URL
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
            if (lastAiInferenceError) {
                const hintEl = document.getElementById('aiQuotaBannerHint');
                const banner = document.getElementById('aiSettingsQuotaBanner');
                if (hintEl && banner && banner.style.display !== 'none') {
                    hintEl.innerHTML = `✨ <strong>Novo modelo selecionado (${escapeHtml(modelSelect.value)})!</strong> Clique em <em>Salvar e Ativar ⚡</em> abaixo para restabelecer a inferência imediata.`;
                }
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
        let quotaLine = '';
        if (details.rateLimit) {
            const rl = details.rateLimit;
            const parts = [];
            if (rl.tokensRemaining !== undefined) {
                const kTokens = Math.round(rl.tokensRemaining / 1000);
                const kLimit = rl.tokensLimit ? `/${Math.round(rl.tokensLimit / 1000)}k` : '';
                parts.push(`${kTokens}k${kLimit} tokens/min`);
            }
            if (rl.requestsRemaining !== undefined) {
                const rLimit = rl.requestsLimit ? `/${rl.requestsLimit}` : '';
                parts.push(`${rl.requestsRemaining}${rLimit} reqs/min`);
            }
            if (parts.length > 0) {
                quotaLine = `\n<span class="t-matrix">[QUOTA]</span> Cota disponível · ${escapeHtml(parts.join(' · '))}`;
            }
        }
        term.innerHTML = `<code><span class="t-matrix">$</span> CONNECTED TO ${escapeHtml(providerUpper)} [AUTHENTICATED]
<span class="t-matrix">[OK]</span> Conexão bem-sucedida · Latência: ${escapeHtml(latency)}
<span class="t-matrix">[OK]</span> Modelos detectados · ${escapeHtml(modelsText)}${quotaLine}
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

    // Atualiza ícone do seletor
    const iconEl = document.getElementById('aiProviderIcon');
    if (iconEl) iconEl.textContent = preset.icon;

    // Atualiza campo e placeholder da API Key
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

    if (lastAiInferenceError && lastAiInferenceError.provider !== (preset.name || providerId)) {
        const hintEl = document.getElementById('aiQuotaBannerHint');
        const banner = document.getElementById('aiSettingsQuotaBanner');
        if (hintEl && banner && banner.style.display !== 'none') {
            hintEl.innerHTML = `✨ <strong>Novo provedor selecionado (${escapeHtml(preset.name || providerId)})!</strong> Digite ou confira a chave e clique em <em>Salvar e Ativar ⚡</em> para restabelecer a inferência.`;
        }
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

    // Se estiver com máscara, não sobrepõe no .env
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
        lastAiInferenceError = null;
        dismissAiSettingsQuotaBanner();
        updateAiGatewayPillUI(data.config);

        closeAiSettingsModal();

        // Feedback UAU com Toast e Pulso Sináptico no Grafo 3D Three.js
        const provName = AI_PROVIDER_PRESETS[provider]?.name || provider;
        showToast(`⚡ Cérebro Digital Conectado: ${provName} ativado com sucesso!`, 'success', 5000);
        triggerSynapticPulse();

        // Se estiver no Research Lab, atualiza os cards
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
 * Modal Universal de Erro / Falta de Crédito de IA & Banner Contextual no Modal BYOK
 */
let currentAiErrorContext = null;
let lastAiInferenceError = null;

function markAiInferenceError(err, options = {}) {
    if (!err) return;
    const errMsg = (err && (err.message || err.error)) || String(err || 'Erro desconhecido');
    const statusCode = err && (err.statusCode || err.status);
    const isRateLimit = (err && (err.isRateLimit || err.quotaExceeded)) ||
        statusCode === 429 ||
        /rate limit|quota|cota|crédito|credit|insufficient_quota|tpm|rpm/i.test(errMsg);
    const isAuth = (err && err.authError) || statusCode === 401 || statusCode === 403 || /api key|unauthorized|chave/i.test(errMsg);
    const isModelNotFound = (err && err.isModelNotFound) || statusCode === 404 || /modelo.*(não está disponível|descontinuado|not found)/i.test(errMsg);
    const isTimeout = statusCode === 408 || /timeout/i.test(errMsg);

    const activeProvider = (err && (err.providerName || err.provider)) || (window.AI_GATEWAY_CONFIG && (window.AI_GATEWAY_CONFIG.providerName || window.AI_GATEWAY_CONFIG.provider)) || 'Anthropic Claude';
    const activeModel = (err && err.model) || (window.AI_GATEWAY_CONFIG && window.AI_GATEWAY_CONFIG.model) || '';
    const shortModel = (activeModel || '').split('/').pop();

    lastAiInferenceError = {
        error: err,
        isRateLimit,
        isAuth,
        isModelNotFound,
        isTimeout,
        provider: activeProvider,
        providerName: activeProvider,
        model: activeModel,
        message: errMsg,
        retryAfter: err && err.retryAfter,
        timestamp: Date.now()
    };

    const btn = document.getElementById('btnAiGatewayModal');
    const dot = document.getElementById('aiStatusPillDot');
    const label = document.getElementById('aiStatusPillProvider');

    if (btn && isRateLimit) {
        btn.classList.remove('connected', 'unconfigured');
        btn.classList.add('quota-exceeded');
        btn.title = `⚠️ Cota/Rate Limit (429) esgotado em ${activeProvider}${shortModel ? ' (' + shortModel + ')' : ''}. Clique para abrir as configurações e trocar de modelo ou provedor.`;
        if (label) {
            label.textContent = `${activeProvider} • ${shortModel || 'Cota Esgotada'}`;
        }
        if (dot) {
            dot.className = 'status-dot live';
        }
    }

    if (typeof renderAiSettingsQuotaBanner === 'function') {
        renderAiSettingsQuotaBanner();
    }
}

function renderAiSettingsQuotaBanner() {
    const banner = document.getElementById('aiSettingsQuotaBanner');
    if (!banner) return;

    const btn = document.getElementById('btnAiGatewayModal');
    const hasQuotaExceeded = btn && btn.classList.contains('quota-exceeded');
    const lastErr = lastAiInferenceError || (window.AI_GATEWAY_CONFIG && window.AI_GATEWAY_CONFIG.lastError);

    if (hasQuotaExceeded || (lastErr && (lastErr.isRateLimit || lastErr.quotaExceeded))) {
        const titleEl = document.getElementById('aiQuotaBannerTitle');
        const textEl = document.getElementById('aiQuotaBannerText');
        const hintEl = document.getElementById('aiQuotaBannerHint');

        const prov = (lastErr && (lastErr.providerName || lastErr.provider)) || window.AI_GATEWAY_CONFIG?.providerName || window.AI_GATEWAY_CONFIG?.provider || 'Anthropic Claude';
        const model = (lastErr && lastErr.model) || window.AI_GATEWAY_CONFIG?.model || '';
        const shortModel = model ? model.split('/').pop() : '';

        if (titleEl) {
            titleEl.textContent = `⚠️ Cota de Inferência Esgotada no Modelo ${shortModel ? '"' + shortModel + '"' : 'Ativo'} (Rate Limit 429)`;
        }
        if (textEl) {
            textEl.innerHTML = `Sua chave de API está conectada e autenticada com sucesso, mas o modelo <strong>${escapeHtml(shortModel || model || 'atual')}</strong> atingiu o limite de taxa de requisições ou créditos da <strong>${escapeHtml(prov)}</strong>.`;
        }
        if (hintEl) {
            hintEl.innerHTML = `💡 <strong>Como Resolver Agora:</strong> Selecione outro modelo com cota livre no <strong>Passo 3</strong> abaixo ou alterne para outro provedor (Google Gemini, Groq, OpenAI, Ollama Local gratuito ou OpenRouter) no <strong>Passo 1</strong> e clique em <em>Salvar e Ativar ⚡</em>.`;
        }
        banner.style.display = 'flex';
    } else {
        banner.style.display = 'none';
    }
}

function dismissAiSettingsQuotaBanner() {
    const banner = document.getElementById('aiSettingsQuotaBanner');
    if (banner) banner.style.display = 'none';
}

function showAiErrorModal(err, options = {}) {
    markAiInferenceError(err, options);
    const modal = document.getElementById('aiErrorModal');
    if (!modal) {
        alert((err && err.message) || String(err));
        return;
    }

    currentAiErrorContext = options;

    const errMsg = (err && (err.message || err.error)) || String(err || 'Erro desconhecido');
    const statusCode = err && (err.statusCode || err.status);
    const isRateLimit = (err && (err.isRateLimit || err.quotaExceeded)) ||
        statusCode === 429 ||
        /rate limit|quota|cota|crédito|credit|insufficient_quota|tpm|rpm/i.test(errMsg);
    const isAuth = (err && err.authError) || statusCode === 401 || statusCode === 403 || /api key|unauthorized|chave/i.test(errMsg);
    const isModelNotFound = (err && err.isModelNotFound) || statusCode === 404 || /modelo.*(não está disponível|descontinuado|not found)/i.test(errMsg);
    const isTimeout = statusCode === 408 || /timeout/i.test(errMsg);

    const badgeEl = document.getElementById('aiErrorBadge');
    const titleEl = document.getElementById('aiErrorTitle');
    const subEl = document.getElementById('aiErrorSubtitle');
    const providerEl = document.getElementById('aiErrorProviderText');
    const reasonEl = document.getElementById('aiErrorReasonText');
    const retryRow = document.getElementById('aiErrorRetryRow');
    const retryText = document.getElementById('aiErrorRetryText');
    const solutionText = document.getElementById('aiErrorSolutionText');

    // Identifica provedor ativo
    const activeProvider = (err && err.providerName) || (window.AI_GATEWAY_CONFIG && window.AI_GATEWAY_CONFIG.provider) || 'Groq Cloud';
    const activeModel = (window.AI_GATEWAY_CONFIG && window.AI_GATEWAY_CONFIG.model) || '';
    if (providerEl) {
        providerEl.textContent = `${activeProvider.toUpperCase()}${activeModel ? ' (' + activeModel + ')' : ''}`;
    }

    // Guarda histórico de erro em memória para o modal de configurações
    lastAiInferenceError = {
        error: err,
        isRateLimit,
        isAuth,
        isModelNotFound,
        isTimeout,
        provider: activeProvider,
        model: activeModel,
        message: errMsg,
        retryAfter: err && err.retryAfter,
        timestamp: Date.now()
    };

    if (isRateLimit) {
        if (badgeEl) {
            badgeEl.className = 'qs-badge ai-error-badge warning';
            badgeEl.textContent = '⚠️ COTA ESGOTADA / RATE LIMIT (429)';
        }
        if (titleEl) titleEl.textContent = 'Créditos ou Cota de IA Esgotados';
        if (subEl) subEl.textContent = 'O provedor de IA atingiu o limite de taxa ou créditos disponíveis para inferência.';
        if (solutionText) {
            solutionText.innerHTML = 'Você pode <strong>alternar para outro provedor de IA</strong> (OpenAI, Claude, Ollama local gratuito ou OpenRouter) com 1 clique nas Configurações de IA, ou aguardar a janela de redefinição.';
        }
    } else if (isAuth) {
        if (badgeEl) {
            badgeEl.className = 'qs-badge ai-error-badge warning';
            badgeEl.textContent = '🔑 CHAVE DE API INVÁLIDA (401)';
        }
        if (titleEl) titleEl.textContent = 'Falha de Autenticação com a IA';
        if (subEl) subEl.textContent = 'A chave de API configurada foi recusada pelo provedor ou não possui permissões.';
        if (solutionText) {
            solutionText.innerHTML = 'Abra as <strong>Configurações de IA</strong> para verificar ou atualizar a chave da sua conta.';
        }
    } else if (isModelNotFound) {
        if (badgeEl) {
            badgeEl.className = 'qs-badge ai-error-badge';
            badgeEl.textContent = '🚫 MODELO INDISPONÍVEL (404)';
        }
        if (titleEl) titleEl.textContent = 'Modelo de IA Descontinuado ou Inválido';
        if (subEl) subEl.textContent = 'O modelo selecionado não existe mais no catálogo do provedor.';
        if (solutionText) {
            solutionText.innerHTML = 'Abra as <strong>Configurações de IA</strong>, teste a conexão e selecione um modelo ativo da lista dinâmica.';
        }
    } else if (isTimeout) {
        if (badgeEl) {
            badgeEl.className = 'qs-badge ai-error-badge warning';
            badgeEl.textContent = '⏱️ TIMEOUT DE RESPOSTA (408)';
        }
        if (titleEl) titleEl.textContent = 'Tempo Limite da IA Excedido';
        if (subEl) subEl.textContent = 'O provedor demorou além do limite tolerado para responder à requisição.';
        if (solutionText) {
            solutionText.innerHTML = 'Verifique sua conexão ou <strong>alterne para um modelo mais veloz</strong> (ex: Groq, GPT-4o-mini, Haiku).';
        }
    } else {
        if (badgeEl) {
            badgeEl.className = 'qs-badge ai-error-badge';
            badgeEl.textContent = '❌ FALHA NO PROVEDOR DE IA';
        }
        if (titleEl) titleEl.textContent = 'Falha na Operação com IA';
        if (subEl) subEl.textContent = 'Ocorreu um erro ao comunicar com a infraestrutura de inteligência artificial.';
        if (solutionText) {
            solutionText.innerHTML = 'Você pode tentar novamente ou <strong>abrir as Configurações de IA</strong> para testar a conexão do provedor.';
        }
    }

    if (reasonEl) {
        reasonEl.textContent = errMsg;
    }

    // Janela de reset / retry-after
    const retryAfter = err && err.retryAfter;
    if (retryAfter && retryAfter > 0) {
        if (retryRow) retryRow.style.display = 'flex';
        if (retryText) {
            const minutes = Math.ceil(retryAfter / 60);
            const timeDesc = retryAfter > 60 ? `${retryAfter}s (~${minutes} minutos)` : `${retryAfter}s`;
            retryText.textContent = `A cota será restaurada pelo provedor em aproximadamente ${timeDesc}.`;
        }
    } else {
        if (retryRow) retryRow.style.display = 'none';
    }

    // Destaca também o botão no topo se for cota e atualiza tooltip explicativo
    const btn = document.getElementById('btnAiGatewayModal');
    if (btn && isRateLimit) {
        btn.classList.add('quota-exceeded');
        const shortModel = (activeModel || '').split('/').pop();
        btn.title = `⚠️ Cota/Rate Limit (429) esgotado em ${activeProvider} (${shortModel || 'modelo ativo'}). Clique para abrir as configurações e trocar de modelo ou provedor.`;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAiErrorModal() {
    const modal = document.getElementById('aiErrorModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleAiErrorModalBackdrop(e) {
    if (e.target && e.target.id === 'aiErrorModal') {
        closeAiErrorModal();
    }
}

function handleAiErrorOpenConfig() {
    closeAiErrorModal();
    if (typeof openAiSettingsModal === 'function') {
        openAiSettingsModal();
    }
}

/**
 * Modal 3: Alerta de Cota de IA Esgotada (429 Rate Limit) - Delega para showAiErrorModal
 */
function showQuotaExceededModal(customMsg) {
    const errObj = (typeof customMsg === 'object' && customMsg !== null)
        ? customMsg
        : new Error(customMsg || 'Cota de IA esgotada.');
    errObj.quotaExceeded = true;
    errObj.isRateLimit = true;
    showAiErrorModal(errObj);
}

function closeAiQuotaModal() {
    closeAiErrorModal();
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

// Fechamento de todos os modais via tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const aiErr = document.getElementById('aiErrorModal');
        const welcome = document.getElementById('aiWelcomeModal');
        const settings = document.getElementById('aiSettingsModal');
        const quota = document.getElementById('aiQuotaModal');

        if (aiErr && aiErr.style.display === 'flex') {
            closeAiErrorModal();
            return;
        }
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
window.showAiErrorModal = showAiErrorModal;
window.markAiInferenceError = markAiInferenceError;
window.closeAiErrorModal = closeAiErrorModal;
window.handleAiErrorModalBackdrop = handleAiErrorModalBackdrop;
window.handleAiErrorOpenConfig = handleAiErrorOpenConfig;
window.renderAiSettingsQuotaBanner = renderAiSettingsQuotaBanner;
window.dismissAiSettingsQuotaBanner = dismissAiSettingsQuotaBanner;

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
            const errObj = new Error(data.error || 'Falha ao gerar o rascunho.');
            errObj.statusCode = res.status;
            errObj.isRateLimit = res.status === 429 || !!data.isRateLimit || !!data.quotaExceeded;
            errObj.quotaExceeded = errObj.isRateLimit;
            errObj.retryAfter = data.retryAfter;
            errObj.providerName = data.providerName;
            markAiInferenceError(errObj, { context: 'session-draft' });

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

// ════════════════════════════════════════════════════════════
// FRICÇÃO 5: PERGUNTE AO CÉREBRO ("Ask the Brain")
// Busca Global Semântica e Q&A com Citações Clicáveis e Zero Fabricação
// ════════════════════════════════════════════════════════════

let askBrainActiveQuery = '';
let askBrainLastAnswerMarkdown = '';
let askBrainLoadingInterval = null;
let askBrainActiveCategory = 'all';
const ASK_BRAIN_RECENTS_KEY = 'brain_ask_recent_queries';

const ASK_BRAIN_LOADING_MESSAGES = [
    { title: 'Varrendo sinapses do cérebro...', sub: 'Recuperando contratos, ADRs e regras determinísticas' },
    { title: 'Calculando relevância semântica...', sub: 'Ranqueando lições aprendidas e estado dos projetos' },
    { title: 'Sintetizando com Zero Fabricação...', sub: 'Verificando citação estrita das fontes encontradas' },
    { title: 'Formatando resposta executiva...', sub: 'Organizando links clicáveis para navegação no vault' }
];

function setAskBrainCategory(cat) {
    askBrainActiveCategory = cat || 'all';
    const catSelect = document.getElementById('askBrainCategorySelect');
    if (catSelect && catSelect.value !== askBrainActiveCategory) {
        catSelect.value = askBrainActiveCategory;
    }

    // Se o input já tem texto, re-executa a busca para aplicar o filtro de categoria
    const input = document.getElementById('askBrainQueryInput');
    if (input && input.value.trim().length > 1) {
        submitAskBrainQuery();
    }
}

function getAskBrainRecents() {
    try {
        const raw = sessionStorage.getItem(ASK_BRAIN_RECENTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveAskBrainRecent(query) {
    if (!query || query.trim().length < 2) return;
    const clean = query.trim();
    let recents = getAskBrainRecents();
    recents = recents.filter(q => q.toLowerCase() !== clean.toLowerCase());
    recents.unshift(clean);
    if (recents.length > 5) recents = recents.slice(0, 5);
    try {
        sessionStorage.setItem(ASK_BRAIN_RECENTS_KEY, JSON.stringify(recents));
    } catch (e) { }
    renderAskBrainRecents();
}

function clearAskBrainRecents() {
    try {
        sessionStorage.removeItem(ASK_BRAIN_RECENTS_KEY);
    } catch (e) { }
    renderAskBrainRecents();
}

function renderAskBrainRecents() {
    const row = document.getElementById('askBrainRecentsRow');
    const list = document.getElementById('askBrainRecentsList');
    if (!row || !list) return;

    const recents = getAskBrainRecents();
    if (!recents || recents.length === 0) {
        row.style.display = 'none';
        list.innerHTML = '';
        return;
    }

    row.style.display = 'flex';
    list.innerHTML = '';
    recents.forEach(q => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'ask-recent-pill';
        pill.title = q;
        pill.textContent = q;
        pill.onclick = () => {
            askBrainFillQuery(q);
        };
        list.appendChild(pill);
    });
}

function openAskBrainModal(initialQuery = '') {
    const modal = document.getElementById('askBrainModal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Popula select de escopo com projetos do vault se não populado
    const scopeSelect = document.getElementById('askBrainScopeSelect');
    if (scopeSelect && scopeSelect.options.length <= 1) {
        const files = (window.VAULT && window.VAULT.data && window.VAULT.data.files) ||
            (window.VAULT_SNAPSHOT && window.VAULT_SNAPSHOT.files) || [];
        const projectFolders = new Set();
        files.forEach(f => {
            const p = (f.path || '').replace(/\\/g, '/');
            if (p.startsWith('projects/')) {
                const parts = p.split('/');
                if (parts.length > 2 && parts[1]) {
                    projectFolders.add(parts[1]);
                }
            }
        });

        Array.from(projectFolders).sort().forEach(folderName => {
            const opt = document.createElement('option');
            opt.value = folderName;
            opt.textContent = `Projeto: ${folderName}`;
            scopeSelect.appendChild(opt);
        });
    }

    // Sincroniza seletor de categoria
    const catSelect = document.getElementById('askBrainCategorySelect');
    if (catSelect) {
        catSelect.value = askBrainActiveCategory || 'all';
    }

    // Renderiza buscas recentes da sessão
    renderAskBrainRecents();

    const input = document.getElementById('askBrainQueryInput');
    if (input) {
        if (initialQuery) {
            input.value = initialQuery;
        }
        setTimeout(() => {
            input.focus();
            input.select();
        }, 80);
    }
}

function closeAskBrainModal() {
    const modal = document.getElementById('askBrainModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    if (askBrainLoadingInterval) {
        clearInterval(askBrainLoadingInterval);
        askBrainLoadingInterval = null;
    }
}

function handleAskBrainBackdrop(e) {
    if (e.target && e.target.id === 'askBrainModal') {
        closeAskBrainModal();
    }
}

function askBrainFillQuery(text) {
    const input = document.getElementById('askBrainQueryInput');
    if (input) {
        input.value = text;
        input.focus();
    }
    submitAskBrainQuery();
}

function copyAskBrainAnswer(btnElement) {
    if (!askBrainLastAnswerMarkdown) return;
    const btn = btnElement || document.querySelector('.ask-copy-answer-btn');
    navigator.clipboard.writeText(askBrainLastAnswerMarkdown).then(() => {
        if (btn) {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '✓ Copiada!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.remove('copied');
            }, 1800);
        }
        if (typeof showSecondBrainToast === 'function') {
            showSecondBrainToast('📋 Resposta copiada para a área de transferência!');
        } else if (typeof showToast === 'function') {
            showToast('Resposta copiada!', 'success');
        }
    }).catch(() => {
        if (typeof showToast === 'function') showToast('Não foi possível copiar.', 'error');
    });
}

async function submitAskBrainQuery() {
    const input = document.getElementById('askBrainQueryInput');
    const query = (input?.value || '').trim();
    if (!query) {
        input?.focus();
        return;
    }

    const scopeSelect = document.getElementById('askBrainScopeSelect');
    const scope = scopeSelect ? scopeSelect.value : '';

    const catSelect = document.getElementById('askBrainCategorySelect');
    const categoryFilter = catSelect ? catSelect.value : (askBrainActiveCategory || 'all');
    askBrainActiveCategory = categoryFilter;

    const emptyState = document.getElementById('askBrainEmptyState');
    const loadingState = document.getElementById('askBrainLoadingState');
    const resultsState = document.getElementById('askBrainResultsState');
    const submitBtn = document.getElementById('btnAskBrainSubmit');

    if (emptyState) emptyState.style.display = 'none';
    if (resultsState) resultsState.style.display = 'none';
    if (loadingState) loadingState.style.display = 'block';
    if (submitBtn) submitBtn.disabled = true;

    // Salva no histórico de buscas recentes da sessão
    saveAskBrainRecent(query);

    // Dispara pulso visual nos neurônios do Grafo 3D
    if (typeof triggerSynapticPulse === 'function') {
        triggerSynapticPulse();
    }

    // Rotação de mensagens do loading
    let msgIdx = 0;
    const updateLoadingText = () => {
        const item = ASK_BRAIN_LOADING_MESSAGES[msgIdx % ASK_BRAIN_LOADING_MESSAGES.length];
        const titleEl = document.getElementById('askLoadingTitle');
        const subEl = document.getElementById('askLoadingSubtitle');
        if (titleEl) titleEl.textContent = item.title;
        if (subEl) subEl.textContent = item.sub;
        msgIdx++;
    };
    updateLoadingText();
    if (askBrainLoadingInterval) clearInterval(askBrainLoadingInterval);
    askBrainLoadingInterval = setInterval(updateLoadingText, 1400);

    const t0 = performance.now();

    try {
        const res = await fetch('/api/brain/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                scope,
                categoryFilter,
                topK: 5
            })
        });

        const data = await res.json();
        if (askBrainLoadingInterval) clearInterval(askBrainLoadingInterval);

        if (!res.ok || !data.success) {
            const errObj = new Error(data.error || 'Erro ao processar consulta com o Cérebro.');
            errObj.statusCode = res.status;
            errObj.isRateLimit = res.status === 429 || !!data.isRateLimit || !!data.quotaExceeded;
            errObj.quotaExceeded = errObj.isRateLimit;
            errObj.retryAfter = data.retryAfter;
            errObj.providerName = data.providerName;
            markAiInferenceError(errObj, { context: 'ask-brain' });
            throw errObj;
        }

        const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
        const rawAnswerText = data.answer || data.answerMarkdown || '';
        askBrainLastAnswerMarkdown = rawAnswerText;

        // Renderiza Metadados
        const metaTime = document.getElementById('askMetaTime');
        const metaSnippets = document.getElementById('askMetaSnippets');
        const metaScope = document.getElementById('askMetaScope');
        const sourcesCount = document.getElementById('askSourcesCount');

        let metaFilterLabel = 'Global';
        if (scope && categoryFilter !== 'all') {
            metaFilterLabel = `${scope} • ${categoryFilter.toUpperCase()}`;
        } else if (scope) {
            metaFilterLabel = `Projeto: ${scope}`;
        } else if (categoryFilter !== 'all') {
            metaFilterLabel = `Categoria: ${categoryFilter.toUpperCase()}`;
        }

        const totalCount = data.sources?.length || 0;
        const synthCount = data.synthesizedCount || Math.min(totalCount, 5);

        if (metaTime) metaTime.textContent = `⏱️ ${elapsed}s`;
        if (metaSnippets) {
            if (totalCount > synthCount) {
                metaSnippets.textContent = `📄 ${synthCount} citadas (${totalCount} no cofre)`;
            } else {
                metaSnippets.textContent = `📄 ${totalCount} fontes consultadas`;
            }
        }
        if (metaScope) metaScope.textContent = `🎯 ${metaFilterLabel}`;
        if (sourcesCount) {
            if (totalCount > synthCount) {
                sourcesCount.textContent = `(${synthCount} citadas na síntese • ${totalCount - synthCount} adicionais)`;
            } else {
                sourcesCount.textContent = `(${totalCount} citações encontradas)`;
            }
        }

        // Renderiza Markdown da Resposta
        const answerContent = document.getElementById('askAnswerContent');
        if (answerContent) {
            let renderedHtml = '';
            try {
                if (window.marked && typeof window.marked.parse === 'function') {
                    renderedHtml = window.marked.parse(rawAnswerText);
                } else if (typeof window.marked === 'function') {
                    renderedHtml = window.marked(rawAnswerText);
                }
            } catch (parseErr) {
                console.warn('Erro ao processar markdown com marked.js:', parseErr);
            }
            if (!renderedHtml) {
                renderedHtml = `<p>${escapeHtml(rawAnswerText).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
            }
            renderedHtml = renderedHtml.replace(/<li>\s*\[ \]\s*/gi, '<li class="task-list-item"><input type="checkbox" disabled> ');
            renderedHtml = renderedHtml.replace(/<li>\s*\[x\]\s*/gi, '<li class="task-list-item"><input type="checkbox" checked disabled> ');
            answerContent.innerHTML = renderedHtml;

            // Intercepta todos os links internos na resposta da IA para abrir no visualizador nativo do Cockpit
            answerContent.querySelectorAll('a').forEach(anchor => {
                const href = anchor.getAttribute('href') || '';
                if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('#')) {
                    anchor.style.cursor = 'pointer';
                    anchor.title = `Abrir no Cockpit: ${href}`;
                    anchor.addEventListener('click', (e) => {
                        e.preventDefault();
                        openAskSourceDoc(href);
                    });
                } else {
                    anchor.setAttribute('target', '_blank');
                    anchor.setAttribute('rel', 'noopener noreferrer');
                }
            });
        }

        // Renderiza Lista de Fontes com Citações Clicáveis e Design UAU
        const sourcesList = document.getElementById('askSourcesList');
        if (sourcesList) {
            sourcesList.innerHTML = '';
            if (Array.isArray(data.sources) && data.sources.length > 0) {
                const initialVisible = 5;
                const topSources = data.sources.slice(0, initialVisible);
                const extraSources = data.sources.slice(initialVisible);

                // Renderiza as primeiras 5 fontes
                topSources.forEach((src, idx) => {
                    const card = renderAskSourceCardElement(src, query, idx);
                    sourcesList.appendChild(card);
                });

                // Se houver mais fontes, cria contêiner colapsável e botão expansor
                if (extraSources.length > 0) {
                    const extraContainer = document.createElement('div');
                    extraContainer.id = 'askSourcesExtraContainer';
                    extraContainer.style.display = 'none';
                    extraContainer.style.flexDirection = 'column';
                    extraContainer.style.gap = '12px';
                    extraContainer.style.marginTop = '12px';

                    extraSources.forEach((src, idx) => {
                        const card = renderAskSourceCardElement(src, query, initialVisible + idx);
                        extraContainer.appendChild(card);
                    });
                    sourcesList.appendChild(extraContainer);

                    const toggleWrap = document.createElement('div');
                    toggleWrap.className = 'ask-sources-toggle-wrap';
                    toggleWrap.innerHTML = `
                        <button type="button" id="btnToggleMoreSources" class="btn-toggle-more-sources" onclick="toggleMoreAskSources(${extraSources.length})">
                            <span>📄 Ver mais ${extraSources.length} fontes encontradas no cofre</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                    `;
                    sourcesList.appendChild(toggleWrap);
                }
            } else {
                sourcesList.innerHTML = '<div style="color: var(--text-tertiary); font-size: 13px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">Nenhum documento relevante encontrado para os filtros selecionados.</div>';
            }
        }

        if (loadingState) loadingState.style.display = 'none';
        if (resultsState) resultsState.style.display = 'block';
    } catch (err) {
        if (askBrainLoadingInterval) clearInterval(askBrainLoadingInterval);
        if (loadingState) loadingState.style.display = 'none';
        if (resultsState) resultsState.style.display = 'block';

        const answerContent = document.getElementById('askAnswerContent');
        if (answerContent) {
            answerContent.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 14px; color: #f87171;">
                    <strong>⚠️ Falha na consulta cognitiva:</strong><br>
                    ${escapeHtml(err.message)}
                </div>
            `;
        }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

function openAskSourceDoc(path) {
    if (!path) return;
    closeAskBrainModal();
    const cleanPath = decodeURIComponent(path).replace(/^\.?\/+/, '');
    if (typeof navigateTo === 'function') {
        navigateTo(cleanPath);
    } else if (typeof openFileEditor === 'function') {
        openFileEditor(cleanPath);
    }
}

function focusAskSourceGraph(path) {
    closeAskBrainModal();
    if (typeof showView === 'function') {
        showView('graph');
    }
    const input = document.getElementById('graphSearchInput');
    if (input) {
        const filename = path.split('/').pop().replace(/\.md$/i, '');
        input.value = filename;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (typeof triggerSynapticPulse === 'function') {
        triggerSynapticPulse();
    }
}

/**
 * Renderiza o Card de Fonte Citada com Alta Fidelidade (UX UAU)
 */
function renderAskSourceCardElement(src, query, index) {
    const card = document.createElement('div');
    const path = src.path || '';
    const normPath = path.toLowerCase();

    // Determina categoria, ícone e badge semântico
    let cat = 'project';
    let catBadge = 'PROJETO CONECTADO';
    let icon = src.icon || '📄';
    const fileName = normPath.split('/').pop() || '';

    if (normPath.includes('/research/') || normPath.startsWith('research/')) {
        cat = 'research';
        catBadge = 'RESEARCH LAB';
        icon = '🔬';
    } else if (normPath.includes('/decisions/') || normPath.startsWith('decisions/') || fileName.startsWith('adr-') || fileName.startsWith('adr_')) {
        cat = 'decision';
        catBadge = 'DECISÃO ARQUITETURAL';
        icon = '⚖️';
    } else if (normPath.includes('rules/') || normPath.endsWith('agents.md') || normPath.endsWith('gemini.md')) {
        cat = 'rules';
        catBadge = 'REGRA DETERMINÍSTICA';
        icon = '🛡️';
    } else if (normPath.includes('memory/') || normPath.includes('lessons')) {
        cat = 'memory';
        catBadge = 'MEMÓRIA & LIÇÕES';
        icon = '🧠';
    } else if (normPath.endsWith('project.md') || normPath.endsWith('current_state.md')) {
        cat = 'project';
        catBadge = 'CONTRATO PRINCIPAL';
        icon = '📦';
    }

    card.className = `ask-source-card cat-${cat}`;

    // Título legível
    const displayTitle = src.title || path.split('/').pop().replace(/\.md$/i, '');

    // Relevância calculada / score
    let scoreBadgeHtml = '';
    if (src.score) {
        scoreBadgeHtml = `<span class="ask-source-score-badge">Relevância: ${Math.round(src.score)} pts</span>`;
    }

    // Badges de Sintetizada vs Adicional
    let synthBadgeHtml = '';
    if (src.isSynthesized === false) {
        synthBadgeHtml = `<span class="ask-source-badge-extra" title="Documento relevante encontrado no ranking geral do cofre">Fonte Adicional</span>`;
    } else if (src.isSynthesized === true) {
        synthBadgeHtml = `<span class="ask-source-badge-synth" title="Documento utilizado diretamente no contexto da síntese da IA">Citada na Síntese</span>`;
    }

    // Highlight e sanitização do snippet
    const rawSnippet = (src.snippet || '').trim();
    const snippetHtml = highlightSearchTerms(rawSnippet, query);
    const snippetLengthHint = `~${rawSnippet.length} caracteres`;

    card.innerHTML = `
        <div class="ask-source-header">
            <div class="ask-source-row-top">
                <div class="ask-source-identity">
                    <div class="ask-source-icon-wrap" title="${catBadge}">${icon}</div>
                    <div class="ask-source-title-meta">
                        <span class="ask-source-cat-badge cat-${cat}">${catBadge}</span>
                        <span class="ask-source-title">${escapeHtml(displayTitle)}</span>
                        ${synthBadgeHtml}
                        ${scoreBadgeHtml}
                    </div>
                </div>
                <div class="ask-source-actions">
                    <button type="button" class="ask-source-btn" onclick="openAskSourceDoc('${escapeHtml(path)}')" title="Abrir documento no leitor">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        <span>Abrir Doc</span>
                    </button>
                    <button type="button" class="ask-source-btn graph" onclick="focusAskSourceGraph('${escapeHtml(path)}')" title="Localizar e focar este nó no Grafo 3D">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><line x1="12" y1="9" x2="19" y2="5"/><line x1="12" y1="15" x2="5" y2="19"/></svg>
                        <span>No Grafo</span>
                    </button>
                    <button type="button" class="ask-source-btn ask-source-btn-icon-only" onclick="copyAskSourceCitation('${escapeHtml(path)}', '${escapeHtml(displayTitle)}', this)" title="Copiar citação Markdown [Título](caminho)">
                        📋
                    </button>
                </div>
            </div>
            <div class="ask-source-path-row" title="${escapeHtml(path)}">
                <span class="ask-source-path-icon">📁</span>
                <span>${escapeHtml(path)}</span>
            </div>
        </div>

        <div class="ask-source-snippet-box collapsed" id="askSnippetBox_${index}">
            <div class="ask-source-snippet-content">${snippetHtml}</div>
            <div class="ask-snippet-fade-overlay"></div>
        </div>

        <div class="ask-source-footer">
            <button type="button" class="btn-toggle-snippet" onclick="toggleAskSourceSnippet(${index})" id="btnToggleSnippet_${index}">
                <span class="toggle-icon">👁️</span>
                <span class="toggle-text">Expandir Trecho Completo</span>
            </button>
            <span class="ask-snippet-len-hint">${snippetLengthHint}</span>
        </div>
    `;

    return card;
}

function toggleAskSourceSnippet(index) {
    const box = document.getElementById(`askSnippetBox_${index}`);
    const btn = document.getElementById(`btnToggleSnippet_${index}`);
    if (!box || !btn) return;

    const isCollapsed = box.classList.contains('collapsed');
    if (isCollapsed) {
        box.classList.remove('collapsed');
        box.classList.add('expanded');
        btn.innerHTML = `<span class="toggle-icon">🔼</span><span class="toggle-text">Recolher Trecho</span>`;
    } else {
        box.classList.remove('expanded');
        box.classList.add('collapsed');
        btn.innerHTML = `<span class="toggle-icon">👁️</span><span class="toggle-text">Expandir Trecho Completo</span>`;
    }
}

function copyAskSourceCitation(path, title, btnElement) {
    const citation = `[${title}](${path})`;
    navigator.clipboard.writeText(citation).then(() => {
        if (btnElement) {
            const originalHtml = btnElement.innerHTML;
            btnElement.innerHTML = '✓';
            btnElement.classList.add('copied');
            setTimeout(() => {
                btnElement.innerHTML = originalHtml;
                btnElement.classList.remove('copied');
            }, 1800);
        }
        if (typeof showSecondBrainToast === 'function') {
            showSecondBrainToast(`📋 Citação copiada: ${citation}`);
        } else if (typeof showToast === 'function') {
            showToast('Citação copiada!', 'success');
        }
    }).catch(() => {
        if (typeof showToast === 'function') showToast('Não foi possível copiar.', 'error');
    });
}

function highlightSearchTerms(rawText, query) {
    if (!rawText) return '';
    let sanitized = escapeHtml(rawText);

    sanitized = sanitized.replace(/\|\s*-{3,}\s*\|/g, '');
    sanitized = sanitized.replace(/\|\s*:\s*-{3,}\s*:\s*\|/g, '');

    if (!query) return sanitized;

    const terms = query
        .toLowerCase()
        .split(/\s+/)
        .map(t => t.replace(/[^\w\u00C0-\u00FF]/g, '').trim())
        .filter(t => t.length >= 3 && !['qual', 'quais', 'onde', 'como', 'para', 'com', 'que', 'dos', 'das', 'uma', 'sobre', 'qualquer'].includes(t));

    if (terms.length === 0) return sanitized;

    try {
        const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
        return sanitized.replace(pattern, '<mark class="ask-kw-highlight">$1</mark>');
    } catch (e) {
        return sanitized;
    }
}

/**
 * Alterna a visibilidade das fontes adicionais do cofre
 */
function toggleMoreAskSources(extraCount) {
    const extraContainer = document.getElementById('askSourcesExtraContainer');
    const btn = document.getElementById('btnToggleMoreSources');
    if (!extraContainer || !btn) return;

    const isExpanded = extraContainer.style.display !== 'none';
    if (isExpanded) {
        extraContainer.style.display = 'none';
        btn.classList.remove('expanded');
        btn.innerHTML = `
            <span>📄 Ver mais ${extraCount} fontes encontradas no cofre</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        `;
    } else {
        extraContainer.style.display = 'flex';
        btn.classList.add('expanded');
        btn.innerHTML = `
            <span>🔼 Recolher fontes adicionais</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        `;
    }
}

function openAskBrainHelpModal() {
    const modal = document.getElementById('askBrainHelpModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAskBrainHelpModal() {
    const modal = document.getElementById('askBrainHelpModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleAskBrainHelpBackdrop(event) {
    if (event.target && event.target.id === 'askBrainHelpModal') {
        closeAskBrainHelpModal();
    }
}

// Atalho de Teclado Global: Ctrl + K (ou Cmd + K) e Enter no input
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const helpModal = document.getElementById('askBrainHelpModal');
        if (helpModal && helpModal.style.display === 'flex') {
            closeAskBrainHelpModal();
        }
        const modal = document.getElementById('askBrainModal');
        if (modal && modal.style.display === 'flex') {
            closeAskBrainModal();
        } else {
            openAskBrainModal();
        }
        return;
    }

    if (e.key === 'Escape') {
        const changelogModal = document.getElementById('modalChangelog');
        if (changelogModal && changelogModal.style.display === 'flex') {
            closeChangelogModal();
            return;
        }
        const helpModal = document.getElementById('askBrainHelpModal');
        if (helpModal && helpModal.style.display === 'flex') {
            closeAskBrainHelpModal();
            return;
        }
        const modal = document.getElementById('askBrainModal');
        if (modal && modal.style.display === 'flex') {
            closeAskBrainModal();
        }
    }
});

// Listener de Enter no input
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('askBrainQueryInput');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitAskBrainQuery();
            }
        });
    }
});

// --- Gerenciamento de Versão, Notificação de Atualização e Changelog ---
let _cachedChangelogMarkdown = null;

async function initSystemVersionCheck() {
    try {
        const res = await fetch('/api/system/version');
        if (res.ok) {
            const data = await res.json();
            applyVersionToUI(data);
            return;
        }
    } catch (e) {
        // Fallback silencioso
    }

    const cached = localStorage.getItem('ai_second_brain_system_version');
    if (cached) {
        applyVersionToUI({
            version: cached,
            updateAvailable: false,
            behindCommits: 0
        });
    }
}

function applyVersionToUI(data) {
    const rawVer = data?.version || data?.installedVersion || localStorage.getItem('ai_second_brain_system_version');
    if (!rawVer) return;
    const ver = String(rawVer).replace(/^v/i, '').trim();
    try { localStorage.setItem('ai_second_brain_system_version', ver); } catch (_) { }
    const hasUpdate = Boolean(data?.updateAvailable);

    // Boot Screen Badge
    const bootVer = document.getElementById('bootVersionText');
    if (bootVer) bootVer.textContent = `v${ver}`;

    // Sidebar Version Badge
    const sidebarText = document.getElementById('sidebarVersionText');
    if (sidebarText) sidebarText.textContent = `v${ver}`;

    const sidebarBadge = document.getElementById('sidebarVersionBadge');
    const sidebarAction = document.getElementById('sidebarVersionAction');
    const sidebarDot = document.getElementById('sidebarVersionDot');

    if (sidebarBadge) {
        if (hasUpdate) {
            sidebarBadge.classList.add('has-update');
            if (sidebarAction) sidebarAction.innerHTML = 'Atualização ⚡';
            if (sidebarDot) sidebarDot.className = 'version-dot update';
            sidebarBadge.title = `Nova versão disponível! Clique para ver novidades e atualizar.`;
        } else {
            sidebarBadge.classList.remove('has-update');
            if (sidebarAction) sidebarAction.innerHTML = 'Novidades ✨';
            if (sidebarDot) sidebarDot.className = 'version-dot';
            sidebarBadge.title = `AI Second Brain v${ver} • Clique para ver novidades e histórico`;
        }
    }

    // Topbar Version Pill
    const topTag = document.getElementById('topVersionTag');
    if (topTag) topTag.textContent = `v${ver}`;

    const btnTopVersion = document.getElementById('btnTopVersion');
    if (btnTopVersion) {
        if (hasUpdate) {
            btnTopVersion.classList.add('has-update');
            btnTopVersion.title = `⚡ Nova versão disponível no repositório! Clique para ver novidades.`;
        } else {
            btnTopVersion.classList.remove('has-update');
            btnTopVersion.title = `AI Second Brain v${ver} • Ver Novidades e Histórico`;
        }
    }

    // Modal Version Tag
    const modalTag = document.getElementById('changelogModalVersionTag');
    if (modalTag) modalTag.textContent = `v${ver}`;

    // Modal Update Banner
    const banner = document.getElementById('changelogUpdateBanner');
    if (banner) {
        if (hasUpdate) {
            banner.style.display = 'flex';
            const titleEl = document.getElementById('changelogUpdateTitle');
            const descEl = document.getElementById('changelogUpdateDesc');
            if (titleEl) {
                titleEl.textContent = data.remoteVersion
                    ? `Nova versão disponível: v${data.remoteVersion}`
                    : `Atualização disponível no repositório GitHub!`;
            }
            if (descEl) {
                const commits = data.behindCommits ? `${data.behindCommits} commits atrás` : 'novas melhorias disponíveis';
                descEl.innerHTML = `Seu workspace está ${commits}. Execute <code>git pull origin main</code> para atualizar.`;
            }
        } else {
            banner.style.display = 'none';
        }
    }
}

async function openChangelogModal() {
    const modal = document.getElementById('modalChangelog');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const contentArea = document.getElementById('changelogContentArea');
    if (!contentArea) return;

    if (_cachedChangelogMarkdown) {
        renderChangelogMarkdown(_cachedChangelogMarkdown);
        return;
    }

    contentArea.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
            <div class="ai-sparkles" style="font-size: 24px; margin-bottom: 8px;">✨</div>
            <div>Carregando histórico de versões e novidades...</div>
        </div>
    `;

    try {
        const res = await fetch('/api/system/changelog');
        if (res.ok) {
            const data = await res.json();
            const md = data?.content || data?.changelog || '';
            if (md) {
                _cachedChangelogMarkdown = md;
                renderChangelogMarkdown(md);
                return;
            }
        }
    } catch (e) {
        console.warn('Não foi possível carregar changelog via API:', e);
    }

    // 2. Se a API falhar (ex: rodando sem backend Node ou no GitHub Pages), busca do Vault em memória
    if (window.VAULT && typeof window.VAULT.getFile === 'function') {
        const file = window.VAULT.getFile('CHANGELOG.md');
        if (file && file.content) {
            _cachedChangelogMarkdown = file.content;
            renderChangelogMarkdown(file.content);
            return;
        }
    }

    // 3. Fallback de última contingência (HTML de emergência)
    renderChangelogFallback();
}

function closeChangelogModal() {
    const modal = document.getElementById('modalChangelog');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function copyGitPullCommand(btn) {
    const cmd = 'git pull origin main';
    navigator.clipboard.writeText(cmd).then(() => {
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = '<span>✓ Comando Copiado!</span>';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = originalHTML;
            }, 2000);
        }
    }).catch(err => {
        console.error('Falha ao copiar:', err);
    });
}

function renderChangelogMarkdown(markdownText) {
    const contentArea = document.getElementById('changelogContentArea');
    if (!contentArea) return;

    if (window.marked && typeof window.marked.parse === 'function') {
        try {
            // Remove o H1 inicial (# Changelog — AI Second Brain) redundante com o título do modal
            let cleanMd = markdownText.replace(/^#\s+Changelog[^\n]*\n+/i, '');
            contentArea.innerHTML = window.marked.parse(cleanMd);

            // Garante que todos os links abram em uma nova aba com segurança
            contentArea.querySelectorAll('a').forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });

            if (!contentArea._hasTargetBlankDelegation) {
                contentArea._hasTargetBlankDelegation = true;
                contentArea.addEventListener('click', (e) => {
                    const link = e.target.closest('a');
                    if (link && link.href) {
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                    }
                });
            }
            return;
        } catch (e) {
            console.error('Erro no parser markdown:', e);
        }
    }

    renderChangelogFallback();
}

function renderChangelogFallback() {
    const contentArea = document.getElementById('changelogContentArea');
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="changelog-release-card highlight">
            <div class="changelog-release-header">
                <span class="changelog-release-badge current">v1.3.0 • Versão Atual</span>
                <span class="changelog-release-date">21 de Outubro de 2026</span>
            </div>
            <div class="changelog-release-body">
                <h4>🚀 Adicionado</h4>
                <ul>
                    <li><strong>Cockpit de Síntese Neural em Tempo Real (Quickstart):</strong> Pipeline visual com 4 cards interativos (Extração de Requisitos, PROJECT.md, ARCHITECTURE.md, CURRENT_STATE.md & ADR-0001) com streaming Server-Sent Events (/api/vault/events), spinners animados, badges de status dinâmicos e console técnico de telemetria live.</li>
                    <li><strong>Guarda Anti-Fechamento Involuntário & Confirmação de Saída:</strong> Proteção inteligente (#qsConfirmExitModal) contra fechamentos acidentais por clique fora ou ESC quando há progresso preenchido, com bypass automático na etapa de gravação em disco.</li>
                    <li><strong>Sincronização Dinâmica de Versão & Validação no Doctor:</strong> Resolução de versão automática e síncrona sem flicker durante o boot, acompanhada de checagem automatizada no <code>npm run doctor</code>.</li>
                </ul>
                <h4>🛡️ Corrigido</h4>
                <ul>
                    <li><strong>Resiliência de Escopo:</strong> Prevenção de ReferenceError em verificações de progresso do assistente.</li>
                    <li><strong>Paridade Estrita 100%:</strong> Sincronismo total entre Cockpit local e modo demonstração web.</li>
                </ul>
            </div>
        </div>

        <div class="changelog-release-card">
            <div class="changelog-release-header">
                <span class="changelog-release-badge">v1.2.0</span>
                <span class="changelog-release-date">19 de Outubro de 2026</span>
            </div>
            <div class="changelog-release-body">
                <h4>🚀 Adicionado</h4>
                <ul>
                    <li><strong>Suporte Nativo ao Google Gemini:</strong> Integração direta no AI Gateway (BYOK) para <code>gemini-3.8-flash</code>, <code>gemini-flash-latest</code>, <code>gemini-3.5-flash-lite</code> e modelos de alto contexto (1M+ tokens).</li>
                    <li><strong>Curadoria e Agrupamento Semântico Dinâmico:</strong> Classificação inteligente sem listas hardcoded em Recomendados, Rápidos e Modelos de Código/Abertos.</li>
                    <li><strong>Telemetria de Cota Esgotada (HTTP 429):</strong> Botão de IA na Topbar passa a pulsar em vermelho e modal exibe banner explicativo com opções de troca imediata.</li>
                    <li><strong>Badge de Versão & Notificação de Atualização:</strong> Modal "O que há de novo?" integrado com checagem automática de <code>git pull</code> e release notes.</li>
                    <li><strong>Pasta de Exemplos de Entrada:</strong> Inclusão de <code>docs/Exemplos/</code> com briefings reais para testes guiados.</li>
                </ul>
                <h4>🛡️ Corrigido</h4>
                <ul>
                    <li><strong>Desacoplamento Universal do Research Lab:</strong> Remoção de qualquer texto fixo da Groq em sínteses e relatórios. O Research Lab agora reflete o provedor ativo com total transparência.</li>
                    <li><strong>Invalidação de Cache no Servidor Node.js:</strong> Alterações de rotas e credenciais refletem instantaneamente no servidor sem reinício.</li>
                    <li><strong>Paridade Estrita 100%:</strong> Paridade completa entre o Cockpit local e o modo demonstração Web.</li>
                </ul>
            </div>
        </div>

        <div class="changelog-release-card">
            <div class="changelog-release-header">
                <span class="changelog-release-badge">v1.1.0</span>
                <span class="changelog-release-date">18 de Outubro de 2026</span>
            </div>
            <div class="changelog-release-body">
                <h4>🚀 Adicionado</h4>
                <ul>
                    <li><strong>Streaming HTTP 206 Partial Content:</strong> Reprodução fluida de mídias e vídeos no servidor nativo.</li>
                    <li><strong>Player Vertical 9:16:</strong> Bento Grid com modo cinematográfico e suspensão de GPU do Three.js.</li>
                    <li><strong>Quickstart Studio em 3 Atos:</strong> Briefing, Sabatina Técnica e Contratos de Governança guiados.</li>
                </ul>
            </div>
        </div>

        <div class="changelog-release-card">
            <div class="changelog-release-header">
                <span class="changelog-release-badge">v1.0.0</span>
                <span class="changelog-release-date">03 de Outubro de 2026</span>
            </div>
            <div class="changelog-release-body">
                <h4>🚀 Lançamento Inicial</h4>
                <ul>
                    <li>Fundação da governança e desenvolvimento com IA agnóstica.</li>
                    <li>Cockpit Web com Grafo 3D Orbital e Spotlight "Pergunte ao Cérebro" (<code>Ctrl+K</code>).</li>
                    <li>AI Gateway agnóstico com suporte inicial Groq, OpenAI, Anthropic, OpenRouter e Ollama.</li>
                    <li>Linter de integridade estrutural e contratos de governança (<code>npm run doctor</code>).</li>
                </ul>
            </div>
        </div>
    `;
}

window.openAskBrainModal = openAskBrainModal;
window.closeAskBrainModal = closeAskBrainModal;
window.handleAskBrainBackdrop = handleAskBrainBackdrop;
window.openAskBrainHelpModal = openAskBrainHelpModal;
window.closeAskBrainHelpModal = closeAskBrainHelpModal;
window.handleAskBrainHelpBackdrop = handleAskBrainHelpBackdrop;
window.askBrainFillQuery = askBrainFillQuery;
window.toggleMoreAskSources = toggleMoreAskSources;
window.copyAskBrainAnswer = copyAskBrainAnswer;
window.submitAskBrainQuery = submitAskBrainQuery;
window.openAskSourceDoc = openAskSourceDoc;
window.focusAskSourceGraph = focusAskSourceGraph;
window.toggleAskSourceSnippet = toggleAskSourceSnippet;
window.copyAskSourceCitation = copyAskSourceCitation;
window.setAskBrainCategory = setAskBrainCategory;
window.clearAskBrainRecents = clearAskBrainRecents;
window.adjustQsContractZoom = adjustQsContractZoom;
window.resetQsContractZoom = resetQsContractZoom;
window.applyQsContractZoom = applyQsContractZoom;
window.adjustEditorZoom = adjustEditorZoom;
window.resetEditorZoom = resetEditorZoom;
window.applyEditorZoom = applyEditorZoom;
window.initSystemVersionCheck = initSystemVersionCheck;
window.applyVersionToUI = applyVersionToUI;
window.openChangelogModal = openChangelogModal;
window.closeChangelogModal = closeChangelogModal;
window.copyGitPullCommand = copyGitPullCommand;
window.renderChangelogMarkdown = renderChangelogMarkdown;
window.renderChangelogFallback = renderChangelogFallback;

// Carrega status da IA e versão automaticamente após carregar a interface
function initAppBootHooks() {
    loadAiGatewayStatus();
    initQsContractZoomControls();
    initEditorZoomControls();
    initSystemVersionCheck();

    // Rastreia sessões para convite contextual na 3ª sessão caso ainda não tenha avaliado
    try {
        const count = Number(localStorage.getItem('asb_session_count') || 0) + 1;
        localStorage.setItem('asb_session_count', String(count));
        if (count >= 3) {
            checkAndTriggerStarToast(3500);
        }
    } catch (e) {}
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppBootHooks);
} else {
    initAppBootHooks();
}

// ═══════════════════════════════════════════════════
// GITHUB STAR FEEDBACK TOAST CONTROLLER
// ═══════════════════════════════════════════════════
function checkAndTriggerStarToast(delayMs = 1200) {
    try {
        const action = localStorage.getItem('asb_star_action');
        if (action === 'given' || action === 'already') {
            return;
        }
        const dismissedUntil = localStorage.getItem('asb_star_dismissed_until');
        if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
            return;
        }

        setTimeout(() => {
            const toast = document.getElementById('starFeedbackToast');
            if (toast) {
                toast.classList.remove('closing');
                toast.style.display = 'flex';
            }
        }, delayMs);
    } catch (e) {
        // localStorage indisponível ou bloqueado
    }
}

function dismissStarToast(mode = 'later') {
    const toast = document.getElementById('starFeedbackToast');
    if (!toast) return;

    toast.classList.add('closing');
    setTimeout(() => {
        toast.style.display = 'none';
        toast.classList.remove('closing');
    }, 240);

    try {
        if (mode === 'later') {
            // Relembra apenas após 14 dias
            localStorage.setItem('asb_star_dismissed_until', String(Date.now() + 14 * 86400000));
        }
    } catch (e) {}
}

function onStarToastAction(actionType) {
    try {
        localStorage.setItem('asb_star_action', actionType);
    } catch (e) {}
    dismissStarToast('done');
}

window.checkAndTriggerStarToast = checkAndTriggerStarToast;
window.dismissStarToast = dismissStarToast;
window.onStarToastAction = onStarToastAction;





