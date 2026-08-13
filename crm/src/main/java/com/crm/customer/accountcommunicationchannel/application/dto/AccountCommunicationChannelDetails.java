package com.crm.customer.accountcommunicationchannel.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannel;
import com.crm.customer.accountcommunicationchannel.domain.ChannelType;

public record AccountCommunicationChannelDetails(
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

	public static AccountCommunicationChannelDetails from(
			AccountCommunicationChannel channel) {
		return new AccountCommunicationChannelDetails(
				channel.id().value(), channel.accountId().value(),
				channel.channelType(), channel.rawValue(),
				channel.normalizedValue(), channel.label(),
				channel.isPrimary(), channel.isVerified(),
				channel.verifiedAt(), channel.doNotUse(), channel.version(),
				channel.createdAt(), channel.updatedAt());
	}

}
