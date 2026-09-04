package com.crm.customer.lead.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record BulkAssignLeadsRequest(
		@NotEmpty List<UUID> leadIds,
		@NotBlank @Pattern(regexp = "^(USER|TEAM)$") String ownerType,
		@NotNull UUID ownerId
) {}
