package com.crm.overview.application.dto;

import com.crm.sales.forecast.domain.ForecastPeriodPreset;

/**
 * The reporting window the overview was computed for, together with the
 * immediately preceding window of the same length used for the delta.
 */
public record OverviewPeriod(
		ForecastPeriodPreset preset,
		String fromDate,
		String toDate,
		String previousFromDate,
		String previousToDate,
		String timezone
) {
}
