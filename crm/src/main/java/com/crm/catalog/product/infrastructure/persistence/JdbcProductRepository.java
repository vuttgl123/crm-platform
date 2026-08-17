package com.crm.catalog.product.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.crm.catalog.product.application.dto.ProductSummary;
import com.crm.catalog.product.application.port.ProductRepository;
import com.crm.catalog.product.application.query.ProductSearchQuery;
import com.crm.catalog.product.domain.Product;
import com.crm.catalog.product.domain.ProductId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcProductRepository implements ProductRepository {

	private static final String PRODUCT_SELECT = """
			SELECT p.tenant_id, p.id, p.sku, p.name, p.description, p.category_id,
			       p.product_type, p.unit_of_measure, p.tax_category, p.standard_cost,
			       p.cost_currency_code, p.is_active, p.metadata, p.created_at,
			       p.updated_at, p.created_by, p.updated_by, p.deleted_at,
			       p.deleted_by, p.version
			FROM catalog.products p
			""";

	private static final String SUMMARY_SELECT = """
			SELECT p.id, p.sku, p.name, p.category_id, c.name AS category_name,
			       p.product_type, p.unit_of_measure, p.standard_cost,
			       p.cost_currency_code, p.is_active, p.updated_at, p.version
			FROM catalog.products p
			LEFT JOIN catalog.product_categories c ON c.tenant_id = p.tenant_id AND c.id = p.category_id
			""";

	private final JdbcClient jdbcClient;

	public JdbcProductRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Product> findById(TenantId tenantId, ProductId id) {
		String sql = PRODUCT_SELECT + """
				WHERE p.tenant_id = :tenantId
				  AND p.id = :id
				  AND p.deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(ProductJdbcMapper::mapProduct)
				.optional();
	}

	@Override
	public Optional<Product> findBySku(TenantId tenantId, String sku) {
		String sql = PRODUCT_SELECT + """
				WHERE p.tenant_id = :tenantId
				  AND p.sku = :sku
				  AND p.deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("sku", sku)
				.query(ProductJdbcMapper::mapProduct)
				.optional();
	}

	@Override
	public boolean existsBySku(TenantId tenantId, String sku) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM catalog.products p
				WHERE p.tenant_id = :tenantId
				  AND p.sku = :sku
				  AND p.deleted_at IS NULL
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("sku", sku)
				.query(Boolean.class)
				.single());
	}

	@Override
	public PageResult<ProductSummary> search(TenantId tenantId, ProductSearchQuery query) {
		PageQuery page = query.page() != null ? query.page() : PageQuery.defaultPage();
		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId.value());

		StringBuilder whereClause = new StringBuilder(" WHERE p.tenant_id = :tenantId AND p.deleted_at IS NULL ");

		if (query.search() != null && !query.search().isBlank()) {
			params.put("search", "%" + query.search().trim().toLowerCase() + "%");
			whereClause.append(" AND (LOWER(p.name) LIKE :search OR LOWER(p.sku) LIKE :search OR LOWER(COALESCE(p.description, '')) LIKE :search) ");
		}
		if (query.categoryId() != null) {
			params.put("categoryId", query.categoryId());
			whereClause.append(" AND p.category_id = :categoryId ");
		}
		if (query.productType() != null) {
			params.put("productType", query.productType().name());
			whereClause.append(" AND p.product_type = :productType ");
		}
		if (query.isActive() != null) {
			params.put("isActive", query.isActive());
			whereClause.append(" AND p.is_active = :isActive ");
		}

		String countSql = "SELECT COUNT(*) FROM catalog.products p " + whereClause;
		Long totalElements = jdbcClient.sql(countSql)
				.params(params)
				.query(Long.class)
				.single();
		long total = totalElements != null ? totalElements : 0L;

		params.put("limit", page.size());
		params.put("offset", page.offset());

		String dataSql = SUMMARY_SELECT + whereClause + " ORDER BY p.name ASC LIMIT :limit OFFSET :offset";
		List<ProductSummary> content = jdbcClient.sql(dataSql)
				.params(params)
				.query(ProductJdbcMapper::mapSummary)
				.list();

		return PageResult.of(content, total, page);
	}

	@Override
	public void insert(Product product) {
		String sql = """
				INSERT INTO catalog.products (
				    tenant_id, id, sku, name, description, category_id,
				    product_type, unit_of_measure, tax_category, standard_cost,
				    cost_currency_code, is_active, metadata, created_at,
				    updated_at, created_by, updated_by, deleted_at, deleted_by, version
				) VALUES (
				    :tenantId, :id, :sku, :name, :description, :categoryId,
				    :productType, :unitOfMeasure, :taxCategory, :standardCost,
				    :costCurrencyCode, :isActive, :metadata::jsonb, :createdAt,
				    :updatedAt, :createdBy, :updatedBy, :deletedAt, :deletedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", product.tenantId().value())
				.param("id", product.id().value())
				.param("sku", product.sku())
				.param("name", product.name())
				.param("description", product.description())
				.param("categoryId", product.categoryId() != null ? product.categoryId().value() : null)
				.param("productType", product.productType().name())
				.param("unitOfMeasure", product.unitOfMeasure())
				.param("taxCategory", product.taxCategory())
				.param("standardCost", product.standardCost())
				.param("costCurrencyCode", product.costCurrencyCode())
				.param("isActive", product.isActive())
				.param("metadata", product.metadata())
				.param("createdAt", Timestamp.from(product.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(product.auditInfo().updatedAt()))
				.param("createdBy", product.auditInfo().createdBy() != null ? product.auditInfo().createdBy().value() : null)
				.param("updatedBy", product.auditInfo().updatedBy() != null ? product.auditInfo().updatedBy().value() : null)
				.param("deletedAt", product.deletedAt() != null ? Timestamp.from(product.deletedAt()) : null)
				.param("deletedBy", product.deletedBy() != null ? product.deletedBy().value() : null)
				.param("version", product.version())
				.update();
	}

	@Override
	public void update(Product product) {
		String sql = """
				UPDATE catalog.products
				SET name = :name,
				    description = :description,
				    category_id = :categoryId,
				    product_type = :productType,
				    unit_of_measure = :unitOfMeasure,
				    tax_category = :taxCategory,
				    standard_cost = :standardCost,
				    cost_currency_code = :costCurrencyCode,
				    is_active = :isActive,
				    metadata = :metadata::jsonb,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    deleted_at = :deletedAt,
				    deleted_by = :deletedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", product.tenantId().value())
				.param("id", product.id().value())
				.param("name", product.name())
				.param("description", product.description())
				.param("categoryId", product.categoryId() != null ? product.categoryId().value() : null)
				.param("productType", product.productType().name())
				.param("unitOfMeasure", product.unitOfMeasure())
				.param("taxCategory", product.taxCategory())
				.param("standardCost", product.standardCost())
				.param("costCurrencyCode", product.costCurrencyCode())
				.param("isActive", product.isActive())
				.param("metadata", product.metadata())
				.param("updatedAt", Timestamp.from(product.auditInfo().updatedAt()))
				.param("updatedBy", product.auditInfo().updatedBy() != null ? product.auditInfo().updatedBy().value() : null)
				.param("deletedAt", product.deletedAt() != null ? Timestamp.from(product.deletedAt()) : null)
				.param("deletedBy", product.deletedBy() != null ? product.deletedBy().value() : null)
				.param("newVersion", product.version())
				.param("expectedVersion", product.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Product update failed due to version mismatch");
		}
	}

}
