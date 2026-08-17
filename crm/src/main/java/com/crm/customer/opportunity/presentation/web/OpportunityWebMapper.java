package com.crm.customer.opportunity.presentation.web;

import java.util.UUID;

import com.crm.customer.opportunity.application.command.CreateOpportunityCommand;
import com.crm.customer.opportunity.application.command.UpdateOpportunityCommand;
import com.crm.customer.opportunity.application.dto.OpportunityDetails;
import com.crm.customer.opportunity.application.dto.OpportunitySummary;
import com.crm.customer.opportunity.application.query.OpportunitySearchQuery;
import com.crm.customer.opportunity.domain.OpportunityAmount;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.customer.opportunity.domain.OpportunityOwner;
import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = CrmMapperConfig.class)
public interface OpportunityWebMapper {

	CreateOpportunityCommand toCreateCommand(CreateOpportunityRequest request);

	@Mapping(target = "opportunityId", source = "opportunityId")
	@Mapping(target = "expectedVersion", source = "request.version")
	UpdateOpportunityCommand toUpdateCommand(
			OpportunityId opportunityId, UpdateOpportunityRequest request);

	OpportunityResponse toResponse(OpportunityDetails details);

	OpportunitySummaryResponse toSummaryResponse(OpportunitySummary summary);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(OpportunityId value) {
		return value == null ? null : value.value();
	}

	default OpportunityId toOpportunityId(UUID value) {
		return value == null ? null : new OpportunityId(value);
	}

	default OpportunityOwner toOpportunityOwner(CreateOpportunityRequest.Owner value) {
		return value == null ? null : new OpportunityOwner(value.type(), value.id());
	}

	default OpportunityOwner toOpportunityOwner(UpdateOpportunityRequest.Owner value) {
		return value == null ? null : new OpportunityOwner(value.type(), value.id());
	}

	default OpportunityResponse.Owner toDetailOwner(OpportunityOwner value) {
		return value == null ? null : new OpportunityResponse.Owner(value.type(), value.id());
	}

	default OpportunitySummaryResponse.Owner toSummaryOwner(OpportunityOwner value) {
		return value == null ? null : new OpportunitySummaryResponse.Owner(value.type(), value.id());
	}

	default OpportunityAmount toAmount(CreateOpportunityRequest.Amount value) {
		return value == null ? null : new OpportunityAmount(value.amount(), value.currencyCode());
	}

	default OpportunityAmount toAmount(UpdateOpportunityRequest.Amount value) {
		return value == null ? null : new OpportunityAmount(value.amount(), value.currencyCode());
	}

	default OpportunityResponse.Amount toResponseAmount(OpportunityAmount value) {
		return value == null ? null : new OpportunityResponse.Amount(value.amount(), value.currencyCode());
	}

	default OpportunitySummaryResponse.Amount toSummaryResponseAmount(OpportunityAmount value) {
		return value == null ? null : new OpportunitySummaryResponse.Amount(value.amount(), value.currencyCode());
	}

	default OpportunitySearchQuery toSearchQuery(OpportunitySearchRequest request) {
		OpportunityOwner owner = request.ownerType() == null
				? null
				: new OpportunityOwner(request.ownerType(), request.ownerId());
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new OpportunitySearchQuery(
				request.q(), request.accountId(), request.pipelineId(),
				request.stageId(), request.status(), request.opportunityType(),
				owner, new PageQuery(page, size));
	}

	default PageResult<OpportunitySummaryResponse> toSummaryPage(
			PageResult<OpportunitySummary> page) {
		return new PageResult<>(
				page.items().stream()
						.map(this::toSummaryResponse)
						.toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages());
	}

}
