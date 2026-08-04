# API Error i18n and Database Health Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Do not delegate unless the user explicitly authorizes subagents.

**Goal:** Add stable API error codes with Vietnamese and English localization, localize field validation errors, and remove the temporary database health API.

**Architecture:** Keep Spring `ProblemDetail` at the HTTP boundary. Domain exceptions carry a framework-neutral `ErrorCode` and message arguments; the foundation web layer resolves those codes through Spring `MessageSource` using an `Accept-Language` locale resolver restricted to Vietnamese and English. Database health runtime code and its security exception are removed without changing datasource or Actuator configuration.

**Tech Stack:** Java 21, Spring Boot 4.0.7, Spring MVC, Spring Security, Jakarta Validation, Spring `MessageSource`, SLF4J, Maven.

## Global Constraints

- Support exactly Vietnamese (`vi`) and English (`en`).
- Use Vietnamese when `Accept-Language` is missing, invalid, or unsupported.
- Keep `errorCode` stable across locales and use upper snake case values.
- Keep Spring, Jakarta, HTTP, locale resolution, and message bundles out of the shared-kernel error contract.
- Localize domain, validation, authentication, authorization, and unexpected-error responses.
- Never expose stack traces, SQL errors, credentials, tokens, internal exception messages, or bundle keys in an API response.
- Remove `/api/health/database`, its three supporting Java classes, and its public Spring Security matcher.
- Do not change datasource configuration, Logback configuration, dependencies, or Actuator configuration.
- Use `apply_patch` for source and documentation edits.
- Prefer RTK for read-only inspection and never display datasource secrets.
- Do not run tests, builds, the application, APIs, or database connections.
- Do not stage, commit, push, merge, or create a pull request.
- Use only read-only static verification.

## File Structure

### Create

- `crm/src/main/java/com/crm/sharedkernel/domain/exception/ErrorCode.java`: framework-neutral error-code contract.
- `crm/src/main/java/com/crm/foundation/config/InternationalizationConfig.java`: supported locales, Vietnamese fallback, and message-source configuration.
- `crm/src/main/java/com/crm/foundation/web/error/CommonErrorCode.java`: foundation-owned error codes and bundle keys.
- `crm/src/main/java/com/crm/foundation/web/error/ErrorMessageTranslator.java`: safe message lookup and missing-key fallback.
- `crm/src/main/resources/messages.properties`: Vietnamese fallback messages.
- `crm/src/main/resources/messages_vi.properties`: explicit Vietnamese messages.
- `crm/src/main/resources/messages_en.properties`: English messages.

### Modify

- `crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainException.java`: carry `ErrorCode` and message arguments.
- `crm/src/main/java/com/crm/sharedkernel/domain/exception/BusinessRuleViolation.java`: accept the shared error-code contract.
- `crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainResourceNotFound.java`: accept the shared error-code contract.
- `crm/src/main/java/com/crm/sharedkernel/domain/exception/InvalidStateTransition.java`: accept the shared error-code contract.
- `crm/src/main/java/com/crm/sharedkernel/domain/exception/ResourceConflict.java`: accept the shared error-code contract.
- `crm/src/main/java/com/crm/foundation/web/error/FieldViolation.java`: expose field, error code, and localized message.
- `crm/src/main/java/com/crm/foundation/web/error/ApiProblemFactory.java`: create localized `ProblemDetail` objects with `errorCode`.
- `crm/src/main/java/com/crm/foundation/web/error/GlobalExceptionHandler.java`: resolve locale, domain codes, and deterministic validation errors.
- `crm/src/main/java/com/crm/foundation/config/SecurityConfig.java`: remove the database-health public matcher and route filter-chain 401/403 failures through the MVC exception resolver.
- `docs/superpowers/specs/2026-08-03-pragmatic-ddd-project-structure-design.md`: remove database health from the target foundation.
- `docs/superpowers/plans/2026-08-03-pragmatic-ddd-foundation.md`: remove the obsolete database-health task and references.

### Delete

- `crm/src/main/java/com/crm/foundation/health/DatabaseHealthController.java`
- `crm/src/main/java/com/crm/foundation/health/DatabaseHealthResponse.java`
- `crm/src/main/java/com/crm/foundation/health/DatabaseHealthService.java`

---

### Task 1: Introduce the Framework-Neutral Error-Code Contract

**Files:**

- Create: `crm/src/main/java/com/crm/sharedkernel/domain/exception/ErrorCode.java`
- Modify: `crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainException.java`
- Modify: `crm/src/main/java/com/crm/sharedkernel/domain/exception/BusinessRuleViolation.java`
- Modify: `crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainResourceNotFound.java`
- Modify: `crm/src/main/java/com/crm/sharedkernel/domain/exception/InvalidStateTransition.java`
- Modify: `crm/src/main/java/com/crm/sharedkernel/domain/exception/ResourceConflict.java`

