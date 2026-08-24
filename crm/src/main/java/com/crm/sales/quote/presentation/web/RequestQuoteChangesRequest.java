package com.crm.sales.quote.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RequestQuoteChangesRequest(
		@NotBlank @Size(max = 2000) String reason
) {
}
