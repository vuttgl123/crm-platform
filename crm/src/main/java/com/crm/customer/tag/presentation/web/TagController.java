package com.crm.customer.tag.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.tag.application.dto.EntityTagDetails;
import com.crm.customer.tag.application.dto.TagDetails;
import com.crm.customer.tag.application.usecase.TagFacade;
import com.crm.customer.tag.domain.EntityTagId;
import com.crm.customer.tag.domain.TagId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/tags")
public final class TagController {

	private final TagFacade tags;
	private final TagWebMapper mapper;

	public TagController(TagFacade tags, TagWebMapper mapper) {
		this.tags = tags;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<TagResponse> create(@Valid @RequestBody CreateTagRequest request) {
		TagDetails created = tags.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public TagResponse get(@PathVariable UUID id) {
		return mapper.toResponse(tags.get(new TagId(id)));
	}

	@GetMapping
	public List<TagResponse> list() {
		return mapper.toResponseList(tags.list());
	}

	@PutMapping("/{id}")
	public TagResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateTagRequest request) {
		return mapper.toResponse(tags.update(mapper.toUpdateCommand(new TagId(id), request)));
	}

	@PostMapping("/assign")
	public ResponseEntity<EntityTagResponse> assign(@Valid @RequestBody AssignTagRequest request) {
		EntityTagDetails assigned = tags.assign(mapper.toAssignCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toEntityTagResponse(assigned));
	}

	@DeleteMapping("/assign/{entityTagId}")
	public ResponseEntity<Void> removeAssignment(@PathVariable UUID entityTagId) {
		tags.removeAssignment(new EntityTagId(entityTagId));
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/entity")
	public List<EntityTagResponse> listByTarget(
			@RequestParam(required = false) UUID accountId,
			@RequestParam(required = false) UUID contactId,
			@RequestParam(required = false) UUID leadId,
			@RequestParam(required = false) UUID opportunityId,
			@RequestParam(required = false) UUID activityId,
			@RequestParam(required = false) UUID ticketId) {
		return mapper.toEntityTagResponseList(tags.listByTarget(accountId, contactId, leadId, opportunityId, activityId, ticketId));
	}

}
