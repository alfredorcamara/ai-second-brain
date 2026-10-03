/**
 * AI SECOND BRAIN — Groq AI Client
 * Zero-dependency client for Groq API (OpenAI-compatible)
 * Used by the Research Lab for prompt refinement and knowledge synthesis
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Load .env file manually (zero dependencies — no dotenv needed)
 */
function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}

// Auto-load .env from project root (one level up from scripts/)
loadEnvFile(path.join(__dirname, '..', '.env'));

/**
 * Get current Groq configuration
 */
function getConfig() {
    return {
        apiKey: process.env.GROQ_API_KEY || '',
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        maxTokens: parseInt(process.env.GROQ_MAX_TOKENS, 10) || 4096,
        temperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0.7,
        configured: !!process.env.GROQ_API_KEY
    };
}

/**
 * Make a chat completion request to Groq API
 * @param {Array} messages - Array of {role, content} message objects
 * @param {Object} options - Optional overrides: model, maxTokens, temperature
 * @returns {Promise<{content: string, usage: object, model: string}>}
 */
async function chatCompletion(messages, options = {}) {
    const config = getConfig();
    const retryCount = options._retryCount || 0;
    const maxRetries = options.maxRetries !== undefined ? options.maxRetries : 3;
    
    if (!config.apiKey) {
        throw new Error(
            'GROQ_API_KEY não configurada. Adicione sua chave no arquivo .env'
        );
    }

    const targetModel = options.model || config.model;

    const payload = JSON.stringify({
        model: targetModel,
        messages,
        temperature: options.temperature ?? config.temperature,
        max_tokens: options.maxTokens || config.maxTokens,
        stream: false
    });

    try {
        return await new Promise((resolve, reject) => {
            const url = new URL(GROQ_API_URL);
            
            const reqOptions = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            const req = https.request(reqOptions, (res) => {
                let body = '';
                res.on('data', chunk => { body += chunk; });
                res.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        
                        if (res.statusCode !== 200) {
                            const errMsg = data.error?.message || `Groq API error (HTTP ${res.statusCode})`;
                            const err = new Error(errMsg);
                            err.statusCode = res.statusCode;
                            err.data = data;
                            reject(err);
                            return;
                        }

                        if (!data.choices || !data.choices[0]) {
                            reject(new Error('Resposta inesperada da API Groq — sem choices'));
                            return;
                        }

                        resolve({
                            content: data.choices[0].message.content,
                            usage: data.usage || {},
                            model: data.model || targetModel,
                            finishReason: data.choices[0].finish_reason
                        });
                    } catch (parseErr) {
                        reject(new Error(`Falha ao processar resposta do Groq: ${parseErr.message}`));
                    }
                });
            });

            req.on('error', (err) => {
                reject(new Error(`Falha na conexão com Groq API: ${err.message}`));
            });

            req.setTimeout(60000, () => {
                req.destroy();
                reject(new Error('Timeout na requisição ao Groq (60s)'));
            });

            req.write(payload);
            req.end();
        });
    } catch (err) {
        const isRateLimit = err.statusCode === 429 || 
                            (err.message && (
                                err.message.includes('Rate limit') || 
                                err.message.includes('rate_limit') ||
                                err.message.includes('TPM') ||
                                err.message.includes('tokens per minute')
                            ));

        if (isRateLimit && retryCount < maxRetries) {
            // Tenta extrair o tempo de espera informado pelo Groq (ex: "Please try again in 6.9225s.")
            let waitSeconds = 8;
            const match = err.message.match(/try again in ([\d\.]+)s/i);
            if (match && match[1]) {
                waitSeconds = Math.ceil(parseFloat(match[1])) + 2; // +2s de margem de segurança
            } else {
                waitSeconds = (retryCount + 1) * 7;
            }

            console.warn(`⏳ [Groq Client] Rate limit atingido para ${targetModel}. Aguardando ${waitSeconds}s antes de retentar (${retryCount + 1}/${maxRetries})...`);
            await new Promise(r => setTimeout(r, waitSeconds * 1000));

            // Se for a última tentativa e o modelo for o 120b, tenta fallback para 20b que tem maior folga
            let fallbackModel = options.model;
            if (retryCount >= 1 && targetModel.includes('120b')) {
                fallbackModel = 'openai/gpt-oss-20b';
                console.log(`🔀 [Groq Client] Alternando para modelo mais leve (${fallbackModel}) para evitar novo rate limit.`);
            }

            return chatCompletion(messages, {
                ...options,
                model: fallbackModel,
                _retryCount: retryCount + 1
            });
        }

        throw err;
    }
}

