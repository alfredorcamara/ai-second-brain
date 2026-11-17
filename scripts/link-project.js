/**
 * AI SECOND BRAIN — CLI de Vinculação de Repositórios Existentes (Brownfield)
 * 
 * Uso:
 *   node scripts/link-project.js <nome-do-projeto> <caminho-absoluto-da-pasta>
 *   npm run project:link <nome-do-projeto> <caminho-absoluto-da-pasta>
 */

const fs = require('fs');
const path = require('path');
const { tr } = require('./i18n-cli');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');

// 1. Leitura de Argumentos (ignorando flags de idioma)
const args = process.argv.slice(2).filter(a => !a.startsWith('--lang') && a !== '--en' && a !== '--pt');
const projectName = args[0];
const targetPathRaw = args[1];

function showHelp() {
    console.log('\n🔗 ════════════════════════════════════════════════════════════');
    console.log(tr(
        '   AI SECOND BRAIN — VINCULADOR DE REPOSITÓRIO EXTERNO',
        '   AI SECOND BRAIN — EXTERNAL REPOSITORY LINKER'
    ));
    console.log('════════════════════════════════════════════════════════════');
    console.log(tr('\nUso:', '\nUsage:'));
    console.log(tr(
        '   npm run project:link <nome-do-projeto> <caminho-da-pasta-externa>',
        '   npm run project:link <project-name> <external-folder-path>'
    ));
    console.log(tr('\nExemplos:', '\nExamples:'));
    console.log('   npm run project:link my-system "C:\\Projetos\\SaaS\\MySystem"');
    console.log('   npm run project:link payments-api "/home/user/code/payments-api"\n');
}

if (!projectName || !targetPathRaw || projectName === '--help' || projectName === '-h') {
    showHelp();
    process.exit(projectName && targetPathRaw ? 0 : 1);
}

// 2. Validação do Caminho Alvo
const targetAbsolutePath = path.resolve(targetPathRaw);

if (!fs.existsSync(targetAbsolutePath)) {
    console.error(tr(
        `\n❌ Erro: O diretório de destino não existe no disco:`,
        `\n❌ Error: Target directory does not exist on disk:`
    ));
    console.error(`   ${targetAbsolutePath}\n`);
    process.exit(1);
}

if (!fs.statSync(targetAbsolutePath).isDirectory()) {
    console.error(tr(
        `\n❌ Erro: O caminho informado não é um diretório:`,
        `\n❌ Error: The provided path is not a directory:`
    ));
    console.error(`   ${targetAbsolutePath}\n`);
    process.exit(1);
}

// 3. Sanitização do Nome do Link
const safeName = projectName.trim().replace(/[^a-zA-Z0-9_\-]/g, '-');
const destLinkPath = path.join(PROJECTS_DIR, safeName);

if (fs.existsSync(destLinkPath)) {
    console.error(tr(
        `\n❌ Erro: Já existe um projeto ou link com o nome '${safeName}' em:`,
        `\n❌ Error: A project or link named '${safeName}' already exists at:`
    ));
    console.error(`   ${destLinkPath}\n`);
    process.exit(1);
}

// 4. Criação do Link Simbólico / Junção NTFS
console.log(tr(
    `\n🔗 Vinculando repositório externo '${safeName}'...`,
    `\n🔗 Linking external repository '${safeName}'...`
));
console.log(tr(`   Origem:  ${targetAbsolutePath}`, `   Source:  ${targetAbsolutePath}`));
console.log(tr(`   Destino: ${destLinkPath}`, `   Target:  ${destLinkPath}`));

try {
    const isWindows = process.platform === 'win32';
    // No Windows, junção NTFS ('junction') não requer privilégios de Administrador
    fs.symlinkSync(targetAbsolutePath, destLinkPath, isWindows ? 'junction' : 'dir');
    console.log(tr('✅ Junção criada com sucesso!', '✅ Symlink/Junction created successfully!'));
} catch (err) {
    console.error(tr(`\n❌ Falha ao criar link simbólico:`, `\n❌ Failed to create symlink:`), err.message);
    process.exit(1);
}

// 5. Verificação dos Contratos do Segundo Cérebro no Projeto Alvo
const projectMdPath = path.join(destLinkPath, 'PROJECT.md');
const currentStateMdPath = path.join(destLinkPath, 'CURRENT_STATE.md');

const hasProjectMd = fs.existsSync(projectMdPath);
const hasCurrentStateMd = fs.existsSync(currentStateMdPath);

