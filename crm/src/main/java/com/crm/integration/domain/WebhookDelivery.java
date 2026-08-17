package com.crm.integration.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.TenantId;

public final class WebhookDelivery {

	private final TenantId tenantId;
	private final Instant createdAt;
	private final WebhookDeliveryId id;
	private final WebhookSubscriptionId subscriptionId;
	private final OutboxEventId outboxEventId;
	private final String eventType;
	private int attemptNumber;
	private String requestHeaders;
	private Integer responseStatus;
	private String responseHeaders;
	private String responseBodyExcerpt;
	private DeliveryStatus status;
	private Instant nextAttemptAt;
	private Instant startedAt;
	private Instant completedAt;
	private Integer durationMs;
	private String errorMessage;

	public WebhookDelivery(TenantId tenantId, Instant createdAt, WebhookDeliveryId id,
			WebhookSubscriptionId subscriptionId, OutboxEventId outboxEventId,
			String eventType, int attemptNumber, String requestHeaders,
			Integer responseStatus, String responseHeaders, String responseBodyExcerpt,
			DeliveryStatus status, Instant nextAttemptAt, Instant startedAt,
			Instant completedAt, Integer durationMs, String errorMessage) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.createdAt = createdAt != null ? createdAt : Instant.now();
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.subscriptionId = Objects.requireNonNull(subscriptionId, "subscriptionId must not be null");
		this.outboxEventId = outboxEventId;
		this.eventType = Objects.requireNonNull(eventType, "eventType must not be null");
		this.attemptNumber = attemptNumber > 0 ? attemptNumber : 1;
		this.requestHeaders = requestHeaders != null ? requestHeaders : "{}";
		this.responseStatus = responseStatus;
		this.responseHeaders = responseHeaders;
		this.responseBodyExcerpt = responseBodyExcerpt;
		this.status = status != null ? status : DeliveryStatus.PENDING;
		this.nextAttemptAt = nextAttemptAt;
		this.startedAt = startedAt;
		this.completedAt = completedAt;
		this.durationMs = durationMs;
		this.errorMessage = errorMessage;
	}

	public static WebhookDelivery create(TenantId tenantId, WebhookDeliveryId id,
			WebhookSubscriptionId subscriptionId, OutboxEventId outboxEventId,
			String eventType, String requestHeaders, Instant now) {
		return new WebhookDelivery(tenantId, now, id, subscriptionId, outboxEventId,
				eventType, 1, requestHeaders, null, null, null,
				DeliveryStatus.PENDING, null, null, null, null, null);
	}

	public void markSucceeded(int responseStatus, String responseHeaders,
			String responseBodyExcerpt, Instant startedAt, Instant completedAt, int durationMs) {
		this.status = DeliveryStatus.SUCCEEDED;
		this.responseStatus = responseStatus;
		this.responseHeaders = responseHeaders;
		this.responseBodyExcerpt = responseBodyExcerpt;
		this.startedAt = startedAt;
		this.completedAt = completedAt;
		this.durationMs = durationMs;
		this.errorMessage = null;
		this.nextAttemptAt = null;
	}

	public void markFailed(Integer responseStatus, String responseHeaders,
			String responseBodyExcerpt, String errorMessage, Instant startedAt,
			Instant completedAt, int durationMs, Instant nextAttemptAt, boolean isDead) {
		this.status = isDead ? DeliveryStatus.DEAD : DeliveryStatus.FAILED;
		this.responseStatus = responseStatus;
		this.responseHeaders = responseHeaders;
		this.responseBodyExcerpt = responseBodyExcerpt;
		this.errorMessage = errorMessage;
		this.startedAt = startedAt;
		this.completedAt = completedAt;
		this.durationMs = durationMs;
		this.nextAttemptAt = nextAttemptAt;
		this.attemptNumber++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public WebhookDeliveryId id() {
		return id;
	}

	public WebhookSubscriptionId subscriptionId() {
		return subscriptionId;
	}

	public OutboxEventId outboxEventId() {
		return outboxEventId;
	}

	public String eventType() {
		return eventType;
	}

	public int attemptNumber() {
		return attemptNumber;
	}

	public String requestHeaders() {
		return requestHeaders;
	}

	public Integer responseStatus() {
		return responseStatus;
	}

	public String responseHeaders() {
		return responseHeaders;
	}

	public String responseBodyExcerpt() {
		return responseBodyExcerpt;
	}

	public DeliveryStatus status() {
		return status;
	}

	public Instant nextAttemptAt() {
		return nextAttemptAt;
	}

	public Instant startedAt() {
		return startedAt;
	}

	public Instant completedAt() {
		return completedAt;
	}

	public Integer durationMs() {
		return durationMs;
	}

	public String errorMessage() {
		return errorMessage;
	}

}
