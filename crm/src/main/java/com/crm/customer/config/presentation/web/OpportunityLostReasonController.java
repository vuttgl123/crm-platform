package com.crm.customer.config.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.config.application.dto.OpportunityLostReasonDetails;
import com.crm.customer.config.application.usecase.SalesConfigFacade;
import com.crm.customer.config.domain.OpportunityLostReasonId;
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
@RequestMapping("/api/crm/config/lost-reasons")
public final class OpportunityLostReasonController {

	private final SalesConfigFacade salesConfig;
	private final SalesConfigWebMapper mapper;

	public OpportunityLostReasonController(SalesConfigFacade salesConfig, SalesConfigWebMapper mapper) {
		this.salesConfig = salesConfig;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<OpportunityLostReasonResponse> create(@Valid @RequestBody CreateOpportunityLostReasonRequest request) {
		OpportunityLostReasonDetails created = salesConfig.createLostReason(mapper.toCreateLostReasonCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toLostReasonResponse(created));
	}

	@GetMapping("/{id}")
	public OpportunityLostReasonResponse get(@PathVariable UUID id) {
		return mapper.toLostReasonResponse(salesConfig.getLostReason(new OpportunityLostReasonId(id)));
	}

	@GetMapping
	public List<OpportunityLostReasonResponse> list() {
		return mapper.toLostReasonResponseList(salesConfig.listLostReasons());
	}

	@PutMapping("/{id}")
	public OpportunityLostReasonResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateOpportunityLostReasonRequest request) {
		return mapper.toLostReasonResponse(salesConfig.updateLostReason(mapper.toUpdateLostReasonCommand(new OpportunityLostReasonId(id), request)));
	}

}
