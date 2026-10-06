(() => {
    const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    const { nodes, colors, folders } = window.LANDING_DATA;

    // ── Grafo neural (fundo fixo e interativo) ──
    const cv = $('#graph'), g = new BrainGraph(cv, $('#tip'));
    cv.style.touchAction = 'pan-y'; g.wheelZoom = false;      // a roda e o toque rolam a página
    g.loadData(nodes, [], colors); g.start();
    g.onNodeClick = n => { if (!n) return; n.isFolder ? (!n.isCentral && g.focusNode(n)) : openDoc(n); };
    g.onNodeDblClick = n => n && !n.isFolder && openDoc(n);

    // números ao vivo, calculados do próprio grafo
    const live = { docs: g.leaves.length, dirs: g.N.length, refs: g.E.filter(e => e.kind === 'ref').length };

    // ── Leitor de Markdown ──
    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const inl = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\[\[([^\]]+)\]\]/g, '<a href="#" data-o="$1">$1</a>');
    const md = src => { let o = '', ul = 0; for (const l of src.split('\n')) { let m; if (m = l.match(/^(#{1,3}) (.*)/)) { ul && (o += '</ul>', ul = 0); o += `<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`; } else if (m = l.match(/^\s*- (.*)/)) { ul || (o += '<ul>', ul = 1); o += `<li>${inl(m[1])}</li>`; } else if (l[0] === '>') { o += `<blockquote>${inl(l.slice(1))}</blockquote>`; } else if (l.trim()) { ul && (o += '</ul>', ul = 0); o += `<p>${inl(l)}</p>`; } } return o + (ul ? '</ul>' : ''); };
    const reader = $('#reader');
    function openDoc(n) { $('#rpath').textContent = n.path; $('#rbody').innerHTML = md(n.content || '# ' + n.label); reader.classList.add('on'); reader.setAttribute('aria-hidden', 'false'); g.focusNode(n); }
    const closeDoc = () => { reader.classList.remove('on'); reader.setAttribute('aria-hidden', 'true'); g.selectedNode = null; g.resetView(); };
    $('#rclose').onclick = closeDoc; addEventListener('keydown', e => e.key === 'Escape' && closeDoc());
    $('#rbody').addEventListener('click', e => { const a = e.target.closest('[data-o]'); if (!a) return; e.preventDefault(); const n = nodes.find(x => !x.isFolder && x.path.split('/').pop().replace('.md', '') === a.dataset.o); n && openDoc(n); });

    // ── Revelar ao rolar + contadores ──
    const count = el => { const to = live[el.dataset.n] || 0, t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); k < 1 && requestAnimationFrame(f); })(t0); };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); e.target.querySelectorAll('[data-n]').forEach(count); io.unobserve(e.target); } }), { threshold: .2 });
    $$('.rv').forEach(el => io.observe(el));

    // ── Narrativa: cada camada acende a sua pasta no grafo ──
    const stepIO = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return; const k = e.target.dataset.k;
        $$('.step').forEach(s => s.classList.toggle('act', s === e.target));
        g.highlightCategory('g-' + k); g.focusNode(folders[k]);
    }), { rootMargin: '-40% 0px -40% 0px' });
    $$('.step').forEach(s => stepIO.observe(s));
    new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) { g.clearCategoryHighlight(); g.selectedNode = null; g.resetView(); $$('.step').forEach(s => s.classList.remove('act')); } }), { threshold: 0 }).observe($('#como'));

    // ── Alternância "sem / com" ──
    $$('.toggle button').forEach(b => b.onclick = () => { $$('.toggle button').forEach(x => x.classList.toggle('on', x === b)); $$('.chat').forEach(c => c.hidden = c.dataset.mode !== b.dataset.mode); });

    // ── Brilho do cursor + inclinação 3D dos cartões ──
    addEventListener('pointermove', e => { document.documentElement.style.setProperty('--mx', e.clientX + 'px'); document.documentElement.style.setProperty('--my', e.clientY + 'px'); });
    $$('.card').forEach(c => { c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 12 + 'deg'); c.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 12 + 'deg'); }); c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }); });

    // ── Copiar comando ──
    $('#copy').onclick = async e => { try { await navigator.clipboard.writeText($('.code code').textContent); e.target.textContent = 'Copiado ✓'; setTimeout(() => e.target.textContent = 'Copiar', 1600); } catch (_) { } };
})();
