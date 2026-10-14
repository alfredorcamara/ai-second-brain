'use strict';
/**
 * AI SECOND BRAIN — Quickstart Grill Engine
 *
 * Motor de Sabatina Técnica (Grill) e Refinamento Iterativo ("Prompt Vivo")
 * para o Quickstart Studio do Cockpit Web.
 *
 * Responsabilidades (AI Decision Gate):
 *   - LLM: Formular perguntas cirúrgicas contextuais à stack, gerar rascunho de contratos e refinar com feedback.
 *   - DETERMINÍSTICO: Sanitizar entradas, fallback seguro em caso de indisponibilidade de IA,
 *     gerar arquivos físicos atômicos em projects/<nome>/ e registrar no vault.
 *
 * Zero dependências externas.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function sanitizeProjectName(rawName) {
    if (!rawName || typeof rawName !== 'string') return '';
    return rawName.trim().replace(/[^a-zA-Z0-9_\-]/g, '-');
}

/**
 * Formula de 3 a 4 perguntas dinâmicas e cirúrgicas para a sabatina técnica.
 * Suporta também rodadas adicionais complementares se existingQuestions for fornecido.
 */
async function generateQuestions(aiGateway, projectInfo) {
    const rawName = (projectInfo.name || '').trim();
    const safeName = sanitizeProjectName(rawName);
    const stack = (projectInfo.stack || 'Não definida').trim();
    const description = (projectInfo.description || '').trim();
    const existing = Array.isArray(projectInfo.existingQuestions) ? projectInfo.existingQuestions : [];

    if (!safeName) {
        const err = new Error('Nome do projeto é obrigatório.');
        err.statusCode = 400;
        throw err;
    }

    const startIndex = existing.length + 1;
    const isComplementary = existing.length > 0;

    let systemPrompt = '';
    let userPrompt = '';

    if (isComplementary) {
        systemPrompt = `Você é um Arquiteto de Software Sênior e Especialista em Governança do AI Second Brain.
O projeto "${safeName}" (Stack: "${stack}") já possui as seguintes perguntas de sabatina técnica:
${existing.map((eq, i) => `${i + 1}. [${eq.category || 'Requisitos'}] ${eq.question}`).join('\n')}

SUA MISSÃO:
Formule EXATAMENTE mais 3 a 4 perguntas COMPLEMENTARES que AINDA NÃO FORAM ABORDADAS.
Foque em aprofundar temas essenciais ainda em aberto, tais como:
- Performance & Cache (Redis, CDN, in-memory)
- Observabilidade & Logs estruturados (Winston, Pino, OpenTelemetry)
- Tratamento de Erros & Resiliência (Circuit Breakers, Retries, DLQ)
- CI/CD, Containerização e Deploy (Docker, GitHub Actions)
- Validação de Dados & Regras de Negócio (Zod, DTOs, Rich Domain)

DIRETRIZES:
1. Adapte as perguntas especificamente para a stack (${stack}).
2. Para cada pergunta, forneça de 3 a 4 opções curtas recomendadas (chips clicáveis) e um placeholder descritivo para resposta livre.
3. Numere os IDs como: "q${startIndex}", "q${startIndex + 1}", etc.
4. Idioma: Português do Brasil.
5. Responda ESTRITAMENTE em formato JSON válido, sem texto explicativo e sem cercas de markdown.`;

        userPrompt = `Gere 3 a 4 perguntas complementares e avançadas para aprofundar a sabatina do projeto "${safeName}".`;
    } else {
        systemPrompt = `Você é um Arquiteto de Software Sênior e Especialista em Governança do AI Second Brain.
O desenvolvedor está criando um novo projeto:
- Nome: "${safeName}"
- Stack Tecnológica: "${stack}"
- Descrição Inicial: "${description || 'Em concepção'}"

SUA MISSÃO:
Conduzir a Sabatina Técnica (Grill) inicial para este projeto.
Formule exatamente 3 a 4 perguntas cirúrgicas, práticas e decisivas para eliminar pontos cegos e ambiguidades antes de gerar os contratos de governança.

DIRETRIZES:
1. Adapte as perguntas especificamente para a stack (${stack}) e para o objetivo (${description}).
2. Exemplo: se for API/SaaS, pergunte sobre persistência, estilo de API e autenticação. Se for frontend/mobile, pergunte sobre gerenciamento de estado, consumo de API e offline-first. Se for CLI/automacao, pergunte sobre persistência e saída.
3. Para cada pergunta, forneça de 3 a 4 opções curtas recomendadas (chips clicáveis) e um placeholder descritivo para resposta livre.
4. Numere os IDs como: "q1", "q2", "q3", etc.
5. Idioma: Português do Brasil.
6. Responda ESTRITAMENTE em formato JSON válido, sem texto explicativo e sem cercas de markdown.

FORMATO DE RESPOSTA (JSON):
{
  "questions": [
    {
      "id": "q1",
      "category": "Dados & Persistência",
      "question": "Qual a estratégia principal de banco de dados e persistência?",
      "options": ["PostgreSQL (Relacional)", "MongoDB (Documentos)", "Redis / Em Memória", "Sem banco / Stateless"],
      "placeholder": "Ex: PostgreSQL com Prisma ORM"
    }
  ]
}`;
        userPrompt = `Gere as perguntas de sabatina técnica para o projeto "${safeName}" (Stack: ${stack}). Descrição: "${description || 'Nova aplicação'}".`;
    }

    const result = await aiGateway.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], { temperature: 0.3, maxTokens: 1500 });

    let parsed;
    try {
        parsed = aiGateway.parseJsonLoose(result.content);
    } catch (e) {
        // Fallback estruturado determinístico se o LLM responder fora do padrão
        if (isComplementary) {
            parsed = {
                questions: [
                    {
                        id: `q${startIndex}`,
                        category: 'Performance & Cache',
                        question: 'Qual será a estratégia de cache e otimização de latência?',
                        options: ['Redis Distribuído', 'Cache em Memória Local', 'CDN / Edge Cache', 'Sem cache inicial'],
                        placeholder: 'Ex: Redis para sessões e consultas frequentes'
                    },
                    {
                        id: `q${startIndex + 1}`,
                        category: 'Observabilidade & Logs',
                        question: 'Como serão estruturados os logs e métricas de diagnóstico?',
                        options: ['Logs estruturados JSON (Pino/Winston)', 'OpenTelemetry + Grafana', 'Sentry (Error Tracking)', 'Console simples'],
                        placeholder: 'Ex: Pino com logs JSON estruturados'
                    },
                    {
                        id: `q${startIndex + 2}`,
                        category: 'CI/CD & Containers',
                        question: 'Qual o ambiente de execução e pipeline de entrega contínua?',
                        options: ['Docker + GitHub Actions', 'Kubernetes / Helm', 'Serverless / Lambdas', 'Deploy direto na VM'],
                        placeholder: 'Ex: Dockerfile multi-stage com GitHub Actions'
                    },
                    {
                        id: `q${startIndex + 3}`,
                        category: 'Resiliência & Falhas',
                        question: 'Como a aplicação lidará com falhas de dependências externas?',
                        options: ['Retries com Exponential Backoff', 'Circuit Breaker', 'Dead Letter Queue', 'Fail fast com erro 500'],
                        placeholder: 'Ex: Retries com backoff exponencial'
                    }
                ]
            };
        } else {
            parsed = {
                questions: [
                    {
                        id: 'q1',
                        category: 'Dados & Persistência',
                        question: 'Qual a estratégia principal de banco de dados e persistência?',
                        options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite / Local'],
                        placeholder: 'Ex: PostgreSQL com migrations'
                    },
                    {
                        id: 'q2',
                        category: 'Arquitetura & API',
                        question: 'Qual estilo de comunicação e arquitetura será adotado?',
                        options: ['REST / OpenAPI', 'Modular Monolith', 'Clean Architecture', 'Event-Driven'],
                        placeholder: 'Ex: Clean Architecture com REST'
                    },
                    {
                        id: 'q3',
                        category: 'Segurança & Escopo',
                        question: 'Qual o modelo de autenticação e escopo inicial do MVP?',
                        options: ['JWT Token', 'API Key', 'OAuth2', 'Apenas escopo interno'],
                        placeholder: 'Ex: Autenticação via JWT'
                    }
                ]
            };
        }
    }

    const questions = Array.isArray(parsed.questions) && parsed.questions.length > 0
        ? parsed.questions
        : [];

    return {
        questions,
        model: result.model,
        provider: result.provider
    };
}

