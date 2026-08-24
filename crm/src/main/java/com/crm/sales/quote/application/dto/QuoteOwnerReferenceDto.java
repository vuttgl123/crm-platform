package com.crm.sales.quote.application.dto;

import java.util.UUID;

public record QuoteOwnerReferenceDto(
		String type,
		UUID id,
		String label
) {
}
