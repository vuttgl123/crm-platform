# Pragmatic DDD Project Structure Design

**Date:** 2026-08-03  
**Status:** Approved  
**Application:** `crm`  
**Architecture:** Pragmatic Domain-Driven Design within a modular monolith

## Context

The current Spring Boot application contains only a small technical foundation: application bootstrap, security configuration, request tracing, logging, and centralized API error handling. The business scope is documented separately in the BA package and MySQL schema.

The business model contains 37 use cases and 66 tables across platform administration, core CRM, catalog, sales, marketing, customer support, privacy, integration, and audit. The schema is multi-tenant and has many intentional cross-module foreign keys. The Java code therefore needs explicit business boundaries before entities, repositories, and use cases are implemented.

The selected approach is Pragmatic DDD. Strategic DDD defines bounded contexts throughout the system. Tactical DDD concepts such as aggregates, value objects, domain services, domain events, and repository ports are applied where business invariants justify them. Simple reference-data and configuration flows must not be burdened with unnecessary domain abstractions.

## Goals

- Organize code by business capability instead of global technical layers.
- Keep one Spring Boot deployable while preserving clear module boundaries.
- Separate reusable domain concepts from technical infrastructure.
- Prevent direct repository and persistence-model access across bounded contexts.
- Make tenant isolation, authorization, transaction boundaries, audit, and tracing explicit.
- Support complex workflows without forcing full tactical DDD onto simple CRUD operations.
- Keep the structure understandable and maintainable as the CRM grows.

## Non-Goals

- Splitting the application into microservices.
- Creating separate Maven modules during the initial foundation phase.
- Building a generic CRUD framework.
- Adding `BaseController`, `BaseService`, or `BaseRepository` abstractions.
- Implementing all business modules while establishing the foundation.
- Building the outbox worker, webhook delivery engine, or complete audit subsystem in the foundation phase.
- Adding abstractions solely for hypothetical future requirements.

## Architectural Decision

The application remains one Maven module and one Spring Boot deployment unit initially. Its internal structure follows bounded contexts and enforces the dependency direction of a modular monolith.

DDD and the modular monolith address different concerns:

- The modular monolith defines deployment and runtime boundaries.
- DDD defines domain ownership, language, rules, and dependency boundaries.

Combining them allows local transactions and simple deployment while keeping future extraction possible when a business or operational need appears.

## Top-Level Package Structure

```text
com.crm
├── CrmApplication.java
│
├── sharedkernel
│   ├── domain
│   └── application
│
├── foundation
│   ├── config
│   ├── security
│   ├── tenancy
│   ├── persistence
│   ├── web
│   ├── validation
│   ├── logging
│   ├── time
│   ├── identifier
│   └── event
│
├── platform
├── customer
├── lead
├── opportunity
├── engagement
├── catalog
├── sales
├── marketing
├── support
├── privacy
├── integration
└── audit
```

Database table prefixes do not automatically define Java bounded contexts. The large `crm_` database area is split into customer, lead, opportunity, and engagement contexts because those capabilities have different rules and lifecycles.

## Bounded Context Ownership

| Context | Responsibility | Primary table ownership |
| --- | --- | --- |
| `platform` | Tenant, user membership, team hierarchy, RBAC, tenant settings, and document numbering | `platform_*` |
| `customer` | Accounts, account relationships, contacts, communication channels, and addresses | Customer-related `crm_*` tables |
| `lead` | Lead sources, statuses, qualification, status history, assignment, and conversion | `crm_lead_*`, `crm_leads` |
| `opportunity` | Pipelines, stages, opportunities, contacts, lost reasons, and stage history | Pipeline- and opportunity-related `crm_*` tables |
| `engagement` | Activities, participants, links, notes, tags, and controlled custom fields | Activity, note, tag, and custom-field `crm_*` tables |
| `catalog` | Product categories, products, price books, and effective prices | `catalog_*` |
| `sales` | Quotes, approvals, orders, fulfillment, and contracts | `sales_*` |
| `marketing` | Campaigns and campaign membership | `marketing_*` |
| `support` | Ticket categories, SLA policies, tickets, comments, and ticket events | `service_*` |
| `privacy` | Consent, retention, legal holds, and data-subject requests | `privacy_*` |
| `integration` | External ID mapping, outbox, webhook delivery, idempotency, and import jobs | `integration_*` |
| `audit` | Business change history and sensitive-data access history | `audit_*` |

