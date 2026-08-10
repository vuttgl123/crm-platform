# Account Vertical Slice Design

**Date:** 2026-08-10  
**Status:** Approved  
**Application:** `crm`  
**Bounded context:** `customer`  
**Business slice:** Account management

## Context

The CRM currently has its shared kernel, technical foundation, identity,
authentication, tenant context, permission checking, and data-scope resolution
in place. The next business capability is the first vertical slice in the
`customer` bounded context: tenant-scoped Account management.

This design is based on the Account use case in the BA reference package, the
`crm_accounts` table in `docs/crm_mysql80.sql`, and the approved pragmatic DDD
structure. The BA documents guide the direction, while the implementation must
remain practical, internally consistent, and aligned with the actual database
constraints.

## Goals

- Implement create, detail, search, update, and soft-delete Account use cases.
- Keep the Account domain independent from Spring, JDBC, HTTP, and foundation
  security types.
- Enforce tenant isolation, permissions, and Account data scopes in database
  access.
- Represent Account ownership and annual revenue as explicit value objects.
- Use optimistic concurrency for update and delete operations.
- Preserve the current modular-monolith and pragmatic DDD direction.
- Keep the public API documented in `docs/api-reference.md` when the API is
  implemented.

## Non-Goals

- Account relationships, contacts, communication channels, or addresses.
- Lead conversion or direct dependency on the `lead` bounded context.
- Account duplicate detection or merge workflows.
- Automatic Account number generation.
- A restrictive lifecycle transition state machine that is not defined by the
  current business material.
- Arbitrary JSON extensions or the public exposure of `custom_summary`.
- A generic CRUD framework, base controller, base service, or base repository.
- Domain events, outbox publication, or a complete business audit subsystem for
  simple Account CRUD.
- Automated test implementation or execution under the current repository
  instructions.

## Architectural Decision

Account is implemented as a vertical slice inside the `customer` bounded
context. The slice contains its own domain, application, infrastructure, and
presentation code. Future customer capabilities such as Contact, Address, and
Account Relationship are separate sibling slices rather than children of the
Account aggregate.

The repository contract belongs to `application.port`, not `domain`. Account
queries must consume the tenant and resolved authorization scope from
`foundation`, and allowing those technical types into the domain would violate
the approved dependency direction. The repository still loads and persists the
Account domain model, but its authorization-aware contract is an application
concern.

## Package Structure

```text
com.crm.customer
└── account
    ├── domain
    │   ├── Account.java
    │   ├── AccountId.java
    │   ├── AccountOwner.java
    │   ├── AccountOwnerType.java
    │   ├── AnnualRevenue.java
    │   ├── AccountType.java
    │   ├── AccountLifecycleStage.java
    │   └── AccountErrorCode.java
    ├── application
    │   ├── command
    │   │   ├── CreateAccountCommand.java
    │   │   ├── UpdateAccountCommand.java
    │   │   └── DeleteAccountCommand.java
    │   ├── query
    │   │   └── AccountSearchQuery.java
    │   ├── dto
    │   │   ├── AccountDetails.java
    │   │   └── AccountSummary.java
    │   ├── port
    │   │   └── AccountRepository.java
    │   ├── usecase
    │   │   └── AccountFacade.java
    │   └── service
    │       └── AccountApplicationService.java
    ├── infrastructure
    │   └── persistence
    │       ├── JdbcAccountRepository.java
    │       └── AccountJdbcMapper.java
    └── presentation
        └── web
            ├── AccountController.java
            ├── AccountWebMapper.java
            ├── CreateAccountRequest.java
            ├── UpdateAccountRequest.java
            ├── AccountSearchRequest.java
            ├── AccountResponse.java
            └── AccountSummaryResponse.java
```

Only packages containing real code are created. No empty directory tree or
marker class is added merely to mirror this diagram.

## Aggregate Boundary

