package com.crm.customer.opportunity.application.port;

import java.util.Optional;
import java.util.UUID;

import com.crm.customer.opportunity.application.dto.OpportunitySummary;
import com.crm.customer.opportunity.application.query.OpportunitySearchQuery;
import com.crm.customer.opportunity.domain.Opportunity;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface OpportunityRepository {

	Optional<Opportunity> findById(TenantId tenantId, OpportunityId opportunityId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<OpportunitySummary> search(TenantId tenantId,
			ActorId actorId, OpportunitySearchQuery query,
			AuthorizedDataAccess access);

	boolean existsByOpportunityNumber(TenantId tenantId, String opportunityNumber,
			OpportunityId excludeId);

	boolean existsAccount(TenantId tenantId, UUID accountId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsPipeline(TenantId tenantId, UUID pipelineId);

	boolean existsStage(TenantId tenantId, UUID pipelineId, UUID stageId);

	boolean existsContact(TenantId tenantId, UUID contactId,
			ActorId actorId, AuthorizedDataAccess access);

	void save(Opportunity opportunity);

	com.crm.customer.opportunity.application.dto.OpportunityStatsDto getStats(
			TenantId tenantId, ActorId actorId, AuthorizedDataAccess access);

	void transitionStage(TenantId tenantId, OpportunityId id, UUID stageId,
			Integer probability, long expectedVersion, ActorId actorId, java.time.Instant now);

	void closeWon(TenantId tenantId, OpportunityId id, java.math.BigDecimal actualAmount,
			java.time.Instant closedDate, long expectedVersion, ActorId actorId, java.time.Instant now);

	void closeLost(TenantId tenantId, OpportunityId id, UUID lostReasonId,
			String competitorNotes, long expectedVersion, ActorId actorId, java.time.Instant now);

	void reassign(TenantId tenantId, OpportunityId id, String ownerType, UUID ownerId,
			long expectedVersion, ActorId actorId, java.time.Instant now);

}
