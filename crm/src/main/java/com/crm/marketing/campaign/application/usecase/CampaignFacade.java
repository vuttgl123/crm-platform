package com.crm.marketing.campaign.application.usecase;

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

public interface CampaignFacade {

	CampaignDetails create(CreateCampaignCommand command);

	CampaignDetails get(CampaignId id);

	PageResult<CampaignSummary> search(CampaignSearchQuery query);

	CampaignDetails update(UpdateCampaignCommand command);

	void delete(CampaignId id, long version);

	CampaignMemberDetails addMember(AddCampaignMemberCommand command);

	PageResult<CampaignMemberDetails> listMembers(CampaignId campaignId, PageQuery page);

	CampaignMemberDetails updateMemberStatus(UpdateCampaignMemberStatusCommand command);

	void removeMember(CampaignId campaignId, CampaignMemberId memberId);

}
