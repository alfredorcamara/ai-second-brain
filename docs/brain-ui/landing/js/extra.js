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
    const body = $('#demo-body'), loadBtn = $('#load-demo'), bar = $('.browser-bar');
    if (loadBtn) loadBtn.addEventListener('click', () => {
        const f = document.createElement('iframe'), u = document.createElement('button');
        f.src = DEMO_URL; f.title = 'AI Second Brain — demo ao vivo'; f.loading = 'lazy'; f.allow = 'fullscreen';
        u.className = 'unload'; u.type = 'button'; u.textContent = (window.I18N && I18N.lang === 'en') ? 'Unload ✕' : 'Descarregar ✕';
        u.onclick = () => { f.remove(); u.remove(); loadBtn.hidden = false; g && g.start(); };
        loadBtn.hidden = true; 
        body.append(f);
        const fullLink = bar ? bar.querySelector('a') : null;
        if (fullLink) {
            fullLink.parentNode.insertBefore(u, fullLink);
        } else if (bar) {
            bar.append(u);
        } else {
            body.append(u);
        }
        // Mantém o grafo do fundo ativo e animado continuamente
        g && g.start();
    });

    // ── Idioma também no grafo (títulos e documentos de exemplo) ──
    const rebuild = lang => { if (!brain) return; brain.setData(window.LANDING_DATA.build(lang)); const r = $('#reader'); r && r.classList.remove('on'); };
    window.addEventListener('langchange', e => {
        rebuild(e.detail);
        const u = $('.unload');
        if (u) u.textContent = (e.detail === 'en') ? 'Unload ✕' : 'Descarregar ✕';
    });
    if (window.I18N && I18N.lang === 'en') rebuild('en');

    // ── Acessibilidade ──
    $$('.toggle button').forEach(b => { b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', b.classList.contains('on')); b.addEventListener('click', () => $$('.toggle button').forEach(x => x.setAttribute('aria-selected', x === b))); });
    if (g && matchMedia('(prefers-reduced-motion: reduce)').matches) g.autoRotate = false;
    document.addEventListener('visibilitychange', () => { if (!g) return; document.hidden ? g.stop() : g.start(); });

    // ── Integração de Vídeo (Modal, Showcase e Adaptação Responsiva) ──
    const heroBtn = $('#hero-video-btn'),
          modal = $('#video-modal'),
          modalClose = $('#video-modal-close'),
          modalBackdrop = $('#video-modal-backdrop'),
          modalVideo = $('#modal-video-player'),
          modalFrame = $('#video-modal-frame'),
          inlineVideo = $('#inline-video-player'),
          inlineExpand = $('#inline-video-expand');

    const getAdaptiveSrc = () => window.innerWidth <= 768 ? 'assets/video/Reels-9x16.mp4' : 'assets/video/Promo-16x9.mp4';

    const syncVideoSource = (videoEl) => {
        if (!videoEl) return;
        const target = getAdaptiveSrc();
        const cur = videoEl.currentSrc || videoEl.src || '';
        if (!cur.endsWith(target)) {
            const time = videoEl.currentTime || 0;
            videoEl.src = target;
            videoEl.load();
            if (time > 0) videoEl.currentTime = time;
        }
    };

    const openModal = (syncTime = false) => {
        if (!modal) return;
        const isMobile = window.innerWidth <= 768;
        if (modalFrame) modalFrame.classList.toggle('is-mobile-reels', isMobile);
        syncVideoSource(modalVideo);

        if (syncTime && inlineVideo && !inlineVideo.paused) {
            modalVideo.currentTime = inlineVideo.currentTime;
            inlineVideo.pause();
        }

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (modalVideo) {
            modalVideo.play().catch(() => {});
        }
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (modalVideo) {
            modalVideo.pause();
        }
    };

    if (heroBtn) heroBtn.addEventListener('click', () => openModal(false));
    if (inlineExpand) inlineExpand.addEventListener('click', () => openModal(true));
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    if (inlineVideo) {
        inlineVideo.addEventListener('play', () => {
            syncVideoSource(inlineVideo);
            if (modalVideo && !modalVideo.paused) modalVideo.pause();
        });
    }

    window.addEventListener('resize', () => {
        if (modal && modal.classList.contains('active')) {
            const isMobile = window.innerWidth <= 768;
            if (modalFrame) modalFrame.classList.toggle('is-mobile-reels', isMobile);
            syncVideoSource(modalVideo);
        }
    });
})();
