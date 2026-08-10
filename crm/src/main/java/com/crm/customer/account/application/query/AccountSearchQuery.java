package com.crm.customer.account.application.query;

import java.util.Objects;

import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.customer.account.domain.AccountType;
import com.crm.sharedkernel.application.PageQuery;

public record AccountSearchQuery(
		String keyword,
		AccountType accountType,
		AccountLifecycleStage lifecycleStage,
		AccountOwner owner,
		PageQuery pageQuery) {

	public AccountSearchQuery {
		keyword = normalizeKeyword(keyword);
		Objects.requireNonNull(pageQuery, "pageQuery must not be null");
	}

	private static String normalizeKeyword(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		if (normalized.isEmpty()) {
			return null;
		}
		if (normalized.length() > 255) {
			throw new IllegalArgumentException(
					"keyword must not exceed 255 characters");
		}
		return normalized;
	}

}
