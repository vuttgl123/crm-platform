package com.crm.customer.pipeline.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.pipeline.application.command.ReorderStagesCommand;
import com.crm.customer.pipeline.application.dto.PipelineDetails;
import com.crm.customer.pipeline.application.dto.PipelineStageDetails;
import com.crm.customer.pipeline.application.usecase.PipelineFacade;
import com.crm.customer.pipeline.domain.PipelineId;
import com.crm.customer.pipeline.domain.PipelineStageId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/pipelines", "/api/crm/pipelines"})
public final class PipelineController {

	private final PipelineFacade pipelines;
	private final PipelineWebMapper mapper;

	public PipelineController(PipelineFacade pipelines, PipelineWebMapper mapper) {
		this.pipelines = pipelines;
		this.mapper = mapper;
	}

	@GetMapping("/default")
	public PipelineResponse getDefaultPipeline() {
		return mapper.toResponse(pipelines.getDefaultPipeline());
	}

	@PostMapping
	public ResponseEntity<PipelineResponse> createPipeline(@Valid @RequestBody CreatePipelineRequest request) {
		PipelineDetails created = pipelines.createPipeline(mapper.toCreatePipelineCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public PipelineResponse getPipeline(@PathVariable UUID id) {
		return mapper.toResponse(pipelines.getPipeline(new PipelineId(id)));
	}

	@GetMapping
	public List<PipelineSummaryResponse> listPipelines() {
		return mapper.toSummaryResponseList(pipelines.listPipelines());
	}

	@PutMapping("/{id}")
	public PipelineResponse updatePipeline(
			@PathVariable UUID id,
			@Valid @RequestBody UpdatePipelineRequest request) {
		return mapper.toResponse(pipelines.updatePipeline(mapper.toUpdatePipelineCommand(new PipelineId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletePipeline(@PathVariable UUID id) {
		pipelines.deletePipeline(new PipelineId(id));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/stages")
	public ResponseEntity<PipelineStageResponse> addStage(
			@PathVariable UUID id,
			@Valid @RequestBody CreatePipelineStageRequest request) {
		PipelineStageDetails created = pipelines.addStage(mapper.toCreateStageCommand(new PipelineId(id), request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toStageResponse(created));
	}

	@PutMapping("/{id}/stages/{stageId}")
	public PipelineStageResponse updateStage(
			@PathVariable UUID id,
			@PathVariable UUID stageId,
			@Valid @RequestBody UpdatePipelineStageRequest request) {
		return mapper.toStageResponse(pipelines.updateStage(mapper.toUpdateStageCommand(new PipelineId(id), new PipelineStageId(stageId), request)));
	}

	@DeleteMapping("/{id}/stages/{stageId}")
	public ResponseEntity<Void> deleteStage(
			@PathVariable UUID id,
			@PathVariable UUID stageId) {
		pipelines.deleteStage(new PipelineId(id), new PipelineStageId(stageId));
		return ResponseEntity.noContent().build();
	}

	@PutMapping("/{id}/stages/reorder")
	public ResponseEntity<Void> reorderStages(
			@PathVariable UUID id,
			@Valid @RequestBody ReorderStagesRequest request) {
		pipelines.reorderStages(new ReorderStagesCommand(new PipelineId(id), request.orderedStageIds()));
		return ResponseEntity.noContent().build();
	}

}
