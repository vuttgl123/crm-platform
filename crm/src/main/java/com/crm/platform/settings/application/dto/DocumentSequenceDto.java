package com.crm.platform.settings.application.dto;

import java.time.Instant;

public record DocumentSequenceDto(
		String entityType,
		String prefix,
		String dateFormatPattern,
		int paddingLength,
		long currentValue,
		String previewFormattedNumber,
		Instant updatedAt
) {}