/**
 * Gera o rascunho dos 4 contratos com base nas respostas da sabatina.
 */
async function generateDraft(aiGateway, projectInfo, answers) {
    const rawName = (projectInfo.name || '').trim();
    const safeName = sanitizeProjectName(rawName);
    const stack = (projectInfo.stack || 'Não definida').trim();
    const description = (projectInfo.description || '').trim();
    const today = new Date().toISOString().split('T')[0];

    const answersList = Array.isArray(answers) ? answers : [];
    const formattedQA = answersList.map((a, idx) => {
        return `[Pergunta ${idx + 1}] ${a.question || ''}\nCategoria: ${a.category || ''}\nResposta do Desenvolvedor: ${a.answer || 'Não especificado'}`;
    }).join('\n\n');

    const systemPrompt = `Você é um Arquiteto de Software Sênior do AI Second Brain.
Sua missão é produzir os contratos fundamentais de governança técnica em Markdown para o novo projeto '${safeName}' com stack '${stack}'.

CONTEXTO DO PROJETO:
- Nome: ${safeName}
- Stack Principal: ${stack}
- Descrição Inicial: ${description || 'Em concepção'}
- Data: ${today}

RESPOSTAS DA SABATINA TÉCNICA (GRILL):
${formattedQA || 'Nenhuma resposta adicional informada.'}

REGRAS ABSOLUTAS:
1. Prioridade Determinística: favoreça soluções simples, sólidas e sem sobre-engenharia.
2. Zero Fabricação / Alucinação: ancore o conteúdo estritamente na stack informada, na descrição e nas respostas da sabatina. Não invente integrações ou dependências desnecessárias.
3. Idioma: Português do Brasil. Tom técnico, profissional e direto.
4. Responda ESTRITAMENTE com um objeto JSON contendo o Markdown completo de cada contrato.

CONTRATOS A GERAR:
1. "projectMd": Visão Geral, Escopo do MVP ('Dentro do Escopo' com 4-6 itens e 'Fora do Escopo' com 2-4 itens), Personas/Atores primários, Critérios de Sucesso e Links de Governança.
2. "architectureMd": Estilo Arquitetural, Camadas Lógicas, Decisão de Dados/Comunicação, e seção 'AI Decision Gate' (.agents/rules/01-ai-decision.md).
3. "currentStateMd": Status inicial '🟢 Em Planejamento / Ativo', O que já foi definido, e Roadmap Inicial dividido em 3 Marcos práticos (Marco 1: Fundação & Modelagem, Marco 2: Funcionalidades Centrais do MVP, Marco 3: Testes, Integrações & Observabilidade), com checkboxes '- [ ]' prontas para o checklist do Cockpit.
4. "adrMd": O arquivo ADR-0001 (sob DECISIONS/) registrando a decisão formal de adoção da stack e arquitetura inicial (Status: Aceita, Contexto, Decisão, Consequências Positivas/Negativas, Alternativas Consideradas).

FORMATO DE RESPOSTA (JSON):
{
  "projectMd": "# ${safeName}\\n\\n## Visão Geral\\n...\\n",
  "architectureMd": "# ${safeName} — Arquitetura\\n...\\n",
  "currentStateMd": "# ${safeName} — Estado Atual\\n...\\n",
  "adrMd": "# ADR-0001: Adoção da Stack Inicial e Arquitetura\\n...\\n"
}`;

    const userPrompt = `Gere os 4 contratos de governança completos para o projeto "${safeName}".`;

    const result = await aiGateway.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], { temperature: 0.3, maxTokens: 4000 });

    let parsed;
    try {
        parsed = aiGateway.parseJsonLoose(result.content);
    } catch (e) {
        throw new Error(`A IA retornou uma resposta inválida ao gerar os contratos: ${e.message}`);
    }

    return {
        contracts: {
            projectMd: String(parsed.projectMd || '').trim(),
            architectureMd: String(parsed.architectureMd || '').trim(),
            currentStateMd: String(parsed.currentStateMd || '').trim(),
            adrMd: String(parsed.adrMd || '').trim()
        },
        model: result.model,
        provider: result.provider
    };
}

