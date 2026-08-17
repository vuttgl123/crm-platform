package com.crm.service.category.application.usecase;

import java.util.List;

import com.crm.service.category.application.command.CreateTicketCategoryCommand;
import com.crm.service.category.application.command.UpdateTicketCategoryCommand;
import com.crm.service.category.application.dto.TicketCategoryDetails;
import com.crm.service.category.application.dto.TicketCategorySummary;
import com.crm.service.category.domain.TicketCategoryId;

public interface TicketCategoryFacade {

	TicketCategoryDetails create(CreateTicketCategoryCommand command);

	TicketCategoryDetails get(TicketCategoryId id);

	List<TicketCategorySummary> list();

	TicketCategoryDetails update(UpdateTicketCategoryCommand command);

	void delete(TicketCategoryId id, long version);

}
