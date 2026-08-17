package com.crm.integration.infrastructure.persistence;

import java.sql.Array;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.integration.application.dto.WebhookDeliveryDetails;
import com.crm.integration.application.dto.WebhookSubscriptionSummary;
import com.crm.integration.application.port.WebhookRepository;
import com.crm.integration.domain.WebhookDelivery;
import com.crm.integration.domain.WebhookDeliveryId;
import com.crm.integration.domain.WebhookSubscription;
import com.crm.integration.domain.WebhookSubscriptionId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcWebhookRepository implements WebhookRepository {

	private static final String SUBSCRIPTION_SELECT = """
			SELECT ws.tenant_id, ws.id, ws.name, ws.endpoint_url, ws.event_types,
			       ws.secret_reference, ws.signature_algorithm, ws.custom_headers,
			       ws.timeout_seconds, ws.max_retries, ws.status, ws.last_success_at,
			       ws.last_failure_at, ws.created_at, ws.updated_at, ws.created_by,
			       ws.updated_by, ws.version
			FROM integration.webhook_subscriptions ws
			""";

	private static final String SUMMARY_SELECT = """
			SELECT ws.id, ws.name, ws.endpoint_url, ws.event_types, ws.signature_algorithm,
			       ws.status, ws.last_success_at, ws.last_failure_at,
			       (SELECT COUNT(*) FROM integration.webhook_deliveries wd WHERE wd.tenant_id = ws.tenant_id AND wd.subscription_id = ws.id) AS deliveries_count,
			       ws.updated_at, ws.version
			FROM integration.webhook_subscriptions ws
			""";

	private static final String DELIVERY_SELECT = """
			SELECT wd.id, wd.subscription_id, wd.outbox_event_id, wd.event_type,
			       wd.attempt_number, wd.request_headers, wd.response_status,
			       wd.response_headers, wd.response_body_excerpt, wd.status,
			       wd.next_attempt_at, wd.started_at, wd.completed_at,
			       wd.duration_ms, wd.error_message, wd.created_at
			FROM integration.webhook_deliveries wd
			""";

	private final JdbcClient jdbcClient;

	public JdbcWebhookRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<WebhookSubscription> findById(TenantId tenantId, WebhookSubscriptionId id) {
		String sql = SUBSCRIPTION_SELECT + """
				WHERE ws.tenant_id = :tenantId
				  AND ws.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(WebhookJdbcMapper::mapSubscription)
				.optional();
	}

	@Override
	public List<WebhookSubscriptionSummary> findAll(TenantId tenantId) {
		String sql = SUMMARY_SELECT + """
				WHERE ws.tenant_id = :tenantId
				ORDER BY ws.created_at DESC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(WebhookJdbcMapper::mapSummary)
				.list();
	}

	@Override
	public void insert(WebhookSubscription subscription) {
		String sql = """
				INSERT INTO integration.webhook_subscriptions (
				    tenant_id, id, name, endpoint_url, event_types,
				    secret_reference, signature_algorithm, custom_headers,
				    timeout_seconds, max_retries, status, last_success_at,
				    last_failure_at, created_at, updated_at, created_by,
				    updated_by, version
				) VALUES (
				    :tenantId, :id, :name, :endpointUrl, :eventTypes,
				    :secretReference, :signatureAlgorithm, CAST(:customHeaders AS jsonb),
				    :timeoutSeconds, :maxRetries, :status, :lastSuccessAt,
				    :lastFailureAt, :createdAt, :updatedAt, :createdBy,
				    :updatedBy, :version
				)
				""";
		String[] eventTypesArray = subscription.eventTypes().toArray(new String[0]);
		jdbcClient.sql(sql)
				.param("tenantId", subscription.tenantId().value())
				.param("id", subscription.id().value())
				.param("name", subscription.name())
				.param("endpointUrl", subscription.endpointUrl())
				.param("eventTypes", eventTypesArray)
				.param("secretReference", subscription.secretReference())
				.param("signatureAlgorithm", subscription.signatureAlgorithm().name())
				.param("customHeaders", subscription.customHeaders())
				.param("timeoutSeconds", subscription.timeoutSeconds())
				.param("maxRetries", subscription.maxRetries())
				.param("status", subscription.status().name())
				.param("lastSuccessAt", subscription.lastSuccessAt() != null ? Timestamp.from(subscription.lastSuccessAt()) : null)
				.param("lastFailureAt", subscription.lastFailureAt() != null ? Timestamp.from(subscription.lastFailureAt()) : null)
				.param("createdAt", Timestamp.from(subscription.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(subscription.auditInfo().updatedAt()))
				.param("createdBy", subscription.auditInfo().createdBy() != null ? subscription.auditInfo().createdBy().value() : null)
				.param("updatedBy", subscription.auditInfo().updatedBy() != null ? subscription.auditInfo().updatedBy().value() : null)
				.param("version", subscription.version())
				.update();
	}

	@Override
	public void update(WebhookSubscription subscription) {
		String sql = """
				UPDATE integration.webhook_subscriptions
				SET name = :name,
				    endpoint_url = :endpointUrl,
				    event_types = :eventTypes,
				    secret_reference = :secretReference,
				    signature_algorithm = :signatureAlgorithm,
				    custom_headers = CAST(:customHeaders AS jsonb),
				    timeout_seconds = :timeoutSeconds,
				    max_retries = :maxRetries,
				    status = :status,
				    last_success_at = :lastSuccessAt,
				    last_failure_at = :lastFailureAt,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		String[] eventTypesArray = subscription.eventTypes().toArray(new String[0]);
		int updated = jdbcClient.sql(sql)
				.param("tenantId", subscription.tenantId().value())
				.param("id", subscription.id().value())
				.param("name", subscription.name())
				.param("endpointUrl", subscription.endpointUrl())
				.param("eventTypes", eventTypesArray)
				.param("secretReference", subscription.secretReference())
				.param("signatureAlgorithm", subscription.signatureAlgorithm().name())
				.param("customHeaders", subscription.customHeaders())
				.param("timeoutSeconds", subscription.timeoutSeconds())
				.param("maxRetries", subscription.maxRetries())
				.param("status", subscription.status().name())
				.param("lastSuccessAt", subscription.lastSuccessAt() != null ? Timestamp.from(subscription.lastSuccessAt()) : null)
				.param("lastFailureAt", subscription.lastFailureAt() != null ? Timestamp.from(subscription.lastFailureAt()) : null)
				.param("updatedAt", Timestamp.from(subscription.auditInfo().updatedAt()))
				.param("updatedBy", subscription.auditInfo().updatedBy() != null ? subscription.auditInfo().updatedBy().value() : null)
				.param("newVersion", subscription.version())
				.param("expectedVersion", subscription.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("WebhookSubscription update failed due to version mismatch");
		}
	}

	@Override
	public void delete(TenantId tenantId, WebhookSubscriptionId id, long version) {
		String sql = """
				DELETE FROM integration.webhook_subscriptions
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :version
				""";
		int deleted = jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.param("version", version)
				.update();
		if (deleted == 0) {
			throw new IllegalStateException("WebhookSubscription delete failed due to version mismatch");
		}
	}

	@Override
	public void insertDelivery(WebhookDelivery delivery) {
		String sql = """
				INSERT INTO integration.webhook_deliveries (
				    tenant_id, created_at, id, subscription_id, outbox_event_id,
				    event_type, attempt_number, request_headers, response_status,
				    response_headers, response_body_excerpt, status,
				    next_attempt_at, started_at, completed_at, duration_ms,
				    error_message
				) VALUES (
				    :tenantId, :createdAt, :id, :subscriptionId, :outboxEventId,
				    :eventType, :attemptNumber, CAST(:requestHeaders AS jsonb), :responseStatus,
				    CAST(:responseHeaders AS jsonb), :responseBodyExcerpt, :status,
				    :nextAttemptAt, :startedAt, :completedAt, :durationMs,
				    :errorMessage
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", delivery.tenantId().value())
				.param("createdAt", Timestamp.from(delivery.createdAt()))
				.param("id", delivery.id().value())
				.param("subscriptionId", delivery.subscriptionId().value())
				.param("outboxEventId", delivery.outboxEventId() != null ? delivery.outboxEventId().value() : null)
				.param("eventType", delivery.eventType())
				.param("attemptNumber", delivery.attemptNumber())
				.param("requestHeaders", delivery.requestHeaders())
				.param("responseStatus", delivery.responseStatus())
				.param("responseHeaders", delivery.responseHeaders())
				.param("responseBodyExcerpt", delivery.responseBodyExcerpt())
				.param("status", delivery.status().name())
				.param("nextAttemptAt", delivery.nextAttemptAt() != null ? Timestamp.from(delivery.nextAttemptAt()) : null)
				.param("startedAt", delivery.startedAt() != null ? Timestamp.from(delivery.startedAt()) : null)
				.param("completedAt", delivery.completedAt() != null ? Timestamp.from(delivery.completedAt()) : null)
				.param("durationMs", delivery.durationMs())
				.param("errorMessage", delivery.errorMessage())
				.update();
	}

	@Override
	public void updateDelivery(WebhookDelivery delivery) {
		String sql = """
				UPDATE integration.webhook_deliveries
				SET attempt_number = :attemptNumber,
				    response_status = :responseStatus,
				    response_headers = CAST(:responseHeaders AS jsonb),
				    response_body_excerpt = :responseBodyExcerpt,
				    status = :status,
				    next_attempt_at = :nextAttemptAt,
				    started_at = :startedAt,
				    completed_at = :completedAt,
				    duration_ms = :durationMs,
				    error_message = :errorMessage
				WHERE tenant_id = :tenantId
				  AND id = :id
				""";
		jdbcClient.sql(sql)
				.param("tenantId", delivery.tenantId().value())
				.param("id", delivery.id().value())
				.param("attemptNumber", delivery.attemptNumber())
				.param("responseStatus", delivery.responseStatus())
				.param("responseHeaders", delivery.responseHeaders())
				.param("responseBodyExcerpt", delivery.responseBodyExcerpt())
				.param("status", delivery.status().name())
				.param("nextAttemptAt", delivery.nextAttemptAt() != null ? Timestamp.from(delivery.nextAttemptAt()) : null)
				.param("startedAt", delivery.startedAt() != null ? Timestamp.from(delivery.startedAt()) : null)
				.param("completedAt", delivery.completedAt() != null ? Timestamp.from(delivery.completedAt()) : null)
				.param("durationMs", delivery.durationMs())
				.param("errorMessage", delivery.errorMessage())
				.update();
	}

	@Override
	public Optional<WebhookDelivery> findDeliveryById(TenantId tenantId, WebhookDeliveryId id) {
		String sql = """
				SELECT wd.tenant_id, wd.created_at, wd.id, wd.subscription_id,
				       wd.outbox_event_id, wd.event_type, wd.attempt_number,
				       wd.request_headers, wd.response_status, wd.response_headers,
				       wd.response_body_excerpt, wd.status, wd.next_attempt_at,
				       wd.started_at, wd.completed_at, wd.duration_ms, wd.error_message
				FROM integration.webhook_deliveries wd
				WHERE wd.tenant_id = :tenantId
				  AND wd.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(WebhookJdbcMapper::mapDelivery)
				.optional();
	}

	@Override
	public PageResult<WebhookDeliveryDetails> findDeliveriesBySubscription(
			TenantId tenantId, WebhookSubscriptionId subscriptionId, PageQuery page) {
		String countSql = """
				SELECT COUNT(*)
				FROM integration.webhook_deliveries wd
				WHERE wd.tenant_id = :tenantId
				  AND wd.subscription_id = :subscriptionId
				""";
		Long totalElements = jdbcClient.sql(countSql)
				.param("tenantId", tenantId.value())
				.param("subscriptionId", subscriptionId.value())
				.query(Long.class)
				.single();
		long total = totalElements != null ? totalElements : 0L;

		String dataSql = DELIVERY_SELECT + """
				WHERE wd.tenant_id = :tenantId
				  AND wd.subscription_id = :subscriptionId
				ORDER BY wd.created_at DESC
				LIMIT :limit OFFSET :offset
				""";
		List<WebhookDeliveryDetails> content = jdbcClient.sql(dataSql)
				.param("tenantId", tenantId.value())
				.param("subscriptionId", subscriptionId.value())
				.param("limit", page.size())
				.param("offset", page.offset())
				.query(WebhookJdbcMapper::mapDeliveryDetails)
				.list();

		return PageResult.of(content, total, page);
	}

}
