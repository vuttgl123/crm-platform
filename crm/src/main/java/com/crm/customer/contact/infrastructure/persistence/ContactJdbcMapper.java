package com.crm.customer.contact.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.contact.application.dto.ContactSummary;
import com.crm.customer.contact.domain.Contact;
import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.contact.domain.ContactLifecycleStage;
import com.crm.customer.contact.domain.ContactOwner;
import com.crm.customer.contact.domain.PreferredContactChannel;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class ContactJdbcMapper {

	private ContactJdbcMapper() {
	}

	public static Contact mapContact(ResultSet rs, int rowNum)
			throws SQLException {
		String ownerUserIdStr = rs.getString("owner_user_id");
		String ownerTeamIdStr = rs.getString("owner_team_id");
		ContactOwner owner = null;
		if (ownerUserIdStr != null) {
			owner = new ContactOwner(
					AccountOwnerType.USER, UUID.fromString(ownerUserIdStr));
		} else if (ownerTeamIdStr != null) {
			owner = new ContactOwner(
					AccountOwnerType.TEAM, UUID.fromString(ownerTeamIdStr));
		}

		String accountIdStr = rs.getString("account_id");
		AccountId accountId = accountIdStr == null
				? null : AccountId.from(accountIdStr);

		String channelStr = rs.getString("preferred_contact_channel");
		PreferredContactChannel preferredContactChannel = channelStr == null
				? null : PreferredContactChannel.valueOf(channelStr);

		java.sql.Date dobSql = rs.getDate("date_of_birth");
		LocalDate dateOfBirth = dobSql == null ? null : dobSql.toLocalDate();

		return Contact.reconstitute(
				TenantId.from(rs.getString("tenant_id")),
				ContactId.from(rs.getString("id")),
				rs.getString("contact_number"),
				accountId,
				owner,
				rs.getString("honorific"),
				rs.getString("given_name"),
				rs.getString("middle_name"),
				rs.getString("family_name"),
				rs.getString("display_name"),
				rs.getString("job_title"),
				rs.getString("department"),
				rs.getString("preferred_language_code"),
				preferredContactChannel,
				ContactLifecycleStage.valueOf(rs.getString("lifecycle_stage")),
				dateOfBirth,
				rs.getBoolean("do_not_contact"),
				rs.getString("description"),
				toInstant(rs.getTimestamp("created_at")),
				toActorId(rs.getString("created_by")),
				toInstant(rs.getTimestamp("updated_at")),
				toActorId(rs.getString("updated_by")),
				toInstant(rs.getTimestamp("deleted_at")),
				toActorId(rs.getString("deleted_by")),
				rs.getLong("version"));
	}

	public static ContactSummary mapSummary(ResultSet rs, int rowNum)
			throws SQLException {
		String ownerUserIdStr = rs.getString("owner_user_id");
		String ownerTeamIdStr = rs.getString("owner_team_id");
		ContactOwner owner = null;
		if (ownerUserIdStr != null) {
			owner = new ContactOwner(
					AccountOwnerType.USER, UUID.fromString(ownerUserIdStr));
		} else if (ownerTeamIdStr != null) {
			owner = new ContactOwner(
					AccountOwnerType.TEAM, UUID.fromString(ownerTeamIdStr));
		}

		String accountIdStr = rs.getString("account_id");
		AccountId accountId = accountIdStr == null
				? null : AccountId.from(accountIdStr);

		String channelStr = rs.getString("preferred_contact_channel");
		PreferredContactChannel preferredContactChannel = channelStr == null
				? null : PreferredContactChannel.valueOf(channelStr);

		return new ContactSummary(
				ContactId.from(rs.getString("id")),
				rs.getString("contact_number"),
				accountId,
				rs.getString("display_name"),
				rs.getString("job_title"),
				rs.getString("department"),
				preferredContactChannel,
				ContactLifecycleStage.valueOf(rs.getString("lifecycle_stage")),
				owner,
				rs.getBoolean("do_not_contact"),
				toInstant(rs.getTimestamp("updated_at")),
				rs.getLong("version"));
	}

	private static Instant toInstant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}

	private static ActorId toActorId(String value) {
		return value == null ? null : ActorId.from(value);
	}

}
