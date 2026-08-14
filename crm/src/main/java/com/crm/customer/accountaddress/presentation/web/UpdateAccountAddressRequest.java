package com.crm.customer.accountaddress.presentation.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.crm.customer.accountaddress.domain.AccountAddressType;

@ValidAccountAddress
public record UpdateAccountAddressRequest(
		@NotNull AccountAddressType addressType,
		@Size(max = 255) String addressLine1,
		@Size(max = 255) String addressLine2,
		@Size(max = 255) String locality,
		@Size(max = 255) String administrativeArea,
		@Size(max = 191) String postalCode,
		@NotBlank @Size(min = 2, max = 2) String countryCode,
		@DecimalMin("-90") @DecimalMax("90")
		@Digits(integer = 2, fraction = 6) BigDecimal latitude,
		@DecimalMin("-180") @DecimalMax("180")
		@Digits(integer = 3, fraction = 6) BigDecimal longitude,
		@Size(max = 255) String formattedAddress,
		boolean isPrimary,
		LocalDate validFrom) implements AccountAddressInput {

	public UpdateAccountAddressRequest {
		addressLine1 = normalizeOptional(addressLine1);
		addressLine2 = normalizeOptional(addressLine2);
		locality = normalizeOptional(locality);
		administrativeArea = normalizeOptional(administrativeArea);
		postalCode = normalizeOptional(postalCode);
		countryCode = countryCode == null ? null
				: countryCode.trim().toUpperCase(Locale.ROOT);
		formattedAddress = normalizeOptional(formattedAddress);
	}

	private static String normalizeOptional(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}

}
