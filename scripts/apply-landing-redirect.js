/**
 * AI SECOND BRAIN — APPLY LANDING REDIRECT
 * 
 * Substitui o index.html da landing page antiga por um redirecionador ultra-rápido (< 1 KB)
 * que preserva UTMs e parâmetros de busca, e remove os vídeos pesados (30 MB) do repositório principal.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const LANDING_DIR = path.join(ROOT_DIR, 'docs', 'brain-ui', 'landing');
const LANDING_INDEX = path.join(LANDING_DIR, 'index.html');
const VIDEOS_DIR = path.join(LANDING_DIR, 'assets', 'video');

const TARGET_URL = 'https://alfredorcamara.github.io/ai-second-brain-site/';

const redirectHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Redirecionando para AI Second Brain...</title>
  <link rel="canonical" href="${TARGET_URL}">
  <meta http-equiv="refresh" content="0; url=${TARGET_URL}">
  <script>
    // Preserva parâmetros UTM e query strings no redirecionamento
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    window.location.replace('${TARGET_URL}' + search + hash);
  </script>
  <style>
    body {
      background: #03060f;
      color: #94a3b8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
    .card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 12px;
      max-width: 480px;
    }
    h1 { color: #f8fafc; font-size: 1.25rem; margin-bottom: 12px; }
    p { font-size: 0.95rem; margin-bottom: 20px; }
    a {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 500;
      background: rgba(56, 189, 248, 0.1);
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }
    a:hover { background: rgba(56, 189, 248, 0.2); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Redirecionando para a nova página oficial...</h1>
    <p>O portal do AI Second Brain agora reside em seu repositório oficial dedicado.</p>
    <a href="${TARGET_URL}">Clique aqui se não for redirecionado automaticamente ↗</a>
  </div>
</body>
</html>
`;

function applyRedirect() {
    console.log('1. Aplicando redirecionador em docs/brain-ui/landing/index.html...');
    fs.writeFileSync(LANDING_INDEX, redirectHtml, 'utf-8');

    console.log('2. Limpando vídeos pesados da landing no repo principal...');
    if (fs.existsSync(VIDEOS_DIR)) {
        for (const file of fs.readdirSync(VIDEOS_DIR)) {
            const filePath = path.join(VIDEOS_DIR, file);
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
        }
        console.log('   ✓ Pasta de vídeos limpa com sucesso (~30 MB economizados no clone).');
    }

    console.log('✓ Redirecionador aplicado com sucesso!');
}

if (require.main === module) {
    applyRedirect();
}

module.exports = { applyRedirect };
