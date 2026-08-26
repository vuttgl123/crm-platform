package com.crm.overview.application.dto;

import java.util.List;

/**
 * Sales performance ranked by weighted forecast value.
 *
 * <p>Omitted entirely when the actor's data scope is {@code OWN}, because a
 * leaderboard containing only the reader ranks nothing.
 */
public record LeaderboardBlock(
		String currencyCode,
		List<LeaderboardEntry> entries
) {
}
