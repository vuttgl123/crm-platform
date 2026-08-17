package com.crm.customer.customfield.application.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.customfield.application.command.CreateCustomFieldDefinitionCommand;
import com.crm.customer.customfield.application.command.SetCustomFieldValueItem;
import com.crm.customer.customfield.application.command.SetEntityCustomFieldsCommand;
import com.crm.customer.customfield.application.command.UpdateCustomFieldDefinitionCommand;
import com.crm.customer.customfield.application.dto.CustomFieldDefinitionDetails;
import com.crm.customer.customfield.application.dto.CustomFieldValueDetails;
import com.crm.customer.customfield.application.dto.EntityCustomFieldsDetails;
import com.crm.customer.customfield.application.port.CustomFieldRepository;
import com.crm.customer.customfield.application.query.CustomFieldDefinitionSearchQuery;
import com.crm.customer.customfield.application.usecase.CustomFieldFacade;
import com.crm.customer.customfield.domain.CustomFieldDefinition;
import com.crm.customer.customfield.domain.CustomFieldDefinitionId;
import com.crm.customer.customfield.domain.CustomFieldErrorCode;
import com.crm.customer.customfield.domain.CustomFieldValue;
import com.crm.customer.customfield.domain.CustomFieldValueId;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomFieldApplicationService implements CustomFieldFacade {

	private final CustomFieldRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public CustomFieldApplicationService(
			CustomFieldRepository repository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.repository = repository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public CustomFieldDefinitionDetails createDefinition(CreateCustomFieldDefinitionCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_WRITE);

		if (repository.existsDefinitionByKey(tenantId, command.entityType(), command.fieldKey())) {
			throw new ResourceConflict(CustomFieldErrorCode.CUSTOM_FIELD_KEY_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		CustomFieldDefinitionId id = new CustomFieldDefinitionId(identifierGenerator.nextId());

		CustomFieldDefinition definition = CustomFieldDefinition.create(
				tenantId,
				id,
				command.entityType(),
				command.fieldKey(),
				command.displayName(),
				command.dataType(),
				command.description(),
				command.validationRulesJson(),
				command.optionValuesJson(),
				command.required(),
				command.searchable(),
				command.sensitive(),
				command.displayOrder(),
				actorId,
				now
		);

		try {
			repository.insertDefinition(definition);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(CustomFieldErrorCode.CUSTOM_FIELD_KEY_ALREADY_EXISTS.code());
		}

		return CustomFieldDefinitionDetails.from(definition);
	}

	@Override
	@Transactional(readOnly = true)
	public CustomFieldDefinitionDetails getDefinition(CustomFieldDefinitionId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		CustomFieldDefinition definition = repository.findDefinitionById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(CustomFieldErrorCode.CUSTOM_FIELD_DEFINITION_NOT_FOUND.code()));

		return CustomFieldDefinitionDetails.from(definition);
	}

	@Override
	@Transactional(readOnly = true)
	public List<CustomFieldDefinitionDetails> listDefinitions(CustomFieldDefinitionSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		return repository.findDefinitions(tenantId, query);
	}

	@Override
	@Transactional
	public CustomFieldDefinitionDetails updateDefinition(UpdateCustomFieldDefinitionCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_WRITE);

		CustomFieldDefinition definition = repository.findDefinitionById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(CustomFieldErrorCode.CUSTOM_FIELD_DEFINITION_NOT_FOUND.code()));

		if (definition.version() != command.version()) {
			throw new ResourceConflict(CustomFieldErrorCode.CUSTOM_FIELD_VERSION_CONFLICT.code());
		}

		definition.update(
				command.displayName(),
				command.description(),
				command.validationRulesJson(),
				command.optionValuesJson(),
				command.required(),
				command.searchable(),
				command.sensitive(),
				command.active(),
				command.displayOrder(),
				actorId,
				timeProvider.now()
		);

		repository.updateDefinition(definition);
		return CustomFieldDefinitionDetails.from(definition);
	}

	@Override
	@Transactional(readOnly = true)
	public EntityCustomFieldsDetails getEntityCustomFields(String entityType, UUID entityId) {
		Objects.requireNonNull(entityType, "entityType must not be null");
		Objects.requireNonNull(entityId, "entityId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		List<CustomFieldValueDetails> values = repository.findValuesByEntity(tenantId, entityType.toUpperCase(), entityId);
		return new EntityCustomFieldsDetails(entityType.toUpperCase(), entityId, values);
	}

	@Override
	@Transactional
	public EntityCustomFieldsDetails setEntityCustomFields(SetEntityCustomFieldsCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_WRITE);

		Instant now = timeProvider.now();
		String entityType = command.entityType().trim().toUpperCase();
		UUID entityId = command.entityId();

		if (command.fieldValues() != null) {
			for (SetCustomFieldValueItem item : command.fieldValues()) {
				CustomFieldDefinition def = null;
				if (item.definitionId() != null) {
					def = repository.findDefinitionById(tenantId, new CustomFieldDefinitionId(item.definitionId()))
							.orElse(null);
				}
				else if (item.fieldKey() != null && !item.fieldKey().isBlank()) {
					def = repository.findDefinitionByKey(tenantId, entityType, item.fieldKey())
							.orElse(null);
				}

				if (def == null) {
					continue;
				}

				String valueJson = item.valueJson() != null && !item.valueJson().isBlank() ? item.valueJson() : "\"\"";
				String searchText = extractSearchText(valueJson);

				Optional<CustomFieldValue> existingVal = repository.findValueByEntityAndDefinition(tenantId, def.id(), entityId);
				if (existingVal.isPresent()) {
					CustomFieldValue val = existingVal.get();
					val.updateValue(valueJson, searchText, actorId, now);
					repository.updateValue(val);
				}
				else {
					CustomFieldValue val = CustomFieldValue.create(
							tenantId,
							new CustomFieldValueId(identifierGenerator.nextId()),
							def.id(),
							entityType,
							entityId,
							valueJson,
							searchText,
							actorId,
							now
					);
					repository.insertValue(val);
				}
			}
		}

		List<CustomFieldValueDetails> values = repository.findValuesByEntity(tenantId, entityType, entityId);
		return new EntityCustomFieldsDetails(entityType, entityId, values);
	}

	private String extractSearchText(String json) {
		if (json == null || json.isBlank() || json.equals("\"\"") || json.equals("null")) {
			return null;
		}
		// Strip quotes or array brackets for full-text search indexing
		return json.replaceAll("[\"\\[\\]{}]", " ").trim();
	}

}
