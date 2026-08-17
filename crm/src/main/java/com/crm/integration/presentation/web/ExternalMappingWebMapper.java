package com.crm.integration.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.integration.application.command.CreateExternalMappingCommand;
import com.crm.integration.application.dto.ExternalMappingDetails;
import com.crm.integration.domain.ExternalMappingId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ExternalMappingWebMapper {

	CreateExternalMappingCommand toCreateCommand(CreateExternalMappingRequest request);

	ExternalMappingResponse toResponse(ExternalMappingDetails details);

	List<ExternalMappingResponse> toResponseList(List<ExternalMappingDetails> list);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(ExternalMappingId value) {
		return value == null ? null : value.value();
	}

	default ExternalMappingId mapToExternalMappingId(UUID value) {
		return value == null ? null : new ExternalMappingId(value);
	}

}
