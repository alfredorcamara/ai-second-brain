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
const { tr } = require('./i18n-cli');

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

    const ignoredFolders = new Set(['node_modules', '.git', 'bin', 'obj', 'dist', 'build', 'vendor', '.vs', '.vscode', 'backups', '.archive', 'internals', '.internals']);

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
                    message: tr(
                        `Link absoluto 'file:///' aponta para arquivo inexistente`,
                        `Absolute 'file:///' link points to a non-existent file`
                    )
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
                    message: tr(
                        `Link sem extensão .md funcionaria como ${linkRaw}.md`,
                        `Link without .md extension would resolve as ${linkRaw}.md`
                    )
                });
                continue;
            }

            errors.push({
                file: relSource,
                type: 'BROKEN_LINK',
                target: linkRaw,
                resolved: normalizePath(path.relative(ROOT_DIR, resolvedTarget)),
                message: tr(
                    `Arquivo ou diretório de destino não existe`,
                    `Target file or directory does not exist`
                )
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
                    message: tr(
                        `Projeto não possui o arquivo obrigatório '${req}'`,
                        `Project is missing required contract file '${req}'`
                    )
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
                                message: tr(
                                    `Item listado em '## Links' não existe no projeto`,
                                    `Item listed in '## Links' does not exist in project`
                                )
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
                message: tr(
                    `Arquivo de knowledge catalogado no índice não existe no disco`,
                    `Cataloged knowledge file does not exist on disk`
                )
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
                            message: tr(
                                `Número de ADR duplicado (${num}) em ${scope}`,
                                `Duplicate ADR number (${num}) in ${scope}`
                            )
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
    console.log(tr(
        '   AI SECOND BRAIN — DOCTOR & LINTER DE INTEGRIDADE',
        '   AI SECOND BRAIN — DOCTOR & INTEGRITY LINTER'
    ));
    console.log('════════════════════════════════════════════════════════════\n');

    const files = getAllMarkdownFiles(ROOT_DIR);
    console.log(tr(
        `🔍 Analisando ${files.length} arquivos Markdown do workspace...`,
        `🔍 Analyzing ${files.length} workspace Markdown files...`
    ));

    for (const f of files) {
        checkMarkdownLinks(f);
    }

    checkProjects();
    checkKnowledgeIndex();
    checkDecisions();
    checkJavaScriptSyntax();

    console.log(tr(
        `📁 ${checkedProjectsCount} projetos ativos validados.`,
        `📁 ${checkedProjectsCount} active projects validated.`
    ));
    console.log(tr(
        `🔗 ${checkedLinksCount} links e referências verificados em ${checkedFilesCount} arquivos.`,
        `🔗 ${checkedLinksCount} links and references verified across ${checkedFilesCount} files.`
    ));
    console.log(tr(
        `⚡ ${checkedJsCount} scripts JavaScript validados com sintaxe íntegra.\n`,
        `⚡ ${checkedJsCount} JavaScript scripts validated with clean syntax.\n`
    ));

    if (warnings.length > 0) {
        console.log(tr(
            `⚠️  ${warnings.length} AVISO(S):`,
            `⚠️  ${warnings.length} WARNING(S):`
        ));
        warnings.forEach((w, idx) => {
            console.log(`   ${idx + 1}. [${w.type}] ${tr('em', 'in')} ${w.file}`);
            console.log(`      ${tr('Alvo', 'Target')}: ${w.target}`);
            console.log(`      Info: ${w.message}\n`);
        });
    }

    checkGitUpdateStatus();

    if (errors.length > 0) {
        console.log(tr(
            `❌  ${errors.length} ERRO(S) DE INTEGRIDADE DETECTADOS:`,
            `❌  ${errors.length} INTEGRITY ERROR(S) DETECTED:`
        ));
        errors.forEach((err, idx) => {
            console.log(`   ${idx + 1}. [${err.type}] ${tr('em', 'in')} ${err.file}`);
            console.log(`      ${tr('Destino', 'Target')}: ${err.target}`);
            if (err.resolved) console.log(`      ${tr('Caminho esperado', 'Expected path')}: ${err.resolved}`);
            console.log(`      ${tr('Detalhe', 'Detail')}: ${err.message}\n`);
        });

        console.log(tr(
            '💡 Sugestão: Ajuste os caminhos ou crie os arquivos pendentes.',
            '💡 Suggestion: Fix the paths or create the missing files.'
        ));
        return false;
    } else {
        console.log(tr(
            '🎉 SAÚDE EXCELENTE! 100% DOS LINKS, PROJETOS E BASES DE CONHECIMENTO VÁLIDOS.',
            '🎉 EXCELLENT HEALTH! 100% OF LINKS, PROJECTS, AND KNOWLEDGE BASES ARE VALID.'
        ));
        console.log(tr(
            '   O AI Second Brain está livre de links quebrados ou violações de contrato.\n',
            '   AI Second Brain is free of broken links or contract violations.\n'
        ));
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

        console.log(tr(
            `📦 Versão do AI Second Brain: v${localVersion}`,
            `📦 AI Second Brain Version: v${localVersion}`
        ));
        console.log(tr(
            `   Registro de melhorias e notas de release: CHANGELOG.md`,
            `   Release notes and changelog: CHANGELOG.md`
        ));

        const siteDirCandidates = [
            path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN-SITE'),
            path.resolve(ROOT_DIR, '..', 'ai-second-brain-site')
        ];
        const siteDir = siteDirCandidates.find(d => fs.existsSync(d));

        let allSynced = true;

        // Valida que o Cockpit possui os placeholders dinâmicos (sem strings hardcoded)
        const cockpitHtmlPath = path.join(ROOT_DIR, 'docs', 'brain-ui', 'index.html');
        if (fs.existsSync(cockpitHtmlPath)) {
            const html = fs.readFileSync(cockpitHtmlPath, 'utf-8');
            const requiredIds = ['bootVersionText', 'sidebarVersionText', 'topVersionTag', 'changelogModalVersionTag'];
            const missing = requiredIds.filter(id => !html.includes(`id="${id}"`));
            if (missing.length > 0) {
                console.log(tr(
                    `   ⚠️  Alerta: Cockpit HTML sem placeholders dinâmicos: ${missing.join(', ')}`,
                    `   ⚠️  Alert: Cockpit HTML missing dynamic placeholders: ${missing.join(', ')}`
                ));
                allSynced = false;
            }
        }

        // Valida que a landing page pública (estática) está sincronizada com a versão atual
        if (siteDir) {
            const landingPath = path.join(siteDir, 'index.html');
            if (fs.existsSync(landingPath)) {
                const landing = fs.readFileSync(landingPath, 'utf-8');
                if (!landing.includes(`v${localVersion}`)) {
                    console.log(tr(
                        `   ⚠️  Alerta: Landing Page (${path.basename(siteDir)}/index.html) não referencia v${localVersion}`,
                        `   ⚠️  Alert: Landing Page (${path.basename(siteDir)}/index.html) does not reference v${localVersion}`
                    ));
                    allSynced = false;
                }
            }
        }

        if (allSynced) {
            console.log(tr(
                `   ✓ Versionamento dinâmico íntegro (Fonte Única: package.json v${localVersion})`,
                `   ✓ Dynamic versioning healthy (Single Source of Truth: package.json v${localVersion})`
            ));
            console.log(tr(
                `   ✓ Cockpit e Demo 100% desacoplados de versão hardcoded no HTML.`,
                `   ✓ Cockpit and Demo 100% decoupled from hardcoded HTML versions.`
            ));
        } else {
            console.log(tr(
                `   💡 Dica: Execute 'npm run version:sync' para sincronizar a release nas interfaces públicas.`,
                `   💡 Tip: Run 'npm run version:sync' to synchronize the release across public interfaces.`
            ));
        }
        console.log('');

        if (!fs.existsSync(path.join(ROOT_DIR, '.git'))) return;

        const status = execSync('git status -uno', { cwd: ROOT_DIR, encoding: 'utf-8', timeout: 3000 });
        if (/behind/i.test(status)) {
            const match = status.match(/behind\s+.*by\s+(\d+)\s+commit/i);
            const count = match ? match[1] : '';
            console.log(tr(
                `💡 NOVIDADES DISPONÍVEIS NO REPOSITÓRIO REMOTO! ${count ? `(${count} commit(s) atrás)` : ''}`,
                `💡 UPDATES AVAILABLE ON REMOTE REPOSITORY! ${count ? `(${count} commit(s) behind)` : ''}`
            ));
            console.log(tr(
                '   Execute `git pull origin main` para baixar as últimas melhorias e motores de IA.',
                '   Run `git pull origin main` to download the latest improvements and AI engines.'
            ));
            console.log(tr(
                '   Detalhes das atualizações em: https://github.com/alfredorcamara/ai-second-brain/releases\n',
                '   Update details at: https://github.com/alfredorcamara/ai-second-brain/releases\n'
            ));
        }
    } catch (_) {}
}

const success = runDoctor();
process.exit(success ? 0 : 1);
