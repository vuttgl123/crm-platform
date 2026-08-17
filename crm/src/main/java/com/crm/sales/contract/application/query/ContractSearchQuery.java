package com.crm.sales.contract.application.query;

import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.contract.domain.ContractStatus;
import com.crm.sales.contract.domain.ContractType;
import com.crm.sharedkernel.application.PageQuery;

public record ContractSearchQuery(
		String search,
		UUID accountId,
		ContractStatus status,
		ContractType contractType,
		LocalDate effectiveFrom,
		LocalDate effectiveTo,
		PageQuery page
) {

	public ContractSearchQuery {
		if (page == null) {
			page = PageQuery.defaultPage();
		}
	}

}
