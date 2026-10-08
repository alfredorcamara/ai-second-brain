// Comportamentos adicionais: abas de diagramas, demo ao vivo, idioma do grafo, acessibilidade.
(() => {
    'use strict';
    const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    const DEMO_URL = '../demo/index.html';                         // ajuste se publicar em outro caminho
    const brain = window.__brain, g = brain && brain.g;

    // ── Abas dos diagramas ──
    $$('.diag-tab').forEach(b => b.addEventListener('click', () => {
        const d = b.dataset.d;
        $$('.diag-tab').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
        $$('.diag, .diag-cap').forEach(x => x.classList.toggle('on', x.dataset.d === d));
    }));

    // ── Demo ao vivo: o iframe só carrega no clique (poupa WebGL e rede) ──
    const body = $('#demo-body'), loadBtn = $('#load-demo');
    if (loadBtn) loadBtn.addEventListener('click', () => {
        const f = document.createElement('iframe'), u = document.createElement('button');
        f.src = DEMO_URL; f.title = 'AI Second Brain — demo ao vivo'; f.loading = 'lazy'; f.allow = 'fullscreen';
        u.className = 'unload'; u.type = 'button'; u.textContent = (window.I18N && I18N.lang === 'en') ? 'Unload ✕' : 'Descarregar ✕';
        u.onclick = () => { f.remove(); u.remove(); loadBtn.hidden = false; g && g.start(); };
        loadBtn.hidden = true; body.append(f, u);
        // Mantém o grafo do fundo ativo e animado continuamente
        g && g.start();
    });

    // ── Idioma também no grafo (títulos e documentos de exemplo) ──
    const rebuild = lang => { if (!brain) return; brain.setData(window.LANDING_DATA.build(lang)); const r = $('#reader'); r && r.classList.remove('on'); };
    window.addEventListener('langchange', e => rebuild(e.detail));
    if (window.I18N && I18N.lang === 'en') rebuild('en');

    // ── Acessibilidade ──
    $$('.toggle button').forEach(b => { b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', b.classList.contains('on')); b.addEventListener('click', () => $$('.toggle button').forEach(x => x.setAttribute('aria-selected', x === b))); });
    if (g && matchMedia('(prefers-reduced-motion: reduce)').matches) g.autoRotate = false;
    document.addEventListener('visibilitychange', () => { if (!g) return; document.hidden ? g.stop() : g.start(); });
})();
