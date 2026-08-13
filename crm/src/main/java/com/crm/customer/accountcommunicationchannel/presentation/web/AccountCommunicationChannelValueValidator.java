package com.crm.customer.accountcommunicationchannel.presentation.web;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import com.crm.customer.accountcommunicationchannel.domain.ChannelType;
import com.crm.customer.accountcommunicationchannel.domain.ChannelValue;

public final class AccountCommunicationChannelValueValidator
		implements ConstraintValidator<ValidAccountCommunicationChannelValue,
				AccountCommunicationChannelValueInput> {

	private static final int MAX_RAW_VALUE_LENGTH = 255;
	private static final String RAW_VALUE_PROPERTY = "rawValue";
	private static final String INVALID_MESSAGE = "{validation.invalid}";

	@Override
	public boolean isValid(AccountCommunicationChannelValueInput input,
			ConstraintValidatorContext context) {
		if (input == null) {
			return true;
		}
		ChannelType channelType = input.channelType();
		String rawValue = input.rawValue();
		if (channelType == null || rawValue == null || rawValue.isBlank()
				|| rawValue.trim().length() > MAX_RAW_VALUE_LENGTH) {
			return true;
		}
		if (ChannelValue.isValidWhenPresent(channelType, rawValue)) {
			return true;
		}
		context.disableDefaultConstraintViolation();
		context.buildConstraintViolationWithTemplate(INVALID_MESSAGE)
				.addPropertyNode(RAW_VALUE_PROPERTY)
				.addConstraintViolation();
		return false;
	}

}

interface AccountCommunicationChannelValueInput {

	ChannelType channelType();

	String rawValue();

}
