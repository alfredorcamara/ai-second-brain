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

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const name = entry.name;
            if (name.startsWith('.') && name !== '.agents') continue;
            if (name === 'node_modules' || name === '.git') continue;

            const fullPath = path.join(currentDir, name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (name.toLowerCase().endsWith('.md')) {
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
            }
        }
    }

    walk(rootDir);

    // Build Navigation Sections
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

    // Sort items alphabetically or logically
    sectionDefs.forEach(s => {
        if (s.id !== 'overview') {
            s.badge = s.items.length;
            s.items.sort((a, b) => a.path.localeCompare(b.path));
        }
    });

    const activeSections = sectionDefs.filter(s => s.items.length > 0);

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

        // Connect to its category hub
        if (hub) {
            graphEdges.push({ from: hub.id, to: node.id });
        } else {
            graphEdges.push({ from: 'brain', to: node.id });
        }
    });

    // Detect Cross-file links
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
        projectsCount: files.filter(f => f.category === 'projects').length,
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
