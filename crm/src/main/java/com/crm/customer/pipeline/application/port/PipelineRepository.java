package com.crm.customer.pipeline.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.customer.pipeline.application.dto.PipelineStageDetails;
import com.crm.customer.pipeline.application.dto.PipelineSummary;
import com.crm.customer.pipeline.domain.Pipeline;
import com.crm.customer.pipeline.domain.PipelineId;
import com.crm.customer.pipeline.domain.PipelineStage;
import com.crm.customer.pipeline.domain.PipelineStageId;
import com.crm.sharedkernel.domain.TenantId;

public interface PipelineRepository {

	Optional<Pipeline> findById(TenantId tenantId, PipelineId id);

	Optional<Pipeline> findByCode(TenantId tenantId, String pipelineCode);

	boolean existsByCode(TenantId tenantId, String pipelineCode);

	List<PipelineSummary> findAll(TenantId tenantId);

	void insert(Pipeline pipeline);

	void update(Pipeline pipeline);

	List<PipelineStageDetails> findStagesByPipeline(TenantId tenantId, PipelineId pipelineId);

	Optional<PipelineStage> findStageById(TenantId tenantId, PipelineId pipelineId, PipelineStageId stageId);

	boolean existsStageByCode(TenantId tenantId, PipelineId pipelineId, String stageCode);

	void insertStage(PipelineStage stage);

	void updateStage(PipelineStage stage);

	void deleteStage(TenantId tenantId, PipelineId pipelineId, PipelineStageId stageId);

	Optional<Pipeline> findDefault(TenantId tenantId);

	void deletePipeline(TenantId tenantId, PipelineId id, java.time.Instant now);

	void updateStageDisplayOrder(TenantId tenantId, PipelineId pipelineId, PipelineStageId stageId, int displayOrder, java.time.Instant now);

}
