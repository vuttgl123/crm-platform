package com.crm.integration.importjob.domain;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class ImportJob {

	private final TenantId tenantId;
	private final ImportJobId id;
	private final String jobType;
	private final SourceType sourceType;
	private final String sourceReference;
	private final String targetEntityType;
	private ImportJobStatus status;
	private Long totalRows;
	private long processedRows;
	private long successRows;
	private long errorRows;
	private Map<String, Object> mappingConfig;
	private String errorReportReference;
	private Instant startedAt;
	private Instant completedAt;
	private final UUID requestedBy;
	private final AuditInfo auditInfo;
	private long version;

	public ImportJob(
			TenantId tenantId,
			ImportJobId id,
			String jobType,
			SourceType sourceType,
			String sourceReference,
			String targetEntityType,
			ImportJobStatus status,
			Long totalRows,
			long processedRows,
			long successRows,
			long errorRows,
			Map<String, Object> mappingConfig,
			String errorReportReference,
			Instant startedAt,
			Instant completedAt,
			UUID requestedBy,
			AuditInfo auditInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.jobType = Objects.requireNonNull(jobType, "jobType must not be null").trim();
		this.sourceType = Objects.requireNonNull(sourceType, "sourceType must not be null");
		this.sourceReference = sourceReference;
		this.targetEntityType = Objects.requireNonNull(targetEntityType, "targetEntityType must not be null").trim().toUpperCase();
		this.status = status != null ? status : ImportJobStatus.PENDING;
		this.totalRows = totalRows;
		this.processedRows = Math.max(0, processedRows);
		this.successRows = Math.max(0, successRows);
		this.errorRows = Math.max(0, errorRows);
		this.mappingConfig = mappingConfig != null ? Collections.unmodifiableMap(mappingConfig) : Map.of();
		this.errorReportReference = errorReportReference;
		this.startedAt = startedAt;
		this.completedAt = completedAt;
		this.requestedBy = requestedBy;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static ImportJob create(
			TenantId tenantId,
			ImportJobId id,
			String jobType,
			SourceType sourceType,
			String sourceReference,
			String targetEntityType,
			Long totalRows,
			Map<String, Object> mappingConfig,
			ActorId actorId,
			Instant now) {
		return new ImportJob(
				tenantId,
				id,
				jobType,
				sourceType,
				sourceReference,
				targetEntityType,
				ImportJobStatus.PENDING,
				totalRows,
				0L,
				0L,
				0L,
				mappingConfig,
				null,
				null,
				null,
				actorId != null ? actorId.value() : null,
				AuditInfo.create(actorId, now),
				1L
		);
	}

	public void start(Instant now, ActorId actorId) {
		if (this.status != ImportJobStatus.PENDING && this.status != ImportJobStatus.VALIDATING) {
			throw new IllegalStateException("Cannot start import job from status: " + this.status);
		}
		this.status = ImportJobStatus.RUNNING;
		if (this.startedAt == null) {
			this.startedAt = now;
		}
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void updateProgress(long processedRows, long successRows, long errorRows, ActorId actorId, Instant now) {
		if (this.status != ImportJobStatus.RUNNING && this.status != ImportJobStatus.VALIDATING) {
			this.status = ImportJobStatus.RUNNING;
			if (this.startedAt == null) {
				this.startedAt = now;
			}
		}
		this.processedRows = processedRows;
		this.successRows = successRows;
		this.errorRows = errorRows;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void complete(long processedRows, long successRows, long errorRows, String errorReportReference, ActorId actorId, Instant now) {
		this.processedRows = processedRows;
		this.successRows = successRows;
		this.errorRows = errorRows;
		this.errorReportReference = errorReportReference;
		this.completedAt = now;
		if (this.startedAt == null) {
			this.startedAt = now;
		}
		this.status = (errorRows > 0) ? ImportJobStatus.COMPLETED_WITH_ERRORS : ImportJobStatus.COMPLETED;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void fail(String errorReportReference, ActorId actorId, Instant now) {
		this.status = ImportJobStatus.FAILED;
		this.errorReportReference = errorReportReference;
		this.completedAt = now;
		if (this.startedAt == null) {
			this.startedAt = now;
		}
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void cancel(ActorId actorId, Instant now) {
		if (this.status == ImportJobStatus.COMPLETED || this.status == ImportJobStatus.COMPLETED_WITH_ERRORS || this.status == ImportJobStatus.FAILED) {
			throw new IllegalStateException("Cannot cancel an already finished job");
		}
		this.status = ImportJobStatus.CANCELLED;
		this.completedAt = now;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public ImportJobId id() {
		return id;
	}

	public String jobType() {
		return jobType;
	}

	public SourceType sourceType() {
		return sourceType;
	}

	public String sourceReference() {
		return sourceReference;
	}

	public String targetEntityType() {
		return targetEntityType;
	}

	public ImportJobStatus status() {
		return status;
	}

	public Long totalRows() {
		return totalRows;
	}

	public long processedRows() {
		return processedRows;
	}

	public long successRows() {
		return successRows;
	}

	public long errorRows() {
		return errorRows;
	}

	public Map<String, Object> mappingConfig() {
		return mappingConfig;
	}

	public String errorReportReference() {
		return errorReportReference;
	}

	public Instant startedAt() {
		return startedAt;
	}

	public Instant completedAt() {
		return completedAt;
	}

	public UUID requestedBy() {
		return requestedBy;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
