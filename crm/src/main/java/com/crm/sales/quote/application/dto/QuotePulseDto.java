package com.crm.sales.quote.application.dto;

import java.time.Instant;
import java.util.List;

public record QuotePulseDto(
		String revisionScope,
		Instant asOf,
		String tenantTimezone,
		List<QuotePulseCurrencyGroupDto> currencyGroups
) {
}