`Account` is the aggregate root for one active or soft-deleted row in
`crm_accounts`. It owns Account-specific invariants and mutation behavior. It
does not contain Contact, Address, or Account Relationship collections.

The aggregate contains the fields used by this slice:

- Tenant and Account identifiers.
- Immutable Account number.
- Account type, legal name, and display name.
- Optional parent Account identifier.
- Optional typed owner.
- Lifecycle stage and industry code.
- Tax identifier, registration number, and website.
- Optional annual revenue and employee count.
- Description, preferred language, and do-not-contact preference.
- Creation, update, soft-delete, actor, and version metadata required for
  persistence and concurrency.

The existing `source_id` and `custom_summary` columns are not exposed or
modified by this slice. Repository update statements must leave them unchanged.

## Value Objects

### Account owner

`AccountOwner` is optional. When present, it contains exactly one owner type and
identifier:

```json
{
  "type": "USER",
  "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
}
```

The supported types are `USER` and `TEAM`. This removes the invalid API state
in which both `owner_user_id` and `owner_team_id` are supplied. A null owner
means that the Account is unassigned.

### Annual revenue

`AnnualRevenue` is optional and contains an amount and currency code:

```json
{
  "amount": 1500000.000000,
  "currencyCode": "USD"
}
```

The amount and currency are one business value because the database requires a
currency whenever annual revenue is present. A null value clears both database
columns.

Other Account fields remain flat. They do not gain wrapper objects until they
form a value with an independent invariant or behavior.

## Domain Rules

- `accountNumber` is supplied by the client, trimmed, between 1 and 191
  characters, unique among active Accounts in the tenant, and immutable after
  creation.
- `displayName` is trimmed, nonblank, and at most 255 characters.
- `legalName` and `taxIdentifier` are at most 255 characters.
- `industryCode` and `registrationNumber` are at most 191 characters. The
  Account number keeps its supplied letter case after trimming; the database
  collation and active-number unique index remain authoritative for duplicate
  detection.
- Optional single-line strings are trimmed and normalized from blank to null.
- `website` and `description` remain plain optional strings in this slice. No
  URL rule or business length limit is invented beyond the database column
  capacity.
- New Accounts default to type `ORGANIZATION`, lifecycle stage `PROSPECT`, and
  `doNotContact=false` when those fields are omitted.
- `accountType` is one of `ORGANIZATION`, `PERSON`, `PARTNER`, `RESELLER`, or
  `SUPPLIER`.
- `lifecycleStage` is one of `PROSPECT`, `QUALIFIED`, `CUSTOMER`, `CHURNED`, or
  `INACTIVE`.
- Lifecycle updates accept any currently supported enum value. A restrictive
  transition graph is deferred until a business rule defines one.
- Annual revenue is nonnegative, has at most 14 integer digits and 6 fractional
  digits, and therefore fits `DECIMAL(20,6)`. Its currency code is exactly three
  uppercase letters.
- Employee count is null or nonnegative.
- Preferred language is null, at most 10 characters, and matches a language tag
  supported by the schema, such as `vi`, `en`, or `vi-VN`.
- An Account cannot be its own parent.
- A parent Account must be active, available within the current tenant and
  authorized write scope, and not soft-deleted.
- An owner user must have an active membership in the same tenant.
- An owner team must be active and not soft-deleted in the same tenant.
- The requested owner must be allowed by the caller's resolved Account write
  scope.
- Soft-deleted Accounts are excluded from normal detail and search operations.
- Every successful mutation increases `version` by one.

## Application Use Cases

`AccountFacade` publishes the Account use cases to the presentation layer.
`AccountApplicationService` implements the facade, resolves the current tenant
and actor, requests authorization, owns transaction boundaries, invokes Account
behavior, and calls the repository port.

The initial use cases are:

1. Create an Account.
2. Get Account details.
3. Search Accounts with filters and pagination.
4. Replace the mutable Account state.
5. Soft-delete an Account.

