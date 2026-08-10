package com.crm.customer.account.application.command;

import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.customer.account.domain.AccountType;
import com.crm.customer.account.domain.AnnualRevenue;

public record UpdateAccountCommand(
		AccountId accountId,
		long version,
		AccountType accountType,
		String legalName,
		String displayName,
		AccountId parentAccountId,
		AccountOwner owner,
		AccountLifecycleStage lifecycleStage,
		String industryCode,
		String taxIdentifier,
		String registrationNumber,
		String website,
		AnnualRevenue annualRevenue,
		Integer employeeCount,
		String description,
		String preferredLanguageCode,
		boolean doNotContact) {

	public UpdateAccountCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
