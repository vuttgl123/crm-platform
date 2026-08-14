package com.crm.customer.accountaddress.presentation.web;

import java.math.BigDecimal;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import com.crm.customer.accountaddress.domain.AddressContent;

public final class AccountAddressValidator
		implements ConstraintValidator<ValidAccountAddress,
				AccountAddressInput> {

	@Override
	public boolean isValid(AccountAddressInput input,
			ConstraintValidatorContext context) {
		if (input == null) {
			return true;
		}
		boolean valid = true;
		if (!AddressContent.hasMeaningfulComponent(
				input.addressLine1(), input.locality(),
				input.administrativeArea(), input.postalCode(),
				input.formattedAddress())) {
			addViolation(context, "addressLine1");
			valid = false;
		}
		if (input.countryCode() != null && !input.countryCode().isBlank()
				&& !AddressContent.isCountryCodeValid(input.countryCode())) {
			addViolation(context, "countryCode");
			valid = false;
		}
		if (!AddressContent.isCoordinatePairPresent(
				input.latitude(), input.longitude())) {
			addViolation(context, "latitude");
			valid = false;
		}
		return valid;
	}

	private static void addViolation(ConstraintValidatorContext context,
			String property) {
		context.disableDefaultConstraintViolation();
		context.buildConstraintViolationWithTemplate("{validation.invalid}")
				.addPropertyNode(property)
				.addConstraintViolation();
	}

}

interface AccountAddressInput {

	String addressLine1();

	String locality();

	String administrativeArea();

	String postalCode();

	String countryCode();

	BigDecimal latitude();

	BigDecimal longitude();

	String formattedAddress();

}
