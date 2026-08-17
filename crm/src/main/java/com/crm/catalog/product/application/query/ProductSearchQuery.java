package com.crm.catalog.product.application.query;

import java.util.UUID;

import com.crm.catalog.product.domain.ProductType;
import com.crm.sharedkernel.application.PageQuery;

public record ProductSearchQuery(
		String search,
		UUID categoryId,
		ProductType productType,
		Boolean isActive,
		PageQuery page
) {

	public ProductSearchQuery {
		if (page == null) {
			page = PageQuery.defaultPage();
		}
	}

}
