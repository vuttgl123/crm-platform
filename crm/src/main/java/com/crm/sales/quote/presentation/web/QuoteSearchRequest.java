package com.crm.sales.quote.presentation.web;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.format.annotation.DateTimeFormat;

public record QuoteSearchRequest(
		String q,
		List<String> status,
		UUID accountId,
		UUID opportunityId,
		String ownerType,
		UUID ownerId,
		String currencyCode,
		String validity,
		@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueFrom,
		@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueTo,
		@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate validFrom,
		@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate validTo,
		Boolean latestOnly,
		String sort,
		String direction,
		@PositiveOrZero @Min(0) Integer page,
		@PositiveOrZero @Min(1) @Max(100) Integer size
) {
}
