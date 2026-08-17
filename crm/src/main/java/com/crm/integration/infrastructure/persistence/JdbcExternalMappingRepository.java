package com.crm.integration.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.integration.application.dto.ExternalMappingDetails;
import com.crm.integration.application.port.ExternalMappingRepository;
import com.crm.integration.domain.ExternalIdMapping;
import com.crm.integration.domain.ExternalMappingId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcExternalMappingRepository implements ExternalMappingRepository {

	private static final String MAPPING_SELECT = """
			SELECT em.tenant_id, em.id, em.integration_key, em.entity_type,
			       em.internal_entity_id, em.external_entity_id, em.external_version,
			       em.last_synced_at, em.metadata, em.created_at, em.updated_at,
			       em.created_by, em.updated_by, em.version
			FROM integration.external_id_mappings em
			""";

	private final JdbcClient jdbcClient;

	public JdbcExternalMappingRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<ExternalIdMapping> findById(TenantId tenantId, ExternalMappingId id) {
		String sql = MAPPING_SELECT + """
				WHERE em.tenant_id = :tenantId
				  AND em.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(ExternalMappingJdbcMapper::mapMapping)
				.optional();
	}

	@Override
	public Optional<ExternalIdMapping> findByExternalId(
			TenantId tenantId, String integrationKey, String entityType, String externalEntityId) {
		String sql = MAPPING_SELECT + """
				WHERE em.tenant_id = :tenantId
				  AND em.integration_key = :integrationKey
				  AND em.entity_type = :entityType
				  AND em.external_entity_id = :externalEntityId
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("integrationKey", integrationKey)
				.param("entityType", entityType.toUpperCase())
				.param("externalEntityId", externalEntityId)
				.query(ExternalMappingJdbcMapper::mapMapping)
				.optional();
	}

	@Override
	public Optional<ExternalIdMapping> findByInternalId(
			TenantId tenantId, String integrationKey, String entityType, UUID internalEntityId) {
		String sql = MAPPING_SELECT + """
				WHERE em.tenant_id = :tenantId
				  AND em.integration_key = :integrationKey
				  AND em.entity_type = :entityType
				  AND em.internal_entity_id = :internalEntityId
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("integrationKey", integrationKey)
				.param("entityType", entityType.toUpperCase())
				.param("internalEntityId", internalEntityId)
				.query(ExternalMappingJdbcMapper::mapMapping)
				.optional();
	}

	@Override
	public List<ExternalMappingDetails> findByIntegrationKey(TenantId tenantId, String integrationKey) {
		String sql = """
				SELECT em.id, em.integration_key, em.entity_type, em.internal_entity_id,
				       em.external_entity_id, em.external_version, em.last_synced_at,
				       em.metadata, em.created_by, em.created_at, em.updated_by,
				       em.updated_at, em.version
				FROM integration.external_id_mappings em
				WHERE em.tenant_id = :tenantId
				  AND em.integration_key = :integrationKey
				ORDER BY em.last_synced_at DESC NULLS LAST
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("integrationKey", integrationKey)
				.query(ExternalMappingJdbcMapper::mapDetails)
				.list();
	}

	@Override
	public boolean exists(TenantId tenantId, String integrationKey, String entityType, String externalEntityId, UUID internalEntityId) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM integration.external_id_mappings em
				WHERE em.tenant_id = :tenantId
				  AND em.integration_key = :integrationKey
				  AND em.entity_type = :entityType
				  AND (em.external_entity_id = :externalEntityId OR em.internal_entity_id = :internalEntityId)
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("integrationKey", integrationKey)
				.param("entityType", entityType.toUpperCase())
				.param("externalEntityId", externalEntityId)
				.param("internalEntityId", internalEntityId)
				.query(Boolean.class)
				.single());
	}

	@Override
	public void insert(ExternalIdMapping mapping) {
		String sql = """
				INSERT INTO integration.external_id_mappings (
				    tenant_id, id, integration_key, entity_type,
				    internal_entity_id, external_entity_id, external_version,
				    last_synced_at, metadata, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :integrationKey, :entityType,
				    :internalEntityId, :externalEntityId, :externalVersion,
				    :lastSyncedAt, CAST(:metadata AS jsonb), :createdAt, :updatedAt,
				    :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", mapping.tenantId().value())
				.param("id", mapping.id().value())
				.param("integrationKey", mapping.integrationKey())
				.param("entityType", mapping.entityType())
				.param("internalEntityId", mapping.internalEntityId())
				.param("externalEntityId", mapping.externalEntityId())
				.param("externalVersion", mapping.externalVersion())
				.param("lastSyncedAt", mapping.lastSyncedAt() != null ? Timestamp.from(mapping.lastSyncedAt()) : null)
				.param("metadata", mapping.metadata())
				.param("createdAt", Timestamp.from(mapping.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(mapping.auditInfo().updatedAt()))
				.param("createdBy", mapping.auditInfo().createdBy() != null ? mapping.auditInfo().createdBy().value() : null)
				.param("updatedBy", mapping.auditInfo().updatedBy() != null ? mapping.auditInfo().updatedBy().value() : null)
				.param("version", mapping.version())
				.update();
	}

	@Override
	public void update(ExternalIdMapping mapping) {
		String sql = """
				UPDATE integration.external_id_mappings
				SET external_version = :externalVersion,
				    last_synced_at = :lastSyncedAt,
				    metadata = CAST(:metadata AS jsonb),
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", mapping.tenantId().value())
				.param("id", mapping.id().value())
				.param("externalVersion", mapping.externalVersion())
				.param("lastSyncedAt", mapping.lastSyncedAt() != null ? Timestamp.from(mapping.lastSyncedAt()) : null)
				.param("metadata", mapping.metadata())
				.param("updatedAt", Timestamp.from(mapping.auditInfo().updatedAt()))
				.param("updatedBy", mapping.auditInfo().updatedBy() != null ? mapping.auditInfo().updatedBy().value() : null)
				.param("newVersion", mapping.version())
				.param("expectedVersion", mapping.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("ExternalIdMapping update failed due to version mismatch");
		}
	}

	@Override
	public void delete(TenantId tenantId, ExternalMappingId id) {
		String sql = """
				DELETE FROM integration.external_id_mappings
				WHERE tenant_id = :tenantId
				  AND id = :id
				""";
		jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.update();
	}

}
