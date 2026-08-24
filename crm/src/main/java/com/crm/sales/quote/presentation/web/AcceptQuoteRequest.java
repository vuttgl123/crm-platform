package com.crm.sales.quote.presentation.web;

import jakarta.validation.constraints.Size;

public record AcceptQuoteRequest(
		@Size(max = 255) String customerReference
) {
}
