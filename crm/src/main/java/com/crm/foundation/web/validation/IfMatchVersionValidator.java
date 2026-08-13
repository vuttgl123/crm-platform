package com.crm.foundation.web.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import com.crm.foundation.web.http.IfMatchVersion;

public final class IfMatchVersionValidator
		implements ConstraintValidator<ValidIfMatchVersion, String> {

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		return IfMatchVersion.isValid(value);
	}

}
