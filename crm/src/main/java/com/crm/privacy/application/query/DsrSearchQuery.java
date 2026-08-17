package com.crm.privacy.application.query;

import java.util.UUID;

import com.crm.privacy.domain.DsrStatus;
import com.crm.privacy.domain.DsrType;
import com.crm.sharedkernel.application.PageQuery;

public record DsrSearchQuery(
		DsrType requestType,
		DsrStatus status,
		UUID assignedUserId,
		PageQuery page
) {

	public DsrSearchQuery {
		if (page == null) {
			page = PageQuery.defaultPage();
		}
	}

}
