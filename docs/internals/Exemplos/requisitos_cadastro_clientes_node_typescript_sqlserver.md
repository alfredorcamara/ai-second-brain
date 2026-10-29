# Documento de Requisitos --- Cadastro Completo de Clientes

**Projeto:** API de Cadastro de Clientes\
**Tecnologias-alvo:** Node.js, TypeScript e Microsoft SQL Server\
**Versão:** 1.0\
**Data:** 15/10/2026\
**Status:** Especificação funcional e técnica inicial

------------------------------------------------------------------------

## 1. Objetivo

Definir os requisitos funcionais, regras de negócio, modelo de dados,
dicionário de dados, contratos de API, validações, segurança, auditoria
e critérios de aceite para implementar um módulo completo de cadastro e
gerenciamento de clientes usando **Node.js + TypeScript** e **Microsoft
SQL Server**.

O documento deve ser usado como especificação para desenvolvimento por
uma equipe ou por uma ferramenta de programação assistida por IA.
Requisitos marcados como **decisão de negócio** devem ser confirmados
pelo responsável pelo produto antes de entrar em produção.

## 2. Escopo

O módulo deverá permitir:

-   Cadastrar clientes pessoa física (PF) e pessoa jurídica (PJ).
-   Consultar clientes por identificador, documento, nome, situação e
    filtros combinados.
-   Atualizar dados cadastrais, mantendo histórico de alterações
    relevantes.
-   Ativar, bloquear, desbloquear e inativar clientes conforme
    permissões.
-   Gerenciar contatos, endereços e dados complementares.
-   Consultar histórico de eventos e auditoria.
-   Prevenir duplicidade de documentos e inconsistências concorrentes.
-   Validar dados na API e reforçar integridade no banco.
-   Expor API REST documentada com OpenAPI/Swagger.
-   Aplicar autenticação, autorização, proteção de dados pessoais e
    trilha de auditoria.

### 2.1 Fora do escopo inicial

-   Análise de crédito, limite de crédito, cobrança e faturamento.
-   Integração com Receita Federal, SERPRO, bureaus ou serviços de
    validação externos.
-   Emissão de documentos fiscais.
-   CRM, campanhas de marketing e automações comerciais.
-   Sincronização com ERP/SAP, salvo se aprovada como fase posterior.

Esses itens podem ser integrados depois, sem misturar suas regras ao
núcleo cadastral.

## 3. Premissas e decisões que precisam ser confirmadas

A especificação adota as seguintes premissas iniciais:

1.  O sistema opera no Brasil, com documentos CPF/CNPJ, CEP e telefones
    nacionais, mas permite endereço internacional se a operação exigir.
2.  Um cliente possui um identificador interno imutável, independente do
    CPF/CNPJ.
3.  CPF/CNPJ é armazenado apenas com dígitos; a máscara é aplicada na
    apresentação.
4.  Um documento válido só pode estar associado a um cliente ativo ou
    inativo por vez. Recomenda-se impedir duplicidade independentemente
    da situação, salvo regra formal de exceção.
5.  Exclusão física não é permitida para registros cadastrais utilizados
    em operações; deve-se usar inativação lógica.
6.  O cadastro pode ser salvo como rascunho/incompleto apenas se o
    negócio aprovar explicitamente esse fluxo. Por padrão, o endpoint de
    criação exige os campos obrigatórios.
7.  O consentimento para marketing não é condição para cadastrar ou
    atender o cliente.
8.  Não se deve presumir que todo tratamento de dados exige
    consentimento; a base legal deve ser definida pelo controlador
    conforme a finalidade e a LGPD.
9.  Regras fiscais, comerciais e de obrigatoriedade de campos variam por
    negócio. Elas devem ser configuráveis quando aplicável e não
    codificadas como suposições universais.

**Antes da produção, confirmar:** unicidade de CPF/CNPJ, possibilidade
de cliente estrangeiro, exigência de inscrição estadual, política de
exclusão, campos obrigatórios por segmento, política de retenção e
perfis autorizados.

## 4. Glossário

  -----------------------------------------------------------------------
  Termo                               Definição
  ----------------------------------- -----------------------------------
  Cliente                             Pessoa física ou jurídica
                                      cadastrada no sistema.

  PF                                  Pessoa física.

  PJ                                  Pessoa jurídica.

  Documento                           CPF, CNPJ ou documento estrangeiro
                                      aceito pela política do sistema.

  Inativação lógica                   Alteração de situação sem apagar o
                                      registro do banco.

  Auditoria                           Registro de quem realizou uma ação,
                                      quando e qual entidade foi afetada.

  Idempotência                        Garantia de que repetir uma
                                      requisição identificada não duplica
                                      a operação.

  PII / dado pessoal                  Informação relacionada a pessoa
                                      natural identificada ou
                                      identificável.

  DTO                                 Objeto de transferência de dados
                                      usado na fronteira da API.
  -----------------------------------------------------------------------

## 5. Perfis e permissões

O sistema deve integrar-se ao mecanismo de autenticação corporativo ou
usar um provedor de identidade aprovado. Não implementar autenticação
caseira sem avaliação de segurança.

  -------------------------------------------------------------------------------------
  Ação                           Consulta       Operador     Supervisor   Administrador
                                               cadastral                
  ------------------------ -------------- -------------- -------------- ---------------
  Consultar dados                     Sim            Sim            Sim             Sim
  permitidos                                                            

  Criar cliente                       Não            Sim            Sim             Sim

  Alterar dados cadastrais            Não            Sim            Sim             Sim

  Inativar cliente                    Não       Conforme            Sim             Sim
                                                política                

  Bloquear/desbloquear                Não            Não            Sim             Sim

  Consultar auditoria                 Não       Limitado            Sim             Sim
  detalhada                                                             

  Administrar                         Não            Não            Não             Sim
  usuários/configurações                                                

  Exportar dados em massa             Não       Conforme       Conforme   Sim, auditado
                                                política       política 
  -------------------------------------------------------------------------------------

A autorização deve ser validada no servidor em cada operação. Ocultar
botões na interface não substitui autorização na API.

## 6. Requisitos funcionais

### RF-001 --- Criar cliente

A API deve permitir criar um cliente PF ou PJ, validar o payload,
verificar duplicidade e persistir os dados em uma transação.

### RF-002 --- Consultar cliente por ID

A API deve retornar um cliente pelo identificador interno. A resposta
deve respeitar o perfil do usuário e não expor campos internos
desnecessários.