// ============================================================
// RESEARCH LAB — System Prompts
// ============================================================

const SYSTEM_PROMPTS = {
    /**
     * System prompt for refining user research definitions
     */
    refinePrompt: (projectContext) => `Você é um assistente especializado em refinar definições de pesquisa para um laboratório de conhecimento de desenvolvimento de software.

CONTEXTO DO PROJETO:
${projectContext}

SUA TAREFA:
Reescrever o texto do usuário para que seja uma definição de pesquisa clara, estruturada e focada no que é relevante para o projeto.

REGRAS:
1. Mantenha a linguagem acessível — deve parecer que o próprio usuário escreveu, só que com mais clareza
2. Estruture em tópicos de foco com bullet points
3. Adicione uma seção de "Excluir" com o que NÃO deve ser pesquisado (conteúdo irrelevante para o projeto)
4. Considere a stack tecnológica e os objetivos do projeto para filtrar o que importa
5. Se o projeto é de desenvolvimento de software, priorize aspectos técnicos e implementáveis
6. Adicione edge cases ou tópicos que o usuário provavelmente esqueceu mas são importantes
7. NÃO adicione formatação markdown elaborada — use texto simples com bullet points
8. NÃO inclua comentários sobre o que você fez — entregue apenas a definição refinada
9. Comece diretamente com a definição, sem preâmbulos`,

    /**
     * System prompt for decomposing a research topic into sub-topics
     */
    decompose: (projectContext) => `Você é um assistente especializado em decompor temas de pesquisa em sub-tópicos pesquisáveis para um laboratório de conhecimento.

CONTEXTO DO PROJETO:
${projectContext}

SUA TAREFA:
Dada uma definição de pesquisa, quebre em sub-tópicos concretos e pesquisáveis.

REGRAS:
1. Cada sub-tópico deve ser específico o suficiente para gerar UM arquivo .md focado
2. Ordene por prioridade/dependência (fundamentos primeiro)
3. Limite entre 4 e 12 sub-tópicos
4. Cada sub-tópico deve ter: título curto, descrição de 1 linha, e um slug para nome de arquivo
5. Considere o contexto do projeto para priorizar sub-tópicos relevantes

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

    /**
     * System prompt for synthesizing a full technical markdown document for a sub-topic
     */
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
6. Mantenha um tom profissional, direto, sem enrolação ou introduções genéricas ("Neste artigo iremos...").
7. Use formatação markdown rica: tabelas comparativas quando couber, listas claras, blocos de código com sintaxe destacada.`
};

/**
 * Refine a user's research prompt using AI
 * @param {string} userText - Raw text from the user
 * @param {string} projectContext - Content from PROJECT.md + ARCHITECTURE.md
 * @returns {Promise<{refined: string, usage: object}>}
 */
async function refineResearchPrompt(userText, projectContext) {
    const result = await chatCompletion([
        { role: 'system', content: SYSTEM_PROMPTS.refinePrompt(projectContext) },
        { role: 'user', content: userText }
    ], { temperature: 0.7, maxTokens: 2048 });

    return {
        refined: result.content,
        usage: result.usage,
        model: result.model
    };
}

/**
 * Decompose a research definition into searchable sub-topics
 * @param {string} researchDefinition - The refined research prompt
 * @param {string} projectContext - Content from PROJECT.md + ARCHITECTURE.md
 * @returns {Promise<{subtopics: Array, estimatedFiles: number, usage: object}>}
 */
async function decomposeResearchTopic(researchDefinition, projectContext) {
    const result = await chatCompletion([
        { role: 'system', content: SYSTEM_PROMPTS.decompose(projectContext) },
        { role: 'user', content: researchDefinition }
    ], { temperature: 0.4, maxTokens: 2048 });

    // Parse JSON from response (handle potential markdown code fences)
    let parsed;
    try {
        let jsonStr = result.content.trim();
        // Remove code fences if present
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
        model: result.model
    };
}

/**
 * Synthesize a full technical markdown document for a specific sub-topic
 * @param {Object} subtopic - { title, description, layer, priority }
 * @param {string} mainTopic - The overarching research topic
 * @param {string} projectContext - Content from PROJECT.md + ARCHITECTURE.md
 * @returns {Promise<{content: string, usage: object, model: string}>}
 */
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
        model: result.model
    };
}

module.exports = {
    loadEnvFile,
    getConfig,
    chatCompletion,
    refineResearchPrompt,
    decomposeResearchTopic,
    synthesizeSubtopic,
    SYSTEM_PROMPTS
};

