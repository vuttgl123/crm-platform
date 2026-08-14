package com.crm.sales.order.presentation.web;

import jakarta.validation.constraints.Size;

public record CancelOrderRequest(
		@Size(max = 255) String reason) {
}