Controllers validate transport structure and map HTTP DTOs. They do not contain
authorization, transaction, persistence, or domain-rule logic.

## HTTP API

All Account endpoints require a Bearer access token and an active tenant context
selected through `X-Tenant-ID`.

| Method | Path | Permission | Success |
| --- | --- | --- | --- |
| `POST` | `/api/accounts` | `crm_account.write` | `201 Created` with Account details |
| `GET` | `/api/accounts/{id}` | `crm_account.read` | `200 OK` with Account details |
| `GET` | `/api/accounts` | `crm_account.read` | `200 OK` with a page of summaries |
| `PUT` | `/api/accounts/{id}` | `crm_account.write` | `200 OK` with updated details |
| `DELETE` | `/api/accounts/{id}` | `crm_account.write` | `204 No Content` |

The DELETE endpoint requires a strong `If-Match` entity tag containing the
version the caller last observed, for example `If-Match: "3"`. Wildcard, weak,
missing, nonnumeric, zero, and negative values are request-validation failures.
The update endpoint receives a positive `version` at the top level of its JSON
body.

`docs/api-reference.md` must be updated in the same implementation task. This
design document describes planned behavior and must not be presented there as
available until the source exists.

## Request Contract

Create requires `accountNumber` and `displayName`. Account type, lifecycle
stage, and do-not-contact may be omitted to use their creation defaults. Other
fields are optional.

Update is a complete replacement of mutable Account state. It requires
`version`, `accountType`, `displayName`, `lifecycleStage`, and `doNotContact`.
An omitted or explicit null optional field clears that field. Account number is
not accepted by update and cannot be changed.

The JSON contract is mostly flat. Only `owner` and `annualRevenue` are nested
because they represent meaningful value objects. A representative response is:

```json
{
  "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "accountNumber": "ACC-00001",
  "accountType": "ORGANIZATION",
  "legalName": "Example Company Limited",
  "displayName": "Example Company",
  "parentAccountId": null,
  "owner": {
    "type": "USER",
    "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
  },
  "lifecycleStage": "PROSPECT",
  "industryCode": "SOFTWARE",
  "taxIdentifier": null,
  "registrationNumber": null,
  "website": "https://example.test",
  "annualRevenue": {
    "amount": 1500000.000000,
    "currencyCode": "USD"
  },
  "employeeCount": 50,
  "description": null,
  "preferredLanguageCode": "en",
  "doNotContact": false,
  "createdAt": "2026-08-10T10:00:00Z",
  "createdBy": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "updatedAt": "2026-08-10T10:00:00Z",
  "updatedBy": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "version": 1
}
```

Tenant identifiers, soft-delete metadata, raw persistence columns, and internal
authorization details are not returned.

Owner and annual-revenue payload records are nested within their containing
request or response DTO unless actual reuse later justifies separate public
types. Request and response payloads are not forced to share one validation
model merely because their JSON shapes are similar.

## Search Contract

The search endpoint initially accepts:

- `q` for Account number, display name, legal name, tax identifier, and
  registration number search.
- `accountType`.
- `lifecycleStage`.
- `ownerType` and `ownerId` as a pair.
- `page`, defaulting to `0`.
- `size`, defaulting to `20` and limited to `100`.

`q` is trimmed, blank is treated as absent, and its maximum length is 255.
`ownerType` and `ownerId` must either both be supplied or both be absent. Page
must be nonnegative and size must be between 1 and 100.

Results use stable ordering by `updated_at DESC, id DESC`. The response contains
`items`, `page`, `size`, `totalElements`, and `totalPages`. Each summary contains
the Account ID and number, display and legal names, type, lifecycle stage,
optional owner, do-not-contact flag, update timestamp, and version.

Search terms and filters are always combined with tenant, soft-delete, and data
scope predicates. Client-supplied sorting is deferred until there is a concrete
requirement.

## Tenant Isolation, Permission, and Data Scope

