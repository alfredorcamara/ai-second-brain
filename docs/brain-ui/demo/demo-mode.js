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
        if (u.startsWith('/api/ai/status') || u.startsWith('/api/ai/config')) return Promise.resolve(json({
            success: true,
            provider: 'groq',
            providerName: 'Groq Cloud',
            configured: true,
            hasKey: true,
            apiKeyMasked: 'gsk_••••••••Zvrf',
            model: 'openai/gpt-oss-120b',
            models: [
                { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', contextWindow: 131072 },
                { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', contextWindow: 131072 },
                { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', contextWindow: 131072 },
                { id: 'allam-2-7b', name: 'ALLaM-2-7b', contextWindow: 4096 }
            ],
            modelCount: 4,
            latencyMs: 380,
            baseUrl: 'https://api.groq.com/openai/v1',
            cacheHours: 24,
            maxRetries: 2
        }));
        if (u.startsWith('/api/ai/test')) {
            let reqBody = {};
            try { reqBody = JSON.parse(opts?.body || '{}'); } catch(e) {}
            const prov = reqBody.provider || 'groq';
            const requiresKey = !['ollama', 'custom'].includes(prov);
            const isSavedDemoKey = (prov === 'groq' && (!reqBody.apiKey || reqBody.apiKey.includes('••••')));
            if (requiresKey && !reqBody.apiKey?.trim() && !isSavedDemoKey) {
                const provNames = { openai: 'OpenAI', groq: 'Groq', anthropic: 'Anthropic', openrouter: 'OpenRouter' };
                const provName = provNames[prov] || prov.toUpperCase();
                return Promise.resolve(json({
                    success: false,
                    error: `Informe uma API Key para o provedor ${provName}`
                }, 400));
            }
            const mockModelsByProv = {
                groq: [
                    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', contextWindow: 131072 },
                    { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', contextWindow: 131072 },
                    { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', contextWindow: 131072 },
                    { id: 'allam-2-7b', name: 'ALLaM-2-7b', contextWindow: 4096 }
                ],
                openai: [
                    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000 },
                    { id: 'gpt-4o', name: 'GPT-4o Flagship', contextWindow: 128000 },
                    { id: 'o1-mini', name: 'o1-mini Raciocínio', contextWindow: 128000 }
                ],
                anthropic: [
                    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextWindow: 200000 },
                    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextWindow: 200000 }
                ],
                openrouter: [
                    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', contextWindow: 64000 },
                    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', contextWindow: 64000 }
                ],
                ollama: [
                    { id: 'llama3.2', name: 'Llama 3.2', contextWindow: 128000 },
                    { id: 'deepseek-r1', name: 'DeepSeek R1', contextWindow: 64000 },
                    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder', contextWindow: 32000 }
                ],
                custom: [
                    { id: 'default', name: 'Default Model', contextWindow: 32000 }
                ]
            };
            return Promise.resolve(json({
                success: true,
                provider: prov,
                latencyMs: 142,
                models: mockModelsByProv[prov] || mockModelsByProv.groq
            }));
        }
        if (u.startsWith('/api/ai/save')) {
            let reqBody = {};
            try { reqBody = JSON.parse(opts?.body || '{}'); } catch(e) {}
            return Promise.resolve(json({
                success: true,
                message: 'Configuração simulada com sucesso no modo demo.',
                config: {
                    provider: reqBody.provider || 'groq',
                    model: reqBody.model || 'openai/gpt-oss-120b',
                    configured: true,
                    apiKeyMasked: 'gsk_••••••••demo'
                }
            }));
        }
        const sessionRoute = u.match(/^\/api\/projects\/[^/]+\/session\/(draft|commit)$/);
        if (sessionRoute) {
            if (sessionRoute[1] === 'commit') {
                toast('🔒 Demo somente leitura — em instalação local a sessão seria gravada em MEMORY/sessions/.');
                return Promise.resolve(json({ success: true, sessionFileName: 'exemplo-demo.md', movedSteps: 0, addedSteps: 0, lessonsAdded: 0 }));
            }
            return new Promise(resolve => setTimeout(() => resolve(json({
                success: true,
                project: 'demo-app',
                git: { available: true, branch: 'main', since: null, commits: 3, changedFiles: 2 },
                provider: 'groq',
                model: 'openai/gpt-oss-120b',
                inferenceMs: 1840,
                usage: {},
                draft: {
                    title: 'Exemplo: autenticação JWT e testes de expiração',
                    summaryMarkdown: '## O que foi feito\n- (Exemplo de demonstração) Implementado login com JWT e refresh token.\n- Cobertura de testes para expiração de token.\n\n## Decisões e motivos\n- Refresh token em cookie httpOnly para reduzir risco de XSS.\n\n## Pendências e bloqueios\n- Revisar política de rotação de refresh tokens.',
                    completedSteps: [],
                    newDefinedItems: ['Login com JWT e refresh token'],
                    newNextSteps: ['Revisar política de rotação de refresh tokens'],
                    lessons: [{ title: 'Expiração de JWT em testes', context: 'Testes dependiam do relógio real.', learning: 'Injetar o relógio evita testes instáveis de expiração.', action: 'Usar relógio injetável em testes de autenticação.' }],
                    adrCandidates: [{ title: 'Refresh token em cookie httpOnly', reason: 'Mudança na estratégia de sessão.' }]
                }
            })), 1400));
        }
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
