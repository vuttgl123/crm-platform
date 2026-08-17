package com.crm.integration.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.integration.application.command.CreateWebhookSubscriptionCommand;
import com.crm.integration.application.command.UpdateWebhookSubscriptionCommand;
import com.crm.integration.application.dto.WebhookDeliveryDetails;
import com.crm.integration.application.dto.WebhookSubscriptionDetails;
import com.crm.integration.application.dto.WebhookSubscriptionSummary;
import com.crm.integration.domain.WebhookDeliveryId;
import com.crm.integration.domain.WebhookSubscriptionId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface WebhookWebMapper {

	CreateWebhookSubscriptionCommand toCreateCommand(CreateWebhookSubscriptionRequest request);

	default UpdateWebhookSubscriptionCommand toUpdateCommand(WebhookSubscriptionId id, UpdateWebhookSubscriptionRequest request) {
		return new UpdateWebhookSubscriptionCommand(
				id,
				request.version(),
				request.name(),
				request.endpointUrl(),
				request.eventTypes(),
				request.secretReference(),
				request.signatureAlgorithm(),
				request.customHeaders(),
				request.timeoutSeconds(),
				request.maxRetries(),
				request.status()
		);
	}

	WebhookSubscriptionResponse toResponse(WebhookSubscriptionDetails details);

	WebhookSubscriptionSummaryResponse toSummaryResponse(WebhookSubscriptionSummary summary);

	List<WebhookSubscriptionSummaryResponse> toSummaryResponseList(List<WebhookSubscriptionSummary> summaries);

	WebhookDeliveryResponse toDeliveryResponse(WebhookDeliveryDetails details);

	default PageResult<WebhookDeliveryResponse> toDeliveryPage(PageResult<WebhookDeliveryDetails> page) {
		return page.map(this::toDeliveryResponse);
	}

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(WebhookSubscriptionId value) {
		return value == null ? null : value.value();
	}

	default WebhookSubscriptionId mapToWebhookSubscriptionId(UUID value) {
		return value == null ? null : new WebhookSubscriptionId(value);
	}

	default UUID map(WebhookDeliveryId value) {
		return value == null ? null : value.value();
	}

	default WebhookDeliveryId mapToWebhookDeliveryId(UUID value) {
		return value == null ? null : new WebhookDeliveryId(value);
	}

}
