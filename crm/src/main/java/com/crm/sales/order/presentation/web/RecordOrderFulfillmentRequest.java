package com.crm.sales.order.presentation.web;

import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.NotEmpty;

public record RecordOrderFulfillmentRequest(
		String referenceNumber,
		LocalDate fulfillmentDate,
		String note,
		@NotEmpty List<FulfillmentLineInputRequest> lines
) {}
