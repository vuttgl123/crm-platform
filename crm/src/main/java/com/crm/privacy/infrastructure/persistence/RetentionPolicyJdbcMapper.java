package com.crm.privacy.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.application.dto.RetentionPolicyDetails;
import com.crm.privacy.domain.RetentionAction;
import com.crm.privacy.domain.RetentionPolicy;
import com.crm.privacy.domain.RetentionPolicyId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class RetentionPolicyJdbcMapper {

	private RetentionPolicyJdbcMapper() {
	}

	public static RetentionPolicy mapPolicy(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		RetentionPolicyId id = RetentionPolicyId.from(rs.getObject("id", UUID.class));
		String entityType = rs.getString("entity_type");
		String purpose = rs.getString("purpose");
		int retentionDays = rs.getInt("retention_days");

		String actionStr = rs.getString("action_on_expiry");
		RetentionAction actionOnExpiry = actionStr != null ? RetentionAction.valueOf(actionStr) : RetentionAction.DELETE;

		String legalBasis = rs.getString("legal_basis");
		boolean active = rs.getBoolean("is_active");

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

		return new RetentionPolicy(tenantId, id, entityType, purpose, retentionDays,
				actionOnExpiry, legalBasis, active, auditInfo, version);
	}

	public static RetentionPolicyDetails mapDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String entityType = rs.getString("entity_type");
		String purpose = rs.getString("purpose");
		int retentionDays = rs.getInt("retention_days");

		String actionStr = rs.getString("action_on_expiry");
		RetentionAction actionOnExpiry = actionStr != null ? RetentionAction.valueOf(actionStr) : RetentionAction.DELETE;

		String legalBasis = rs.getString("legal_basis");
		boolean active = rs.getBoolean("is_active");

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new RetentionPolicyDetails(id, entityType, purpose, retentionDays,
				actionOnExpiry, legalBasis, active, createdBy, createdAt,
				updatedBy, updatedAt, version);
	}

}
