package com.crm.platform.settings.application.dto;

import java.time.Instant;
import java.util.UUID;

public record ActiveSessionDto(
		UUID sessionId,
		UUID userId,
		String userEmail,
		String userName,
		String ipAddress,
		String userAgent,
		String deviceType,
		Instant loginAt,
		Instant lastActivityAt,
		boolean isCurrentSession
) {}