**Interfaces:**

- Produces: `ErrorCode.value(): String` for the external API code.
- Produces: `ErrorCode.messageKey(): String` for bundle resolution at the web boundary.
- Produces: `DomainException.errorCode(): ErrorCode`.
- Produces: `DomainException.messageArguments(): Object[]` as a defensive copy.
- Preserves: exception subclass type as the input to HTTP-status mapping.

- [ ] **Step 1: Create the error-code contract**

Create `ErrorCode.java`:

```java
package com.crm.sharedkernel.domain.exception;

public interface ErrorCode {

	String value();

	String messageKey();

}
```

- [ ] **Step 2: Replace string code and pre-rendered message in `DomainException`**

Replace `DomainException.java` with:

```java
package com.crm.sharedkernel.domain.exception;

import java.util.Objects;
import java.util.regex.Pattern;

public abstract class DomainException extends RuntimeException {

	private static final Pattern ERROR_CODE_PATTERN =
			Pattern.compile("[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*");

	private final ErrorCode errorCode;
	private final Object[] messageArguments;

	protected DomainException(ErrorCode errorCode, Object... messageArguments) {
		super(requireErrorCode(errorCode).value());
		this.errorCode = errorCode;
		this.messageArguments = messageArguments == null
				? new Object[0]
				: messageArguments.clone();
	}

	public final ErrorCode errorCode() {
		return errorCode;
	}

	public final Object[] messageArguments() {
		return messageArguments.clone();
	}

	private static ErrorCode requireErrorCode(ErrorCode errorCode) {
		ErrorCode required = Objects.requireNonNull(errorCode,
				"errorCode must not be null");
		if (required.value() == null
				|| !ERROR_CODE_PATTERN.matcher(required.value()).matches()) {
			throw new IllegalArgumentException(
					"errorCode value must use upper snake case");
		}
		if (required.messageKey() == null || required.messageKey().isBlank()) {
			throw new IllegalArgumentException("messageKey must not be blank");
		}
		return required;
	}

}
```

The exception's inherited message is the stable code value. It is suitable for
safe diagnostics but is never sent directly to the API client.

- [ ] **Step 3: Update all four concrete exception constructors**

Use this exact constructor shape in each subclass:

```java
public BusinessRuleViolation(ErrorCode errorCode, Object... messageArguments) {
	super(errorCode, messageArguments);
}
```

```java
public DomainResourceNotFound(ErrorCode errorCode, Object... messageArguments) {
	super(errorCode, messageArguments);
}
```

```java
public InvalidStateTransition(ErrorCode errorCode, Object... messageArguments) {
	super(errorCode, messageArguments);
}
```

```java
public ResourceConflict(ErrorCode errorCode, Object... messageArguments) {
	super(errorCode, messageArguments);
}
```

All four classes remain `final` and in
`com.crm.sharedkernel.domain.exception`.

- [ ] **Step 4: Perform the shared-kernel static boundary check**

Run read-only inspection:

```bash
rtk grep -n "org.springframework|jakarta|com.crm.foundation|HttpStatus|Locale|MessageSource" crm/src/main/java/com/crm/sharedkernel
rtk grep -n "String code, String message|exception.code\(\)" crm/src/main/java
rtk read crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainException.java
```

Expected evidence:

- The first two searches return no matches.
- `DomainException` returns defensive copies of message arguments.
- No HTTP or localization dependency has entered `sharedkernel`.

---

### Task 2: Configure Supported Locales and Translation Catalogs

**Files:**

- Create: `crm/src/main/java/com/crm/foundation/config/InternationalizationConfig.java`
- Create: `crm/src/main/java/com/crm/foundation/web/error/CommonErrorCode.java`
- Create: `crm/src/main/java/com/crm/foundation/web/error/ErrorMessageTranslator.java`
- Create: `crm/src/main/resources/messages.properties`
- Create: `crm/src/main/resources/messages_vi.properties`
- Create: `crm/src/main/resources/messages_en.properties`

**Interfaces:**

- Consumes: `ErrorCode.value()` and `ErrorCode.messageKey()` from Task 1.
- Produces: a `LocaleResolver` restricted to `vi` and `en`, defaulting to `vi`.
- Produces: a UTF-8 `MessageSource` named `messages` with system-locale fallback disabled.
- Produces: `ErrorMessageTranslator.translate(ErrorCode, Object[], Locale): String`.
- Produces: `ErrorMessageTranslator.translateKey(String, Locale): String`.

