# CRM API Reference

## Purpose and Source of Truth

This document is the canonical integration guide for HTTP APIs currently
implemented by the CRM application. It describes the public contract that API
clients can call, including validation, authentication, cookies, response
shapes, and stable error codes.

The Java implementation remains the technical source of truth. If this guide
and the implementation differ, update this guide in the same change that fixes
the discrepancy. Planned or unimplemented APIs must not be presented here as
available.

## Environment and Base URL

The default local base URL is:

```text
http://localhost:8080
```

All paths in this document are relative to that URL. Deployed environments can
use a different host, port, or scheme.

## Common Request Conventions

### JSON

Requests with a JSON body use:

```http
Content-Type: application/json
```

### Bearer authentication

Protected endpoints require the access token returned by register, login, or
refresh:

```http
Authorization: Bearer <access-token>
```

The access token is an RS256 JWT with identity and session claims:

| Claim | Meaning |
|---|---|
| `iss` | Configured CRM token issuer |
| `sub` | User ID |
| `aud` | Configured CRM API audience |
| `iat` | Issue time |
| `exp` | Expiration time |
| `jti` | Unique token ID |
| `token_type` | `access` |
| `sid` | Refresh-session ID |
| `email` | User email |

The JWT does **not** contain roles, permissions, or data scopes. Those values
are resolved by the server from the database for the authenticated user and
the current tenant. Clients must not infer authorization from JWT contents.

### Refresh-token cookie

Register, login, OAuth2 login, and refresh write a refresh token to an HttpOnly
cookie. The default local cookie settings are:

| Setting | Default |
|---|---|
| Name | `CRM_REFRESH_TOKEN` |
| `HttpOnly` | `true` |
| Path | `/api/auth` |
| `SameSite` | `Lax` |
| `Secure` | `false` for the local default |

The name, `SameSite`, and `Secure` settings are configurable by environment.
Production HTTPS deployments should enable `Secure`.

Browser clients must include credentials when calling refresh or logout. For
example:

```javascript
await fetch("http://localhost:8080/api/auth/refresh", {
  method: "POST",
  credentials: "include"
});
```

The refresh token is never returned in a JSON response and is not readable by
browser JavaScript.

### Default token lifetimes

| Token | Default lifetime | Renewal behavior |
|---|---|---|
| Access token | 15 minutes | Obtain a new one through refresh |
| Refresh token | 30 days | Rotated after every successful refresh |

The server can override both lifetimes through environment configuration.
Clients should use `expiresIn` from the token response instead of hard-coding
the access-token lifetime.

### Tenant context

Authenticated requests can select a tenant context with:

```http
X-Tenant-ID: <tenant-uuid>
```

When supplied, the value must be a valid UUID and the authenticated user must
have an active membership in that tenant. An invalid UUID or inactive/missing
membership returns `403 ACCESS_DENIED`.

Permissions and data scopes are evaluated for the authenticated user and this
tenant context. The current authentication endpoints do not require a named
business permission.

### Language

Use `Accept-Language` to request localized error details and validation
messages. English and Vietnamese message bundles are available. Stable
`errorCode` values do not change with the selected language.

```http
Accept-Language: en
```

or:

```http
Accept-Language: vi
```

### Request tracing

Clients can supply a request ID:

```http
X-Request-ID: client-request-123
```

A valid request ID contains 1-64 ASCII letters, digits, dots, underscores, or
hyphens. If it is missing or invalid, the server generates a UUID. The server
exposes `X-Request-ID` in the response, and error responses include the trace
value as `traceId` when request tracing has been established.

### Cross-origin browser calls

The default allowed browser origins include ports `3000`, `3001`, and `3002`
for both `http://localhost` and `http://127.0.0.1`. CORS preflight requests
from an allowed origin do not require authentication. CORS allows credentials
(`credentials: 'include'`) and the configured request headers, including
`Authorization`, `Content-Type`, `Accept`, `Accept-Language`, `X-Tenant-ID`,
`X-Request-ID`, and `If-Match`. Refresh and logout also apply explicit origin
validation because they authenticate with a cookie. See their endpoint
sections for details.

## Authentication Flow

1. Register a local user, log in with local credentials, or complete an OAuth2
   login.
2. The CRM returns an access token to the client and stores a refresh token in
   an HttpOnly cookie. OAuth2 login redirects first; the frontend then calls
   the refresh endpoint to obtain the access token.
3. Send the access token as a Bearer token when calling protected endpoints.
4. Before the access token expires, call `POST /api/auth/refresh` with the
   refresh cookie. The CRM returns a new access token and rotates the refresh
   token.
5. Call `POST /api/auth/logout` to revoke the matching refresh session and
   clear the cookie.

Register, login, and refresh share this response shape:

```json
{
  "accessToken": "eyJ...example-only",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "11111111-1111-1111-1111-111111111111",
    "email": "alex@example.test",
    "displayName": "Alex Example"
  }
}
```

`expiresIn` is measured in seconds. The refresh token is written only to the
HttpOnly cookie and never appears in this JSON object.

## Endpoint Index

| Method | Path | Authentication | Success |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `201 Created` |
| `POST` | `/api/auth/login` | Public | `200 OK` |
| `POST` | `/api/auth/refresh` | Refresh cookie | `200 OK` |
| `POST` | `/api/auth/logout` | Refresh cookie optional | `204 No Content` |
| `GET` | `/api/auth/me` | Bearer access token | `200 OK` |
| `POST` | `/api/tenants` | Bearer access token; no tenant header | `201 Created` |
| `GET` | `/api/access/me` | Bearer token and active tenant | `200 OK` |
| `POST` | `/api/membership-requests` | Bearer token; no tenant header | `201 Created` |
| `GET` | `/api/membership-requests` | Bearer token, tenant, `platform_membership.read` | `200 OK` |
| `POST` | `/api/membership-requests/{id}/approve` | Bearer token, tenant, `platform_membership.approve` and `platform_role.assign` | `200 OK` |
| `POST` | `/api/membership-requests/{id}/reject` | Bearer token, tenant, `platform_membership.approve` | `200 OK` |
| `GET` | `/api/permissions` | Bearer token, tenant, `platform_role.read` | `200 OK` |
| `GET` | `/api/roles` | Bearer token, tenant, `platform_role.read` | `200 OK` |
| `GET` | `/api/roles/{id}` | Bearer token, tenant, `platform_role.read` | `200 OK` |
| `POST` | `/api/roles` | Bearer token, tenant, `platform_role.manage` | `201 Created` |
| `PUT` | `/api/roles/{id}` | Bearer token, tenant, `platform_role.manage` | `200 OK` |
| `DELETE` | `/api/roles/{id}` | Bearer token, tenant, `platform_role.manage` | `204 No Content` |
| `POST` | `/api/accounts` | Bearer token, tenant, `crm_account.write` | `201 Created` |
| `GET` | `/api/accounts/{id}` | Bearer token, tenant, `crm_account.read` | `200 OK` |
| `GET` | `/api/accounts` | Bearer token, tenant, `crm_account.read` | `200 OK` |
| `PUT` | `/api/accounts/{id}` | Bearer token, tenant, `crm_account.write` | `200 OK` |
| `DELETE` | `/api/accounts/{id}` | Bearer token, tenant, `crm_account.write` | `204 No Content` |
| `POST` | `/api/accounts/{accountId}/relationships` | Bearer token, tenant, `crm_account.write` | `201 Created` |
| `GET` | `/api/accounts/{accountId}/relationships` | Bearer token, tenant, `crm_account.read` | `200 OK` |
| `POST` | `/api/accounts/{accountId}/relationships/{relationshipId}/end` | Bearer token, tenant, `crm_account.write` | `200 OK` |
| `POST` | `/api/accounts/{accountId}/communication-channels` | Bearer token, tenant, `crm_account.write` | `201 Created` |
| `GET` | `/api/accounts/{accountId}/communication-channels` | Bearer token, tenant, `crm_account.read` | `200 OK` |
| `PUT` | `/api/accounts/{accountId}/communication-channels/{channelId}` | Bearer token, tenant, `crm_account.write` | `200 OK` |
| `DELETE` | `/api/accounts/{accountId}/communication-channels/{channelId}` | Bearer token, tenant, `crm_account.write` | `204 No Content` |
| `POST` | `/api/accounts/{accountId}/addresses` | Bearer token, tenant, `crm_account.write`, resolved `ACCOUNT` data scope | `201 Created` |
| `GET` | `/api/accounts/{accountId}/addresses` | Bearer token, tenant, `crm_account.read`, resolved `ACCOUNT` data scope | `200 OK` |
| `PUT` | `/api/accounts/{accountId}/addresses/{addressId}` | Bearer token, tenant, `crm_account.write`, resolved `ACCOUNT` data scope | `200 OK` |
| `POST` | `/api/accounts/{accountId}/addresses/{addressId}/end` | Bearer token, tenant, `crm_account.write`, resolved `ACCOUNT` data scope | `200 OK` |

## Authentication Endpoints

### Register a local user

```http
POST /api/auth/register
```

This is a public endpoint. Self-registration is enabled in the default local
configuration. Set `CRM_SELF_REGISTRATION_ENABLED=false` to disable it.

#### Request body

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Valid email; maximum 320 characters |
| `password` | string | Yes | 12-128 characters |
| `displayName` | string | Yes | Non-blank; maximum 255 characters |

```json
{
  "email": "alex@example.test",
  "password": "ExampleOnly-Password-123",
  "displayName": "Alex Example"
}
```

#### Example call

```bash
curl --request POST \
  --header "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --data '{"email":"alex@example.test","password":"ExampleOnly-Password-123","displayName":"Alex Example"}' \
  http://localhost:8080/api/auth/register
```

#### Success

- Status: `201 Created`
- Body: the shared access-token response
- Side effect: creates the local identity and refresh session
- Cookie: writes the new refresh token as `CRM_REFRESH_TOKEN`

#### Errors

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | One or more request fields are invalid |
| `403` | `SELF_REGISTRATION_DISABLED` | Self-registration is disabled |
| `409` | `EMAIL_ALREADY_REGISTERED` | The normalized email already belongs to a user |

### Log in with local credentials

```http
POST /api/auth/login
```

This is a public endpoint.

#### Request body

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Valid email; maximum 320 characters |
| `password` | string | Yes | Non-blank; maximum 128 characters |

```json
{
  "email": "alex@example.test",
  "password": "ExampleOnly-Password-123"
}
```

#### Example call

```bash
curl --request POST \
  --header "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --data '{"email":"alex@example.test","password":"ExampleOnly-Password-123"}' \
  http://localhost:8080/api/auth/login
```

#### Success

- Status: `200 OK`
- Body: the shared access-token response
- Side effect: creates a refresh session
- Cookie: writes the refresh token as `CRM_REFRESH_TOKEN`

#### Errors

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | One or more request fields are invalid |
| `401` | `INVALID_CREDENTIALS` | The user is unknown, the password is invalid, the user is inactive, or the account is temporarily locked |

The endpoint deliberately uses the same credentials error for these cases so
that callers cannot use the response to discover registered accounts.

### Refresh an access token

```http
POST /api/auth/refresh
```

The endpoint has no JSON request body. It reads the refresh token from the
`CRM_REFRESH_TOKEN` cookie.

If an `Origin` header is present, it must match either an allowed origin or the
request's own scheme, host, and port. Requests without an `Origin` header are
accepted, which supports non-browser clients. A malformed or disallowed
supplied origin is rejected.

#### Example call

```bash
curl --request POST \
  --cookie cookies.txt \
  --cookie-jar cookies.txt \
  http://localhost:8080/api/auth/refresh
```

#### Success

- Status: `200 OK`
- Body: the shared access-token response
- Side effect: rotates the refresh token in the existing refresh session
- Cookie: replaces `CRM_REFRESH_TOKEN` with the rotated token

The previous refresh token must not be used again after a successful refresh.

#### Errors

| Status | `errorCode` | When |
|---|---|---|
| `401` | `INVALID_REFRESH_TOKEN` | The cookie is missing, malformed, expired, revoked, belongs to an inactive user, or is otherwise unusable |
| `401` | `REFRESH_TOKEN_REUSED` | A token for the session does not match the current rotated token; the session is revoked |
| `403` | `ACCESS_DENIED` | A supplied `Origin` is malformed or not allowed |

### Log out

```http
POST /api/auth/logout
```

The refresh cookie is optional and there is no JSON request body. If a valid
cookie matches a refresh session, the CRM revokes that session. The CRM clears
the cookie even if it is missing, malformed, unknown, or no longer matches the
stored session token.

The endpoint applies the same optional `Origin` validation as the refresh
endpoint.

#### Example call

```bash
curl --request POST \
  --cookie cookies.txt \
  --cookie-jar cookies.txt \
  http://localhost:8080/api/auth/logout
```

#### Success

- Status: `204 No Content`
- Body: empty
- Side effect: revokes a matching refresh session when possible
- Cookie: clears `CRM_REFRESH_TOKEN`

#### Errors

| Status | `errorCode` | When |
|---|---|---|
| `403` | `ACCESS_DENIED` | A supplied `Origin` is malformed or not allowed |

An invalid or missing refresh cookie does not turn logout into an
authentication error.

### Get the current identity

```http
GET /api/auth/me
```

This endpoint requires a Bearer access token. It loads the current active user
and active tenant memberships from the database; it does not read permissions
or tenant memberships from JWT claims.

An optional `X-Tenant-ID` can establish tenant context for the request, but the
response still lists all active tenant memberships returned for the user.

#### Example call

```bash
curl --request GET \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  http://localhost:8080/api/auth/me
```

#### Success

- Status: `200 OK`

```json
{
  "user": {
    "id": "11111111-1111-1111-1111-111111111111",
    "email": "alex@example.test",
    "displayName": "Alex Example"
  },
  "tenants": [
    {
      "tenantId": "22222222-2222-2222-2222-222222222222",
      "tenantCode": "EXAMPLE",
      "displayName": "Example Tenant",
      "tenantAdmin": true
    }
  ]
}
```

The `tenants` array can be empty.

#### Errors

| Status | `errorCode` | When |
|---|---|---|
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing, invalid, expired, or otherwise rejected by resource-server authentication |
| `401` | `INVALID_CREDENTIALS` | The token subject no longer resolves to an active user |
| `403` | `ACCESS_DENIED` | `X-Tenant-ID` is malformed or does not identify an active membership for the authenticated user |

## Tenant Bootstrap

### Create the first tenant

```http
POST /api/tenants
Authorization: Bearer <access-token>
Content-Type: application/json
```

