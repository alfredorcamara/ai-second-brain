/**
 * AI SECOND BRAIN — LANDING PAGE ANALYTICS & CONVERSION ENGINE
 * 
 * Rastreamento de conversão, captura de UTMs e telemetria de intenção (Repo, Instalação, Demo, Mídia).
 * Suporte nativo a Cloudflare Zaraz, GA4, Plausible, Umami e Console Debugger.
 * Zero cookies invasivos, 100% resiliente e compatível com privacidade.
 */
(() => {
    'use strict';

    // ── 1. Captura & Persistência de Parâmetros UTM e Referrer ──
    const UTM_STORAGE_KEY = 'ai_brain_utm_session';
    const params = new URLSearchParams(window.location.search);
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    let currentUtms = {};
    try {
        const cached = sessionStorage.getItem(UTM_STORAGE_KEY);
        if (cached) currentUtms = JSON.parse(cached);
    } catch (_) {}

    let hasNewUtms = false;
    utmFields.forEach(f => {
        const val = params.get(f);
        if (val) {
            currentUtms[f] = val.trim().toLowerCase();
            hasNewUtms = true;
        }
    });

    if (document.referrer && !currentUtms.initial_referrer) {
        try {
            const refUrl = new URL(document.referrer);
            if (refUrl.hostname !== window.location.hostname) {
                currentUtms.initial_referrer = refUrl.hostname;
                hasNewUtms = true;
            }
        } catch (_) {}
    }

    if (hasNewUtms) {
        try {
            sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(currentUtms));
        } catch (_) {}
    }

    const isDebug = Boolean(
        params.get('debug_analytics') === '1' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        (() => { try { return localStorage.getItem('debug_analytics') === '1'; } catch (_) { return false; } })()
    );

    // ── 2. Disparador Universal de Eventos (Event Bus) ──
    window.trackBrainEvent = function (eventName, eventProps = {}) {
        const payload = {
            event: eventName,
            timestamp: new Date().toISOString(),
            path: window.location.pathname,
            lang: (window.I18N && window.I18N.lang) || 'pt',
            ...currentUtms,
            ...eventProps
        };

        // A. Cloudflare Zaraz (se ativo na Cloudflare)
        if (window.zaraz && typeof window.zaraz.track === 'function') {
            try { window.zaraz.track(eventName, payload); } catch (_) {}
        }

        // B. Google Analytics 4 (se injetado)
        if (typeof window.gtag === 'function') {
            try { window.gtag('event', eventName, payload); } catch (_) {}
        }

        // C. Plausible Analytics (se injetado)
        if (typeof window.plausible === 'function') {
            try { window.plausible(eventName, { props: payload }); } catch (_) {}
        }

        // D. Umami Analytics (se injetado)
        if (window.umami && typeof window.umami.track === 'function') {
            try { window.umami.track(eventName, payload); } catch (_) {}
        }

        // E. Evento customizado no DOM para desacoplamento
        try {
            document.dispatchEvent(new CustomEvent('brain-analytics-event', { detail: payload }));
        } catch (_) {}

        // F. Logger para desenvolvimento e depuração
        if (isDebug) {
            console.log(
                `%c[Brain Analytics]%c 🎯 ${eventName}`,
                'background:#0ea5e9; color:#fff; font-weight:bold; padding:2px 6px; border-radius:3px;',
                'color:#38bdf8; font-weight:bold;',
                payload
            );
        }
    };

    // ── 3. Propagação de Atribuição para Links Externos do GitHub ──
    function enrichGitHubLinks() {
        const links = document.querySelectorAll('a[href*="github.com/alfredorcamara/ai-second-brain"]');
        const refTag = currentUtms.utm_source ? `landing_${currentUtms.utm_source}` : 'landing';
        links.forEach(a => {
            try {
                const u = new URL(a.href);
                if (!u.searchParams.has('ref')) {
                    u.searchParams.set('ref', refTag);
                    a.href = u.toString();
                }
            } catch (_) {}
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enrichGitHubLinks);
    } else {
        enrichGitHubLinks();
    }

    // ── 4. Rastreamento Automatizado via Event Delegation ──
    document.addEventListener('click', e => {
        // A. Cliques nos CTAs do GitHub e Releases
        const ghLink = e.target.closest('a[href*="github.com/alfredorcamara"]');
        if (ghLink) {
            let location = 'other';
            if (ghLink.closest('.nav')) location = 'navbar';
            else if (ghLink.closest('.hero-content')) location = 'hero_cta';
            else if (ghLink.closest('.hero-version-pill')) location = 'hero_version_pill';
            else if (ghLink.closest('.sec.final')) location = 'footer_final_cta';
            else if (ghLink.closest('.creator-card') || ghLink.closest('.contact-private')) location = 'creator_profile';
            else if (ghLink.closest('footer')) location = 'footer_link';

            const isRelease = ghLink.href.includes('/releases');
            const isRepo = ghLink.href.includes('/ai-second-brain') && !isRelease;

            window.trackBrainEvent(isRelease ? 'click_github_release' : 'click_github_cta', {
                location,
                url: ghLink.href,
                cta_text: ghLink.innerText.trim().replace(/\s+/g, ' ').slice(0, 50)
            });
            return;
        }

        // B. Cópia do comando de instalação (git clone)
        const copyBtn = e.target.closest('#copy, .copy-btn');
        if (copyBtn) {
            window.trackBrainEvent('copy_install_command', {
                section: 'quickstart_install',
                has_node: true
            });
            return;
        }

        // C. Demo interativa (inline ou tela cheia)
        const loadDemoBtn = e.target.closest('#load-demo');
        if (loadDemoBtn) {
            window.trackBrainEvent('demo_interact', {
                type: 'load_inline_cockpit'
            });
            return;
        }

        const fullscreenDemoLink = e.target.closest('a[href*="demo/index.html"]');
        if (fullscreenDemoLink) {
            window.trackBrainEvent('demo_interact', {
                type: 'open_fullscreen'
            });
            return;
        }

        // D. Visualização de Mídia & Vídeos
        const heroVideoBtn = e.target.closest('#hero-video-btn');
        if (heroVideoBtn) {
            window.trackBrainEvent('video_play', {
                video_id: 'pitch_hero_16x9',
                format: 'modal_dialog'
            });
            return;
        }

        const video9x16Memoria = e.target.closest('#btn-memoria-persistente-video-9x16');
        if (video9x16Memoria) {
            window.trackBrainEvent('video_play', {
                video_id: 'reels_memoria_persistente',
                format: 'vertical_9x16'
            });
            return;
        }

        const video9x16Pergunte = e.target.closest('#btn-pergunte-cerebro-video-9x16');
        if (video9x16Pergunte) {
            window.trackBrainEvent('video_play', {
                video_id: 'reels_pergunte_ao_cerebro',
                format: 'vertical_9x16'
            });
            return;
        }

        const inlineVideoExpand = e.target.closest('#inline-video-expand');
        if (inlineVideoExpand) {
            window.trackBrainEvent('video_play', {
                video_id: 'inline_showcase_expand',
                format: 'expanded'
            });
            return;
        }

        // E. Comparador de Amnésia (Sem Segundo Cérebro vs Com Segundo Cérebro)
        const compareTab = e.target.closest('#tab-sem, #tab-com');
        if (compareTab) {
            window.trackBrainEvent('problem_tab_toggle', {
                mode: compareTab.dataset.mode || compareTab.id
            });
            return;
        }

        // F. Cards da Jornada Quickstart & Superpoderes
        const featureCard = e.target.closest('.qs-journey-card, [data-feature]');
        if (featureCard) {
            const featureId = featureCard.dataset.feature || featureCard.getAttribute('data-k') || 'card';
            window.trackBrainEvent('feature_card_click', {
                feature: featureId
            });
            return;
        }

        // G. Troca de Idioma
        const langBtn = e.target.closest('#lang-btn');
        if (langBtn) {
            window.trackBrainEvent('language_toggle', {
                target_lang: langBtn.textContent.trim().toLowerCase()
            });
            return;
        }

        // H. Modo Imersivo do Grafo 3D
        const exploreBtn = e.target.closest('#hero-explore-btn, #btn-explore');
        if (exploreBtn) {
            window.trackBrainEvent('graph_3d_explore', {
                source: exploreBtn.id
            });
            return;
        }
    });

    // ── 5. Rastreamento de Dúvidas no FAQ (Expand) ──
    document.querySelectorAll('.faq details').forEach(details => {
        details.addEventListener('toggle', () => {
            if (details.open) {
                const summaryText = details.querySelector('summary')?.innerText.trim() || 'faq';
                window.trackBrainEvent('faq_question_expand', {
                    question: summaryText.slice(0, 80)
                });
            }
        });
    });

    // ── 6. Disparo do Evento Inicial de Visita Qualificada ──
    // Registra a visita e sinaliza caso tenha vindo com parâmetros de campanha
    window.trackBrainEvent('page_view_landing', {
        has_campaign: Boolean(currentUtms.utm_campaign || currentUtms.utm_source),
        referrer: currentUtms.initial_referrer || 'direct'
    });

})();
