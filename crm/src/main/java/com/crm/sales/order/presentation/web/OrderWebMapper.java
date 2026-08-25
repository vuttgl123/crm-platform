package com.crm.sales.order.presentation.web;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.crm.sales.order.application.command.CancelOrderCommand;
import com.crm.sales.order.application.command.CloseRemainingOrderCommand;
import com.crm.sales.order.application.command.ConfirmOrderCommand;
import com.crm.sales.order.application.command.CreateDirectOrderCommand;
import com.crm.sales.order.application.command.DeleteOrderCommand;
import com.crm.sales.order.application.command.FulfillmentLineInputCommand;
import com.crm.sales.order.application.command.OrderLineInputCommand;
import com.crm.sales.order.application.command.RecordOrderFulfillmentCommand;
import com.crm.sales.order.application.command.SaveOrderDraftCommand;
import com.crm.sales.order.application.command.StartOrderProcessingCommand;
import com.crm.sales.order.application.command.VoidOrderFulfillmentCommand;
import com.crm.sales.order.application.dto.OrderDetails;
import com.crm.sales.order.application.dto.OrderDocumentDto;
import com.crm.sales.order.application.dto.OrderFulfillmentDto;
import com.crm.sales.order.application.dto.OrderFulfillmentLineDto;
import com.crm.sales.order.application.dto.OrderLineDetails;
import com.crm.sales.order.application.dto.OrderPulseDto;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.domain.OrderAddressSnapshot;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderStatusHistoryEntry;
import com.crm.sharedkernel.application.PageQuery;

public final class OrderWebMapper {

	private OrderWebMapper() {
	}

	public static CreateDirectOrderCommand toCommand(CreateDirectOrderRequest request) {
		OrderAddressSnapshot billing = toSnapshot(request.billingAddressSnapshot());
		OrderAddressSnapshot shipping = toSnapshot(request.shippingAddressSnapshot());
		return new CreateDirectOrderCommand(
				request.accountId(),
				request.contactId(),
				request.opportunityId(),
				request.priceBookId(),
				request.ownerType(),
				request.ownerId(),
				request.currencyCode(),
				billing,
				shipping,
				request.orderDate(),
				request.requestedDeliveryDate(),
				request.customerReference(),
				request.paymentTerms(),
				request.deliveryTerms(),
				request.notes()
		);
	}

	public static SaveOrderDraftCommand toCommand(OrderId orderId, SaveOrderDraftRequest request, long expectedVersion) {
		OrderAddressSnapshot billing = toSnapshot(request.billingAddressSnapshot());
		OrderAddressSnapshot shipping = toSnapshot(request.shippingAddressSnapshot());

		List<OrderLineInputCommand> lines = new ArrayList<>();
		if (request.lines() != null) {
			for (OrderLineInputRequest lr : request.lines()) {
				lines.add(new OrderLineInputCommand(
						lr.id(),
						lr.lineNumber(),
						lr.productId(),
						lr.quoteItemId(),
						lr.skuSnapshot(),
						lr.nameSnapshot(),
						lr.descriptionSnapshot(),
						lr.unitOfMeasureSnapshot(),
						lr.quantity(),
						lr.unitPrice(),
						lr.discountPercent(),
						lr.discountAmount(),
						lr.taxPercent(),
						lr.taxAmount()
				));
			}
		}

		return new SaveOrderDraftCommand(
				orderId,
				request.accountId(),
				request.contactId(),
				request.opportunityId(),
				request.priceBookId(),
				request.ownerType(),
				request.ownerId(),
				billing,
				shipping,
				request.orderDate(),
				request.requestedDeliveryDate(),
				request.customerReference(),
				request.paymentTerms(),
				request.deliveryTerms(),
				request.notes(),
				request.shippingTotal(),
				lines,
				expectedVersion
		);
	}

	public static ConfirmOrderCommand toConfirmCommand(OrderId orderId, long expectedVersion) {
		return new ConfirmOrderCommand(orderId, expectedVersion);
	}

