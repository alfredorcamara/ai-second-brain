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

        // Synaptic particles
        this.particles = [];
        this.maxParticles = 50;

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
        this.time = 0;
        this.animFrame = null;

        // 3D Dynamic Spring Physics Parameters
        this.kSpring = 0.085;     // Spring stiffness between connected nodes
        this.kHome = 0.026;       // Elastic tether returning nodes to planetary formation
        this.damping = 0.84;      // Damping / viscosity
        this.physicsEnergy = 0.0; // Current kinetic energy

        // Icon Display
        this.showIcons = false;

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
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.85;
        this.controls.target.copy(this.defaultTargetPos);

        // Groups
        this.scene.add(this.coreGroup);
        this.scene.add(this.edgeGroup);
        this.scene.add(this.particleGroup);
        this.scene.add(this.nodeGroup);

        // Procedural Glow Texture
        this.glowTexture = this._createGlowTexture();
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

        // 3. Planetary Orbital Rings (Tilted celestial rings like Saturn)
        const ringGeo1 = new THREE.RingGeometry(180, 182, 96);
        const ringMat1 = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.15
        });
        this.ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        this.ring1.rotation.x = Math.PI * 0.42;
        this.ring1.rotation.y = Math.PI * 0.12;
        this.coreGroup.add(this.ring1);

        const ringGeo2 = new THREE.RingGeometry(240, 241.5, 96);
        const ringMat2 = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.08
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

        // 1. Calculate 3D Spherical Positions for Nodes (Planetary Cortex)
        const planetRadius = 210;

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

        this.nodes = graphNodes.map(n => {
            const idx = groupIndices[n.group] || 0;
            groupIndices[n.group] = idx + 1;
            const count = groupCounts[n.group] || 1;

            const sector = groupSectors[n.group] || { theta: 0, phi: Math.PI / 2, r: planetRadius };

            let pos3D;
            if (n.id === 'brain') {
                pos3D = new THREE.Vector3(0, 0, 0);
            } else {
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

        // 2. Perform 3D Relaxation Step so nodes don't collide
        this._relax3DNodes();

        // 2.1 Save equilibrium celestial home positions & masses for spring dynamics
        for (const node of this.nodes) {
            node.homePos = node.position.clone();
            node.velocity = new THREE.Vector3(0, 0, 0);
            node.mass = node.id === 'brain' ? 999999 : (node.size >= 14 ? 2.5 : 1.2);
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
        const iterations = 45;
        const nodes = this.nodes.filter(n => n.id !== 'brain');

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

    _create3DNode(node) {
        const radius = Math.max(7, (node.size || 10) * 0.95);
        const colorHex = parseInt(node.colors.fill.replace('#', '0x'), 16);
        const strokeHex = parseInt(node.colors.stroke.replace('#', '0x'), 16);

        // 1. 3D Node Sphere
        const geo = new THREE.SphereGeometry(radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.45,
            roughness: 0.25,
            metalness: 0.3
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(node.position);
        mesh.userData = { node: node };
        this.nodeGroup.add(mesh);
        node.mesh = mesh;
        this.interactiveMeshes.push(mesh);

        // 2. Outer Halo Glow Sprite
        const glowMat = new THREE.SpriteMaterial({
            map: this.glowTexture,
            color: strokeHex,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Sprite(glowMat);
        const glowScale = radius * 3.8;
        glow.scale.set(glowScale, glowScale, 1);
        mesh.add(glow);
        node.glowSprite = glow;

        // 3. Orbiting Pulse Ring for Major Nodes
        if (node.size >= 14 || node.id === 'brain') {
            const ringGeo = new THREE.TorusGeometry(radius * 1.35, 0.7, 8, 48);
            const ringMat = new THREE.MeshBasicMaterial({
                color: strokeHex,
                transparent: true,
                opacity: 0.5
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            mesh.add(ring);
            node.outerRing = ring;
        }

        // 4. Billboard 3D Text Label
        node.labelSprite = this._createLabelSprite(node.label, radius, node.colors.fill);
        node.labelSprite.position.set(0, radius + 11, 0);
        mesh.add(node.labelSprite);

        // 5. Emoji Icon Sprite (hidden by default, toggled via setShowIcons)
        if (node.icon) {
            node.iconSprite = this._createIconSprite(node.icon, radius);
            node.iconSprite.visible = this.showIcons;
            mesh.add(node.iconSprite);

            // When icons are showing, hide the sphere mesh visual but keep it interactive
            if (this.showIcons) {
                mesh.material.visible = false;
                if (node.glowSprite) node.glowSprite.visible = false;
                if (node.outerRing) node.outerRing.visible = false;
            }
        }
    }

    _createLabelSprite(text, nodeRadius, fillColor) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontSize = 28;
        ctx.font = `600 ${fontSize}px Inter, -apple-system, sans-serif`;

        const textMetrics = ctx.measureText(text);
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
        ctx.fillText(text, cx, cy);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 0.92,
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
                // Show icon sprite, hide the 3D sphere visual
                node.iconSprite.visible = true;
                node.mesh.material.visible = false;
                if (node.glowSprite) node.glowSprite.visible = false;
                if (node.outerRing) node.outerRing.visible = false;
            } else {
                // Hide icon sprite, restore 3D sphere
                if (node.iconSprite) node.iconSprite.visible = false;
                node.mesh.material.visible = true;
                if (node.glowSprite) node.glowSprite.visible = true;
                if (node.outerRing) node.outerRing.visible = true;
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

        const mat = new THREE.LineBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.22,
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

    _init3DParticles() {
        this.particles = [];
        const particleGeo = new THREE.SphereGeometry(1.4, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
            color: 0xc4b5fd,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        for (let i = 0; i < this.maxParticles; i++) {
            if (this.edges.length === 0) break;
            const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
            const mesh = new THREE.Mesh(particleGeo, particleMat.clone());
            this.particleGroup.add(mesh);

            this.particles.push({
                edge: edge,
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.006,
                mesh: mesh
            });
        }
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

            // 2. Raycast to detect hovered node
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.interactiveMeshes);

            if (intersects.length > 0) {
                const topMesh = intersects[0].object;
                const node = topMesh.userData.node;

                if (this.hoveredNode !== node) {
                    this._setHoveredNode(node, px, py);
                } else if (node) {
                    this._updateTooltipPos(px, py);
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
                const intersects = this.raycaster.intersectObjects(this.interactiveMeshes);

                if (intersects.length > 0) {
                    const topMesh = intersects[0].object;
                    this.dragNode = topMesh.userData.node;
                    this.isDraggingNode = true;
                    this.physicsEnergy = 1.0;

                    // Plane oriented facing camera at the node position
                    const planeNormal = new THREE.Vector3();
                    this.camera.getWorldDirection(planeNormal).negate();
                    this.dragPlane.setFromNormalAndCoplanarPoint(planeNormal, this.dragNode.position);

                    // Pause orbit rotation while dragging an individual node
                    this.controls.enabled = false;
                    this.canvas.style.cursor = 'grabbing';
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
                this.physicsEnergy = 1.0; // Continue spring physics so nodes bounce back gracefully
            }
        });

        // Click on node: ONLY select & highlight, do NOT navigate away!
        this.canvas.addEventListener('click', (e) => {
            if (this.hasDraggedPointer) return;

            const rect = this.canvas.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.interactiveMeshes);

            if (intersects.length > 0) {
                const node = intersects[0].object.userData.node;
                this.selectedNode = node;
                this._setHoveredNode(node, px, py);
                if (this.onNodeClick) {
                    this.onNodeClick(node);
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
            const intersects = this.raycaster.intersectObjects(this.interactiveMeshes);

            if (intersects.length > 0) {
                const node = intersects[0].object.userData.node;
                if (this.onNodeDblClick) {
                    this.onNodeDblClick(node);
                } else {
                    this.focusNode(node);
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

    _applySpotlight(node) {
        if (!node) return;
        for (const n of this.nodes) {
            const isConn = this._isNodeConnected(node, n);
            const isSelf = n.id === node.id;

            if (isSelf) {
                n.mesh.scale.set(1.35, 1.35, 1.35);
                n.mesh.material.emissiveIntensity = 0.95;
                if (n.glowSprite) n.glowSprite.scale.setScalar(n.size * 5.5);
            } else if (isConn) {
                n.mesh.scale.set(1.15, 1.15, 1.15);
                n.mesh.material.emissiveIntensity = 0.7;
                n.mesh.material.opacity = 1.0;
            } else {
                // Dim non-connected nodes
                n.mesh.scale.set(0.9, 0.9, 0.9);
                n.mesh.material.emissiveIntensity = 0.15;
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

        this._applySpotlight(node);

        // Tooltip
        const connCount = this._getConnectedEdges(node).length;
        this.tooltip.innerHTML = `
            <div class="tooltip-title">${node.label}</div>
            <div class="tooltip-type">${node.group.toUpperCase()} • ${connCount} conexões 3D</div>
            <div class="tooltip-hint" style="font-size: 11px; color: #a78bfa; margin-top: 5px; font-weight: 500;">
                ⚡ Clique para selecionar • Duplo-clique para abrir
            </div>
        `;
        this._updateTooltipPos(px, py);
        this.tooltip.classList.add('visible');
    }

    _clearHover() {
        this.hoveredNode = null;
        this.canvas.style.cursor = 'default';
        this.tooltip.classList.remove('visible');

        // If a node is selected, keep its spotlight active!
        if (this.selectedNode) {
            this._applySpotlight(this.selectedNode);
            return;
        }

        // Restore all nodes and edges to equilibrium
        for (const n of this.nodes) {
            n.mesh.scale.set(1, 1, 1);
            n.mesh.material.emissiveIntensity = 0.45;
            if (n.glowSprite) {
                const s = Math.max(7, (n.size || 10) * 0.95) * 3.8;
                n.glowSprite.scale.set(s, s, 1);
            }
        }

        for (const edge of this.edges) {
            edge.lineMesh.material.opacity = 0.22;
            edge.lineMesh.material.color.setHex(0x8b5cf6);
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

    _notifyCameraChange() {
        if (this.onCameraChange) {
            const dist = this.camera.position.distanceTo(this.controls.target);
            const zoomPercent = Math.round((560 / dist) * 100);
            this.onCameraChange({
                scale: zoomPercent / 100,
                zoomPercent: zoomPercent,
                rotationDeg: 0,
                autoOrbit: this.controls.autoRotate
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

        // 4. Update Node Orbit Rings & Depth Label Fading
        const camDir = new THREE.Vector3();
        this.camera.getWorldDirection(camDir);

        for (const n of this.nodes) {
            if (n.outerRing) {
                n.outerRing.rotation.z += 0.015;
            }

            // Faint labels of nodes on the back side of the planetary sphere
            if (n.labelSprite && n.id !== 'brain') {
                const nodeDir = n.position.clone().normalize();
                const dot = nodeDir.dot(camDir);
                // If facing away, attenuate opacity smoothly
                const targetOpacity = dot < 0.15 ? 0.92 : 0.25;
                n.labelSprite.material.opacity += (targetOpacity - n.labelSprite.material.opacity) * 0.1;
            }
        }

        // 5. Update Synaptic Pulse Photons
        for (const p of this.particles) {
            if (!p.edge || !p.edge.curve) continue;
            p.progress += p.speed;
            if (p.progress >= 1.0) {
                p.progress = 0;
                p.edge = this.edges[Math.floor(Math.random() * this.edges.length)];
            }
            if (p.edge && p.edge.curve) {
                const pt = p.edge.curve.getPoint(p.progress);
                p.mesh.position.copy(pt);
            }
        }

        // 6. Render 3D Scene
        this.renderer.render(this.scene, this.camera);

        this.animFrame = requestAnimationFrame(() => this._animate());
    }
}
