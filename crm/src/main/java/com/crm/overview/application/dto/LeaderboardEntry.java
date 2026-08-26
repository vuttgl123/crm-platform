package com.crm.overview.application.dto;

import java.util.UUID;

/**
 * One row of the sales leaderboard. {@code ownerKind} is {@code USER},
 * {@code TEAM} or {@code UNASSIGNED}; {@code ownerId} is {@code null} for the
 * unassigned bucket.
 */
public record LeaderboardEntry(
		String ownerKind,
		UUID ownerId,
		String ownerLabel,
		String closedWonAmount,
		String openPipelineAmount,
		String weightedForecastAmount,
		long opportunityCount
) {
}