This authenticated endpoint is available only to an active user without an
`INVITED`, `ACTIVE`, or `SUSPENDED` tenant membership. Do not send
`X-Tenant-ID`; the tenant context does not exist until this operation succeeds.

The operation creates the tenant, an active Tenant Admin membership, the
tenant-scoped `TENANT_ADMIN` system role, an explicit `platform_user.manage`
grant, and a non-expiring role assignment in one transaction.

#### Request body

| Field | Required | Validation and behavior |
|---|---|---|
| `tenantCode` | Yes | Trimmed, non-blank, maximum 320 characters, globally unique |
| `legalName` | Yes | Trimmed, non-blank, maximum 255 characters |
| `displayName` | Yes | Trimmed, non-blank, maximum 255 characters |
| `defaultCurrencyCode` | Yes | Exactly three uppercase letters |
| `defaultCountryCode` | Yes | Exactly two uppercase letters |
| `defaultLanguageCode` | No | Defaults to `en`; maximum 10 characters and must match a language tag |
| `defaultTimezone` | No | Defaults to `UTC`; maximum 255 characters and must be a Java `ZoneId` |

```json
{
  "tenantCode": "example-company",
  "legalName": "Example Company Limited",
  "displayName": "Example Company",
  "defaultCurrencyCode": "USD",
  "defaultCountryCode": "VN",
  "defaultLanguageCode": "vi",
  "defaultTimezone": "Asia/Ho_Chi_Minh"
}
```

#### Example call

```bash
curl --request POST \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{"tenantCode":"example-company","legalName":"Example Company Limited","displayName":"Example Company","defaultCurrencyCode":"USD","defaultCountryCode":"VN","defaultLanguageCode":"vi","defaultTimezone":"Asia/Ho_Chi_Minh"}' \
  http://localhost:8080/api/tenants
```

#### Success

- Status: `201 Created`
- Tenant status: `ACTIVE`
- Membership status: `ACTIVE`
- Initial tenant and role version: `1`

```json
{
  "id": "22222222-2222-2222-2222-222222222222",
  "tenantCode": "example-company",
  "legalName": "Example Company Limited",
  "displayName": "Example Company",
  "status": "ACTIVE",
  "defaultCurrencyCode": "USD",
  "defaultCountryCode": "VN",
  "defaultLanguageCode": "vi",
  "defaultTimezone": "Asia/Ho_Chi_Minh",
  "tenantAdmin": true,
  "createdAt": "2026-08-10T10:00:00Z",
  "version": 1
}
```

Internal membership, role, grant, and assignment identifiers are not exposed.
Call `GET /api/auth/me` after success to obtain the new active membership and
use its tenant ID as `X-Tenant-ID` on tenant-owned APIs.

#### Errors

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | One or more request fields are invalid |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | The authenticated user is no longer active |
| `409` | `TENANT_CODE_ALREADY_EXISTS` | The tenant code already exists |
| `409` | `TENANT_BOOTSTRAP_NOT_ALLOWED` | The user already has a non-removed membership |
| `500` | `INTERNAL_ERROR` | Required bootstrap infrastructure is inconsistent, including a missing `platform_user.manage` catalogue entry |

This endpoint is not idempotent. A repeated call after success returns
`TENANT_BOOTSTRAP_NOT_ALLOWED`; use `GET /api/auth/me` to recover the committed
membership if the original success response was lost.

## Effective Access

### Get current tenant access

```http
GET /api/access/me
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

This endpoint returns the authenticated user's current effective access for
one selected active tenant. It reads authorization from the database and does
not read roles, permissions, or data scopes from JWT claims.

No named business permission is required because the user can inspect only
their own access. Both the Bearer token and `X-Tenant-ID` are required.

The response is intended for frontend rendering. Clients can hide or disable
controls using the returned permission codes, but every business endpoint
still enforces permission and data scope independently on the server.

#### Example call

```bash
curl --request GET \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  http://localhost:8080/api/access/me
```

#### Tenant Admin success

- Status: `200 OK`
- Cache header: `Cache-Control: no-store`

```json
{
  "tenant": {
    "id": "22222222-2222-2222-2222-222222222222",
    "tenantCode": "example-company",
    "displayName": "Example Company"
  },
  "membership": {
    "status": "ACTIVE",
    "tenantAdmin": true
  },
  "permissions": [
    "crm_account.read",
    "crm_account.write",
    "platform_user.manage"
  ],
  "dataAccess": {
    "defaultScope": "TENANT",
    "entities": {}
  }
}
```

An active Tenant Admin receives every `NORMAL` catalogue permission plus
permissions granted through currently effective roles. The bootstrap
`platform_user.manage` permission is `PRIVILEGED`, so it appears through the
explicit `TENANT_ADMIN` role grant. Global `defaultScope: TENANT` applies to
every entity type; no entity keys are fabricated.

#### Non-admin data access

A non-admin response has `defaultScope: null`. Its `entities` object groups
distinct effective role data scopes by entity type:

```json
{
  "defaultScope": null,
  "entities": {
    "ACCOUNT": [
      {
        "type": "TEAM",
        "teamId": "33333333-3333-3333-3333-333333333333"
      }
    ]
  }
}
```

Scope types are `OWN`, `TEAM`, `TEAM_TREE`, and `TENANT`. `teamId` is present
for `TEAM` and `TEAM_TREE` and is `null` for `OWN` and `TENANT`. An explicitly
granted entity-level `TENANT` scope remains under that entity instead of
becoming the global default.

Permission codes, entity keys, and scope arrays have deterministic ordering.
Assigned role information and permission catalogue metadata are not returned.

#### Errors

| Status | `errorCode` | When |
|---|---|---|
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | `X-Tenant-ID` is missing, malformed, inactive, cross-tenant, or not an active membership for the caller |
| `500` | `INTERNAL_ERROR` | An unexpected database or server failure occurs |

The endpoint does not return `404` for an inaccessible tenant and does not
reveal whether another tenant exists. The response is not server-cached or
versioned; committed authorization changes are read again on the next call.

## Membership Join Requests

Membership requests let an authenticated platform user ask to join an existing
tenant. Submission is platform-scoped; review is tenant-scoped. JWTs contain
identity and session data only, so review permissions and assigned roles are
read from current database state.

### Submit a membership request

```http
POST /api/membership-requests
Authorization: Bearer <access-token>
Content-Type: application/json
```

Do not send `X-Tenant-ID`. The applicant is selecting a tenant that they do not
yet belong to. No named business permission is required, but the Bearer token
must identify an `ACTIVE` platform user.

Request:

```json
{
  "tenantCode": "example-corporation",
  "message": "Requesting access as a corporate employee"
}
```

| Field | Required | Normalization and validation |
|---|---|---|
| `tenantCode` | Yes | Trimmed; must remain non-blank; maximum 320 characters |
| `message` | No | Trimmed; blank becomes `null`; maximum 2,000 characters |

The tenant code is matched against a tenant whose status is `TRIAL` or
`ACTIVE`. An unknown code and a tenant in any other status are deliberately
indistinguishable and return `404 TENANT_NOT_AVAILABLE`.

The applicant cannot submit when they already have an `INVITED`, `ACTIVE`, or
`SUSPENDED` membership in the target tenant. A `REMOVED` membership does not
block submission. At most one `PENDING` request may exist for the same tenant
and applicant; resolved request history does not prevent a later submission.
The application check and the database's generated unique pending-request key
both enforce this rule.

Success:

- Status: `201 Created`
- Initial request status: `PENDING`
- Initial request version: `1`

```json
{
  "id": "66666666-6666-6666-6666-666666666666",
  "tenant": {
    "id": "22222222-2222-2222-2222-222222222222",
    "tenantCode": "example-corporation",
    "displayName": "Example Corporation"
  },
  "status": "PENDING",
  "message": "Requesting access as a corporate employee",
  "requestedAt": "2026-08-12T08:00:00Z",
  "reviewedAt": null,
  "reviewNote": null,
  "version": 1
}
```

`id`, every `tenant` field, `status`, `requestedAt`, and `version` are
non-null. `message` is nullable. A newly submitted request always has null
`reviewedAt` and `reviewNote`. The response intentionally does not expose
tenant plan, region, metadata, administrators, or member counts.

Submission is one transaction. It locks and verifies the active platform user,
resolves an available tenant, checks membership and pending-request
eligibility, inserts the request, and reloads the persisted response. A known
duplicate-key race is translated to
`409 MEMBERSHIP_REQUEST_ALREADY_PENDING`.

### List tenant membership requests

```http
GET /api/membership-requests?status=PENDING&page=0&size=20
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

The caller must have an active membership in the selected tenant and the
effective `platform_membership.read` permission. Results are always restricted
to that tenant.

| Query parameter | Default | Validation |
|---|---|---|
| `status` | `PENDING` | Exact enum value `PENDING`, `APPROVED`, or `REJECTED` |
| `page` | `0` | Integer greater than or equal to `0` |
| `size` | `20` | Integer from `1` through `100` inclusive |

Success: `200 OK`

```json
{
  "items": [
    {
      "id": "66666666-6666-6666-6666-666666666666",
      "requester": {
        "id": "77777777-7777-7777-7777-777777777777",
        "email": "applicant@example.test",
        "displayName": "Example Applicant"
      },
      "status": "PENDING",
      "message": "Requesting access as a corporate employee",
      "requestedAt": "2026-08-12T08:00:00Z",
      "reviewedAt": null,
      "reviewedBy": null,
      "reviewNote": null,
      "version": 1
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

Items are ordered by `requestedAt` descending and then request `id`
descending. `items` is never null and may be empty. `id`, every `requester`
field, `status`, `requestedAt`, and `version` are non-null. `message` and
`reviewNote` are nullable. For `PENDING`, `reviewedAt`, `reviewedBy`, and
`reviewNote` are null. For `APPROVED` or `REJECTED`, `reviewedAt` and
`reviewedBy` are non-null; `reviewedBy` contains non-null `id` and
`displayName`, while the optional `reviewNote` may still be null.

The page envelope contains the requested `page` and `size`, the non-negative
`totalElements`, and `totalPages` (`0` when no rows match).

### Approve a membership request

```http
POST /api/membership-requests/66666666-6666-6666-6666-666666666666/approve
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
Content-Type: application/json
```

The caller must have an active membership in the selected tenant and both
effective permissions:

- `platform_membership.approve`
- `platform_role.assign`

Request:

```json
{
  "version": 1,
  "roleIds": [
    "55555555-5555-5555-5555-555555555555"
  ],
  "reviewNote": "Employment verified"
}
```

| Field | Required | Normalization and validation |
|---|---|---|
| Path `id` | Yes | UUID of a request in the selected tenant |
| `version` | Yes | Positive signed-long request version |
| `roleIds` | Yes | Array of 1 to 20 distinct, non-null UUIDs |
| `reviewNote` | No | Trimmed; blank becomes `null`; maximum 2,000 characters |

Every selected role must belong to the selected tenant, be `ACTIVE`, not be
soft-deleted, and be custom (`system: false`). A system role such as
`TENANT_ADMIN` is prohibited even when its ID is known. At least one eligible
custom role is mandatory.

Success: `200 OK`

```json
{
  "tenantId": "22222222-2222-2222-2222-222222222222",
  "user": {
    "id": "77777777-7777-7777-7777-777777777777",
    "email": "applicant@example.test",
    "displayName": "Example Applicant"
  },
  "status": "ACTIVE",
  "tenantAdmin": false,
  "joinedAt": "2026-08-12T08:05:00Z",
  "roles": [
    {
      "id": "55555555-5555-5555-5555-555555555555",
      "roleCode": "EMPLOYEE",
      "name": "Employee"
    }
  ],
  "version": 1
}
```

All response fields are non-null. `roles` contains the selected roles ordered
by `roleCode` and then role `id`. `version` is the tenant membership version,
not the membership-request version. A new membership starts at version `1`;
reactivating a removed membership increments that membership row's existing
version through the membership update trigger.

Approval is one transaction and performs these effects atomically:

1. Lock the tenant-scoped request and compare the submitted version before
   checking whether its status is still `PENDING`.
2. Lock and require the applicant platform user to remain `ACTIVE`.
3. Lock the existing tenant membership when present. An `INVITED`, `ACTIVE`,
   or `SUSPENDED` membership causes `MEMBERSHIP_ALREADY_EXISTS`.
4. Sort and lock all selected roles, then require the exact eligible custom
   role set.
5. Insert a new `ACTIVE` membership, or reactivate a `REMOVED` membership by
   setting it to `ACTIVE`, clearing `removedAt`, resetting
   `tenantAdmin` to `false`, and replacing `joinedAt` with the approval time.
6. Delete all existing role assignments for this tenant and applicant, then
   insert only the selected non-expiring assignments with the reviewer as
   assigner. This replacement prevents dormant grants from returning during
   reactivation.
7. Resolve the request as `APPROVED`, record reviewer, note, and review time,
   and update it only when the persisted request version still equals the
   submitted version.

The request table's update trigger increments the request version exactly once.
If any step fails, the membership insert or reactivation, role-assignment
replacement, and request resolution all roll back.

### Reject a membership request

```http
POST /api/membership-requests/66666666-6666-6666-6666-666666666666/reject
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
Content-Type: application/json
```

The caller must have an active membership in the selected tenant and the
effective `platform_membership.approve` permission. Rejection does not require
`platform_role.assign`.

Request:

```json
{
  "version": 1,
  "reason": "Unable to verify employment"
}
```

| Field | Required | Normalization and validation |
|---|---|---|
| Path `id` | Yes | UUID of a request in the selected tenant |
| `version` | Yes | Positive signed-long request version |
| `reason` | No | Trimmed; blank becomes `null`; maximum 2,000 characters |

Success: `200 OK`

```json
{
  "id": "66666666-6666-6666-6666-666666666666",
  "requester": {
    "id": "77777777-7777-7777-7777-777777777777",
    "email": "applicant@example.test",
    "displayName": "Example Applicant"
  },
  "status": "REJECTED",
  "message": "Requesting access as a corporate employee",
  "requestedAt": "2026-08-12T08:00:00Z",
  "reviewedAt": "2026-08-12T08:05:00Z",
  "reviewedBy": {
    "id": "88888888-8888-8888-8888-888888888888",
    "displayName": "Example Reviewer"
  },
  "reviewNote": "Unable to verify employment",
  "version": 2
}
```

The normalized `reason` is returned as `reviewNote`. Rejection locks the
tenant-scoped request, checks version before status, records the reviewer and
review time, resolves it to `REJECTED`, and increments the request version once
through the request update trigger. It creates no membership or role
assignment. All changes occur in one transaction.

### Membership request concurrency and isolation

Approval and rejection query request IDs together with the current tenant ID,
so a cross-tenant request ID is indistinguishable from an absent request. Both
operations lock the request row and first compare the submitted version:

- a stale submitted version returns
  `409 MEMBERSHIP_REQUEST_VERSION_CONFLICT`, even when the request is already
  resolved; and
- the current version of an already resolved request returns
  `409 MEMBERSHIP_REQUEST_ALREADY_RESOLVED`.

Approval additionally locks the applicant, any existing membership, and every
selected role. Role IDs are sorted before locking, and invalid roles are
reported only as `MEMBERSHIP_ROLE_INVALID`; the response does not reveal
whether a role is absent, cross-tenant, inactive, deleted, or system-owned.

### Membership request errors

| Status | `errorCode` | Applies to | When |
|---|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | Any route | JSON, body/query/path UUID, enum, page, size, duplicate role ID, empty role list, or another field constraint is invalid |
| `401` | `AUTHENTICATION_REQUIRED` | Any route | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Submit | The authenticated actor does not reference an active platform user |
| `403` | `ACCESS_DENIED` | List, approve, reject | The tenant header is malformed, the caller lacks an active membership, or a required permission is missing |
| `403` | `ACCESS_DENIED` | Approve | The applicant platform user is no longer active |
| `404` | `TENANT_NOT_AVAILABLE` | Submit | The tenant code is unknown or the tenant is not `TRIAL` or `ACTIVE` |
| `404` | `MEMBERSHIP_REQUEST_NOT_FOUND` | Approve, reject | The request is absent or belongs to another tenant |
| `409` | `MEMBERSHIP_REQUEST_ALREADY_PENDING` | Submit | A pending request already exists for this tenant and applicant |
| `409` | `MEMBERSHIP_ALREADY_EXISTS` | Submit, approve | The applicant has an `INVITED`, `ACTIVE`, or `SUSPENDED` membership |
| `409` | `MEMBERSHIP_REQUEST_ALREADY_RESOLVED` | Approve, reject | The submitted version is current but the request is no longer `PENDING` |
| `409` | `MEMBERSHIP_REQUEST_VERSION_CONFLICT` | Approve, reject | The submitted version differs from the locked request version, or the guarded resolution update affects no row |
| `422` | `MEMBERSHIP_ROLE_INVALID` | Approve | A selected role is absent, cross-tenant, inactive, deleted, or system-owned |
| `500` | `INTERNAL_ERROR` | Any route | An unexpected persistence or server failure occurs |

`X-Tenant-ID` is mandatory for list, approve, and reject. A malformed value or
an inactive/missing caller membership is translated to `403 ACCESS_DENIED` by
the identity-context filter. When the header is omitted, the shared exception
handler also returns `403 ACCESS_DENIED`; clients must not omit the required
header.

### Post-approval client flow

Approval changes database authorization immediately; the applicant does not
need to log in again. After approval:

1. Call `GET /api/auth/me` with the existing Bearer token to discover the new
   active membership.
2. Select its tenant and send that tenant ID as `X-Tenant-ID`.
3. Call `GET /api/access/me` to obtain effective permission codes and data
   scopes.

The newly assigned roles apply on the next request because permission and data
scope evaluation reads the current database state instead of role claims in
the JWT.

## Role Management

Role Management exposes the system permission catalogue and tenant-owned role
aggregates. Every endpoint requires all of the following:

```http
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

