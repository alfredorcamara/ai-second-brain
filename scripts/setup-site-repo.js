const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const srcLanding = path.join(ROOT_DIR, 'docs', 'brain-ui', 'landing');
const srcDemo = path.join(ROOT_DIR, 'docs', 'brain-ui', 'demo');
const destSite = path.resolve(ROOT_DIR, '..', 'AI_SECOND_BRAIN_SITE');

function copyDir(src, dest) {
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

console.log('1. Criando pasta e copiando Landing...');
copyDir(srcLanding, destSite);

console.log('2. Copiando Demo para AI_SECOND_BRAIN_SITE/demo...');
copyDir(srcDemo, path.join(destSite, 'demo'));

console.log('3. Ajustando caminhos em index.html e js/extra.js...');
const indexPath = path.join(destSite, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');
indexHtml = indexHtml.replace(/\.\.\/demo\/index\.html/g, 'demo/index.html');
fs.writeFileSync(indexPath, indexHtml, 'utf-8');

const extraJsPath = path.join(destSite, 'js', 'extra.js');
let extraJs = fs.readFileSync(extraJsPath, 'utf-8');
extraJs = extraJs.replace("const DEMO_URL = '../demo/index.html';", "const DEMO_URL = 'demo/index.html';");
fs.writeFileSync(extraJsPath, extraJs, 'utf-8');

console.log('4. Criando README.md do site...');
const readmeContent = `# AI Second Brain — Official Landing Page & Interactive Demo

Este repositório contém o portal público da Landing Page e a demonstração ao vivo em modo somente leitura do **AI Second Brain**.

- Repositório Principal (Engine & Cockpit): [alfredorcamara/ai-second-brain](https://github.com/alfredorcamara/ai-second-brain)
`;
fs.writeFileSync(path.join(destSite, 'README.md'), readmeContent, 'utf-8');

console.log('5. Criando .gitignore...');
fs.writeFileSync(path.join(destSite, '.gitignore'), ".DS_Store\nThumbs.db\nnode_modules/\n", 'utf-8');

console.log('✓ Pasta AI_SECOND_BRAIN_SITE montada com sucesso em: ' + destSite);
