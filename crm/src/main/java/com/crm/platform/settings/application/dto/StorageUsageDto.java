package com.crm.platform.settings.application.dto;

import java.util.Map;

public record StorageUsageDto(
		long databaseSizeBytes,
		long attachmentsSizeBytes,
		long totalAllocatedQuotaBytes,
		double usagePercentage,
		long totalDbRows,
		Map<String, Long> storageBreakdownByModule
) {}
