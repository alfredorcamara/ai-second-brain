// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Neural Graph Renderer v2
// High-performance canvas force-directed graph with:
// - Physics simulation (repulsion, spring tension, gravity, inertia)
// - Cursor-centered Zoom In / Out
// - Full 360° graph rotation (Obsidian style)
// - Tactile node dragging with momentum & spring reactivity
// - Obsidian-like focus dimming & synaptic pulse particles
// - Auto-orbit & camera animations
// ═══════════════════════════════════════════════════

class BrainGraph {
    constructor(canvas, tooltipEl) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tooltip = tooltipEl;

        this.nodes = [];
        this.edges = [];
        this.nodeMap = new Map();
        this.groupColors = {};

        // Camera transform state
        this.pan = { x: 0, y: 0 };
        this.scale = 1.0;
        this.rotation = 0; // in radians

        // Target camera state for smooth lerp transitions
        this.cameraAnimating = false;
        this.targetPan = { x: 0, y: 0 };
        this.targetScale = 1.0;
        this.targetRotation = 0;

        // Auto-orbit state (Obsidian galaxy orbit)
        this.autoOrbit = false;
        this.orbitSpeed = 0.0018;

        // Physics parameters
        this.kRepulsion = 11000;
        this.kSpring = 0.045;
        this.kGravity = 0.0009;
        this.damping = 0.86;
        this.alpha = 1.0; // simulation energy
        this.minAlpha = 0.001;
        this.alphaDecay = 0.004;

        // Synaptic particles
        this.particles = [];
        this.maxParticles = 35;

        // Interaction state
        this.hoveredNode = null;
        this.selectedNode = null;
        this.dragNode = null;
        this.isPanning = false;
        this.isRotating = false;
        this.hasDragged = false;

        this.panStart = { x: 0, y: 0 };
        this.rotateStartAngle = 0;
        this.rotateStartRotation = 0;
        this.dragMouseOffset = { x: 0, y: 0 };
        this.dragPrevWorld = { x: 0, y: 0 };

        this.dpr = window.devicePixelRatio || 1;
        this.time = 0;
        this.animFrame = null;

        // Callbacks
        this.onNodeClick = null;
        this.onCameraChange = null;

