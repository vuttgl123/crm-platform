package com.crm.platform.settings.presentation.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDocumentSequenceRequest(
		@NotBlank @Size(max = 20) String prefix,
		@Size(max = 50) String dateFormatPattern,
		@Min(1) @Max(10) int paddingLength
) {}
