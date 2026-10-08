#!/usr/bin/env python3
"""Gera demo/vault-data.js — um vault de EXEMPLO limpo (sem dados privados).
Uso:  python3 demo/tools/build_demo_vault.py"""
import json, time, pathlib, re

OUT = pathlib.Path(__file__).resolve().parent.parent / 'vault-data.js'
NOW = int(time.time() * 1000)

# (path, titulo, icone, categoria, resumo, [links para outros paths])
F = [
 ('README.md','AI Second Brain — Visão Geral','🧠','core','Ponto de entrada: o que é o cérebro e como o agente deve usá-lo.',['.agents/rules/00-core.md','docs/COMO_UTILIZAR.md']),
 ('CLAUDE.md','Instruções do Agente (entrada)','🤖','core','Arquivo lido primeiro pelo agente: aponta para regras, memória e decisões.',['memory/current-state.md','.agents/rules/00-core.md']),
 ('.agents/rules/00-core.md','Regras Fundamentais','⚙️','rules','A lei da casa: o que todo agente precisa respeitar antes de agir.',['.agents/rules/01-ai-decision.md','decisions/GLOBAL_DECISIONS.md']),
 ('.agents/rules/01-ai-decision.md','Regras de Decisão com IA','🎯','rules','Quando usar IA, regra de negócio ou código determinístico.',['.agents/skills/ai-decision-gate/SKILL.md','knowledge/ai/model-selection.md']),
 ('.agents/rules/02-security.md','Regras de Segurança','🛡️','rules','OWASP, segredos fora do código e proteção de dados.',['knowledge/security/OWASP.md']),
 ('.agents/rules/03-architecture.md','Regras de Arquitetura','🏗️','rules','Padrões adotados e como registrar decisões.',['knowledge/architecture/patterns.md','decisions/GLOBAL_DECISIONS.md']),
 ('.agents/rules/04-documentation.md','Regras de Documentação','📝','rules','Como registrar contexto e manter a memória viva.',['templates/session-memory.md']),
 ('.agents/skills/ai-decision-gate/SKILL.md','ai-decision-gate','🎯','skills','Classifica a tarefa antes de escrever código.',['.agents/rules/01-ai-decision.md']),
 ('.agents/skills/new-feature/SKILL.md','new-feature','✨','skills','Roteiro para nascer uma feature com contexto.',['templates/feature-spec.md','.agents/rules/03-architecture.md']),
 ('.agents/skills/bug-investigation/SKILL.md','bug-investigation','🐞','skills','Investigação guiada por evidências.',['memory/lessons-learned.md']),
 ('.agents/skills/architecture-review/SKILL.md','architecture-review','🏛️','skills','Revisão de arquitetura com ADRs.',['decisions/GLOBAL_DECISIONS.md','knowledge/architecture/patterns.md']),
 ('.agents/skills/session-memory/SKILL.md','session-memory','💾','skills','Fecha a sessão registrando estado e próximos passos.',['memory/current-state.md','templates/session-memory.md']),
 ('knowledge/architecture/patterns.md','Padrões de Arquitetura','📐','knowledge','Catálogo de padrões que o time adota.',['decisions/GLOBAL_DECISIONS.md']),
 ('knowledge/ai/gateway.md','AI Gateway Pattern','🌐','knowledge','Um ponto único para falar com modelos de IA.',['knowledge/ai/model-selection.md','knowledge/security/OWASP.md']),
 ('knowledge/ai/model-selection.md','Seleção de Modelos de IA','🧪','knowledge','Custo, latência e qualidade lado a lado.',['.agents/rules/01-ai-decision.md']),
 ('knowledge/security/OWASP.md','Segurança, OWASP e Proteção de Dados','🔒','knowledge','Riscos de segurança ao usar IA e como mitigá-los.',['.agents/rules/02-security.md']),
 ('knowledge/global/index.md','Índice de Conhecimento','🗂️','knowledge','O mapa de tudo que o cérebro sabe.',['knowledge/architecture/patterns.md','knowledge/ai/gateway.md']),
 ('memory/current-state.md','Estado Atual','💾','memory','Onde o projeto está hoje e o que vem a seguir.',['memory/lessons-learned.md','projects/demo-app/CURRENT_STATE.md']),
 ('memory/lessons-learned.md','Lições Aprendidas','🎓','memory','Erros que nunca mais serão repetidos.',['.agents/skills/bug-investigation/SKILL.md']),
 ('decisions/GLOBAL_DECISIONS.md','Decisões Globais','⚖️','decisions','Escolhas que valem para todos os projetos.',['.agents/rules/03-architecture.md']),
 ('templates/feature-spec.md','Template: Especificação de Feature','📄','templates','Especificação pronta para preencher.',['.agents/skills/new-feature/SKILL.md']),
 ('templates/project.md','Template: Projeto','📄','templates','Do zero ao contexto completo.',['projects/demo-app/PROJECT.md']),
 ('templates/ai-use-case.md','Template: Caso de Uso de IA','📄','templates','Problema, dados, risco e métrica.',['.agents/rules/01-ai-decision.md']),
 ('templates/session-memory.md','Template: Memória de Sessão','💾','templates','Registro padrão ao fim de cada sessão.',['memory/current-state.md']),
 ('docs/COMO_UTILIZAR.md','Como Utilizar o Projeto','📘','docs','Do clone ao primeiro projeto conectado.',['docs/GUIA_PRATICO.md','README.md']),
 ('docs/GUIA_PRATICO.md','Guia Prático','🧭','docs','Passo a passo do dia a dia com o agente.',['memory/current-state.md']),
 ('docs/RESEARCH_LAB.md','Research Lab','🔬','docs','Laboratório autônomo de conhecimento em duas camadas.',['knowledge/global/index.md']),
 ('projects/README.md','Guia de Projetos','📁','projects','Como projetos se conectam ao cérebro sem duplicar arquivos.',['templates/project.md']),
 ('projects/demo-app/PROJECT.md','demo-app — Visão Geral','🚀','projects','API de exemplo usada para demonstrar o cérebro.',['projects/demo-app/ARCHITECTURE.md','projects/demo-app/CURRENT_STATE.md']),
 ('projects/demo-app/CURRENT_STATE.md','demo-app — Estado Atual','💾','projects','Login em andamento; falta o middleware de validação JWT.',['projects/demo-app/memory/session-12.md','projects/demo-app/decisions/ADR-001-stack.md']),
 ('projects/demo-app/ARCHITECTURE.md','demo-app — Arquitetura','🏗️','projects','Camadas, módulos e integrações.',['knowledge/architecture/patterns.md']),
 ('projects/demo-app/decisions/ADR-001-stack.md','ADR-001 — Stack Inicial','⚖️','projects','Por que escolhemos esta stack e o que foi descartado.',['decisions/GLOBAL_DECISIONS.md']),
 ('projects/demo-app/memory/session-12.md','Memória da Sessão 12','💾','projects','O que foi feito e o que ficou pendente.',['projects/demo-app/CURRENT_STATE.md']),
 ('projects/demo-app/research/knowledge/auth-theory.md','Pesquisa: Teoria de Autenticação','🔬','projects','Camada Knowledge: conceitos de sessão, JWT e refresh.',['knowledge/security/OWASP.md']),
 ('projects/demo-app/research/actionable/jwt-middleware.md','Pesquisa: Middleware JWT','⚡','projects','Camada Actionable: especificação pronta para implementar.',['projects/demo-app/research/knowledge/auth-theory.md']),
]
sl = lambda p: re.sub(r'[^A-Za-z0-9_-]', '_', p)
files = []
for i, (p, title, icon, cat, resumo, links) in enumerate(F):
    body = f"# {title}\n\n> {resumo}\n\n## Em resumo\n- Arquivo de **exemplo** da demonstração, em `{p}`.\n- O agente lê este documento **antes** de agir.\n- É só Markdown: versionado no Git e editável por qualquer pessoa.\n\n## Veja também\n" + ''.join(f"- [{l.split('/')[-1]}](/{l})\n" for l in links)
    files.append(dict(id=sl(p), path=p, name=p.split('/')[-1], title=title, category=cat, icon=icon,
        size=len(body.encode()), mtime=NOW - ((i * 37) % 300) * 3600_000, outgoingLinks=['file:///demo/' + l for l in links], content=body))

