package com.crm.platform.team.application.command;

import java.util.UUID;

import com.crm.platform.team.domain.TeamId;

public record AddTeamMemberCommand(
		TeamId teamId,
		UUID userId,
		String memberRole,
		boolean primary
) {
}
