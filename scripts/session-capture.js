'use strict';
/**
 * AI SECOND BRAIN — Session Capture
 *
 * Transforma o material bruto de uma sessão de trabalho (commits, arquivos alterados,
 * notas do desenvolvedor) em registros de memória revisáveis.
 *
 * Divisão de responsabilidades (AI Decision Gate):
 *   - DETERMINÍSTICO (este módulo): coletar contexto no git, montar o prompt, validar e
 *     normalizar o JSON devolvido pela IA, atualizar CURRENT_STATE.md em tempo de escrita
 *     e gravar arquivos com validação de caminho.
 *   - LLM (scripts/ai-gateway.js → summarizeSession): apenas a redação textual do resumo.
 *
 * Segurança:
 *   - Nunca envia o conteúdo (patch) dos arquivos para a IA: apenas mensagens de commit,
 *     nomes de arquivos e diffstat. Arquivos potencialmente sensíveis têm o nome omitido.
 *   - Nada é gravado em disco antes da confirmação explícita do usuário (rota /commit).
 *   - Todo dado vindo do cliente é re-sanitizado no servidor antes de ser gravado.
 *
 * Zero dependências externas.
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const GIT_TIMEOUT_MS = 8000;

const LIMITS = {
    notes: 12000,
    commits: 40,
    statusLines: 60,
    statLines: 60,
    title: 90,
    item: 220,
    listItems: 10,
    lessons: 5,
    adrs: 3,
    markdown: 8000,
    lessonField: 600,
    projectMd: 3500,
    stateItems: 25,
    sessionExcerpt: 1200,
    recentSessions: 3
};

// Nomes de arquivo que nunca devem aparecer no contexto enviado à IA
const SENSITIVE_RE = /(^|[\\/])\.env($|\.)|\.(pem|key|pfx|p12)$|id_rsa|(^|[\\/])(secrets?|credentials?)[.\-_]/i;

// ─────────────────────────────────────────────────────────────
// Utilitários
// ─────────────────────────────────────────────────────────────
function httpError(statusCode, message) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}

const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

function cleanLine(value, max) {
    return String(value == null ? '' : value)
        .replace(CONTROL_CHARS_RE, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, max);
}

function cleanMarkdown(value, max) {
    return String(value == null ? '' : value)
        .replace(CONTROL_CHARS_RE, '')
        .replace(/\r\n/g, '\n')
        .trim()
        .slice(0, max);
}

function normalizeKey(text) {
    return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function slugify(text) {
    return normalizeKey(text).replace(/\s+/g, '-').slice(0, 50).replace(/^-+|-+$/g, '') || 'sessao';
}

function todayISO() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function readTextSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (_) {
        return '';
    }
}

/** Resolve e valida o diretório do projeto dentro de projects/ (bloqueia path traversal). */
function resolveProjectDir(rootDir, projectName) {
    const name = String(projectName || '').trim();
    if (!name || name === '.' || name === '..' || /[\\/:*?"<>|\0]/.test(name)) {
        throw httpError(400, 'Nome de projeto inválido.');
    }
    const base = path.join(rootDir, 'projects');
    const dir = path.join(base, name);
    if (path.dirname(dir) !== base) {
        throw httpError(400, 'Nome de projeto inválido.');
    }
    if (!fs.existsSync(dir)) {
        throw httpError(404, `Projeto '${name}' não encontrado.`);
    }
    return { name, dir };
}

// ─────────────────────────────────────────────────────────────
// CURRENT_STATE.md — parsing e atualização cirúrgica
// ─────────────────────────────────────────────────────────────
const LIST_LINE_RE = /^\s*(?:\d+\.|[-*])\s+/;
const DEFINED_HEADING_RE = /^##\s+O que já foi definido\b/i;
const NEXT_HEADING_RE = /^##\s+Próximos Passos\b/i;

function splitLines(md) {
    const eol = /\r\n/.test(md) ? '\r\n' : '\n';
    return { lines: String(md || '').split(/\r?\n/), eol };
}

function sectionBody(lines, headingRe) {
    const start = lines.findIndex(l => headingRe.test(l));
    if (start === -1) return null;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
        if (/^##\s/.test(lines[i])) { end = i; break; }
    }
    return { start, end, body: lines.slice(start + 1, end) };
}

function listItemsOf(bodyLines) {
    return bodyLines
        .filter(l => LIST_LINE_RE.test(l))
        .map(l => l.replace(/^\s*(?:\d+\.|[-*])\s+(?:\[[ xX]\]\s*)?/, '').trim())
        .filter(Boolean);
}

function parseStateSections(md) {
    const { lines } = splitLines(md);
    const defined = sectionBody(lines, DEFINED_HEADING_RE);
    const next = sectionBody(lines, NEXT_HEADING_RE);
    const statusMatch = String(md || '').match(/##\s+Status:\s*([^\n\r]+)/i);
    return {
        status: statusMatch ? statusMatch[1].trim() : '',
        definedItems: defined ? listItemsOf(defined.body) : [],
        nextSteps: next ? listItemsOf(next.body) : []
    };
}

function rewriteSection(lines, headingRe, headingText, rewriteFn) {
    const sec = sectionBody(lines, headingRe);
    if (!sec) {
        while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
        lines.push('', headingText, ...rewriteFn([]));
        return;
    }
    lines.splice(sec.start + 1, sec.end - sec.start - 1, ...rewriteFn(sec.body));
}

/**
 * Aplica as mudanças aprovadas ao CURRENT_STATE.md preservando todo o restante do arquivo.
 * @returns {{ markdown: string, movedSteps: number, addedDefined: number, addedSteps: number }}
 */
function applyStateUpdate(currentMd, projectName, update, today) {
    const base = String(currentMd || '').trim()
        ? String(currentMd)
        : `# ${projectName} — Estado Atual\n\n> Última atualização: ${today}\n\n## Status: 🟢 Ativo / Em Desenvolvimento\n`;

    const { lines, eol } = splitLines(base);
    const completedKeys = new Set(update.completedSteps.map(normalizeKey));
    const result = { movedSteps: 0, addedDefined: 0, addedSteps: 0 };

    // 1) Próximos Passos: remove concluídos, adiciona novos, renumera
    const stepsMoved = [];
    rewriteSection(lines, NEXT_HEADING_RE, '## Próximos Passos', body => {
        const others = body.filter(l => !LIST_LINE_RE.test(l) && l.trim() !== '');
        const kept = [];
        for (const item of listItemsOf(body)) {
            if (completedKeys.has(normalizeKey(item))) {
                stepsMoved.push(item);
                result.movedSteps++;
            } else {
                kept.push(item);
            }
        }
        const keptKeys = new Set(kept.map(normalizeKey));
        for (const step of update.newNextSteps) {
            if (!keptKeys.has(normalizeKey(step))) {
                kept.push(step);
                keptKeys.add(normalizeKey(step));
                result.addedSteps++;
            }
        }
        const out = [...others];
        kept.forEach((s, i) => out.push(`${i + 1}. ${s}`));
        out.push('');
        return out;
    });

    // 2) O que já foi definido: concluídos + novos itens (sem duplicar)
    const toDefine = [...stepsMoved, ...update.newDefinedItems];
    rewriteSection(lines, DEFINED_HEADING_RE, '## O que já foi definido', body => {
        const out = [...body];
        while (out.length && out[out.length - 1].trim() === '') out.pop();
        const existing = new Set(listItemsOf(body).map(normalizeKey));
        for (const item of toDefine) {
            if (!existing.has(normalizeKey(item))) {
                out.push(`- [x] ${item}`);
                existing.add(normalizeKey(item));
                result.addedDefined++;
            }
        }
        out.push('');
        return out;
    });

    let markdown = lines.join(eol);
    if (/^>\s*Última atualização:.*$/m.test(markdown)) {
        markdown = markdown.replace(/^>\s*Última atualização:.*$/m, `> Última atualização: ${today}`);
    }
    if (!markdown.endsWith(eol)) markdown += eol;
    return { markdown, ...result };
}

// ─────────────────────────────────────────────────────────────
// Coleta determinística de contexto
// ─────────────────────────────────────────────────────────────
function runGit(args, cwd) {
    return new Promise(resolve => {
        execFile(
            'git',
            ['-c', 'core.quotepath=off', ...args],
            { cwd, timeout: GIT_TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024, windowsHide: true },
            (err, stdout) => resolve(err ? null : String(stdout).trim())
        );
    });
}

function listSessionFiles(projectDir) {
    const dir = path.join(projectDir, 'MEMORY', 'sessions');
    try {
        return fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort().reverse();
    } catch (_) {
        return [];
    }
}

function maskSensitive(line) {
    return SENSITIVE_RE.test(line) ? '(arquivo sensível omitido)' : line;
}

async function collectGitContext(projectDir, sessionFiles) {
    let cwd = projectDir;
    try { cwd = fs.realpathSync(projectDir); } catch (_) {}

    const inside = await runGit(['rev-parse', '--is-inside-work-tree'], cwd);
    if (inside !== 'true') {
        return { available: false, reason: 'O diretório do projeto não está em um repositório Git acessível.' };
    }

    const lastSession = sessionFiles.map(f => (f.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1]).find(Boolean) || null;

    const logArgs = ['log', '--no-merges', '--date=short', '--pretty=format:%h|%ad|%s', '-n', String(LIMITS.commits)];
    if (lastSession) logArgs.push(`--since=${lastSession}`);
    logArgs.push('--', '.');

    const [branch, logOut, statusOut, statOut] = await Promise.all([
        runGit(['rev-parse', '--abbrev-ref', 'HEAD'], cwd),
        runGit(logArgs, cwd),
        runGit(['status', '--porcelain', '--', '.'], cwd),
        runGit(['diff', 'HEAD', '--stat', '--stat-width=110', '--', '.'], cwd)
    ]);

    const commits = (logOut || '')
        .split('\n')
        .filter(Boolean)
        .map(l => {
            const [hash, date, ...rest] = l.split('|');
            return { hash, date, subject: cleanLine(rest.join('|'), 200) };
        });

    const changedFiles = (statusOut || '')
        .split('\n')
        .filter(Boolean)
        .map(maskSensitive);

    const diffStat = (statOut || '')
        .split('\n')
        .filter(Boolean)
        .map(maskSensitive)
        .slice(0, LIMITS.statLines);

    return {
        available: true,
        branch: branch || '',
        since: lastSession,
        commits,
        changedFilesTotal: changedFiles.length,
        changedFiles: changedFiles.slice(0, LIMITS.statusLines),
        diffStat
    };
}

function readProjectSnapshot(projectDir, sessionFiles) {
    const projectMd = readTextSafe(path.join(projectDir, 'PROJECT.md')).slice(0, LIMITS.projectMd);
    const stateMd = readTextSafe(path.join(projectDir, 'CURRENT_STATE.md'));
    const state = parseStateSections(stateMd);

    const lessonsMd = readTextSafe(path.join(projectDir, 'LESSONS_LEARNED.md'));
    const lessonTitles = (lessonsMd.match(/^#{2,3}\s+.+$/gm) || [])
        .map(h => h.replace(/^#{2,3}\s+/, '').trim())
        .slice(-30);

    const recentSessions = sessionFiles.slice(0, LIMITS.recentSessions).map(f => ({
        name: f,
        excerpt: readTextSafe(path.join(projectDir, 'MEMORY', 'sessions', f)).slice(0, LIMITS.sessionExcerpt)
    }));

    return { projectMd, stateMd, state, lessonTitles, recentSessions };
}

function buildPromptContext({ name, snapshot, git, notes }) {
    const parts = [];
    parts.push(`# PROJETO: ${name}`);
    parts.push(`## DATA DE HOJE\n${todayISO()}`);

    if (snapshot.projectMd.trim()) parts.push(`## PROJECT.md (trecho)\n${snapshot.projectMd.trim()}`);

    const steps = snapshot.state.nextSteps;
    parts.push(
        '## PRÓXIMOS PASSOS ATUAIS (numerados — use estes números em completedNextStepIndexes)\n' +
        (steps.length ? steps.map((s, i) => `${i + 1}. ${s}`).join('\n') : '(nenhum registrado)')
    );

    const defined = snapshot.state.definedItems.slice(-LIMITS.stateItems);
    parts.push('## JÁ DEFINIDO / CONCLUÍDO (não repita)\n' + (defined.length ? defined.map(d => `- ${d}`).join('\n') : '(vazio)'));

    if (snapshot.lessonTitles.length) {
        parts.push('## LIÇÕES JÁ REGISTRADAS (não repita)\n' + snapshot.lessonTitles.map(t => `- ${t}`).join('\n'));
    }

    if (snapshot.recentSessions.length) {
        parts.push(
            '## SESSÕES RECENTES (trechos, para continuidade)\n' +
            snapshot.recentSessions.map(s => `### ${s.name}\n${s.excerpt}`).join('\n\n')
        );
    }

    if (git.available) {
        parts.push(`## GIT — branch: ${git.branch || '?'}${git.since ? ` · commits desde ${git.since}` : ' · últimos commits'}`);
        parts.push(
            '### Commits\n' +
            (git.commits.length ? git.commits.map(c => `- ${c.hash} (${c.date}) ${c.subject}`).join('\n') : '(nenhum commit no período)')
        );
        parts.push(
            `### Arquivos modificados e ainda não commitados (${git.changedFilesTotal})\n` +
            (git.changedFiles.length ? git.changedFiles.join('\n') : '(nenhum)')
        );
        if (git.diffStat.length) parts.push('### Diffstat (HEAD → working tree)\n' + git.diffStat.join('\n'));
    } else {
        parts.push(`## GIT\nIndisponível: ${git.reason}`);
    }

    parts.push('## NOTAS DO DESENVOLVEDOR\n' + (notes ? notes : '(nenhuma nota fornecida)'));
    return parts.join('\n\n');
}

/**
 * Prepara tudo que é necessário para pedir o rascunho à IA (100% determinístico).
 */
async function prepareDraftInput(rootDir, projectName, rawNotes) {
    const { name, dir } = resolveProjectDir(rootDir, projectName);
    const notes = cleanMarkdown(rawNotes, LIMITS.notes);
    const sessionFiles = listSessionFiles(dir);
    const [git, snapshot] = await Promise.all([
        collectGitContext(dir, sessionFiles),
        Promise.resolve(readProjectSnapshot(dir, sessionFiles))
    ]);

    const hasSignal = !!notes || (git.available && (git.commits.length > 0 || git.changedFilesTotal > 0));
    if (!hasSignal) {
        throw httpError(
            422,
            git.available
                ? 'Nada para registrar: não há commits novos, arquivos alterados nem notas. Descreva o que foi feito no campo de notas.'
                : 'Nada para registrar: o Git não está disponível para este projeto. Descreva o que foi feito no campo de notas.'
        );
    }

    return {
        name,
        git,
        state: snapshot.state,
        promptText: buildPromptContext({ name, snapshot, git, notes }),
        gitSummary: git.available
            ? {
                available: true,
                branch: git.branch,
                since: git.since,
                commits: git.commits.length,
                changedFiles: git.changedFilesTotal
            }
            : { available: false, reason: git.reason }
    };
}

// ─────────────────────────────────────────────────────────────
// Validação do rascunho gerado pela IA
// ─────────────────────────────────────────────────────────────
function uniqueStrings(list, existingKeys, max) {
    const seen = new Set(existingKeys);
    const out = [];
    for (const raw of Array.isArray(list) ? list : []) {
        const text = cleanLine(typeof raw === 'string' ? raw : (raw && (raw.text || raw.title)) || '', LIMITS.item);
        const key = normalizeKey(text);
        if (!text || !key || seen.has(key)) continue;
        seen.add(key);
        out.push(text);
        if (out.length >= max) break;
    }
    return out;
}

function normalizeLessons(list) {
    const out = [];
    for (const l of Array.isArray(list) ? list : []) {
        if (!l || typeof l !== 'object') continue;
        const title = cleanLine(l.title, LIMITS.title);
        const learning = cleanLine(l.learning, LIMITS.lessonField);
        if (!title || !learning) continue;
        out.push({
            title,
            context: cleanLine(l.context, LIMITS.lessonField),
            learning,
            action: cleanLine(l.action, LIMITS.lessonField)
        });
        if (out.length >= LIMITS.lessons) break;
    }
    return out;
}

function stripLeadingH1(md) {
    return md.replace(/^#\s+.*\n+/, '').trim();
}

/**
 * Normaliza e valida o JSON da IA contra o estado real do projeto.
 * Nunca confia em índices/textos: tudo é verificado contra CURRENT_STATE.md.
 */
function normalizeDraft(raw, state) {
    if (!raw || typeof raw !== 'object') {
        throw httpError(502, 'A IA retornou um rascunho inválido. Tente novamente.');
    }

    const summary = stripLeadingH1(cleanMarkdown(raw.summaryMarkdown, LIMITS.markdown));
    if (!summary) {
        throw httpError(502, 'A IA não gerou o resumo da sessão. Tente novamente ou adicione mais detalhes nas notas.');
    }

    const completedIdx = [];
    for (const n of Array.isArray(raw.completedNextStepIndexes) ? raw.completedNextStepIndexes : []) {
        const i = parseInt(n, 10);
        if (Number.isInteger(i) && i >= 1 && i <= state.nextSteps.length && !completedIdx.includes(i)) completedIdx.push(i);
    }
    const completedSteps = completedIdx.map(i => ({ index: i, text: state.nextSteps[i - 1] }));

    const knownDefined = state.definedItems.map(normalizeKey);
    const completedKeys = completedSteps.map(s => normalizeKey(s.text));
    const newDefinedItems = uniqueStrings(raw.newDefinedItems, [...knownDefined, ...completedKeys], LIMITS.listItems);

    const remaining = state.nextSteps.filter((_, i) => !completedIdx.includes(i + 1));
    const newNextSteps = uniqueStrings(
        raw.newNextSteps,
        [...remaining.map(normalizeKey), ...completedKeys, ...newDefinedItems.map(normalizeKey)],
        LIMITS.listItems
    );

    const adrCandidates = [];
    for (const a of Array.isArray(raw.adrCandidates) ? raw.adrCandidates : []) {
        const title = cleanLine(a && a.title, LIMITS.title);
        if (!title) continue;
        adrCandidates.push({ title, reason: cleanLine(a.reason, LIMITS.item) });
        if (adrCandidates.length >= LIMITS.adrs) break;
    }

    return {
        title: cleanLine(raw.title, LIMITS.title) || 'Sessão de trabalho',
        summaryMarkdown: summary,
        completedSteps,
        newDefinedItems,
        newNextSteps,
        lessons: normalizeLessons(raw.lessons),
        adrCandidates
    };
}

// ─────────────────────────────────────────────────────────────
// Gravação (somente após confirmação do usuário)
// ─────────────────────────────────────────────────────────────
function sanitizeCommitPayload(body) {
    const b = body && typeof body === 'object' ? body : {};
    const strings = (list, max) => uniqueStrings(list, [], max);
    const title = cleanLine(b.title, LIMITS.title);
    const summaryMarkdown = stripLeadingH1(cleanMarkdown(b.summaryMarkdown, LIMITS.markdown));
    if (!title) throw httpError(400, 'Informe um título para a sessão.');
    if (!summaryMarkdown) throw httpError(400, 'O resumo da sessão não pode ficar vazio.');
    return {
        title,
        summaryMarkdown,
        completedSteps: strings(b.completedSteps, LIMITS.listItems),
        newDefinedItems: strings(b.newDefinedItems, LIMITS.listItems),
        newNextSteps: strings(b.newNextSteps, LIMITS.listItems),
        lessons: normalizeLessons(b.lessons),
        model: cleanLine(b.model, 80)
    };
}

function uniqueSessionFile(sessionsDir, base) {
    let candidate = `${base}.md`;
    let n = 2;
    while (fs.existsSync(path.join(sessionsDir, candidate))) {
        candidate = `${base}-${n++}.md`;
    }
    return candidate;
}

function writeAtomic(filePath, content) {
    const tmp = `${filePath}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, content, 'utf-8');
    fs.renameSync(tmp, filePath);
}

function commitSession(rootDir, projectName, body) {
    const { name, dir } = resolveProjectDir(rootDir, projectName);
    const payload = sanitizeCommitPayload(body);
    const today = todayISO();

    // 1) Arquivo de sessão (nunca sobrescreve)
    const sessionsDir = path.join(dir, 'MEMORY', 'sessions');
    fs.mkdirSync(sessionsDir, { recursive: true });
    const fileName = uniqueSessionFile(sessionsDir, `${today}-${slugify(payload.title)}`);
    const header =
        `# Sessão ${today} — ${payload.title}\n\n` +
        `> Registro gerado com apoio de IA${payload.model ? ` (${payload.model})` : ''} e revisado pelo desenvolvedor antes de gravar.\n\n`;
    fs.writeFileSync(path.join(sessionsDir, fileName), `${header}${payload.summaryMarkdown}\n`, { encoding: 'utf-8', flag: 'wx' });

    // 2) CURRENT_STATE.md (atualização cirúrgica)
    const statePath = path.join(dir, 'CURRENT_STATE.md');
    const hasStateChanges = payload.completedSteps.length || payload.newDefinedItems.length || payload.newNextSteps.length;
    let stateResult = { movedSteps: 0, addedDefined: 0, addedSteps: 0 };
    if (hasStateChanges) {
        const updated = applyStateUpdate(readTextSafe(statePath), name, payload, today);
        writeAtomic(statePath, updated.markdown);
        stateResult = updated;
    }

    // 3) LESSONS_LEARNED.md (append)
    let lessonsAdded = 0;
    if (payload.lessons.length) {
        const lessonsPath = path.join(dir, 'LESSONS_LEARNED.md');
        let current = readTextSafe(lessonsPath);
        if (!current.trim()) current = `# Lições Aprendidas — ${name}\n\n`;
        const known = new Set((current.match(/^#{2,3}\s+.+$/gm) || []).map(h => normalizeKey(h.replace(/^#{2,3}\s+/, ''))));
        let block = '';
        for (const l of payload.lessons) {
            const heading = `${today} — ${l.title}`;
            if (known.has(normalizeKey(heading)) || known.has(normalizeKey(l.title))) continue;
            block += `\n## ${heading}\n\n`;
            if (l.context) block += `**Contexto**: ${l.context}\n`;
            block += `**Aprendizado**: ${l.learning}\n`;
            if (l.action) block += `**Ação**: ${l.action}\n`;
            lessonsAdded++;
        }
        if (block) writeAtomic(lessonsPath, current.replace(/\s*$/, '\n') + block);
    }

    return {
        sessionFile: `projects/${name}/MEMORY/sessions/${fileName}`,
        sessionFileName: fileName,
        movedSteps: stateResult.movedSteps,
        addedDefined: stateResult.addedDefined,
        addedSteps: stateResult.addedSteps,
        lessonsAdded
    };
}

module.exports = {
    LIMITS,
    resolveProjectDir,
    prepareDraftInput,
    normalizeDraft,
    commitSession,
    // expostos para testes
    parseStateSections,
    applyStateUpdate,
    sanitizeCommitPayload,
    collectGitContext,
    slugify
};
