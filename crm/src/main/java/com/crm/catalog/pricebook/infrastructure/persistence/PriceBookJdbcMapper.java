package com.crm.catalog.pricebook.infrastructure.persistence;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.catalog.pricebook.application.dto.PriceBookItemDetails;
import com.crm.catalog.pricebook.application.dto.PriceBookSummary;
import com.crm.catalog.pricebook.domain.PriceBook;
import com.crm.catalog.pricebook.domain.PriceBookId;
import com.crm.catalog.pricebook.domain.PriceBookItem;
import com.crm.catalog.pricebook.domain.PriceBookItemId;
import com.crm.catalog.product.domain.ProductId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class PriceBookJdbcMapper {

	private PriceBookJdbcMapper() {
	}

	public static PriceBook mapPriceBook(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		PriceBookId id = PriceBookId.from(rs.getObject("id", UUID.class));
		String priceBookCode = rs.getString("price_book_code");
		String name = rs.getString("name");
		String currencyCode = rs.getString("currency_code");
		Date validFromDate = rs.getDate("valid_from");
		LocalDate validFrom = validFromDate != null ? validFromDate.toLocalDate() : null;
		Date validToDate = rs.getDate("valid_to");
		LocalDate validTo = validToDate != null ? validToDate.toLocalDate() : null;
		boolean isDefault = rs.getBoolean("is_default");
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

		return new PriceBook(tenantId, id, priceBookCode, name, currencyCode, validFrom,
				validTo, isDefault, isActive, null, auditInfo, version);
	}

	public static PriceBookSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String priceBookCode = rs.getString("price_book_code");
		String name = rs.getString("name");
		String currencyCode = rs.getString("currency_code");
		Date validFromDate = rs.getDate("valid_from");
		LocalDate validFrom = validFromDate != null ? validFromDate.toLocalDate() : null;
		Date validToDate = rs.getDate("valid_to");
		LocalDate validTo = validToDate != null ? validToDate.toLocalDate() : null;
		boolean isDefault = rs.getBoolean("is_default");
		boolean isActive = rs.getBoolean("is_active");
		int itemsCount = rs.getInt("items_count");
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new PriceBookSummary(id, priceBookCode, name, currencyCode, validFrom,
				validTo, isDefault, isActive, itemsCount, updatedAt, version);
	}

	public static PriceBookItemDetails mapItemDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		UUID priceBookId = rs.getObject("price_book_id", UUID.class);
		UUID productId = rs.getObject("product_id", UUID.class);
		String productSku = rs.getString("product_sku");
		String productName = rs.getString("product_name");
		BigDecimal unitPrice = rs.getBigDecimal("unit_price");
		int minimumQuantity = rs.getInt("minimum_quantity");
		Date validFromDate = rs.getDate("valid_from");
		LocalDate validFrom = validFromDate != null ? validFromDate.toLocalDate() : null;
		Date validToDate = rs.getDate("valid_to");
		LocalDate validTo = validToDate != null ? validToDate.toLocalDate() : null;

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();
		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;
		long version = rs.getLong("version");

		return new PriceBookItemDetails(id, priceBookId, productId, productSku, productName,
				unitPrice, minimumQuantity, validFrom, validTo, createdBy, createdAt,
				updatedBy, updatedAt, version);
	}

	public static PriceBookItem mapItem(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		PriceBookItemId id = PriceBookItemId.from(rs.getObject("id", UUID.class));
		PriceBookId priceBookId = PriceBookId.from(rs.getObject("price_book_id", UUID.class));
		ProductId productId = ProductId.from(rs.getObject("product_id", UUID.class));
		BigDecimal unitPrice = rs.getBigDecimal("unit_price");
		int minimumQuantity = rs.getInt("minimum_quantity");
		Date validFromDate = rs.getDate("valid_from");
		LocalDate validFrom = validFromDate != null ? validFromDate.toLocalDate() : null;
		Date validToDate = rs.getDate("valid_to");
		LocalDate validTo = validToDate != null ? validToDate.toLocalDate() : null;

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();
		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;
		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new PriceBookItem(tenantId, id, priceBookId, productId, unitPrice,
				minimumQuantity, validFrom, validTo, auditInfo, version);
	}

}
