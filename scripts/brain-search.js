/**
 * AI SECOND BRAIN — Brain Search & Q&A Engine ("Pergunte ao Cérebro")
 * Motor determinístico de recuperação de documentos com síntese via AI Gateway.
 * 
 * Princípios mandatórios:
 * 1. Zero Fabricação: Respostas da IA ancoradas estritamente nos trechos recuperados.
 * 2. Citações Clicáveis: Todas as afirmações indicam arquivos exatos de origem.
 * 3. Alta Performance: Busca determinística executada em <15ms.
 */

const fs = require('fs');
const path = require('path');
const { scanVault } = require('./scan-vault');
const aiGateway = require('./ai-gateway');

// Stopwords básicas em Português e Inglês para filtrar da query
const STOP_WORDS = new Set([
    'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob', 'sobre',
    'e', 'ou', 'mas', 'que', 'se', 'como', 'quando', 'onde', 'qual', 'quais', 'quem',
    'porque', 'por que', 'porquê', 'qual', 'foi', 'é', 'sao', 'são', 'ser', 'estar',
    'the', 'is', 'at', 'which', 'on', 'in', 'and', 'or', 'to', 'for', 'with', 'from',
    'what', 'how', 'why', 'where', 'when', 'who'
]);

function normalizeText(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractKeywords(query) {
    const normalized = normalizeText(query);
    const tokens = normalized.split(/\s+/).filter(t => t.length > 2);
    const filtered = tokens.filter(t => !STOP_WORDS.has(t));

    // Palavras comuns de consulta técnica que têm baixa especificidade
    const genericVerbs = new Set(['decidido', 'definido', 'feito', 'escolhido', 'criado', 'adotado', 'projeto', 'sistema', 'regras', 'sobre']);

    // Ordena: termos com traços/números (ex: adr-g008, fastify-v4) primeiro, depois por comprimento decrescente
    return filtered.sort((a, b) => {
        const aSpecial = /[\d-]/.test(a);
        const bSpecial = /[\d-]/.test(b);
        if (aSpecial && !bSpecial) return -1;
        if (!aSpecial && bSpecial) return 1;

        const aGeneric = genericVerbs.has(a);
        const bGeneric = genericVerbs.has(b);
        if (aGeneric && !bGeneric) return 1;
        if (!aGeneric && bGeneric) return -1;

        return b.length - a.length;
    });
}

/**
 * Extrai o trecho mais relevante de um arquivo em torno das palavras-chave encontradas.
 * Prioriza seções iniciadas por headers Markdown (## Título).
 */
function extractBestSnippet(content, keywords, query, maxLength = 1400) {
    if (!content) return '';
    const cleanContent = content.replace(/\r\n/g, '\n');
    const normalizedContent = normalizeText(cleanContent);
    const lines = cleanContent.split('\n');

    // 1. Tenta encontrar se alguma palavra-chave específica ou a query aparece em um Header Markdown (#, ##, ###)
    let headerMatchLine = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^#{1,4}\s+/.test(line)) {
            const normLine = normalizeText(line);
            for (const kw of keywords) {
                if (normLine.includes(kw)) {
                    headerMatchLine = i;
                    break;
                }
            }
            if (headerMatchLine !== -1) break;
        }
    }

    if (headerMatchLine !== -1) {
        // Pega a partir do header até atingir o limite de caracteres
        const subLines = lines.slice(headerMatchLine);
        let snippet = subLines.join('\n').slice(0, maxLength).trim();
        if (snippet.length >= maxLength) snippet += '...';
        return cleanSnippetFormatting(snippet);
    }

    // 2. Tenta correspondência da frase exata
    const normQuery = normalizeText(query);
    let matchIndex = normQuery.length > 4 ? normalizedContent.indexOf(normQuery) : -1;

    // 3. Se não achou a frase exata, procura a palavra-chave mais específica
    if (matchIndex === -1 && keywords.length > 0) {
        for (const kw of keywords) {
            const idx = normalizedContent.indexOf(kw);
            if (idx !== -1) {
                matchIndex = idx;
                break;
            }
        }
    }

    if (matchIndex === -1) {
        // Fallback: primeiros parágrafos do documento
        const introLines = lines.filter(l => l.trim() && !l.startsWith('# ')).slice(0, 8);
        const snippet = introLines.join('\n').slice(0, maxLength);
        return snippet + (snippet.length >= maxLength ? '...' : '');
    }

    // Calcula janela ao redor do match
    const half = Math.floor(maxLength * 0.35); // Dá mais espaço para o texto posterior
    let start = Math.max(0, matchIndex - half);
    let end = Math.min(cleanContent.length, matchIndex + (maxLength - half));

    // Ajusta para início de linha anterior para não cortar no meio da frase
    if (start > 0) {
        const prevBreak = cleanContent.lastIndexOf('\n', start);
        if (prevBreak !== -1 && prevBreak > start - 80) {
            start = prevBreak + 1;
        }
    }
    if (end < cleanContent.length) {
        const nextBreak = cleanContent.indexOf('\n', end);
        if (nextBreak !== -1 && nextBreak < end + 80) {
            end = nextBreak;
        }
    }

    let snippet = cleanContent.slice(start, end).trim();
    if (start > 0) snippet = '...' + snippet;
    if (end < cleanContent.length) snippet = snippet + '...';

    return cleanSnippetFormatting(snippet);
}

