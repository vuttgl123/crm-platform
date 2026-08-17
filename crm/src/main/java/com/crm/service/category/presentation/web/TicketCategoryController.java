package com.crm.service.category.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.service.category.application.dto.TicketCategoryDetails;
import com.crm.service.category.application.usecase.TicketCategoryFacade;
import com.crm.service.category.domain.TicketCategoryId;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/service/categories")
public final class TicketCategoryController {

	private final TicketCategoryFacade categories;
	private final TicketCategoryWebMapper mapper;

	public TicketCategoryController(TicketCategoryFacade categories, TicketCategoryWebMapper mapper) {
		this.categories = categories;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<TicketCategoryResponse> create(@Valid @RequestBody CreateTicketCategoryRequest request) {
		TicketCategoryDetails created = categories.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public TicketCategoryResponse get(@PathVariable UUID id) {
		return mapper.toResponse(categories.get(new TicketCategoryId(id)));
	}

	@GetMapping
	public List<TicketCategorySummaryResponse> list() {
		return mapper.toSummaryResponseList(categories.list());
	}

	@PutMapping("/{id}")
	public TicketCategoryResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateTicketCategoryRequest request) {
		return mapper.toResponse(categories.update(mapper.toUpdateCommand(new TicketCategoryId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		categories.delete(new TicketCategoryId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

}
