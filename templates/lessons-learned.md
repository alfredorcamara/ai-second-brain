# Lições Aprendidas — [Nome do Projeto]

> Este documento registra erros, armadilhas técnicas e aprendizados específicos deste projeto.
> Qualquer agente de IA ou desenvolvedor deve consultar este arquivo antes de implementar ou alterar código.

---

## Como Registrar uma Lição:
- **Contexto**: O que estava sendo feito quando o problema ocorreu.
- **Causa Raiz**: O motivo técnico real da falha (biblioteca, banco, contrato de API, regra de negócio).
- **O que NÃO fazer**: O padrão que quebrou ou gerou débito técnico.
- **Padrão Correto**: A solução validada e obrigatória para este projeto daqui em diante.

---

## Histórico de Lições Aprendidas

### [YYYY-MM-DD] — Exemplo: Tratamento de Webhooks e Raw Body
- **Contexto**: Ao integrar a rota de notificações de pagamentos externos.
- **Causa Raiz**: O middleware padrão de JSON alterava os bytes da requisição, invalidando a assinatura criptográfica HMAC.
- **O que NÃO fazer**: Nunca passar payloads de webhook por parsers de JSON que mutam o payload antes da verificação de assinatura.
- **Padrão Correto**: Utilizar captura de raw body buffer exclusivamente na rota de webhooks antes do middleware global.
