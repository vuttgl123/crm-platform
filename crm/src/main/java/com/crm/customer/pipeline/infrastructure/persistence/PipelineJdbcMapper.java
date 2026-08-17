package com.crm.customer.pipeline.infrastructure.persistence;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

import com.crm.customer.pipeline.application.dto.PipelineStageDetails;
import com.crm.customer.pipeline.application.dto.PipelineSummary;
import com.crm.customer.pipeline.domain.ForecastCategory;
import com.crm.customer.pipeline.domain.Pipeline;
import com.crm.customer.pipeline.domain.PipelineId;
import com.crm.customer.pipeline.domain.PipelineStage;
import com.crm.customer.pipeline.domain.PipelineStageId;
import com.crm.customer.pipeline.domain.PipelineType;
import com.crm.customer.pipeline.domain.StageCategory;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class PipelineJdbcMapper {

	private PipelineJdbcMapper() {
	}

	public static Pipeline mapPipeline(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		PipelineId id = PipelineId.from(rs.getObject("id", UUID.class));
		String pipelineCode = rs.getString("pipeline_code");
		String name = rs.getString("name");
		String pipelineTypeStr = rs.getString("pipeline_type");
		PipelineType pipelineType = pipelineTypeStr != null ? PipelineType.valueOf(pipelineTypeStr) : PipelineType.SALES;
		boolean defaultPipeline = rs.getBoolean("is_default");
		boolean active = rs.getBoolean("is_active");

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

		return new Pipeline(tenantId, id, pipelineCode, name, pipelineType, defaultPipeline, active, new ArrayList<>(), auditInfo, version);
	}

	public static PipelineSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String pipelineCode = rs.getString("pipeline_code");
		String name = rs.getString("name");
		String pipelineTypeStr = rs.getString("pipeline_type");
		PipelineType pipelineType = pipelineTypeStr != null ? PipelineType.valueOf(pipelineTypeStr) : PipelineType.SALES;
		boolean defaultPipeline = rs.getBoolean("is_default");
		boolean active = rs.getBoolean("is_active");
		int stageCount = rs.getInt("stage_count");

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new PipelineSummary(id, pipelineCode, name, pipelineType, defaultPipeline, active, stageCount, createdAt, updatedAt, version);
	}

	public static PipelineStage mapStage(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		PipelineStageId id = PipelineStageId.from(rs.getObject("id", UUID.class));
		PipelineId pipelineId = PipelineId.from(rs.getObject("pipeline_id", UUID.class));
		String stageCode = rs.getString("stage_code");
		String name = rs.getString("name");
		int displayOrder = rs.getInt("display_order");
		BigDecimal defaultProbability = rs.getBigDecimal("default_probability");
		String stageCategoryStr = rs.getString("stage_category");
		StageCategory stageCategory = stageCategoryStr != null ? StageCategory.valueOf(stageCategoryStr) : StageCategory.OPEN;
		String forecastCategoryStr = rs.getString("forecast_category");
		ForecastCategory forecastCategory = forecastCategoryStr != null ? ForecastCategory.valueOf(forecastCategoryStr) : ForecastCategory.PIPELINE;
		boolean active = rs.getBoolean("is_active");

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

		return new PipelineStage(tenantId, id, pipelineId, stageCode, name, displayOrder, defaultProbability, stageCategory, forecastCategory, active, auditInfo, version);
	}

	public static PipelineStageDetails mapStageDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		UUID pipelineId = rs.getObject("pipeline_id", UUID.class);
		String stageCode = rs.getString("stage_code");
		String name = rs.getString("name");
		int displayOrder = rs.getInt("display_order");
		BigDecimal defaultProbability = rs.getBigDecimal("default_probability");
		String stageCategoryStr = rs.getString("stage_category");
		StageCategory stageCategory = stageCategoryStr != null ? StageCategory.valueOf(stageCategoryStr) : StageCategory.OPEN;
		String forecastCategoryStr = rs.getString("forecast_category");
		ForecastCategory forecastCategory = forecastCategoryStr != null ? ForecastCategory.valueOf(forecastCategoryStr) : ForecastCategory.PIPELINE;
		boolean active = rs.getBoolean("is_active");

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new PipelineStageDetails(id, pipelineId, stageCode, name, displayOrder, defaultProbability, stageCategory, forecastCategory, active, createdBy, createdAt, updatedBy, updatedAt, version);
	}

}
