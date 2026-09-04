package com.crm.platform.team.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangeTeamStatusRequest(
		@NotBlank @Pattern(regexp = "^(ACTIVE|INACTIVE)$") String status
) {}
