package com.crm.privacy.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.privacy.application.dto.DataSubjectRequestDetails;
import com.crm.privacy.application.query.DsrSearchQuery;
import com.crm.privacy.application.usecase.DataSubjectRequestFacade;
import com.crm.privacy.domain.DataSubjectRequestId;
import com.crm.privacy.domain.DsrStatus;
import com.crm.privacy.domain.DsrType;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/privacy/dsr")
public final class DataSubjectRequestController {

	private final DataSubjectRequestFacade dsr;
	private final DsrWebMapper mapper;

	public DataSubjectRequestController(DataSubjectRequestFacade dsr, DsrWebMapper mapper) {
		this.dsr = dsr;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<DataSubjectRequestResponse> create(@Valid @RequestBody CreateDataSubjectRequestRequest request) {
		DataSubjectRequestDetails created = dsr.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public DataSubjectRequestResponse get(@PathVariable UUID id) {
		return mapper.toResponse(dsr.get(new DataSubjectRequestId(id)));
	}

	@GetMapping
	public PageResult<DataSubjectRequestSummaryResponse> search(
			@RequestParam(required = false) DsrType requestType,
			@RequestParam(required = false) DsrStatus status,
			@RequestParam(required = false) UUID assignedUserId,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		DsrSearchQuery query = new DsrSearchQuery(requestType, status, assignedUserId, PageQuery.of(page, size));
		return mapper.toSummaryPage(dsr.search(query));
	}

	@PutMapping("/{id}/status")
	public DataSubjectRequestResponse updateStatus(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateDataSubjectRequestStatusRequest request) {
		return mapper.toResponse(dsr.updateStatus(mapper.toUpdateStatusCommand(new DataSubjectRequestId(id), request)));
	}

}
