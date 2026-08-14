package com.crm.customer.contact.presentation.web;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.contact.domain.ContactLifecycleStage;
import com.crm.customer.contact.domain.PreferredContactChannel;

public record UpdateContactRequest(
		@NotNull @Positive Long version,
		UUID accountId,
		@Valid Owner owner,
		@Size(max = 255) String honorific,
		@Size(max = 255) String givenName,
		@Size(max = 255) String middleName,
		@Size(max = 255) String familyName,
		@NotBlank @Size(max = 255) String displayName,
		@Size(max = 255) String jobTitle,
		@Size(max = 255) String department,
		@Size(max = 10)
		@Pattern(regexp = "^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$")
		String preferredLanguageCode,
		PreferredContactChannel preferredContactChannel,
		@NotNull ContactLifecycleStage lifecycleStage,
		LocalDate dateOfBirth,
		@NotNull Boolean doNotContact,
		String description) {

	public record Owner(
			@NotNull AccountOwnerType type,
			@NotNull UUID id) {
	}

}
