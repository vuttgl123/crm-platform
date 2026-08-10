# API Reference Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create one English API integration reference for every implemented
CRM endpoint and require future API changes to keep it synchronized.

**Architecture:** `docs/api-reference.md` will be the canonical human-readable
integration guide, while Java controllers, DTOs, security configuration, and
error codes remain the implementation source of truth. `AGENTS.md` will make
updating the reference part of every API addition, modification, or removal.

**Tech Stack:** Markdown, Spring Boot 4 MVC contracts, Spring Security OAuth2,
JWT, RFC 9457-style `ProblemDetail`, RTK-assisted static inspection.

## Global Constraints

- Write the API reference in English.
- Document only behavior implemented in the current source.
- Never include real passwords, tokens, OAuth secrets, signing keys, database
  credentials, or personal data in examples.
- Keep permissions, validation, headers, cookies, status codes, and error codes
  synchronized with implementation.
- Do not run tests, builds, the application, API requests, or database requests.
- Do not stage or commit any file.
- Use `apply_patch` for edits and RTK for supported static inspection.

---

### Task 1: Make API Documentation a Repository Rule

**Files:**

- Modify: `AGENTS.md`
- Reference: `docs/superpowers/specs/2026-08-04-api-reference-maintenance-design.md`

**Interfaces:**

- Consumes: the approved maintenance workflow in the design spec.
- Produces: a repository-wide rule that every future API task must update
  `docs/api-reference.md`.

- [ ] **Step 1: Add the API documentation rule**

Add this section after `### 4. Do Not Run Tests` and before the skill catalog:

```markdown
### 5. Keep the API Reference Synchronized

- Every API addition, modification, or removal must update
  `docs/api-reference.md` in the same task.
- Document only implemented behavior. Keep examples, authentication,
  permissions, error codes, headers, cookies, validation constraints, request
  and response fields, and status codes synchronized with the source.
- Derive the contract from controllers, DTOs, validation annotations, security
  configuration, permission checks, cookie configuration, and error-code
  definitions.
- Never place real credentials, access tokens, refresh tokens, OAuth secrets,
  signing keys, database connection values, or personal data in API examples.
```

- [ ] **Step 2: Inspect the inserted rule**

Run:

```bash
rtk grep -n "Keep the API Reference|docs/api-reference.md|Document only implemented" AGENTS.md
```

Expected static evidence: the new section heading and maintenance requirements
appear once in `AGENTS.md`.

---

### Task 2: Create the Authentication API Reference

**Files:**

- Create: `docs/api-reference.md`
- Reference: `crm/src/main/java/com/crm/identity/presentation/web/AuthenticationController.java`
- Reference: `crm/src/main/java/com/crm/identity/presentation/web/RegisterRequest.java`
- Reference: `crm/src/main/java/com/crm/identity/presentation/web/LoginRequest.java`
- Reference: `crm/src/main/java/com/crm/identity/presentation/web/AccessTokenResponse.java`
- Reference: `crm/src/main/java/com/crm/identity/presentation/web/MeResponse.java`
- Reference: `crm/src/main/java/com/crm/identity/presentation/web/UserResponse.java`
- Reference: `crm/src/main/java/com/crm/identity/presentation/web/RefreshTokenCookie.java`
- Reference: `crm/src/main/java/com/crm/identity/infrastructure/security/AuthCookieOriginFilter.java`
- Reference: `crm/src/main/java/com/crm/identity/presentation/web/OAuth2LoginSuccessHandler.java`
- Reference: `crm/src/main/java/com/crm/identity/presentation/web/OAuth2LoginFailureHandler.java`
- Reference: `crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java`
- Reference: `crm/src/main/java/com/crm/identity/infrastructure/security/OAuth2ClientConfiguration.java`
- Reference: `crm/src/main/java/com/crm/identity/infrastructure/security/JwtAccessTokenIssuer.java`
- Reference: `crm/src/main/java/com/crm/foundation/web/error/ApiProblemFactory.java`
- Reference: `crm/src/main/java/com/crm/foundation/web/error/CommonErrorCode.java`
- Reference: `crm/src/main/java/com/crm/identity/domain/AuthenticationErrorCode.java`

**Interfaces:**

- Consumes: the live authentication HTTP, security, cookie, JWT, validation,
  and error contracts.
- Produces: `docs/api-reference.md`, the canonical human-readable API guide.

- [ ] **Step 1: Write the document introduction and common conventions**

Create `docs/api-reference.md` with these top-level sections in this order:

```markdown
# CRM API Reference

## Purpose and Source of Truth
## Environment and Base URL
## Common Request Conventions
## Authentication Flow
## Endpoint Index
## Authentication Endpoints
## OAuth2 Login
## Error Responses
## Maintenance Rules
```

