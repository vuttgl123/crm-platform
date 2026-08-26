package com.crm.overview.application.dto;

/**
 * Headline revenue and pipeline figures for the selected period.
 *
 * <p>Every amount is denominated in {@code currencyCode}; the system holds no
 * exchange rates, so figures are never summed across currencies.
 * {@code closedWonChangePercent} is {@code null} when the previous period closed
 * nothing, because growth from zero has no defined percentage.
 */
public record RevenueBlock(
		String currencyCode,
		String closedWonAmount,
		String previousClosedWonAmount,
		Double closedWonChangePercent,
		long closedWonCount,
		String openPipelineAmount,
		String weightedForecastAmount,
		long openOpportunityCount
) {
}
