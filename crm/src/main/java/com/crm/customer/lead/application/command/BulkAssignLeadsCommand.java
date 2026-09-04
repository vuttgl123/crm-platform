package com.crm.customer.lead.application.command;

import java.util.List;
import java.util.UUID;

public record BulkAssignLeadsCommand(
		List<UUID> leadIds,
		String ownerType,
		UUID ownerId
) {}