State these exact current conventions:

- local base URL: `http://localhost:8080`;
- JSON requests use `Content-Type: application/json`;
- protected endpoints use `Authorization: Bearer <access-token>`;
- the access token contains identity and session claims but no permissions;
- permissions and data scopes are resolved from the database for the current
  user and tenant;
- `X-Tenant-ID` selects tenant context and must contain a valid UUID when sent;
- `Accept-Language` supports English and Vietnamese error details;
- a valid `X-Request-ID` contains 1-64 letters, digits, dots, underscores, or
  hyphens; otherwise the server generates a UUID;
- the response exposes `X-Request-ID`;
- the default refresh cookie is `CRM_REFRESH_TOKEN`, `HttpOnly`, scoped to
  `/api/auth`, `SameSite=Lax`, and not secure in the local default configuration;
- access tokens expire after 15 minutes by default;
- refresh tokens expire after 30 days by default and rotate on refresh.

- [ ] **Step 2: Add the endpoint index**

Add this endpoint inventory:

| Method | Path | Authentication | Success |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `201 Created` |
| `POST` | `/api/auth/login` | Public | `200 OK` |
| `POST` | `/api/auth/refresh` | Refresh cookie | `200 OK` |
| `POST` | `/api/auth/logout` | Refresh cookie optional | `204 No Content` |
| `GET` | `/api/auth/me` | Bearer access token | `200 OK` |

- [ ] **Step 3: Document registration**

Document `POST /api/auth/register` with:

- public access;
- `email`: required, valid email, maximum 320 characters;
- `password`: required, 12-128 characters;
- `displayName`: required, maximum 255 characters;
- `201 Created` with the shared access-token response;
- a rotated refresh token written as the HttpOnly cookie;
- `400 REQUEST_VALIDATION_FAILED` for invalid fields;
- `403 SELF_REGISTRATION_DISABLED` when registration is disabled;
- `409 EMAIL_ALREADY_REGISTERED` when the email already exists.

Use this safe request example:

```json
{
  "email": "alex@example.test",
  "password": "ExampleOnly-Password-123",
  "displayName": "Alex Example"
}
```

Include this complete call example:

```bash
curl --request POST \
  --header "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --data '{"email":"alex@example.test","password":"ExampleOnly-Password-123","displayName":"Alex Example"}' \
  http://localhost:8080/api/auth/register
```

- [ ] **Step 4: Document login**

Document `POST /api/auth/login` with:

- public access;
- `email`: required, valid email, maximum 320 characters;
- `password`: required, maximum 128 characters;
- `200 OK` with the shared access-token response;
- a refresh token written as the HttpOnly cookie;
- `400 REQUEST_VALIDATION_FAILED` for invalid fields;
- `401 INVALID_CREDENTIALS` for unknown users, invalid passwords, inactive
  users, or temporarily locked users.

Use `alex@example.test` and `ExampleOnly-Password-123` in the request example.
Include this complete call example:

```bash
curl --request POST \
  --header "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --data '{"email":"alex@example.test","password":"ExampleOnly-Password-123"}' \
  http://localhost:8080/api/auth/login
```

- [ ] **Step 5: Document refresh and logout**

For `POST /api/auth/refresh`, document:

- no JSON request body;
- the refresh token is read from `CRM_REFRESH_TOKEN`;
- when an `Origin` header is present, it must match an allowed origin or the
  request's own origin;
- `200 OK` returns a new access token and rotates the refresh cookie;
- `403 ACCESS_DENIED` when a supplied origin is malformed or not allowed;
- `401 INVALID_REFRESH_TOKEN` for missing, malformed, expired, revoked, or
  otherwise unusable refresh tokens;
- `401 REFRESH_TOKEN_REUSED` when reuse is detected; the session is revoked.

For `POST /api/auth/logout`, document:

- the refresh cookie is optional;
- the same optional `Origin` validation as the refresh endpoint;
- a matching session is revoked when the cookie is valid;
- the cookie is cleared even when no cookie is supplied;
- `403 ACCESS_DENIED` when a supplied origin is malformed or not allowed;
- success is `204 No Content` with an empty body.

Include `curl` examples that use a cookie jar:

```bash
curl --request POST \
  --cookie cookies.txt \
  --cookie-jar cookies.txt \
  http://localhost:8080/api/auth/refresh
```

```bash
curl --request POST \
  --cookie cookies.txt \
  --cookie-jar cookies.txt \
  http://localhost:8080/api/auth/logout
```

- [ ] **Step 6: Document the current identity endpoint**

Document `GET /api/auth/me` with:

