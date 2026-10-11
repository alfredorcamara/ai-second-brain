/**
 * AI SECOND BRAIN — CLI de Criação de Projetos (Greenfield)
 * 
 * Uso:
 *   node scripts/create-project.js <nome-do-projeto> [tipo]
 *   npm run project:new <nome-do-projeto>
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');

// 1. Leitura de Argumentos
const args = process.argv.slice(2);
const projectName = args[0];
const projectType = args[1] || 'SaaS / API / Web / Mobile';

function showHelp() {
    console.log('\n🚀 ════════════════════════════════════════════════════════════');
    console.log('   AI SECOND BRAIN — CRIADOR DE PROJETOS');
    console.log('════════════════════════════════════════════════════════════');
    console.log('\nUso:');
    console.log('   npm run project:new <nome-do-projeto> [tipo]');
    console.log('\nExemplos:');
    console.log('   npm run project:new billing-service API');
    console.log('   npm run project:new meu-jogo-mobile Jogo');
    console.log('   npm run project:new dashboard-saas SaaS\n');
}

if (!projectName || projectName === '--help' || projectName === '-h') {
    showHelp();
    process.exit(projectName ? 0 : 1);
}

// 2. Sanitização do Nome
const safeName = projectName.trim().replace(/[^a-zA-Z0-9_\-]/g, '-');
const projectFolder = path.join(PROJECTS_DIR, safeName);

if (fs.existsSync(projectFolder)) {
    console.error(`\n❌ Erro: O projeto '${safeName}' já existe em:`);
    console.error(`   ${projectFolder}\n`);
    process.exit(1);
}

// 3. Estruturação do Projeto
console.log(`\n📦 Criando projeto '${safeName}' no AI Second Brain...`);

fs.mkdirSync(projectFolder, { recursive: true });
fs.mkdirSync(path.join(projectFolder, 'DECISIONS'), { recursive: true });
fs.mkdirSync(path.join(projectFolder, 'MEMORY', 'sessions'), { recursive: true });

const today = new Date().toISOString().split('T')[0];

// 4. Template: PROJECT.md
const projectMdContent = `# ${safeName}

## Visão Geral
Breve descrição sobre o que o projeto faz, o problema que resolve e o público-alvo.

## Informações Gerais
- **Tipo**: ${projectType}
- **Stack Tecnológica**: A definir
- **Status**: 🟡 Em planejamento
- **Data de Início**: ${today}

## Objetivos
1. Definir a arquitetura técnica base e dependências.
2. Construir o MVP com as funcionalidades essenciais.
3. Testar e validar a solução.

## Links & Documentação
- Arquitetura: [ARCHITECTURE.md](ARCHITECTURE.md)
- Estado Atual: [CURRENT_STATE.md](CURRENT_STATE.md)
- Lições Aprendidas: [LESSONS_LEARNED.md](LESSONS_LEARNED.md)
- Decisões Arquiteturais: [DECISIONS/](DECISIONS/)
- Memória de Sessões: [MEMORY/](MEMORY/)
`;

// 5. Template: CURRENT_STATE.md
const currentStateMdContent = `# ${safeName} — Estado Atual

> Última atualização: ${today}

## Status Geral: 🟡 Em planejamento

## O que está definido
- [x] Estrutura inicial criada no AI Second Brain.
- [ ] Escopo e requisitos principais.
- [ ] Stack tecnológica e dependências.

## O que está em andamento
- Definição da arquitetura e primeiras decisões técnicas.

## Bloqueios / Dúvidas Atuais
- Nenhum bloqueio no momento.

## Próximos Passos
1. Definir a stack e gravar a primeira decisão técnica em \`DECISIONS/\`.
2. Criar a especificação da primeira funcionalidade.
`;

// 6. Template: ARCHITECTURE.md
const archMdContent = `# ${safeName} — Arquitetura da Solução

> Visão arquitetural, padrões técnicos e decisões de design.

## 1. Visão Geral dos Componentes
Descreva como o projeto é organizado (camadas, módulos, serviços ou pacotes).

## 2. Padrões Adotados
- Convenções idiomáticas da linguagem escolhida.
- Princípios de desacoplamento e testabilidade.
- Se o projeto utilizar IA: aplicar o AI Decision Gate (\`.agents/rules/01-ai-decision.md\`).
`;

// 7. Template: LESSONS_LEARNED.md (Local do Projeto)
const lessonsLearnedMdContent = `# ${safeName} — Lições Aprendidas

> Este documento registra erros, armadilhas técnicas e aprendizados específicos deste projeto.
> Qualquer agente de IA ou desenvolvedor deve consultar este arquivo antes de alterar código neste repositório.

## Histórico de Lições Aprendidas
<!-- Registre novos aprendizados seguindo o formato: -->
<!-- ### YYYY-MM-DD — Título do Aprendizado -->
<!-- - Contexto: O que motivou o problema -->
<!-- - Causa Raiz: Motivo técnico da falha -->
<!-- - O que NÃO fazer: Padrão a evitar -->
<!-- - Padrão Correto: Solução validada e obrigatória -->
`;

// Gravar arquivos contratuais do projeto
fs.writeFileSync(path.join(projectFolder, 'PROJECT.md'), projectMdContent, 'utf-8');
fs.writeFileSync(path.join(projectFolder, 'CURRENT_STATE.md'), currentStateMdContent, 'utf-8');
fs.writeFileSync(path.join(projectFolder, 'ARCHITECTURE.md'), archMdContent, 'utf-8');
fs.writeFileSync(path.join(projectFolder, 'LESSONS_LEARNED.md'), lessonsLearnedMdContent, 'utf-8');

const bridgeContent = `# Governança de IA — ${safeName}

> Este projeto é governado pelo AI Second Brain.
> Cérebro Central: \`${ROOT_DIR}\`

## ANTES DE EXECUTAR QUALQUER TAREFA
1. Consulte o estado atual em: [CURRENT_STATE.md](CURRENT_STATE.md)
2. Consulte os requisitos e visão geral em: [PROJECT.md](PROJECT.md)
3. Consulte as decisões arquiteturais em: DECISIONS/
4. Consulte as lições aprendidas deste projeto em: [LESSONS_LEARNED.md](LESSONS_LEARNED.md)
5. Consulte as lições aprendidas globais em: \`${path.join(ROOT_DIR, 'memory', 'lessons-learned.md')}\`
6. REGRAS ABSOLUTAS:
   - NUNCA crie catálogos ou listas fixas/hardcoded de modelos de IA no código ou HTML. O catálogo deve ser 100% dinâmico via API em tempo real.
   - Sempre utilize código determinístico antes de recorrer a LLMs.
   - NUNCA invente contexto ou regras especulativas sem solicitação expressa do desenvolvedor.
`;

// Injetar pontes agnósticas no projeto (para modo Cockpit ou Standalone)
fs.writeFileSync(path.join(projectFolder, 'AGENTS.md'), bridgeContent, 'utf-8');
fs.writeFileSync(path.join(projectFolder, 'GEMINI.md'), bridgeContent, 'utf-8');
fs.writeFileSync(path.join(projectFolder, '.cursorrules'), bridgeContent, 'utf-8');
fs.writeFileSync(path.join(projectFolder, 'CLAUDE.md'), bridgeContent, 'utf-8');

// Atualização automática do Snapshot do Dashboard
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

console.log('✅ Estrutura criada com sucesso:');
console.log(`   📁 projects/${safeName}/`);
console.log(`   ├── 📄 PROJECT.md`);
console.log(`   ├── 📄 CURRENT_STATE.md`);
console.log(`   ├── 📄 ARCHITECTURE.md`);
console.log(`   ├── 📄 LESSONS_LEARNED.md (Lições específicas do projeto)`);
console.log(`   ├── 📄 AGENTS.md / GEMINI.md / .cursorrules / CLAUDE.md (Pontes Multi-IA)`);
console.log(`   ├── 📁 DECISIONS/`);
console.log(`   └── 📁 MEMORY/sessions/`);
console.log('\n💡 Próximos Passos:');
console.log(`   1. Abra o arquivo 'projects/${safeName}/PROJECT.md' e preencha a stack.`);
console.log(`   2. Inicie o servidor ('npm start') para ver o novo projeto no Dashboard!`);
console.log(`   3. No Antigravity, diga: "Vou trabalhar no ${safeName}".\n`);
