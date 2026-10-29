# Segurança, OWASP & Proteção de Dados com IA

> Referência de segurança aplicada a APIs, dados sensíveis e integração com Inteligência Artificial.

## 1. OWASP Top 10 — Diretrizes para Projetos

| Risco OWASP | Mitigação Prática nos Projetos |
|---|---|
| **A01: Broken Access Control** | Autenticação via JWT/OAuth2; autorização baseada em roles/policies em cada endpoint do controller ou minimal API. |
| **A02: Cryptographic Failures** | TLS 1.3 obrigatório para todas as comunicações HTTP; secrets e chaves de criptografia gerenciados via Azure Key Vault / User Secrets. |
| **A03: Injection (SQL / Prompt)** | Parametrização estrita de queries via EF Core / Dapper; sanitização e delimitação de system prompts ao chamar LLMs. |
| **A04: Insecure Design** | Adoção do AI Decision Gate pattern: tarefas críticas não são delegadas cegamente a modelos probabilísticos. |
| **A05: Security Misconfiguration** | Headers de segurança (HSTS, CSP, X-Frame-Options); desativação de páginas de erro com stack trace em produção. |
| **A06: Vulnerable Components** | `dotnet list package --vulnerable` e `npm audit` integrados ao pipeline de CI. |
| **A07: Identification Failures** | Rate limiting nos endpoints de autenticação e proteção contra brute force. |
| **A08: Software Integrity Failures** | Validação de assinaturas de pacotes e verificação de integridade de dependências. |
| **A09: Logging & Monitoring Failures** | Structured logging com Serilog; métricas com OpenTelemetry; alertas para anomalias. |
| **A10: SSRF** | Validação e whitelist de URLs externas antes de realizar requisições via `IHttpClientFactory`. |

## 2. OWASP Top 10 para Aplicações com LLM

1. **Prompt Injection**: Nunca concatene dados não confiáveis diretamente no bloco de instruções do sistema. Utilize delimitadores (ex: `"""input_do_usuario"""`) e declare claramente a hierarquia de comandos.
2. **Insecure Output Handling**: Nunca execute código retornado por LLMs ou passe saídas de LLM diretamente para interpretadores SQL/Shell sem validação programática rigorosa.
3. **Data Privacy & Exfiltration (LGPD)**: É estritamente proibido enviar PII (CPF, e-mails de clientes, senhas, chaves de API) para endpoints públicos de LLM. Anonimize os logs antes de solicitar análise ao modelo.
4. **Denial of Wallet**: Defina quotas de tokens por requisição, timeouts agressivos e rate limiting nos serviços que invocam APIs de IA generativa.

---
*Referência relacionada:* `.agents/rules/03-security.md`
