// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Grafo Neural 3D (neurônio por pasta)
// Substitui graph.js mantendo o MESMO contrato público da classe
// BrainGraph (loadData, filtros, cores, botões de câmera, HUD, eventos).
//   🧠 Pasta   = neurônio (soma + núcleo orgânico + dendritos)
//   ✨ Arquivo = sinapse na ponta de um dendrito (clique abre o .md)
//   🔗 Pasta → subpasta = dendrito de ligação (destaca ao passar o mouse)
// Interação: arrastar qualquer sinapse/neurônio => efeito elástico.
// ═══════════════════════════════════════════════════
(function () {
    'use strict';

    const V3 = THREE.Vector3;
    const AB = {
        blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor
    };
    const S0 = 10, CY = [.3, .85, 1];   // amostras por dendrito / cor das referências
    const fmtSize = b => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : b >= 1024 ? Math.round(b / 1024) + ' KB' : b + ' B';
    const fmtAge = ms => { const d = ms / 864e5; return d < 1 / 24 ? 'agora há pouco' : d < 1 ? 'há ' + Math.round(d * 24) + ' h' : d < 60 ? 'há ' + Math.round(d) + (Math.round(d) === 1 ? ' dia' : ' dias') : 'há ' + Math.round(d / 30) + ' meses'; };
    const GOLD = '#ffc76b', BULB = '#e8b04a';
    const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
    const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const mix = (hex, to, k) => '#' + new THREE.Color(hex).lerp(new THREE.Color(to), k).getHexString();
    const rgb = hex => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    class BrainGraph {
        constructor(canvas, tooltipEl) {
            this.canvas = canvas;
            this.tooltip = tooltipEl;
            this.width = canvas.clientWidth || 800;
            this.height = canvas.clientHeight || 600;
            this.nodes = []; this.edges = []; this.nodeMap = new Map(); this.groupColors = {};
            this.parentOf = new Map();
            this.nodeStyle = 'neuron';
            this.showIcons = false;
            this.autoRotate = true;
            this.onCameraChange = null; this.onNodeClick = null; this.onNodeDblClick = null;
            this.hoveredNode = null; this.selectedNode = null;
            this.currentQuery = ''; this.currentCategory = null; this.highlightedCategory = null;
            this.searchLabelSet = new Set(); this.visSet = null;
            this.animFrame = null; this.time = 0; this.clock = new THREE.Clock();
            // câmera orbital própria
            this.th = .6; this.ph = 1.3; this.di = 200; this.dT = 200; this.defaultDist = 200;
            this.tgt = new V3(); this.tT = new V3(); this.anim = null;
            this.k = 1; this.M = []; this.E = []; this.N = []; this.leaves = []; this.hits = [];
            this.selLink = null; this.hovLink = null; this.litSet = null; this.lastSig = '';
            this.grab = null; this._down = null; this._mx = null; this._my = null; this._lastZp = -1;
            this.S = S0; this._results = []; this._ri = -1; this._ptrs = new Map(); this._pinch = null; this._fr = 0; this._slow = 0; this._nMatch = 0;
            this._initThree();
            this._setupEvents();
        }

        // ── Three.js ────────────────────────────────
        _initThree() {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(55, 1, .1, 4000);
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.renderer.setClearColor(0x000000, 0);   // fundo = CSS (gradiente espacial)
            this.canvas.style.touchAction = 'none';
            this.raycaster = new THREE.Raycaster();
            this.plane = new THREE.Plane(); this.tmp = new V3(); this.tmp2 = new V3(); this.tmp3 = new V3(); this.F = new V3();
            const dp = new Float32Array(2700);
            for (let i = 0; i < dp.length; i++) dp[i] = (Math.random() - .5) * (i % 3 === 1 ? 600 : 1000);
            const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
            this.dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 1.4, color: 0x9fb4ff, transparent: true, opacity: .55, depthWrite: false }));
            this.scene.add(this.dust);
            this.world = new THREE.Group(); this.scene.add(this.world);
            this._setupCanvas();
            if (window.ResizeObserver) {
                new ResizeObserver(() => this._setupCanvas()).observe(this.canvas);
            }
            window.addEventListener('resize', () => { this._sized = false; this._setupCanvas(); });
        }

        _setupCanvas() {
            let w = this.canvas.clientWidth;
            let h = this.canvas.clientHeight;
            if (!w || !h) {
                const r = this.canvas.getBoundingClientRect();
                w = Math.round(r.width);
                h = Math.round(r.height);
            }
            if (!w || !h) {
                w = window.innerWidth;
                h = window.innerHeight;
            }
            if (w === this.width && h === this.height && this._sized) return;
            this._sized = true;
            this.width = w;
            this.height = h;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height, false);
        }
        resize() { this._sized = false; this._setupCanvas(); }

        static G(c) {
            BrainGraph._g = BrainGraph._g || {};
            return BrainGraph._g[c] || (BrainGraph._g[c] = (() => {
                const k = document.createElement('canvas'); k.width = k.height = 128; const x = k.getContext('2d');
                const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
                g.addColorStop(0, '#fff'); g.addColorStop(.2, c); g.addColorStop(.55, c + '40'); g.addColorStop(1, c + '00');
                x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(k);
            })());
        }
        _spr(c, s, op) {
            const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: BrainGraph.G(c), ...AB, depthWrite: false, transparent: true, opacity: op === undefined ? 1 : op }));
            m.scale.set(s, s, 1); return m;
        }
        _label(text, h, col, left) {
            const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false }));
            s.userData.lb = { h, col, left }; s.center.set(left ? 0 : .5, left ? .5 : 0); s.renderOrder = 10;
            this._paint(s, text); return s;
        }
        _paint(s, text) {
            const { h, col, left } = s.userData.lb;
            const k = document.createElement('canvas'), x = k.getContext('2d'), f = '600 34px ui-sans-serif,system-ui,sans-serif';
            x.font = f; const w = Math.ceil(x.measureText(text).width) + (left ? 30 : 12);
            k.width = w; k.height = 52; x.font = f; x.shadowColor = '#04060d99'; x.shadowBlur = 5; x.fillStyle = col; x.fillText(text, left ? 26 : 6, 36);
            if (s.material.map) s.material.map.dispose();
            s.material.map = new THREE.CanvasTexture(k); s.material.needsUpdate = true;
            s.scale.set(w / 52 * h, h, 1);
        }
        _text(n, max) {
            let t = n.label || n.id || ''; if (t.length > max) t = t.slice(0, max - 1) + '…';
            return (this.showIcons && n.icon ? n.icon + ' ' : '') + t;
        }
        _col(group) { return (this.groupColors[group] && this.groupColors[group].fill) || '#8b5cf6'; }

        // ── Carga de dados ──────────────────────────
        _disposeWorld() {
            this.world.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.dispose) o.material.dispose(); });
            this.scene.remove(this.world); this.world = new THREE.Group(); this.scene.add(this.world);
            this.M = []; this.E = []; this.N = []; this.leaves = []; this.hits = []; this.pulses = [];
        }

        loadData(nodesIn, edgesIn, colors) {
            this._disposeWorld();
            this.nodes = nodesIn || []; this.edges = edgesIn || [];
            this.nodeMap = new Map(this.nodes.map(n => [n.id, n]));
            this.groupColors = {}; for (const k in (colors || {})) this.groupColors[k] = Object.assign({}, colors[k]);
            this.currentQuery = ''; this.currentCategory = null; this.highlightedCategory = null;
            this.searchLabelSet = new Set(); this.visSet = null;
            this.hoveredNode = this.selectedNode = null; this.selLink = this.hovLink = null; this.litSet = null; this.lastSig = '';
            this.grab = null;
            if (!this.nodes.length) return;

            const parentOf = new Map();
            for (const n of this.nodes) if (n.parentId) parentOf.set(n.id, n.parentId);
            for (const e of this.edges) if (e.from !== e.to && !parentOf.has(e.to)) parentOf.set(e.to, e.from);
            this.parentOf = parentOf;

            const neu = new Set(this.nodes.filter(n => n.isFolder || n.isCentral).map(n => n.id));
            if (!neu.size) neu.add(this.nodes[0].id);
            const folders = this.nodes.filter(n => neu.has(n.id));
            const root = folders.find(n => n.isCentral) || folders[0];
            const filesBy = new Map(folders.map(f => [f.id, []]));
            for (const n of this.nodes) {
                if (neu.has(n.id)) continue;
                let p = parentOf.get(n.id), g = 0; while (p && !neu.has(p) && g++ < 50) p = parentOf.get(p);
                filesBy.get(p && neu.has(p) ? p : root.id).push(n);
            }

            // ── layout compacto: usa a hierarquia (hpos) reduzida + relaxamento
            const geo = new Map();
            for (const f of folders) {
                const nf = filesBy.get(f.id).length, r = Math.min(4.5, 2 + .25 * nf) + (f === root ? .8 : 0);
                geo.set(f.id, { r, R: (r + 3 + Math.min(nf, 12) * .45) * 1.15, nf });
            }
            const pos = new Map(); let fi = 0;
            for (const f of folders) {
                let p;
                if (f === root) p = new V3();
                else if (f.hpos) p = new V3(f.hpos.x, f.hpos.y, f.hpos.z).multiplyScalar(.3);
                else { const y = 1 - ((fi++) + .5) / Math.max(folders.length - 1, 1) * 2, s = Math.sqrt(1 - y * y), a = fi * 2.4; p = new V3(Math.cos(a) * s, y * .6, Math.sin(a) * s).multiplyScalar(40); }
                pos.set(f.id, p);
            }
            const rp = mulberry(7);
            for (let it = 0; it < 70; it++) {
                for (let i = 0; i < folders.length; i++) for (let j = i + 1; j < folders.length; j++) {
                    const a = folders[i], b = folders[j], pa = pos.get(a.id), pb = pos.get(b.id);
                    const m = (geo.get(a.id).R + geo.get(b.id).R) * .72; let d = pa.distanceTo(pb);
                    if (d >= m) continue;
                    const dir = d < .01 ? new V3(rp() - .5, rp() - .5, rp() - .5).normalize() : pa.clone().sub(pb).multiplyScalar(1 / d), push = (m - d) * .3;
                    if (a !== root) pa.addScaledVector(dir, b === root ? push * 2 : push);
                    if (b !== root) pb.addScaledVector(dir, a === root ? -push * 2 : -push);
                }
                for (const f of folders) {
                    const pf = parentOf.get(f.id); if (f === root || !pf || !pos.has(pf)) continue;
                    const pa = pos.get(f.id), pb = pos.get(pf), tgt = (geo.get(f.id).R + geo.get(pf).R) * .8, d = pa.distanceTo(pb);
                    if (d > tgt * 1.35) pa.lerp(pb, (d - tgt * 1.35) / d * .15);
                }
            }
            let ext = 20; for (const p of pos.values()) ext = Math.max(ext, p.length());
            for (const g of geo.values()) ext = Math.max(ext, g.R);
            this.defaultDist = clamp((ext + 18) * 2.1, 130, 1100); this.k = Math.max(1, this.defaultDist / 110);
            this.th = .6; this.ph = 1.3; this.di = this.dT = this.defaultDist; this.tgt.set(0, 0, 0); this.tT.set(0, 0, 0); this.anim = null;

            // ── constrói neurônios
            const nbs = new Map();
            for (const f of folders) nbs.set(f.id, this._neuron(f, pos.get(f.id), filesBy.get(f.id), geo.get(f.id).r, f === root));
            this.N = [...nbs.values()];

            // ── ligações entre neurônios: hierarquia + vizinho mais próximo
            const near = (A, B) => { let b = [1e9]; for (const x of A.br) for (const y of B.br) { const d = x.p.distanceTo(y.p); if (d < b[0]) b = [d, x, y]; } return b; };
            const linked = new Set(), link = (A, B, w, bend, kind) => {
                const key = [A.node.id, B.node.id].sort().join('|'); if (linked.has(key)) return null; linked.add(key);
                const r = near(A, B), e = r[1] ? this._edge(r[1], r[2], w, w, A, .9, bend) : this._edge(A.so, B.so, w + .1, w + .1, A, .9, bend);
                e.link = 1; e.kind = kind; e.na = A; e.nb = B; return e;
            };
            for (const A of this.N) { const pf = parentOf.get(A.node.id), P = pf && nbs.get(pf); if (P && P !== A) A.up = link(A, P, .3, .35, 'hier'); }
            for (const A of this.N) {
                let best = null, bd = 1e9; for (const B of this.N) { if (A === B) continue; const d = A.so.p.distanceTo(B.so.p); if (d < bd) { bd = d; best = B; } }
                if (best && bd < (geo.get(A.node.id).R + geo.get(best.node.id).R) * 1.6) link(A, best, .2, .35, 'near');
            }
            // ── ligações REAIS entre documentos (links nos .md)
            const byBase = new Map();
            for (const l of this.leaves) { const b = this._base(l.file.path || l.file.label); if (!byBase.has(b)) byBase.set(b, []); byBase.get(b).push(l); }
            const seen = new Set(); let nref = 0;
            for (const l of this.leaves) for (const r of this._refs(l.file)) {
                const cand = byBase.get(this._base(r)); if (!cand) continue; const rl = r.toLowerCase();
                const t = cand.length > 1 ? (cand.find(c => { const cp = (c.file.path || '').toLowerCase(); return cp && (rl.endsWith(cp) || cp.endsWith(rl)); }) || cand[0]) : cand[0];
                if (t === l) continue; const key = [l.file.id, t.file.id].sort().join('|');
                if (seen.has(key) || nref >= 150) continue; seen.add(key); nref++;
                const e = this._edge(l, t, .12, .12, l.own, .9, .4); e.col = CY; e.link = 1; e.kind = 'ref'; l.nref++; t.nref++;
            }
            // ── recência (brilho ciano nas edições recentes)
            let mxm = 0; for (const l of this.leaves) mxm = Math.max(mxm, l.mtime || 0);
            const refT = Date.now() - mxm < 30 * 864e5 ? Date.now() : mxm;
            for (const l of this.leaves) {
                l.rec = l.mtime ? clamp(1 - (refT - l.mtime) / (3 * 864e5), 0, 1) : 0;
                if (l.rec > .05) { l.halo = this._spr('#8ff0ff', 3.4 * this.k, 0); this.world.add(l.halo); }
            }
            this.E.forEach((e, i) => { e.hid = i; });
            const S = this.S = this.E.length <= 400 ? S0 : this.E.length <= 1200 ? 7 : 5;

            // ── ribbons + pulsos
            const mk = () => {
                const n = this.E.length * (S + 1) * 2, g = new THREE.BufferGeometry(), ix = [];
                g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
                g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
                for (let e = 0; e < this.E.length; e++) for (let i = 0; i < S; i++) { const a = (e * (S + 1) + i) * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
                g.setIndex(ix);
                const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, ...AB, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
                m.frustumCulled = false; m.renderOrder = 1; this.world.add(m); return m;
            };
            this.mC = mk(); this.mH = mk(); this.mH.visible = this.E.length <= 1500;
            const np = Math.min(220, this.E.length * 2);
            this.pulses = Array.from({ length: np }, () => ({ e: this.E[this.E.length * Math.random() | 0], u: Math.random(), v: 1 + Math.random() }));
            this.pPos = new Float32Array(np * 3);
            const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(this.pPos, 3));
            this.pts = new THREE.Points(pg, new THREE.PointsMaterial({ map: BrainGraph.G('#fff1b8'), size: 1.5 * this.k, ...AB, transparent: true, depthWrite: false }));
            this.pts.frustumCulled = false; this.world.add(this.pts);
            for (const e of this.E) { e.vf = e.tv = 1; }
            this.setNodeStyle(this.nodeStyle);
            this._notifyCameraChange();
        }

        _mn(p, own, d) {
            const m = { p, cur: p.clone(), c: own.so ? own.so.p : p, d, out: [], ph: p.x * .35 + p.y * .3 + p.z * .4 + Math.random(), off: new V3(), vl: new V3(), own };
            this.M.push(m); return m;
        }
        _edge(a, b, w0, w1, own, br, bend) {
            const e = { a, b, w0, w1, col: own.ecol, br: br || 1, bend: new V3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize().multiplyScalar(bend), P: a.cur, C: b.cur, M: new V3(), ph: Math.random() * 6, k: 0, vf: 1, tv: 1, own, leaves: [] };
            this.E.push(e); a.out.push(e); return e;
        }

        _neuron(f, c, files, r, isRoot) {
            const rng = mulberry(hash(String(f.id))), rv = () => new V3(rng() - .5, rng() - .5, rng() - .5).normalize(), k = this.k;
            const col = this._col(f.group);
            const nb = { node: f, r, col, ecol: rgb(mix(GOLD, col, .3)), br: [], leaves: [], vf: 1, tv: 1, em: 1, sph: 0 };
            const so = this._mn(c.clone(), nb, 0); so.soma = 1; so.c = so.p; so.own = nb; nb.so = so; f.position = so.cur; nb.so.node = f;
            // visuais do soma
            const shell = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.ShaderMaterial({
                transparent: true, depthWrite: false, ...AB, uniforms: { t: { value: 0 }, v: { value: 1 } },
                vertexShader: 'uniform float t;varying vec3 N,W;void main(){vec3 p=position;p+=normal*(sin(p.x*1.6+t)*sin(p.y*1.9+t*1.1)*sin(p.z*1.7+t*.9)*.45+sin(p.x*3.1-t*.7)*sin(p.z*2.7+t*.8)*.18);vec4 m=modelViewMatrix*vec4(p,1.);N=normalize(normalMatrix*normal);W=normalize(-m.xyz);gl_Position=projectionMatrix*m;}',
                fragmentShader: 'uniform float v;varying vec3 N,W;void main(){float f=pow(1.-abs(dot(N,W)),1.8);gl_FragColor=vec4(mix(vec3(.55,.35,.08),vec3(1.,.82,.4),f)*(.3+.6*f)*v,(.15+.35*f)*v);}'
            }));
            shell.scale.set(1 + rng() * .2, .85 + rng() * .2, .9 + rng() * .2);
            const nm = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false, ...AB, uniforms: { t: { value: 0 }, v: { value: 1 }, c: { value: new THREE.Color(col) } },
                vertexShader: 'uniform float t;varying vec3 N,W,P;void main(){vec3 p=position;p+=normal*(sin(p.x*3.+t)*sin(p.y*3.4+t*1.2)*sin(p.z*3.1+t*.8)*.38+sin(p.x*6.-t*1.5+p.y*4.)*.1);P=p;vec4 m=modelViewMatrix*vec4(p,1.);N=normalize(normalMatrix*normal);W=normalize(-m.xyz);gl_Position=projectionMatrix*m;}',
                fragmentShader: 'uniform float t,v;uniform vec3 c;varying vec3 N,W,P;void main(){float f=pow(1.-abs(dot(N,W)),1.5);float s=.5+.5*sin(P.x*7.+P.y*5.+t*2.)*sin(P.z*6.-t*1.5+P.y*3.);gl_FragColor=vec4((c*(.3+.5*s)+vec3(f*.2))*v,(.2+.3*f+.15*s)*v);}'
            });
            const nu = new THREE.Group(), o = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 4), nm), n2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), nm);
            o.scale.setScalar(r * .62); n2.scale.set(r * .34, r * .28, r * .4); n2.rotation.set(1, 2, 0); nu.add(o, n2);
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(r * .8, 24, 16), new THREE.MeshBasicMaterial({ color: col })); sphere.visible = false;
            const g1 = this._spr(col, r * 3.2, .4), g2 = this._spr('#ffb940', r * 6, .25);
            const lb = this._label(this._text(f, 26), 1.9 * k, '#ffe7b0', false);
            g1.userData = lb.userData.hit = { node: f, kind: 'soma', mn: so };
            lb.userData.hit = g1.userData; g1.userData.lb = undefined;
            Object.assign(nb, { shell, nu, nm, sphere, g1, g2, lb, ly: r * 1.5 + 1.2 * k });
            this.world.add(shell, nu, sphere, g1, g2, lb); this.hits.push(g1, lb);
            // dendritos
            const wd = d => .55 * Math.pow(.62, d);
            const grow = (par, dir, g, d, len) => {
                if (g.length === 1) {
                    const l = this._mn(par.p.clone().addScaledVector(dir, len * (1 + rng() * .5)), nb, d); l.file = g[0];
                    const e = this._edge(par, l, wd(d - 1), .05, nb, 1, .6); l.pe = e; e.leaves = [l]; nb.br.push(par); this._leaf(nb, l, g[0]); return [l];
                }
                const b = this._mn(par.p.clone().addScaledVector(dir, len), nb, d), e = this._edge(par, b, wd(d - 1), wd(d), nb, 1, .6); b.pe = e; nb.br.push(b);
                const h = Math.ceil(g.length / 2), L = [];
                for (const s of [g.slice(0, h), g.slice(h)]) if (s.length) L.push(...grow(b, dir.clone().addScaledVector(rv(), 1.2).normalize(), s, d + 1, len * (.7 + rng() * .2)));
                e.leaves = L; return L;
            };
            const nf = files.length;
            if (nf) {
                const kk = Math.min(nf, Math.max(3, Math.round(Math.sqrt(nf) * 1.8))), gr = Array.from({ length: kk }, () => []);
                files.forEach((fl, q) => gr[q % kk].push(fl));
                const off = rng() * 6;
                gr.forEach((g, q) => { const y = 1 - (q + .5) / kk * 2, s = Math.sqrt(1 - y * y), a = q * 2.4 + off; grow(so, new V3(Math.cos(a) * s, y, Math.sin(a) * s), g, 1, r + 3 + Math.min(nf, 12) * .45); });
            }
            if (!nb.br.length) nb.br.push(so);
            nb.br = [...new Set(nb.br)].filter(x => x !== so); if (!nb.br.length) nb.br.push(so);
            return nb;
        }

        _leaf(nb, l, fl) {
            const k = this.k, tint = mix(BULB, this._col(fl.group), .45);
            l.tint = tint; l.vf = l.tv = 1; l.em = 1; l.lo = 0; l.nref = 0;
            const mt = this._meta(fl); l.bytes = mt.bytes; l.mtime = mt.mtime; l.sz = 1 + .35 * clamp((Math.log10(l.bytes + 1) - 3) / 2, -.5, 1);
            l.bulb = this._spr(tint, 1.7 * k); l.lab = this._label(this._text(fl, 30), .95 * k, '#fff4d6', true);
            l.bulb.userData = l.lab.userData.hit = { node: fl, kind: 'file', mn: l };
            l.lab.userData.hit = l.bulb.userData;
            fl.position = l.cur; nb.leaves.push(l); this.leaves.push(l);
            this.world.add(l.bulb, l.lab); this.hits.push(l.bulb, l.lab);
        }

        // ── Estilo / ícones ─────────────────────────
        setNodeStyle(style) {
            this.nodeStyle = style === 'sphere' ? 'sphere' : 'neuron';
            const sp = this.nodeStyle === 'sphere';
            for (const n of this.N) { n.shell.visible = n.nu.visible = !sp; n.sphere.visible = sp; }
            if (this.pts) this.pts.visible = !sp;
        }
        toggleNodeStyle() { const n = this.nodeStyle === 'neuron' ? 'sphere' : 'neuron'; this.setNodeStyle(n); return n; }
        setShowIcons(show) {
            this.showIcons = Boolean(show);
            for (const n of this.N) this._paint(n.lb, this._text(n.node, 26));
            for (const l of this.leaves) this._paint(l.lab, this._text(l.file, 30));
        }

        // ── Câmera / HUD ────────────────────────────
        _dollyTo(d) { this.dT = clamp(d, 22, this.defaultDist * 3.5); }
        zoomIn() { this._dollyTo(this.dT * .82); this._notifyCameraChange(); }
        zoomOut() { this._dollyTo(this.dT * 1.22); this._notifyCameraChange(); }
        rotateBy(r) { this.th += r; }
        toggleAutoOrbit() { this.autoRotate = !this.autoRotate; this._notifyCameraChange(); return this.autoRotate; }
        _flyTo(th, ph, di, tgt) { this.anim = { t: 0, a: { th: this.th, ph: this.ph, di: this.di, tg: this.tgt.clone() }, b: { th, ph, di, tg: tgt.clone() } }; }
        resetView() { this._flyTo(this.th, 1.3, this.defaultDist, new V3()); this.dT = this.defaultDist; }
        focusNode(node) {
            if (!node) return; this.selectedNode = node;
            const p = node.position ? node.position.clone() : new V3();
            const d = node.isFolder || node.isCentral ? 55 * Math.max(1, this.k * .6) : 38 * Math.max(1, this.k * .6);
            this._flyTo(this.th, this.ph, d, p); this.dT = d;
        }
        reheat() {
            for (const m of this.M) { m.vl.add(this.tmp.set(Math.random() - .5, Math.random() - .5, Math.random() - .5).multiplyScalar(26)); }
        }
        _notifyCameraChange() {
            if (!this.onCameraChange) return;
            const zp = Math.round(this.defaultDist / this.di * 100);
            this.onCameraChange({ scale: zp / 100, zoomPercent: zp, rotationDeg: 0, autoOrbit: this.autoRotate, autoRotate: this.autoRotate });
        }

        // ── Metadados, referências e navegação de busca ──
        _meta(n) {
            if (n._meta) return n._meta;
            const arr = (window.VAULT_SNAPSHOT && window.VAULT_SNAPSHOT.files) || [];
            if (this._fsrc !== arr) { this._fsrc = arr; this._fidx = new Map(arr.map(x => [x.id, x])); }
            const m = this._fidx.get(n.id) || {};
            return n._meta = { content: n.content || m.content || '', mtime: n.mtime || m.mtime || 0, bytes: n.bytes || m.size || 0, links: n.outgoingLinks || m.outgoingLinks || [] };
        }
        _base(x) { x = String(x || ''); try { x = decodeURIComponent(x); } catch (e) { } return x.split('#')[0].split('|')[0].split(/[\\/]/).pop().replace(/\.(md|markdown)$/i, '').trim().toLowerCase(); }
        _refs(n) {
            const m = this._meta(n), out = [];
            for (const u of m.links) if (/\.(md|markdown)(#|$)/i.test(u)) out.push(u);
            const c = m.content;
            if (c && c.length < 4e5) {
                let r; const w = /\[\[([^\]|#]+)/g, l = /\]\(([^)#\s]+\.md)\)/gi;
                while ((r = w.exec(c))) out.push(r[1]);
                while ((r = l.exec(c))) if (!/^https?:/i.test(r[1])) out.push(r[1]);
            }
            return out;
        }
        _goto(i) { const n = this._results.length; if (!n) return; this._ri = ((i % n) + n) % n; this.focusNode(this._results[this._ri]); }
        nextResult(dir) { if (!this._results.length) return false; this._goto(this._ri + (dir || 1)); return true; }

        // ── Categorias, filtros e cores ─────────────
        getDynamicCategories() {
            const catMap = new Map(); let totalDocs = 0;
            for (const node of this.nodes) {
                if (node.isCentral || node.id === 'brain') continue;
                const isDoc = !node.isFolder; if (isDoc) totalDocs++;
                const groupKey = node.group || 'h-folder';
                if (!catMap.has(groupKey)) {
                    let label = (window.HIERARCHY_PALETTE && window.HIERARCHY_PALETTE[groupKey] && window.HIERARCHY_PALETTE[groupKey].label);
                    if (!label) { label = groupKey.replace(/^h-dir-|^h-/, '').replace(/[-_]/g, ' '); label = label.charAt(0).toUpperCase() + label.slice(1); }
                    const icon = (window.FOLDER_ICONS && window.FOLDER_ICONS[groupKey]) || (node.isFolder ? '📂' : '📄');
                    catMap.set(groupKey, { key: groupKey, label, icon, color: this._col(groupKey), docCount: 0, nodeCount: 0 });
                }
                const cat = catMap.get(groupKey); cat.nodeCount++; if (isDoc) cat.docCount++;
            }
            return { totalDocs, categories: Array.from(catMap.values()).sort((a, b) => (b.docCount - a.docCount) || a.label.localeCompare(b.label)) };
        }
        setCategoryFilter(key) { this.currentCategory = (key === 'all' || !key) ? null : key; return this._applyCombinedFilter(); }
        filterNodes(q) { this.currentQuery = (q || '').trim(); return this._applyCombinedFilter(); }
        _applyCombinedFilter() {
            const q = norm(this.currentQuery), hasQ = q.length > 0, cat = this.currentCategory, hasCat = Boolean(cat);
            const sat = this.nodes.filter(n => !n.isCentral && n.id !== 'brain'), total = sat.length;
            this.searchLabelSet.clear();
            if (!hasQ && !hasCat) { this.visSet = null; this._results = []; this._nMatch = 0; this._applyVis(); return { matchedCount: total, totalCount: total, isFiltering: false }; }
            const vis = new Set(); let matched = 0;
            for (const n of this.nodes) if (n.isCentral || n.id === 'brain') vis.add(n.id);
            for (const n of sat) {
                const okCat = !hasCat || n.group === cat;
                const okTxt = !hasQ || norm(n.label).includes(q) || norm(n.path).includes(q) || norm(n.id).includes(q);
                if (!(okCat && okTxt)) continue;
                if (!n.isFolder) { matched++; this.searchLabelSet.add(n.id); }
                let cur = n.id; while (cur) { vis.add(cur); cur = this.parentOf.get(cur); }
            }
            if (matched === 0 && hasCat && vis.size > 1) matched = [...vis].filter(id => { const n = this.nodeMap.get(id); return n && !n.isCentral && n.id !== 'brain' && !n.isFolder; }).length;
            this.visSet = vis; this._applyVis(); this._nMatch = matched; this._results = [];
            if (hasQ) {
                const mf = sat.filter(n => this.searchLabelSet.has(n.id)).sort((a, b) => (a.label || '').localeCompare(b.label || ''));
                this._results = mf.length ? mf : sat.filter(n => n.isFolder && vis.has(n.id) && norm(n.label).includes(q));
                if (this._results.length) { clearTimeout(this._ft); this._ft = setTimeout(() => this._goto(0), 250); }
            }
            return { matchedCount: matched, totalCount: total, isFiltering: true };
        }
        _isVis(n) { return !this.visSet || this.visSet.has(n.id); }
        _applyVis() {
            for (const n of this.N) n.tv = this._isVis(n.node) ? 1 : 0;
            for (const l of this.leaves) l.tv = this._isVis(l.file) ? 1 : 0;
            for (const e of this.E) e.tv = e.link ? ((e.kind === 'ref' ? e.a.tv && e.b.tv : e.na.tv && e.nb.tv) ? 1 : 0) : (e.leaves.some(l => l.tv) || (!e.leaves.length && e.own.tv) ? 1 : 0);
        }
        highlightCategory(key) { if (!key || key === 'all') return this.clearCategoryHighlight(); this.highlightedCategory = key; }
        clearCategoryHighlight() { this.highlightedCategory = null; }
        updateGroupColor(groupKey, hex) {
            if (!hex) return;
            if (!this.groupColors[groupKey]) this.groupColors[groupKey] = { fill: hex, stroke: hex, glow: hex }; else { this.groupColors[groupKey].fill = hex; this.groupColors[groupKey].stroke = hex; }
            for (const n of this.N) if (n.node.group === groupKey) {
                n.col = hex; n.nm.uniforms.c.value.set(hex); n.g1.material.map = BrainGraph.G(hex); n.sphere.material.color.set(hex);
                n.ecol = rgb(mix(GOLD, hex, .3)); for (const e of this.E) if (e.own === n) e.col = n.ecol;
            }
            for (const l of this.leaves) if (l.file.group === groupKey) { l.tint = mix(BULB, hex, .45); l.bulb.material.map = BrainGraph.G(l.tint); }
        }

        // ── Eventos ─────────────────────────────────
        _rel(e) { const r = this.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
        _pick(x, y) {
            this.raycaster.setFromCamera({ x: x / this.width * 2 - 1, y: -(y / this.height) * 2 + 1 }, this.camera);
            const hs = this.raycaster.intersectObjects(this.hits.filter(h => h.visible && h.material.opacity > .08));
            for (const h of hs) if (h.object.userData.hit) return h.object.userData.hit;
            return null;
        }
        _pickLink(x, y) {
            const S = this.S; let b = null, bd = 12; const pv = this.tmp3;
            for (const e of this.E) {
                if (!e.link || e.vf < .5) continue;
                for (let i = 0; i <= S; i += 2) {
                    this._bez(e, i / S, pv).project(this.camera); if (pv.z > 1) continue;
                    const d = Math.hypot((pv.x + 1) / 2 * this.width - x, (1 - pv.y) / 2 * this.height - y); if (d < bd) { bd = d; b = e; }
                }
            }
            return b;
        }
        _drag(x, y, m) {
            if (this.grab !== m) { this.grab = m; this.camera.getWorldDirection(this.tmp2); this.plane.setFromNormalAndCoplanarPoint(this.tmp2, m.cur); this.canvas.style.cursor = 'grabbing'; }
            this.raycaster.setFromCamera({ x: x / this.width * 2 - 1, y: -(y / this.height) * 2 + 1 }, this.camera);
            if (this.raycaster.ray.intersectPlane(this.plane, this.tmp2)) { m.off.copy(this.tmp2).sub(m.p); m.vl.set(0, 0, 0); }
        }
        _setupEvents() {
            const cv = this.canvas;
            document.addEventListener('keydown', e => {
                if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT' && this._results.length && cv.getClientRects().length) { e.preventDefault(); this.nextResult(e.shiftKey ? -1 : 1); }
            });
            cv.addEventListener('contextmenu', e => e.preventDefault());
            cv.addEventListener('pointerdown', e => {
                this._ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); cv.setPointerCapture(e.pointerId);
                if (this._ptrs.size === 2) { const [a, b] = [...this._ptrs.values()]; this._pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, dT: this.dT }; this._down = null; this.grab = null; return; }
                if (this._ptrs.size > 2) return;
                const p = this._rel(e), h = this._pick(p.x, p.y);
                this._down = { x: e.clientX, y: e.clientY, m: 0, pan: e.button === 2 || e.shiftKey, g: h && h.mn };
                this._hideTip();
            });
            cv.addEventListener('pointermove', e => {
                if (this._ptrs.has(e.pointerId)) this._ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
                if (this._pinch && this._ptrs.size === 2) { const [a, b] = [...this._ptrs.values()]; this._dollyTo(this._pinch.dT * this._pinch.d / (Math.hypot(a.x - b.x, a.y - b.y) || 1)); this._notifyCameraChange(); return; }
                const p = this._rel(e); this._mx = p.x; this._my = p.y; const d = this._down; if (!d) return;
                const dx = e.clientX - d.x, dy = e.clientY - d.y; d.m += Math.abs(dx) + Math.abs(dy); d.x = e.clientX; d.y = e.clientY;
                if (d.g) { if (d.m > 6) this._drag(p.x, p.y, d.g); }
                else if (d.pan) { const s = this.di * .0016; this.camera.updateMatrix(); const r = this.tmp.setFromMatrixColumn(this.camera.matrix, 0), u = this.tmp2.setFromMatrixColumn(this.camera.matrix, 1); this.tT.addScaledVector(r, -dx * s).addScaledVector(u, dy * s); this.tgt.copy(this.tT); this.anim = null; }
                else { this.th -= dx * .005; this.ph = clamp(this.ph - dy * .005, .15, 2.99); }
            });
            const up = e => {
                this._ptrs.delete(e.pointerId); if (this._ptrs.size < 2) this._pinch = null;
                const d = this._down; this._down = null; this.grab = null; if (!d || d.m >= 6 || e.type === 'pointercancel') return;
                const p = this._rel(e), h = this._pick(p.x, p.y);
                if (h) { this.selectedNode = h.node; this.selLink = null; if (this.onNodeClick) this.onNodeClick(h.node); return; }
                const l = this._pickLink(p.x, p.y);
                if (l) { this.selLink = l !== this.selLink ? l : null; this.selectedNode = null; if (this.onNodeClick) this.onNodeClick(null); return; }
                this.selLink = null; this.selectedNode = null; if (this.onNodeClick) this.onNodeClick(null);
            };
            cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
            cv.addEventListener('pointerleave', () => { this._mx = null; this.hoveredNode = null; this.hovLink = null; this._hideTip(); });
            cv.addEventListener('dblclick', e => { const p = this._rel(e), h = this._pick(p.x, p.y); if (h && this.onNodeDblClick) this.onNodeDblClick(h.node); });
            cv.addEventListener('wheel', e => { e.preventDefault(); this._dollyTo(this.dT * Math.exp(e.deltaY * .0012)); this._notifyCameraChange(); }, { passive: false });
        }

        // ── Destaque de rotas ───────────────────────
        _path(m, s) { for (let x = m; x && x.pe; x = x.pe.a) s.add(x.pe); }
        _lit(l) {
            const s = new Set([l]);
            for (const n of [l.a, l.b]) {
                this._path(n, s); const st = [n];
                while (st.length) { const x = st.pop(); for (const e of x.out) if (!e.link && e.a === x) { s.add(e); st.push(e.b); } }
            }
            return s;
        }
        _nodeRoute(node) {
            const s = new Set(); const m = this.M.find(x => x.file === node) || (this.N.find(n => n.node === node) || {}).so;
            if (!m) return s; this._path(m, s);
            for (const e of this.E) if (e.kind === 'ref' && (e.a === m || e.b === m)) { s.add(e); this._path(e.a, s); this._path(e.b, s); }
            let nb = m.own; while (nb && nb.up) { s.add(nb.up); this._path(nb.up.a, s); this._path(nb.up.b, s); nb = nb.up.nb === nb ? nb.up.na : nb.up.nb; }
            return s;
        }
        _computeLit() {
            const hn = this.hoveredNode, sn = this.selectedNode, hl = this.highlightedCategory;
            const sig = [this.hovLink ? this.hovLink.hid : '', this.selLink ? this.selLink.hid : '', hn ? hn.id : '', sn ? sn.id : '', hl || ''].join('~');
            if (sig === this.lastSig) return; this.lastSig = sig;
            const l = this.hovLink || this.selLink;
            if (l) this.litSet = this._lit(l);
            else if (hn || sn) this.litSet = this._nodeRoute(hn || sn);
            else if (hl) { const s = new Set(); for (const e of this.E) if (!e.link && (e.leaves[0] ? e.leaves.some(x => x.file.group === hl) : false) || (e.own.node.group === hl && !e.link)) s.add(e); this.litSet = s; }
            else this.litSet = null;
        }

        // ── Render ──────────────────────────────────
        _bez(e, u, o) { return o.copy(e.P).multiplyScalar((1 - u) * (1 - u)).addScaledVector(e.M, 2 * u * (1 - u)).addScaledVector(e.C, u * u); }
        _fill(g, wm, bm) {
            const S = this.S;
            const P = g.attributes.position.array, C = g.attributes.color.array, pp = this.tmp, tg = this.tmp2, sd = this.F, vv = this.tmp3; let q = 0;
            const sphere = this.nodeStyle === 'sphere' ? .45 : 1;
            for (const e of this.E) for (let i = 0; i <= S; i++) {
                const u = i / S; this._bez(e, u, pp);
                tg.copy(e.M).sub(e.P).multiplyScalar(2 * (1 - u)).addScaledVector(vv.copy(e.C).sub(e.M), 2 * u);
                sd.crossVectors(tg, vv.copy(this.camera.position).sub(pp)).normalize().multiplyScalar((e.w0 + (e.w1 - e.w0) * u) * wm * this.k * sphere / 2 * (1 + Math.max(e.k, 0) * (e.link ? 1.5 : .6)) * (e.link ? .5 + .5 * Math.sin(Math.PI * u) : 1) * e.vf);
                const br = bm * e.br * (e.link ? .5 * Math.pow(Math.max(Math.sin(Math.PI * u), 0), .6) : 1) * (1 + e.k * .9) * (.55 + .45 * (1 - u)) * e.vf;
                for (const s of [1, -1]) { P[q] = pp.x + sd.x * s; P[q + 1] = pp.y + sd.y * s; P[q + 2] = pp.z + sd.z * s; C[q] = e.col[0] * br; C[q + 1] = e.col[1] * br; C[q + 2] = e.col[2] * br; q += 3; }
            }
            g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = true;
        }

        _step(dt, t) {
            const F = this.F, tm = this.tmp, sb = Math.min(dt, .033), ek = Math.min(1, dt * 8);
            // física elástica
            for (const n of this.M) {
                if (n === this.grab) continue;
                F.copy(n.off).multiplyScalar(-7);
                if (n.pe) F.addScaledVector(tm.copy(n.pe.a.off).sub(n.off), 25);
                for (const e of n.out) if (!e.link && e.a === n) F.addScaledVector(tm.copy(e.b.off).sub(n.off), 25);
                n.vl.addScaledVector(F, sb).multiplyScalar(Math.exp(-2.4 * sb));
            }
            for (const n of this.M) if (n !== this.grab) n.off.addScaledVector(n.vl, sb);
            for (const n of this.M) {
                if (n.soma) { n.cur.copy(n.p).add(n.off); continue; }
                const a = (.07 * n.p.distanceTo(n.c) + .15) * .5, p = n.ph;
                n.cur.set(n.p.x + (Math.sin(t * .8 + p) + .5 * Math.sin(t * 1.7 + p * 2)) * a, n.p.y + (Math.sin(t * .7 + p * 1.3 + 2) + .5 * Math.sin(t * 1.5 + p)) * a, n.p.z + (Math.cos(t * .75 + p * .7) + .5 * Math.sin(t * 1.9 + p * 1.6)) * a).add(n.off);
            }
            for (const e of this.E) {
                tm.copy(e.P).add(e.C).multiplyScalar(.5); let bn = e.bend;
                if (e.link) { this.tmp2.copy(e.C).sub(e.P); this.tmp3.copy(e.bend).addScaledVector(this.tmp2, -e.bend.dot(this.tmp2) / (this.tmp2.lengthSq() || 1)); bn = this.tmp3; }
                e.M.copy(tm).addScaledVector(bn, e.P.distanceTo(e.C) * (1 + .25 * Math.sin(t * .8 + e.ph)));
                e.vf += (e.tv - e.vf) * ek;
            }
            // visibilidade / ênfase
            const hl = this.highlightedCategory;
            for (const n of this.N) { n.vf += (n.tv - n.vf) * ek; n.em += ((hl ? (n.node.group === hl ? 1 : .2) : 1) - n.em) * ek; }
            for (const l of this.leaves) { l.vf += (l.tv - l.vf) * ek; l.em += ((hl ? (l.file.group === hl ? 1 : .2) : 1) - l.em) * ek; }
            this._computeLit();
            for (const e of this.E) e.k += ((this.litSet ? (this.litSet.has(e) ? 1 : -.3) : 0) - e.k) * ek;
            const rm = this.nodeStyle === 'sphere' ? .7 : 1;
            if (this.E.length <= 600 || (this._fr++ & 1) === 0) { if (this.mH.visible) this._fill(this.mH.geometry, 3.2, .16 * rm); this._fill(this.mC.geometry, 1, .8 * rm); }
            // pulsos
            const pa = this.pPos;
            this.pulses.forEach((p, i) => {
                p.u += p.v * dt / Math.max(2, p.e.P.distanceTo(p.e.C));
                if (p.u > 1) { p.u = 0; p.e = p.e.b.out.length ? p.e.b.out[p.e.b.out.length * Math.random() | 0] : this.E[this.E.length * Math.random() | 0]; }
                if (p.e.vf < .3) { pa[i * 3] = 0; pa[i * 3 + 1] = -1e5; pa[i * 3 + 2] = 0; return; }
                this._bez(p.e, p.u, this.tmp); pa[i * 3] = this.tmp.x; pa[i * 3 + 1] = this.tmp.y; pa[i * 3 + 2] = this.tmp.z;
            });
            this.pts.geometry.attributes.position.needsUpdate = true;
            // neurônios
            const cp = this.camera.position, ref = this.defaultDist, hn = this.hoveredNode, sn = this.selectedNode, k = this.k;
            this.N.forEach((n, i) => {
                const v = n.vf * n.em, so = n.so.cur, on = n.node === hn || n.node === sn;
                for (const o of [n.shell, n.nu, n.sphere, n.g1, n.g2]) o.position.copy(so);
                n.lb.position.set(so.x, so.y + n.ly, so.z);
                n.shell.material.uniforms.t.value = t + i; n.shell.material.uniforms.v.value = v;
                n.nm.uniforms.t.value = t * 1.2 + i * 3; n.nm.uniforms.v.value = v; n.nu.rotation.y = t * .15 + i; n.nu.scale.setScalar(1 + .06 * Math.sin(t * 2 + i));
                n.g1.material.opacity = .4 * v * (on ? 1.6 : 1); n.g2.material.opacity = .25 * v;
                n.lb.material.opacity = clamp(1.6 - cp.distanceTo(so) / (ref * .9), .25, 1) * v;
                const vis = n.vf > .03; n.shell.visible = vis && this.nodeStyle === 'neuron'; n.nu.visible = n.shell.visible; n.sphere.visible = vis && this.nodeStyle === 'sphere';
                n.g1.visible = n.g2.visible = n.lb.visible = vis;
            });
            const mouse = this._mx !== null && !this._down, few = this.visSet && this._nMatch > 0 && this._nMatch <= 14;
            for (const l of this.leaves) {
                const f = l.file, on = f === sn || f === hn, found = this.searchLabelSet.has(f.id) && this.visSet, d = cp.distanceTo(l.cur), v = l.vf * l.em, vis = l.vf > .03;
                l.bulb.position.copy(l.cur); l.lab.position.copy(l.cur);
                l.bulb.scale.setScalar((on ? 2.6 : 1.5 + .25 * Math.sin(t * 3 + l.ph) + (found ? .6 : 0)) * l.sz * k * (.55 + .45 * d / ref));
                // rótulo só quando faz sentido: seleção, rota, busca, categoria, perto da câmera ou do cursor
                let w = d < ref * .5 ? 1 - d / (ref * .5) : 0;
                if (on || found && few) w = 1;
                else if (this.litSet && l.pe && this.litSet.has(l.pe)) w = 1;
                else if (hl && f.group === hl) w = Math.max(w, .85);
                else if (mouse) { const q = this.tmp.copy(l.cur).project(this.camera); if (q.z < 1) { const m = Math.hypot((q.x + 1) / 2 * this.width - this._mx, (1 - q.y) / 2 * this.height - this._my); if (m < 120) w = Math.max(w, 1 - m / 140); } }
                l.lo += (w - l.lo) * ek;
                l.bulb.material.opacity = v; l.lab.material.opacity = l.lo * v;
                l.bulb.visible = vis; l.lab.visible = vis && l.lo > .03;
                if (l.halo) { l.halo.visible = vis; l.halo.position.copy(l.cur); l.halo.scale.setScalar((3.4 + .8 * Math.sin(t * 2 + l.ph)) * k * (.55 + .45 * d / ref)); l.halo.material.opacity = .55 * l.rec * v * (.65 + .35 * Math.sin(t * 2 + l.ph)); }
            }
        }

        // ── Loop ────────────────────────────────────
        start() { if (!this.animFrame) this._animate(); }
        stop() { if (this.animFrame) { cancelAnimationFrame(this.animFrame); this.animFrame = null; } }
        _animate() {
            this.animFrame = requestAnimationFrame(() => this._animate());
            if (document.hidden || !this.canvas.getClientRects().length) { this.clock.getDelta(); return; }   // pausa: grafo invisível
            if (!this.N.length) { this.renderer.render(this.scene, this.camera); return; }
            if (!this._sized) this._setupCanvas();
            const dt = Math.min(this.clock.getDelta(), .05); this.time += dt; const t = this.time;
            this._slow = dt > .04 ? this._slow + 1 : Math.max(0, this._slow - 1);
            if (this._slow > 90 && this.renderer.getPixelRatio() > 1) { this.renderer.setPixelRatio(1); this._sized = false; this._slow = 0; }
            if (this.anim) {
                const a = this.anim; a.t = Math.min(1, a.t + dt / .75); const e = a.t < .5 ? 4 * a.t ** 3 : 1 - Math.pow(-2 * a.t + 2, 3) / 2;
                this.th = a.a.th + (a.b.th - a.a.th) * e; this.ph = a.a.ph + (a.b.ph - a.a.ph) * e; this.di = a.a.di + (a.b.di - a.a.di) * e; this.tgt.lerpVectors(a.a.tg, a.b.tg, e); this.tT.copy(this.tgt);
                if (a.t >= 1) { this.anim = null; this.dT = this.di; }
            } else {
                if (this.autoRotate && !this._down && !this.grab) this.th += dt * .09;
                this.tgt.lerp(this.tT, .06); this.di += (this.dT - this.di) * .08;
            }
            this.camera.position.set(this.tgt.x + this.di * Math.sin(this.ph) * Math.sin(this.th), this.tgt.y + this.di * Math.cos(this.ph), this.tgt.z + this.di * Math.sin(this.ph) * Math.cos(this.th));
            this.camera.lookAt(this.tgt); this.camera.updateMatrixWorld();
            this.dust.rotation.y += dt * .004;
            this._step(dt, t);
            if (this._mx !== null && !this._down) this._hover();
            const zp = Math.round(this.defaultDist / this.di * 100); if (zp !== this._lastZp) { this._lastZp = zp; this._notifyCameraChange(); }
            this.renderer.render(this.scene, this.camera);
        }

        // ── Hover / tooltip ─────────────────────────
        _hover() {
            const h = this._pick(this._mx, this._my);
            this.hoveredNode = h ? h.node : null;
            this.hovLink = h ? null : this._pickLink(this._mx, this._my);
            this.canvas.style.cursor = h || this.hovLink ? 'pointer' : 'default';
            if (!h) return this._hideTip();
            const node = h.node, isF = node.isFolder, icon = node.icon || (isF ? '📂' : '📄');
            const type = isF ? (node.isCentral ? '☀️ SOL DO PROJETO' : `📂 PASTA • ${node.fileCount || node.childCount || 0} arquivos`) : '📄 DOCUMENTO';
            const hint = isF ? (node.isCentral ? '🌟 Núcleo orbital' : '⚡ Clique para destacar rota da pasta') : '⚡ Duplo-clique para abrir documento';
            let extra = '';
            if (this._tipFor !== node && !isF) { const mm = this.M.find(x => x.file === node); if (mm) extra = `<div style="font-size:10.5px;color:#94a3b8;margin-bottom:4px;">${mm.bytes ? fmtSize(mm.bytes) : ''}${mm.mtime ? ' • editado ' + fmtAge(Date.now() - mm.mtime) : ''}${mm.nref ? ' • 🔗 ' + mm.nref + ' ligações' : ''}</div>`; }
            if (this._tipFor !== node) {
                this._tipFor = node;
                this.tooltip.innerHTML = `<div class="tooltip-title" style="display:flex;align-items:center;gap:6px;"><span>${icon}</span><span>${node.label}</span></div><div class="tooltip-type" style="color:#c4b5fd;">${type}</div>${node.path ? `<div style="font-size:10.5px;color:#94a3b8;font-family:monospace;margin:4px 0 6px;word-break:break-all;">${node.path}</div>` : ''}${extra}<div class="tooltip-hint" style="font-size:11px;color:#38bdf8;margin-top:4px;font-weight:500;">${hint}</div>`;
            }
            this.tooltip.style.left = (this._mx + 16) + 'px'; this.tooltip.style.top = (this._my - 8) + 'px'; this.tooltip.classList.add('visible');
        }
        _hideTip() { this._tipFor = null; if (this.tooltip) this.tooltip.classList.remove('visible'); }
    }

    window.BrainGraph = BrainGraph;
})();
