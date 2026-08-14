package com.crm.customer.accountaddress.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.domain.AccountAddressType;

public record CreateAccountAddressCommand(
		AccountId accountId,
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

	public CreateAccountAddressCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
	}

}
