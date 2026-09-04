package com.crm.platform.settings.application.dto;

public record NotificationSettingsDto(
		boolean customSmtpEnabled,
		String smtpHost,
		int smtpPort,
		String smtpUsername,
		String smtpSenderEmail,
		String smtpSenderName,
		boolean slackWebhookEnabled,
		String slackWebhookUrl,
		String slackChannel,
		boolean teamsWebhookEnabled,
		String teamsWebhookUrl,
		boolean inAppNotificationsEnabled
) {}
