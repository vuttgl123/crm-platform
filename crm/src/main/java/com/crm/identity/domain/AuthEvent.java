package com.crm.identity.domain;

import java.time.Instant;
import java.util.UUID;

public record AuthEvent(
		UUID id,
		UUID userId,
		UUID sessionId,
		String eventType,
		String provider,
		boolean success,
		String email,
		String failureCode,
		String ipAddress,
		String userAgent,
		Instant occurredAt) {
}