- [ ] **Step 1: Create the internationalization configuration**

Create `InternationalizationConfig.java`:

```java
package com.crm.foundation.config;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

@Configuration
public class InternationalizationConfig {

	private static final Locale VIETNAMESE = Locale.forLanguageTag("vi");

	@Bean
	LocaleResolver localeResolver() {
		AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
		resolver.setSupportedLocales(List.of(VIETNAMESE, Locale.ENGLISH));
		resolver.setDefaultLocale(VIETNAMESE);
		return resolver;
	}

	@Bean
	MessageSource messageSource() {
		ResourceBundleMessageSource source = new ResourceBundleMessageSource();
		source.setBasename("messages");
		source.setDefaultEncoding(StandardCharsets.UTF_8.name());
		source.setFallbackToSystemLocale(false);
		source.setUseCodeAsDefaultMessage(false);
		return source;
	}

}
```

The language-only supported locales allow region variants such as `vi-VN`,
`en-US`, and `en-GB` to resolve to their supported base language.

- [ ] **Step 2: Define the foundation-owned common codes**

Create `CommonErrorCode.java`:

```java
package com.crm.foundation.web.error;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum CommonErrorCode implements ErrorCode {

	REQUEST_VALIDATION_FAILED(
			"REQUEST_VALIDATION_FAILED", "error.request.validation_failed"),
	VALIDATION_INVALID("VALIDATION_INVALID", "validation.invalid"),
	VALIDATION_REQUIRED("VALIDATION_REQUIRED", "validation.required"),
	VALIDATION_SIZE_INVALID(
			"VALIDATION_SIZE_INVALID", "validation.size_invalid"),
	VALIDATION_EMAIL_INVALID(
			"VALIDATION_EMAIL_INVALID", "validation.email_invalid"),
	ACCESS_DENIED("ACCESS_DENIED", "error.access_denied"),
	AUTHENTICATION_REQUIRED(
			"AUTHENTICATION_REQUIRED", "error.authentication_required"),
	INTERNAL_ERROR("INTERNAL_ERROR", "error.internal");

	private final String value;
	private final String messageKey;

	CommonErrorCode(String value, String messageKey) {
		this.value = value;
		this.messageKey = messageKey;
	}

	@Override
	public String value() {
		return value;
	}

	@Override
	public String messageKey() {
		return messageKey;
	}

}
```

- [ ] **Step 3: Create the safe translation boundary**

Create `ErrorMessageTranslator.java`:

```java
package com.crm.foundation.web.error;

import java.util.Locale;
import java.util.Objects;

import com.crm.sharedkernel.domain.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

@Component
public final class ErrorMessageTranslator {

	private static final Logger LOGGER =
			LoggerFactory.getLogger(ErrorMessageTranslator.class);
	private static final Object[] NO_ARGUMENTS = new Object[0];
	private static final String INTERNAL_ERROR_KEY = "error.internal";
	private static final String LAST_RESORT_MESSAGE =
			"Đã xảy ra lỗi không mong muốn";

	private final MessageSource messageSource;

	public ErrorMessageTranslator(MessageSource messageSource) {
		this.messageSource = messageSource;
	}

	public String translate(ErrorCode errorCode, Object[] arguments,
			Locale locale) {
		ErrorCode requiredCode = Objects.requireNonNull(errorCode,
				"errorCode must not be null");
		return resolve(requiredCode.messageKey(), arguments, locale,
				requiredCode.value());
	}

	public String translateKey(String messageKey, Locale locale) {
		return resolve(messageKey, NO_ARGUMENTS, locale, messageKey);
	}

	private String resolve(String messageKey, Object[] arguments, Locale locale,
			String reference) {
		String requiredKey = Objects.requireNonNull(messageKey,
				"messageKey must not be null");
		Locale requiredLocale = Objects.requireNonNull(locale,
				"locale must not be null");
		Object[] safeArguments = arguments == null
				? NO_ARGUMENTS
				: arguments.clone();
		String translated = messageSource.getMessage(requiredKey, safeArguments,
				null, requiredLocale);
		if (translated != null) {
			return translated;
		}

		LOGGER.error("Missing i18n message reference={} messageKey={}",
				reference, requiredKey);
		if (INTERNAL_ERROR_KEY.equals(requiredKey)) {
			return LAST_RESORT_MESSAGE;
		}
		return messageSource.getMessage(INTERNAL_ERROR_KEY, NO_ARGUMENTS,
				LAST_RESORT_MESSAGE, requiredLocale);
	}

}
```

Do not log `arguments`; domain message arguments may contain client data.

- [ ] **Step 4: Create the Vietnamese fallback and explicit Vietnamese catalogs**

