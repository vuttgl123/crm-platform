# Account Address Slice Design

**Date:** 2026-08-13

**Status:** Approved

**Application:** `crm`

**Bounded context:** `customer`

**Business slice:** Account address management

## Context

The Account vertical slice already provides tenant-scoped lifecycle operations,
functional permissions, and Account data scopes. Account Communication Channel
and Account Relationship have established the local conventions for child
resources, Account-level mutation locking, optimistic concurrency, and
`READ_COMMITTED` transactions.

The database already separates reusable address content in `crm_addresses` from
its Account association in `crm_account_addresses`. This first Account Address
slice exposes that model through one cohesive Account-owned API. It deliberately
does not introduce geocoding, duplicate detection, address sharing, or Contact
address management.

## Goals

- Create, list, update, and end Account address associations.
- Present address content and Account-association state as one API resource.
- Reuse `crm_account.read`, `crm_account.write`, and the existing `ACCOUNT`
  data-scope model.
- Preserve address history instead of deleting old associations.
- Maintain at most one current primary address per Account and address type.
- Use strong `If-Match` optimistic concurrency for update and end operations.
- Keep all primary switching and two-table persistence atomic.
- Keep `docs/api-reference.md` synchronized when the APIs are implemented.

## Non-Goals

- External geocoding, reverse geocoding, address autocomplete, or postal lookup.
- Automatic address verification or client-controlled verification state.
- Automatic construction of `formattedAddress`.
- Duplicate-address detection, canonicalization, or merge.
- Linking an existing address identifier to another Account or address type.
- Sharing one physical `crm_addresses` row across multiple Account links.
- Contact Address APIs or a premature Account/Contact owner abstraction.
- Automatic selection of a replacement primary address.
- Deleting, soft-deleting, restoring, or hard-deleting addresses through the
  public API.
- Cancelling a future-dated association.
- Database migration or schema changes.
- Automated test implementation or execution under the current repository
  instructions.

## Architectural Decision

Account Address is a sibling vertical slice under the `customer` bounded
context:

```text
com.crm.customer.accountaddress
|-- domain
|-- application
|   |-- command
|   |-- dto
|   |-- port
|   |-- query
|   |-- service
|   `-- usecase
|-- infrastructure.persistence
`-- presentation.web
```

Only packages containing implemented classes are created.

The domain uses one `AccountAddress` aggregate spanning the address content in
`crm_addresses` and the Account association in `crm_account_addresses`. The
repository port hides the two-table representation from the application and
presentation layers. This is more cohesive than exposing two independent CRUD
resources because the public lifecycle, version, primary state, validity
period, and ownership rules must change together.

The slice references the existing Account identifier and authorization scope,
but it does not move address behavior into the Account aggregate. A shared
address abstraction is considered only after Contact Address is implemented and
the two concrete rule sets are proven to converge.

## Domain Model

`AccountAddress` contains four groups of state.

Identity:

- Tenant identifier.
- Address identifier.
- Account identifier.

Address content:

- Address line 1.
- Address line 2.
- Locality.
- Administrative area.
- Postal code.
- ISO 3166-1 alpha-2 country code.
- Optional latitude and longitude pair.
- Optional formatted address.
- Read-only validation status.

Account association:

- Address type.
- Primary flag.
- Optional validity start date.
- Optional validity end date.

Concurrency and audit representation:

- Aggregate version.
- Creation timestamp.
- Update timestamp.

The initial `AccountAddressType` enum mirrors the database constraint:

- `BILLING`
- `SHIPPING`
- `OFFICE`
- `REGISTERED`
- `OTHER`

The read-only `AddressValidationStatus` enum mirrors the database constraint:

- `UNVERIFIED`
- `VALID`
- `INVALID`
- `PARTIAL`

New addresses always start as `UNVERIFIED`. This slice preserves an existing
validation status during updates but does not expose a mutation that changes
it.

Each address identifier created by this API has exactly one Account association
and exactly one address type. The API never accepts an existing address
identifier. If the same physical address is both billing and shipping, clients
create two independent Account Address resources in v1.

## Address Validation and Normalization

All text fields are trimmed. Blank optional values are stored as null.

Field limits follow the existing schema:

| Field | Required | Maximum length |
|---|---:|---:|
| `addressLine1` | No | 255 |
| `addressLine2` | No | 255 |
| `locality` | No | 255 |
| `administrativeArea` | No | 255 |
| `postalCode` | No | 191 |
| `countryCode` | Yes | Exactly 2 letters |
| `formattedAddress` | No | 255 |

