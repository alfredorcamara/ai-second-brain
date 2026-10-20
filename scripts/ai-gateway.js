/**
 * AI SECOND BRAIN — Universal AI Gateway (BYOK)
 * Zero-dependency client supporting multiple AI providers:
 * - Groq Cloud (Free / Ultra-fast LPU)
 * - OpenAI (GPT-4o, GPT-4o-mini, o1)
 * - Anthropic (Claude 3.5 Sonnet, Haiku)
 * - OpenRouter (DeepSeek R1/V3, Qwen, Llama)
 * - Ollama (100% Local / Offline)
 * - Custom (OpenAI-Compatible endpoint)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_PATH = path.join(__dirname, '..', '.env');

// Cache em memória para inferências de IA respeitando AI_CACHE_TTL_HOURS
const completionCache = new Map();

// Cache em memória de modelos descobertos dinamicamente por provedor (populado via testConnection em tempo real)
const cachedModelsByProvider = {};

// Memória de estado de erro recente de inferência (cota esgotada 429, auth 401, etc.)
let lastGatewayError = null;

// Telemetria de quotas e limites por provedor extraídos dos cabeçalhos HTTP
let lastRateLimitInfo = null;

function extractRateLimitHeaders(headers, providerId) {
    if (!headers) return null;
    const info = { provider: providerId, timestamp: Date.now() };

    // Anthropic headers
    if (headers['anthropic-ratelimit-tokens-remaining'] !== undefined) {
        info.tokensRemaining = parseInt(headers['anthropic-ratelimit-tokens-remaining'], 10);
        info.tokensLimit = parseInt(headers['anthropic-ratelimit-tokens-limit'], 10);
        info.requestsRemaining = parseInt(headers['anthropic-ratelimit-requests-remaining'], 10);
        info.requestsLimit = parseInt(headers['anthropic-ratelimit-requests-limit'], 10);
        info.resetTime = headers['anthropic-ratelimit-tokens-reset'] || headers['anthropic-ratelimit-requests-reset'];
    }
    // OpenAI & Groq standard headers
    else if (headers['x-ratelimit-remaining-tokens'] !== undefined || headers['x-ratelimit-remaining-requests'] !== undefined) {
        if (headers['x-ratelimit-remaining-tokens'] !== undefined) info.tokensRemaining = parseInt(headers['x-ratelimit-remaining-tokens'], 10);
        if (headers['x-ratelimit-limit-tokens'] !== undefined) info.tokensLimit = parseInt(headers['x-ratelimit-limit-tokens'], 10);
        if (headers['x-ratelimit-remaining-requests'] !== undefined) info.requestsRemaining = parseInt(headers['x-ratelimit-remaining-requests'], 10);
        if (headers['x-ratelimit-limit-requests'] !== undefined) info.requestsLimit = parseInt(headers['x-ratelimit-limit-requests'], 10);
        info.resetTime = headers['x-ratelimit-reset-tokens'] || headers['x-ratelimit-reset-requests'];
    }

    if (headers['retry-after']) {
        info.retryAfter = parseFloat(headers['retry-after']);
    }

    return info;
}

/**
 * Provedores suportados e metadados
 */
const PROVIDERS = {
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        tag: 'Multimodal · 1M+ Contexto · Gratuito',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        keyEnv: 'GEMINI_API_KEY',
        requiresKey: true
    },
    groq: {
        id: 'groq',
        name: 'Groq Cloud',
        tag: 'Gratuito & Ultra-rápido LPU',
        baseUrl: 'https://api.groq.com/openai/v1',
        keyEnv: 'GROQ_API_KEY',
        requiresKey: true
    },
    openai: {
        id: 'openai',
        name: 'OpenAI',
        tag: 'GPT & Raciocínio Avançado',
        baseUrl: 'https://api.openai.com/v1',
        keyEnv: 'OPENAI_API_KEY',
        requiresKey: true
    },
    anthropic: {
        id: 'anthropic',
        name: 'Anthropic Claude',
        tag: 'Claude & Análise Profunda',
        baseUrl: 'https://api.anthropic.com/v1',
        keyEnv: 'ANTHROPIC_API_KEY',
        requiresKey: true
    },
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        tag: 'Multi-modelos & Hub Unificado',
        baseUrl: 'https://openrouter.ai/api/v1',
        keyEnv: 'OPENROUTER_API_KEY',
        requiresKey: true
    },
    ollama: {
        id: 'ollama',
        name: 'Ollama (Local Offline)',
        tag: '100% Local · Sem Nuvem · Zero Custo',
        baseUrl: 'http://localhost:11434/v1',
        keyEnv: 'OLLAMA_API_KEY',
        requiresKey: false
    },
    custom: {
        id: 'custom',
        name: 'Custom (OpenAI Compatible)',
        tag: 'Proxy Corporativo / Endpoint Próprio',
        baseUrl: 'http://localhost:8000/v1',
        keyEnv: 'CUSTOM_AI_API_KEY',
        requiresKey: false
    }
};

/**
 * Lê o arquivo .env manualmente (zero dependências)
 */
function loadEnvFile(envPath = ENV_PATH) {
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    const parsed = {};
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        parsed[key] = value;
        process.env[key] = value;
    }
    return parsed;
}

// Inicializa variáveis do .env
loadEnvFile();

