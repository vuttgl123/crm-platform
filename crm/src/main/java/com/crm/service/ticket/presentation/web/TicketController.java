package com.crm.service.ticket.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.service.ticket.application.dto.TicketCommentDetails;
import com.crm.service.ticket.application.dto.TicketDetails;
import com.crm.service.ticket.application.usecase.TicketFacade;
import com.crm.service.ticket.domain.TicketCommentId;
import com.crm.service.ticket.domain.TicketId;
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
@RequestMapping("/api/service/tickets")
public final class TicketController {

	private final TicketFacade tickets;
	private final TicketWebMapper mapper;

	public TicketController(TicketFacade tickets, TicketWebMapper mapper) {
		this.tickets = tickets;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<TicketResponse> create(@Valid @RequestBody CreateTicketRequest request) {
		TicketDetails created = tickets.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public TicketResponse get(@PathVariable UUID id) {
		return mapper.toResponse(tickets.get(new TicketId(id)));
	}

	@GetMapping
	public PageResult<TicketSummaryResponse> search(@Valid @ModelAttribute TicketSearchRequest request) {
		return mapper.toSummaryPage(tickets.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public TicketResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateTicketRequest request) {
		return mapper.toResponse(tickets.update(mapper.toUpdateCommand(new TicketId(id), request)));
	}

	@PostMapping("/{id}/assign")
	public TicketResponse assign(
			@PathVariable UUID id,
			@Valid @RequestBody AssignTicketRequest request) {
		return mapper.toResponse(tickets.assign(mapper.toAssignCommand(new TicketId(id), request)));
	}

	@PostMapping("/{id}/resolve")
	public TicketResponse resolve(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		return mapper.toResponse(tickets.resolve(new TicketId(id), IfMatchVersion.parse(ifMatch)));
	}

	@PostMapping("/{id}/close")
	public TicketResponse close(
			@PathVariable UUID id,
			@Valid @RequestBody CloseTicketRequest request) {
		return mapper.toResponse(tickets.close(mapper.toCloseCommand(new TicketId(id), request)));
	}

	@PostMapping("/{id}/reopen")
	public TicketResponse reopen(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		return mapper.toResponse(tickets.reopen(new TicketId(id), IfMatchVersion.parse(ifMatch)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		tickets.delete(new TicketId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/comments")
	public ResponseEntity<TicketCommentResponse> addComment(
			@PathVariable UUID id,
			@Valid @RequestBody AddTicketCommentRequest request) {
		TicketCommentDetails comment = tickets.addComment(mapper.toAddCommentCommand(new TicketId(id), request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toCommentResponse(comment));
	}

	@DeleteMapping("/{id}/comments/{commentId}")
	public ResponseEntity<Void> deleteComment(
			@PathVariable UUID id,
			@PathVariable UUID commentId) {
		tickets.deleteComment(new TicketId(id), new TicketCommentId(commentId));
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/stats")
	public com.crm.service.ticket.application.dto.TicketStatsDto getStats() {
		return tickets.getStats();
	}

	@PostMapping("/{id}/escalate")
	public TicketResponse escalate(
			@PathVariable UUID id,
			@Valid @RequestBody EscalateTicketRequest request) {
		TicketDetails updated = tickets.escalate(
				new com.crm.service.ticket.application.command.EscalateTicketCommand(
						new TicketId(id),
						request.priority(),
						request.escalationReason(),
						request.version()
				));
		return mapper.toResponse(updated);
	}

	@PostMapping("/bulk/assign")
	public ResponseEntity<java.util.Map<String, Object>> bulkAssign(
			@Valid @RequestBody BulkAssignTicketsRequest request) {
		int assignedCount = tickets.bulkAssign(
				new com.crm.service.ticket.application.command.BulkAssignTicketsCommand(
						request.ticketIds(),
						request.assignedUserId(),
						request.assignedTeamId()
				));
		return ResponseEntity.ok(java.util.Map.of("assignedCount", assignedCount));
	}

	@PostMapping("/bulk/status")
	public ResponseEntity<java.util.Map<String, Object>> bulkChangeStatus(
			@Valid @RequestBody BulkChangeTicketStatusRequest request) {
		int updatedCount = tickets.bulkChangeStatus(
				new com.crm.service.ticket.application.command.BulkChangeTicketStatusCommand(
						request.ticketIds(),
						request.status()
				));
		return ResponseEntity.ok(java.util.Map.of("updatedCount", updatedCount));
	}

}
