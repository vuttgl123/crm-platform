package com.crm.customer.tag.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.customer.tag.application.command.AssignTagCommand;
import com.crm.customer.tag.application.command.CreateTagCommand;
import com.crm.customer.tag.application.command.UpdateTagCommand;
import com.crm.customer.tag.application.dto.EntityTagDetails;
import com.crm.customer.tag.application.dto.TagDetails;
import com.crm.customer.tag.domain.EntityTagId;
import com.crm.customer.tag.domain.TagId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TagWebMapper {

	default CreateTagCommand toCreateCommand(CreateTagRequest request) {
		return new CreateTagCommand(
				request.tagKey(),
				request.name(),
				request.description(),
				request.colorHex()
		);
	}

	default UpdateTagCommand toUpdateCommand(TagId id, UpdateTagRequest request) {
		return new UpdateTagCommand(
				id,
				request.version(),
				request.name(),
				request.description(),
				request.colorHex(),
				request.active()
		);
	}

	default AssignTagCommand toAssignCommand(AssignTagRequest request) {
		return new AssignTagCommand(
				new TagId(request.tagId()),
				request.accountId(),
				request.contactId(),
				request.leadId(),
				request.opportunityId(),
				request.activityId(),
				request.ticketId()
		);
	}

	TagResponse toResponse(TagDetails details);

	List<TagResponse> toResponseList(List<TagDetails> list);

	EntityTagResponse toEntityTagResponse(EntityTagDetails details);

	List<EntityTagResponse> toEntityTagResponseList(List<EntityTagDetails> list);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(TagId value) {
		return value == null ? null : value.value();
	}

	default TagId mapToTagId(UUID value) {
		return value == null ? null : new TagId(value);
	}

	default UUID map(EntityTagId value) {
		return value == null ? null : value.value();
	}

	default EntityTagId mapToEntityTagId(UUID value) {
		return value == null ? null : new EntityTagId(value);
	}

}