Use this exact content in both `messages.properties` and
`messages_vi.properties`:

```properties
problem.title.bad_request=Yêu cầu không hợp lệ
problem.title.unauthorized=Cần xác thực
problem.title.forbidden=Truy cập bị từ chối
problem.title.not_found=Không tìm thấy tài nguyên
problem.title.conflict=Xung đột dữ liệu
problem.title.unprocessable_entity=Không thể xử lý yêu cầu
problem.title.internal_server_error=Lỗi hệ thống
error.request.validation_failed=Dữ liệu gửi lên không hợp lệ
validation.invalid=Giá trị không hợp lệ
validation.required=Trường này là bắt buộc
validation.size_invalid=Độ dài giá trị không hợp lệ
validation.email_invalid=Email không đúng định dạng
error.access_denied=Bạn không có quyền thực hiện thao tác này
error.authentication_required=Bạn cần đăng nhập để tiếp tục
error.internal=Đã xảy ra lỗi không mong muốn
```

- [ ] **Step 5: Create the English catalog**

Use this exact content in `messages_en.properties`:

```properties
problem.title.bad_request=Invalid request
problem.title.unauthorized=Authentication required
problem.title.forbidden=Access denied
problem.title.not_found=Resource not found
problem.title.conflict=Data conflict
problem.title.unprocessable_entity=Unable to process request
problem.title.internal_server_error=System error
error.request.validation_failed=Request data is invalid
validation.invalid=Value is invalid
validation.required=This field is required
validation.size_invalid=Value length is invalid
validation.email_invalid=Email format is invalid
error.access_denied=You do not have permission to perform this operation
error.authentication_required=You must sign in to continue
error.internal=An unexpected error occurred
```

- [ ] **Step 6: Perform static catalog and configuration checks**

Run:

```bash
rtk grep -n "VIETNAMESE|Locale.ENGLISH|setDefaultLocale|setSupportedLocales|setFallbackToSystemLocale" crm/src/main/java/com/crm/foundation/config/InternationalizationConfig.java
rtk read crm/src/main/resources/messages.properties
rtk read crm/src/main/resources/messages_vi.properties
rtk read crm/src/main/resources/messages_en.properties
rtk grep -n "arguments" crm/src/main/java/com/crm/foundation/web/error/ErrorMessageTranslator.java
```

Expected evidence:

- Only Vietnamese and English are configured.
- The fallback locale is Vietnamese.
- All three catalogs contain the same 15 keys.
- Translator logging includes only the stable reference and message key, never
  the message-argument array.

---

### Task 3: Build the Localized `ProblemDetail` Factory

**Files:**

- Modify: `crm/src/main/java/com/crm/foundation/web/error/FieldViolation.java`
- Modify: `crm/src/main/java/com/crm/foundation/web/error/ApiProblemFactory.java`

**Interfaces:**

- Consumes: `CommonErrorCode`, `ErrorCode`, and `ErrorMessageTranslator` from Tasks 1 and 2.
- Produces: `FieldViolation(String field, String errorCode, String message)`.
- Produces: `ApiProblemFactory.create(HttpStatus, ErrorCode, HttpServletRequest, Locale): ProblemDetail`.
- Produces: `ApiProblemFactory.create(HttpStatus, ErrorCode, Object[], HttpServletRequest, Locale): ProblemDetail`.
- Produces: `ApiProblemFactory.createValidationProblem(List<FieldViolation>, HttpServletRequest, Locale): ProblemDetail`.

- [ ] **Step 1: Expand the validation item contract**

Replace `FieldViolation.java` with:

```java
package com.crm.foundation.web.error;

import java.util.Objects;

public record FieldViolation(String field, String errorCode, String message) {

	public FieldViolation {
		field = requireText(field, "field");
		errorCode = requireText(errorCode, "errorCode");
		message = requireText(message, "message");
	}

	private static String requireText(String value, String name) {
		String required = Objects.requireNonNull(value,
				name + " must not be null");
		if (required.isBlank()) {
			throw new IllegalArgumentException(name + " must not be blank");
		}
		return required;
	}

}
```

- [ ] **Step 2: Replace `ApiProblemFactory` with localized construction**

Use this implementation:

