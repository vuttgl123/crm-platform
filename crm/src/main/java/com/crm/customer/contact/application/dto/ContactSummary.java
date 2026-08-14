package com.crm.customer.contact.application.dto;

import java.time.Instant;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.contact.domain.ContactLifecycleStage;
import com.crm.customer.contact.domain.ContactOwner;
import com.crm.customer.contact.domain.PreferredContactChannel;

public record ContactSummary(
		ContactId id,
		String contactNumber,
		AccountId accountId,
		String displayName,
		String jobTitle,
		String department,
		PreferredContactChannel preferredContactChannel,
		ContactLifecycleStage lifecycleStage,
		ContactOwner owner,
		boolean doNotContact,
		Instant updatedAt,
		long version) {
}
