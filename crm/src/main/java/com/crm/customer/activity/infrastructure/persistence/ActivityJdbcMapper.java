package com.crm.customer.activity.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.activity.application.dto.ActivitySummary;
import com.crm.customer.activity.domain.Activity;
import com.crm.customer.activity.domain.ActivityDirection;
import com.crm.customer.activity.domain.ActivityId;
import com.crm.customer.activity.domain.ActivityOwner;
import com.crm.customer.activity.domain.ActivityPriority;
import com.crm.customer.activity.domain.ActivityStatus;
import com.crm.customer.activity.domain.ActivityType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class ActivityJdbcMapper {

	private ActivityJdbcMapper() {
	}

	public static Activity mapActivity(ResultSet rs, int rowNum) throws SQLException {
		String ownerUserIdStr = rs.getString("owner_user_id");
		UUID ownerUserId = ownerUserIdStr == null ? null : UUID.fromString(ownerUserIdStr);

		String assignedTeamIdStr = rs.getString("assigned_team_id");
		UUID assignedTeamId = assignedTeamIdStr == null ? null : UUID.fromString(assignedTeamIdStr);

		String directionStr = rs.getString("direction");
		ActivityDirection direction = directionStr == null ? null : ActivityDirection.valueOf(directionStr);

		Integer durationSeconds = rs.getObject("duration_seconds") == null ? null : rs.getInt("duration_seconds");

		return Activity.reconstitute(
				TenantId.from(rs.getString("tenant_id")),
				ActivityId.from(rs.getString("id")),
				ActivityType.valueOf(rs.getString("activity_type")),
				rs.getString("subject"),
				rs.getString("description"),
				direction,
				ActivityStatus.valueOf(rs.getString("status")),
				ActivityPriority.valueOf(rs.getString("priority")),
				ActivityOwner.of(ownerUserId, assignedTeamId),
				toInstant(rs.getTimestamp("scheduled_start_at")),
				toInstant(rs.getTimestamp("scheduled_end_at")),
				toInstant(rs.getTimestamp("completed_at")),
				durationSeconds,
				rs.getString("outcome_code"),
				rs.getString("external_reference"),
				rs.getString("recurrence_rule"),
				toInstant(rs.getTimestamp("created_at")),
				toActorId(rs.getString("created_by")),
				toInstant(rs.getTimestamp("updated_at")),
				toActorId(rs.getString("updated_by")),
				rs.getLong("version"));
	}

	public static ActivitySummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		String ownerUserIdStr = rs.getString("owner_user_id");
		UUID ownerUserId = ownerUserIdStr == null ? null : UUID.fromString(ownerUserIdStr);

		String assignedTeamIdStr = rs.getString("assigned_team_id");
		UUID assignedTeamId = assignedTeamIdStr == null ? null : UUID.fromString(assignedTeamIdStr);

		String directionStr = rs.getString("direction");
		ActivityDirection direction = directionStr == null ? null : ActivityDirection.valueOf(directionStr);

		return new ActivitySummary(
				ActivityId.from(rs.getString("id")),
				ActivityType.valueOf(rs.getString("activity_type")),
				rs.getString("subject"),
				direction,
				ActivityStatus.valueOf(rs.getString("status")),
				ActivityPriority.valueOf(rs.getString("priority")),
				ActivityOwner.of(ownerUserId, assignedTeamId),
				toInstant(rs.getTimestamp("scheduled_start_at")),
				toInstant(rs.getTimestamp("scheduled_end_at")),
				toInstant(rs.getTimestamp("completed_at")),
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
