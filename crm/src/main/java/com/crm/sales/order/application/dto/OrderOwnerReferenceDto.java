package com.crm.sales.order.application.dto;

import java.util.UUID;

public record OrderOwnerReferenceDto(
		String type,
		UUID id,
		String name
) {}
