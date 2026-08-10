package com.crm.customer.account.domain;

import java.math.BigDecimal;
import java.util.Objects;

import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;

public record AnnualRevenue(BigDecimal amount, String currencyCode) {

	public AnnualRevenue {
		Objects.requireNonNull(amount, "amount must not be null");
		if (amount.signum() < 0 || amount.scale() > 6
				|| amount.precision() - amount.scale() > 14) {
			throw new IllegalArgumentException(
					"amount must fit nonnegative DECIMAL(20,6)");
		}
		if (currencyCode == null || currencyCode.isBlank()) {
			throw new BusinessRuleViolation(
					AccountErrorCode.ACCOUNT_REVENUE_CURRENCY_REQUIRED);
		}
		currencyCode = currencyCode.trim();
		if (!currencyCode.matches("^[A-Z]{3}$")) {
			throw new IllegalArgumentException(
					"currencyCode must contain three uppercase letters");
		}
	}

}
