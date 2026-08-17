package com.crm.customer.contact.presentation.web;

import java.util.UUID;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.application.command.CreateContactCommand;
import com.crm.customer.contact.application.command.UpdateContactCommand;
import com.crm.customer.contact.application.dto.ContactDetails;
import com.crm.customer.contact.application.dto.ContactSummary;
import com.crm.customer.contact.application.query.ContactSearchQuery;
import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.contact.domain.ContactOwner;
import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = CrmMapperConfig.class)
public interface ContactWebMapper {

	CreateContactCommand toCreateCommand(CreateContactRequest request);

	@Mapping(target = "contactId", source = "contactId")
	@Mapping(target = "expectedVersion", source = "request.version")
	UpdateContactCommand toUpdateCommand(
			ContactId contactId, UpdateContactRequest request);

	ContactResponse toResponse(ContactDetails details);

	ContactSummaryResponse toSummaryResponse(ContactSummary summary);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(ContactId value) {
		return value == null ? null : value.value();
	}

	default ContactId toContactId(UUID value) {
		return value == null ? null : new ContactId(value);
	}

	default UUID map(AccountId value) {
		return value == null ? null : value.value();
	}

	default AccountId toAccountId(UUID value) {
		return value == null ? null : new AccountId(value);
	}

	default ContactOwner toContactOwner(CreateContactRequest.Owner value) {
		return value == null ? null
				: new ContactOwner(value.type(), value.id());
	}

	default ContactOwner toContactOwner(UpdateContactRequest.Owner value) {
		return value == null ? null
				: new ContactOwner(value.type(), value.id());
	}

	default ContactResponse.Owner toDetailOwner(ContactOwner value) {
		return value == null ? null
				: new ContactResponse.Owner(value.type(), value.id());
	}

	default ContactSummaryResponse.Owner toSummaryOwner(ContactOwner value) {
		return value == null ? null
				: new ContactSummaryResponse.Owner(value.type(), value.id());
	}

	default ContactSearchQuery toSearchQuery(ContactSearchRequest request) {
		ContactOwner owner = request.ownerType() == null
				? null
				: new ContactOwner(request.ownerType(), request.ownerId());
		AccountId accountId = request.accountId() == null
				? null : new AccountId(request.accountId());
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new ContactSearchQuery(
				request.q(), accountId, request.lifecycleStage(),
				owner, new PageQuery(page, size));
	}

	default PageResult<ContactSummaryResponse> toSummaryPage(
			PageResult<ContactSummary> page) {
		return new PageResult<>(
				page.items().stream()
						.map(this::toSummaryResponse)
						.toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages());
	}

}
