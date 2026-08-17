package com.crm.catalog.pricebook.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.catalog.pricebook.application.dto.PriceBookItemDetails;
import com.crm.catalog.pricebook.application.dto.PriceBookSummary;
import com.crm.catalog.pricebook.domain.PriceBook;
import com.crm.catalog.pricebook.domain.PriceBookId;
import com.crm.catalog.pricebook.domain.PriceBookItem;
import com.crm.catalog.pricebook.domain.PriceBookItemId;
import com.crm.sharedkernel.domain.TenantId;

public interface PriceBookRepository {

	Optional<PriceBook> findById(TenantId tenantId, PriceBookId id);

	Optional<PriceBook> findByCode(TenantId tenantId, String code);

	boolean existsByCode(TenantId tenantId, String code);

	List<PriceBookSummary> findAll(TenantId tenantId);

	List<PriceBookItemDetails> findItemsByPriceBookId(TenantId tenantId, PriceBookId priceBookId);

	Optional<PriceBookItem> findItemById(TenantId tenantId, PriceBookItemId itemId);

	void insert(PriceBook priceBook);

	void update(PriceBook priceBook);

	void delete(TenantId tenantId, PriceBookId id, long version);

	void insertItem(PriceBookItem item);

	void deleteItem(TenantId tenantId, PriceBookItemId itemId);

}
