/**
 * AI SECOND BRAIN — Locale Documents Manager (.locales/pt & .locales/en)
 *
 * Implements Idea #2 (JEV-First Bilingual Document Engine):
 * 1. Deterministic 0ms swap from .locales/pt and .locales/en for untouched factory files.
 * 2. Normalized SHA-256 hash comparison to detect user-customized files with zero false positives.
 * 3. Bilingual custom cache (.locales/user-custom/) so translated customizations are reused at 0 cost.
 * 4. Atomic backup (.locales/backups/<timestamp>/) before any overwrite or AI translation.
 * 5. AI Gateway translation with pre-flight configuration check and per-file exception rollback.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { buildLocalesVault } = require('./build-locales-content');

const ROOT_DIR = path.resolve(__dirname, '..');

function normalizePath(p) {
    return (p || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function normalizeContent(text) {
    return String(text || '')
        .replace(/^\uFEFF/, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
}

function hashContent(text) {
    return crypto.createHash('sha256').update(normalizeContent(text), 'utf8').digest('hex');
}

function extractTitle(content, fallbackName) {
    const fmMatch = String(content || '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fmMatch) {
        const titleMatch = fmMatch[1].match(/(?:name|title):\s*([^\r\n]+)/i);
        if (titleMatch) return titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
    }
    const h1Match = String(content || '').match(/^#\s+([^\r\n]+)/m);
    if (h1Match) return h1Match[1].trim();
    return (fallbackName || '').replace(/\.md$/i, '');
}

function getCategoryForPath(relPath) {
    const p = normalizePath(relPath).toLowerCase();
    const clean = p.startsWith('.agents/') ? p.slice('.agents/'.length) : p;
    if (clean.startsWith('rules/')) return 'rules';
    if (clean.startsWith('skills/')) return 'skills';
    if (clean.startsWith('agents/') || clean.includes('agent')) return 'agents';
    if (p.startsWith('projects/')) return 'projects';
    if (p.startsWith('knowledge/')) return 'knowledge';
    if (p.startsWith('decisions/')) return 'decisions';
    if (p.startsWith('memory/')) return 'memory';
    if (p.startsWith('templates/')) return 'templates';
    if (p.startsWith('docs/')) return 'docs';
    return 'core';
}

function ensureLocalesInitialized(rootDir = ROOT_DIR) {
    const ptDir = path.join(rootDir, '.locales', 'pt');
    const enDir = path.join(rootDir, '.locales', 'en');
    if (!fs.existsSync(ptDir) || !fs.existsSync(enDir)) {
        buildLocalesVault();
    }
}

function listTrackedRelativePaths(rootDir = ROOT_DIR) {
    ensureLocalesInitialized(rootDir);
    const ptDir = path.join(rootDir, '.locales', 'pt');
    const relPaths = [];

    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (entry.name.toLowerCase().endsWith('.md')) {
                relPaths.push(normalizePath(path.relative(ptDir, full)));
            }
        }
    }

    walk(ptDir);
    return relPaths.sort();
}

function loadCustomPairsLedger(rootDir = ROOT_DIR) {
    const ledgerPath = path.join(rootDir, '.locales', 'user-custom', '_pairs.json');
    if (fs.existsSync(ledgerPath)) {
        try {
            return JSON.parse(fs.readFileSync(ledgerPath, 'utf-8'));
        } catch (_) {}
    }
    return {};
}

function saveCustomPairsLedger(rootDir, ledger) {
    const dir = path.join(rootDir, '.locales', 'user-custom');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, '_pairs.json'), JSON.stringify(ledger, null, 2), 'utf-8');
}

/**
 * Inspects all tracked framework Markdown files and swaps untouched/cached files
 * to targetLang ('pt' | 'en'). Any manually modified file is left untouched and
 * returned in `customizedFiles` so the Cockpit can present the Protection Modal.
 */
