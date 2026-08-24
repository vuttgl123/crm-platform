package com.crm.sales.forecast.application.dto;

import java.util.UUID;

public record ForecastOwnerFilterDto(
		String type,
		UUID id,
		String label
) {
}
