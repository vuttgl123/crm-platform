package com.crm.privacy.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.crm.privacy.application.dto.DataSubjectRequestDetails;
import com.crm.privacy.application.dto.DataSubjectRequestSummary;
import com.crm.privacy.application.port.DataSubjectRequestRepository;
import com.crm.privacy.application.query.DsrSearchQuery;
import com.crm.privacy.domain.DataSubjectRequest;
import com.crm.privacy.domain.DataSubjectRequestId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcDataSubjectRequestRepository implements DataSubjectRequestRepository {

	private static final String DSR_SELECT = """
			SELECT dsr.tenant_id, dsr.id, dsr.request_number, dsr.request_type,
			       dsr.account_id, dsr.contact_id, dsr.lead_id, dsr.requester_email,
			       dsr.status, dsr.received_at, dsr.due_at, dsr.completed_at,
			       dsr.assigned_user_id, dsr.verification_reference, dsr.resolution_summary,
			       dsr.rejection_reason, dsr.created_at, dsr.updated_at,
			       dsr.created_by, dsr.updated_by, dsr.version
			FROM privacy.data_subject_requests dsr
			""";

	private static final String SUMMARY_SELECT = """
			SELECT dsr.id, dsr.request_number, dsr.request_type, dsr.account_id,
			       dsr.contact_id, dsr.lead_id, dsr.requester_email, dsr.status,
			       dsr.received_at, dsr.due_at, dsr.completed_at, dsr.assigned_user_id,
			       dsr.updated_at, dsr.version
			FROM privacy.data_subject_requests dsr
			""";

	private final JdbcClient jdbcClient;

	public JdbcDataSubjectRequestRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<DataSubjectRequest> findById(TenantId tenantId, DataSubjectRequestId id) {
		String sql = DSR_SELECT + """
				WHERE dsr.tenant_id = :tenantId
				  AND dsr.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(DataSubjectRequestJdbcMapper::mapRequest)
				.optional();
	}

	@Override
	public Optional<DataSubjectRequest> findByRequestNumber(TenantId tenantId, String requestNumber) {
		String sql = DSR_SELECT + """
				WHERE dsr.tenant_id = :tenantId
				  AND dsr.request_number = :requestNumber
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("requestNumber", requestNumber.trim())
				.query(DataSubjectRequestJdbcMapper::mapRequest)
				.optional();
	}

	@Override
	public boolean existsByRequestNumber(TenantId tenantId, String requestNumber) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM privacy.data_subject_requests dsr
				WHERE dsr.tenant_id = :tenantId
				  AND dsr.request_number = :requestNumber
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("requestNumber", requestNumber.trim())
				.query(Boolean.class)
				.single());
	}

	@Override
	public PageResult<DataSubjectRequestSummary> search(TenantId tenantId, DsrSearchQuery query) {
		PageQuery page = query.page() != null ? query.page() : PageQuery.defaultPage();
		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId.value());

		StringBuilder whereClause = new StringBuilder(" WHERE dsr.tenant_id = :tenantId ");

		if (query.requestType() != null) {
			params.put("requestType", query.requestType().name());
			whereClause.append(" AND dsr.request_type = :requestType ");
		}
		if (query.status() != null) {
			params.put("status", query.status().name());
			whereClause.append(" AND dsr.status = :status ");
		}
		if (query.assignedUserId() != null) {
			params.put("assignedUserId", query.assignedUserId());
			whereClause.append(" AND dsr.assigned_user_id = :assignedUserId ");
		}

		String countSql = "SELECT COUNT(*) FROM privacy.data_subject_requests dsr " + whereClause;
		Long totalElements = jdbcClient.sql(countSql)
				.params(params)
				.query(Long.class)
				.single();
		long total = totalElements != null ? totalElements : 0L;

		params.put("limit", page.size());
		params.put("offset", page.offset());

		String dataSql = SUMMARY_SELECT + whereClause + " ORDER BY dsr.received_at DESC LIMIT :limit OFFSET :offset";
		List<DataSubjectRequestSummary> content = jdbcClient.sql(dataSql)
				.params(params)
				.query(DataSubjectRequestJdbcMapper::mapSummary)
				.list();

		return PageResult.of(content, total, page);
	}

	@Override
	public void insert(DataSubjectRequest request) {
		String sql = """
				INSERT INTO privacy.data_subject_requests (
				    tenant_id, id, request_number, request_type,
				    account_id, contact_id, lead_id, requester_email,
				    status, received_at, due_at, completed_at,
				    assigned_user_id, verification_reference, resolution_summary,
				    rejection_reason, created_at, updated_at, created_by,
				    updated_by, version
				) VALUES (
				    :tenantId, :id, :requestNumber, :requestType,
				    :accountId, :contactId, :leadId, :requesterEmail,
				    :status, :receivedAt, :dueAt, :completedAt,
				    :assignedUserId, :verificationReference, :resolutionSummary,
				    :rejectionReason, :createdAt, :updatedAt, :createdBy,
				    :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", request.tenantId().value())
				.param("id", request.id().value())
				.param("requestNumber", request.requestNumber())
				.param("requestType", request.requestType().name())
				.param("accountId", request.accountId())
				.param("contactId", request.contactId())
				.param("leadId", request.leadId())
				.param("requesterEmail", request.requesterEmail())
				.param("status", request.status().name())
				.param("receivedAt", Timestamp.from(request.receivedAt()))
				.param("dueAt", request.dueAt() != null ? Timestamp.from(request.dueAt()) : null)
				.param("completedAt", request.completedAt() != null ? Timestamp.from(request.completedAt()) : null)
				.param("assignedUserId", request.assignedUserId())
				.param("verificationReference", request.verificationReference())
				.param("resolutionSummary", request.resolutionSummary())
				.param("rejectionReason", request.rejectionReason())
				.param("createdAt", Timestamp.from(request.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(request.auditInfo().updatedAt()))
				.param("createdBy", request.auditInfo().createdBy() != null ? request.auditInfo().createdBy().value() : null)
				.param("updatedBy", request.auditInfo().updatedBy() != null ? request.auditInfo().updatedBy().value() : null)
				.param("version", request.version())
				.update();
	}

	@Override
	public void update(DataSubjectRequest request) {
		String sql = """
				UPDATE privacy.data_subject_requests
				SET status = :status,
				    due_at = :dueAt,
				    completed_at = :completedAt,
				    assigned_user_id = :assignedUserId,
				    verification_reference = :verificationReference,
				    resolution_summary = :resolutionSummary,
				    rejection_reason = :rejectionReason,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", request.tenantId().value())
				.param("id", request.id().value())
				.param("status", request.status().name())
				.param("dueAt", request.dueAt() != null ? Timestamp.from(request.dueAt()) : null)
				.param("completedAt", request.completedAt() != null ? Timestamp.from(request.completedAt()) : null)
				.param("assignedUserId", request.assignedUserId())
				.param("verificationReference", request.verificationReference())
				.param("resolutionSummary", request.resolutionSummary())
				.param("rejectionReason", request.rejectionReason())
				.param("updatedAt", Timestamp.from(request.auditInfo().updatedAt()))
				.param("updatedBy", request.auditInfo().updatedBy() != null ? request.auditInfo().updatedBy().value() : null)
				.param("newVersion", request.version())
				.param("expectedVersion", request.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("DataSubjectRequest update failed due to version mismatch");
		}
	}

}
