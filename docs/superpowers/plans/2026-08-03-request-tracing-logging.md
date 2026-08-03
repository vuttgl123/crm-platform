# Request Tracing and Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task in the current session. Do not dispatch subagents unless the user explicitly authorizes multi-agent work.

**Goal:** Add concise colored console logging, detailed rolling-file logging, and a validated request trace ID shared by all synchronous HTTP logs.

**Architecture:** Logback owns output formatting and retention. A plain `OncePerRequestFilter` owns request ID validation, MDC lifecycle, HTTP completion metadata, and exception-boundary logging; Spring Security registers it after `SecurityContextHolderFilter` so authentication remains available when the completion record is created.

**Tech Stack:** Java 21, Spring Boot 4.0.7, Spring MVC, Spring Security, SLF4J 2, Logback, YAML, XML.

## Global Constraints

- Use existing Spring Boot logging dependencies; add no new dependency.
- Write console logs and rolling files under `${LOG_PATH:logs}`.
- Roll files daily or at 100 MB, retain 14 days, and cap archives at 2 GB.
- Accept `X-Request-ID` only when it matches `[A-Za-z0-9._-]{1,64}`; otherwise generate a UUID.
- Log method, URI path, status, duration, remote address, and principal only.
- Never log query strings, bodies, cookies, authorization headers, credentials, tokens, or SQL bind parameters.
- Preserve the active MySQL datasource and commented PostgreSQL datasource blocks.
- Do not add a global exception handler or change the API error contract.
- Do not run tests, builds, the application, or database connections.
- Do not stage, commit, push, merge, or create a pull request.
- Verification is limited to read-only static inspection with RTK-preferred commands.

## File Structure

- Create `crm/src/main/resources/logback-spring.xml`: console/file patterns, appenders, level bindings, and rolling policy.
- Create `crm/src/main/java/com/crm/logging/RequestTracingFilter.java`: trace ID, MDC, HTTP metadata, status-based levels, and exception logging.
- Modify `crm/src/main/java/com/crm/config/SecurityConfig.java`: register the tracing filter inside the security chain.
- Modify `crm/src/main/resources/application.yaml`: add logging path and level properties without changing datasource configuration.
- Modify `crm/src/main/java/com/crm/health/DatabaseHealthController.java`: replace obsolete Supabase-specific diagnostic text with database-neutral text.

---

### Task 1: Configure Console and Rolling-File Logging

**Files:**

- Create: `crm/src/main/resources/logback-spring.xml`
- Modify: `crm/src/main/resources/application.yaml`

**Interfaces:**

- Consumes: `spring.application.name`, `logging.file.path`, `logging.level.root`, and `logging.level.com.crm`.
- Produces: MDC-aware console/file patterns and the `logs/crm.log` rolling-file lifecycle.

- [ ] **Step 1: Create the complete Logback configuration**

