package com.crm.marketing.campaign.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.crm.marketing.campaign.domain.CampaignStatus;
import com.crm.marketing.campaign.domain.CampaignType;

public record UpdateCampaignRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Campaign name must not be blank")
		@Size(max = 255, message = "Campaign name must not exceed 255 characters")
		String name,

		CampaignType campaignType,

		CampaignStatus status,

		UUID ownerUserId,

		Instant startAt,

		Instant endAt,

		@PositiveOrZero(message = "Budget must be positive or zero")
		BigDecimal budget,

		@PositiveOrZero(message = "Actual cost must be positive or zero")
		BigDecimal actualCost,

		@PositiveOrZero(message = "Expected revenue must be positive or zero")
		BigDecimal expectedRevenue,

		@Size(max = 3, message = "Currency code must not exceed 3 characters")
		String currencyCode,

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
