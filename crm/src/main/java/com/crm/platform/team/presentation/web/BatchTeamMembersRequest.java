package com.crm.platform.team.presentation.web;

import java.util.List;
import java.util.UUID;

public record BatchTeamMembersRequest(
		List<UUID> addMemberUserIds,
		List<UUID> removeMemberUserIds,
		String defaultMemberRole
) {}