function inspectAndSwapLanguage(rootDir = ROOT_DIR, targetLang = 'pt') {
    const lang = targetLang === 'en' ? 'en' : 'pt';
    const otherLang = lang === 'en' ? 'pt' : 'en';
    const relPaths = listTrackedRelativePaths(rootDir);
    const customLedger = loadCustomPairsLedger(rootDir);

    let swappedCount = 0;
    let alreadyTargetCount = 0;
    let customRestoredCount = 0;
    const customizedFiles = [];

    for (const relPath of relPaths) {
        const activePath = path.join(rootDir, relPath);
        const ptFactoryPath = path.join(rootDir, '.locales', 'pt', relPath);
        const enFactoryPath = path.join(rootDir, '.locales', 'en', relPath);

        const targetFactoryPath = lang === 'en' ? enFactoryPath : ptFactoryPath;
        if (!fs.existsSync(targetFactoryPath)) continue;

        const ptFactoryContent = fs.existsSync(ptFactoryPath) ? fs.readFileSync(ptFactoryPath, 'utf-8') : '';
        const enFactoryContent = fs.existsSync(enFactoryPath) ? fs.readFileSync(enFactoryPath, 'utf-8') : '';
        const targetFactoryContent = lang === 'en' ? enFactoryContent : ptFactoryContent;

        // If active file is missing on disk, restore from target factory
        if (!fs.existsSync(activePath)) {
            fs.mkdirSync(path.dirname(activePath), { recursive: true });
            fs.writeFileSync(activePath, targetFactoryContent, 'utf-8');
            swappedCount++;
            continue;
        }

        const activeContent = fs.readFileSync(activePath, 'utf-8');
        const activeHash = hashContent(activeContent);
        const ptHash = hashContent(ptFactoryContent);
        const enHash = hashContent(enFactoryContent);
        const targetHash = lang === 'en' ? enHash : ptHash;

        // 1. Already matches factory target language
        if (activeHash === targetHash) {
            alreadyTargetCount++;
            continue;
        }

        // 2. Matches factory source language (untouched by user) -> Instant deterministic swap!
        if (activeHash === ptHash || activeHash === enHash) {
            fs.writeFileSync(activePath, targetFactoryContent, 'utf-8');
            swappedCount++;
            continue;
        }

        // 3. Check if matches a previously translated user-custom pair (.locales/user-custom/)
        const pairInfo = customLedger[relPath];
        const customTargetPath = path.join(rootDir, '.locales', 'user-custom', lang, relPath);
        if (pairInfo && fs.existsSync(customTargetPath)) {
            if (activeHash === pairInfo.ptHash || activeHash === pairInfo.enHash) {
                const cachedCustomTarget = fs.readFileSync(customTargetPath, 'utf-8');
                fs.writeFileSync(activePath, cachedCustomTarget, 'utf-8');
                customRestoredCount++;
                swappedCount++;
                continue;
            }
        }

        // 4. File was manually modified by the user! Protect it and report to caller.
        const stat = fs.statSync(activePath);
        customizedFiles.push({
            path: relPath,
            name: path.basename(relPath),
            title: extractTitle(activeContent, path.basename(relPath)),
            category: getCategoryForPath(relPath),
            size: stat.size,
            sizeKb: (stat.size / 1024).toFixed(1),
            mtime: stat.mtimeMs
        });
    }

    return {
        targetLang: lang,
        sourceLang: otherLang,
        totalTracked: relPaths.length,
        swappedCount,
        alreadyTargetCount,
        customRestoredCount,
        customizedFiles
    };
}

function createBackupForFiles(rootDir, relPaths, reason = 'lang-switch') {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(rootDir, '.locales', 'backups', `${stamp}_${reason}`);
    const backedUp = [];

    for (const rel of relPaths) {
        const cleanRel = normalizePath(rel);
        const activePath = path.join(rootDir, cleanRel);
        if (fs.existsSync(activePath)) {
            const destPath = path.join(backupDir, cleanRel);
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(activePath, destPath);
            backedUp.push(cleanRel);
        }
    }

    return { backupDir: normalizePath(path.relative(rootDir, backupDir)), backedUp };
}

/**
 * Resolves customized files according to the user's decision in the Protection Modal:
 * - 'keep': Keep user's custom files intact
 * - 'overwrite': Backup custom files and replace with factory targetLang version
 * - 'translate': Backup custom files, translate via AI Gateway, cache pair, and write to disk
 */
