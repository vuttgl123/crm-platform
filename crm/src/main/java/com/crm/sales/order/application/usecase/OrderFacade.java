package com.crm.sales.order.application.usecase;

import java.util.List;

import com.crm.sales.order.application.command.BulkChangeOrderStatusCommand;
import com.crm.sales.order.application.command.CancelOrderCommand;
import com.crm.sales.order.application.command.CloseRemainingOrderCommand;
import com.crm.sales.order.application.command.CompleteOrderCommand;
import com.crm.sales.order.application.command.ConfirmOrderCommand;
import com.crm.sales.order.application.command.CreateDirectOrderCommand;
import com.crm.sales.order.application.command.DeleteOrderCommand;
import com.crm.sales.order.application.command.RecordOrderFulfillmentCommand;
import com.crm.sales.order.application.command.SaveOrderDraftCommand;
import com.crm.sales.order.application.command.StartOrderProcessingCommand;
import com.crm.sales.order.application.command.VoidOrderFulfillmentCommand;
import com.crm.sales.order.application.dto.OrderDetails;
import com.crm.sales.order.application.dto.OrderDocumentDto;
import com.crm.sales.order.application.dto.OrderFulfillmentDto;
import com.crm.sales.order.application.dto.OrderPulseDto;
import com.crm.sales.order.application.dto.OrderStatsDto;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderStatusHistoryEntry;
import com.crm.sharedkernel.application.PageResult;

public interface OrderFacade {

	OrderDetails createDirectDraft(CreateDirectOrderCommand command);

	OrderDetails saveDraft(SaveOrderDraftCommand command);

	OrderDetails get(OrderId orderId);

	PageResult<OrderSummary> search(OrderSearchQuery query);

	OrderPulseDto getPulse();

	OrderStatsDto getStats();

	OrderDocumentDto getDocument(OrderId orderId);

	List<OrderStatusHistoryEntry> getStatusHistory(OrderId orderId);

	List<OrderFulfillmentDto> getFulfillments(OrderId orderId);

	OrderDetails confirm(ConfirmOrderCommand command);

	OrderDetails complete(CompleteOrderCommand command);

	OrderDetails startProcessing(StartOrderProcessingCommand command);

	OrderDetails recordFulfillment(RecordOrderFulfillmentCommand command);

	OrderDetails voidFulfillment(VoidOrderFulfillmentCommand command);

	OrderDetails closeRemaining(CloseRemainingOrderCommand command);

	OrderDetails cancel(CancelOrderCommand command);

	int bulkChangeStatus(BulkChangeOrderStatusCommand command);

	void deleteDraft(DeleteOrderCommand command);

}
