package com.crm.customer.accountaddress.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.domain.AccountAddress;
import com.crm.customer.accountaddress.domain.AccountAddressId;
import com.crm.customer.accountaddress.domain.AccountAddressType;
import com.crm.customer.accountaddress.domain.AddressContent;
import com.crm.customer.accountaddress.domain.AddressValidationStatus;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

final class AccountAddressJdbcMapper {

	private AccountAddressJdbcMapper() {
	}

	static AccountAddress mapAddress(ResultSet resultSet, int rowNumber)
			throws SQLException {
		return AccountAddress.rehydrate(
				TenantId.from(resultSet.getString("tenant_id")),
				AccountAddressId.from(resultSet.getString("id")),
				AccountId.from(resultSet.getString("account_id")),
				new AddressContent(
						resultSet.getString("address_line_1"),
						resultSet.getString("address_line_2"),
						resultSet.getString("locality"),
						resultSet.getString("administrative_area"),
						resultSet.getString("postal_code"),
						resultSet.getString("country_code"),
						resultSet.getBigDecimal("latitude"),
						resultSet.getBigDecimal("longitude"),
						resultSet.getString("formatted_address")),
				AddressValidationStatus.valueOf(
						resultSet.getString("validation_status")),
				AccountAddressType.valueOf(
						resultSet.getString("address_type")),
				resultSet.getBoolean("is_primary"),
				resultSet.getObject("valid_from", LocalDate.class),
				resultSet.getObject("valid_to", LocalDate.class),
				instant(resultSet.getTimestamp("created_at")),
				actorId(resultSet.getString("created_by")),
				instant(resultSet.getTimestamp("updated_at")),
				actorId(resultSet.getString("updated_by")),
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
