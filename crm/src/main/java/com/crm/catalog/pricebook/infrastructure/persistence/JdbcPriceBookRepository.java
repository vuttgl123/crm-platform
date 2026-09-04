package com.crm.catalog.pricebook.infrastructure.persistence;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.catalog.pricebook.application.dto.PriceBookItemDetails;
import com.crm.catalog.pricebook.application.dto.PriceBookSummary;
import com.crm.catalog.pricebook.application.port.PriceBookRepository;
import com.crm.catalog.pricebook.domain.PriceBook;
import com.crm.catalog.pricebook.domain.PriceBookId;
import com.crm.catalog.pricebook.domain.PriceBookItem;
import com.crm.catalog.pricebook.domain.PriceBookItemId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcPriceBookRepository implements PriceBookRepository {

	private static final String PRICE_BOOK_SELECT = """
			SELECT pb.tenant_id, pb.id, pb.price_book_code, pb.name, pb.currency_code,
			       pb.valid_from, pb.valid_to, pb.is_default, pb.is_active,
			       pb.created_at, pb.updated_at, pb.created_by, pb.updated_by, pb.version
			FROM catalog.price_books pb
			""";

	private final JdbcClient jdbcClient;

	public JdbcPriceBookRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<PriceBook> findById(TenantId tenantId, PriceBookId id) {
		String sql = PRICE_BOOK_SELECT + """
				WHERE pb.tenant_id = :tenantId
				  AND pb.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(PriceBookJdbcMapper::mapPriceBook)
				.optional();
	}

	@Override
	public Optional<PriceBook> findByCode(TenantId tenantId, String code) {
		String sql = PRICE_BOOK_SELECT + """
				WHERE pb.tenant_id = :tenantId
				  AND pb.price_book_code = :code
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("code", code)
				.query(PriceBookJdbcMapper::mapPriceBook)
				.optional();
	}

	@Override
	public boolean existsByCode(TenantId tenantId, String code) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM catalog.price_books pb
				WHERE pb.tenant_id = :tenantId
				  AND pb.price_book_code = :code
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("code", code)
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<PriceBookSummary> findAll(TenantId tenantId) {
		String sql = """
				SELECT pb.id, pb.price_book_code, pb.name, pb.currency_code,
				       pb.valid_from, pb.valid_to, pb.is_default, pb.is_active,
				       pb.updated_at, pb.version,
				       (SELECT COUNT(*) FROM catalog.price_book_items pbi WHERE pbi.tenant_id = pb.tenant_id AND pbi.price_book_id = pb.id) AS items_count
				FROM catalog.price_books pb
				WHERE pb.tenant_id = :tenantId
				ORDER BY pb.is_default DESC, pb.name ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(PriceBookJdbcMapper::mapSummary)
				.list();
	}

	@Override
	public List<PriceBookItemDetails> findItemsByPriceBookId(TenantId tenantId, PriceBookId priceBookId) {
		String sql = """
				SELECT pbi.id, pbi.price_book_id, pbi.product_id, p.sku AS product_sku,
				       p.name AS product_name, pbi.unit_price, pbi.minimum_quantity,
				       pbi.valid_from, pbi.valid_to, pbi.created_by, pbi.created_at,
				       pbi.updated_by, pbi.updated_at, pbi.version
				FROM catalog.price_book_items pbi
				JOIN catalog.products p ON p.tenant_id = pbi.tenant_id AND p.id = pbi.product_id
				WHERE pbi.tenant_id = :tenantId
				  AND pbi.price_book_id = :priceBookId
				ORDER BY p.name ASC, pbi.minimum_quantity ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("priceBookId", priceBookId.value())
				.query(PriceBookJdbcMapper::mapItemDetails)
				.list();
	}

	@Override
	public Optional<PriceBookItem> findItemById(TenantId tenantId, PriceBookItemId itemId) {
		String sql = """
				SELECT pbi.tenant_id, pbi.id, pbi.price_book_id, pbi.product_id,
				       pbi.unit_price, pbi.minimum_quantity, pbi.valid_from,
				       pbi.valid_to, pbi.created_at, pbi.updated_at, pbi.created_by,
				       pbi.updated_by, pbi.version
				FROM catalog.price_book_items pbi
				WHERE pbi.tenant_id = :tenantId
				  AND pbi.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", itemId.value())
				.query(PriceBookJdbcMapper::mapItem)
				.optional();
	}

	@Override
	public void insert(PriceBook priceBook) {
		String sql = """
				INSERT INTO catalog.price_books (
				    tenant_id, id, price_book_code, name, currency_code,
				    valid_from, valid_to, is_default, is_active, created_at,
				    updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :priceBookCode, :name, :currencyCode,
				    :validFrom, :validTo, :isDefault, :isActive, :createdAt,
				    :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", priceBook.tenantId().value())
				.param("id", priceBook.id().value())
				.param("priceBookCode", priceBook.priceBookCode())
				.param("name", priceBook.name())
				.param("currencyCode", priceBook.currencyCode())
				.param("validFrom", priceBook.validFrom() != null ? Date.valueOf(priceBook.validFrom()) : null)
				.param("validTo", priceBook.validTo() != null ? Date.valueOf(priceBook.validTo()) : null)
				.param("isDefault", priceBook.isDefault())
				.param("isActive", priceBook.isActive())
				.param("createdAt", Timestamp.from(priceBook.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(priceBook.auditInfo().updatedAt()))
				.param("createdBy", priceBook.auditInfo().createdBy() != null ? priceBook.auditInfo().createdBy().value() : null)
				.param("updatedBy", priceBook.auditInfo().updatedBy() != null ? priceBook.auditInfo().updatedBy().value() : null)
				.param("version", priceBook.version())
				.update();
	}

	@Override
	public void update(PriceBook priceBook) {
		String sql = """
				UPDATE catalog.price_books
				SET name = :name,
				    currency_code = :currencyCode,
				    valid_from = :validFrom,
				    valid_to = :validTo,
				    is_default = :isDefault,
				    is_active = :isActive,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", priceBook.tenantId().value())
				.param("id", priceBook.id().value())
				.param("name", priceBook.name())
				.param("currencyCode", priceBook.currencyCode())
				.param("validFrom", priceBook.validFrom() != null ? Date.valueOf(priceBook.validFrom()) : null)
				.param("validTo", priceBook.validTo() != null ? Date.valueOf(priceBook.validTo()) : null)
				.param("isDefault", priceBook.isDefault())
				.param("isActive", priceBook.isActive())
				.param("updatedAt", Timestamp.from(priceBook.auditInfo().updatedAt()))
				.param("updatedBy", priceBook.auditInfo().updatedBy() != null ? priceBook.auditInfo().updatedBy().value() : null)
				.param("newVersion", priceBook.version())
				.param("expectedVersion", priceBook.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("PriceBook update failed due to version mismatch");
		}
	}

	@Override
	public void delete(TenantId tenantId, PriceBookId id, long version) {
		String sql = """
				DELETE FROM catalog.price_books
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
			throw new IllegalStateException("PriceBook delete failed due to version mismatch");
		}
	}

	@Override
	public void insertItem(PriceBookItem item) {
		String sql = """
				INSERT INTO catalog.price_book_items (
				    tenant_id, id, price_book_id, product_id, unit_price,
				    minimum_quantity, valid_from, valid_to, created_at,
				    updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :priceBookId, :productId, :unitPrice,
				    :minimumQuantity, :validFrom, :validTo, :createdAt,
				    :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", item.tenantId().value())
				.param("id", item.id().value())
				.param("priceBookId", item.priceBookId().value())
				.param("productId", item.productId().value())
				.param("unitPrice", item.unitPrice())
				.param("minimumQuantity", item.minimumQuantity())
				.param("validFrom", item.validFrom() != null ? Date.valueOf(item.validFrom()) : null)
				.param("validTo", item.validTo() != null ? Date.valueOf(item.validTo()) : null)
				.param("createdAt", Timestamp.from(item.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(item.auditInfo().updatedAt()))
				.param("createdBy", item.auditInfo().createdBy() != null ? item.auditInfo().createdBy().value() : null)
				.param("updatedBy", item.auditInfo().updatedBy() != null ? item.auditInfo().updatedBy().value() : null)
				.param("version", item.version())
				.update();
	}

	@Override
	public void deleteItem(TenantId tenantId, PriceBookItemId itemId) {
		String sql = """
				DELETE FROM catalog.price_book_items
				WHERE tenant_id = :tenantId
				  AND id = :id
				""";
		int deleted = jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", itemId.value())
				.update();
		if (deleted == 0) {
			throw new IllegalStateException("PriceBookItem delete failed");
		}
	}

	@Override
	public com.crm.catalog.pricebook.application.dto.PriceBookStatsDto getStats(TenantId tenantId) {
		String pbSql = """
				SELECT
				    COUNT(*) AS total,
				    COUNT(CASE WHEN pb.is_active = TRUE THEN 1 END) AS active_count,
				    COUNT(CASE WHEN pb.is_default = TRUE THEN 1 END) AS standard_count,
				    COUNT(CASE WHEN pb.is_default = FALSE THEN 1 END) AS custom_count
				FROM catalog.price_books pb
				WHERE pb.tenant_id = :tenantId
				""";
		var counts = jdbcClient.sql(pbSql)
				.param("tenantId", tenantId.value())
				.query((rs, rowNum) -> new long[] {
						rs.getLong("total"),
						rs.getLong("active_count"),
						rs.getLong("standard_count"),
						rs.getLong("custom_count")
				}).single();

		String itemsSql = "SELECT COUNT(*) FROM catalog.price_book_items WHERE tenant_id = :tenantId";
		long itemsCount = jdbcClient.sql(itemsSql)
				.param("tenantId", tenantId.value())
				.query((rs, rowNum) -> rs.getLong(1))
				.single();

		return new com.crm.catalog.pricebook.application.dto.PriceBookStatsDto(
				counts[0],
				counts[1],
				counts[2],
				counts[3],
				itemsCount
		);
	}

	@Override
	public void updateStatus(TenantId tenantId, PriceBookId id, boolean active,
			com.crm.sharedkernel.domain.ActorId actorId, java.time.Instant now) {
		String sql = """
				UPDATE catalog.price_books
				SET is_active = :active,
				    updated_at = :now,
				    updated_by = :actorId,
				    version = version + 1
				WHERE tenant_id = :tenantId
				  AND id = :id
				""";
		jdbcClient.sql(sql)
				.param("active", active)
				.param("now", Timestamp.from(now))
				.param("actorId", actorId.value())
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.update();
	}

	@Override
	public void insertItemsBatch(TenantId tenantId, List<PriceBookItem> items) {
		if (items == null || items.isEmpty()) return;
		for (PriceBookItem item : items) {
			insertItem(item);
		}
	}

}
