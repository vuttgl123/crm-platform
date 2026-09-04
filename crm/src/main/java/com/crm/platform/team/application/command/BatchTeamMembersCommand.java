package com.crm.platform.team.application.command;

import java.util.List;
import java.util.UUID;

import com.crm.platform.team.domain.TeamId;

public record BatchTeamMembersCommand(
		TeamId teamId,
		List<UUID> addMemberUserIds,
		List<UUID> removeMemberUserIds,
		String defaultMemberRole
) {}
