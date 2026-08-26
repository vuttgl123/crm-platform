package com.crm.identity.infrastructure.mail;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import com.crm.identity.application.port.PasswordResetMailer;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class SmtpPasswordResetMailer implements PasswordResetMailer {

	private static final Logger log =
			LoggerFactory.getLogger(SmtpPasswordResetMailer.class);

	private final JavaMailSender mailSender;

	private final MessageSource messageSource;

	private final String fromAddress;

	private final String configuredHost;

	public SmtpPasswordResetMailer(JavaMailSender mailSender,
			MessageSource messageSource,
			@Value("${spring.mail.from:no-reply@vumcrm.local}")
			String fromAddress,
			@Value("${spring.mail.host:}") String configuredHost) {
		this.mailSender = mailSender;
		this.messageSource = messageSource;
		this.fromAddress = fromAddress;
		this.configuredHost = configuredHost;
	}

	@Override
	public void sendResetLink(String email, String displayName,
			String resetUrl, Instant expiresAt, Locale locale) {
		// Operational hygiene, not a substitute for delivery: local
		// development and CI have no SMTP credentials and must not fail
		// because of it.
		if (!StringUtils.hasText(configuredHost)) {
			log.warn("spring.mail.host is not configured; password reset "
					+ "link for {} was not sent: {}", email, resetUrl);
			return;
		}

		long minutes = Duration.between(Instant.now(), expiresAt).toMinutes();

		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(
					message, false, StandardCharsets.UTF_8.name());
			helper.setFrom(fromAddress);
			helper.setTo(email);
			helper.setSubject(messageSource.getMessage(
					"mail.password_reset.subject", null, locale));
			helper.setText(buildBody(displayName, resetUrl, minutes, locale),
					false);
			mailSender.send(message);
		}
		catch (Exception exception) {
			// Never rethrow: the caller answered 202 long ago, and a delivery
			// failure must not become an account-enumeration signal.
			log.error("Failed to send password reset mail to {}", email,
					exception);
		}
	}

	private String buildBody(String displayName, String resetUrl, long minutes,
			Locale locale) {
		String greeting = messageSource.getMessage(
				"mail.password_reset.greeting",
				new Object[] { displayName }, locale);
		String intro = messageSource.getMessage("mail.password_reset.body",
				new Object[] { minutes }, locale);
		String action = messageSource.getMessage(
				"mail.password_reset.action", null, locale);
		String ignore = messageSource.getMessage(
				"mail.password_reset.ignore", null, locale);
		return greeting + "\n\n" + intro + "\n\n"
				+ action + ": " + resetUrl + "\n\n" + ignore + "\n";
	}

}
