---
name: database-review
description: >-
  Revisão de banco de dados SQL Server, incluindo schema, performance,
  índices, queries e Jobs do SQL Agent. Use quando o usuário quiser
  analisar, otimizar ou revisar aspectos do banco de dados.
---

# Database Review

## Áreas de Revisão

### Schema
- Naming conventions consistentes
- Tipos de dados apropriados
- Constraints (PK, FK, CHECK, UNIQUE)
- Índices adequados
- Normalização adequada (sem over-normalization)

### Performance
- Execution plans das queries críticas
- Missing indexes (DMV: `sys.dm_db_missing_index_details`)
- Index usage stats
- Wait stats
- Query Store (se habilitado)

### SQL Agent Jobs
- Documentação de cada Job
- Schedule adequado
- Alertas configurados
- Retry policy
- Histórico de falhas
- Dependências entre Jobs

### Segurança
- Princípio do menor privilégio
- Service accounts
- Audit trail
- Encryption at rest / in transit

## Comandos Úteis

```sql
-- Missing indexes
SELECT * FROM sys.dm_db_missing_index_details;

-- Top queries por CPU
SELECT TOP 10
    qs.total_worker_time / qs.execution_count AS avg_cpu,
    qs.execution_count,
    SUBSTRING(qt.text, qs.statement_start_offset/2 + 1,
        (qs.statement_end_offset - qs.statement_start_offset)/2 + 1) AS query
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_cpu DESC;

-- Job history recente
SELECT
    j.name AS JobName,
    h.run_date,
    h.run_time,
    h.run_status,
    h.message
FROM msdb.dbo.sysjobhistory h
INNER JOIN msdb.dbo.sysjobs j ON h.job_id = j.job_id
ORDER BY h.run_date DESC, h.run_time DESC;
```
