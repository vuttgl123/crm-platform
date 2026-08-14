package com.crm.customer.accountaddress.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.accountaddress.domain.AccountAddress;
import com.crm.customer.accountaddress.domain.AccountAddressType;
import com.crm.customer.accountaddress.domain.AddressValidationStatus;

public record AccountAddressDetails(
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

	public static AccountAddressDetails from(AccountAddress address) {
		return new AccountAddressDetails(
				address.id().value(),
				address.accountId().value(),
				address.addressType(),
				address.addressLine1(),
				address.addressLine2(),
				address.locality(),
				address.administrativeArea(),
				address.postalCode(),
				address.countryCode(),
				address.latitude(),
				address.longitude(),
				address.formattedAddress(),
				address.validationStatus(),
				address.isPrimary(),
				address.validFrom(),
				address.validTo(),
				address.version(),
				address.createdAt(),
				address.updatedAt());
	}

}
