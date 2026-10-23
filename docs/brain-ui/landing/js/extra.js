// Comportamentos adicionais: abas de diagramas, demo ao vivo, idioma do grafo, acessibilidade.
(() => {
    'use strict';
    const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    const DEMO_URL = '../demo/index.html';                         // ajuste se publicar em outro caminho
    const brain = window.__brain, g = brain && brain.g;
    const getBrainGraph = () => (window.__brain && window.__brain.g) || g;

    // ── Otimização de Performance Core Web Vitals (INP e CPU/GPU) ──
    const pauseAllCardVideos = () => {
        $$('.card-video-media').forEach(v => {
            if (!v.paused) v.pause();
        });
    };

    const resumeVisibleCardVideos = () => {
        const modalOpen = document.body.style.overflow === 'hidden';
        if (modalOpen) return;
        $$('.card-video-media').forEach(v => {
            const rect = v.getBoundingClientRect();
            const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
            if (inViewport && v.paused) {
                v.play().catch(() => { });
            }
        });
    };

    window.__pauseCardVideos = pauseAllCardVideos;
    window.__resumeCardVideos = resumeVisibleCardVideos;

    // IntersectionObserver inteligente: reproduz apenas vídeos visíveis na viewport
    if ('IntersectionObserver' in window) {
        const cardVideoObserver = new IntersectionObserver((entries) => {
            const modalOpen = document.body.style.overflow === 'hidden';
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    if (!modalOpen && video.paused) {
                        video.play().catch(() => { });
                    }
                } else {
                    if (!video.paused) {
                        video.pause();
                    }
                }
            });
        }, { threshold: 0.15 });

        $$('.card-video-media').forEach(v => cardVideoObserver.observe(v));
    }

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

    let videoModalTrigger = null;

    const openModal = (syncTime = false, triggerEl = null) => {
        if (!modal) return;
        videoModalTrigger = triggerEl || document.activeElement;
        const isMobile = window.innerWidth <= 768;
        if (modalFrame) modalFrame.classList.toggle('is-mobile-reels', isMobile);
        syncVideoSource(modalVideo);

        // Pausa Three.js e vídeos em loop para liberar 100% da CPU/GPU
        const bg = getBrainGraph();
        if (bg && bg.stop) bg.stop();
        pauseAllCardVideos();

        if (syncTime && inlineVideo && !inlineVideo.paused) {
            modalVideo.currentTime = inlineVideo.currentTime;
            inlineVideo.pause();
        }

        modal.removeAttribute('inert');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (modalClose) {
            modalClose.focus();
        }

        if (modalVideo) {
            modalVideo.play().catch(() => { });
        }
    };

    const closeModal = () => {
        if (!modal) return;

        // Move foco para fora antes de setar aria-hidden="true" (WAI-ARIA)
        if (videoModalTrigger && typeof videoModalTrigger.focus === 'function' && !modal.contains(videoModalTrigger)) {
            videoModalTrigger.focus();
        } else if (document.activeElement && modal.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('inert', '');
        document.body.style.overflow = '';
        if (modalVideo) {
            modalVideo.pause();
        }
        // Restaura Three.js e vídeos visíveis no viewport
        const bg = getBrainGraph();
        if (bg && bg.start) bg.start();
        resumeVisibleCardVideos();
    };

    if (heroBtn) heroBtn.addEventListener('click', () => openModal(false, heroBtn));
    if (inlineExpand) inlineExpand.addEventListener('click', () => openModal(true, inlineExpand));
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

    // ── Modal de Vídeo Vertical 9:16 (Reels / Shorts) ──
    const promo9x16Modal = $('#promo-video-modal-9x16'),
        promo9x16Close = $('#promo-modal-9x16-close'),
        promo9x16Backdrop = $('#promo-modal-9x16-backdrop'),
        promo9x16Video = $('#promo-video-9x16-player');
    let promo9x16TriggerBtn = null;

    const openPromo9x16 = (videoSrc, posterSrc, e) => {
        if (e && e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (!promo9x16Modal) return;

        promo9x16TriggerBtn = (e && (e.currentTarget || e.target)) || document.activeElement;

        // Título dinâmico baseado no card clicado
        const titleEl = $('#promo-modal-9x16-title-text');
        if (titleEl && promo9x16TriggerBtn && promo9x16TriggerBtn.dataset && promo9x16TriggerBtn.dataset.videoTitle) {
            titleEl.textContent = promo9x16TriggerBtn.dataset.videoTitle;
        }

        // 1. Pausa o grafo 3D Three.js e vídeos dos cards para liberar 100% da GPU para o player
        const bg = getBrainGraph();
        if (bg && bg.stop) bg.stop();
        pauseAllCardVideos();
        if (modalVideo && !modalVideo.paused) modalVideo.pause();
        if (inlineVideo && !inlineVideo.paused) inlineVideo.pause();

        // 2. Garante source e poster corretos sem forçar reload desnecessário
        if (promo9x16Video && videoSrc) {
            const cur = promo9x16Video.currentSrc || promo9x16Video.src || '';
            if (!cur.endsWith(videoSrc)) {
                promo9x16Video.src = videoSrc;
                if (posterSrc) promo9x16Video.poster = posterSrc;
            }
        }

        promo9x16Modal.removeAttribute('inert');
        promo9x16Modal.classList.add('active');
        promo9x16Modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('promo-modal-open');

        if (promo9x16Close) {
            promo9x16Close.focus();
        }

        if (promo9x16Video) {
            if (promo9x16Video.currentTime > 0) {
                promo9x16Video.currentTime = 0;
            }
            // Aguarda o fade-in do modal (0.25s) terminar para o decodificador não competir com a animação
            setTimeout(() => {
                if (!promo9x16Modal.classList.contains('active')) return;
                const playPromise = promo9x16Video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Se o navegador bloquear áudio no autoplay, muta e retenta
                        promo9x16Video.muted = true;
                        promo9x16Video.play().catch(() => { });
                    });
                }
            }, 270);
        }
    };

    const closePromo9x16 = () => {
        if (!promo9x16Modal) return;

        // Move/restaura foco para fora antes de setar aria-hidden="true" (WAI-ARIA)
        if (promo9x16TriggerBtn && typeof promo9x16TriggerBtn.focus === 'function' && !promo9x16Modal.contains(promo9x16TriggerBtn)) {
            promo9x16TriggerBtn.focus();
        } else if (document.activeElement && promo9x16Modal.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        promo9x16Modal.classList.remove('active');
        promo9x16Modal.setAttribute('aria-hidden', 'true');
        promo9x16Modal.setAttribute('inert', '');
        document.body.style.overflow = '';
        document.body.classList.remove('promo-modal-open');

        if (promo9x16Video) {
            promo9x16Video.pause();
            promo9x16Video.removeAttribute('src');
            promo9x16Video.load(); // Libera 100% da memória de decodificação da GPU
        }

        // Restaura animação do grafo 3D e loops dos cards visíveis
        const bg = getBrainGraph();
        if (bg && bg.start) bg.start();
        resumeVisibleCardVideos();
    };

    $$('.card-video-9x16-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const src = btn.dataset.videoSrc || 'assets/video/pergunte-cerebro-card-promo-9x16.mp4';
            const poster = btn.dataset.videoPoster || 'assets/video/pergunte-cerebro-promo-poster.jpg';
            openPromo9x16(src, poster, e);
        });
    });

    if (promo9x16Close) promo9x16Close.addEventListener('click', closePromo9x16);
    if (promo9x16Backdrop) promo9x16Backdrop.addEventListener('click', closePromo9x16);

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && promo9x16Modal && promo9x16Modal.classList.contains('active')) {
            e.preventDefault();
            closePromo9x16();
        }
    });

    window.openPromoVideo9x16 = openPromo9x16;
    window.closePromoVideo9x16 = closePromo9x16;

    // Sincronização dinâmica universal de versão (Localhost e GitHub Pages)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const versionUrl = isLocal
        ? '/api/system/version'
        : 'https://raw.githubusercontent.com/alfredorcamara/ai-second-brain/main/package.json';

    fetch(versionUrl)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data && data.version) {
                const pillText = $('.hero-version-pill strong');
                if (pillText) pillText.textContent = `v${data.version} Oficial`;
                const pillLink = $('.hero-version-pill');
                if (pillLink) {
                    pillLink.href = `https://github.com/alfredorcamara/ai-second-brain/releases/tag/v${data.version}`;
                    pillLink.title = `Ver Release Oficial v${data.version} no GitHub`;
                }
            }
        })
        .catch(() => {});
})();
