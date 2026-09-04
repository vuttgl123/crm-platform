package com.crm.platform.settings.application.command;

public record UpdateNotificationGatewaysCommand(
		boolean customSmtpEnabled,
		String smtpHost,
		int smtpPort,
		String smtpUsername,
		String smtpPassword,
		String smtpSenderEmail,
		String smtpSenderName,
		boolean slackWebhookEnabled,
		String slackWebhookUrl,
		String slackChannel,
		boolean teamsWebhookEnabled,
		String teamsWebhookUrl,
		boolean inAppNotificationsEnabled
) {}
