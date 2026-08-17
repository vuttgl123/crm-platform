package com.crm.catalog.category.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.catalog.category.application.dto.CategorySummary;
import com.crm.catalog.category.domain.CategoryId;
import com.crm.catalog.category.domain.ProductCategory;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class CategoryJdbcMapper {

	private CategoryJdbcMapper() {
	}

	public static ProductCategory mapCategory(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		CategoryId id = CategoryId.from(rs.getObject("id", UUID.class));
		String categoryCode = rs.getString("category_code");
		String name = rs.getString("name");
		UUID parentUuid = rs.getObject("parent_category_id", UUID.class);
		CategoryId parentCategoryId = parentUuid != null ? CategoryId.from(parentUuid) : null;
		String description = rs.getString("description");
		boolean isActive = rs.getBoolean("is_active");
		long version = rs.getLong("version");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new ProductCategory(tenantId, id, categoryCode, name, parentCategoryId,
				description, isActive, auditInfo, version);
	}

	public static CategorySummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String categoryCode = rs.getString("category_code");
		String name = rs.getString("name");
		UUID parentId = rs.getObject("parent_category_id", UUID.class);
		String description = rs.getString("description");
		boolean isActive = rs.getBoolean("is_active");
		int productsCount = rs.getInt("products_count");
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new CategorySummary(id, categoryCode, name, parentId, description,
				isActive, productsCount, updatedAt, version);
	}

}
