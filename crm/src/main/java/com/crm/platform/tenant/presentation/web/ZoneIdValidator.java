package com.crm.platform.tenant.presentation.web;

import java.time.DateTimeException;
import java.time.ZoneId;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public final class ZoneIdValidator
		implements ConstraintValidator<ValidZoneId, String> {

	@Override
	public boolean isValid(String value,
			ConstraintValidatorContext context) {
		if (value == null) {
			return true;
		}
		try {
			ZoneId.of(value);
			return true;
		}
		catch (DateTimeException exception) {
			return false;
		}
	}

}