if (!hasProjectMd || !hasCurrentStateMd) {
    console.log(tr(
        '\n📝 Inicializando metadados de governança na raiz do repositório...',
        '\n📝 Initializing governance metadata in repository root...'
    ));
    const today = new Date().toISOString().split('T')[0];

    if (!hasProjectMd) {
        const starterProjectMd = tr(`# ${safeName}

## Visão Geral
Projeto externo vinculado ao AI Second Brain.

## Informações Gerais
- **Tipo**: Brownfield / Repositório Externo
- **Localização Original**: \`${targetAbsolutePath}\`
- **Status**: 🟢 Ativo / Em Desenvolvimento

## Links & Documentação
- Estado Atual: [CURRENT_STATE.md](CURRENT_STATE.md)
- Lições Aprendidas: [LESSONS_LEARNED.md](LESSONS_LEARNED.md)
`, `# ${safeName}

## Overview
External repository linked to AI Second Brain.

## General Information
- **Type**: Brownfield / External Repository
- **Original Location**: \`${targetAbsolutePath}\`
- **Status**: 🟢 Active / In Development

## Links & Documentation
- Current State: [CURRENT_STATE.md](CURRENT_STATE.md)
- Lessons Learned: [LESSONS_LEARNED.md](LESSONS_LEARNED.md)
`);
        fs.writeFileSync(projectMdPath, starterProjectMd, 'utf-8');
        console.log(tr(`   + Criado: PROJECT.md`, `   + Created: PROJECT.md`));
    }

    if (!hasCurrentStateMd) {
        const starterCurrentStateMd = tr(`# ${safeName} — Estado Atual

> Última atualização: ${today}

## Status: 🟢 Ativo / Vinculado ao AI Second Brain
- Repositório conectado e pronto para desenvolvimento com IA.
`, `# ${safeName} — Current State

> Last updated: ${today}

## Status: 🟢 Active / Linked to AI Second Brain
- Repository connected and ready for AI development.
`);
        fs.writeFileSync(currentStateMdPath, starterCurrentStateMd, 'utf-8');
        console.log(tr(`   + Criado: CURRENT_STATE.md`, `   + Created: CURRENT_STATE.md`));
    }

    const lessonsLearnedMdPath = path.join(destLinkPath, 'LESSONS_LEARNED.md');
    const hasLessonsLearnedMd = fs.existsSync(lessonsLearnedMdPath);
    if (!hasLessonsLearnedMd) {
        const starterLessonsLearnedMd = tr(`# ${safeName} — Lições Aprendidas

> Erros, armadilhas técnicas e aprendizados específicos deste projeto.
> Qualquer agente de IA ou desenvolvedor deve consultar este arquivo antes de alterar código neste repositório.

## Histórico de Lições Aprendidas
<!-- Registre novos aprendizados seguindo o formato: -->
<!-- ### YYYY-MM-DD — Título do Aprendizado -->
<!-- - Contexto: O que motivou o problema -->
<!-- - Causa Raiz: Motivo técnico da falha -->
<!-- - O que NÃO fazer: Padrão a evitar -->
<!-- - Padrão Correto: Solução validada e obrigatória -->
`, `# ${safeName} — Lessons Learned

> Errors, technical pitfalls, and learnings specific to this project.
> Any AI agent or developer must consult this file before modifying code in this repository.

## Lessons Learned History
<!-- Record new learnings following this format: -->
<!-- ### YYYY-MM-DD — Learning Title -->
<!-- - Context: What triggered the issue -->
<!-- - Root Cause: Technical reason for the failure -->
<!-- - What NOT to do: Anti-pattern to avoid -->
<!-- - Validated Pattern: Mandatory verified solution -->
`);
        fs.writeFileSync(lessonsLearnedMdPath, starterLessonsLearnedMd, 'utf-8');
        console.log(tr(
            `   + Criado: LESSONS_LEARNED.md (Lições específicas do projeto)`,
            `   + Created: LESSONS_LEARNED.md (Project-specific lessons learned)`
        ));
    }

    // Pontes de Governança Agnóstica (para desenvolvedores que abrirem a pasta em qualquer IDE/IA)
    const { writeBridges } = require('./bridge-templates');
    const bridgeResult = writeBridges({ projectDir: destLinkPath, projectName: safeName, rootDir: ROOT_DIR });
    bridgeResult.created.forEach(f => console.log(tr(`   + Criado: ${f} (Ponte de IA)`, `   + Created: ${f} (AI bridge)`)));
}

// 6. Atualização automática do Snapshot do Dashboard
try {
    const { scanVault } = require('./scan-vault');
    const vault = scanVault(ROOT_DIR);
    const outputPath = path.resolve(__dirname, '../docs/brain-ui/vault-data.js');
    const jsContent = `// ═══════════════════════════════════════════════════\n// AI SECOND BRAIN — Dynamic Vault Snapshot\n// Auto-generated: ${new Date().toISOString()}\n// ═══════════════════════════════════════════════════\n\nwindow.VAULT_SNAPSHOT = ${JSON.stringify(vault, null, 2)};\n`;
    fs.writeFileSync(outputPath, jsContent, 'utf-8');
    console.log(tr(`📊 Snapshot do Dashboard atualizado com sucesso.`, `📊 Dashboard snapshot updated successfully.`));
} catch (e) {
    // silencioso
}

console.log(tr(`\n🎉 PROJETO CONECTADO COM SUCESSO!`, `\n🎉 PROJECT LINKED SUCCESSFULLY!`));
console.log(tr(
    `   Agora o AI Second Brain monitora e governa este repositório sem duplicar arquivos.`,
    `   AI Second Brain now monitors and governs this repository without duplicating files.`
));
console.log(tr(
    `   Inicie o servidor ('npm start') para ver o novo projeto no Dashboard.`,
    `   Start the server ('npm start') to view the linked project in the Dashboard.`
));
console.log(tr(`\n💡 Dica de Operação:`, `\n💡 Operation Tip:`));
console.log(tr(
    `   • Modo Cockpit (Recomendado): Mantenha o AI Second Brain aberto no editor e trabalhe via 'projects/${safeName}/'.`,
    `   • Cockpit Mode (Recommended): Keep AI Second Brain open in your editor and work via 'projects/${safeName}/'.`
));
console.log(tr(
    `   • Modo Standalone: Se abrir a pasta original isolada em outro editor, as pontes manterão as diretrizes ativas.\n`,
    `   • Standalone Mode: If you open the original folder in another editor, the bridges will keep governance active.\n`
));
