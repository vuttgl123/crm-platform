package com.crm.customer.opportunity.domain;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.regex.Pattern;

public record OpportunityAmount(
		BigDecimal amount,
		String currencyCode) {

	private static final Pattern CURRENCY_CODE_PATTERN = Pattern.compile("^[A-Z]{3}$");

	public OpportunityAmount {
		Objects.requireNonNull(amount, "Amount must not be null");
		Objects.requireNonNull(currencyCode, "Currency code must not be null");
		if (amount.compareTo(BigDecimal.ZERO) < 0) {
			throw new IllegalArgumentException("Opportunity amount cannot be negative");
		}
		if (!CURRENCY_CODE_PATTERN.matcher(currencyCode).matches()) {
			throw new IllegalArgumentException("Currency code must be a 3-letter uppercase code");
		}
	}

}
