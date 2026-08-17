package com.crm.marketing.campaign.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.crm.marketing.campaign.domain.CampaignType;

public record CreateCampaignRequest(
		@NotBlank(message = "Campaign code must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_-]{2,100}$", message = "Campaign code must be 2-100 alphanumeric characters, dashes or underscores")
		String campaignCode,

		@NotBlank(message = "Campaign name must not be blank")
		@Size(max = 255, message = "Campaign name must not exceed 255 characters")
		String name,

		CampaignType campaignType,

		UUID ownerUserId,

		Instant startAt,

		Instant endAt,

		@PositiveOrZero(message = "Budget must be positive or zero")
		BigDecimal budget,

		@Size(max = 3, message = "Currency code must not exceed 3 characters")
		String currencyCode,

		@PositiveOrZero(message = "Expected revenue must be positive or zero")
		BigDecimal expectedRevenue,

		@Size(max = 5000, message = "Description must not exceed 5000 characters")
		String description,

		@Size(max = 255, message = "UTM source must not exceed 255 characters")
		String utmSource,

		@Size(max = 255, message = "UTM medium must not exceed 255 characters")
		String utmMedium,

		@Size(max = 255, message = "UTM campaign must not exceed 255 characters")
		String utmCampaign
) {
}
