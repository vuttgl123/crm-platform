package com.crm.identity.infrastructure.security;

/**
 * Public seam onto the package-private TokenHashing, so the application layer
 * can mint and verify password reset tokens without the hashing internals
 * leaking out of this package.
 */
public final class PasswordResetTokenFactory {

	private PasswordResetTokenFactory() {
	}

	public static String generateSecret() {
		return TokenHashing.generateSecret();
	}

	public static String hash(String rawToken) {
		return TokenHashing.sha256Hex(rawToken);
	}

	public static boolean matches(String expectedHash, String actualHash) {
		return TokenHashing.matches(expectedHash, actualHash);
	}

}
