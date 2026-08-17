package com.crm.sales.order.presentation.web;

import java.util.UUID;

import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.sales.order.application.command.CancelOrderCommand;
import com.crm.sales.order.application.command.ConfirmOrderCommand;
import com.crm.sales.order.application.command.CreateOrderCommand;
import com.crm.sales.order.application.command.UpdateOrderCommand;
import com.crm.sales.order.application.dto.OrderDetails;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.domain.OrderAmounts;
import com.crm.sales.order.domain.OrderId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = CrmMapperConfig.class)
public interface OrderWebMapper {

	CreateOrderCommand toCreateCommand(CreateOrderRequest request);

	@Mapping(target = "orderId", source = "orderId")
	@Mapping(target = "expectedVersion", source = "request.version")
	UpdateOrderCommand toUpdateCommand(
			OrderId orderId, UpdateOrderRequest request);

	default ConfirmOrderCommand toConfirmCommand(OrderId orderId, long version) {
		return new ConfirmOrderCommand(orderId, version);
	}

	default CancelOrderCommand toCancelCommand(
			OrderId orderId, String reason, long version) {
		return new CancelOrderCommand(orderId, reason, version);
	}

	OrderResponse toResponse(OrderDetails details);

	OrderSummaryResponse toSummaryResponse(OrderSummary summary);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(OrderId value) {
		return value == null ? null : value.value();
	}

	default OrderId toOrderId(UUID value) {
		return value == null ? null : new OrderId(value);
	}

	default OrderAmounts toAmounts(CreateOrderRequest.Amounts value) {
		if (value == null) return null;
		return OrderAmounts.create(
				value.currencyCode(), value.subtotal(),
				value.discountTotal(), value.taxTotal(), value.shippingTotal());
	}

	default OrderAmounts toAmounts(UpdateOrderRequest.Amounts value) {
		if (value == null) return null;
		return OrderAmounts.create(
				value.currencyCode(), value.subtotal(),
				value.discountTotal(), value.taxTotal(), value.shippingTotal());
	}

	default OrderResponse.Amounts toResponseAmounts(OrderAmounts value) {
		if (value == null) return null;
		return new OrderResponse.Amounts(
				value.currencyCode(), value.subtotal(),
				value.discountTotal(), value.taxTotal(),
				value.shippingTotal(), value.grandTotal());
	}

	default OrderSummaryResponse.Amounts toSummaryResponseAmounts(OrderAmounts value) {
		if (value == null) return null;
		return QuoteSummaryAmounts(value);
	}

	private OrderSummaryResponse.Amounts QuoteSummaryAmounts(OrderAmounts value) {
		return new OrderSummaryResponse.Amounts(
				value.currencyCode(), value.subtotal(),
				value.discountTotal(), value.taxTotal(),
				value.shippingTotal(), value.grandTotal());
	}

	default OrderSearchQuery toSearchQuery(OrderSearchRequest request) {
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new OrderSearchQuery(
				request.q(), request.accountId(),
				request.opportunityId(), request.quoteId(),
				request.status(), request.ownerUserId(),
				new PageQuery(page, size));
	}

	default PageResult<OrderSummaryResponse> toSummaryPage(
			PageResult<OrderSummary> page) {
		return new PageResult<>(
				page.items().stream()
						.map(this::toSummaryResponse)
						.toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages());
	}

}
