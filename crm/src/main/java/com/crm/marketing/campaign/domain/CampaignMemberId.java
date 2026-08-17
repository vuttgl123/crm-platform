package com.crm.marketing.campaign.domain;

import java.util.Objects;
import java.util.UUID;

public record CampaignMemberId(UUID value) {

	public CampaignMemberId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static CampaignMemberId from(UUID value) {
		return new CampaignMemberId(value);
	}

	public static CampaignMemberId from(String value) {
		return new CampaignMemberId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
