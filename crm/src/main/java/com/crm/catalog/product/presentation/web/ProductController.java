package com.crm.catalog.product.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.catalog.product.application.dto.ProductDetails;
import com.crm.catalog.product.application.usecase.ProductFacade;
import com.crm.catalog.product.domain.ProductId;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public final class ProductController {

	private final ProductFacade products;
	private final ProductWebMapper mapper;

	public ProductController(ProductFacade products, ProductWebMapper mapper) {
		this.products = products;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
		ProductDetails created = products.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/stats")
	public com.crm.catalog.product.application.dto.ProductStatsDto getStats() {
		return products.getStats();
	}

	@GetMapping("/{id}")
	public ProductResponse get(@PathVariable UUID id) {
		return mapper.toResponse(products.get(new ProductId(id)));
	}

	@GetMapping
	public PageResult<ProductSummaryResponse> search(@Valid @ModelAttribute ProductSearchRequest request) {
		return mapper.toSummaryPage(products.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public ProductResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateProductRequest request) {
		return mapper.toResponse(products.update(mapper.toUpdateCommand(new ProductId(id), request)));
	}

	@PatchMapping("/{id}/status")
	public ProductResponse updateStatus(
			@PathVariable UUID id,
			@Valid @RequestBody ChangeProductStatusRequest request) {
		ProductDetails updated = products.updateStatus(
				new com.crm.catalog.product.application.command.ChangeProductStatusCommand(
						new ProductId(id),
						request.active()
				));
		return mapper.toResponse(updated);
	}

	@PostMapping("/bulk/status")
	public ResponseEntity<java.util.Map<String, Object>> bulkUpdateStatus(
			@Valid @RequestBody BulkChangeProductStatusRequest request) {
		int updatedCount = products.bulkUpdateStatus(
				new com.crm.catalog.product.application.command.BulkChangeProductStatusCommand(
						request.productIds(),
						request.active()
				));
		return ResponseEntity.ok(java.util.Map.of("updatedCount", updatedCount));
	}

	@PostMapping("/bulk/category")
	public ResponseEntity<java.util.Map<String, Object>> bulkAssignCategory(
			@Valid @RequestBody BulkAssignProductCategoryRequest request) {
		int updatedCount = products.bulkAssignCategory(
				new com.crm.catalog.product.application.command.BulkAssignProductCategoryCommand(
						request.productIds(),
						request.categoryId()
				));
		return ResponseEntity.ok(java.util.Map.of("assignedCount", updatedCount));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		products.delete(new ProductId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

}
