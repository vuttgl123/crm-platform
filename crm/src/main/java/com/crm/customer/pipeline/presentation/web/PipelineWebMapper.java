package com.crm.customer.pipeline.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.customer.pipeline.application.command.CreatePipelineCommand;
import com.crm.customer.pipeline.application.command.CreatePipelineStageCommand;
import com.crm.customer.pipeline.application.command.UpdatePipelineCommand;
import com.crm.customer.pipeline.application.command.UpdatePipelineStageCommand;
import com.crm.customer.pipeline.application.dto.PipelineDetails;
import com.crm.customer.pipeline.application.dto.PipelineStageDetails;
import com.crm.customer.pipeline.application.dto.PipelineSummary;
import com.crm.customer.pipeline.domain.PipelineId;
import com.crm.customer.pipeline.domain.PipelineStageId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PipelineWebMapper {

	default CreatePipelineCommand toCreatePipelineCommand(CreatePipelineRequest request) {
		return new CreatePipelineCommand(
				request.pipelineCode(),
				request.name(),
				request.pipelineType(),
				request.defaultPipeline()
		);
	}

	default UpdatePipelineCommand toUpdatePipelineCommand(PipelineId id, UpdatePipelineRequest request) {
		return new UpdatePipelineCommand(
				id,
				request.version(),
				request.name(),
				request.pipelineType(),
				request.defaultPipeline(),
				request.active()
		);
	}

	default CreatePipelineStageCommand toCreateStageCommand(PipelineId pipelineId, CreatePipelineStageRequest request) {
		return new CreatePipelineStageCommand(
				pipelineId,
				request.stageCode(),
				request.name(),
				request.displayOrder(),
				request.defaultProbability(),
				request.stageCategory(),
				request.forecastCategory()
		);
	}

	default UpdatePipelineStageCommand toUpdateStageCommand(PipelineId pipelineId, PipelineStageId stageId, UpdatePipelineStageRequest request) {
		return new UpdatePipelineStageCommand(
				pipelineId,
				stageId,
				request.version(),
				request.name(),
				request.displayOrder(),
				request.defaultProbability(),
				request.stageCategory(),
				request.forecastCategory(),
				request.active()
		);
	}

	PipelineResponse toResponse(PipelineDetails details);

	List<PipelineSummaryResponse> toSummaryResponseList(List<PipelineSummary> summaries);

	PipelineStageResponse toStageResponse(PipelineStageDetails details);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(PipelineId value) {
		return value == null ? null : value.value();
	}

	default PipelineId mapToPipelineId(UUID value) {
		return value == null ? null : new PipelineId(value);
	}

	default UUID map(PipelineStageId value) {
		return value == null ? null : value.value();
	}

	default PipelineStageId mapToPipelineStageId(UUID value) {
		return value == null ? null : new PipelineStageId(value);
	}

}
