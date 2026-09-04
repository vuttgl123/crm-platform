package com.crm.catalog.product.application.command;

import com.crm.catalog.product.domain.ProductId;

public record ChangeProductStatusCommand(
		ProductId id,
		boolean active
) {}
