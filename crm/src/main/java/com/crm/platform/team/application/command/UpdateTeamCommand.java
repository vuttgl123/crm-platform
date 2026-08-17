package com.crm.platform.team.application.command;

import java.util.UUID;

import com.crm.platform.team.domain.TeamId;
import com.crm.platform.team.domain.TeamStatus;

public record UpdateTeamCommand(
		TeamId id,
		long version,
		String name,
		String description,
		TeamId parentTeamId,
		UUID managerUserId,
		TeamStatus status
) {
}
