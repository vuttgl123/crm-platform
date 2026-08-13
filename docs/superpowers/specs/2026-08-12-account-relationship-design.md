# Account Relationship Slice Design

**Date:** 2026-08-12

**Status:** Approved

**Application:** `crm`

**Bounded context:** `customer`

**Business slice:** Account relationship management

## Context

The core Account vertical slice already provides tenant-scoped create, detail,
search, update, and soft-delete operations with functional permissions and
Account data scopes. The next deliberately small customer capability is
UC-CUS-002: managing directed relationships between existing Accounts.

The `crm_account_relationships` table already stores the source Account,
related Account, relationship type, validity period, description, and creation
audit data. This slice uses that table without changing its schema.

## Goals

- Create a directed relationship between two active Accounts in one tenant.
- List incoming and outgoing relationships for an accessible Account.
- End an open-ended relationship without deleting its history.
- Reuse `crm_account.read`, `crm_account.write`, and the existing `ACCOUNT`
  data-scope model.
- Prevent cross-tenant links, self-reference, invalid validity periods, and
  duplicate relationship identities.
- Keep the public contract synchronized in `docs/api-reference.md` when the
  APIs are implemented.

## Non-Goals

- Account hierarchy management. Structural parent-child hierarchy remains
  owned by `Account.parentAccountId`.
- Automatic creation of an inverse relationship row.
- General editing of the relationship type, endpoints, start date, or
  description after creation.
- Hard deletion, reopening, or repeated lifecycles for the same ordered
  Account pair and relationship type.
- Configurable relationship-type catalogues.
- Contact, communication-channel, or address management.
- Domain events, notifications, outbox publication, or generic audit context.
- Automated test implementation or execution under the current repository
  instructions.

## Architectural Decision

Account Relationship is a sibling vertical slice under the `customer` bounded
context. It references Account identifiers but is not a collection owned by the
`Account` aggregate. Its application service owns relationship workflows, and
its repository port owns authorization-aware relationship persistence.

The package root is:

```text
com.crm.customer.accountrelationship
```

The slice follows the existing domain/application/infrastructure/presentation
structure. Only packages containing implemented classes are created.

## Relationship Semantics

A relationship row is directional:

```text
account_id --relationship_type--> related_account_id
```

Creating a relationship through
`POST /api/accounts/{accountId}/relationships` always stores the path Account as
`account_id` and the request's `relatedAccountId` as `related_account_id`.
The server does not create an inverse row.

When relationships are listed, `direction` is relative to the Account in the
request path:

- `OUTBOUND`: the path Account is `account_id`.
- `INBOUND`: the path Account is `related_account_id`.

Structural hierarchy is not represented in this table. `PARENT`, `CHILD`, and
`SUBSIDIARY` are not relationship types in this API because hierarchy is
already represented by `Account.parentAccountId`. This avoids two sources of
truth.

The initial relationship types are:

- `PARTNER`
- `DISTRIBUTOR`
- `RESELLER`
- `SUPPLIER`
- `AFFILIATE`
- `OTHER`

They are implemented as an enum and stored using the enum name. A configurable
catalogue can replace the enum only when a real tenant-specific requirement is
approved.

## Domain Model

`AccountRelationship` contains:

- Tenant identifier.
- Relationship identifier.
- Source Account identifier.
- Related Account identifier.
- Relationship type.
- Optional `validFrom` and `validTo` dates.
- Optional description.
- Creation time and actor.

The domain enforces:

- Source and related Account identifiers must differ.
- When both dates exist, `validTo` must be on or after `validFrom`.
- Identifiers and relationship type are immutable.
- Ending is a one-way transition from `validTo == null` to a supplied valid end
  date.
- An already-ended relationship cannot be changed to a different end date.

The database unique constraint on
`(tenant_id, account_id, related_account_id, relationship_type)` defines one
lifetime relationship identity for each ordered pair and type. Reopening or
recording multiple non-overlapping periods requires a future schema design and
is outside this slice.

## API Contract

Every endpoint requires:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

### Create a relationship

```http
POST /api/accounts/{accountId}/relationships
```

