# Regras para SQL Server

> Convenções para SQL Server, SQL Agent Jobs e T-SQL.

## Convenções T-SQL

```sql
-- Keywords em MAIÚSCULAS
SELECT
    j.JobName,
    j.LastRunDate,
    j.Status
FROM dbo.Jobs AS j
INNER JOIN dbo.JobHistory AS jh
    ON j.JobId = jh.JobId
WHERE j.IsActive = 1
ORDER BY j.LastRunDate DESC;
```

## SQL Agent Jobs

- Todo Job deve ter documentação do propósito.
- Alertas configurados para falha.
- Histórico de execução monitorado.
- Jobs críticos com retry automático.

## Performance

- Sempre analise execution plans para queries complexas.
- Use índices adequados — nem demais, nem de menos.
- Evite `SELECT *` — selecione apenas colunas necessárias.
- Use `SET NOCOUNT ON` em stored procedures.
- Evite cursors — prefira set-based operations.
- Parametrize queries para evitar SQL injection e melhorar cache de planos.

## Monitoração

- DMVs para análise de performance.
- Wait stats para diagnóstico.
- Extended Events para rastreamento.
- Alertas em `msdb.dbo.sysjobhistory` para Jobs.

## Backup e Recovery

- Full backup diário (mínimo).
- Transaction log backup a cada 15 minutos para bancos críticos.
- Teste de restore regularmente.
- Documente RPO e RTO por banco.

## Segurança

- Princípio do menor privilégio.
- Não use `sa` para aplicações.
- Service accounts com permissões mínimas.
- Auditing habilitado para bancos críticos.
