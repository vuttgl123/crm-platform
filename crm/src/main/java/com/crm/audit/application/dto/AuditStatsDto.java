package com.crm.audit.application.dto;

public record AuditStatsDto(
		long totalAuditEvents,
		long mutationEvents,
		long dataAccessEvents,
		long distinctActorsCount,
		long eventsLast24Hours
) {}