/**
 * Máscara segura para exibição da chave na interface
 */
function maskKey(key) {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    const prefix = key.substring(0, 4);
    const suffix = key.substring(key.length - 4);
    return `${prefix}••••••••${suffix}`;
}

/**
 * Retorna a configuração atual do AI Gateway
 */
function getConfig() {
    loadEnvFile();
    const providerId = (process.env.AI_PROVIDER || 'groq').toLowerCase();
    const provider = PROVIDERS[providerId] || PROVIDERS.groq;

    // Chave pode vir de AI_API_KEY genérica ou da específica do provedor
    const apiKey = process.env.AI_API_KEY || 
                   process.env[provider.keyEnv] || 
                   (providerId === 'groq' ? process.env.GROQ_API_KEY : '') || '';

    const model = process.env.AI_MODEL || 
                  (providerId === 'groq' ? process.env.GROQ_MODEL : '') || '';

    const baseUrl = (providerId === 'ollama' || providerId === 'custom')
        ? (process.env.AI_BASE_URL || provider.baseUrl)
        : provider.baseUrl;
    const maxTokens = parseInt(process.env.AI_MAX_TOKENS || process.env.GROQ_MAX_TOKENS, 10) || 4096;
    const temperature = parseFloat(process.env.AI_TEMPERATURE || process.env.GROQ_TEMPERATURE) || 0.7;
    const rawCacheHours = parseInt(process.env.AI_CACHE_TTL_HOURS, 10);
    const cacheHours = (!isNaN(rawCacheHours) && rawCacheHours >= 1 && rawCacheHours <= 720) ? rawCacheHours : 24;
    const rawMaxRetries = parseInt(process.env.AI_MAX_RETRIES, 10);
    const maxRetries = (!isNaN(rawMaxRetries) && rawMaxRetries >= 0 && rawMaxRetries <= 10) ? rawMaxRetries : 2;

    const isConfigured = provider.requiresKey ? !!apiKey : true;
    const models = (isConfigured || providerId === 'ollama') ? (cachedModelsByProvider[providerId] || []) : [];

    return {
        provider: provider.id,
        providerName: provider.name,
        providerTag: provider.tag,
        apiKeyMasked: maskKey(apiKey),
        hasKey: !!apiKey,
        model,
        models,
        modelCount: models.length,
        baseUrl,
        maxTokens,
        temperature,
        cacheHours,
        maxRetries,
        configured: isConfigured,
        lastError: lastGatewayError,
        rateLimit: lastRateLimitInfo,
        availableProviders: Object.values(PROVIDERS).map(p => ({
            id: p.id,
            name: p.name,
            tag: p.tag,
            requiresKey: p.requiresKey,
            defaultBaseUrl: p.baseUrl
        }))
    };
}

/**
 * Salva a nova configuração no .env local e atualiza process.env
 */
function saveConfig({ provider, apiKey, model, baseUrl, maxTokens, temperature, cacheHours, maxRetries }) {
    if (!provider || !PROVIDERS[provider]) {
        throw new Error(`Provedor desconhecido: "${provider}"`);
    }

    const config = getConfig();
    const parsedCache = parseInt(cacheHours !== undefined ? cacheHours : (config.cacheHours || 24), 10);
    if (isNaN(parsedCache) || parsedCache < 1 || parsedCache > 720) {
        throw new Error('O parâmetro Cache TTL deve ser um número inteiro entre 1 e 720 horas.');
    }

    const parsedRetries = parseInt(maxRetries !== undefined ? maxRetries : (config.maxRetries !== undefined ? config.maxRetries : 4), 10);
    if (isNaN(parsedRetries) || parsedRetries < 0 || parsedRetries > 10) {
        throw new Error('O parâmetro Tentativas Automáticas (Retries) deve ser um número inteiro entre 0 e 10.');
    }

    const p = PROVIDERS[provider];
    const current = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
    const lines = current.split('\n');
    const customBaseUrl = (provider === 'ollama' || provider === 'custom') ? (baseUrl || p.baseUrl) : p.baseUrl;
    const updates = {
        AI_PROVIDER: provider,
        AI_MODEL: model || '',
        AI_BASE_URL: customBaseUrl,
        AI_MAX_TOKENS: String(maxTokens || 4096),
        AI_TEMPERATURE: String(temperature ?? 0.7),
        AI_CACHE_TTL_HOURS: String(parsedCache),
        AI_MAX_RETRIES: String(parsedRetries)
    };

    if (provider === 'groq' && model) {
        updates.GROQ_MODEL = model;
    }

    if (apiKey) {
        updates.AI_API_KEY = apiKey;
        if (p.keyEnv) {
            updates[p.keyEnv] = apiKey;
        }
    }

    const newLines = [];
    const keysFound = new Set();

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex !== -1) {
                const k = trimmed.substring(0, eqIndex).trim();
                if (updates[k] !== undefined) {
                    newLines.push(`${k}=${updates[k]}`);
                    keysFound.add(k);
                    continue;
                }
            }
        }
        newLines.push(line);
    }

    // Adiciona as chaves que não existiam
    for (const [k, v] of Object.entries(updates)) {
        if (!keysFound.has(k)) {
            newLines.push(`${k}=${v}`);
        }
    }

    fs.writeFileSync(ENV_PATH, newLines.join('\n').trim() + '\n', 'utf-8');

    // Atualiza process.env imediatamente
    for (const [k, v] of Object.entries(updates)) {
        process.env[k] = v;
    }

    lastGatewayError = null;

    return getConfig();
}