```java
package com.crm.foundation.web.error;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import jakarta.servlet.http.HttpServletRequest;
import com.crm.sharedkernel.domain.exception.ErrorCode;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

@Component
public final class ApiProblemFactory {

	private static final String TRACE_ID_MDC_KEY = "traceId";
	private static final String SYSTEM_TRACE_ID = "SYSTEM";
	private static final Object[] NO_ARGUMENTS = new Object[0];

	private final ErrorMessageTranslator translator;

	public ApiProblemFactory(ErrorMessageTranslator translator) {
		this.translator = translator;
	}

	public ProblemDetail create(HttpStatus status, ErrorCode errorCode,
			HttpServletRequest request, Locale locale) {
		return create(status, errorCode, NO_ARGUMENTS, request, locale);
	}

	public ProblemDetail create(HttpStatus status, ErrorCode errorCode,
			Object[] messageArguments, HttpServletRequest request, Locale locale) {
		HttpStatus requiredStatus = Objects.requireNonNull(status,
				"status must not be null");
		ErrorCode requiredCode = Objects.requireNonNull(errorCode,
				"errorCode must not be null");
		HttpServletRequest requiredRequest = Objects.requireNonNull(request,
				"request must not be null");
		Locale requiredLocale = Objects.requireNonNull(locale,
				"locale must not be null");

		ProblemDetail problem = ProblemDetail.forStatusAndDetail(requiredStatus,
				translator.translate(requiredCode, messageArguments,
						requiredLocale));
		problem.setTitle(translator.translateKey(titleKey(requiredStatus),
				requiredLocale));
		problem.setInstance(URI.create(requiredRequest.getRequestURI()));
		problem.setProperty("errorCode", requiredCode.value());
		problem.setProperty("path", requiredRequest.getRequestURI());
		problem.setProperty("traceId", currentTraceId());
		return problem;
	}

	public ProblemDetail createValidationProblem(
			List<FieldViolation> violations, HttpServletRequest request,
			Locale locale) {
		ProblemDetail problem = create(HttpStatus.BAD_REQUEST,
				CommonErrorCode.REQUEST_VALIDATION_FAILED, request, locale);
		problem.setProperty("errors", List.copyOf(violations));
		return problem;
	}

	private static String titleKey(HttpStatus status) {
		return switch (status) {
			case BAD_REQUEST -> "problem.title.bad_request";
			case UNAUTHORIZED -> "problem.title.unauthorized";
			case FORBIDDEN -> "problem.title.forbidden";
			case NOT_FOUND -> "problem.title.not_found";
			case CONFLICT -> "problem.title.conflict";
			case UNPROCESSABLE_ENTITY ->
					"problem.title.unprocessable_entity";
			default -> "problem.title.internal_server_error";
		};
	}

	private static String currentTraceId() {
		String traceId = MDC.get(TRACE_ID_MDC_KEY);
		return traceId == null || traceId.isBlank()
				? SYSTEM_TRACE_ID
				: traceId;
	}

}
```

- [ ] **Step 3: Perform a static API-contract check**

Run:

```bash
rtk grep -n "setProperty\(\"code\"|setProperty\(\"errorCode\"|setTitle|setInstance|traceId|errors" crm/src/main/java/com/crm/foundation/web/error
rtk read crm/src/main/java/com/crm/foundation/web/error/FieldViolation.java
```

Expected evidence:

- The old custom property `code` has zero matches.
- `errorCode`, `path`, and `traceId` are set for every problem.
- Validation items expose exactly `field`, `errorCode`, and `message`.

---

### Task 4: Localize Domain, Validation, Authentication, and Authorization Errors

**Files:**

- Modify: `crm/src/main/java/com/crm/foundation/web/error/GlobalExceptionHandler.java`

**Interfaces:**

- Consumes: `DomainException.errorCode()` and `DomainException.messageArguments()`.
- Consumes: `ErrorMessageTranslator.translate(ErrorCode, Object[], Locale)`.
- Consumes: localized `ApiProblemFactory` methods from Task 3.
- Produces: deterministic validation arrays sorted by field and error code.
- Produces: stable error codes for all controlled error paths.

- [ ] **Step 1: Replace the global handler with locale-aware behavior**

Replace `GlobalExceptionHandler.java` with:

