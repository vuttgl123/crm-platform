package com.crm.privacy.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.privacy.application.command.CaptureConsentCommand;
import com.crm.privacy.application.dto.ConsentDetails;
import com.crm.privacy.domain.ConsentId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ConsentWebMapper {

	CaptureConsentCommand toCaptureCommand(CaptureConsentRequest request);

	ConsentResponse toResponse(ConsentDetails details);

	List<ConsentResponse> toResponseList(List<ConsentDetails> list);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(ConsentId value) {
		return value == null ? null : value.value();
	}

	default ConsentId mapToConsentId(UUID value) {
		return value == null ? null : new ConsentId(value);
	}

}
