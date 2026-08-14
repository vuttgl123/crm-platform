package com.crm.customer.accountaddress.presentation.web;

import com.crm.customer.accountaddress.domain.AccountAddressType;

public record AccountAddressSearchRequest(
		AccountAddressType addressType,
		boolean includeHistory) {
}
