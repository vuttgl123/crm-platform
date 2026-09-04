package com.crm.customer.lead.application.command;

public record CheckLeadDuplicatesCommand(
		String email,
		String phone,
		String companyName
) {}
