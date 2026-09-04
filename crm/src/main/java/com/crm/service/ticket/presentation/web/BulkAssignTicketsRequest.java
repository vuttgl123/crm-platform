package com.crm.service.ticket.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;

public record BulkAssignTicketsRequest(
		@NotEmpty List<UUID> ticketIds,
		UUID assignedUserId,
		UUID assignedTeamId
) {}
