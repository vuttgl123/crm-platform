package com.crm.customer.pipeline.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class PipelineStage {

	private final TenantId tenantId;
	private final PipelineStageId id;
	private final PipelineId pipelineId;
	private final String stageCode;
	private String name;
	private int displayOrder;
	private BigDecimal defaultProbability;
	private StageCategory stageCategory;
	private ForecastCategory forecastCategory;
	private boolean active;
	private final AuditInfo auditInfo;
	private long version;

	public PipelineStage(
			TenantId tenantId,
			PipelineStageId id,
			PipelineId pipelineId,
			String stageCode,
			String name,
			int displayOrder,
			BigDecimal defaultProbability,
			StageCategory stageCategory,
			ForecastCategory forecastCategory,
			boolean active,
			AuditInfo auditInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.pipelineId = Objects.requireNonNull(pipelineId, "pipelineId must not be null");
		this.stageCode = Objects.requireNonNull(stageCode, "stageCode must not be null").trim().toUpperCase();
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.displayOrder = displayOrder;
		this.defaultProbability = defaultProbability != null ? defaultProbability : BigDecimal.ZERO;
		this.stageCategory = stageCategory != null ? stageCategory : StageCategory.OPEN;
		this.forecastCategory = forecastCategory != null ? forecastCategory : ForecastCategory.PIPELINE;
		this.active = active;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static PipelineStage create(
			TenantId tenantId,
			PipelineStageId id,
			PipelineId pipelineId,
			String stageCode,
			String name,
			int displayOrder,
			BigDecimal defaultProbability,
			StageCategory stageCategory,
			ForecastCategory forecastCategory,
			ActorId actorId,
			Instant now) {
		return new PipelineStage(
				tenantId,
				id,
				pipelineId,
				stageCode,
				name,
				displayOrder,
				defaultProbability,
				stageCategory,
				forecastCategory,
				true,
				AuditInfo.create(actorId, now),
				1L
		);
	}

	public void update(
			String name,
			int displayOrder,
			BigDecimal defaultProbability,
			StageCategory stageCategory,
			ForecastCategory forecastCategory,
			boolean active,
			ActorId actorId,
			Instant now) {
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.displayOrder = displayOrder;
		this.defaultProbability = defaultProbability != null ? defaultProbability : this.defaultProbability;
		this.stageCategory = stageCategory != null ? stageCategory : this.stageCategory;
		this.forecastCategory = forecastCategory != null ? forecastCategory : this.forecastCategory;
		this.active = active;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public PipelineStageId id() {
		return id;
	}

	public PipelineId pipelineId() {
		return pipelineId;
	}

	public String stageCode() {
		return stageCode;
	}

	public String name() {
		return name;
	}

	public int displayOrder() {
		return displayOrder;
	}

	public BigDecimal defaultProbability() {
		return defaultProbability;
	}

	public StageCategory stageCategory() {
		return stageCategory;
	}

	public ForecastCategory forecastCategory() {
		return forecastCategory;
	}

	public boolean isActive() {
		return active;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