Each bounded context owns its persistence mappings and repository implementations. Physical foreign keys may remain in the database for integrity, but they do not authorize Java modules to share JPA entities.

## Internal Bounded Context Structure

Each bounded context uses the following structure when all layers are needed:

```text
lead
├── domain
│   ├── model
│   ├── rule
│   ├── event
│   ├── service
│   └── repository
├── application
│   ├── command
│   ├── query
│   ├── usecase
│   └── dto
├── infrastructure
│   ├── persistence
│   └── messaging
└── presentation
    └── rest
```

Packages are created only when they contain real behavior. Empty package trees and marker types are not scaffolded merely to match the diagram.

### Domain

The domain layer owns business language, state transitions, invariants, aggregates, value objects, domain services, domain events, and repository contracts. It must not depend on Spring MVC, security filters, REST DTOs, or persistence implementations.

Rich domain models are used for workflows such as lead conversion, opportunity stage changes, quote approval, order fulfillment, contract lifecycle, ticket SLA, and privacy requests. Simple lookup or configuration operations may use a lightweight model without artificial aggregates and factories.

### Application

The application layer owns use-case orchestration, transaction boundaries, authorization calls, commands, queries, input/output DTOs, and calls to domain or published module interfaces. It must not contain core business rules that belong to the domain.

### Infrastructure

The infrastructure layer implements repository ports, JPA persistence, mapping, external-system adapters, messaging, and technical event publication. Persistence-specific base classes belong under `foundation.persistence`, not in the shared domain kernel.

For complex aggregates, the domain model remains persistence-independent and infrastructure maps between domain and JPA representations. Simple reference-data flows may use lightweight application projections, but infrastructure types must not leak into another bounded context.

### Presentation

The presentation layer owns REST controllers, request validation, request/response mapping, and HTTP-specific concerns. Controllers do not implement business rules or open transactions.

## Shared Kernel

`sharedkernel` contains only stable concepts with genuine cross-domain meaning.

Initial scope:

```text
sharedkernel
├── domain
│   ├── AggregateRoot
│   ├── DomainEvent
│   ├── DomainException
│   ├── TenantId
│   └── ActorId
└── application
    ├── PageQuery
    └── PageResult
```

`ActorId` represents the authenticated actor in the tenant context, normally the tenant-membership identity used by the schema. It does not contain credentials.

The shared kernel must remain small. A class used by only one bounded context stays in that context. Business enums, module DTOs, JPA entities, repositories, and web responses never belong in the shared kernel.

## Foundation

`foundation` contains technical capabilities that support the application without owning CRM business rules.

```text
foundation
├── config
├── security
│   ├── CurrentActor
│   └── PermissionChecker
├── tenancy
│   ├── CurrentTenant
│   └── TenantContext
├── persistence
│   ├── auditing
│   └── transaction
├── web
│   ├── error
│   └── validation
├── logging
├── time
├── identifier
└── event
```

Foundation responsibilities include:

- Resolving current tenant and actor context.
- Technical authorization contracts used by application services.
- Domain error codes and HTTP error mapping.
- Validation-error formatting.
- Persistence audit metadata and transaction support.
- Clock and identifier providers.
- Existing request tracing, Logback configuration support, security configuration, and localized, trace-aware API error handling.
- The technical contract for domain-event collection and publication.

Foundation must not contain business entities, module-specific enums, business state transitions, or generic CRUD services.

