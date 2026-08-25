package com.crm.sales.order.domain;

import java.util.Objects;

public record OrderAddressSnapshot(
		String legalName,
		String addressLine1,
		String addressLine2,
		String locality,
		String region,
		String postalCode,
		String countryCode,
		String contactName,
		String contactEmail,
		String contactPhone) {

	public static OrderAddressSnapshot empty(String defaultName) {
		return new OrderAddressSnapshot(
				defaultName != null ? defaultName : "Customer",
				null, null, null, null, null, null,
				null, null, null
		);
	}

	public OrderAddressSnapshot {
		legalName = legalName != null && !legalName.trim().isEmpty() ? legalName.trim() : "Customer";
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

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

}