### RF-003 --- Pesquisar clientes

A pesquisa deve aceitar filtros combináveis, paginação, ordenação por
campos permitidos e limite máximo de página. Deve evitar consultas sem
limite e varreduras desnecessárias.

Filtros recomendados: nome/razão social, nome fantasia, CPF/CNPJ,
situação, tipo de pessoa, e-mail, cidade, UF, data de criação e data da
última atualização.

### RF-004 --- Atualizar cliente

A API deve atualizar somente os campos permitidos. A operação deve
verificar existência, autorização, versão do registro e regras de
unicidade. Atualizações parciais devem distinguir campo omitido de campo
explicitamente enviado como `null`.

### RF-005 --- Alterar situação

A API deve oferecer ações explícitas para ativar, bloquear, desbloquear
e inativar. Não permitir mudança de situação arbitrária por atualização
genérica do objeto.

### RF-006 --- Gerenciar endereços

Permitir cadastrar, atualizar, consultar e inativar endereços. Um
cliente pode ter vários endereços e, conforme a regra definida, no
máximo um endereço principal de cada finalidade.

### RF-007 --- Gerenciar contatos

Permitir vários telefones e e-mails, com classificação, indicador
principal e confirmação/verificação opcional. Deve existir uma regra
determinística para escolha do contato principal.

### RF-008 --- Histórico e auditoria

Registrar criação, alteração, mudança de situação,
inclusão/alteração/inativação de endereço e contato, consultas sensíveis
e exportações relevantes conforme política de auditoria.

### RF-009 --- Prevenir duplicidade

Impedir duplicidade de CPF/CNPJ normalizado por meio de validação na
aplicação e restrição/índice único no banco. A validação prévia na API
não é suficiente para evitar corrida entre requisições concorrentes.

### RF-010 --- Controle de concorrência

O sistema deve impedir que uma atualização baseada em dados antigos
sobrescreva silenciosamente uma atualização mais recente. Utilizar
`rowversion` ou mecanismo equivalente.

### RF-011 --- Importação em lote (fase opcional)

Caso habilitada, deve validar cada linha, registrar resultado
individual, permitir reprocessamento idempotente e limitar tamanho, taxa
e duração do lote. Erros de uma linha não devem corromper registros
válidos de outras linhas.

### RF-012 --- Exportação (fase opcional)

Exportações devem exigir permissão específica, registrar auditoria,
aplicar limites e minimizar dados pessoais. Não exportar dados sensíveis
por padrão.

## 7. Regras de negócio

### RN-001 --- Tipo de pessoa

O campo `tipoPessoa` aceita exclusivamente `PF` ou `PJ`. A estrutura de
dados e as validações dependem desse valor.

### RN-002 --- CPF

Para PF brasileira: - Remover máscara antes de validar e persistir. -
Exigir 11 dígitos quando CPF for obrigatório. - Validar os dígitos
verificadores. - Rejeitar sequências evidentemente inválidas, como todos
os dígitos iguais. - A validação matemática não prova que o documento
existe, pertence à pessoa ou está regular perante a Receita Federal. -
Não armazenar CPF com pontuação.

### RN-003 --- CNPJ

Para PJ brasileira: - Remover máscara antes de validar e persistir. -
Aceitar o formato de 14 dígitos e validar os dígitos verificadores
segundo a regra vigente. - A implementação deve considerar a evolução
oficial do padrão CNPJ alfanumérico, se aplicável à data de implantação.
Não assumir que o documento será sempre composto exclusivamente por
números. - A validação local não comprova existência ou situação
cadastral oficial.

### RN-004 --- Documento único

O documento normalizado deve ser único dentro do escopo definido pelo
negócio. Por padrão, a unicidade é global no cadastro, inclusive para
clientes inativos. Se documentos estrangeiros forem aceitos, usar
combinação de país emissor, tipo e valor normalizado.

### RN-005 --- Nome

-   PF: `nomeCompleto` obrigatório para cadastro completo.
-   PJ: `razaoSocial` obrigatória; `nomeFantasia` pode ser opcional
    conforme negócio.
-   Remover espaços excedentes nas extremidades e normalizar espaços
    repetidos para fins de apresentação.
-   Preservar acentos e grafia informada.
-   Não usar o nome como identificador único.

### RN-006 --- E-mail

-   Remover espaços externos.
-   Validar sintaxe de forma pragmática; validação sintática não garante
    existência.
-   Armazenar em tamanho adequado e comparar sem distinção de
    maiúsculas/minúsculas conforme política definida.
-   E-mail pode ser compartilhado entre pessoas, salvo exigência
    comercial específica.
-   Não substituir automaticamente o e-mail existente sem registrar a
    alteração.

### RN-007 --- Telefone

-   Armazenar código do país, DDD/código de área e número separadamente
    ou em formato internacional normalizado.
-   Classificar como celular, fixo, comercial, residencial ou outro.
-   Não presumir que um telefone pertence ao cliente sem confirmação.
-   Permitir múltiplos números e definir no máximo um principal por
    cliente e finalidade, se essa for a regra aprovada.

### RN-008 --- Endereço

-   Validar UF e país segundo tabelas de referência.
-   CEP brasileiro deve ser armazenado normalizado, preferencialmente
    apenas com dígitos.
-   Número pode ser alfanumérico; permitir "S/N" quando a política
    permitir.
-   Complemento e referência são opcionais.
-   Não confiar exclusivamente no CEP para preencher ou validar
    endereço.
-   Permitir endereços internacionais se habilitados.

### RN-009 --- Inscrição estadual e municipal

A obrigatoriedade depende do regime, atividade, estado, município e
finalidade do cadastro. Não marcar como universalmente obrigatória.
Quando preenchida, validar formato conforme a jurisdição aplicável;
validação local não comprova situação oficial.

### RN-010 --- Situação do cliente

Valores sugeridos: - `ATIVO`: pode ser utilizado nos processos que
aceitam clientes ativos. - `BLOQUEADO`: existe, mas operações de negócio
podem ser impedidas. - `INATIVO`: não deve ser usado em novas operações,
mas permanece consultável e auditável.

A transição deve ocorrer por endpoint específico, com motivo obrigatório
para bloqueio/inativação. Definir quem pode desbloquear e se inativação
exige ausência de pendências em sistemas integrados.

### RN-011 --- Exclusão