/**
 * Refina os contratos existentes com base no feedback do desenvolvedor ("Prompt Vivo").
 */
async function refineDraft(aiGateway, projectInfo, currentContracts, feedback) {
    const rawName = (projectInfo.name || '').trim();
    const safeName = sanitizeProjectName(rawName);
    const stack = (projectInfo.stack || 'Não definida').trim();
    const fbText = String(feedback || '').trim();

    if (!fbText) {
        const err = new Error('Digite a instrução ou ajuste que deseja aplicar aos contratos.');
        err.statusCode = 400;
        throw err;
    }

    const systemPrompt = `Você é o Arquiteto de Software Sênior do AI Second Brain.
O desenvolvedor está revisando os contratos gerados para o projeto '${safeName}' (${stack}) e forneceu a seguinte instrução de ajuste/refinamento ("Prompt Vivo"):

INSTRUÇÃO DO DESENVOLVEDOR:
"${fbText}"

CONTRATOS ATUAIS:
--- PROJECT.md ---
${currentContracts.projectMd || ''}

--- ARCHITECTURE.md ---
${currentContracts.architectureMd || ''}

--- CURRENT_STATE.md ---
${currentContracts.currentStateMd || ''}

--- ADR-0001 ---
${currentContracts.adrMd || ''}

SUA MISSÃO:
Atualizar cirurgicamente os 4 contratos aplicando exatamente as correções e melhorias solicitadas.
Mantenha consistência entre todos os arquivos (por exemplo, se o banco mudar na arquitetura, atualize também o roadmap e o ADR).
Idioma: Português do Brasil.
Responda ESTRITAMENTE em formato JSON:
{
  "projectMd": "markdown atualizado...",
  "architectureMd": "markdown atualizado...",
  "currentStateMd": "markdown atualizado...",
  "adrMd": "markdown atualizado..."
}`;

    const result = await aiGateway.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Aplique a instrução: "${fbText}" em todos os contratos agora.` }
    ], { temperature: 0.25, maxTokens: 4000 });

    let parsed;
    try {
        parsed = aiGateway.parseJsonLoose(result.content);
    } catch (e) {
        throw new Error(`A IA retornou resposta inválida no refinamento: ${e.message}`);
    }

    return {
        contracts: {
            projectMd: String(parsed.projectMd || currentContracts.projectMd || '').trim(),
            architectureMd: String(parsed.architectureMd || currentContracts.architectureMd || '').trim(),
            currentStateMd: String(parsed.currentStateMd || currentContracts.currentStateMd || '').trim(),
            adrMd: String(parsed.adrMd || currentContracts.adrMd || '').trim()
        },
        model: result.model,
        provider: result.provider
    };
}

/**
 * Gravação física atômica dos contratos aprovados no disco rígido.
 */
function commitProject(rootDir, projectInfo, contracts, options = {}) {
    const rawName = (projectInfo.name || '').trim();
    const safeName = sanitizeProjectName(rawName);
    const stack = (projectInfo.stack || 'Não definida').trim();
    const description = (projectInfo.description || 'Projeto criado no AI Second Brain').trim();
    const initGit = options.initGit !== false;
    const today = new Date().toISOString().split('T')[0];

    if (!safeName) {
        const err = new Error('Nome do projeto é obrigatório.');
        err.statusCode = 400;
        throw err;
    }

    const projectsDir = path.join(rootDir, 'projects');
    const targetFolder = path.join(projectsDir, safeName);

    if (fs.existsSync(targetFolder)) {
        const err = new Error(`Já existe um projeto chamado '${safeName}'.`);
        err.statusCode = 409;
        throw err;
    }

    // Cria diretórios da governança
    fs.mkdirSync(targetFolder, { recursive: true });
    fs.mkdirSync(path.join(targetFolder, 'DECISIONS'), { recursive: true });
    fs.mkdirSync(path.join(targetFolder, 'MEMORY', 'sessions'), { recursive: true });

    // 1. PROJECT.md
    const projectContent = (contracts && contracts.projectMd) || `# ${safeName}

## Visão Geral
${description}

## Informações Gerais
- **Tipo**: Greenfield / Projeto Novo
- **Stack Inicial**: ${stack}
- **Status**: 🟢 Em Planejamento / Ativo
- **Data de Criação**: ${today}

## Links & Governança
- Estado Atual: [CURRENT_STATE.md](CURRENT_STATE.md)
- Arquitetura: [ARCHITECTURE.md](ARCHITECTURE.md)
- Lições Aprendidas: [LESSONS_LEARNED.md](LESSONS_LEARNED.md)
- Decisões Técnicas: \`DECISIONS/\`
- Memória de Sessões: \`MEMORY/sessions/\`
`;

    // 2. ARCHITECTURE.md
    const archContent = (contracts && contracts.architectureMd) || `# ${safeName} — Arquitetura da Solução

> Visão arquitetural, padrões e design do sistema.

## 1. Stack Tecnológica
- **Linguagem / Framework**: ${stack}

## 2. Princípios Adotados
- Código idiomático, modular e testável.
- Se utilizar IA: aplicar o AI Decision Gate (\`.agents/rules/01-ai-decision.md\`).
`;

    // 3. CURRENT_STATE.md
    const stateContent = (contracts && contracts.currentStateMd) || `# ${safeName} — Estado Atual

> Última atualização: ${today}

## Status: 🟢 Em Planejamento / Ativo

## O que já foi definido
- [x] Inicialização no AI Second Brain com governança e memória ativa.
- [x] Stack selecionada: **${stack}**.

## Próximos Passos
1. Definir os requisitos centrais do sistema.
2. Registrar a primeira decisão de arquitetura em \`DECISIONS/\`.
`;

    // 4. ADR-0001
    const adrContent = (contracts && contracts.adrMd) || `# ADR-0001: Adoção da Stack Inicial (${stack})

## Status
Aceita

## Contexto
Inicialização do projeto ${safeName} no AI Second Brain.

## Decisão
Adotada a stack ${stack} para suportar os objetivos do sistema.

## Consequências
Padronização de ambiente e suporte à governança de IA.

## Alternativas Consideradas
Strotegias alternativas avaliadas durante o onboarding.
`;

    // 5. LESSONS_LEARNED.md
    const lessonsContent = `# ${safeName} — Lições Aprendidas

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

    // 6. Pontes Multi-IA
    const bridgeContent = `# Governança de IA — ${safeName}

> Este projeto é governado pelo AI Second Brain.
> Cérebro Central: \`${rootDir}\`

## ANTES DE EXECUTAR QUALQUER TAREFA
1. Consulte o estado atual em: [CURRENT_STATE.md](CURRENT_STATE.md)
2. Consulte os requisitos e visão geral em: [PROJECT.md](PROJECT.md)
3. Consulte as decisões arquiteturais em: DECISIONS/
4. Consulte as lições aprendidas deste projeto em: [LESSONS_LEARNED.md](LESSONS_LEARNED.md)
5. Consulte as lições aprendidas globais em: \`${path.join(rootDir, 'memory', 'lessons-learned.md')}\`
6. REGRAS ABSOLUTAS:
   - NUNCA crie catálogos ou listas fixas/hardcoded de modelos de IA no código ou HTML. O catálogo deve ser 100% dinâmico via API em tempo real.
   - Sempre utilize código determinístico antes de recorrer a LLMs.
   - NUNCA invente contexto ou regras especulativas sem solicitação expressa do desenvolvedor.
`;

    // 7. .gitignore
    const gitignoreContent = `# Dependências & Build
node_modules/
bin/
obj/
dist/
build/
.cache/

# Variáveis de ambiente & Segredos
.env
.env.*
*.key
*.pem

# Sistema Operacional & IDE
.DS_Store
Thumbs.db
.vs/
.vscode/
`;

    fs.writeFileSync(path.join(targetFolder, 'PROJECT.md'), projectContent, 'utf-8');
    fs.writeFileSync(path.join(targetFolder, 'CURRENT_STATE.md'), stateContent, 'utf-8');
    fs.writeFileSync(path.join(targetFolder, 'ARCHITECTURE.md'), archContent, 'utf-8');
    fs.writeFileSync(path.join(targetFolder, 'DECISIONS', 'ADR-0001-stack-inicial.md'), adrContent, 'utf-8');
    fs.writeFileSync(path.join(targetFolder, 'LESSONS_LEARNED.md'), lessonsContent, 'utf-8');
    fs.writeFileSync(path.join(targetFolder, 'AGENTS.md'), bridgeContent, 'utf-8');
    fs.writeFileSync(path.join(targetFolder, 'GEMINI.md'), bridgeContent, 'utf-8');
    fs.writeFileSync(path.join(targetFolder, '.cursorrules'), bridgeContent, 'utf-8');
    fs.writeFileSync(path.join(targetFolder, 'CLAUDE.md'), bridgeContent, 'utf-8');
    fs.writeFileSync(path.join(targetFolder, '.gitignore'), gitignoreContent, 'utf-8');

    // 8. git init opcional
    let gitInitialized = false;
    if (initGit) {
        try {
            execSync('git init -b main', { cwd: targetFolder, timeout: 5000, stdio: 'ignore' });
            gitInitialized = true;
        } catch (_) {
            try {
                execSync('git init', { cwd: targetFolder, timeout: 5000, stdio: 'ignore' });
                gitInitialized = true;
            } catch (__) {}
        }
    }

    return {
        success: true,
        projectPath: targetFolder,
        folderName: safeName,
        gitInitialized
    };
}

