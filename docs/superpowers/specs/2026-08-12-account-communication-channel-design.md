# Account Communication Channel Slice Design

**Date:** 2026-08-12

**Status:** Approved

**Application:** `crm`

**Bounded context:** `customer`

**Business slice:** Account communication channel management

## Context

The Account vertical slice already provides tenant-scoped lifecycle operations,
functional permissions, and Account data scopes. The next deliberately small
customer capability is managing the communication channels that belong to an
Account.

The existing `crm_communication_channels` table supports either an Account or a
Contact owner. This slice uses only Account-owned rows: `account_id` is set and
`contact_id` is null. It does not change the table schema and does not implement
Contact communication channels prematurely.

## Goals

- Create, list, update, and soft-delete communication channels for an Account.
- Reuse `crm_account.read`, `crm_account.write`, and the existing `ACCOUNT`
  data-scope model.
- Normalize channel values consistently on the backend.
- Prevent duplicate active channels on one Account.
- Maintain at most one active primary channel per Account and channel type.
- Preserve optimistic concurrency for explicit updates and deletion.
- Keep the public contract synchronized in `docs/api-reference.md` when the
  APIs are implemented.

## Non-Goals

- Contact communication-channel management.
- Email, SMS, phone, or WhatsApp delivery.
- OTP, email-link, or other ownership-verification workflows.
- Allowing clients to set verification state or verification time.
- Client-defined JSON metadata.
- A generic communication-channel abstraction shared by Account and Contact.
- Automatic selection of a replacement primary channel.
- Hard deletion or restoration of deleted channels.
- Website management. `Account.website` remains the source of truth for the
  Account website because the database channel-type catalogue has no website
  type.
- Database migration or schema changes.
- Automated test implementation or execution under the current repository
  instructions.

## Architectural Decision

Account Communication Channel is a sibling vertical slice under the `customer`
bounded context:

```text
com.crm.customer.accountcommunicationchannel
|-- domain
|-- application
|   |-- command
|   |-- dto
|   `-- usecase
|-- infrastructure.persistence
`-- presentation.web
```

Only packages that contain implemented classes are created.

The slice owns channel validation, normalization, primary switching,
optimistic concurrency, and persistence. It references Account identifiers and
reuses the existing Account authorization scope, but it does not add channel
behavior to the Account aggregate. This keeps the Account slice focused and
avoids designing a Contact-owner abstraction before Contact management exists.

When Contact Communication Channel is implemented, common code is extracted
only if the two concrete slices demonstrate the same stable rules.

## Domain Model

`AccountCommunicationChannel` contains:

- Tenant identifier.
- Channel identifier.
- Account identifier.
- Channel type.
- Raw value supplied by the client after trimming.
- Backend-derived normalized value when the type supports normalization.
- Optional label.
- Primary flag.
- Verification flag and optional verification time.
- Do-not-use flag.
- Optimistic version.
- Creation and update timestamps.

The initial `ChannelType` enum mirrors the existing database constraint:

- `EMAIL`
- `PHONE`
- `MOBILE`
- `SMS`
- `WHATSAPP`
- `LINKEDIN`
- `OTHER`

The domain enforces these invariants:

- `rawValue` is required and has at most 255 characters after trimming.
- `label` is optional and has at most 255 characters after trimming. Blank
  labels are stored as null.
- A channel marked `doNotUse` cannot be primary. Setting `doNotUse=true`
  forces `isPrimary=false`.
- New channels are unverified: `isVerified=false` and `verifiedAt=null`.
- Verification state is read-only in this slice.
- Metadata is stored as an empty JSON object and is not exposed as a writable
  API field.
- Deleting or suppressing a primary channel does not select a replacement.
- An Account may temporarily have no primary channel for a channel type.

## Normalization

Clients send only `rawValue`; the backend owns canonicalization:

| Channel type | Stored raw value | Normalized value | Additional validation |
|---|---|---|---|
| `EMAIL` | Trimmed, original case retained | Trimmed and lowercased | Valid email syntax |
| `PHONE` | Trimmed E.164 value | Same value | E.164, for example `+84901234567` |
| `MOBILE` | Trimmed E.164 value | Same value | E.164 |
| `SMS` | Trimmed E.164 value | Same value | E.164 |
| `WHATSAPP` | Trimmed E.164 value | Same value | E.164 |
| `LINKEDIN` | Trimmed value | Same value | No URL-or-handle semantic validation in v1 |
| `OTHER` | Trimmed value | Null | No type-specific validation in v1 |