Não apagar fisicamente clientes com histórico ou referências. A remoção
física, quando legalmente cabível, deve seguir processo controlado,
retenção, anonimização/pseudonimização e validação jurídica. Não
utilizar exclusão física como operação normal da API.

### RN-012 --- Campos de auditoria

`criadoEm` e `atualizadoEm` devem ser preenchidos pelo servidor/banco em
UTC. `criadoPor` e `atualizadoPor` devem identificar o usuário ou
serviço autenticado. O cliente não pode enviar esses campos para definir
seus próprios valores.

### RN-013 --- Concorrência otimista

Cada cliente deve ter token de versão (`rowversion`). A atualização deve
incluir a versão lida; se o registro mudou desde então, retornar
conflito HTTP `409` ou `412`, conforme o contrato da API, sem
sobrescrever a alteração concorrente.

### RN-014 --- Transações

A gravação do cliente e dos dados dependentes enviados no mesmo comando
deve ocorrer em transação SQL. Em caso de falha, reverter todas as
gravações da operação.

### RN-015 --- Idempotência

Para criação/requisições críticas, suportar opcionalmente
`Idempotency-Key`. A mesma chave e o mesmo conteúdo devem retornar o
resultado anterior; a mesma chave com conteúdo diferente deve retornar
conflito. A retenção da chave deve ser definida operacionalmente.

### RN-016 --- Normalização e pesquisa

Normalizar documentos e campos técnicos antes de comparar. Não alterar
arbitrariamente a grafia oficial de nomes. A pesquisa parcial por nome
deve usar parâmetros SQL e estratégia de índices adequada.

### RN-017 --- Dados pessoais e LGPD

-   Documentar finalidade e base legal para cada categoria de dado.
-   Coletar somente dados necessários.
-   Restringir acesso por função e necessidade.
-   Criptografar tráfego com TLS e proteger backups, segredos e discos
    conforme a política corporativa.
-   Não registrar CPF, documentos completos, tokens ou payloads pessoais
    em logs comuns.
-   Definir retenção, atendimento aos direitos dos titulares, correção e
    eventual anonimização com Jurídico/Encarregado de Dados.
-   Consentimento de marketing deve ser separado do cadastro e ter
    registro de origem, data, finalidade e revogação, quando utilizado.
-   A aplicação não deve alegar conformidade legal automática apenas por
    implementar estes controles.

### RN-018 --- Erros

Mensagens devem ser claras sem revelar SQL, stack trace, credenciais,
estrutura interna ou dados de terceiros. Erros técnicos completos ficam
em logs protegidos com identificador de correlação.

### RN-019 --- Datas e fuso horário

Persistir timestamps técnicos em UTC usando `datetime2` ou
`datetimeoffset`, conforme necessidade. Converter para fuso local apenas
na apresentação. Datas civis, como data de nascimento, devem ser
armazenadas como `date`, sem conversão de fuso.

### RN-020 --- Exclusividade de endereço/contato principal

Se a regra aprovada exigir um endereço ou contato principal por
categoria, a mudança deve ocorrer em transação: desmarcar o principal
anterior e marcar o novo. Criar índice filtrado/estratégia equivalente
no banco para reforçar a regra.

## 8. Modelo de dados lógico

Entidades principais:

1.  `Cliente`: dados centrais e situação.
2.  `ClienteEndereco`: endereços do cliente.
3.  `ClienteContato`: e-mails e telefones.
4.  `ClienteDocumentoAdicional`: documentos complementares, se
    necessários.
5.  `ClienteHistorico`: histórico funcional de alterações relevantes.
6.  `AuditoriaEvento`: trilha técnica/administrativa.
7.  `IdempotenciaRequisicao`: controle opcional de idempotência.
8.  Tabelas de referência, como país, UF, tipo de contato e motivo de
    bloqueio, quando necessário.

### 8.1 Relacionamentos

-   Um `Cliente` possui zero ou muitos `ClienteEndereco`.
-   Um `Cliente` possui zero ou muitos `ClienteContato`.
-   Um `Cliente` possui zero ou muitos eventos de histórico/auditoria.
-   As entidades dependentes usam chave estrangeira para `Cliente`.
-   A política de exclusão das FKs deve evitar apagar dependências
    acidentalmente; preferir `NO ACTION` e inativação lógica.

## 9. Dicionário de dados

Os tamanhos abaixo são propostas iniciais. Confirmar com o domínio,
padrões corporativos e integrações existentes antes de criar o banco.

### 9.1 Tabela `dbo.Cliente`

  ------------------------------------------------------------------------------------------------
  Campo                      Tipo SQL Server                    Obrigatório Regra/descrição
  -------------------------- ------------------------ --------------------- ----------------------
  `ClienteId`                `bigint IDENTITY(1,1)`                     Sim Chave primária
                                                                            interna. Imutável.

  `PublicId`                 `uniqueidentifier`                         Sim Identificador público
                                                                            opaco; gerar no
                                                                            servidor. Índice
                                                                            único.

  `TipoPessoa`               `char(2)`                                  Sim `PF` ou `PJ`. Check
                                                                            constraint.

  `NomeCompleto`             `nvarchar(200)`                    Condicional Obrigatório para PF;
                                                                            nulo para PJ conforme
                                                                            modelo escolhido.

  `RazaoSocial`              `nvarchar(200)`                    Condicional Obrigatório para PJ;
                                                                            nulo para PF conforme
                                                                            modelo escolhido.

  `NomeFantasia`             `nvarchar(200)`                            Não Nome comercial da PJ.

  `DocumentoTipo`            `varchar(20)`                              Sim Ex.: `CPF`, `CNPJ`,
                                                                            `ESTRANGEIRO`.

  `DocumentoPais`            `char(2)`                                  Sim País emissor em código
                                                                            ISO 3166-1 alpha-2.

  `DocumentoNormalizado`     `varchar(32)`                              Sim Documento sem máscara,
                                                                            conforme tipo e regra
                                                                            de normalização.

  `DataNascimentoAbertura`   `date`                             Condicional Data de nascimento PF
                                                                            ou abertura PJ, se
                                                                            coletada.

  `InscricaoEstadual`        `nvarchar(30)`                             Não Conforme regras
                                                                            fiscais aplicáveis.

  `InscricaoMunicipal`       `nvarchar(30)`                             Não Conforme regras
                                                                            locais.

  `Situacao`                 `varchar(12)`                              Sim `ATIVO`, `BLOQUEADO`,
                                                                            `INATIVO`.

  `MotivoSituacao`           `nvarchar(500)`                            Não Justificativa de
                                                                            bloqueio/inativação.

  `Observacao`               `nvarchar(1000)`                           Não Observação cadastral
                                                                            não sensível;
                                                                            restringir uso.

  `CriadoEm`                 `datetime2(3)`                             Sim Data/hora UTC de
                                                                            criação. Default no
                                                                            banco.

  `CriadoPor`                `nvarchar(128)`                            Sim Identidade autenticada
                                                                            que criou.

  `AtualizadoEm`             `datetime2(3)`                             Sim Data/hora UTC da
                                                                            última alteração.

  `AtualizadoPor`            `nvarchar(128)`                            Sim Identidade que
                                                                            atualizou.

  `InativadoEm`              `datetime2(3)`                             Não Data/hora UTC da
                                                                            inativação.

  `InativadoPor`             `nvarchar(128)`                            Não Identidade responsável
                                                                            pela inativação.

  `RowVersion`               `rowversion`                               Sim Token de concorrência;
                                                                            gerado pelo SQL
                                                                            Server.
  ------------------------------------------------------------------------------------------------

