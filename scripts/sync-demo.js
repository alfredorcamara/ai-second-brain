const fs = require('fs');
const path = require('path');
const { tr } = require('./i18n-cli');
const { generateDemoLocalesBundle } = require('./locale-docs-manager');

const ROOT_DIR = path.resolve(__dirname, '..');
const COCKPIT_DIR = path.join(ROOT_DIR, 'docs', 'brain-ui');

function findSiteDemoDir() {
    const candidates = [
        path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN-SITE', 'demo'),
        path.resolve(ROOT_DIR, '..', 'ai-second-brain-site', 'demo'),
        path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN_SITE', 'demo')
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function syncDemo() {
    const siteDemoDir = findSiteDemoDir();
    if (!siteDemoDir) {
        console.log(tr(
            'Aviso: Pasta da Demo do site público não encontrada.',
            'Warning: Public site Demo folder not found.'
        ));
        console.log(tr(
            'Verifique se AI_SECOND_BRAIN-SITE está na mesma pasta mãe.',
            'Ensure AI_SECOND_BRAIN-SITE is in the same parent folder.'
        ));
        return false;
    }

    console.log(tr(
        'Sincronizando Cockpit direto para a Demo pública...',
        'Synchronizing Cockpit directly to public Demo...'
    ));

    try {
        generateDemoLocalesBundle(ROOT_DIR);
    } catch (err) {
        console.warn('[sync-demo] vault-locales.js generation warning:', err.message);
    }

    const coreFiles = [
        'app.js',
        'style.css',
        'cockpit-i18n.js',
        'vault.js',
        'vault-locales.js',
        'neuron-graph.js',
        'OrbitControls.js',
        'three.min.js',
        'marked.min.js',
        'graph-hierarchy.js'
    ];

    let syncedCount = 0;
    for (const f of coreFiles) {
        const src = path.join(COCKPIT_DIR, f);
        const dest = path.join(siteDemoDir, f);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            syncedCount++;
        }
    }

    const diagramsSrc = path.join(COCKPIT_DIR, 'assets', 'diagrams');
    const demoDiagramsDest = path.join(siteDemoDir, 'assets', 'diagrams');
    const siteDiagramsDest = path.resolve(siteDemoDir, '..', 'assets', 'diagrams');

    if (fs.existsSync(diagramsSrc)) {
        copyDir(diagramsSrc, demoDiagramsDest);
        copyDir(diagramsSrc, siteDiagramsDest);
        console.log(tr(
            'Diagramas arquiteturais sincronizados com Demo e Landing.',
            'Architectural diagrams synchronized with Demo and Landing.'
        ));
    }

    console.log(tr(
        `${syncedCount} arquivos visuais do Cockpit replicados para a Demo.`,
        `${syncedCount} visual Cockpit files replicated to Demo.`
    ));
    console.log(tr(
        'vault-data.js e demo-mode.js preservados (projetos privados protegidos).',
        'vault-data.js and demo-mode.js preserved (private projects protected).'
    ));
    return true;
}

if (require.main === module) {
    syncDemo();
}

module.exports = { syncDemo };
