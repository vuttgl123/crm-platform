package com.crm.sales.quote.presentation.web;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.sales.quote.application.command.AcceptQuoteCommand;
import com.crm.sales.quote.application.command.ApproveQuoteCommand;
import com.crm.sales.quote.application.command.CancelQuoteCommand;
import com.crm.sales.quote.application.command.ConvertQuoteToOrderCommand;
import com.crm.sales.quote.application.command.DeleteQuoteCommand;
import com.crm.sales.quote.application.command.MarkQuoteSentCommand;
import com.crm.sales.quote.application.command.RejectQuoteCommand;
import com.crm.sales.quote.application.command.RequestQuoteChangesCommand;
import com.crm.sales.quote.application.command.ReviseQuoteCommand;
import com.crm.sales.quote.application.command.SubmitQuoteCommand;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.dto.QuoteDocumentDto;
import com.crm.sales.quote.application.dto.QuotePulseDto;
import com.crm.sales.quote.application.dto.QuoteRevisionDto;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.usecase.QuoteFacade;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatusHistoryEntry;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpHeaders;
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
import org.springframework.web.bind.annotation.RequestParam;
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
		QuoteDetails created = quotes.createDraft(mapper.toCreateCommand(request));
		QuoteResponse response = mapper.toResponse(created);
		return ResponseEntity.status(HttpStatus.CREATED)
				.eTag(String.valueOf(created.version()))
				.body(response);
	}

	@PutMapping("/{id}")
	public ResponseEntity<QuoteResponse> saveDraft(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch,
			@Valid @RequestBody SaveQuoteDraftRequest request) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		QuoteDetails saved = quotes.saveDraft(new QuoteId(id), mapper.toSaveDraftCommand(request, expectedVersion));
		QuoteResponse response = mapper.toResponse(saved);
		return ResponseEntity.ok()
				.eTag(String.valueOf(saved.version()))
				.body(response);
	}

	@GetMapping("/{id}")
	public ResponseEntity<QuoteResponse> get(@PathVariable UUID id) {
		QuoteDetails details = quotes.get(new QuoteId(id));
		QuoteResponse response = mapper.toResponse(details);
		return ResponseEntity.ok()
				.eTag(String.valueOf(details.version()))
				.body(response);
	}

	@GetMapping
	public PageResult<QuoteSummaryResponse> search(
			@Valid @ModelAttribute QuoteSearchRequest request) {
		PageResult<QuoteSummary> result = quotes.search(mapper.toSearchQuery(request));
		return mapper.toSummaryPage(result);
	}

	@GetMapping("/summary")
	public QuotePulseResponse getPulse(
			@Valid @ModelAttribute QuoteSearchRequest request) {
		QuotePulseDto pulse = quotes.getPulse(mapper.toSearchQuery(request));
		return mapper.toPulseResponse(pulse);
	}

	@GetMapping("/{id}/document")
	public QuoteDocumentResponse getDocument(@PathVariable UUID id) {
		QuoteDocumentDto doc = quotes.getDocument(new QuoteId(id));
		return mapper.toDocumentResponse(doc);
	}

	@GetMapping("/{id}/history")
	public PageResult<QuoteStatusHistoryResponse> getHistory(
			@PathVariable UUID id,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		PageResult<QuoteStatusHistoryEntry> history = quotes.getHistory(new QuoteId(id), new PageQuery(page, size));
		return mapper.toHistoryPage(history);
	}

	@GetMapping("/{id}/revisions")
	public List<QuoteRevisionResponse> getRevisions(@PathVariable UUID id) {
		List<QuoteRevisionDto> revisions = quotes.getRevisions(new QuoteId(id));
		return revisions.stream().map(mapper::toRevisionResponse).toList();
	}

	@PostMapping("/{id}/submit")
	public ResponseEntity<QuoteResponse> submit(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		QuoteDetails updated = quotes.submitForApproval(new QuoteId(id), new SubmitQuoteCommand(expectedVersion));
		return ResponseEntity.ok()
				.eTag(String.valueOf(updated.version()))
				.body(mapper.toResponse(updated));
	}

	@PostMapping("/{id}/approve")
	public ResponseEntity<QuoteResponse> approve(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		QuoteDetails updated = quotes.approve(new QuoteId(id), new ApproveQuoteCommand(expectedVersion));
		return ResponseEntity.ok()
				.eTag(String.valueOf(updated.version()))
				.body(mapper.toResponse(updated));
	}

	@PostMapping("/{id}/request-changes")
	public ResponseEntity<QuoteResponse> requestChanges(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch,
			@Valid @RequestBody RequestQuoteChangesRequest request) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		QuoteDetails updated = quotes.requestChanges(new QuoteId(id), new RequestQuoteChangesCommand(request.reason(), expectedVersion));
		return ResponseEntity.ok()
				.eTag(String.valueOf(updated.version()))
				.body(mapper.toResponse(updated));
	}

	@PostMapping("/{id}/mark-sent")
	public ResponseEntity<QuoteResponse> markSent(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		QuoteDetails updated = quotes.markSent(new QuoteId(id), new MarkQuoteSentCommand(expectedVersion));
		return ResponseEntity.ok()
				.eTag(String.valueOf(updated.version()))
				.body(mapper.toResponse(updated));
	}

	@PostMapping("/{id}/accept")
	public ResponseEntity<QuoteResponse> accept(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch,
			@RequestBody(required = false) AcceptQuoteRequest request) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		String custRef = request != null ? request.customerReference() : null;
		QuoteDetails updated = quotes.accept(new QuoteId(id), new AcceptQuoteCommand(custRef, expectedVersion));
		return ResponseEntity.ok()
				.eTag(String.valueOf(updated.version()))
				.body(mapper.toResponse(updated));
	}

	@PostMapping("/{id}/reject")
	public ResponseEntity<QuoteResponse> reject(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch,
			@Valid @RequestBody RejectQuoteRequest request) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		QuoteDetails updated = quotes.reject(new QuoteId(id), new RejectQuoteCommand(request.reason(), expectedVersion));
		return ResponseEntity.ok()
				.eTag(String.valueOf(updated.version()))
				.body(mapper.toResponse(updated));
	}

	@PostMapping("/{id}/cancel")
	public ResponseEntity<QuoteResponse> cancel(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch,
			@Valid @RequestBody CancelQuoteRequest request) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		QuoteDetails updated = quotes.cancel(new QuoteId(id), new CancelQuoteCommand(request.reason(), expectedVersion));
		return ResponseEntity.ok()
				.eTag(String.valueOf(updated.version()))
				.body(mapper.toResponse(updated));
	}

	@PostMapping("/{id}/revise")
	public ResponseEntity<QuoteResponse> revise(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		QuoteDetails revised = quotes.revise(new QuoteId(id), new ReviseQuoteCommand(expectedVersion));
		return ResponseEntity.ok()
				.eTag(String.valueOf(revised.version()))
				.body(mapper.toResponse(revised));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		quotes.deleteDraft(new QuoteId(id), new DeleteQuoteCommand(new QuoteId(id), expectedVersion));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/convert-to-order")
	public ResponseEntity<Map<String, Object>> convertToOrder(
			@PathVariable UUID id,
			@RequestHeader("If-Match") @ValidIfMatchVersion String ifMatch) {
		long expectedVersion = IfMatchVersion.parse(ifMatch);
		UUID orderId = quotes.convertToOrder(new QuoteId(id), new ConvertQuoteToOrderCommand(expectedVersion));
		return ResponseEntity.ok(Map.of("orderId", orderId.toString()));
	}
}
