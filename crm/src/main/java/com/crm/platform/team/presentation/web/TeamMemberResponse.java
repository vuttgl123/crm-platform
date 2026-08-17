package com.crm.platform.team.presentation.web;

import java.time.Instant;
import java.util.UUID;

public record TeamMemberResponse(
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
