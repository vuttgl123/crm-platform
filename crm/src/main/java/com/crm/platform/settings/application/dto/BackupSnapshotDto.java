package com.crm.platform.settings.application.dto;

import java.time.Instant;
import java.util.UUID;

public record BackupSnapshotDto(
		UUID backupId,
		String backupFileName,
		long fileSizeBytes,
		String status, // COMPLETED, IN_PROGRESS, FAILED
		Instant createdAt,
		Instant expiresAt,
		String downloadUrl
) {}