Create `crm/src/main/resources/logback-spring.xml` with this content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
	<include resource="org/springframework/boot/logging/logback/defaults.xml"/>

	<springProperty scope="context" name="APPLICATION_NAME"
					source="spring.application.name" defaultValue="crm"/>
	<springProperty scope="context" name="LOG_PATH"
					source="logging.file.path" defaultValue="logs"/>
	<springProperty scope="context" name="ROOT_LOG_LEVEL"
					source="logging.level.root" defaultValue="INFO"/>
	<springProperty scope="context" name="APPLICATION_LOG_LEVEL"
					source="logging.level.com.crm" defaultValue="INFO"/>

	<property name="CONSOLE_LOG_PATTERN"
			  value="%clr(%d{HH:mm:ss.SSS}){faint} %clr(%-5level) %clr([trace=%X{traceId:-SYSTEM}]){cyan} %clr(%logger{36}){blue} - %msg%n%wEx"/>
	<property name="FILE_LOG_PATTERN"
			  value="%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX} %-5level [${APPLICATION_NAME}] [%thread] [traceId=%X{traceId:-SYSTEM}] %logger - %msg%n%wEx"/>

	<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
		<encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
			<charset>UTF-8</charset>
			<pattern>${CONSOLE_LOG_PATTERN}</pattern>
		</encoder>
	</appender>

	<appender name="ROLLING_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
		<file>${LOG_PATH}/${APPLICATION_NAME}.log</file>
		<encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
			<charset>UTF-8</charset>
			<pattern>${FILE_LOG_PATTERN}</pattern>
		</encoder>
		<rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
			<fileNamePattern>${LOG_PATH}/archive/${APPLICATION_NAME}.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
			<maxFileSize>100MB</maxFileSize>
			<maxHistory>14</maxHistory>
			<totalSizeCap>2GB</totalSizeCap>
			<cleanHistoryOnStart>true</cleanHistoryOnStart>
		</rollingPolicy>
	</appender>

	<logger name="com.crm" level="${APPLICATION_LOG_LEVEL}"/>
	<logger name="org.hibernate.SQL" level="OFF"/>
	<logger name="org.hibernate.orm.jdbc.bind" level="OFF"/>

	<root level="${ROOT_LOG_LEVEL}">
		<appender-ref ref="CONSOLE"/>
		<appender-ref ref="ROLLING_FILE"/>
	</root>
</configuration>
```

- [ ] **Step 2: Add logging properties without touching datasource values**

Append this root-level block after the existing `spring` block in `crm/src/main/resources/application.yaml`:

```yaml
logging:
  config: classpath:logback-spring.xml
  file:
    path: ${LOG_PATH:logs}
  level:
    root: ${ROOT_LOG_LEVEL:INFO}
    com.crm: ${APP_LOG_LEVEL:INFO}
    org.hibernate.SQL: OFF
    org.hibernate.orm.jdbc.bind: OFF
