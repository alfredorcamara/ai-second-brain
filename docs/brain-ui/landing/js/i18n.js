// Tradutor leve PT ⇄ EN: troca textos pelo dicionário (js/i18n.dict.js) sem recarregar a página.
// Idioma inicial: ?lang=en|pt  →  escolha salva  →  idioma do navegador.
(() => {
    'use strict';
    const D = window.I18N_EN || {}, KEY = 'asb-lang';
    const INLINE = new Set(['STRONG', 'EM', 'B', 'I', 'CODE', 'BR', 'A', 'SPAN', 'SMALL', 'MARK']), SKIP = new Set(['SCRIPT', 'STYLE', 'SVG', 'CANVAS', 'NOSCRIPT', 'IFRAME']);
    const norm = s => s.replace(/\s+/g, ' ').trim();
    const keyOf = el => { const c = el.cloneNode(true); c.querySelectorAll('br').forEach(b => b.replaceWith(' ')); return norm(c.textContent); };
    const hasText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
    // folha = só filhos "inline"; spans soltos (sem texto direto) são tratados um a um
    const inl = c => INLINE.has(c.tagName.toUpperCase()) && !(c.tagName === 'A' && c.classList.contains('btn'));
    const isLeaf = el => { const k = [...el.children]; return k.every(inl) && (!k.some(c => c.tagName === 'SPAN') || hasText(el)); };
    const orig = new WeakMap(), missing = new Set();
    let lang = 'pt';

    function txt(n, en) {
        if (en) { const k = norm(n.nodeValue); if (!k) return; if (D[k]) { if (!orig.has(n)) orig.set(n, n.nodeValue); n.nodeValue = D[k].replace(/<[^>]+>/g, ''); } else missing.add(k); }
        else if (orig.has(n)) { n.nodeValue = orig.get(n); orig.delete(n); }
    }
    function walk(el, en) {
        if (SKIP.has(el.tagName.toUpperCase()) || el.hasAttribute('data-no-i18n')) return;
        for (const a of ['title', 'aria-label', 'alt', 'placeholder']) if (el.hasAttribute(a)) {
            const attr = 'data-o-' + a;
            if (en) { const v = norm(el.getAttribute(a)); if (D[v]) { el.setAttribute(attr, el.getAttribute(a)); el.setAttribute(a, D[v].replace(/<[^>]+>/g, '')); } }
            else if (el.hasAttribute(attr)) { el.setAttribute(a, el.getAttribute(attr)); el.removeAttribute(attr); }
        }
        if (el.children.length && !isLeaf(el)) { for (const n of el.childNodes) n.nodeType === 3 ? txt(n, en) : n.nodeType === 1 && walk(n, en); return; }
        const k = keyOf(el); if (!k) return;
        if (en) { if (D[k]) { if (!orig.has(el)) orig.set(el, el.innerHTML); el.innerHTML = D[k]; } else missing.add(k); }
        else if (orig.has(el)) { el.innerHTML = orig.get(el); orig.delete(el); }
    }
    function set(l, silent) {
        const en = l === 'en'; if (l === lang && !silent) return; lang = en ? 'en' : 'pt';
        try { localStorage.setItem(KEY, lang); } catch (_) { }
        document.documentElement.lang = en ? 'en' : 'pt-BR';
        const t = document.querySelector('title');
        if (en) { t.dataset.o = t.dataset.o || t.textContent; t.textContent = D[norm(t.dataset.o)] || t.dataset.o; } else if (t.dataset.o) t.textContent = t.dataset.o;
        const m = document.querySelector('meta[name="description"]'); if (m) { m.dataset.o = m.dataset.o || m.content; m.content = en ? 'Persistent Markdown memory for AI agents, with an interactive 3D neural graph. Source-available, agnostic, no lock-in.' : m.dataset.o; }
        walk(document.body, en);
        const b = document.getElementById('lang-btn'); if (b) b.textContent = en ? 'PT' : 'EN';
        window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    }
    const q = new URLSearchParams(location.search).get('lang'); let saved = null; try { saved = localStorage.getItem(KEY); } catch (_) { }
    const initial = q === 'en' || q === 'pt' ? q : saved || ((navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en');
    window.I18N = { set, get lang() { return lang; }, missing: () => [...missing] };
    document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#lang-btn')) set(lang === 'en' ? 'pt' : 'en'); });
    if (initial === 'en') set('en', true);
})();
