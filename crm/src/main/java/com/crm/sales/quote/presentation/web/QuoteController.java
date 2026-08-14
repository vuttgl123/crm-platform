package com.crm.sales.quote.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.sales.quote.application.command.DeleteQuoteCommand;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.usecase.QuoteFacade;
import com.crm.sales.quote.domain.QuoteId;
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
@RequestMapping("/api/quotes")
public final class QuoteController {

	private final QuoteFacade quotes;
	private final QuoteWebMapper mapper;

	public QuoteController(QuoteFacade quotes, QuoteWebMapper mapper) {
		this.quotes = quotes;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<QuoteResponse> create(
			@Valid @RequestBody CreateQuoteRequest request) {
		QuoteDetails created = quotes.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public QuoteResponse get(@PathVariable UUID id) {
		return mapper.toResponse(quotes.get(new QuoteId(id)));
	}

	@GetMapping
	public PageResult<QuoteSummaryResponse> search(
			@Valid @ModelAttribute QuoteSearchRequest request) {
		return mapper.toSummaryPage(
				quotes.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public QuoteResponse update(@PathVariable UUID id,
			@Valid @RequestBody UpdateQuoteRequest request) {
		return mapper.toResponse(quotes.update(
				mapper.toUpdateCommand(new QuoteId(id), request)));
	}

	@PostMapping("/{id}/approve")
	public QuoteResponse approve(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		return mapper.toResponse(quotes.approve(
				mapper.toApproveCommand(new QuoteId(id), IfMatchVersion.parse(ifMatch))));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		quotes.delete(new DeleteQuoteCommand(
				new QuoteId(id), IfMatchVersion.parse(ifMatch)));
		return ResponseEntity.noContent().build();
	}

}
