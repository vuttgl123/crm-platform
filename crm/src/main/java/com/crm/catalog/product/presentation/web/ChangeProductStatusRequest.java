package com.crm.catalog.product.presentation.web;

import jakarta.validation.constraints.NotNull;

public record ChangeProductStatusRequest(
		@NotNull Boolean active
) {}
