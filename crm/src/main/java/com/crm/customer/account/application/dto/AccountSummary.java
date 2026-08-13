package com.crm.customer.account.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.customer.account.domain.AccountType;

public record AccountSummary(
		UUID id,
		String accountNumber,
		String displayName,
		String legalName,
		UUID parentAccountId,
		AccountType accountType,
		AccountLifecycleStage lifecycleStage,
		AccountOwner owner,
		boolean doNotContact,
		Instant updatedAt,
		long version) {
}
