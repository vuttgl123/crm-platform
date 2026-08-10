package com.crm.customer.account.presentation.web;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.account.domain.AccountType;

public record UpdateAccountRequest(
		@NotNull @Positive Long version,
		@NotNull AccountType accountType,
		@Size(max = 255) String legalName,
		@NotBlank @Size(max = 255) String displayName,
		UUID parentAccountId,
		@Valid Owner owner,
		@NotNull AccountLifecycleStage lifecycleStage,
		@Size(max = 191) String industryCode,
		@Size(max = 255) String taxIdentifier,
		@Size(max = 191) String registrationNumber,
		String website,
		@Valid Revenue annualRevenue,
		@PositiveOrZero Integer employeeCount,
		String description,
		@Size(max = 10)
		@Pattern(regexp = "^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$")
		String preferredLanguageCode,
		@NotNull Boolean doNotContact) {

	public record Owner(
			@NotNull AccountOwnerType type,
			@NotNull UUID id) {
	}

	public record Revenue(
			@NotNull @PositiveOrZero
			@Digits(integer = 14, fraction = 6) BigDecimal amount,
			@Pattern(regexp = "^[A-Z]{3}$") String currencyCode) {
	}

}
