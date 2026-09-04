package com.crm.service.ticket.application.command;

import java.util.List;
import java.util.UUID;

public record BulkAssignTicketsCommand(
		List<UUID> ticketIds,
		UUID assignedUserId,
		UUID assignedTeamId
) {}
