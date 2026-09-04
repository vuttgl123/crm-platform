package com.crm.customer.contact.application.command;

import java.util.List;
import java.util.UUID;

public record BulkUpdateContactLifecycleCommand(
		List<UUID> contactIds,
		String lifecycleStage
) {}
