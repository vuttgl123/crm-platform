package com.crm.audit.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.audit.application.dto.DataAccessEventSummary;
import com.crm.audit.domain.ActorType;
import com.crm.audit.domain.DataAccessEvent;
import com.crm.audit.domain.DataAccessType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class DataAccessEventJdbcMapper {

	private DataAccessEventJdbcMapper() {
	}

	public static DataAccessEvent mapEvent(ResultSet rs, int rowNum) throws SQLException {
		String entIdStr = rs.getString("entity_id");
		UUID entityId = entIdStr == null ? null : UUID.fromString(entIdStr);

		String reqIdStr = rs.getString("request_id");
		UUID requestId = reqIdStr == null ? null : UUID.fromString(reqIdStr);

		return new DataAccessEvent(
				TenantId.from(rs.getString("tenant_id")),
				toInstant(rs.getTimestamp("occurred_at")),
				UUID.fromString(rs.getString("id")),
				rs.getString("entity_type"),
				entityId,
				DataAccessType.valueOf(rs.getString("access_type")),
				rs.getString("fields_accessed"),
				toActorId(rs.getString("actor_user_id")),
				ActorType.valueOf(rs.getString("actor_type")),
				rs.getString("purpose"),
				rs.getString("legal_basis"),
				requestId,
				rs.getString("source_ip"),
				rs.getString("user_agent"),
				rs.getString("metadata"));
	}

	public static DataAccessEventSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		String entIdStr = rs.getString("entity_id");
		UUID entityId = entIdStr == null ? null : UUID.fromString(entIdStr);

		return new DataAccessEventSummary(
				UUID.fromString(rs.getString("id")),
				toInstant(rs.getTimestamp("occurred_at")),
				rs.getString("entity_type"),
				entityId,
				DataAccessType.valueOf(rs.getString("access_type")),
				rs.getString("fields_accessed"),
				toActorId(rs.getString("actor_user_id")),
				ActorType.valueOf(rs.getString("actor_type")),
				rs.getString("purpose"),
				rs.getString("legal_basis"),
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