Required permission: `crm_account.write`.

```json
{
  "relatedAccountId": "55555555-5555-5555-5555-555555555555",
  "relationshipType": "PARTNER",
  "validFrom": "2026-08-12",
  "validTo": null,
  "description": "Strategic distribution partner"
}
```

Validation:

- `relatedAccountId` and `relationshipType` are required.
- Dates use ISO-8601 `yyyy-MM-dd` format.
- `validFrom` and `validTo` are optional.
- `validTo` cannot precede `validFrom`.
- `description` is optional and has a maximum length of 4,000 characters.
- Both Accounts must be active, belong to the selected tenant, and be inside
  the caller's resolved write scope.

Success returns `201 Created` with the relationship response.

### List relationships

```http
GET /api/accounts/{accountId}/relationships?page=0&size=20
```

Required permission: `crm_account.read`.

The endpoint returns both incoming and outgoing relationships. The path Account
and the counterpart Account must both be active and inside the caller's
resolved read scope. A relationship whose counterpart is outside that scope is
not disclosed.

The list is paginated using the existing `PageResult` contract. `page` defaults
to `0`; `size` defaults to `20` and must be between `1` and `100`. Results use
stable ordering by `created_at DESC, id DESC`. The first slice returns all
validity periods and does not add status or date filters.

### End a relationship

```http
POST /api/accounts/{accountId}/relationships/{relationshipId}/end
```

Required permission: `crm_account.write`.

```json
{
  "validTo": "2026-12-31"
}
```

`validTo` is required and cannot precede the stored `validFrom`. The
relationship must involve the path Account, and both participating Accounts
must remain active and inside the caller's resolved write scope.

The operation is idempotent for the same end date: requesting the stored
`validTo` returns the current relationship. Requesting a different date after
the relationship has already ended returns a conflict. Success returns
`200 OK` with the updated relationship response.

There is no hard-delete endpoint.

## Response Shape

Account references contain only stable display fields:

```json
{
  "id": "44444444-4444-4444-4444-444444444444",
  "accountNumber": "ACC-EXAMPLE-001",
  "displayName": "Example Trading"
}
```

The relationship response is:

```json
{
  "id": "66666666-6666-6666-6666-666666666666",
  "account": {
    "id": "44444444-4444-4444-4444-444444444444",
    "accountNumber": "ACC-EXAMPLE-001",
    "displayName": "Example Trading"
  },
  "relatedAccount": {
    "id": "55555555-5555-5555-5555-555555555555",
    "accountNumber": "ACC-EXAMPLE-002",
    "displayName": "Example Distribution"
  },
  "direction": "OUTBOUND",
  "relationshipType": "PARTNER",
  "validFrom": "2026-08-12",
  "validTo": null,
  "description": "Strategic distribution partner",
  "createdAt": "2026-08-12T10:00:00Z",
  "createdBy": "11111111-1111-1111-1111-111111111111"
}
```

`account` and `relatedAccount` always preserve the stored source-to-target
orientation. `direction` is calculated for the path Account and is not
persisted.

## Authorization and Data Scope

`TenantAccessAuthorizer` resolves permission and `ACCOUNT` scopes before any
relationship query or mutation.

- Create and end use `SystemPermission.CRM_ACCOUNT_WRITE`.
- List uses `SystemPermission.CRM_ACCOUNT_READ`.
- Create and end require both participating Accounts to satisfy the same write
  scope.
- List requires both participating Accounts to satisfy the same read scope.
- Deleted, cross-tenant, and outside-scope Accounts are never disclosed.

The existing Account-scope SQL construction should be extracted into a focused
customer-infrastructure helper and reused by both JDBC repositories. This is a
targeted refactor to avoid subtly different `OWN`, `TEAM`, `TEAM_TREE`, and
`TENANT` predicates. It must not become a generic cross-module repository
framework.

## Persistence and Transactions

The existing `crm_account_relationships` schema remains unchanged.

Create runs in one transaction:

