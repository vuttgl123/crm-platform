package com.crm.integration.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.integration.application.dto.OutboxEventSummary;
import com.crm.integration.domain.OutboxEvent;
import com.crm.integration.domain.OutboxEventId;
import com.crm.integration.domain.OutboxEventStatus;
import com.crm.sharedkernel.domain.TenantId;

public final class OutboxJdbcMapper {

	private OutboxJdbcMapper() {
	}

	public static OutboxEventSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String aggregateType = rs.getString("aggregate_type");
		UUID aggregateId = rs.getObject("aggregate_id", UUID.class);
		String eventType = rs.getString("event_type");
		int eventVersion = rs.getInt("event_version");
		String payload = rs.getString("payload");

		String statusStr = rs.getString("status");
		OutboxEventStatus status = statusStr != null ? OutboxEventStatus.valueOf(statusStr) : OutboxEventStatus.PENDING;

		Timestamp availableAtTs = rs.getTimestamp("available_at");
		Instant availableAt = availableAtTs != null ? availableAtTs.toInstant() : null;

		Timestamp publishedAtTs = rs.getTimestamp("published_at");
		Instant publishedAt = publishedAtTs != null ? publishedAtTs.toInstant() : null;

		int retryCount = rs.getInt("retry_count");
		String lastError = rs.getString("last_error");

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		return new OutboxEventSummary(id, aggregateType, aggregateId, eventType,
				eventVersion, payload, status, availableAt, publishedAt,
				retryCount, lastError, createdAt);
	}

	public static OutboxEvent mapEvent(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		OutboxEventId id = OutboxEventId.from(rs.getObject("id", UUID.class));
		String aggregateType = rs.getString("aggregate_type");
		UUID aggregateId = rs.getObject("aggregate_id", UUID.class);
		String eventType = rs.getString("event_type");
		int eventVersion = rs.getInt("event_version");
		String payload = rs.getString("payload");
		String headers = rs.getString("headers");

		UUID correlationId = rs.getObject("correlation_id", UUID.class);
		UUID causationId = rs.getObject("causation_id", UUID.class);
		String deduplicationKey = rs.getString("deduplication_key");

		String statusStr = rs.getString("status");
		OutboxEventStatus status = statusStr != null ? OutboxEventStatus.valueOf(statusStr) : OutboxEventStatus.PENDING;

		Timestamp availableAtTs = rs.getTimestamp("available_at");
		Instant availableAt = availableAtTs != null ? availableAtTs.toInstant() : createdAt;

		Timestamp lockedAtTs = rs.getTimestamp("locked_at");
		Instant lockedAt = lockedAtTs != null ? lockedAtTs.toInstant() : null;
		String lockedBy = rs.getString("locked_by");

		Timestamp publishedAtTs = rs.getTimestamp("published_at");
		Instant publishedAt = publishedAtTs != null ? publishedAtTs.toInstant() : null;

		int retryCount = rs.getInt("retry_count");
		String lastError = rs.getString("last_error");

		return new OutboxEvent(tenantId, createdAt, id, aggregateType, aggregateId,
				eventType, eventVersion, payload, headers, correlationId, causationId,
				deduplicationKey, status, availableAt, lockedAt, lockedBy,
				publishedAt, retryCount, lastError);
	}

}
