package com.crm.identity.domain;

import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * The single enforcement point for password strength, applied by registration,
 * reset, and change alike.
 *
 * Character-composition rules are deliberately absent. NIST SP 800-63B
 * recommends against them: requiring an uppercase letter, a digit, and a symbol
 * pushes users toward predictable shapes such as "Password1!" without adding
 * real entropy. A twelve-character floor plus a deny-list targets what real
 * attacks use, which is dictionaries rather than exhaustive search.
 */
public final class PasswordPolicy {

	public static final int MIN_LENGTH = 12;

	public static final int MAX_LENGTH = 128;

	/** The shortest identity fragment worth rejecting inside a password. */
	private static final int MIN_IDENTITY_FRAGMENT = 4;

	private static final Set<String> COMMON_PASSWORDS = Set.of(
			"password", "password1", "password123", "passw0rd",
			"123456", "1234567", "12345678", "123456789", "1234567890",
			"qwerty", "qwerty123", "qwertyuiop", "asdfghjkl",
			"letmein", "welcome", "welcome1", "welcome123",
			"admin", "admin123", "administrator", "root", "toor",
			"iloveyou", "sunshine", "princess", "dragon", "monkey",
			"football", "baseball", "superman", "batman",
			"trustno1", "changeme", "secret", "master", "shadow",
			"abc123", "abcd1234", "a1b2c3d4", "zaq12wsx", "1q2w3e4r",
			"qazwsx", "michael", "jennifer", "jordan", "hunter",
			"vumcrm", "vumcrm123", "crmadmin", "salespassword",
			"companyname", "january", "february", "december",
			"summer2025", "summer2026", "winter2025", "winter2026",
			"p@ssword", "p@ssw0rd", "passw0rd123", "test1234",
			"demo1234", "demopassword", "temporary", "temppassword");

	private PasswordPolicy() {
	}

	public static Optional<PasswordPolicyViolation> validate(
			String password, String email, String displayName) {
		if (password == null || password.length() < MIN_LENGTH) {
			return Optional.of(PasswordPolicyViolation.TOO_SHORT);
		}
		if (password.length() > MAX_LENGTH) {
			return Optional.of(PasswordPolicyViolation.TOO_LONG);
		}

		String lower = password.toLowerCase(Locale.ROOT);
		if (COMMON_PASSWORDS.contains(lower)) {
			return Optional.of(PasswordPolicyViolation.COMMON);
		}
		if (containsIdentity(lower, email, displayName)) {
			return Optional.of(PasswordPolicyViolation.CONTAINS_IDENTITY);
		}
		return Optional.empty();
	}

	private static boolean containsIdentity(String lowerPassword,
			String email, String displayName) {
		if (email != null) {
			int at = email.indexOf('@');
			String local = (at > 0 ? email.substring(0, at) : email)
					.toLowerCase(Locale.ROOT);
			if (local.length() >= MIN_IDENTITY_FRAGMENT
					&& lowerPassword.contains(local)) {
				return true;
			}
		}
		if (displayName != null) {
			for (String part : displayName.toLowerCase(Locale.ROOT)
					.split("\\s+")) {
				if (part.length() >= MIN_IDENTITY_FRAGMENT
						&& lowerPassword.contains(part)) {
					return true;
				}
			}
		}
		return false;
	}

}
