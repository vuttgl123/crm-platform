package com.crm.sales.order.presentation.web;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.sales.order.application.command.DeleteOrderCommand;
import com.crm.sales.order.application.dto.OrderDetails;
import com.crm.sales.order.application.dto.OrderDocumentDto;
import com.crm.sales.order.application.dto.OrderFulfillmentDto;
import com.crm.sales.order.application.dto.OrderPulseDto;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.usecase.OrderFacade;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderStatusHistoryEntry;
import com.crm.sharedkernel.application.PageResult;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales/orders")
public class OrderController {

	private final OrderFacade orders;

	public OrderController(OrderFacade orders) {
		this.orders = orders;
	}

	@PostMapping
	public ResponseEntity<OrderResponse> createDirectDraft(
			@Valid @RequestBody CreateDirectOrderRequest request) {
		OrderDetails details = orders.createDirectDraft(OrderWebMapper.toCommand(request));
		return ResponseEntity.created(URI.create("/api/sales/orders/" + details.id().value()))
				.eTag(String.valueOf(details.version()))
				.body(OrderWebMapper.toResponse(details));
	}

	@PutMapping("/{id}")
	public ResponseEntity<OrderResponse> saveDraft(
			@PathVariable UUID id,
			@RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String ifMatch,
			@Valid @RequestBody SaveOrderDraftRequest request) {
		long version = IfMatchVersion.parse(ifMatch);
		OrderDetails details = orders.saveDraft(OrderWebMapper.toCommand(new OrderId(id), request, version));
		return ResponseEntity.ok()
				.eTag(String.valueOf(details.version()))
				.body(OrderWebMapper.toResponse(details));
	}

	@GetMapping("/{id}")
	public ResponseEntity<OrderResponse> get(@PathVariable UUID id) {
		OrderDetails details = orders.get(new OrderId(id));
		return ResponseEntity.ok()
				.eTag(String.valueOf(details.version()))
				.body(OrderWebMapper.toResponse(details));
	}

	@GetMapping
	public ResponseEntity<PageResult<OrderSummaryResponse>> search(
			@ModelAttribute OrderSearchRequest request) {
		PageResult<OrderSummary> result = orders.search(OrderWebMapper.toQuery(request));
		List<OrderSummaryResponse> items = result.items().stream()
				.map(OrderWebMapper::toResponse)
				.toList();
		return ResponseEntity.ok(new PageResult<>(
				items,
				result.page(),
				result.size(),
				result.totalElements(),
				result.totalPages()
		));
	}

	@GetMapping("/summary")
	public ResponseEntity<OrderPulseResponse> getPulse() {
		OrderPulseDto pulse = orders.getPulse();
		return ResponseEntity.ok(OrderWebMapper.toResponse(pulse));
	}

	@GetMapping("/{id}/document")
	public ResponseEntity<OrderDocumentResponse> getDocument(@PathVariable UUID id) {
		OrderDocumentDto doc = orders.getDocument(new OrderId(id));
		return ResponseEntity.ok(OrderWebMapper.toResponse(doc));
	}

	@GetMapping("/{id}/history")
	public ResponseEntity<List<OrderStatusHistoryResponse>> getStatusHistory(@PathVariable UUID id) {
		List<OrderStatusHistoryEntry> history = orders.getStatusHistory(new OrderId(id));
		return ResponseEntity.ok(history.stream().map(OrderWebMapper::toResponse).toList());
	}

	@GetMapping("/{id}/fulfillments")
	public ResponseEntity<List<OrderFulfillmentResponse>> getFulfillments(@PathVariable UUID id) {
		List<OrderFulfillmentDto> fulfillments = orders.getFulfillments(new OrderId(id));
		return ResponseEntity.ok(fulfillments.stream().map(OrderWebMapper::toResponse).toList());
	}

	@PostMapping("/{id}/confirm")
	public ResponseEntity<OrderResponse> confirm(
			@PathVariable UUID id,
			@RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String ifMatch) {
		long version = IfMatchVersion.parse(ifMatch);
		OrderDetails details = orders.confirm(OrderWebMapper.toConfirmCommand(new OrderId(id), version));
		return ResponseEntity.ok()
				.eTag(String.valueOf(details.version()))
				.body(OrderWebMapper.toResponse(details));
	}

	@PostMapping("/{id}/start-processing")
	public ResponseEntity<OrderResponse> startProcessing(
			@PathVariable UUID id,
			@RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String ifMatch) {
		long version = IfMatchVersion.parse(ifMatch);
		OrderDetails details = orders.startProcessing(OrderWebMapper.toStartProcessingCommand(new OrderId(id), version));
		return ResponseEntity.ok()
				.eTag(String.valueOf(details.version()))
				.body(OrderWebMapper.toResponse(details));
	}

	@PostMapping("/{id}/fulfillments")
	public ResponseEntity<OrderResponse> recordFulfillment(
			@PathVariable UUID id,
			@RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String ifMatch,
			@Valid @RequestBody RecordOrderFulfillmentRequest request) {
		long version = IfMatchVersion.parse(ifMatch);
		OrderDetails details = orders.recordFulfillment(OrderWebMapper.toCommand(new OrderId(id), request, version));
		return ResponseEntity.ok()
				.eTag(String.valueOf(details.version()))
				.body(OrderWebMapper.toResponse(details));
	}

	@PostMapping("/{id}/fulfillments/{eventId}/void")
	public ResponseEntity<OrderResponse> voidFulfillment(
			@PathVariable UUID id,
			@PathVariable UUID eventId,
			@RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String ifMatch,
			@Valid @RequestBody VoidOrderFulfillmentRequest request) {
		long version = IfMatchVersion.parse(ifMatch);
		OrderDetails details = orders.voidFulfillment(OrderWebMapper.toCommand(new OrderId(id), eventId, request, version));
		return ResponseEntity.ok()
				.eTag(String.valueOf(details.version()))
				.body(OrderWebMapper.toResponse(details));
	}

	@PostMapping("/{id}/close-remaining")
	public ResponseEntity<OrderResponse> closeRemaining(
			@PathVariable UUID id,
			@RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String ifMatch,
			@Valid @RequestBody CloseRemainingOrderRequest request) {
		long version = IfMatchVersion.parse(ifMatch);
		OrderDetails details = orders.closeRemaining(OrderWebMapper.toCommand(new OrderId(id), request, version));
		return ResponseEntity.ok()
				.eTag(String.valueOf(details.version()))
				.body(OrderWebMapper.toResponse(details));
	}

	@PostMapping("/{id}/cancel")
	public ResponseEntity<OrderResponse> cancel(
			@PathVariable UUID id,
			@RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String ifMatch,
			@Valid @RequestBody CancelOrderRequest request) {
		long version = IfMatchVersion.parse(ifMatch);
		OrderDetails details = orders.cancel(OrderWebMapper.toCommand(new OrderId(id), request, version));
		return ResponseEntity.ok()
				.eTag(String.valueOf(details.version()))
				.body(OrderWebMapper.toResponse(details));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String ifMatch) {
		long version = IfMatchVersion.parse(ifMatch);
		orders.deleteDraft(new DeleteOrderCommand(new OrderId(id), version));
		return ResponseEntity.noContent().build();
	}

}
