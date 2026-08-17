package com.crm.platform.team.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.team.domain.TeamStatus;

public record TeamSummaryResponse(
		UUID id,
		String name,
		String description,
		UUID parentTeamId,
		String parentTeamName,
		UUID managerUserId,
		TeamStatus status,
		int activeMembersCount,
		Instant updatedAt,
		long version
) {
}
