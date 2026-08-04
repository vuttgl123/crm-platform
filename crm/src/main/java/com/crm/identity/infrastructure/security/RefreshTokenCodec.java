package com.crm.identity.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public final class RefreshTokenCodec {

	private static final int SECRET_BYTES = 32;

	private final SecureRandom secureRandom = new SecureRandom();

	public GeneratedRefreshToken generate(UUID sessionId) {
		byte[] secretBytes = new byte[SECRET_BYTES];
		secureRandom.nextBytes(secretBytes);
		String secret = Base64.getUrlEncoder()
				.withoutPadding()
				.encodeToString(secretBytes);
		String rawToken = sessionId + "." + secret;
		return new GeneratedRefreshToken(rawToken, hash(rawToken));
	}

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
			return Optional.of(new ParsedRefreshToken(sessionId, hash(rawToken)));
		}
		catch (IllegalArgumentException exception) {
			return Optional.empty();
		}
	}

	public boolean matches(String expectedHash, String actualHash) {
		if (expectedHash == null || actualHash == null) {
			return false;
		}
		return MessageDigest.isEqual(
				expectedHash.getBytes(StandardCharsets.US_ASCII),
				actualHash.getBytes(StandardCharsets.US_ASCII));
	}

	private static String hash(String rawToken) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256")
					.digest(rawToken.getBytes(StandardCharsets.UTF_8));
			return java.util.HexFormat.of().formatHex(digest);
		}
		catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is not available", exception);
		}
	}

	public record GeneratedRefreshToken(String rawToken, String hash) {
	}

	public record ParsedRefreshToken(UUID sessionId, String hash) {
	}

}
