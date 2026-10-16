/**
 * AI SECOND BRAIN — Universal Decision Provider (JEV Pattern / ADR-G001 & ADR-G002)
 *
 * Implementa o padrão JEV / AI Decision Gate:
 * Avalia o estado tipado contra opções determinísticas e regras auditáveis.
 * Latência: 0ms · Custo: Zero tokens · Dependência de internet: Nenhuma (100% Offline).
 */

/**
 * Interface canônica IDecisionProvider
 * @abstract
 */
class IDecisionProvider {
    /**
     * Avalia uma requisição de decisão ou classificação
     * @param {Object} request
     * @param {string} request.context Contexto da operação (ex: 'quickstart-refine')
     * @param {string} request.question Pergunta ou instrução a classificar
     * @param {Object} [request.state] Estado tipado da aplicação (projetos, contratos, etc.)
     * @param {string[]} [request.options] Opções de alvos possíveis
     * @returns {Promise<Object>} Resultado da decisão tipada
     */
    async decide(request) {
        throw new Error('O método decide() deve ser implementado pelo provedor de decisão.');
    }
}

/**
 * RulesDecisionProvider: Motor determinístico nativo baseado no padrão JEV (Rules & Trees).
 * Classifica intenções, detecta ambiguidades técnicas e roteia documentos cirurgicamente.
 */
class RulesDecisionProvider extends IDecisionProvider {
    constructor(options = {}) {
        super();
        this.name = 'RulesDecisionProvider';
        this.version = '1.0.0';
        this.options = options;
    }

