package com.crm.sales.order.application.dto;

import java.util.UUID;

public record OrderReferenceDto(
		UUID id,
		String name,
		boolean exists
) {}
