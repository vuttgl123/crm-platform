package com.crm.privacy.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.privacy.application.command.CreateLegalHoldCommand;
import com.crm.privacy.application.dto.LegalHoldDetails;
import com.crm.privacy.domain.LegalHoldId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface LegalHoldWebMapper {

	CreateLegalHoldCommand toCreateCommand(CreateLegalHoldRequest request);

	LegalHoldResponse toResponse(LegalHoldDetails details);

	List<LegalHoldResponse> toResponseList(List<LegalHoldDetails> list);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(LegalHoldId value) {
		return value == null ? null : value.value();
	}

	default LegalHoldId mapToLegalHoldId(UUID value) {
		return value == null ? null : new LegalHoldId(value);
	}

}
