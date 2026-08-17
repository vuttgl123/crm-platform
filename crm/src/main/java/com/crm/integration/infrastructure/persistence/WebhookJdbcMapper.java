package com.crm.integration.infrastructure.persistence;

import java.sql.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import com.crm.integration.application.dto.WebhookDeliveryDetails;
import com.crm.integration.application.dto.WebhookSubscriptionSummary;
import com.crm.integration.domain.DeliveryStatus;
import com.crm.integration.domain.OutboxEventId;
import com.crm.integration.domain.SignatureAlgorithm;
import com.crm.integration.domain.WebhookDelivery;
import com.crm.integration.domain.WebhookDeliveryId;
import com.crm.integration.domain.WebhookStatus;
import com.crm.integration.domain.WebhookSubscription;
import com.crm.integration.domain.WebhookSubscriptionId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class WebhookJdbcMapper {

	private WebhookJdbcMapper() {
	}

	public static WebhookSubscription mapSubscription(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		WebhookSubscriptionId id = WebhookSubscriptionId.from(rs.getObject("id", UUID.class));
		String name = rs.getString("name");
		String endpointUrl = rs.getString("endpoint_url");

		List<String> eventTypes = new ArrayList<>();
		Array eventTypesArray = rs.getArray("event_types");
		if (eventTypesArray != null && eventTypesArray.getArray() instanceof String[] arr) {
			eventTypes.addAll(Arrays.asList(arr));
		}

		String secretReference = rs.getString("secret_reference");
		String sigAlgStr = rs.getString("signature_algorithm");
		SignatureAlgorithm signatureAlgorithm = sigAlgStr != null ? SignatureAlgorithm.valueOf(sigAlgStr) : SignatureAlgorithm.HMAC_SHA256;

		String customHeaders = rs.getString("custom_headers");
		int timeoutSeconds = rs.getInt("timeout_seconds");
		int maxRetries = rs.getInt("max_retries");

		String statusStr = rs.getString("status");
		WebhookStatus status = statusStr != null ? WebhookStatus.valueOf(statusStr) : WebhookStatus.ACTIVE;

		Timestamp lastSuccessAtTs = rs.getTimestamp("last_success_at");
		Instant lastSuccessAt = lastSuccessAtTs != null ? lastSuccessAtTs.toInstant() : null;

		Timestamp lastFailureAtTs = rs.getTimestamp("last_failure_at");
		Instant lastFailureAt = lastFailureAtTs != null ? lastFailureAtTs.toInstant() : null;

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new WebhookSubscription(tenantId, id, name, endpointUrl, eventTypes,
				secretReference, signatureAlgorithm, customHeaders, timeoutSeconds,
				maxRetries, status, lastSuccessAt, lastFailureAt, auditInfo, version);
	}

	public static WebhookSubscriptionSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String name = rs.getString("name");
		String endpointUrl = rs.getString("endpoint_url");

		List<String> eventTypes = new ArrayList<>();
		Array eventTypesArray = rs.getArray("event_types");
		if (eventTypesArray != null && eventTypesArray.getArray() instanceof String[] arr) {
			eventTypes.addAll(Arrays.asList(arr));
		}

		String sigAlgStr = rs.getString("signature_algorithm");
		SignatureAlgorithm signatureAlgorithm = sigAlgStr != null ? SignatureAlgorithm.valueOf(sigAlgStr) : SignatureAlgorithm.HMAC_SHA256;

		String statusStr = rs.getString("status");
		WebhookStatus status = statusStr != null ? WebhookStatus.valueOf(statusStr) : WebhookStatus.ACTIVE;

		Timestamp lastSuccessAtTs = rs.getTimestamp("last_success_at");
		Instant lastSuccessAt = lastSuccessAtTs != null ? lastSuccessAtTs.toInstant() : null;

		Timestamp lastFailureAtTs = rs.getTimestamp("last_failure_at");
		Instant lastFailureAt = lastFailureAtTs != null ? lastFailureAtTs.toInstant() : null;

		int totalDeliveriesCount = rs.getInt("deliveries_count");
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new WebhookSubscriptionSummary(id, name, endpointUrl, eventTypes,
				signatureAlgorithm, status, lastSuccessAt, lastFailureAt,
				totalDeliveriesCount, updatedAt, version);
	}

	public static WebhookDeliveryDetails mapDeliveryDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		UUID subscriptionId = rs.getObject("subscription_id", UUID.class);
		UUID outboxEventId = rs.getObject("outbox_event_id", UUID.class);
		String eventType = rs.getString("event_type");
		int attemptNumber = rs.getInt("attempt_number");
		String requestHeaders = rs.getString("request_headers");

		int respStatus = rs.getInt("response_status");
		Integer responseStatus = rs.wasNull() ? null : respStatus;

		String responseHeaders = rs.getString("response_headers");
		String responseBodyExcerpt = rs.getString("response_body_excerpt");

		String statusStr = rs.getString("status");
		DeliveryStatus status = statusStr != null ? DeliveryStatus.valueOf(statusStr) : DeliveryStatus.PENDING;

		Timestamp nextAttemptAtTs = rs.getTimestamp("next_attempt_at");
		Instant nextAttemptAt = nextAttemptAtTs != null ? nextAttemptAtTs.toInstant() : null;

		Timestamp startedAtTs = rs.getTimestamp("started_at");
		Instant startedAt = startedAtTs != null ? startedAtTs.toInstant() : null;

		Timestamp completedAtTs = rs.getTimestamp("completed_at");
		Instant completedAt = completedAtTs != null ? completedAtTs.toInstant() : null;

		int dur = rs.getInt("duration_ms");
		Integer durationMs = rs.wasNull() ? null : dur;

		String errorMessage = rs.getString("error_message");
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		return new WebhookDeliveryDetails(id, subscriptionId, outboxEventId, eventType,
				attemptNumber, requestHeaders, responseStatus, responseHeaders,
				responseBodyExcerpt, status, nextAttemptAt, startedAt, completedAt,
				durationMs, errorMessage, createdAt);
	}

	public static WebhookDelivery mapDelivery(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		WebhookDeliveryId id = WebhookDeliveryId.from(rs.getObject("id", UUID.class));
		WebhookSubscriptionId subscriptionId = WebhookSubscriptionId.from(rs.getObject("subscription_id", UUID.class));

		UUID outboxUuid = rs.getObject("outbox_event_id", UUID.class);
		OutboxEventId outboxEventId = outboxUuid != null ? OutboxEventId.from(outboxUuid) : null;

		String eventType = rs.getString("event_type");
		int attemptNumber = rs.getInt("attempt_number");
		String requestHeaders = rs.getString("request_headers");

		int respStatus = rs.getInt("response_status");
		Integer responseStatus = rs.wasNull() ? null : respStatus;

		String responseHeaders = rs.getString("response_headers");
		String responseBodyExcerpt = rs.getString("response_body_excerpt");

		String statusStr = rs.getString("status");
		DeliveryStatus status = statusStr != null ? DeliveryStatus.valueOf(statusStr) : DeliveryStatus.PENDING;

		Timestamp nextAttemptAtTs = rs.getTimestamp("next_attempt_at");
		Instant nextAttemptAt = nextAttemptAtTs != null ? nextAttemptAtTs.toInstant() : null;

		Timestamp startedAtTs = rs.getTimestamp("started_at");
		Instant startedAt = startedAtTs != null ? startedAtTs.toInstant() : null;

		Timestamp completedAtTs = rs.getTimestamp("completed_at");
		Instant completedAt = completedAtTs != null ? completedAtTs.toInstant() : null;

		int dur = rs.getInt("duration_ms");
		Integer durationMs = rs.wasNull() ? null : dur;

		String errorMessage = rs.getString("error_message");

		return new WebhookDelivery(tenantId, createdAt, id, subscriptionId, outboxEventId,
				eventType, attemptNumber, requestHeaders, responseStatus,
				responseHeaders, responseBodyExcerpt, status, nextAttemptAt,
				startedAt, completedAt, durationMs, errorMessage);
	}

}
