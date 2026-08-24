package com.crm.sales.quote.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QuoteCustomerSnapshotRequest(
		@NotBlank @Size(max = 255) String legalName,
		@Size(max = 255) String addressLine1,
		@Size(max = 255) String addressLine2,
		@Size(max = 100) String locality,
		@Size(max = 100) String region,
		@Size(max = 32) String postalCode,
		@Size(max = 32) String countryCode,
		@Size(max = 255) String contactName,
		@Size(max = 255) String contactEmail,
		@Size(max = 64) String contactPhone
) {
}
