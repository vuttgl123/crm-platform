# API Error Internationalization and Database Health Removal Design

**Status:** Approved  
**Date:** 2026-08-03  
**Scope:** API error contract, Vietnamese and English localization, and removal of the temporary database health API

## 1. Context

The CRM application already centralizes REST error handling under
`com.crm.foundation.web.error` and returns Spring `ProblemDetail` responses.
The current implementation exposes a custom `code` property, but its titles,
details, validation messages, authentication messages, and authorization
messages are hard-coded in English.

The application also contains a temporary database connectivity endpoint under
`com.crm.foundation.health`. That endpoint was useful while datasource setup was
being explored, but it is not part of the target Pragmatic DDD foundation and
must now be removed.

## 2. Goals

- Keep Spring `ProblemDetail` as the standard REST error representation.
- Expose a stable `errorCode` that clients can process independently of the
  selected language.
- Localize all client-visible error text in Vietnamese and English.
- Select the language from the HTTP `Accept-Language` header.
- Use Vietnamese when the requested language is absent or unsupported.
- Localize domain, request validation, authentication, authorization, and
  unexpected-system errors consistently.
- Return a stable error code and localized message for every field validation
  violation.
- Keep localization concerns out of the domain model.
- Remove the temporary database health controller, response, service, and its
  public Spring Security rule.

## 3. Non-goals

- Persisting translations in the database.
- Providing an administration interface for translations.
- Translating application logs or exception stack traces.
- Allowing arbitrary runtime locales beyond Vietnamese and English.
- Adding a custom locale query parameter or cookie.
- Redesigning authentication or authorization behavior.
- Removing Spring Boot Actuator or changing its configuration.
- Running tests, builds, the application, APIs, or database connections as part
  of this change, in accordance with the repository rules.

## 4. Chosen Approach

The application will keep RFC-compatible Spring `ProblemDetail` responses and
replace the custom `code` property with `errorCode`. A Spring `MessageSource`
will resolve client-visible messages at the web boundary. Error codes remain
stable across languages and message wording may evolve without changing the API
contract.

This approach is preferred over a custom error DTO because it preserves the
standard response format already used by the application. It is preferred over
database-backed translations because resource bundles are simpler, versioned
with the source code, and sufficient for the two required languages.

## 5. Error Contract

### 5.1 General error

The response retains the standard `ProblemDetail` fields and adds three custom
properties:

- `errorCode`: stable machine-readable identifier in upper snake case.
- `path`: request path that produced the error.
- `traceId`: request trace identifier used to correlate the response with logs.

Example:

```json
{
  "type": "about:blank",
  "title": "Không thể xử lý yêu cầu",
  "status": 422,
  "detail": "Email khách hàng đã tồn tại",
  "instance": "/api/customers",
  "errorCode": "CUSTOMER_EMAIL_ALREADY_EXISTS",
  "path": "/api/customers",
  "traceId": "5e1dc0b6-2e34-45a1-993f-06390651bf72"
}
```

`errorCode`, HTTP status, and response structure do not change when the caller
switches languages. Only `title`, `detail`, and nested validation messages are
localized.

### 5.2 Validation error

A request validation failure uses the top-level error code
`REQUEST_VALIDATION_FAILED` and contains an `errors` array. Each array element
contains:

- `field`: rejected field or property path.
- `errorCode`: stable validation error identifier.
- `message`: localized description of that individual violation.

Example:

```json
{
  "type": "about:blank",
  "title": "Yêu cầu không hợp lệ",
  "status": 400,
  "detail": "Dữ liệu gửi lên không hợp lệ",
  "instance": "/api/customers",
  "errorCode": "REQUEST_VALIDATION_FAILED",
  "path": "/api/customers",
  "traceId": "5e1dc0b6-2e34-45a1-993f-06390651bf72",
  "errors": [
    {
      "field": "email",
      "errorCode": "VALIDATION_EMAIL_INVALID",
      "message": "Email không đúng định dạng"
    }
  ]
}
```

Validation items are sorted by field and then by error code so repeated
responses remain deterministic.

## 6. Error Code Model

### 6.1 Shared contract

The shared kernel will define a framework-neutral error-code contract. It will
carry:

- the externally exposed code value;
- the resource-bundle message key.

It must not reference Spring, HTTP status types, locale resolution, or message
bundles. Bounded contexts may define their own enums implementing this contract,
which avoids one ever-growing central catalog.

### 6.2 Common codes

The foundation web layer will define the small set of cross-cutting codes it
owns, including:

- `REQUEST_VALIDATION_FAILED`
- `VALIDATION_INVALID`
- `VALIDATION_REQUIRED`
- `VALIDATION_SIZE_INVALID`
- `VALIDATION_EMAIL_INVALID`
- `ACCESS_DENIED`
- `AUTHENTICATION_REQUIRED`
- `INTERNAL_ERROR`

Specific bounded contexts will own business codes such as
`CUSTOMER_EMAIL_ALREADY_EXISTS` when those contexts are introduced.

### 6.3 Domain exceptions

Domain exceptions will expose an error-code contract and optional message
arguments. They will not resolve a localized string. The web exception handler
will pass the message key and arguments to the translator using the request
locale.

The existing domain exception subclasses continue to determine the HTTP status
at the web boundary:

