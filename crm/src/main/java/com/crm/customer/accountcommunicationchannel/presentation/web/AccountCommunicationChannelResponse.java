package com.crm.customer.accountcommunicationchannel.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.accountcommunicationchannel.domain.ChannelType;

public record AccountCommunicationChannelResponse(
		UUID id,
		UUID accountId,
		ChannelType channelType,
		String rawValue,
		String normalizedValue,
		String label,
		boolean isPrimary,
		boolean isVerified,
		Instant verifiedAt,
		boolean doNotUse,
		long version,
		Instant createdAt,
		Instant updatedAt) {
}
