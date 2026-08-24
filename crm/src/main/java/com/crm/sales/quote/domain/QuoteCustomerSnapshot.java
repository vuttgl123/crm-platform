package com.crm.sales.quote.domain;

import java.util.Objects;

public record QuoteCustomerSnapshot(
		String legalName,
		String addressLine1,
		String addressLine2,
		String locality,
		String region,
		String postalCode,
		String countryCode,
		String contactName,
		String contactEmail,
		String contactPhone
) {
	public QuoteCustomerSnapshot {
		legalName = legalName != null ? legalName.trim() : "";
		addressLine1 = trimToNull(addressLine1);
		addressLine2 = trimToNull(addressLine2);
		locality = trimToNull(locality);
		region = trimToNull(region);
		postalCode = trimToNull(postalCode);
		countryCode = trimToNull(countryCode);
		contactName = trimToNull(contactName);
		contactEmail = trimToNull(contactEmail);
		contactPhone = trimToNull(contactPhone);
	}

	public static QuoteCustomerSnapshot empty(String fallbackName) {
		return new QuoteCustomerSnapshot(
				fallbackName != null ? fallbackName : "",
				null, null, null, null, null, null, null, null, null
		);
	}

	private static String trimToNull(String val) {
		if (val == null) return null;
		String trimmed = val.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
