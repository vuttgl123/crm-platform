package com.crm.privacy.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.application.dto.ConsentDetails;
import com.crm.privacy.domain.Consent;
import com.crm.privacy.domain.ConsentChannel;
import com.crm.privacy.domain.ConsentId;
import com.crm.privacy.domain.ConsentStatus;
import com.crm.privacy.domain.LawfulBasis;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class ConsentJdbcMapper {

	private ConsentJdbcMapper() {
	}

	public static Consent mapConsent(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		ConsentId id = ConsentId.from(rs.getObject("id", UUID.class));
		UUID accountId = rs.getObject("account_id", UUID.class);
		UUID contactId = rs.getObject("contact_id", UUID.class);
		UUID leadId = rs.getObject("lead_id", UUID.class);

		String channelStr = rs.getString("channel");
		ConsentChannel channel = channelStr != null ? ConsentChannel.valueOf(channelStr) : ConsentChannel.EMAIL;

		String purpose = rs.getString("purpose");

		String basisStr = rs.getString("lawful_basis");
		LawfulBasis lawfulBasis = basisStr != null ? LawfulBasis.valueOf(basisStr) : LawfulBasis.CONSENT;

		String statusStr = rs.getString("consent_status");
		ConsentStatus status = statusStr != null ? ConsentStatus.valueOf(statusStr) : ConsentStatus.GRANTED;

		String policyVersion = rs.getString("policy_version");
		String source = rs.getString("source");
		String proofReference = rs.getString("proof_reference");

		Timestamp capturedAtTs = rs.getTimestamp("captured_at");
		Instant capturedAt = capturedAtTs != null ? capturedAtTs.toInstant() : Instant.now();

		Timestamp effectiveFromTs = rs.getTimestamp("effective_from");
		Instant effectiveFrom = effectiveFromTs != null ? effectiveFromTs.toInstant() : capturedAt;

		Timestamp expiresAtTs = rs.getTimestamp("expires_at");
		Instant expiresAt = expiresAtTs != null ? expiresAtTs.toInstant() : null;

		Timestamp withdrawnAtTs = rs.getTimestamp("withdrawn_at");
		Instant withdrawnAt = withdrawnAtTs != null ? withdrawnAtTs.toInstant() : null;

		UUID recordedByUuid = rs.getObject("recorded_by", UUID.class);
		ActorId recordedBy = recordedByUuid != null ? new ActorId(recordedByUuid) : null;

		String metadata = rs.getString("metadata");

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		return new Consent(tenantId, id, accountId, contactId, leadId, channel,
				purpose, lawfulBasis, status, policyVersion, source, proofReference,
				capturedAt, effectiveFrom, expiresAt, withdrawnAt, recordedBy,
				metadata, createdAt);
	}

	public static ConsentDetails mapDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		UUID accountId = rs.getObject("account_id", UUID.class);
		UUID contactId = rs.getObject("contact_id", UUID.class);
		UUID leadId = rs.getObject("lead_id", UUID.class);

		String channelStr = rs.getString("channel");
		ConsentChannel channel = channelStr != null ? ConsentChannel.valueOf(channelStr) : ConsentChannel.EMAIL;

		String purpose = rs.getString("purpose");

		String basisStr = rs.getString("lawful_basis");
		LawfulBasis lawfulBasis = basisStr != null ? LawfulBasis.valueOf(basisStr) : LawfulBasis.CONSENT;

		String statusStr = rs.getString("consent_status");
		ConsentStatus status = statusStr != null ? ConsentStatus.valueOf(statusStr) : ConsentStatus.GRANTED;

		String policyVersion = rs.getString("policy_version");
		String source = rs.getString("source");
		String proofReference = rs.getString("proof_reference");

		Timestamp capturedAtTs = rs.getTimestamp("captured_at");
		Instant capturedAt = capturedAtTs != null ? capturedAtTs.toInstant() : Instant.now();

		Timestamp effectiveFromTs = rs.getTimestamp("effective_from");
		Instant effectiveFrom = effectiveFromTs != null ? effectiveFromTs.toInstant() : capturedAt;

		Timestamp expiresAtTs = rs.getTimestamp("expires_at");
		Instant expiresAt = expiresAtTs != null ? expiresAtTs.toInstant() : null;

		Timestamp withdrawnAtTs = rs.getTimestamp("withdrawn_at");
		Instant withdrawnAt = withdrawnAtTs != null ? withdrawnAtTs.toInstant() : null;

		UUID recordedBy = rs.getObject("recorded_by", UUID.class);
		String metadata = rs.getString("metadata");

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		return new ConsentDetails(id, accountId, contactId, leadId, channel,
				purpose, lawfulBasis, status, policyVersion, source, proofReference,
				capturedAt, effectiveFrom, expiresAt, withdrawnAt, recordedBy,
				metadata, createdAt);
	}

}
