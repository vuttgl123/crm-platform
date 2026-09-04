package com.crm.catalog.pricebook.presentation.web;

import jakarta.validation.constraints.NotNull;

public record ChangePriceBookStatusRequest(
		@NotNull Boolean active
) {}
