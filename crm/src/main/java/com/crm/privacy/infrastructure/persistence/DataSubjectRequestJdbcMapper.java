package com.crm.privacy.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.application.dto.DataSubjectRequestDetails;
import com.crm.privacy.application.dto.DataSubjectRequestSummary;
import com.crm.privacy.domain.DataSubjectRequest;
import com.crm.privacy.domain.DataSubjectRequestId;
import com.crm.privacy.domain.DsrStatus;
import com.crm.privacy.domain.DsrType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class DataSubjectRequestJdbcMapper {

	private DataSubjectRequestJdbcMapper() {
	}

	public static DataSubjectRequest mapRequest(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		DataSubjectRequestId id = DataSubjectRequestId.from(rs.getObject("id", UUID.class));
		String requestNumber = rs.getString("request_number");

		String typeStr = rs.getString("request_type");
		DsrType requestType = typeStr != null ? DsrType.valueOf(typeStr) : DsrType.ACCESS;

		UUID accountId = rs.getObject("account_id", UUID.class);
		UUID contactId = rs.getObject("contact_id", UUID.class);
		UUID leadId = rs.getObject("lead_id", UUID.class);
		String requesterEmail = rs.getString("requester_email");

		String statusStr = rs.getString("status");
		DsrStatus status = statusStr != null ? DsrStatus.valueOf(statusStr) : DsrStatus.RECEIVED;

		Timestamp receivedAtTs = rs.getTimestamp("received_at");
		Instant receivedAt = receivedAtTs != null ? receivedAtTs.toInstant() : Instant.now();

		Timestamp dueAtTs = rs.getTimestamp("due_at");
		Instant dueAt = dueAtTs != null ? dueAtTs.toInstant() : null;

		Timestamp completedAtTs = rs.getTimestamp("completed_at");
		Instant completedAt = completedAtTs != null ? completedAtTs.toInstant() : null;

		UUID assignedUserId = rs.getObject("assigned_user_id", UUID.class);
		String verificationReference = rs.getString("verification_reference");
		String resolutionSummary = rs.getString("resolution_summary");
		String rejectionReason = rs.getString("rejection_reason");

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

		return new DataSubjectRequest(tenantId, id, requestNumber, requestType,
				accountId, contactId, leadId, requesterEmail, status, receivedAt,
				dueAt, completedAt, assignedUserId, verificationReference,
				resolutionSummary, rejectionReason, auditInfo, version);
	}

	public static DataSubjectRequestSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String requestNumber = rs.getString("request_number");

		String typeStr = rs.getString("request_type");
		DsrType requestType = typeStr != null ? DsrType.valueOf(typeStr) : DsrType.ACCESS;

		UUID accountId = rs.getObject("account_id", UUID.class);
		UUID contactId = rs.getObject("contact_id", UUID.class);
		UUID leadId = rs.getObject("lead_id", UUID.class);
		String requesterEmail = rs.getString("requester_email");

		String statusStr = rs.getString("status");
		DsrStatus status = statusStr != null ? DsrStatus.valueOf(statusStr) : DsrStatus.RECEIVED;

		Timestamp receivedAtTs = rs.getTimestamp("received_at");
		Instant receivedAt = receivedAtTs != null ? receivedAtTs.toInstant() : Instant.now();

		Timestamp dueAtTs = rs.getTimestamp("due_at");
		Instant dueAt = dueAtTs != null ? dueAtTs.toInstant() : null;

		Timestamp completedAtTs = rs.getTimestamp("completed_at");
		Instant completedAt = completedAtTs != null ? completedAtTs.toInstant() : null;

		UUID assignedUserId = rs.getObject("assigned_user_id", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new DataSubjectRequestSummary(id, requestNumber, requestType,
				accountId, contactId, leadId, requesterEmail, status, receivedAt,
				dueAt, completedAt, assignedUserId, updatedAt, version);
	}

}
