package com.crm.foundation.web.error;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import com.crm.identity.domain.CrmAccessDeniedException;
import com.crm.identity.domain.CrmAuthenticationException;
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

	@ExceptionHandler(CrmAccessDeniedException.class)
	public ResponseEntity<ProblemDetail> handleCrmAccessDenied(
			CrmAccessDeniedException exception, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(problemFactory.create(HttpStatus.FORBIDDEN,
						exception.errorCode(), request, currentLocale()));
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ProblemDetail> handleAuthentication(
			AuthenticationException exception, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(problemFactory.create(HttpStatus.UNAUTHORIZED,
						CommonErrorCode.AUTHENTICATION_REQUIRED, request,
						currentLocale()));
	}

	@ExceptionHandler(CrmAuthenticationException.class)
	public ResponseEntity<ProblemDetail> handleCrmAuthentication(
			CrmAuthenticationException exception, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(problemFactory.create(HttpStatus.UNAUTHORIZED,
						exception.errorCode(), request, currentLocale()));
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
