package com.crm.identity.infrastructure.security;

import java.io.IOException;
import java.net.URI;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.crm.identity.infrastructure.config.CrmSecurityProperties;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

public final class AuthCookieOriginFilter extends OncePerRequestFilter {

	private static final Set<String> PROTECTED_PATHS = Set.of(
			"/api/auth/refresh",
			"/api/auth/logout"
	);

	private final Set<String> allowedOrigins;
	private final HandlerExceptionResolver exceptionResolver;

	public AuthCookieOriginFilter(CrmSecurityProperties properties, HandlerExceptionResolver exceptionResolver) {
		this.allowedOrigins = properties.allowedOrigins().stream()
				.map(AuthCookieOriginFilter::normalizeOrigin)
				.collect(Collectors.toUnmodifiableSet());
		this.exceptionResolver = exceptionResolver;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
		String origin = request.getHeader("Origin");
		if (origin != null && !isAllowed(origin, request)) {
			exceptionResolver.resolveException(request, response, null, new AccessDeniedException("Request origin is not allowed"));
			return;
		}
		filterChain.doFilter(request, response);
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return !"POST".equals(request.getMethod()) || !PROTECTED_PATHS.contains(request.getServletPath());
	}

	private boolean isAllowed(String origin, HttpServletRequest request) {
		try {
			String normalized = normalizeOrigin(origin);
			return allowedOrigins.contains(normalized) || normalized.equals(requestOrigin(request));
		}
		catch (IllegalArgumentException exception) {
			return false;
		}
	}

	private static String requestOrigin(HttpServletRequest request) {
		String scheme = request.isSecure() ? "https" : "http";
		int port = request.getServerPort();
		boolean defaultPort = ("http".equals(scheme) && port == 80) || ("https".equals(scheme) && port == 443);
		return scheme + "://" + request.getServerName() + (defaultPort ? "" : ":" + port);
	}

	private static String normalizeOrigin(String origin) {
		URI uri = URI.create(origin.trim());
		String scheme = uri.getScheme();
		String host = uri.getHost();
		if (scheme == null || host == null || uri.getUserInfo() != null || uri.getPath() != null && !uri.getPath().isBlank() && !"/".equals(uri.getPath())) {
			throw new IllegalArgumentException("Invalid allowed origin");
		}
		int port = uri.getPort();
		return scheme.toLowerCase() + "://" + host.toLowerCase() + (port < 0 ? "" : ":" + port);
	}

}
