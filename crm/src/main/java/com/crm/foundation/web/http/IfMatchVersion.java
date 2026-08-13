package com.crm.foundation.web.http;

import java.util.regex.Pattern;

public final class IfMatchVersion {

	private static final Pattern STRONG_VERSION =
			Pattern.compile("^\\\"[1-9][0-9]*\\\"$");

	private IfMatchVersion() {
	}

	public static boolean isValid(String value) {
		if (value == null || !STRONG_VERSION.matcher(value).matches()) {
			return false;
		}
		try {
			Long.parseLong(value.substring(1, value.length() - 1));
			return true;
		}
		catch (NumberFormatException exception) {
			return false;
		}
	}

	public static long parse(String value) {
		if (!isValid(value)) {
			throw new IllegalArgumentException(
					"If-Match must be a strong quoted positive long");
		}
		return Long.parseLong(value.substring(1, value.length() - 1));
	}

}
