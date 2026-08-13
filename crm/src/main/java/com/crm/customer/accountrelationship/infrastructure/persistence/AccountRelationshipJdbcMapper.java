package com.crm.customer.accountrelationship.infrastructure.persistence;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountrelationship.application.dto.AccountReference;
import com.crm.customer.accountrelationship.application.dto.AccountRelationshipDetails;
import com.crm.customer.accountrelationship.domain.AccountRelationship;
import com.crm.customer.accountrelationship.domain.AccountRelationshipDirection;
import com.crm.customer.accountrelationship.domain.AccountRelationshipId;
import com.crm.customer.accountrelationship.domain.AccountRelationshipType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

final class AccountRelationshipJdbcMapper {

	private AccountRelationshipJdbcMapper() {
	}

	static AccountRelationship mapRelationship(ResultSet resultSet,
			int rowNumber) throws SQLException {
		return AccountRelationship.rehydrate(
				TenantId.from(resultSet.getString("tenant_id")),
				AccountRelationshipId.from(resultSet.getString("id")),
				AccountId.from(resultSet.getString("account_id")),
				AccountId.from(resultSet.getString("related_account_id")),
				AccountRelationshipType.valueOf(
						resultSet.getString("relationship_type")),
				localDate(resultSet.getDate("valid_from")),
				localDate(resultSet.getDate("valid_to")),
				resultSet.getString("description"),
				instant(resultSet.getTimestamp("created_at")),
				actorId(resultSet.getString("created_by")));
	}

	static AccountRelationshipDetails mapDetails(ResultSet resultSet,
			int rowNumber) throws SQLException {
		return new AccountRelationshipDetails(
				UUID.fromString(resultSet.getString("id")),
				new AccountReference(
						UUID.fromString(resultSet.getString("source_id")),
						resultSet.getString("source_number"),
						resultSet.getString("source_name")),
				new AccountReference(
						UUID.fromString(resultSet.getString("target_id")),
						resultSet.getString("target_number"),
						resultSet.getString("target_name")),
				AccountRelationshipDirection.valueOf(
						resultSet.getString("direction")),
				AccountRelationshipType.valueOf(
						resultSet.getString("relationship_type")),
				localDate(resultSet.getDate("valid_from")),
				localDate(resultSet.getDate("valid_to")),
				resultSet.getString("description"),
				instant(resultSet.getTimestamp("created_at")),
				uuid(resultSet.getString("created_by")));
	}

	static Timestamp timestamp(Instant value) {
		return value == null ? null : Timestamp.from(value);
	}

	private static LocalDate localDate(Date value) {
		return value == null ? null : value.toLocalDate();
	}

	private static Instant instant(Timestamp value) {
		return value == null ? null : value.toInstant();
	}

	private static ActorId actorId(String value) {
		return value == null ? null : ActorId.from(value);
	}

	private static UUID uuid(String value) {
		return value == null ? null : UUID.fromString(value);
	}

}
