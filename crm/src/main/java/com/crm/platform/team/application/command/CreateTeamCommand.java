package com.crm.platform.team.application.command;

import java.util.UUID;

import com.crm.platform.team.domain.TeamId;

public record CreateTeamCommand(
		String name,
		String description,
		TeamId parentTeamId,
		UUID managerUserId
) {
}
