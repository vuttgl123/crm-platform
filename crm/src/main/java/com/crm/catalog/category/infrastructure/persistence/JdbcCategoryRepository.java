package com.crm.catalog.category.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.catalog.category.application.dto.CategorySummary;
import com.crm.catalog.category.application.port.CategoryRepository;
import com.crm.catalog.category.domain.CategoryId;
import com.crm.catalog.category.domain.ProductCategory;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcCategoryRepository implements CategoryRepository {

	private static final String CATEGORY_SELECT = """
			SELECT c.tenant_id, c.id, c.category_code, c.name, c.parent_category_id,
			       c.description, c.is_active, c.created_at, c.updated_at,
			       c.created_by, c.updated_by, c.version
			FROM catalog.product_categories c
			""";

	private final JdbcClient jdbcClient;

	public JdbcCategoryRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<ProductCategory> findById(TenantId tenantId, CategoryId id) {
		String sql = CATEGORY_SELECT + """
				WHERE c.tenant_id = :tenantId
				  AND c.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(CategoryJdbcMapper::mapCategory)
				.optional();
	}

	@Override
	public Optional<ProductCategory> findByCode(TenantId tenantId, String code) {
		String sql = CATEGORY_SELECT + """
				WHERE c.tenant_id = :tenantId
				  AND c.category_code = :code
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("code", code)
				.query(CategoryJdbcMapper::mapCategory)
				.optional();
	}

	@Override
	public boolean existsByCode(TenantId tenantId, String code) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM catalog.product_categories c
				WHERE c.tenant_id = :tenantId
				  AND c.category_code = :code
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("code", code)
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<CategorySummary> findAll(TenantId tenantId) {
		String sql = """
				SELECT c.id, c.category_code, c.name, c.parent_category_id,
				       c.description, c.is_active, c.updated_at, c.version,
				       (SELECT COUNT(*) FROM catalog.products p WHERE p.tenant_id = c.tenant_id AND p.category_id = c.id AND p.deleted_at IS NULL) AS products_count
				FROM catalog.product_categories c
				WHERE c.tenant_id = :tenantId
				ORDER BY c.name ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(CategoryJdbcMapper::mapSummary)
				.list();
	}

	@Override
	public void insert(ProductCategory category) {
		String sql = """
				INSERT INTO catalog.product_categories (
				    tenant_id, id, category_code, name, parent_category_id,
				    description, is_active, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :categoryCode, :name, :parentCategoryId,
				    :description, :isActive, :createdAt, :updatedAt,
				    :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", category.tenantId().value())
				.param("id", category.id().value())
				.param("categoryCode", category.categoryCode())
				.param("name", category.name())
				.param("parentCategoryId", category.parentCategoryId() != null ? category.parentCategoryId().value() : null)
				.param("description", category.description())
				.param("isActive", category.isActive())
				.param("createdAt", Timestamp.from(category.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(category.auditInfo().updatedAt()))
				.param("createdBy", category.auditInfo().createdBy() != null ? category.auditInfo().createdBy().value() : null)
				.param("updatedBy", category.auditInfo().updatedBy() != null ? category.auditInfo().updatedBy().value() : null)
				.param("version", category.version())
				.update();
	}

	@Override
	public void update(ProductCategory category) {
		String sql = """
				UPDATE catalog.product_categories
				SET name = :name,
				    parent_category_id = :parentCategoryId,
				    description = :description,
				    is_active = :isActive,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", category.tenantId().value())
				.param("id", category.id().value())
				.param("name", category.name())
				.param("parentCategoryId", category.parentCategoryId() != null ? category.parentCategoryId().value() : null)
				.param("description", category.description())
				.param("isActive", category.isActive())
				.param("updatedAt", Timestamp.from(category.auditInfo().updatedAt()))
				.param("updatedBy", category.auditInfo().updatedBy() != null ? category.auditInfo().updatedBy().value() : null)
				.param("newVersion", category.version())
				.param("expectedVersion", category.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Category update failed due to version mismatch");
		}
	}

	@Override
	public void delete(TenantId tenantId, CategoryId id, long version) {
		String sql = """
				DELETE FROM catalog.product_categories
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :version
				""";
		int deleted = jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.param("version", version)
				.update();
		if (deleted == 0) {
			throw new IllegalStateException("Category delete failed due to version mismatch");
		}
	}

}
