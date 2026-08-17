package com.crm.customer.tag.application.command;

import com.crm.customer.tag.domain.TagId;

public record UpdateTagCommand(
		TagId id,
		long version,
		String name,
		String description,
		String colorHex,
		boolean active
) {
}
