package com.crm.service.ticket.application.query;

import java.util.UUID;

import com.crm.service.ticket.domain.TicketPriority;
import com.crm.service.ticket.domain.TicketStatus;
import com.crm.sharedkernel.application.PageQuery;

public record TicketSearchQuery(
		String search,
		UUID accountId,
		UUID contactId,
		UUID categoryId,
		TicketStatus status,
		TicketPriority priority,
		UUID assignedUserId,
		UUID assignedTeamId,
		PageQuery page
) {

	public TicketSearchQuery {
		if (page == null) {
			page = PageQuery.defaultPage();
		}
	}

}
