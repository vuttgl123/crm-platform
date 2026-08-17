package com.crm.catalog.category.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.catalog.category.application.dto.CategorySummary;
import com.crm.catalog.category.domain.CategoryId;
import com.crm.catalog.category.domain.ProductCategory;
import com.crm.sharedkernel.domain.TenantId;

public interface CategoryRepository {

	Optional<ProductCategory> findById(TenantId tenantId, CategoryId id);

	Optional<ProductCategory> findByCode(TenantId tenantId, String code);

	boolean existsByCode(TenantId tenantId, String code);

	List<CategorySummary> findAll(TenantId tenantId);

	void insert(ProductCategory category);

	void update(ProductCategory category);

	void delete(TenantId tenantId, CategoryId id, long version);

}
