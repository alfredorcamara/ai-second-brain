---
name: database-review
description: >-
  Review of database schemas, SQL queries, indexes, and migrations.
  Use when designing tables, optimizing slow queries, or reviewing data integrity.
---

# Database Review

## Checklist

1. **Schema & Naming**: Consistent naming conventions, appropriate primary/foreign keys, and explicit constraints.
2. **Performance & Indexing**: Verify indexes on foreign keys and frequent filter/join columns; avoid `SELECT *` and N+1 queries.
3. **Security**: 100% parameterized queries (zero string concatenation in SQL).
4. **Migrations**: Idempotent, reversible, and safe for zero-downtime deployment.
