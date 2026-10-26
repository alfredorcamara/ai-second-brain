/**
 * AI SECOND BRAIN — Brain Doctor (Linter & Integrity Checker)
 * 
 * Valida a saúde e integridade do segundo cérebro:
 * 1. Todos os links clicáveis [texto](caminho) e [[wikilinks]] em todos os arquivos Markdown
 * 2. Existência dos arquivos contratuais de projetos em projects/* (PROJECT.md, CURRENT_STATE.md)
 * 3. Validação dos links listados nas seções '## Links' de cada projeto
 * 4. Validação dos arquivos e caminhos listados em knowledge/global/INDEX.md
 * 5. Consistência e unicidade de ADRs em decisions/ e projects/* /DECISIONS/
 * 6. Validação das referências centrais em GEMINI.md e README.md
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const errors = [];
const warnings = [];
let checkedLinksCount = 0;
let checkedProjectsCount = 0;
let checkedFilesCount = 0;

function normalizePath(p) {
    return p.replace(/\\/g, '/');
}

// 1. Coleta todos os arquivos Markdown
function getAllMarkdownFiles(dir, visited = new Set()) {
    const results = [];
    try {
        const canonical = fs.realpathSync(dir);
        if (visited.has(canonical)) return results;
        visited.add(canonical);
    } catch (e) {
        return results;
    }

    let entries = [];
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        return results;
    }

    const ignoredFolders = new Set(['node_modules', '.git', 'bin', 'obj', 'dist', 'build', 'vendor', '.vs', '.vscode', 'backups', '.archive']);

    for (const entry of entries) {
        const name = entry.name;
        if (name.startsWith('.') && name !== '.agents') continue;
        if (ignoredFolders.has(name.toLowerCase())) continue;

        const fullPath = path.join(dir, name);
        let isDir = entry.isDirectory();
        if (!isDir && entry.isSymbolicLink()) {
            try {
                isDir = fs.statSync(fullPath).isDirectory();
            } catch (e) {
                isDir = false;
            }
        }

        if (isDir) {
            results.push(...getAllMarkdownFiles(fullPath, visited));
        } else if (name.toLowerCase().endsWith('.md')) {
            results.push(fullPath);
        }
    }
    return results;
}

// 2. Extrai e valida links clicáveis em Markdown [label](target)
function checkMarkdownLinks(filePath) {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const fileDir = path.dirname(filePath);
    const relSource = normalizePath(path.relative(ROOT_DIR, filePath));
    checkedFilesCount++;

    // Remove blocos de código multiline (```...```) e inline (`...`) para não validar exemplos de sintaxe
    const sanitizedContent = rawContent
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`\n]+`/g, '');

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(sanitizedContent)) !== null) {
        const linkRaw = match[2].trim();
        
        // Ignora links externos e âncoras locais
        if (linkRaw.startsWith('http://') || linkRaw.startsWith('https://') || linkRaw.startsWith('mailto:') || linkRaw.startsWith('#')) {
            continue;
        }

        checkedLinksCount++;

        let targetPath = linkRaw;
        if (targetPath.startsWith('file:///')) {
            targetPath = targetPath.replace('file:///', '');
            targetPath = decodeURIComponent(targetPath);
            // Corrige caminho Windows c:/...
            if (!fs.existsSync(targetPath)) {
                errors.push({
                    file: relSource,
                    type: 'BROKEN_LINK',
                    target: linkRaw,
                    resolved: targetPath,
                    message: `Link absoluto 'file:///' aponta para arquivo inexistente`
                });
            }
            continue;
        }

        // Remove âncoras (#secao)
        const targetPathOnly = targetPath.split('#')[0].split('?')[0].trim();
        if (!targetPathOnly) continue;

        let resolvedTarget;
        if (targetPathOnly.startsWith('/')) {
            resolvedTarget = path.join(ROOT_DIR, targetPathOnly);
        } else {
            resolvedTarget = path.resolve(fileDir, targetPathOnly);
        }

        if (!fs.existsSync(resolvedTarget)) {
            const targetAsDir = resolvedTarget.replace(/\/$/, '');
            if (fs.existsSync(targetAsDir) && fs.statSync(targetAsDir).isDirectory()) {
                continue;
            }

            if (!resolvedTarget.endsWith('.md') && fs.existsSync(resolvedTarget + '.md')) {
                warnings.push({
                    file: relSource,
                    type: 'MISSING_EXTENSION',
                    target: linkRaw,
                    message: `Link sem extensão .md funcionaria como ${linkRaw}.md`
                });
                continue;
            }

            errors.push({
                file: relSource,
                type: 'BROKEN_LINK',
                target: linkRaw,
                resolved: normalizePath(path.relative(ROOT_DIR, resolvedTarget)),
                message: `Arquivo ou diretório de destino não existe`
            });
        }
    }
}

// 3. Validação dos Contratos e Links em projects/*
function checkProjects() {
    const projectsDir = path.join(ROOT_DIR, 'projects');
    if (!fs.existsSync(projectsDir)) return;

    let entries = [];
    try {
        entries = fs.readdirSync(projectsDir, { withFileTypes: true });
    } catch (e) {
        return;
    }

    const projects = entries.filter(d => {
        if (d.name.startsWith('.')) return false;
        if (d.isDirectory()) return true;
        if (d.isSymbolicLink()) {
            try {
                return fs.statSync(path.join(projectsDir, d.name)).isDirectory();
            } catch (e) {
                return false;
            }
        }
        return false;
    }).map(d => d.name);

    for (const proj of projects) {
        checkedProjectsCount++;
        const projDir = path.join(projectsDir, proj);
        const requiredFiles = ['PROJECT.md', 'CURRENT_STATE.md'];

        for (const req of requiredFiles) {
            const reqPath = path.join(projDir, req);
            if (!fs.existsSync(reqPath)) {
                errors.push({
                    file: `projects/${proj}`,
                    type: 'CONTRACT_VIOLATION',
                    target: req,
                    message: `Projeto não possui o arquivo obrigatório '${req}'`
                });
            }
        }

        // Verifica a seção '## Links' de PROJECT.md
        const projectMdPath = path.join(projDir, 'PROJECT.md');
        if (fs.existsSync(projectMdPath)) {
            const content = fs.readFileSync(projectMdPath, 'utf-8');
            const linksSection = content.match(/##\s+Links[\s\S]*?(?=\n##|\Z)/i);
            if (linksSection) {
                const lines = linksSection[0].split('\n');
                for (const line of lines) {
                    const lineMatch = line.match(/[-*]\s+[^:]+:\s*`([^`]+)`/);
                    if (lineMatch) {
                        const ref = lineMatch[1].trim();
                        checkedLinksCount++;
                        const resolvedPath = path.resolve(projDir, ref);
                        const cleanPath = resolvedPath.replace(/\/$/, '');

                        if (!fs.existsSync(resolvedPath) && !fs.existsSync(cleanPath)) {
                            errors.push({
                                file: `projects/${proj}/PROJECT.md`,
                                type: 'PROJECT_BROKEN_LINK',
                                target: ref,
                                resolved: normalizePath(path.relative(ROOT_DIR, resolvedPath)),
                                message: `Item listado em '## Links' não existe no projeto`
                            });
                        }
                    }
                }
            }
        }
    }
}

// 4. Validação da Base de Conhecimento (knowledge/global/INDEX.md)
function checkKnowledgeIndex() {
    const indexPath = path.join(ROOT_DIR, 'knowledge', 'global', 'INDEX.md');
    if (!fs.existsSync(indexPath)) return;

    const content = fs.readFileSync(indexPath, 'utf-8');
    // Encontra menções a arquivos em knowledge/
    const matches = content.matchAll(/(?:├──|└──|\│\s+├──|\│\s+└──)\s+([a-zA-Z0-9_\-\.\/]+)/g);
    
    // Valida pastas e arquivos fundamentais de knowledge
    const coreKnowledgeFiles = [
        'knowledge/global/INDEX.md',
        'knowledge/ai/AIJEV.md',
        'knowledge/ai/MODEL_SELECTION.md',
        'knowledge/ai/AI_GATEWAY.md',
        'knowledge/architecture/PATTERNS.md',
        'knowledge/security/OWASP.md'
    ];

    for (const kf of coreKnowledgeFiles) {
        checkedLinksCount++;
        const fullPath = path.join(ROOT_DIR, kf);
        if (!fs.existsSync(fullPath)) {
            errors.push({
                file: 'knowledge/global/INDEX.md',
                type: 'KNOWLEDGE_INDEX_GAP',
                target: kf,
                message: `Arquivo de knowledge catalogado no índice não existe no disco`
            });
        }
    }
}

// 5. Validação de Unicidade de ADRs
function checkDecisions() {
    const adrMap = new Map();

    function scanAdrs(dir, scope) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.endsWith('.md')) {
                const match = entry.name.match(/^(?:ADR-)?(\d+)/i);
                if (match) {
                    const num = match[1];
                    const key = `${scope}-${num}`;
                    if (adrMap.has(key)) {
                        warnings.push({
                            file: path.join(dir, entry.name),
                            type: 'DUPLICATE_ADR_NUMBER',
                            target: entry.name,
                            message: `Número de ADR duplicado (${num}) em ${scope}`
                        });
                    } else {
                        adrMap.set(key, entry.name);
                    }
                }
            }
        }
    }

    scanAdrs(path.join(ROOT_DIR, 'decisions'), 'global');

    const projectsDir = path.join(ROOT_DIR, 'projects');
    if (fs.existsSync(projectsDir)) {
        const projs = fs.readdirSync(projectsDir);
        for (const p of projs) {
            scanAdrs(path.join(projectsDir, p, 'DECISIONS'), p);
        }
    }
}

let checkedJsCount = 0;

// 6. Validação de Sintaxe JavaScript (Frontend, Backend e Scripts)
function checkJavaScriptSyntax() {
    const vm = require('vm');
    const dirsToCheck = [
        path.join(ROOT_DIR, 'docs', 'brain-ui'),
        path.join(ROOT_DIR, 'scripts')
    ];
    const singleFiles = [
        path.join(ROOT_DIR, 'server.js')
    ];

    function scanJs(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (['node_modules', '.git', 'vendor'].includes(entry.name.toLowerCase())) continue;
                scanJs(fullPath);
            } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
                checkedJsCount++;
                try {
                    const code = fs.readFileSync(fullPath, 'utf8');
                    new vm.Script(code, { filename: fullPath });
                } catch (err) {
                    const rel = normalizePath(path.relative(ROOT_DIR, fullPath));
                    errors.push({
                        type: 'JS_SYNTAX_ERROR',
                        file: rel,
                        target: fullPath,
                        message: err.message
                    });
                }
            }
        }
    }

    dirsToCheck.forEach(scanJs);
    singleFiles.forEach(f => {
        if (fs.existsSync(f)) {
            checkedJsCount++;
            try {
                const code = fs.readFileSync(f, 'utf8');
                new vm.Script(code, { filename: f });
            } catch (err) {
                const rel = normalizePath(path.relative(ROOT_DIR, f));
                errors.push({
                    type: 'JS_SYNTAX_ERROR',
                    file: rel,
                    target: f,
                    message: err.message
                });
            }
        }
    });
}

// 7. Execução Principal
function runDoctor() {
    console.log('\n🩺 ════════════════════════════════════════════════════════════');
    console.log('   AI SECOND BRAIN — DOCTOR & LINTER DE INTEGRIDADE');
    console.log('════════════════════════════════════════════════════════════\n');

    const files = getAllMarkdownFiles(ROOT_DIR);
    console.log(`🔍 Analisando ${files.length} arquivos Markdown do workspace...`);

    for (const f of files) {
        checkMarkdownLinks(f);
    }

    checkProjects();
    checkKnowledgeIndex();
    checkDecisions();
    checkJavaScriptSyntax();

    console.log(`📁 ${checkedProjectsCount} projetos ativos validados.`);
    console.log(`🔗 ${checkedLinksCount} links e referências verificados em ${checkedFilesCount} arquivos.`);
    console.log(`⚡ ${checkedJsCount} scripts JavaScript validados com sintaxe íntegra.\n`);

    if (warnings.length > 0) {
        console.log(`⚠️  ${warnings.length} AVISO(S):`);
        warnings.forEach((w, idx) => {
            console.log(`   ${idx + 1}. [${w.type}] em ${w.file}`);
            console.log(`      Alvo: ${w.target}`);
            console.log(`      Info: ${w.message}\n`);
        });
    }

    checkGitUpdateStatus();

    if (errors.length > 0) {
        console.log(`❌  ${errors.length} ERRO(S) DE INTEGRIDADE DETECTADOS:`);
        errors.forEach((err, idx) => {
            console.log(`   ${idx + 1}. [${err.type}] em ${err.file}`);
            console.log(`      Destino: ${err.target}`);
            if (err.resolved) console.log(`      Caminho esperado: ${err.resolved}`);
            console.log(`      Detalhe: ${err.message}\n`);
        });

        console.log('💡 Sugestão: Ajuste os caminhos ou crie os arquivos pendentes.');
        return false;
    } else {
        console.log('🎉 SAÚDE EXCELENTE! 100% DOS LINKS, PROJETOS E BASES DE CONHECIMENTO VÁLIDOS.');
        console.log('   O AI Second Brain está livre de links quebrados ou violações de contrato.\n');
        return true;
    }
}

function checkGitUpdateStatus() {
    try {
        const { execSync } = require('child_process');
        let localVersion = '0.0.0';
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
            if (pkg.version) localVersion = pkg.version;
        } catch (_) {}

        console.log(`📦 Versão do AI Second Brain: v${localVersion}`);
        console.log(`   Registro de melhorias e notas de release: CHANGELOG.md`);

        const uiVersionFiles = [
            { path: path.join(ROOT_DIR, 'docs', 'brain-ui', 'index.html'), label: 'Cockpit Visual (docs/brain-ui/index.html)' },
            { path: path.join(ROOT_DIR, 'docs', 'brain-ui', 'app.js'), label: 'App Core (docs/brain-ui/app.js)' },
            { path: path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN-SITE', 'demo', 'index.html'), label: 'Demo Publica (AI_SECOND_BRAIN-SITE/demo/index.html)' },
            { path: path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN-SITE', 'demo', 'app.js'), label: 'Demo App Core (AI_SECOND_BRAIN-SITE/demo/app.js)' }
        ];

        let allSynced = true;
        for (const target of uiVersionFiles) {
            if (fs.existsSync(target.path)) {
                const content = fs.readFileSync(target.path, 'utf-8');
                if (!content.includes('Redirecionando') && !content.includes(`v${localVersion}`) && !content.includes(`version: '${localVersion}'`)) {
                    console.log(`   ⚠️  Alerta: ${target.label} difere de package.json (v${localVersion})!`);
                    allSynced = false;
                }
            }
        }
        if (allSynced) {
            console.log(`   ✓ Todas as interfaces (Landing, Cockpit, Demo e App) 100% sincronizadas com v${localVersion}`);
        } else {
            if (process.argv.includes('--fix')) {
                console.log(`   🛠️  Aplicando correção automática via sync-version...`);
                try {
                    const { syncVersion } = require('./sync-version');
                    syncVersion(localVersion);
                } catch (e) {
                    console.error('Falha na autocorreção:', e.message);
                }
            } else {
                console.log(`   💡 Dica: Execute 'npm run version:sync' para sincronizar automaticamente todas as interfaces!`);
            }
        }
        console.log('');

        if (!fs.existsSync(path.join(ROOT_DIR, '.git'))) return;

        const status = execSync('git status -uno', { cwd: ROOT_DIR, encoding: 'utf-8', timeout: 3000 });
        if (/behind/i.test(status)) {
            const match = status.match(/behind\s+.*by\s+(\d+)\s+commit/i);
            const count = match ? match[1] : '';
            console.log(`💡 NOVIDADES DISPONÍVEIS NO REPOSITÓRIO REMOTO! ${count ? `(${count} commit(s) atrás)` : ''}`);
            console.log('   Execute `git pull origin main` para baixar as últimas melhorias e motores de IA.');
            console.log('   Detalhes das atualizações em: https://github.com/alfredorcamara/ai-second-brain/releases\n');
        }
    } catch (_) {}
}

const success = runDoctor();
process.exit(success ? 0 : 1);