**Decisão de modelagem:** para facilitar regras de PF/PJ, pode-se manter
uma única tabela com campos condicionais e `CHECK` constraints. Se o
domínio crescer, considerar tabelas especializadas `ClientePessoaFisica`
e `ClientePessoaJuridica`, ligadas por FK 1:1.

**Índices recomendados:** - PK clustered em `ClienteId` (validar padrão
corporativo). - Índice único em `PublicId`. - Índice único em
(`DocumentoPais`, `DocumentoTipo`, `DocumentoNormalizado`), caso a
política seja de unicidade global. - Índice em (`Situacao`,
`TipoPessoa`, `ClienteId`) conforme padrão de consulta. - Índice para
nome/razão social apenas após avaliar volume e padrão de pesquisa. Para
buscas por prefixo, índice convencional pode ajudar; busca por substring
pode exigir Full-Text Search ou outra estratégia.

### 9.2 Tabela `dbo.ClienteEndereco`

  -------------------------------------------------------------------------------------
  Campo             Tipo SQL Server                    Obrigatório Regra/descrição
  ----------------- ------------------------ --------------------- --------------------
  `EnderecoId`      `bigint IDENTITY(1,1)`                     Sim Chave primária.

  `ClienteId`       `bigint`                                   Sim FK para `Cliente`.

  `TipoEndereco`    `varchar(20)`                              Sim Ex.: `RESIDENCIAL`,
                                                                   `COMERCIAL`,
                                                                   `COBRANCA`,
                                                                   `ENTREGA`, `FISCAL`.

  `PaisCodigo`      `char(2)`                                  Sim País do endereço.

  `CEP`             `varchar(12)`                      Condicional CEP ou código postal
                                                                   normalizado.

  `Logradouro`      `nvarchar(200)`                            Sim Rua, avenida etc.

  `Numero`          `nvarchar(20)`                     Condicional Permitir "S/N"
                                                                   conforme política.

  `Complemento`     `nvarchar(100)`                            Não Apartamento, bloco
                                                                   etc.

  `Bairro`          `nvarchar(100)`                    Condicional Conforme país e
                                                                   negócio.

  `Cidade`          `nvarchar(100)`                            Sim Cidade/localidade.

  `UF`              `char(2)`                          Condicional Obrigatória para
                                                                   endereços
                                                                   brasileiros,
                                                                   conforme regra
                                                                   aprovada.

  `Referencia`      `nvarchar(200)`                            Não Referência para
                                                                   localização; evitar
                                                                   dados
                                                                   desnecessários.

  `Principal`       `bit`                                      Sim Indicador de
                                                                   endereço principal.

  `Ativo`           `bit`                                      Sim Inativação lógica do
                                                                   endereço.

  `CriadoEm`        `datetime2(3)`                             Sim Data/hora UTC de
                                                                   criação.

  `CriadoPor`       `nvarchar(128)`                            Sim Identidade criadora.

  `AtualizadoEm`    `datetime2(3)`                             Sim Data/hora UTC da
                                                                   última alteração.

  `AtualizadoPor`   `nvarchar(128)`                            Sim Identidade
                                                                   atualizadora.

  `RowVersion`      `rowversion`                               Sim Controle de
                                                                   concorrência.
  -------------------------------------------------------------------------------------

Regras adicionais: FK para cliente; índice em (`ClienteId`, `Ativo`); se
aplicável, índice único filtrado para impedir mais de um endereço
principal ativo por tipo de endereço. Confirmar comportamento do SQL
Server e incluir `TipoEndereco` no índice filtrado.

### 9.3 Tabela `dbo.ClienteContato`

  ---------------------------------------------------------------------------------------
  Campo                  Tipo SQL Server                    Obrigatório Regra/descrição
  ---------------------- ------------------------ --------------------- -----------------
  `ContatoId`            `bigint IDENTITY(1,1)`                     Sim Chave primária.

  `ClienteId`            `bigint`                                   Sim FK para
                                                                        `Cliente`.

  `TipoContato`          `varchar(20)`                              Sim `EMAIL`,
                                                                        `TELEFONE`,
                                                                        `WHATSAPP`,
                                                                        `OUTRO`.

  `Categoria`            `varchar(20)`                              Não Ex.: `PESSOAL`,
                                                                        `COMERCIAL`,
                                                                        `FINANCEIRO`.

  `Valor`                `nvarchar(254)`                            Sim E-mail ou valor
                                                                        de contato
                                                                        normalizado.

  `PaisTelefone`         `char(2)`                                  Não País do telefone.

  `CodigoPaisTelefone`   `varchar(4)`                               Não Ex.: código
                                                                        internacional.

  `DDD`                  `varchar(5)`                               Não Código de área,
                                                                        quando aplicável.

  `NumeroTelefone`       `varchar(20)`                              Não Número sem
                                                                        formatação.

  `Principal`            `bit`                                      Sim Indica contato
                                                                        principal
                                                                        conforme
                                                                        política.

  `Verificado`           `bit`                                      Sim Se houve processo
                                                                        de verificação.
                                                                        Default `0`.

  `VerificadoEm`         `datetime2(3)`                             Não Data/hora UTC da
                                                                        verificação.

  `AceitaMarketing`      `bit`                                      Sim Preferência de
                                                                        marketing,
                                                                        default `0`; não
                                                                        equivale por si
                                                                        só a base legal
                                                                        universal.

  `Ativo`                `bit`                                      Sim Inativação
                                                                        lógica.

  `CriadoEm`             `datetime2(3)`                             Sim Data/hora UTC de
                                                                        criação.

  `CriadoPor`            `nvarchar(128)`                            Sim Identidade
                                                                        criadora.

  `AtualizadoEm`         `datetime2(3)`                             Sim Data/hora UTC da
                                                                        última alteração.

  `AtualizadoPor`        `nvarchar(128)`                            Sim Identidade
                                                                        atualizadora.

  `RowVersion`           `rowversion`                               Sim Controle de
                                                                        concorrência.
  ---------------------------------------------------------------------------------------