Phone-like values that contain spaces, local prefixes, or formatting
characters are rejected rather than guessed. The accepted E.164 pattern is
`^\+[1-9][0-9]{1,14}$`. A future country-aware parser can be introduced only
with an explicit product requirement.

## Duplicate Identity

Two active channels cannot share the same Account, channel type, and canonical
value.

- For every type except `OTHER`, the canonical value is `normalizedValue`.
- For `OTHER`, the canonical value is the trimmed `rawValue`.
- Canonical equality is exact after normalization. `EMAIL` is naturally
  case-insensitive because it is lowercased; `LINKEDIN` and `OTHER` retain case
  and use case-sensitive equality.
- The channel being updated is excluded from its own duplicate lookup.
- Deleted rows do not block recreation of a channel.
- A duplicate create or update returns
  `409 ACCOUNT_COMMUNICATION_CHANNEL_ALREADY_EXISTS`.

The existing database does not have a unique active-channel constraint for
this identity. Correctness is provided by serializing mutations on the owning
Account before performing the duplicate lookup. The existing unique active
primary index remains the final database safeguard for the primary invariant.

## Primary-Channel Semantics

At most one active channel can be primary for each Account and channel type.

When a create or update requests `isPrimary=true`, the application service:

1. Locks the owning Account.
2. Demotes the current active primary channel of the requested type, if one
   exists and is not the target channel.
3. Persists the requested channel as primary.
4. Commits both changes in the same transaction.

Demotion is a system-managed side effect and increments the previous primary
channel's version. The mutation response contains only the requested channel;
clients that cache the full collection should refresh the list after a primary
change.

If an update changes the channel type while the channel remains primary, the
same rule applies to the new type. The old type is left without a primary. If a
primary channel is updated to `isPrimary=false`, changed to `doNotUse=true`, or
soft-deleted, no replacement is selected.

## API Contract

Every endpoint requires:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

### Create a channel

```http
POST /api/accounts/{accountId}/communication-channels
```

Required permission: `crm_account.write`.

```json
{
  "channelType": "EMAIL",
  "rawValue": "Contact@Example.com",
  "label": "Business email",
  "isPrimary": true,
  "doNotUse": false
}
```

`channelType` and `rawValue` are required. `label` is optional. Missing boolean
fields default to false. Success returns `201 Created` with the created channel.

### List channels

```http
GET /api/accounts/{accountId}/communication-channels
```

Required permission: `crm_account.read`.

The endpoint returns a JSON array of all active Account-owned channels. It is
not paginated because the expected collection is small. Ordering is stable:
`channelType ASC`, `isPrimary DESC`, `createdAt ASC`, then `id ASC`.

Success returns `200 OK`. An Account with no channels returns an empty array.

### Update a channel

```http
PUT /api/accounts/{accountId}/communication-channels/{channelId}
If-Match: "<version>"
```

Required permission: `crm_account.write`.

The body has the same editable fields as create. `PUT` replaces all editable
state: a missing `label` clears the label, and missing boolean fields become
false. The path and current tenant determine Account ownership; ownership is
not editable.

`If-Match` must contain exactly one strong quoted positive signed-long version,
for example `"2"`. Missing, wildcard, weak, unquoted, nonnumeric, zero,
negative, or overflow values produce request validation errors.

Success returns `200 OK` with the updated channel and its new version.

### Soft-delete a channel

```http
DELETE /api/accounts/{accountId}/communication-channels/{channelId}
If-Match: "<version>"
```

Required permission: `crm_account.write`.

The same strong `If-Match` rules apply. The operation sets deletion audit data,
increments the version, and does not select a replacement primary channel.
Success returns `204 No Content`.

## Response Shape

```json
{
  "id": "790662fd-1914-4cb6-b889-dd695df29534",
  "accountId": "0784ab42-fac1-40ee-913f-316310633e46",
  "channelType": "EMAIL",
  "rawValue": "Contact@Example.com",
  "normalizedValue": "contact@example.com",
  "label": "Business email",
  "isPrimary": true,
  "isVerified": false,
  "verifiedAt": null,
  "doNotUse": false,
  "version": 1,
  "createdAt": "2026-08-12T10:00:00Z",
  "updatedAt": "2026-08-12T10:00:00Z"
}
```

`normalizedValue`, verification fields, version, timestamps, metadata, and
audit fields are not writable. Metadata is not returned in v1 because it has no
public contract yet.

## Authorization and Data Scope

`TenantAccessAuthorizer` resolves permission and `ACCOUNT` data scope before
any channel query or mutation.

- List uses `SystemPermission.CRM_ACCOUNT_READ`.
- Create, update, and delete use `SystemPermission.CRM_ACCOUNT_WRITE`.
- The path Account must be active, belong to the selected tenant, and be inside
  the resolved scope.
