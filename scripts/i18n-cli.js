/**
 * AI SECOND BRAIN — Motor Bilingue de CLI & Backend (PT / EN)
 * 
 * Hierarquia de Detecção de Idioma:
 *   1. Variável de ambiente / Flag CLI (--lang=en|pt ou BRAIN_LANG=en|pt)
 *   2. Preferência persistida em brain.config.json ("language": "pt" | "en")
 *   3. Detecção automática nativa do Sistema Operacional (Intl / LANG)
 *   4. Fallback Global: Inglês ('en') para máquinas fora de regiões lusófonas
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT_DIR, 'brain.config.json');

function detectSystemLang() {
    try {
        const envLang = process.env.BRAIN_LANG || process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || '';
        if (envLang) {
            return envLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
        }
        const sysLocale = Intl.DateTimeFormat().resolvedOptions().locale || 'en';
        return sysLocale.toLowerCase().startsWith('pt') ? 'pt' : 'en';
    } catch (_) {
        return 'en';
    }
}

function getCliFlagLang() {
    for (const arg of process.argv.slice(2)) {
        if (arg === '--en' || arg === '--lang=en') return 'en';
        if (arg === '--pt' || arg === '--lang=pt') return 'pt';
    }
    if (process.env.BRAIN_LANG) {
        const b = process.env.BRAIN_LANG.toLowerCase().trim();
        if (b.startsWith('en')) return 'en';
        if (b.startsWith('pt')) return 'pt';
    }
    return null;
}

function readConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        }
    } catch (_) {}
    return {};
}

function getLang() {
    const flag = getCliFlagLang();
    if (flag) return flag;

    const cfg = readConfig();
    if (cfg.language === 'en' || cfg.language === 'pt') {
        return cfg.language;
    }

    return detectSystemLang();
}

function isEn() {
    return getLang() === 'en';
}

function tr(ptText, enText) {
    return isEn() ? enText : ptText;
}

function setLang(lang) {
    const current = readConfig();
    if (lang === 'auto' || lang === null) {
        delete current.language;
    } else {
        current.language = lang === 'en' ? 'en' : 'pt';
    }
    current.updatedAt = new Date().toISOString();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(current, null, 2), 'utf-8');
    return current;
}

if (require.main === module) {
    const cmd = (process.argv[2] || '').toLowerCase();
    const { inspectAndSwapLanguage } = require('./locale-docs-manager');

    if (cmd === 'en' || cmd === 'set-en') {
        setLang('en');
        console.log('\n🌐 Language set to: English (EN)');
        try {
            const swap = inspectAndSwapLanguage(ROOT_DIR, 'en');
            console.log(`   ⚡ Swapped ${swap.swappedCount} framework documents to English in <30ms.`);
            if (swap.customizedCount > 0) {
                console.log(`   🛡️ ${swap.customizedCount} customized file(s) kept intact to protect your work.`);
            }
        } catch (e) {
            console.warn('   ⚠️ Document swap warning:', e.message);
        }
        console.log('   All CLI commands and Cockpit UI will now default to English.\n');
    } else if (cmd === 'pt' || cmd === 'set-pt') {
        setLang('pt');
        console.log('\n🌐 Idioma definido para: Português (PT)');
        try {
            const swap = inspectAndSwapLanguage(ROOT_DIR, 'pt');
            console.log(`   ⚡ ${swap.swappedCount} documentos do framework sincronizados em Português (<30ms).`);
            if (swap.customizedCount > 0) {
                console.log(`   🛡️ ${swap.customizedCount} arquivo(s) customizado(s) mantido(s) intacto(s) para sua segurança.`);
            }
        } catch (e) {
            console.warn('   ⚠️ Aviso na sincronização de documentos:', e.message);
        }
        console.log('   Todos os comandos do terminal e o Cockpit agora usarão Português.\n');
    } else if (cmd === 'auto') {
        setLang('auto');
        const sys = detectSystemLang();
        console.log(sys === 'en'
            ? `\n🌐 Automatic OS language detection enabled (Detected: EN).\n`
            : `\n🌐 Detecção automática do sistema ativada (Detectado: PT).\n`
        );
    } else {
        const active = getLang();
        const sys = detectSystemLang();
        console.log(active === 'en'
            ? `\n🌐 Active Language: EN (System Locale: ${sys.toUpperCase()})\n   Use "npm run lang:pt" or "npm run lang:en" to switch.\n`
            : `\n🌐 Idioma Ativo: PT (Sistema Operacional: ${sys.toUpperCase()})\n   Use "npm run lang:en" ou "npm run lang:pt" para alternar.\n`
        );
    }
}

module.exports = {
    detectSystemLang,
    getLang,
    isEn,
    tr,
    setLang
};