	public static StartOrderProcessingCommand toStartProcessingCommand(OrderId orderId, long expectedVersion) {
		return new StartOrderProcessingCommand(orderId, expectedVersion);
	}

	public static RecordOrderFulfillmentCommand toCommand(OrderId orderId, RecordOrderFulfillmentRequest request, long expectedVersion) {
		List<FulfillmentLineInputCommand> lines = new ArrayList<>();
		if (request.lines() != null) {
			for (FulfillmentLineInputRequest lr : request.lines()) {
				lines.add(new FulfillmentLineInputCommand(lr.orderLineId(), lr.quantity()));
			}
		}
		return new RecordOrderFulfillmentCommand(
				orderId,
				request.referenceNumber(),
				request.fulfillmentDate(),
				request.note(),
				lines,
				expectedVersion
		);
	}

	public static VoidOrderFulfillmentCommand toCommand(OrderId orderId, UUID fulfillmentId, VoidOrderFulfillmentRequest request, long expectedVersion) {
		return new VoidOrderFulfillmentCommand(orderId, fulfillmentId, request.reason(), expectedVersion);
	}

	public static CloseRemainingOrderCommand toCommand(OrderId orderId, CloseRemainingOrderRequest request, long expectedVersion) {
		return new CloseRemainingOrderCommand(orderId, request.reason(), expectedVersion);
	}

	public static CancelOrderCommand toCommand(OrderId orderId, CancelOrderRequest request, long expectedVersion) {
		return new CancelOrderCommand(orderId, request.reason(), expectedVersion);
	}

	public static DeleteOrderCommand toDeleteCommand(OrderId orderId, long expectedVersion) {
		return new DeleteOrderCommand(orderId, expectedVersion);
	}

	public static OrderSearchQuery toQuery(OrderSearchRequest request) {
		int page = request.page() != null && request.page() >= 0 ? request.page() : 0;
		int size = request.size() != null && request.size() > 0 ? request.size() : 20;
		return new OrderSearchQuery(
				request.q(),
				request.accountId(),
				request.contactId(),
				request.opportunityId(),
				request.quoteId(),
				request.status(),
				request.statuses(),
				request.ownerType(),
				request.ownerId(),
				request.fromDate(),
				request.toDate(),
				request.currencyCode(),
				new PageQuery(page, size)
		);
	}

	public static OrderResponse toResponse(OrderDetails details) {
		List<OrderLineResponse> lines = new ArrayList<>();
		if (details.lines() != null) {
			for (OrderLineDetails ld : details.lines()) {
				lines.add(new OrderLineResponse(
						ld.id(),
						ld.lineNumber(),
						ld.productId(),
						ld.quoteItemId(),
						ld.skuSnapshot(),
						ld.nameSnapshot(),
						ld.descriptionSnapshot(),
						ld.unitOfMeasureSnapshot(),
						ld.quantity(),
						ld.fulfilledQuantity(),
						ld.remainingQuantity(),
						ld.unitPrice(),
						ld.discountPercent(),
						ld.discountAmount(),
						ld.taxPercent(),
						ld.taxAmount(),
						ld.lineTotal()
				));
			}
		}

		return new OrderResponse(
				details.id().value(),
				details.orderNumber(),
				details.sourceType(),
				details.pricingMode(),
				details.status(),
				details.account() != null ? new OrderReferenceResponse(details.account().id(), details.account().name(), details.account().exists()) : null,
				details.contact() != null ? new OrderReferenceResponse(details.contact().id(), details.contact().name(), details.contact().exists()) : null,
				details.opportunity() != null ? new OrderReferenceResponse(details.opportunity().id(), details.opportunity().name(), details.opportunity().exists()) : null,
				details.quote() != null ? new OrderReferenceResponse(details.quote().id(), details.quote().name(), details.quote().exists()) : null,
				details.priceBook() != null ? new OrderReferenceResponse(details.priceBook().id(), details.priceBook().name(), details.priceBook().exists()) : null,
				details.owner() != null ? new OrderOwnerReferenceResponse(details.owner().type(), details.owner().id(), details.owner().name()) : null,
				new OrderAmountsResponse(
						details.amounts().currencyCode(),
						details.amounts().subtotal(),
						details.amounts().discountTotal(),
						details.amounts().taxTotal(),
						details.amounts().shippingTotal(),
						details.amounts().grandTotal()
				),
				toSnapshotResponse(details.billingAddressSnapshot()),
				toSnapshotResponse(details.shippingAddressSnapshot()),
				lines,
				details.progressPercent(),
				details.orderDate(),
				details.requestedDeliveryDate(),
				details.customerReference(),
				details.paymentTerms(),
				details.deliveryTerms(),
				details.notes(),
				details.confirmedAt(),
				details.confirmedBy() != null ? details.confirmedBy().toString() : null,
				details.fulfilledAt(),
				details.cancelledAt(),
				details.cancelledBy() != null ? details.cancelledBy().toString() : null,
				details.cancellationReason(),
				details.closedAt(),
				details.closedBy() != null ? details.closedBy().toString() : null,
				details.closedReason(),
				details.createdAt(),
				details.createdBy() != null ? details.createdBy().toString() : null,
				details.updatedAt(),
				details.updatedBy() != null ? details.updatedBy().toString() : null,
				details.version(),
				details.availableActions()
		);
	}

