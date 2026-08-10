package com.crm.customer.account.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.account.domain.AccountType;

public record AccountSummaryResponse(
		UUID id,
		String accountNumber,
		String displayName,
		String legalName,
		AccountType accountType,
		AccountLifecycleStage lifecycleStage,
		Owner owner,
		boolean doNotContact,
		Instant updatedAt,
		long version) {

	public record Owner(AccountOwnerType type, UUID id) {
	}

}
