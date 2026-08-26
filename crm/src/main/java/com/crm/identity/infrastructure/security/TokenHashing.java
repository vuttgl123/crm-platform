package com.crm.identity.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Shared opaque-token hashing for refresh tokens and password reset tokens.
 *
 * Extracted rather than copied: cryptographic code is the last place a
 * duplicate is acceptable, because fixing one copy and forgetting the other
 * produces a vulnerability that nothing reports.
 */
final class TokenHashing {

	private static final int SECRET_BYTES = 32;

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private TokenHashing() {
	}

	static String generateSecret() {
		byte[] bytes = new byte[SECRET_BYTES];
		SECURE_RANDOM.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	static String sha256Hex(String raw) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256")
					.digest(raw.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(digest);
		}
		catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is not available",
					exception);
		}
	}

	/** Constant-time comparison; never replace with String.equals. */
	static boolean matches(String expectedHash, String actualHash) {
		if (expectedHash == null || actualHash == null) {
			return false;
		}
		return MessageDigest.isEqual(
				expectedHash.getBytes(StandardCharsets.US_ASCII),
				actualHash.getBytes(StandardCharsets.US_ASCII));
	}

}
