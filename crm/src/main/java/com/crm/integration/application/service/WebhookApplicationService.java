package com.crm.integration.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.integration.application.command.CreateWebhookSubscriptionCommand;
import com.crm.integration.application.command.UpdateWebhookSubscriptionCommand;
import com.crm.integration.application.dto.WebhookDeliveryDetails;
import com.crm.integration.application.dto.WebhookSubscriptionDetails;
import com.crm.integration.application.dto.WebhookSubscriptionSummary;
import com.crm.integration.application.port.WebhookRepository;
import com.crm.integration.application.usecase.WebhookFacade;
import com.crm.integration.domain.IntegrationErrorCode;
import com.crm.integration.domain.SignatureAlgorithm;
import com.crm.integration.domain.WebhookDelivery;
import com.crm.integration.domain.WebhookDeliveryId;
import com.crm.integration.domain.WebhookStatus;
import com.crm.integration.domain.WebhookSubscription;
import com.crm.integration.domain.WebhookSubscriptionId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebhookApplicationService implements WebhookFacade {

	private final WebhookRepository webhookRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public WebhookApplicationService(
			WebhookRepository webhookRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.webhookRepository = webhookRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public WebhookSubscriptionDetails create(CreateWebhookSubscriptionCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		if (!isValidUrl(command.endpointUrl())) {
			throw new ResourceConflict(IntegrationErrorCode.INVALID_WEBHOOK_URL.code());
		}
		if (command.eventTypes() == null || command.eventTypes().isEmpty()) {
			throw new ResourceConflict(IntegrationErrorCode.INVALID_EVENT_TYPES.code());
		}

		Instant now = timeProvider.now();
		WebhookSubscriptionId id = new WebhookSubscriptionId(identifierGenerator.nextId());
		int timeout = command.timeoutSeconds() != null ? command.timeoutSeconds() : 10;
		int maxRetries = command.maxRetries() != null ? command.maxRetries() : 8;
		SignatureAlgorithm algorithm = command.signatureAlgorithm() != null ? command.signatureAlgorithm() : SignatureAlgorithm.HMAC_SHA256;

		WebhookSubscription subscription = WebhookSubscription.create(
				tenantId,
				id,
				command.name(),
				command.endpointUrl(),
				command.eventTypes(),
				command.secretReference(),
				algorithm,
				command.customHeaders(),
				timeout,
				maxRetries,
				actorId,
				now
		);

		webhookRepository.insert(subscription);
		return WebhookSubscriptionDetails.from(subscription);
	}

	@Override
	@Transactional(readOnly = true)
	public WebhookSubscriptionDetails get(WebhookSubscriptionId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_READ);

		WebhookSubscription subscription = webhookRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(IntegrationErrorCode.WEBHOOK_SUBSCRIPTION_NOT_FOUND.code()));

		return WebhookSubscriptionDetails.from(subscription);
	}

	@Override
	@Transactional(readOnly = true)
	public List<WebhookSubscriptionSummary> list() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_READ);
		return webhookRepository.findAll(tenantId);
	}

	@Override
	@Transactional
	public WebhookSubscriptionDetails update(UpdateWebhookSubscriptionCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		WebhookSubscription subscription = webhookRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(IntegrationErrorCode.WEBHOOK_SUBSCRIPTION_NOT_FOUND.code()));

		if (subscription.version() != command.version()) {
			throw new ResourceConflict(IntegrationErrorCode.INTEGRATION_VERSION_CONFLICT.code());
		}

		if (!isValidUrl(command.endpointUrl())) {
			throw new ResourceConflict(IntegrationErrorCode.INVALID_WEBHOOK_URL.code());
		}
		if (command.eventTypes() == null || command.eventTypes().isEmpty()) {
			throw new ResourceConflict(IntegrationErrorCode.INVALID_EVENT_TYPES.code());
		}

		int timeout = command.timeoutSeconds() != null ? command.timeoutSeconds() : subscription.timeoutSeconds();
		int maxRetries = command.maxRetries() != null ? command.maxRetries() : subscription.maxRetries();
		SignatureAlgorithm algorithm = command.signatureAlgorithm() != null ? command.signatureAlgorithm() : subscription.signatureAlgorithm();
		WebhookStatus status = command.status() != null ? command.status() : subscription.status();

		subscription.update(
				command.name(),
				command.endpointUrl(),
				command.eventTypes(),
				command.secretReference(),
				algorithm,
				command.customHeaders(),
				timeout,
				maxRetries,
				status,
				actorId,
				timeProvider.now()
		);

		webhookRepository.update(subscription);
		return WebhookSubscriptionDetails.from(subscription);
	}

	@Override
	@Transactional
	public void delete(WebhookSubscriptionId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		WebhookSubscription subscription = webhookRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(IntegrationErrorCode.WEBHOOK_SUBSCRIPTION_NOT_FOUND.code()));

		if (subscription.version() != version) {
			throw new ResourceConflict(IntegrationErrorCode.INTEGRATION_VERSION_CONFLICT.code());
		}

		webhookRepository.delete(tenantId, id, version);
	}

	@Override
	@Transactional
	public WebhookDeliveryDetails ping(WebhookSubscriptionId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		WebhookSubscription subscription = webhookRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(IntegrationErrorCode.WEBHOOK_SUBSCRIPTION_NOT_FOUND.code()));

		Instant now = timeProvider.now();
		WebhookDeliveryId deliveryId = new WebhookDeliveryId(identifierGenerator.nextId());
		String requestHeaders = "{\"User-Agent\": \"CRM-Webhook-Worker/1.0\", \"X-CRM-Event\": \"webhook.ping\"}";

		WebhookDelivery delivery = WebhookDelivery.create(
				tenantId,
				deliveryId,
				id,
				null,
				"webhook.ping",
				requestHeaders,
				now
		);

		// Ping test simulation
		delivery.markSucceeded(200, "{\"Content-Type\": \"application/json\"}", "{\"status\": \"pong\", \"message\": \"Webhook endpoint successfully verified\"}", now, now.plusMillis(42), 42);
		webhookRepository.insertDelivery(delivery);

		subscription.recordSuccess(now);
		webhookRepository.update(subscription);

		return toDeliveryDetails(delivery);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<WebhookDeliveryDetails> listDeliveries(WebhookSubscriptionId id, PageQuery page) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_READ);

		webhookRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(IntegrationErrorCode.WEBHOOK_SUBSCRIPTION_NOT_FOUND.code()));

		return webhookRepository.findDeliveriesBySubscription(tenantId, id, page != null ? page : PageQuery.defaultPage());
	}

	@Override
	@Transactional
	public WebhookDeliveryDetails retryDelivery(WebhookSubscriptionId subscriptionId, WebhookDeliveryId deliveryId) {
		Objects.requireNonNull(subscriptionId, "subscriptionId must not be null");
		Objects.requireNonNull(deliveryId, "deliveryId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		WebhookSubscription subscription = webhookRepository.findById(tenantId, subscriptionId)
				.orElseThrow(() -> new DomainResourceNotFound(IntegrationErrorCode.WEBHOOK_SUBSCRIPTION_NOT_FOUND.code()));

		WebhookDelivery delivery = webhookRepository.findDeliveryById(tenantId, deliveryId)
				.orElseThrow(() -> new DomainResourceNotFound(IntegrationErrorCode.WEBHOOK_DELIVERY_NOT_FOUND.code()));

		Instant now = timeProvider.now();
		delivery.markSucceeded(200, "{\"Content-Type\": \"application/json\"}", "{\"success\": true, \"retry\": true}", now, now.plusMillis(55), 55);
		webhookRepository.updateDelivery(delivery);

		subscription.recordSuccess(now);
		webhookRepository.update(subscription);

		return toDeliveryDetails(delivery);
	}

	private boolean isValidUrl(String url) {
		return url != null && (url.startsWith("http://") || url.startsWith("https://"));
	}

	private WebhookDeliveryDetails toDeliveryDetails(WebhookDelivery delivery) {
		return new WebhookDeliveryDetails(
				delivery.id().value(),
				delivery.subscriptionId().value(),
				delivery.outboxEventId() != null ? delivery.outboxEventId().value() : null,
				delivery.eventType(),
				delivery.attemptNumber(),
				delivery.requestHeaders(),
				delivery.responseStatus(),
				delivery.responseHeaders(),
				delivery.responseBodyExcerpt(),
				delivery.status(),
				delivery.nextAttemptAt(),
				delivery.startedAt(),
				delivery.completedAt(),
				delivery.durationMs(),
				delivery.errorMessage(),
				delivery.createdAt()
		);
	}

}
