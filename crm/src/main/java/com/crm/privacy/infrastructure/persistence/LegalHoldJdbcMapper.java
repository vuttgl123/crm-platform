package com.crm.privacy.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.application.dto.LegalHoldDetails;
import com.crm.privacy.domain.LegalHold;
import com.crm.privacy.domain.LegalHoldId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class LegalHoldJdbcMapper {

	private LegalHoldJdbcMapper() {
	}

	public static LegalHold mapHold(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		LegalHoldId id = LegalHoldId.from(rs.getObject("id", UUID.class));
		String holdCode = rs.getString("hold_code");
		String name = rs.getString("name");
		String entityType = rs.getString("entity_type");
		UUID entityId = rs.getObject("entity_id", UUID.class);
		String scopeFilter = rs.getString("scope_filter");
		String reason = rs.getString("reason");

		Timestamp effectiveFromTs = rs.getTimestamp("effective_from");
		Instant effectiveFrom = effectiveFromTs != null ? effectiveFromTs.toInstant() : Instant.now();

		Timestamp releasedAtTs = rs.getTimestamp("released_at");
		Instant releasedAt = releasedAtTs != null ? releasedAtTs.toInstant() : null;

		UUID releasedByUuid = rs.getObject("released_by", UUID.class);
		ActorId releasedBy = releasedByUuid != null ? new ActorId(releasedByUuid) : null;

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;

		return new LegalHold(tenantId, id, holdCode, name, entityType, entityId,
				scopeFilter, reason, effectiveFrom, releasedAt, releasedBy,
				createdAt, createdBy);
	}

	public static LegalHoldDetails mapDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String holdCode = rs.getString("hold_code");
		String name = rs.getString("name");
		String entityType = rs.getString("entity_type");
		UUID entityId = rs.getObject("entity_id", UUID.class);
		String scopeFilter = rs.getString("scope_filter");
		String reason = rs.getString("reason");

		Timestamp effectiveFromTs = rs.getTimestamp("effective_from");
		Instant effectiveFrom = effectiveFromTs != null ? effectiveFromTs.toInstant() : Instant.now();

		Timestamp releasedAtTs = rs.getTimestamp("released_at");
		Instant releasedAt = releasedAtTs != null ? releasedAtTs.toInstant() : null;

		UUID releasedBy = rs.getObject("released_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();
		UUID createdBy = rs.getObject("created_by", UUID.class);

		return new LegalHoldDetails(id, holdCode, name, entityType, entityId,
				scopeFilter, reason, effectiveFrom, releasedAt, releasedBy,
				createdAt, createdBy);
	}

}
