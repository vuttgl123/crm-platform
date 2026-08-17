package com.crm.privacy.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.privacy.application.dto.ConsentDetails;
import com.crm.privacy.application.port.ConsentRepository;
import com.crm.privacy.domain.Consent;
import com.crm.privacy.domain.ConsentId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcConsentRepository implements ConsentRepository {

	private static final String CONSENT_SELECT = """
			SELECT c.tenant_id, c.id, c.account_id, c.contact_id, c.lead_id,
			       c.channel, c.purpose, c.lawful_basis, c.consent_status,
			       c.policy_version, c.source, c.proof_reference, c.captured_at,
			       c.effective_from, c.expires_at, c.withdrawn_at, c.recorded_by,
			       c.metadata, c.created_at
			FROM privacy.consents c
			""";

	private final JdbcClient jdbcClient;

	public JdbcConsentRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Consent> findById(TenantId tenantId, ConsentId id) {
		String sql = CONSENT_SELECT + """
				WHERE c.tenant_id = :tenantId
				  AND c.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(ConsentJdbcMapper::mapConsent)
				.optional();
	}

	@Override
	public List<ConsentDetails> findByTarget(TenantId tenantId, UUID accountId, UUID contactId, UUID leadId) {
		StringBuilder sql = new StringBuilder("""
				SELECT c.id, c.account_id, c.contact_id, c.lead_id,
				       c.channel, c.purpose, c.lawful_basis, c.consent_status,
				       c.policy_version, c.source, c.proof_reference, c.captured_at,
				       c.effective_from, c.expires_at, c.withdrawn_at, c.recorded_by,
				       c.metadata, c.created_at
				FROM privacy.consents c
				WHERE c.tenant_id = :tenantId
				""");
		if (accountId != null) {
			sql.append(" AND c.account_id = :accountId ");
		}
		else if (contactId != null) {
			sql.append(" AND c.contact_id = :contactId ");
		}
		else if (leadId != null) {
			sql.append(" AND c.lead_id = :leadId ");
		}
		sql.append(" ORDER BY c.effective_from DESC, c.created_at DESC ");

		var query = jdbcClient.sql(sql.toString())
				.param("tenantId", tenantId.value());
		if (accountId != null) {
			query = query.param("accountId", accountId);
		}
		else if (contactId != null) {
			query = query.param("contactId", contactId);
		}
		else if (leadId != null) {
			query = query.param("leadId", leadId);
		}

		return query.query(ConsentJdbcMapper::mapDetails).list();
	}

	@Override
	public void insert(Consent consent) {
		String sql = """
				INSERT INTO privacy.consents (
				    tenant_id, id, account_id, contact_id, lead_id,
				    channel, purpose, lawful_basis, consent_status,
				    policy_version, source, proof_reference, captured_at,
				    effective_from, expires_at, withdrawn_at, recorded_by,
				    metadata, created_at
				) VALUES (
				    :tenantId, :id, :accountId, :contactId, :leadId,
				    :channel, :purpose, :lawfulBasis, :consentStatus,
				    :policyVersion, :source, :proofReference, :capturedAt,
				    :effectiveFrom, :expiresAt, :withdrawnAt, :recordedBy,
				    CAST(:metadata AS jsonb), :createdAt
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", consent.tenantId().value())
				.param("id", consent.id().value())
				.param("accountId", consent.accountId())
				.param("contactId", consent.contactId())
				.param("leadId", consent.leadId())
				.param("channel", consent.channel().name())
				.param("purpose", consent.purpose())
				.param("lawfulBasis", consent.lawfulBasis().name())
				.param("consentStatus", consent.consentStatus().name())
				.param("policyVersion", consent.policyVersion())
				.param("source", consent.source())
				.param("proofReference", consent.proofReference())
				.param("capturedAt", Timestamp.from(consent.capturedAt()))
				.param("effectiveFrom", Timestamp.from(consent.effectiveFrom()))
				.param("expiresAt", consent.expiresAt() != null ? Timestamp.from(consent.expiresAt()) : null)
				.param("withdrawnAt", consent.withdrawnAt() != null ? Timestamp.from(consent.withdrawnAt()) : null)
				.param("recordedBy", consent.recordedBy() != null ? consent.recordedBy().value() : null)
				.param("metadata", consent.metadata())
				.param("createdAt", Timestamp.from(consent.createdAt()))
				.update();
	}

	@Override
	public void update(Consent consent) {
		String sql = """
				UPDATE privacy.consents
				SET consent_status = :consentStatus,
				    withdrawn_at = :withdrawnAt
				WHERE tenant_id = :tenantId
				  AND id = :id
				""";
		jdbcClient.sql(sql)
				.param("tenantId", consent.tenantId().value())
				.param("id", consent.id().value())
				.param("consentStatus", consent.consentStatus().name())
				.param("withdrawnAt", consent.withdrawnAt() != null ? Timestamp.from(consent.withdrawnAt()) : null)
				.update();
	}

}
