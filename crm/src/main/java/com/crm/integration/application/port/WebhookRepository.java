package com.crm.integration.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.integration.application.dto.WebhookDeliveryDetails;
import com.crm.integration.application.dto.WebhookSubscriptionSummary;
import com.crm.integration.domain.WebhookDelivery;
import com.crm.integration.domain.WebhookDeliveryId;
import com.crm.integration.domain.WebhookSubscription;
import com.crm.integration.domain.WebhookSubscriptionId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface WebhookRepository {

	Optional<WebhookSubscription> findById(TenantId tenantId, WebhookSubscriptionId id);

	List<WebhookSubscriptionSummary> findAll(TenantId tenantId);

	void insert(WebhookSubscription subscription);

	void update(WebhookSubscription subscription);

	void delete(TenantId tenantId, WebhookSubscriptionId id, long version);

	void insertDelivery(WebhookDelivery delivery);

	void updateDelivery(WebhookDelivery delivery);

	Optional<WebhookDelivery> findDeliveryById(TenantId tenantId, WebhookDeliveryId id);

	PageResult<WebhookDeliveryDetails> findDeliveriesBySubscription(
			TenantId tenantId, WebhookSubscriptionId subscriptionId, PageQuery page);

}
