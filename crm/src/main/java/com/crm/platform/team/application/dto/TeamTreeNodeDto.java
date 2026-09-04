package com.crm.platform.team.application.dto;

import java.util.List;
import java.util.UUID;

public record TeamTreeNodeDto(
		UUID id,
		String name,
		String description,
		UUID parentTeamId,
		UUID managerUserId,
		String managerName,
		String status,
		long memberCount,
		List<TeamTreeNodeDto> children
) {}