	public static OrderSummaryResponse toResponse(OrderSummary summary) {
		return new OrderSummaryResponse(
				summary.id().value(),
				summary.orderNumber(),
				summary.sourceType(),
				summary.pricingMode(),
				summary.status(),
				summary.account() != null ? new OrderReferenceResponse(summary.account().id(), summary.account().name(), summary.account().exists()) : null,
				summary.opportunity() != null ? new OrderReferenceResponse(summary.opportunity().id(), summary.opportunity().name(), summary.opportunity().exists()) : null,
				summary.quote() != null ? new OrderReferenceResponse(summary.quote().id(), summary.quote().name(), summary.quote().exists()) : null,
				summary.owner() != null ? new OrderOwnerReferenceResponse(summary.owner().type(), summary.owner().id(), summary.owner().name()) : null,
				new OrderAmountsResponse(
						summary.amounts().currencyCode(),
						summary.amounts().subtotal(),
						summary.amounts().discountTotal(),
						summary.amounts().taxTotal(),
						summary.amounts().shippingTotal(),
						summary.amounts().grandTotal()
				),
				summary.lineCount(),
				summary.progressPercent(),
				summary.orderDate(),
				summary.requestedDeliveryDate(),
				summary.updatedAt(),
				summary.version(),
				summary.availableActions()
		);
	}

