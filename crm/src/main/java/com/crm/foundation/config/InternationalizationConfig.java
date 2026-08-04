package com.crm.foundation.config;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

@Configuration
public class InternationalizationConfig {

	private static final Locale VIETNAMESE = Locale.forLanguageTag("vi");

	@Bean
	LocaleResolver localeResolver() {
		AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
		resolver.setSupportedLocales(List.of(VIETNAMESE, Locale.ENGLISH));
		resolver.setDefaultLocale(VIETNAMESE);
		return resolver;
	}

	@Bean
	MessageSource messageSource() {
		ResourceBundleMessageSource source = new ResourceBundleMessageSource();
		source.setBasename("messages");
		source.setDefaultEncoding(StandardCharsets.UTF_8.name());
		source.setFallbackToSystemLocale(false);
		source.setUseCodeAsDefaultMessage(false);
		return source;
	}

}
