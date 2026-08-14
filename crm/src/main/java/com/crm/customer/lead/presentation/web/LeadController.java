package com.crm.customer.lead.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.lead.application.command.DeleteLeadCommand;
import com.crm.customer.lead.application.dto.LeadDetails;
import com.crm.customer.lead.application.usecase.LeadFacade;
import com.crm.customer.lead.domain.LeadId;
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
@RequestMapping("/api/leads")
public final class LeadController {

	private final LeadFacade leads;
	private final LeadWebMapper mapper;

	public LeadController(LeadFacade leads, LeadWebMapper mapper) {
		this.leads = leads;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<LeadResponse> create(
			@Valid @RequestBody CreateLeadRequest request) {
		LeadDetails created = leads.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public LeadResponse get(@PathVariable UUID id) {
		return mapper.toResponse(leads.get(new LeadId(id)));
	}

	@GetMapping
	public PageResult<LeadSummaryResponse> search(
			@Valid @ModelAttribute LeadSearchRequest request) {
		return mapper.toSummaryPage(
				leads.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public LeadResponse update(@PathVariable UUID id,
			@Valid @RequestBody UpdateLeadRequest request) {
		return mapper.toResponse(leads.update(
				mapper.toUpdateCommand(new LeadId(id), request)));
	}

	@PostMapping("/{id}/convert")
	public LeadResponse convert(@PathVariable UUID id,
			@Valid @RequestBody ConvertLeadRequest request) {
		return mapper.toResponse(leads.convert(
				mapper.toConvertCommand(new LeadId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		leads.delete(new DeleteLeadCommand(
				new LeadId(id), IfMatchVersion.parse(ifMatch)));
		return ResponseEntity.noContent().build();
	}

}
