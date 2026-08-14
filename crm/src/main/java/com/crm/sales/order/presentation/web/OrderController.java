package com.crm.sales.order.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.sales.order.application.command.DeleteOrderCommand;
import com.crm.sales.order.application.dto.OrderDetails;
import com.crm.sales.order.application.usecase.OrderFacade;
import com.crm.sales.order.domain.OrderId;
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
@RequestMapping("/api/orders")
public final class OrderController {

	private final OrderFacade orders;
	private final OrderWebMapper mapper;

	public OrderController(OrderFacade orders, OrderWebMapper mapper) {
		this.orders = orders;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<OrderResponse> create(
			@Valid @RequestBody CreateOrderRequest request) {
		OrderDetails created = orders.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public OrderResponse get(@PathVariable UUID id) {
		return mapper.toResponse(orders.get(new OrderId(id)));
	}

	@GetMapping
	public PageResult<OrderSummaryResponse> search(
			@Valid @ModelAttribute OrderSearchRequest request) {
		return mapper.toSummaryPage(
				orders.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public OrderResponse update(@PathVariable UUID id,
			@Valid @RequestBody UpdateOrderRequest request) {
		return mapper.toResponse(orders.update(
				mapper.toUpdateCommand(new OrderId(id), request)));
	}

	@PostMapping("/{id}/confirm")
	public OrderResponse confirm(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		return mapper.toResponse(orders.confirm(
				mapper.toConfirmCommand(new OrderId(id), IfMatchVersion.parse(ifMatch))));
	}

	@PostMapping("/{id}/cancel")
	public OrderResponse cancel(@PathVariable UUID id,
			@Valid @RequestBody CancelOrderRequest request,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		return mapper.toResponse(orders.cancel(
				mapper.toCancelCommand(new OrderId(id), request.reason(), IfMatchVersion.parse(ifMatch))));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		orders.delete(new DeleteOrderCommand(
				new OrderId(id), IfMatchVersion.parse(ifMatch)));
		return ResponseEntity.noContent().build();
	}

}
