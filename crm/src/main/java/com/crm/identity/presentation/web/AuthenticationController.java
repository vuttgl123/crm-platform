package com.crm.identity.presentation.web;

import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import com.crm.foundation.security.CodedAuthenticationException;
import com.crm.identity.application.dto.IssuedTokens;
import com.crm.identity.application.usecase.AuthenticationFacade;
import com.crm.identity.domain.AuthenticationErrorCode;
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

	private final AuthenticationFacade authentication;
	private final AuthenticationWebMapper mapper;
	private final RefreshTokenCookie refreshTokenCookie;

	public AuthenticationController(AuthenticationFacade authentication,
			AuthenticationWebMapper mapper,
			RefreshTokenCookie refreshTokenCookie) {
		this.authentication = authentication;
		this.mapper = mapper;
		this.refreshTokenCookie = refreshTokenCookie;
	}

	@PostMapping("/register")
	public ResponseEntity<AccessTokenResponse> register(
			@Valid @RequestBody RegisterRequest request,
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		IssuedTokens tokens = authentication.register(
				mapper.toRegisterCommand(request),
				RequestMetadataFactory.from(servletRequest));
		refreshTokenCookie.write(servletResponse, tokens.refreshToken());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toAccessTokenResponse(tokens));
	}

	@PostMapping("/login")
	public AccessTokenResponse login(
			@Valid @RequestBody LoginRequest request,
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		IssuedTokens tokens = authentication.login(
				mapper.toLoginCommand(request),
				RequestMetadataFactory.from(servletRequest));
		refreshTokenCookie.write(servletResponse, tokens.refreshToken());
		return mapper.toAccessTokenResponse(tokens);
	}

	@PostMapping("/refresh")
	public AccessTokenResponse refresh(HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		String rawRefreshToken = refreshTokenCookie.read(servletRequest)
				.orElseThrow(() -> new CodedAuthenticationException(
						AuthenticationErrorCode.INVALID_REFRESH_TOKEN));
		IssuedTokens tokens = authentication.refresh(rawRefreshToken,
				RequestMetadataFactory.from(servletRequest));
		refreshTokenCookie.write(servletResponse, tokens.refreshToken());
		return mapper.toAccessTokenResponse(tokens);
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		refreshTokenCookie.read(servletRequest).ifPresent(token ->
				authentication.logout(token,
						RequestMetadataFactory.from(servletRequest)));
		refreshTokenCookie.clear(servletResponse);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/me")
	public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
		UUID userId = UUID.fromString(jwt.getSubject());
		return mapper.toMeResponse(authentication.currentIdentity(userId));
	}

}
