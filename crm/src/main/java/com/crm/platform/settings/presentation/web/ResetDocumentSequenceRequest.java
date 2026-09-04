package com.crm.platform.settings.presentation.web;

import jakarta.validation.constraints.Min;

public record ResetDocumentSequenceRequest(
		@Min(0) long newCounter
) {}
