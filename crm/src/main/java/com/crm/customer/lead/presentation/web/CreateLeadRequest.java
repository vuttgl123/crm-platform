package com.crm.customer.lead.presentation.web;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.lead.domain.LeadRating;

public record CreateLeadRequest(
		@NotBlank @Size(max = 191) String leadNumber,
		@NotNull UUID statusId,
		UUID sourceId,
		@Valid Owner owner,
		LeadRating rating,
		@Size(max = 255) String accountName,
		@Size(max = 255) String companyName,
		@Size(max = 255) String honorific,
		@Size(max = 255) String givenName,
		@Size(max = 255) String familyName,
		@NotBlank @Size(max = 255) String displayName,
		@Size(max = 320) String email,
		@Pattern(regexp = "^\\+[1-9][0-9]{1,14}$") String phoneE164,
		@Size(max = 255) String jobTitle,
		String website,
		@Pattern(regexp = "^[A-Z]{2}$") String countryCode,
		@Pattern(regexp = "^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$") String preferredLanguageCode,
		@Valid EstimatedValue estimatedValue,
		String qualificationNotes) {

	public record Owner(
			@NotNull AccountOwnerType type,
			@NotNull UUID id) {
	}

	public record EstimatedValue(
			@NotNull @DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal amount,
			@NotBlank @Pattern(regexp = "^[A-Z]{3}$") String currencyCode) {
	}

}