```

- [ ] **Step 3: Statically inspect configuration references**

Use `rtk read` to confirm that:

- XML property sources exactly match the YAML property names.
- Both appenders use UTF-8.
- Both appenders include `traceId` with `SYSTEM` fallback.
- Archive path, 100 MB size, 14-day history, and 2 GB cap match the approved design.
- Datasource URLs, usernames, passwords, drivers, and JPA dialects were not changed.

Do not start Spring Boot or run a Logback test.

---

### Task 2: Add Request Trace Correlation

**Files:**

- Create: `crm/src/main/java/com/crm/logging/RequestTracingFilter.java`

**Interfaces:**

- Consumes: request header `X-Request-ID`, `HttpServletRequest`, `HttpServletResponse`, `SecurityContextHolder`, and the downstream `FilterChain`.
- Produces: response header `X-Request-ID`, MDC key `traceId`, status-based completion logs, and one stack trace for an escaping exception.
- Class: `public final class RequestTracingFilter extends OncePerRequestFilter`.
- Constants: `public static final String REQUEST_ID_HEADER` and private MDC/validation constants.

- [ ] **Step 1: Create the complete tracing filter**

Create `crm/src/main/java/com/crm/logging/RequestTracingFilter.java` with this content:

```java
package com.crm.logging;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public final class RequestTracingFilter extends OncePerRequestFilter {

	public static final String REQUEST_ID_HEADER = "X-Request-ID";

	private static final Logger LOGGER = LoggerFactory.getLogger(RequestTracingFilter.class);
	private static final String TRACE_ID_MDC_KEY = "traceId";
	private static final String ANONYMOUS_USER = "anonymous";
	private static final Pattern VALID_REQUEST_ID = Pattern.compile("[A-Za-z0-9._-]{1,64}");

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
			FilterChain filterChain) throws ServletException, IOException {
		String traceId = resolveTraceId(request.getHeader(REQUEST_ID_HEADER));
		long startedAt = System.nanoTime();
		boolean exceptionLogged = false;

		response.setHeader(REQUEST_ID_HEADER, traceId);

		try (MDC.MDCCloseable ignored = MDC.putCloseable(TRACE_ID_MDC_KEY, traceId)) {
			LOGGER.debug("HTTP request started method={} uri={}", request.getMethod(),
					sanitizeForLog(request.getRequestURI(), 1024));

			try {
				filterChain.doFilter(request, response);
			}
			catch (IOException | ServletException | RuntimeException exception) {
				exceptionLogged = true;
				long durationMillis = elapsedMillis(startedAt);
				LOGGER.error("HTTP request failed method={} uri={} durationMs={} ip={} user={}",
						request.getMethod(), sanitizeForLog(request.getRequestURI(), 1024),
						durationMillis, sanitizeForLog(request.getRemoteAddr(), 128),
						resolvePrincipal(), exception);
				throw exception;
			}
			finally {
				int status = exceptionLogged
						? HttpServletResponse.SC_INTERNAL_SERVER_ERROR
						: response.getStatus();
				logCompletion(request, status, elapsedMillis(startedAt));
			}
		}
	}

	private static String resolveTraceId(String candidate) {
		if (candidate != null && VALID_REQUEST_ID.matcher(candidate).matches()) {
			return candidate;
		}
		return UUID.randomUUID().toString();
	}

	private static long elapsedMillis(long startedAt) {
		return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);
	}

	private static String resolvePrincipal() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			return ANONYMOUS_USER;
		}
		return sanitizeForLog(authentication.getName(), 128);
	}

	private static String sanitizeForLog(String value, int maxLength) {
		if (value == null || value.isBlank()) {
			return "-";
		}
		String singleLineValue = value.replace('\r', '_').replace('\n', '_');
		return singleLineValue.length() <= maxLength
				? singleLineValue
				: singleLineValue.substring(0, maxLength);
	}

	private static void logCompletion(HttpServletRequest request, int status,
			long durationMillis) {
		String method = request.getMethod();
		String uri = sanitizeForLog(request.getRequestURI(), 1024);
		String remoteAddress = sanitizeForLog(request.getRemoteAddr(), 128);
		String principal = resolvePrincipal();
		String message = "HTTP {} {} -> {} ({} ms) ip={} user={}";

		if (status >= HttpServletResponse.SC_INTERNAL_SERVER_ERROR) {
			LOGGER.error(message, method, uri, status, durationMillis, remoteAddress, principal);
		}
		else if (status >= HttpServletResponse.SC_BAD_REQUEST) {
			LOGGER.warn(message, method, uri, status, durationMillis, remoteAddress, principal);
		}
		else {
			LOGGER.info(message, method, uri, status, durationMillis, remoteAddress, principal);
		}
	}

}
```

- [ ] **Step 2: Statically inspect security and lifecycle behavior**

Use `rtk read` and `rtk grep` to confirm that:

- The request ID regex is exactly `[A-Za-z0-9._-]{1,64}`.
- Invalid and absent request IDs generate UUID values.
- Only the URI path is read; `getQueryString`, bodies, cookies, and request headers other than `X-Request-ID` are never read.
- The response header is written before the downstream chain executes.
- MDC is closed by try-with-resources on every normal and exceptional path.
- An escaping exception is rethrown unchanged after one stack-trace log.
- Completion level is `INFO` below 400, `WARN` from 400 through 499, and `ERROR` from 500.

Do not compile or execute the filter.

---

### Task 3: Register the Filter in Spring Security

**Files:**

- Modify: `crm/src/main/java/com/crm/config/SecurityConfig.java`

**Interfaces:**

- Consumes: `RequestTracingFilter` from Task 2 and Spring Security's `SecurityContextHolderFilter`.
- Produces: exactly one tracing filter instance inside the Spring Security filter chain.

- [ ] **Step 1: Replace `SecurityConfig` with the complete registered configuration**

Use this complete content:

```java
package com.crm.config;

