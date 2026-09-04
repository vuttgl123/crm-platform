package com.crm.customer.contact.application.dto;

public record ContactStatsDto(
		long totalContacts,
		long primaryContactsCount,
		long prospectContactsCount,
		long qualifiedContactsCount,
		long customerContactsCount,
		long inactiveContactsCount,
		long churnedContactsCount
) {}