- `Authorization: Bearer <access-token>` required;
- no permission claim is read from the JWT;
- `200 OK` returns `user` and active `tenants`;
- each user contains `id`, `email`, and `displayName`;
- each tenant contains `tenantId`, `tenantCode`, `displayName`, and
  `tenantAdmin`;
- `401 AUTHENTICATION_REQUIRED` when the bearer token is missing or invalid;
- `401 INVALID_CREDENTIALS` when the token subject no longer resolves to an
  active user;
- `403 ACCESS_DENIED` when an optional `X-Tenant-ID` is malformed or does not
  identify an active membership.

Include this complete call example:

```bash
curl --request GET \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  http://localhost:8080/api/auth/me
```

- [ ] **Step 7: Define the shared success response**

Use this safe response example for register, login, and refresh:

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

Explicitly state that the refresh token is never returned in JSON.

- [ ] **Step 8: Document Google and Microsoft OAuth2 flows**

Document these framework-provided entry points when the provider is configured:

- `GET /oauth2/authorization/google`
- `GET /oauth2/authorization/microsoft`
- callback: `/login/oauth2/code/{registrationId}`

Describe the implemented success flow exactly:

1. the provider authenticates the user;
2. the CRM validates required OIDC claims and the verified email rule;
3. the CRM creates or loads the local identity;
4. the CRM creates a refresh session and writes the refresh cookie;
5. the temporary OAuth2 HTTP session is invalidated;
6. the browser redirects to `http://localhost:3000/auth/callback` by default;
7. the frontend calls `POST /api/auth/refresh` with the cookie to receive an
   access token.

Describe failure as a redirect to the default frontend login URL:

```text
http://localhost:3000/login?errorCode=OAUTH2_LOGIN_FAILED
```

List the possible stable OAuth2-related error codes:

- `OAUTH2_LOGIN_FAILED`
- `EXTERNAL_EMAIL_NOT_VERIFIED`
- `SELF_REGISTRATION_DISABLED`
- `EXTERNAL_IDENTITY_LINK_REQUIRED`
- `INVALID_CREDENTIALS`

- [ ] **Step 9: Document the common error contract**

Document these `ProblemDetail` fields:

- `type`, `title`, `status`, `detail`, `instance`;
- `errorCode`, `path`, `traceId`;
- `errors` for validation failures, with `field`, `errorCode`, and `message`.

Use a safe validation example with HTTP status `400`, error code
`REQUEST_VALIDATION_FAILED`, path `/api/auth/login`, and a generated example
trace ID. State that `detail` and validation messages are localized through
`Accept-Language`, while `errorCode` remains stable.

- [ ] **Step 10: Add the maintenance section**

State that every implemented API change must update the same reference and
must re-check routes, DTO fields, validation, authentication, permission codes,
headers, cookies, status codes, side effects, error codes, and examples. State
that unimplemented APIs and planned permission checks must not be documented as
available.

---

### Task 3: Perform Static Contract Verification

**Files:**

- Inspect: `AGENTS.md`
- Inspect: `docs/api-reference.md`
- Inspect: the Java references listed in Task 2

**Interfaces:**

- Consumes: the maintenance rule and completed API reference.
- Produces: static evidence that the documentation matches the current source
  without running the application or tests.

- [ ] **Step 1: Compare the documented endpoint inventory with controllers**

Run:

```bash
rtk grep -n "@(RequestMapping|GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)" crm/src/main/java
```

Expected static evidence: the five documented `/api/auth` REST mappings are the
only controller endpoints currently implemented.

- [ ] **Step 2: Compare DTOs and validation constraints**

Run:

```bash
rtk grep -n "record |@NotBlank|@Email|@Size" crm/src/main/java/com/crm/identity/presentation/web
```

Expected static evidence: documented request fields, response fields, and
validation constraints match the records and annotations.

- [ ] **Step 3: Compare security, cookies, and error codes**

Run:

```bash
rtk grep -n "permitAll|authenticated|COOKIE_PATH|claim\(|ErrorCode" crm/src/main/java/com/crm
```

Expected static evidence: public and protected routes, cookie path, JWT claims,
and stable error codes agree with the reference.

- [ ] **Step 4: Inspect the final documentation diff**

Run:

```bash
rtk git diff -- AGENTS.md docs/api-reference.md
git diff --check -- AGENTS.md docs/api-reference.md
```

Expected static evidence: only the intended documentation and instruction
changes appear, and `git diff --check` exits with code 0.

- [ ] **Step 5: Record intentionally skipped runtime verification**

Do not run Maven, tests, application startup, API calls, OAuth2 login, or
database checks. Report that verification was limited to static source and diff
inspection because the repository explicitly prohibits tests unless the user
overrides that rule.
