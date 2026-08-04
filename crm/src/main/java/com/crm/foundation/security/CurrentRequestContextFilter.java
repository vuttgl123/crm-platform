package com.crm.foundation.security;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.crm.foundation.tenancy.TenantContext;
import com.crm.identity.application.port.IdentityRepository;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

public final class CurrentRequestContextFilter extends OncePerRequestFilter {

	public static final String TENANT_ID_HEADER = "X-Tenant-ID";

	private final IdentityRepository identityRepository;
	private final HandlerExceptionResolver exceptionResolver;

	public CurrentRequestContextFilter(IdentityRepository identityRepository,
			HandlerExceptionResolver exceptionResolver) {
		this.identityRepository = identityRepository;
		this.exceptionResolver = exceptionResolver;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (!(org.springframework.security.core.context.SecurityContextHolder
				.getContext().getAuthentication()
				instanceof JwtAuthenticationToken jwtAuthentication)) {
			filterChain.doFilter(request, response);
			return;
		}

		try {
			UUID userId = UUID.fromString(jwtAuthentication.getToken().getSubject());
			try (ActorContext.Scope actorScope =
						ActorContext.open(new ActorId(userId))) {
				String tenantHeader = request.getHeader(TENANT_ID_HEADER);
				if (tenantHeader == null || tenantHeader.isBlank()) {
					filterChain.doFilter(request, response);
					return;
				}
				UUID tenantId = UUID.fromString(tenantHeader);
				if (!identityRepository.hasActiveTenantMembership(userId, tenantId)) {
					throw new AccessDeniedException(
							"Active tenant membership is required");
				}
				try (TenantContext.Scope tenantScope =
						TenantContext.open(new TenantId(tenantId))) {
					filterChain.doFilter(request, response);
				}
			}
		}
		catch (IllegalArgumentException exception) {
			exceptionResolver.resolveException(request, response, null,
					new AccessDeniedException("Invalid security context", exception));
		}
		catch (AccessDeniedException exception) {
			exceptionResolver.resolveException(request, response, null, exception);
		}
	}

}
