package com.crm.identity.application.port;

import java.time.Instant;
import java.util.Locale;

/**
 * Narrow by design. The application layer says only "send a reset link" and
 * knows nothing about subjects, encodings, or markup — those belong to the
 * adapter. When email verification is added it gets its own narrow port rather
 * than widening this one.
 */
public interface PasswordResetMailer {

	/**
	 * @param locale must be passed explicitly. Spring resolves the request
	 *     locale into LocaleContextHolder, which is thread-local and does not
	 *     propagate across the @Async boundary this is called behind; reading
	 *     it inside the adapter would silently yield the default locale for
	 *     every user.
	 */
	void sendResetLink(String email, String displayName, String resetUrl,
			Instant expiresAt, Locale locale);

}
