/**
 * AI SECOND BRAIN — SYNC DEMO AUTOMATION
 * 
 * Sincroniza o código visual do Cockpit (App Core, CSS e Assets) com o repositório
 * da Landing Page pública (AI_SECOND_BRAIN-SITE/demo).
 * 
 * IMPORTANTE: Preserva estritamente o `vault-data.js` do ambiente de demonstração
 * para garantir que projetos privados do desenvolvedor NUNCA vazem para o site público.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const COCKPIT_DIR = path.join(ROOT_DIR, 'docs', 'brain-ui');
function findSiteDemoDir() {
    const candidates = [
        path.resolve(ROOT_DIR, '..', 'ai-second-brain-site', 'demo'),
        path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN-SITE', 'demo'),
        path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN_CENTRAL', 'ai-second-brain-site', 'demo')
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

function syncDemo() {
    const siteDemoDir = findSiteDemoDir();
    if (!siteDemoDir) {
        console.log(`⚠️  Pasta da Demo do site público não encontrada.`);
        console.log(`   Verifique se ai-second-brain-site está na mesma pasta mãe.`);
        return false;
    }

    console.log(`🔄 Sincronizando Cockpit para Demo pública...`);

    const filesToSync = [
        { src: path.join(COCKPIT_DIR, 'demo', 'app.js'), dest: path.join(siteDemoDir, 'app.js') },
        { src: path.join(COCKPIT_DIR, 'demo', 'index.html'), dest: path.join(siteDemoDir, 'index.html') },
        { src: path.join(COCKPIT_DIR, 'demo', 'style.css'), dest: path.join(siteDemoDir, 'style.css') },
        { src: path.join(COCKPIT_DIR, 'demo', 'demo-mode.js'), dest: path.join(siteDemoDir, 'demo-mode.js') },
        { src: path.join(COCKPIT_DIR, 'demo', 'neuron-graph.js'), dest: path.join(siteDemoDir, 'neuron-graph.js') }
    ];

    let syncedCount = 0;
    for (const f of filesToSync) {
        if (fs.existsSync(f.src)) {
            fs.copyFileSync(f.src, f.dest);
            syncedCount++;
        }
    }

    console.log(`✓ ${syncedCount} arquivos da Demo sincronizados com sucesso.`);
    console.log(`🔒 vault-data.js preservado (dados privados protegidos).`);
    return true;
}

if (require.main === module) {
    syncDemo();
}

module.exports = { syncDemo };
