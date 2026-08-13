package com.crm.customer.accountcommunicationchannel.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.crm.customer.accountcommunicationchannel.domain.ChannelType;

@ValidAccountCommunicationChannelValue
public record UpdateAccountCommunicationChannelRequest(
		@NotNull ChannelType channelType,
		@NotBlank @Size(max = 255) String rawValue,
		@Size(max = 255) String label,
		boolean isPrimary,
		boolean doNotUse) implements AccountCommunicationChannelValueInput {

	public UpdateAccountCommunicationChannelRequest {
		rawValue = rawValue == null ? null : rawValue.trim();
		label = normalizeOptional(label);
	}

	private static String normalizeOptional(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}

}
