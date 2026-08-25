package com.crm.sales.order.presentation.web;

import jakarta.validation.constraints.NotBlank;

public record VoidOrderFulfillmentRequest(
		@NotBlank String reason
) {}
