package com.crm.customer.accountaddress.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.domain.AccountAddressId;
import com.crm.customer.accountaddress.domain.AccountAddressType;

public record UpdateAccountAddressCommand(
		AccountId accountId,
		AccountAddressId addressId,
		long version,
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
		boolean isPrimary,
		LocalDate validFrom) {

	public UpdateAccountAddressCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(addressId, "addressId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
