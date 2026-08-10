package com.crm.customer.account.presentation.web;

import java.util.UUID;

import com.crm.customer.account.application.command.CreateAccountCommand;
import com.crm.customer.account.application.command.UpdateAccountCommand;
import com.crm.customer.account.application.dto.AccountDetails;
import com.crm.customer.account.application.dto.AccountSummary;
import com.crm.customer.account.application.query.AccountSearchQuery;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.customer.account.domain.AnnualRevenue;
import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = CrmMapperConfig.class)
public interface AccountWebMapper {

	CreateAccountCommand toCreateCommand(CreateAccountRequest request);

	@Mapping(target = "accountId", source = "accountId")
	UpdateAccountCommand toUpdateCommand(
			AccountId accountId, UpdateAccountRequest request);

	AccountResponse toResponse(AccountDetails details);

	AccountSummaryResponse toSummaryResponse(AccountSummary summary);

	default AccountId toAccountId(UUID value) {
		return value == null ? null : new AccountId(value);
	}

	default AccountOwner toAccountOwner(CreateAccountRequest.Owner value) {
		return value == null ? null
				: new AccountOwner(value.type(), value.id());
	}

	default AccountOwner toAccountOwner(UpdateAccountRequest.Owner value) {
		return value == null ? null
				: new AccountOwner(value.type(), value.id());
	}

	default AnnualRevenue toAnnualRevenue(
			CreateAccountRequest.Revenue value) {
		return value == null ? null
				: new AnnualRevenue(value.amount(), value.currencyCode());
	}

	default AnnualRevenue toAnnualRevenue(
			UpdateAccountRequest.Revenue value) {
		return value == null ? null
				: new AnnualRevenue(value.amount(), value.currencyCode());
	}

	default AccountResponse.Owner toDetailOwner(AccountOwner value) {
		return value == null ? null
				: new AccountResponse.Owner(value.type(), value.id());
	}

	default AccountSummaryResponse.Owner toSummaryOwner(AccountOwner value) {
		return value == null ? null
				: new AccountSummaryResponse.Owner(value.type(), value.id());
	}

	default AccountResponse.Revenue toRevenueResponse(AnnualRevenue value) {
		return value == null ? null
				: new AccountResponse.Revenue(
						value.amount(), value.currencyCode());
	}

	default AccountSearchQuery toSearchQuery(AccountSearchRequest request) {
		AccountOwner owner = request.ownerType() == null
				? null
				: new AccountOwner(request.ownerType(), request.ownerId());
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new AccountSearchQuery(
				request.q(), request.accountType(), request.lifecycleStage(),
				owner, new PageQuery(page, size));
	}

	default PageResult<AccountSummaryResponse> toSummaryPage(
			PageResult<AccountSummary> page) {
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
