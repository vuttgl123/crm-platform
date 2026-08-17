package com.crm.platform.team.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddTeamMemberRequest(
		@NotNull(message = "User ID is required")
		UUID userId,

		@Size(max = 100, message = "Member role must not exceed 100 characters")
		String memberRole,

		boolean primary
) {
}
