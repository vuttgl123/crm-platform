package com.crm.marketing.campaign.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.lead.domain.LeadId;
import com.crm.marketing.campaign.application.dto.CampaignMemberDetails;
import com.crm.marketing.campaign.application.dto.CampaignPerformanceMetrics;
import com.crm.marketing.campaign.application.dto.CampaignSummary;
import com.crm.marketing.campaign.application.query.CampaignSearchQuery;
import com.crm.marketing.campaign.domain.Campaign;
import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignMember;
import com.crm.marketing.campaign.domain.CampaignMemberId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface CampaignRepository {

	Optional<Campaign> findById(TenantId tenantId, CampaignId id);

	Optional<Campaign> findByCode(TenantId tenantId, String code);

	boolean existsByCode(TenantId tenantId, String code);

	PageResult<CampaignSummary> search(TenantId tenantId, CampaignSearchQuery query);

	CampaignPerformanceMetrics calculateMetrics(TenantId tenantId, CampaignId id);

	PageResult<CampaignMemberDetails> findMembers(TenantId tenantId, CampaignId campaignId, PageQuery page);

	Optional<CampaignMember> findMemberById(TenantId tenantId, CampaignMemberId memberId);

	boolean existsMemberByLead(TenantId tenantId, CampaignId campaignId, LeadId leadId);

	boolean existsMemberByContact(TenantId tenantId, CampaignId campaignId, ContactId contactId);

	void insert(Campaign campaign);

	void update(Campaign campaign);

	void insertMember(CampaignMember member);

	void updateMember(CampaignMember member);

	void deleteMember(TenantId tenantId, CampaignMemberId memberId);

}
