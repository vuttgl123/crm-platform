package com.crm.identity.infrastructure.security;

import java.util.Optional;
import java.util.UUID;

import com.crm.identity.application.port.RefreshTokenManager;
import org.springframework.stereotype.Component;

@Component
public final class RefreshTokenCodec implements RefreshTokenManager {

	@Override
	public GeneratedRefreshToken generate(UUID sessionId) {
		String rawToken = sessionId + "." + TokenHashing.generateSecret();
		return new GeneratedRefreshToken(rawToken,
				TokenHashing.sha256Hex(rawToken));
	}

	@Override
	public Optional<ParsedRefreshToken> parse(String rawToken) {
		if (rawToken == null || rawToken.isBlank()) {
			return Optional.empty();
		}
		int separator = rawToken.indexOf('.');
		if (separator <= 0 || separator != rawToken.lastIndexOf('.')) {
			return Optional.empty();
		}
		try {
			UUID sessionId = UUID.fromString(rawToken.substring(0, separator));
			String secret = rawToken.substring(separator + 1);
			if (secret.length() < 32) {
				return Optional.empty();
			}
			return Optional.of(new ParsedRefreshToken(sessionId,
					TokenHashing.sha256Hex(rawToken)));
		}
		catch (IllegalArgumentException exception) {
			return Optional.empty();
		}
	}

	@Override
	public boolean matches(String expectedHash, String actualHash) {
		return TokenHashing.matches(expectedHash, actualHash);
	}

}