At least one meaningful component must be present after normalization:

- `addressLine1`
- `locality`
- `administrativeArea`
- `postalCode`
- `formattedAddress`

`addressLine2` alone is not a meaningful address. Coordinates alone also do not
satisfy this rule.

`countryCode` is mandatory client input. It is trimmed, uppercased, and must be
an actual ISO 3166-1 alpha-2 code recognized by the backend. It is not defaulted
from the tenant.

Latitude and longitude are optional but form one atomic pair: either both are
provided or both are null. Latitude must be between `-90` and `90`; longitude
must be between `-180` and `180`. Each value may have at most six fractional
digits. The backend stores the supplied values without geocoding or deriving
them from the text fields.

`formattedAddress` is optional client-owned display text in v1. The backend
trims it but does not generate or overwrite it.

## Validity and Current-State Semantics

An association is current when:

```text
(validFrom is null or validFrom is not after currentDate)
and validTo is null
```

`currentDate` is the UTC calendar date derived from the injected
`TimeProvider.now()`. Tenant-local address lifecycle dates are deferred until a
tenant-time-zone requirement exists.

An association with a future `validFrom` is scheduled and cannot be primary.
The default list excludes scheduled and ended associations. Historical listing
includes current, scheduled, and ended associations.

Ending an association sets `validTo` to `currentDate` and sets
`isPrimary=false`. Because current state requires `validTo` to be null, an
association disappears from the default list immediately, including on the day
it is ended.

An ended association is immutable. It cannot be updated or ended again. Ending
a scheduled association before its `validFrom` is not cancellation and is
rejected as an invalid period.

## Primary-Address Semantics

At most one current primary address may exist for each Account and address
type. This matches the existing unique current-primary index.

When create or update requests `isPrimary=true`, the application service:

1. Locks the owning Account.
2. Verifies that the requested association is current rather than scheduled.
3. Demotes the existing current primary of the requested address type, if it is
   not the target address.
4. Persists the requested address as primary.
5. Commits every change in the same transaction.

Changing a primary address from one type to another applies primary switching
to the new type. The old type is left without a primary. Setting
`isPrimary=false` or ending a primary address also leaves that type without a
primary. The system never chooses a replacement automatically.

Primary demotion is a system-managed mutation of the demoted address aggregate.
It updates the association row and touches its `crm_addresses` row so that the
demoted resource receives a new version and update timestamp. Mutation
responses contain only the requested resource; clients caching a collection
should refresh the list after a primary change.

## API Contract

Every endpoint requires:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

### Create an Account Address

```http
POST /api/accounts/{accountId}/addresses
```

Required permission: `crm_account.write`.

```json
{
  "addressType": "OFFICE",
  "addressLine1": "100 Example Avenue",
  "addressLine2": "Floor 5",
  "locality": "Example City",
  "administrativeArea": "Example Province",
  "postalCode": "10000",
  "countryCode": "TH",
  "latitude": 13.756331,
  "longitude": 100.501762,
  "formattedAddress": "100 Example Avenue, Example City 10000",
  "isPrimary": true,
  "validFrom": "2026-08-13"
}
```

`addressType` and `countryCode` are required. The meaningful-component and
coordinate-pair rules also apply. Missing `isPrimary` defaults to false.
`validFrom` is optional. Success returns `201 Created` with the created
resource.

The server generates the address identifier and inserts one address row plus
one Account-association row atomically.

### List Account Addresses

```http
GET /api/accounts/{accountId}/addresses
GET /api/accounts/{accountId}/addresses?addressType=OFFICE
GET /api/accounts/{accountId}/addresses?includeHistory=true
GET /api/accounts/{accountId}/addresses?addressType=OFFICE&includeHistory=true
```

Required permission: `crm_account.read`.

`includeHistory` is optional and defaults to false. `addressType` is optional.
The endpoint is not paginated because an Account is expected to have a small
address collection.

Default listing returns only current associations. With
`includeHistory=true`, the endpoint also returns ended and scheduled
associations. Ordering is stable:

1. `addressType ASC`.
2. Current associations before non-current associations.
3. `isPrimary DESC`.
4. `validFrom DESC`, with null values last. The MySQL query uses an explicit
   null-ordering expression instead of relying on database-default null order.
5. `createdAt ASC`.
6. `id ASC`.

Success returns `200 OK`. An Account with no matching addresses returns an
empty JSON array.

### Update an Account Address

```http
PUT /api/accounts/{accountId}/addresses/{addressId}
If-Match: "<version>"
```

