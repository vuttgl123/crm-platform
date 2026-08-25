package com.crm.sales.order.presentation.web;

import jakarta.validation.constraints.NotBlank;

public record CancelOrderRequest(
		@NotBlank String reason
) {}
