package com.crm.platform.access.application.dto;

import java.time.Instant;
import java.util.UUID;

public record RoleMemberSummaryDto(
		UUID userId,
		String email,
		String displayName,
		String jobTitle,
		String employeeReference,
		Instant assignedAt,
		String assignedBy
) {}