Required permission: `crm_account.write`.

The request has the same editable fields as create. `PUT` replaces all editable
state: omitted optional text, coordinates, and `validFrom` are cleared, and an
omitted `isPrimary` becomes false. The path determines Account ownership and
the server preserves `validationStatus` and `validTo`.

Changing `addressType` updates the Account-association key transactionally. The
repository captures the old type when loading the aggregate and uses it to
target the existing link.

Success returns `200 OK` with the reloaded persisted resource and its new
version.

### End an Account Address Association

```http
POST /api/accounts/{accountId}/addresses/{addressId}/end
If-Match: "<version>"
```

Required permission: `crm_account.write`.

The endpoint has no request body. It sets `validTo=currentDate`, clears the
primary flag, touches the aggregate version, and does not select a replacement
primary. Success returns `200 OK` with the reloaded ended resource.

There is no public `DELETE` route and no single-address `GET` route in v1.

## Optimistic Concurrency

Update and end require exactly one strong quoted positive signed-long version,
for example:

```http
If-Match: "3"
```

Missing, wildcard, weak, unquoted, nonnumeric, zero, negative, multiple, or
overflow values produce `400 REQUEST_VALIDATION_FAILED`.

After the scoped aggregate is found, update and end compare the supplied
version before checking whether the association is already ended. Therefore a
stale request receives `ACCOUNT_ADDRESS_VERSION_CONFLICT`; a request using the
current version of an ended association receives
`ACCOUNT_ADDRESS_ALREADY_ENDED`.

The `crm_addresses.version` value represents the complete public aggregate,
including association-only changes. Every update, end, and system-managed
primary demotion touches the address row. Versioned writes include the expected
version predicate. A zero-row write after a successful scoped load is
translated to `ACCOUNT_ADDRESS_VERSION_CONFLICT`.

The database trigger remains authoritative for `version` and `updatedAt`.
Create, update, and end reload the resource after writing so responses contain
the persisted timestamp precision and generated version.

## Response Shape

```json
{
  "id": "790662fd-1914-4cb6-b889-dd695df29534",
  "accountId": "0784ab42-fac1-40ee-913f-316310633e46",
  "addressType": "OFFICE",
  "addressLine1": "100 Example Avenue",
  "addressLine2": "Floor 5",
  "locality": "Example City",
  "administrativeArea": "Example Province",
  "postalCode": "10000",
  "countryCode": "TH",
  "latitude": 13.756331,
  "longitude": 100.501762,
  "formattedAddress": "100 Example Avenue, Example City 10000",
  "validationStatus": "UNVERIFIED",
  "isPrimary": true,
  "validFrom": "2026-08-13",
  "validTo": null,
  "version": 1,
  "createdAt": "2026-08-13T06:00:00Z",
  "updatedAt": "2026-08-13T06:00:00Z"
}
```

`validationStatus`, `validTo`, version, timestamps, tenant identifier, and audit
actor fields are not writable. Tenant and actor identifiers are not returned in
the v1 response.

## Authorization and Data Scope

`TenantAccessAuthorizer` resolves permission and `ACCOUNT` data scope before
any address query or mutation.

- List uses `SystemPermission.CRM_ACCOUNT_READ`.
- Create, update, and end use `SystemPermission.CRM_ACCOUNT_WRITE`.
- The path Account must be active, belong to the selected tenant, and fall
  inside the resolved Account scope.
- Every persistence query constrains tenant, path Account, association, and
  active address content.
- Address content with `crm_addresses.deleted_at IS NOT NULL` is never exposed.
- An Account or address outside the tenant or data scope is represented as not
  found so the API does not disclose inaccessible identifiers.
- There is no direct route by address identifier without an Account path.

The persistence adapter reuses `AccountScopeSql` when resolving authorized
Accounts and Account Address rows.

## Transaction and Locking Model

