package com.crm.sales.quote.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteSearchRequest(
		String q,
		UUID accountId,
		UUID opportunityId,
		QuoteStatus status,
		UUID ownerUserId,
		@PositiveOrZero @Min(0) Integer page,
		@PositiveOrZero @Min(1) @Max(100) Integer size) {
}