1. Resolve tenant, actor, permission, and write scope.
2. Verify both Accounts through tenant, active-record, and scope predicates.
3. Construct the domain relationship.
4. Insert it with generated identifier, timestamp, and actor.
5. Translate the database unique-key failure to a stable conflict.
6. Reload the response projection.

List joins both Account rows to produce display references and applies the
resolved read-scope predicate independently to both aliases before pagination.

End runs in one transaction. It loads the scoped relationship, applies the
domain transition, then executes a conditional update whose predicate includes
`valid_to IS NULL`. A zero-row update is reloaded to distinguish an idempotent
same-date result from a conflicting concurrent end. This one-way conditional
transition provides concurrency safety without adding a version column.

## Error Handling

The slice uses the existing `ProblemDetail` response contract.

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | UUID, enum, body, date, pagination, or size validation fails |
| `401` | `AUTHENTICATION_REQUIRED` | Authentication is missing or invalid |
| `403` | `ACCESS_DENIED` | Tenant membership, permission, or required Account data scope is missing |
| `404` | `ACCOUNT_NOT_FOUND` | The path Account is absent, deleted, cross-tenant, or outside scope |
| `404` | `ACCOUNT_RELATIONSHIP_NOT_FOUND` | The relationship is absent, outside scope, or does not involve the path Account |
| `409` | `ACCOUNT_RELATIONSHIP_ALREADY_EXISTS` | The ordered Account pair already has the relationship type |
| `409` | `ACCOUNT_RELATIONSHIP_ALREADY_ENDED` | A different end date is supplied after the relationship was ended |
| `422` | `ACCOUNT_RELATIONSHIP_ACCOUNT_INVALID` | The related Account is unavailable or outside the required scope |
| `422` | `ACCOUNT_RELATIONSHIP_SELF_REFERENCE` | Source and related Account identifiers are equal |
| `422` | `ACCOUNT_RELATIONSHIP_PERIOD_INVALID` | The validity end date precedes the start date |
| `500` | `INTERNAL_ERROR` | An unexpected persistence or server failure occurs |

Unavailable related Accounts share one safe error and do not reveal whether an
identifier exists in another tenant or outside the caller's data scope.

## Documentation and Verification

Implementation must update `docs/api-reference.md` with the three endpoints,
headers, permissions, validation, request and response examples, pagination,
status codes, and error codes.

The repository rules prohibit automated tests, builds, application startup,
and API execution unless the user explicitly overrides them. Implementation
verification is therefore limited to static inspection, source-contract
comparison, SQL/schema comparison, and diff checks. The user-run checklist is:

1. Create each supported relationship type.
2. List incoming and outgoing relationships with correct direction.
3. Verify tenant, permission, and all Account data-scope boundaries.
4. Verify self-reference, invalid dates, duplicate identity, and unavailable
   related Accounts.
5. End an open relationship, repeat the same request, and try a different end
   date.
6. Verify expired relationships remain in history and no hard-delete API
   exists.

## Deferred Work

- Reopening a relationship or recording multiple lifecycles for the same
  ordered pair and type.
- Editing relationship identity, start date, or description.
- Tenant-configurable relationship types and inverse-type mappings.
- Automatic inverse rows and symmetric-relationship behavior.
- Relationship date/status filters or cursor pagination.
- Relationship-specific permissions distinct from Account read/write.
- Generic business audit and outbox events.

## Acceptance Criteria

- The slice is isolated under `com.crm.customer.accountrelationship`.
- The domain remains independent from Spring, JDBC, HTTP, and foundation
  security types.
- All operations are tenant-scoped, permission-checked, and Account-scope-aware.
- Both participating Accounts are validated for create and end operations.
- Both participating Accounts are scope-filtered before list results are
  disclosed.
- Relationship direction is explicit and no inverse row is created implicitly.
- Parent hierarchy remains exclusively represented by `parentAccountId`.
- End is history-preserving, one-way, idempotent for the same date, and safe
  under concurrent requests.
- No schema change, hard delete, generic CRUD abstraction, or speculative event
  framework is introduced.
- Implemented behavior is documented in `docs/api-reference.md` in the same
  implementation task.
