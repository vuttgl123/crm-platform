package com.crm.customer.accountrelationship.presentation.web;

import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountrelationship.application.command.CreateAccountRelationshipCommand;
import com.crm.customer.accountrelationship.application.command.EndAccountRelationshipCommand;
import com.crm.customer.accountrelationship.application.dto.AccountReference;
import com.crm.customer.accountrelationship.application.dto.AccountRelationshipDetails;
import com.crm.customer.accountrelationship.application.query.AccountRelationshipSearchQuery;
import com.crm.customer.accountrelationship.domain.AccountRelationshipId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.stereotype.Component;

@Component
public final class AccountRelationshipWebMapper {

	public CreateAccountRelationshipCommand toCreateCommand(AccountId accountId,
			CreateAccountRelationshipRequest request) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(request, "request must not be null");
		return new CreateAccountRelationshipCommand(accountId,
				new AccountId(request.relatedAccountId()), request.relationshipType(),
				request.validFrom(), request.validTo(), request.description());
	}

	public AccountRelationshipSearchQuery toSearchQuery(AccountId accountId,
			AccountRelationshipSearchRequest request) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(request, "request must not be null");
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new AccountRelationshipSearchQuery(accountId,
				new PageQuery(page, size));
	}

	public EndAccountRelationshipCommand toEndCommand(AccountId accountId,
			AccountRelationshipId relationshipId,
			EndAccountRelationshipRequest request) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(relationshipId,
				"relationshipId must not be null");
		Objects.requireNonNull(request, "request must not be null");
		return new EndAccountRelationshipCommand(accountId, relationshipId,
				request.validTo());
	}

	public AccountRelationshipResponse toResponse(
			AccountRelationshipDetails details) {
		Objects.requireNonNull(details, "details must not be null");
		return new AccountRelationshipResponse(details.id(),
				toAccount(details.account()), toAccount(details.relatedAccount()),
				details.direction(), details.relationshipType(),
				details.validFrom(), details.validTo(), details.description(),
				details.createdAt(), details.createdBy());
	}

	public PageResult<AccountRelationshipResponse> toPage(
			PageResult<AccountRelationshipDetails> page) {
		Objects.requireNonNull(page, "page must not be null");
		return new PageResult<>(page.items().stream()
				.map(this::toResponse)
				.toList(), page.page(), page.size(), page.totalElements(),
				page.totalPages());
	}

	private static AccountRelationshipResponse.Account toAccount(
			AccountReference reference) {
		return new AccountRelationshipResponse.Account(reference.id(),
				reference.accountNumber(), reference.displayName());
	}

}
