package com.crm.customer.pipeline.application.usecase;

import java.util.List;

import com.crm.customer.pipeline.application.command.CreatePipelineCommand;
import com.crm.customer.pipeline.application.command.CreatePipelineStageCommand;
import com.crm.customer.pipeline.application.command.UpdatePipelineCommand;
import com.crm.customer.pipeline.application.command.UpdatePipelineStageCommand;
import com.crm.customer.pipeline.application.dto.PipelineDetails;
import com.crm.customer.pipeline.application.dto.PipelineStageDetails;
import com.crm.customer.pipeline.application.dto.PipelineSummary;
import com.crm.customer.pipeline.domain.PipelineId;
import com.crm.customer.pipeline.domain.PipelineStageId;

public interface PipelineFacade {

	PipelineDetails createPipeline(CreatePipelineCommand command);

	PipelineDetails getPipeline(PipelineId id);

	List<PipelineSummary> listPipelines();

	PipelineDetails updatePipeline(UpdatePipelineCommand command);

	PipelineStageDetails addStage(CreatePipelineStageCommand command);

	PipelineStageDetails updateStage(UpdatePipelineStageCommand command);

	void deleteStage(PipelineId pipelineId, PipelineStageId stageId);

}
