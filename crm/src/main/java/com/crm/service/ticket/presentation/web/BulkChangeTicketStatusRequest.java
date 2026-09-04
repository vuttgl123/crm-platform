package com.crm.service.ticket.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record BulkChangeTicketStatusRequest(
		@NotEmpty List<UUID> ticketIds,
		@NotBlank String status
) {}
