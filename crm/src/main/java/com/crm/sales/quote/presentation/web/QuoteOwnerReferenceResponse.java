package com.crm.sales.quote.presentation.web;

import java.util.UUID;

public record QuoteOwnerReferenceResponse(
		String type,
		UUID id,
		String label
) {
}