```java
package com.crm.foundation.web.error;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.DomainException;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.InvalidStateTransition;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public final class GlobalExceptionHandler {

	private static final Logger LOGGER =
			LoggerFactory.getLogger(GlobalExceptionHandler.class);
	private static final Comparator<FieldViolation> VIOLATION_ORDER =
			Comparator.comparing(FieldViolation::field)
					.thenComparing(FieldViolation::errorCode);
	private static final Object[] NO_ARGUMENTS = new Object[0];

	private final ApiProblemFactory problemFactory;
	private final ErrorMessageTranslator translator;

	public GlobalExceptionHandler(ApiProblemFactory problemFactory,
			ErrorMessageTranslator translator) {
		this.problemFactory = problemFactory;
		this.translator = translator;
	}

	@ExceptionHandler(DomainException.class)
	public ResponseEntity<ProblemDetail> handleDomainException(
			DomainException exception, HttpServletRequest request) {
		HttpStatus status = statusFor(exception);
		return ResponseEntity.status(status)
				.body(problemFactory.create(status, exception.errorCode(),
						exception.messageArguments(), request, currentLocale()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ProblemDetail> handleMethodArgumentNotValid(
			MethodArgumentNotValidException exception,
			HttpServletRequest request) {
		Locale locale = currentLocale();
		List<FieldViolation> violations = exception.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(error -> toFieldViolation(error, locale))
				.sorted(VIOLATION_ORDER)
				.toList();
		return ResponseEntity.badRequest()
				.body(problemFactory.createValidationProblem(violations, request,
						locale));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ProblemDetail> handleConstraintViolation(
			ConstraintViolationException exception,
			HttpServletRequest request) {
		Locale locale = currentLocale();
		List<FieldViolation> violations = exception.getConstraintViolations()
				.stream()
				.map(violation -> toFieldViolation(violation, locale))
				.sorted(VIOLATION_ORDER)
				.toList();
		return ResponseEntity.badRequest()
				.body(problemFactory.createValidationProblem(violations, request,
						locale));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ProblemDetail> handleAccessDenied(
			AccessDeniedException exception, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(problemFactory.create(HttpStatus.FORBIDDEN,
						CommonErrorCode.ACCESS_DENIED, request, currentLocale()));
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ProblemDetail> handleAuthentication(
			AuthenticationException exception, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(problemFactory.create(HttpStatus.UNAUTHORIZED,
						CommonErrorCode.AUTHENTICATION_REQUIRED, request,
						currentLocale()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ProblemDetail> handleUnexpectedException(
			Exception exception, HttpServletRequest request) {
		LOGGER.error("Unhandled request failure", exception);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(problemFactory.create(HttpStatus.INTERNAL_SERVER_ERROR,
						CommonErrorCode.INTERNAL_ERROR, request, currentLocale()));
	}

	private FieldViolation toFieldViolation(FieldError error, Locale locale) {
		CommonErrorCode errorCode = validationCode(error.getCode());
		return new FieldViolation(error.getField(), errorCode.value(),
				translator.translate(errorCode, NO_ARGUMENTS, locale));
	}

	private FieldViolation toFieldViolation(ConstraintViolation<?> violation,
			Locale locale) {
		String constraintName = violation.getConstraintDescriptor()
				.getAnnotation()
				.annotationType()
				.getSimpleName();
		CommonErrorCode errorCode = validationCode(constraintName);
		return new FieldViolation(violation.getPropertyPath().toString(),
				errorCode.value(),
				translator.translate(errorCode, NO_ARGUMENTS, locale));
	}

	private static CommonErrorCode validationCode(String constraintName) {
		if (constraintName == null) {
			return CommonErrorCode.VALIDATION_INVALID;
		}
		return switch (constraintName) {
			case "NotNull", "NotBlank", "NotEmpty" ->
					CommonErrorCode.VALIDATION_REQUIRED;
			case "Email" -> CommonErrorCode.VALIDATION_EMAIL_INVALID;
			case "Size", "Length" ->
					CommonErrorCode.VALIDATION_SIZE_INVALID;
			default -> CommonErrorCode.VALIDATION_INVALID;
		};
	}

	private static Locale currentLocale() {
		return LocaleContextHolder.getLocale();
	}

	private static HttpStatus statusFor(DomainException exception) {
		if (exception instanceof DomainResourceNotFound) {
			return HttpStatus.NOT_FOUND;
		}
		if (exception instanceof BusinessRuleViolation) {
			return HttpStatus.UNPROCESSABLE_ENTITY;
		}
		if (exception instanceof InvalidStateTransition
				|| exception instanceof ResourceConflict) {
			return HttpStatus.CONFLICT;
		}
		return HttpStatus.INTERNAL_SERVER_ERROR;
	}

}
```

The authentication and authorization exception parameters remain present for
Spring's handler dispatch signature. Their messages are intentionally ignored.

- [ ] **Step 2: Perform static localization and safety checks**

Run:

```bash
rtk grep -n "getDefaultMessage|getMessage\(\)|Access is denied|Authentication is required|Request validation failed|An unexpected error occurred" crm/src/main/java/com/crm/foundation/web/error
rtk grep -n "LocaleContextHolder|REQUEST_VALIDATION_FAILED|VALIDATION_REQUIRED|VALIDATION_EMAIL_INVALID|VALIDATION_SIZE_INVALID|VALIDATION_INVALID" crm/src/main/java/com/crm/foundation/web/error/GlobalExceptionHandler.java
rtk grep -n "getStackTrace|SQLException|Authorization|password|accessToken|refreshToken" crm/src/main/java/com/crm/foundation/web/error
```

