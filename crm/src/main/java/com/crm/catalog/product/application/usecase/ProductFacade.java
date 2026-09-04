package com.crm.catalog.product.application.usecase;

import com.crm.catalog.product.application.command.CreateProductCommand;
import com.crm.catalog.product.application.command.UpdateProductCommand;
import com.crm.catalog.product.application.dto.ProductDetails;
import com.crm.catalog.product.application.dto.ProductSummary;
import com.crm.catalog.product.application.query.ProductSearchQuery;
import com.crm.catalog.product.domain.ProductId;
import com.crm.sharedkernel.application.PageResult;

public interface ProductFacade {

	ProductDetails create(CreateProductCommand command);

	ProductDetails get(ProductId id);

	PageResult<ProductSummary> search(ProductSearchQuery query);

	ProductDetails update(UpdateProductCommand command);

	void delete(ProductId id, long version);

	com.crm.catalog.product.application.dto.ProductStatsDto getStats();

	ProductDetails updateStatus(com.crm.catalog.product.application.command.ChangeProductStatusCommand command);

	int bulkUpdateStatus(com.crm.catalog.product.application.command.BulkChangeProductStatusCommand command);

	int bulkAssignCategory(com.crm.catalog.product.application.command.BulkAssignProductCategoryCommand command);

}
