package com.crm.customer.config.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.config.application.dto.LeadStatusDetails;
import com.crm.customer.config.application.usecase.SalesConfigFacade;
import com.crm.customer.config.domain.LeadStatusId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/config/lead-statuses")
public final class LeadStatusController {

	private final SalesConfigFacade salesConfig;
	private final SalesConfigWebMapper mapper;

	public LeadStatusController(SalesConfigFacade salesConfig, SalesConfigWebMapper mapper) {
		this.salesConfig = salesConfig;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<LeadStatusResponse> create(@Valid @RequestBody CreateLeadStatusRequest request) {
		LeadStatusDetails created = salesConfig.createLeadStatus(mapper.toCreateLeadStatusCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toLeadStatusResponse(created));
	}

	@GetMapping("/{id}")
	public LeadStatusResponse get(@PathVariable UUID id) {
		return mapper.toLeadStatusResponse(salesConfig.getLeadStatus(new LeadStatusId(id)));
	}

	@GetMapping
	public List<LeadStatusResponse> list() {
		return mapper.toLeadStatusResponseList(salesConfig.listLeadStatuses());
	}

	@PutMapping("/{id}")
	public LeadStatusResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateLeadStatusRequest request) {
		return mapper.toLeadStatusResponse(salesConfig.updateLeadStatus(mapper.toUpdateLeadStatusCommand(new LeadStatusId(id), request)));
	}

}