        this._setupCanvas();
        this._setupEvents();
    }

    _setupCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    // ── Coordinate Transforms ─────────────────────────
    screenToWorld(sx, sy) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const dx = sx - cx - this.pan.x;
        const dy = sy - cy - this.pan.y;
        const ux = dx / this.scale;
        const uy = dy / this.scale;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        return {
            x: ux * cos + uy * sin,
            y: -ux * sin + uy * cos
        };
    }

    worldToScreen(wx, wy) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const rx = wx * cos - wy * sin;
        const ry = wx * sin + wy * cos;
        return {
            x: cx + this.pan.x + rx * this.scale,
            y: cy + this.pan.y + ry * this.scale
        };
    }

    _findNodeAt(sx, sy) {
        const wpos = this.screenToWorld(sx, sy);
        // Find topmost node under cursor
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            const dist = Math.hypot(wpos.x - node.x, wpos.y - node.y);
            const hitRadius = (node.size + 8);
            if (dist <= hitRadius) {
                return node;
            }
        }
        return null;
    }

    // ── Data Loading & Initialization ────────────────
    loadData(graphNodes, graphEdges, groupColors) {
        this.groupColors = groupColors || {};
        this.nodeMap.clear();

        // Calculate initial world coordinates based on layout
        this.nodes = graphNodes.map(n => {
            const worldX = (n.x - 0.5) * 880;
            const worldY = (n.y - 0.5) * 660;
            const nodeObj = {
                ...n,
                x: worldX,
                y: worldY,
                vx: 0,
                vy: 0,
                fx: 0,
                fy: 0,
                mass: Math.max(1, (n.size || 10) * 0.15),
                isPinned: false
            };
            this.nodeMap.set(n.id, nodeObj);
            return nodeObj;
        });

        this.edges = graphEdges.map(e => ({
            from: e.from,
            to: e.to,
            fromNode: this.nodeMap.get(e.from),
            toNode: this.nodeMap.get(e.to)
        })).filter(e => e.fromNode && e.toNode);

        // Pre-create synaptic pulse particles
        this._initParticles();

        // Reheat physics
        this.alpha = 1.0;
        this._notifyCameraChange();
    }

    _initParticles() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            if (this.edges.length === 0) break;
            const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
            this.particles.push({
                edge: edge,
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.007,
                size: 1.2 + Math.random() * 1.5,
                color: null
            });
        }
    }

    // ── Physics Simulation ────────────────────────────
    _stepPhysics() {
        if (this.alpha < this.minAlpha && !this.dragNode) {
            return; // Physics is at rest
        }

        const nodes = this.nodes;
        const edges = this.edges;
        const n = nodes.length;

        // Reset forces
        for (let i = 0; i < n; i++) {
            nodes[i].fx = 0;
            nodes[i].fy = 0;
        }

        // 1. Pairwise Repulsion (Coulomb law with softening)
        for (let i = 0; i < n; i++) {
            const na = nodes[i];
            for (let j = i + 1; j < n; j++) {
                const nb = nodes[j];
                const dx = nb.x - na.x;
                const dy = nb.y - na.y;
                const distSq = dx * dx + dy * dy + 400; // softening term
                const dist = Math.sqrt(distSq);

                // Nodes of same group or core repel with varied force
                const repMult = (na.size + nb.size) * 0.5;
                const force = (this.kRepulsion * repMult) / distSq;

                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                na.fx -= fx;
                na.fy -= fy;
                nb.fx += fx;
                nb.fy += fy;
            }
        }

        // 2. Spring Attraction along Edges (Hooke's law)
        for (let i = 0; i < edges.length; i++) {
            const e = edges[i];
            const na = e.fromNode;
            const nb = e.toNode;

            const dx = nb.x - na.x;
            const dy = nb.y - na.y;
            const dist = Math.hypot(dx, dy) || 1;

            // Rest length depends on node sizes
            const restLength = 80 + (na.size + nb.size) * 2.2;
            const diff = dist - restLength;
            const force = diff * this.kSpring;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            na.fx += fx;
            na.fy += fy;
            nb.fx -= fx;
            nb.fy -= fy;
        }

        // 3. Center Gravity (pulls whole cluster toward origin)
        for (let i = 0; i < n; i++) {
            const na = nodes[i];
            na.fx -= na.x * this.kGravity * na.mass;
            na.fy -= na.y * this.kGravity * na.mass;
        }

        // 4. Integrate Velocities and Positions
        const currentAlpha = Math.max(this.alpha, this.dragNode ? 0.35 : 0.0);
        for (let i = 0; i < n; i++) {
            const na = nodes[i];
            if (na.isPinned) {
                na.vx = 0;
                na.vy = 0;
                continue;
            }

            na.vx = (na.vx + (na.fx / na.mass) * currentAlpha) * this.damping;
            na.vy = (na.vy + (na.fy / na.mass) * currentAlpha) * this.damping;

            // Cap maximum speed to prevent wild explosions
            const speed = Math.hypot(na.vx, na.vy);
            const maxSpeed = 16;
            if (speed > maxSpeed) {
                na.vx = (na.vx / speed) * maxSpeed;
                na.vy = (na.vy / speed) * maxSpeed;
            }

            na.x += na.vx;
            na.y += na.vy;
        }

        // Decay simulation energy
        if (!this.dragNode) {
            this.alpha *= (1 - this.alphaDecay);
        }
    }

    reheat(amount = 0.8) {
        this.alpha = Math.max(this.alpha, amount);
        // Add tiny organic random impulses
        for (const node of this.nodes) {
            if (!node.isPinned) {
                node.vx += (Math.random() - 0.5) * 4;
                node.vy += (Math.random() - 0.5) * 4;
            }
        }
    }

    // ── Event Handlers ────────────────────────────────
    _setupEvents() {
        window.addEventListener('resize', () => {
            this._setupCanvas();
        });

        // Mouse Wheel: Zoom in / Zoom out centered on cursor position!
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            // World position under cursor before zoom
            const before = this.screenToWorld(mx, my);

            // Zoom step
            const zoomDelta = e.deltaY < 0 ? 1.14 : 0.88;
            const newScale = Math.min(Math.max(this.scale * zoomDelta, 0.2), 4.5);

            this.scale = newScale;

            // Adjust pan so world coordinate under mouse remains perfectly pinned
            const cx = this.width / 2;
            const cy = this.height / 2;
            const cos = Math.cos(this.rotation);
            const sin = Math.sin(this.rotation);
            const rx = before.x * cos - before.y * sin;
            const ry = before.x * sin + before.y * cos;

            this.pan.x = mx - cx - rx * newScale;
            this.pan.y = my - cy - ry * newScale;

            this._notifyCameraChange();
        }, { passive: false });

        // Mouse Down
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            this.hasDragged = false;

            // Check if rotation mode: Right Click (button 2) OR Shift+Left Click OR Alt+Left Click
            if (e.button === 2 || ((e.shiftKey || e.altKey) && e.button === 0)) {
                this.isRotating = true;
                const cx = this.width / 2 + this.pan.x;
                const cy = this.height / 2 + this.pan.y;
                this.rotateStartAngle = Math.atan2(my - cy, mx - cx);
                this.rotateStartRotation = this.rotation;
                this.canvas.style.cursor = 'crosshair';
                return;
            }

            if (e.button === 0) {
                const node = this._findNodeAt(mx, my);
                if (node) {
                    // Grabbing a node
                    this.dragNode = node;
                    node.isPinned = true;
                    const wpos = this.screenToWorld(mx, my);
                    this.dragMouseOffset = { x: node.x - wpos.x, y: node.y - wpos.y };
                    this.dragPrevWorld = { ...wpos };
                    this.canvas.style.cursor = 'grabbing';
                    this.reheat(0.9);
                } else {
                    // Panning canvas background
                    this.isPanning = true;
                    this.panStart = { x: mx - this.pan.x, y: my - this.pan.y };
                    this.canvas.style.cursor = 'grabbing';
                }
            }
        });

        // Mouse Move
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            // 1. Rotating Graph
            if (this.isRotating) {
                const cx = this.width / 2 + this.pan.x;
                const cy = this.height / 2 + this.pan.y;
                const currAngle = Math.atan2(my - cy, mx - cx);
                const deltaAngle = currAngle - this.rotateStartAngle;
                this.rotation = this.rotateStartRotation + deltaAngle;
                this.hasDragged = true;
                this._notifyCameraChange();
                return;
            }

            // 2. Dragging Individual Node
            if (this.dragNode) {
                const currWorld = this.screenToWorld(mx, my);
                const targetX = currWorld.x + this.dragMouseOffset.x;
                const targetY = currWorld.y + this.dragMouseOffset.y;

                // Impart drag velocity for momentum upon release
                this.dragNode.vx = (targetX - this.dragNode.x) * 0.5;
                this.dragNode.vy = (targetY - this.dragNode.y) * 0.5;

                this.dragNode.x = targetX;
                this.dragNode.y = targetY;

                this.hasDragged = true;
                this.reheat(0.8);
                return;
            }

            // 3. Panning Canvas
            if (this.isPanning) {
                this.pan.x = mx - this.panStart.x;
                this.pan.y = my - this.panStart.y;
                this.hasDragged = true;
                this._notifyCameraChange();
                return;
            }

            // 4. Hover Detection
            const node = this._findNodeAt(mx, my);
            if (node !== this.hoveredNode) {
                this.hoveredNode = node;
                this.canvas.style.cursor = node ? 'grab' : (e.shiftKey ? 'crosshair' : 'default');

                if (node) {
                    this.tooltip.innerHTML = `
                        <div class="tooltip-title">${node.label}</div>
                        <div class="tooltip-type">${node.group.toUpperCase()} • ${this._getConnectedEdges(node).length} conexões</div>
                    `;
                    this.tooltip.style.left = (mx + 16) + 'px';
                    this.tooltip.style.top = (my - 8) + 'px';
                    this.tooltip.classList.add('visible');
                } else {
                    this.tooltip.classList.remove('visible');
                }
            }

            if (node) {
                this.tooltip.style.left = (mx + 16) + 'px';
                this.tooltip.style.top = (my - 8) + 'px';
            }
        });

        // Mouse Up
        window.addEventListener('mouseup', (e) => {
            if (this.dragNode) {
                this.dragNode.isPinned = false;
                this.dragNode = null;
                this.reheat(0.6);
            }
            this.isPanning = false;
            this.isRotating = false;
            this.canvas.style.cursor = this.hoveredNode ? 'grab' : 'default';
        });

        // Click on node (only if user didn't drag)
        this.canvas.addEventListener('click', (e) => {
            if (this.hasDragged) return;

            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const node = this._findNodeAt(mx, my);

            if (node && this.onNodeClick) {
                this.selectedNode = node;
                this.onNodeClick(node);
            }
        });

        // Double Click: Focus on node or reset camera
        this.canvas.addEventListener('dblclick', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const node = this._findNodeAt(mx, my);

            if (node) {
                this.focusNode(node);
            } else {
                this.resetView();
            }
        });

        // Prevent browser context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Mouse Leave
        this.canvas.addEventListener('mouseleave', () => {
            if (!this.dragNode && !this.isPanning && !this.isRotating) {
                this.hoveredNode = null;
                this.tooltip.classList.remove('visible');
            }
        });
    }

    _getConnectedEdges(node) {
        if (!node) return [];
        return this.edges.filter(e => e.fromNode.id === node.id || e.toNode.id === node.id);
    }

    _isNodeConnected(nodeA, nodeB) {
        if (!nodeA || !nodeB) return false;
        if (nodeA.id === nodeB.id) return true;
        return this.edges.some(e =>
            (e.fromNode.id === nodeA.id && e.toNode.id === nodeB.id) ||
            (e.toNode.id === nodeA.id && e.fromNode.id === nodeB.id)
        );
    }

    // ── Camera Manipulation Controls ─────────────────
    zoomIn() {
        this._zoomFromCenter(1.3);
    }

    zoomOut() {
        this._zoomFromCenter(0.77);
    }

    _zoomFromCenter(factor) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const before = this.screenToWorld(cx, cy);
        const newScale = Math.min(Math.max(this.scale * factor, 0.2), 4.5);
        this.scale = newScale;

        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const rx = before.x * cos - before.y * sin;
        const ry = before.x * sin + before.y * cos;
        this.pan.x = -rx * newScale;
        this.pan.y = -ry * newScale;

        this._notifyCameraChange();
    }

    rotateBy(deltaRad) {
        this.rotation += deltaRad;
        this._notifyCameraChange();
    }

    toggleAutoOrbit() {
        this.autoOrbit = !this.autoOrbit;
        return this.autoOrbit;
    }

    resetView() {
        this.pan = { x: 0, y: 0 };
        this.scale = 1.0;
        this.rotation = 0;
        this.reheat(0.8);
        this._notifyCameraChange();
    }

    focusNode(node) {
        if (!node) return;
        this.selectedNode = node;
        // Smoothly center the node and zoom in
        this.scale = 1.5;
        this.rotation = 0;
        this.pan.x = -node.x * this.scale;
        this.pan.y = -node.y * this.scale;
        this.reheat(0.5);
        this._notifyCameraChange();
    }

    _notifyCameraChange() {
        if (this.onCameraChange) {
            const zoomPercent = Math.round(this.scale * 100);
            const deg = Math.round((this.rotation * 180 / Math.PI) % 360);
            const normalizedDeg = deg < 0 ? deg + 360 : deg;
            this.onCameraChange({
                scale: this.scale,
                zoomPercent,
                rotationDeg: normalizedDeg,
                autoOrbit: this.autoOrbit
            });
        }
    }

    // ── Animation & Rendering Loop ────────────────────
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
        this.time += 0.01;

        // Auto-orbit: celestial rotation like Obsidian
        if (this.autoOrbit) {
            this.rotation += this.orbitSpeed;
            this._notifyCameraChange();
        }

        // Run physics step
        this._stepPhysics();

        // Update synaptic pulse particles
        this._updateParticles();

        // Render frame
        this._draw();

        this.animFrame = requestAnimationFrame(() => this._animate());
    }

    _updateParticles() {
        for (const p of this.particles) {
            p.progress += p.speed;
            if (p.progress >= 1.0) {
                p.progress = 0;
                // Randomly pick a new edge
                p.edge = this.edges[Math.floor(Math.random() * this.edges.length)];
            }
        }
    }

    // ── Drawing ───────────────────────────────────────
    _draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // 1. Clear Screen
        ctx.clearRect(0, 0, w, h);

        // 2. Background Cosmic Nebula Glow
        const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
        bgGrad.addColorStop(0, 'rgba(30, 27, 75, 0.22)');
        bgGrad.addColorStop(0.5, 'rgba(15, 15, 26, 0.45)');
        bgGrad.addColorStop(1, '#0a0a0f');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 3. Subtle Galactic Grid (rotates with camera for spatial immersion)
        ctx.save();
        ctx.translate(w / 2 + this.pan.x, h / 2 + this.pan.y);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);

        this._drawGrid(ctx);

        // 4. Draw Edges (Synapses)
        const hasHover = !!this.hoveredNode;
        const activeHoverId = hasHover ? this.hoveredNode.id : null;

        for (const edge of this.edges) {
            const na = edge.fromNode;
            const nb = edge.toNode;
            const isConnectedToHover = hasHover && (na.id === activeHoverId || nb.id === activeHoverId);

            ctx.beginPath();
            ctx.moveTo(na.x, na.y);
            ctx.lineTo(nb.x, nb.y);

            if (isConnectedToHover) {
                // Vibrant highlighted connection
                ctx.strokeStyle = 'rgba(167, 139, 250, 0.85)';
                ctx.lineWidth = 2.2 / Math.sqrt(this.scale);
                ctx.shadowColor = '#8b5cf6';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0; // reset
            } else if (hasHover) {
                // Obsidian-style dimming for non-connected elements
                ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
                ctx.lineWidth = 0.8 / Math.sqrt(this.scale);
                ctx.stroke();
            } else {
                // Normal edge
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
                ctx.lineWidth = 1.0 / Math.sqrt(this.scale);
                ctx.stroke();
            }
        }

        // 5. Draw Synaptic Pulse Particles
        for (const p of this.particles) {
            if (!p.edge || !p.edge.fromNode || !p.edge.toNode) continue;
            const na = p.edge.fromNode;
            const nb = p.edge.toNode;
            const isConn = hasHover && (na.id === activeHoverId || nb.id === activeHoverId);

            if (hasHover && !isConn) continue; // dim particles during focus

            const px = na.x + (nb.x - na.x) * p.progress;
            const py = na.y + (nb.y - na.y) * p.progress;

            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = isConn ? '#ffffff' : 'rgba(196, 181, 253, 0.75)';
            if (isConn) {
                ctx.shadowColor = '#c4b5fd';
                ctx.shadowBlur = 6;
            }
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // 6. Draw Nodes
        for (const node of this.nodes) {
            const colors = this.groupColors[node.group] || {
                fill: '#6366f1',
                stroke: '#a78bfa',
                glow: 'rgba(99, 102, 241, 0.3)'
            };

            const isHovered = this.hoveredNode === node;
            const isSelected = this.selectedNode === node;
            const isNeighbor = hasHover && this._isNodeConnected(this.hoveredNode, node);
            const isDimmed = hasHover && !isHovered && !isNeighbor;

            const baseSize = node.size || 10;
            const size = baseSize * (isHovered ? 1.35 : (isNeighbor ? 1.15 : 1.0));
            const opacity = isDimmed ? 0.22 : 1.0;
            const breathe = Math.sin(this.time * 2.5 + node.x * 0.05 + node.y * 0.05) * 0.5 + 0.5;

            ctx.save();
            ctx.globalAlpha = opacity;

            // Halo glow for hovered/selected
            if (isHovered || isSelected || isNeighbor) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 14, 0, Math.PI * 2);
                ctx.fillStyle = colors.glow;
                ctx.shadowColor = colors.stroke;
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Outer Orbit Ring
            ctx.beginPath();
            ctx.arc(node.x, node.y, size + 3 + breathe * 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = isHovered ? colors.stroke : `rgba(${hexToRGB(colors.fill)}, ${0.25 + breathe * 0.15})`;
            ctx.lineWidth = isHovered ? 2.0 : 1.0;
            ctx.stroke();

            // Node Body (Radial Sphere Gradient)
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            const nodeGrad = ctx.createRadialGradient(
                node.x - size * 0.3, node.y - size * 0.3, 0,
                node.x, node.y, size
            );
            nodeGrad.addColorStop(0, colors.stroke);
            nodeGrad.addColorStop(1, colors.fill);
            ctx.fillStyle = nodeGrad;
            ctx.fill();

            // Selected Ring
            if (isSelected) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 5, 0, Math.PI * 2);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }

            // 7. Node Typography / Labels (kept upright regardless of graph rotation)
            const shouldShowLabel = !isDimmed || isHovered || isNeighbor || baseSize >= 14 || this.scale > 1.1;
            if (shouldShowLabel) {
                const fontSize = Math.max(9, (isHovered ? 13 : (baseSize >= 18 ? 12 : 10)));
                ctx.save();
                ctx.translate(node.x, node.y);
                ctx.rotate(-this.rotation); // Counter-rotate so text is always horizontally readable!

                ctx.font = `${isHovered ? '700' : '500'} ${fontSize}px Inter, -apple-system, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                const labelY = size + 6;

                // Text shadow backdrop for readability
                ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
                ctx.fillText(node.label, 0, labelY + 1);

                ctx.fillStyle = isHovered ? '#ffffff' : (isNeighbor ? '#e0e7ff' : 'rgba(232, 232, 237, 0.9)');
                ctx.fillText(node.label, 0, labelY);

                ctx.restore();
            }

            ctx.restore();
        }

        ctx.restore();
    }

    _drawGrid(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.035)';
        ctx.lineWidth = 1;

        const gridSize = 120;
        const extent = 1600;

        ctx.beginPath();
        for (let x = -extent; x <= extent; x += gridSize) {
            ctx.moveTo(x, -extent);
            ctx.lineTo(x, extent);
        }
        for (let y = -extent; y <= extent; y += gridSize) {
            ctx.moveTo(-extent, y);
            ctx.lineTo(extent, y);
        }
        ctx.stroke();

        // Origin celestial cross
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.12)';
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// Helper: hex to RGB string
function hexToRGB(hex) {
    if (!hex || hex.length < 6) return '139, 92, 246';
    const clean = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}
