/**
 * AI SECOND BRAIN — Vault Scanner
 * Recursively scans the workspace for all markdown files and builds:
 * 1. File index with content and metadata
 * 2. Section hierarchy for navigation
 * 3. Graph nodes & edges for the 3D Neural Planet
 * 4. Cross-document links and mentions
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to sanitize paths with forward slashes
function normalizePath(p) {
    return p.replace(/\\/g, '/');
}

// Icon mapping based on category/filename
function getIconForFile(relPath, title, category) {
    const p = normalizePath(relPath).toLowerCase();
    const clean = p.startsWith('.agents/') ? p.slice('.agents/'.length) : p;

    if (p.includes('gemini.md') || p.includes('readme.md')) return '🧠';
    if (p.includes('/actionable/') || p.includes('actionable')) return '🛠️';
    if (p.includes('/research/') && p.includes('/knowledge/')) return '📘';
    if (p.includes('/research/') || p.includes('research')) return '🔬';
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

function getCategoryForFile(relPath) {
    const p = normalizePath(relPath).toLowerCase();
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

function extractTitle(content, fallbackName) {
    // 1. Try YAML frontmatter
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fmMatch) {
        const titleMatch = fmMatch[1].match(/(?:name|title):\s*([^\r\n]+)/i);
        if (titleMatch) return titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
    }
    // 2. Try first H1
    const h1Match = content.match(/^#\s+([^\r\n]+)/m);
    if (h1Match) return h1Match[1].trim();

    // 3. Fallback to filename without .md
    return fallbackName.replace(/\.md$/i, '');
}

function extractLinks(content) {
    const links = new Set();
    // [[wikilinks]]
    const wikiMatches = content.matchAll(/\[\[(.*?)\]\]/g);
    for (const m of wikiMatches) {
        links.add(m[1].trim().toLowerCase());
    }
    // [text](target.md)
    const mdMatches = content.matchAll(/\[(?:.*?)\]\((.*?\.md.*?)\)/g);
    for (const m of mdMatches) {
        const clean = m[1].split('#')[0].trim().toLowerCase();
        links.add(clean);
    }
    return Array.from(links);
}

function scanVault(rootDir = ROOT_DIR) {
    const files = [];
    const visitedDirs = new Set();
    const ignoredFolders = new Set(['node_modules', '.git', 'bin', 'obj', 'dist', 'build', 'vendor', '.vs', '.vscode']);

    function walk(currentDir) {
        try {
            const canonical = fs.realpathSync(currentDir);
            if (visitedDirs.has(canonical)) return;
            visitedDirs.add(canonical);
        } catch (e) {
            return;
        }

        let entries = [];
        try {
            entries = fs.readdirSync(currentDir, { withFileTypes: true });
        } catch (e) {
            return;
        }

        for (const entry of entries) {
            const name = entry.name;
            if (name.startsWith('.') && name !== '.agents') continue;
            if (ignoredFolders.has(name.toLowerCase())) continue;

            const fullPath = path.join(currentDir, name);
            let isDirectory = entry.isDirectory();
            if (!isDirectory && entry.isSymbolicLink()) {
                try {
                    isDirectory = fs.statSync(fullPath).isDirectory();
                } catch (e) {
                    isDirectory = false;
                }
            }

            if (isDirectory) {
                walk(fullPath);
            } else if (name.toLowerCase().endsWith('.md')) {
                try {
                    const relPath = normalizePath(path.relative(rootDir, fullPath));
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const stat = fs.statSync(fullPath);
                    const title = extractTitle(content, name);
                    const category = getCategoryForFile(relPath);
                    const icon = getIconForFile(relPath, title, category);
                    const outgoingLinks = extractLinks(content);

                    files.push({
                        id: relPath.replace(/[^a-zA-Z0-9_-]/g, '_'),
                        path: relPath,
                        name: name,
                        title: title,
                        category: category,
                        icon: icon,
                        size: stat.size,
                        mtime: stat.mtimeMs,
                        outgoingLinks: outgoingLinks,
                        content: content
                    });
                } catch (e) {
                    // Ignora arquivos ilegíveis
                }
            }
        }
    }

    walk(rootDir);

    // Build Navigation Sections
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
                // Arquivo na raiz de projects/ (ex: projects/README.md)
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
        const researchFilesMap = new Map(); // slug -> []
        const otherFoldersMap = new Map(); // folderName -> []

        let mainProjectPath = `projects/${projName}/PROJECT.md`;

        pFiles.forEach(f => {
            const parts = f.path.split('/');
            // parts: ['projects', projName, ...]
            if (parts.length === 3) {
                // Arquivo direto na raiz do projeto
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

        // Ordena arquivos de governança na raiz
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

        // 1. Subpasta de BACKUPS
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

        // 2. Subpastas de RESEARCH (Laboratório de Pesquisa)
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

                // Ordena os arquivos da pesquisa: OVERVIEW.md primeiro, depois por número (01, 02, ...), depois path
                rFiles.sort((a, b) => {
                    if (a.name.toLowerCase() === 'overview.md') return -1;
                    if (b.name.toLowerCase() === 'overview.md') return 1;
                    const numA = (a.name.match(/^(\d+)/) || [])[1];
                    const numB = (b.name.match(/^(\d+)/) || [])[1];
                    if (numA && numB) {
                        return parseInt(numA, 10) - parseInt(numB, 10);
                    }
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

            // Agrupa todas as pesquisas sob a pasta RESEARCH
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

        // 3. Outras subpastas genéricas (ex: DECISIONS, MEMORY, docs, etc.)
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

    // Configura a seção de Projetos estruturada em árvore
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
        // O badge mostra o número REAL de projetos, não de arquivos
        projectsSec.badge = projectGroups.size;
    }

    // Sort items alphabetically or logically in other sections
    sectionDefs.forEach(s => {
        if (s.id !== 'overview' && s.id !== 'projects') {
            s.badge = s.items.length;
            s.items.sort((a, b) => a.path.localeCompare(b.path));
        }
    });

    const activeSections = sectionDefs.filter(s => s.items.length > 0 || (s.id === 'projects' && (projectsGuideItem || projectGroups.size > 0)));

    // Build Graph Nodes & Edges
    const graphNodes = [
        { id: 'brain', label: 'AI Second Brain', group: 'core', size: 28, icon: '🧠', path: 'dashboard' }
    ];

    const graphEdges = [];
    const nodeIds = new Set(['brain']);

    // Group hubs (anchors for planetary continents)
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
        const hasFiles = files.some(f => f.category === cat);
        if (hasFiles) {
            graphNodes.push({
                ...hub,
                path: cat
            });
            nodeIds.add(hub.id);
            graphEdges.push({ from: 'brain', to: hub.id });
        }
    });

    // Add Project Hubs (Galaxy clusters for each project)
    const projectSubHubs = new Map();
    projectGroups.forEach((group, projName) => {
        const pHubId = `hub_proj_${projName}`;
        const pNode = {
            id: pHubId,
            label: projName,
            group: 'projects',
            size: 22,
            icon: '🚀',
            path: group.path
        };
        graphNodes.push(pNode);
        nodeIds.add(pHubId);
        projectSubHubs.set(projName, pHubId);

        // Conecta ao hub geral de projetos
        graphEdges.push({ from: 'hub-projects', to: pHubId });
    });

    // Add each file as a 3D Node
    files.forEach(f => {
        const hub = categoryHubs[f.category];
        const node = {
            id: f.id,
            label: f.title,
            group: f.category,
            size: f.size > 2000 ? 12 : 9,
            icon: f.icon,
            path: f.path
        };
        graphNodes.push(node);
        nodeIds.add(node.id);

        // Se for arquivo de um projeto específico, orbita o nó central do projeto
        if (f.category === 'projects' && f.path.startsWith('projects/')) {
            const parts = f.path.split('/');
            if (parts.length > 2) {
                const projName = parts[1];
                const pHubId = projectSubHubs.get(projName);
                if (pHubId) {
                    graphEdges.push({ from: pHubId, to: node.id });
                    return;
                }
            }
        }

        // Connect to its category hub
        if (hub) {
            graphEdges.push({ from: hub.id, to: node.id });
        } else {
            graphEdges.push({ from: 'brain', to: node.id });
        }
    });

    // Detect Cross-file and Inter-project links
    files.forEach(f => {
        files.forEach(target => {
            if (f.id === target.id) return;
            const targetName = path.basename(target.path, '.md').toLowerCase();
            const targetRel = target.path.toLowerCase();

            const isLinked = f.outgoingLinks.some(l => l.includes(targetName) || l.includes(targetRel));
            const isMentioned = f.content.toLowerCase().includes(targetName) && targetName.length > 5;

            if (isLinked || isMentioned) {
                graphEdges.push({ from: f.id, to: target.id });
            }
        });
    });

    // Conecta automaticamente os projetos às regras essenciais de governança
    projectSubHubs.forEach((pHubId, projName) => {
        files.forEach(f => {
            if (f.category === 'rules' && (f.path.includes('01-ai-decision') || f.path.includes('03-security'))) {
                graphEdges.push({ from: pHubId, to: f.id });
            }
        });
    });

    // Pontes inter-projeto: se houver mais de um projeto, conecta seus hubs como constelações irmãs
    const projHubKeys = Array.from(projectSubHubs.values());
    for (let i = 0; i < projHubKeys.length - 1; i++) {
        graphEdges.push({ from: projHubKeys[i], to: projHubKeys[i + 1] });
    }

    // Group Colors
    const groupColors = {
        core: { fill: '#6366f1', stroke: '#818cf8', glow: 'rgba(99, 102, 241, 0.4)' },
        rules: { fill: '#f59e0b', stroke: '#fbbf24', glow: 'rgba(245, 158, 11, 0.35)' },
        skills: { fill: '#10b981', stroke: '#34d399', glow: 'rgba(16, 185, 129, 0.35)' },
        agents: { fill: '#06b6d4', stroke: '#22d3ee', glow: 'rgba(6, 182, 212, 0.35)' },
        projects: { fill: '#8b5cf6', stroke: '#a78bfa', glow: 'rgba(139, 92, 246, 0.35)' },
        knowledge: { fill: '#3b82f6', stroke: '#60a5fa', glow: 'rgba(59, 130, 246, 0.35)' },
        decisions: { fill: '#14b8a6', stroke: '#2dd4bf', glow: 'rgba(20, 184, 166, 0.35)' },
        memory: { fill: '#ec4899', stroke: '#f472b6', glow: 'rgba(236, 72, 153, 0.35)' },
        templates: { fill: '#f97316', stroke: '#fb923c', glow: 'rgba(249, 115, 22, 0.35)' },
        docs: { fill: '#06b6d4', stroke: '#22d3ee', glow: 'rgba(6, 182, 212, 0.35)' }
    };

    const stats = {
        totalFiles: files.length,
        rulesCount: files.filter(f => f.category === 'rules').length,
        skillsCount: files.filter(f => f.category === 'skills').length,
        projectsCount: projectGroups.size,
        knowledgeCount: files.filter(f => f.category === 'knowledge').length,
        decisionsCount: files.filter(f => f.category === 'decisions').length,
        memoryCount: files.filter(f => f.category === 'memory').length,
        templatesCount: files.filter(f => f.category === 'templates').length,
        docsCount: files.filter(f => f.category === 'docs').length,
        totalNodes: graphNodes.length,
        totalEdges: graphEdges.length
    };

    return {
        timestamp: Date.now(),
        files,
        sections: activeSections,
        graphNodes,
        graphEdges,
        groupColors,
        stats
    };
}

// If executed directly, output vault-data.js
if (require.main === module) {
    const vault = scanVault();
    const outputPath = path.resolve(__dirname, '../docs/brain-ui/vault-data.js');
    const jsContent = `// ═══════════════════════════════════════════════════\n// AI SECOND BRAIN — Dynamic Vault Snapshot\n// Auto-generated: ${new Date().toISOString()}\n// ═══════════════════════════════════════════════════\n\nwindow.VAULT_SNAPSHOT = ${JSON.stringify(vault, null, 2)};\n`;

    fs.writeFileSync(outputPath, jsContent, 'utf-8');
    console.log('✅ Vault Snapshot successfully generated at:', outputPath);
    console.log('📊 Stats:', vault.stats);
}

module.exports = { scanVault };
