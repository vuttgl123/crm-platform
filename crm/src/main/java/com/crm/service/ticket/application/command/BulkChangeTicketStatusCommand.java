package com.crm.service.ticket.application.command;

import java.util.List;
import java.util.UUID;

public record BulkChangeTicketStatusCommand(
		List<UUID> ticketIds,
		String status
) {}
