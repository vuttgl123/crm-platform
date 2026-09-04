package com.crm.platform.settings.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.settings.application.port.DocumentSequenceRepository;
import com.crm.platform.settings.domain.DocumentSequence;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcDocumentSequenceRepository implements DocumentSequenceRepository {

	private final JdbcClient jdbcClient;

	public JdbcDocumentSequenceRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public List<DocumentSequence> findAll(TenantId tenantId) {
		return jdbcClient.sql("""
				SELECT tenant_id, counter_key, current_value, updated_at
				FROM platform_document_counters
				WHERE tenant_id = :tenantId
				ORDER BY counter_key
				""")
				.param("tenantId", tenantId.value().toString())
				.query(this::mapRow)
				.list();
	}

	@Override
	public Optional<DocumentSequence> findByEntityType(TenantId tenantId, String entityType) {
		return jdbcClient.sql("""
				SELECT tenant_id, counter_key, current_value, updated_at
				FROM platform_document_counters
				WHERE tenant_id = :tenantId AND counter_key = :counterKey
				""")
				.param("tenantId", tenantId.value().toString())
				.param("counterKey", entityType.toUpperCase())
				.query(this::mapRow)
				.optional();
	}

	@Override
	public void save(DocumentSequence sequence) {
		jdbcClient.sql("""
				INSERT INTO platform_document_counters (
				    tenant_id, counter_key, current_value, updated_at
				) VALUES (
				    :tenantId, :counterKey, :currentValue, :updatedAt
				)
				ON DUPLICATE KEY UPDATE
				    current_value = VALUES(current_value),
				    updated_at = VALUES(updated_at)
				""")
				.param("tenantId", sequence.tenantId().value().toString())
				.param("counterKey", sequence.entityType().toUpperCase())
				.param("currentValue", sequence.currentValue())
				.param("updatedAt", Timestamp.from(sequence.updatedAt()))
				.update();
	}

	private DocumentSequence mapRow(ResultSet rs, int rowNum) throws SQLException {
		String entityType = rs.getString("counter_key");
		String prefix = entityType.substring(0, Math.min(3, entityType.length())) + "-";
		return new DocumentSequence(
				new TenantId(UUID.fromString(rs.getString("tenant_id"))),
				entityType,
				prefix,
				"YYYYMM",
				5,
				rs.getLong("current_value"),
				rs.getTimestamp("updated_at").toInstant()
		);
	}
}
