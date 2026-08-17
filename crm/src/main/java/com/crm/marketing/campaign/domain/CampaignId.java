package com.crm.marketing.campaign.domain;

import java.util.Objects;
import java.util.UUID;

public record CampaignId(UUID value) {

	public CampaignId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static CampaignId from(UUID value) {
		return new CampaignId(value);
	}

	public static CampaignId from(String value) {
		return new CampaignId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
