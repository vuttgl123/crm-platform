package com.crm.customer.tag.application.usecase;

import java.util.List;
import java.util.UUID;

import com.crm.customer.tag.application.command.AssignTagCommand;
import com.crm.customer.tag.application.command.CreateTagCommand;
import com.crm.customer.tag.application.command.UpdateTagCommand;
import com.crm.customer.tag.application.dto.EntityTagDetails;
import com.crm.customer.tag.application.dto.TagDetails;
import com.crm.customer.tag.domain.EntityTagId;
import com.crm.customer.tag.domain.TagId;

public interface TagFacade {

	TagDetails create(CreateTagCommand command);

	TagDetails get(TagId id);

	List<TagDetails> list();

	TagDetails update(UpdateTagCommand command);

	EntityTagDetails assign(AssignTagCommand command);

	void removeAssignment(EntityTagId entityTagId);

	List<EntityTagDetails> listByTarget(
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId
	);

}
