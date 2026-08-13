package com.crm.customer.account.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.application.dto.AccountSummary;
import com.crm.customer.account.domain.Account;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.account.domain.AccountType;
import com.crm.customer.account.domain.AnnualRevenue;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

final class AccountJdbcMapper {

	private AccountJdbcMapper() {
	}

	static Account mapAccount(ResultSet resultSet, int rowNumber)
			throws SQLException {
		return Account.rehydrate(
				TenantId.from(resultSet.getString("tenant_id")),
				AccountId.from(resultSet.getString("id")),
				resultSet.getString("account_number"),
				AccountType.valueOf(resultSet.getString("account_type")),
				resultSet.getString("legal_name"),
				resultSet.getString("display_name"),
				accountId(resultSet.getString("parent_account_id")),
				owner(resultSet),
				AccountLifecycleStage.valueOf(
						resultSet.getString("lifecycle_stage")),
				resultSet.getString("industry_code"),
				resultSet.getString("tax_identifier"),
				resultSet.getString("registration_number"),
				resultSet.getString("website"),
				annualRevenue(resultSet),
				resultSet.getObject("employee_count", Integer.class),
				resultSet.getString("description"),
				resultSet.getString("preferred_language_code"),
				resultSet.getBoolean("do_not_contact"),
				instant(resultSet.getTimestamp("created_at")),
				actorId(resultSet.getString("created_by")),
				instant(resultSet.getTimestamp("updated_at")),
				actorId(resultSet.getString("updated_by")),
				instant(resultSet.getTimestamp("deleted_at")),
				actorId(resultSet.getString("deleted_by")),
				resultSet.getLong("version"));
	}

	static AccountSummary mapSummary(ResultSet resultSet, int rowNumber)
			throws SQLException {
		String parentIdStr = resultSet.getString("parent_account_id");
		UUID parentAccountId = parentIdStr == null ? null : UUID.fromString(parentIdStr);
		return new AccountSummary(
				UUID.fromString(resultSet.getString("id")),
				resultSet.getString("account_number"),
				resultSet.getString("display_name"),
				resultSet.getString("legal_name"),
				parentAccountId,
				AccountType.valueOf(resultSet.getString("account_type")),
				AccountLifecycleStage.valueOf(
						resultSet.getString("lifecycle_stage")),
				owner(resultSet),
				resultSet.getBoolean("do_not_contact"),
				instant(resultSet.getTimestamp("updated_at")),
				resultSet.getLong("version"));
	}

	static AccountOwner owner(ResultSet resultSet) throws SQLException {
		String ownerUserId = resultSet.getString("owner_user_id");
		String ownerTeamId = resultSet.getString("owner_team_id");
		if (ownerUserId != null && ownerTeamId != null) {
			throw new IllegalStateException(
					"Account row cannot contain both USER and TEAM owners");
		}
		if (ownerUserId != null) {
			return new AccountOwner(AccountOwnerType.USER,
					UUID.fromString(ownerUserId));
		}
		if (ownerTeamId != null) {
			return new AccountOwner(AccountOwnerType.TEAM,
					UUID.fromString(ownerTeamId));
		}
		return null;
	}

	static AnnualRevenue annualRevenue(ResultSet resultSet)
			throws SQLException {
		var amount = resultSet.getBigDecimal("annual_revenue");
		return amount == null ? null : new AnnualRevenue(
				amount, resultSet.getString("revenue_currency_code"));
	}

	static Instant instant(Timestamp value) {
		return value == null ? null : value.toInstant();
	}

	static Timestamp timestamp(Instant value) {
		return value == null ? null : Timestamp.from(value);
	}

	static ActorId actorId(String value) {
		return value == null ? null : ActorId.from(value);
	}

	static AccountId accountId(String value) {
		return value == null ? null : AccountId.from(value);
	}

	static String uuid(UUID value) {
		return value == null ? null : value.toString();
	}

}
