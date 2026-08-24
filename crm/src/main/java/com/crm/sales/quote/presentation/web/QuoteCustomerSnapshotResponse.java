package com.crm.sales.quote.presentation.web;

public record QuoteCustomerSnapshotResponse(
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
}
