package com.crm.integration.importjob.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import com.crm.integration.importjob.application.dto.ImportJobSummary;
import com.crm.integration.importjob.domain.ImportJob;
import com.crm.integration.importjob.domain.ImportJobId;
import com.crm.integration.importjob.domain.ImportJobStatus;
import com.crm.integration.importjob.domain.SourceType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class ImportJobJdbcMapper {

	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
	private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

	private ImportJobJdbcMapper() {
	}

	public static ImportJob mapJob(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		ImportJobId id = ImportJobId.from(rs.getObject("id", UUID.class));
		String jobType = rs.getString("job_type");

		String sourceTypeStr = rs.getString("source_type");
		SourceType sourceType = sourceTypeStr != null ? SourceType.valueOf(sourceTypeStr) : SourceType.CSV;

		String sourceReference = rs.getString("source_reference");
		String targetEntityType = rs.getString("target_entity_type");

		String statusStr = rs.getString("status");
		ImportJobStatus status = statusStr != null ? ImportJobStatus.valueOf(statusStr) : ImportJobStatus.PENDING;

		Long totalRows = rs.getObject("total_rows", Long.class);
		long processedRows = rs.getLong("processed_rows");
		long successRows = rs.getLong("success_rows");
		long errorRows = rs.getLong("error_rows");

		String mappingConfigJson = rs.getString("mapping_config");
		Map<String, Object> mappingConfig = parseJson(mappingConfigJson);

		String errorReportReference = rs.getString("error_report_reference");

		Timestamp startedAtTs = rs.getTimestamp("started_at");
		Instant startedAt = startedAtTs != null ? startedAtTs.toInstant() : null;

		Timestamp completedAtTs = rs.getTimestamp("completed_at");
		Instant completedAt = completedAtTs != null ? completedAtTs.toInstant() : null;

		UUID requestedBy = rs.getObject("requested_by", UUID.class);

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

		return new ImportJob(
				tenantId,
				id,
				jobType,
				sourceType,
				sourceReference,
				targetEntityType,
				status,
				totalRows,
				processedRows,
				successRows,
				errorRows,
				mappingConfig,
				errorReportReference,
				startedAt,
				completedAt,
				requestedBy,
				auditInfo,
				version
		);
	}

	public static ImportJobSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String jobType = rs.getString("job_type");

		String sourceTypeStr = rs.getString("source_type");
		SourceType sourceType = sourceTypeStr != null ? SourceType.valueOf(sourceTypeStr) : SourceType.CSV;

		String targetEntityType = rs.getString("target_entity_type");

		String statusStr = rs.getString("status");
		ImportJobStatus status = statusStr != null ? ImportJobStatus.valueOf(statusStr) : ImportJobStatus.PENDING;

		Long totalRows = rs.getObject("total_rows", Long.class);
		long processedRows = rs.getLong("processed_rows");
		long successRows = rs.getLong("success_rows");
		long errorRows = rs.getLong("error_rows");

		Timestamp startedAtTs = rs.getTimestamp("started_at");
		Instant startedAt = startedAtTs != null ? startedAtTs.toInstant() : null;

		Timestamp completedAtTs = rs.getTimestamp("completed_at");
		Instant completedAt = completedAtTs != null ? completedAtTs.toInstant() : null;

		UUID requestedBy = rs.getObject("requested_by", UUID.class);

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		long version = rs.getLong("version");

		return new ImportJobSummary(
				id,
				jobType,
				sourceType,
				targetEntityType,
				status,
				totalRows,
				processedRows,
				successRows,
				errorRows,
				startedAt,
				completedAt,
				requestedBy,
				createdAt,
				version
		);
	}

	private static Map<String, Object> parseJson(String json) {
		if (json == null || json.isBlank()) {
			return Map.of();
		}
		try {
			return OBJECT_MAPPER.readValue(json, MAP_TYPE);
		}
		catch (Exception e) {
			return Map.of();
		}
	}

}