Expected evidence:

- No raw exception or Bean Validation message is returned to clients.
- Both validation exception types use the same localized item contract.
- Authentication, authorization, and unexpected errors use common stable codes.
- Sensitive data and stack-trace access have zero matches.

---

### Task 5: Remove the Temporary Database Health Capability

**Files:**

- Modify: `crm/src/main/java/com/crm/foundation/config/SecurityConfig.java`
- Delete: `crm/src/main/java/com/crm/foundation/health/DatabaseHealthController.java`
- Delete: `crm/src/main/java/com/crm/foundation/health/DatabaseHealthResponse.java`
- Delete: `crm/src/main/java/com/crm/foundation/health/DatabaseHealthService.java`

**Interfaces:**

- Removes: `GET /api/health/database`.
- Removes: direct `JdbcTemplate` connectivity probe and its response record.
- Removes: unauthenticated access granted specifically to the database-health path.
- Produces: filter-chain authentication and authorization failures delegated to
  the global API error handler.
- Preserves: HTTP Basic authentication and request-tracing filter placement.
- Preserves: existing datasource and Actuator configuration without reading or changing credentials.

- [ ] **Step 1: Remove the database-health matcher and unify security errors**

Replace `SecurityConfig.java` with:

```java
package com.crm.foundation.config;

import com.crm.foundation.logging.RequestTracingFilter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http,
			@Qualifier("handlerExceptionResolver")
			HandlerExceptionResolver exceptionResolver) throws Exception {
		return http
				.authorizeHttpRequests(authorize -> authorize
						.anyRequest().authenticated())
				.httpBasic(Customizer.withDefaults())
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint((request, response, exception) ->
								exceptionResolver.resolveException(request, response,
										null, exception))
						.accessDeniedHandler((request, response, exception) ->
								exceptionResolver.resolveException(request, response,
										null, exception)))
				.addFilterAfter(new RequestTracingFilter(),
						SecurityContextHolderFilter.class)
				.build();
	}

}
```

- [ ] **Step 2: Delete all three health Java files with `apply_patch`**

Delete exactly:

```text
crm/src/main/java/com/crm/foundation/health/DatabaseHealthController.java
crm/src/main/java/com/crm/foundation/health/DatabaseHealthResponse.java
crm/src/main/java/com/crm/foundation/health/DatabaseHealthService.java
```

Remove the empty `foundation/health` directory only after confirming it contains
no other files.

- [ ] **Step 3: Perform the runtime-source absence check**

Run:

```bash
rtk grep -n "DatabaseHealth|/api/health/database|foundation.health|SELECT 1" crm/src/main/java
rtk grep -n "handlerExceptionResolver|authenticationEntryPoint|accessDeniedHandler" crm/src/main/java/com/crm/foundation/config/SecurityConfig.java
rtk tree crm/src/main/java/com/crm/foundation -L 4
rtk read crm/src/main/java/com/crm/foundation/config/SecurityConfig.java
```

Expected evidence:

- The first search returns no matches.
- `foundation.health` is absent from the source tree.
- Security still requires authentication for every remaining request.
- Filter-chain 401 and 403 failures are delegated to the MVC exception
  resolver.
- Request tracing remains registered once after `SecurityContextHolderFilter`.

---

### Task 6: Reconcile DDD Documentation and Perform Final Static Review

**Files:**

- Modify: `docs/superpowers/specs/2026-08-03-pragmatic-ddd-project-structure-design.md`
- Modify: `docs/superpowers/plans/2026-08-03-pragmatic-ddd-foundation.md`
- Read: `docs/superpowers/specs/2026-08-03-api-error-i18n-and-database-health-removal-design.md`
- Read: all Java and message-bundle files changed in Tasks 1 through 5.

**Interfaces:**

- Produces: current DDD documentation consistent with the approved error-i18n design.
- Produces: static evidence for naming, dependency direction, bundle parity, error safety, and database-health removal.
- Does not produce: compile, test, runtime, API, or database evidence.

- [ ] **Step 1: Update the Pragmatic DDD structure specification**

Apply these exact content changes:

- In `Context`, replace “application bootstrap, security configuration, request
  tracing, logging, and a database health endpoint” with “application bootstrap,
  security configuration, request tracing, logging, and centralized API error
  handling”.
- Remove both `health` entries from the foundation package trees.
- Add `config` and `web/error` to the detailed foundation tree if they are not
  already shown.
- Replace “health diagnostics” in the foundation responsibilities with
  “localized, trace-aware API error handling”.
- Replace the implementation-scope bullet about relocating health code with:

```text
- Relocation of existing security, logging, and request-tracing code into the
  approved foundation packages while preserving behavior.
- Localized API error handling with stable error codes at the web boundary.
```

