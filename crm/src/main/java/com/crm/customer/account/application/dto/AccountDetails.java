package com.crm.customer.account.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.domain.Account;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.customer.account.domain.AccountType;
import com.crm.customer.account.domain.AnnualRevenue;
import com.crm.sharedkernel.domain.ActorId;

public record AccountDetails(
		UUID id,
		String accountNumber,
		AccountType accountType,
		String legalName,
		String displayName,
		UUID parentAccountId,
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
		boolean doNotContact,
		Instant createdAt,
		UUID createdBy,
		Instant updatedAt,
		UUID updatedBy,
		long version) {

	public static AccountDetails from(Account account) {
		return new AccountDetails(
				account.id().value(),
				account.accountNumber(),
				account.accountType(),
				account.legalName(),
				account.displayName(),
				uuid(account.parentAccountId()),
				account.owner(),
				account.lifecycleStage(),
				account.industryCode(),
				account.taxIdentifier(),
				account.registrationNumber(),
				account.website(),
				account.annualRevenue(),
				account.employeeCount(),
				account.description(),
				account.preferredLanguageCode(),
				account.doNotContact(),
				account.createdAt(),
				uuid(account.createdBy()),
				account.updatedAt(),
				uuid(account.updatedBy()),
				account.version());
	}

	private static UUID uuid(AccountId value) {
		return value == null ? null : value.value();
	}

	private static UUID uuid(ActorId value) {
		return value == null ? null : value.value();
	}

}