The authenticated user must have an active membership in the selected tenant.
`GET /api/permissions`, `GET /api/roles`, and `GET /api/roles/{id}` require the
effective `platform_role.read` permission. `POST /api/roles`,
`PUT /api/roles/{id}`, and `DELETE /api/roles/{id}` require the effective
`platform_role.manage` permission. Permissions are system-owned and read-only.
System roles are visible, but only custom roles can be created, replaced, or
soft-deleted.

`platform_user.manage` remains in the permission catalogue and is still
granted to bootstrap Tenant Admin roles for legacy compatibility. It is not
the permission checked by any Role Management route. The base SQL backfills
the fine-grained role and membership permissions to roles that already have
the legacy grant.

### List the permission catalogue

```http
GET /api/permissions
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

Success:

- Status: `200 OK`
- Body: JSON array
- Ordering: `moduleCode`, then `permissionCode`, both ascending
- Pagination: none

```json
[
  {
    "permissionCode": "crm_account.read",
    "description": "Read customer accounts",
    "moduleCode": "crm",
    "riskLevel": "NORMAL"
  },
  {
    "permissionCode": "platform_role.read",
    "description": "Read permission catalogue and tenant roles",
    "moduleCode": "platform",
    "riskLevel": "NORMAL"
  }
]
```

`riskLevel` is `NORMAL`, `SENSITIVE`, or `PRIVILEGED`. No endpoint creates,
replaces, or deletes permission definitions.

### List roles

```http
GET /api/roles
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

Success:

- Status: `200 OK`
- Body: JSON array
- Includes: non-deleted custom and system roles, both active and inactive
- Ordering: `roleCode`, then role ID, both ascending
- Pagination: none

```json
[
  {
    "id": "55555555-5555-5555-5555-555555555555",
    "roleCode": "SALES_MANAGER",
    "name": "Sales Manager",
    "description": "Manages sales accounts",
    "system": false,
    "status": "ACTIVE",
    "permissionCount": 2,
    "dataScopeCount": 1,
    "updatedAt": "2026-08-10T10:00:00Z",
    "version": 1
  }
]
```

An empty result is `[]`.

### Get a role

```http
GET /api/roles/55555555-5555-5555-5555-555555555555
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

Success:

- Status: `200 OK`
- Body: complete role aggregate

```json
{
  "id": "55555555-5555-5555-5555-555555555555",
  "roleCode": "SALES_MANAGER",
  "name": "Sales Manager",
  "description": "Manages sales accounts",
  "system": false,
  "status": "ACTIVE",
  "permissionCodes": [
    "crm_account.read",
    "crm_account.write"
  ],
  "dataScopes": [
    {
      "entityType": "ACCOUNT",
      "type": "TEAM",
      "teamId": "33333333-3333-3333-3333-333333333333"
    }
  ],
  "createdAt": "2026-08-10T10:00:00Z",
  "updatedAt": "2026-08-10T10:00:00Z",
  "version": 1
}
```

Permission codes are distinct and sorted lexicographically. Data scopes are
distinct and sorted by `entityType`, `type`, and `teamId`. Soft-deleted and
cross-tenant role IDs return `404 ROLE_NOT_FOUND`.

The bootstrap `TENANT_ADMIN` system role uses the same response shape. It may
have an empty `dataScopes` array because the active Tenant Admin membership
flag provides its global tenant scope.

### Create a role

```http
POST /api/roles
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
Content-Type: application/json
```

```json
{
  "roleCode": "SALES_MANAGER",
  "name": "Sales Manager",
  "description": "Manages sales accounts",
  "permissionCodes": [
    "crm_account.read",
    "crm_account.write"
  ],
  "dataScopes": [
    {
      "entityType": "ACCOUNT",
      "type": "TEAM",
      "teamId": "33333333-3333-3333-3333-333333333333"
    }
  ]
}
```

Create behavior:

- `roleCode` is trimmed, normalized to uppercase, and immutable after create;
- the new role is always custom (`system: false`) and `ACTIVE`;
- omitted or blank `description` is stored as `null`;
- omitted `permissionCodes` or `dataScopes` becomes an empty array;
- role metadata and both grant collections commit in one transaction; and
- role ID, tenant ID, system state, status, audit fields, timestamps, and
  version are controlled by the server.

Success:

- Status: `201 Created`
- Header: `Location: /api/roles/{id}`
- Body: complete role aggregate
- Initial version: `1`

### Replace a role

```http
PUT /api/roles/55555555-5555-5555-5555-555555555555
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
Content-Type: application/json
```

```json
{
  "version": 1,
  "name": "Regional Sales Manager",
  "description": "Manages regional sales accounts",
  "status": "ACTIVE",
  "permissionCodes": [
    "crm_account.read",
    "crm_account.write"
  ],
  "dataScopes": [
    {
      "entityType": "ACCOUNT",
      "type": "TEAM_TREE",
      "teamId": "33333333-3333-3333-3333-333333333333"
    }
  ]
}
```

Replace behavior:

- `roleCode` is immutable and is not part of the request;
- `version`, `name`, and `status` are required;
- `status` is `ACTIVE` or `INACTIVE`;
- omitted or blank `description` becomes `null`;
- omitted grant arrays become empty arrays;
- existing permission and data-scope grants are replaced by the submitted
  sets in the same transaction as the metadata update; and
- a successful replacement increments the version exactly once.

Success:

- Status: `200 OK`
- Body: complete updated role aggregate

An inactive role is immediately ignored by effective permission and data-scope
resolution. Existing user-role assignment rows are retained, so a later
reactivation makes still-valid assignments effective again.

### Soft-delete a role

```http
DELETE /api/roles/55555555-5555-5555-5555-555555555555
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
If-Match: "2"
```

`If-Match` must contain exactly one strong, quoted, positive signed-long
version. Missing, wildcard, weak, unquoted, nonnumeric, zero, negative, or
overflow values are request validation failures.

Delete behavior:

- only custom roles can be deleted;
- deletion records the actor and timestamp and increments the version once;
- permission grants, data scopes, and user-role assignments are retained for
  history;
- effective access ignores the deleted role immediately; and
- the deleted role code can be reused by a new role.

Success:

- Status: `204 No Content`
- Body: empty

### Role validation

| Field | Rule |
|---|---|
| Path `id` | Valid UUID |
| `roleCode` | Required on create; trimmed and uppercased; maximum 191 characters; pattern `^[A-Z][A-Z0-9_]*$`; unique among non-deleted roles in the selected tenant |
| `name` | Required; maximum 255 characters |
| `description` | Optional; maximum 4,000 characters; blank becomes `null` |
| `status` | Required on replace; `ACTIVE` or `INACTIVE` |
| `version` | Required positive signed-long on replace |
| `permissionCodes[]` | Each value is required, trimmed, and at most 191 characters; duplicates after trimming are invalid; every code must exist in the system catalogue |
| `dataScopes[]` | Duplicate normalized `(entityType, type, teamId)` values are invalid |

Each data scope follows these rules:

| Field | Rule |
|---|---|
| `entityType` | Required; trimmed and uppercased; maximum 191 characters; pattern `^[A-Z][A-Z0-9_]*$` |
| `type` | Required; `OWN`, `TEAM`, `TEAM_TREE`, or `TENANT` |
| `teamId` | Required for `TEAM` and `TEAM_TREE`; forbidden for `OWN` and `TENANT` |

A referenced team must be active, non-deleted, and belong to the selected
tenant. Malformed JSON, UUIDs, enum values, field constraints, duplicate
grants, and invalid `If-Match` syntax return `400`. A syntactically valid scope
whose `teamId` presence does not match its type, or whose team reference is not
eligible, returns `422 ROLE_DATA_SCOPE_INVALID`.

### Role Management errors

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | JSON, UUID, enum, field constraint, duplicate grant, or `If-Match` is invalid |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Tenant context is invalid or the route's `platform_role.read` or `platform_role.manage` permission is missing |
| `404` | `ROLE_NOT_FOUND` | The role is absent, deleted, or belongs to another tenant |
| `409` | `ROLE_CODE_ALREADY_EXISTS` | A non-deleted role already uses the normalized code |
| `409` | `SYSTEM_ROLE_IMMUTABLE` | Replace or delete targets a system role |
| `409` | `ROLE_VERSION_CONFLICT` | Replace or delete uses a stale version |
| `422` | `ROLE_PERMISSION_UNKNOWN` | A submitted permission is absent from the catalogue |
| `422` | `ROLE_DATA_SCOPE_INVALID` | Scope/team presence or the referenced team is invalid |
| `500` | `INTERNAL_ERROR` | An unexpected database or server failure occurs |

## Account Management

The Account API is the first business API in the `customer` bounded context.
Every endpoint requires both of these headers:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

The authenticated user must have an active membership in the selected tenant.
The server then checks the operation-specific permission and resolves data
scopes for entity type `ACCOUNT` from the database. Roles, permissions, and
data scopes are not read from JWT claims.

| Data scope | Visible or assignable Account owner |
|---|---|
| `TENANT` | Any valid user owner, team owner, or unassigned Account in the tenant |
| `OWN` | A `USER` owner matching the current user |
| `TEAM` | A `TEAM` owner matching a directly granted team |
| `TEAM_TREE` | A `TEAM` owner matching a granted root team or one of its active descendants |

Multiple scopes combine with OR. Read scope is applied to detail and search;
write scope is applied to create, update, parent selection, and delete.
Unavailable, deleted, cross-tenant, and outside-scope Accounts all produce the
same `404 ACCOUNT_NOT_FOUND` response for detail and mutation lookup.

### Account field shapes

The public contract is mostly flat. Only `owner` and `annualRevenue` are nested.

An owner is nullable or has this shape:

```json
{
  "type": "TEAM",
  "id": "33333333-3333-3333-3333-333333333333"
}
```

`type` is `USER` or `TEAM`. Both nested fields are required when `owner` is
present. An unassigned Account (`owner: null` or omitted) can be created or
updated only with `TENANT` data scope.

Annual revenue is nullable or has this shape:

```json
{
  "amount": 1250000.500000,
  "currencyCode": "USD"
}
```

`amount` is required, nonnegative, and limited to 14 integer digits and 6
fractional digits. `currencyCode` must contain exactly three uppercase letters.
If revenue is supplied without a currency, the API returns
`422 ACCOUNT_REVENUE_CURRENCY_REQUIRED`.

The detail response contains:

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID | No | Account identifier |
| `accountNumber` | string | No | Client-supplied, immutable, maximum 191 characters |
| `accountType` | enum | No | `ORGANIZATION`, `PERSON`, `PARTNER`, `RESELLER`, or `SUPPLIER` |
| `legalName` | string | Yes | Maximum 255 characters |
| `displayName` | string | No | Non-blank, maximum 255 characters |
| `parentAccountId` | UUID | Yes | Must identify an active, accessible Account and cannot equal `id` |
| `owner` | object | Yes | Nested owner shape described above |
| `lifecycleStage` | enum | No | `PROSPECT`, `QUALIFIED`, `CUSTOMER`, `CHURNED`, or `INACTIVE` |
| `industryCode` | string | Yes | Maximum 191 characters |
| `taxIdentifier` | string | Yes | Maximum 255 characters |
| `registrationNumber` | string | Yes | Maximum 191 characters |
| `website` | string | Yes | Blank input is normalized to `null` |
| `annualRevenue` | object | Yes | Nested revenue shape described above |
| `employeeCount` | integer | Yes | Zero or greater |
| `description` | string | Yes | Blank input is normalized to `null` |
| `preferredLanguageCode` | string | Yes | Maximum 10 characters; language tag such as `en` or `vi-VN` |
| `doNotContact` | boolean | No | Contact-suppression flag |
| `createdAt` | timestamp | No | ISO-8601 timestamp |
| `createdBy` | UUID | Yes | Creating actor when recorded |
| `updatedAt` | timestamp | No | ISO-8601 timestamp |
| `updatedBy` | UUID | Yes | Last updating actor when recorded |
| `version` | positive integer | No | Optimistic-concurrency version |

Tenant ID, deletion audit fields, lead source, custom summary, permission data,
and data-scope data are not exposed.

### Create an Account

```http
POST /api/accounts
```

Required permission: `crm_account.write`.

#### Request body

| Field | Required | Validation and behavior |
|---|---|---|
| `accountNumber` | Yes | Non-blank; maximum 191 characters; unique among active Accounts in the tenant |
| `accountType` | No | Defaults to `ORGANIZATION` |
| `legalName` | No | Maximum 255 characters |
| `displayName` | Yes | Non-blank; maximum 255 characters |
| `parentAccountId` | No | Active accessible Account UUID; cannot self-reference |
| `owner` | No | Complete nested owner; unassigned requires `TENANT` scope |
| `lifecycleStage` | No | Defaults to `PROSPECT` |
| `industryCode` | No | Maximum 191 characters |
| `taxIdentifier` | No | Maximum 255 characters |
| `registrationNumber` | No | Maximum 191 characters |
| `website` | No | String |
| `annualRevenue` | No | Complete nested revenue object |
| `employeeCount` | No | Integer zero or greater |
| `description` | No | String |
| `preferredLanguageCode` | No | Valid language tag, maximum 10 characters |
| `doNotContact` | No | Defaults to `false` |

```json
{
  "accountNumber": "ACC-EXAMPLE-001",
  "accountType": "ORGANIZATION",
  "legalName": "Example Trading Company",
  "displayName": "Example Trading",
  "owner": {
    "type": "TEAM",
    "id": "33333333-3333-3333-3333-333333333333"
  },
  "lifecycleStage": "PROSPECT",
  "annualRevenue": {
    "amount": 1250000.500000,
    "currencyCode": "USD"
  },
  "employeeCount": 25,
  "preferredLanguageCode": "en",
  "doNotContact": false
}
```

#### Example call

```bash
curl --request POST \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  --header "Content-Type: application/json" \
  --data '{"accountNumber":"ACC-EXAMPLE-001","displayName":"Example Trading","owner":{"type":"TEAM","id":"33333333-3333-3333-3333-333333333333"}}' \
  http://localhost:8080/api/accounts
