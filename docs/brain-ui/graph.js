// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — 3D Planetary Neural Graph
// High-performance Three.js 3D Volumetric Graph with:
// - True 3D spherical planet rotation (OrbitControls with inertia)
// - Volumetric depth, cosmic fog, and planetary core
// - Curved 3D synaptic arches & neural pulse photon particles
// - Obsidian-like 3D focus spotlighting & background dimming
// - Billboard 3D typography that always faces the viewer
// - Tactile 3D node dragging & smooth planetary flight camera
// ═══════════════════════════════════════════════════

class BrainGraph {
    constructor(canvas, tooltipEl) {
        this.canvas = canvas;
        this.tooltip = tooltipEl;

        this.width = canvas.clientWidth || window.innerWidth;
        this.height = canvas.clientHeight || window.innerHeight;

        this.nodes = [];
        this.edges = [];
        this.nodeMap = new Map();
        this.groupColors = {};

        // Three.js Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(-999, -999);

        // 3D Objects Collections
        this.nodeGroup = new THREE.Group();
        this.edgeGroup = new THREE.Group();
        this.particleGroup = new THREE.Group();
        this.ribbonGroup = new THREE.Group();
        this.coreGroup = new THREE.Group();
        this.interactiveMeshes = [];

        // Dual Camera-Facing Ribbon Geometries & Action Potential Pulses
        this.gH = null;
        this.gC = null;
        this.pulses = [];
        this.pulsePoints = null;

        // Synaptic light photons (feixes rápidos de luz - modo esfera)
        this.particles = [];
        this.maxParticles = 55;

        // Botões sinápticos terminais com pulso cintilante suave
        this.synapticBoutons = [];

        // Interaction state
        this.hoveredNode = null;
        this.selectedNode = null;
        this.dragNode = null;
        this.dragPlane = new THREE.Plane();
        this.dragIntersection = new THREE.Vector3();
        this.isDraggingNode = false;
        this.pointerDownPos = { x: 0, y: 0 };
        this.hasDraggedPointer = false;

        // Camera Animation State
        this.cameraAnim = null;
        this.defaultCameraPos = new THREE.Vector3(0, 70, 560);
        this.defaultTargetPos = new THREE.Vector3(0, 0, 0);

        // Shared Textures & Geometries
        this.glowTexture = null;
        this.flareTexture = null;
        this.time = 0;
        this.animFrame = null;

        // 3D Dynamic Spring Physics Parameters
        this.kSpring = 0.085;     // Spring stiffness between connected nodes
        this.kHome = 0.026;       // Elastic tether returning nodes to planetary formation
        this.damping = 0.84;      // Damping / viscosity
        this.physicsEnergy = 0.0; // Current kinetic energy

        // Icon Display
        this.showIcons = false;

        // Estilo visual dos nós: 'sphere' (esferas) | 'neuron' (neurônios) — escolha persistida
        this.nodeStyle = BrainGraph.getSavedNodeStyle();

        // Nível de detalhe dos rótulos (LOD)
        this.labelFocus = new Set();      // nós em destaque (hover/seleção)
        this.searchLabelSet = new Set();  // arquivos encontrados pela pesquisa
        this.labelNearDist = 240;         // distância da câmera para revelar rótulos de arquivos
        this._cameraFitted = false;

        // Filter & Category State
        this.currentQuery = '';
        this.currentCategory = null;
        this.highlightedCategory = null;

        // Callbacks
        this.onNodeClick = null;
        this.onNodeDblClick = null;
        this.onCameraChange = null;

        this._initThree();
        this._initCosmicEnvironment();
        this._setupEvents();
    }

