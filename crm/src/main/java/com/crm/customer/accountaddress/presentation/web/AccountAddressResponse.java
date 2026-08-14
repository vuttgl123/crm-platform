package com.crm.customer.accountaddress.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.accountaddress.domain.AccountAddressType;
import com.crm.customer.accountaddress.domain.AddressValidationStatus;

public record AccountAddressResponse(
		UUID id,
		UUID accountId,
		AccountAddressType addressType,
		String addressLine1,
		String addressLine2,
		String locality,
		String administrativeArea,
		String postalCode,
		String countryCode,
		BigDecimal latitude,
		BigDecimal longitude,
		String formattedAddress,
		AddressValidationStatus validationStatus,
		boolean isPrimary,
		LocalDate validFrom,
		LocalDate validTo,
		long version,
		Instant createdAt,
		Instant updatedAt) {
}
