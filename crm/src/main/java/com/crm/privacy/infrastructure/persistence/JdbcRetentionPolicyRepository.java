package com.crm.privacy.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.privacy.application.dto.RetentionPolicyDetails;
import com.crm.privacy.application.port.RetentionPolicyRepository;
import com.crm.privacy.domain.RetentionPolicy;
import com.crm.privacy.domain.RetentionPolicyId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcRetentionPolicyRepository implements RetentionPolicyRepository {

	private static final String POLICY_SELECT = """
			SELECT rp.tenant_id, rp.id, rp.entity_type, rp.purpose, rp.retention_days,
			       rp.action_on_expiry, rp.legal_basis, rp.is_active, rp.created_at,
			       rp.updated_at, rp.created_by, rp.updated_by, rp.version
			FROM privacy.retention_policies rp
			""";

	private final JdbcClient jdbcClient;

	public JdbcRetentionPolicyRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<RetentionPolicy> findById(TenantId tenantId, RetentionPolicyId id) {
		String sql = POLICY_SELECT + """
				WHERE rp.tenant_id = :tenantId
				  AND rp.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(RetentionPolicyJdbcMapper::mapPolicy)
				.optional();
	}

	@Override
	public Optional<RetentionPolicy> findByEntityAndPurpose(TenantId tenantId, String entityType, String purpose) {
		String sql = POLICY_SELECT + """
				WHERE rp.tenant_id = :tenantId
				  AND rp.entity_type = :entityType
				  AND rp.purpose = :purpose
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("entityType", entityType.toUpperCase())
				.param("purpose", purpose.trim())
				.query(RetentionPolicyJdbcMapper::mapPolicy)
				.optional();
	}

	@Override
	public List<RetentionPolicyDetails> findAll(TenantId tenantId) {
		String sql = """
				SELECT rp.id, rp.entity_type, rp.purpose, rp.retention_days,
				       rp.action_on_expiry, rp.legal_basis, rp.is_active, rp.created_by,
				       rp.created_at, rp.updated_by, rp.updated_at, rp.version
				FROM privacy.retention_policies rp
				WHERE rp.tenant_id = :tenantId
				ORDER BY rp.entity_type, rp.purpose
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(RetentionPolicyJdbcMapper::mapDetails)
				.list();
	}

	@Override
	public void insert(RetentionPolicy policy) {
		String sql = """
				INSERT INTO privacy.retention_policies (
				    tenant_id, id, entity_type, purpose, retention_days,
				    action_on_expiry, legal_basis, is_active, created_at,
				    updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :entityType, :purpose, :retentionDays,
				    :actionOnExpiry, :legalBasis, :isActive, :createdAt,
				    :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", policy.tenantId().value())
				.param("id", policy.id().value())
				.param("entityType", policy.entityType())
				.param("purpose", policy.purpose())
				.param("retentionDays", policy.retentionDays())
				.param("actionOnExpiry", policy.actionOnExpiry().name())
				.param("legalBasis", policy.legalBasis())
				.param("isActive", policy.isActive())
				.param("createdAt", Timestamp.from(policy.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(policy.auditInfo().updatedAt()))
				.param("createdBy", policy.auditInfo().createdBy() != null ? policy.auditInfo().createdBy().value() : null)
				.param("updatedBy", policy.auditInfo().updatedBy() != null ? policy.auditInfo().updatedBy().value() : null)
				.param("version", policy.version())
				.update();
	}

	@Override
	public void update(RetentionPolicy policy) {
		String sql = """
				UPDATE privacy.retention_policies
				SET retention_days = :retentionDays,
				    action_on_expiry = :actionOnExpiry,
				    legal_basis = :legalBasis,
				    is_active = :isActive,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", policy.tenantId().value())
				.param("id", policy.id().value())
				.param("retentionDays", policy.retentionDays())
				.param("actionOnExpiry", policy.actionOnExpiry().name())
				.param("legalBasis", policy.legalBasis())
				.param("isActive", policy.isActive())
				.param("updatedAt", Timestamp.from(policy.auditInfo().updatedAt()))
				.param("updatedBy", policy.auditInfo().updatedBy() != null ? policy.auditInfo().updatedBy().value() : null)
				.param("newVersion", policy.version())
				.param("expectedVersion", policy.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("RetentionPolicy update failed due to version mismatch");
		}
	}

	@Override
	public void delete(TenantId tenantId, RetentionPolicyId id, long version) {
		String sql = """
				DELETE FROM privacy.retention_policies
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
			throw new IllegalStateException("RetentionPolicy delete failed due to version mismatch");
		}
	}

}
