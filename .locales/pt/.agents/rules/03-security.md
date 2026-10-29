# Regras de Segurança

> Regras de segurança obrigatórias para todos os projetos.

## Classificação de Dados

| Nível | Descrição | Pode enviar para LLM? |
|-------|-----------|----------------------|
| **Público** | Dados abertos | ✅ Sim |
| **Interno** | Dados da empresa | ⚠️ Com cuidado |
| **Confidencial** | Dados sensíveis | ❌ Não |
| **Restrito** | PII, credenciais, LGPD | ❌ Nunca |

## Regras Absolutas

1. **NUNCA** envie credenciais, tokens ou secrets para qualquer IA.
2. **NUNCA** envie dados pessoais (PII) para LLMs externos sem anonimização.
3. **NUNCA** hardcode credenciais no código — use User Secrets, Key Vault ou variáveis de ambiente.
4. **SEMPRE** use HTTPS para chamadas de API.
5. **SEMPRE** valide e sanitize inputs antes de processar.
6. **SEMPRE** implemente rate limiting em endpoints expostos.

## LGPD

- Dados pessoais devem ter base legal para processamento.
- Implemente consentimento quando necessário.
- Mantenha registro de processamento de dados.
- Implemente direito ao esquecimento quando aplicável.

## Secrets e Credenciais

```
✅ CORRETO                    ❌ ERRADO
──────────────────────        ──────────────────────
appsettings.json              hardcoded no código
  → User Secrets (dev)
  → Key Vault (prod)
  → Environment variables
```

## Revisão de Segurança

Antes de deploy, verifique:
- [ ] Nenhuma credencial no código
- [ ] Inputs validados e sanitizados
- [ ] Endpoints com autenticação/autorização
- [ ] Dados sensíveis criptografados
- [ ] Logs não contêm dados sensíveis
- [ ] Dependências sem vulnerabilidades conhecidas
