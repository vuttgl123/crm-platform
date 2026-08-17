package com.crm.integration.importjob.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.crm.integration.importjob.application.dto.ImportJobSummary;
import com.crm.integration.importjob.application.port.ImportJobRepository;
import com.crm.integration.importjob.application.query.ImportJobSearchQuery;
import com.crm.integration.importjob.domain.ImportJob;
import com.crm.integration.importjob.domain.ImportJobId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcImportJobRepository implements ImportJobRepository {

	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	private static final String SELECT_BASE = """
			SELECT ij.tenant_id, ij.id, ij.job_type, ij.source_type,
			       ij.source_reference, ij.target_entity_type, ij.status,
			       ij.total_rows, ij.processed_rows, ij.success_rows, ij.error_rows,
			       ij.mapping_config, ij.error_report_reference,
			       ij.started_at, ij.completed_at, ij.requested_by,
			       ij.created_at, ij.updated_at, ij.created_by, ij.updated_by, ij.version
			FROM integration.import_jobs ij
			""";

	private final JdbcClient jdbcClient;

	public JdbcImportJobRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<ImportJob> findById(TenantId tenantId, ImportJobId id) {
		String sql = SELECT_BASE + """
				WHERE ij.tenant_id = :tenantId
				  AND ij.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(ImportJobJdbcMapper::mapJob)
				.optional();
	}

	@Override
	public PageResult<ImportJobSummary> findPage(TenantId tenantId, ImportJobSearchQuery query) {
		StringBuilder whereClause = new StringBuilder("WHERE ij.tenant_id = :tenantId ");
		if (query.status() != null) {
			whereClause.append("AND ij.status = :status ");
		}
		if (query.targetEntityType() != null && !query.targetEntityType().isBlank()) {
			whereClause.append("AND ij.target_entity_type = :targetEntityType ");
		}
		if (query.jobType() != null && !query.jobType().isBlank()) {
			whereClause.append("AND ij.job_type = :jobType ");
		}

		String countSql = "SELECT COUNT(*) FROM integration.import_jobs ij " + whereClause;
		var countSpec = jdbcClient.sql(countSql)
				.param("tenantId", tenantId.value());
		if (query.status() != null) {
			countSpec.param("status", query.status().name());
		}
		if (query.targetEntityType() != null && !query.targetEntityType().isBlank()) {
			countSpec.param("targetEntityType", query.targetEntityType().trim().toUpperCase());
		}
		if (query.jobType() != null && !query.jobType().isBlank()) {
			countSpec.param("jobType", query.jobType().trim());
		}
		long totalElements = Optional.ofNullable(countSpec.query(Long.class).single()).orElse(0L);

		PageQuery pageQuery = query.pageQuery() != null ? query.pageQuery() : PageQuery.firstPage();
		String listSql = SELECT_BASE + whereClause + "ORDER BY ij.created_at DESC LIMIT :limit OFFSET :offset";
		var listSpec = jdbcClient.sql(listSql)
				.param("tenantId", tenantId.value())
				.param("limit", pageQuery.size())
				.param("offset", pageQuery.offset());
		if (query.status() != null) {
			listSpec.param("status", query.status().name());
		}
		if (query.targetEntityType() != null && !query.targetEntityType().isBlank()) {
			listSpec.param("targetEntityType", query.targetEntityType().trim().toUpperCase());
		}
		if (query.jobType() != null && !query.jobType().isBlank()) {
			listSpec.param("jobType", query.jobType().trim());
		}

		List<ImportJobSummary> items = listSpec.query(ImportJobJdbcMapper::mapSummary).list();
		return PageResult.of(items, pageQuery, totalElements);
	}

	@Override
	public void insert(ImportJob job) {
		String sql = """
				INSERT INTO integration.import_jobs (
				    tenant_id, id, job_type, source_type, source_reference,
				    target_entity_type, status, total_rows, processed_rows,
				    success_rows, error_rows, mapping_config, error_report_reference,
				    started_at, completed_at, requested_by,
				    created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :jobType, :sourceType, :sourceReference,
				    :targetEntityType, :status, :totalRows, :processedRows,
				    :successRows, :errorRows, CAST(:mappingConfig AS jsonb), :errorReportReference,
				    :startedAt, :completedAt, :requestedBy,
				    :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", job.tenantId().value())
				.param("id", job.id().value())
				.param("jobType", job.jobType())
				.param("sourceType", job.sourceType().name())
				.param("sourceReference", job.sourceReference())
				.param("targetEntityType", job.targetEntityType())
				.param("status", job.status().name())
				.param("totalRows", job.totalRows())
				.param("processedRows", job.processedRows())
				.param("successRows", job.successRows())
				.param("errorRows", job.errorRows())
				.param("mappingConfig", toJson(job.mappingConfig()))
				.param("errorReportReference", job.errorReportReference())
				.param("startedAt", job.startedAt() != null ? Timestamp.from(job.startedAt()) : null)
				.param("completedAt", job.completedAt() != null ? Timestamp.from(job.completedAt()) : null)
				.param("requestedBy", job.requestedBy())
				.param("createdAt", Timestamp.from(job.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(job.auditInfo().updatedAt()))
				.param("createdBy", job.auditInfo().createdBy() != null ? job.auditInfo().createdBy().value() : null)
				.param("updatedBy", job.auditInfo().updatedBy() != null ? job.auditInfo().updatedBy().value() : null)
				.param("version", job.version())
				.update();
	}

	@Override
	public void update(ImportJob job) {
		String sql = """
				UPDATE integration.import_jobs
				SET status = :status,
				    total_rows = :totalRows,
				    processed_rows = :processedRows,
				    success_rows = :successRows,
				    error_rows = :errorRows,
				    mapping_config = CAST(:mappingConfig AS jsonb),
				    error_report_reference = :errorReportReference,
				    started_at = :startedAt,
				    completed_at = :completedAt,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", job.tenantId().value())
				.param("id", job.id().value())
				.param("status", job.status().name())
				.param("totalRows", job.totalRows())
				.param("processedRows", job.processedRows())
				.param("successRows", job.successRows())
				.param("errorRows", job.errorRows())
				.param("mappingConfig", toJson(job.mappingConfig()))
				.param("errorReportReference", job.errorReportReference())
				.param("startedAt", job.startedAt() != null ? Timestamp.from(job.startedAt()) : null)
				.param("completedAt", job.completedAt() != null ? Timestamp.from(job.completedAt()) : null)
				.param("updatedAt", Timestamp.from(job.auditInfo().updatedAt()))
				.param("updatedBy", job.auditInfo().updatedBy() != null ? job.auditInfo().updatedBy().value() : null)
				.param("newVersion", job.version())
				.param("expectedVersion", job.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("ImportJob update failed due to version mismatch");
		}
	}

	private static String toJson(Map<String, Object> map) {
		if (map == null || map.isEmpty()) {
			return "{}";
		}
		try {
			return OBJECT_MAPPER.writeValueAsString(map);
		}
		catch (Exception e) {
			return "{}";
		}
	}

}
