package com.crm.customer.tag.application.command;

public record CreateTagCommand(
		String tagKey,
		String name,
		String description,
		String colorHex
) {
}