	public static OrderDocumentResponse toResponse(OrderDocumentDto doc) {
		List<OrderLineResponse> lines = new ArrayList<>();
		if (doc.lines() != null) {
			for (OrderLineDetails ld : doc.lines()) {
				lines.add(new OrderLineResponse(
						ld.id(),
						ld.lineNumber(),
						ld.productId(),
						ld.quoteItemId(),
						ld.skuSnapshot(),
						ld.nameSnapshot(),
						ld.descriptionSnapshot(),
						ld.unitOfMeasureSnapshot(),
						ld.quantity(),
						ld.fulfilledQuantity(),
						ld.remainingQuantity(),
						ld.unitPrice(),
						ld.discountPercent(),
						ld.discountAmount(),
						ld.taxPercent(),
						ld.taxAmount(),
						ld.lineTotal()
				));
			}
		}

		return new OrderDocumentResponse(
				doc.id().value(),
				doc.orderNumber(),
				doc.status(),
				doc.account() != null ? new OrderReferenceResponse(doc.account().id(), doc.account().name(), doc.account().exists()) : null,
				doc.contact() != null ? new OrderReferenceResponse(doc.contact().id(), doc.contact().name(), doc.contact().exists()) : null,
				doc.opportunity() != null ? new OrderReferenceResponse(doc.opportunity().id(), doc.opportunity().name(), doc.opportunity().exists()) : null,
				doc.quote() != null ? new OrderReferenceResponse(doc.quote().id(), doc.quote().name(), doc.quote().exists()) : null,
				doc.owner() != null ? new OrderOwnerReferenceResponse(doc.owner().type(), doc.owner().id(), doc.owner().name()) : null,
				new OrderAmountsResponse(
						doc.amounts().currencyCode(),
						doc.amounts().subtotal(),
						doc.amounts().discountTotal(),
						doc.amounts().taxTotal(),
						doc.amounts().shippingTotal(),
						doc.amounts().grandTotal()
				),
				toSnapshotResponse(doc.billingAddressSnapshot()),
				toSnapshotResponse(doc.shippingAddressSnapshot()),
				lines,
				doc.progressPercent(),
				doc.orderDate(),
				doc.requestedDeliveryDate(),
				doc.customerReference(),
				doc.paymentTerms(),
				doc.deliveryTerms(),
				doc.notes(),
				doc.confirmedAt(),
				doc.fulfilledAt(),
				doc.createdAt()
		);
	}

	public static OrderFulfillmentResponse toResponse(OrderFulfillmentDto dto) {
		List<OrderFulfillmentLineResponse> lines = new ArrayList<>();
		if (dto.lines() != null) {
			for (OrderFulfillmentLineDto fl : dto.lines()) {
				lines.add(new OrderFulfillmentLineResponse(
						fl.id(),
						fl.orderLineId(),
						fl.lineName(),
						fl.lineSku(),
						fl.quantity()
				));
			}
		}
		return new OrderFulfillmentResponse(
				dto.id(),
				dto.eventNumber(),
				dto.referenceNumber(),
				dto.fulfillmentDate(),
				dto.note(),
				dto.status(),
				dto.occurredAt(),
				dto.recordedBy() != null ? dto.recordedBy().toString() : null,
				dto.voidedAt(),
				dto.voidedBy() != null ? dto.voidedBy().toString() : null,
				dto.voidReason(),
				lines,
				dto.version()
		);
	}

	public static OrderStatusHistoryResponse toResponse(OrderStatusHistoryEntry entry) {
		return new OrderStatusHistoryResponse(
				entry.id(),
				entry.orderId().value(),
				entry.changedAt(),
				entry.changedBy() != null ? entry.changedBy().toString() : null,
				entry.action(),
				entry.fromStatus(),
				entry.toStatus(),
				entry.notes()
		);
	}

	public static OrderPulseResponse toResponse(OrderPulseDto pulse) {
		return new OrderPulseResponse(
				pulse.totalOrders(),
				pulse.activeProcessingCount(),
				pulse.pendingFulfillmentCount(),
				pulse.completedCount(),
				pulse.currencyGroups()
		);
	}

	private static OrderAddressSnapshot toSnapshot(OrderAddressSnapshotRequest req) {
		if (req == null) return null;
		return new OrderAddressSnapshot(
				req.legalName(),
				req.addressLine1(),
				req.addressLine2(),
				req.locality(),
				req.region(),
				req.postalCode(),
				req.countryCode(),
				req.contactName(),
				req.contactEmail(),
				req.contactPhone()
		);
	}

	private static OrderAddressSnapshotResponse toSnapshotResponse(OrderAddressSnapshot snap) {
		if (snap == null) return null;
		return new OrderAddressSnapshotResponse(
				snap.legalName(),
				snap.addressLine1(),
				snap.addressLine2(),
				snap.locality(),
				snap.region(),
				snap.postalCode(),
				snap.countryCode(),
				snap.contactName(),
				snap.contactEmail(),
				snap.contactPhone()
		);
	}

}
