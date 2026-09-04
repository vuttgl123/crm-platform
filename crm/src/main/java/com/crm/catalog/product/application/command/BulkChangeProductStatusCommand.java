package com.crm.catalog.product.application.command;

import java.util.List;
import java.util.UUID;

public record BulkChangeProductStatusCommand(
		List<UUID> productIds,
		boolean active
) {}