The tenant ID comes only from `CurrentTenant`; it is never accepted from a path,
query parameter, or request body. The actor comes from `CurrentActor`.

`TenantAccessAuthorizer` checks the required permission and resolves data scopes
for entity type `ACCOUNT`. The resulting `AuthorizedDataAccess` is passed to the
application repository port and converted into SQL predicates by
`JdbcAccountRepository`.

Scope behavior is:

- `TENANT`: all active Accounts in the current tenant.
- `OWN`: Accounts whose `owner_user_id` is the current actor.
- `TEAM`: Accounts assigned to an explicitly granted team.
- `TEAM_TREE`: Accounts assigned to the granted team or its active descendant
  teams.
- Multiple resolved scopes are combined with logical OR.

Data-scope predicates are applied in SQL, not as in-memory filtering after rows
have been loaded.

Create ownership rules are:

- `TENANT` may assign an Account to any valid owner in the tenant or leave it
  unassigned.
- `OWN` may assign only the current actor as user owner.
- `TEAM` and `TEAM_TREE` may assign only an allowed team owner.
- Callers without `TENANT` scope cannot create an unassigned Account because
  the newly created resource would be outside their visible scope.

Detail, update, and delete load the Account with the relevant resolved scope.
An Account that does not exist, is soft-deleted, belongs to another tenant, or
is outside the caller's scope is returned as `ACCOUNT_NOT_FOUND`. This prevents
resource-existence disclosure.

## Persistence Design

`JdbcAccountRepository` uses Spring `JdbcClient` and explicit SQL. No JPA entity
is introduced for this slice. `AccountJdbcMapper` maps result sets to domain and
application projection types without exposing JDBC details outside
infrastructure.

Repository operations always include `tenant_id` and the correct soft-delete
and data-scope predicates. The active Account number unique index remains the
authoritative concurrency-safe uniqueness guard. The application can perform a
friendly pre-check, but a database duplicate-key result must still be translated
to `ACCOUNT_NUMBER_ALREADY_EXISTS`.

Update follows this sequence in one transaction:

1. Load the active Account by tenant, identifier, and authorized write scope.
2. Compare the request version to the loaded aggregate version.
3. Validate referenced parent and owner records.
4. Apply domain behavior.
5. Update with `tenant_id`, `id`, current `version`, and
   `deleted_at IS NULL` predicates.
6. Treat a zero-row update after a successful load as
   `ACCOUNT_VERSION_CONFLICT`.

Soft delete follows the same scoped load and version check, writes
`deleted_at`, `deleted_by`, `updated_at`, and `updated_by`, and increments the
version. Physical deletion is outside this slice.

## Transaction Policy

- Create, update, and delete define `@Transactional` boundaries in
  `AccountApplicationService`.
- Detail and search use `@Transactional(readOnly = true)`.
- Controllers, mappers, domain objects, and repository mapping helpers do not
  define transactions.
- Tenant, actor, authorization, reference validation, aggregate mutation, and
  persistence for one command complete within the same transaction.
- No external network call runs in an Account transaction.

## Error Handling

Account failures use stable `AccountErrorCode` values and the existing global
`ProblemDetail` contract.

| Status | Error code | Condition |
| --- | --- | --- |
| `400` | `REQUEST_VALIDATION_FAILED` | Invalid body, query, header, UUID, enum, or field validation |
| `401` | `AUTHENTICATION_REQUIRED` | Missing or invalid access token |
| `403` | `ACCESS_DENIED` | Missing permission or data scope, or requested ownership is outside the authorized scope |
| `404` | `ACCOUNT_NOT_FOUND` | Account is absent, deleted, cross-tenant, or outside the caller's scope |
| `409` | `ACCOUNT_NUMBER_ALREADY_EXISTS` | Active Account number already exists in the tenant |
| `409` | `ACCOUNT_VERSION_CONFLICT` | Update or delete uses a stale version |
| `422` | `ACCOUNT_OWNER_INVALID` | Owner is absent, inactive, deleted, or outside the tenant |
| `422` | `ACCOUNT_PARENT_INVALID` | Parent is absent, deleted, self-referencing, or otherwise invalid |
| `422` | `ACCOUNT_REVENUE_CURRENCY_REQUIRED` | Revenue is supplied without a currency |

