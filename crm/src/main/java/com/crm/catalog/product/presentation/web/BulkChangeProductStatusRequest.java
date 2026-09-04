package com.crm.catalog.product.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record BulkChangeProductStatusRequest(
		@NotEmpty List<UUID> productIds,
		@NotNull Boolean active
) {}
