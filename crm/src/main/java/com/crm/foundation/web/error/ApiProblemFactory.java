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
		return traceId == null || traceId.isBlank() ? SYSTEM_TRACE_ID : traceId;
	}

}