async function resolveCustomizedFiles(rootDir = ROOT_DIR, options = {}) {
    const targetLang = options.targetLang === 'en' ? 'en' : 'pt';
    const sourceLang = targetLang === 'en' ? 'pt' : 'en';
    const action = options.action || 'keep'; // 'keep' | 'overwrite' | 'translate'
    const files = Array.isArray(options.files) ? options.files.map(normalizePath).filter(Boolean) : [];
    const aiGateway = options.aiGateway || null;
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : () => {};

    if (files.length === 0 || action === 'keep') {
        return {
            success: true,
            action: 'keep',
            targetLang,
            keptCount: files.length,
            overwrittenCount: 0,
            translated: [],
            failed: []
        };
    }

    if (action === 'overwrite') {
        const { backupDir, backedUp } = createBackupForFiles(rootDir, files, `factory-restore-${targetLang}`);
        let overwrittenCount = 0;

        for (const relPath of files) {
            const factoryPath = path.join(rootDir, '.locales', targetLang, relPath);
            const activePath = path.join(rootDir, relPath);
            if (fs.existsSync(factoryPath)) {
                fs.mkdirSync(path.dirname(activePath), { recursive: true });
                fs.copyFileSync(factoryPath, activePath);
                overwrittenCount++;
            }
        }

        return {
            success: true,
            action: 'overwrite',
            targetLang,
            overwrittenCount,
            backupDir,
            backedUp
        };
    }

    if (action === 'translate') {
        if (!aiGateway) {
            const err = new Error('AI Gateway module is not available.');
            err.errorCode = 'AI_NOT_CONFIGURED';
            throw err;
        }

        const aiConfig = aiGateway.getConfig();
        if (!aiConfig || !aiConfig.configured) {
            const err = new Error(
                targetLang === 'en'
                    ? 'AI Gateway is not configured. Please add your API Key in the AI Gateway modal before translating custom documents.'
                    : 'O AI Gateway não está configurado. Adicione sua API Key no modal de Configuração de IA antes de traduzir documentos customizados.'
            );
            err.errorCode = 'AI_NOT_CONFIGURED';
            err.statusCode = 400;
            throw err;
        }

        const { backupDir } = createBackupForFiles(rootDir, files, `ai-translate-to-${targetLang}`);
        const customLedger = loadCustomPairsLedger(rootDir);
        const translated = [];
        const failed = [];

        const targetLangLabel = targetLang === 'en' ? 'English (US)' : 'Brazilian Portuguese (pt-BR)';

        for (let i = 0; i < files.length; i++) {
            const relPath = files[i];
            const activePath = path.join(rootDir, relPath);
            if (!fs.existsSync(activePath)) continue;

            const originalContent = fs.readFileSync(activePath, 'utf-8');
            onProgress({
                step: 'translating',
                current: i + 1,
                total: files.length,
                file: relPath,
                percent: Math.round(((i) / files.length) * 100)
            });

            try {
                const systemPrompt = [
                    `You are an elite technical translator for the AI Second Brain software architecture platform.`,
                    `Translate the user's customized Markdown document into ${targetLangLabel}.`,
                    `STRICT RULES (ZERO VIOLATION):`,
                    `1. Preserve 100% of Markdown formatting, headings (#, ##, ###), tables, blockquotes, and lists.`,
                    `2. Preserve all relative file paths and URLs inside links [label](target_path) and [[wikilinks]] EXACTLY as they are. You may translate the [label], but NEVER alter (target_path).`,
                    `3. Preserve all code blocks (\`\`\`...\`\`\`) and inline code identifiers (\`...\`).`,
                    `4. If the file starts with YAML frontmatter (--- ... ---), keep the 'name:' field 100% unchanged and translate only the 'description:' text.`,
                    `5. Output ONLY the raw translated Markdown document without wrapping it in outer markdown fences or adding commentary.`
                ].join('\n');

                const result = await aiGateway.callChatCompletion([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: originalContent }
                ], {
                    temperature: 0.2,
                    maxTokens: 4096,
                    skipCache: false
                });

                let translatedMd = String(result.content || '').trim();
                // Strip accidental outer ```markdown ... ``` wrapper if model added it
                if (/^```(?:markdown|md)?\r?\n[\s\S]*\r?\n```$/i.test(translatedMd)) {
                    translatedMd = translatedMd.replace(/^```(?:markdown|md)?\r?\n/i, '').replace(/\r?\n```$/i, '').trim();
                }

                if (!translatedMd || translatedMd.length < Math.min(20, originalContent.length * 0.25)) {
                    throw new Error(targetLang === 'en'
                        ? 'AI returned an empty or truncated translation. Original file preserved.'
                        : 'A IA retornou uma tradução vazia ou truncada. Arquivo original preservado.');
                }

                // Save both source and translated versions in .locales/user-custom/
                const customSourcePath = path.join(rootDir, '.locales', 'user-custom', sourceLang, relPath);
                const customTargetPath = path.join(rootDir, '.locales', 'user-custom', targetLang, relPath);
                fs.mkdirSync(path.dirname(customSourcePath), { recursive: true });
                fs.mkdirSync(path.dirname(customTargetPath), { recursive: true });
                fs.writeFileSync(customSourcePath, originalContent, 'utf-8');
                fs.writeFileSync(customTargetPath, translatedMd + '\n', 'utf-8');

                // Update active file on disk
                fs.writeFileSync(activePath, translatedMd + '\n', 'utf-8');

                // Record pair hashes so future toggles between PT and EN are 0ms and free
                customLedger[relPath] = {
                    ptHash: targetLang === 'pt' ? hashContent(translatedMd) : hashContent(originalContent),
                    enHash: targetLang === 'en' ? hashContent(translatedMd) : hashContent(originalContent),
                    updatedAt: new Date().toISOString()
                };
                saveCustomPairsLedger(rootDir, customLedger);

                translated.push({
                    file: relPath,
                    model: result.model,
                    tokens: (result.usage && result.usage.total_tokens) || 0
                });

                onProgress({
                    step: 'file-completed',
                    current: i + 1,
                    total: files.length,
                    file: relPath,
                    percent: Math.round(((i + 1) / files.length) * 100)
                });
            } catch (err) {
                // Rollback safety: ensure original file on disk is untouched
                try {
                    fs.writeFileSync(activePath, originalContent, 'utf-8');
                } catch (_) {}

                failed.push({
                    file: relPath,
                    error: err.message,
                    statusCode: err.statusCode || 500,
                    quotaExceeded: !!err.quotaExceeded || err.statusCode === 429,
                    isRateLimit: !!err.isRateLimit || err.statusCode === 429,
                    providerName: err.providerName || aiConfig.providerName || null
                });

                onProgress({
                    step: 'file-failed',
                    current: i + 1,
                    total: files.length,
                    file: relPath,
                    error: err.message,
                    percent: Math.round(((i + 1) / files.length) * 100)
                });
            }
        }

        return {
            success: failed.length === 0,
            action: 'translate',
            targetLang,
            backupDir,
            translated,
            failed
        };
    }

    throw new Error(`Unsupported action: ${action}`);
}

