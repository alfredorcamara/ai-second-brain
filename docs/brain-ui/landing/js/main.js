(() => {
    'use strict';
    const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    let { nodes, colors, folders } = window.LANDING_DATA;

    // ── Grafo neural 3D (palco vivo) ──
    const cv = $('#graph'), g = new BrainGraph(cv, $('#tip'));
    cv.style.touchAction = 'pan-y';
    g.wheelZoom = false; // por padrão roda rola a página, mas em modo explorer ativa zoom
    g.loadData(nodes, [], colors);
    g.start();
    // Ponte para extra.js / i18n: recarrega o grafo em outro idioma sem recriar o motor
    window.__brain = { g, setData(d) { nodes = d.nodes; folders = d.folders; colors = d.colors; g.loadData(nodes, [], colors); } };

    // Eventos de clique em nós
    g.onNodeClick = n => {
        if (!n) return;
        n.isFolder ? (!n.isCentral && g.focusNode(n)) : openDoc(n);
    };
    g.onNodeDblClick = n => n && !n.isFolder && openDoc(n);

    // Números ao vivo calculados do grafo
    const live = {
        docs: g.leaves.length,
        dirs: g.N.length,
        refs: g.E.filter(e => e.kind === 'ref').length
    };
    const dockDocsEl = $('[data-dock-docs]');
    if (dockDocsEl) dockDocsEl.textContent = `${live.docs} docs · ${live.dirs} pastas`;

    // ── Leitor de Markdown Futurista ──
    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const inl = s => esc(s)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
        .replace(/\[\[([^\]]+)\]\]/g, '<a href="#" data-o="$1">🔗 $1</a>');
    
    const md = src => {
        let o = '', ul = 0;
        for (const l of src.split('\n')) {
            let m;
            if (m = l.match(/^(#{1,3}) (.*)/)) {
                ul && (o += '</ul>', ul = 0);
                o += `<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`;
            } else if (m = l.match(/^\s*- (.*)/)) {
                ul || (o += '<ul>', ul = 1);
                o += `<li>${inl(m[1])}</li>`;
            } else if (l[0] === '>') {
                o += `<blockquote>${inl(l.slice(1))}</blockquote>`;
            } else if (l.trim()) {
                ul && (o += '</ul>', ul = 0);
                o += `<p>${inl(l)}</p>`;
            }
        }
        return o + (ul ? '</ul>' : '');
    };

    const reader = $('#reader');
    let lastReaderTrigger = null;

    function openDoc(n) {
        if (!n) return;
        lastReaderTrigger = document.activeElement;
        $('#rpath').textContent = n.path || n.label;
        $('#rbody').innerHTML = md(n.content || '# ' + n.label);
        reader.removeAttribute('inert');
        reader.classList.add('on');
        reader.setAttribute('aria-hidden', 'false');
        if ($('#rclose')) $('#rclose').focus();
        g.focusNode(n);
        g.pulseSurge();
    }

    const closeDoc = () => {
        // Move/restaura foco para fora antes de setar aria-hidden="true" (WAI-ARIA)
        if (lastReaderTrigger && typeof lastReaderTrigger.focus === 'function' && !reader.contains(lastReaderTrigger)) {
            lastReaderTrigger.focus();
        } else if (document.activeElement && reader.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        reader.classList.remove('on');
        reader.setAttribute('aria-hidden', 'true');
        reader.setAttribute('inert', '');
        g.selectedNode = null;
        g.resetView();
    };

    $('#rclose').onclick = closeDoc;
    addEventListener('keydown', e => e.key === 'Escape' && closeDoc());

    // Links wiki dentro do markdown clicáveis
    $('#rbody').addEventListener('click', e => {
        const a = e.target.closest('[data-o]');
        if (!a) return;
        e.preventDefault();
        const targetSlug = a.dataset.o.toLowerCase();
        const found = nodes.find(x => !x.isFolder && (
            (x.path && x.path.split('/').pop().replace('.md', '').toLowerCase() === targetSlug) ||
            x.id.toLowerCase().includes(targetSlug) ||
            x.label.toLowerCase().includes(targetSlug)
        ));
        if (found) {
            openDoc(found);
        }
    });

    // ── Chips de arquivos dentro das camadas ──
    $$('.file-chip').forEach(chip => {
        chip.addEventListener('click', e => {
            e.stopPropagation();
            const docId = chip.dataset.doc;
            const target = nodes.find(n => !n.isFolder && (n.id === docId || n.id.endsWith(docId) || n.path.includes(docId)));
            if (target) openDoc(target);
        });
    });

    // ── Botões de Focar Camada no Grafo ──
    $$('.step-focus-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const k = btn.dataset.k;
            if (folders[k]) {
                g.highlightCategory('g-' + k);
                g.focusNode(folders[k]);
                g.pulseSurge();
            }
        });
    });

    // ── Contadores e Revelação ao rolar ──
    const count = el => {
        const to = live[el.dataset.n] || 0, t0 = performance.now();
        (function f(t) {
            const k = Math.min(1, (t - t0) / 1400);
            el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
            k < 1 && requestAnimationFrame(f);
        })(t0);
    };

    const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            e.target.querySelectorAll('[data-n]').forEach(count);
            io.unobserve(e.target);
        }
    }), { threshold: 0.15 });
    $$('.rv').forEach(el => io.observe(el));

    // ── Narrativa: cada camada acende sua pasta no grafo ──
    const stepIO = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        const k = e.target.dataset.k;
        $$('.step').forEach(s => s.classList.toggle('act', s === e.target));
        $$('.step-nav-btn').forEach(b => b.classList.toggle('act', b.dataset.step === k));
        g.highlightCategory('g-' + k);
        g.focusNode(folders[k]);
    }), { rootMargin: '-35% 0px -35% 0px' });
    $$('.step').forEach(s => stepIO.observe(s));

    // Reset ao sair da seção de camadas
    new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) {
            g.clearCategoryHighlight();
            g.selectedNode = null;
            g.resetView();
            $$('.step').forEach(s => s.classList.remove('act'));
        }
    }), { threshold: 0 }).observe($('#como'));

    // Navegação manual por botões de passo
    $$('.step-nav-btn').forEach(btn => {
        btn.onclick = () => {
            const k = btn.dataset.step;
            const targetEl = $(`#step-${k}`);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (folders[k]) {
                g.highlightCategory('g-' + k);
                g.focusNode(folders[k]);
                g.pulseSurge();
            }
        };
    });

    // ── Alternância "Sem / Com segundo cérebro" (Efeito UAU) ──
    const modePill = $('#terminal-mode-pill');
    $$('.toggle button').forEach(b => {
        b.onclick = () => {
            const mode = b.dataset.mode;
            $$('.toggle button').forEach(x => x.classList.toggle('on', x === b));
            $$('.chat').forEach(c => c.hidden = (c.dataset.mode !== mode));

            if (mode === 'sem') {
                if (modePill) modePill.textContent = 'Status: Amnésia Ativa';
                g.setBrainMode('sem');
            } else {
                if (modePill) modePill.textContent = 'Status: Memória Conectada (12ms)';
                g.setBrainMode('com');
            }
        };
    });

    // ── Floating Brain Dock (Controles do Grafo) ──
    const btnRecenter = $('#btn-recenter');
    if (btnRecenter) btnRecenter.onclick = () => { g.resetView(); g.clearCategoryHighlight(); };

    const btnSurge = $('#btn-surge');
    if (btnSurge) btnSurge.onclick = () => g.pulseSurge();

    const btnOrbit = $('#btn-orbit');
    if (btnOrbit) {
        btnOrbit.onclick = () => {
            const active = g.toggleAutoOrbit();
            btnOrbit.classList.toggle('active', active);
        };
    }

    const finalRecenterBtn = $('#final-recenter-btn');
    if (finalRecenterBtn) finalRecenterBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        g.resetView();
    };

    // ── Modo Explorador 3D (Controlado pelo Dock Inferior) ──
    const heroExploreBtn = $('#hero-explore-btn');
    const dockExploreBtn = $('#btn-explore');
    const dockExploreText = $('#btn-explore-text');
    const dockEl = $('#dock');
    const mainEl = $('main');

    let isExploring = false;

    function toggleExplorerMode() {
        if (isExploring) {
            exitExplorerMode();
        } else {
            enterExplorerMode();
        }
    }

    function enterExplorerMode() {
        isExploring = true;
        g.wheelZoom = true;
        mainEl.style.transition = 'opacity 0.4s';
        mainEl.style.opacity = '0.06';
        mainEl.style.pointerEvents = 'none';
        cv.style.cursor = 'grab';
        dockEl.classList.add('exploring');
        if (dockExploreBtn) dockExploreBtn.classList.add('active');
        if (dockExploreText) dockExploreText.textContent = '✕ Sair 3D';
        g.pulseSurge();
    }

    function exitExplorerMode() {
        isExploring = false;
        g.wheelZoom = false;
        mainEl.style.opacity = '1';
        mainEl.style.pointerEvents = 'none';
        dockEl.classList.remove('exploring');
        if (dockExploreBtn) dockExploreBtn.classList.remove('active');
        if (dockExploreText) dockExploreText.textContent = 'Modo 3D';
        g.clearCategoryHighlight();
        g.resetView();
    }

    if (heroExploreBtn) heroExploreBtn.onclick = enterExplorerMode;
    if (dockExploreBtn) dockExploreBtn.onclick = toggleExplorerMode;

    const btnStyle = $('#btn-style');
    const btnStyleText = $('#btn-style-text');
    if (btnStyle) {
        if (btnStyleText && g) btnStyleText.textContent = g.nodeStyle === 'sphere' ? 'Esferas' : 'Neurônios';
        btnStyle.onclick = () => {
            const style = g.toggleNodeStyle();
            if (btnStyleText) btnStyleText.textContent = style === 'sphere' ? 'Esferas' : 'Neurônios';
            g.pulseSurge();
        };
    }
    const btnZoomIn = $('#btn-zoom-in');
    if (btnZoomIn) btnZoomIn.onclick = () => g.zoomIn();
    const btnZoomOut = $('#btn-zoom-out');
    if (btnZoomOut) btnZoomOut.onclick = () => g.zoomOut();

    // ── Brilho do cursor + inclinação 3D dos cartões ──
    addEventListener('pointermove', e => {
        document.documentElement.style.setProperty('--mx', e.clientX + 'px');
        document.documentElement.style.setProperty('--my', e.clientY + 'px');
    });

    $$('.card').forEach(c => {
        c.addEventListener('pointermove', e => {
            const r = c.getBoundingClientRect();
            c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 12 + 'deg');
            c.style.setProperty('--rx', (0.5 - (e.clientY - r.top) / r.height) * 12 + 'deg');
        });
        c.addEventListener('pointerleave', () => {
            c.style.setProperty('--rx', '0deg');
            c.style.setProperty('--ry', '0deg');
        });
    });

    // ── Copiar comando do Git / Início ──
    const copyBtn = $('#copy');
    if (copyBtn) {
        copyBtn.onclick = async e => {
            try {
                const codeEls = Array.from(document.querySelectorAll('.code-body code'));
                const codeText = codeEls.length
                    ? codeEls.map(c => c.textContent.trim()).filter(Boolean).join('\n')
                    : 'git clone https://github.com/alfredorcamara/ai-second-brain';
                await navigator.clipboard.writeText(codeText);
                const prev = copyBtn.innerHTML;
                copyBtn.innerHTML = '<span>Copiado ✓</span>';
                setTimeout(() => copyBtn.innerHTML = prev, 1800);
            } catch (_) { }
        };
    }

    // ── Navegação interna segura para links com hash (#) ──
    // Evita que navegadores/iframes bloqueiem a navegação por segurança no protocolo file://
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = $(hash);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
})();
