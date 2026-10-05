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
        this.coreGroup = new THREE.Group();
        this.interactiveMeshes = [];

        // Synaptic light photons (feixes rápidos de luz)
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
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.0009);

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

    // ── Load Data & 3D Spherical Planet Layout ────────
    loadData(graphNodes, graphEdges, groupColors) {
        this.groupColors = groupColors || {};
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
        this.interactiveMeshes = [];
        this.synapticBoutons = [];

        // No modo neurônio, oculta o núcleo wireframe mecânico do planeta
        if (this.coreGroup) {
            this.coreGroup.visible = (this.nodeStyle !== 'neuron');
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
            'core': { theta: 0, phi: 0.35, r: planetRadius * 1.05 }, // North polar crown (System / Core)
            'rules': { theta: -0.7, phi: 0.85, r: planetRadius }, // North-West continent
            'skills': { theta: 0.7, phi: 0.85, r: planetRadius }, // North-East continent
            'agents': { theta: 0.0, phi: 0.8, r: planetRadius }, // North meridian continent
            'ai': { theta: 0.0, phi: 1.45, r: planetRadius * 0.95 }, // Equatorial front
            'knowledge': { theta: -0.85, phi: 2.1, r: planetRadius }, // South-West continent
            'projects': { theta: 0.85, phi: 2.1, r: planetRadius }, // South-East continent
            'memory': { theta: -0.3, phi: 2.7, r: planetRadius * 1.05 }, // South pole
            'decisions': { theta: 0.3, phi: 2.7, r: planetRadius * 1.05 }, // South pole
            'templates': { theta: -1.3, phi: 1.5, r: planetRadius },
            'docs': { theta: 1.3, phi: 1.5, r: planetRadius }
        };

        const groupCounts = {};
        for (const n of graphNodes) {
            groupCounts[n.group] = (groupCounts[n.group] || 0) + 1;
        }
        const groupIndices = {};

        // In project graph, prepare balanced orbital indexing for surrounding satellites
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
                // Sistema Solar Hierárquico: posição determinística calculada por graph-hierarchy.js
                pos3D = new THREE.Vector3(n.hpos.x, n.hpos.y, n.hpos.z);
            } else if (isCentral) {
                // The Central Sun/Project is fixed DEAD-CENTER at (0,0,0), perfectly aligned with the rotating wireframe core and celestial rings!
                pos3D = new THREE.Vector3(0, 0, 0);
            } else if (isProjectGraph) {
                const isResearch = n.group === 'research' || (n.path && n.path.includes('/RESEARCH/'));
                const isFw = n.group === 'rules' || n.group === 'skills' || (n.group === 'knowledge' && n.id.startsWith('fw_'));

                if (isFw) {
                    // Northern governance crown above the project
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
                    // Southern / Equatorial Research Lab orbital belt
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
                    // Core project documents (PROJECT.md, CURRENT_STATE.md, ARCHITECTURE.md, etc.)
                    // Form an equatorial ring around the central project planet
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

                // Spread children within their continental hemisphere
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
                velocity: new THREE.Vector3(),
                colors: colors,
                mesh: null,
                glowSprite: null,
                labelSprite: null,
                iconSprite: null,
                outerRing: null
            };

            this.nodeMap.set(n.id, nodeObj);
            return nodeObj;
        });

        // Mapas de hierarquia (pai → filhos) para destaque de caminho e pesquisa contextual
        if (this.isHierarchy) {
            for (const node of this.nodes) {
                if (node.parentId) {
                    this.parentOf.set(node.id, node.parentId);
                    if (!this.childrenOf.has(node.parentId)) this.childrenOf.set(node.parentId, []);
                    this.childrenOf.get(node.parentId).push(node.id);
                }
            }
        }

        // 2. Perform 3D Relaxation Step so nodes don't collide
        this._relax3DNodes();

        // 2.1 Save equilibrium celestial home positions & masses for spring dynamics
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

        // 2.2 Enquadra a câmera conforme o tamanho real do grafo
        this._fitCameraToGraph();

        // 2.3 Mapeia adjacências (vizinhos conectados) para que os neurônios orientem seus axônios
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

        // 3. Build 3D Meshes for Nodes
        for (const node of this.nodes) {
            this._create3DNode(node);
        }

        // 4. Build 3D Synaptic Arches for Edges
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
            return localStorage.getItem('ai_second_brain_node_style') || 'sphere';
        } catch (e) {
            return 'sphere';
        }
    }

    setNodeStyle(style) {
        if (style !== 'sphere' && style !== 'neuron') return;
        this.nodeStyle = style;
        try {
            localStorage.setItem('ai_second_brain_node_style', style);
        } catch (e) {}
        if (this.coreGroup) {
            this.coreGroup.visible = (style !== 'neuron');
        }
        this._rebuildAllNodeMeshes();
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
            node.dendritesGroup = null;
            node.outerRing = null;
            node.glowSprite = null;
            node.nucRing = null;
            node.nucleolus = null;
            node.nucAura = null;

            this._populateNodeVisuals(node);
        }
    }

    _populateNodeVisuals(node) {
        const colorHex = parseInt(node.colors.fill.replace('#', '0x'), 16);
        const strokeHex = parseInt(node.colors.stroke.replace('#', '0x'), 16);
        let radius;
        if (this.nodeStyle === 'neuron') {
            // Em modo neurônio, corpos celulares mais esguios, orgânicos e compactos
            // O Sol/Hub central fica elegante (~12.0) e pastas/categorias intermediárias (~9.0 a 10.2) sem ficarem balões gigantes
            if (node.isCentral || node.id === 'brain') {
                radius = 12.0;
            } else if (node.isFolder || (node.size && node.size >= 14)) {
                radius = Math.min(10.2, 6.6 + (node.size || 10) * 0.15);
            } else {
                radius = Math.max(4.2, Math.min(6.2, (node.size || 10) * 0.50));
            }
            node.visualRadius = radius;
            this._buildNeuronVisuals(node, radius, colorHex, strokeHex);
        } else {
            radius = Math.max(6, (node.size || 10) * 0.95);
            node.visualRadius = radius;
            this._buildSphereVisuals(node, radius, colorHex, strokeHex);
        }

        // Halo de brilho bioluminescente sutil
        const isNeuron = this.nodeStyle === 'neuron';
        const glowMat = new THREE.SpriteMaterial({
            map: this.glowTexture,
            color: strokeHex,
            transparent: true,
            opacity: isNeuron ? 0.26 : 0.38,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Sprite(glowMat);
        const glowScale = isNeuron ? radius * 1.8 : radius * 2.3;
        glow.scale.set(glowScale, glowScale, 1);
        node.mesh.add(glow);
        node.glowSprite = glow;

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

    _buildNeuronVisuals(node, radius, colorHex, strokeHex) {
        // 1. Corpo celular multipolar estrelado (Soma biológico com braços orgânicos contínuos)
        const somaGeo = new THREE.SphereGeometry(radius * 0.92, 32, 32);
        const posAttr = somaGeo.attributes.position;
        const hash = this._hashString(node.id);
        const v = new THREE.Vector3();

        // Determina os pólos principais do neurônio (axônios conectados + troncos dendríticos)
        const branchPoles = [];

        // Adiciona direções dos vizinhos conectados
        if (node.neighbors && node.neighbors.length > 0) {
            for (const nb of node.neighbors) {
                const dir = new THREE.Vector3().subVectors(nb.position, node.position).normalize();
                if (!branchPoles.some(bp => bp.dot(dir) > 0.72)) {
                    branchPoles.push(dir);
                }
            }
        }

        // Completa até 5-7 pólos para dar a forma estrelada multipolar característica da referência
        const totalPoles = Math.max(5, Math.min(7, branchPoles.length + 3));
        const needed = totalPoles - branchPoles.length;
        for (let k = 0; k < needed; k++) {
            const phi = Math.acos(1 - 2 * ((k + 0.5) / needed));
            const theta = k * 2.3999632 + (hash % 10);
            const extraDir = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.cos(phi),
                Math.sin(phi) * Math.sin(theta)
            ).normalize();
            if (!branchPoles.some(bp => bp.dot(extraDir) > 0.6)) {
                branchPoles.push(extraDir);
            }
        }

        // Deforma os vértices para criar a fusão ameboide e as raízes do corpo celular
        for (let i = 0; i < posAttr.count; i++) {
            v.fromBufferAttribute(posAttr, i);
            const dir = v.clone().normalize();

            // Proximidade com o pólo mais próximo (alongamento nos braços)
            let maxDot = -1;
            for (const pole of branchPoles) {
                const dot = dir.dot(pole);
                if (dot > maxDot) maxDot = dot;
            }

            // Alongamento proporcional nos braços (axon hillocks) com concavidade mais orgânica
            let armStretch = 0;
            if (maxDot > 0.22) {
                const t = (maxDot - 0.22) / 0.78;
                armStretch = Math.pow(t, 1.6) * 0.44;
            } else {
                // Cintura membranar recuada entre braços (silhueta estrelada verdadeira, sem inchaço)
                armStretch = -0.16 * Math.pow(1 - Math.max(0, maxDot + 0.45), 1.6);
            }

            // Ondulações e micro-rugosidades biológicas da membrana
            const f1 = 3.2;
            const f2 = 5.4;
            const noise = Math.sin(dir.x * f1 + hash) * Math.cos(dir.y * f1 + hash * 1.4) * 0.05 +
                          Math.sin(dir.z * f2 + hash * 0.8) * 0.03;

            const factor = Math.max(0.60, 1.0 + armStretch + noise);
            v.multiplyScalar(factor);
            posAttr.setXYZ(i, v.x, v.y, v.z);
        }
        somaGeo.computeVertexNormals();

        // Material da membrana plasmática: translúcida, biológica e acetinada
        const somaMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.38,
            roughness: 0.20,
            metalness: 0.12,
            transparent: true,
            opacity: 0.84,
            depthWrite: true
        });
        const soma = new THREE.Mesh(somaGeo, somaMat);
        soma.userData = { node: node };
        node.mesh.add(soma);
        node.somaMesh = soma;

        // 2. Núcleo celular verde-esmeralda bioluminescente (idêntico à organela central da referência)
        const nucRadius = radius * 0.36;

        // Membrana nuclear externa (anel escuro/profundo)
        const nucRingGeo = new THREE.SphereGeometry(nucRadius * 1.10, 16, 16);
        const nucRingMat = new THREE.MeshBasicMaterial({
            color: 0x064e3b,
            wireframe: false,
            transparent: true,
            opacity: 0.65
        });
        const nucRing = new THREE.Mesh(nucRingGeo, nucRingMat);
        node.mesh.add(nucRing);
        node.nucRing = nucRing;

        // Núcleo interno verde esmeralda brilhante
        const nucGeo = new THREE.SphereGeometry(nucRadius, 20, 20);
        const nucMat = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x059669,
            emissiveIntensity: 0.90,
            roughness: 0.15,
            metalness: 0.2
        });
        const nucleus = new THREE.Mesh(nucGeo, nucMat);
        nucleus.userData = { node: node };
        node.mesh.add(nucleus);
        node.nucleusMesh = nucleus;

        // Nucléolo interno de alta energia (centro luminoso)
        const nucleolusGeo = new THREE.SphereGeometry(nucRadius * 0.36, 12, 12);
        const nucleolusMat = new THREE.MeshBasicMaterial({
            color: 0xecfdf5,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        });
        const nucleolus = new THREE.Mesh(nucleolusGeo, nucleolusMat);
        node.mesh.add(nucleolus);
        node.nucleolus = nucleolus;

        // Halo bioluminescente verde esmeralda de difusão
        const nucAuraMat = new THREE.SpriteMaterial({
            map: this.glowTexture,
            color: 0x34d399,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const nucAura = new THREE.Sprite(nucAuraMat);
        const nucScale = radius * 1.35;
        nucAura.scale.set(nucScale, nucScale, 1);
        node.mesh.add(nucAura);
        node.nucAura = nucAura;

        // 3. Sistema Dendrítico e Axonal Arborizado com Bifurcações em Y e Ópticos Dourados
        const dendritesGroup = new THREE.Group();

        const branchMat = new THREE.MeshStandardMaterial({
            color: strokeHex,
            emissive: strokeHex,
            emissiveIntensity: 0.46,
            roughness: 0.26,
            metalness: 0.18
        });

        const boutonBulbMat = new THREE.MeshBasicMaterial({
            color: 0xfff4cc,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        });

        const boutonFlareMat = new THREE.SpriteMaterial({
            map: this.flareTexture || this.glowTexture,
            color: 0xffaa22, // Fogo dourado incandescente (exatamente como na referência)
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending
        });

        // 3.1 Gera prolongamentos longos e bifurcados para cada pólo celular
        const isFolder = node.isFolder || (node.size && node.size >= 14);
        for (let p = 0; p < branchPoles.length; p++) {
            const dir = branchPoles[p];
            const isConnectedAxon = node.neighbors && node.neighbors.some(nb => {
                const nd = new THREE.Vector3().subVectors(nb.position, node.position).normalize();
                return nd.dot(dir) > 0.75;
            });

            // Proporções elegantes: galhos esguios e harmônicos
            const totalLen = radius * (isConnectedAxon ? (isFolder ? 2.5 : 2.0) : 1.6) + (p % 2) * (radius * 0.3);
            const rBase = Math.max(0.75, radius * (isConnectedAxon ? 0.16 : 0.12));
            const boutonSize = Math.max(0.85, radius * 0.14);

            this._createArborizedBranch(
                dendritesGroup,
                dir,
                radius * 0.92,
                totalLen,
                rBase,
                branchMat,
                boutonBulbMat,
                boutonFlareMat,
                boutonSize,
                node,
                hash + p * 41 + 17
            );
        }

        node.mesh.add(dendritesGroup);
        node.dendritesGroup = dendritesGroup;
    }

    _createArborizedBranch(parentGroup, dir, startOffset, totalLength, rBase, branchMat, boutonBulbMat, boutonFlareMat, boutonSize, node, seed) {
        // Vetor ortogonal para dar ondulação e bifurcação orgânica
        const up = Math.abs(dir.y) < 0.88 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const lat1 = new THREE.Vector3().crossVectors(dir, up).normalize();
        const lat2 = new THREE.Vector3().crossVectors(dir, lat1).normalize();

        const baseAngle = (((seed * 47) % 360) * Math.PI) / 180;
        const curlTrunk = lat1.clone().multiplyScalar(Math.cos(baseAngle))
            .add(lat2.clone().multiplyScalar(Math.sin(baseAngle)))
            .multiplyScalar(totalLength * 0.16);

        // 1. Tronco Principal (da base celular até o ponto de bifurcação Y)
        const trunkLen = totalLength * 0.54;
        const p0 = dir.clone().multiplyScalar(startOffset * 0.95);
        const p1 = dir.clone().multiplyScalar(startOffset + trunkLen * 0.5).add(curlTrunk);
        const pFork = dir.clone().multiplyScalar(startOffset + trunkLen);

        const trunkCurve = new THREE.QuadraticBezierCurve3(p0, p1, pFork);
        const rFork = rBase * 0.58;
        this._buildTaperedTubeMesh(parentGroup, trunkCurve, rBase, rFork, branchMat, node);

        // Botão sináptico incandescente no ponto de bifurcação (exatamente como na imagem de referência)
        this._addSynapticFlare(parentGroup, pFork, boutonSize * 0.88, boutonBulbMat, boutonFlareMat, node);

        // 2. Dois ramos filhos bifurcados (Y-fork)
        const forkSpread = 0.35;
        const forkLen = totalLength * 0.50;

        // Ramo 1
        const dirFork1 = dir.clone().add(lat1.clone().multiplyScalar(forkSpread)).normalize();
        const curl1 = lat2.clone().multiplyScalar(forkLen * 0.18);
        const pFork1Mid = pFork.clone().add(dirFork1.clone().multiplyScalar(forkLen * 0.5)).add(curl1);
        const pTip1 = pFork.clone().add(dirFork1.clone().multiplyScalar(forkLen));
        const curveFork1 = new THREE.QuadraticBezierCurve3(pFork, pFork1Mid, pTip1);
        this._buildTaperedTubeMesh(parentGroup, curveFork1, rFork * 0.78, rBase * 0.16, branchMat, node);
        this._addSynapticFlare(parentGroup, pTip1, boutonSize, boutonBulbMat, boutonFlareMat, node);

        // Ramo 2 (se o galho for longo o suficiente)
        if (totalLength > startOffset * 0.8) {
            const dirFork2 = dir.clone().add(lat1.clone().multiplyScalar(-forkSpread)).add(lat2.clone().multiplyScalar(forkSpread * 0.4)).normalize();
            const curl2 = lat2.clone().multiplyScalar(-forkLen * 0.18);
            const pFork2Mid = pFork.clone().add(dirFork2.clone().multiplyScalar(forkLen * 0.45)).add(curl2);
            const pTip2 = pFork.clone().add(dirFork2.clone().multiplyScalar(forkLen * 0.88));
            const curveFork2 = new THREE.QuadraticBezierCurve3(pFork, pFork2Mid, pTip2);
            this._buildTaperedTubeMesh(parentGroup, curveFork2, rFork * 0.68, rBase * 0.14, branchMat, node);
            this._addSynapticFlare(parentGroup, pTip2, boutonSize * 0.85, boutonBulbMat, boutonFlareMat, node);
        }
    }

    _buildTaperedTubeMesh(parentGroup, curve, rStart, rEnd, material, node, segments = 8, radialSegments = 6) {
        const tubeGeo = new THREE.TubeGeometry(curve, segments, rStart, radialSegments, false);
        const pos = tubeGeo.attributes.position;
        const ringSize = radialSegments + 1;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const factor = (1 - t) + (rEnd / rStart) * t;
            const pt = curve.getPoint(t);

            for (let j = 0; j < ringSize; j++) {
                const idx = i * ringSize + j;
                if (idx < pos.count) {
                    const vx = pos.getX(idx);
                    const vy = pos.getY(idx);
                    const vz = pos.getZ(idx);
                    pos.setXYZ(
                        idx,
                        pt.x + (vx - pt.x) * factor,
                        pt.y + (vy - pt.y) * factor,
                        pt.z + (vz - pt.z) * factor
                    );
                }
            }
        }
        tubeGeo.computeVertexNormals();

        const branchMesh = new THREE.Mesh(tubeGeo, material);
        branchMesh.userData = { node: node };
        parentGroup.add(branchMesh);
    }

    _addSynapticFlare(parentGroup, position, size, bulbMat, flareMat, node) {
        // Gema incandescente interna com material individual para pulso e opacidade independentes
        const bulbMatInstance = bulbMat.clone();
        const bulbGeo = new THREE.SphereGeometry(size, 8, 8);
        const bulbMesh = new THREE.Mesh(bulbGeo, bulbMatInstance);
        bulbMesh.position.copy(position);
        bulbMesh.userData = { node: node };
        parentGroup.add(bulbMesh);

        // Starburst / Optical flare com raios cruzados e material individual para cintilação e centelhas
        const flareMatInstance = flareMat.clone();
        const rot = Math.random() * Math.PI * 2;
        flareMatInstance.rotation = rot;
        const flareSprite = new THREE.Sprite(flareMatInstance);
        flareSprite.position.copy(position);
        const flareScale = size * 5.4;
        flareSprite.scale.set(flareScale, flareScale, 1);
        parentGroup.add(flareSprite);

        // Registra para o pulso cintilante UAU orgânico e assíncrono
        if (this.synapticBoutons) {
            this.synapticBoutons.push({
                flare: flareSprite,
                bulb: bulbMesh,
                baseScale: flareScale,
                baseBulbScale: size,
                baseRot: rot,
                phase: Math.random() * Math.PI * 2,
                speed: 1.2 + Math.random() * 1.4,        // onda respiratória suave (1.2 a 2.6 rad/s)
                twinkleFreq: 4.8 + Math.random() * 4.5,  // cintilação estelar de alta frequência
                burstFreq: 0.6 + Math.random() * 0.8,    // micro-descargas sinápticas espontâneas (~3 a 6s)
                burstPhase: Math.random() * Math.PI * 2
            });
        }
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
        node.labelSprite = this._createLabelSprite(node.label, radius, node.colors.fill);
        node.labelSprite.position.set(0, radius + 11, 0);
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
        const fontSize = 28;
        ctx.font = `600 ${fontSize}px Inter, -apple-system, sans-serif`;

        // Trunca rótulos muito extensos com reticências para manter harmonia espacial
        let displayText = String(text || '');
        if (displayText.length > 28) {
            displayText = displayText.slice(0, 26).trim() + '…';
        }

        const textMetrics = ctx.measureText(displayText);
        const textWidth = Math.ceil(textMetrics.width);
        const padding = 16;

        canvas.width = textWidth + padding * 2;
        canvas.height = fontSize + padding * 2;

        // Re-apply font after resize
        ctx.font = `600 ${fontSize}px Inter, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glassmorphic pill backing for maximum readability against 3D planet
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
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

        // High-contrast clean white text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(displayText, cx, cy);

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
        const spriteHeight = 11;
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

        // Create an organic 3D arched curve rising slightly above planet core
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const elevation = 20 + mid.length() * 0.12;
        mid.add(mid.clone().normalize().multiplyScalar(elevation));

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        edge.curve = curve;

        const points = curve.getPoints(24);
        const geo = new THREE.BufferGeometry().setFromPoints(points);

        // No modo hierárquico, a sinapse herda a cor do filho (ramo semântico)
        let baseColor = 0x8b5cf6;
        let baseOpacity = 0.22;
        if (this.isHierarchy && edge.toNode && edge.toNode.colors) {
            baseColor = parseInt(edge.toNode.colors.stroke.replace('#', '0x'), 16);
            // Linhas até arquivos mais finas e elegantes (0.16) para manter limpeza visual; pastas mantêm 0.50
            baseOpacity = edge.toNode.isFolder ? 0.50 : 0.16;
        }
        edge.baseColor = baseColor;
        edge.baseOpacity = baseOpacity;

        const mat = new THREE.LineBasicMaterial({
            color: baseColor,
            transparent: true,
            opacity: baseOpacity,
            blending: THREE.AdditiveBlending
        });

        const line = new THREE.Line(geo, mat);
        this.edgeGroup.add(line);
        edge.lineMesh = line;
    }

    _updateEdgeCurve(edge) {
        if (!edge || !edge.fromNode || !edge.toNode || !edge.lineMesh) return;
        const p1 = edge.fromNode.position;
        const p2 = edge.toNode.position;

        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const elevation = 20 + mid.length() * 0.12;
        mid.add(mid.clone().normalize().multiplyScalar(elevation));

        edge.curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const points = edge.curve.getPoints(24);
        edge.lineMesh.geometry.setFromPoints(points);
    }

    _updateAllEdges() {
        for (let i = 0; i < this.edges.length; i++) {
            this._updateEdgeCurve(this.edges[i]);
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

            // 1. If currently dragging a 3D node
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

            // 2. Raycast to detect hovered node (recursivo para acertar partes do neurônio)
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this._getInteractiveMeshes(), true);

            if (intersects.length > 0) {
                const node = this._getNodeFromObject(intersects[0].object);
                if (node && this.hoveredNode !== node) {
                    this._setHoveredNode(node, px, py);
                } else if (node) {
                    this._updateTooltipPos(px, py);
                } else if (!node && this.hoveredNode) {
                    this._clearHover();
                }
            } else {
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
                    const node = this._getNodeFromObject(intersects[0].object);
                    if (node) {
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
                const node = this._getNodeFromObject(intersects[0].object);
                if (node) {
                    this.selectedNode = node;
                    this._setHoveredNode(node, px, py);
                    if (this.onNodeClick) {
                        this.onNodeClick(node);
                    }
                }
            } else {
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
                const key = `${edge.from}->${edge.to}`;
                const inPath = pathEdges.has(key);
                if (inPath) {
                    edge.lineMesh.material.opacity = 0.95;
                    edge.lineMesh.material.color.setHex(0x38bdf8); // Ilumina o caminho neural em ciano brilhante
                } else {
                    edge.lineMesh.material.opacity = 0.03;
                }
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
            if (isConn) {
                edge.lineMesh.material.opacity = 0.9;
                edge.lineMesh.material.color.setHex(0xa78bfa);
            } else {
                edge.lineMesh.material.opacity = 0.04;
            }
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
            edge.lineMesh.material.opacity = edge.baseOpacity !== undefined ? edge.baseOpacity : 0.22;
            edge.lineMesh.material.color.setHex(edge.baseColor !== undefined ? edge.baseColor : 0x8b5cf6);
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
        // Recompute arches when a node is dragged
        for (const edge of this.edges) {
            if (edge.from === node.id || edge.to === node.id) {
                const p1 = edge.fromNode.position;
                const p2 = edge.toNode.position;
                const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
                mid.add(mid.clone().normalize().multiplyScalar(20 + mid.length() * 0.12));

                edge.curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
                const points = edge.curve.getPoints(24);
                edge.lineMesh.geometry.setFromPoints(points);
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
        this._animateCameraTo(this.defaultCameraPos, this.defaultTargetPos);
    }

    focusNode(node) {
        if (!node) return;
        this.selectedNode = node;

        // Position camera in front of node along its radial direction
        const dir = node.position.clone().normalize();
        if (dir.length() === 0) dir.set(0, 0, 1);
        const targetPos = node.position.clone();
        const camPos = targetPos.clone().add(dir.multiplyScalar(140));

        this._animateCameraTo(camPos, targetPos);
    }

    reheat() {
        // Organic 3D planetary pulse with spring dynamics
        for (const n of this.nodes) {
            if (n.id === 'brain') continue;
            const jitter = new THREE.Vector3(
                (Math.random() - 0.5) * 26,
                (Math.random() - 0.5) * 26,
                (Math.random() - 0.5) * 26
            );
            n.velocity.add(jitter);
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

    _applyCombinedFilter() {
        const rawQ = (this.currentQuery || '').trim();
        const q = rawQ.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const hasQuery = q.length > 0;
        const cat = this.currentCategory;
        const hasCat = Boolean(cat && cat !== 'all');

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
            if (!edge.lineMesh || !edge.lineMesh.visible) continue;
            const isMatch = (edge.fromNode && edge.fromNode.group === groupKey) || (edge.toNode && edge.toNode.group === groupKey);
            if (isMatch) {
                edge.lineMesh.material.opacity = 0.88;
                edge.lineMesh.material.color.setHex(0x38bdf8);
            } else {
                edge.lineMesh.material.opacity = 0.04;
            }
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
            if (edge.lineMesh) {
                edge.lineMesh.material.opacity = edge.baseOpacity !== undefined ? edge.baseOpacity : 0.22;
                edge.lineMesh.material.color.setHex(edge.baseColor !== undefined ? edge.baseColor : 0x8b5cf6);
            }
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
                if (node.somaMesh && node.somaMesh.material) {
                    node.somaMesh.material.color.setHex(colorHex);
                    node.somaMesh.material.emissive.setHex(colorHex);
                }
                if (node.glowSprite && node.glowSprite.material) {
                    node.glowSprite.material.color.setHex(colorHex);
                }
                if (node.outerRing && node.outerRing.material) {
                    node.outerRing.material.color.setHex(colorHex);
                }
            }
        }

        for (const edge of this.edges) {
            if (edge.toNode && edge.toNode.group === groupKey) {
                edge.baseColor = colorHex;
                if (edge.lineMesh && edge.lineMesh.material) {
                    edge.lineMesh.material.color.setHex(colorHex);
                }
            }
        }
    }

    _notifyCameraChange() {
        if (this.onCameraChange) {
            const dist = this.camera.position.distanceTo(this.controls.target);
            const zoomPercent = Math.round((560 / dist) * 100);
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

        // 3. Planetary Core Rotations
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

        // 4. Update Node Orbit Rings, Pulsing Nuclei & Smart Label LOD
        const camDir = new THREE.Vector3();
        this.camera.getWorldDirection(camDir);

        for (const n of this.nodes) {
            if (n.outerRing) {
                n.outerRing.rotation.z += 0.015;
            }

            // Pulso orgânico suave no núcleo dos neurônios
            if (n.nucleusMesh) {
                const pulse = 0.9 + Math.sin(this.time * 2.5 + (n.size || 10)) * 0.12;
                n.nucleusMesh.scale.setScalar(pulse);
                if (n.nucAura) {
                    const baseScale = (n.visualRadius || 8) * 1.35;
                    const auraPulse = baseScale * (0.94 + Math.sin(this.time * 2.0 + (n.size || 10)) * 0.12);
                    n.nucAura.scale.set(auraPulse, auraPulse, 1);
                }
            }

            // Controle inteligente de visibilidade e LOD dos rótulos
            if (n.labelSprite && n.id !== 'brain') {
                const nodeDir = n.position.clone().normalize();
                const dot = nodeDir.dot(camDir);

                // 1. Rótulos virados para trás são 100% ocultados (zero ruído no hemisfério oposto)
                if (dot >= 0.08) {
                    n.labelSprite.visible = false;
                    n.labelSprite.material.opacity = 0;
                    continue;
                }

                // 2. Visibilidade inteligente na face frontal:
                // - Pastas e Sol central: sempre visíveis
                // - Arquivos: visíveis se em foco (hover/seleção), se encontrados na busca,
                //   ou se a câmera estiver em zoom próximo
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

        // 4.1 Pulso cintilante UAU nas terminações e botões sinápticos
        if (this.nodeStyle === 'neuron' && this.synapticBoutons && this.synapticBoutons.length > 0) {
            const t = this.time;
            const colEmber = BrainGraph.COLOR_EMBER;
            const colPeak = BrainGraph.COLOR_PEAK;

            for (let i = 0; i < this.synapticBoutons.length; i++) {
                const sb = this.synapticBoutons[i];
                if (!sb.flare.parent) continue;

                // 1. Ciclo respiratório suave e orgânico (0.0 a 1.0)
                const breathRaw = Math.sin(t * sb.speed + sb.phase);
                const breath = breathRaw * 0.5 + 0.5;

                // 2. Micro-cintilação biológica eletrostática (shimmer)
                const shimmer = Math.sin(t * sb.twinkleFreq + sb.phase * 2.1) * 0.12
                              + Math.sin(t * (sb.twinkleFreq * 1.6) + sb.phase) * 0.06;

                // 3. Centelha / Micro-descarga sináptica espontânea (burst estelar rápido e vivo)
                const burstRaw = Math.sin(t * sb.burstFreq + sb.burstPhase);
                const burst = burstRaw > 0.80 ? Math.pow((burstRaw - 0.80) / 0.20, 2.5) : 0;

                // Dinâmica de escala perceptível e impactante (de 0.74x a 1.90x na centelha)
                const scaleFactor = 0.74 + breath * 0.50 + shimmer + burst * 0.65;
                const s = sb.baseScale * scaleFactor;
                sb.flare.scale.set(s, s, 1);

                // Modulação de opacidade e brilho (de 0.40 suave a 1.0 incandescente)
                const alpha = Math.min(1.0, 0.42 + breath * 0.48 + shimmer * 0.4 + burst * 0.35);
                sb.flare.material.opacity = alpha;

                // Transição de temperatura de cor (Âmbar aconchegante -> Ouro solar -> Diamante incandescente)
                if (colEmber && colPeak) {
                    const colorT = Math.min(1.0, breath * 0.65 + burst * 0.60);
                    sb.flare.material.color.lerpColors(colEmber, colPeak, colorT);
                }

                // Rotação suave anamórfica da cruz de luz
                sb.flare.material.rotation = sb.baseRot + Math.sin(t * 0.6 + sb.phase) * 0.14;

                // Bulbo interno incandescente acompanha o pulso
                if (sb.bulb) {
                    const bulbScale = 0.75 + breath * 0.45 + burst * 0.75;
                    sb.bulb.scale.setScalar(bulbScale);
                    sb.bulb.material.opacity = Math.min(1.0, 0.55 + breath * 0.35 + burst * 0.20);
                }
            }
        }

        // 5. Update Synaptic Light Photons (feixes de luz calibrados por velocidade física)
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

                // Efeito elétrico de luz: arco senoidal de intensidade com foco e velocidade uniforme
                const lifeAlpha = Math.sin(p.progress * Math.PI);
                p.sprite.material.opacity = 0.35 + lifeAlpha * 0.65;
                const sz = p.baseSize * (0.85 + lifeAlpha * 0.25);
                p.sprite.scale.set(sz, sz, 1);
            }
        }

        // 6. Render 3D Scene
        this.renderer.render(this.scene, this.camera);

        this.animFrame = requestAnimationFrame(() => this._animate());
    }
}
