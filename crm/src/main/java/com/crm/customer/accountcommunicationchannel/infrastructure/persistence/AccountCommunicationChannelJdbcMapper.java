package com.crm.customer.accountcommunicationchannel.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannel;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannelId;
import com.crm.customer.accountcommunicationchannel.domain.ChannelType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

final class AccountCommunicationChannelJdbcMapper {

	private AccountCommunicationChannelJdbcMapper() {
	}

	static AccountCommunicationChannel mapChannel(ResultSet resultSet,
			int rowNumber) throws SQLException {
		return AccountCommunicationChannel.rehydrate(
				TenantId.from(resultSet.getString("tenant_id")),
				AccountCommunicationChannelId.from(resultSet.getString("id")),
				AccountId.from(resultSet.getString("account_id")),
				ChannelType.valueOf(resultSet.getString("channel_type")),
				resultSet.getString("raw_value"),
				resultSet.getString("normalized_value"),
				resultSet.getString("label"),
				resultSet.getBoolean("is_primary"),
				resultSet.getBoolean("is_verified"),
				instant(resultSet.getTimestamp("verified_at")),
				resultSet.getBoolean("do_not_use"),
				instant(resultSet.getTimestamp("created_at")),
				actorId(resultSet.getString("created_by")),
				instant(resultSet.getTimestamp("updated_at")),
				actorId(resultSet.getString("updated_by")),
				instant(resultSet.getTimestamp("deleted_at")),
				actorId(resultSet.getString("deleted_by")),
				resultSet.getLong("version"));
	}

	static Timestamp timestamp(Instant value) {
		return value == null ? null : Timestamp.from(value);
	}

	private static Instant instant(Timestamp value) {
		return value == null ? null : value.toInstant();
	}

	private static ActorId actorId(String value) {
		return value == null ? null : ActorId.from(value);
	}

}