/**
 * Valida a coerência semântica e completude de todas as respostas da sabatina.
 */
async function validateAnswers(aiGateway, projectInfo, questions, answers) {
    const qList = Array.isArray(questions) ? questions : [];
    const aList = Array.isArray(answers) ? answers : [];

    // 1. Validar se todas as perguntas foram respondidas
    for (let i = 0; i < qList.length; i++) {
        const q = qList[i];
        const a = aList.find(ans => String(ans.id) === String(q.id)) || aList[i];
        const val = a && typeof a.answer === 'string' ? a.answer.trim() : '';

        if (!val) {
            return {
                valid: false,
                issue: {
                    questionId: q.id || i,
                    questionTitle: q.question,
                    category: q.category || 'Decisão Técnica',
                    invalidAnswer: '(não respondida)',
                    reason: 'Esta pergunta precisa ser respondida antes de prosseguir com a geração dos contratos.',
                    suggestion: q.placeholder || (q.options ? q.options.join(', ') : 'Descreva a abordagem técnica desejada.')
                }
            };
        }
    }

    // 2. Analisar cada resposta preenchida
    for (let i = 0; i < qList.length; i++) {
        const q = qList[i];
        const a = aList.find(ans => String(ans.id) === String(q.id)) || aList[i];
        const val = a && typeof a.answer === 'string' ? a.answer.trim() : '';

        // Se a resposta bate exatamente ou parcialmente com uma das opções sugeridas, é garantidamente válida
        const matchesOption = Array.isArray(q.options) && q.options.some(opt => {
            const cleanOpt = opt.toLowerCase().split('(')[0].trim();
            const cleanVal = val.toLowerCase().trim();
            return cleanVal === opt.toLowerCase().trim() || cleanVal.includes(cleanOpt) || cleanOpt.includes(cleanVal);
        });

        if (matchesOption) {
            continue;
        }

        // Heurística rápida determinística de resposta inválida/sem sentido
        // a) Muito curta (< 3 caracteres, ex: "m", "1", "a", "ok")
        if (val.length < 3) {
            const sample = q.options && q.options[0] ? q.options[0] : (q.placeholder || 'uma resposta descritiva');
            return {
                valid: false,
                issue: {
                    questionId: q.id || i,
                    questionTitle: q.question,
                    category: q.category || 'Decisão Técnica',
                    invalidAnswer: val,
                    reason: `A resposta "${val}" é muito curta e não define uma decisão arquitetural para o projeto.`,
                    suggestion: `Você pode escolher uma das alternativas sugeridas (ex: "${sample}") ou descrever a estratégia técnica desejada.`
                }
            };
        }

        // b) Padrões conhecidos de digitação aleatória / nonsense
        const lower = val.toLowerCase();
        const isRepeated = /^(.)\1+$/.test(lower);
        const isCommonGibberish = /^(asdf|asdfgh|qwerty|123|1234|teste|test|sei\s*l[aá]|n[aã]o\s*sei|tanto\s*faz|qualquer|bla|xyz|abc|batata)$/i.test(lower);
        if (isRepeated || isCommonGibberish) {
            const sample = q.options && q.options[0] ? q.options[0] : (q.placeholder || 'uma resposta descritiva');
            return {
                valid: false,
                issue: {
                    questionId: q.id || i,
                    questionTitle: q.question,
                    category: q.category || 'Decisão Técnica',
                    invalidAnswer: val,
                    reason: `A resposta "${val}" não parece fazer sentido técnico para esta pergunta.`,
                    suggestion: `Escolha uma das opções da pergunta ou informe uma tecnologia real (ex: "${sample}").`
                }
            };
        }

        // c) Avaliação Semântica com IA para respostas livres digitadas
        if (aiGateway && typeof aiGateway.chatCompletion === 'function') {
            try {
                const prompt = `Você é um auditor sênior de arquitetura de software.
Avalie se a resposta digitada pelo desenvolvedor FAZ SENTIDO no contexto de engenharia de software para a pergunta feita:
Pergunta: "${q.question}" (Categoria: "${q.category || 'Geral'}")
Stack do Projeto: "${projectInfo?.stack || 'Geral'}"
Resposta digitada: "${val}"

Critérios:
- Se for uma tecnologia, biblioteca, framework, padrão, conceito ou justificativa aceitável de desenvolvimento de software, retorne isValid: true.
- Se for aleatória, sem sentido, piada, gíria vazia ou não responder minimamente à decisão técnica (ex: "m", "batata", "carro azul", "sei lá qualquer coisa"), retorne isValid: false.

Responda ESTRITAMENTE em formato JSON:
{
  "isValid": true,
  "reason": "Explicação curta caso seja falso",
  "suggestion": "Sugestão prática do que o dev poderia responder com 2 exemplos rápidos"
}`;

                const aiRes = await aiGateway.chatCompletion([
                    { role: 'user', content: prompt }
                ], { temperature: 0.1, maxTokens: 400 });

                const evalJson = aiGateway.parseJsonLoose(aiRes.content);
                if (evalJson && evalJson.isValid === false) {
                    return {
                        valid: false,
                        issue: {
                            questionId: q.id || i,
                            questionTitle: q.question,
                            category: q.category || 'Decisão Técnica',
                            invalidAnswer: val,
                            reason: evalJson.reason || `A resposta "${val}" não parece responder a esta decisão técnica.`,
                            suggestion: evalJson.suggestion || (q.options ? `Considere uma destas alternativas: ${q.options.slice(0, 3).join(', ')}.` : 'Informe uma tecnologia ou estratégia válida.')
                        }
                    };
                }
            } catch (evalErr) {
                console.warn('⚠️ [Grill Validator] Fallback determinístico na validação de resposta:', evalErr.message);
            }
        }
    }

    return { valid: true };
}

module.exports = {
    sanitizeProjectName,
    generateQuestions,
    generateDraft,
    refineDraft,
    commitProject,
    validateAnswers
};
