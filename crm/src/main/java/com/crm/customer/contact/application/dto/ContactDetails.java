package com.crm.customer.contact.application.dto;

import java.time.Instant;
import java.time.LocalDate;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.contact.domain.ContactLifecycleStage;
import com.crm.customer.contact.domain.ContactOwner;
import com.crm.customer.contact.domain.PreferredContactChannel;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public record ContactDetails(
		TenantId tenantId,
		ContactId id,
		String contactNumber,
		AccountId accountId,
		ContactOwner owner,
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
		ActorId createdBy,
		Instant updatedAt,
		ActorId updatedBy,
		long version) {
}
