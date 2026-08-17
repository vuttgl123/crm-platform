package com.crm.integration.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.integration.application.dto.ExternalMappingDetails;
import com.crm.integration.domain.ExternalIdMapping;
import com.crm.integration.domain.ExternalMappingId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class ExternalMappingJdbcMapper {

	private ExternalMappingJdbcMapper() {
	}

	public static ExternalIdMapping mapMapping(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		ExternalMappingId id = ExternalMappingId.from(rs.getObject("id", UUID.class));
		String integrationKey = rs.getString("integration_key");
		String entityType = rs.getString("entity_type");
		UUID internalEntityId = rs.getObject("internal_entity_id", UUID.class);
		String externalEntityId = rs.getString("external_entity_id");
		String externalVersion = rs.getString("external_version");

		Timestamp lastSyncedAtTs = rs.getTimestamp("last_synced_at");
		Instant lastSyncedAt = lastSyncedAtTs != null ? lastSyncedAtTs.toInstant() : null;

		String metadata = rs.getString("metadata");

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

		return new ExternalIdMapping(tenantId, id, integrationKey, entityType,
				internalEntityId, externalEntityId, externalVersion, lastSyncedAt,
				metadata, auditInfo, version);
	}

	public static ExternalMappingDetails mapDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String integrationKey = rs.getString("integration_key");
		String entityType = rs.getString("entity_type");
		UUID internalEntityId = rs.getObject("internal_entity_id", UUID.class);
		String externalEntityId = rs.getString("external_entity_id");
		String externalVersion = rs.getString("external_version");

		Timestamp lastSyncedAtTs = rs.getTimestamp("last_synced_at");
		Instant lastSyncedAt = lastSyncedAtTs != null ? lastSyncedAtTs.toInstant() : null;

		String metadata = rs.getString("metadata");
		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new ExternalMappingDetails(id, integrationKey, entityType,
				internalEntityId, externalEntityId, externalVersion, lastSyncedAt,
				metadata, createdBy, createdAt, updatedBy, updatedAt, version);
	}

}