/**
 * Generates docs/brain-ui/vault-locales-en.js so that even in Online Demo / Snapshot mode
 * (GitHub Pages / Vercel), switching to EN or PT swaps the 58 framework documents in memory.
 */
function generateDemoLocalesBundle(rootDir = ROOT_DIR) {
    ensureLocalesInitialized(rootDir);
    const relPaths = listTrackedRelativePaths(rootDir);
    const bundle = { pt: {}, en: {} };

    for (const relPath of relPaths) {
        const ptPath = path.join(rootDir, '.locales', 'pt', relPath);
        const enPath = path.join(rootDir, '.locales', 'en', relPath);
        if (fs.existsSync(ptPath)) {
            const content = fs.readFileSync(ptPath, 'utf-8');
            bundle.pt[relPath] = {
                title: extractTitle(content, path.basename(relPath)),
                content
            };
        }
        if (fs.existsSync(enPath)) {
            const content = fs.readFileSync(enPath, 'utf-8');
            bundle.en[relPath] = {
                title: extractTitle(content, path.basename(relPath)),
                content
            };
        }
    }

    const outPath = path.join(rootDir, 'docs', 'brain-ui', 'vault-locales.js');
    const js = `// ═══════════════════════════════════════════════════\n// AI SECOND BRAIN — Bilingual Factory Vault Snapshot (.locales/pt & .locales/en)\n// Auto-generated for instant Offline / Demo document switching\n// ═══════════════════════════════════════════════════\nwindow.VAULT_LOCALES = ${JSON.stringify(bundle)};\n`;
    fs.writeFileSync(outPath, js, 'utf-8');
    return outPath;
}

module.exports = {
    ensureLocalesInitialized,
    listTrackedRelativePaths,
    inspectAndSwapLanguage,
    resolveCustomizedFiles,
    generateDemoLocalesBundle,
    hashContent,
    normalizeContent
};

