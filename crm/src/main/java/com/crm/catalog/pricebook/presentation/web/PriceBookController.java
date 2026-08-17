package com.crm.catalog.pricebook.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.catalog.pricebook.application.dto.PriceBookDetails;
import com.crm.catalog.pricebook.application.dto.PriceBookItemDetails;
import com.crm.catalog.pricebook.application.usecase.PriceBookFacade;
import com.crm.catalog.pricebook.domain.PriceBookId;
import com.crm.catalog.pricebook.domain.PriceBookItemId;
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
@RequestMapping("/api/price-books")
public final class PriceBookController {

	private final PriceBookFacade priceBooks;
	private final PriceBookWebMapper mapper;

	public PriceBookController(PriceBookFacade priceBooks, PriceBookWebMapper mapper) {
		this.priceBooks = priceBooks;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<PriceBookResponse> create(@Valid @RequestBody CreatePriceBookRequest request) {
		PriceBookDetails created = priceBooks.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public PriceBookResponse get(@PathVariable UUID id) {
		return mapper.toResponse(priceBooks.get(new PriceBookId(id)));
	}

	@GetMapping
	public List<PriceBookSummaryResponse> list() {
		return mapper.toSummaryResponseList(priceBooks.list());
	}

	@PutMapping("/{id}")
	public PriceBookResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdatePriceBookRequest request) {
		return mapper.toResponse(priceBooks.update(mapper.toUpdateCommand(new PriceBookId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		priceBooks.delete(new PriceBookId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/items")
	public ResponseEntity<PriceBookItemResponse> addItem(
			@PathVariable UUID id,
			@Valid @RequestBody AddPriceBookItemRequest request) {
		PriceBookItemDetails item = priceBooks.addItem(mapper.toAddItemCommand(new PriceBookId(id), request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toItemResponse(item));
	}

	@DeleteMapping("/{id}/items/{itemId}")
	public ResponseEntity<Void> removeItem(
			@PathVariable UUID id,
			@PathVariable UUID itemId) {
		priceBooks.removeItem(new PriceBookId(id), new PriceBookItemId(itemId));
		return ResponseEntity.noContent().build();
	}

}
