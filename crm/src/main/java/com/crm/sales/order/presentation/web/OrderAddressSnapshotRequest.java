package com.crm.sales.order.presentation.web;

public record OrderAddressSnapshotRequest(
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
) {}