import com.crm.logging.RequestTracingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers("/api/health/database").permitAll()
						.anyRequest().authenticated())
				.httpBasic(Customizer.withDefaults())
				.addFilterAfter(new RequestTracingFilter(), SecurityContextHolderFilter.class)
				.build();
	}

}
```

- [ ] **Step 2: Statically rule out duplicate registration**

Use `rtk grep` to confirm that `RequestTracingFilter`:

- Is instantiated exactly once in `SecurityConfig`.
- Has no `@Component`, `@Bean`, `FilterRegistrationBean`, or servlet registration annotation.
- Is registered after `SecurityContextHolderFilter`.

Do not start the security filter chain.

---

### Task 4: Correct Database Health Diagnostic Text

**Files:**

- Modify: `crm/src/main/java/com/crm/health/DatabaseHealthController.java`

**Interfaces:**

- Consumes: existing `DatabaseHealthService` and `DatabaseHealthResponse` behavior.
- Produces: database-neutral success, warning, and failure messages; endpoint status codes remain unchanged.

- [ ] **Step 1: Replace obsolete Supabase wording only**

Keep the controller structure unchanged and use this complete content:

```java
package com.crm.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health/database")
public class DatabaseHealthController {

	private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseHealthController.class);

	private final DatabaseHealthService databaseHealthService;

	public DatabaseHealthController(DatabaseHealthService databaseHealthService) {
		this.databaseHealthService = databaseHealthService;
	}

	@GetMapping
	public ResponseEntity<DatabaseHealthResponse> checkConnection() {
		try {
			if (databaseHealthService.isConnected()) {
				return ResponseEntity.ok(
						new DatabaseHealthResponse("UP", "Connected to database"));
			}
		}
		catch (DataAccessException exception) {
			LOGGER.warn("Database connection check failed", exception);
		}

		return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
				.body(new DatabaseHealthResponse("DOWN", "Cannot connect to database"));
	}

}
```

- [ ] **Step 2: Statically confirm API behavior is unchanged**

Use `rtk read` to confirm that:

- Endpoint path remains `/api/health/database`.
- Success remains HTTP 200 with status `UP`.
- Failure remains HTTP 503 with status `DOWN`.
- `DataAccessException` remains handled and logged with its stack trace.
- No Supabase-specific diagnostic wording remains in active Java code.

Do not call the endpoint or database.

---

### Task 5: Perform Final Static Review

**Files:**

- Read: `crm/src/main/resources/logback-spring.xml`
- Read: `crm/src/main/resources/application.yaml`
- Read: `crm/src/main/java/com/crm/logging/RequestTracingFilter.java`
- Read: `crm/src/main/java/com/crm/config/SecurityConfig.java`
- Read: `crm/src/main/java/com/crm/health/DatabaseHealthController.java`

**Interfaces:**

- Consumes: all deliverables from Tasks 1 through 4.
- Produces: an evidence-backed static handoff without test, build, runtime, database, or Git mutation claims.

- [ ] **Step 1: Parse XML and YAML without starting Spring**

Use read-only standard-library parsers to confirm that `logback-spring.xml` is well-formed XML and `application.yaml` is valid YAML. Ensure any displayed YAML output redacts active and commented passwords.

- [ ] **Step 2: Inspect the complete implementation with RTK**

Use `rtk read`, `rtk grep`, and `rtk diff` to check:

- All five planned files exist and contain the approved configuration.
- `traceId` is consistent between Java and XML.
- `X-Request-ID` is consistent between request and response logic.
- Filter registration exists exactly once.
- Rolling limits are 100 MB, 14 days, and 2 GB.
- Datasource blocks are preserved.
- No request/response body, query-string, cookie, authorization, token, credential, or SQL bind logging was added.

- [ ] **Step 3: Report the static evidence and explicit omissions**

Report changed files, logging behavior, trace behavior, and static inspection results. Explicitly state that no test, build, application startup, database connection, staging, commit, push, merge, or pull request was performed.
