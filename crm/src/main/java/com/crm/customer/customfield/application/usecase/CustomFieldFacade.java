package com.crm.customer.customfield.application.usecase;

import java.util.List;
import java.util.UUID;

import com.crm.customer.customfield.application.command.CreateCustomFieldDefinitionCommand;
import com.crm.customer.customfield.application.command.SetEntityCustomFieldsCommand;
import com.crm.customer.customfield.application.command.UpdateCustomFieldDefinitionCommand;
import com.crm.customer.customfield.application.dto.CustomFieldDefinitionDetails;
import com.crm.customer.customfield.application.dto.EntityCustomFieldsDetails;
import com.crm.customer.customfield.application.query.CustomFieldDefinitionSearchQuery;
import com.crm.customer.customfield.domain.CustomFieldDefinitionId;

public interface CustomFieldFacade {

	CustomFieldDefinitionDetails createDefinition(CreateCustomFieldDefinitionCommand command);

	CustomFieldDefinitionDetails getDefinition(CustomFieldDefinitionId id);

	List<CustomFieldDefinitionDetails> listDefinitions(CustomFieldDefinitionSearchQuery query);

	CustomFieldDefinitionDetails updateDefinition(UpdateCustomFieldDefinitionCommand command);

	EntityCustomFieldsDetails getEntityCustomFields(String entityType, UUID entityId);

	EntityCustomFieldsDetails setEntityCustomFields(SetEntityCustomFieldsCommand command);

}
