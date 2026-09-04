package com.crm.service.ticket.application.dto;

public record TicketStatsDto(
		long totalTickets,
		long openTickets,
		long inProgressTickets,
		long pendingCustomerTickets,
		long resolvedTodayCount,
		long closedTickets,
		long urgentTicketsCount
) {}
