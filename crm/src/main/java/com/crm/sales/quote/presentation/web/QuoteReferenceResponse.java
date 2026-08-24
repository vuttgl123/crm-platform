package com.crm.sales.quote.presentation.web;

import java.util.UUID;

public record QuoteReferenceResponse(
		UUID id,
		String label,
		boolean routeAvailable
) {
}
