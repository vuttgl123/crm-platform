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
