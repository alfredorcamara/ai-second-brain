/**
 * AI SECOND BRAIN — Research Lab Execution Engine
 * Motor autônomo de varredura, síntese e catalogação de conhecimento em Markdown
 */

const fs = require('fs');
const path = require('path');
const groq = require('./groq-client');

const ROOT_DIR = path.resolve(__dirname, '..');

// Mapa de pesquisas em execução no momento para evitar concorrência desordenada
const activeRuns = new Map();

/**
 * Lê o contexto do projeto (PROJECT.md + ARCHITECTURE.md)
 */
function getProjectContext(projectName) {
    const projectDir = path.join(ROOT_DIR, 'projects', projectName);
    const parts = [];
    const projectMdPath = path.join(projectDir, 'PROJECT.md');
    const archMdPath = path.join(projectDir, 'ARCHITECTURE.md');

    if (fs.existsSync(projectMdPath)) {
        parts.push('--- PROJECT.md ---\n' + fs.readFileSync(projectMdPath, 'utf-8'));
    }
    if (fs.existsSync(archMdPath)) {
        parts.push('--- ARCHITECTURE.md ---\n' + fs.readFileSync(archMdPath, 'utf-8'));
    }

    return parts.length > 0 ? parts.join('\n\n') : `Projeto: ${projectName}`;
}

/**
 * Normaliza um título em slug de arquivo seguro
 */
function slugify(text) {
    return text.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
}

/**
 * Executa a pesquisa completa para um laboratório específico
 * @param {string} projectName - Nome do projeto
 * @param {string} slug - Slug da pesquisa
 * @param {Function} onProgress - Callback de progresso opcional
 * @returns {Promise<Object>} Resultado da execução
 */
