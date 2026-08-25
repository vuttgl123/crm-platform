package com.crm.sales.order.presentation.web;

import java.util.UUID;

public record OrderReferenceResponse(
		UUID id,
		String name,
		boolean exists
) {}
