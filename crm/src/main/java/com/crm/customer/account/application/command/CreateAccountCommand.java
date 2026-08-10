package com.crm.customer.account.application.command;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.customer.account.domain.AccountType;
import com.crm.customer.account.domain.AnnualRevenue;

public record CreateAccountCommand(
		String accountNumber,
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
		Boolean doNotContact) {
}