Nota: se os telefones forem frequentes e usados para pesquisa, pode ser
melhor separar os campos por tipo e manter `ValorNormalizado` indexável.
Não usar `Valor` para misturar telefone e e-mail sem validação por
`TipoContato`.

### 9.4 Tabela `dbo.ClienteHistorico`

  -----------------------------------------------------------------------------------
  Campo              Tipo SQL Server                    Obrigatório Regra/descrição
  ------------------ ------------------------ --------------------- -----------------
  `HistoricoId`      `bigint IDENTITY(1,1)`                     Sim Chave primária.

  `ClienteId`        `bigint`                                   Sim Cliente afetado.

  `Evento`           `varchar(40)`                              Sim Ex.: `CRIADO`,
                                                                    `ATUALIZADO`,
                                                                    `BLOQUEADO`,
                                                                    `DESBLOQUEADO`,
                                                                    `INATIVADO`.

  `Resumo`           `nvarchar(500)`                            Sim Descrição
                                                                    objetiva, sem
                                                                    dados pessoais
                                                                    desnecessários.

  `AlteracoesJson`   `nvarchar(max)`                            Não JSON com campos
                                                                    alterados;
                                                                    excluir segredos
                                                                    e minimizar PII.

  `Motivo`           `nvarchar(500)`                            Não Motivo informado
                                                                    pelo usuário
                                                                    quando exigido.

  `OcorridoEm`       `datetime2(3)`                             Sim Data/hora UTC.

  `OcorridoPor`      `nvarchar(128)`                            Sim Usuário/serviço
                                                                    autenticado.

  `CorrelationId`    `varchar(100)`                             Não Identificador
                                                                    para
                                                                    correlacionar
                                                                    logs e
                                                                    requisição.
  -----------------------------------------------------------------------------------

A aplicação deve validar o JSON antes de gravar quando houver
necessidade de consultá-lo como JSON no SQL Server. Restringir leitura e
retenção.

### 9.5 Tabela `dbo.AuditoriaEvento`

  -------------------------------------------------------------------------------------------
  Campo                   Tipo SQL Server                    Obrigatório Regra/descrição
  ----------------------- ------------------------ --------------------- --------------------
  `AuditoriaId`           `bigint IDENTITY(1,1)`                     Sim Chave primária.

  `Entidade`              `varchar(50)`                              Sim Ex.: `Cliente`,
                                                                         `ClienteEndereco`.

  `EntidadeId`            `varchar(100)`                             Sim Identificador do
                                                                         registro afetado.

  `Acao`                  `varchar(30)`                              Sim `CREATE`,
                                                                         `READ_SENSITIVE`,
                                                                         `UPDATE`,
                                                                         `STATUS_CHANGE`,
                                                                         `EXPORT`.

  `UsuarioId`             `nvarchar(128)`                            Sim Identidade
                                                                         autenticada.

  `OcorridoEm`            `datetime2(3)`                             Sim Data/hora UTC.

  `CorrelationId`         `varchar(100)`                             Não Correlação
                                                                         distribuída.

  `Resultado`             `varchar(20)`                              Sim `SUCESSO` ou
                                                                         `FALHA`.

  `DetalhesSegurosJson`   `nvarchar(max)`                            Não Metadados
                                                                         minimizados, sem
                                                                         segredos nem
                                                                         documento completo.
  -------------------------------------------------------------------------------------------

A auditoria não deve gravar senhas, tokens, cabeçalhos de autorização ou
payloads integrais indiscriminadamente. Proteger a tabela contra
alteração por usuários da aplicação e definir retenção.

### 9.6 Tabela opcional `dbo.IdempotenciaRequisicao`

  --------------------------------------------------------------------------------------------
  Campo              Tipo SQL Server                    Obrigatório Regra/descrição
  ------------------ ------------------------ --------------------- --------------------------
  `IdempotenciaId`   `bigint IDENTITY(1,1)`                     Sim PK.

  `Chave`            `varchar(100)`                             Sim Chave recebida no header.

  `Escopo`           `nvarchar(128)`                            Sim Usuário/cliente/endpoint
                                                                    conforme desenho.

  `HashRequisicao`   `char(64)`                                 Sim Hash do conteúdo canônico.

  `StatusHttp`       `smallint`                                 Sim Resultado armazenado.

  `RespostaJson`     `nvarchar(max)`                            Não Resposta anterior, sem
                                                                    dados desnecessários.

  `CriadoEm`         `datetime2(3)`                             Sim UTC.

  `ExpiraEm`         `datetime2(3)`                             Sim UTC; política de retenção.
  --------------------------------------------------------------------------------------------

Criar índice único em (`Escopo`, `Chave`). A execução concorrente deve
ser protegida por transação/índice único.

## 10. Contratos da API REST

