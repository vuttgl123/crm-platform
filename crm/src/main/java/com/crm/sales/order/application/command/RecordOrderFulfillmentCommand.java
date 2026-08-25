package com.crm.sales.order.application.command;

import java.time.LocalDate;
import java.util.List;
import com.crm.sales.order.domain.OrderId;

public record RecordOrderFulfillmentCommand(
		OrderId orderId,
		String referenceNumber,
		LocalDate fulfillmentDate,
		String note,
		List<FulfillmentLineInputCommand> lines,
		long expectedVersion
) {}