    /**
     * Execução síncrona determinística (0ms, CPU puro)
     */
    decideSync(request) {
        const rawFeedback = String(request.question || request.feedback || '').trim();
        const clean = rawFeedback.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const state = request.state || {};
        const clarification = state.clarification || request.clarification || null;

        const hasClarification = clarification && (
            (typeof clarification === 'object' && String(clarification.answer || '').trim().length > 0) ||
            (typeof clarification === 'string' && clarification.trim().length > 0)
        );

        // =========================================================================
        // FASE 1: Detecção de Ambiguidade Técnica (Trigger de Clarificação Humana)
        // Se ainda não houve resposta a uma dúvida, checar se a solicitação é vaga
        // =========================================================================
        if (!hasClarification) {
            // 1.1 Pagamentos / Checkout sem especificar provedor nem métodos
            if (/\b(pagamento|pagamentos|gateway|checkout|cobran[cs]a)\b/i.test(clean) &&
                !/\b(stripe|mercado\s*pago|asaas|pagar\.?me|paypal|pix|cartao|boleto)\b/i.test(clean)) {
                return {
                    decision: 'CLARIFY',
                    ruleId: 'JEV-RULE-AMB-PAYMENT',
                    intentClass: 'AMBIGUOUS_PAYMENTS',
                    confidence: 0.95,
                    rationale: 'Solicitação de pagamento sem especificação de provedor (Stripe, Mercado Pago, Asaas) ou métodos (Pix, Cartão, Boleto).',
                    targetDocs: ['ARCHITECTURE.md'],
                    clarification: {
                        question: 'Qual provedor de pagamento você deseja utilizar e quais métodos devem ser suportados?',
                        reason: 'A escolha do provedor e dos métodos (Pix, Cartão, Boleto) define as tabelas de transação, schemas de webhook e endpoints técnicos.',
                        suggestedOptions: [
                            'Stripe (Cartão + Pix)',
                            'Mercado Pago (Pix + Boleto + Cartão)',
                            'Asaas (Pix + Boleto bancário)',
                            'Simulação / Mock para MVP'
                        ]
                    }
                };
            }

            // 1.2 Mensageria / Filas sem especificar broker/tecnologia
            if (/\b(mensageria|filas?|background\s*jobs?|broker|processamento\s+assincrono)\b/i.test(clean) &&
                !/\b(rabbitmq|kafka|bullmq|redis|sqs|eventbridge)\b/i.test(clean)) {
                return {
                    decision: 'CLARIFY',
                    ruleId: 'JEV-RULE-AMB-MESSAGING',
                    intentClass: 'AMBIGUOUS_MESSAGING',
                    confidence: 0.95,
                    rationale: 'Solicitação de mensageria/filas sem especificação do broker de mensageria (RabbitMQ, Kafka, BullMQ, SQS).',
                    targetDocs: ['ARCHITECTURE.md'],
                    clarification: {
                        question: 'Qual mecanismo de mensageria / filas você prefere utilizar para o processamento assíncrono?',
                        reason: 'A tecnologia de mensageria altera a topologia da arquitetura, as dependências do Docker e as bibliotecas do projeto.',
                        suggestedOptions: [
                            'RabbitMQ (AMQP dedicado)',
                            'BullMQ com Redis (Leve e rápido)',
                            'Apache Kafka (Streaming de alto volume)',
                            'AWS SQS (Cloud nativo)'
                        ]
                    }
                };
            }

            // 1.3 Autenticação / Login sem especificar mecanismo (JWT, Sessão, OAuth, Auth0)
            if (/\b(autentica[cs][aã]o|sistema\s+de\s+login|colocar\s+login|adicionar\s+login|controle\s+de\s+acesso|login\s+e\s+senha)\b/i.test(clean) &&
                !/\b(jwt|oauth2?|social|google|github|cookies?|sessao|token|keycloak|auth0|supabase|firebase|bcrypt|refresh\s+token)\b/i.test(clean)) {
                return {
                    decision: 'CLARIFY',
                    ruleId: 'JEV-RULE-AMB-AUTH',
                    intentClass: 'AMBIGUOUS_AUTH',
                    confidence: 0.95,
                    rationale: 'Solicitação de login/autenticação sem definir estratégia (JWT Stateless, Sessão Stateful, OAuth2 ou Gerenciado).',
                    targetDocs: ['ARCHITECTURE.md'],
                    clarification: {
                        question: 'Qual estratégia de autenticação e controle de acesso você deseja adotar?',
                        reason: 'A escolha define a modelagem de credenciais/senhas, expiração de tokens e middlewares de segurança na arquitetura.',
                        suggestedOptions: [
                            'JWT Bearer com Refresh Token (Stateless)',
                            'OAuth 2.0 / Login Social (Google / GitHub)',
                            'Sessão / Cookies HTTP-only (Stateful)',
                            'Supabase Auth / Auth0 (Gerenciado)'
                        ]
                    }
                };
            }

            // 1.4 Infraestrutura / Deploy / Hospedagem vaga
            if (/\b(onde\s+vai\s+rodar|infraestrutura|fazer\s+deploy|adicionar\s+deploy|hospedagem|hospedar|infra)\b/i.test(clean) &&
                !/\b(docker|compose|vps|linux|vercel|railway|render|aws|ecs|lambda|s3|kubernetes|k8s|on-premises|cloud)\b/i.test(clean)) {
                return {
                    decision: 'CLARIFY',
                    ruleId: 'JEV-RULE-AMB-INFRA',
                    intentClass: 'AMBIGUOUS_INFRA',
                    confidence: 0.94,
                    rationale: 'Solicitação de deploy/infraestrutura sem definir ambiente ou topologia de containers.',
                    targetDocs: ['ARCHITECTURE.md'],
                    clarification: {
                        question: 'Qual o ambiente de infraestrutura e hospedagem pretendido para o projeto?',
                        reason: 'Define a topologia de containers (Dockerfile, docker-compose), scripts de CI/CD e variáveis de ambiente.',
                        suggestedOptions: [
                            'Docker Compose + VPS Linux',
                            'Vercel / Railway / Render (PaaS moderna)',
                            'AWS (ECS / Lambda / S3)',
                            'Kubernetes / On-Premises'
                        ]
                    }
                };
            }

            // 1.5 Instrução excessivamente curta e vaga (ex: "melhore", "coloque api", "mude as coisas")
            if (clean.length < 10 || /^(melhore|ajuste|mude|troque|coloque|adicione|arrume|faca)(\s+(ai|tudo|coisas|algo))?$/i.test(clean)) {
                return {
                    decision: 'CLARIFY',
                    ruleId: 'JEV-RULE-AMB-GENERIC',
                    intentClass: 'AMBIGUOUS_GENERIC',
                    confidence: 0.99,
                    rationale: 'Solicitação excessivamente curta ou genérica que impede determinar o contrato correto.',
                    targetDocs: [],
                    clarification: {
                        question: 'Poderia detalhar qual aspecto específico você gostaria de ajustar ou melhorar nos contratos?',
                        reason: 'A solicitação está muito genérica para determinar com precisão quais contratos de governança devem ser modificados.',
                        suggestedOptions: [
                            'Adicionar dicionário de dados da tabela cliente',
                            'Mudar banco de dados para PostgreSQL',
                            'Adicionar autenticação JWT com refresh token',
                            'Revisar e corrigir erros ortográficos'
                        ]
                    }
                };
            }
        }

        // =========================================================================
        // FASE 2: Classificação de Documentos-Alvo e Roteamento Cirúrgico
        // =========================================================================

        // 2.1 Correção ortográfica / textual global
        if (/\b(ortografi[ac]|gramatic[ac]|acentua[cs][aã]o|digita[cs][aã]o|erros?\s+(de\s+)?(portugues|texto|escrita|digitacao)|corrij?a\s+(os?\s+)?erros?|revis(ar|ao)\s+(de\s+)?texto)\b/i.test(clean)) {
            return {
                decision: 'PROCEED',
                ruleId: 'JEV-RULE-GLOBAL-TYPO',
                intentClass: 'GLOBAL_TYPO_CLEANUP',
                confidence: 0.98,
                rationale: 'Solicitação de revisão textual e ortográfica detectada. Alvo em todos os contratos para consistência editorial.',
                targetDocs: ['PROJECT.md', 'ARCHITECTURE.md', 'CURRENT_STATE.md', 'ADR-0001'],
                clarification: null
            };
        }

        // 2.2 Mudança estrutural transversal / troca de stack principal (multi-documento)
        if (/\b(troc(ar|a|que)|mud(ar|e)|migr(ar|e)|substitu(ir|a))\s+(o\s+)?(banco|stack|tecnologia|framework|backend|frontend|bd|database)\b/i.test(clean) ||
            /\b(trocar|mudar|migrar)\s+(para|pro|de\s+\w+\s+para)\s+(postgres|postgresql|mongodb|mysql|sqlite|sql\s*server|redis|graphql|rest|fastify|express|nest|prisma|typeorm|dapper)\b/i.test(clean) ||
            (/\b(autentica[cs][aã]o|login|jwt|auth)\b/i.test(clean) && /\b(adicion(ar|e)|inclu(ir|a)|troc(ar|e))\b/i.test(clean) && /\b(banco|postgres|sql|prisma)\b/i.test(clean))) {
            return {
                decision: 'PROCEED',
                ruleId: 'JEV-RULE-CROSS-STACK',
                intentClass: 'CROSS_CUTTING_STACK',
                confidence: 0.95,
                rationale: 'Troca estrutural de tecnologia/banco detectada. Alvo em todos os contratos para adaptar escopo, schemas, roadmap e decisão técnica.',
                targetDocs: ['PROJECT.md', 'ARCHITECTURE.md', 'CURRENT_STATE.md', 'ADR-0001'],
                clarification: null
            };
        }

        // 2.3 Avaliação de Alvos Combinados (Multi-Target Combinado)
        const hasArch = /\b(dicionario\s+de\s+dados|tabela|tabelas|schema|schemas|coluna|colunas|campo|campos|entidade|entidades|ddl|migration|migrations|chave\s+primaria|foreign\s+key|relacionamento|relacionamentos|modelagem|modelo\s+de\s+dados|endpoints?|rotas?|api\s+rest|payload|jwt|refresh\s+token|bearer|bcrypt|oauth2?|sessao|token|controller|servico|service|dockerfile|docker\s*compose|rabbitmq|bullmq|kafka|redis|sqs|stripe|mercado\s*pago|asaas)\b/i.test(clean) || Boolean(hasClarification);

        const hasScope = /\b(escopo|mvp|fora\s+do\s+escopo|dentro\s+do\s+escopo|persona|personas|publico\s*alvo|usuario\s+final|visao\s+geral|proposta\s+de\s+valor|objetivo|objetivos\s+de\s+negocio|regras?\s+de\s+negocio\s+gerais?)\b/i.test(clean);

        const hasRoadmap = /\b(roadmap|checklist|tarefa|tarefas|marcar\s+como\s+feita|concluida|pendencia|pendencias|sprint|fase\s+atual|milestone|proximos?\s+passos?|debitos?\s+tecnicos?|bloqueios?|riscos?)\b/i.test(clean);

        const hasAdr = /\b(adr|decisao\s+arquitetural|justificativa|trade\s*off|alternativas?\s+descartadas?|por\s+que\s+escolhemos|motivo\s+da\s+escolha|registro\s+de\s+decisao)\b/i.test(clean);

        const targetDocs = [];
        if (hasScope) targetDocs.push('PROJECT.md');
        if (hasArch) targetDocs.push('ARCHITECTURE.md');
        if (hasRoadmap) targetDocs.push('CURRENT_STATE.md');
        if (hasAdr) targetDocs.push('ADR-0001');

        // Se múltiplos documentos foram combinados intencionalmente:
        if (targetDocs.length >= 2) {
            return {
                decision: 'PROCEED',
                ruleId: 'JEV-RULE-MULTI-COMPOUND',
                intentClass: 'COMPOUND_SURGICAL',
                confidence: 0.94,
                rationale: `Solicitação combinada identificada cobrindo [${targetDocs.join(', ')}]. Documentos não citados permanecem 100% isolados.`,
                targetDocs: targetDocs,
                clarification: null
            };
        }

        // Se exatamente 1 documento específico foi identificado:
        if (targetDocs.length === 1) {
            const single = targetDocs[0];
            const intentMap = {
                'PROJECT.md': { class: 'PROJECT_SCOPE', rule: 'JEV-RULE-PROJECT-SCOPE', rationale: 'Detectada alteração de escopo do MVP ou produto. Isolação estrita em PROJECT.md.' },
                'ARCHITECTURE.md': { class: 'ARCHITECTURE_DATA', rule: 'JEV-RULE-ARCH-DATA', rationale: 'Detectada alteração técnica de arquitetura, dados ou endpoints. Isolação estrita em ARCHITECTURE.md.' },
                'CURRENT_STATE.md': { class: 'CURRENT_STATE_ROADMAP', rule: 'JEV-RULE-ROADMAP', rationale: 'Detectada alteração de roadmap, tarefas ou pendências. Isolação estrita em CURRENT_STATE.md.' },
                'ADR-0001': { class: 'ADR_DECISION', rule: 'JEV-RULE-ADR', rationale: 'Detectada alteração de registro de decisão técnica. Isolação estrita em ADR-0001.' }
            };
            const meta = intentMap[single];
            return {
                decision: 'PROCEED',
                ruleId: meta.rule,
                intentClass: meta.class,
                confidence: 0.96,
                rationale: meta.rationale,
                targetDocs: [single],
                clarification: null
            };
        }

        // 2.4 Fallback seguro: se não bater em regra específica mas tiver intenção de código, direciona para ARCHITECTURE.md
        return {
            decision: 'PROCEED',
            ruleId: 'JEV-RULE-FALLBACK',
            intentClass: 'ARCHITECTURE_DATA',
            confidence: 0.85,
            rationale: 'Instrução técnica de desenvolvimento padrão direcionada com segurança para ARCHITECTURE.md.',
            targetDocs: ['ARCHITECTURE.md'],
            clarification: null
        };
    }

    /**
     * Implementação assíncrona compatível com IDecisionProvider
     */
    async decide(request) {
        return this.decideSync(request);
    }
}

// Singleton exportado por conveniência
const defaultDecisionProvider = new RulesDecisionProvider();

module.exports = {
    IDecisionProvider,
    RulesDecisionProvider,
    defaultDecisionProvider
};
