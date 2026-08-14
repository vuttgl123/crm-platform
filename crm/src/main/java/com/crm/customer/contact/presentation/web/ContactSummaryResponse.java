package com.crm.customer.contact.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.contact.domain.ContactLifecycleStage;
import com.crm.customer.contact.domain.PreferredContactChannel;

public record ContactSummaryResponse(
		UUID id,
		String contactNumber,
		UUID accountId,
		String displayName,
		String jobTitle,
		String department,
		PreferredContactChannel preferredContactChannel,
		ContactLifecycleStage lifecycleStage,
		Owner owner,
		boolean doNotContact,
		Instant updatedAt,
		long version) {

	public record Owner(
			AccountOwnerType type,
			UUID id) {
	}

}
