package com.crm.customer.pipeline.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class Pipeline {

	private final TenantId tenantId;
	private final PipelineId id;
	private final String pipelineCode;
	private String name;
	private PipelineType pipelineType;
	private boolean defaultPipeline;
	private boolean active;
	private final List<PipelineStage> stages;
	private final AuditInfo auditInfo;
	private long version;

	public Pipeline(
			TenantId tenantId,
			PipelineId id,
			String pipelineCode,
			String name,
			PipelineType pipelineType,
			boolean defaultPipeline,
			boolean active,
			List<PipelineStage> stages,
			AuditInfo auditInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.pipelineCode = Objects.requireNonNull(pipelineCode, "pipelineCode must not be null").trim().toUpperCase();
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.pipelineType = pipelineType != null ? pipelineType : PipelineType.SALES;
		this.defaultPipeline = defaultPipeline;
		this.active = active;
		this.stages = stages != null ? new ArrayList<>(stages) : new ArrayList<>();
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static Pipeline create(
			TenantId tenantId,
			PipelineId id,
			String pipelineCode,
			String name,
			PipelineType pipelineType,
			boolean defaultPipeline,
			ActorId actorId,
			Instant now) {
		return new Pipeline(
				tenantId,
				id,
				pipelineCode,
				name,
				pipelineType,
				defaultPipeline,
				true,
				new ArrayList<>(),
				AuditInfo.create(actorId, now),
				1L
		);
	}

	public void update(
			String name,
			PipelineType pipelineType,
			boolean defaultPipeline,
			boolean active,
			ActorId actorId,
			Instant now) {
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.pipelineType = pipelineType != null ? pipelineType : this.pipelineType;
		this.defaultPipeline = defaultPipeline;
		this.active = active;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public PipelineId id() {
		return id;
	}

	public String pipelineCode() {
		return pipelineCode;
	}

	public String name() {
		return name;
	}

	public PipelineType pipelineType() {
		return pipelineType;
	}

	public boolean isDefaultPipeline() {
		return defaultPipeline;
	}

	public boolean isActive() {
		return active;
	}

	public List<PipelineStage> stages() {
		return Collections.unmodifiableList(stages);
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
