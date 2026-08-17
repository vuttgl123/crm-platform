package com.crm.service.category.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.service.category.application.command.CreateTicketCategoryCommand;
import com.crm.service.category.application.command.UpdateTicketCategoryCommand;
import com.crm.service.category.application.dto.TicketCategoryDetails;
import com.crm.service.category.application.dto.TicketCategorySummary;
import com.crm.service.category.domain.TicketCategoryId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TicketCategoryWebMapper {

	CreateTicketCategoryCommand toCreateCommand(CreateTicketCategoryRequest request);

	default UpdateTicketCategoryCommand toUpdateCommand(TicketCategoryId id, UpdateTicketCategoryRequest request) {
		return new UpdateTicketCategoryCommand(
				id,
				request.version(),
				request.name(),
				request.parentCategoryId(),
				request.defaultTeamId(),
				request.description(),
				request.isActive()
		);
	}

	TicketCategoryResponse toResponse(TicketCategoryDetails details);

	TicketCategorySummaryResponse toSummaryResponse(TicketCategorySummary summary);

	List<TicketCategorySummaryResponse> toSummaryResponseList(List<TicketCategorySummary> summaries);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(TicketCategoryId value) {
		return value == null ? null : value.value();
	}

	default TicketCategoryId mapToTicketCategoryId(UUID value) {
		return value == null ? null : new TicketCategoryId(value);
	}

}
