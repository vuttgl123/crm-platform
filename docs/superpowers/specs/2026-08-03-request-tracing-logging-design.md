# Request Tracing and Logging Design

**Date:** 2026-08-03  
**Status:** Approved for implementation  
**Application:** `crm`

## Context

The CRM Spring Boot application currently relies on Spring Boot's default logging configuration and has one explicit SLF4J logger in `DatabaseHealthController`. The current output does not provide a stable request identifier, an application-owned rolling-file policy, or a concise HTTP completion record. This makes it difficult to connect an API failure reported by a client with the relevant controller, service, JDBC, and framework logs.

## Goals

- Keep local console logs concise, colored, and easy to scan.
- Write detailed logs to rolling files for later investigation.
- Attach one trace identifier to every log emitted during an HTTP request.
- Return the trace identifier to the client through `X-Request-ID`.
- Record HTTP metadata without recording sensitive request or response content.
- Preserve full exception stack traces in the file log.
- Avoid new logging dependencies.

## Non-Goals

- JSON or structured logging for ELK, Loki, or another centralized log platform.
- Request-body or response-body logging.
- Query-string, cookie, authorization-header, token, or password logging.
- Hibernate SQL or JDBC bind-parameter logging.
- A new global API error-response contract.
- MDC propagation to asynchronous executors; the current application uses synchronous Spring MVC request handling.

## Selected Approach

Use Spring Boot's existing SLF4J and Logback stack with:

1. A custom `logback-spring.xml` containing console and rolling-file appenders.
2. A `RequestTracingFilter` based on `OncePerRequestFilter`.
3. MDC key `traceId` for request correlation.
4. Registration of the tracing filter inside the Spring Security filter chain.
5. Environment-overridable log path and log levels in `application.yaml`.

This approach provides readable local output and reliable trace correlation without adding an encoder, agent, or external logging service.

## Components

### `logback-spring.xml`

The Logback configuration will define:

- A `CONSOLE` appender with Spring Boot colors, abbreviated logger names, level, thread, trace ID, message, and stack trace.
- A `ROLLING_FILE` appender writing to `${logging.file.path}/crm.log`.
- A size-and-time rolling policy writing compressed archives to `${logging.file.path}/archive/crm.YYYY-MM-DD.N.log.gz`.
- A maximum archive size of 100 MB per file.
- A retention period of 14 days.
- A total archive size cap of 2 GB.
- Archive cleanup when logging starts.
- UTF-8 output for both appenders.

Console pattern:

```text
HH:mm:ss.SSS LEVEL [trace=<traceId>] abbreviated.logger - message
```

File pattern:

```text
ISO-8601 timestamp LEVEL [application] [thread] [traceId=<traceId>] fully.qualified.Logger - message
```

Logs outside an HTTP request will use `SYSTEM` as the trace value.

### `RequestTracingFilter`

The filter will:

- Read `X-Request-ID` from the incoming request.
- Accept the supplied value only when it contains 1 to 64 characters from `[A-Za-z0-9._-]`.
- Generate a UUID when the header is absent or invalid.
- Add `X-Request-ID` to the response before continuing the filter chain.
- Place the accepted or generated value in MDC under `traceId`.
- Record request start time using a monotonic clock.
- Execute the remaining security and MVC filter chain.
- Resolve the authenticated principal when available, otherwise use `anonymous`.
- Log method, request URI, response status, duration, remote address, and principal.
- Remove only the MDC values owned by this filter in a `finally` block.

The filter will not log query strings, bodies, cookies, request headers, or response headers.

### Spring Security Registration

`SecurityConfig` will register `RequestTracingFilter` immediately after `SecurityContextHolderFilter`. This placement gives the trace ID to authentication, authorization, controller, service, JDBC, and downstream framework logs while allowing the completion log to resolve the authenticated principal before the security context is cleared.

The filter will not be declared as a servlet filter bean, which avoids accidental double registration outside the Spring Security chain.

### Application Configuration

`application.yaml` will retain the existing datasource and JPA blocks unchanged and add:

