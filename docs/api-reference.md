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

The default allowed browser origin is `http://localhost:3000`. CORS allows
credentials and the request headers documented above. Refresh and logout also
apply explicit origin validation because they authenticate with a cookie. See
their endpoint sections for details.

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

## Authentication Endpoints

### Register a local user

```http
POST /api/auth/register
```

This is a public endpoint. Self-registration is disabled in the default local
configuration and must be explicitly enabled before this call can create a
user.

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
