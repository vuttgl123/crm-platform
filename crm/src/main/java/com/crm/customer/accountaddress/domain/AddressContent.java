package com.crm.customer.accountaddress.domain;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Set;

public record AddressContent(
		String addressLine1,
		String addressLine2,
		String locality,
		String administrativeArea,
		String postalCode,
		String countryCode,
		BigDecimal latitude,
		BigDecimal longitude,
		String formattedAddress) {

	private static final int TEXT_MAX_LENGTH = 255;
	private static final int POSTAL_CODE_MAX_LENGTH = 191;
	private static final int COORDINATE_MAX_SCALE = 6;
	private static final BigDecimal MIN_LATITUDE = new BigDecimal("-90");
	private static final BigDecimal MAX_LATITUDE = new BigDecimal("90");
	private static final BigDecimal MIN_LONGITUDE = new BigDecimal("-180");
	private static final BigDecimal MAX_LONGITUDE = new BigDecimal("180");
	private static final Set<String> ISO_COUNTRY_CODES = Set
			.of(Locale.getISOCountries());

	public AddressContent {
		addressLine1 = normalizeText(addressLine1, "addressLine1",
				TEXT_MAX_LENGTH);
		addressLine2 = normalizeText(addressLine2, "addressLine2",
				TEXT_MAX_LENGTH);
		locality = normalizeText(locality, "locality", TEXT_MAX_LENGTH);
		administrativeArea = normalizeText(administrativeArea,
				"administrativeArea", TEXT_MAX_LENGTH);
		postalCode = normalizeText(postalCode, "postalCode",
				POSTAL_CODE_MAX_LENGTH);
		countryCode = normalizeCountryCode(countryCode);
		formattedAddress = normalizeText(formattedAddress, "formattedAddress",
				TEXT_MAX_LENGTH);

		if (!hasMeaningfulComponent(addressLine1, locality,
				administrativeArea, postalCode, formattedAddress)) {
			throw new IllegalArgumentException(
					"address content must contain a meaningful component");
		}
		if (!isCoordinatePairPresent(latitude, longitude)) {
			throw new IllegalArgumentException(
					"latitude and longitude must be provided together");
		}
		if (!isLatitudeValid(latitude)) {
			throw new IllegalArgumentException("latitude must be between -90 and 90 with scale at most 6");
		}
		if (!isLongitudeValid(longitude)) {
			throw new IllegalArgumentException("longitude must be between -180 and 180 with scale at most 6");
		}
	}

	public static boolean hasMeaningfulComponent(String addressLine1,
			String locality, String administrativeArea, String postalCode,
			String formattedAddress) {
		return hasText(addressLine1) || hasText(locality)
				|| hasText(administrativeArea) || hasText(postalCode)
				|| hasText(formattedAddress);
	}

	public static boolean isCountryCodeValid(String countryCode) {
		if (countryCode == null) {
			return false;
		}
		String normalized = countryCode.trim().toUpperCase(Locale.ROOT);
		return ISO_COUNTRY_CODES.contains(normalized);
	}

	public static boolean isCoordinatePairPresent(BigDecimal latitude,
			BigDecimal longitude) {
		return (latitude == null) == (longitude == null);
	}

	public static boolean isLatitudeValid(BigDecimal latitude) {
		return latitude == null || (latitude.scale() <= COORDINATE_MAX_SCALE
				&& latitude.compareTo(MIN_LATITUDE) >= 0
				&& latitude.compareTo(MAX_LATITUDE) <= 0);
	}

	public static boolean isLongitudeValid(BigDecimal longitude) {
		return longitude == null || (longitude.scale() <= COORDINATE_MAX_SCALE
				&& longitude.compareTo(MIN_LONGITUDE) >= 0
				&& longitude.compareTo(MAX_LONGITUDE) <= 0);
	}

	private static String normalizeText(String value, String fieldName,
			int maxLength) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		if (normalized.isEmpty()) {
			return null;
		}
		if (normalized.length() > maxLength) {
			throw new IllegalArgumentException(fieldName + " must not exceed "
					+ maxLength + " characters");
		}
		return normalized;
	}

	private static String normalizeCountryCode(String countryCode) {
		String normalized = normalizeText(countryCode, "countryCode",
				TEXT_MAX_LENGTH);
		if (!isCountryCodeValid(normalized)) {
			throw new IllegalArgumentException("countryCode must be a valid ISO country code");
		}
		return normalized.toUpperCase(Locale.ROOT);
	}

	private static boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}

}
