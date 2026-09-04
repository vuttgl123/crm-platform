package com.crm.platform.settings.presentation.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateNotificationRequest(
		boolean customSmtpEnabled,
		@Size(max = 255) String smtpHost,
		@Min(1) @Max(65535) int smtpPort,
		@Size(max = 255) String smtpUsername,
		@Size(max = 255) String smtpPassword,
		@Email @Size(max = 320) String smtpSenderEmail,
		@Size(max = 255) String smtpSenderName,
		boolean slackWebhookEnabled,
		@Size(max = 500) String slackWebhookUrl,
		@Size(max = 100) String slackChannel,
		boolean teamsWebhookEnabled,
		@Size(max = 500) String teamsWebhookUrl,
		boolean inAppNotificationsEnabled
) {}
