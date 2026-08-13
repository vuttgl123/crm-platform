package com.crm.foundation.web.validation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target({ ElementType.PARAMETER, ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IfMatchVersionValidator.class)
public @interface ValidIfMatchVersion {

	String message() default "{validation.invalid}";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

}