    // ── Three.js Initialization ──────────────────────
    _initThree() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x04060d, 0.0009);

        // Camera
        this.camera = new THREE.PerspectiveCamera(52, this.width / this.height, 1, 4000);
        this.camera.position.copy(this.defaultCameraPos);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // OrbitControls (Planet trackball sphere rotation!)
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.055; // Fluid planetary spin inertia
        this.controls.rotateSpeed = 0.85;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.minDistance = 90;
        this.controls.maxDistance = 1400;
        this.controls.autoRotate = true; // Auto-órbita ativada por padrão
        this.controls.autoRotateSpeed = 0.85;
        this.controls.target.copy(this.defaultTargetPos);

        // Groups
        this.scene.add(this.coreGroup);
        this.scene.add(this.edgeGroup);
        this.scene.add(this.ribbonGroup);
        this.scene.add(this.particleGroup);
        this.scene.add(this.nodeGroup);

        // Procedural Glow & Synaptic Flare Textures
        this.glowTexture = this._createGlowTexture();
        this.flareTexture = this._createFlareTexture();

        // Constantes de cor para cintilação sináptica biológica (Âmbar quente -> Ouro-branco diamante)
        if (!BrainGraph.COLOR_EMBER && typeof THREE !== 'undefined') {
            BrainGraph.COLOR_EMBER = new THREE.Color(0xff8811);
            BrainGraph.COLOR_PEAK = new THREE.Color(0xfff8e8);
        }
    }

    _setupCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        this.width = rect.width;
        this.height = rect.height;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height, false);
    }

    resize() {
        this._setupCanvas();
    }

    // ── Cosmic Environment & Planetary Core ───────────
    _initCosmicEnvironment() {
        // Lights
        const ambientLight = new THREE.AmbientLight(0x40386b, 1.4);
        this.scene.add(ambientLight);

        // Core central glow light
        const coreLight = new THREE.PointLight(0xa78bfa, 3.5, 900, 1.2);
        coreLight.position.set(0, 0, 0);
        this.scene.add(coreLight);

        // Directional stellar lights
        const dirLight1 = new THREE.DirectionalLight(0x818cf8, 1.2);
        dirLight1.position.set(300, 400, 300);
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xc084fc, 0.8);
        dirLight2.position.set(-300, -200, -300);
        this.scene.add(dirLight2);

        // 1. Planetary Inner Core (Geodesic Wireframe Sphere)
        const coreGeo = new THREE.IcosahedronGeometry(75, 2);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.16
        });
        this.coreWireframe = new THREE.Mesh(coreGeo, coreMat);
        this.coreGroup.add(this.coreWireframe);

        // 2. Core Inner Nebula Orb
        const innerGeo = new THREE.SphereGeometry(65, 32, 32);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x4f46e5,
            transparent: true,
            opacity: 0.08
        });
        this.coreOrb = new THREE.Mesh(innerGeo, innerMat);
        this.coreGroup.add(this.coreOrb);

        // 3. Planetary Orbital Rings — abraçam o núcleo (fora da casca de nós, menos ruído)
        const ringGeo1 = new THREE.RingGeometry(88, 89.2, 96);
        const ringMat1 = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.12
        });
        this.ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        this.ring1.rotation.x = Math.PI * 0.42;
        this.ring1.rotation.y = Math.PI * 0.12;
        this.coreGroup.add(this.ring1);

        const ringGeo2 = new THREE.RingGeometry(97, 97.8, 96);
        const ringMat2 = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.07
        });
        this.ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        this.ring2.rotation.x = Math.PI * 0.48;
        this.ring2.rotation.z = Math.PI * 0.15;
        this.coreGroup.add(this.ring2);

        // 4. Background Deep Space Starfield
        const starCount = 350;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i += 3) {
            const rad = 600 + Math.random() * 800;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPositions[i] = rad * Math.sin(phi) * Math.cos(theta);
            starPositions[i + 1] = rad * Math.sin(phi) * Math.sin(theta);
            starPositions[i + 2] = rad * Math.cos(phi);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xc4b5fd,
            size: 2.2,
            transparent: true,
            opacity: 0.65
        });
        this.stars = new THREE.Points(starGeo, starMat);
        this.scene.add(this.stars);

        // 5. Floating Cosmic Dust Particles (from reference HTML)
        const dustCount = 2700;
        const dustPositions = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount * 3; i += 3) {
            dustPositions[i] = (Math.random() - 0.5) * 440;
            dustPositions[i + 1] = (Math.random() - 0.5) * 260;
            dustPositions[i + 2] = (Math.random() - 0.5) * 440;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        const dustMat = new THREE.PointsMaterial({
            size: 0.85,
            color: 0x9fb4ff,
            transparent: true,
            opacity: 0.60,
            depthWrite: false
        });
        this.dust = new THREE.Points(dustGeo, dustMat);
        this.scene.add(this.dust);
    }

    // ── Custom Blending & Radial Texture Factory (from reference HTML) ──
    static get AB() {
        if (!BrainGraph._ab && typeof THREE !== 'undefined') {
            BrainGraph._ab = {
                blending: THREE.CustomBlending,
                blendEquation: THREE.AddEquation,
                blendSrc: THREE.SrcAlphaFactor,
                blendDst: THREE.OneFactor,
                blendSrcAlpha: THREE.ZeroFactor,
                blendDstAlpha: THREE.OneFactor
            };
        }
        return BrainGraph._ab || {};
    }

    static G(c) {
        if (!BrainGraph.gt) BrainGraph.gt = {};
        if (BrainGraph.gt[c]) return BrainGraph.gt[c];
        if (typeof document === 'undefined') return null;
        const k = document.createElement('canvas');
        k.width = 128;
        k.height = 128;
        const x = k.getContext('2d');
        const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.2, c);
        const halfHex = (typeof c === 'string' && c.startsWith('#') && c.length === 7) ? (c + '40') : 'rgba(255,200,80,0.25)';
        const zeroHex = (typeof c === 'string' && c.startsWith('#') && c.length === 7) ? (c + '00') : 'rgba(0,0,0,0)';
        g.addColorStop(0.55, halfHex);
        g.addColorStop(1, zeroHex);
        x.fillStyle = g;
        x.fillRect(0, 0, 128, 128);
        const tex = new THREE.CanvasTexture(k);
        BrainGraph.gt[c] = tex;
        return tex;
    }

    _createNeuronSprite(c, s) {
        const m = new THREE.Sprite(new THREE.SpriteMaterial({
            map: BrainGraph.G(c),
            ...BrainGraph.AB,
            depthWrite: false,
            transparent: true
        }));
        m.scale.set(s, s, 1);
        return m;
    }

    _createNeuronLabel(t, h, col, left) {
        const k = document.createElement('canvas');
        const x = k.getContext('2d');
        const f = '600 34px ui-sans-serif, system-ui, sans-serif';
        x.font = f;
        const w = x.measureText(t).width + (left ? 30 : 12);
        k.width = Math.max(1, Math.ceil(w));
        k.height = 52;
        x.font = f;
        x.shadowColor = '#04060d99';
        x.shadowBlur = 5;
        x.fillStyle = col;
        x.fillText(t, left ? 26 : 6, 36);
        const tex = new THREE.CanvasTexture(k);
        const s = new THREE.Sprite(new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthTest: false
        }));
        s.scale.set((w / 52) * h, h, 1);
        s.center.set(left ? 0 : 0.5, 0.5);
        s.renderOrder = 10;
        return s;
    }

    _neuronLit(l) {
        const s = new Set();
        if (!l) return s;
        if (l.pe) s.add(l.pe);
        if (l.link) s.add(l);
        for (const n of [l.a, l.b].filter(Boolean)) {
            for (let x = n; x && x.pe; x = x.pe.a) {
                s.add(x.pe);
            }
            const st = [n];
            while (st.length) {
                const x = st.pop();
                for (const e of (x.out || [])) {
                    if (!e.link && e.a === x) {
                        s.add(e);
                        st.push(e.b);
                    }
                }
            }
        }
        return s;
    }

    _fillNeuronRibbon(g, wm, bm) {
        if (!g || !g.attributes || !g.attributes.position || !this.neuronEdges) return;
        const P = g.attributes.position.array;
        const C = g.attributes.color.array;
        const S = this.ribbonSegments || 10;
        const camPos = this.camera.position;
        const pp = new THREE.Vector3();
        const tg = new THREE.Vector3();
        const sd = new THREE.Vector3();
        const tm = new THREE.Vector3();
        const vv = new THREE.Vector3();

        const bez = (e, u, o) => o.copy(e.P).multiplyScalar((1 - u) * (1 - u)).addScaledVector(e.M, 2 * u * (1 - u)).addScaledVector(e.C, u * u);

        let k = 0;
        for (const e of this.neuronEdges) {
            for (let i = 0; i <= S; i++) {
                const u = i / S;
                bez(e, u, pp);
                tg.copy(e.M).sub(e.P).multiplyScalar(2 * (1 - u)).addScaledVector(tm.copy(e.C).sub(e.M), 2 * u);
                sd.crossVectors(tg, vv.copy(camPos).sub(pp)).normalize().multiplyScalar((e.w0 + (e.w1 - e.w0) * u) * wm / 2 * (1 + Math.max(e.k, 0) * (e.link ? 1.5 : 0.6)) * (e.link ? 0.5 + 0.5 * Math.sin(Math.PI * u) : 1));
                const br = bm * e.br * (e.link ? 0.5 * Math.pow(Math.sin(Math.PI * u), 0.6) : 1) * (1 + e.k * 0.9) * (0.55 + 0.45 * (1 - u));
                for (const s of [1, -1]) {
                    P[k]     = pp.x + sd.x * s;
                    P[k + 1] = pp.y + sd.y * s;
                    P[k + 2] = pp.z + sd.z * s;
                    C[k]     = e.col[0] * br;
                    C[k + 1] = e.col[1] * br;
                    C[k + 2] = e.col[2] * br;
                    k += 3;
                }
            }
        }
        g.attributes.position.needsUpdate = true;
        g.attributes.color.needsUpdate = true;
    }

    _animateNeuron(dt, t) {
        if (!this.neuronNodes || this.neuronNodes.length === 0) return;
        const sb = Math.min(dt, 0.033);
        const tm = new THREE.Vector3();
        const sd = new THREE.Vector3();
        const tg = new THREE.Vector3();
        const pp = new THREE.Vector3();
        const F = new THREE.Vector3();

        // 1. Spring physics on dragged / connected nodes
        for (const n of this.neuronNodes) {
            if (n === this.grabNeuronNode) continue;
            F.copy(n.off).multiplyScalar(-7);
            if (n.pe) F.addScaledVector(tm.copy(n.pe.a.off).sub(n.off), 25);
            for (const e of (n.out || [])) {
                if (!e.link && e.a === n) F.addScaledVector(tm.copy(e.b.off).sub(n.off), 25);
            }
            n.vl.addScaledVector(F, sb).multiplyScalar(Math.exp(-2.4 * sb));
        }
        for (const n of this.neuronNodes) {
            if (n !== this.grabNeuronNode) n.off.addScaledVector(n.vl, sb);
        }

        // 2. Organic harmonic sway
        for (const n of this.neuronNodes) {
            if (n.soma) {
                n.cur.copy(n.p).add(n.off);
                continue;
            }
            const a = 0.05 * n.p.distanceTo(n.c) + 0.1;
            const p = n.ph || 0;
            n.cur.set(
                n.p.x + (Math.sin(t * 0.8 + p) + 0.5 * Math.sin(t * 1.7 + p * 2)) * a * 0.5,
                n.p.y + (Math.sin(t * 0.7 + p * 1.3 + 2) + 0.5 * Math.sin(t * 1.5 + p)) * a * 0.5,
                n.p.z + (Math.cos(t * 0.75 + p * 0.7) + 0.5 * Math.sin(t * 1.9 + p * 1.6)) * a * 0.5
            ).add(n.off);
        }

        // 3. Curved Bezier midpoint of branches
        for (const e of this.neuronEdges) {
            tm.copy(e.P).add(e.C).multiplyScalar(0.5);
            let bn = e.bend;
            if (e.link) {
                sd.copy(e.C).sub(e.P);
                tg.copy(e.bend).addScaledVector(sd, -e.bend.dot(sd) / (sd.lengthSq() || 1));
                bn = tg;
            }
            e.M.copy(tm).addScaledVector(bn, e.P.distanceTo(e.C) * (1 + 0.25 * Math.sin(t * 0.8 + e.ph)));
        }

        // 4. Spotlight highlight logic
        const cl = this.selLink || this.hovLink;
        if (cl !== this.lastL) {
            this.lastL = cl;
            this.litSet = cl ? this._neuronLit(cl) : null;
        }
        for (const e of this.neuronEdges) {
            let targetK = 0;
            if (this.litSet) {
                targetK = this.litSet.has(e) ? 1.0 : -0.3;
            }
            e.k += (targetK - e.k) * Math.min(1, dt * 8);
        }

        // 5. Fill Camera-Facing Ribbons
        if (this.gH && this.gC) {
            this._fillNeuronRibbon(this.gH, 3.2, 0.16);
            this._fillNeuronRibbon(this.gC, 1.0, 0.80);
        }

        // 6. Action Potential Pulses
        if (this.neuronPulses && this.neuronPulsePoints && this.neuronPulsePos) {
            const bez = (e, u, o) => o.copy(e.P).multiplyScalar((1 - u) * (1 - u)).addScaledVector(e.M, 2 * u * (1 - u)).addScaledVector(e.C, u * u);
            for (let i = 0; i < this.neuronPulses.length; i++) {
                const p = this.neuronPulses[i];
                p.u += (p.v * dt) / Math.max(2, p.e.P.distanceTo(p.e.C));
                if (p.u > 1.0) {
                    p.u = 0;
                    p.e = (p.e.b.out && p.e.b.out.length) ? p.e.b.out[(p.e.b.out.length * Math.random()) | 0] : this.neuronEdges[(this.neuronEdges.length * Math.random()) | 0];
                }
                bez(p.e, p.u, pp);
                this.neuronPulsePos[i * 3]     = pp.x;
                this.neuronPulsePos[i * 3 + 1] = pp.y;
                this.neuronPulsePos[i * 3 + 2] = pp.z;
            }
            this.neuronPulsePoints.geometry.attributes.position.needsUpdate = true;
        }

        // 7. Update Somas, Shells, Nuclei Shaders and Labels
        for (const s of (this.neuronSomas || [])) {
            s.ob.forEach(o => o.position.copy(s.so.cur));
            s.lb.position.set(s.so.cur.x, s.so.cur.y + s.ly, s.so.cur.z);
        }
        for (let i = 0; i < (this.neuronShells || []).length; i++) {
            this.neuronShells[i].material.uniforms.t.value = t + i;
            this.neuronNmats[i].uniforms.t.value = t * 1.2 + i * 3.0;
            this.neuronNuclei[i].rotation.y = t * 0.15 + i;
            this.neuronNuclei[i].scale.setScalar(1.0 + 0.06 * Math.sin(t * 2.0 + i));
        }

        // 8. Update Leaves (Bulbs and File Labels)
        for (const l of (this.neuronLeaves || [])) {
            const f = l.file;
            const on = f === this.activeNeuronFile || (this.hoveredNeuronHit && this.hoveredNeuronHit.file === f);
            const d = this.camera.position.distanceTo(l.cur);
            l.bulb.position.copy(l.cur);
            l.lab.position.copy(l.cur);
            if (l.hit) l.hit.position.copy(l.cur);

            l.bulb.scale.setScalar((on ? 2.6 : 1.5 + 0.25 * Math.sin(t * 3.0 + l.ph)) * (0.8 + d / 150));
            l.lab.material.opacity = on ? 1.0 : Math.min(1.0, Math.max(0.12, 1.5 - d / 75));
        }
    }

    _createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }

    _createFlareTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const cx = 64;
        const cy = 64;

        // 1. Coroa difusa de fogo quente (âmbar / dourado)
        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);
        radGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        radGrad.addColorStop(0.12, 'rgba(255, 240, 160, 0.95)');
        radGrad.addColorStop(0.32, 'rgba(255, 170, 30, 0.75)');
        radGrad.addColorStop(0.60, 'rgba(255, 90, 0, 0.25)');
        radGrad.addColorStop(1, 'rgba(255, 40, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 128, 128);

        // 2. Raios ópticos cruzados (Optical Flare anamórfico estilo starburst)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Raio horizontal
        const hGrad = ctx.createLinearGradient(0, cy, 128, cy);
        hGrad.addColorStop(0, 'rgba(255, 180, 50, 0)');
        hGrad.addColorStop(0.38, 'rgba(255, 220, 100, 0.45)');
        hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
        hGrad.addColorStop(0.62, 'rgba(255, 220, 100, 0.45)');
        hGrad.addColorStop(1, 'rgba(255, 180, 50, 0)');
        ctx.fillStyle = hGrad;
        ctx.fillRect(0, cy - 2.5, 128, 5);

        // Raio vertical
        const vGrad = ctx.createLinearGradient(cx, 0, cx, 128);
        vGrad.addColorStop(0, 'rgba(255, 180, 50, 0)');
        vGrad.addColorStop(0.38, 'rgba(255, 220, 100, 0.45)');
        vGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
        vGrad.addColorStop(0.62, 'rgba(255, 220, 100, 0.45)');
        vGrad.addColorStop(1, 'rgba(255, 180, 50, 0)');
        ctx.fillStyle = vGrad;
        ctx.fillRect(cx - 2.5, 0, 5, 128);

        // Raio diagonal 45 graus
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        const dGrad = ctx.createLinearGradient(-48, 0, 48, 0);
        dGrad.addColorStop(0, 'rgba(255, 160, 30, 0)');
        dGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
        dGrad.addColorStop(1, 'rgba(255, 160, 30, 0)');
        ctx.fillStyle = dGrad;
        ctx.fillRect(-48, -2, 96, 4);

        // Raio diagonal -45 graus
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = dGrad;
        ctx.fillRect(-48, -2, 96, 4);

        ctx.restore();

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }

    // ── Load Data & 3D Neural Map Construction ────────
    loadData(graphNodes, graphEdges, groupColors) {
        this.rawGraphNodes = graphNodes;
        this.rawGraphEdges = graphEdges;
        this.groupColors = groupColors || {};

        if (this.nodeStyle === 'neuron') {
            this._buildNeuronGraph(graphNodes, graphEdges, this.groupColors);
        } else {
            this._buildSphereGraph(graphNodes, graphEdges, this.groupColors);
        }
    }

    _buildNeuronGraph(graphNodes, graphEdges, groupColors) {
        this.nodeMap.clear();

        // 1. Clear any previous objects
        if (this.neuronWorld) {
            this.scene.remove(this.neuronWorld);
            while (this.neuronWorld.children.length > 0) {
                const c = this.neuronWorld.children[0];
                if (c.geometry) c.geometry.dispose();
                this.neuronWorld.remove(c);
            }
        }
        this.neuronWorld = new THREE.Group();
        this.scene.add(this.neuronWorld);

        while (this.nodeGroup.children.length > 0) {
            this.nodeGroup.remove(this.nodeGroup.children[0]);
        }
        while (this.edgeGroup.children.length > 0) {
            this.edgeGroup.remove(this.edgeGroup.children[0]);
        }
        while (this.particleGroup.children.length > 0) {
            this.particleGroup.remove(this.particleGroup.children[0]);
        }
        if (this.ribbonGroup) {
            while (this.ribbonGroup.children.length > 0) {
                const child = this.ribbonGroup.children[0];
                if (child.geometry) child.geometry.dispose();
                this.ribbonGroup.remove(child);
            }
        }
        if (this.pulsePoints) {
            this.scene.remove(this.pulsePoints);
            if (this.pulsePoints.geometry) this.pulsePoints.geometry.dispose();
            this.pulsePoints = null;
        }

        if (this.coreGroup) {
            this.coreGroup.visible = false;
        }

        // Neuron state collections (exactly matching HTML)
        this.neuronNodes = [];
        this.neuronEdges = [];
        this.neuronLeaves = [];
        this.neuronShells = [];
        this.neuronNuclei = [];
        this.neuronNmats = [];
        this.neuronHits = [];
        this.neuronFiles = [];
        this.neuronSomas = [];
        this.interactiveMeshes = [];
        this.synapticBoutons = [];
        this.litSet = null;
        this.selLink = null;
        this.hovLink = null;
        this.lastL = null;
        this.activeNeuronFile = null;
        this.activeNeuronLeaf = null;

        // 2. Prepare Data: Group documents by folder
        const allVaultFiles = (window.VAULT && window.VAULT.data && window.VAULT.data.files) || [];
        const folderData = {};

        if (allVaultFiles.length > 0) {
            for (const f of allVaultFiles) {
                let fo = f.folder;
                if (!fo && f.path && f.path.includes('/')) {
                    fo = f.path.substring(0, f.path.lastIndexOf('/'));
                }
                if (!fo) fo = f.category || f.group || 'geral';
                fo = fo.replace(/\\/g, '/');
                if (fo.startsWith('.agents/')) fo = fo.slice('.agents/'.length);

                const parts = fo.split('/').filter(Boolean);
                let primaryFolder = fo;
                if (parts[0] === 'projects' && parts.length >= 2) {
                    primaryFolder = parts[0] + '/' + parts[1];
                } else if (parts[0] === 'RESEARCH' && parts.length >= 2) {
                    primaryFolder = parts[0] + '/' + parts[1];
                } else if (parts.length > 1) {
                    primaryFolder = parts[0];
                }

                if (!folderData[primaryFolder]) folderData[primaryFolder] = [];
                folderData[primaryFolder].push({
                    id: f.id || f.path,
                    name: f.name || (f.path ? f.path.split('/').pop() : f.id),
                    path: f.path || '',
                    text: f.content || '',
                    folder: primaryFolder,
                    subfolder: fo,
                    group: f.category || f.group || parts[0],
                    originalNode: graphNodes.find(n => n.id === f.id || n.path === f.path) || { id: f.id, label: f.name, path: f.path }
                });
            }
        } else {
            for (const n of graphNodes) {
                if (n.isCentral || n.id === 'brain' || n.isFolder) continue;
                let fo = n.folder;
                if (!fo && n.path && n.path.includes('/')) {
                    fo = n.path.substring(0, n.path.lastIndexOf('/'));
                }
                if (!fo) fo = n.group || 'geral';
                fo = fo.replace(/\\/g, '/');
                if (fo.startsWith('.agents/')) fo = fo.slice('.agents/'.length);

                const parts = fo.split('/').filter(Boolean);
                let primaryFolder = fo;
                if (parts[0] === 'projects' && parts.length >= 2) {
                    primaryFolder = parts[0] + '/' + parts[1];
                } else if (parts[0] === 'RESEARCH' && parts.length >= 2) {
                    primaryFolder = parts[0] + '/' + parts[1];
                } else if (parts.length > 1) {
                    primaryFolder = parts[0];
                }

                if (!folderData[primaryFolder]) folderData[primaryFolder] = [];
                folderData[primaryFolder].push({
                    id: n.id,
                    name: n.label || n.title || (n.path ? n.path.split('/').pop() : n.id),
                    path: n.path || '',
                    text: n.content || n.text || '',
                    folder: primaryFolder,
                    subfolder: fo,
                    group: n.group,
                    originalNode: n
                });
            }
        }

        // Fallback se não houver pastas
        if (Object.keys(folderData).length === 0) {
            folderData['geral'] = graphNodes.filter(n => !n.isCentral && n.id !== 'brain').map(n => ({
                id: n.id,
                name: n.label || n.title || n.id,
                path: n.path || '',
                text: n.content || n.text || '',
                group: n.group,
                originalNode: n
            }));
        }

        const V = THREE.Vector3;
        const rnd = Math.random;
        const rv = () => new V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
        const GOLD = [1, 0.78, 0.42];
        const CY = [0.3, 0.85, 1];
        const COL = ['#2cff9a', '#ff6fae', '#7f8cff', '#35e0ff', '#ffa24a', '#c58bff', '#ffd27a', '#ff7a7a'];

        const names = Object.keys(folderData).sort((a, b) => folderData[b].length - folderData[a].length);
        const M = names.length - 1;

        const mk = (p, c, d) => {
            const n = {
                p: p,
                cur: p.clone(),
                c: c,
                d: d,
                off: new V(),
                vl: new V(),
                out: [],
                ph: p.x * 0.35 + p.y * 0.3 + p.z * 0.4 + rnd()
            };
            this.neuronNodes.push(n);
            return n;
        };

        const ed = (a, b, w0, w1, col, br, bd) => {
            const e = {
                a: a,
                b: b,
                w0: w0,
                w1: w1,
                col: col,
                br: br,
                bend: rv().multiplyScalar(bd),
                P: a.cur,
                C: b.cur,
                M: new V(),
                ph: rnd() * 6,
                k: 0
            };
            this.neuronEdges.push(e);
            a.out.push(e);
            return e;
        };

        const wd = d => 0.42 * Math.pow(0.6, d);
        const disp = f => f.split('/').slice(-2).join('/');

        names.forEach((fo, i) => {
            const list = folderData[fo].slice(0, 80);
            const n = list.length;
            const r = Math.min(4.5, 2 + 0.25 * n);
            const grp = list[0] && list[0].group;
            const col = (grp && this.groupColors[grp] && this.groupColors[grp].fill) || COL[i % COL.length];

            let c = new V();
            if (i) {
                const j = i - 1;
                const y = 1 - (j + 0.5) / Math.max(M, 1) * 2;
                const s = Math.sqrt(1 - y * y);
                const a = j * 2.4;
                c.set(Math.cos(a) * s, y * 0.6, Math.sin(a) * s).multiplyScalar(20 + n * 0.7 + M);
            }

            const so = mk(c.clone(), c, 0);
            so.soma = 1;

            // 1. Soma Shell Shader
            const shell = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                ...BrainGraph.AB,
                uniforms: { t: { value: 0 } },
                vertexShader: 'uniform float t;varying vec3 N,W;void main(){vec3 p=position;p+=normal*sin(p.x*1.6+t)*sin(p.y*1.9+t*1.1)*sin(p.z*1.7+t*.9)*.35;vec4 m=modelViewMatrix*vec4(p,1.);N=normalize(normalMatrix*normal);W=normalize(-m.xyz);gl_Position=projectionMatrix*m;}',
                fragmentShader: 'varying vec3 N,W;void main(){float f=pow(1.-abs(dot(N,W)),1.8);gl_FragColor=vec4(mix(vec3(.55,.35,.08),vec3(1.,.82,.4),f)*(.3+.6*f),.15+.35*f);}'
            }));
            shell.position.copy(c);

            // 2. Nucleus Plasma Shader
            const nm = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                ...BrainGraph.AB,
                uniforms: { t: { value: 0 }, c: { value: new THREE.Color(col) } },
                vertexShader: 'uniform float t;varying vec3 N,W,P;void main(){vec3 p=position;p+=normal*(sin(p.x*3.+t)*sin(p.y*3.4+t*1.2)*sin(p.z*3.1+t*.8)*.38+sin(p.x*6.-t*1.5+p.y*4.)*.1);P=p;vec4 m=modelViewMatrix*vec4(p,1.);N=normalize(normalMatrix*normal);W=normalize(-m.xyz);gl_Position=projectionMatrix*m;}',
                fragmentShader: 'uniform float t;uniform vec3 c;varying vec3 N,W,P;void main(){float f=pow(1.-abs(dot(N,W)),1.5);float s=.5+.5*sin(P.x*7.+P.y*5.+t*2.)*sin(P.z*6.-t*1.5+P.y*3.);gl_FragColor=vec4(c*(.3+.5*s)+vec3(f*.2),.2+.3*f+.15*s);}'
            });
            const nu = new THREE.Group();
            const o = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 4), nm);
            const n2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), nm);
            o.scale.setScalar(r * 0.62);
            n2.scale.set(r * 0.34, r * 0.28, r * 0.4);
            n2.rotation.set(1, 2, 0);
            nu.add(o, n2);
            nu.position.copy(c);
            this.neuronNmats.push(nm);

            // 3. Glowing Bio-Auras
            const g1 = this._createNeuronSprite(col, r * 3.2);
            const g2 = this._createNeuronSprite('#ffb940', r * 6.0);
            g1.material.opacity = 0.4;
            g2.material.opacity = 0.25;
            g1.position.copy(c);
            g2.position.copy(c);
            g1.userData = { folder: fo, c, isFolder: true };

            // 4. Soma Label
            const lb = this._createNeuronLabel(disp(fo) + '/', 1.9, '#ffe7b0');
            lb.position.set(c.x, c.y + r * 1.5 + 1.2, c.z);
            lb.userData = { folder: fo, c, isFolder: true };

            const somaHit = new THREE.Mesh(new THREE.SphereGeometry(r * 1.6, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
            somaHit.position.copy(c);
            somaHit.userData = { folder: fo, c, isFolder: true, node: { id: fo, label: fo, isFolder: true } };

            this.neuronWorld.add(shell, nu, g1, g2, lb, somaHit);
            this.neuronShells.push(shell);
            this.neuronNuclei.push(nu);
            this.neuronHits.push(g1, lb, somaHit);
            this.interactiveMeshes.push(somaHit, g1, lb);
            this.neuronSomas.push({ fo, c, col, r, so, ob: [shell, nu, g1, g2, somaHit], lb, ly: r * 1.5 + 1.2, nm, g1 });

            // 5. Dendrite Tree Growth
            const grow = (par, dir, g, d, len) => {
                if (g.length === 1) {
                    const l = mk(par.p.clone().addScaledVector(dir, len * 1.2), c, d);
                    l.pe = ed(par, l, wd(d - 1), 0.05, GOLD, 1, 0.3);
                    l.file = g[0];
                    l.isLeaf = true;
                    this.neuronLeaves.push(l);
                    return;
                }
                const b = mk(par.p.clone().addScaledVector(dir, len), c, d);
                b.pe = ed(par, b, wd(d - 1), wd(d), GOLD, 1, 0.3);
                const h = Math.ceil(g.length / 2);
                [g.slice(0, h), g.slice(h)].forEach(s => {
                    if (s.length) {
                        grow(b, dir.clone().addScaledVector(rv(), 0.9).normalize(), s, d + 1, len * 0.8);
                    }
                });
            };

            const k = Math.min(n, Math.max(3, Math.round(Math.sqrt(n) * 1.8)));
            const gr = Array.from({ length: k }, () => []);
            list.forEach((f, q) => gr[q % k].push({ folder: fo, ...f }));
            const off = rnd() * 6;
            gr.forEach((g, q) => {
                const y = 1 - (q + 0.5) / k * 2;
                const s = Math.sqrt(1 - y * y);
                const a = q * 2.4 + off;
                grow(so, new V(Math.cos(a) * s, y, Math.sin(a) * s), g, 1, r + 3 + Math.min(n, 12) * 0.45);
            });
        });

        // 6. Leaves (File Boutons & Labels)
        this.neuronLeaves.forEach(l => {
            const f = l.file;
            f.leaf = l;
            this.neuronFiles.push(f);
            const origNode = f.originalNode || { id: f.id, label: f.name, path: f.path, text: f.text };
            this.nodeMap.set(origNode.id, origNode);

            l.bulb = this._createNeuronSprite('#ffcf5a', 1.7);
            l.bulb.userData = { file: f, node: origNode, isFile: true };

            l.lab = this._createNeuronLabel(f.name, 0.95, '#fff4d6', true);
            l.lab.userData = { file: f, node: origNode, isFile: true };

            const leafHit = new THREE.Mesh(new THREE.SphereGeometry(3.5, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
            leafHit.position.copy(l.cur);
            leafHit.userData = { file: f, node: origNode, isFile: true };
            l.hit = leafHit;

            this.neuronWorld.add(l.bulb, l.lab, leafHit);
            this.neuronHits.push(l.bulb, l.lab, leafHit);
            this.interactiveMeshes.push(leafHit, l.bulb);
        });

        // 7. Inter-Neuron Connections (Axon Bridges between Somas)
        const near = (A, B) => {
            let b = [1e9];
            this.neuronNodes.forEach(x => {
                if (x.c === A && x.d >= 1 && x.out.length) {
                    this.neuronNodes.forEach(y => {
                        if (y.c === B && y.d >= 1 && y.out.length) {
                            const d = x.p.distanceTo(y.p);
                            if (d < b[0]) b = [d, x, y];
                        }
                    });
                }
            });
            return b;
        };

        const cs = this.neuronSomas.map(s => s.c);
        const pr = new Set();
        this.neuronSomas.forEach(s => {
            const i = s.fo.lastIndexOf('/');
            const ps = i > 0 && this.neuronSomas.find(q => q.fo === s.fo.slice(0, i));
            if (ps) {
                const r = near(s.c, ps.c);
                if (r[1]) ed(r[1], r[2], 0.3, 0.3, GOLD, 0.9, 0.35).link = 1;
                else ed(this.neuronNodes.find(x => x.c === s.c && x.soma), this.neuronNodes.find(x => x.c === ps.c && x.soma), 0.4, 0.4, GOLD, 0.9, 0.35).link = 1;
            }
        });

        cs.forEach((a, i) => cs.forEach((b, j) => {
            if (i < j && (j === i + 1 || i === 0 || (i + j) % 3 === 0)) {
                const r = near(a, b);
                if (r[1]) ed(r[1], r[2], 0.2, 0.2, GOLD, 0.8, 0.35).link = 1;
            }
        }));

        // 8. Cross-references / Wikilinks (Cyan ribbons)
        const find = ref => {
            ref = ref.replace(/^\.?\//, '').toLowerCase();
            return this.neuronFiles.find(f => (f.folder + '/' + f.name).toLowerCase().endsWith(ref) || (f.path && f.path.toLowerCase().endsWith(ref)));
        };

        this.neuronFiles.forEach(f => {
            const text = f.text || (f.originalNode && (f.originalNode.content || f.originalNode.text)) || '';
            [...text.matchAll(/\[\[([^\]]+)\]\]|\]\(([^)]+\.md)\)/g)].forEach(m => {
                const t = find(m[1] || m[2]);
                if (t && t !== f && pr.size < 120) {
                    const k = [f.name + f.folder, t.name + t.folder].sort().join();
                    if (!pr.has(k)) {
                        pr.add(k);
                        ed(f.leaf, t.leaf, 0.12, 0.12, CY, 0.9, 0.4).link = 1;
                    }
                }
            });
        });

        // 9. Dual Camera-Facing Ribbon Geometries (gH and gC)
        const S = 10;
        this.ribbonSegments = S;
        const mkG = () => {
            const n = this.neuronEdges.length * (S + 1) * 2;
            const g = new THREE.BufferGeometry();
            const ix = [];
            g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
            g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
            for (let e = 0; e < this.neuronEdges.length; e++) {
                for (let i = 0; i < S; i++) {
                    const a = (e * (S + 1) + i) * 2;
                    ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
                }
            }
            g.setIndex(ix);
            const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
                vertexColors: true,
                ...BrainGraph.AB,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            }));
            m.frustumCulled = false;
            this.neuronWorld.add(m);
            return g;
        };
        this.gC = mkG();
        this.gH = mkG();

        // 10. Action Potential Pulses
        const np = Math.min(200, this.neuronEdges.length * 2);
        this.neuronPulses = Array.from({ length: np }, () => ({
            e: this.neuronEdges[this.neuronEdges.length * rnd() | 0],
            u: rnd(),
            v: 1 + rnd()
        }));
        this.neuronPulsePos = new Float32Array(np * 3);
        const pg = new THREE.BufferGeometry();
        pg.setAttribute('position', new THREE.BufferAttribute(this.neuronPulsePos, 3));
        this.neuronPulsePoints = new THREE.Points(pg, new THREE.PointsMaterial({
            map: BrainGraph.G('#fff1b8'),
            size: 1.5,
            ...BrainGraph.AB,
            transparent: true,
            depthWrite: false
        }));
        this.neuronPulsePoints.frustumCulled = false;
        this.neuronWorld.add(this.neuronPulsePoints);

        // 11. Initial camera positioning for neuron constellation
        const numSomas = this.neuronSomas.length;
        const initialDist = Math.min(220, Math.max(105, 75 + numSomas * 4.2));
        this.defaultNeuronDist = initialDist;
        const camDir = new THREE.Vector3(Math.sin(1.3) * Math.sin(0.6), Math.cos(1.3), Math.sin(1.3) * Math.cos(0.6)).normalize();
        const initCamPos = camDir.clone().multiplyScalar(initialDist);

        this.defaultCameraPos.copy(initCamPos);
        this.defaultTargetPos.set(0, 0, 0);
        this.controls.minDistance = 14;
        this.controls.maxDistance = 500;
        this.controls.target.set(0, 0, 0);
        this.camera.position.copy(initCamPos);
        this.camera.lookAt(0, 0, 0);
        this.controls.update();

        this.nodes = this.neuronFiles.map(f => f.originalNode || f);
        this._notifyCameraChange();
    }

    _buildSphereGraph(graphNodes, graphEdges, groupColors) {
        this.nodeMap.clear();

        // Clear existing 3D meshes
        while (this.nodeGroup.children.length > 0) {
            this.nodeGroup.remove(this.nodeGroup.children[0]);
        }
        while (this.edgeGroup.children.length > 0) {
            this.edgeGroup.remove(this.edgeGroup.children[0]);
        }
        while (this.particleGroup.children.length > 0) {
            this.particleGroup.remove(this.particleGroup.children[0]);
        }
        if (this.ribbonGroup) {
            while (this.ribbonGroup.children.length > 0) {
                const child = this.ribbonGroup.children[0];
                if (child.geometry) child.geometry.dispose();
                this.ribbonGroup.remove(child);
            }
        }
        if (this.pulsePoints) {
            this.scene.remove(this.pulsePoints);
            if (this.pulsePoints.geometry) this.pulsePoints.geometry.dispose();
            this.pulsePoints = null;
        }
        this.interactiveMeshes = [];
        this.synapticBoutons = [];

        if (this.coreGroup) {
            this.coreGroup.visible = true;
        }

        // 1. Calculate 3D Spherical Positions for Nodes (Planetary Cortex)
        const planetRadius = 210;

        const isProjectGraph = graphNodes.some(n => n.isCentral || (n.id.startsWith('proj_') && graphNodes.length < 150));

        // Modo hierárquico: nós trazem posição pré-calculada (hpos) e parentId
        this.isHierarchy = graphNodes.some(n => n.hpos);
        this.parentOf = new Map();
        this.childrenOf = new Map();
        this.pathEdges = null;

        // Group continental sectors on the sphere: (polar theta & azimuth phi)
        const groupSectors = {
            'core': { theta: 0, phi: 0.35, r: planetRadius * 1.05 },
            'rules': { theta: -0.7, phi: 0.85, r: planetRadius },
            'skills': { theta: 0.7, phi: 0.85, r: planetRadius },
            'agents': { theta: 0.0, phi: 0.8, r: planetRadius },
            'ai': { theta: 0.0, phi: 1.45, r: planetRadius * 0.95 },
            'knowledge': { theta: -0.85, phi: 2.1, r: planetRadius },
            'projects': { theta: 0.85, phi: 2.1, r: planetRadius },
            'memory': { theta: -0.3, phi: 2.7, r: planetRadius * 1.05 },
            'decisions': { theta: 0.3, phi: 2.7, r: planetRadius * 1.05 },
            'templates': { theta: -1.3, phi: 1.5, r: planetRadius },
            'docs': { theta: 1.3, phi: 1.5, r: planetRadius }
        };

        const groupCounts = {};
        for (const n of graphNodes) {
            groupCounts[n.group] = (groupCounts[n.group] || 0) + 1;
        }
        const groupIndices = {};

        let localIdx = 0;
        const localNodes = graphNodes.filter((n, i) => !n.isCentral && n.id !== 'brain' && !(i === 0 && n.id.startsWith('proj_')) && (n.group === 'projects' || (n.path && !n.path.includes('/RESEARCH/'))));
        let researchIdx = 0;
        const researchNodes = graphNodes.filter(n => !n.isCentral && (n.group === 'research' || (n.path && n.path.includes('/RESEARCH/'))));
        let fwIdx = 0;
        const fwNodes = graphNodes.filter(n => !n.isCentral && (n.group === 'rules' || n.group === 'skills' || (n.group === 'knowledge' && n.id.startsWith('fw_'))));

        this.nodes = graphNodes.map((n, i) => {
            const isCentral = n.isCentral || n.id === 'brain' || (isProjectGraph && i === 0 && n.id.startsWith('proj_'));
            let pos3D;

            if (this.isHierarchy && n.hpos) {
                pos3D = new THREE.Vector3(n.hpos.x, n.hpos.y, n.hpos.z);
            } else if (isCentral) {
                pos3D = new THREE.Vector3(0, 0, 0);
            } else if (isProjectGraph) {
                const isResearch = n.group === 'research' || (n.path && n.path.includes('/RESEARCH/'));
                const isFw = n.group === 'rules' || n.group === 'skills' || (n.group === 'knowledge' && n.id.startsWith('fw_'));

                if (isFw) {
                    const idx = fwIdx++;
                    const count = Math.max(1, fwNodes.length);
                    const theta = (count > 1) ? (-Math.PI * 0.65 + (idx / (count - 1)) * Math.PI * 1.3) : 0;
                    const phi = 0.72 + (idx % 2 === 0 ? 0.12 : -0.12);
                    const r = planetRadius * 1.05 + (Math.random() - 0.5) * 15;
                    pos3D = new THREE.Vector3(
                        r * Math.sin(phi) * Math.sin(theta),
                        r * Math.cos(phi),
                        r * Math.sin(phi) * Math.cos(theta)
                    );
                } else if (isResearch) {
                    const idx = researchIdx++;
                    const count = Math.max(1, researchNodes.length);
                    const theta = (idx / count) * Math.PI * 2 + 0.3;
                    const phi = 2.05 + (idx % 2 === 0 ? 0.22 : -0.22);
                    const r = planetRadius * 1.0 + (Math.random() - 0.5) * 20;
                    pos3D = new THREE.Vector3(
                        r * Math.sin(phi) * Math.sin(theta),
                        r * Math.cos(phi),
                        r * Math.sin(phi) * Math.cos(theta)
                    );
                } else {
                    const idx = localIdx++;
                    const count = Math.max(1, localNodes.length);
                    const theta = (idx / count) * Math.PI * 2;
                    const phi = Math.PI * 0.5 + (idx % 2 === 0 ? 0.26 : -0.26);
                    const r = planetRadius * 0.95 + (Math.random() - 0.5) * 20;
                    pos3D = new THREE.Vector3(
                        r * Math.sin(phi) * Math.sin(theta),
                        r * Math.cos(phi),
                        r * Math.sin(phi) * Math.cos(theta)
                    );
                }
            } else {
                const idx = groupIndices[n.group] || 0;
                groupIndices[n.group] = idx + 1;
                const count = groupCounts[n.group] || 1;
                const sector = groupSectors[n.group] || { theta: 0, phi: Math.PI / 2, r: planetRadius };

                const angleOffset = (idx / count) * Math.PI * 0.75 - Math.PI * 0.375;
                const r = sector.r + (Math.random() - 0.5) * 25;
                const phi = sector.phi + (idx % 2 === 0 ? 0.22 : -0.22) * (idx / count);
                const theta = sector.theta + angleOffset;

                pos3D = new THREE.Vector3(
                    r * Math.sin(phi) * Math.sin(theta),
                    r * Math.cos(phi),
                    r * Math.sin(phi) * Math.cos(theta)
                );
            }

            const colors = this.groupColors[n.group] || {
                fill: '#6366f1',
                stroke: '#a78bfa',
                glow: 'rgba(99, 102, 241, 0.4)'
            };

            const nodeObj = {
                ...n,
                isCentral: isCentral,
                position: pos3D,
                initialPos: pos3D.clone(),
                ph: pos3D.x * 0.035 + pos3D.y * 0.03 + pos3D.z * 0.04 + Math.random(),
                velocity: new THREE.Vector3(),
                colors: colors,
                mesh: null,
                glowSprite: null,
                glowSprite2: null,
                somaShell: null,
                somaShellMat: null,
                nucleusGroup: null,
                nucleusMat: null,
                labelSprite: null,
                iconSprite: null,
                outerRing: null
            };

            this.nodeMap.set(n.id, nodeObj);
            return nodeObj;
        });

        if (this.isHierarchy) {
            for (const node of this.nodes) {
                if (node.parentId) {
                    this.parentOf.set(node.id, node.parentId);
                    if (!this.childrenOf.has(node.parentId)) this.childrenOf.set(node.parentId, []);
                    this.childrenOf.get(node.parentId).push(node.id);
                }
            }
        }

        this._relax3DNodes();

        for (const node of this.nodes) {
            if (node.isCentral) {
                node.position.set(0, 0, 0);
                node.homePos = new THREE.Vector3(0, 0, 0);
                node.mass = 999999;
            } else {
                node.homePos = node.position.clone();
                node.mass = (node.size >= 14 ? 2.5 : 1.2);
            }
            node.velocity = new THREE.Vector3(0, 0, 0);
        }

        this._fitCameraToGraph();

        for (const node of this.nodes) {
            node.neighbors = [];
        }
        for (const e of graphEdges) {
            const fromNode = this.nodeMap.get(e.from);
            const toNode = this.nodeMap.get(e.to);
            if (fromNode && toNode) {
                fromNode.neighbors.push(toNode);
                toNode.neighbors.push(fromNode);
            }
        }

        for (const node of this.nodes) {
            this._create3DNode(node);
        }

        this.edges = graphEdges.map(e => {
            const fromNode = this.nodeMap.get(e.from);
            const toNode = this.nodeMap.get(e.to);
            if (!fromNode || !toNode) return null;

            const edgeObj = {
                from: e.from,
                to: e.to,
                fromNode,
                toNode,
                curve: null,
                lineMesh: null,
                restLength: fromNode.position.distanceTo(toNode.position)
            };

            this._create3DEdge(edgeObj);
            return edgeObj;
        }).filter(Boolean);

        // 5. Build 3D Synaptic Pulse Particles
        this._init3DParticles();

        this._notifyCameraChange();
    }

    _relax3DNodes() {
        if (this.isHierarchy) {
            // Relaxamento com resfriamento: preserva a camada de profundidade (±14 de folga radial)
            const nodes = this.nodes.filter(n => !n.isCentral);
            for (const n of nodes) n._r = n.position.length();
            const iterations = 60;
            const diff = new THREE.Vector3();
            const force = new THREE.Vector3();
            for (let iter = 0; iter < iterations; iter++) {
                const strength = 0.4 - (iter / iterations) * 0.3;
                for (let i = 0; i < nodes.length; i++) {
                    const na = nodes[i];
                    force.set(0, 0, 0);
                    for (let j = 0; j < nodes.length; j++) {
                        if (i === j) continue;
                        const nb = nodes[j];
                        diff.subVectors(na.position, nb.position);
                        const dist = diff.length() || 0.01;
                        const minDist = this._minSeparation(na, nb);
                        if (dist < minDist) {
                            force.addScaledVector(diff, ((minDist - dist) / dist) * strength);
                        }
                    }
                    na.position.add(force);
                    if (na._r > 0) {
                        const r = na.position.length();
                        const clamped = Math.min(na._r + 14, Math.max(na._r - 14, r));
                        na.position.setLength(clamped);
                    }
                }
            }
            return;
        }

        const iterations = 45;
        const nodes = this.nodes.filter(n => !n.isCentral && n.id !== 'brain');

        for (let iter = 0; iter < iterations; iter++) {
            for (let i = 0; i < nodes.length; i++) {
                const na = nodes[i];
                const force = new THREE.Vector3();

                for (let j = 0; j < nodes.length; j++) {
                    if (i === j) continue;
                    const nb = nodes[j];
                    const diff = new THREE.Vector3().subVectors(na.position, nb.position);
                    const dist = diff.length() || 1;
                    const minDist = (na.size + nb.size) * 3.5;

                    if (dist < minDist) {
                        const rep = (minDist - dist) / dist;
                        force.add(diff.multiplyScalar(rep * 0.4));
                    }
                }

                na.position.add(force);

                // Keep bounded within spherical shell radius (180 - 270)
                const currentR = na.position.length();
                if (currentR < 170) na.position.setLength(170);
                if (currentR > 280) na.position.setLength(280);
            }
        }
    }

    _minSeparation(na, nb) {
        let base = (na.size + nb.size) * 1.5;
        if (na.isFolder && nb.isFolder) {
            base += 32;
        } else if (na.isFolder || nb.isFolder) {
            base += 16;
        } else {
            base += 8;
        }
        return base;
    }

    _fitCameraToGraph() {
        let maxDist = 200;
        for (const n of this.nodes) {
            if (n.position) {
                const d = n.position.length();
                if (d > maxDist) maxDist = d;
            }
        }
        const fitCamDist = Math.max(520, Math.round(maxDist * 1.6));
        this.defaultCameraPos.set(0, Math.round(fitCamDist * 0.12), fitCamDist);
        this.controls.maxDistance = Math.max(1600, fitCamDist * 2.2);
        this.labelNearDist = Math.round(fitCamDist * 0.42);

        if (!this._cameraFitted) {
            this.camera.position.copy(this.defaultCameraPos);
            this.controls.target.copy(this.defaultTargetPos);
            this.controls.update();
            this._cameraFitted = true;
        }
    }

    static getSavedNodeStyle() {
        try {
            return localStorage.getItem('ai_second_brain_node_style') || 'neuron';
        } catch (e) {
            return 'neuron';
        }
    }

    setNodeStyle(style) {
        if (style !== 'sphere' && style !== 'neuron') return;
        this.nodeStyle = style;
        try {
            localStorage.setItem('ai_second_brain_node_style', style);
        } catch (e) {}

        if (this.rawGraphNodes) {
            this.loadData(this.rawGraphNodes, this.rawGraphEdges, this.groupColors);
        }
    }

    toggleNodeStyle() {
        const next = this.nodeStyle === 'neuron' ? 'sphere' : 'neuron';
        this.setNodeStyle(next);
        return next;
    }

    _hashString(str) {
        let hash = 0;
        const s = String(str || '');
        for (let i = 0; i < s.length; i++) {
            hash = ((hash << 5) - hash) + s.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    _rebuildAllNodeMeshes() {
        this.synapticBoutons = [];

        if (this.coreGroup) {
            this.coreGroup.visible = (this.nodeStyle !== 'neuron');
        }

        // Atualiza conexões vizinhas a partir das arestas ativas
        for (const node of this.nodes) {
            node.neighbors = [];
        }
        for (const edge of this.edges) {
            if (edge.fromNode && edge.toNode) {
                edge.fromNode.neighbors.push(edge.toNode);
                edge.toNode.neighbors.push(edge.fromNode);
            }
        }

        for (const node of this.nodes) {
            if (!node.mesh) continue;
            const toRemove = [];
            for (const child of node.mesh.children) {
                if (child !== node.labelSprite && child !== node.iconSprite) {
                    toRemove.push(child);
                }
            }
            for (const child of toRemove) {
                node.mesh.remove(child);
            }
            node.somaMesh = null;
            node.nucleusMesh = null;
            node.bulbMesh = null;
            node.flareSprite = null;
            node.dendritesGroup = null;
            node.outerRing = null;
            node.glowSprite = null;
            node.nucRing = null;
            node.nucleolus = null;
            node.nucAura = null;

            this._populateNodeVisuals(node);

            if (node.labelSprite) {
                const isDocNeuron = (this.nodeStyle === 'neuron') && !node.isFolder && !node.isCentral && node.id !== 'brain';
                node.labelSprite.position.set(0, isDocNeuron ? 4.5 : ((node.visualRadius || 8) + 8.5), 0);
                const aspect = node.labelSprite.scale.x / (node.labelSprite.scale.y || 1);
                const h = isDocNeuron ? 4.2 : (this.nodeStyle === 'neuron' ? 7.2 : 9.8);
                node.labelSprite.scale.set(h * aspect, h, 1);
            }
        }
    }

    _populateNodeVisuals(node) {
        const colorHex = parseInt(node.colors.fill.replace('#', '0x'), 16);
        const strokeHex = parseInt(node.colors.stroke.replace('#', '0x'), 16);
        let radius;

        if (this.nodeStyle === 'neuron') {
            const isFolderOrHub = node.isFolder || node.isCentral || node.id === 'brain';
            if (isFolderOrHub) {
                // É um NEURÔNIO PRINCIPAL (Soma biológico com Núcleo Esmeralda e prolongamentos)
                if (node.isCentral || node.id === 'brain') {
                    radius = 12.0;
                } else {
                    radius = Math.min(10.2, 6.6 + (node.size || 10) * 0.15);
                }
                node.visualRadius = radius;
                this._buildNeuronVisuals(node, radius, colorHex, strokeHex);

                // Halo de difusão bioluminescente suave ao redor do soma
                const glowMat = new THREE.SpriteMaterial({
                    map: this.glowTexture,
                    color: 0xdf9f35,
                    transparent: true,
                    opacity: 0.28,
                    blending: THREE.AdditiveBlending
                });
                const glow = new THREE.Sprite(glowMat);
                const glowScale = radius * 2.0;
                glow.scale.set(glowScale, glowScale, 1);
                node.mesh.add(glow);
                node.glowSprite = glow;
            } else {
                // É um DOCUMENTO FINAL (.md) — representação por Botão Sináptico de Luz nas terminações!
                // Idêntico à ilustração conceitual aprovada!
                node.visualRadius = 3.0;
                this._buildSynapticDocumentVisuals(node, colorHex, strokeHex);
            }
        } else {
            // Modo Esferas Clássico
            radius = Math.max(6, (node.size || 10) * 0.95);
            node.visualRadius = radius;
            this._buildSphereVisuals(node, radius, colorHex, strokeHex);

            const glowMat = new THREE.SpriteMaterial({
                map: this.glowTexture,
                color: strokeHex,
                transparent: true,
                opacity: 0.38,
                blending: THREE.AdditiveBlending
            });
            const glow = new THREE.Sprite(glowMat);
            const glowScale = radius * 2.3;
            glow.scale.set(glowScale, glowScale, 1);
            node.mesh.add(glow);
            node.glowSprite = glow;
        }

        if (this.showIcons && node.iconSprite) {
            node.iconSprite.visible = true;
            this._setNodeVisualsVisible(node, false);
        }
    }

    _buildSphereVisuals(node, radius, colorHex, strokeHex) {
        const geo = new THREE.SphereGeometry(radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.52,
            roughness: 0.22,
            metalness: 0.35
        });

        const sphere = new THREE.Mesh(geo, mat);
        sphere.userData = { node: node };
        node.mesh.add(sphere);
        node.somaMesh = sphere;

        // Anel orbital rotativo apenas para pastas e Sol central
        if (node.size >= 14 || node.id === 'brain') {
            const ringGeo = new THREE.TorusGeometry(radius * 1.35, 0.7, 8, 48);
            const ringMat = new THREE.MeshBasicMaterial({
                color: strokeHex,
                transparent: true,
                opacity: 0.52
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.userData = { node: node };
            node.mesh.add(ring);
            node.outerRing = ring;
        }
    }

    _buildSynapticDocumentVisuals(node, colorHex, strokeHex) {
        const bulbSize = 1.65; // Delicado botão perolado (idêntico à ilustração)

        // 1. Gema incandescente interna (branco-ouro puro e brilhante, como na ilustração)
        const bulbGeo = new THREE.SphereGeometry(bulbSize, 16, 16);
        const bulbMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffd147,
            emissiveIntensity: 1.5,
            roughness: 0.08,
            metalness: 0.15
        });
        const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
        bulbMesh.userData = { node: node };
        node.mesh.add(bulbMesh);
        node.somaMesh = bulbMesh;
        node.bulbMesh = bulbMesh;

        // 2. Starburst e Corona Dourada delicados (exatamente como na ilustração)
        // 2.1 Corona / Halo esférico dourado suave e quente
        const coronaMat = new THREE.SpriteMaterial({
            map: this.glowTexture,
            color: 0xffaa22,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const coronaSprite = new THREE.Sprite(coronaMat);
        const coronaScale = 7.5;
        coronaSprite.scale.set(coronaScale, coronaScale, 1);
        node.mesh.add(coronaSprite);
        node.glowSprite = coronaSprite;

        // 2.2 Starburst Anamórfico com raios cruzados cintilantes
        const flareMat = new THREE.SpriteMaterial({
            map: this.flareTexture || this.glowTexture,
            color: 0xffd066,
            transparent: true,
            opacity: 0.78,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const rot = Math.random() * Math.PI * 2;
        flareMat.rotation = rot;
        const flareSprite = new THREE.Sprite(flareMat);
        const flareScale = 9.5;
        flareSprite.scale.set(flareScale, flareScale, 1);
        node.mesh.add(flareSprite);
        node.flareSprite = flareSprite;

        // 3. Hit-sphere invisível generosa para facilidade de clique e hover
        const hitGeo = new THREE.SphereGeometry(6.5, 8, 8);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.userData = { node: node };
        node.mesh.add(hitMesh);

        // 4. Registra para o pulso cintilante UAU
        if (this.synapticBoutons) {
            this.synapticBoutons.push({
                flare: flareSprite,
                corona: coronaSprite,
                bulb: bulbMesh,
                baseScale: flareScale,
                baseCoronaScale: coronaScale,
                baseBulbScale: bulbSize,
                baseRot: rot,
                phase: Math.random() * Math.PI * 2,
                speed: 1.2 + Math.random() * 1.4,
                twinkleFreq: 4.8 + Math.random() * 4.5,
                burstFreq: 0.6 + Math.random() * 0.8,
                burstPhase: Math.random() * Math.PI * 2
            });
        }
    }

    _buildNeuronVisuals(node, radius, colorHex, strokeHex) {
        const hexStr = node.colors ? node.colors.fill : '#2cff9a';

        // 1. Organic Undulating Soma Shell with Rim Fresnel Shader (from reference HTML)
        const shellMat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            ...BrainGraph.AB,
            uniforms: { t: { value: 0 } },
            vertexShader: `
                uniform float t;
                varying vec3 N, W;
                void main() {
                    vec3 p = position;
                    p += normal * sin(p.x * 1.6 + t) * sin(p.y * 1.9 + t * 1.1) * sin(p.z * 1.7 + t * 0.9) * 0.35;
                    vec4 m = modelViewMatrix * vec4(p, 1.0);
                    N = normalize(normalMatrix * normal);
                    W = normalize(-m.xyz);
                    gl_Position = projectionMatrix * m;
                }
            `,
            fragmentShader: `
                varying vec3 N, W;
                void main() {
                    float f = pow(1.0 - abs(dot(N, W)), 1.8);
                    gl_FragColor = vec4(mix(vec3(0.55, 0.35, 0.08), vec3(1.0, 0.82, 0.4), f) * (0.3 + 0.6 * f), 0.15 + 0.35 * f);
                }
            `
        });
        const shell = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), shellMat);
        shell.userData = { node: node };
        node.mesh.add(shell);
        node.somaShell = shell;
        node.somaShellMat = shellMat;
        node.somaMesh = shell;

        // 2. Dual-Icosahedron Fluid Plasma Nucleus (from reference HTML)
        const nucleusMat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            ...BrainGraph.AB,
            uniforms: {
                t: { value: 0 },
                c: { value: new THREE.Color(hexStr) }
            },
            vertexShader: `
                uniform float t;
                varying vec3 N, W, P;
                void main() {
                    vec3 p = position;
                    p += normal * (sin(p.x * 3.0 + t) * sin(p.y * 3.4 + t * 1.2) * sin(p.z * 3.1 + t * 0.8) * 0.38 + sin(p.x * 6.0 - t * 1.5 + p.y * 4.0) * 0.1);
                    P = p;
                    vec4 m = modelViewMatrix * vec4(p, 1.0);
                    N = normalize(normalMatrix * normal);
                    W = normalize(-m.xyz);
                    gl_Position = projectionMatrix * m;
                }
            `,
            fragmentShader: `
                uniform float t;
                uniform vec3 c;
                varying vec3 N, W, P;
                void main() {
                    float f = pow(1.0 - abs(dot(N, W)), 1.5);
                    float s = 0.5 + 0.5 * sin(P.x * 7.0 + P.y * 5.0 + t * 2.0) * sin(P.z * 6.0 - t * 1.5 + P.y * 3.0);
                    gl_FragColor = vec4(c * (0.3 + 0.5 * s) + vec3(f * 0.2), 0.2 + 0.3 * f + 0.15 * s);
                }
            `
        });
        const nu = new THREE.Group();
        const o = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 4), nucleusMat);
        const n2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), nucleusMat);
        o.scale.setScalar(radius * 0.62);
        n2.scale.set(radius * 0.34, radius * 0.28, radius * 0.40);
        n2.rotation.set(1, 2, 0);
        nu.add(o, n2);
        nu.userData = { node: node };
        node.mesh.add(nu);
        node.nucleusGroup = nu;
        node.nucleusMat = nucleusMat;

        // 3. Multi-layer Glowing Bio-Auras (from reference HTML)
        const g1 = this._createNeuronSprite(hexStr, radius * 3.2);
        g1.material.opacity = 0.40;
        const g2 = this._createNeuronSprite('#ffb940', radius * 6.0);
        g2.material.opacity = 0.25;
        node.mesh.add(g1);
        node.mesh.add(g2);
        node.glowSprite = g1;
        node.glowSprite2 = g2;

        // 4. Generous Invisible Hit Sphere for reliable interaction
        const hitGeo = new THREE.SphereGeometry(radius * 1.35, 12, 12);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.userData = { node: node };
        node.mesh.add(hitMesh);
    }

    _setNodeVisualsVisible(node, visible) {
        if (!node || !node.mesh) return;
        if (node.somaMesh) node.somaMesh.visible = visible;
        if (node.nucleusGroup) node.nucleusGroup.visible = visible;
        if (node.outerRing) node.outerRing.visible = visible;
        if (node.glowSprite) node.glowSprite.visible = visible;
        if (node.glowSprite2) node.glowSprite2.visible = visible;
    }

    // ── Dual Camera-Facing Ribbon Geometries & Action Potential Pulses ──
    _initNeuronRibbons() {
        if (!this.ribbonGroup) {
            this.ribbonGroup = new THREE.Group();
            this.scene.add(this.ribbonGroup);
        }
        while (this.ribbonGroup.children.length > 0) {
            const c = this.ribbonGroup.children[0];
            if (c.geometry) c.geometry.dispose();
            this.ribbonGroup.remove(c);
        }

        const S = 10;
        this.ribbonSegments = S;
        const edgeCount = this.edges.length;
        if (edgeCount === 0) return;

        const totalVertices = edgeCount * (S + 1) * 2;
        const createRibbon = () => {
            const g = new THREE.BufferGeometry();
            const pos = new Float32Array(totalVertices * 3);
            const col = new Float32Array(totalVertices * 3);
            const ix = [];
            for (let e = 0; e < edgeCount; e++) {
                for (let i = 0; i < S; i++) {
                    const a = (e * (S + 1) + i) * 2;
                    ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
                }
            }
            g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            g.setAttribute('color', new THREE.BufferAttribute(col, 3));
            g.setIndex(ix);
            const mat = new THREE.MeshBasicMaterial({
                vertexColors: true,
                ...BrainGraph.AB,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(g, mat);
            mesh.frustumCulled = false;
            this.ribbonGroup.add(mesh);
            return { geo: g, mesh: mesh };
        };

        this.gH = createRibbon(); // Halo pass (wide, soft)
        this.gC = createRibbon(); // Core pass (sharp, bright)

        for (let i = 0; i < this.edges.length; i++) {
            const e = this.edges[i];
            const isToFolder = e.toNode && e.toNode.isFolder;
            e.w0 = isToFolder ? 1.4 : 0.85;
            e.w1 = isToFolder ? 1.0 : 0.18;
            e.br = 1.0;
            e.k = 0.0;
            e.ph = Math.random() * 6.0;

            const diff = new THREE.Vector3().subVectors(e.toNode.position, e.fromNode.position);
            const up = Math.abs(diff.y) < Math.abs(diff.x) ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
            e.bend = new THREE.Vector3().crossVectors(diff, up).normalize().multiplyScalar(0.12);

            if (e.toNode && e.toNode.colors && e.toNode.colors.fill) {
                const c = new THREE.Color(e.toNode.colors.fill);
                const gold = new THREE.Color(1.0, 0.78, 0.42);
                c.lerp(gold, 0.45);
                e.col = [c.r, c.g, c.b];
            } else {
                e.col = [1.0, 0.78, 0.42];
            }
        }

        this._initActionPulses();
        this._fillRibbon(this.gH, 3.2, 0.16);
        this._fillRibbon(this.gC, 1.0, 0.80);
    }

    _fillRibbon(ribbonData, wm, bm) {
        if (!ribbonData || !ribbonData.geo) return;
        const S = this.ribbonSegments || 10;
        const pos = ribbonData.geo.attributes.position.array;
        const col = ribbonData.geo.attributes.color.array;
        const camPos = this.camera.position;
        const pp = new THREE.Vector3();
        const tg = new THREE.Vector3();
        const sd = new THREE.Vector3();
        const tm = new THREE.Vector3();
        const vv = new THREE.Vector3();
        const t = this.time;

        let k = 0;
        for (let eIdx = 0; eIdx < this.edges.length; eIdx++) {
            const e = this.edges[eIdx];
            const fn = e.fromNode;
            const tn = e.toNode;

            const isVisible = fn && tn && fn.mesh && tn.mesh && fn.mesh.visible !== false && tn.mesh.visible !== false;
            if (!isVisible) {
                for (let i = 0; i <= S; i++) {
                    pos[k] = 0; pos[k+1] = 0; pos[k+2] = 0;
                    col[k] = 0; col[k+1] = 0; col[k+2] = 0;
                    pos[k+3] = 0; pos[k+4] = 0; pos[k+5] = 0;
                    col[k+3] = 0; col[k+4] = 0; col[k+5] = 0;
                    k += 6;
                }
                continue;
            }

            const P = fn.position;
            const C = tn.position;
            tm.copy(P).add(C).multiplyScalar(0.5);
            const dist = P.distanceTo(C);
            const M = tm.clone().addScaledVector(e.bend, dist * (1.0 + 0.25 * Math.sin(t * 0.8 + e.ph)));

            for (let i = 0; i <= S; i++) {
                const u = i / S;
                pp.copy(P).multiplyScalar((1 - u) * (1 - u))
                  .addScaledVector(M, 2 * u * (1 - u))
                  .addScaledVector(C, u * u);

                tg.copy(M).sub(P).multiplyScalar(2 * (1 - u))
                  .addScaledVector(tm.copy(C).sub(M), 2 * u);

                vv.copy(camPos).sub(pp);
                sd.crossVectors(tg, vv).normalize();

                const widthTaper = (e.w0 + (e.w1 - e.w0) * u) * wm * 0.5 * (1.0 + Math.max(e.k || 0, 0) * 1.5);
                sd.multiplyScalar(widthTaper);

                const br = bm * (e.br || 1.0) * (1.0 + (e.k || 0) * 1.6) * (0.6 + 0.4 * (1.0 - u * 0.5));

                for (const s of [1, -1]) {
                    pos[k]     = pp.x + sd.x * s;
                    pos[k + 1] = pp.y + sd.y * s;
                    pos[k + 2] = pp.z + sd.z * s;
                    col[k]     = e.col[0] * br;
                    col[k + 1] = e.col[1] * br;
                    col[k + 2] = e.col[2] * br;
                    k += 3;
                }
            }
        }
        ribbonData.geo.attributes.position.needsUpdate = true;
        ribbonData.geo.attributes.color.needsUpdate = true;
    }

    _initActionPulses() {
        if (this.pulsePoints) {
            this.scene.remove(this.pulsePoints);
            if (this.pulsePoints.geometry) this.pulsePoints.geometry.dispose();
            this.pulsePoints = null;
        }
        const edgeCount = this.edges.length;
        if (edgeCount === 0) return;

        const np = Math.min(180, Math.max(25, edgeCount * 2));
        this.pulses = Array.from({ length: np }, () => ({
            e: this.edges[Math.floor(Math.random() * edgeCount)],
            u: Math.random(),
            v: 1.2 + Math.random() * 1.4
        }));

        this.pPos = new Float32Array(np * 3);
        const pg = new THREE.BufferGeometry();
        pg.setAttribute('position', new THREE.BufferAttribute(this.pPos, 3));
        this.pulsePoints = new THREE.Points(
            pg,
            new THREE.PointsMaterial({
                map: BrainGraph.G('#fff1b8'),
                size: 2.2,
                ...BrainGraph.AB,
                transparent: true,
                depthWrite: false
            })
        );
        this.pulsePoints.frustumCulled = false;
        this.scene.add(this.pulsePoints);
    }

    _setNodeVisualsVisible(node, visible) {
        if (!node || !node.mesh) return;
        if (node.somaMesh) node.somaMesh.visible = visible;
        if (node.nucleusMesh) node.nucleusMesh.visible = visible;
        if (node.dendritesGroup) node.dendritesGroup.visible = visible;
        if (node.outerRing) node.outerRing.visible = visible;
        if (node.glowSprite) node.glowSprite.visible = visible;
    }

    _create3DNode(node) {
        const radius = Math.max(6, (node.size || 10) * 0.95);

        // Container Group do Nó
        const mesh = new THREE.Group();
        mesh.position.copy(node.position);
        mesh.userData = { node: node };
        this.nodeGroup.add(mesh);
        node.mesh = mesh;
        this.interactiveMeshes.push(mesh);

        // Constrói os elementos visuais (esferas ou neurônios)
        this._populateNodeVisuals(node);

        // 4. Billboard 3D Text Label
        node.labelSprite = this._createLabelSprite(node.label, node.visualRadius || radius, node.colors.fill);
        const isDocNeuron = (this.nodeStyle === 'neuron') && !node.isFolder && !node.isCentral && node.id !== 'brain';
        node.labelSprite.position.set(0, isDocNeuron ? 4.5 : (radius + 8.5), 0);
        // Inicialmente visível apenas para pastas e Sol; arquivos aparecem por LOD/foco
        node.labelSprite.visible = Boolean(node.isFolder || node.isCentral);
        mesh.add(node.labelSprite);

        // 5. Emoji Icon Sprite (hidden by default, toggled via setShowIcons)
        if (node.icon) {
            node.iconSprite = this._createIconSprite(node.icon, radius);
            node.iconSprite.visible = this.showIcons;
            mesh.add(node.iconSprite);

            if (this.showIcons) {
                this._setNodeVisualsVisible(node, false);
            }
        }
    }

    _createLabelSprite(text, nodeRadius, fillColor) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const isNeuron = this.nodeStyle === 'neuron';
        const isDoc = nodeRadius <= 4;
        const fontSize = isNeuron ? (isDoc ? 22 : 26) : 28;
        ctx.font = `600 ${fontSize}px Inter, -apple-system, sans-serif`;

        // Trunca rótulos muito extensos com reticências para manter harmonia espacial
        let displayText = String(text || '');
        if (displayText.length > 28) {
            displayText = displayText.slice(0, 26).trim() + '…';
        }

        const textMetrics = ctx.measureText(displayText);
        const textWidth = Math.ceil(textMetrics.width);
        const padding = isNeuron ? 8 : 16;

        canvas.width = textWidth + padding * 2;
        canvas.height = fontSize + padding * 2;

        // Re-apply font after resize
        ctx.font = `600 ${fontSize}px Inter, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        if (isNeuron) {
            // Em modo neurônio: TIPOGRAFIA FLUTUANTE PURA E LIMPA (SEM CAIXA PRETA!), exatamente como na ilustração!
            ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(displayText, cx, cy);
        } else {
            // Glassmorphic pill backing para o modo planetário esferas
            const w = canvas.width - 4;
            const h = canvas.height - 4;
            const r = 8;

            ctx.fillStyle = 'rgba(10, 10, 16, 0.82)';
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.roundRect(2, 2, w, h, r);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(displayText, cx, cy);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 0.95,
            depthTest: false // Ensures label stays crisp and legible over geometry
        });

        const sprite = new THREE.Sprite(spriteMat);
        const aspect = canvas.width / canvas.height;
        const spriteHeight = isNeuron ? (isDoc ? 4.2 : 7.2) : (isDoc ? 5.8 : 9.8);
        sprite.scale.set(spriteHeight * aspect, spriteHeight, 1);

        return sprite;
    }

    _createIconSprite(emoji, nodeRadius) {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Draw circular backing with subtle glass effect
        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.42;

        // Outer glass ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, 0.12)';
        ctx.fill();

        // Inner dark glass circle
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10, 10, 16, 0.75)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw emoji centered
        ctx.font = `${Math.round(size * 0.52)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, cx, cy + 2);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 1.0,
            depthTest: false
        });

        const sprite = new THREE.Sprite(spriteMat);
        const scale = Math.max(18, nodeRadius * 2.5);
        sprite.scale.set(scale, scale, 1);

        return sprite;
    }

    setShowIcons(show) {
        this.showIcons = show;

        for (const node of this.nodes) {
            if (!node.mesh) continue;

            if (show && node.iconSprite) {
                node.iconSprite.visible = true;
                this._setNodeVisualsVisible(node, false);
            } else {
                if (node.iconSprite) node.iconSprite.visible = false;
                this._setNodeVisualsVisible(node, true);
            }
        }
    }

    _create3DEdge(edge) {
        const p1 = edge.fromNode.position;
        const p2 = edge.toNode.position;

        const isNeuron = this.nodeStyle === 'neuron';
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        if (isNeuron) {
            const diff = new THREE.Vector3().subVectors(p2, p1);
            const up = Math.abs(diff.y) < Math.abs(diff.x) ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
            const curl = new THREE.Vector3().crossVectors(diff, up).normalize().multiplyScalar(diff.length() * 0.10);
            mid.add(curl);
        } else {
            const elevation = 20 + mid.length() * 0.12;
            mid.add(mid.clone().normalize().multiplyScalar(elevation));
        }

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        edge.curve = curve;

        let strokeColor = 0x8b5cf6;
        if (edge.toNode && edge.toNode.colors) {
            strokeColor = parseInt(edge.toNode.colors.stroke.replace('#', '0x'), 16);
        } else if (edge.fromNode && edge.fromNode.colors) {
            strokeColor = parseInt(edge.fromNode.colors.stroke.replace('#', '0x'), 16);
        }
        edge.baseColor = strokeColor;

        // Line mesh for classic sphere mode
        const points = curve.getPoints(24);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        let baseOpacity = edge.toNode.isFolder ? 0.50 : 0.16;
        edge.baseOpacity = baseOpacity;

        const mat = new THREE.LineBasicMaterial({
            color: strokeColor,
            transparent: true,
            opacity: baseOpacity,
            blending: THREE.AdditiveBlending
        });
        const line = new THREE.Line(geo, mat);
        line.visible = !isNeuron; // Hidden in neuron mode (handled by dual ribbons)
        this.edgeGroup.add(line);
        edge.lineMesh = line;
    }

    _updateEdgeCurve(edge) {
        if (!edge || !edge.fromNode || !edge.toNode) return;
        const p1 = edge.fromNode.position;
        const p2 = edge.toNode.position;

        const isNeuron = this.nodeStyle === 'neuron';
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        if (isNeuron) {
            const diff = new THREE.Vector3().subVectors(p2, p1);
            const up = Math.abs(diff.y) < Math.abs(diff.x) ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
            const curl = new THREE.Vector3().crossVectors(diff, up).normalize().multiplyScalar(diff.length() * 0.10);
            mid.add(curl);
        } else {
            const elevation = 20 + mid.length() * 0.12;
            mid.add(mid.clone().normalize().multiplyScalar(elevation));
        }

        edge.curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);

        if (edge.lineMesh && edge.lineMesh.geometry && edge.lineMesh.geometry.setFromPoints) {
            const points = edge.curve.getPoints(24);
            edge.lineMesh.geometry.setFromPoints(points);
        }
    }

    _rebuildAllEdgeMeshes() {
        while (this.edgeGroup.children.length > 0) {
            const child = this.edgeGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            this.edgeGroup.remove(child);
        }
        for (const edge of this.edges) {
            edge.lineMesh = null;
            edge.tubeMesh = null;
            this._create3DEdge(edge);
        }
        if (this.nodeStyle === 'neuron') {
            this._initNeuronRibbons();
        }
    }

    _updateAllEdges() {
        for (let i = 0; i < this.edges.length; i++) {
            this._updateEdgeCurve(this.edges[i]);
        }
        if (this.nodeStyle === 'neuron' && this.gH && this.gC) {
            this._fillRibbon(this.gH, 3.2, 0.16);
            this._fillRibbon(this.gC, 1.0, 0.80);
        }
    }

    // ── 3D Dynamic Spring Physics Engine ──────────────
    // Recreates the fluid elastic drag feel where moving a node pulls connected nodes!
    _step3DPhysics() {
        if (!this.isDraggingNode && this.physicsEnergy < 0.001) return;

        // 1. Hooke's Law Spring Tension along connected edges
        // Pulls connected neighbor nodes along when a node is dragged!
        for (let i = 0; i < this.edges.length; i++) {
            const edge = this.edges[i];
            const na = edge.fromNode;
            const nb = edge.toNode;
            if (!na || !nb) continue;

            const diff = new THREE.Vector3().subVectors(nb.position, na.position);
            const dist = diff.length() || 0.001;
            const rest = edge.restLength || 100;
            const displacement = dist - rest;
            const forceMag = displacement * this.kSpring;

            const forceVec = diff.clone().normalize().multiplyScalar(forceMag);

            // Pull na towards nb if not pinned by cursor
            if (na !== this.dragNode) {
                na.velocity.add(forceVec.clone().multiplyScalar(1 / (na.mass || 1)));
            }
            // Pull nb towards na if not pinned by cursor
            if (nb !== this.dragNode) {
                nb.velocity.sub(forceVec.clone().multiplyScalar(1 / (nb.mass || 1)));
            }
        }

        // 2. Pairwise soft repulsion to keep pulled nodes from overlapping
        const nodeCount = this.nodes.length;
        for (let i = 0; i < nodeCount; i++) {
            const na = this.nodes[i];
            if (na === this.dragNode) continue;

            for (let j = i + 1; j < nodeCount; j++) {
                const nb = this.nodes[j];
                const repDiff = new THREE.Vector3().subVectors(na.position, nb.position);
                const repDist = repDiff.length() || 0.001;
                const minDist = (na.size + nb.size) * 2.6;

                if (repDist < minDist) {
                    const repMag = ((minDist - repDist) / minDist) * 0.9;
                    const repVec = repDiff.normalize().multiplyScalar(repMag);
                    na.velocity.add(repVec);
                    if (nb !== this.dragNode) {
                        nb.velocity.sub(repVec);
                    }
                }
            }
        }

        // 3. Elastic tether pulling nodes back toward their celestial home positions
        for (let i = 0; i < nodeCount; i++) {
            const node = this.nodes[i];
            if (node.isCentral || node.id === 'brain') {
                if (node !== this.dragNode) {
                    node.position.set(0, 0, 0);
                    node.velocity.set(0, 0, 0);
                    if (node.mesh) node.mesh.position.set(0, 0, 0);
                }
                continue;
            }

            if (node === this.dragNode) continue;

            const homeDiff = new THREE.Vector3().subVectors(node.homePos, node.position);
            node.velocity.add(homeDiff.multiplyScalar(this.kHome));

            // Damping (viscous friction)
            node.velocity.multiplyScalar(this.damping);

            // Velocity clamp
            const speed = node.velocity.length();
            if (speed > 25) {
                node.velocity.setLength(25);
            }

            // Apply movement
            node.position.add(node.velocity);
            node.mesh.position.copy(node.position);
        }

        // 4. Dynamically re-bend all synaptic edge curves
        this._updateAllEdges();

        // 5. Physics kinetic energy decay when not actively dragging
        if (!this.isDraggingNode) {
            this.physicsEnergy *= 0.94;
            if (this.physicsEnergy < 0.002) {
                this.physicsEnergy = 0;
                for (let i = 0; i < nodeCount; i++) {
                    this.nodes[i].velocity.set(0, 0, 0);
                }
            }
        }
    }

    _calcParticleSpeed(edge) {
        let edgeLen = 120;
        if (edge && edge.curve && typeof edge.curve.getLength === 'function') {
            try {
                edgeLen = edge.curve.getLength();
            } catch (e) {
                edgeLen = 120;
            }
        } else if (edge && edge.fromNode && edge.toNode) {
            edgeLen = edge.fromNode.position.distanceTo(edge.toNode.position);
        }
        // Velocidade linear suave e calma em unidades 3D por frame (~3x mais lento)
        // Proporciona uma travessia suave e serena tanto no grafo global quanto no grafo de projetos
        const worldSpeed = 0.42 + Math.random() * 0.22;
        return worldSpeed / Math.max(50, edgeLen);
    }

    _init3DParticles() {
        this.particles = [];

        // Densidade equilibrada proporcional ao número de conexões do grafo:
        // Evita hiperatividade e estroboscópio em grafos de projeto com poucas arestas
        const edgeCount = this.edges.length;
        if (edgeCount === 0) return;

        const count = Math.max(6, Math.min(50, Math.round(edgeCount * 0.40)));

        for (let i = 0; i < count; i++) {
            const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
            const color = (edge.toNode && edge.toNode.colors)
                ? parseInt(edge.toNode.colors.stroke.replace('#', '0x'), 16)
                : 0xc4b5fd;

            // Feixe de luz bioluminescente puro (Sprite com gradiente aditivo e núcleo branco)
            const spriteMat = new THREE.SpriteMaterial({
                map: this.glowTexture,
                color: color,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(spriteMat);
            const size = 2.8 + Math.random() * 1.2; // Pequeno e concentrado
            sprite.scale.set(size, size, 1);
            this.particleGroup.add(sprite);

            this.particles.push({
                edge: edge,
                progress: Math.random(),
                speed: this._calcParticleSpeed(edge),
                baseSize: size,
                sprite: sprite
            });
        }
    }

    _getInteractiveMeshes() {
        return this.interactiveMeshes.filter(m => m.visible !== false);
    }

    _getNodeFromObject(obj) {
        let cur = obj;
        while (cur) {
            if (cur.userData && cur.userData.node) return cur.userData.node;
            cur = cur.parent;
        }
        return null;
    }

    // ── Interaction & Events ──────────────────────────
    _setupEvents() {
        window.addEventListener('resize', () => {
            this._setupCanvas();
        });

        // Pointer move for Hover & 3D Node Dragging
        this.canvas.addEventListener('pointermove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;

            // Normalized device coords (-1 to +1)
            this.mouse.x = (px / this.width) * 2 - 1;
            this.mouse.y = -(py / this.height) * 2 + 1;

            if (Math.hypot(px - this.pointerDownPos.x, py - this.pointerDownPos.y) > 6) {
                this.hasDraggedPointer = true;
            }

            // 1. If currently dragging a node in neuron mode
            if (this.grabNeuronNode) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragIntersection)) {
                    this.grabNeuronNode.off.copy(this.dragIntersection).sub(this.grabNeuronNode.p);
                    this.grabNeuronNode.vl.set(0, 0, 0);
                }
                return;
            }

            // If currently dragging a 3D node in sphere mode
            if (this.isDraggingNode && this.dragNode) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragIntersection)) {
                    this.dragNode.position.copy(this.dragIntersection);
                    this.dragNode.mesh.position.copy(this.dragIntersection);
                    this.dragNode.velocity.set(0, 0, 0);
                    this.physicsEnergy = 1.0;
                    this._step3DPhysics();
                }
                return;
            }

            // 2. Raycast to detect hovered node
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this._getInteractiveMeshes(), true);

            if (intersects.length > 0) {
                const hitObj = intersects[0].object;
                const node = this._getNodeFromObject(hitObj);

                if (this.nodeStyle === 'neuron') {
                    this.hoveredNeuronHit = hitObj.userData;
                    if (hitObj.userData && hitObj.userData.file && hitObj.userData.file.leaf && hitObj.userData.file.leaf.pe) {
                        this.hovLink = hitObj.userData.file.leaf.pe;
                    } else {
                        this.hovLink = null;
                    }
                    this.canvas.style.cursor = 'pointer';
                }

                if (node && this.hoveredNode !== node) {
                    this._setHoveredNode(node, px, py);
                } else if (node) {
                    this._updateTooltipPos(px, py);
                } else if (!node && this.hoveredNode) {
                    this._clearHover();
                }
            } else {
                if (this.nodeStyle === 'neuron') {
                    this.hoveredNeuronHit = null;
                    this.hovLink = null;
                    this.canvas.style.cursor = (this.controls && this.controls.enabled) ? 'grab' : 'default';
                }
                if (this.hoveredNode) {
                    this._clearHover();
                }
            }
        });

        // Pointer down
        this.canvas.addEventListener('pointerdown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;

            this.pointerDownPos = { x: px, y: py };
            this.hasDraggedPointer = false;

            // Check if user clicked on a 3D node to drag it
            if (e.button === 0) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this._getInteractiveMeshes(), true);

                if (intersects.length > 0) {
                    const hitObj = intersects[0].object;
                    const node = this._getNodeFromObject(hitObj);

                    if (this.nodeStyle === 'neuron') {
                        const leaf = hitObj.userData && (hitObj.userData.leaf || (hitObj.userData.file && hitObj.userData.file.leaf));
                        const soma = hitObj.userData && (hitObj.userData.so || (hitObj.userData.soma && hitObj.userData.soma.so));
                        const grabTarget = leaf || soma;

                        if (grabTarget) {
                            this.grabNeuronNode = grabTarget;
                            this.controls.enabled = false;
                            this.canvas.style.cursor = 'grabbing';

                            const planeNormal = new THREE.Vector3();
                            this.camera.getWorldDirection(planeNormal).negate();
                            this.dragPlane.setFromNormalAndCoplanarPoint(planeNormal, grabTarget.cur || grabTarget.p);
                        }
                    } else if (node) {
                        this.dragNode = node;
                        this.isDraggingNode = true;
                        this.physicsEnergy = 1.0;

                        const planeNormal = new THREE.Vector3();
                        this.camera.getWorldDirection(planeNormal).negate();
                        this.dragPlane.setFromNormalAndCoplanarPoint(planeNormal, this.dragNode.position);

                        this.controls.enabled = false;
                        this.canvas.style.cursor = 'grabbing';
                    }
                }
            }
        });

        // Pointer up
        window.addEventListener('pointerup', () => {
            if (this.grabNeuronNode) {
                this.grabNeuronNode = null;
                this.controls.enabled = true;
                this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
            }
            if (this.isDraggingNode) {
                this.isDraggingNode = false;
                this.dragNode = null;
                this.controls.enabled = true;
                this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
                this.physicsEnergy = 1.0;
            }
        });

        // Click on node: ONLY select & highlight, do NOT navigate away!
        this.canvas.addEventListener('click', (e) => {
            if (this.hasDraggedPointer) return;

            const rect = this.canvas.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this._getInteractiveMeshes(), true);

            if (intersects.length > 0) {
                const hitObj = intersects[0].object;
                const node = this._getNodeFromObject(hitObj);

                if (this.nodeStyle === 'neuron') {
                    if (hitObj.userData && hitObj.userData.file) {
                        this.activeNeuronFile = hitObj.userData.file;
                        if (hitObj.userData.file.leaf && hitObj.userData.file.leaf.pe) {
                            this.selLink = hitObj.userData.file.leaf.pe;
                        }
                    } else if (hitObj.userData && (hitObj.userData.folder || hitObj.userData.isFolder)) {
                        const fo = hitObj.userData.folder || (hitObj.userData.node && hitObj.userData.node.id);
                        if (fo) this.focusCategory(fo);
                    }
                }

                if (node) {
                    this.selectedNode = node;
                    this._setHoveredNode(node, px, py);
                    if (this.onNodeClick) {
                        this.onNodeClick(node);
                    }
                }
            } else {
                if (this.nodeStyle === 'neuron') {
                    this.activeNeuronFile = null;
                    this.selLink = null;
                }
                this.selectedNode = null;
                this._clearHover();
                if (this.onNodeClick) {
                    this.onNodeClick(null);
                }
            }
        });

        // Double click: Open / Navigate to node (or reset planet on empty background)
        this.canvas.addEventListener('dblclick', () => {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this._getInteractiveMeshes(), true);

            if (intersects.length > 0) {
                const node = this._getNodeFromObject(intersects[0].object);
                if (node) {
                    if (this.onNodeDblClick) {
                        this.onNodeDblClick(node);
                    } else {
                        this.focusNode(node);
                    }
                }
            } else {
                this.resetView();
            }
        });

        // Update HUD indicator on controls change
        this.controls.addEventListener('change', () => {
            this._notifyCameraChange();
        });
    }

    _getPathChain(node) {
        const pathNodes = new Set();
        const pathEdges = new Set();
        if (!node) return { pathNodes, pathEdges };

        // 1. Ancestrais até a raiz (Sol)
        let cur = node.id;
        while (cur) {
            pathNodes.add(cur);
            const parentId = this.parentOf ? this.parentOf.get(cur) : null;
            if (parentId) {
                pathEdges.add(`${parentId}->${cur}`);
                pathEdges.add(`${cur}->${parentId}`);
            }
            cur = parentId;
        }

        // 2. Filhos imediatos (se for pasta)
        if (this.childrenOf && this.childrenOf.has(node.id)) {
            const kids = this.childrenOf.get(node.id);
            for (const kidId of kids) {
                pathNodes.add(kidId);
                pathEdges.add(`${node.id}->${kidId}`);
                pathEdges.add(`${kidId}->${node.id}`);
            }
        }

        return { pathNodes, pathEdges };
    }

    _setNodeEmissive(node, intensity, scale, glowMultiplier) {
        if (!node || !node.mesh) return;
        node.mesh.scale.set(scale, scale, scale);
        if (node.somaMesh && node.somaMesh.material) {
            node.somaMesh.material.emissiveIntensity = intensity;
        }
        if (node.bulbMesh && node.bulbMesh.material) {
            node.bulbMesh.material.emissiveIntensity = intensity * 1.35;
        }
        if (node.flareSprite) {
            const baseFlare = 12.0;
            node.flareSprite.scale.set(baseFlare * glowMultiplier, baseFlare * glowMultiplier, 1);
        }
        if (node.glowSprite) {
            const baseGlow = Math.max(6, (node.size || 10) * 0.95) * 2.3;
            node.glowSprite.scale.set(baseGlow * glowMultiplier, baseGlow * glowMultiplier, 1);
        }
    }

    _applySpotlight(node) {
        if (!node) return;

        if (this.isHierarchy) {
            const { pathNodes, pathEdges } = this._getPathChain(node);

            for (const n of this.nodes) {
                const isSelf = n.id === node.id;
                const inChain = pathNodes.has(n.id);

                if (isSelf) {
                    this._setNodeEmissive(n, 1.0, 1.38, 2.5);
                } else if (inChain) {
                    this._setNodeEmissive(n, 0.85, 1.18, 1.8);
                } else {
                    this._setNodeEmissive(n, 0.12, 0.85, 0.9);
                }
            }

            for (const edge of this.edges) {
                const key1 = `${edge.from}->${edge.to}`;
                const key2 = `${edge.to}->${edge.from}`;
                const inPath = pathEdges.has(key1) || pathEdges.has(key2);
                edge.k = inPath ? 1.0 : -0.35;
                if (edge.lineMesh && edge.lineMesh.material) {
                    edge.lineMesh.material.opacity = inPath ? 0.95 : 0.03;
                    edge.lineMesh.material.color.setHex(inPath ? 0x38bdf8 : (edge.baseColor !== undefined ? edge.baseColor : 0x8b5cf6));
                }
            }

            if (this.nodeStyle === 'neuron' && this.gH && this.gC) {
                this._fillRibbon(this.gH, 3.2, 0.16);
                this._fillRibbon(this.gC, 1.0, 0.80);
            }
            return;
        }

        // Modo flat legado
        for (const n of this.nodes) {
            const isConn = this._isNodeConnected(node, n);
            const isSelf = n.id === node.id;

            if (isSelf) {
                this._setNodeEmissive(n, 0.95, 1.35, 2.4);
            } else if (isConn) {
                this._setNodeEmissive(n, 0.7, 1.15, 1.6);
            } else {
                this._setNodeEmissive(n, 0.15, 0.9, 0.9);
            }
        }

        for (const edge of this.edges) {
            const isConn = edge.from === node.id || edge.to === node.id;
            edge.k = isConn ? 1.0 : -0.35;
            if (edge.lineMesh && edge.lineMesh.material) {
                edge.lineMesh.material.opacity = isConn ? 0.9 : 0.04;
                edge.lineMesh.material.color.setHex(isConn ? 0xa78bfa : (edge.baseColor !== undefined ? edge.baseColor : 0x8b5cf6));
            }
        }

        if (this.nodeStyle === 'neuron' && this.gH && this.gC) {
            this._fillRibbon(this.gH, 3.2, 0.16);
            this._fillRibbon(this.gC, 1.0, 0.80);
        }
    }

    _setHoveredNode(node, px, py) {
        this.hoveredNode = node;
        this.canvas.style.cursor = 'pointer';

        this.labelFocus.clear();
        if (this.isHierarchy) {
            const { pathNodes } = this._getPathChain(node);
            for (const id of pathNodes) this.labelFocus.add(id);
        } else {
            this.labelFocus.add(node.id);
        }

        this._applySpotlight(node);

        // Tooltip semântico com hierarquia
        const isFolder = node.isFolder;
        const icon = node.icon || (isFolder ? '📂' : '📄');
        const typeLabel = isFolder
            ? (node.isCentral ? '☀️ SOL DO PROJETO' : `📂 PASTA • ${node.fileCount || node.childCount || 0} arquivos`)
            : '📄 DOCUMENTO';

        const pathHint = node.path ? `<div style="font-size: 10.5px; color: #94a3b8; font-family: monospace; margin: 4px 0 6px; word-break: break-all;">${node.path}</div>` : '';
        const actionHint = isFolder
            ? (node.isCentral ? '🌟 Núcleo orbital' : '⚡ Clique para destacar rota da pasta')
            : '⚡ Duplo-clique para abrir documento';

        this.tooltip.innerHTML = `
            <div class="tooltip-title" style="display:flex; align-items:center; gap:6px;">
                <span>${icon}</span>
                <span>${node.label}</span>
            </div>
            <div class="tooltip-type" style="color: #c4b5fd;">${typeLabel}</div>
            ${pathHint}
            <div class="tooltip-hint" style="font-size: 11px; color: #38bdf8; margin-top: 4px; font-weight: 500;">
                ${actionHint}
            </div>
        `;
        this._updateTooltipPos(px, py);
        this.tooltip.classList.add('visible');
    }

    _clearHover() {
        this.hoveredNode = null;
        this.canvas.style.cursor = 'default';
        this.tooltip.classList.remove('visible');

        this.labelFocus.clear();
        if (this.selectedNode) {
            if (this.isHierarchy) {
                const { pathNodes } = this._getPathChain(this.selectedNode);
                for (const id of pathNodes) this.labelFocus.add(id);
            } else {
                this.labelFocus.add(this.selectedNode.id);
            }
            this._applySpotlight(this.selectedNode);
            return;
        }

        // Restaura todos os nós e arestas para a cor/opacidade original
        for (const n of this.nodes) {
            this._setNodeEmissive(n, this.nodeStyle === 'neuron' ? 0.65 : 0.52, 1.0, 1.0);
        }

        for (const edge of this.edges) {
            edge.k = 0.0;
            if (edge.lineMesh && edge.lineMesh.material) {
                edge.lineMesh.material.opacity = edge.baseOpacity !== undefined ? edge.baseOpacity : 0.22;
                edge.lineMesh.material.color.setHex(edge.baseColor !== undefined ? edge.baseColor : 0x8b5cf6);
            }
        }

        if (this.nodeStyle === 'neuron' && this.gH && this.gC) {
            this._fillRibbon(this.gH, 3.2, 0.16);
            this._fillRibbon(this.gC, 1.0, 0.80);
        }
    }

    _updateTooltipPos(px, py) {
        this.tooltip.style.left = (px + 16) + 'px';
        this.tooltip.style.top = (py - 8) + 'px';
    }

    _getConnectedEdges(node) {
        if (!node) return [];
        return this.edges.filter(e => e.from === node.id || e.to === node.id);
    }

    _isNodeConnected(nodeA, nodeB) {
        if (!nodeA || !nodeB) return false;
        if (nodeA.id === nodeB.id) return true;
        return this.edges.some(e =>
            (e.from === nodeA.id && e.to === nodeB.id) ||
            (e.to === nodeA.id && e.from === nodeB.id)
        );
    }

    _updateConnectedEdges(node) {
        // Recompute arches/tubes when a node is dragged
        for (const edge of this.edges) {
            if (edge.from === node.id || edge.to === node.id) {
                this._updateEdgeCurve(edge);
            }
        }
    }

    // ── Planetary Camera Controls ─────────────────────
    zoomIn() {
        this._dollyCamera(0.82);
    }

    zoomOut() {
        this._dollyCamera(1.22);
    }

    _dollyCamera(factor) {
        const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
        offset.multiplyScalar(factor);
        if (offset.length() < this.controls.minDistance) offset.setLength(this.controls.minDistance);
        if (offset.length() > this.controls.maxDistance) offset.setLength(this.controls.maxDistance);
        this.camera.position.addVectors(this.controls.target, offset);
        this.controls.update();
        this._notifyCameraChange();
    }

    rotateBy(deltaRad) {
        // Rotate camera around planet Y axis
        const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
        const cos = Math.cos(deltaRad);
        const sin = Math.sin(deltaRad);
        const newX = offset.x * cos - offset.z * sin;
        const newZ = offset.x * sin + offset.z * cos;
        offset.x = newX;
        offset.z = newZ;
        this.camera.position.addVectors(this.controls.target, offset);
        this.controls.update();
        this._notifyCameraChange();
    }

    toggleAutoOrbit() {
        this.controls.autoRotate = !this.controls.autoRotate;
        this._notifyCameraChange();
        return this.controls.autoRotate;
    }

    resetView() {
        if (this.nodeStyle === 'neuron') {
            const dT = Math.min(180, 60 + (this.neuronSomas ? this.neuronSomas.length : 0) * 5);
            const camDir = new THREE.Vector3(Math.sin(1.3) * Math.sin(0.6), Math.cos(1.3), Math.sin(1.3) * Math.cos(0.6)).normalize();
            const destCam = camDir.multiplyScalar(dT);
            this._animateCameraTo(destCam, new THREE.Vector3(0, 0, 0));
            this.activeNeuronFile = null;
            this.selLink = null;
            return;
        }
        this._animateCameraTo(this.defaultCameraPos, this.defaultTargetPos);
    }

    focusNode(node) {
        if (!node) return;
        this.selectedNode = node;

        if (this.nodeStyle === 'neuron' && this.neuronLeaves) {
            const leaf = this.neuronLeaves.find(l => l.file && (l.file.id === node.id || l.file.name === node.label || l.file.path === node.path));
            if (leaf) {
                this.activeNeuronFile = leaf.file;
                if (leaf.pe) this.selLink = leaf.pe;
                const targetPos = leaf.cur.clone();
                const camDir = this.camera.position.clone().sub(this.controls.target).normalize();
                if (camDir.length() === 0) camDir.set(0, 0.4, 1).normalize();
                const destCam = targetPos.clone().addScaledVector(camDir, 28);
                this._animateCameraTo(destCam, targetPos);
                return;
            }
        }

        // Position camera in front of node along its radial direction
        const dir = (node.position ? node.position.clone().normalize() : new THREE.Vector3(0, 0, 1));
        if (dir.length() === 0) dir.set(0, 0, 1);
        const targetPos = node.position ? node.position.clone() : new THREE.Vector3(0, 0, 0);
        const camPos = targetPos.clone().add(dir.multiplyScalar(140));

        this._animateCameraTo(camPos, targetPos);
    }

    reheat(intensity = 1.0) {
        if (this.nodeStyle === 'neuron' && this.neuronNodes) {
            const rv = () => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            for (const n of this.neuronNodes) {
                n.vl.addScaledVector(rv(), 7.5 * intensity);
            }
            return;
        }

        // Organic 3D planetary pulse with spring dynamics
        for (const n of this.nodes) {
            if (n.id === 'brain') continue;
            const jitter = new THREE.Vector3(
                (Math.random() - 0.5) * 26,
                (Math.random() - 0.5) * 26,
                (Math.random() - 0.5) * 26
            );
            if (n.velocity) n.velocity.add(jitter);
        }
        this.physicsEnergy = 1.0;
    }

    _animateCameraTo(destCam, destTarget) {
        this.cameraAnim = {
            startCam: this.camera.position.clone(),
            destCam: destCam.clone(),
            startTarget: this.controls.target.clone(),
            destTarget: destTarget.clone(),
            progress: 0,
            duration: 45 // frames (~0.75s)
        };
    }

    // ── Dynamic Category Filtering & Live Color Customization ──
    getDynamicCategories() {
        if (this.nodeStyle === 'neuron' && this.neuronSomas && this.neuronSomas.length > 0) {
            const totalDocs = this.neuronFiles ? this.neuronFiles.length : 0;
            const categories = this.neuronSomas.map(s => {
                const groupKey = s.fo;
                const label = s.fo.split('/').slice(-2).join('/');
                const count = this.neuronFiles.filter(f => f.folder === s.fo).length;
                return {
                    key: groupKey,
                    label: label,
                    icon: '🧠',
                    color: s.col,
                    docCount: count,
                    nodeCount: count
                };
            }).sort((a, b) => b.docCount - a.docCount);
            return { totalDocs, categories };
        }

        const catMap = new Map();
        let totalDocs = 0;

        for (const node of this.nodes) {
            if (node.isCentral || node.id === 'brain') continue;
            const isDoc = !node.isFolder;
            if (isDoc) totalDocs++;

            const groupKey = node.group || 'h-folder';
            if (!catMap.has(groupKey)) {
                let label = (window.HIERARCHY_PALETTE && window.HIERARCHY_PALETTE[groupKey] && window.HIERARCHY_PALETTE[groupKey].label);
                if (!label) {
                    label = groupKey.replace(/^h-dir-|^h-/, '').replace(/[-_]/g, ' ');
                    label = label.charAt(0).toUpperCase() + label.slice(1);
                }

                const icon = (window.FOLDER_ICONS && window.FOLDER_ICONS[groupKey]) || (node.isFolder ? '📂' : '📄');
                const fill = (this.groupColors[groupKey] && this.groupColors[groupKey].fill) || (node.colors && node.colors.fill) || '#8b5cf6';

                catMap.set(groupKey, {
                    key: groupKey,
                    label: label,
                    icon: icon,
                    color: fill,
                    docCount: 0,
                    nodeCount: 0
                });
            }

            const cat = catMap.get(groupKey);
            cat.nodeCount++;
            if (isDoc) cat.docCount++;
        }

        const categories = Array.from(catMap.values())
            .sort((a, b) => (b.docCount - a.docCount) || a.label.localeCompare(b.label));

        return { totalDocs, categories };
    }

    setCategoryFilter(categoryKey) {
        this.currentCategory = (categoryKey === 'all' || !categoryKey) ? null : categoryKey;
        return this._applyCombinedFilter();
    }

    filterNodes(query) {
        this.currentQuery = (query || '').trim();
        return this._applyCombinedFilter();
    }

    focusCategory(key) {
        if (this.nodeStyle === 'neuron' && this.neuronSomas) {
            const s = this.neuronSomas.find(soma => soma.fo === key || soma.fo.endsWith('/' + key));
            if (s) {
                this._animateCameraTo(s.c.clone().add(new THREE.Vector3(0, 10, 45)), s.c);
                this.activeNeuronFile = null;
                this.activeNeuronLeaf = s.so;
                return;
            }
        }
        const targetNode = this.nodes.find(n => n.group === key || n.id === key);
        if (targetNode) {
            this.focusNode(targetNode);
        }
    }

    _applyCombinedFilter() {
        const rawQ = (this.currentQuery || '').trim();
        const q = rawQ.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const hasQuery = q.length > 0;
        const cat = this.currentCategory;
        const hasCat = Boolean(cat && cat !== 'all');

        if (this.nodeStyle === 'neuron' && this.neuronLeaves) {
            const totalDocs = this.neuronFiles.length;
            if (!hasQuery && !hasCat) {
                this.litSet = null;
                for (const l of this.neuronLeaves) {
                    l.bulb.material.opacity = 1.0;
                    l.lab.material.opacity = 0.85;
                }
                for (const e of this.neuronEdges) {
                    e.k = 0;
                }
                return { matchedCount: totalDocs, totalCount: totalDocs, isFiltering: false };
            }

            const litSet = new Set();
            let matchedCount = 0;
            for (const l of this.neuronLeaves) {
                const f = l.file;
                let matchCat = true;
                if (hasCat) {
                    matchCat = (f.group === cat || f.folder === cat || (f.folder && (f.folder.startsWith(cat + '/') || f.folder.endsWith('/' + cat))));
                }
                let matchText = true;
                if (hasQuery) {
                    const cleanName = (f.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const cleanPath = (f.path || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    matchText = cleanName.includes(q) || cleanPath.includes(q);
                }

                const isMatch = matchCat && matchText;
                if (isMatch) {
                    matchedCount++;
                    const branch = this._neuronLit(l);
                    branch.forEach(e => litSet.add(e));
                    l.bulb.material.opacity = 1.0;
                    l.lab.material.opacity = 1.0;
                } else {
                    l.bulb.material.opacity = 0.12;
                    l.lab.material.opacity = 0.05;
                }
            }
            this.litSet = litSet;
            return { matchedCount, totalCount: totalDocs, isFiltering: true };
        }

        const satelliteNodes = this.nodes.filter(n => !n.isCentral && n.id !== 'brain');
        const totalCount = satelliteNodes.length;

        this.searchLabelSet.clear();

        if (!hasQuery && !hasCat) {
            for (const n of this.nodes) {
                if (n.mesh) n.mesh.visible = true;
            }
            for (const e of this.edges) {
                if (e.lineMesh) e.lineMesh.visible = true;
            }
            return { matchedCount: totalCount, totalCount: totalCount, isFiltering: false };
        }

        const visibleSet = new Set();
        let matchedCount = 0;

        // Sol raiz sempre visível
        for (const n of this.nodes) {
            if (n.isCentral || n.id === 'brain') {
                visibleSet.add(n.id);
            }
        }

        for (const n of this.nodes) {
            if (n.isCentral || n.id === 'brain') continue;

            // 1. Categoria (pertence à categoria ou é pasta ancestral dela)
            let matchCat = true;
            if (hasCat) {
                matchCat = (n.group === cat);
            }

            // 2. Texto
            let matchText = true;
            if (hasQuery) {
                const cleanLabel = (n.label || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const cleanPath = (n.path || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const cleanId = (n.id || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                matchText = cleanLabel.includes(q) || cleanPath.includes(q) || cleanId.includes(q);
            }

            if (matchCat && matchText) {
                if (!n.isFolder) {
                    matchedCount++;
                    this.searchLabelSet.add(n.id);
                }
                visibleSet.add(n.id);

                // Mantém toda a rota hierárquica de pastas visível até o Sol
                if (this.parentOf) {
                    let cur = n.id;
                    while (cur) {
                        visibleSet.add(cur);
                        cur = this.parentOf.get(cur);
                    }
                }
            }
        }

        // Se filtrou por categoria que é pasta mas não tem subarquivos diretos
        if (matchedCount === 0 && hasCat && visibleSet.size > 1) {
            matchedCount = Array.from(visibleSet).filter(id => {
                const node = this.nodeMap.get(id);
                return node && !node.isCentral && node.id !== 'brain' && !node.isFolder;
            }).length;
        }

        // Aplica visibilidade nos nós
        for (const n of this.nodes) {
            if (n.mesh) n.mesh.visible = visibleSet.has(n.id);
        }

        // Aplica visibilidade nas arestas
        for (const e of this.edges) {
            const fromVis = e.fromNode && e.fromNode.mesh && e.fromNode.mesh.visible;
            const toVis = e.toNode && e.toNode.mesh && e.toNode.mesh.visible;
            if (e.lineMesh) e.lineMesh.visible = Boolean(fromVis && toVis);
        }

        if (this.nodeStyle === 'neuron' && this.gH && this.gC) {
            this._fillRibbon(this.gH, 3.2, 0.16);
            this._fillRibbon(this.gC, 1.0, 0.80);
        }

        return { matchedCount: matchedCount, totalCount: totalCount, isFiltering: true };
    }

    highlightCategory(groupKey) {
        if (!groupKey || groupKey === 'all') {
            this.clearCategoryHighlight();
            return;
        }
        this.highlightedCategory = groupKey;
        for (const n of this.nodes) {
            if (!n.mesh || !n.mesh.visible) continue;
            const isMatch = n.group === groupKey;
            if (isMatch) {
                this._setNodeEmissive(n, 0.95, 1.32, 2.2);
            } else {
                this._setNodeEmissive(n, 0.12, 0.85, 0.9);
            }
        }
        for (const edge of this.edges) {
            const isMatch = (edge.fromNode && edge.fromNode.group === groupKey) || (edge.toNode && edge.toNode.group === groupKey);
            edge.k = isMatch ? 1.0 : -0.35;
            if (edge.lineMesh && edge.lineMesh.visible) {
                if (isMatch) {
                    edge.lineMesh.material.opacity = 0.88;
                    edge.lineMesh.material.color.setHex(0x38bdf8);
                } else {
                    edge.lineMesh.material.opacity = 0.04;
                }
            }
        }
        if (this.nodeStyle === 'neuron' && this.gH && this.gC) {
            this._fillRibbon(this.gH, 3.2, 0.16);
            this._fillRibbon(this.gC, 1.0, 0.80);
        }
    }

    clearCategoryHighlight() {
        this.highlightedCategory = null;
        if (this.hoveredNode) {
            this._applySpotlight(this.hoveredNode);
            return;
        }
        if (this.selectedNode) {
            this._applySpotlight(this.selectedNode);
            return;
        }
        for (const n of this.nodes) {
            this._setNodeEmissive(n, this.nodeStyle === 'neuron' ? 0.65 : 0.52, 1.0, 1.0);
        }
        for (const edge of this.edges) {
            edge.k = 0.0;
            if (edge.lineMesh) {
                edge.lineMesh.material.opacity = edge.baseOpacity !== undefined ? edge.baseOpacity : 0.22;
                edge.lineMesh.material.color.setHex(edge.baseColor !== undefined ? edge.baseColor : 0x8b5cf6);
            }
        }
        if (this.nodeStyle === 'neuron' && this.gH && this.gC) {
            this._fillRibbon(this.gH, 3.2, 0.16);
            this._fillRibbon(this.gC, 1.0, 0.80);
        }
    }

    updateGroupColor(groupKey, hexColor) {
        if (!hexColor) return;
        const colorHex = parseInt(hexColor.replace('#', '0x'), 16);

        if (!this.groupColors[groupKey]) {
            this.groupColors[groupKey] = { fill: hexColor, stroke: hexColor, glow: hexColor };
        } else {
            this.groupColors[groupKey].fill = hexColor;
            this.groupColors[groupKey].stroke = hexColor;
        }

        for (const node of this.nodes) {
            if (node.group === groupKey) {
                node.colors.fill = hexColor;
                node.colors.stroke = hexColor;
                if (node.somaMesh && node.somaMesh.material && node.somaMesh.material.color) {
                    node.somaMesh.material.color.setHex(colorHex);
                    if (node.somaMesh.material.emissive) node.somaMesh.material.emissive.setHex(colorHex);
                }
                if (node.nucleusMat && node.nucleusMat.uniforms && node.nucleusMat.uniforms.c) {
                    node.nucleusMat.uniforms.c.value.set(hexColor);
                }
                if (node.glowSprite && node.glowSprite.material) {
                    node.glowSprite.material.map = BrainGraph.G(hexColor);
                }
                if (node.outerRing && node.outerRing.material) {
                    node.outerRing.material.color.setHex(colorHex);
                }
            }
        }

        for (const edge of this.edges) {
            if (edge.toNode && edge.toNode.group === groupKey) {
                edge.baseColor = colorHex;
                const c = new THREE.Color(hexColor).lerp(new THREE.Color(1.0, 0.78, 0.42), 0.45);
                edge.col = [c.r, c.g, c.b];
                if (edge.lineMesh && edge.lineMesh.material && edge.lineMesh.material.color) {
                    edge.lineMesh.material.color.setHex(colorHex);
                }
            }
        }
        if (this.nodeStyle === 'neuron' && this.gH && this.gC) {
            this._fillRibbon(this.gH, 3.2, 0.16);
            this._fillRibbon(this.gC, 1.0, 0.80);
        }
    }

    _notifyCameraChange() {
        if (this.onCameraChange) {
            const dist = this.camera.position.distanceTo(this.controls.target);
            const baseDist = this.nodeStyle === 'neuron' ? (this.defaultNeuronDist || 130) : 560;
            const zoomPercent = Math.round((baseDist / Math.max(1, dist)) * 100);
            this.onCameraChange({
                scale: zoomPercent / 100,
                zoomPercent: zoomPercent,
                rotationDeg: 0,
                autoOrbit: this.controls.autoRotate,
                autoRotate: this.controls.autoRotate
            });
        }
    }

    // ── Animation Loop ────────────────────────────────
    start() {
        if (!this.animFrame) {
            this._animate();
        }
    }

    stop() {
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
            this.animFrame = null;
        }
    }

    _animate() {
        this.time += 0.015;

        // 0. Step 3D Spring Physics if dragging or kinetic energy is active
        if (this.isDraggingNode || this.physicsEnergy > 0.001) {
            this._step3DPhysics();
        }

        // 1. Handle Smooth Camera Flight Transitions
        if (this.cameraAnim) {
            this.cameraAnim.progress += 1 / this.cameraAnim.duration;
            const t = Math.min(1, this.cameraAnim.progress);
            // Smooth easeInOutCubic
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            this.camera.position.lerpVectors(this.cameraAnim.startCam, this.cameraAnim.destCam, ease);
            this.controls.target.lerpVectors(this.cameraAnim.startTarget, this.cameraAnim.destTarget, ease);

            if (t >= 1) {
                this.cameraAnim = null;
            }
        }

        // 2. Update OrbitControls (planetary damping & continuous spin)
        this.controls.update();

        // 3. Ambient dust rotation
        if (this.dust) {
            this.dust.rotation.y += 0.00025;
        }

        // 4. Update according to nodeStyle
        const t = this.time;
        if (this.nodeStyle === 'neuron') {
            this._animateNeuron(0.016, t);
            this.renderer.render(this.scene, this.camera);
            this.animFrame = requestAnimationFrame(() => this._animate());
            return;
        } else {
            // Planetary Core Rotations in Sphere Mode
            if (this.coreWireframe) {
                this.coreWireframe.rotation.y += 0.002;
                this.coreWireframe.rotation.x += 0.001;
            }
            if (this.ring1) {
                this.ring1.rotation.z += 0.001;
            }
            if (this.ring2) {
                this.ring2.rotation.z -= 0.0008;
            }

            // Sphere mode photon particles
            const visibleEdges = this.edges.filter(e => e.lineMesh && e.lineMesh.visible);
            for (const p of this.particles) {
                if (!p.edge || !p.edge.curve || (p.edge.lineMesh && !p.edge.lineMesh.visible)) {
                    if (visibleEdges.length > 0) {
                        p.edge = visibleEdges[Math.floor(Math.random() * visibleEdges.length)];
                        p.progress = Math.random();
                        p.speed = this._calcParticleSpeed(p.edge);
                        if (p.edge.toNode && p.edge.toNode.colors) {
                            const c = parseInt(p.edge.toNode.colors.stroke.replace('#', '0x'), 16);
                            p.sprite.material.color.setHex(c);
                        }
                    } else {
                        p.sprite.visible = false;
                        continue;
                    }
                }
                p.sprite.visible = true;
                p.progress += p.speed;
                if (p.progress >= 1.0) {
                    p.progress = 0;
                    if (visibleEdges.length > 0) {
                        p.edge = visibleEdges[Math.floor(Math.random() * visibleEdges.length)];
                        p.speed = this._calcParticleSpeed(p.edge);
                        if (p.edge.toNode && p.edge.toNode.colors) {
                            const c = parseInt(p.edge.toNode.colors.stroke.replace('#', '0x'), 16);
                            p.sprite.material.color.setHex(c);
                        }
                    }
                }
                if (p.edge && p.edge.curve) {
                    const pt = p.edge.curve.getPoint(p.progress);
                    p.sprite.position.copy(pt);
                    const lifeAlpha = Math.sin(p.progress * Math.PI);
                    p.sprite.material.opacity = 0.35 + lifeAlpha * 0.65;
                    const sz = p.baseSize * (0.85 + lifeAlpha * 0.25);
                    p.sprite.scale.set(sz, sz, 1);
                }
            }
        }

        // 5. Update Orbit Rings & Smart Label LOD
        const camDir = new THREE.Vector3();
        this.camera.getWorldDirection(camDir);

        for (const n of this.nodes) {
            if (n.outerRing) {
                n.outerRing.rotation.z += 0.015;
            }

            // Controle inteligente de visibilidade e LOD dos rótulos
            if (n.labelSprite && n.id !== 'brain') {
                const nodeDir = n.position.clone().normalize();
                const dot = nodeDir.dot(camDir);

                // 1. Rótulos virados para trás são 100% ocultados
                if (dot >= 0.08) {
                    n.labelSprite.visible = false;
                    n.labelSprite.material.opacity = 0;
                    continue;
                }

                // 2. Visibilidade inteligente na face frontal
                const isFolderOrSun = n.isFolder || n.isCentral;
                const isFocused = this.labelFocus.has(n.id);
                const isSearchResult = this.searchLabelSet.has(n.id);
                const distToCam = n.position.distanceTo(this.camera.position);
                const isNearZoom = distToCam < this.labelNearDist;

                let targetOpacity = 0.0;
                if (isFolderOrSun) {
                    targetOpacity = 0.95;
                } else if (isFocused) {
                    targetOpacity = 1.0;
                } else if (isSearchResult) {
                    targetOpacity = 0.95;
                } else if (isNearZoom) {
                    targetOpacity = 0.85;
                } else {
                    targetOpacity = 0.0;
                }

                if (targetOpacity > 0.02) {
                    n.labelSprite.visible = true;
                    n.labelSprite.material.opacity += (targetOpacity - n.labelSprite.material.opacity) * 0.15;
                } else {
                    n.labelSprite.material.opacity += (0 - n.labelSprite.material.opacity) * 0.2;
                    if (n.labelSprite.material.opacity < 0.03) {
                        n.labelSprite.visible = false;
                    }
                }
            }
        }

        // 6. Pulso cintilante UAU nas terminações e botões sinápticos
        if (this.nodeStyle === 'neuron' && this.synapticBoutons && this.synapticBoutons.length > 0) {
            const colEmber = BrainGraph.COLOR_EMBER;
            const colPeak = BrainGraph.COLOR_PEAK;

            for (let i = 0; i < this.synapticBoutons.length; i++) {
                const sb = this.synapticBoutons[i];
                if (!sb.flare.parent) continue;

                // 1. Ciclo respiratório suave e orgânico
                const breathRaw = Math.sin(t * sb.speed + sb.phase);
                const breath = breathRaw * 0.5 + 0.5;

                // 2. Micro-cintilação biológica eletrostática (shimmer)
                const shimmer = Math.sin(t * sb.twinkleFreq + sb.phase * 2.1) * 0.12
                              + Math.sin(t * (sb.twinkleFreq * 1.6) + sb.phase) * 0.06;

                // 3. Centelha / Micro-descarga sináptica espontânea
                const burstRaw = Math.sin(t * sb.burstFreq + sb.burstPhase);
                const burst = burstRaw > 0.80 ? Math.pow((burstRaw - 0.80) / 0.20, 2.5) : 0;

                const scaleFactor = 0.74 + breath * 0.50 + shimmer + burst * 0.65;
                const s = sb.baseScale * scaleFactor;
                sb.flare.scale.set(s, s, 1);

                const alpha = Math.min(1.0, 0.42 + breath * 0.48 + shimmer * 0.4 + burst * 0.35);
                sb.flare.material.opacity = alpha;

                if (colEmber && colPeak) {
                    const colorT = Math.min(1.0, breath * 0.65 + burst * 0.60);
                    sb.flare.material.color.lerpColors(colEmber, colPeak, colorT);
                }

                sb.flare.material.rotation = sb.baseRot + Math.sin(t * 0.6 + sb.phase) * 0.14;

                if (sb.bulb && sb.bulb.material) {
                    const bulbScale = 0.75 + breath * 0.45 + burst * 0.75;
                    sb.bulb.scale.setScalar(bulbScale);
                    sb.bulb.material.opacity = Math.min(1.0, 0.55 + breath * 0.35 + burst * 0.20);
                    if (sb.bulb.material.emissiveIntensity !== undefined) {
                        sb.bulb.material.emissiveIntensity = 0.85 + breath * 0.50 + burst * 0.85;
                    }
                }

                if (sb.corona && sb.corona.material) {
                    const coronaScale = sb.baseCoronaScale * (0.82 + breath * 0.35 + burst * 0.45);
                    sb.corona.scale.set(coronaScale, coronaScale, 1);
                    sb.corona.material.opacity = Math.min(1.0, 0.55 + breath * 0.35 + burst * 0.25);
                }
            }
        }

        // 6. Render 3D Scene
        this.renderer.render(this.scene, this.camera);

        this.animFrame = requestAnimationFrame(() => this._animate());
    }
}
