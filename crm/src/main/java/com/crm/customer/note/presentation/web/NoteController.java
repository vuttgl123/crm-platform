package com.crm.customer.note.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.note.application.dto.NoteDetails;
import com.crm.customer.note.application.query.NoteSearchQuery;
import com.crm.customer.note.application.usecase.NoteFacade;
import com.crm.customer.note.domain.NoteId;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/notes")
public final class NoteController {

	private final NoteFacade notes;
	private final NoteWebMapper mapper;

	public NoteController(NoteFacade notes, NoteWebMapper mapper) {
		this.notes = notes;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<NoteResponse> create(@Valid @RequestBody CreateNoteRequest request) {
		NoteDetails created = notes.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public NoteResponse get(@PathVariable UUID id) {
		return mapper.toResponse(notes.get(new NoteId(id)));
	}

	@GetMapping
	public List<NoteSummaryResponse> listByTarget(
			@RequestParam(required = false) UUID accountId,
			@RequestParam(required = false) UUID contactId,
			@RequestParam(required = false) UUID leadId,
			@RequestParam(required = false) UUID opportunityId,
			@RequestParam(required = false) UUID activityId,
			@RequestParam(required = false) UUID ticketId) {
		NoteSearchQuery query = new NoteSearchQuery(accountId, contactId, leadId, opportunityId, activityId, ticketId);
		return mapper.toSummaryResponseList(notes.listByTarget(query));
	}

	@PutMapping("/{id}")
	public NoteResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateNoteRequest request) {
		return mapper.toResponse(notes.update(mapper.toUpdateCommand(new NoteId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		notes.delete(new NoteId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

}
