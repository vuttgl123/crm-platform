package com.crm.notification.application.dto;

import java.util.UUID;

public record NotificationItemDto(
		UUID id,
		String title,
		String message,
		String category,
		String priority,
		boolean isRead,
		String actionUrl,
		String createdAt
) {}
