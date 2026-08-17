package com.crm.platform.team.presentation.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.platform.team.domain.TeamStatus;

public record TeamResponse(
		UUID id,
		String name,
		String description,
		UUID parentTeamId,
		UUID managerUserId,
		TeamStatus status,
		List<TeamMemberResponse> members,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
