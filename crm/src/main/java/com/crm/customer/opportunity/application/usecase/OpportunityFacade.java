package com.crm.customer.opportunity.application.usecase;

import com.crm.customer.opportunity.application.command.CreateOpportunityCommand;
import com.crm.customer.opportunity.application.command.DeleteOpportunityCommand;
import com.crm.customer.opportunity.application.command.UpdateOpportunityCommand;
import com.crm.customer.opportunity.application.dto.OpportunityDetails;
import com.crm.customer.opportunity.application.dto.OpportunitySummary;
import com.crm.customer.opportunity.application.query.OpportunitySearchQuery;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.sharedkernel.application.PageResult;

public interface OpportunityFacade {

	OpportunityDetails create(CreateOpportunityCommand command);

	OpportunityDetails get(OpportunityId opportunityId);

	PageResult<OpportunitySummary> search(OpportunitySearchQuery query);

	OpportunityDetails update(UpdateOpportunityCommand command);

	void delete(DeleteOpportunityCommand command);

}