- resource not found: `404 Not Found`;
- business-rule violation: `422 Unprocessable Entity`;
- conflict or invalid state transition: `409 Conflict`;
- unclassified domain error: `500 Internal Server Error`.

## 7. Localization

### 7.1 Resource bundles

Translations will be versioned in:

- `messages.properties`: Vietnamese fallback catalog;
- `messages_vi.properties`: explicit Vietnamese catalog;
- `messages_en.properties`: English catalog.

Every supported error message key must exist in all three files. The fallback
catalog mirrors Vietnamese deliberately so direct resolution without an
explicit locale remains predictable.

### 7.2 Locale selection

Spring's request locale resolution will inspect `Accept-Language` and support
only `vi` and `en`. Vietnamese is used when:

- the header is missing;
- no supported locale matches;
- the requested language is otherwise invalid.

Region variants such as `vi-VN`, `en-US`, and `en-GB` resolve to their supported
base language.

### 7.3 Message resolution

A dedicated translator component will be the only foundation service that
interacts with `MessageSource`. It accepts an error-code contract, optional
arguments, and a locale, then returns the localized text.

Missing message keys must not leak a Spring exception or bundle key to the
client. They fall back to a safe localized internal-error message and are
logged with the error code for maintainers.

## 8. Validation Mapping

The global handler will map standard Bean Validation failures to stable error
codes. The initial mapping is:

- `NotNull`, `NotBlank`, and `NotEmpty` -> `VALIDATION_REQUIRED`;
- `Email` -> `VALIDATION_EMAIL_INVALID`;
- `Size`, `Length` -> `VALIDATION_SIZE_INVALID`;
- all other constraints -> `VALIDATION_INVALID`.

The field name remains data, not part of the translation key. Constraint
arguments such as minimum and maximum lengths may be passed into localized
message templates.

Both `MethodArgumentNotValidException` and `ConstraintViolationException` use
the same nested validation response contract.

## 9. Authentication, Authorization, and Unexpected Errors

- Unauthenticated requests return `AUTHENTICATION_REQUIRED` with status `401`.
- Forbidden requests return `ACCESS_DENIED` with status `403`.
- Unexpected exceptions return `INTERNAL_ERROR` with status `500`.

Authentication and authorization failures that occur inside the Spring
Security filter chain will be delegated to Spring MVC's
`HandlerExceptionResolver`. This ensures they reach the same global exception
handler as controller-layer failures and receive the same localized
`ProblemDetail`, stable error code, path, and trace ID contract.

Unexpected exception details are logged server-side with the active trace ID.
The response contains only a safe localized message and never exposes stack
traces, SQL errors, credentials, tokens, or internal exception messages.

## 10. Database Health Removal

The following runtime elements will be removed:

- `com.crm.foundation.health.DatabaseHealthController`;
- `com.crm.foundation.health.DatabaseHealthResponse`;
- `com.crm.foundation.health.DatabaseHealthService`;
- the `/api/health/database` public matcher in `SecurityConfig`.

No replacement database-connectivity endpoint will be added. Spring Boot
Actuator remains available under its existing configuration, but this change
does not add or expose any Actuator endpoint.

The current Pragmatic DDD structure specification and foundation plan will be
updated so they no longer present database health as part of the target
foundation. Older Supabase and logging design records remain unchanged as
historical documents.

## 11. Package Layout

```text
com.crm
├── foundation
│   ├── config
│   │   ├── InternationalizationConfig
│   │   └── SecurityConfig
│   └── web
│       └── error
│           ├── ApiProblemFactory
│           ├── CommonErrorCode
│           ├── ErrorMessageTranslator
│           ├── FieldViolation
│           └── GlobalExceptionHandler
└── sharedkernel
    └── domain
        └── exception
            ├── ErrorCode
            ├── DomainException
            └── existing domain exception subclasses
```

The `foundation.health` package will no longer exist.

## 12. Static Verification Strategy

Repository rules prohibit running tests, builds, the application, APIs, and
database connections. Completion evidence will therefore be limited to static
inspection:

- every `ProblemDetail` path uses `errorCode`, not the old custom `code` field;
- Vietnamese and English bundles contain identical message-key sets;
- no hard-coded client-visible English messages remain in the global handler;
- validation responses include field, error code, and localized message;
- the shared-kernel error contract has no Spring, Jakarta, HTTP, or foundation
  dependency;
- database health classes, package references, endpoint path, and security
  matcher are absent from runtime source;
- current DDD documentation no longer describes database health as retained
  foundation behavior;
- no credentials or datasource connection strings are displayed during review.

Runtime compilation and localization behavior remain for the user to verify.

## 13. Acceptance Criteria

- A Vietnamese request receives Vietnamese `title`, `detail`, and validation
  messages.
- An English request receives English `title`, `detail`, and validation
  messages.
- Missing or unsupported language selection falls back to Vietnamese.
- The same failure returns the same `errorCode` in both languages.
- Every validation item includes `field`, `errorCode`, and `message`.
- Domain code does not import Spring localization or web types.
- Unexpected errors expose no sensitive internal details.
- `/api/health/database` and its supporting runtime classes no longer exist.
- The application contains no public security exception for the removed
  database health endpoint.
- No tests, build, runtime process, database call, staging, commit, push, merge,
  or pull request is performed by the agent.