async function runResearchLab(projectName, slug, onProgress = () => {}) {
    const runKey = `${projectName}:${slug}`;
    if (activeRuns.has(runKey)) {
        return { running: true, message: 'Pesquisa já está em andamento.' };
    }

    const researchDir = path.join(ROOT_DIR, 'projects', projectName, 'RESEARCH', slug);
    const metaPath = path.join(researchDir, '_meta.json');
    const overviewPath = path.join(researchDir, 'OVERVIEW.md');
    const knowledgeDir = path.join(researchDir, 'knowledge');
    const actionableDir = path.join(researchDir, 'actionable');

    if (!fs.existsSync(metaPath)) {
        throw new Error(`Laboratório '${slug}' não encontrado no projeto '${projectName}'.`);
    }

    fs.mkdirSync(knowledgeDir, { recursive: true });
    fs.mkdirSync(actionableDir, { recursive: true });

    let meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    meta.status = 'in-progress';
    meta.startedAt = new Date().toISOString();
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

    activeRuns.set(runKey, { startTime: Date.now(), currentStep: 'Iniciando varredura' });

    try {
        const projectContext = getProjectContext(projectName);
        const mainTopic = meta.topic || slug;
        const definition = meta.definition || '';

        console.log(`🚀 [Research Engine] Iniciando pesquisa autônoma: "${mainTopic}" (${projectName})`);
        onProgress({ step: 'decomposing', message: 'Mapeando árvore de subtópicos com IA...' });

        // 1. Decomposição de tópicos (se não existir em meta)
        let subtopics = meta.subtopics || [];
        if (subtopics.length === 0) {
            const decResult = await groq.decomposeResearchTopic(definition, projectContext);
            subtopics = decResult.subtopics || [];
            meta.subtopics = subtopics;
            meta.researchDepth = decResult.researchDepth;
            fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
            onProgress({
                step: 'decomposed',
                total: subtopics.length,
                subtopics: subtopics,
                message: `${subtopics.length} subtópicos mapeados pela IA.`
            });
        }

        console.log(`📋 [Research Engine] ${subtopics.length} subtópicos a pesquisar e catalogar`);

        const generatedFiles = [];
        let index = 1;

        // 2. Síntese e geração dos arquivos .md para cada subtópico
        for (const st of subtopics) {
            const isActionable = st.layer === 'actionable' || 
                                (st.title || '').toLowerCase().includes('implement') || 
                                (st.title || '').toLowerCase().includes('código') || 
                                (st.title || '').toLowerCase().includes('schema');

            const targetDir = isActionable ? actionableDir : knowledgeDir;
            const targetFolderRel = isActionable ? 'actionable' : 'knowledge';
            const fileNum = String(index).padStart(2, '0');
            const fileSlug = `${fileNum}-${slugify(st.slug || st.title)}.md`;
            const filePath = path.join(targetDir, fileSlug);
            const relFilePath = `${targetFolderRel}/${fileSlug}`;

            // Se o arquivo já existe no disco com conteúdo válido, reaproveita (resumabilidade)
            if (fs.existsSync(filePath) && fs.statSync(filePath).size > 150) {
                console.log(`⏩ [Research Engine] [${index}/${subtopics.length}] Subtópico já catalogado: ${fileSlug}. Reaproveitando.`);
                generatedFiles.push({
                    title: st.title,
                    description: st.description || '',
                    layer: targetFolderRel,
                    path: relFilePath,
                    file: fileSlug,
                    tokens: 0,
                    reused: true
                });
                onProgress({
                    step: 'file-generated',
                    current: index,
                    total: subtopics.length,
                    subtopic: st.title,
                    layer: targetFolderRel,
                    file: fileSlug,
                    path: relFilePath,
                    reused: true,
                    message: `[${index}/${subtopics.length}] Subtópico catalogado: ${st.title}`
                });
                index++;
                continue;
            }

            onProgress({
                step: 'synthesizing',
                current: index,
                total: subtopics.length,
                subtopic: st.title,
                layer: targetFolderRel,
                message: `[${index}/${subtopics.length}] Pesquisando e gerando: ${st.title}`
            });

            console.log(`✍️ [Research Engine] [${index}/${subtopics.length}] Gerando com IA: ${st.title} (${targetFolderRel})`);

            // Chama a IA para sintetizar o conteúdo técnico
            const synthResult = await groq.synthesizeSubtopic(
                { ...st, layer: targetFolderRel },
                mainTopic,
                projectContext
            );

            // Adiciona cabeçalho e metadados no markdown
            const fileContent = `---
topic: "${mainTopic}"
subtopic: "${st.title}"
layer: "${targetFolderRel}"
created: "${new Date().toISOString()}"
model: "${synthResult.model || 'Groq Cloud'}"
---

${synthResult.content}

---
> 🧠 Documento gerado autonomamente pelo **Research Lab — AI Second Brain**.  
> Contexto: \`${projectName}\` &middot; Data: ${new Date().toLocaleDateString('pt-BR')}
`;

            fs.writeFileSync(filePath, fileContent, 'utf-8');

            generatedFiles.push({
                title: st.title,
                description: st.description || '',
                layer: targetFolderRel,
                path: relFilePath,
                file: fileSlug,
                tokens: synthResult.usage?.total_tokens || 0
            });

            onProgress({
                step: 'file-generated',
                current: index,
                total: subtopics.length,
                subtopic: st.title,
                layer: targetFolderRel,
                file: fileSlug,
                path: relFilePath,
                reused: false,
                message: `✓ [${index}/${subtopics.length}] Gerado: ${st.title}`
            });

            index++;

            // Pausa estratégica de 6 segundos entre requisições para respeitar o limite de TPM (Tokens Por Minuto)
            if (index <= subtopics.length) {
                console.log(`⏱️ [Research Engine] Aguardando 6s para cadência de TPM do Groq Cloud...`);
                await new Promise(r => setTimeout(r, 6000));
            }
        }

        // 3. Atualiza o OVERVIEW.md consolidando o mapa neural
        const knowledgeItems = generatedFiles.filter(f => f.layer === 'knowledge');
        const actionableItems = generatedFiles.filter(f => f.layer === 'actionable');

        let overviewMd = `# 🔬 ${mainTopic}\n\n`;
        overviewMd += `> **Laboratório de Conhecimento Concluído**  \n`;
        overviewMd += `> Projeto: **${projectName}** &middot; Última atualização: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
        overviewMd += `## Briefing da Pesquisa (Prompt Vivo)\n\n${definition}\n\n`;
        overviewMd += `## Status: 🟢 Pesquisa Concluída & Catalogada\n\n`;
        overviewMd += `---\n\n`;

        overviewMd += `## 📘 Camada 1: Conhecimento Teórico & Conceitual (\`knowledge/\`)\n\n`;
        if (knowledgeItems.length === 0) {
            overviewMd += `*Nenhum documento teórico catalogado.*\n\n`;
        } else {
            knowledgeItems.forEach(item => {
                overviewMd += `- [**${item.title}**](${item.path})\n  *${item.description}*\n`;
            });
            overviewMd += `\n`;
        }

        overviewMd += `## 🛠️ Camada 2: Especificações Práticas & Código (\`actionable/\`)\n\n`;
        if (actionableItems.length === 0) {
            overviewMd += `*Nenhuma especificação prática catalogada.*\n\n`;
        } else {
            actionableItems.forEach(item => {
                overviewMd += `- [**${item.title}**](${item.path})\n  *${item.description}*\n`;
            });
            overviewMd += `\n`;
        }

        overviewMd += `---\n\n`;
        overviewMd += `*Todos os arquivos acima estão conectados ao Grafo Neural 3D do projeto no AI Second Brain.*\n`;

        fs.writeFileSync(overviewPath, overviewMd, 'utf-8');

        // 4. Salva metadados finais em _meta.json
        meta.status = 'completed';
        meta.completedAt = new Date().toISOString();
        meta.lastUpdated = new Date().toISOString();
        meta.generatedFilesCount = generatedFiles.length;
        meta.generatedFiles = generatedFiles;
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

        console.log(`🎉 [Research Engine] Pesquisa "${mainTopic}" finalizada com sucesso! ${generatedFiles.length} arquivos gerados.`);

        onProgress({
            step: 'completed',
            current: subtopics.length,
            total: subtopics.length,
            generatedCount: generatedFiles.length,
            message: `🎉 Pesquisa finalizada com sucesso! ${generatedFiles.length} arquivos gerados.`
        });

        return {
            success: true,
            topic: mainTopic,
            slug,
            generatedCount: generatedFiles.length,
            knowledgeCount: knowledgeItems.length,
            actionableCount: actionableItems.length,
            files: generatedFiles
        };
    } catch (err) {
        meta.status = 'failed';
        meta.lastError = err.message;
        meta.failedAt = new Date().toISOString();
        try { fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8'); } catch (_) {}
        throw err;
    } finally {
        activeRuns.delete(runKey);
    }
}

function isResearchRunning(projectName, slug) {
    return activeRuns.has(`${projectName}:${slug}`);
}

module.exports = {
    runResearchLab,
    isResearchRunning
};
