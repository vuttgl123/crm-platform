package com.crm.catalog.pricebook.application.command;

import com.crm.catalog.pricebook.domain.PriceBookId;

public record ChangePriceBookStatusCommand(
		PriceBookId id,
		boolean active
) {}
