package com.crm.platform.team.application.dto;

import java.time.Instant;
import java.util.UUID;

public record TeamMemberDetails(
		UUID teamId,
		UUID userId,
		String userDisplayName,
		String userEmail,
		String memberRole,
		boolean primary,
		Instant joinedAt,
		Instant leftAt
) {
}
