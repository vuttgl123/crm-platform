package com.crm.customer.accountcommunicationchannel.domain;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

public final class ChannelValue {

	private static final int MAX_LENGTH = 255;
	private static final Pattern EMAIL = Pattern.compile(
			"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
	private static final Pattern E164 = Pattern.compile(
			"^\\+[1-9][0-9]{1,14}$");

	private final String rawValue;
	private final String normalizedValue;
	private final String canonicalValue;

	private ChannelValue(String rawValue, String normalizedValue,
			String canonicalValue) {
		this.rawValue = rawValue;
		this.normalizedValue = normalizedValue;
		this.canonicalValue = canonicalValue;
	}

	public static ChannelValue of(ChannelType type, String value) {
		ChannelType requiredType = Objects.requireNonNull(type,
				"type must not be null");
		String raw = Objects.requireNonNull(value,
				"value must not be null").trim();
		if (raw.isEmpty()) {
			throw new IllegalArgumentException("value must not be blank");
		}
		if (raw.length() > MAX_LENGTH) {
			throw new IllegalArgumentException(
					"value must not exceed " + MAX_LENGTH + " characters");
		}
		String normalized = switch (requiredType) {
			case EMAIL -> requireEmail(raw).toLowerCase(Locale.ROOT);
			case PHONE, MOBILE, SMS, WHATSAPP -> requireE164(raw);
			case LINKEDIN -> raw;
			case OTHER -> null;
		};
		String canonical = requiredType == ChannelType.OTHER ? raw : normalized;
		return new ChannelValue(raw, normalized, canonical);
	}

	public static boolean isValidWhenPresent(ChannelType type, String value) {
		if (type == null || value == null || value.isBlank()) {
			return true;
		}
		try {
			of(type, value);
			return true;
		}
		catch (IllegalArgumentException exception) {
			return false;
		}
	}

	public String rawValue() {
		return rawValue;
	}

	public String normalizedValue() {
		return normalizedValue;
	}

	public String canonicalValue() {
		return canonicalValue;
	}

	private static String requireEmail(String value) {
		if (!EMAIL.matcher(value).matches()) {
			throw new IllegalArgumentException("value must be a valid email");
		}
		return value;
	}

	private static String requireE164(String value) {
		if (!E164.matcher(value).matches()) {
			throw new IllegalArgumentException("value must be a valid E.164 number");
		}
		return value;
	}

}
