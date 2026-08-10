# API Reference and Maintenance Design

## Context

The CRM application currently exposes authentication endpoints, OAuth2 login
flows, tenant-aware authorization, refresh-token cookies, localized error
responses, and request tracing. These contracts are implemented across Spring
controllers, security configuration, DTOs, validation annotations, cookie
configuration, and exception handling. There is no single document that shows
an API consumer how to call the implemented endpoints.

## Decision

Create one canonical English Markdown document at `docs/api-reference.md`.
Keep it synchronized with the source whenever an API is added, changed, or
removed. Add the maintenance requirement to `AGENTS.md` so future API work
updates the reference in the same task.

The Markdown reference is the human-readable integration guide. Java source
remains the authoritative implementation when a discrepancy is discovered.
The documentation must then be corrected as part of the same change.

## Scope

The initial reference will document only behavior already implemented:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- Google and Microsoft OAuth2 login entry points and callback behavior
- bearer access-token usage
- refresh-token cookie behavior
- tenant selection through `X-Tenant-ID`
- language and request-tracing headers
- RFC 9457-style `ProblemDetail` error responses used by the application

The reference will not describe planned business modules, speculative fields,
or endpoints that do not exist in the source.

## Document Structure

`docs/api-reference.md` will contain these sections:

1. **Purpose and source of truth**
2. **Environment and base URL**
3. **Common request conventions**
   - JSON media type
   - bearer token
   - refresh cookie
   - `X-Tenant-ID`
   - `Accept-Language`
   - `X-Request-ID`
4. **Authentication flow overview**
5. **Endpoint index**
6. **Detailed endpoint contracts**, with one subsection per endpoint
7. **OAuth2 login flows**
8. **Error response contract and known authentication error codes**
9. **Maintenance rules**

Each detailed endpoint contract will include:

- method and path
- purpose
- authentication and permission requirements
- required headers, cookies, path variables, and query parameters
- request body fields and validation constraints
- success status and response body
- cookie or session side effects
- endpoint-specific error codes
- a complete `curl` example when the endpoint is directly callable

Examples must use obvious placeholder values and must never contain real
passwords, access tokens, refresh tokens, OAuth client secrets, signing keys,
database credentials, or personal data.

## Authorization Documentation

The reference will distinguish authentication from authorization:

- the access token currently identifies the user and session but does not
  contain permissions;
- tenant context is selected with `X-Tenant-ID` and validated against active
  membership;
- permissions and data scopes are resolved from the database;
- a future endpoint must list its required permission code only when that
  requirement is enforced by the implementation.

This avoids documenting permissions that are planned but not yet active.

## Error Documentation

The common error section will describe the application `ProblemDetail` shape:

- `type`
- `title`
- `status`
- `detail`
- `instance`
- `errorCode`
- `path`
- `traceId`
- `errors` for validation failures

Endpoint sections will list stable error codes rather than duplicating
localized messages. Consumers may request Vietnamese or English messages with
`Accept-Language`.

## Maintenance Workflow

For every API addition, modification, or removal, the same task must update
`docs/api-reference.md`. The update must review the affected controller,
request and response DTOs, validation annotations, security rules, permission
checks, cookies, error codes, and status codes.

The `AGENTS.md` rule will require the following:

> Every API addition, modification, or removal must update
> `docs/api-reference.md` in the same task. Document only implemented behavior
> and keep examples, permissions, error codes, headers, cookies, validation
> constraints, and status codes synchronized with the source.

## Verification

Because this repository prohibits running tests unless explicitly authorized,
verification for this documentation task will be static:

- compare every documented route with controller mappings;
- compare request and response examples with DTO fields;
- compare constraints with validation annotations;
- compare access rules with security configuration and permission checks;
- compare error codes with the current error-code enums;
- scan documentation examples for secrets and real credentials;
- run Markdown and diff checks that do not start the application.

No build, application startup, API request, database request, or automated test
will be run for this task.

## Acceptance Criteria

- `docs/api-reference.md` exists and is written in English.
- All currently implemented authentication REST endpoints are documented.
- OAuth2 login behavior is documented separately from REST endpoints.
- Shared headers, cookies, JWT behavior, tenant selection, errors, and i18n are
  explained once and referenced consistently.
- Every directly callable REST endpoint has a safe example.
- No secret or real credential appears in the reference.
- `AGENTS.md` requires future API changes to update the reference.
- No unimplemented endpoint or permission is presented as available.