Prefixo sugerido: `/api/v1`.

  --------------------------------------------------------------------------------------------------------
  Método            Endpoint                                        Finalidade          Resposta típica
  ----------------- ----------------------------------------------- ------------------- ------------------
  `POST`            `/clientes`                                     Criar cliente       `201 Created`

  `GET`             `/clientes/{publicId}`                          Consultar cliente   `200 OK`

  `GET`             `/clientes`                                     Pesquisar/paginar   `200 OK`

  `PATCH`           `/clientes/{publicId}`                          Atualizar campos    `200 OK`
                                                                    permitidos          

  `POST`            `/clientes/{publicId}/bloqueio`                 Bloquear            `200 OK`

  `POST`            `/clientes/{publicId}/desbloqueio`              Desbloquear         `200 OK`

  `POST`            `/clientes/{publicId}/inativacao`               Inativar            `200 OK`

  `POST`            `/clientes/{publicId}/ativacao`                 Reativar, se        `200 OK`
                                                                    permitido           

  `GET`             `/clientes/{publicId}/enderecos`                Listar endereços    `200 OK`

  `POST`            `/clientes/{publicId}/enderecos`                Criar endereço      `201 Created`

  `PATCH`           `/clientes/{publicId}/enderecos/{enderecoId}`   Atualizar endereço  `200 OK`

  `DELETE`          `/clientes/{publicId}/enderecos/{enderecoId}`   Inativar endereço,  `204 No Content`
                                                                    não apagar          
                                                                    fisicamente         

  `GET`             `/clientes/{publicId}/contatos`                 Listar contatos     `200 OK`

  `POST`            `/clientes/{publicId}/contatos`                 Criar contato       `201 Created`

  `PATCH`           `/clientes/{publicId}/contatos/{contatoId}`     Atualizar contato   `200 OK`

  `DELETE`          `/clientes/{publicId}/contatos/{contatoId}`     Inativar contato    `204 No Content`

  `GET`             `/clientes/{publicId}/historico`                Consultar histórico `200 OK`
                                                                    conforme permissão  
  --------------------------------------------------------------------------------------------------------

`DELETE` é semântica HTTP para remover/inativar o recurso da visão
ativa; a implementação deve realizar inativação lógica conforme esta
especificação.

### 10.1 Pesquisa e paginação

Exemplo de consulta:

`GET /api/v1/clientes?tipoPessoa=PF&situacao=ATIVO&nome=Maria&page=1&pageSize=25&sort=criadoEm&direction=desc`

Regras: - `page` inicia em 1. - `pageSize` padrão 25 e máximo sugerido
100. - `sort` aceita apenas lista branca de campos. - Valores de filtro
devem ser parametrizados; nunca concatenar entrada do usuário no SQL. -
Resposta inclui `items`, `page`, `pageSize`, `totalItems` e, quando
viável, `totalPages`. - Para volumes muito altos, avaliar paginação por
cursor em vez de `OFFSET`.

### 10.2 Exemplo de criação --- PF

``` json
{
  "tipoPessoa": "PF",
  "documentoTipo": "CPF",
  "documentoPais": "BR",
  "documento": "12345678909",
  "nomeCompleto": "Maria da Silva",
  "dataNascimentoAbertura": "1990-05-12",
  "contatos": [
    {
      "tipoContato": "EMAIL",
      "valor": "maria@example.com",
      "principal": true
    },
    {
      "tipoContato": "TELEFONE",
      "codigoPaisTelefone": "55",
      "ddd": "82",
      "numeroTelefone": "999999999",
      "principal": false
    }
  ],
  "enderecos": [
    {
      "tipoEndereco": "RESIDENCIAL",
      "paisCodigo": "BR",
      "cep": "57000000",
      "logradouro": "Rua Exemplo",
      "numero": "100",
      "bairro": "Centro",
      "cidade": "Maceió",
      "uf": "AL",
      "principal": true
    }
  ]
}
```

O documento acima é ilustrativo; o CPF de exemplo não deve ser usado
como identidade real. Os dados de exemplo precisam ser substituídos por
dados sintéticos válidos para testes automatizados.

### 10.3 Exemplo de criação --- PJ

``` json
{
  "tipoPessoa": "PJ",
  "documentoTipo": "CNPJ",
  "documentoPais": "BR",
  "documento": "11222333000181",
  "razaoSocial": "Empresa Exemplo Ltda.",
  "nomeFantasia": "Empresa Exemplo",
  "inscricaoEstadual": null,
  "contatos": [
    {
      "tipoContato": "EMAIL",
      "categoria": "COMERCIAL",
      "valor": "contato@example.com",
      "principal": true
    }
  ],
  "enderecos": [
    {
      "tipoEndereco": "COMERCIAL",
      "paisCodigo": "BR",
      "cep": "57000000",
      "logradouro": "Avenida Exemplo",
      "numero": "500",
      "bairro": "Centro",
      "cidade": "Maceió",
      "uf": "AL",
      "principal": true
    }
  ]
}
```

Usar somente dados sintéticos nos ambientes de desenvolvimento e testes.

## 11. Padrão de resposta e erros

A API deve usar códigos HTTP coerentes e uma estrutura de erro
consistente, preferencialmente baseada em `application/problem+json`
(RFC 9457).

  -----------------------------------------------------------------------
  Código                              Situação
  ----------------------------------- -----------------------------------
  `400`                               Payload inválido ou parâmetros
                                      malformados.

  `401`                               Usuário não autenticado.

  `403`                               Usuário sem permissão.

  `404`                               Cliente/recurso não encontrado ou
                                      não visível ao usuário.

  `409`                               Documento duplicado, conflito de
                                      estado, idempotência divergente ou
                                      concorrência, conforme contrato.

  `412`                               Pré-condição/versão não satisfeita,
                                      se adotado `If-Match`.

  `422`                               Regras de negócio não atendidas, se
                                      esse padrão for adotado.

  `429`                               Limite de requisições excedido.

  `500`                               Falha inesperada sem detalhes
                                      internos na resposta.

  `503`                               Dependência temporariamente
                                      indisponível.
  -----------------------------------------------------------------------

Exemplo:

``` json
{
  "type": "https://api.exemplo.com/errors/cliente-documento-duplicado",
  "title": "Documento já cadastrado",
  "status": 409,
  "detail": "Já existe um cliente associado ao documento informado.",
  "traceId": "00-abc123..."
}
```

Não retornar o documento existente nem seus dados para justificar
duplicidade.

## 12. Arquitetura técnica recomendada

### 12.1 Camadas

-   **API/Presentation:** rotas, autenticação, autorização, DTOs e
    validação de entrada.
-   **Application:** casos de uso, regras de negócio, transações e
    orquestração.
-   **Domain:** entidades, tipos, políticas e regras independentes de
    infraestrutura.
-   **Infrastructure:** repositórios SQL Server, migrações, logging,
    relógio e integrações.
-   **Tests:** testes unitários, integração, contrato e segurança.

Evitar colocar regras de negócio diretamente nos controllers ou depender
de validação apenas na interface.

### 12.2 Stack recomendada

