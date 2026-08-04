package com.crm.identity.application.port;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenManager {

	GeneratedRefreshToken generate(UUID sessionId);

	Optional<ParsedRefreshToken> parse(String rawToken);

	boolean matches(String expectedHash, String actualHash);

	record GeneratedRefreshToken(String rawToken, String hash) {
	}

	record ParsedRefreshToken(UUID sessionId, String hash) {
	}

}
