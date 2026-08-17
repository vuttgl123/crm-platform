package com.crm.customer.config.application.usecase;

import java.util.List;

import com.crm.customer.config.application.command.CreateLeadSourceCommand;
import com.crm.customer.config.application.command.CreateLeadStatusCommand;
import com.crm.customer.config.application.command.CreateOpportunityLostReasonCommand;
import com.crm.customer.config.application.command.UpdateLeadSourceCommand;
import com.crm.customer.config.application.command.UpdateLeadStatusCommand;
import com.crm.customer.config.application.command.UpdateOpportunityLostReasonCommand;
import com.crm.customer.config.application.dto.LeadSourceDetails;
import com.crm.customer.config.application.dto.LeadStatusDetails;
import com.crm.customer.config.application.dto.OpportunityLostReasonDetails;
import com.crm.customer.config.domain.LeadSourceId;
import com.crm.customer.config.domain.LeadStatusId;
import com.crm.customer.config.domain.OpportunityLostReasonId;

public interface SalesConfigFacade {

	LeadSourceDetails createLeadSource(CreateLeadSourceCommand command);

	LeadSourceDetails getLeadSource(LeadSourceId id);

	List<LeadSourceDetails> listLeadSources();

	LeadSourceDetails updateLeadSource(UpdateLeadSourceCommand command);

	LeadStatusDetails createLeadStatus(CreateLeadStatusCommand command);

	LeadStatusDetails getLeadStatus(LeadStatusId id);

	List<LeadStatusDetails> listLeadStatuses();

	LeadStatusDetails updateLeadStatus(UpdateLeadStatusCommand command);

	OpportunityLostReasonDetails createLostReason(CreateOpportunityLostReasonCommand command);

	OpportunityLostReasonDetails getLostReason(OpportunityLostReasonId id);

	List<OpportunityLostReasonDetails> listLostReasons();

	OpportunityLostReasonDetails updateLostReason(UpdateOpportunityLostReasonCommand command);

}
