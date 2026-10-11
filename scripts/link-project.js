/**
 * AI SECOND BRAIN — CLI de Vinculação de Repositórios Existentes (Brownfield)
 * 
 * Uso:
 *   node scripts/link-project.js <nome-do-projeto> <caminho-absoluto-da-pasta>
 *   npm run project:link <nome-do-projeto> <caminho-absoluto-da-pasta>
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');

// 1. Leitura de Argumentos
const args = process.argv.slice(2);
const projectName = args[0];
const targetPathRaw = args[1];

function showHelp() {
    console.log('\n🔗 ════════════════════════════════════════════════════════════');
    console.log('   AI SECOND BRAIN — VINCULADOR DE REPOSITÓRIO EXTERNO');
    console.log('════════════════════════════════════════════════════════════');
    console.log('\nUso:');
    console.log('   npm run project:link <nome-do-projeto> <caminho-da-pasta-externa>');
    console.log('\nExemplos:');
    console.log('   npm run project:link meu-sistema "C:\\Projetos\\SaaS\\MeuSistema"');
    console.log('   npm run project:link api-pagamentos "/home/user/code/api-pagamentos"\n');
}

if (!projectName || !targetPathRaw || projectName === '--help' || projectName === '-h') {
    showHelp();
    process.exit(projectName && targetPathRaw ? 0 : 1);
}

// 2. Validação do Caminho Alvo
const targetAbsolutePath = path.resolve(targetPathRaw);

if (!fs.existsSync(targetAbsolutePath)) {
    console.error(`\n❌ Erro: O diretório de destino não existe no disco:`);
    console.error(`   ${targetAbsolutePath}\n`);
    process.exit(1);
}

if (!fs.statSync(targetAbsolutePath).isDirectory()) {
    console.error(`\n❌ Erro: O caminho informado não é um diretório:`);
    console.error(`   ${targetAbsolutePath}\n`);
    process.exit(1);
}

// 3. Sanitização do Nome do Link
const safeName = projectName.trim().replace(/[^a-zA-Z0-9_\-]/g, '-');
const destLinkPath = path.join(PROJECTS_DIR, safeName);

if (fs.existsSync(destLinkPath)) {
    console.error(`\n❌ Erro: Já existe um projeto ou link com o nome '${safeName}' em:`);
    console.error(`   ${destLinkPath}\n`);
    process.exit(1);
}

// 4. Criação do Link Simbólico / Junção NTFS
console.log(`\n🔗 Vinculando repositório externo '${safeName}'...`);
console.log(`   Origem:  ${targetAbsolutePath}`);
console.log(`   Destino: ${destLinkPath}`);

try {
    const isWindows = process.platform === 'win32';
    // No Windows, junção NTFS ('junction') não requer privilégios de Administrador
    fs.symlinkSync(targetAbsolutePath, destLinkPath, isWindows ? 'junction' : 'dir');
    console.log('✅ Junção criada com sucesso!');
} catch (err) {
    console.error(`\n❌ Falha ao criar link simbólico:`, err.message);
    process.exit(1);
}

// 5. Verificação dos Contratos do Segundo Cérebro no Projeto Alvo
const projectMdPath = path.join(destLinkPath, 'PROJECT.md');
const currentStateMdPath = path.join(destLinkPath, 'CURRENT_STATE.md');

const hasProjectMd = fs.existsSync(projectMdPath);
const hasCurrentStateMd = fs.existsSync(currentStateMdPath);

if (!hasProjectMd || !hasCurrentStateMd) {
    console.log('\n📝 Inicializando metadados de governança na raiz do repositório...');
    const today = new Date().toISOString().split('T')[0];

    if (!hasProjectMd) {
        const starterProjectMd = `# ${safeName}

## Visão Geral
Projeto externo vinculado ao AI Second Brain.

## Informações Gerais
- **Tipo**: Brownfield / Repositório Externo
- **Localização Original**: \`${targetAbsolutePath}\`
- **Status**: 🟢 Ativo / Em Desenvolvimento

## Links & Documentação
- Estado Atual: [CURRENT_STATE.md](CURRENT_STATE.md)
`;
        fs.writeFileSync(projectMdPath, starterProjectMd, 'utf-8');
        console.log(`   + Criado: PROJECT.md`);
    }

    if (!hasCurrentStateMd) {
        const starterCurrentStateMd = `# ${safeName} — Estado Atual

> Última atualização: ${today}

## Status: 🟢 Ativo / Vinculado ao AI Second Brain
- Repositório conectado e pronto para desenvolvimento com IA.
`;
        fs.writeFileSync(currentStateMdPath, starterCurrentStateMd, 'utf-8');
        console.log(`   + Criado: CURRENT_STATE.md`);
    }

    // Pontes de Governança Agnóstica (para desenvolvedores que abrirem a pasta em qualquer IDE/IA)
    const bridgeContent = `# Governança de IA — ${safeName}

> Este repositório está vinculado ao AI Second Brain.
> Cérebro Central: \`${ROOT_DIR}\`

## ANTES DE EXECUTAR QUALQUER TAREFA
1. Consulte o estado atual em: [CURRENT_STATE.md](CURRENT_STATE.md)
2. Consulte os requisitos e visão geral em: [PROJECT.md](PROJECT.md)
3. Consulte as decisões arquiteturais em: DECISIONS/ (se existente)
4. Consulte as lições aprendidas em: \`${path.join(ROOT_DIR, 'memory', 'lessons-learned.md')}\`
5. REGRAS ABSOLUTAS:
   - NUNCA crie catálogos ou listas fixas/hardcoded de modelos de IA no código ou HTML. O catálogo deve ser 100% dinâmico via API em tempo real.
   - Sempre utilize código determinístico antes de recorrer a LLMs.
   - NUNCA invente contexto ou regras especulativas sem solicitação expressa do desenvolvedor.
`;

    // 1. Padrão Aberto Universal (AGENTS.md)
    const agentsMdPath = path.join(destLinkPath, 'AGENTS.md');
    if (!fs.existsSync(agentsMdPath)) {
        fs.writeFileSync(agentsMdPath, bridgeContent, 'utf-8');
        console.log(`   + Criado: AGENTS.md (Ponte universal para qualquer agente de IA)`);
    }

    // 2. Google Antigravity (GEMINI.md)
    const geminiMdPath = path.join(destLinkPath, 'GEMINI.md');
    if (!fs.existsSync(geminiMdPath)) {
        fs.writeFileSync(geminiMdPath, bridgeContent, 'utf-8');
        console.log(`   + Criado: GEMINI.md (Ponte para Google Antigravity)`);
    }

    // 3. Cursor AI (.cursorrules)
    const cursorRulesPath = path.join(destLinkPath, '.cursorrules');
    if (!fs.existsSync(cursorRulesPath)) {
        fs.writeFileSync(cursorRulesPath, bridgeContent, 'utf-8');
        console.log(`   + Criado: .cursorrules (Ponte para Cursor AI)`);
    }

    // 4. Claude Code (CLAUDE.md)
    const claudeMdPath = path.join(destLinkPath, 'CLAUDE.md');
    if (!fs.existsSync(claudeMdPath)) {
        fs.writeFileSync(claudeMdPath, bridgeContent, 'utf-8');
        console.log(`   + Criado: CLAUDE.md (Ponte para Claude Code)`);
    }
}

// 6. Atualização automática do Snapshot do Dashboard
try {
    const { scanVault } = require('./scan-vault');
    const vault = scanVault(ROOT_DIR);
    const outputPath = path.resolve(__dirname, '../docs/brain-ui/vault-data.js');
    const jsContent = `// ═══════════════════════════════════════════════════\n// AI SECOND BRAIN — Dynamic Vault Snapshot\n// Auto-generated: ${new Date().toISOString()}\n// ═══════════════════════════════════════════════════\n\nwindow.VAULT_SNAPSHOT = ${JSON.stringify(vault, null, 2)};\n`;
    fs.writeFileSync(outputPath, jsContent, 'utf-8');
    console.log(`📊 Snapshot do Dashboard atualizado com sucesso.`);
} catch (e) {
    // silencioso
}

console.log(`\n🎉 PROJETO CONECTADO COM SUCESSO!`);
console.log(`   Agora o AI Second Brain monitora e governa este repositório sem duplicar arquivos.`);
console.log(`   Inicie o servidor ('npm start') para ver o novo projeto no Dashboard.`);
console.log(`\n💡 Dica de Operação:`);
console.log(`   • Modo Cockpit (Recomendado): Mantenha o AI Second Brain aberto no editor e trabalhe via 'projects/${safeName}/'.`);
console.log(`   • Modo Standalone: Se abrir a pasta original isolada em outro editor, a ponte 'GEMINI.md' manterá as diretrizes ativas.\n`);

