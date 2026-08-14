package com.crm.customer.contact.application.command;

import java.time.LocalDate;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactLifecycleStage;
import com.crm.customer.contact.domain.ContactOwner;
import com.crm.customer.contact.domain.PreferredContactChannel;

public record CreateContactCommand(
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
		String description) {
}
