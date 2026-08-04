package com.crm.identity.infrastructure.web;

import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import com.crm.identity.application.AuthenticationService;
import com.crm.identity.application.IssuedTokens;
import com.crm.identity.domain.AuthenticationErrorCode;
import com.crm.identity.domain.CrmAuthenticationException;
import com.crm.identity.domain.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public final class AuthenticationController {

	private final AuthenticationService authenticationService;
	private final RefreshTokenCookie refreshTokenCookie;

	public AuthenticationController(AuthenticationService authenticationService, RefreshTokenCookie refreshTokenCookie) {
		this.authenticationService = authenticationService;
		this.refreshTokenCookie = refreshTokenCookie;
	}

	@PostMapping("/register")
	public ResponseEntity<AccessTokenResponse> register(
			@Valid @RequestBody RegisterRequest request,
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		IssuedTokens tokens = authenticationService.register(
				request.email(),
				request.password(),
				request.displayName(),
				RequestMetadataFactory.from(servletRequest));
		refreshTokenCookie.write(servletResponse, tokens.refreshToken());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(AccessTokenResponse.from(tokens));
	}

	@PostMapping("/login")
	public AccessTokenResponse login(@Valid @RequestBody LoginRequest request,
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		IssuedTokens tokens = authenticationService.login(
				request.email(),
				request.password(),
				RequestMetadataFactory.from(servletRequest));
		refreshTokenCookie.write(servletResponse, tokens.refreshToken());
		return AccessTokenResponse.from(tokens);
	}

	@PostMapping("/refresh")
	public AccessTokenResponse refresh(HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
		String rawRefreshToken = refreshTokenCookie.read(servletRequest).orElseThrow(() -> new CrmAuthenticationException(AuthenticationErrorCode.INVALID_REFRESH_TOKEN));
		IssuedTokens tokens = authenticationService.refresh(rawRefreshToken, RequestMetadataFactory.from(servletRequest));
		refreshTokenCookie.write(servletResponse, tokens.refreshToken());
		return AccessTokenResponse.from(tokens);
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
		refreshTokenCookie.read(servletRequest).ifPresent(token -> authenticationService.logout(token, RequestMetadataFactory.from(servletRequest)));
		refreshTokenCookie.clear(servletResponse);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/me")
	public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
		UUID userId = UUID.fromString(jwt.getSubject());
		UserAccount user = authenticationService.requireUser(userId);
		return MeResponse.from(user, authenticationService.activeTenants(userId));
	}

}
