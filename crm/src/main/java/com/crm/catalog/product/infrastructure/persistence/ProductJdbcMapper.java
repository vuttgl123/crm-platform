package com.crm.catalog.product.infrastructure.persistence;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.catalog.category.domain.CategoryId;
import com.crm.catalog.product.application.dto.ProductSummary;
import com.crm.catalog.product.domain.Product;
import com.crm.catalog.product.domain.ProductId;
import com.crm.catalog.product.domain.ProductType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class ProductJdbcMapper {

	private ProductJdbcMapper() {
	}

	public static Product mapProduct(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		ProductId id = ProductId.from(rs.getObject("id", UUID.class));
		String sku = rs.getString("sku");
		String name = rs.getString("name");
		String description = rs.getString("description");
		UUID categoryUuid = rs.getObject("category_id", UUID.class);
		CategoryId categoryId = categoryUuid != null ? CategoryId.from(categoryUuid) : null;

		String typeStr = rs.getString("product_type");
		ProductType productType = typeStr != null ? ProductType.valueOf(typeStr) : ProductType.PRODUCT;

		String unitOfMeasure = rs.getString("unit_of_measure");
		String taxCategory = rs.getString("tax_category");
		BigDecimal standardCost = rs.getBigDecimal("standard_cost");
		String costCurrencyCode = rs.getString("cost_currency_code");
		boolean isActive = rs.getBoolean("is_active");
		String metadata = rs.getString("metadata");
		long version = rs.getLong("version");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		Timestamp deletedAtTs = rs.getTimestamp("deleted_at");
		Instant deletedAt = deletedAtTs != null ? deletedAtTs.toInstant() : null;
		UUID deletedByUuid = rs.getObject("deleted_by", UUID.class);
		ActorId deletedBy = deletedByUuid != null ? new ActorId(deletedByUuid) : null;

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new Product(tenantId, id, sku, name, description, categoryId, productType,
				unitOfMeasure, taxCategory, standardCost, costCurrencyCode, isActive,
				metadata, auditInfo, deletedAt, deletedBy, version);
	}

	public static ProductSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String sku = rs.getString("sku");
		String name = rs.getString("name");
		UUID categoryId = rs.getObject("category_id", UUID.class);
		String categoryName = rs.getString("category_name");

		String typeStr = rs.getString("product_type");
		ProductType productType = typeStr != null ? ProductType.valueOf(typeStr) : ProductType.PRODUCT;

		String unitOfMeasure = rs.getString("unit_of_measure");
		BigDecimal standardCost = rs.getBigDecimal("standard_cost");
		String costCurrencyCode = rs.getString("cost_currency_code");
		boolean isActive = rs.getBoolean("is_active");

		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new ProductSummary(id, sku, name, categoryId, categoryName, productType,
				unitOfMeasure, standardCost, costCurrencyCode, isActive, updatedAt, version);
	}

}
