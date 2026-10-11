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

/**
 * Provedores suportados e metadados
 */
const PROVIDERS = {
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

    const baseUrl = process.env.AI_BASE_URL || provider.baseUrl;
    const maxTokens = parseInt(process.env.AI_MAX_TOKENS || process.env.GROQ_MAX_TOKENS, 10) || 4096;
    const temperature = parseFloat(process.env.AI_TEMPERATURE || process.env.GROQ_TEMPERATURE) || 0.7;
    const cacheHours = parseInt(process.env.AI_CACHE_TTL_HOURS, 10) || 24;
    const maxRetries = parseInt(process.env.AI_MAX_RETRIES, 10) || 2;

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

    const p = PROVIDERS[provider];
    const current = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
    const lines = current.split('\n');
    const updates = {
        AI_PROVIDER: provider,
        AI_MODEL: model || '',
        AI_BASE_URL: baseUrl || p.baseUrl,
        AI_MAX_TOKENS: String(maxTokens || 4096),
        AI_TEMPERATURE: String(temperature ?? 0.7),
        AI_CACHE_TTL_HOURS: String(cacheHours || 24),
        AI_MAX_RETRIES: String(maxRetries || 2)
    };

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
                    const errorMsg = parsed.error?.message || 
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
    const finalBaseUrl = (baseUrl || p.baseUrl).replace(/\/+$/, '');
    const finalKey = apiKey || (p.keyEnv ? process.env[p.keyEnv] : '') || process.env.AI_API_KEY || '';

    if (p.requiresKey && !finalKey) {
        throw new Error(`Informe uma API Key para o provedor ${p.name}`);
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
                    return { id: m, name: m };
                }
                const id = m.id || m.name || '';
                const name = m.name || m.display_name || m.displayName || id;
                const contextWindow = m.context_window || m.context_length || null;
                const active = m.active !== false;
                return {
                    id,
                    name,
                    contextWindow,
                    active
                };
            }).filter(m => m.id && m.active !== false);

            // Filtro universal e estrito de modelos utilizáveis para Chat/Completions (elimina áudio, guardrails, embeddings, tts, vision pura)
            function isChatCompatible(modelId) {
                if (!modelId || typeof modelId !== 'string') return false;
                const lower = modelId.toLowerCase();
                // 1. Áudio, fala e transcrição
                if (lower.startsWith('whisper') || lower.includes('audio') || lower.includes('transcription') || lower.includes('tts') || lower.includes('speech')) return false;
                // 2. Classificadores de segurança e moderação
                if (lower.includes('guard') || lower.includes('moderation') || lower.includes('safeguard') || lower.includes('orpheus')) return false;
                // 3. Embeddings e vetores
                if (lower.includes('embed') || lower.includes('embedding') || lower.startsWith('text-embedding')) return false;
                // 4. Modelos de imagem/tempo real não-chat
                if (lower.startsWith('dall-e') || lower.includes('flux') || lower.includes('diffusion') || lower.includes('realtime')) return false;
                // 5. Modelos de recompensa / rerank
                if (lower.includes('reward') || lower.includes('rerank')) return false;
                return true;
            }

            const chatOnly = fetchedModels.filter(m => isChatCompatible(m.id));
            if (chatOnly.length > 0) fetchedModels = chatOnly;

            // Ordena os modelos alfabeticamente ou prioriza maior janela de contexto
            fetchedModels.sort((a, b) => {
                if (a.contextWindow && b.contextWindow && b.contextWindow !== a.contextWindow) {
                    return b.contextWindow - a.contextWindow;
                }
                return a.id.localeCompare(b.id);
            });
        }
    } catch (_) {
        // Alguns endpoints não suportam GET /models
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
                const err = new Error('Chave de API inválida ou sem permissão.');
                err.statusCode = 401;
                throw err;
            }
            throw pingErr;
        }
    }

    const latencyMs = Date.now() - t0;
    const combinedModels = fetchedModels.map(m => {
        if (typeof m === 'string') return { id: m, name: m };
        return { id: m.id || m.name, name: m.name || m.label || m.id, contextWindow: m.contextWindow || null };
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

    const apiKey = options.apiKey || (provider.keyEnv ? process.env[provider.keyEnv] : '') || config.apiKeyMasked;
    const resolvedKey = options.apiKey || process.env[provider.keyEnv] || process.env.AI_API_KEY || '';

    if (provider.requiresKey && !resolvedKey) {
        const err = new Error(`Chave de API não configurada para ${provider.name}. Conecte seu provedor no AI Gateway.`);
        err.statusCode = 401;
        throw err;
    }

    const baseUrl = (options.baseUrl || config.baseUrl || provider.baseUrl).replace(/\/+$/, '');
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
    const isRateLimit = err.statusCode === 429 || /rate limit|quota/i.test(err.message);
    // Notificação se o modelo estiver indisponível/descontinuado no provedor
    if (isModelNotFound) {
        const customErr = new Error(`O modelo "${options.model || 'selecionado'}" não está disponível ou foi descontinuado pelo provedor ${provider.name}. Abra as configurações de IA no topo, teste a conexão e selecione um modelo ativo da lista.`);
        customErr.statusCode = 404;
        throw customErr;
    }

    if (isRateLimit && retryCount < maxRetries) {
        let waitSeconds = Math.pow(2, retryCount + 1) * 2; // 4s, 8s, 16s...
        const retryHeader = err.headers?.['retry-after'];
        if (retryHeader) {
            const parsedWait = parseFloat(retryHeader);
            if (!isNaN(parsedWait)) waitSeconds = Math.ceil(parsedWait) + 2;
        }

        console.warn(`⏳ [AI Gateway] Rate limit atingido em ${provider.name}. Aguardando ${waitSeconds}s (tentativa ${retryCount + 1}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, waitSeconds * 1000));

        const nextOptions = { ...options, _retryCount: retryCount + 1 };
        return chatCompletion(messages, nextOptions);
    }

    if (isRateLimit) {
        err.quotaExceeded = true;
    }
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
7. Use formatação markdown rica: tabelas comparativas, listas claras, blocos de código com sintaxe destacada.`
};

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
    SYSTEM_PROMPTS
};