## Dependency Rules

The standard dependency direction is:

```text
presentation -> application -> domain -> sharedkernel
infrastructure -> application/domain
application -> foundation contracts
presentation/infrastructure -> foundation technical services
foundation -> sharedkernel where necessary
```

Additional rules:

- Domain code does not depend on presentation or infrastructure.
- Domain code does not depend on foundation; application code consumes its tenant, actor, authorization, time, and identifier contracts.
- A module never imports another module's JPA entity or repository implementation.
- Cross-context references are represented by identifiers or published contracts.
- JPA relationships are allowed within one bounded context only.
- Database foreign keys across contexts may remain, but Java maps them as scalar identifiers.
- `platform` does not become a god module. Other contexts consume focused contracts such as `CurrentTenant`, `CurrentActor`, `PermissionChecker`, and `DocumentNumberGenerator`.
- Cyclic context dependencies are prohibited.
- A published application interface is preferred over exposing internal package structure.

## Request and Use-Case Flow

A normal synchronous request follows this path:

```text
REST Controller
    -> Command or Query DTO
    -> Application Use Case
    -> Domain Aggregate or Domain Service
    -> Repository Port
    -> Infrastructure Adapter
    -> Response DTO
```

The controller validates transport format. The application use case resolves tenant and actor, performs authorization, opens the transaction, invokes domain behavior, persists results, and maps the output. The domain owns the invariant. Infrastructure performs technical I/O.

## Cross-Context Communication

Cross-context communication uses two explicit mechanisms:

1. **Synchronous application interface:** Used when the caller requires an immediate result or the workflow must commit atomically in one local transaction.
2. **Domain event and outbox:** Used for secondary effects, notifications, audit integration, and external publication that do not need to control the immediate result.

Domain events must not hide a workflow that requires synchronous consistency. Events sent outside the application are written to the outbox in the same transaction as the business change.

### Lead Conversion Example

```text
LeadController
  -> ConvertLeadUseCase
  -> validate Lead aggregate
  -> Customer application interface creates or links Account and Contact
  -> Opportunity application interface optionally creates Opportunity
  -> update Lead conversion state and status history
  -> persist Audit and Outbox records
  -> commit the complete operation
```

If any required step fails, the transaction rolls back. The lead cannot be partially converted.

## Transaction Policy

- Command use cases define `@Transactional` boundaries.
- Query use cases use `@Transactional(readOnly = true)` when database access requires a transaction.
- Controllers and domain objects do not define transaction boundaries.
- Important aggregate updates use optimistic locking.
- Business state, required audit records, and outbox records commit atomically when the use case requires them.
- External network calls do not run inside the core business transaction unless an explicit requirement makes that unavoidable.

## Tenant Isolation

MySQL does not provide PostgreSQL-style row-level security for this application, so tenant isolation is enforced explicitly in application and persistence code.

- `tenantId` comes from `CurrentTenant`, never from a client-controlled request body.
- Every tenant-owned command and query is scoped by `tenantId`.
- Repositories expose tenant-aware methods and predicates.
- Cross-record relationships are validated as belonging to the same tenant before persistence.
- A resource from another tenant is treated as unavailable rather than disclosing its existence.
- Hidden Hibernate filters may provide defense in depth later, but they are not the only enforcement mechanism.
- Data-scope authorization is evaluated independently from tenant isolation.

## Error Handling

The domain exposes business failures without HTTP knowledge.

```text
DomainException
├── BusinessRuleViolation
├── InvalidStateTransition
├── ResourceConflict
└── DomainResourceNotFound
```

`foundation.web` maps controlled exceptions to Spring `ProblemDetail` responses. A response includes the HTTP status, stable application error code, safe detail, request path, and current trace ID.

Example:

```json
{
  "status": 409,
  "code": "LEAD_ALREADY_CONVERTED",
  "detail": "Lead has already been converted",
  "path": "/api/leads/123/convert",
  "traceId": "7f448f32-f280-4dc3-9b07-6431a85957bb"
}
```

