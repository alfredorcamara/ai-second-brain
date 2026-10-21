/**
 * AI SECOND BRAIN — Version Synchronizer
 * 
 * Sincroniza a versão do package.json em todas as interfaces estáticas e scripts:
 * 1. docs/brain-ui/landing/index.html (Pill do topo, links de release e FAQ)
 * 2. docs/brain-ui/index.html (Boot screen, sidebar, topbar e changelog modal)
 * 3. docs/brain-ui/demo/index.html (Modo demo idêntico com 100% de paridade)
 * 4. docs/brain-ui/app.js e demo/app.js (Fallbacks de emergência e inicialização)
 * 5. docs/brain-ui/landing/js/i18n.dict.js (Chaves do dicionário de idiomas)
 * 
 * Uso:
 *   node scripts/sync-version.js          -> Sincroniza usando a versão atual do package.json
 *   node scripts/sync-version.js 1.4.0    -> Atualiza o package.json e propaga para todos os arquivos
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

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

    console.log(`\n🔄 Sincronizando AI Second Brain para a versão: v${targetVersion}\n`);

    let modifiedCount = 0;

    // 1. Atualiza package.json se foi passado novo argumento
    if (newVersionArg && pkg.version !== targetVersion) {
        pkg.version = targetVersion;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
        console.log(`   ✓ package.json atualizado para v${targetVersion}`);
        modifiedCount++;
    }

    // Helper para substituir em arquivo
    function updateFile(relPath, transformFn) {
        const fullPath = path.join(ROOT_DIR, relPath);
        if (!fs.existsSync(fullPath)) return;
        const original = fs.readFileSync(fullPath, 'utf-8');
        const updated = transformFn(original);
        if (original !== updated) {
            fs.writeFileSync(fullPath, updated, 'utf-8');
            console.log(`   ✓ ${relPath} sincronizado`);
            modifiedCount++;
        } else {
            console.log(`   - ${relPath} já estava em conformidade`);
        }
    }

    // 2. Landing Page: docs/brain-ui/landing/index.html
    updateFile('docs/brain-ui/landing/index.html', (c) => {
        let res = c;
        res = res.replace(/(\/releases\/tag\/v)[\d\.]+/g, `$1${targetVersion}`);
        res = res.replace(/(title="Ver Release Oficial v)[\d\.]+( no GitHub")/g, `$1${targetVersion}$2`);
        res = res.replace(/(<strong>v)[\d\.]+( Oficial<\/strong>)/g, `$1${targetVersion}$2`);
        res = res.replace(/(versão oficial <code>v)[\d\.]+(<\/code>)/g, `$1${targetVersion}$2`);
        return res;
    });

    // 3. Cockpit Local: docs/brain-ui/index.html
    const updateIndexHtml = (c) => {
        let res = c;
        res = res.replace(/(<span id="bootVersionText">v)[\d\.]+(<\/span>)/g, `$1${targetVersion}$2`);
        res = res.replace(/(<span class="version-text" id="sidebarVersionText">v)[\d\.]+(<\/span>)/g, `$1${targetVersion}$2`);
        res = res.replace(/(title="AI Second Brain v)[\d\.]+( • Ver Novidades e Histórico")/g, `$1${targetVersion}$2`);
        res = res.replace(/(<span class="top-version-tag" id="topVersionTag">v)[\d\.]+(<\/span>)/g, `$1${targetVersion}$2`);
        res = res.replace(/(<span class="changelog-version-tag" id="changelogModalVersionTag">v)[\d\.]+(<\/span>)/g, `$1${targetVersion}$2`);
        return res;
    };
    updateFile('docs/brain-ui/index.html', updateIndexHtml);

    // 4. Cockpit Demo: docs/brain-ui/demo/index.html
    updateFile('docs/brain-ui/demo/index.html', updateIndexHtml);

    // 5. App Core: docs/brain-ui/app.js & demo/app.js
    const updateAppJs = (c) => {
        let res = c;
        res = res.replace(/(version:\s*')[\d\.]+(')/g, `$1${targetVersion}$2`);
        res = res.replace(/(const ver = data\?\.version \|\| data\?\.installedVersion \|\| ')[\d\.]+(';)/g, `$1${targetVersion}$2`);
        return res;
    };
    updateFile('docs/brain-ui/app.js', updateAppJs);
    updateFile('docs/brain-ui/demo/app.js', updateAppJs);

    // 6. Dicionário de Idiomas: docs/brain-ui/landing/js/i18n.dict.js
    updateFile('docs/brain-ui/landing/js/i18n.dict.js', (c) => {
        let res = c;
        res = res.replace(/"v[\d\.]+ Oficial":\s*"Official v[\d\.]+"/g, `"v${targetVersion} Oficial": "Official v${targetVersion}"`);
        res = res.replace(/"Ver Release Oficial v[\d\.]+ no GitHub":\s*"View Official v[\d\.]+ Release on GitHub"/g, `"Ver Release Oficial v${targetVersion} no GitHub": "View Official v${targetVersion} Release on GitHub"`);
        return res;
    });

    console.log(`\n🎉 SUCESSO! ${modifiedCount} arquivo(s) atualizados com v${targetVersion}.\n`);
    return true;
}

// Execução direta via CLI
if (require.main === module) {
    const arg = process.argv[2];
    syncVersion(arg);
}

module.exports = { syncVersion };
