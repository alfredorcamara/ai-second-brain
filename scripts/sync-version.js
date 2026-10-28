/**
 * AI SECOND BRAIN — Version Synchronizer (Single Source of Truth)
 * 
 * Regra Arquitetural: O package.json é a ÚNICA fonte da verdade (SSOT).
 * 
 * O Cockpit Visual e o Demo carregam a versão dinamicamente via JavaScript 
 * (/api/system/version no backend Node ou localStorage / demo mock no GitHub Pages).
 * 
 * Este script sincroniza apenas:
 * 1. package.json (se um novo argumento de versão for fornecido)
 * 2. Landing page estática (AI_SECOND_BRAIN-SITE/index.html - pill de release e links)
 * 3. Dicionário de idiomas da landing (AI_SECOND_BRAIN-SITE/js/i18n.dict.js)
 * 4. Mock estático do demo no GitHub Pages (AI_SECOND_BRAIN-SITE/demo/demo-mode.js)
 * 5. Garante que os HTMLs do Cockpit e Demo permaneçam 100% dinâmicos (sem versão hardcoded)
 * 
 * Uso:
 *   npm run version:sync          -> Sincroniza usando a versão atual do package.json
 *   node scripts/sync-version.js 1.4.3 -> Bump no package.json e propaga para artefatos estáticos
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function findSiteDir() {
    const candidates = [
        path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN-SITE'),
        path.resolve(ROOT_DIR, '..', 'ai-second-brain-site'),
        path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN_SITE')
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

function syncVersion(newVersionArg) {
    const pkgPath = path.join(ROOT_DIR, 'package.json');
    if (!fs.existsSync(pkgPath)) {
        console.error('❌ Erro: package.json não encontrado.');
        return false;
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    let targetVersion = newVersionArg || pkg.version;

    if (!targetVersion) {
        console.error('❌ Erro: Nenhuma versão definida no package.json e nenhum argumento fornecido.');
        return false;
    }

    // Normaliza (remove 'v' inicial se o usuário digitou v1.4.0)
    targetVersion = targetVersion.replace(/^v/i, '').trim();

    console.log(`\n🔄 Sincronizando AI Second Brain (SSOT: package.json v${targetVersion})\n`);

    let modifiedCount = 0;

    // 1. Atualiza package.json se foi passado novo argumento
    if (newVersionArg && pkg.version !== targetVersion) {
        pkg.version = targetVersion;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
        console.log(`   ✓ package.json atualizado para v${targetVersion}`);
        modifiedCount++;
    }

    // Helper para substituir em arquivo
    function updateFile(fullPath, label, transformFn) {
        if (!fs.existsSync(fullPath)) return;
        const original = fs.readFileSync(fullPath, 'utf-8');
        const updated = transformFn(original);
        if (original !== updated) {
            fs.writeFileSync(fullPath, updated, 'utf-8');
            console.log(`   ✓ ${label} sincronizado`);
            modifiedCount++;
        } else {
            console.log(`   - ${label} em conformidade`);
        }
    }

    // 2. Garante que Cockpit e Demo permaneçam 100% dinâmicos (sem versão hardcoded nos spans)
    const cleanDynamicHtml = (c) => {
        let res = c;
        res = res.replace(/(<span id="bootVersionText">)v?[\d\.]*(<\/span>)/g, '$1$2');
        res = res.replace(/(<span class="version-text" id="sidebarVersionText">)v?[\d\.]*(<\/span>)/g, '$1$2');
        res = res.replace(/title="AI Second Brain v[\d\.]+( • Ver Novidades e Histórico")/g, 'title="AI Second Brain$1');
        res = res.replace(/(<span class="top-version-tag" id="topVersionTag">)v?[\d\.]*(<\/span>)/g, '$1$2');
        res = res.replace(/(<span class="changelog-version-tag" id="changelogModalVersionTag">)v?[\d\.]*(<\/span>)/g, '$1$2');
        return res;
    };

    updateFile(path.join(ROOT_DIR, 'docs', 'brain-ui', 'index.html'), 'Cockpit HTML (docs/brain-ui/index.html)', cleanDynamicHtml);

    const siteDir = findSiteDir();
    if (siteDir) {
        // 3. Demo HTML público: garante spans dinâmicos
        updateFile(path.join(siteDir, 'demo', 'index.html'), 'Demo HTML (demo/index.html)', cleanDynamicHtml);

        // 4. Demo Mode JS: mock do endpoint /api/system/version para GitHub Pages
        updateFile(path.join(siteDir, 'demo', 'demo-mode.js'), 'Demo Mode JS (demo/demo-mode.js)', (c) => {
            return c.replace(/(if \(u\.startsWith\('\/api\/system\/version'\)\)[\s\S]*?version:\s*')[\d\.]*(')/, `$1${targetVersion}$2`);
        });

        // 5. Landing Page estática: links de release e badge no hero
        updateFile(path.join(siteDir, 'index.html'), 'Landing Page (index.html)', (c) => {
            let res = c;
            res = res.replace(/(\/releases\/tag\/v)[\d\.]+/g, `$1${targetVersion}`);
            res = res.replace(/(title="Ver Release Oficial v)[\d\.]+( no GitHub")/g, `$1${targetVersion}$2`);
            res = res.replace(/(<strong>v)[\d\.]+( Oficial<\/strong>)/g, `$1${targetVersion}$2`);
            res = res.replace(/(versão oficial <code>v)[\d\.]+(<\/code>)/g, `$1${targetVersion}$2`);
            return res;
        });

        // 6. Dicionário de Idiomas
        updateFile(path.join(siteDir, 'js', 'i18n.dict.js'), 'i18n Dictionary (js/i18n.dict.js)', (c) => {
            let res = c;
            res = res.replace(/"v[\d\.]+ Oficial":\s*"Official v[\d\.]+"/g, `"v${targetVersion} Oficial": "Official v${targetVersion}"`);
            res = res.replace(/"Ver Release Oficial v[\d\.]+ no GitHub":\s*"View Official v[\d\.]+ Release on GitHub"/g, `"Ver Release Oficial v${targetVersion} no GitHub": "View Official v${targetVersion} Release on GitHub"`);
            return res;
        });

        // 7. Sincroniza arquivos visuais do Cockpit para o Demo
        try {
            const { syncDemo } = require('./sync-demo');
            syncDemo();
        } catch (_) {}
    }

    console.log(`\n🎉 SUCESSO! ${modifiedCount} atualização(ões) realizadas. Versão ativa: v${targetVersion}.\n`);
    return true;
}

// Execução direta via CLI
if (require.main === module) {
    const arg = process.argv[2];
    syncVersion(arg);
}

module.exports = { syncVersion };
