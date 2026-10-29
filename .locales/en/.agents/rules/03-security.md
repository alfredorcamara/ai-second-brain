# Security Rules

> Mandatory security rules across all projects.

## Data Classification

| Level | Description | Can send to LLM? |
|-------|-------------|------------------|
| **Public** | Open data | ✅ Yes |
| **Internal** | Company internal data | ⚠️ With caution |
| **Confidential** | Sensitive business data | ❌ No |
| **Restricted** | PII, credentials, GDPR/LGPD | ❌ Never |

## Absolute Rules

1. **NEVER** send credentials, tokens, or secrets to any AI.
2. **NEVER** send personal data (PII) to external LLMs without anonymization.
3. **NEVER** hardcode credentials in source code — use User Secrets, Key Vault, or environment variables (`.env`).
4. **ALWAYS** use HTTPS for external API calls.
5. **ALWAYS** validate and sanitize inputs before processing.
6. **ALWAYS** implement rate limiting on exposed endpoints.

## Privacy & Data Protection (GDPR / LGPD)

- Personal data must have a valid legal basis for processing.
- Implement explicit consent where required.
- Maintain data processing audit logs.
- Implement the right to erasure where applicable.

## Secrets and Credentials

```
✅ CORRECT                    ❌ WRONG
──────────────────────        ──────────────────────
.env / appsettings.json       hardcoded in source code
  → User Secrets (dev)
  → Key Vault (prod)
  → Environment variables
```

## Pre-Deploy Security Checklist

Before deployment, verify:
- [ ] Zero credentials in source code
- [ ] All inputs validated and sanitized
- [ ] Endpoints protected with authentication/authorization
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Logs contain zero sensitive data or PII
- [ ] Dependencies free of known vulnerabilities