- Replace the acceptance criterion that preserves health behavior with:

```text
- Existing logging and security behavior is preserved when moved into
  `foundation`; the temporary database health API is absent.
```

- [ ] **Step 2: Remove obsolete health scope from the original foundation plan**

Apply these exact structural changes to
`2026-08-03-pragmatic-ddd-foundation.md`:

- Remove `health` from its architecture summary.
- Change the global constraint that preserves health, security, tracing, and
  Logback so it preserves only security, request tracing, and Logback.
- Remove the three `foundation/health` entries from its file-structure list.
- In Task 7, remove the interface line preserving the public database-health
  endpoint, remove the database-health matcher from the `SecurityConfig` code
  block, and remove the endpoint path from its static grep command. Do not add
  the later i18n exception-resolver wiring to this historical foundation plan;
  that wiring belongs to the current plan.
- Delete the complete section `Task 8: Relocate the Database Health Capability`,
  including its files, interfaces, source listings, and static checks.
- Rename `Task 9: Perform Final Static Architecture Review` to
  `Task 8: Perform Final Static Architecture Review`.
- Remove `com/crm/foundation/health/DatabaseHealthController.java` from the final
  expected-file list.
- Keep the checks for the old top-level `com.crm.health` package because that
  obsolete package must remain absent.

- [ ] **Step 3: Verify package and property consistency**

Run:

```bash
rtk tree crm/src/main/java/com/crm -L 7
rtk grep -n "setProperty\(\"code\"|new FieldViolation\([^,]*,[^,]*\)|String code, String message" crm/src/main/java
rtk grep -n "errorCode|messageKey|LocaleContextHolder|AcceptHeaderLocaleResolver" crm/src/main/java
rtk grep -n "org.springframework|jakarta|com.crm.foundation|HttpStatus|Locale|MessageSource" crm/src/main/java/com/crm/sharedkernel
```

Expected evidence:

- `foundation.health` is absent.
- The old custom `code` property and old two-field `FieldViolation` construction
  are absent.
- Every Java file remains under a directory matching its package declaration.
- Shared-kernel code remains framework-neutral.

- [ ] **Step 4: Verify translation-key parity and client-message ownership**

Read the three bundle files and compare their keys in order:

```bash
rtk read crm/src/main/resources/messages.properties
rtk read crm/src/main/resources/messages_vi.properties
rtk read crm/src/main/resources/messages_en.properties
rtk grep -n "setTitle\(status.getReasonPhrase|getDefaultMessage|getMessage\(\)" crm/src/main/java/com/crm/foundation/web/error
```

Expected evidence:

- Each catalog contains the same 15 keys in the same order.
- Vietnamese fallback and explicit Vietnamese values are identical.
- English contains a value for every key.
- Client-visible messages are resolved through `ErrorMessageTranslator` rather
  than copied from exceptions or validation defaults.

- [ ] **Step 5: Verify database-health removal and documentation alignment**

Run:

```bash
rtk grep -n "DatabaseHealth|/api/health/database|foundation.health|SELECT 1" crm/src/main/java
rtk grep -n "health diagnostics|preserving health|health behavior is preserved|Relocate the Database Health Capability" docs/superpowers/specs/2026-08-03-pragmatic-ddd-project-structure-design.md docs/superpowers/plans/2026-08-03-pragmatic-ddd-foundation.md
rtk grep -n "database health API is absent|localized API error|stable error codes" docs/superpowers/specs/2026-08-03-pragmatic-ddd-project-structure-design.md
```

Expected evidence:

- Runtime source and current target documentation contain no retained
  database-health behavior.
- The DDD specification explicitly describes localized API errors and database
  health absence.
- Older Supabase and logging records are unchanged.

- [ ] **Step 6: Inspect the final unstaged diff without exposing configuration secrets**

Run only against source and design paths:

```bash
rtk git status --short
rtk diff crm/src/main/java/com/crm/sharedkernel crm/src/main/java/com/crm/foundation crm/src/main/resources/messages.properties crm/src/main/resources/messages_vi.properties crm/src/main/resources/messages_en.properties docs/superpowers/specs docs/superpowers/plans
rtk git diff --cached --name-only
```

Expected evidence:

- Only requested source and documentation changes are attributed to this work.
- Existing unrelated `.idea` changes remain untouched.
- The staged-file list is empty.
- No datasource configuration file or credential appears in the diff command.

## Completion Boundary

Completion means all six tasks are implemented and all static checks produce the
expected evidence. Because repository rules prohibit tests, builds, application
startup, API calls, and database connections, the agent must describe the result
as statically verified and must not claim compile-time or runtime success.
