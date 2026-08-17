package com.crm.marketing.campaign.presentation.web;

import java.util.UUID;

import com.crm.marketing.campaign.application.command.AddCampaignMemberCommand;
import com.crm.marketing.campaign.application.command.CreateCampaignCommand;
import com.crm.marketing.campaign.application.command.UpdateCampaignCommand;
import com.crm.marketing.campaign.application.command.UpdateCampaignMemberStatusCommand;
import com.crm.marketing.campaign.application.dto.CampaignDetails;
import com.crm.marketing.campaign.application.dto.CampaignMemberDetails;
import com.crm.marketing.campaign.application.dto.CampaignSummary;
import com.crm.marketing.campaign.application.query.CampaignSearchQuery;
import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignMemberId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CampaignWebMapper {

	CreateCampaignCommand toCreateCommand(CreateCampaignRequest request);

	default UpdateCampaignCommand toUpdateCommand(CampaignId id, UpdateCampaignRequest request) {
		return new UpdateCampaignCommand(
				id,
				request.version(),
				request.name(),
				request.campaignType(),
				request.status(),
				request.ownerUserId(),
				request.startAt(),
				request.endAt(),
				request.budget(),
				request.actualCost(),
				request.expectedRevenue(),
				request.currencyCode(),
				request.description(),
				request.utmSource(),
				request.utmMedium(),
				request.utmCampaign()
		);
	}

	default AddCampaignMemberCommand toAddMemberCommand(CampaignId campaignId, AddCampaignMemberRequest request) {
		return new AddCampaignMemberCommand(
				campaignId,
				request.leadId(),
				request.contactId(),
				request.memberStatus(),
				request.sourceDetail(),
				request.metadata()
		);
	}

	default UpdateCampaignMemberStatusCommand toUpdateMemberStatusCommand(
			CampaignId campaignId,
			CampaignMemberId memberId,
			UpdateCampaignMemberStatusRequest request) {
		return new UpdateCampaignMemberStatusCommand(
				campaignId,
				memberId,
				request.version(),
				request.memberStatus(),
				request.sourceDetail(),
				request.metadata()
		);
	}

	default CampaignSearchQuery toSearchQuery(CampaignSearchRequest request) {
		if (request == null) {
			return new CampaignSearchQuery(null, null, null, null, null, null, PageQuery.defaultPage());
		}
		int page = request.page() != null ? request.page() : 0;
		int size = request.size() != null ? request.size() : 20;
		return new CampaignSearchQuery(
				request.q(),
				request.campaignType(),
				request.status(),
				request.ownerUserId(),
				request.startDateFrom(),
				request.startDateTo(),
				PageQuery.of(page, size)
		);
	}

	CampaignResponse toResponse(CampaignDetails details);

	CampaignSummaryResponse toSummaryResponse(CampaignSummary summary);

	CampaignMemberResponse toMemberResponse(CampaignMemberDetails details);

	default PageResult<CampaignSummaryResponse> toSummaryPage(PageResult<CampaignSummary> page) {
		return page.map(this::toSummaryResponse);
	}

	default PageResult<CampaignMemberResponse> toMemberPage(PageResult<CampaignMemberDetails> page) {
		return page.map(this::toMemberResponse);
	}

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(CampaignId value) {
		return value == null ? null : value.value();
	}

	default CampaignId mapToCampaignId(UUID value) {
		return value == null ? null : new CampaignId(value);
	}

	default UUID map(CampaignMemberId value) {
		return value == null ? null : value.value();
	}

	default CampaignMemberId mapToCampaignMemberId(UUID value) {
		return value == null ? null : new CampaignMemberId(value);
	}

}
