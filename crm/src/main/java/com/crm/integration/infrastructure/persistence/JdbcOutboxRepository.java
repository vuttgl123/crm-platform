package com.crm.integration.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.crm.integration.application.dto.OutboxEventSummary;
import com.crm.integration.application.port.OutboxRepository;
import com.crm.integration.application.query.OutboxSearchQuery;
import com.crm.integration.domain.OutboxEvent;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcOutboxRepository implements OutboxRepository {

	private static final String SUMMARY_SELECT = """
			SELECT oe.id, oe.aggregate_type, oe.aggregate_id, oe.event_type,
			       oe.event_version, oe.payload, oe.status, oe.available_at,
			       oe.published_at, oe.retry_count, oe.last_error, oe.created_at
			FROM integration.outbox_events oe
			""";

	private final JdbcClient jdbcClient;

	public JdbcOutboxRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public PageResult<OutboxEventSummary> search(TenantId tenantId, OutboxSearchQuery query) {
		PageQuery page = query.page() != null ? query.page() : PageQuery.defaultPage();
		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId.value());

		StringBuilder whereClause = new StringBuilder(" WHERE oe.tenant_id = :tenantId ");

		if (query.aggregateType() != null && !query.aggregateType().isBlank()) {
			params.put("aggregateType", query.aggregateType().trim());
			whereClause.append(" AND oe.aggregate_type = :aggregateType ");
		}
		if (query.aggregateId() != null) {
			params.put("aggregateId", query.aggregateId());
			whereClause.append(" AND oe.aggregate_id = :aggregateId ");
		}
		if (query.eventType() != null && !query.eventType().isBlank()) {
			params.put("eventType", query.eventType().trim());
			whereClause.append(" AND oe.event_type = :eventType ");
		}
		if (query.status() != null) {
			params.put("status", query.status().name());
			whereClause.append(" AND oe.status = :status ");
		}

		String countSql = "SELECT COUNT(*) FROM integration.outbox_events oe " + whereClause;
		Long totalElements = jdbcClient.sql(countSql)
				.params(params)
				.query(Long.class)
				.single();
		long total = totalElements != null ? totalElements : 0L;

		params.put("limit", page.size());
		params.put("offset", page.offset());

		String dataSql = SUMMARY_SELECT + whereClause + " ORDER BY oe.created_at DESC LIMIT :limit OFFSET :offset";
		List<OutboxEventSummary> content = jdbcClient.sql(dataSql)
				.params(params)
				.query(OutboxJdbcMapper::mapSummary)
				.list();

		return PageResult.of(content, total, page);
	}

	@Override
	public void insert(OutboxEvent event) {
		String sql = """
				INSERT INTO integration.outbox_events (
				    tenant_id, created_at, id, aggregate_type, aggregate_id,
				    event_type, event_version, payload, headers, correlation_id,
				    causation_id, deduplication_key, status, available_at,
				    locked_at, locked_by, published_at, retry_count, last_error
				) VALUES (
				    :tenantId, :createdAt, :id, :aggregateType, :aggregateId,
				    :eventType, :eventVersion, CAST(:payload AS jsonb), CAST(:headers AS jsonb),
				    :correlationId, :causationId, :deduplicationKey, :status,
				    :availableAt, :lockedAt, :lockedBy, :publishedAt, :retryCount, :lastError
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", event.tenantId().value())
				.param("createdAt", Timestamp.from(event.createdAt()))
				.param("id", event.id().value())
				.param("aggregateType", event.aggregateType())
				.param("aggregateId", event.aggregateId())
				.param("eventType", event.eventType())
				.param("eventVersion", event.eventVersion())
				.param("payload", event.payload())
				.param("headers", event.headers())
				.param("correlationId", event.correlationId())
				.param("causationId", event.causationId())
				.param("deduplicationKey", event.deduplicationKey())
				.param("status", event.status().name())
				.param("availableAt", Timestamp.from(event.availableAt()))
				.param("lockedAt", event.lockedAt() != null ? Timestamp.from(event.lockedAt()) : null)
				.param("lockedBy", event.lockedBy())
				.param("publishedAt", event.publishedAt() != null ? Timestamp.from(event.publishedAt()) : null)
				.param("retryCount", event.retryCount())
				.param("lastError", event.lastError())
				.update();
	}

}
