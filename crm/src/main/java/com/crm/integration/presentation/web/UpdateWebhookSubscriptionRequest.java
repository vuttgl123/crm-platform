package com.crm.integration.presentation.web;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.integration.domain.SignatureAlgorithm;
import com.crm.integration.domain.WebhookStatus;

public record UpdateWebhookSubscriptionRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Webhook name must not be blank")
		@Size(max = 255, message = "Webhook name must not exceed 255 characters")
		String name,

		@NotBlank(message = "Endpoint URL must not be blank")
		@Pattern(regexp = "^https?://.*", message = "Endpoint URL must begin with http:// or https://")
		@Size(max = 2000, message = "Endpoint URL must not exceed 2000 characters")
		String endpointUrl,

		@NotEmpty(message = "At least one event type must be specified")
		List<String> eventTypes,

		@Size(max = 255, message = "Secret reference must not exceed 255 characters")
		String secretReference,

		SignatureAlgorithm signatureAlgorithm,

		String customHeaders,

		@Min(value = 1, message = "Timeout must be between 1 and 120 seconds")
		@Max(value = 120, message = "Timeout must be between 1 and 120 seconds")
		Integer timeoutSeconds,

		@Min(value = 0, message = "Max retries must be between 0 and 100")
		@Max(value = 100, message = "Max retries must be between 0 and 100")
		Integer maxRetries,

		WebhookStatus status
) {
}
