package com.crm.customer.contact.presentation.web;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.contact.domain.ContactLifecycleStage;
import com.crm.customer.contact.domain.PreferredContactChannel;

public record ContactResponse(
		UUID id,
		String contactNumber,
		UUID accountId,
		Owner owner,
		String honorific,
		String givenName,
		String middleName,
		String familyName,
		String displayName,
		String jobTitle,
		String department,
		String preferredLanguageCode,
		PreferredContactChannel preferredContactChannel,
		ContactLifecycleStage lifecycleStage,
		LocalDate dateOfBirth,
		boolean doNotContact,
		String description,
		Instant createdAt,
		UUID createdBy,
		Instant updatedAt,
		UUID updatedBy,
		long version) {

	public record Owner(
			AccountOwnerType type,
			UUID id) {
	}

}
