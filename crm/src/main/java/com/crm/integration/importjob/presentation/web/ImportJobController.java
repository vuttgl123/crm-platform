package com.crm.integration.importjob.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.integration.importjob.application.dto.ImportJobDetails;
import com.crm.integration.importjob.application.query.ImportJobSearchQuery;
import com.crm.integration.importjob.application.usecase.ImportJobFacade;
import com.crm.integration.importjob.domain.ImportJobId;
import com.crm.integration.importjob.domain.ImportJobStatus;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/integration/import-jobs")
public final class ImportJobController {

	private final ImportJobFacade importJobs;
	private final ImportJobWebMapper mapper;

	public ImportJobController(ImportJobFacade importJobs, ImportJobWebMapper mapper) {
		this.importJobs = importJobs;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<ImportJobResponse> create(@Valid @RequestBody CreateImportJobRequest request) {
		ImportJobDetails created = importJobs.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public ImportJobResponse get(@PathVariable UUID id) {
		return mapper.toResponse(importJobs.get(new ImportJobId(id)));
	}

	@GetMapping
	public PageResult<ImportJobSummaryResponse> search(
			@RequestParam(required = false) ImportJobStatus status,
			@RequestParam(required = false) String targetEntityType,
			@RequestParam(required = false) String jobType,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		ImportJobSearchQuery query = new ImportJobSearchQuery(status, targetEntityType, jobType, new PageQuery(page, size));
		return mapper.toSummaryPage(importJobs.search(query));
	}

	@PostMapping("/{id}/start")
	public ImportJobResponse start(
			@PathVariable UUID id,
			@Valid @RequestBody StartImportJobRequest request) {
		return mapper.toResponse(importJobs.start(mapper.toStartCommand(new ImportJobId(id), request)));
	}

	@PostMapping("/{id}/progress")
	public ImportJobResponse updateProgress(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateImportProgressRequest request) {
		return mapper.toResponse(importJobs.updateProgress(mapper.toUpdateProgressCommand(new ImportJobId(id), request)));
	}

	@PostMapping("/{id}/complete")
	public ImportJobResponse complete(
			@PathVariable UUID id,
			@Valid @RequestBody CompleteImportJobRequest request) {
		return mapper.toResponse(importJobs.complete(mapper.toCompleteCommand(new ImportJobId(id), request)));
	}

	@PostMapping("/{id}/fail")
	public ImportJobResponse fail(
			@PathVariable UUID id,
			@Valid @RequestBody FailImportJobRequest request) {
		return mapper.toResponse(importJobs.fail(mapper.toFailCommand(new ImportJobId(id), request)));
	}

	@PostMapping("/{id}/cancel")
	public ImportJobResponse cancel(
			@PathVariable UUID id,
			@Valid @RequestBody CancelImportJobRequest request) {
		return mapper.toResponse(importJobs.cancel(mapper.toCancelCommand(new ImportJobId(id), request)));
	}

}