Invalid enum values and malformed nested objects are transport validation
failures. Unexpected database failures remain `INTERNAL_ERROR`. SQL, constraint
names, stack traces, tenant data, and authorization internals are never returned
to the client.

## Verification Strategy

Current repository instructions prohibit adding or running automated tests,
running a build as an indirect test, starting the application, or calling the
database or API. Implementation verification is therefore limited to read-only
static inspection of:

- Package and dependency direction.
- Domain independence from Spring, JDBC, HTTP, and foundation.
- Controller, mapper, DTO, and validation consistency.
- Tenant, soft-delete, version, and data-scope predicates in every repository
  operation.
- Stable error-code declarations and message-bundle entries.
- SQL structure and parameter binding.
- Source-to-`docs/api-reference.md` contract synchronization.
- The final diff, without modifying user-owned `.idea` or generated files.

The user-run verification checklist is:

1. Create an Account with user owner, team owner, and no owner where authorized.
2. Verify `crm_account.read` and `crm_account.write` independently.
3. Verify `OWN`, `TEAM`, `TEAM_TREE`, and `TENANT` data scopes.
4. Verify cross-tenant and outside-scope resources are unavailable.
5. Verify duplicate active Account numbers return the stable conflict.
6. Verify stale update and delete versions return the version conflict.
7. Verify soft-deleted Accounts disappear from detail and search.
8. Verify parent, owner, revenue, currency, employee count, language, enum, and
   pagination validation.
9. Verify search terms, filters, stable ordering, and page metadata.

## Deferred Work

The following items are intentionally recorded for later slices:

- Account Relationship, Contact, Address, and Communication Channel slices.
- Lead conversion and `source_id` integration through an explicit published
  cross-context contract rather than a direct Customer-to-Lead dependency.
- Controlled custom fields and any future use of `custom_summary`.
- Duplicate detection, duplicate review, and Account merge workflows.
- Configurable Account number generation if the business adopts that rule.
- A lifecycle transition matrix and lifecycle history if business rules require
  more than enum validation.
- Domain events, outbox publication, notifications, and richer business audit.
- Owner display projections if clients later require more than owner type and
  identifier.
- Configurable sorting or cursor pagination when a measured requirement exists.
- Automated domain, application, repository, security-scope, and web tests if
  the repository test restriction is explicitly overridden.
- Synchronizing Account-related BA wording with the approved optional typed
  owner model, client-supplied Account number, and deliberately unrestricted
  lifecycle enum updates.

## Acceptance Criteria

- Account code is contained in `com.crm.customer.account` and follows the
  approved vertical-slice package structure.
- Account domain code has no Spring, JDBC, HTTP, or foundation dependency.
- `AccountRepository` is an authorization-aware application port implemented by
  `JdbcAccountRepository`.
- Account number is immutable and unique among active tenant Accounts.
- Owner and annual revenue use typed nested value objects; other API fields stay
  flat unless a real invariant requires nesting.
- Every Account read and write is explicitly tenant-scoped and data-scope-aware.
- Account detail outside scope is indistinguishable from a missing Account.
- Create ownership follows the approved scope rules.
- Update and delete enforce optimistic concurrency.
- Delete is a soft delete and removed Accounts are hidden by default.
- Errors use the approved stable codes and safe `ProblemDetail` responses.
- No generic CRUD abstraction, speculative event framework, or cross-context
  repository dependency is introduced.
- Implemented endpoints and examples are documented in
  `docs/api-reference.md` in the same implementation task.
- Deferred items remain outside the first Account slice and are preserved in
  this document for future planning.