- `logging.config: classpath:logback-spring.xml`
- `logging.file.path`, defaulting to `logs` and overridable through `LOG_PATH`
- Root level, defaulting to `INFO` and overridable through `ROOT_LOG_LEVEL`
- Application level for `com.crm`, defaulting to `INFO` and overridable through `APP_LOG_LEVEL`
- Explicitly disabled Hibernate SQL and bind-parameter categories

No database credential will be copied into the logging configuration or emitted in logs.

## Request Data Flow

1. An HTTP request enters the Spring Security chain.
2. `SecurityContextHolderFilter` prepares the security context.
3. `RequestTracingFilter` validates or generates `traceId`, adds it to MDC, and returns it through the response header.
4. Authentication, authorization, controller, service, JDBC, and framework code execute with the same MDC trace ID.
5. The filter calculates duration and obtains response status and principal.
6. The filter logs one completion record at the level derived from the status.
7. The filter removes its MDC state before the request thread is reused.

## Log Levels

- `DEBUG`: optional request-start records and detailed development diagnostics; disabled by the default `INFO` application level.
- `INFO`: completed HTTP requests with `2xx` or `3xx` status and important business events.
- `WARN`: completed HTTP requests with `4xx` status, recoverable failures, and explicitly handled service degradation.
- `ERROR`: completed HTTP requests with `5xx` status and unhandled exceptions.

Spring, Spring Security, Hibernate, Tomcat, and Hikari use the root `INFO` level unless a more specific level is required later. SQL statements and JDBC parameter binding remain disabled.

## Error Handling

When an exception escapes the downstream filter chain, `RequestTracingFilter` will log one `ERROR` record containing request metadata and the full stack trace, then rethrow the same exception so existing Spring behavior remains unchanged. The completion path will still record the final request outcome without writing a second stack trace.

Exceptions intentionally handled by a controller remain the controller's responsibility. The filter records only the resulting HTTP status and request metadata. Application code should avoid logging an exception and rethrowing it at every layer because that produces duplicate stack traces.

`DatabaseHealthController` will replace Supabase-specific response and log text with database-neutral or MySQL-specific wording so the diagnostic message matches the active datasource.

## Security and Data Minimization

- Incoming request IDs are validated before entering MDC to prevent multiline log injection.
- Request and response bodies are never read by the logging filter.
- Query strings are excluded because they may contain user-provided or sensitive values.
- Authorization, cookie, datasource password, access token, refresh token, API key, and private-key values are never logged.
- Only `request.getRemoteAddr()` is used for the client address. Untrusted forwarding headers are not interpreted automatically.
- The authenticated principal is logged as a correlation attribute; credentials and authorities are not logged.

## Files to Change

- Create `crm/src/main/resources/logback-spring.xml`.
- Create `crm/src/main/java/com/crm/logging/RequestTracingFilter.java`.
- Update `crm/src/main/java/com/crm/config/SecurityConfig.java` to register the tracing filter.
- Update `crm/src/main/resources/application.yaml` with logging properties while preserving all datasource comments and active MySQL configuration.
- Update `crm/src/main/java/com/crm/health/DatabaseHealthController.java` to remove obsolete Supabase wording.

## Static Verification Only

Repository instructions prohibit running tests, starting the application, or connecting to the database unless the user explicitly overrides that rule. Implementation verification is therefore limited to:

- Reading the final Java, XML, and YAML files.
- Checking XML and YAML structure without starting Spring Boot.
- Inspecting imports, package names, filter registration, MDC cleanup, and configuration references.
- Searching for duplicate filter registration and accidental request-body, token, or password logging.

No test, build, application startup, database connection, commit, push, or pull request will be performed.

## Acceptance Criteria

- Every synchronous HTTP request receives a valid trace ID.
- The response includes the trace ID in `X-Request-ID`.
- Application logs created during request processing include the same trace ID.
- Console output is concise and colored.
- File output contains detailed timestamp, thread, logger, trace ID, message, and exception information.
- Log files roll daily or at 100 MB, retain 14 days, and never exceed a 2 GB archive cap.
- HTTP completion logs contain only method, URI path, status, duration, remote address, and principal.
- Sensitive headers, bodies, query strings, credentials, and SQL bind parameters are not logged.
- The active MySQL and commented PostgreSQL datasource configurations remain intact.