/**
 * Limpa artefatos visuais de Markdown que prejudicam a leitura do trecho.
 */
function cleanSnippetFormatting(text) {
    if (!text) return '';
    let cleaned = text.replace(/\r\n/g, '\n');
    // Remove separadores de tabela cortados ex: |---|---|
    cleaned = cleaned.replace(/^\s*\|[-:\s|]+\|\s*$/gm, '');
    // Remove separadores horizontais excessivos (---)
    cleaned = cleaned.replace(/\n-{3,}\n/g, '\n\n');
    // Remove múltiplas quebras de linha consecutivas
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned.trim();
}

/**
 * Classifica a categoria do documento a partir do caminho normalizado para o filtro estrito.
 */
function classifyFileCategory(rawPath) {
    const p = (rawPath || '').replace(/\\/g, '/').toLowerCase();
    // 1. Research Lab tem precedência estrita para qualquer arquivo em RESEARCH/
    if (p.includes('/research/') || p.startsWith('research/')) {
        return 'research';
    }
    // 2. Decisões Arquiteturais (ADRs) - pasta DECISIONS/ ou arquivo que comece com adr- ou adr_
    const fileName = p.split('/').pop() || '';
    if (p.includes('/decisions/') || p.startsWith('decisions/') || fileName.startsWith('adr-') || fileName.startsWith('adr_')) {
        return 'decision';
    }
    // 3. Regras Universais e Governança
    if (p.startsWith('.agents/rules/') || p.endsWith('agents.md') || p.endsWith('gemini.md') || p.includes('/rules/')) {
        return 'rules';
    }
    // 4. Lições Aprendidas
    if (p.includes('lessons_learned') || p.includes('lessons-learned') || fileName === 'lessons.md' || p.includes('/memory/lessons')) {
        return 'lessons';
    }
    // 5. Contratos e Estado do Projeto
    if (p.endsWith('project.md') || p.endsWith('current_state.md') || p.endsWith('current-state.md') || p.endsWith('architecture.md')) {
        return 'project';
    }
    return 'other';
}

/**
 * Recupera documentos relevantes do Vault com base em ranking ponderado.
 */
