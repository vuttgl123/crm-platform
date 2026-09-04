package com.crm.customer.lead.application.port;

import java.util.Optional;
import java.util.UUID;

import com.crm.customer.lead.application.dto.LeadSummary;
import com.crm.customer.lead.application.query.LeadSearchQuery;
import com.crm.customer.lead.domain.Lead;
import com.crm.customer.lead.domain.LeadId;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface LeadRepository {

	Optional<Lead> findById(TenantId tenantId, LeadId leadId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<LeadSummary> search(TenantId tenantId,
			ActorId actorId, LeadSearchQuery query,
			AuthorizedDataAccess access);

	boolean existsByLeadNumber(TenantId tenantId, String leadNumber,
			LeadId excludeId);

	boolean existsStatus(TenantId tenantId, UUID statusId);

	boolean existsSource(TenantId tenantId, UUID sourceId);

	boolean existsAccount(TenantId tenantId, UUID accountId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsContact(TenantId tenantId, UUID contactId,
			ActorId actorId, AuthorizedDataAccess access);

	void save(Lead lead);

	com.crm.customer.lead.application.dto.LeadStatsDto getStats(TenantId tenantId,
			ActorId actorId, AuthorizedDataAccess access);

	int bulkUpdateStatus(TenantId tenantId, java.util.List<LeadId> leadIds, UUID statusId,
			ActorId actorId, java.time.Instant now);

	int bulkAssign(TenantId tenantId, java.util.List<LeadId> leadIds, String ownerType, UUID ownerId,
			ActorId actorId, java.time.Instant now);

	java.util.List<com.crm.customer.lead.application.dto.LeadDuplicateMatchDto> findPotentialDuplicates(
			TenantId tenantId, String email, String phone, String companyName);

}
