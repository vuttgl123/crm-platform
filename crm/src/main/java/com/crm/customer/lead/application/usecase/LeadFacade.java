package com.crm.customer.lead.application.usecase;

import com.crm.customer.lead.application.command.ConvertLeadCommand;
import com.crm.customer.lead.application.command.CreateLeadCommand;
import com.crm.customer.lead.application.command.DeleteLeadCommand;
import com.crm.customer.lead.application.command.UpdateLeadCommand;
import com.crm.customer.lead.application.dto.LeadDetails;
import com.crm.customer.lead.application.dto.LeadSummary;
import com.crm.customer.lead.application.query.LeadSearchQuery;
import com.crm.customer.lead.domain.LeadId;
import com.crm.sharedkernel.application.PageResult;

public interface LeadFacade {

	LeadDetails create(CreateLeadCommand command);

	LeadDetails get(LeadId leadId);

	PageResult<LeadSummary> search(LeadSearchQuery query);

	LeadDetails update(UpdateLeadCommand command);

	LeadDetails convert(ConvertLeadCommand command);

	void delete(DeleteLeadCommand command);

}
