package com.crm.overview.application.dto;

/**
 * The whole overview screen in one payload.
 *
 * <p>A {@code null} block means the actor lacks the permission or the data scope
 * that block requires, and the reader should not render it. A block that is
 * present but holds an empty collection means the actor may see that data and
 * there is none. Conflating the two would tell a new salesperson that the system
 * is broken when it is merely empty.
 */
public record OverviewResponse(
		OverviewPeriod period,
		String asOf,
		RevenueBlock revenue,
		FunnelBlock funnel,
		TopOpportunitiesBlock topOpportunities,
		LeaderboardBlock leaderboard,
		CustomerBaseBlock customerBase,
		MyDayBlock myDay
) {
}
