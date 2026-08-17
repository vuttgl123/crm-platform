package com.crm.customer.config.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.config.application.dto.LeadSourceDetails;
import com.crm.customer.config.application.usecase.SalesConfigFacade;
import com.crm.customer.config.domain.LeadSourceId;
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
@RequestMapping("/api/crm/config/lead-sources")
public final class LeadSourceController {

	private final SalesConfigFacade salesConfig;
	private final SalesConfigWebMapper mapper;

	public LeadSourceController(SalesConfigFacade salesConfig, SalesConfigWebMapper mapper) {
		this.salesConfig = salesConfig;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<LeadSourceResponse> create(@Valid @RequestBody CreateLeadSourceRequest request) {
		LeadSourceDetails created = salesConfig.createLeadSource(mapper.toCreateLeadSourceCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toLeadSourceResponse(created));
	}

	@GetMapping("/{id}")
	public LeadSourceResponse get(@PathVariable UUID id) {
		return mapper.toLeadSourceResponse(salesConfig.getLeadSource(new LeadSourceId(id)));
	}

	@GetMapping
	public List<LeadSourceResponse> list() {
		return mapper.toLeadSourceResponseList(salesConfig.listLeadSources());
	}

	@PutMapping("/{id}")
	public LeadSourceResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateLeadSourceRequest request) {
		return mapper.toLeadSourceResponse(salesConfig.updateLeadSource(mapper.toUpdateLeadSourceCommand(new LeadSourceId(id), request)));
	}

}
