package com.crm.platform.team.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.platform.team.domain.TeamStatus;

public record UpdateTeamRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Team name must not be blank")
		@Size(max = 255, message = "Team name must not exceed 255 characters")
		String name,

		@Size(max = 1000, message = "Description must not exceed 1000 characters")
		String description,

		UUID parentTeamId,
		UUID managerUserId,
		TeamStatus status
) {
}
