package com.crm.audit.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.audit.application.dto.AuditEventSummary;
import com.crm.audit.domain.ActorType;
import com.crm.audit.domain.AuditAction;
import com.crm.audit.domain.AuditEvent;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class AuditEventJdbcMapper {

	private AuditEventJdbcMapper() {
	}

	public static AuditEvent mapEvent(ResultSet rs, int rowNum) throws SQLException {
		String aggIdStr = rs.getString("aggregate_id");
		UUID aggregateId = aggIdStr == null ? null : UUID.fromString(aggIdStr);

		String reqIdStr = rs.getString("request_id");
		UUID requestId = reqIdStr == null ? null : UUID.fromString(reqIdStr);

		String corrIdStr = rs.getString("correlation_id");
		UUID correlationId = corrIdStr == null ? null : UUID.fromString(corrIdStr);

		return new AuditEvent(
				TenantId.from(rs.getString("tenant_id")),
				toInstant(rs.getTimestamp("occurred_at")),
				UUID.fromString(rs.getString("id")),
				rs.getString("schema_name"),
				rs.getString("table_name"),
				rs.getString("aggregate_type"),
				aggregateId,
				AuditAction.valueOf(rs.getString("action")),
				rs.getString("changed_fields"),
				rs.getString("old_values"),
				rs.getString("new_values"),
				toActorId(rs.getString("actor_user_id")),
				ActorType.valueOf(rs.getString("actor_type")),
				requestId,
				correlationId,
				rs.getString("source_ip"),
				rs.getString("user_agent"),
				rs.getString("application_name"));
	}

	public static AuditEventSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		String aggIdStr = rs.getString("aggregate_id");
		UUID aggregateId = aggIdStr == null ? null : UUID.fromString(aggIdStr);

		return new AuditEventSummary(
				UUID.fromString(rs.getString("id")),
				toInstant(rs.getTimestamp("occurred_at")),
				rs.getString("schema_name"),
				rs.getString("table_name"),
				rs.getString("aggregate_type"),
				aggregateId,
				AuditAction.valueOf(rs.getString("action")),
				rs.getString("changed_fields"),
				toActorId(rs.getString("actor_user_id")),
				ActorType.valueOf(rs.getString("actor_type")),
				rs.getString("source_ip"),
				rs.getString("user_agent"));
	}

	private static Instant toInstant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}

	private static ActorId toActorId(String value) {
		return value == null ? null : ActorId.from(value);
	}

}
