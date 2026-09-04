package com.crm.platform.settings.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NotificationPingTestRequest(
		@NotBlank @Size(max = 50) String channelType, // SLACK, EMAIL, TEAMS, WEBHOOK
		@NotBlank @Size(max = 500) String targetEndpoint
) {}
