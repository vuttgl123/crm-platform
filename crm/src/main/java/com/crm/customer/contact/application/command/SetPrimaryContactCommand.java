package com.crm.customer.contact.application.command;

import com.crm.customer.contact.domain.ContactId;

public record SetPrimaryContactCommand(
		ContactId id,
		boolean isPrimary,
		long expectedVersion
) {}
