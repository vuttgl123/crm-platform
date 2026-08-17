package com.crm.customer.config.presentation.web;

import java.util.List;
import java.util.UUID;

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
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SalesConfigWebMapper {

	default CreateLeadSourceCommand toCreateLeadSourceCommand(CreateLeadSourceRequest request) {
		return new CreateLeadSourceCommand(request.sourceCode(), request.name(), request.description());
	}

	default UpdateLeadSourceCommand toUpdateLeadSourceCommand(LeadSourceId id, UpdateLeadSourceRequest request) {
		return new UpdateLeadSourceCommand(id, request.version(), request.name(), request.description(), request.active());
	}

	default CreateLeadStatusCommand toCreateLeadStatusCommand(CreateLeadStatusRequest request) {
		return new CreateLeadStatusCommand(request.statusCode(), request.name(), request.statusCategory(), request.displayOrder(), request.defaultStatus(), request.terminal());
	}

	default UpdateLeadStatusCommand toUpdateLeadStatusCommand(LeadStatusId id, UpdateLeadStatusRequest request) {
		return new UpdateLeadStatusCommand(id, request.version(), request.name(), request.statusCategory(), request.displayOrder(), request.defaultStatus(), request.terminal(), request.active());
	}

	default CreateOpportunityLostReasonCommand toCreateLostReasonCommand(CreateOpportunityLostReasonRequest request) {
		return new CreateOpportunityLostReasonCommand(request.reasonCode(), request.name(), request.description());
	}

	default UpdateOpportunityLostReasonCommand toUpdateLostReasonCommand(OpportunityLostReasonId id, UpdateOpportunityLostReasonRequest request) {
		return new UpdateOpportunityLostReasonCommand(id, request.version(), request.name(), request.description(), request.active());
	}

	LeadSourceResponse toLeadSourceResponse(LeadSourceDetails details);

	List<LeadSourceResponse> toLeadSourceResponseList(List<LeadSourceDetails> list);

	LeadStatusResponse toLeadStatusResponse(LeadStatusDetails details);

	List<LeadStatusResponse> toLeadStatusResponseList(List<LeadStatusDetails> list);

	OpportunityLostReasonResponse toLostReasonResponse(OpportunityLostReasonDetails details);

	List<OpportunityLostReasonResponse> toLostReasonResponseList(List<OpportunityLostReasonDetails> list);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(LeadSourceId value) {
		return value == null ? null : value.value();
	}

	default LeadSourceId mapToLeadSourceId(UUID value) {
		return value == null ? null : new LeadSourceId(value);
	}

	default UUID map(LeadStatusId value) {
		return value == null ? null : value.value();
	}

	default LeadStatusId mapToLeadStatusId(UUID value) {
		return value == null ? null : new LeadStatusId(value);
	}

	default UUID map(OpportunityLostReasonId value) {
		return value == null ? null : value.value();
	}

	default OpportunityLostReasonId mapToOpportunityLostReasonId(UUID value) {
		return value == null ? null : new OpportunityLostReasonId(value);
	}

}