function retrieveRelevantSnippets(rootDir, query, options = {}) {
    if (!query || !query.trim()) return [];

    const vault = scanVault(rootDir);
    const files = vault.files || [];
    const keywords = extractKeywords(query);
    const normQuery = normalizeText(query);
    const targetProject = (options.projectName || options.scope || '').toLowerCase().trim();
    const targetCategory = (options.categoryFilter || options.category || '').toLowerCase().trim();

    const scoredResults = [];

    for (const file of files) {
        if (!file.content || file.content.trim().length === 0) continue;

        let score = 0;
        const normTitle = normalizeText(file.title || '');
        const normPath = normalizeText(file.path || '');
        const normContent = normalizeText(file.content);

        // Caminho bruto normalizado (mantém '/') — normalizeText() remove barras e NÃO serve para filtros estruturais
        const rawPath = (file.path || '').replace(/\\/g, '/').toLowerCase();

        // Se o usuário especificou um projeto, restringe estritamente aos arquivos desse projeto
        if (targetProject) {
            if (!rawPath.startsWith(`projects/${targetProject}/`)) {
                continue;
            }
        }

        // Filtro ESTRITO de tipo de documento (categoryFilter)
        if (targetCategory && targetCategory !== 'all') {
            if (classifyFileCategory(rawPath) !== targetCategory) {
                continue;
            }
        }

        // 1. Prioridade por tipo de contrato (Governança e Memória têm peso mais alto)
        let categoryMultiplier = 1.0;
        if (file.path.includes('DECISIONS/') || file.category === 'decisions') {
            categoryMultiplier = 2.4;
        } else if (file.path.toLowerCase().endsWith('current_state.md')) {
            categoryMultiplier = 2.2;
        } else if (file.path.toLowerCase().endsWith('project.md') || file.path.toLowerCase().endsWith('architecture.md')) {
            categoryMultiplier = 2.0;
        } else if (file.path.toLowerCase().includes('lessons_learned.md') || file.path.toLowerCase().includes('lessons-learned')) {
            categoryMultiplier = 2.0;
        } else if (file.path.startsWith('.agents/rules/')) {
            categoryMultiplier = 1.8;
        } else if (file.path.includes('/actionable/')) {
            categoryMultiplier = 1.5;
        }

        // 2. Exact Query Match
        if (normQuery.length > 3) {
            if (normTitle.includes(normQuery)) score += 90;
            if (normPath.includes(normQuery)) score += 50;
            if (normContent.includes(normQuery)) score += 70;
        }

        // 3. Match em Título e Caminho por Palavras-Chave
        for (const kw of keywords) {
            if (normTitle === kw) score += 40;
            else if (normTitle.includes(kw)) score += 20;

            if (normPath.includes(kw)) score += 15;
        }

        // 4. Match em Cabeçalhos Markdown (# Header)
        const headerMatches = file.content.match(/^#{1,4}\s+.+$/gm) || [];
        for (const h of headerMatches) {
            const normH = normalizeText(h);
            if (normQuery && normH.includes(normQuery)) {
                score += 45;
                break;
            }
            for (const kw of keywords) {
                if (normH.includes(kw)) score += 12;
            }
        }

        // 5. Frequência de palavras-chave no corpo
        let termHits = 0;
        for (const kw of keywords) {
            const regex = new RegExp(`\\b${kw}\\b`, 'g');
            const count = (normContent.match(regex) || []).length;
            if (count > 0) {
                termHits++;
                score += Math.min(count * 4, 30); // Limite por termo
            }
        }

        // Bônus se contiver todas as palavras-chave da busca
        if (keywords.length > 1 && termHits === keywords.length) {
            score += 35;
        }

        // Aplica o multiplicador da categoria de governança
        score = Math.round(score * categoryMultiplier);

        if (score > 15) {
            const snippet = extractBestSnippet(file.content, keywords, query);
            scoredResults.push({
                file: {
                    id: file.id,
                    path: file.path,
                    name: file.name,
                    title: file.title,
                    category: file.category,
                    icon: file.icon
                },
                score,
                snippet
            });
        }
    }

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.slice(0, options.limit || 12);
}

/**
 * "Pergunte ao Cérebro" completo: Recuperação determinística + Síntese com IA via Gateway.
 */
async function askBrain(rootDir, query, options = {}) {
    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery) {
        throw new Error('A pergunta não pode ficar vazia.');
    }

    const startedAt = Date.now();
    const retrieved = retrieveRelevantSnippets(rootDir, trimmedQuery, options);

    // Se o usuário solicitou apenas a busca rápida determinística (ex: visualização instantânea de snippets)
    if (options.fastOnly) {
        return {
            success: true,
            query: trimmedQuery,
            isFastOnly: true,
            sources: retrieved.map(r => ({
                path: r.file.path,
                title: r.file.title,
                category: r.file.category,
                icon: r.file.icon,
                score: r.score,
                snippet: r.snippet
            })),
            latencyMs: Date.now() - startedAt
        };
    }

    // Se nenhum documento relevante foi encontrado
    if (retrieved.length === 0) {
        let filterHint = '';
        if (options.categoryFilter && options.categoryFilter !== 'all') {
            const catNames = {
                decision: '⚖️ ADRs (Decisões Arquiteturais)',
                research: '🔬 Research Lab (Pesquisas)',
                rules: '🛡️ Regras Universais',
                lessons: '🧠 Lições Aprendidas',
                project: '📦 Contratos de Projetos'
            };
            const catName = catNames[options.categoryFilter] || options.categoryFilter;
            filterHint = ` na categoria **${catName}**`;
        }
        if (options.projectName) {
            filterHint += ` no projeto **${options.projectName}**`;
        }
        return {
            success: true,
            query: trimmedQuery,
            answerMarkdown: `Não foram encontrados documentos relevantes no cofre com informações sobre **"${trimmedQuery}"**${filterHint}.\n\n💡 **Dica de Usabilidade**: Tente alternar a categoria para **[Todas as Categorias]** ou o escopo para **[Global]** para expandir a busca a outros documentos do Segundo Cérebro.`,
            sources: [],
            latencyMs: Date.now() - startedAt
        };
    }

    // Inteligência de corte dinâmico para síntese de IA:
    // Perguntas conceituais, amplas ou com palavras-chave únicas (ex: "crm", "arquitetura", "geral", "visão geral")
    // recebem até 7 trechos no prompt; perguntas pontuais ou específicas recebem 4 a 5 trechos.
    const normQ = normalizeText(trimmedQuery);
    const isBroadQuery = normQ.length < 18 || 
                         /(visao geral|panorama|geral|arquitetura|completo|todos|resumo|modulo|quais|como funciona)/i.test(trimmedQuery);
    const synthesisLimit = isBroadQuery ? Math.min(retrieved.length, 7) : Math.min(retrieved.length, 5);
    const contextResults = retrieved.slice(0, synthesisLimit);

    // Prepara o bloco de trechos para alimentar o LLM
    const contextBlocks = contextResults.map((r, i) => {
        return `[Documento ${i + 1}]: ${r.file.path}\nTítulo: ${r.file.title} (Categoria: ${r.file.category})\nTRECHO:\n"""\n${r.snippet}\n"""`;
    }).join('\n\n');

    const categoryLabels = {
        decision: '⚖️ ADRs (Decisões Arquiteturais)',
        research: '🔬 Research Lab (Pesquisas)',
        rules: '🛡️ Regras Universais',
        lessons: '🧠 Lições Aprendidas',
        project: '📦 Contratos de Projetos'
    };
    const activeCatLabel = (options.categoryFilter && options.categoryFilter !== 'all')
        ? (categoryLabels[options.categoryFilter] || options.categoryFilter)
        : '';

    const promptUser = `PERGUNTA DO DESENVOLVEDOR:
"${trimmedQuery}"

${options.projectName ? `PROJETO EM FOCO (ESCOPO RESTRITO): ${options.projectName}\n` : 'ESCOPO: Todo o Cérebro (Global)\n'}${activeCatLabel ? `CATEGORIA RESTRITA: ${activeCatLabel}\n` : 'CATEGORIA: Todas as Categorias\n'}
TRECHOS DOS DOCUMENTOS RECUPERADOS DO COFRE:
${contextBlocks}

INSTRUÇÕES DE SÍNTESE:
1. Responda à pergunta do desenvolvedor com base EXCLUSIVAMENTE nos trechos acima.
2. Respeite com rigor o projeto em foco e a categoria selecionada. Se os trechos não cobrirem a dúvida ou forem insuficientes, aponte essa ausência claramente sem tentar supor ou completar com informações externas.
3. Cite as fontes explicitamente com links Markdown [Nome](caminho). Se algo não estiver nos trechos, declare expressamente que não está documentado.`;

    const systemPrompt = `Você é o Oráculo de Memória e Conhecimento do AI Second Brain.
Sua missão é sintetizar respostas precisas, claras e técnicas para o desenvolvedor com base estritamente nas regras, decisões (ADRs), lições aprendidas e contratos do repositório.

DIRETRIZES INEGOCIÁVEIS (ZERO FABRICAÇÃO):
1. Baseie sua resposta EXCLUSIVAMENTE nas evidências apresentadas nos trechos. NUNCA invente fatos, regras, arquivos ou números.
2. Seja conciso e direto ao ponto. Use listas com marcadores e código quando relevante.
3. Para cada fato chave ou decisão mencionada, cite o documento de origem no formato: [Título ou Arquivo](caminho).
4. Se os trechos não contiverem a resposta, responda claramente: "Esta informação não consta na documentação atual do repositório."
5. Destaque lições aprendidas ou decisões arquiteturais prévias quando tiverem relação direta com a pergunta.`;

    const aiRes = await aiGateway.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptUser }
    ], { temperature: 0.1, maxTokens: 1800 });

    const sources = retrieved.map((r, idx) => ({
        path: r.file.path,
        title: r.file.title,
        category: r.file.category,
        icon: r.file.icon,
        score: r.score,
        snippet: r.snippet,
        isSynthesized: idx < synthesisLimit
    }));

    return {
        success: true,
        query: trimmedQuery,
        answer: aiRes.content,
        answerMarkdown: aiRes.content,
        sources,
        totalFound: retrieved.length,
        synthesizedCount: synthesisLimit,
        model: aiRes.model,
        provider: aiRes.provider,
        usage: aiRes.usage,
        latencyMs: Date.now() - startedAt
    };
}

module.exports = {
    normalizeText,
    extractKeywords,
    extractBestSnippet,
    classifyFileCategory,
    retrieveRelevantSnippets,
    askBrain
};
