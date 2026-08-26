package com.crm.overview.application.dto;

import java.util.List;

/**
 * Account counts per lifecycle stage.
 *
 * <p>{@code stages} always lists all five lifecycle values, padding absent ones
 * with zero, so the reader never has to infer which stage is missing.
 * {@code churnedSharePercent} is {@code null} when there are no accounts at all.
 */
public record CustomerBaseBlock(
		long totalCount,
		List<LifecycleCount> stages,
		Double churnedSharePercent
) {
}
