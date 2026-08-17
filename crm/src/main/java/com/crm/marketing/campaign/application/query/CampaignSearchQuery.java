package com.crm.marketing.campaign.application.query;

import java.time.Instant;
import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignStatus;
import com.crm.marketing.campaign.domain.CampaignType;
import com.crm.sharedkernel.application.PageQuery;

public record CampaignSearchQuery(
		String search,
		CampaignType campaignType,
		CampaignStatus status,
		UUID ownerUserId,
		Instant startDateFrom,
		Instant startDateTo,
		PageQuery page
) {

	public CampaignSearchQuery {
		if (page == null) {
			page = PageQuery.defaultPage();
		}
	}

}
