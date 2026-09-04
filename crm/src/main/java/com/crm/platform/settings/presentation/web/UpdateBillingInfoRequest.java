package com.crm.platform.settings.presentation.web;

import jakarta.validation.constraints.Size;

public record UpdateBillingInfoRequest(
		@Size(max = 255) String bankName,
		@Size(max = 100) String bankAccountNumber,
		@Size(max = 255) String bankAccountHolder,
		@Size(max = 50) String swiftCode,
		@Size(max = 500) String invoiceHeaderNote,
		@Size(max = 500) String invoiceFooterNote
) {}
