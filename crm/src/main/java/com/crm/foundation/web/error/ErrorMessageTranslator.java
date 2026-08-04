package com.crm.foundation.web.error;

import java.util.Locale;
import java.util.Objects;

import com.crm.sharedkernel.domain.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

@Component
public final class ErrorMessageTranslator {

	private static final Logger LOGGER =
			LoggerFactory.getLogger(ErrorMessageTranslator.class);
	private static final Object[] NO_ARGUMENTS = new Object[0];
	private static final String INTERNAL_ERROR_KEY = "error.internal";
	private static final String LAST_RESORT_MESSAGE =
			"Đã xảy ra lỗi không mong muốn";

	private final MessageSource messageSource;

	public ErrorMessageTranslator(MessageSource messageSource) {
		this.messageSource = messageSource;
	}

	public String translate(ErrorCode errorCode, Object[] arguments,
			Locale locale) {
		ErrorCode requiredCode = Objects.requireNonNull(errorCode,
				"errorCode must not be null");
		return resolve(requiredCode.messageKey(), arguments, locale,
				requiredCode.value());
	}

	public String translateKey(String messageKey, Locale locale) {
		return resolve(messageKey, NO_ARGUMENTS, locale, messageKey);
	}

	private String resolve(String messageKey, Object[] arguments, Locale locale,
			String reference) {
		String requiredKey = Objects.requireNonNull(messageKey,
				"messageKey must not be null");
		Locale requiredLocale = Objects.requireNonNull(locale,
				"locale must not be null");
		Object[] safeArguments = arguments == null
				? NO_ARGUMENTS
				: arguments.clone();
		String translated = messageSource.getMessage(requiredKey, safeArguments,
				null, requiredLocale);
		if (translated != null) {
			return translated;
		}

		LOGGER.error("Missing i18n message reference={} messageKey={}",
				reference, requiredKey);
		if (INTERNAL_ERROR_KEY.equals(requiredKey)) {
			return LAST_RESORT_MESSAGE;
		}
		return messageSource.getMessage(INTERNAL_ERROR_KEY, NO_ARGUMENTS,
				LAST_RESORT_MESSAGE, requiredLocale);
	}

}