- Every persistence query includes tenant, Account, and owner constraints.
- Account-owned queries require `account_id = :accountId` and
  `contact_id IS NULL`.
- An Account or channel outside tenant/scope is represented as not found so the
  API does not disclose inaccessible identifiers.

## Transaction and Concurrency Model

Create, update, and delete use:

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
```

Every mutation follows the same lock order:

1. Resolve tenant, permission, and Account data scope.
2. Select and lock the authorized Account row using `SELECT ... FOR UPDATE`.
3. For update or delete, load the active Account-owned channel and compare its
   version with `If-Match`.
4. Normalize and validate the requested state.
5. Check duplicate identity while excluding the update target when applicable.
6. Demote the current primary channel if the requested state requires it.
7. Insert, update with a version predicate, or soft-delete with a version
   predicate.
8. Commit all changes together.

Locking the Account serializes all channel mutations for one Account, including
the first insert when no channel row exists yet. This prevents concurrent
requests from both passing duplicate checks or both becoming primary. Channels
belonging to different Accounts remain independently mutable.

List uses a read-only transaction and does not acquire mutation locks.

## Persistence

The JDBC adapter uses `crm_communication_channels` without a migration.

- Inserts set `tenant_id`, `account_id`, `contact_id = NULL`, normalized state,
  verification defaults, `metadata = JSON_OBJECT()`, and creation audit data.
- Reads exclude `deleted_at IS NOT NULL` rows.
- Update and delete statements include tenant, Account, channel identifier,
  `contact_id IS NULL`, active-row, and expected-version predicates.
- A zero-row versioned mutation is translated to
  `ACCOUNT_COMMUNICATION_CHANNEL_VERSION_CONFLICT` after the scoped row was
  loaded successfully.
- An unexpected database constraint violation does not expose SQL details and
  follows the common `INTERNAL_ERROR` contract. Normal API mutations avoid the
  active-primary constraint through the Account lock and ordered demotion.

## Error Contract

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | Body, UUID, enum, email, E.164, size, or `If-Match` validation fails |
| `401` | `AUTHENTICATION_REQUIRED` | Authentication is missing or invalid |
| `403` | `ACCESS_DENIED` | Tenant membership, permission, or required Account data scope is missing |
| `404` | `ACCOUNT_NOT_FOUND` | The Account is absent, deleted, cross-tenant, or outside scope |
| `404` | `ACCOUNT_COMMUNICATION_CHANNEL_NOT_FOUND` | The channel is absent, deleted, or does not belong to the path Account |
| `409` | `ACCOUNT_COMMUNICATION_CHANNEL_ALREADY_EXISTS` | The Account already has an active channel with the type and canonical value |
| `409` | `ACCOUNT_COMMUNICATION_CHANNEL_VERSION_CONFLICT` | Update or delete uses a stale version |
| `500` | `INTERNAL_ERROR` | An unexpected persistence or server failure occurs |

Validation errors reuse the common stable field-error codes. Error messages
remain localizable; callers depend on `errorCode`, not message text.

## Documentation and Verification

Implementation must update `docs/api-reference.md` in the same task with:

- Authentication and tenant headers.
- Permissions.
- Request and response fields.
- Validation and normalization rules.
- `If-Match` behavior.
- Status codes and stable errors.
- Examples containing only fictitious identifiers and values.

Implementation must also update `docs/technical-roadmap.md` to mark Account
Communication Channel complete while retaining these later items:

1. Account Address.
2. Contact management.
3. Contact Communication Channel and Contact Address.
4. Duplicate detection, merge, and advanced lifecycle workflows.

Repository rules currently prohibit tests, builds, application startup, and
database/API execution. Completion evidence is therefore limited to static
inspection unless the user explicitly authorizes runtime verification in a
later request.

The manual verification checklist for the user is:

- Email and phone normalization.
- Invalid email and E.164 rejection.
- Duplicate create and update conflicts.
- Atomic primary switching.
- `doNotUse` demotion without automatic replacement.
- Primary update and deletion without automatic replacement.
- Stale `If-Match` conflicts.
- Soft-delete invisibility and recreation behavior.
- Cross-tenant and Account-data-scope isolation.

## Deferred Work

- Verification workflows that can set `isVerified` and `verifiedAt`.
- Typed metadata only after concrete fields and validation rules are known.
- Country-aware phone parsing and display formatting.
- Contact-owned communication channels.
- Shared owner abstractions only after Account and Contact rules are proven to
  converge.
