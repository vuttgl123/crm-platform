package com.crm.customer.contact.application.command;

import com.crm.customer.contact.domain.ContactId;

public record DeleteContactCommand(
		ContactId contactId,
		long expectedVersion) {
}
