// Modo demonstração: dashboard 100% estático (GitHub Pages), somente leitura.
(() => {
    const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { 'Content-Type': 'application/json' } });
    const real = window.fetch.bind(window);
    const toast = msg => {
        let t = document.getElementById('demo-toast');
        if (!t) { t = document.createElement('div'); t.id = 'demo-toast'; document.body.appendChild(t); }
        t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 3200);
    };
    window.fetch = (url, opts) => {
        const u = String(url);
        if (!u.startsWith('/api/')) return real(url, opts);
        if (u.startsWith('/api/file?path=')) {                                   // leitura vem do snapshot
            const p = decodeURIComponent(u.split('path=')[1]), f = (window.VAULT_SNAPSHOT.files || []).find(x => x.path === p);
            return Promise.resolve(f ? new Response(f.content, { status: 200 }) : new Response('', { status: 404 }));
        }
        if (u.startsWith('/api/vault') || u.startsWith('/api/events')) return Promise.resolve(new Response('', { status: 404 }));   // cai no snapshot
        if (u.startsWith('/api/engine/current')) return Promise.resolve(json({ activeEngine: 'demo' }));
        if (u.startsWith('/api/ai/status')) return Promise.resolve(json({ available: false }));
        toast('🔒 Demo somente leitura — instale localmente para criar, editar e rodar o Research Lab.');
        return Promise.resolve(json({ ok: false, error: 'Modo demonstração (somente leitura)' }, 403));
    };
    window.EventSource = function () { return { addEventListener() { }, close() { } }; };
    document.addEventListener('DOMContentLoaded', () => {
        const b = document.createElement('div'); b.id = 'demo-bar';
        b.innerHTML = '<span><i></i>Demo ao vivo · vault de exemplo · somente leitura</span><a href="../landing/index.html">← Landing</a><a href="https://github.com/alfredorcamara/ai-second-brain" target="_blank" rel="noopener">Baixar no GitHub ↗</a>';
        document.body.appendChild(b);
        const s = document.createElement('style');
        s.textContent = '#demo-bar{position:fixed;z-index:99999;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:16px;align-items:center;padding:9px 18px;border-radius:999px;background:#0a1122ee;border:1px solid #ffc76b55;color:#e8ecf5;font:600 12.5px system-ui,sans-serif;backdrop-filter:blur(10px);box-shadow:0 10px 40px #000a}#demo-bar i{display:inline-block;width:8px;height:8px;margin-right:8px;border-radius:50%;background:#2cff9a;box-shadow:0 0 10px #2cff9a}#demo-bar a{color:#ffc76b;text-decoration:none}#demo-bar a:hover{color:#fff}#demo-toast{position:fixed;z-index:99999;left:50%;top:18px;transform:translate(-50%,-20px);opacity:0;padding:12px 20px;border-radius:12px;background:#0a1122f2;border:1px solid #ffc76b66;color:#fff;font:600 13px system-ui,sans-serif;transition:.35s;pointer-events:none}#demo-toast.on{opacity:1;transform:translate(-50%,0)}@media(max-width:640px){#demo-bar{flex-wrap:wrap;justify-content:center;width:92vw;border-radius:18px}}';
        document.head.appendChild(s);
    });
})();
