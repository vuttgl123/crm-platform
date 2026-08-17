package com.crm.privacy.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class DataSubjectRequest {

	private final TenantId tenantId;
	private final DataSubjectRequestId id;
	private final String requestNumber;
	private final DsrType requestType;
	private final UUID accountId;
	private final UUID contactId;
	private final UUID leadId;
	private final String requesterEmail;
	private DsrStatus status;
	private final Instant receivedAt;
	private Instant dueAt;
	private Instant completedAt;
	private UUID assignedUserId;
	private String verificationReference;
	private String resolutionSummary;
	private String rejectionReason;
	private final AuditInfo auditInfo;
	private long version;

	public DataSubjectRequest(TenantId tenantId, DataSubjectRequestId id, String requestNumber,
			DsrType requestType, UUID accountId, UUID contactId, UUID leadId,
			String requesterEmail, DsrStatus status, Instant receivedAt,
			Instant dueAt, Instant completedAt, UUID assignedUserId,
			String verificationReference, String resolutionSummary,
			String rejectionReason, AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.requestNumber = Objects.requireNonNull(requestNumber, "requestNumber must not be null").trim();
		this.requestType = Objects.requireNonNull(requestType, "requestType must not be null");
		if (accountId == null && contactId == null && leadId == null && (requesterEmail == null || requesterEmail.isBlank())) {
			throw new IllegalArgumentException("At least one target (accountId, contactId, leadId, requesterEmail) must be non-null");
		}
		this.accountId = accountId;
		this.contactId = contactId;
		this.leadId = leadId;
		this.requesterEmail = requesterEmail;
		this.status = status != null ? status : DsrStatus.RECEIVED;
		this.receivedAt = receivedAt != null ? receivedAt : Instant.now();
		this.dueAt = dueAt;
		this.completedAt = completedAt;
		this.assignedUserId = assignedUserId;
		this.verificationReference = verificationReference;
		this.resolutionSummary = resolutionSummary;
		this.rejectionReason = rejectionReason;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static DataSubjectRequest create(TenantId tenantId, DataSubjectRequestId id,
			String requestNumber, DsrType requestType, UUID accountId, UUID contactId,
			UUID leadId, String requesterEmail, Instant dueAt, UUID assignedUserId,
			String verificationReference, ActorId actorId, Instant now) {
		return new DataSubjectRequest(tenantId, id, requestNumber, requestType,
				accountId, contactId, leadId, requesterEmail, DsrStatus.RECEIVED,
				now, dueAt != null ? dueAt : now.plusSeconds(30L * 86400L),
				null, assignedUserId, verificationReference, null, null,
				AuditInfo.create(actorId, now), 1L);
	}

	public void updateStatus(DsrStatus newStatus, UUID assignedUserId,
			String verificationReference, String resolutionSummary,
			String rejectionReason, ActorId actorId, Instant now) {
		this.status = Objects.requireNonNull(newStatus, "newStatus must not be null");
		if (assignedUserId != null) {
			this.assignedUserId = assignedUserId;
		}
		if (verificationReference != null) {
			this.verificationReference = verificationReference;
		}
		if (resolutionSummary != null) {
			this.resolutionSummary = resolutionSummary;
		}
		if (rejectionReason != null) {
			this.rejectionReason = rejectionReason;
		}
		if (newStatus == DsrStatus.COMPLETED) {
			this.completedAt = now;
		}
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public DataSubjectRequestId id() {
		return id;
	}

	public String requestNumber() {
		return requestNumber;
	}

	public DsrType requestType() {
		return requestType;
	}

	public UUID accountId() {
		return accountId;
	}

	public UUID contactId() {
		return contactId;
	}

	public UUID leadId() {
		return leadId;
	}

	public String requesterEmail() {
		return requesterEmail;
	}

	public DsrStatus status() {
		return status;
	}

	public Instant receivedAt() {
		return receivedAt;
	}

	public Instant dueAt() {
		return dueAt;
	}

	public Instant completedAt() {
		return completedAt;
	}

	public UUID assignedUserId() {
		return assignedUserId;
	}

	public String verificationReference() {
		return verificationReference;
	}

	public String resolutionSummary() {
		return resolutionSummary;
	}

	public String rejectionReason() {
		return rejectionReason;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
