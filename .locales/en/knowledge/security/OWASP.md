# Security, OWASP & AI Data Protection

> Applied security reference for APIs, sensitive data, and Artificial Intelligence integrations.

## 1. OWASP Top 10 — Project Guidelines

| OWASP Risk | Practical Mitigation in Projects |
|---|---|
| **A01: Broken Access Control** | JWT/OAuth2 authentication; role/policy-based authorization on every endpoint. |
| **A02: Cryptographic Failures** | Mandatory TLS 1.3 for all HTTP traffic; secrets and encryption keys managed via Key Vault / User Secrets / `.env`. |
| **A03: Injection (SQL / Prompt)** | Strict query parameterization via ORM; sanitization and delimiter isolation of system prompts when calling LLMs. |
| **A04: Insecure Design** | Adoption of the AI Decision Gate pattern: critical tasks are never blindly delegated to probabilistic models. |
| **A05: Security Misconfiguration** | Security headers (HSTS, CSP, X-Frame-Options); stack traces disabled in production error responses. |
| **A06: Vulnerable Components** | `dotnet list package --vulnerable` and `npm audit` integrated into the CI pipeline. |
| **A07: Identification Failures** | Rate limiting on authentication endpoints and brute-force protection. |
| **A08: Software Integrity Failures** | Package signature validation and dependency integrity verification. |
| **A09: Logging & Monitoring Failures** | Structured logging with Serilog/Pino; metrics with OpenTelemetry; anomaly alerting. |
| **A10: SSRF** | Validation and allowlisting of external URLs before performing outbound HTTP requests. |

## 2. OWASP Top 10 for LLM Applications

1. **Prompt Injection**: Never concatenate untrusted user input directly into system instructions. Use strict delimiters (e.g., `"""user_input"""`) and enforce command hierarchy.
2. **Insecure Output Handling**: Never execute code returned by LLMs or pass LLM outputs directly to SQL/Shell interpreters without strict programmatic validation.
3. **Data Privacy & Exfiltration (GDPR / LGPD)**: Sending PII (tax IDs, customer emails, passwords, API keys) to public LLM endpoints is strictly prohibited. Anonymize payloads before model inference.
4. **Denial of Wallet**: Enforce per-request token quotas, strict timeouts, and rate limiting on services that invoke generative AI APIs.

---
*Related reference:* `.agents/rules/03-security.md`
