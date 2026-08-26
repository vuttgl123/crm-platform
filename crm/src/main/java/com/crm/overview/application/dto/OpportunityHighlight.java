package com.crm.overview.application.dto;

import java.util.UUID;

public record OpportunityHighlight(
		UUID id,
		String name,
		String accountName,
		String stageName,
		String ownerName,
		String amount,
		String currencyCode,
		Double probability,
		String expectedCloseDate
) {
}