-   Node.js em versão LTS aprovada pela organização.
-   TypeScript com `strict: true`.
-   Framework HTTP: Fastify ou NestJS. Escolher um e padronizar; NestJS
    favorece módulos e estrutura corporativa, enquanto Fastify é enxuto
    e performático.
-   SQL Server com driver `mssql` e consultas parametrizadas; avaliar
    ORM (Prisma/TypeORM) somente após validar compatibilidade e
    necessidades de SQL.
-   Validação de DTOs com Zod ou biblioteca equivalente.
-   OpenAPI/Swagger gerado e versionado.
-   Testes com Vitest/Jest e testes de integração com banco SQL Server
    de ambiente controlado.
-   Logging estruturado com Pino ou equivalente.
-   Métricas e tracing compatíveis com OpenTelemetry, quando
    disponíveis.
-   Segredos em cofre aprovado; nunca em repositório.
-   Migrações SQL versionadas e revisadas.

### 12.3 Organização de pastas sugerida

``` text
src/
  app.ts
  server.ts
  config/
    env.ts
  modules/
    clientes/
      clientes.routes.ts
      clientes.controller.ts
      clientes.service.ts
      clientes.repository.ts
      clientes.schemas.ts
      clientes.types.ts
      clientes.domain.ts
      clientes.errors.ts
    enderecos/
    contatos/
    auditoria/
  infrastructure/
    database/
      sqlserver.ts
      migrations/
    logging/
    security/
  shared/
    errors/
    http/
    validation/
tests/
  unit/
  integration/
  contract/
docs/
  requisitos-cadastro-clientes.md
  openapi.yaml
```

A estrutura é uma referência; adaptar ao framework escolhido sem
misturar responsabilidades.

## 13. Requisitos de SQL Server

1.  Usar parâmetros em todas as consultas; nunca concatenar valores do
    usuário em SQL.
2.  Criar chaves estrangeiras, `CHECK` constraints e índices únicos que
    reforcem regras críticas.
3.  Definir tipos Unicode para nomes e endereços (`nvarchar`).
4.  Definir tamanho de pool de conexões conforme carga e limite do
    servidor; não abrir uma conexão por requisição sem pool.
5.  Configurar timeout e cancelamento de consultas.
6.  Usar transações para gravações relacionadas.
7.  Evitar `SELECT *`; selecionar apenas colunas necessárias.
8.  Revisar planos de execução e índices com dados representativos.
9.  Não adotar `NOLOCK` como padrão para cadastro: pode retornar dados
    não confirmados ou inconsistentes. Escolher isolamento com o DBA,
    avaliando `READ COMMITTED`, `READ_COMMITTED_SNAPSHOT` e requisitos
    de consistência.
10. Não habilitar RCSI ou alterar opções do banco sem análise de DBA,
    testes e plano de reversão.
11. Definir política de backup, restauração, recuperação e retenção.
12. Separar usuário de execução da aplicação do usuário de
    migração/administração; aplicar menor privilégio.
13. Evitar que a conta da API tenha permissão de `DROP`, `ALTER` ou
    administração de banco em produção.

## 14. Segurança e privacidade

-   TLS obrigatório entre cliente e API; conexões SQL protegidas
    conforme a infraestrutura.
-   Autenticação OAuth 2.0/OIDC ou mecanismo corporativo aprovado.
-   Autorização por função e, se necessário, por
    organização/filial/tenant.
-   Rate limiting, limites de payload e proteção contra abuso.
-   CORS restritivo quando houver cliente browser.
-   Validação de entrada e saída; evitar mass assignment.
-   Proteção contra SQL injection e erros de autorização por IDOR.
-   Segredos e chaves fora do código-fonte.
-   Logs sem CPF/CNPJ completo, telefone completo, e-mail completo ou
    payload sensível, salvo justificativa formal.
-   Criptografia em repouso conforme capacidade do ambiente e
    classificação da informação.
-   Rotação de credenciais e plano de resposta a incidentes.
-   Revisão de dependências, auditoria de vulnerabilidades e atualização
    de runtime.
-   Política para exportação, acesso privilegiado e consultas em massa.
-   Definição de retenção e descarte com áreas responsáveis.

## 15. Requisitos não funcionais

  -----------------------------------------------------------------------
  ID                                  Requisito
  ----------------------------------- -----------------------------------
  RNF-001                             API versionada e documentada com
                                      OpenAPI.

  RNF-002                             Código TypeScript compilado em CI;
                                      `strict` habilitado.

  RNF-003                             Operações críticas com logs
                                      estruturados e
                                      `correlationId`/`traceId`.

  RNF-004                             Paginação obrigatória em pesquisas.

  RNF-005                             Consultas SQL parametrizadas e com
                                      timeout definido.

  RNF-006                             Índices e plano de execução
                                      avaliados com volume
                                      representativo.

  RNF-007                             Métricas de latência, erros, pool
                                      de conexões e saturação
                                      disponíveis.

  RNF-008                             Testes automatizados de regras de
                                      negócio, integração e autorização.

  RNF-009                             Deploy repetível com migrações
                                      versionadas e rollback documentado.

  RNF-010                             Dados pessoais minimizados em logs,
                                      telemetria e ambientes não
                                      produtivos.

  RNF-011                             Limites de payload, paginação,
                                      concorrência e taxa configuráveis.

  RNF-012                             Backup e restauração testados de
                                      acordo com RPO/RTO aprovados.

  RNF-013                             Compatibilidade com versões de
                                      Node.js e SQL Server homologadas
                                      pela empresa.

  RNF-014                             Nenhum segredo ou dado real de
                                      cliente em exemplos, testes ou
                                      repositório.
  -----------------------------------------------------------------------

Metas quantitativas de desempenho, disponibilidade, RPO e RTO devem ser
definidas pelo negócio/infraestrutura; não assumir números sem
levantamento de carga.

## 16. Validações e critérios de aceite

### CA-001 --- Cadastro PF válido

Dado um payload PF completo e válido, quando enviado por usuário
autorizado, então o cliente deve ser criado e retornar `201`, com
`PublicId` e campos de auditoria gerados pelo servidor.

### CA-002 --- Cadastro PJ válido

Dado um payload PJ válido, quando enviado por usuário autorizado, então
o cliente deve ser criado com razão social e documento consistentes.

### CA-003 --- Documento duplicado

Dado um documento já cadastrado, quando uma segunda criação for tentada,
então a API deve retornar conflito sem revelar dados do primeiro
cliente.

### CA-004 --- Concorrência

