package com.crm.sales.quote.application.dto;

import java.util.UUID;

public record QuoteReferenceDto(
		UUID id,
		String label,
		boolean routeAvailable
) {
}
