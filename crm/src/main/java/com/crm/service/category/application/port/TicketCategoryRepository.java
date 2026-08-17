package com.crm.service.category.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.service.category.application.dto.TicketCategorySummary;
import com.crm.service.category.domain.TicketCategory;
import com.crm.service.category.domain.TicketCategoryId;
import com.crm.sharedkernel.domain.TenantId;

public interface TicketCategoryRepository {

	Optional<TicketCategory> findById(TenantId tenantId, TicketCategoryId id);

	Optional<TicketCategory> findByCode(TenantId tenantId, String code);

	boolean existsByCode(TenantId tenantId, String code);

	List<TicketCategorySummary> findAll(TenantId tenantId);

	void insert(TicketCategory category);

	void update(TicketCategory category);

	void delete(TenantId tenantId, TicketCategoryId id, long version);

}
