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
and `X-Request-ID`. Refresh and logout also apply explicit origin validation
because they authenticate with a cookie. See their endpoint sections for
details.

The current CORS header allowlist does not include `If-Match`. Consequently,
the Account delete endpoint can be called by same-origin or non-browser
clients, but a cross-origin browser client cannot send its required `If-Match`
header until that allowlist is extended.

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
| `POST` | `/api/accounts` | Bearer token, tenant, `crm_account.write` | `201 Created` |
| `GET` | `/api/accounts/{id}` | Bearer token, tenant, `crm_account.read` | `200 OK` |
| `GET` | `/api/accounts` | Bearer token, tenant, `crm_account.read` | `200 OK` |
| `PUT` | `/api/accounts/{id}` | Bearer token, tenant, `crm_account.write` | `200 OK` |
| `DELETE` | `/api/accounts/{id}` | Bearer token, tenant, `crm_account.write` | `204 No Content` |

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
