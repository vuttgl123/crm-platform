package com.crm.customer.accountaddress.presentation.web;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = AccountAddressValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidAccountAddress {

	String message() default "{validation.invalid}";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

}
