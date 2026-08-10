package com.crm.customer.account.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.account.domain.AccountType;

public record AccountResponse(
		UUID id,
		String accountNumber,
		AccountType accountType,
		String legalName,
		String displayName,
		UUID parentAccountId,
		Owner owner,
		AccountLifecycleStage lifecycleStage,
		String industryCode,
		String taxIdentifier,
		String registrationNumber,
		String website,
		Revenue annualRevenue,
		Integer employeeCount,
		String description,
		String preferredLanguageCode,
		boolean doNotContact,
		Instant createdAt,
		UUID createdBy,
		Instant updatedAt,
		UUID updatedBy,
		long version) {

	public record Owner(AccountOwnerType type, UUID id) {
	}

	public record Revenue(BigDecimal amount, String currencyCode) {
	}

}
