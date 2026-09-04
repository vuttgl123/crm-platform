package com.crm.platform.settings.application.command;

public record UpdateBillingInfoCommand(
		String bankName,
		String bankAccountNumber,
		String bankAccountHolder,
		String swiftCode,
		String invoiceHeaderNote,
		String invoiceFooterNote
) {}
