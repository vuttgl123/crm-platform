package com.crm.customer.lead.application.command;

import java.util.List;
import java.util.UUID;

public record BulkChangeLeadStatusCommand(
		List<UUID> leadIds,
		UUID statusId
) {}
