package com.crm.audit.presentation.web;

import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.audit.application.dto.AuditStatsDto;
import com.crm.audit.application.usecase.AuditFacade;
import com.crm.audit.domain.AuditEvent;
import com.crm.audit.domain.DataAccessEvent;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

	@GetMapping("/stats")
	public ResponseEntity<AuditStatsDto> getStats() {
		return ResponseEntity.ok(audit.getStats());
	}

	@PostMapping("/events")
	public ResponseEntity<AuditEventResponse> recordAuditEvent(
			@Valid @RequestBody RecordAuditEventRequest request) {
		AuditEvent event = audit.recordAuditEvent(mapper.toCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(event));
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

	@PostMapping("/data-access")
	public ResponseEntity<DataAccessEventResponse> recordDataAccessEvent(
			@Valid @RequestBody RecordDataAccessEventRequest request) {
		DataAccessEvent event = audit.recordDataAccessEvent(mapper.toCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(event));
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

	@DeleteMapping("/purge")
	public ResponseEntity<Map<String, Object>> purgeAuditLogs(
			@Valid @RequestBody PurgeAuditLogsRequest request) {
		Map<String, Object> result = audit.purgeAuditLogs(mapper.toCommand(request));
		return ResponseEntity.ok(result);
	}

}