LABEL = dict(rules='Rules', skills='Skills', projects='Projects', knowledge='Knowledge', decisions='Decisions', memory='Memory', templates='Templates', docs='Docs & Guias', core='Sistema / Core')
ORDER = ['rules','skills','projects','knowledge','decisions','memory','templates','docs','core']
item = lambda f: dict(id=f['id'], label=f['title'], icon=f['icon'], path=f['path'], size=f['size'])
sections = [dict(id='overview', label='Visão Geral', icon='🧠', startCollapsed=True, items=[
    dict(id='dashboard', label='Dashboard', icon='📊', path='dashboard'),
    dict(id='graph', label='Grafo Neural', icon='🔮', path='graph'),
    dict(id='solution-docs', label='Documentação da Solução', icon='📘', path='solution-docs')])]
ICON = dict(rules='📏', skills='🛠️', projects='🚀', knowledge='📚', decisions='⚖️', memory='💾', templates='📐', docs='📖', core='🧬')
for c in ORDER:
    its = [f for f in files if f['category'] == c]
    if c == 'projects':
        top = [item(f) for f in its if f['path'] == 'projects/README.md']
        kids = [dict(item(f), label=f['title']) for f in its if f['path'].startswith('projects/demo-app/')]
        its = top + [dict(id='proj_demo-app', label='demo-app', icon='🚀', isGroup=True, isProject=True, startCollapsed=True,
              path='projects/demo-app/PROJECT.md', totalFilesCount=len(kids), childrenCount=len(kids), children=kids)]
    else: its = [item(f) for f in its]
    sections.append(dict(id=c, label=LABEL[c], icon=ICON[c], startCollapsed=True, items=its))