Status mapping:

- `400 Bad Request`: Invalid request format or field validation.
- `401 Unauthorized`: Missing or invalid authentication.
- `403 Forbidden`: Missing permission or data scope.
- `404 Not Found`: Resource unavailable in the current tenant.
- `409 Conflict`: Duplicate data, optimistic-lock conflict, or invalid current state.
- `422 Unprocessable Content`: Syntactically valid request that violates a complex business rule.
- `500 Internal Server Error`: Unexpected failure.

Unexpected stack traces, SQL details, credentials, and internal implementation details are never returned to clients. One boundary owns the exception stack-trace log so application layers do not repeatedly log and rethrow the same exception. The response trace ID correlates with server logs.

## Security and Authorization

- Authentication produces a current actor and tenant context.
- Application use cases request authorization through focused contracts.
- Business permissions and data scope are checked before loading or mutating protected aggregates where practical.
- Domain rules remain separate from technical RBAC checks.
- Sensitive read/export operations request audit recording without logging sensitive values.
- Tenant, actor, and trace values are correlation metadata; credentials and secrets are never part of domain events or logs.

## Base-First Delivery Scope

The first implementation phase establishes only the shared kernel and technical foundation required by the next real business use case.

It includes:

- The approved `sharedkernel` and `foundation` packages.
- Tenant and actor abstractions.
- Domain exception hierarchy and stable error-code contract.
- Global `ProblemDetail` handling and validation errors.
- Minimal audit metadata, clock, and identifier abstractions.
- Domain-event contracts without a complex event framework.
- Relocation of existing security, logging, and request-tracing code into the approved foundation packages while preserving behavior.
- Localized API error handling with stable error codes at the web boundary.

It excludes:

- Business entities and repositories.
- Platform RBAC implementation.
- Outbox processing and external messaging workers.
- Generic CRUD infrastructure.
- Empty packages or unused marker interfaces.

## Recommended Delivery Order

1. Shared kernel and foundation.
2. Platform tenant, identity, team, and RBAC capabilities.
3. Minimal audit and integration/outbox capabilities required by business workflows.
4. Customer context.
5. Lead and opportunity contexts.
6. Catalog and sales contexts.
7. Marketing, support, and privacy contexts.

Each business context should receive its own design and implementation plan rather than implementing the entire CRM in one change.

## Verification and Testability Strategy

The architecture is designed for the following verification layers when test execution is authorized:

- Domain rules can be tested without Spring.
- Application use cases can be tested with fake ports.
- Infrastructure adapters can be tested independently for persistence, security, and mapping behavior.
- Architecture rules can prevent domain-to-Spring dependencies and cross-context repository access.
- Tenant-isolation scenarios can verify that every read and write rejects cross-tenant access.

Current repository instructions prohibit running or adding tests unless the user explicitly overrides that rule. The foundation phase therefore uses read-only static checks for package layout, imports, dependency direction, configuration structure, and accidental cross-context coupling. No build, application startup, database connection, test execution, staging, or commit is part of the approved workflow.

## Acceptance Criteria

- `sharedkernel` and `foundation` are separate and have distinct responsibilities.
- No catch-all `base` or `common` package is introduced.
- Business code is organized by bounded context.
- Each bounded context owns its persistence mappings and repository implementations.
- No module imports another module's JPA entities or repository implementation.
- Domain code remains independent from web and persistence implementation details.
- Tenant and actor context are explicit application dependencies.
- Transaction boundaries are defined at command use cases.
- Errors use stable codes and safe `ProblemDetail` responses containing the trace ID.
- Generic CRUD base classes and speculative abstractions are absent.
- Existing logging and security behavior is preserved when moved into `foundation`; the temporary database health API is absent.
- The initial implementation is limited to the approved base-first scope.