/**
 * Dispara requisição HTTP/HTTPS nativa (zero dependências)
 */
function makeHttpRequest({ url, method = 'POST', headers = {}, body = null, timeoutMs = 60000 }) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const isHttps = parsedUrl.protocol === 'https:';
        const client = isHttps ? https : http;

        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method,
            headers,
            timeout: timeoutMs
        };

        const req = client.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch (_) {
                    parsed = { raw: data };
                }

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ statusCode: res.statusCode, data: parsed, headers: res.headers });
                } else {
                    const errorMsg = (Array.isArray(parsed) && parsed[0]?.error?.message) ||
                                     parsed.error?.message || 
                                     parsed.message || 
                                     `HTTP ${res.statusCode}: ${data.substring(0, 200)}`;
                    const err = new Error(errorMsg);
                    err.statusCode = res.statusCode;
                    err.data = parsed;
                    err.headers = res.headers;
                    reject(err);
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            const err = new Error(`Timeout na requisição (${timeoutMs / 1000}s)`);
            err.statusCode = 408;
            reject(err);
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

/**
 * Testa a conexão com o provedor (validação ao vivo / ping)
 */
async function testConnection({ provider, apiKey, baseUrl, model }) {
    const p = PROVIDERS[provider || 'groq'] || PROVIDERS.groq;
    const finalBaseUrl = ((p.id === 'ollama' || p.id === 'custom')
        ? (baseUrl || process.env.AI_BASE_URL || p.baseUrl)
        : p.baseUrl).replace(/\/+$/, '');
    const finalKey = apiKey || (p.keyEnv ? process.env[p.keyEnv] : '') || process.env.AI_API_KEY || '';

    if (p.requiresKey && !finalKey) {
        const err = new Error(`Informe uma API Key para o provedor ${p.name}`);
        err.statusCode = 400;
        throw err;
    }

    const t0 = Date.now();

    // 1. Tenta listar modelos (GET /models ou GET /api/tags para Ollama)
    let fetchedModels = [];
    try {
        let modelsUrl = `${finalBaseUrl}/models`;
        const headers = { 'User-Agent': 'AI-Second-Brain-Gateway/1.0' };
        if (finalKey) {
            if (p.id === 'anthropic') {
                headers['x-api-key'] = finalKey;
                headers['anthropic-version'] = '2023-06-01';
            } else {
                headers['Authorization'] = `Bearer ${finalKey}`;
            }
        }

        let res = null;
        try {
            res = await makeHttpRequest({
                url: modelsUrl,
                method: 'GET',
                headers,
                timeoutMs: 10000
            });
        } catch (httpErr) {
            // Se for Ollama e /models falhou, tenta /api/tags
            if (p.id === 'ollama') {
                const ollamaBase = finalBaseUrl.replace(/\/v1$/, '');
                res = await makeHttpRequest({
                    url: `${ollamaBase}/api/tags`,
                    method: 'GET',
                    headers,
                    timeoutMs: 10000
                });
            } else {
                throw httpErr;
            }
        }

        let rawList = [];
        if (Array.isArray(res?.data?.data)) {
            rawList = res.data.data;
        } else if (Array.isArray(res?.data?.models)) {
            rawList = res.data.models;
        } else if (Array.isArray(res?.data)) {
            rawList = res.data;
        }

        if (rawList.length > 0) {
            fetchedModels = rawList.map(m => {
                if (typeof m === 'string') {
                    const clean = m.replace(/^models\//, '');
                    return { id: clean, name: clean };
                }
                const rawId = m.id || m.name || '';
                const id = rawId.replace(/^models\//, '');
                const name = (m.display_name || m.displayName || m.name || id).replace(/^models\//, '');
                const contextWindow = m.context_window || m.context_length || null;
                const active = m.active !== false;
                return {
                    id,
                    name,
                    contextWindow,
                    active
                };
            }).filter(m => m.id && m.active !== false);

            // Filtro universal e inteligente de modelos aptos para Engenharia de Software, Arquitetura e Documentação
            function isEngineeringCompatible(modelId, providerId) {
                if (!modelId || typeof modelId !== 'string') return false;
                const lower = modelId.toLowerCase();

                // 1. Áudio, voz, transcrição e streaming bidirecional em tempo real (WebSockets)
                if (lower.startsWith('whisper') || lower.includes('audio') || lower.includes('transcription') ||
                    lower.includes('tts') || lower.includes('speech') || lower.includes('transcribe') ||
                    lower.includes('live') || lower.includes('streaming') || lower.includes('realtime') ||
                    lower.includes('translate') || lower.includes('bidi')) {
                    return false;
                }

                // 2. Classificadores de segurança, moderação e guardrails
                if (lower.includes('guard') || lower.includes('moderation') || lower.includes('safeguard') ||
                    lower.includes('orpheus') || lower.includes('safety') || lower.includes('censor')) {
                    return false;
                }

                // 3. Embeddings e representação vetorial
                if (lower.includes('embed') || lower.includes('embedding') || lower.startsWith('text-embedding') ||
                    lower.startsWith('bge-') || lower.startsWith('nomic-') || lower.includes('similarity')) {
                    return false;
                }

                // 4. Imagem, vídeo, visão pura e mídia generativa
                if (lower.startsWith('dall-e') || lower.includes('flux') || lower.includes('diffusion') ||
                    lower.startsWith('veo') || lower.startsWith('lyria') || lower.includes('image-preview') ||
                    lower.includes('-image') || lower.endsWith('-image') || lower.startsWith('sora') ||
                    lower.startsWith('midjourney') || lower.startsWith('imagen')) {
                    return false;
                }

                // 5. Modelos de recompensa, rerank e pontuação
                if (lower.includes('reward') || lower.includes('rerank') || lower.includes('scorer')) {
                    return false;
                }

                // 6. Automação de desktop/hardware, robótica e protocolos de API fechada não-chat
                if (lower.includes('robotics') || lower.includes('computer-use') || lower.includes('deep-research') ||
                    lower.includes('customtools') || lower.startsWith('antigravity-preview') || lower === 'aqa') {
                    return false;
                }

                // 7. Modelos experimentais restritos / codinomes internos sem cota pública
                if (lower.includes('banana') || lower.includes('argon') || (providerId === 'gemini' && lower.includes('omni-'))) {
                    return false;
                }

                // 8. Modelos comprovadamente descontinuados/aposentados pelos provedores (retornam 404)
                if (providerId === 'gemini' && /^gemini-2\.5-(flash|pro|flash-lite)$/.test(lower)) {
                    return false;
                }

                return true;
            }

            // Categorização semântica dinâmica por propósito
            function classifyModelCategory(modelId, providerId) {
                const lower = modelId.toLowerCase();
                const isMini = /(?:^|[-_])mini(?:[-_]|$)/.test(lower);
                const isLite = /(?:^|[-_])lite(?:[-_]|$)/.test(lower);
                const isInstant = /(?:^|[-_])instant(?:[-_]|$)/.test(lower);
                const isHaiku = /(?:^|[-_])haiku(?:[-_]|$)/.test(lower);
                const isSmall = /(?:^|[-_])small(?:[-_]|$)/.test(lower);
                const is8b = /(?:^|[-_])8b(?:[-_]|$)/.test(lower);

                if (isMini || isLite || isInstant || isHaiku || isSmall || is8b) {
                    return 'fast';
                }
                if (lower.includes('code') || lower.includes('coder') || /(?:^|[-_])it(?:[-_]|$)/.test(lower) ||
                    lower.includes('gemma') || lower.includes('qwen') || lower.includes('deepseek-r1') || lower.includes('mixtral')) {
                    return 'code';
                }
                if (lower.includes('flash') || lower.includes('pro') || lower.includes('sonnet') ||
                    lower.includes('opus') || lower.includes('120b') || lower.includes('70b') ||
                    lower.includes('latest') || lower.includes('4o') || /(?:^|[-_])o[13](?:[-_]|$)/.test(lower)) {
                    return 'recommended';
                }
                return 'general';
            }

            const engineeringModels = fetchedModels
                .filter(m => isEngineeringCompatible(m.id, p.id))
                .map(m => ({
                    ...m,
                    category: classifyModelCategory(m.id, p.id)
                }));

            if (engineeringModels.length > 0) fetchedModels = engineeringModels;

            // Ordenação inteligente: 1º Recomendados, 2º Rápidos, 3º Código, 4º Gerais
            const categoryRank = { recommended: 0, fast: 1, code: 2, general: 3 };
            fetchedModels.sort((a, b) => {
                const rankA = categoryRank[a.category] ?? 99;
                const rankB = categoryRank[b.category] ?? 99;
                if (rankA !== rankB) return rankA - rankB;

                // Prioriza os modelos principais de cada provedor no topo do seu grupo
                const isTopA = /3\.8-flash|flash-latest|gpt-oss-120b|gpt-4o$|claude-3-5-sonnet/i.test(a.id);
                const isTopB = /3\.8-flash|flash-latest|gpt-oss-120b|gpt-4o$|claude-3-5-sonnet/i.test(b.id);
                if (isTopA && !isTopB) return -1;
                if (!isTopA && isTopB) return 1;

                if (a.contextWindow && b.contextWindow && b.contextWindow !== a.contextWindow) {
                    return b.contextWindow - a.contextWindow;
                }
                return a.id.localeCompare(b.id);
            });
        }
    } catch (modelsErr) {
        if (modelsErr.statusCode === 401 || modelsErr.statusCode === 403) {
            const err = new Error(`Chave de API inválida ou sem permissão para o provedor ${p.name}.`);
            err.statusCode = 401;
            throw err;
        }
        if (modelsErr.statusCode === 429) {
            const err = new Error('Cota de IA esgotada ou limite de requisições atingido no provedor.');
            err.statusCode = 429;
            err.quotaExceeded = true;
            throw err;
        }
        // Alguns endpoints customizados não suportam GET /models
    }

    // 2. Se não conseguiu listar modelos e foi informado um modelo específico, valida via mini-ping
    const pingModel = model || (fetchedModels[0] ? fetchedModels[0].id : '');
    if (!fetchedModels.length && pingModel) {
        try {
            await chatCompletion([
                { role: 'user', content: 'Responda apenas: OK' }
            ], {
                provider: p.id,
                apiKey: finalKey,
                baseUrl: finalBaseUrl,
                model: pingModel,
                maxTokens: 5,
                maxRetries: 1
            });
        } catch (pingErr) {
            if (pingErr.statusCode === 429) {
                const err = new Error('Cota de IA esgotada ou limite de requisições atingido no provedor.');
                err.statusCode = 429;
                err.quotaExceeded = true;
                throw err;
            }
            if (pingErr.statusCode === 401 || pingErr.statusCode === 403) {
                const err = new Error(`Chave de API inválida ou sem permissão para o provedor ${p.name}.`);
                err.statusCode = 401;
                throw err;
            }
            throw pingErr;
        }
    } else if (!fetchedModels.length && p.requiresKey) {
        throw new Error(`Nenhum modelo de chat compatível foi retornado pelo provedor ${p.name}. Verifique a API Key.`);
    }

    const latencyMs = Date.now() - t0;
    const combinedModels = fetchedModels.map(m => {
        if (typeof m === 'string') return { id: m, name: m, category: 'general' };
        return {
            id: m.id || m.name,
            name: m.name || m.label || m.id,
            contextWindow: m.contextWindow || null,
            category: m.category || 'general'
        };
    });

    if (combinedModels.length > 0) {
        cachedModelsByProvider[p.id] = combinedModels;
    }

    return {
        success: true,
        provider: p.id,
        latencyMs,
        models: combinedModels
    };
}

/**
 * Executa uma chamada de chat completion de forma agnóstica para qualquer provedor
 */
async function chatCompletion(messages, options = {}) {
    const config = getConfig();
    const providerId = (options.provider || config.provider || 'groq').toLowerCase();
    const provider = PROVIDERS[providerId] || PROVIDERS.groq;

    const resolvedKey = options.apiKey || (provider.keyEnv ? process.env[provider.keyEnv] : '') || (config.provider === provider.id ? process.env.AI_API_KEY : '') || '';

    if (provider.requiresKey && !resolvedKey) {
        const err = new Error(`Chave de API não configurada para ${provider.name}. Conecte seu provedor no AI Gateway.`);
        err.statusCode = 401;
        throw err;
    }

    const baseUrl = (options.baseUrl || ((provider.id === 'ollama' || provider.id === 'custom') ? (config.baseUrl || provider.baseUrl) : provider.baseUrl)).replace(/\/+$/, '');
    let targetModel = options.model || config.model || '';
    if (!targetModel) {
        const err = new Error(`Nenhum modelo de IA selecionado para ${provider.name}. Abra o configurador de IA no topo, teste a conexão e selecione um modelo.`);
        err.statusCode = 400;
        throw err;
    }
    const temperature = options.temperature ?? config.temperature ?? 0.7;
    const maxTokens = options.maxTokens || config.maxTokens || 4096;
    const maxRetries = options.maxRetries !== undefined ? options.maxRetries : (config.maxRetries !== undefined ? config.maxRetries : 2);
    const cacheHours = options.cacheHours !== undefined ? options.cacheHours : (config.cacheHours !== undefined ? config.cacheHours : 24);
    const retryCount = options._retryCount || 0;

    // Verificação de Cache Local de Inferência baseado no TTL configurado
    const cacheTtlMs = cacheHours * 3600 * 1000;
    let cacheKey = null;
    if (cacheHours > 0 && !options.skipCache) {
        const hashContent = JSON.stringify({
            provider: provider.id,
            model: targetModel,
            temperature,
            messages
        });
        cacheKey = crypto.createHash('sha256').update(hashContent).digest('hex');
        const cached = completionCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < cacheTtlMs)) {
            return {
                ...cached.data,
                cached: true
            };
        }
    }

    // Caso Anthropic nativo (/messages)
    if (provider.id === 'anthropic') {
        const systemMessage = messages.find(m => m.role === 'system');
        const userMessages = messages.filter(m => m.role !== 'system');

        const payload = {
            model: targetModel,
            messages: userMessages.map(m => ({ role: m.role, content: m.content })),
            max_tokens: maxTokens,
            temperature
        };
        if (systemMessage) {
            payload.system = systemMessage.content;
        }

        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': resolvedKey,
            'anthropic-version': '2023-06-01'
        };

        try {
            const res = await makeHttpRequest({
                url: `${baseUrl}/messages`,
                method: 'POST',
                headers,
                body: payload,
                timeoutMs: 65000
            });

            const contentText = res.data.content?.map(c => c.text).join('\n') || '';
            lastGatewayError = null;
            const rl = extractRateLimitHeaders(res.headers, provider.id);
            if (rl) lastRateLimitInfo = rl;

            const result = {
                content: contentText,
                usage: res.data.usage || {},
                model: res.data.model || targetModel,
                provider: provider.id
            };
            if (cacheKey && contentText) {
                if (completionCache.size > 200) completionCache.delete(completionCache.keys().next().value);
                completionCache.set(cacheKey, { timestamp: Date.now(), data: result });
            }
            return result;
        } catch (err) {
            return handleChatError(err, messages, options, provider, retryCount, maxRetries);
        }
    }

    // Padrão OpenAI-Compatible (Groq, OpenAI, OpenRouter, Ollama, Custom)
    const payload = {
        model: targetModel,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
    };

    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Second-Brain-Gateway/1.0'
    };
    if (resolvedKey) {
        headers['Authorization'] = `Bearer ${resolvedKey}`;
    }

    try {
        const res = await makeHttpRequest({
            url: `${baseUrl}/chat/completions`,
            method: 'POST',
            headers,
            body: payload,
            timeoutMs: 65000
        });

        const choice = res.data.choices?.[0];
        const content = choice?.message?.content || choice?.text || '';
        lastGatewayError = null;
        const rlOpenAi = extractRateLimitHeaders(res.headers, provider.id);
        if (rlOpenAi) lastRateLimitInfo = rlOpenAi;

        const result = {
            content,
            usage: res.data.usage || {},
            model: res.data.model || targetModel,
            provider: provider.id
        };
        if (cacheKey && content) {
            if (completionCache.size > 200) completionCache.delete(completionCache.keys().next().value);
            completionCache.set(cacheKey, { timestamp: Date.now(), data: result });
        }
        return result;
    } catch (err) {
        return handleChatError(err, messages, options, provider, retryCount, maxRetries);
    }
}

