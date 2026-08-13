package com.crm.platform.membership.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.membership.application.dto.ApprovedMembershipDetails;
import com.crm.platform.membership.application.dto.MembershipRequestDetails;
import com.crm.platform.membership.application.dto.RoleReference;
import com.crm.platform.membership.application.dto.TenantReference;
import com.crm.platform.membership.application.dto.UserReference;
import com.crm.platform.membership.application.port.MembershipRequestRepository;
import com.crm.platform.membership.application.query.MembershipRequestSearchQuery;
import com.crm.platform.membership.domain.MembershipRequest;
import com.crm.platform.membership.domain.MembershipRequestId;
import com.crm.platform.membership.domain.MembershipRequestStatus;
import com.crm.platform.membership.domain.TenantMembershipState;
import com.crm.platform.membership.domain.TenantMembershipStatus;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcMembershipRequestRepository
		implements MembershipRequestRepository {

	private static final String DETAILS_SELECT = """
			SELECT mr.id AS request_id,
			       t.id AS tenant_id,
			       t.tenant_code,
			       t.display_name AS tenant_display_name,
			       requester.id AS requester_id,
			       requester.email AS requester_email,
			       requester.display_name AS requester_display_name,
			       mr.request_status,
			       mr.message,
			       mr.requested_at,
			       reviewer.id AS reviewer_id,
			       reviewer.email AS reviewer_email,
			       reviewer.display_name AS reviewer_display_name,
			       mr.reviewed_at,
			       mr.review_note,
			       mr.version
			FROM platform_membership_requests mr
			JOIN platform_tenants t ON t.id = mr.tenant_id
			JOIN platform_users requester ON requester.id = mr.requester_user_id
			LEFT JOIN platform_users reviewer ON reviewer.id = mr.reviewed_by
			""";

	private final JdbcClient jdbcClient;

	public JdbcMembershipRequestRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<TenantReference> findAvailableTenantByCode(
			String tenantCode) {
		return jdbcClient.sql("""
				SELECT t.id, t.tenant_code, t.display_name
				FROM platform_tenants t
				WHERE t.tenant_code = :tenantCode
				  AND t.status IN ('TRIAL', 'ACTIVE')
				FOR SHARE
				""")
				.param("tenantCode", tenantCode.trim())
				.query((resultSet, rowNumber) -> new TenantReference(
						TenantId.from(resultSet.getString("id")),
						resultSet.getString("tenant_code"),
						resultSet.getString("display_name")))
				.optional();
	}

	@Override
	public Optional<UserReference> lockActiveUser(ActorId userId) {
		return jdbcClient.sql("""
				SELECT u.id, u.email, u.display_name
				FROM platform_users u
				WHERE u.id = :userId
				  AND u.status = 'ACTIVE'
				FOR UPDATE
				""")
				.param("userId", userId.toString())
				.query((resultSet, rowNumber) -> userReference(
						resultSet,
						"id",
						"email",
						"display_name"))
				.optional();
	}

	@Override
	public boolean hasNonRemovedMembership(TenantId tenantId, ActorId userId) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_tenant_memberships m
				WHERE m.tenant_id = :tenantId
				  AND m.user_id = :userId
				  AND m.membership_status <> 'REMOVED'
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", userId.toString())
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public boolean hasPendingRequest(TenantId tenantId, ActorId userId) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_membership_requests mr
				WHERE mr.tenant_id = :tenantId
				  AND mr.requester_user_id = :userId
				  AND mr.request_status = 'PENDING'
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", userId.toString())
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public void insert(MembershipRequest request) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO platform_membership_requests (
				    tenant_id, id, requester_user_id, request_status,
				    message, requested_at, created_at, updated_at, version
				) VALUES (
				    :tenantId, :id, :requesterUserId, :status,
				    :message, :requestedAt, :createdAt, :updatedAt, :version
				)
				""")
				.param("tenantId", request.tenantId().toString())
				.param("id", request.id().toString())
				.param("requesterUserId", request.requesterId().toString())
				.param("status", request.status().name())
				.param("message", request.message())
				.param("requestedAt", timestamp(request.requestedAt()))
				.param("createdAt", timestamp(request.requestedAt()))
				.param("updatedAt", timestamp(request.updatedAt()))
				.param("version", request.version())
				.update();
		requireSingleRow(affectedRows, "Membership request insert");
	}

	@Override
	public PageResult<MembershipRequestDetails> search(TenantId tenantId,
			MembershipRequestSearchQuery query) {
		long totalElements = jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_membership_requests mr
				WHERE mr.tenant_id = :tenantId
				  AND mr.request_status = :status
				""")
				.param("tenantId", tenantId.toString())
				.param("status", query.status().name())
				.query(Long.class)
				.single();

		List<MembershipRequestDetails> items = jdbcClient.sql(
				DETAILS_SELECT + """
				WHERE mr.tenant_id = :tenantId
				  AND mr.request_status = :status
				ORDER BY mr.requested_at DESC, mr.id DESC
				LIMIT :size OFFSET :offset
				""")
				.param("tenantId", tenantId.toString())
				.param("status", query.status().name())
				.param("size", query.pageQuery().size())
				.param("offset", query.pageQuery().offset())
				.query(JdbcMembershipRequestRepository::mapDetails)
				.list();

		return PageResult.of(items, query.pageQuery(), totalElements);
	}

	@Override
	public Optional<MembershipRequest> findByIdForUpdate(TenantId tenantId,
			MembershipRequestId requestId) {
		return jdbcClient.sql("""
				SELECT mr.tenant_id, mr.id, mr.requester_user_id,
				       mr.request_status, mr.message, mr.reviewed_by,
				       mr.review_note, mr.requested_at, mr.reviewed_at,
				       mr.updated_at, mr.version
				FROM platform_membership_requests mr
				WHERE mr.tenant_id = :tenantId
				  AND mr.id = :requestId
				FOR UPDATE
				""")
				.param("tenantId", tenantId.toString())
				.param("requestId", requestId.toString())
				.query(JdbcMembershipRequestRepository::mapRequest)
				.optional();
	}

	@Override
	public Optional<TenantMembershipState> findMembershipForUpdate(
			TenantId tenantId, ActorId userId) {
		return jdbcClient.sql("""
				SELECT m.membership_status, m.version
				FROM platform_tenant_memberships m
				WHERE m.tenant_id = :tenantId
				  AND m.user_id = :userId
				FOR UPDATE
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", userId.toString())
				.query((resultSet, rowNumber) -> new TenantMembershipState(
						TenantMembershipStatus.valueOf(
								resultSet.getString("membership_status")),
						resultSet.getLong("version")))
				.optional();
	}

	@Override
	public List<RoleReference> findAssignableRolesForUpdate(TenantId tenantId,
			List<UUID> roleIds) {
		if (roleIds.isEmpty()) {
			return List.of();
		}
		List<String> sortedRoleIds = roleIds.stream()
				.map(UUID::toString)
				.sorted()
				.toList();
		return jdbcClient.sql("""
				SELECT r.id, r.role_code, r.name
				FROM platform_roles r
				WHERE r.tenant_id = :tenantId
				  AND r.id IN (:roleIds)
				  AND r.status = 'ACTIVE'
				  AND r.deleted_at IS NULL
				  AND r.is_system = false
				ORDER BY r.id
				FOR UPDATE
				""")
				.param("tenantId", tenantId.toString())
				.param("roleIds", sortedRoleIds)
				.query((resultSet, rowNumber) -> new RoleReference(
						UUID.fromString(resultSet.getString("id")),
						resultSet.getString("role_code"),
						resultSet.getString("name")))
				.list();
	}

	@Override
	public void insertActiveMembership(TenantId tenantId, ActorId userId,
			ActorId reviewerId, Instant now) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO platform_tenant_memberships (
				    tenant_id, user_id, membership_status, joined_at, removed_at,
				    is_tenant_admin, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :userId, 'ACTIVE', :joinedAt, NULL,
				    false, :createdAt, :updatedAt,
				    :createdBy, :updatedBy, 1
				)
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", userId.toString())
				.param("joinedAt", timestamp(now))
				.param("createdAt", timestamp(now))
				.param("updatedAt", timestamp(now))
				.param("createdBy", reviewerId.toString())
				.param("updatedBy", reviewerId.toString())
				.update();
		requireSingleRow(affectedRows, "Tenant membership insert");
	}

	@Override
	public int reactivateRemovedMembership(TenantId tenantId, ActorId userId,
			ActorId reviewerId, Instant now) {
		return jdbcClient.sql("""
				UPDATE platform_tenant_memberships
				SET membership_status = 'ACTIVE',
				    joined_at = :joinedAt,
				    removed_at = NULL,
				    is_tenant_admin = false,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy
				WHERE tenant_id = :tenantId
				  AND user_id = :userId
				  AND membership_status = 'REMOVED'
				""")
				.param("joinedAt", timestamp(now))
				.param("updatedAt", timestamp(now))
				.param("updatedBy", reviewerId.toString())
				.param("tenantId", tenantId.toString())
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public void deleteRoleAssignments(TenantId tenantId, ActorId userId) {
		jdbcClient.sql("""
				DELETE FROM platform_user_roles
				WHERE tenant_id = :tenantId
				  AND user_id = :userId
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public void insertRoleAssignments(TenantId tenantId, ActorId userId,
			List<RoleReference> roles, ActorId reviewerId, Instant now) {
		List<RoleReference> sortedRoles = roles.stream()
				.sorted(Comparator.comparing(role -> role.id().toString()))
				.toList();
		for (RoleReference role : sortedRoles) {
			int affectedRows = jdbcClient.sql("""
					INSERT INTO platform_user_roles (
					    tenant_id, user_id, role_id, valid_from,
					    valid_to, assigned_by, created_at
					) VALUES (
					    :tenantId, :userId, :roleId, :validFrom,
					    NULL, :assignedBy, :createdAt
					)
					""")
					.param("tenantId", tenantId.toString())
					.param("userId", userId.toString())
					.param("roleId", role.id().toString())
					.param("validFrom", timestamp(now))
					.param("assignedBy", reviewerId.toString())
					.param("createdAt", timestamp(now))
					.update();
			requireSingleRow(affectedRows, "User role insert");
		}
	}

	@Override
	public int updateResolution(MembershipRequest request,
			long expectedVersion) {
		return jdbcClient.sql("""
				UPDATE platform_membership_requests
				SET request_status = :status,
				    reviewed_by = :reviewedBy,
				    review_note = :reviewNote,
				    reviewed_at = :reviewedAt,
				    updated_at = :updatedAt
				WHERE tenant_id = :tenantId
				  AND id = :requestId
				  AND version = :expectedVersion
				""")
				.param("status", request.status().name())
				.param("reviewedBy", actorId(request.reviewedBy()))
				.param("reviewNote", request.reviewNote())
				.param("reviewedAt", timestamp(request.reviewedAt()))
				.param("updatedAt", timestamp(request.updatedAt()))
				.param("tenantId", request.tenantId().toString())
				.param("requestId", request.id().toString())
				.param("expectedVersion", expectedVersion)
				.update();
	}

	@Override
	public Optional<MembershipRequestDetails> findDetails(TenantId tenantId,
			MembershipRequestId requestId) {
		return jdbcClient.sql(DETAILS_SELECT + """
				WHERE mr.tenant_id = :tenantId
				  AND mr.id = :requestId
				""")
				.param("tenantId", tenantId.toString())
				.param("requestId", requestId.toString())
				.query(JdbcMembershipRequestRepository::mapDetails)
				.optional();
	}

	@Override
	public Optional<ApprovedMembershipDetails> findApprovedMembership(
			TenantId tenantId, ActorId userId) {
		List<ApprovedMembershipRow> rows = jdbcClient.sql("""
				SELECT m.tenant_id, u.id AS user_id, u.email,
				       u.display_name AS user_display_name,
				       m.membership_status, m.is_tenant_admin,
				       m.joined_at, m.version AS membership_version,
				       r.id AS role_id, r.role_code, r.name AS role_name
				FROM platform_tenant_memberships m
				JOIN platform_users u ON u.id = m.user_id
				JOIN platform_user_roles ur
				  ON ur.tenant_id = m.tenant_id
				 AND ur.user_id = m.user_id
				JOIN platform_roles r
				  ON r.tenant_id = ur.tenant_id
				 AND r.id = ur.role_id
				WHERE m.tenant_id = :tenantId
				  AND m.user_id = :userId
				  AND m.membership_status = 'ACTIVE'
				  AND m.removed_at IS NULL
				  AND u.status = 'ACTIVE'
				  AND r.status = 'ACTIVE'
				  AND r.deleted_at IS NULL
				  AND ur.valid_from <= CURRENT_TIMESTAMP(6)
				  AND (ur.valid_to IS NULL
				       OR ur.valid_to > CURRENT_TIMESTAMP(6))
				ORDER BY r.role_code, r.id
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", userId.toString())
				.query(JdbcMembershipRequestRepository::mapApprovedMembershipRow)
				.list();
		if (rows.isEmpty()) {
			return Optional.empty();
		}

		ApprovedMembershipRow membership = rows.getFirst();
		List<RoleReference> roles = rows.stream()
				.map(ApprovedMembershipRow::role)
				.toList();
		return Optional.of(new ApprovedMembershipDetails(
				membership.tenantId(),
				membership.user(),
				membership.status(),
				membership.tenantAdmin(),
				membership.joinedAt(),
				roles,
				membership.version()));
	}

	private static MembershipRequest mapRequest(ResultSet resultSet,
			int rowNumber) throws SQLException {
		return MembershipRequest.rehydrate(
				TenantId.from(resultSet.getString("tenant_id")),
				MembershipRequestId.from(resultSet.getString("id")),
				ActorId.from(resultSet.getString("requester_user_id")),
				MembershipRequestStatus.valueOf(
						resultSet.getString("request_status")),
				resultSet.getString("message"),
				nullableActorId(resultSet.getString("reviewed_by")),
				resultSet.getString("review_note"),
				resultSet.getTimestamp("requested_at").toInstant(),
				nullableInstant(resultSet.getTimestamp("reviewed_at")),
				resultSet.getTimestamp("updated_at").toInstant(),
				resultSet.getLong("version"));
	}

	private static MembershipRequestDetails mapDetails(ResultSet resultSet,
			int rowNumber) throws SQLException {
		String reviewerId = resultSet.getString("reviewer_id");
		UserReference reviewer = reviewerId == null
				? null
				: new UserReference(
						ActorId.from(reviewerId),
						resultSet.getString("reviewer_email"),
						resultSet.getString("reviewer_display_name"));
		return new MembershipRequestDetails(
				MembershipRequestId.from(resultSet.getString("request_id")),
				new TenantReference(
						TenantId.from(resultSet.getString("tenant_id")),
						resultSet.getString("tenant_code"),
						resultSet.getString("tenant_display_name")),
				userReference(
						resultSet,
						"requester_id",
						"requester_email",
						"requester_display_name"),
				MembershipRequestStatus.valueOf(
						resultSet.getString("request_status")),
				resultSet.getString("message"),
				resultSet.getTimestamp("requested_at").toInstant(),
				reviewer,
				nullableInstant(resultSet.getTimestamp("reviewed_at")),
				resultSet.getString("review_note"),
				resultSet.getLong("version"));
	}

	private static ApprovedMembershipRow mapApprovedMembershipRow(
			ResultSet resultSet, int rowNumber) throws SQLException {
		return new ApprovedMembershipRow(
				TenantId.from(resultSet.getString("tenant_id")),
				new UserReference(
						ActorId.from(resultSet.getString("user_id")),
						resultSet.getString("email"),
						resultSet.getString("user_display_name")),
				TenantMembershipStatus.valueOf(
						resultSet.getString("membership_status")),
				resultSet.getBoolean("is_tenant_admin"),
				nullableInstant(resultSet.getTimestamp("joined_at")),
				new RoleReference(
						UUID.fromString(resultSet.getString("role_id")),
						resultSet.getString("role_code"),
						resultSet.getString("role_name")),
				resultSet.getLong("membership_version"));
	}

	private static UserReference userReference(ResultSet resultSet,
			String idColumn, String emailColumn, String displayNameColumn)
			throws SQLException {
		return new UserReference(
				ActorId.from(resultSet.getString(idColumn)),
				resultSet.getString(emailColumn),
				resultSet.getString(displayNameColumn));
	}

	private static ActorId nullableActorId(String value) {
		return value == null ? null : ActorId.from(value);
	}

	private static Instant nullableInstant(Timestamp value) {
		return value == null ? null : value.toInstant();
	}

	private static String actorId(ActorId value) {
		return value == null ? null : value.toString();
	}

	private static Timestamp timestamp(Instant value) {
		return value == null ? null : Timestamp.from(value);
	}

	private static void requireSingleRow(int affectedRows, String operation) {
		if (affectedRows != 1) {
			throw new IllegalStateException(
					operation + " must affect exactly one row");
		}
	}

	private record ApprovedMembershipRow(
			TenantId tenantId,
			UserReference user,
			TenantMembershipStatus status,
			boolean tenantAdmin,
			Instant joinedAt,
			RoleReference role,
			long version) {
	}

}
