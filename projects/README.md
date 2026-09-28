# Diretório de Projetos — AI Second Brain

> Este diretório armazena o contexto, a governança e a memória dos seus projetos.

## Como funciona

Por padrão, este diretório vem **limpo e agnóstico**, pronto para receber qualquer tipo de projeto:
- APIs / Microservices (Node.js, Go, .NET, Python, Java, Rust)
- Aplicações Web e SaaS (React, Next.js, Vue, Svelte)
- Aplicativos Mobile (Flutter, React Native, MAUI, Swift, Kotlin)
- Jogos (Unity, Godot, Unreal Engine)
- Scripts, Automações e Engenharia de Dados

---

## Como conectar um projeto

Você pode utilizar qualquer um dos dois modos descritos no manual:

### Modo 1: Projeto Criado Aqui (Greenfield)
1. Crie uma pasta para o seu projeto: `projects/<nome-do-projeto>/`
2. Copie o template `templates/project.md` para `projects/<nome-do-projeto>/PROJECT.md`
3. Crie o arquivo de estado inicial `projects/<nome-do-projeto>/CURRENT_STATE.md`

### Modo 2: Conectar Projeto Existente (Brownfield via Symlink / Junção)
Se o seu código-fonte já vive em outro repositório Git no seu computador (ex: `C:\Projetos\MeuSistema`):
1. Crie uma junção NTFS no Windows:
   ```cmd
   mklink /J "projects\MeuSistema" "C:\Projetos\MeuSistema"
   ```
2. Adicione os arquivos de contexto (`PROJECT.md`, `CURRENT_STATE.md`) na raiz do seu projeto. O AI Second Brain passará a ler e governar seu projeto automaticamente sem duplicar arquivos.