Create, update, and end use:

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
```

List uses a read-only transaction and does not acquire mutation locks.

Every mutation follows this lock order:

1. Resolve tenant, actor, permission, and Account data scope.
2. Select and lock the authorized Account row using `SELECT ... FOR UPDATE`.
3. For update or end, load the Account Address, including historical rows, and
   compare its version with `If-Match`.
4. Validate lifecycle and normalized requested state.
5. Demote the existing current primary of the target type when required.
6. Insert or update the address and association rows with version predicates.
7. Reload the requested resource from the database.
8. Commit all changes together.

Locking the Account serializes every address mutation for one Account,
including the first insert when no address exists. It prevents concurrent
requests from both becoming primary and provides deterministic ordering for
type changes and primary demotion. Different Accounts remain independently
mutable.

## Persistence Mapping

The JDBC adapter uses the existing schema without a migration.

`crm_addresses` stores:

- Address content.
- `validation_status`, initially `UNVERIFIED`.
- Version and address-level audit state.
- Soft-delete columns, which remain unused by these public routes.

The public `version`, `createdAt`, and `updatedAt` fields come from this address
row. Association creation audit state remains internal in v1.

`crm_account_addresses` stores:

- Account ownership.
- Address type.
- Primary state.
- Validity start and end dates.
- Association creation audit state.

Create inserts both rows in one transaction. Update may change the association
primary key's address-type component while preserving the generated address
identifier. End updates only lifecycle/primary association state plus the
address-row version touch. Reads join both tables and enforce tenant, Account,
scope, association, and active-address predicates.

The existing unique current-primary index remains a final database safeguard.
Normal API mutations avoid that constraint through Account locking and ordered
demotion. An unexpected constraint violation follows the common internal-error
contract and never exposes SQL details.

## Error Contract

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | Body, path UUID, enum, size, country code, coordinate pair/range/scale, meaningful-component, query parameter, or `If-Match` validation fails |
| `401` | `AUTHENTICATION_REQUIRED` | Authentication is missing or invalid |
| `403` | `ACCESS_DENIED` | Tenant membership, permission, or required Account data scope is missing |
| `404` | `ACCOUNT_NOT_FOUND` | The Account is absent, deleted, cross-tenant, or outside scope |
| `404` | `ACCOUNT_ADDRESS_NOT_FOUND` | The address is absent, deleted, or does not belong to the path Account |
| `409` | `ACCOUNT_ADDRESS_VERSION_CONFLICT` | Update or end uses a stale version |
| `409` | `ACCOUNT_ADDRESS_ALREADY_ENDED` | Update or end targets an ended association with its current version |
| `422` | `ACCOUNT_ADDRESS_PERIOD_INVALID` | End is requested before a future `validFrom` date |
| `422` | `ACCOUNT_ADDRESS_PRIMARY_INVALID` | A scheduled association is requested as primary |
| `500` | `INTERNAL_ERROR` | An unexpected persistence or server failure occurs |

There is intentionally no duplicate-address conflict in v1. Validation errors
reuse the common stable field-error structure. Messages remain localizable;
callers depend on `errorCode`, not message text.

## Documentation Requirements

Implementation must update `docs/api-reference.md` in the same task with:

- The four routes and reference index entries.
- Authentication and tenant headers.
- Permissions and Account data-scope behavior.
- Request, response, query, and path fields.
- Normalization and validation rules.
- Current/history and stable-ordering semantics.
- Strong `If-Match` behavior.
- Status codes and stable errors.
- Examples containing only fictitious identifiers and values.

Implementation must update `docs/technical-roadmap.md` to mark Account Address
complete while preserving later work:

1. Contact management.
2. Contact Communication Channel and Contact Address.
3. Address verification and geocoding.
4. Duplicate detection, merge, and advanced lifecycle workflows.

Any new error messages must be added consistently to all three existing message
bundles.

## Verification Strategy

Repository rules prohibit tests, builds, application startup, database/API
execution, and other runtime verification unless the user explicitly authorizes
them. Implementation completion evidence is therefore limited to static
inspection, source-to-contract comparison, diff checks, and placeholder scans.

The manual verification checklist for the user is:

- Create with each address type and optional field combination.
- Required country code, real ISO code, and uppercase normalization.
- Meaningful-component validation.
- Coordinate pairing, range, and fractional-scale validation.
- Default current-only listing, historical listing, filtering, and ordering.
- Atomic primary switching on create, update, and type change.
- Scheduled primary rejection.
- Update replacement semantics and preservation of validation status.
- End lifecycle, immediate disappearance from current listing, and no automatic
  replacement primary.
- Future-association end rejection.
- Stale `If-Match`, already-ended, not-found, tenant, permission, and data-scope
  behavior.
- Version changes on association-only updates and system-managed demotion.

## Deferred Work

- External or asynchronous address verification.
- Geocoding, reverse geocoding, and autocomplete.
- Tenant-local lifecycle dates if tenant time zones become a requirement.
- Duplicate detection, canonicalization, and merge.
- Sharing or relinking existing address identifiers.
- Cancellation of future associations.
- Contact-owned addresses.
- Shared owner abstractions only after Account and Contact rules are proven to
  converge.
- Public address deletion or restoration lifecycle.
