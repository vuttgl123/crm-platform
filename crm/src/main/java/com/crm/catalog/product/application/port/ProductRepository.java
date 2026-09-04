package com.crm.catalog.product.application.port;

import java.util.Optional;

import com.crm.catalog.product.application.dto.ProductSummary;
import com.crm.catalog.product.application.query.ProductSearchQuery;
import com.crm.catalog.product.domain.ProductId;
import com.crm.catalog.product.domain.Product;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface ProductRepository {

	Optional<Product> findById(TenantId tenantId, ProductId id);

	Optional<Product> findBySku(TenantId tenantId, String sku);

	boolean existsBySku(TenantId tenantId, String sku);

	PageResult<ProductSummary> search(TenantId tenantId, ProductSearchQuery query);

	void insert(Product product);

	void update(Product product);

	com.crm.catalog.product.application.dto.ProductStatsDto getStats(TenantId tenantId);

	void updateStatus(TenantId tenantId, ProductId id, boolean active,
			com.crm.sharedkernel.domain.ActorId actorId, java.time.Instant now);

	int bulkUpdateStatus(TenantId tenantId, java.util.List<ProductId> ids, boolean active,
			com.crm.sharedkernel.domain.ActorId actorId, java.time.Instant now);

	int bulkAssignCategory(TenantId tenantId, java.util.List<ProductId> ids, java.util.UUID categoryId,
			com.crm.sharedkernel.domain.ActorId actorId, java.time.Instant now);

}
