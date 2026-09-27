# Regras para .NET

> Convenções e padrões para desenvolvimento em .NET/C#.

## Versões

- .NET 8+ (LTS preferido)
- C# 12+
- Entity Framework Core 8+

## Arquitetura

- Clean Architecture / Vertical Slice conforme o projeto.
- Separação clara: Domain, Application, Infrastructure, Presentation.
- Dependency Injection nativa do .NET.
- Options Pattern para configuração.

## Convenções de Código

```csharp
// Nomes em PascalCase para públicos
public class JobMonitorService { }
public interface IJobMonitorService { }

// Nomes em camelCase para privados
private readonly ILogger<JobMonitorService> _logger;
private int _retryCount;

// Async sempre com sufixo Async
public Task<Result> ProcessJobAsync(CancellationToken ct) { }

// Cancellation Token em todo método async
public async Task ExecuteAsync(CancellationToken cancellationToken) { }
```

## Padrões Obrigatórios

1. **Result Pattern** — Evite exceções para fluxo de controle.
2. **CancellationToken** — Em todo método assíncrono.
3. **ILogger** — Structured logging com Serilog.
4. **FluentValidation** — Para validação de inputs.
5. **MediatR** — Para CQRS quando aplicável.

## Entity Framework

- Migrations versionadas.
- Configurações em classes `IEntityTypeConfiguration<T>`.
- Queries com `AsNoTracking()` para leitura.
- Evite N+1 queries — use `Include()` ou projections.

## Testes

- xUnit para testes unitários.
- FluentAssertions para assertions.
- NSubstitute ou Moq para mocks.
- Testcontainers para integração.
- Mínimo 80% coverage em lógica de negócio.

## Performance

- Use `Span<T>` e `Memory<T>` quando relevante.
- Prefira `ValueTask` quando aplicável.
- Cache com `IMemoryCache` ou `IDistributedCache`.
- Health checks com `IHealthCheck`.
