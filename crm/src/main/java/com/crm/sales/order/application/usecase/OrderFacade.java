package com.crm.sales.order.application.usecase;

import com.crm.sales.order.application.command.CancelOrderCommand;
import com.crm.sales.order.application.command.ConfirmOrderCommand;
import com.crm.sales.order.application.command.CreateOrderCommand;
import com.crm.sales.order.application.command.DeleteOrderCommand;
import com.crm.sales.order.application.command.UpdateOrderCommand;
import com.crm.sales.order.application.dto.OrderDetails;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.domain.OrderId;
import com.crm.sharedkernel.application.PageResult;

public interface OrderFacade {

	OrderDetails create(CreateOrderCommand command);

	OrderDetails get(OrderId orderId);

	PageResult<OrderSummary> search(OrderSearchQuery query);

	OrderDetails update(UpdateOrderCommand command);

	OrderDetails confirm(ConfirmOrderCommand command);

	OrderDetails cancel(CancelOrderCommand command);

	void delete(DeleteOrderCommand command);

}
