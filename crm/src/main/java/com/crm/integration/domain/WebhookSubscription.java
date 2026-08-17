package com.crm.integration.domain;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class WebhookSubscription {

	private final TenantId tenantId;
	private final WebhookSubscriptionId id;
	private String name;
	private String endpointUrl;
	private List<String> eventTypes;
	private String secretReference;
	private SignatureAlgorithm signatureAlgorithm;
	private String customHeaders;
	private int timeoutSeconds;
	private int maxRetries;
	private WebhookStatus status;
	private Instant lastSuccessAt;
	private Instant lastFailureAt;
	private final AuditInfo auditInfo;
	private long version;

	public WebhookSubscription(TenantId tenantId, WebhookSubscriptionId id, String name,
			String endpointUrl, List<String> eventTypes, String secretReference,
			SignatureAlgorithm signatureAlgorithm, String customHeaders,
			int timeoutSeconds, int maxRetries, WebhookStatus status,
			Instant lastSuccessAt, Instant lastFailureAt, AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.name = Objects.requireNonNull(name, "name must not be null");
		this.endpointUrl = Objects.requireNonNull(endpointUrl, "endpointUrl must not be null");
		if (eventTypes == null || eventTypes.isEmpty()) {
			throw new IllegalArgumentException("eventTypes must not be empty");
		}
		this.eventTypes = List.copyOf(eventTypes);
		this.secretReference = secretReference;
		this.signatureAlgorithm = signatureAlgorithm != null ? signatureAlgorithm : SignatureAlgorithm.HMAC_SHA256;
		this.customHeaders = customHeaders != null ? customHeaders : "{}";
		this.timeoutSeconds = timeoutSeconds > 0 ? timeoutSeconds : 10;
		this.maxRetries = maxRetries >= 0 ? maxRetries : 8;
		this.status = status != null ? status : WebhookStatus.ACTIVE;
		this.lastSuccessAt = lastSuccessAt;
		this.lastFailureAt = lastFailureAt;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static WebhookSubscription create(TenantId tenantId, WebhookSubscriptionId id,
			String name, String endpointUrl, List<String> eventTypes, String secretReference,
			SignatureAlgorithm signatureAlgorithm, String customHeaders,
			int timeoutSeconds, int maxRetries, ActorId actorId, Instant now) {
		return new WebhookSubscription(tenantId, id, name.trim(), endpointUrl.trim(),
				eventTypes, secretReference,
				signatureAlgorithm != null ? signatureAlgorithm : SignatureAlgorithm.HMAC_SHA256,
				customHeaders != null ? customHeaders : "{}",
				timeoutSeconds > 0 ? timeoutSeconds : 10,
				maxRetries >= 0 ? maxRetries : 8,
				WebhookStatus.ACTIVE, null, null,
				AuditInfo.create(actorId, now), 1L);
	}

	public void update(String name, String endpointUrl, List<String> eventTypes,
			String secretReference, SignatureAlgorithm signatureAlgorithm,
			String customHeaders, int timeoutSeconds, int maxRetries,
			WebhookStatus status, ActorId actorId, Instant now) {
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.endpointUrl = Objects.requireNonNull(endpointUrl, "endpointUrl must not be null").trim();
		if (eventTypes == null || eventTypes.isEmpty()) {
			throw new IllegalArgumentException("eventTypes must not be empty");
		}
		this.eventTypes = List.copyOf(eventTypes);
		this.secretReference = secretReference;
		this.signatureAlgorithm = signatureAlgorithm != null ? signatureAlgorithm : this.signatureAlgorithm;
		this.customHeaders = customHeaders != null ? customHeaders : this.customHeaders;
		this.timeoutSeconds = timeoutSeconds > 0 ? timeoutSeconds : this.timeoutSeconds;
		this.maxRetries = maxRetries >= 0 ? maxRetries : this.maxRetries;
		this.status = status != null ? status : this.status;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void recordSuccess(Instant now) {
		this.lastSuccessAt = now;
	}

	public void recordFailure(Instant now) {
		this.lastFailureAt = now;
	}

	public void pause(ActorId actorId, Instant now) {
		this.status = WebhookStatus.PAUSED;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void activate(ActorId actorId, Instant now) {
		this.status = WebhookStatus.ACTIVE;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void disable(ActorId actorId, Instant now) {
		this.status = WebhookStatus.DISABLED;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public WebhookSubscriptionId id() {
		return id;
	}

	public String name() {
		return name;
	}

	public String endpointUrl() {
		return endpointUrl;
	}

	public List<String> eventTypes() {
		return eventTypes;
	}

	public String secretReference() {
		return secretReference;
	}

	public SignatureAlgorithm signatureAlgorithm() {
		return signatureAlgorithm;
	}

	public String customHeaders() {
		return customHeaders;
	}

	public int timeoutSeconds() {
		return timeoutSeconds;
	}

	public int maxRetries() {
		return maxRetries;
	}

	public WebhookStatus status() {
		return status;
	}

	public Instant lastSuccessAt() {
		return lastSuccessAt;
	}

	public Instant lastFailureAt() {
		return lastFailureAt;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
