package com.crm.audit.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.audit.application.usecase.AuditFacade;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
public final class AuditController {

	private final AuditFacade audit;
	private final AuditWebMapper mapper;

	public AuditController(AuditFacade audit, AuditWebMapper mapper) {
		this.audit = audit;
		this.mapper = mapper;
	}

	@GetMapping("/events")
	public PageResult<AuditEventSummaryResponse> searchAuditEvents(
			@Valid @ModelAttribute AuditEventSearchRequest request) {
		return mapper.toAuditEventSummaryPage(
				audit.searchAuditEvents(mapper.toSearchQuery(request)));
	}

	@GetMapping("/events/{id}")
	public AuditEventResponse getAuditEvent(@PathVariable UUID id) {
		return mapper.toResponse(audit.getAuditEvent(id));
	}

	@GetMapping("/data-access")
	public PageResult<DataAccessEventSummaryResponse> searchDataAccessEvents(
			@Valid @ModelAttribute DataAccessEventSearchRequest request) {
		return mapper.toDataAccessEventSummaryPage(
				audit.searchDataAccessEvents(mapper.toSearchQuery(request)));
	}

	@GetMapping("/data-access/{id}")
	public DataAccessEventResponse getDataAccessEvent(@PathVariable UUID id) {
		return mapper.toResponse(audit.getDataAccessEvent(id));
	}

}
