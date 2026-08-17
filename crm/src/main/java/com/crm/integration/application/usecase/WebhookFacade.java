package com.crm.integration.application.usecase;

import java.util.List;
import java.util.UUID;

import com.crm.integration.application.command.CreateWebhookSubscriptionCommand;
import com.crm.integration.application.command.UpdateWebhookSubscriptionCommand;
import com.crm.integration.application.dto.WebhookDeliveryDetails;
import com.crm.integration.application.dto.WebhookSubscriptionDetails;
import com.crm.integration.application.dto.WebhookSubscriptionSummary;
import com.crm.integration.domain.WebhookDeliveryId;
import com.crm.integration.domain.WebhookSubscriptionId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;

public interface WebhookFacade {

	WebhookSubscriptionDetails create(CreateWebhookSubscriptionCommand command);

	WebhookSubscriptionDetails get(WebhookSubscriptionId id);

	List<WebhookSubscriptionSummary> list();

	WebhookSubscriptionDetails update(UpdateWebhookSubscriptionCommand command);

	void delete(WebhookSubscriptionId id, long version);

	WebhookDeliveryDetails ping(WebhookSubscriptionId id);

	PageResult<WebhookDeliveryDetails> listDeliveries(WebhookSubscriptionId id, PageQuery page);

	WebhookDeliveryDetails retryDelivery(WebhookSubscriptionId subscriptionId, WebhookDeliveryId deliveryId);

}
