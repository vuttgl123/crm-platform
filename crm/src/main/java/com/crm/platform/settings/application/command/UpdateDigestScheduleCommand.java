package com.crm.platform.settings.application.command;

import java.util.List;
import java.util.UUID;

public record UpdateDigestScheduleCommand(
		boolean enabled,
		String frequency,
		String deliveryTime,
		String timezone,
		List<UUID> recipientUserIds,
		List<String> recipientEmails,
		List<String> includedMetricKeys
) {}
