package com.crm.foundation.persistence;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.regex.Pattern;

import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.DataScopeType;
import com.crm.foundation.security.ResolvedDataScope;
import com.crm.sharedkernel.domain.ActorId;
import org.springframework.security.access.AccessDeniedException;

/**
 * Translates a resolved {@link AuthorizedDataAccess} into the SQL fragments that
 * restrict a query to the rows an actor may see.
 *
 * <p>The generated predicate only ever references the two ownership columns of the
 * target table, so it applies to any table that records ownership that way -
 * accounts, opportunities, activities, quotes and orders all qualify. The user
 * column is always {@code owner_user_id}; the team column defaults to
 * {@code owner_team_id} but may be overridden, because {@code crm_activities}
 * names it {@code assigned_team_id}.
 *
 * <p><strong>One scope per statement.</strong> {@link #cte()} emits a recursive CTE
 * under a fixed name. A single SQL statement must therefore carry at most one
 * scope; joining two differently scoped tables in one statement would emit the
 * same CTE name twice and fail.
 */
public final class OwnershipScopeSql {

	private static final Pattern SIMPLE_IDENTIFIER = Pattern.compile(
			"[A-Za-z][A-Za-z0-9_]*");

	/** Team ownership column used by every table except {@code crm_activities}. */
	public static final String DEFAULT_TEAM_COLUMN = "owner_team_id";

	private static final String TEAM_TREE_CTE = """
			WITH RECURSIVE authorized_owner_team_tree AS (
			    SELECT t.id
			    FROM platform_teams t
			    WHERE t.tenant_id = :tenantId
			      AND t.id IN (:scopeTreeRootIds)
			      AND t.status = 'ACTIVE'
			      AND t.deleted_at IS NULL
			    UNION ALL
			    SELECT child.id
			    FROM platform_teams child
			    JOIN authorized_owner_team_tree parent
			      ON child.parent_team_id = parent.id
			    WHERE child.tenant_id = :tenantId
			      AND child.status = 'ACTIVE'
			      AND child.deleted_at IS NULL
			)
			""";

	private final Set<DataScopeType> includedTypes;
	private final Set<String> directTeamIds;
	private final Set<String> treeRootIds;
	private final String cte;
	private final Map<String, Object> parameters;

	private OwnershipScopeSql(Set<DataScopeType> includedTypes,
			Set<String> directTeamIds, Set<String> treeRootIds,
			String actorId) {
		this.includedTypes = Set.copyOf(includedTypes);
		this.directTeamIds = Set.copyOf(directTeamIds);
		this.treeRootIds = Set.copyOf(treeRootIds);
		this.cte = includes(DataScopeType.TENANT) || treeRootIds.isEmpty()
				? "" : TEAM_TREE_CTE;

		Map<String, Object> resolvedParameters = new HashMap<>();
		if (!includes(DataScopeType.TENANT)) {
			if (includes(DataScopeType.OWN)) {
				resolvedParameters.put("scopeActorId", actorId);
			}
			if (!directTeamIds.isEmpty()) {
				resolvedParameters.put("scopeTeamIds", this.directTeamIds);
			}
			if (!treeRootIds.isEmpty()) {
				resolvedParameters.put("scopeTreeRootIds", this.treeRootIds);
			}
		}
		this.parameters = Map.copyOf(resolvedParameters);
	}

	public static OwnershipScopeSql resolve(ActorId actorId,
			AuthorizedDataAccess access) {
		Objects.requireNonNull(actorId, "actorId must not be null");
		Objects.requireNonNull(access, "access must not be null");

		Set<DataScopeType> includedTypes = EnumSet.noneOf(DataScopeType.class);
		Set<String> directTeamIds = new TreeSet<>();
		Set<String> treeRootIds = new TreeSet<>();
		for (ResolvedDataScope scope : access.scopes()) {
			if (scope.type() != null) {
				includedTypes.add(scope.type());
			}
			if (scope.teamId() == null) {
				continue;
			}
			if (scope.type() == DataScopeType.TEAM) {
				directTeamIds.add(scope.teamId().toString());
			} else if (scope.type() == DataScopeType.TEAM_TREE) {
				treeRootIds.add(scope.teamId().toString());
			}
		}

		if (!includedTypes.contains(DataScopeType.TENANT)
				&& !includedTypes.contains(DataScopeType.OWN)
				&& directTeamIds.isEmpty() && treeRootIds.isEmpty()) {
			throw new AccessDeniedException(
					"Authorized ownership data scope is unusable");
		}
		return new OwnershipScopeSql(includedTypes, directTeamIds, treeRootIds,
				actorId.toString());
	}

	public String cte() {
		return cte;
	}

	/**
	 * Builds the row-restricting predicate against the default team column.
	 */
	public String predicate(String alias) {
		return predicate(alias, DEFAULT_TEAM_COLUMN);
	}

	/**
	 * Builds the row-restricting predicate, naming the team ownership column
	 * explicitly for tables that do not call it {@code owner_team_id}.
	 *
	 * @param alias      table alias, or the empty string for an unaliased table
	 * @param teamColumn team ownership column name; must be a simple identifier
	 */
	public String predicate(String alias, String teamColumn) {
		validateIdentifier(alias, true);
		validateIdentifier(teamColumn, false);
		if (includes(DataScopeType.TENANT)) {
			return "1 = 1";
		}
		List<String> predicates = new ArrayList<>();
		if (includes(DataScopeType.OWN)) {
			predicates.add(column(alias, "owner_user_id")
					+ " = :scopeActorId");
		}
		if (!directTeamIds.isEmpty()) {
			predicates.add(column(alias, teamColumn)
					+ " IN (:scopeTeamIds)");
		}
		if (!treeRootIds.isEmpty()) {
			predicates.add(column(alias, teamColumn)
					+ " IN (SELECT id FROM authorized_owner_team_tree)");
		}
		if (predicates.isEmpty()) {
			throw new AccessDeniedException(
					"Authorized ownership data scope is unusable");
		}
		return String.join(" OR ", predicates);
	}

	public Map<String, Object> parameters() {
		return parameters;
	}

	public boolean includes(DataScopeType type) {
		return includedTypes.contains(Objects.requireNonNull(type,
				"type must not be null"));
	}

	public boolean directlyIncludesTeam(UUID teamId) {
		return directTeamIds.contains(Objects.requireNonNull(teamId,
				"teamId must not be null").toString());
	}

	public boolean hasTeamTree() {
		return !treeRootIds.isEmpty();
	}

	private static String column(String alias, String column) {
		return alias.isEmpty() ? column : alias + "." + column;
	}

	private static void validateIdentifier(String value, boolean emptyAllowed) {
		if (value == null
				|| (value.isEmpty() && !emptyAllowed)
				|| (!value.isEmpty()
						&& !SIMPLE_IDENTIFIER.matcher(value).matches())) {
			throw new IllegalArgumentException(
					"Scope identifier must be a simple identifier");
		}
	}

}