```

#### Success

- Status: `201 Created`
- Body: Account detail response
- Initial version: `1`

### Get Account details

```http
GET /api/accounts/{id}
```

Required permission: `crm_account.read`.

```bash
curl --request GET \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  http://localhost:8080/api/accounts/44444444-4444-4444-4444-444444444444
```

#### Success

- Status: `200 OK`
- Body: Account detail response

```json
{
  "id": "44444444-4444-4444-4444-444444444444",
  "accountNumber": "ACC-EXAMPLE-001",
  "accountType": "ORGANIZATION",
  "legalName": "Example Trading Company",
  "displayName": "Example Trading",
  "parentAccountId": null,
  "owner": {
    "type": "TEAM",
    "id": "33333333-3333-3333-3333-333333333333"
  },
  "lifecycleStage": "PROSPECT",
  "industryCode": null,
  "taxIdentifier": null,
  "registrationNumber": null,
  "website": null,
  "annualRevenue": {
    "amount": 1250000.500000,
    "currencyCode": "USD"
  },
  "employeeCount": 25,
  "description": null,
  "preferredLanguageCode": "en",
  "doNotContact": false,
  "createdAt": "2026-08-10T10:00:00Z",
  "createdBy": "11111111-1111-1111-1111-111111111111",
  "updatedAt": "2026-08-10T10:00:00Z",
  "updatedBy": "11111111-1111-1111-1111-111111111111",
  "version": 1
}
```

### Search Accounts

```http
GET /api/accounts
```

Required permission: `crm_account.read`.

| Query parameter | Required | Validation and behavior |
|---|---|---|
| `q` | No | Maximum 255 characters; Account-number prefix or natural-language full-text search |
| `accountType` | No | Account type enum |
| `lifecycleStage` | No | Lifecycle-stage enum |
| `ownerType` | No | `USER` or `TEAM`; must be supplied together with `ownerId` |
| `ownerId` | No | UUID; must be supplied together with `ownerType` |
| `page` | No | Zero-based page number; defaults to `0` |
| `size` | No | `1` to `100`; defaults to `20` |

Results are always ordered by `updatedAt` descending, then `id` descending.
Filters and data-scope predicates are combined with AND.

```bash
curl --request GET \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  "http://localhost:8080/api/accounts?q=ACC-EXAMPLE&lifecycleStage=PROSPECT&page=0&size=20"
```

#### Success

- Status: `200 OK`
- Body: page of Account summaries

```json
{
  "items": [
    {
      "id": "44444444-4444-4444-4444-444444444444",
      "accountNumber": "ACC-EXAMPLE-001",
      "displayName": "Example Trading",
      "legalName": "Example Trading Company",
      "accountType": "ORGANIZATION",
      "lifecycleStage": "PROSPECT",
      "owner": {
        "type": "TEAM",
        "id": "33333333-3333-3333-3333-333333333333"
      },
      "doNotContact": false,
      "updatedAt": "2026-08-10T10:00:00Z",
      "version": 1
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

An empty result uses `items: []`, `totalElements: 0`, and `totalPages: 0`.

### Replace an Account

```http
PUT /api/accounts/{id}
```

Required permission: `crm_account.write`.

This endpoint replaces all mutable Account fields. It does not accept
`accountNumber`; that field is immutable. `version`, `accountType`,
`displayName`, `lifecycleStage`, and `doNotContact` are required. All other
fields follow the same validation and nested shapes as create; omitted nullable
fields are cleared.

```json
{
  "version": 1,
  "accountType": "ORGANIZATION",
  "legalName": "Example Trading Company Limited",
  "displayName": "Example Trading",
  "parentAccountId": null,
  "owner": {
    "type": "TEAM",
    "id": "33333333-3333-3333-3333-333333333333"
  },
  "lifecycleStage": "QUALIFIED",
  "industryCode": null,
  "taxIdentifier": null,
  "registrationNumber": null,
  "website": null,
  "annualRevenue": null,
  "employeeCount": 30,
  "description": null,
  "preferredLanguageCode": "en",
  "doNotContact": false
}
```

```bash
curl --request PUT \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  --header "Content-Type: application/json" \
  --data '{"version":1,"accountType":"ORGANIZATION","displayName":"Example Trading","lifecycleStage":"QUALIFIED","doNotContact":false}' \
  http://localhost:8080/api/accounts/44444444-4444-4444-4444-444444444444
```

#### Success

- Status: `200 OK`
- Body: updated Account detail response
- Version: incremented exactly once

### Soft-delete an Account

```http
DELETE /api/accounts/{id}
If-Match: "<version>"
```

Required permission: `crm_account.write`.

`If-Match` must contain exactly one strong quoted positive signed-long version,
for example `"2"`. Missing, wildcard (`*`), weak (`W/"2"`), unquoted,
nonnumeric, zero, negative, or overflow values return request validation errors.

```bash
curl --request DELETE \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  --header 'If-Match: "2"' \
  http://localhost:8080/api/accounts/44444444-4444-4444-4444-444444444444
```

#### Success

- Status: `204 No Content`
- Body: empty
- Behavior: sets deletion audit data and increments the version once

Soft-deleted Accounts are absent from detail and search. Their Account number
can be reused by a new active Account in the same tenant.

### Account errors

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | Body, query, header, UUID, enum, or field validation fails |
| `401` | `AUTHENTICATION_REQUIRED` | Bearer authentication is missing or invalid |
| `403` | `ACCESS_DENIED` | Tenant membership, permission, data scope, or requested ownership is not allowed |
| `404` | `ACCOUNT_NOT_FOUND` | Account is absent, deleted, cross-tenant, or outside the applicable scope |
| `409` | `ACCOUNT_NUMBER_ALREADY_EXISTS` | An active Account already uses the number in the tenant |
| `409` | `ACCOUNT_VERSION_CONFLICT` | Update body or delete header contains a stale version |
| `422` | `ACCOUNT_OWNER_INVALID` | Owner reference is inactive, deleted, absent, or outside the tenant |
| `422` | `ACCOUNT_PARENT_INVALID` | Parent is absent, deleted, self-referencing, or inaccessible |
| `422` | `ACCOUNT_REVENUE_CURRENCY_REQUIRED` | Annual revenue is present without a currency code |
| `500` | `INTERNAL_ERROR` | An unexpected persistence or server failure occurs |

For validation failures, individual `errors` entries use the common stable
codes `VALIDATION_REQUIRED`, `VALIDATION_SIZE_INVALID`,
`VALIDATION_EMAIL_INVALID`, or `VALIDATION_INVALID` as applicable. Error text
is localized by `Accept-Language`; the codes remain unchanged.

## Account Relationships

Account Relationships are directed links between two active Accounts in the
same selected tenant. Every endpoint requires these headers:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

The server resolves the user's active tenant membership, functional permission,
and `ACCOUNT` data scopes from the database; JWT claims do not provide roles,
permissions, or data scopes. Create and end require `crm_account.write`; list
requires `crm_account.read`.

The stored orientation is always source-to-target:

```text
account_id --relationship_type--> related_account_id
```

Creating through the path stores `{accountId}` as `account_id` and
`relatedAccountId` as `related_account_id`. The response's `account` and
`relatedAccount` fields always preserve that stored orientation. `direction` is
calculated relative to the path Account: `OUTBOUND` when it is the source and
`INBOUND` when it is the target. The server never creates an inverse row.

The only supported relationship types are `PARTNER`, `DISTRIBUTOR`,
`RESELLER`, `SUPPLIER`, `AFFILIATE`, and `OTHER`. Account hierarchy remains
represented only by `Account.parentAccountId`; `PARENT`, `CHILD`, and
`SUBSIDIARY` are not relationship types in this API.

### Relationship response shape

`account` and `relatedAccount` are stable Account display references with only
`id`, `accountNumber`, and `displayName`.

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

`createdBy` is the creator UUID when recorded and otherwise `null`.

### Create an Account Relationship

```http
POST /api/accounts/{accountId}/relationships
```

Required permission: `crm_account.write`. Both Accounts must be active, in the
selected tenant, and inside the caller's resolved write scope.

#### Request body

| Field | Required | Validation and behavior |
|---|---|---|
| `relatedAccountId` | Yes | UUID of the target Account |
| `relationshipType` | Yes | One of the six supported relationship types |
| `validFrom` | No | ISO-8601 `yyyy-MM-dd` date |
| `validTo` | No | ISO-8601 `yyyy-MM-dd` date; cannot precede `validFrom` when both dates are present |
| `description` | No | Maximum 4,000 characters |

```json
{
  "relatedAccountId": "55555555-5555-5555-5555-555555555555",
  "relationshipType": "PARTNER",
  "validFrom": "2026-08-12",
  "validTo": null,
  "description": "Strategic distribution partner"
}
```

#### Example call

```bash
curl --request POST \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  --header "Content-Type: application/json" \
  --data '{"relatedAccountId":"55555555-5555-5555-5555-555555555555","relationshipType":"PARTNER","validFrom":"2026-08-12","validTo":null,"description":"Strategic distribution partner"}' \
  http://localhost:8080/api/accounts/44444444-4444-4444-4444-444444444444/relationships
```

#### Success

- Status: `201 Created`
- Body: Relationship response shape above

The ordered tuple `(accountId, relatedAccountId, relationshipType)` has one
lifetime identity. A second create for the same ordered tuple returns a
conflict, even if the existing relationship has ended.

### List Account Relationships

```http
GET /api/accounts/{accountId}/relationships?page=0&size=20
```

Required permission: `crm_account.read`. The endpoint returns incoming and
outgoing relationships, provided both the path Account and counterpart Account
are active and inside the caller's resolved read scope. A counterpart outside
the scope is not disclosed.

| Query parameter | Required | Validation and behavior |
|---|---|---|
| `page` | No | Zero-based page number; defaults to `0` |
| `size` | No | `1` to `100`; defaults to `20` |

Results have stable ordering by `createdAt` descending, then `id` descending.
The initial list returns all validity periods and has no date or status filter.

```bash
curl --request GET \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  "http://localhost:8080/api/accounts/44444444-4444-4444-4444-444444444444/relationships?page=0&size=20"
```

#### Success

- Status: `200 OK`
- Body: `PageResult` of Relationship response objects

```json
{
  "items": [
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
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

An empty result uses `items: []`, `totalElements: 0`, and `totalPages: 0`.

### End an Account Relationship

```http
POST /api/accounts/{accountId}/relationships/{relationshipId}/end
```

Required permission: `crm_account.write`. The relationship must involve the
path Account, and both participating Accounts must remain active and inside
the caller's resolved write scope.

#### Request body

| Field | Required | Validation and behavior |
|---|---|---|
| `validTo` | Yes | ISO-8601 `yyyy-MM-dd` date; cannot precede the stored `validFrom` |

```json
{
  "validTo": "2026-12-31"
}
```

#### Example call

```bash
curl --request POST \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  --header "Content-Type: application/json" \
  --data '{"validTo":"2026-12-31"}' \
  http://localhost:8080/api/accounts/44444444-4444-4444-4444-444444444444/relationships/66666666-6666-6666-6666-666666666666/end
```

#### Success and idempotency

- Status: `200 OK`
- Body: Relationship response shape above, with the requested `validTo`

Ending is history-preserving. Repeating the request with the already stored
same end date returns the current relationship. A different date after the
relationship has ended returns `409 ACCOUNT_RELATIONSHIP_ALREADY_ENDED`.
There is no hard-delete endpoint, reopening endpoint, or endpoint for editing
the relationship type, Accounts, start date, or description.

### Account Relationship errors

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

`ACCOUNT_RELATIONSHIP_ACCOUNT_INVALID` is intentionally shared for related
Accounts that are absent, deleted, cross-tenant, or outside scope, so callers
cannot discover inaccessible Account identifiers.

## Account Communication Channels

Account Communication Channels are active, Account-owned contact values in the
selected tenant. Every endpoint requires these headers:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

The server resolves the active tenant membership, functional permission, and
`ACCOUNT` data scopes from the database; JWT claims do not provide roles,
permissions, or data scopes. List requires `crm_account.read`. Create, update,
and delete require `crm_account.write`. The path Account must be active, in the
selected tenant, and within the caller's applicable Account scope.

Communication Channels are only Account-owned (`contact_id` is not set). The
API neither returns nor accepts a Contact-owned channel through these routes.
Soft-deleted channels are omitted from all responses and may be created again.

### Communication Channel response shape

Every create and update response is a single object; the list response is an
array of these objects.

```json
{
  "id": "88888888-8888-8888-8888-888888888888",
  "accountId": "44444444-4444-4444-4444-444444444444",
  "channelType": "EMAIL",
  "rawValue": "Operations@Example.invalid",
  "normalizedValue": "operations@example.invalid",
  "label": "Main inbox",
  "isPrimary": true,
  "isVerified": false,
  "verifiedAt": null,
  "doNotUse": false,
  "version": 1,
  "createdAt": "2026-08-12T10:00:00Z",
  "updatedAt": "2026-08-12T10:00:00Z"
}
```

| Field | Type | Behavior |
|---|---|---|
| `id` | UUID | Communication Channel identifier |
| `accountId` | UUID | Owning Account identifier |
| `channelType` | enum | One of the supported channel types below |
| `rawValue` | string | Trimmed submitted value; email case is preserved here |
| `normalizedValue` | string or `null` | Normalized value; `null` only for `OTHER` |
| `label` | string or `null` | Trimmed optional label; blank labels become `null` |
| `isPrimary` | boolean | Whether this is the active primary for its Account and type |
| `isVerified` | boolean | Read-only verification state; new channels are `false` |
| `verifiedAt` | ISO-8601 instant or `null` | Read-only verification timestamp; new channels return `null` |
| `doNotUse` | boolean | Prevents the channel from being primary |
| `version` | positive integer | Optimistic-concurrency version |
| `createdAt` | ISO-8601 instant | Creation timestamp |
| `updatedAt` | ISO-8601 instant | Most recent update timestamp |

`isVerified` and `verifiedAt` are response-only in this API. The request body
does not accept verification state, a verification timestamp, audit fields, or
`metadata`; `metadata` is also not returned. There is no verification or
metadata endpoint in this slice.

### Channel types, validation, and normalization

The `channelType` enum values are `EMAIL`, `PHONE`, `MOBILE`, `SMS`,
`WHATSAPP`, `LINKEDIN`, and `OTHER`. `rawValue` is required, is trimmed before
validation, and must contain 1 to 255 characters after trimming. `label` is
optional, is trimmed, and must be at most 255 characters after trimming.

| Type | Value rule | `normalizedValue` and duplicate identity |
|---|---|---|
| `EMAIL` | Must match `^[^\s@]+@[^\s@]+\.[^\s@]+$` | Trimmed value lowercased with `Locale.ROOT`; duplicate matching uses that normalized value |
| `PHONE` | Must match E.164 | The validated trimmed E.164 value; duplicate matching uses it |
| `MOBILE` | Must match E.164 | The validated trimmed E.164 value; duplicate matching uses it |
| `SMS` | Must match E.164 | The validated trimmed E.164 value; duplicate matching uses it |
| `WHATSAPP` | Must match E.164 | The validated trimmed E.164 value; duplicate matching uses it |
| `LINKEDIN` | Any nonblank trimmed value up to 255 characters | The exact trimmed value; duplicates are case-sensitive |
| `OTHER` | Any nonblank trimmed value up to 255 characters | `null`; duplicates compare the exact trimmed raw value and are case-sensitive |

The exact E.164 pattern is `^\+[1-9][0-9]{1,14}$`. Values must start with `+`,
contain 2 through 15 digits in total, and cannot use a leading zero after the
plus sign. Formatted or local numbers, such as `+1 212 555 0100` or
`02125550100`, are rejected. `LINKEDIN` and `OTHER` deliberately preserve case
for duplicate identity; email duplicate matching is case-insensitive through
normalization.

Type-specific email and E.164 format violations are reported in `errors[]`
against the `rawValue` field. A missing or blank `rawValue` produces only its
required-field violation, and a value longer than 255 characters produces only
its size violation; neither also produces a type-specific format violation.

Duplicates are checked only among active channels of the same tenant, Account,
and `channelType`. A duplicate create or update returns a stable conflict. A
soft-deleted channel is not a duplicate and can be recreated.

### Primary and do-not-use behavior

At most one active channel for an Account and channel type is primary. Setting
`isPrimary` to `true` atomically demotes the existing primary of that same type
and increments the demoted channel's version. `doNotUse: true` always results
in `isPrimary: false`, even when `isPrimary: true` is submitted. Updating a
current primary to `doNotUse: true` demotes it without automatically selecting
a replacement. Changing a primary channel's type applies primary switching to
the new type; the former type is not backfilled.

### Create an Account Communication Channel

```http
POST /api/accounts/{accountId}/communication-channels
```

Required permission: `crm_account.write`.

#### Request body

| Field | Required | Validation and behavior |
|---|---|---|
| `channelType` | Yes | One of `EMAIL`, `PHONE`, `MOBILE`, `SMS`, `WHATSAPP`, `LINKEDIN`, or `OTHER` |
| `rawValue` | Yes | Trimmed; required and validated by the type-specific rules above; maximum 255 characters |
| `label` | No | Trimmed; blank becomes `null`; maximum 255 characters |
| `isPrimary` | No | Boolean; defaults to `false` when omitted and otherwise requests a primary subject to the primary and `doNotUse` rules |
| `doNotUse` | No | Boolean; defaults to `false` when omitted; `true` forces the created channel to be non-primary |

```json
{
  "channelType": "EMAIL",
  "rawValue": " Operations@Example.invalid ",
  "label": " Main inbox ",
  "isPrimary": true,
  "doNotUse": false
}
```

#### Success

- Status: `201 Created`
- Body: Communication Channel response shape above

### List Account Communication Channels

```http
GET /api/accounts/{accountId}/communication-channels
```

Required permission: `crm_account.read`. The response contains all active,
Account-owned channels visible through the caller's resolved read scope; there
is no pagination or filtering on this endpoint. Results use stable ordering by
`channelType` ascending, `isPrimary` descending, `createdAt` ascending, then
`id` ascending.

#### Success

- Status: `200 OK`
- Body: an array of Communication Channel response objects; `[]` when none exist

### Update an Account Communication Channel

```http
PUT /api/accounts/{accountId}/communication-channels/{channelId}
```

Required permission: `crm_account.write`. The request body contains the same
five editable fields and validation rules as create. `channelType`,
`rawValue`, `label`, `isPrimary`, and `doNotUse` replace their respective
editable values; verification and metadata remain excluded.

#### Required concurrency header

```http
If-Match: "1"
```

`If-Match` must be a strong quoted positive decimal `long`: `"1"`, `"2"`, and
so on, with no leading zero. Weak tags, unquoted values, `*`, zero, negative
values, multiple values, nonnumeric values, and values beyond a signed 64-bit
integer are invalid. The supplied version must match the current channel
version or the operation returns a version conflict.

#### Success

- Status: `200 OK`
- Body: Communication Channel response shape above, with its incremented version

### Delete an Account Communication Channel

```http
DELETE /api/accounts/{accountId}/communication-channels/{channelId}
```

Required permission: `crm_account.write`. This is a soft delete and requires
the same strong `If-Match` header as update. It does not choose a replacement
primary channel.

#### Success

- Status: `204 No Content`
- Body: none

### Account Communication Channel errors

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | A UUID, enum, required body field, size, email/E.164 value, or required/valid `If-Match` header is invalid |
| `401` | `AUTHENTICATION_REQUIRED` | Authentication is missing or invalid |
| `403` | `ACCESS_DENIED` | Tenant membership, required Account permission, or required Account data scope is missing |
| `404` | `ACCOUNT_NOT_FOUND` | The path Account is absent, deleted, cross-tenant, or outside the caller's scope |
| `404` | `ACCOUNT_COMMUNICATION_CHANNEL_NOT_FOUND` | The channel is absent, soft-deleted, not owned by the path Account, cross-tenant, or outside scope |
| `409` | `ACCOUNT_COMMUNICATION_CHANNEL_ALREADY_EXISTS` | An active channel with the same Account, type, and canonical value already exists |
| `409` | `ACCOUNT_COMMUNICATION_CHANNEL_VERSION_CONFLICT` | The supplied `If-Match` version is stale, or an optimistic mutation or primary demotion affects no row |
| `500` | `INTERNAL_ERROR` | An unexpected persistence or server failure occurs |

The Account and Channel not-found outcomes intentionally avoid disclosing
identifiers across tenant and Account-scope boundaries.

## Account Addresses

Account Addresses are tenant-scoped, Account-owned postal locations with
effective-date history. Every endpoint requires Bearer authentication and the
selected tenant header:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

List requires `crm_account.read`; create, replace, and end require
`crm_account.write`. Each operation also resolves the caller's `ACCOUNT` data
scope from current database authorization state. A missing functional
permission or missing applicable `ACCOUNT` scope is denied with `403`; an
Account or address that is cross-tenant, deleted, belongs to another Account,
or is filtered out by that resolved scope is reported with the same scoped
not-found outcome used for an absent resource. This deliberately does not
disclose identifiers outside the selected tenant and Account scope.

### Path parameters

| Parameter | Type | Ownership and route applicability | Scoped not-found behavior |
|---|---|---|---|
| `accountId` | UUID | Owning Account identifier; required by create, list, replace, and end | An absent, deleted, cross-tenant, or out-of-scope Account returns `ACCOUNT_NOT_FOUND` |
| `addressId` | UUID | Identifier of an address owned by the path Account; required by replace and end | An absent, deleted, cross-tenant, out-of-scope, or differently owned address returns `ACCOUNT_ADDRESS_NOT_FOUND` |

An invalid UUID value for either path parameter returns
`REQUEST_VALIDATION_FAILED`.

The supported `addressType` values are `BILLING`, `SHIPPING`, `OFFICE`,
`REGISTERED`, and `OTHER`. At most one current address per Account and
`addressType` is primary.

### Address response shape

Create, replace, and end return one address object. List returns an array of
the same objects.

```json
{
  "id": "99999999-9999-9999-9999-999999999999",
  "accountId": "44444444-4444-4444-4444-444444444444",
  "addressType": "OFFICE",
  "addressLine1": "17 Lantern Way",
  "addressLine2": "Suite 4",
  "locality": "Northport",
  "administrativeArea": "Harbor District",
  "postalCode": "1042",
  "countryCode": "NZ",
  "latitude": -36.812345,
  "longitude": 174.745678,
  "formattedAddress": "17 Lantern Way, Northport 1042",
  "validationStatus": "UNVERIFIED",
  "isPrimary": true,
  "validFrom": "2026-08-01",
  "validTo": null,
  "version": 1,
  "createdAt": "2026-08-13T03:00:00Z",
  "updatedAt": "2026-08-13T03:00:00Z"
}
```

| Field | Type | Behavior |
|---|---|---|
| `id` | UUID | Address identifier |
| `accountId` | UUID | Owning Account identifier from the route |
| `addressType` | enum | One of `BILLING`, `SHIPPING`, `OFFICE`, `REGISTERED`, or `OTHER` |
| `addressLine1` | string or `null` | Trimmed address line; maximum 255 characters |
| `addressLine2` | string or `null` | Trimmed secondary line; maximum 255 characters |
| `locality` | string or `null` | Trimmed locality; maximum 255 characters |
| `administrativeArea` | string or `null` | Trimmed state, province, or administrative area; maximum 255 characters |
| `postalCode` | string or `null` | Trimmed postal code; maximum 191 characters |
| `countryCode` | string | Valid ISO 3166-1 alpha-2 code normalized to uppercase |
| `latitude` | decimal or `null` | Latitude in the inclusive range -90 through 90, with at most 6 fractional digits |
| `longitude` | decimal or `null` | Longitude in the inclusive range -180 through 180, with at most 6 fractional digits |
| `formattedAddress` | string or `null` | Trimmed display form; maximum 255 characters |
| `validationStatus` | enum | Read-only state: `UNVERIFIED`, `VALID`, `INVALID`, or `PARTIAL` |
| `isPrimary` | boolean | Whether the address is the current primary for its Account and type |
| `validFrom` | ISO `YYYY-MM-DD` date or `null` | Optional effective start date |
| `validTo` | ISO `YYYY-MM-DD` date or `null` | Read-only end date set by the end operation |
| `version` | positive integer | Optimistic-concurrency version; new addresses start at `1` |
| `createdAt` | ISO-8601 instant | Creation timestamp |
| `updatedAt` | ISO-8601 instant | Most recent content, association, or primary-state update timestamp |

`validationStatus` and `validTo` are response-only. The create and replace
bodies do not accept identifiers, validation state, end dates, versions,
timestamps, or audit fields. New addresses always start with
`validationStatus: "UNVERIFIED"`, `validTo: null`, and version `1`. This slice
does not expose an operation that changes validation state.

### Address input validation and normalization

Create and replace use the same editable fields:

| Field | Required | Validation and behavior |
|---|---|---|
| `addressType` | Yes | One of the five supported address types |
| `addressLine1` | No | Trimmed; blank becomes `null`; maximum 255 characters |
| `addressLine2` | No | Trimmed; blank becomes `null`; maximum 255 characters |
| `locality` | No | Trimmed; blank becomes `null`; maximum 255 characters |
| `administrativeArea` | No | Trimmed; blank becomes `null`; maximum 255 characters |
| `postalCode` | No | Trimmed; blank becomes `null`; maximum 191 characters |
| `countryCode` | Yes | Nonblank, exactly two characters after trimming, and a real ISO 3166-1 alpha-2 code; normalized to uppercase |
| `latitude` | No | Must be supplied together with `longitude`; inclusive range -90 through 90; at most 2 integer and 6 fractional digits |
| `longitude` | No | Must be supplied together with `latitude`; inclusive range -180 through 180; at most 3 integer and 6 fractional digits |
| `formattedAddress` | No | Trimmed; blank becomes `null`; maximum 255 characters |
| `isPrimary` | No | Boolean; defaults to `false` when omitted |
| `validFrom` | No | ISO `YYYY-MM-DD` date; `null` means no explicit start date |

The country code is trimmed and uppercased before validation and storage. For
example, `" nz "` becomes `"NZ"`; a two-letter value not present in the ISO
country list is rejected.

At least one meaningful address component must be nonblank after trimming:
`addressLine1`, `locality`, `administrativeArea`, `postalCode`, or
`formattedAddress`. `addressLine2`, `countryCode`, and coordinates do not by
themselves satisfy this rule. Latitude and longitude must either both be absent
or both be present, and present values must satisfy both their inclusive range
and maximum-six-fractional-digit rules.

### Effective dates, history, and primary behavior

All effective-date decisions use the current date derived from the server
clock in UTC:

- A **current** address has `validFrom` absent or on/before the current UTC
  date, and `validTo` absent.
- A **scheduled** address has `validFrom` after the current UTC date and
  `validTo` absent.
- An **ended** address has a non-null `validTo`.

Creating or replacing an address with `isPrimary: true` atomically demotes the
existing current primary for the same Account and resulting `addressType`.
The demoted address receives a new version and `updatedAt`. A scheduled address
cannot be primary: create or replace rejects `isPrimary: true` when
`validFrom` is after the current UTC date. Changing a primary address's type
applies switching to the new type and does not select a replacement for the
old type. Replacing a primary with `isPrimary: false`, or ending a primary,
also does not select a replacement.

### Create an Account Address

```http
POST /api/accounts/{accountId}/addresses
Content-Type: application/json
```

Required permission: `crm_account.write` with resolved `ACCOUNT` data scope.

```json
{
  "addressType": "OFFICE",
  "addressLine1": " 17 Lantern Way ",
  "addressLine2": "Suite 4",
  "locality": "Northport",
  "administrativeArea": "Harbor District",
  "postalCode": "1042",
  "countryCode": " nz ",
  "latitude": -36.812345,
  "longitude": 174.745678,
  "formattedAddress": "17 Lantern Way, Northport 1042",
  "isPrimary": true,
  "validFrom": "2026-08-01"
}
```

#### Success

- Status: `201 Created`
- Body: Address response shape above with normalized content,
  `validationStatus: "UNVERIFIED"`, `validTo: null`, and version `1`

### List Account Addresses

```http
GET /api/accounts/{accountId}/addresses?addressType=OFFICE&includeHistory=true
```

Required permission: `crm_account.read` with resolved `ACCOUNT` data scope.
Both query parameters are optional. `addressType` filters to one of the five
enum values. `includeHistory` is a boolean that defaults to `false`; the
default response contains current addresses only. `includeHistory=true`
returns current, scheduled, and ended addresses. The type filter and history
flag can be used independently or together. The endpoint is not paginated.

Results have this exact deterministic order:

1. `addressType` ascending.
2. Current addresses before scheduled and ended addresses.
3. `isPrimary` descending.
4. Rows with a non-null `validFrom` before rows with a null `validFrom`.
5. `validFrom` descending.
6. `createdAt` ascending.
7. `id` ascending.

#### Success

- Status: `200 OK`
- Body: an array of Address response objects; `[]` when none exist

### Replace an Account Address

```http
PUT /api/accounts/{accountId}/addresses/{addressId}
If-Match: "1"
Content-Type: application/json
```

Required permission: `crm_account.write` with resolved `ACCOUNT` data scope.
This is full replacement of all editable fields, not a partial update. The
body has the same fields and validation rules as create. Omitted optional text,
coordinate, and `validFrom` fields become `null`, while omitted `isPrimary`
becomes `false`. `validationStatus` is preserved and cannot be submitted;
`validTo` is also read-only, and an already-ended address cannot be replaced.

`If-Match` must contain exactly one strong, quoted, positive decimal signed-
`long` version, such as `"1"` or `"27"`, with no leading zero. Weak tags,
unquoted values, `*`, zero, negative values, multiple values, nonnumeric values,
and values beyond the signed 64-bit range are invalid. After syntactic request
validation and scoped Account/address lookup, the supplied version is compared
before ended-state, effective-period, and primary lifecycle rules. Therefore a
stale version returns `ACCOUNT_ADDRESS_VERSION_CONFLICT` even when the resolved
address is already ended or the requested replacement would violate a
lifecycle rule. A concurrent primary demotion or address mutation that affects
no row also returns this conflict.

#### Success

- Status: `200 OK`
- Body: Address response shape above with the address's incremented version

### End an Account Address

```http
POST /api/accounts/{accountId}/addresses/{addressId}/end
If-Match: "2"
```

Required permission: `crm_account.write` with resolved `ACCOUNT` data scope.
The operation accepts no body. It sets `validTo` to the current UTC date,
forces `isPrimary` to `false`, increments the version, and updates `updatedAt`.
It does not delete address content and does not select a replacement primary.
Ending a scheduled address before its `validFrom` date is rejected. An ended
address disappears immediately from the default current-only list but remains
available with `includeHistory=true`. The same strong `If-Match` syntax and
version-first priority described for replace apply to end.

#### Success

- Status: `200 OK`
- Body: the ended Address response with its UTC `validTo`, `isPrimary: false`,
  and incremented version

### Account Address errors

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | JSON, path UUID, query enum/boolean, body enum, required field, size, ISO country, meaningful-component, coordinate pair/range/scale, or required/valid strong `If-Match` syntax is invalid |
| `401` | `AUTHENTICATION_REQUIRED` | Bearer authentication is missing or invalid |
| `403` | `ACCESS_DENIED` | Active tenant membership, required Account permission, or an applicable resolved `ACCOUNT` data scope is missing |
| `404` | `ACCOUNT_NOT_FOUND` | The path Account is absent, deleted, cross-tenant, or outside the caller's resolved Account scope |
| `404` | `ACCOUNT_ADDRESS_NOT_FOUND` | The address is absent, deleted, not associated with the path Account, cross-tenant, or outside the caller's resolved Account scope |
| `409` | `ACCOUNT_ADDRESS_VERSION_CONFLICT` | `If-Match` is stale, or an optimistic address mutation or primary demotion affects no row |
| `409` | `ACCOUNT_ADDRESS_ALREADY_ENDED` | Replace or end targets an address association that has already ended, after version comparison succeeds |
| `422` | `ACCOUNT_ADDRESS_PERIOD_INVALID` | End targets a scheduled address before its `validFrom` date |
| `422` | `ACCOUNT_ADDRESS_PRIMARY_INVALID` | Create or replace requests a primary address whose `validFrom` is after the current UTC date |
| `500` | `INTERNAL_ERROR` | An unexpected persistence or server failure occurs |

There is no single-address `GET`, `DELETE`, address sharing or relinking,
duplicate-address detection, geocoding, validation/verification mutation, or
automatic primary replacement in this slice. These Account routes do not
accept or return Contact-owned addresses.

## Contact Management

Contact Management is a core CRM API in the `customer` bounded context. Every
endpoint requires both of these headers:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

The authenticated user must have an active membership in the selected tenant.
The server checks the operation-specific permission (`crm_contact.read` or
`crm_contact.write`) and resolves data scopes for entity type `CONTACT` from
the database.

| Data scope | Visible or assignable Contact owner |
|---|---|
| `TENANT` | Any valid user owner, team owner, or unassigned Contact in the tenant |
| `OWN` | A `USER` owner matching the current user |
| `TEAM` | A `TEAM` owner matching a directly granted team |
| `TEAM_TREE` | A `TEAM` owner matching a granted root team or one of its active descendants |

Multiple scopes combine with OR. Read scope is applied to detail and search;
write scope is applied to create, update, and delete.

### Contact field shapes

The detail response contains:

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID | No | Contact identifier |
| `contactNumber` | string | No | Client-supplied, immutable, maximum 191 characters |
| `accountId` | UUID | Yes | Associated Account identifier |
| `owner` | object | Yes | Nested owner shape (`type`: `USER`/`TEAM`, `id`: UUID) |
| `honorific` | string | Yes | Maximum 255 characters (e.g. Mr., Ms., Dr.) |
| `givenName` | string | Yes | Maximum 255 characters |
| `middleName` | string | Yes | Maximum 255 characters |
| `familyName` | string | Yes | Maximum 255 characters |
| `displayName` | string | No | Non-blank, maximum 255 characters |
| `jobTitle` | string | Yes | Maximum 255 characters |
| `department` | string | Yes | Maximum 255 characters |
| `preferredLanguageCode` | string | Yes | Maximum 10 characters; language tag such as `vi` or `en-US` |
| `preferredContactChannel` | enum | Yes | `EMAIL`, `PHONE`, `MOBILE`, `SMS`, `WHATSAPP`, `OTHER` |
| `lifecycleStage` | enum | No | `PROSPECT`, `QUALIFIED`, `CUSTOMER`, `CHURNED`, `INACTIVE` |
| `dateOfBirth` | date | Yes | ISO-8601 `YYYY-MM-DD` |
| `doNotContact` | boolean | No | Suppression flag |
| `description` | string | Yes | Free-form notes |
| `createdAt` | timestamp | No | ISO-8601 UTC timestamp |
| `createdBy` | UUID | Yes | Creating actor |
| `updatedAt` | timestamp | No | ISO-8601 UTC timestamp |
| `updatedBy` | UUID | Yes | Updating actor |
| `version` | positive integer | No | Optimistic-concurrency version |

### Create a Contact

```http
POST /api/contacts
```

Required permission: `crm_contact.write`.

#### Request body

```json
{
  "contactNumber": "CT-EXAMPLE-001",
  "accountId": "11111111-1111-1111-1111-111111111111",
  "owner": {
    "type": "USER",
    "id": "44444444-4444-4444-4444-444444444444"
  },
  "honorific": "Mr.",
  "givenName": "Vũ",
  "familyName": "Phạm",
  "displayName": "Phạm Tuấn Vũ",
  "jobTitle": "Chief Technology Officer",
  "department": "Engineering",
  "preferredLanguageCode": "vi",
  "preferredContactChannel": "EMAIL",
  "lifecycleStage": "CUSTOMER",
  "doNotContact": false,
  "description": "Key technical decision maker."
}
```

#### Success

- Status: `201 Created`
- Version: `1`

### Get a Contact by ID

```http
GET /api/contacts/{id}
```

Required permission: `crm_contact.read`.

- Status: `200 OK`

### Search Contacts

```http
GET /api/contacts?q=Vũ&lifecycleStage=CUSTOMER&page=0&size=20
```

Required permission: `crm_contact.read`.

Supported query parameters:

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Free-text search matching `displayName`, `contactNumber`, `jobTitle`, `department` |
| `accountId` | UUID | Filter by associated Account |
| `lifecycleStage` | enum | Filter by lifecycle stage |
| `ownerType` | enum | `USER` or `TEAM` |
| `ownerId` | UUID | Filter by owner ID |
| `page` | integer | Zero-indexed page number (default: `0`) |
| `size` | integer | Page size (1 to 100, default: `20`) |

- Status: `200 OK`
- Body: `PageResult<ContactSummaryResponse>`

### Update a Contact

```http
PUT /api/contacts/{id}
```

Required permission: `crm_contact.write`.

#### Request body

```json
{
  "version": 1,
  "accountId": "11111111-1111-1111-1111-111111111111",
  "owner": {
    "type": "USER",
    "id": "44444444-4444-4444-4444-444444444444"
  },
  "displayName": "Phạm Tuấn Vũ (CTO)",
  "jobTitle": "Chief Technology Officer",
  "department": "Engineering & Technology",
  "preferredLanguageCode": "vi",
  "preferredContactChannel": "MOBILE",
  "lifecycleStage": "CUSTOMER",
  "doNotContact": false,
  "description": "Updated contact info."
}
```

- Status: `200 OK`
- Version incremented by 1.

### Delete a Contact

```http
DELETE /api/contacts/{id}
If-Match: "1"
```

Required permission: `crm_contact.write`.

- Status: `204 No Content`

### Contact Error Codes

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | One or more request fields are invalid |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Missing `crm_contact.read`/`write` permission or outside authorized data scope |
| `404` | `CONTACT_NOT_FOUND` | Contact ID does not exist, is soft-deleted, or is outside data scope |
| `404` | `CONTACT_ACCOUNT_INVALID` | Associated Account ID does not exist or is outside data scope |
| `409` | `CONTACT_NUMBER_ALREADY_EXISTS` | Contact number is already taken in the tenant |
| `409` | `CONTACT_VERSION_CONFLICT` | Optimistic concurrency version mismatch |

## Lead Management

Lead Management handles inbound prospective leads, tracking lifecycle ratings,
qualification notes, ownership, and eventual conversion to accounts, contacts,
and opportunities.

Every endpoint requires both of these headers:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

The authenticated user must have an active membership in the selected tenant.
The server checks `crm_lead.read` or `crm_lead.write` and resolves data scopes
for entity type `LEAD`.

| Data scope | Visible or assignable Lead owner |
|---|---|
| `TENANT` | Any valid user owner, team owner, or unassigned Lead in the tenant |
| `OWN` | A `USER` owner matching the current user |
| `TEAM` | A `TEAM` owner matching a directly granted team |
| `TEAM_TREE` | A `TEAM` owner matching a granted root team or one of its active descendants |

Multiple scopes combine with OR. Read scope is applied to detail and search;
write scope is applied to create, update, convert, and delete.

### Lead field shapes

The detail response contains:

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID | No | Lead identifier |
| `leadNumber` | string | No | Client-supplied, immutable, maximum 191 characters |
| `statusId` | UUID | No | Active lead status identifier |
| `sourceId` | UUID | Yes | Active lead source identifier |
| `owner` | object | Yes | Nested owner shape (`type`: `USER`/`TEAM`, `id`: UUID) |
| `rating` | enum | Yes | `HOT`, `WARM`, `COLD` |
| `accountName` | string | Yes | Prospective account name |
| `companyName` | string | Yes | Company or organization name |
| `honorific` | string | Yes | Maximum 255 characters |
| `givenName` | string | Yes | Maximum 255 characters |
| `familyName` | string | Yes | Maximum 255 characters |
| `displayName` | string | No | Non-blank, maximum 255 characters |
| `email` | string | Yes | Valid email address, maximum 320 characters |
| `phoneE164` | string | Yes | International E.164 phone format (e.g. `+84901234567`) |
| `jobTitle` | string | Yes | Maximum 255 characters |
| `website` | string | Yes | URL / domain |
| `countryCode` | string | Yes | 2-letter uppercase ISO country code (e.g. `VN`) |
| `preferredLanguageCode` | string | Yes | Language tag such as `vi` or `en-US` |
| `estimatedValue` | object | Yes | Nested `{ amount: 100000.0, currencyCode: "USD" }` |
| `qualificationNotes` | string | Yes | Free-form qualification text |
| `disqualificationReason` | string | Yes | Reason when disqualified |
| `convertedAt` | timestamp | Yes | ISO-8601 UTC timestamp when converted |
| `convertedBy` | UUID | Yes | Actor that executed conversion |
| `convertedAccountId` | UUID | Yes | Generated / attached Account UUID |
| `convertedContactId` | UUID | Yes | Generated / attached Contact UUID |
| `convertedOpportunityId` | UUID | Yes | Generated / attached Opportunity UUID |
| `createdAt` | timestamp | No | ISO-8601 UTC timestamp |
| `createdBy` | UUID | Yes | Creating actor |
| `updatedAt` | timestamp | No | ISO-8601 UTC timestamp |
| `updatedBy` | UUID | Yes | Updating actor |
| `version` | positive integer | No | Optimistic-concurrency version |

### Create a Lead

```http
POST /api/leads
```

Required permission: `crm_lead.write`.

#### Request body

```json
{
  "leadNumber": "LD-2026-001",
  "statusId": "11111111-1111-1111-1111-111111111111",
  "sourceId": "22222222-2222-2222-2222-222222222222",
  "owner": {
    "type": "USER",
    "id": "33333333-3333-3333-3333-333333333333"
  },
  "rating": "HOT",
  "companyName": "Tech Innovators JSC",
  "displayName": "Trần Văn An",
  "email": "an.tran@techinnovators.vn",
  "phoneE164": "+84901234567",
  "jobTitle": "Head of Procurement",
  "countryCode": "VN",
  "preferredLanguageCode": "vi",
  "estimatedValue": {
    "amount": 50000.000000,
    "currencyCode": "USD"
  },
  "qualificationNotes": "Strong interest in CRM enterprise subscription."
}
```

- Status: `201 Created`
- Version: `1`

### Get a Lead by ID

```http
GET /api/leads/{id}
```

Required permission: `crm_lead.read`.

- Status: `200 OK`

### Search Leads

```http
GET /api/leads?q=Tech&rating=HOT&page=0&size=20
```

Required permission: `crm_lead.read`.

Supported query parameters:

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Free-text search matching `displayName`, `leadNumber`, `companyName`, `email`, `phoneE164`, `jobTitle` |
| `statusId` | UUID | Filter by status ID |
| `sourceId` | UUID | Filter by source ID |
| `rating` | enum | `HOT`, `WARM`, `COLD` |
| `ownerType` | enum | `USER` or `TEAM` |
| `ownerId` | UUID | Filter by owner ID |
| `converted` | boolean | `true` for converted, `false` for open |
| `page` | integer | Zero-indexed page number (default: `0`) |
| `size` | integer | Page size (1 to 100, default: `20`) |

- Status: `200 OK`
- Body: `PageResult<LeadSummaryResponse>`

### Update a Lead

```http
PUT /api/leads/{id}
```

Required permission: `crm_lead.write`.

- Status: `200 OK`
- Version incremented by 1.

### Convert a Lead

```http
POST /api/leads/{id}/convert
```

Required permission: `crm_lead.write`.

#### Request body

```json
{
  "version": 1,
  "convertedAccountId": "44444444-4444-4444-4444-444444444444",
  "convertedContactId": "55555555-5555-5555-5555-555555555555",
  "convertedOpportunityId": "66666666-6666-6666-6666-666666666666",
  "convertedStatusId": "77777777-7777-7777-7777-777777777777"
}
```

- Status: `200 OK`
- Sets `convertedAt` timestamp and conversion reference IDs.

### Delete a Lead

```http
DELETE /api/leads/{id}
If-Match: "1"
```

Required permission: `crm_lead.write`.

- Status: `204 No Content`

### Lead Error Codes

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | One or more request fields are invalid |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Missing `crm_lead.read`/`write` permission or outside authorized data scope |
| `404` | `LEAD_NOT_FOUND` | Lead ID does not exist, is soft-deleted, or is outside data scope |
| `404` | `LEAD_STATUS_INVALID` | Lead status ID does not exist or is inactive |
| `404` | `LEAD_SOURCE_INVALID` | Lead source ID does not exist or is inactive |
| `404` | `LEAD_CONVERSION_INVALID` | Converted Account/Contact ID does not exist or is outside data scope |
| `409` | `LEAD_NUMBER_ALREADY_EXISTS` | Lead number is already taken in the tenant |
| `409` | `LEAD_ALREADY_CONVERTED` | Lead has already been converted |
| `409` | `LEAD_VERSION_CONFLICT` | Optimistic concurrency version mismatch |

## Opportunity Management

Opportunity Management tracks deal cycles, pipeline stages, revenue forecasting,
weighted probability, and customer deal commitments.

Every endpoint requires both of these headers:

```http
Authorization: Bearer ${ACCESS_TOKEN}
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

The authenticated user must have an active membership in the selected tenant.
The server checks `crm_opportunity.read` or `crm_opportunity.write` and resolves
data scopes for entity type `OPPORTUNITY`.

| Data scope | Visible or assignable Opportunity owner |
|---|---|
| `TENANT` | Any valid user owner, team owner, or unassigned Opportunity in the tenant |
| `OWN` | A `USER` owner matching the current user |
| `TEAM` | A `TEAM` owner matching a directly granted team |
| `TEAM_TREE` | A `TEAM` owner matching a granted root team or one of its active descendants |

Multiple scopes combine with OR. Read scope is applied to detail and search;
write scope is applied to create, update, and delete.

### Opportunity field shapes

The detail response contains:

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID | No | Opportunity identifier |
| `opportunityNumber` | string | No | Client-supplied, immutable, maximum 191 characters |
| `name` | string | No | Non-blank, maximum 255 characters |
| `accountId` | UUID | No | Associated Account identifier |
| `pipelineId` | UUID | No | Associated Sales Pipeline identifier |
| `currentStageId` | UUID | No | Current Pipeline Stage identifier |
| `owner` | object | Yes | Nested owner shape (`type`: `USER`/`TEAM`, `id`: UUID) |
| `sourceId` | UUID | Yes | Active lead source identifier |
| `primaryContactId` | UUID | Yes | Primary Contact identifier |
| `opportunityType` | enum | No | `NEW_BUSINESS`, `UPSELL`, `CROSS_SELL`, `RENEWAL`, `PARTNERSHIP`, `OTHER` |
| `status` | enum | No | `OPEN`, `WON`, `LOST`, `CANCELLED` |
| `amount` | object | No | Nested `{ amount: 150000.0, currencyCode: "USD" }` |
| `probability` | number | No | Decimal percentage `0.00` to `100.00` |
| `expectedCloseDate` | date | Yes | ISO-8601 `YYYY-MM-DD` |
| `actualCloseDate` | date | Yes | ISO-8601 `YYYY-MM-DD` |
| `nextStep` | string | Yes | Immediate milestone |
| `description` | string | Yes | Deal overview and notes |
| `lostReasonId` | UUID | Yes | Required when `status` is `LOST` |
| `lostReasonNotes` | string | Yes | Lost justification notes |
| `campaignId` | UUID | Yes | Associated marketing campaign |
| `createdAt` | timestamp | No | ISO-8601 UTC timestamp |
| `createdBy` | UUID | Yes | Creating actor |
| `updatedAt` | timestamp | No | ISO-8601 UTC timestamp |
| `updatedBy` | UUID | Yes | Updating actor |
| `version` | positive integer | No | Optimistic-concurrency version |

### Create an Opportunity

```http
POST /api/opportunities
```

Required permission: `crm_opportunity.write`.

#### Request body

```json
{
  "opportunityNumber": "OPP-2026-001",
  "name": "Cloud Infrastructure Migration Deal",
  "accountId": "11111111-1111-1111-1111-111111111111",
  "pipelineId": "22222222-2222-2222-2222-222222222222",
  "currentStageId": "33333333-3333-3333-3333-333333333333",
  "owner": {
    "type": "USER",
    "id": "44444444-4444-4444-4444-444444444444"
  },
  "primaryContactId": "55555555-5555-5555-5555-555555555555",
  "opportunityType": "NEW_BUSINESS",
  "amount": {
    "amount": 150000.000000,
    "currencyCode": "USD"
  },
  "probability": 75.00,
  "expectedCloseDate": "2026-09-30",
  "nextStep": "Draft and review final master services agreement",
  "description": "Enterprise cloud workload modernization project."
}
```

- Status: `201 Created`
- Version: `1`

### Get an Opportunity by ID

```http
GET /api/opportunities/{id}
```

Required permission: `crm_opportunity.read`.

- Status: `200 OK`

### Search Opportunities

```http
GET /api/opportunities?status=OPEN&page=0&size=20
```

Required permission: `crm_opportunity.read`.

Supported query parameters:

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Free-text search matching `name`, `opportunityNumber`, `nextStep` |
| `accountId` | UUID | Filter by associated Account |
| `pipelineId` | UUID | Filter by Pipeline |
| `stageId` | UUID | Filter by Pipeline Stage |
| `status` | enum | `OPEN`, `WON`, `LOST`, `CANCELLED` |
| `opportunityType` | enum | Opportunity category |
| `ownerType` | enum | `USER` or `TEAM` |
| `ownerId` | UUID | Filter by owner ID |
| `page` | integer | Zero-indexed page number (default: `0`) |
| `size` | integer | Page size (1 to 100, default: `20`) |

- Status: `200 OK`
- Body: `PageResult<OpportunitySummaryResponse>`

### Update an Opportunity

```http
PUT /api/opportunities/{id}
```

Required permission: `crm_opportunity.write`.

- Status: `200 OK`
- Version incremented by 1.

### Delete an Opportunity

```http
DELETE /api/opportunities/{id}
If-Match: "1"
```

Required permission: `crm_opportunity.write`.

- Status: `204 No Content`

### Opportunity Error Codes

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | One or more request fields are invalid |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Missing `crm_opportunity.read`/`write` permission or outside authorized data scope |
| `404` | `OPPORTUNITY_NOT_FOUND` | Opportunity ID does not exist, is soft-deleted, or is outside data scope |
| `404` | `OPPORTUNITY_ACCOUNT_INVALID` | Associated Account ID does not exist or is outside data scope |
| `404` | `OPPORTUNITY_PIPELINE_INVALID` | Associated Pipeline ID does not exist or is inactive |
| `404` | `OPPORTUNITY_STAGE_INVALID` | Associated Pipeline Stage ID does not exist in pipeline |
| `404` | `OPPORTUNITY_CONTACT_INVALID` | Associated Contact ID does not exist or is outside data scope |
| `409` | `OPPORTUNITY_NUMBER_ALREADY_EXISTS` | Opportunity number is already taken in the tenant |
| `409` | `OPPORTUNITY_VERSION_CONFLICT` | Optimistic concurrency version mismatch |
| `422` | `OPPORTUNITY_LOST_REASON_REQUIRED` | Status is set to `LOST` without providing a `lostReasonId` |

## Sales Quote Management

Sales Quote endpoints manage the complete quotation lifecycle including draft quotes, approvals, and order conversions.

### Authorization

All quote endpoints require:
- Header: `Authorization: Bearer <token>`
- Permissions:
  - `sales_quote.read` for `GET` endpoints
  - `sales_quote.write` for `POST`, `PUT`, `DELETE` endpoints
  - `sales_quote.approve` for `POST /api/quotes/{id}/approve`

### Endpoints

#### 1. Create Quote

```http
POST /api/quotes
Content-Type: application/json
```

Request Body:
```json
{
  "quoteNumber": "QUO-2026-0001",
  "accountId": "20000000-0000-0000-0000-000000000001",
  "contactId": "30000000-0000-0000-0000-000000000001",
  "opportunityId": "40000000-0000-0000-0000-000000000001",
  "priceBookId": null,
  "ownerUserId": null,
  "amounts": {
    "currencyCode": "VND",
    "subtotal": 100000000.0,
    "discountTotal": 5000000.0,
    "taxTotal": 9500000.0,
    "shippingTotal": 0.0
  },
  "issueDate": "2026-08-14",
  "validUntil": "2026-09-14",
  "paymentTerms": "NET30",
  "deliveryTerms": "FOB",
  "customerReference": "PO-REQ-888",
  "notes": "Standard commercial proposal"
}
```

Response: `201 Created`

#### 2. Get Quote by ID

```http
GET /api/quotes/{id}
```

Response: `200 OK`

#### 3. Search / Filter Quotes

```http
GET /api/quotes?q=QUO&accountId=20000000-0000-0000-0000-000000000001&status=DRAFT&page=0&size=20
```

Response: `200 OK`

#### 4. Update Quote

```http
PUT /api/quotes/{id}
Content-Type: application/json
```

Request Body:
```json
{
  "version": 1,
  "accountId": "20000000-0000-0000-0000-000000000001",
  "contactId": "30000000-0000-0000-0000-000000000001",
  "opportunityId": "40000000-0000-0000-0000-000000000001",
  "priceBookId": null,
  "ownerUserId": null,
  "status": "DRAFT",
  "amounts": {
    "currencyCode": "VND",
    "subtotal": 120000000.0,
    "discountTotal": 10000000.0,
    "taxTotal": 11000000.0,
    "shippingTotal": 0.0
  },
  "issueDate": "2026-08-14",
  "validUntil": "2026-09-30",
  "paymentTerms": "NET30",
  "deliveryTerms": "FOB",
  "customerReference": "PO-REQ-888-REV1",
  "notes": "Updated pricing"
}
```

Response: `200 OK`

#### 5. Approve Quote

```http
POST /api/quotes/{id}/approve
If-Match: "1"
```

Response: `200 OK`

#### 6. Delete Quote

```http
DELETE /api/quotes/{id}
If-Match: "1"
```

Response: `204 No Content`

### Quote Error Codes

| Status | Error Code | Reason |
| --- | --- | --- |
| `400` | `INVALID_PAYLOAD` | Validation violation on request payload fields |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Missing `sales_quote.read`/`write`/`approve` permission or outside authorized data scope |
| `404` | `QUOTE_NOT_FOUND` | Quote ID does not exist or is outside data scope |
| `404` | `QUOTE_ACCOUNT_INVALID` | Associated Account, Contact, Opportunity, or PriceBook ID does not exist |
| `409` | `QUOTE_NUMBER_ALREADY_EXISTS` | Quote number is already taken in the tenant |
| `409` | `QUOTE_VERSION_CONFLICT` | Optimistic concurrency version mismatch |

## Sales Order Management

Sales Order endpoints manage the full lifecycle of commercial sales orders including creation, updates, confirmation, fulfillment tracking, and cancellation.

### Authorization

All order endpoints require:
- Header: `Authorization: Bearer <token>`
- Permissions:
  - `sales_order.read` for `GET` endpoints
  - `sales_order.write` for `POST`, `PUT`, `DELETE` endpoints

### Endpoints

#### 1. Create Order

```http
POST /api/orders
Content-Type: application/json
```

Request Body:
```json
{
  "orderNumber": "ORD-2026-0001",
  "accountId": "20000000-0000-0000-0000-000000000001",
  "contactId": "30000000-0000-0000-0000-000000000001",
  "opportunityId": "40000000-0000-0000-0000-000000000001",
  "quoteId": "50000000-0000-0000-0000-000000000001",
  "ownerUserId": null,
  "amounts": {
    "currencyCode": "VND",
    "subtotal": 100000000.0,
    "discountTotal": 5000000.0,
    "taxTotal": 9500000.0,
    "shippingTotal": 500000.0
  },
  "orderDate": "2026-08-14",
  "requestedDeliveryDate": "2026-08-25",
  "customerReference": "PO-CLIENT-999"
}
```

Response: `201 Created`

#### 2. Get Order by ID

```http
GET /api/orders/{id}
```

Response: `200 OK`

#### 3. Search / Filter Orders

```http
GET /api/orders?q=ORD&accountId=20000000-0000-0000-0000-000000000001&status=CONFIRMED&page=0&size=20
```

Response: `200 OK`

#### 4. Update Order

```http
PUT /api/orders/{id}
Content-Type: application/json
```

Request Body:
```json
{
  "version": 1,
  "accountId": "20000000-0000-0000-0000-000000000001",
  "contactId": "30000000-0000-0000-0000-000000000001",
  "opportunityId": "40000000-0000-0000-0000-000000000001",
  "quoteId": "50000000-0000-0000-0000-000000000001",
  "ownerUserId": null,
  "status": "CONFIRMED",
  "amounts": {
    "currencyCode": "VND",
    "subtotal": 110000000.0,
    "discountTotal": 5000000.0,
    "taxTotal": 10500000.0,
    "shippingTotal": 500000.0
  },
  "orderDate": "2026-08-14",
  "requestedDeliveryDate": "2026-08-28",
  "customerReference": "PO-CLIENT-999-REV1"
}
```

Response: `200 OK`

#### 5. Confirm Order

```http
POST /api/orders/{id}/confirm
If-Match: "1"
```

Response: `200 OK`

#### 6. Cancel Order

```http
POST /api/orders/{id}/cancel
If-Match: "1"
Content-Type: application/json
```

Request Body:
```json
{
  "reason": "Customer requested cancellation due to budget constraints"
}
```

Response: `200 OK`

#### 7. Delete Order

```http
DELETE /api/orders/{id}
If-Match: "1"
```

Response: `204 No Content`

### Order Error Codes

| Status | Error Code | Reason |
| --- | --- | --- |
| `400` | `INVALID_PAYLOAD` | Validation violation on request payload fields |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Missing `sales_order.read`/`write` permission or outside authorized data scope |
| `404` | `ORDER_NOT_FOUND` | Order ID does not exist or is outside data scope |
| `404` | `ORDER_ACCOUNT_INVALID` | Associated Account, Contact, Opportunity, or Quote ID does not exist |
| `409` | `ORDER_NUMBER_ALREADY_EXISTS` | Order number is already taken in the tenant |
| `409` | `ORDER_VERSION_CONFLICT` | Optimistic concurrency version mismatch |

## Audit & Compliance Management

Audit endpoints provide read-only access to immutable system change logs (`audit_audit_events`) and data access tracking logs (`audit_data_access_events`) for regulatory compliance (GDPR, SOC2, ISO 27001).

### Authorization

All audit endpoints require:
- Header: `Authorization: Bearer <token>`
- Permissions: `audit_read`

### Endpoints

#### 1. Search System Audit Events

```http
GET /api/audit/events?q=ACCOUNT&aggregateType=ACCOUNT&action=UPDATE&page=0&size=20
```

Response: `200 OK`

```json
{
  "items": [
    {
      "id": "70000000-0000-0000-0000-000000000001",
      "occurredAt": "2026-08-14T11:20:15Z",
      "schemaName": "crm",
      "tableName": "crm_opportunities",
      "aggregateType": "OPPORTUNITY",
      "aggregateId": "40000000-0000-0000-0000-000000000001",
      "action": "UPDATE",
      "changedFields": "[\"current_stage_id\", \"probability\"]",
      "actorUserId": "10000000-0000-0000-0000-000000000001",
      "actorType": "USER",
      "sourceIp": "118.70.12.89",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

#### 2. Get Single Audit Event by ID

```http
GET /api/audit/events/{id}
```

Response: `200 OK`

```json
{
  "id": "70000000-0000-0000-0000-000000000001",
  "occurredAt": "2026-08-14T11:20:15Z",
  "schemaName": "crm",
  "tableName": "crm_opportunities",
  "aggregateType": "OPPORTUNITY",
  "aggregateId": "40000000-0000-0000-0000-000000000001",
  "action": "UPDATE",
  "changedFields": "[\"current_stage_id\", \"probability\"]",
  "oldValues": "{\"probability\": 50}",
  "newValues": "{\"probability\": 80}",
  "actorUserId": "10000000-0000-0000-0000-000000000001",
  "actorType": "USER",
  "requestId": "80000000-0000-0000-0000-000000000001",
  "correlationId": null,
  "sourceIp": "118.70.12.89",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "applicationName": "CRM-Web"
}
```

#### 3. Search Data Access Events

```http
GET /api/audit/data-access?entityType=CUSTOMER_PII&accessType=EXPORT&page=0&size=20
```

Response: `200 OK`

```json
{
  "items": [
    {
      "id": "71000000-0000-0000-0000-000000000001",
      "occurredAt": "2026-08-14T10:00:00Z",
      "entityType": "CUSTOMER_PII",
      "entityId": "20000000-0000-0000-0000-000000000001",
      "accessType": "EXPORT",
      "fieldsAccessed": "[\"email\", \"phone_e164\", \"billing_address\"]",
      "actorUserId": "10000000-0000-0000-0000-000000000001",
      "actorType": "USER",
      "purpose": "Marketing Quarterly Report",
      "legalBasis": "LEGITIMATE_INTEREST",
      "sourceIp": "118.70.12.89",
      "userAgent": "Mozilla/5.0"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

#### 4. Get Single Data Access Event by ID

```http
GET /api/audit/data-access/{id}
```

Response: `200 OK`

### Audit Error Codes

| Status | Error Code | Reason |
| --- | --- | --- |
| `400` | `INVALID_PAYLOAD` | Validation violation on search parameters |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Missing `audit_read` permission |
| `404` | `AUDIT_EVENT_NOT_FOUND` | System audit event record does not exist |
| `404` | `DATA_ACCESS_EVENT_NOT_FOUND` | Data access event record does not exist |

## Activity Management

Activity endpoints manage CRM customer engagement activities such as Tasks, Phone Calls, Meetings, Emails, Demos, and Follow-ups.

### Authorization

All activity endpoints require:
- Header: `Authorization: Bearer <token>`
- Permissions:
  - `crm_activity.read` for `GET` endpoints
  - `crm_activity.write` for `POST`, `PUT`, `DELETE` endpoints

### Endpoints

#### 1. Create Activity

```http
POST /api/activities
Content-Type: application/json
```

Request Body:
```json
{
  "activityType": "TASK",
  "subject": "Follow up on proposal feedback",
  "description": "Call client CTO regarding architecture review questions",
  "direction": "OUTBOUND",
  "priority": "HIGH",
  "owner": {
    "ownerUserId": "10000000-0000-0000-0000-000000000001",
    "assignedTeamId": null
  },
  "scheduledStartAt": "2026-08-15T09:00:00Z",
  "scheduledEndAt": "2026-08-15T09:30:00Z",
  "durationSeconds": 1800,
  "outcomeCode": null,
  "externalReference": "CAL-9992",
  "recurrenceRule": null
}
```

Response: `201 Created`

#### 2. Get Activity by ID

```http
GET /api/activities/{id}
```

Response: `200 OK`

#### 3. Search / Filter Activities

```http
GET /api/activities?q=proposal&activityType=TASK&status=PLANNED&priority=HIGH&page=0&size=20
```

Response: `200 OK`

#### 4. Update Activity

```http
PUT /api/activities/{id}
Content-Type: application/json
```

Request Body:
```json
{
  "version": 1,
  "activityType": "TASK",
  "subject": "Follow up on proposal feedback (Rescheduled)",
  "description": "Call client CTO regarding architecture review questions",
  "direction": "OUTBOUND",
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "owner": {
    "ownerUserId": "10000000-0000-0000-0000-000000000001",
    "assignedTeamId": null
  },
  "scheduledStartAt": "2026-08-15T14:00:00Z",
  "scheduledEndAt": "2026-08-15T14:30:00Z",
  "durationSeconds": 1800,
  "outcomeCode": null,
  "externalReference": "CAL-9992",
  "recurrenceRule": null
}
```

Response: `200 OK`

#### 5. Complete Activity

```http
POST /api/activities/{id}/complete
If-Match: "1"
Content-Type: application/json
```

Request Body:
```json
{
  "outcomeCode": "CLIENT_ACCEPTED"
}
```

Response: `200 OK`

#### 6. Delete Activity

```http
DELETE /api/activities/{id}
If-Match: "1"
```

Response: `204 No Content`

### Activity Error Codes

| Status | Error Code | Reason |
| --- | --- | --- |
| `400` | `INVALID_PAYLOAD` | Validation violation on request payload fields |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Missing `crm_activity.read`/`write` permission or outside authorized data scope |
| `404` | `ACTIVITY_NOT_FOUND` | Activity ID does not exist or is outside data scope |
| `404` | `ACTIVITY_OWNER_INVALID` | Assigned user or team does not exist or is inactive |
| `409` | `ACTIVITY_VERSION_CONFLICT` | Optimistic concurrency version mismatch |

## OAuth2 Login








Google and Microsoft OIDC login are available only when the corresponding
provider has both a configured client ID and client secret.

### Entry points

```http
GET /oauth2/authorization/google
GET /oauth2/authorization/microsoft
```

Spring Security handles the provider callback at:

```text
/login/oauth2/code/{registrationId}
```

For example, the registration IDs are `google` and `microsoft`.

### Successful login flow

1. The provider authenticates the user.
2. The CRM validates required OIDC claims and the verified-email rule.
3. The CRM creates or loads the local identity.
4. The CRM creates a refresh session and writes `CRM_REFRESH_TOKEN`.
5. The temporary OAuth2 HTTP session is invalidated.
6. The browser redirects to the configured frontend success URI. Its local
   default is `http://localhost:3000/auth/callback`.
7. The frontend calls `POST /api/auth/refresh` with credentials included to
   receive an access token and a rotated refresh cookie.

The OAuth2 redirect does not place an access token in the URL or response JSON.

### Failure flow

OAuth2 failures redirect the browser to the configured frontend failure URI
with a stable `errorCode` query parameter. The local default is:

```text
http://localhost:3000/login?errorCode=OAUTH2_LOGIN_FAILED
```

Depending on the failure, the handler can redirect with one of these codes:

| `errorCode` | Meaning |
|---|---|
| `OAUTH2_LOGIN_FAILED` | Provider authentication or an unexpected OAuth2 processing step failed |
| `EXTERNAL_EMAIL_NOT_VERIFIED` | The provider email did not satisfy the verified-email rule |
| `SELF_REGISTRATION_DISABLED` | A new local identity was required while self-registration was disabled |
| `EXTERNAL_IDENTITY_LINK_REQUIRED` | The email already belongs to a local identity and explicit linking is required |
| `INVALID_CREDENTIALS` | The resolved local user is inactive or unavailable |

OAuth2 failures use browser redirects rather than the JSON `ProblemDetail`
contract described below.

## Error Responses

REST API failures use Spring `ProblemDetail` responses. The response normally
uses `application/problem+json` and contains the standard fields plus stable
CRM extensions:

| Field | Description |
|---|---|
| `type` | Problem type URI; defaults to `about:blank` when no specific type is assigned |
| `title` | Localized summary for the HTTP status |
| `status` | HTTP status code |
| `detail` | Localized explanation |
| `instance` | Request URI that failed |
| `errorCode` | Stable machine-readable CRM error code |
| `path` | Request path |
| `traceId` | Request trace identifier when available |
| `errors` | Field violations for request-validation failures |

Each item in `errors` contains:

| Field | Description |
|---|---|
| `field` | Invalid request field |
| `errorCode` | Stable field-level validation code |
| `message` | Localized validation message |

Example validation response:

```json
{
  "type": "about:blank",
  "title": "Invalid request",
  "status": 400,
  "detail": "Request data is invalid",
  "instance": "/api/auth/login",
  "errorCode": "REQUEST_VALIDATION_FAILED",
  "path": "/api/auth/login",
  "traceId": "request-example-123",
  "errors": [
    {
      "field": "email",
      "errorCode": "VALIDATION_EMAIL_INVALID",
      "message": "Email format is invalid"
    }
  ]
}
```

The exact `title`, `detail`, and validation `message` text depends on
`Accept-Language`. Use `status` and `errorCode` for application logic.

Common cross-endpoint codes include:

| Status | `errorCode` | Meaning |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | Request validation failed; inspect `errors` |
| `401` | `AUTHENTICATION_REQUIRED` | Authentication is missing or invalid |
| `403` | `ACCESS_DENIED` | The authenticated or cookie-based request is not allowed |
| `500` | `INTERNAL_ERROR` | An unexpected server error occurred |

Tenant-specific stable codes include:

| `errorCode` | Meaning |
|---|---|
| `TENANT_CODE_ALREADY_EXISTS` | A tenant already uses the requested tenant code |
| `TENANT_BOOTSTRAP_NOT_ALLOWED` | The current user already has a non-removed tenant membership |

## Maintenance Rules

Every API addition, modification, or removal must update this file in the same
task. Review all of the following against the implementation:

- HTTP method and route;
- request and response fields;
- validation constraints;
- authentication and authorization requirements;
- permission codes and data-scope behavior;
- headers, cookies, and CORS/origin behavior;
- status codes and response content types;
- side effects such as session creation, rotation, and revocation;
- stable error codes and validation errors;
- safe request, response, and command-line examples.

Document only implemented behavior. Do not describe planned endpoints,
planned permission checks, or future response fields as currently available.
Never put real credentials, tokens, signing keys, OAuth secrets, database
connection values, or personal data in this reference.
