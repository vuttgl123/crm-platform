package com.crm.sales.order.presentation.web;

import jakarta.validation.constraints.NotBlank;

public record CloseRemainingOrderRequest(
		@NotBlank String reason
) {}
