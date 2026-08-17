package com.crm.privacy.presentation.web;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.privacy.domain.DsrType;

public record CreateDataSubjectRequestRequest(
		@NotBlank(message = "Request number must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_-]{3,64}$", message = "Request number must be 3-64 alphanumeric characters, dashes, or underscores")
		String requestNumber,

		@NotNull(message = "Request type is required")
		DsrType requestType,

		UUID accountId,
		UUID contactId,
		UUID leadId,

		@Email(message = "Requester email must be a valid email address")
		String requesterEmail,

		Instant dueAt,
		UUID assignedUserId,

		@Size(max = 500, message = "Verification reference must not exceed 500 characters")
		String verificationReference
) {
}