/**
 * Tratamento de retry, rate-limits e fallbacks com backoff
 */
async function handleChatError(err, messages, options, provider, retryCount, maxRetries) {
    const isRateLimit = err.statusCode === 429 || /rate limit|quota|credit|insufficient_quota|tpm|rpm/i.test(err.message);
    const isModelNotFound = !isRateLimit && (
        err.statusCode === 404 ||
        /model.*(does not exist|not found|decommission|no access)|does not exist or you do not have access/i.test(err.message)
    );
    const isAuthError = err.statusCode === 401 || err.statusCode === 403 || /invalid api key|unauthorized|forbidden|authentication/i.test(err.message);

    // Notificação se o modelo estiver indisponível/descontinuado no provedor
    if (isModelNotFound) {
        const customErr = new Error(`O modelo "${options.model || 'selecionado'}" não está disponível ou foi descontinuado pelo provedor ${provider.name}. Abra as configurações de IA no topo, teste a conexão e selecione um modelo ativo da lista.`);
        customErr.statusCode = 404;
        customErr.providerName = provider.name;
        customErr.isModelNotFound = true;
        throw customErr;
    }

    if (isAuthError) {
        const customErr = new Error(`Falha de autenticação com o provedor ${provider.name} (HTTP ${err.statusCode || 401}). Verifique se a sua chave de API está correta nas Configurações de IA.`);
        customErr.statusCode = err.statusCode || 401;
        customErr.providerName = provider.name;
        customErr.authError = true;
        lastGatewayError = {
            statusCode: customErr.statusCode,
            authError: true,
            isRateLimit: false,
            quotaExceeded: false,
            provider: provider.id,
            providerName: provider.name,
            model: options.model || '',
            message: customErr.message,
            timestamp: Date.now()
        };
        throw customErr;
    }

    if (isRateLimit) {
        const rl = extractRateLimitHeaders(err.headers, provider.id);
        if (rl) lastRateLimitInfo = rl;

        let waitSeconds = Math.pow(2, retryCount + 1) * 2; // 4s, 8s, 16s...
        const retryHeader = err.headers?.['retry-after'];
        if (retryHeader) {
            const parsedWait = parseFloat(retryHeader);
            if (!isNaN(parsedWait)) waitSeconds = Math.max(waitSeconds, Math.ceil(parsedWait));
        }

        // Se o provedor exigir mais de 60 segundos de espera (ex: Groq pedindo 1243s / ~20 min por cota diária/por hora esgotada),
        // NUNCA bloqueamos o processo do servidor! Lançamos o erro imediatamente para apresentar o modal ao usuário.
        // Já esperas de recarga do balde por minuto (ex: 15s-45s) são toleradas pelo backoff automático.
        if (waitSeconds > 60 || retryCount >= maxRetries) {
            const waitInfo = waitSeconds ? ` Tempo de redefinição da cota informado pelo provedor: ${waitSeconds}s.` : '';
            const quotaErr = new Error(
                `Limite de requisições ou créditos esgotados no provedor ${provider.name}.${waitInfo} Alterne para outro provedor (OpenAI, Claude, Ollama Local gratuito ou OpenRouter) nas Configurações de IA.`
            );
            quotaErr.statusCode = 429;
            quotaErr.isRateLimit = true;
            quotaErr.quotaExceeded = true;
            quotaErr.retryAfter = waitSeconds;
            quotaErr.providerName = provider.name;
            lastGatewayError = {
                statusCode: 429,
                isRateLimit: true,
                quotaExceeded: true,
                retryAfter: waitSeconds,
                provider: provider.id,
                providerName: provider.name,
                model: options.model || '',
                message: quotaErr.message,
                timestamp: Date.now()
            };
            throw quotaErr;
        }

        console.warn(`⏳ [AI Gateway] Rate limit temporário em ${provider.name}. Aguardando ${waitSeconds}s (tentativa ${retryCount + 1}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, waitSeconds * 1000));

        const nextOptions = { ...options, _retryCount: retryCount + 1 };
        return chatCompletion(messages, nextOptions);
    }

    err.providerName = provider.name;
    throw err;
}

// ============================================================
// SYSTEM PROMPTS PARA O RESEARCH LAB
// ============================================================
const SYSTEM_PROMPTS = {
    refinePrompt: (projectContext) => `Você é um Arquiteto de Software Sênior especialista em refinar definições de pesquisa para o AI Second Brain.

CONTEXTO DO PROJETO:
${projectContext}

SUA TAREFA:
Reescrever o texto do usuário para que seja uma definição de pesquisa clara, estruturada e focada no que é relevante para o projeto.

REGRAS:
1. Mantenha a linguagem direta e prática
2. Estruture em tópicos de foco com bullet points
3. Adicione uma seção de "Excluir" com o que NÃO deve ser pesquisado
4. Considere a stack tecnológica e objetivos do projeto
5. Priorize aspectos técnicos e implementáveis
6. Adicione edge cases que o usuário possa ter esquecido
7. Entregue apenas o texto refinado sem preâmbulos`,

    decompose: (projectContext) => `Você é um assistente especializado em decompor temas de pesquisa em sub-tópicos pesquisáveis para o AI Second Brain.

CONTEXTO DO PROJETO:
${projectContext}

SUA TAREFA:
Dada uma definição de pesquisa, quebre em sub-tópicos concretos e pesquisáveis.

REGRAS:
1. Cada sub-tópico deve ser específico o suficiente para gerar UM arquivo .md focado
2. Ordene por prioridade/dependência (fundamentos primeiro)
3. Limite entre 4 e 12 sub-tópicos
4. Cada sub-tópico deve ter: title, description, slug e priority

FORMATO DE RESPOSTA (JSON):
{
  "subtopics": [
    {
      "title": "Título do Sub-tópico",
      "description": "Breve descrição do que pesquisar",
      "slug": "nome-do-arquivo",
      "priority": "high|medium|low"
    }
  ],
  "estimatedFiles": 8,
  "researchDepth": "basic|intermediate|advanced"
}`,

    synthesizeSubtopic: (projectContext) => `Você é um Arquiteto de Software Sênior e Especialista em Pesquisa Técnica do AI Second Brain.
Sua missão é produzir um documento técnico profundo, altamente prático, estruturado e em formato Markdown sobre um subtópico específico para um laboratório de conhecimento.

CONTEXTO DO PROJETO:
${projectContext}

DIRETRIZES DE CONTEÚDO:
1. Comece com um título claro H1 (# Título) e um resumo executivo de 2-3 linhas logo abaixo.
2. Explique os fundamentos conceituais, padrões de mercado consolidados e o estado da arte.
3. Se o subtópico for prático/acionável, inclua exemplos de código idiomáticos, schemas, arquitetura ou fluxos adaptados à stack do projeto.
4. Inclua uma seção de "Trade-offs e Armadilhas a Evitar" (Gotchas, problemas comuns de concorrência, escala ou segurança).
5. Inclua uma seção final de "Como Aplicar Neste Projeto" com recomendações concretas.
6. Mantenha um tom profissional, direto, sem introduções genéricas.
7. Use formatação markdown rica: tabelas comparativas, listas claras, blocos de código com sintaxe destacada.`,

    sessionCapture: () => `Você é o Escriba de Memória do AI Second Brain. Sua tarefa é converter o material bruto de uma sessão de trabalho (commits, arquivos alterados, notas do desenvolvedor) em registros de memória precisos e úteis para futuros agentes de IA.

REGRAS ABSOLUTAS:
1. Use EXCLUSIVAMENTE as informações fornecidas. NUNCA invente funcionalidades, arquivos, decisões, números ou resultados. Se algo não estiver claro, omita ou escreva "Não definido".
2. O que foi feito deve se apoiar em commits, arquivos alterados ou nas notas do desenvolvedor.
3. completedNextStepIndexes: inclua o número de um "Próximo Passo" SOMENTE se houver evidência explícita de que foi concluído nesta sessão.
4. newDefinedItems: entregas concluídas nesta sessão que ainda não constam em "Já definido". Frases curtas (máx. 200 caracteres).
5. newNextSteps: apenas pendências mencionadas nas notas/commits (TODO, "falta", "próximo", bloqueios). Não crie roadmap especulativo.
6. lessons: apenas aprendizados não óbvios (armadilha, bug, contrato) embasados nas notas. Se não houver, retorne [].
7. adrCandidates: apenas se os commits/notas indicarem mudança de arquitetura, biblioteca, banco ou provedor. Senão, [].
8. Não repita itens já listados em "Já definido" ou "Lições já registradas".
9. Idioma: português do Brasil. Tom técnico, direto e conciso.
10. Responda SOMENTE com JSON válido, sem texto antes ou depois e sem cercas de markdown.

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título curto da sessão (máx. 80 caracteres)",
  "summaryMarkdown": "Markdown SEM título H1, com as seções: ## O que foi feito, ## Decisões e motivos, ## Pendências e bloqueios (omita a seção que não tiver conteúdo)",
  "completedNextStepIndexes": [1],
  "newDefinedItems": ["..."],
  "newNextSteps": ["..."],
  "lessons": [{ "title": "...", "context": "...", "learning": "...", "action": "..." }],
  "adrCandidates": [{ "title": "...", "reason": "..." }]
}`
};

/**
 * Extrai um objeto JSON de uma resposta de LLM (remove cercas markdown e texto ao redor).
 */
function parseJsonLoose(text) {
    let s = String(text || '').trim();
    // 1. Remove cercas de markdown
    s = s.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    // 2. Tenta parse direto
    try {
        return JSON.parse(s);
    } catch (_) {}

    // 3. Tenta extrair o bloco entre o primeiro '{' e o último '}'
    const startObj = s.indexOf('{');
    const endObj = s.lastIndexOf('}');
    if (startObj !== -1 && endObj > startObj) {
        const candidate = s.slice(startObj, endObj + 1);
        try {
            return JSON.parse(candidate);
        } catch (_) {}

        // 4. Repara caracteres de controle não escapados (como quebras de linha cruas dentro de strings)
        try {
            let inString = false;
            let escaped = false;
            let out = '';
            for (let i = 0; i < candidate.length; i++) {
                const char = candidate[i];
                if (escaped) {
                    out += char;
                    escaped = false;
                    continue;
                }
                if (char === '\\') {
                    out += char;
                    escaped = true;
                    continue;
                }
                if (char === '"') {
                    inString = !inString;
                    out += char;
                    continue;
                }
                if (inString && char === '\n') {
                    out += '\\n';
                    continue;
                }
                if (inString && char === '\r') {
                    continue;
                }
                if (inString && char === '\t') {
                    out += '\\t';
                    continue;
                }
                out += char;
            }
            return JSON.parse(out);
        } catch (_) {}
    }

    // 5. Tenta extrair array entre '[' e ']' se aplicável
    const startArr = s.indexOf('[');
    const endArr = s.lastIndexOf(']');
    if (startArr !== -1 && endArr > startArr) {
        try {
            return JSON.parse(s.slice(startArr, endArr + 1));
        } catch (_) {}
    }

    throw new Error('resposta não contém JSON válido');
}

/**
 * Funções de alto nível para o Research Lab
 */
async function refineResearchPrompt(userText, projectContext) {
    const result = await chatCompletion([
        { role: 'system', content: SYSTEM_PROMPTS.refinePrompt(projectContext) },
        { role: 'user', content: userText }
    ], { temperature: 0.7, maxTokens: 2048 });

    return {
        refined: result.content,
        usage: result.usage,
        model: result.model,
        provider: result.provider
    };
}

async function decomposeResearchTopic(researchDefinition, projectContext) {
    const result = await chatCompletion([
        { role: 'system', content: SYSTEM_PROMPTS.decompose(projectContext) },
        { role: 'user', content: researchDefinition }
    ], { temperature: 0.4, maxTokens: 2048 });

    let parsed;
    try {
        let jsonStr = result.content.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        parsed = JSON.parse(jsonStr);
    } catch (e) {
        throw new Error(`IA retornou resposta inválida na decomposição: ${e.message}`);
    }

    return {
        subtopics: parsed.subtopics || [],
        estimatedFiles: parsed.estimatedFiles || parsed.subtopics?.length || 0,
        researchDepth: parsed.researchDepth || 'intermediate',
        usage: result.usage,
        model: result.model,
        provider: result.provider
    };
}

async function synthesizeSubtopic(subtopic, mainTopic, projectContext) {
    const userPrompt = `TEMA PRINCIPAL DO LABORATÓRIO:
"${mainTopic}"

SUBTÓPICO A PESQUISAR E DOCUMENTAR:
Título: ${subtopic.title || subtopic.name}
Descrição / Foco: ${subtopic.description || subtopic.goal || 'Aprofundamento técnico e boas práticas'}
Camada Pretendida: ${subtopic.layer === 'actionable' ? 'Prática / Implementação / Código / Schema' : 'Conhecimento / Teoria / Padrões / Comparativo'}

Gere o documento Markdown completo, rico e profissional sobre este subtópico agora.`;

    const result = await chatCompletion([
        { role: 'system', content: SYSTEM_PROMPTS.synthesizeSubtopic(projectContext) },
        { role: 'user', content: userPrompt }
    ], { temperature: 0.5, maxTokens: 3500 });

    return {
        content: result.content,
        usage: result.usage,
        model: result.model,
        provider: result.provider
    };
}

/**
 * Gera o rascunho de memória de uma sessão de trabalho (Session Capture).
 * @param {string} contextText Contexto já montado de forma determinística (git + contratos + notas)
 * @param {{ skipCache?: boolean }} [options] skipCache=true força nova inferência ("Regenerar")
 * @returns {Promise<{ draft: object, usage: object, model: string, provider: string }>}
 */
async function summarizeSession(contextText, options = {}) {
    const result = await chatCompletion([
        { role: 'system', content: SYSTEM_PROMPTS.sessionCapture() },
        { role: 'user', content: contextText }
    ], { temperature: 0.2, maxTokens: 3000, skipCache: !!options.skipCache });

    let draft;
    try {
        draft = parseJsonLoose(result.content);
    } catch (e) {
        const err = new Error(`A IA retornou uma resposta inválida ao resumir a sessão: ${e.message}. Tente novamente.`);
        err.statusCode = 502;
        throw err;
    }

    return {
        draft,
        usage: result.usage,
        model: result.model,
        provider: result.provider
    };
}

module.exports = {
    PROVIDERS,
    loadEnvFile,
    getConfig,
    saveConfig,
    testConnection,
    chatCompletion,
    refineResearchPrompt,
    decomposeResearchTopic,
    synthesizeSubtopic,
    summarizeSession,
    parseJsonLoose,
    SYSTEM_PROMPTS
};
