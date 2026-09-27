// ═══════════════════════════════════════════════════
// AI SECOND BRAIN — Neural Graph Renderer
// Canvas-based force-directed graph visualization
// ═══════════════════════════════════════════════════

class BrainGraph {
    constructor(canvas, tooltipEl) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tooltip = tooltipEl;
        this.nodes = [];
        this.edges = [];
        this.hoveredNode = null;
        this.selectedNode = null;
        this.dragNode = null;
        this.offset = { x: 0, y: 0 };
        this.scale = 1;
        this.panOffset = { x: 0, y: 0 };
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.animFrame = null;
        this.time = 0;
        this.dpr = window.devicePixelRatio || 1;
        this.onNodeClick = null;

        this._setupCanvas();
        this._setupEvents();
    }

    _setupCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(this.dpr, this.dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    _setupEvents() {
        // Resize
        window.addEventListener('resize', () => {
            this._setupCanvas();
            this._positionNodes();
        });

        // Mouse move
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            if (this.dragNode) {
                this.dragNode.x = (mx - this.panOffset.x) / this.width;
                this.dragNode.y = (my - this.panOffset.y) / this.height;
                return;
            }

            if (this.isPanning) {
                this.panOffset.x = mx - this.panStart.x;
                this.panOffset.y = my - this.panStart.y;
                return;
            }

            // Find hovered node
            const node = this._findNodeAt(mx, my);
            if (node !== this.hoveredNode) {
                this.hoveredNode = node;
                this.canvas.style.cursor = node ? 'pointer' : 'grab';

                if (node) {
                    this.tooltip.innerHTML = `
                        <div class="tooltip-title">${node.label}</div>
                        <div class="tooltip-type">${node.group}</div>
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

        // Mouse down
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const node = this._findNodeAt(mx, my);

            if (node) {
                this.dragNode = node;
                this.canvas.style.cursor = 'grabbing';
            } else {
                this.isPanning = true;
                this.panStart.x = mx - this.panOffset.x;
                this.panStart.y = my - this.panOffset.y;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        // Mouse up
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.dragNode) {
                this.dragNode = null;
            }
            this.isPanning = false;
            this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
        });

        // Click
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const node = this._findNodeAt(mx, my);

            if (node && this.onNodeClick) {
                this.selectedNode = node;
                this.onNodeClick(node);
            }
        });

        // Mouse leave
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredNode = null;
            this.tooltip.classList.remove('visible');
            this.isPanning = false;
            this.dragNode = null;
        });
    }

    _findNodeAt(mx, my) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            const nx = node.x * this.width + this.panOffset.x;
            const ny = node.y * this.height + this.panOffset.y;
            const dist = Math.hypot(mx - nx, my - ny);
            if (dist <= node.size + 4) {
                return node;
            }
        }
        return null;
    }

    loadData(graphNodes, graphEdges, groupColors) {
        this.nodes = graphNodes.map(n => ({ ...n }));
        this.edges = graphEdges.map(e => ({ ...e }));
        this.groupColors = groupColors;
        this._positionNodes();
    }

    _positionNodes() {
        // Nodes already have relative positions (0-1), just use them
    }

    start() {
        this._animate();
    }

    stop() {
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
        }
    }

    _animate() {
        this.time += 0.008;
        this._draw();
        this.animFrame = requestAnimationFrame(() => this._animate());
    }

    _draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Background glow
        const grd = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.5);
        grd.addColorStop(0, 'rgba(99, 102, 241, 0.03)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);

        // Draw edges
        for (const edge of this.edges) {
            const fromNode = this.nodes.find(n => n.id === edge.from);
            const toNode = this.nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) continue;

            const fx = fromNode.x * w + this.panOffset.x;
            const fy = fromNode.y * h + this.panOffset.y;
            const tx = toNode.x * w + this.panOffset.x;
            const ty = toNode.y * h + this.panOffset.y;

            const isHighlighted = this.hoveredNode &&
                (this.hoveredNode.id === edge.from || this.hoveredNode.id === edge.to);

            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(tx, ty);

            if (isHighlighted) {
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
                ctx.lineWidth = 1.5;
            } else {
                ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
                ctx.lineWidth = 0.8;
            }
            ctx.stroke();

            // Animated particle along edge
            if (isHighlighted || Math.random() < 0.003) {
                const t = (this.time * 0.5 + Math.random()) % 1;
                const px = fx + (tx - fx) * t;
                const py = fy + (ty - fy) * t;
                ctx.beginPath();
                ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(167, 139, 250, 0.6)';
                ctx.fill();
            }
        }

        // Draw nodes
        for (const node of this.nodes) {
            const nx = node.x * w + this.panOffset.x;
            const ny = node.y * h + this.panOffset.y;
            const colors = this.groupColors[node.group] || this.groupColors.core;
            const isHovered = this.hoveredNode === node;
            const isSelected = this.selectedNode === node;
            const isConnected = this.hoveredNode && this.edges.some(e =>
                (e.from === this.hoveredNode.id && e.to === node.id) ||
                (e.to === this.hoveredNode.id && e.from === node.id)
            );

            const size = node.size * (isHovered ? 1.3 : 1);
            const breathe = Math.sin(this.time * 2 + node.x * 10 + node.y * 10) * 0.5 + 0.5;

            // Glow
            if (isHovered || isConnected || isSelected) {
                ctx.beginPath();
                ctx.arc(nx, ny, size + 12, 0, Math.PI * 2);
                ctx.fillStyle = colors.glow;
                ctx.fill();
            }

            // Outer ring animation
            ctx.beginPath();
            ctx.arc(nx, ny, size + 3 + breathe * 2, 0, Math.PI * 2);
            ctx.strokeStyle = isHovered ? colors.stroke : `rgba(${hexToRGB(colors.fill)}, ${0.15 + breathe * 0.1})`;
            ctx.lineWidth = isHovered ? 1.5 : 0.5;
            ctx.stroke();

            // Node body
            ctx.beginPath();
            ctx.arc(nx, ny, size, 0, Math.PI * 2);

            const nodeGrad = ctx.createRadialGradient(nx - size * 0.3, ny - size * 0.3, 0, nx, ny, size);
            nodeGrad.addColorStop(0, colors.stroke);
            nodeGrad.addColorStop(1, colors.fill);
            ctx.fillStyle = nodeGrad;
            ctx.fill();

            if (isSelected) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Label
            if (node.size >= 12 || isHovered || isConnected) {
                ctx.font = `${isHovered ? '600' : '500'} ${isHovered ? 12 : 10}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                // Text shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillText(node.label, nx + 1, ny + size + 7);

                ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(232, 232, 237, 0.8)';
                ctx.fillText(node.label, nx, ny + size + 6);
            }
        }
    }
}

// Helper: hex to RGB string
function hexToRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}
