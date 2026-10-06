// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Hierarchical Solar System Builder
// Transforma a lista plana de arquivos do Vault em uma
// árvore real de pastas para o Grafo Neural 3D:
//   ☀️ Sol      = raiz (Cérebro global ou Projeto)
//   🪐 Planetas = pastas de 1º nível
//   🌙 Luas     = subpastas
//   🛰️ Satélites = arquivos .md (ligados SOMENTE à sua pasta)
// Layout 100% determinístico (sem Math.random): camadas por
// profundidade + setores angulares proporcionais ao volume.
// ═══════════════════════════════════════════════════

(function () {
    'use strict';

    // Paleta semântica padrão original (imutável para reset)
    const DEFAULT_PALETTE = {
        'h-root':       { fill: '#8b5cf6', stroke: '#c4b5fd', glow: 'rgba(139, 92, 246, 0.45)', label: 'Sol central / Projeto' },
        'h-contract':   { fill: '#a78bfa', stroke: '#ddd6fe', glow: 'rgba(167, 139, 250, 0.4)', label: 'Contratos e Raiz' },
        'h-folder':     { fill: '#6366f1', stroke: '#a5b4fc', glow: 'rgba(99, 102, 241, 0.4)',  label: 'Subpastas' },
        'h-projects':   { fill: '#7c3aed', stroke: '#c4b5fd', glow: 'rgba(124, 58, 237, 0.4)',  label: 'Projetos' },
        'h-research':   { fill: '#06b6d4', stroke: '#67e8f9', glow: 'rgba(6, 182, 212, 0.4)',   label: 'Research Lab' },
        'h-actionable': { fill: '#10b981', stroke: '#6ee7b7', glow: 'rgba(16, 185, 129, 0.4)',  label: 'Acionável (actionable)' },
        'h-knowledge':  { fill: '#f59e0b', stroke: '#fcd34d', glow: 'rgba(245, 158, 11, 0.4)',  label: 'Conhecimento (knowledge)' },
        'h-memory':     { fill: '#ec4899', stroke: '#f9a8d4', glow: 'rgba(236, 72, 153, 0.4)',  label: 'Memória' },
        'h-decisions':  { fill: '#f97316', stroke: '#fdba74', glow: 'rgba(249, 115, 22, 0.4)',  label: 'Decisões' },
        'h-backups':    { fill: '#64748b', stroke: '#cbd5e1', glow: 'rgba(100, 116, 139, 0.4)', label: 'Backups' },
        'h-rules':      { fill: '#ef4444', stroke: '#fca5a5', glow: 'rgba(239, 68, 68, 0.4)',   label: 'Regras' },
        'h-skills':     { fill: '#84cc16', stroke: '#bef264', glow: 'rgba(132, 204, 22, 0.4)',  label: 'Skills' },
        'h-agents':     { fill: '#14b8a6', stroke: '#5eead4', glow: 'rgba(20, 184, 166, 0.4)',  label: 'Agentes / Plugins' },
        'h-kb':         { fill: '#3b82f6', stroke: '#93c5fd', glow: 'rgba(59, 130, 246, 0.4)',  label: 'Knowledge Base' },
        'h-templates':  { fill: '#eab308', stroke: '#fde047', glow: 'rgba(234, 179, 8, 0.4)',   label: 'Templates' },
        'h-docs':       { fill: '#e879f9', stroke: '#f5d0fe', glow: 'rgba(232, 121, 249, 0.4)', label: 'Documentação' }
    };

    // Paleta de trabalho mutável
    const HIERARCHY_PALETTE = {};
    for (const [k, v] of Object.entries(DEFAULT_PALETTE)) {
        HIERARCHY_PALETTE[k] = { ...v };
    }

    const DYNAMIC_PALETTE_COLORS = [
        '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316', 
        '#3b82f6', '#8b5cf6', '#14b8a6', '#84cc16', '#eab308',
        '#d946ef', '#6366f1', '#0ea5e9', '#22c55e', '#ef4444'
    ];

    function pickDynamicColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
        return DYNAMIC_PALETTE_COLORS[Math.abs(hash) % DYNAMIC_PALETTE_COLORS.length];
    }

    // Carrega cores customizadas salvas pelo usuário no localStorage
    function applyUserCustomColors() {
        try {
            const raw = localStorage.getItem('ai_second_brain_graph_colors');
            if (!raw) return;
            const saved = JSON.parse(raw);
            for (const [k, hex] of Object.entries(saved)) {
                if (HIERARCHY_PALETTE[k]) {
                    HIERARCHY_PALETTE[k].fill = hex;
                    HIERARCHY_PALETTE[k].stroke = hex;
                } else {
                    HIERARCHY_PALETTE[k] = {
                        fill: hex,
                        stroke: hex,
                        glow: hex + '66',
                        label: k.replace(/^h-dir-|^h-/, '').replace(/[-_]/g, ' ')
                    };
                }
            }
        } catch (e) {}
    }
    applyUserCustomColors();

    function resetToDefaultColors() {
        try {
            localStorage.removeItem('ai_second_brain_graph_colors');
        } catch (e) {}
        for (const k of Object.keys(HIERARCHY_PALETTE)) {
            if (DEFAULT_PALETTE[k]) {
                HIERARCHY_PALETTE[k].fill = DEFAULT_PALETTE[k].fill;
                HIERARCHY_PALETTE[k].stroke = DEFAULT_PALETTE[k].stroke;
                HIERARCHY_PALETTE[k].glow = DEFAULT_PALETTE[k].glow;
            } else if (k.startsWith('h-dir-')) {
                const c = pickDynamicColor(k);
                HIERARCHY_PALETTE[k].fill = c;
                HIERARCHY_PALETTE[k].stroke = c;
                HIERARCHY_PALETTE[k].glow = c + '66';
            }
        }
    }

    const FOLDER_ICONS = {
        'h-root': '🚀', 'h-projects': '📁', 'h-research': '🔬', 'h-actionable': '🎯',
        'h-knowledge': '📚', 'h-memory': '🧮', 'h-decisions': '⚖️', 'h-backups': '📦',
        'h-rules': '📏', 'h-skills': '⚡', 'h-agents': '🤖', 'h-kb': '📚',
        'h-templates': '📋', 'h-docs': '📖', 'h-folder': '📂', 'h-contract': '📄'
    };

    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

    /**
     * Classifica um caminho (segmentos completos a partir da raiz do Vault)
     * pela pasta semântica mais profunda que o contém ou cria uma categoria dinâmica.
     */
    function classify(fullSegs, isFile) {
        const folderSegs = isFile ? fullSegs.slice(0, -1) : fullSegs;
        for (let i = folderSegs.length - 1; i >= 0; i--) {
            const s = folderSegs[i].toLowerCase();
            const above = folderSegs.slice(0, i).map(x => x.toLowerCase());
            if (s === 'actionable') return 'h-actionable';
            if (s === 'knowledge') return above.includes('research') ? 'h-knowledge' : 'h-kb';
            if (s === 'research') return 'h-research';
            if (s === 'memory' || s === 'sessions') return 'h-memory';
            if (s === 'decisions') return 'h-decisions';
            if (s === 'backups') return 'h-backups';
            if (s === 'rules') return 'h-rules';
            if (s === 'skills') return 'h-skills';
            if (s === 'agents' || s === 'plugins' || s === '.agents') return 'h-agents';
            if (s === 'templates') return 'h-templates';
            if (s === 'docs') return 'h-docs';
            if (s === 'projects') {
                return i < folderSegs.length - 1 ? 'h-contract' : 'h-projects';
            }
        }

        // Se for uma pasta personalizada ou subpasta criada pelo usuário:
        if (folderSegs.length >= 3 && folderSegs[0].toLowerCase() === 'projects') {
            const customDir = folderSegs[2];
            const key = `h-dir-${customDir.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            if (!HIERARCHY_PALETTE[key]) {
                const c = pickDynamicColor(key);
                HIERARCHY_PALETTE[key] = {
                    fill: c,
                    stroke: c,
                    glow: c + '66',
                    label: customDir.charAt(0).toUpperCase() + customDir.slice(1).replace(/[-_]/g, ' ')
                };
            }
            return key;
        } else if (folderSegs.length >= 1 && folderSegs[0].toLowerCase() !== 'projects') {
            const customDir = folderSegs[0];
            const key = `h-dir-${customDir.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            if (!HIERARCHY_PALETTE[key]) {
                const c = pickDynamicColor(key);
                HIERARCHY_PALETTE[key] = {
                    fill: c,
                    stroke: c,
                    glow: c + '66',
                    label: customDir.charAt(0).toUpperCase() + customDir.slice(1).replace(/[-_]/g, ' ')
                };
            }
            return key;
        }

        return isFile ? 'h-contract' : 'h-folder';
    }

    // Rotaciona a direção `dir` em `ang` radianos ao redor de um eixo perpendicular definido por `az`
    function coneDirection(dir, ang, az) {
        const up = Math.abs(dir.y) > 0.92 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
        // u = normalize(dir × up)
        let ux = dir.y * up.z - dir.z * up.y;
        let uy = dir.z * up.x - dir.x * up.z;
        let uz = dir.x * up.y - dir.y * up.x;
        const ul = Math.hypot(ux, uy, uz) || 1;
        ux /= ul; uy /= ul; uz /= ul;
        // v = dir × u
        const vx = dir.y * uz - dir.z * uy;
        const vy = dir.z * ux - dir.x * uz;
        const vz = dir.x * uy - dir.y * ux;

        const ca = Math.cos(ang), sa = Math.sin(ang);
        const cz = Math.cos(az), sz = Math.sin(az);
        const x = dir.x * ca + (ux * cz + vx * sz) * sa;
        const y = dir.y * ca + (uy * cz + vy * sz) * sa;
        const z = dir.z * ca + (uz * cz + vz * sz) * sa;
        const l = Math.hypot(x, y, z) || 1;
        return { x: x / l, y: y / l, z: z / l };
    }

    /**
     * Constrói nós + arestas hierárquicas.
     * @param {Array} files  Arquivos do Vault ({ id, path, name, title, icon, size })
     * @param {Object} opts  { rootId, rootLabel, rootIcon, rootPath, rootPrefix, rootSize, fileLabel: 'name'|'title', rMin, rMax }
     */
    function buildHierarchyGraph(files, opts) {
        opts = opts || {};
        const prefix = opts.rootPrefix || '';
        const rootId = opts.rootId || 'root';
        const fileLabel = opts.fileLabel || 'name';

        const root = {
            id: rootId,
            label: opts.rootLabel || 'Root',
            icon: opts.rootIcon || '☀️',
            path: opts.rootPath || '',
            group: 'h-root',
            size: opts.rootSize || 30,
            isCentral: true,
            isFolder: true,
            hkind: 'root',
            depth: 0,
            parentId: null
        };

        const nodes = [root];
        const map = new Map([[rootId, root]]);
        const edges = [];
        const children = new Map([[rootId, []]]);

        function addChild(parentId, node) {
            if (!children.has(parentId)) children.set(parentId, []);
            children.get(parentId).push(node);
            children.set(node.id, children.get(node.id) || []);
        }

        function ensureFolder(relSegs) {
            if (relSegs.length === 0) return rootId;
            const rel = relSegs.join('/');
            const id = `dir:${prefix}${rel}`;
            if (map.has(id)) return id;

            const parentId = ensureFolder(relSegs.slice(0, -1));
            const fullSegs = (prefix + rel).split('/').filter(Boolean);
            const name = relSegs[relSegs.length - 1];

            const isProjectFolder = fullSegs.length === 2 && fullSegs[0].toLowerCase() === 'projects';
            const isResearchTopic = fullSegs.length >= 2 && fullSegs[fullSegs.length - 2].toLowerCase() === 'research';
            const group = isProjectFolder ? 'h-root' : classify(fullSegs, false);

            const node = {
                id,
                label: isProjectFolder ? name : `${name}/`,
                icon: isProjectFolder ? '🚀' : (isResearchTopic ? '🧪' : (FOLDER_ICONS[group] || '📂')),
                path: prefix + rel,
                group,
                isFolder: true,
                hkind: isProjectFolder ? 'project' : 'folder',
                depth: relSegs.length,
                parentId
            };
            map.set(id, node);
            nodes.push(node);
            addChild(parentId, node);
            edges.push({ from: parentId, to: id, hier: true });
            return id;
        }

        const scoped = (files || []).filter(f => f && f.path && f.path.startsWith(prefix));
        scoped.sort((a, b) => a.path.localeCompare(b.path));

        for (const f of scoped) {
            const rel = f.path.slice(prefix.length);
            const segs = rel.split('/').filter(Boolean);
            if (segs.length === 0) continue;
            if (map.has(f.id)) continue;

            const parentId = ensureFolder(segs.slice(0, -1));
            const fullSegs = f.path.split('/').filter(Boolean);
            const node = {
                id: f.id,
                label: (fileLabel === 'title' ? (f.title || f.name) : (f.name || f.title)) || f.path,
                title: f.title,
                icon: f.icon || '📄',
                path: f.path,
                group: classify(fullSegs, true),
                size: (f.size || 0) > 2000 ? 7 : 6,
                isFolder: false,
                hkind: 'file',
                depth: segs.length,
                parentId
            };
            map.set(node.id, node);
            nodes.push(node);
            addChild(parentId, node);
            edges.push({ from: parentId, to: node.id, hier: true });
        }

        // ── Peso (nº de arquivos) de cada subárvore ──
        const weight = new Map();
        function computeWeight(node) {
            const kids = children.get(node.id) || [];
            let w = node.isFolder ? 0 : 1;
            for (const k of kids) w += computeWeight(k);
            if (node.isFolder && w === 0) w = 0.5;
            weight.set(node.id, w);
            node.childCount = kids.length;
            node.fileCount = node.isFolder ? Math.round(w) : 0;
            return w;
        }
        computeWeight(root);

        // ── Tamanho visual das pastas proporcional ao volume ──
        for (const n of nodes) {
            if (n.isFolder && !n.isCentral) {
                const w = weight.get(n.id) || 1;
                const base = n.depth === 1 ? 15 : 13;
                n.size = Math.min(22, Math.round(base + Math.log2(w + 1) * 1.8));
                if (n.hkind === 'project') n.size = Math.max(n.size, 19);
            }
        }

        // ── Layout radial 3D por profundidade (v2: casca dinâmica + constelações) ──
        // Apenas pastas definem as camadas; arquivos orbitam a própria pasta-mãe.
        const maxDepth = nodes.reduce((m, n) => (n.isFolder ? Math.max(m, n.depth) : m), 1);
        const rMin = opts.rMin || 110;
        // Casca cresce com o volume do grafo para evitar aglomeração
        const rMax = opts.rMax || Math.round(260 + Math.sqrt(nodes.length) * 10);
        const step = maxDepth > 1 ? Math.max(65, Math.min(100, (rMax - rMin) / (maxDepth - 1))) : 0;
        const radiusFor = d => (d === 0 ? 0 : rMin + (d - 1) * step);

        const FILE_ORBIT = 46;    // distância radial expandida para arborização neural orgânica
        const FILE_SPACING = 17;  // espaçamento lateral entre terminações sinápticas
        const SECTOR_PAD = 0.92;  // folga angular entre setores de pastas irmãs

        root.hpos = { x: 0, y: 0, z: 0 };

        function placeChildren(node, dir, cap) {
            const kids = (children.get(node.id) || []).slice()
                .sort((a, b) => (weight.get(b.id) - weight.get(a.id)) || a.label.localeCompare(b.label));
            if (kids.length === 0) return;
            const wParent = weight.get(node.id) || 1;
            const azOffset = node.depth * 1.3;
            const folders = kids.filter(k => k.isFolder);
            const files = kids.filter(k => !k.isFolder);

            // 1. Subpastas: cones proporcionais ao volume, com folga entre irmãs
            const nF = folders.length;
            folders.forEach((kid, i) => {
                const ang = nF === 1 ? cap * 0.25 : cap * 0.9 * Math.sqrt((i + 0.5) / nF);
                const az = i * GOLDEN_ANGLE + azOffset;
                const d = coneDirection(dir, ang, az);
                const r = radiusFor(kid.depth);
                kid.hpos = { x: d.x * r, y: d.y * r, z: d.z * r };

                const share = (weight.get(kid.id) || 1) / wParent;
                const kidCap = Math.max(0.1, Math.min(cap * 0.85, cap * Math.sqrt(share) * SECTOR_PAD));
                placeChildren(kid, d, kidCap);
            });

            // 2. Arquivos: "luas" em órbita compacta ao redor da própria pasta-mãe
            const nFi = files.length;
            if (nFi === 0) return;
            const parentR = radiusFor(node.depth);
            const orbitR = parentR + FILE_ORBIT;
            const parentSize = node.size || 14;
            const innerAng = (parentSize + 8) / orbitR; // não cobrir a pasta-mãe
            const outerAng = Math.min(Math.max(cap, innerAng * 1.6), innerAng + (FILE_SPACING * Math.sqrt(nFi)) / orbitR);
            files.forEach((kid, i) => {
                const ang = innerAng + (outerAng - innerAng) * Math.sqrt((i + 0.5) / nFi);
                const az = i * GOLDEN_ANGLE + azOffset + 0.6;
                const d = coneDirection(dir, ang, az);
                const r = orbitR + ((i % 3) - 1) * 7; // variação radial orgânica e determinística
                kid.hpos = { x: d.x * r, y: d.y * r, z: d.z * r };
            });
        }

        // Filhos diretos do Sol distribuídos sobre a esfera inteira (Fibonacci sphere)
        const top = (children.get(rootId) || []).slice()
            .sort((a, b) => (weight.get(b.id) - weight.get(a.id)) || a.label.localeCompare(b.label));
        const totalW = weight.get(rootId) || 1;
        const nTop = top.length;

        // Intercala pesados e leves para equilibrar a esfera
        const interleaved = [];
        for (let i = 0, j = nTop - 1; i <= j; i++, j--) {
            interleaved.push(top[i]);
            if (i !== j) interleaved.push(top[j]);
        }

        interleaved.forEach((kid, i) => {
            const t = nTop === 1 ? 0.5 : (i + 0.5) / nTop;
            const y = 1 - 2 * t;
            const rr = Math.sqrt(Math.max(0, 1 - y * y));
            const theta = i * GOLDEN_ANGLE;
            // Achata levemente os polos para manter o sistema em torno do equador
            const d = (function () {
                const x = Math.cos(theta) * rr, z = Math.sin(theta) * rr, yy = y * 0.78;
                const l = Math.hypot(x, yy, z) || 1;
                return { x: x / l, y: yy / l, z: z / l };
            })();
            const r = radiusFor(kid.depth);
            kid.hpos = { x: d.x * r, y: d.y * r, z: d.z * r };

            const share = (weight.get(kid.id) || 1) / totalW;
            const cap = Math.max(0.16, Math.min(1.15, Math.sqrt(share) * 1.6));
            placeChildren(kid, d, cap);
        });

        // ── Legenda (apenas grupos presentes) ──
        const used = new Set(nodes.map(n => n.group));
        const legend = Object.keys(HIERARCHY_PALETTE)
            .filter(k => used.has(k))
            .map(k => ({ key: k, label: HIERARCHY_PALETTE[k].label, fill: HIERARCHY_PALETTE[k].fill }));

        return { nodes, edges, colors: HIERARCHY_PALETTE, legend };
    }

    window.DEFAULT_PALETTE = DEFAULT_PALETTE;
    window.HIERARCHY_PALETTE = HIERARCHY_PALETTE;
    window.FOLDER_ICONS = FOLDER_ICONS;
    window.applyUserCustomColors = applyUserCustomColors;
    window.resetToDefaultColors = resetToDefaultColors;
    window.buildHierarchyGraph = buildHierarchyGraph;
})();