cols = {'core':('#6366f1','#818cf8'),'rules':('#f59e0b','#fbbf24'),'skills':('#10b981','#34d399'),'agents':('#06b6d4','#22d3ee'),'projects':('#ef4444','#f87171'),
        'knowledge':('#3b82f6','#60a5fa'),'decisions':('#a855f7','#c084fc'),'memory':('#ec4899','#f472b6'),'templates':('#eab308','#facc15'),'docs':('#14b8a6','#2dd4bf')}
hexrgb = lambda h: ','.join(str(int(h[i:i+2], 16)) for i in (1, 3, 5))
colors = {k: dict(fill=a, stroke=b, glow=f'rgba({hexrgb(a)}, 0.35)') for k, (a, b) in cols.items()}
nodes = [dict(id='brain', label='AI Second Brain', group='core', size=28, icon='🧠', path='dashboard')]
edges = []
for c in ORDER:
    nodes.append(dict(id=f'hub-{c}', label=LABEL[c], group=c, size=16, icon=ICON[c], path=c)); edges.append(dict(**{'from': 'brain', 'to': f'hub-{c}'}))
for f in files:
    nodes.append(dict(id=f['id'], label=f['title'], group=f['category'], size=6, icon=f['icon'], path=f['path'])); edges.append(dict(**{'from': f"hub-{f['category']}", 'to': f['id']}))
stats = dict(totalFiles=len(files), totalNodes=len(nodes), totalEdges=len(edges),
             **{f'{c}Count': sum(1 for f in files if f['category'] == c) for c in ['rules','skills','projects','knowledge','decisions','memory','templates','docs']})
snap = dict(timestamp=NOW, files=files, sections=sections, graphNodes=nodes, graphEdges=edges, groupColors=colors, stats=stats)
OUT.write_text('// Vault de EXEMPLO (gerado por tools/build_demo_vault.py) — sem dados privados\nwindow.VAULT_SNAPSHOT = ' + json.dumps(snap, ensure_ascii=False) + ';\n', encoding='utf8')
print('ok', OUT, len(files), 'arquivos')
