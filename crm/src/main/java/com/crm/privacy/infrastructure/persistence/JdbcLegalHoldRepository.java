package com.crm.privacy.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.privacy.application.dto.LegalHoldDetails;
import com.crm.privacy.application.port.LegalHoldRepository;
import com.crm.privacy.domain.LegalHold;
import com.crm.privacy.domain.LegalHoldId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcLegalHoldRepository implements LegalHoldRepository {

	private static final String HOLD_SELECT = """
			SELECT lh.tenant_id, lh.id, lh.hold_code, lh.name, lh.entity_type,
			       lh.entity_id, lh.scope_filter, lh.reason, lh.effective_from,
			       lh.released_at, lh.released_by, lh.created_at, lh.created_by
			FROM privacy.legal_holds lh
			""";

	private final JdbcClient jdbcClient;

	public JdbcLegalHoldRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<LegalHold> findById(TenantId tenantId, LegalHoldId id) {
		String sql = HOLD_SELECT + """
				WHERE lh.tenant_id = :tenantId
				  AND lh.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(LegalHoldJdbcMapper::mapHold)
				.optional();
	}

	@Override
	public Optional<LegalHold> findByHoldCode(TenantId tenantId, String holdCode) {
		String sql = HOLD_SELECT + """
				WHERE lh.tenant_id = :tenantId
				  AND lh.hold_code = :holdCode
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("holdCode", holdCode.trim())
				.query(LegalHoldJdbcMapper::mapHold)
				.optional();
	}

	@Override
	public boolean existsByHoldCode(TenantId tenantId, String holdCode) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM privacy.legal_holds lh
				WHERE lh.tenant_id = :tenantId
				  AND lh.hold_code = :holdCode
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("holdCode", holdCode.trim())
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<LegalHoldDetails> findAll(TenantId tenantId) {
		String sql = """
				SELECT lh.id, lh.hold_code, lh.name, lh.entity_type, lh.entity_id,
				       lh.scope_filter, lh.reason, lh.effective_from, lh.released_at,
				       lh.released_by, lh.created_at, lh.created_by
				FROM privacy.legal_holds lh
				WHERE lh.tenant_id = :tenantId
				ORDER BY lh.effective_from DESC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(LegalHoldJdbcMapper::mapDetails)
				.list();
	}

	@Override
	public void insert(LegalHold hold) {
		String sql = """
				INSERT INTO privacy.legal_holds (
				    tenant_id, id, hold_code, name, entity_type,
				    entity_id, scope_filter, reason, effective_from,
				    released_at, released_by, created_at, created_by
				) VALUES (
				    :tenantId, :id, :holdCode, :name, :entityType,
				    :entityId, CAST(:scopeFilter AS jsonb), :reason, :effectiveFrom,
				    :releasedAt, :releasedBy, :createdAt, :createdBy
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", hold.tenantId().value())
				.param("id", hold.id().value())
				.param("holdCode", hold.holdCode())
				.param("name", hold.name())
				.param("entityType", hold.entityType())
				.param("entityId", hold.entityId())
				.param("scopeFilter", hold.scopeFilter())
				.param("reason", hold.reason())
				.param("effectiveFrom", Timestamp.from(hold.effectiveFrom()))
				.param("releasedAt", hold.releasedAt() != null ? Timestamp.from(hold.releasedAt()) : null)
				.param("releasedBy", hold.releasedBy() != null ? hold.releasedBy().value() : null)
				.param("createdAt", Timestamp.from(hold.createdAt()))
				.param("createdBy", hold.createdBy() != null ? hold.createdBy().value() : null)
				.update();
	}

	@Override
	public void update(LegalHold hold) {
		String sql = """
				UPDATE privacy.legal_holds
				SET released_at = :releasedAt,
				    released_by = :releasedBy
				WHERE tenant_id = :tenantId
				  AND id = :id
				""";
		jdbcClient.sql(sql)
				.param("tenantId", hold.tenantId().value())
				.param("id", hold.id().value())
				.param("releasedAt", hold.releasedAt() != null ? Timestamp.from(hold.releasedAt()) : null)
				.param("releasedBy", hold.releasedBy() != null ? hold.releasedBy().value() : null)
				.update();
	}

}
