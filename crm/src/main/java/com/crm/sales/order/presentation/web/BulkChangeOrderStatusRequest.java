package com.crm.sales.order.presentation.web;

import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import com.crm.sales.order.domain.OrderStatus;

public record BulkChangeOrderStatusRequest(
		@NotEmpty List<UUID> orderIds,
		@NotNull OrderStatus status,
		String reason
) {}
