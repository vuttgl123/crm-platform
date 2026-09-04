package com.crm.platform.team.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record TransferTeamManagerRequest(
		@NotNull UUID newManagerUserId
) {}
