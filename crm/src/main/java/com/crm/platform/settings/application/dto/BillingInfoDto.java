package com.crm.platform.settings.application.dto;

public record BillingInfoDto(
		String bankName,
		String bankAccountNumber,
		String bankAccountHolder,
		String swiftCode,
		String invoiceHeaderNote,
		String invoiceFooterNote
) {}
