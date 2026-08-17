package com.crm.catalog.category.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.catalog.category.application.dto.CategoryDetails;
import com.crm.catalog.category.application.usecase.CategoryFacade;
import com.crm.catalog.category.domain.CategoryId;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public final class CategoryController {

	private final CategoryFacade categories;
	private final CategoryWebMapper mapper;

	public CategoryController(CategoryFacade categories, CategoryWebMapper mapper) {
		this.categories = categories;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
		CategoryDetails created = categories.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public CategoryResponse get(@PathVariable UUID id) {
		return mapper.toResponse(categories.get(new CategoryId(id)));
	}

	@GetMapping
	public List<CategorySummaryResponse> list() {
		return mapper.toSummaryResponseList(categories.list());
	}

	@PutMapping("/{id}")
	public CategoryResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateCategoryRequest request) {
		return mapper.toResponse(categories.update(mapper.toUpdateCommand(new CategoryId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		categories.delete(new CategoryId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

}
