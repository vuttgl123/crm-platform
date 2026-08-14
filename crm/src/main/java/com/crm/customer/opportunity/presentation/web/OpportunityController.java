package com.crm.customer.opportunity.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.opportunity.application.command.DeleteOpportunityCommand;
import com.crm.customer.opportunity.application.dto.OpportunityDetails;
import com.crm.customer.opportunity.application.usecase.OpportunityFacade;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/opportunities")
public final class OpportunityController {

	private final OpportunityFacade opportunities;
	private final OpportunityWebMapper mapper;

	public OpportunityController(
			OpportunityFacade opportunities,
			OpportunityWebMapper mapper) {
		this.opportunities = opportunities;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<OpportunityResponse> create(
			@Valid @RequestBody CreateOpportunityRequest request) {
		OpportunityDetails created = opportunities.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public OpportunityResponse get(@PathVariable UUID id) {
		return mapper.toResponse(opportunities.get(new OpportunityId(id)));
	}

	@GetMapping
	public PageResult<OpportunitySummaryResponse> search(
			@Valid @ModelAttribute OpportunitySearchRequest request) {
		return mapper.toSummaryPage(
				opportunities.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public OpportunityResponse update(@PathVariable UUID id,
			@Valid @RequestBody UpdateOpportunityRequest request) {
		return mapper.toResponse(opportunities.update(
				mapper.toUpdateCommand(new OpportunityId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		opportunities.delete(new DeleteOpportunityCommand(
				new OpportunityId(id), IfMatchVersion.parse(ifMatch)));
		return ResponseEntity.noContent().build();
	}

}
