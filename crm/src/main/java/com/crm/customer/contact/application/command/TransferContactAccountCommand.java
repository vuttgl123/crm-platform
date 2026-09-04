package com.crm.customer.contact.application.command;

import java.util.UUID;

import com.crm.customer.contact.domain.ContactId;

public record TransferContactAccountCommand(
		ContactId id,
		UUID newAccountId,
		String jobTitle,
		long expectedVersion
) {}