Dadas duas requisições concorrentes para cadastrar o mesmo documento, no
máximo uma deve ser concluída com sucesso.

### CA-005 --- CPF/CNPJ inválido

Dado um documento com formato ou dígitos verificadores inválidos, a API
deve rejeitar o payload com erro de validação padronizado.

### CA-006 --- Atualização parcial

Dado um PATCH, apenas os campos enviados devem ser alterados; campos
omitidos devem permanecer inalterados.

### CA-007 --- Concorrência de atualização

Dado um token de versão desatualizado, a API deve retornar
conflito/pré-condição não atendida e não sobrescrever alterações mais
recentes.

### CA-008 --- Inativação

Ao inativar um cliente, o registro deve continuar disponível para
consultas autorizadas e deixar de ser aceito em operações que exijam
cliente ativo.

### CA-009 --- Transação

Se a gravação de endereço/contato falhar durante a criação conjunta,
nenhuma parte da operação deve ficar parcialmente gravada.

### CA-010 --- Autorização

Usuário sem permissão não pode criar, alterar, bloquear, inativar,
exportar ou consultar histórico restrito, mesmo que invoque a API
diretamente.

### CA-011 --- Proteção de logs

Logs operacionais não devem conter documentos completos, tokens ou
payloads sensíveis por padrão.

### CA-012 --- Pesquisa

A pesquisa deve respeitar filtros, ordenação permitida, paginação e
limites máximos; valores maliciosos não podem alterar a instrução SQL.

### CA-013 --- Contato principal

Ao definir um contato principal, a regra de unicidade por
cliente/categoria deve ser respeitada de forma transacional, se essa
regra for aprovada.

### CA-014 --- Auditoria

Ações cadastrais relevantes devem produzir eventos com identidade,
horário UTC, entidade, ação e correlação.

## 17. Plano mínimo de testes

-   Testes unitários de CPF, CNPJ, normalização, regras PF/PJ e
    transições de situação.
-   Testes para campos omitidos, `null`, strings vazias e limites
    máximos.
-   Testes de integração contra SQL Server real ou ambiente de teste
    compatível.
-   Testes de índices únicos sob concorrência.
-   Testes de transação e rollback.
-   Testes de `rowversion`/concorrência otimista.
-   Testes de autorização por perfil.
-   Testes de SQL injection e mass assignment.
-   Testes de paginação, ordenação e limites.
-   Testes de idempotência e repetição de requisição.
-   Testes de migração em banco vazio e atualização a partir da versão
    anterior.
-   Testes de carga com cenários representativos antes de definir metas
    de produção.

## 18. Observabilidade e operação

Registrar, sem dados pessoais desnecessários: - Quantidade de criações,
atualizações, inativações e conflitos. - Latência por endpoint e
percentis. - Taxa de erro por categoria e código HTTP. - Falhas de
conexão, timeout e saturação do pool SQL. - Quantidade de documentos
duplicados rejeitados, sem registrar o valor do documento. -
Correlation/trace ID para rastrear uma requisição entre API e banco.

Criar alertas para aumento de erros 5xx, latência, timeouts, saturação
do pool e falhas persistentes de banco. Definir dashboards e limites
conforme o ambiente real.

## 19. Estratégia de implantação

1.  Confirmar decisões de negócio da seção 3.
2.  Revisar o modelo de dados com DBA, segurança, jurídico/privacidade e
    responsáveis comerciais.
3.  Criar migrações SQL versionadas e revisar constraints/índices.
4.  Implementar domínio e testes unitários.
5.  Implementar repositórios SQL parametrizados e testes de integração.
6.  Implementar API, autenticação, autorização e OpenAPI.
7.  Executar análise de segurança, carga e concorrência.
8.  Implantar primeiro em ambiente de desenvolvimento/homologação com
    dados sintéticos.
9.  Planejar migração de dados, deduplicação e reconciliação se houver
    base legada.
10. Implantar em produção com monitoramento, backup validado e plano de
    rollback.
11. Revisar métricas e ajustar índices/pool após observar carga real.

## 20. Entregáveis esperados da implementação

-   Código-fonte Node.js/TypeScript organizado por camadas.
-   Scripts/migrações SQL Server versionados.
-   OpenAPI/Swagger.
-   Arquivo `.env.example` sem segredos.
-   Testes unitários e de integração.
-   Guia de instalação e execução local.
-   Guia de configuração de conexão SQL Server.
-   Guia de deploy e rollback.
-   Guia de segurança e variáveis de ambiente.
-   Dicionário de dados atualizado após decisões finais.
-   Matriz de permissões.
-   Exemplos de requisição/resposta.
-   Relatório de testes e limitações conhecidas.

## 21. Checklist de decisões antes do desenvolvimento

-   [ ] Unicidade global de CPF/CNPJ, inclusive clientes inativos.
-   [ ] Aceitação de documentos estrangeiros e padrão de normalização.
-   [ ] CNPJ alfanumérico: suporte obrigatório já na primeira versão?
-   [ ] Cadastro incompleto/rascunho permitido?
-   [ ] Endereço e contato obrigatórios no cadastro inicial?
-   [ ] Regras para endereço principal e contato principal.
-   [ ] Campos fiscais obrigatórios por tipo de cliente/atividade.
-   [ ] Reativação de cliente inativo e permissões necessárias.
-   [ ] Bloqueio: motivos válidos e impactos nas integrações.
-   [ ] Política de retenção, anonimização e atendimento LGPD.
-   [ ] Autenticação/provedor de identidade.
-   [ ] Volume estimado, concorrência e metas de latência.
-   [ ] Necessidade de importação/exportação em lote.
-   [ ] Necessidade de multiempresa/tenant/filial.
-   [ ] Padrões internos de nomes, schemas, auditoria e migrações SQL.

## 22. Orientação final para a equipe ou agente de IA

Implemente o sistema com base neste documento, mas **não invente regras
de negócio ausentes**. Quando uma decisão estiver marcada como pendente,
apresente a dúvida e adote uma configuração explícita, documentada e
reversível para desenvolvimento. Não enfraqueça integridade de dados,
segurança, auditoria ou testes para acelerar a entrega.

Antes de considerar concluído, execute testes, valide as migrações em
SQL Server, confira o OpenAPI gerado e entregue instruções completas
para execução local e implantação. Não declarar testes executados se
eles não tiverem sido realmente executados.

------------------------------------------------------------------------

**Fim do documento.**
