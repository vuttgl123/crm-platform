package com.crm.platform.team.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.team.domain.TeamStatus;

public record TeamSummary(
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
