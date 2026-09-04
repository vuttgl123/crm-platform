package com.crm.customer.lead.presentation.web;

public record CheckLeadDuplicatesRequest(
		String email,
		String phone,
		String companyName
) {}
