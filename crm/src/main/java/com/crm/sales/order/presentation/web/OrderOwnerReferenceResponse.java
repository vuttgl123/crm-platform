package com.crm.sales.order.presentation.web;

import java.util.UUID;

public record OrderOwnerReferenceResponse(
		String type,
		UUID id,
		String name
) {}
