package com.crm.customer.infrastructure.persistence;

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

public final class AccountScopeSql {

	private static final Pattern SIMPLE_ALIAS = Pattern.compile(
			"[A-Za-z][A-Za-z0-9_]*");

	private static final String TEAM_TREE_CTE = """
			WITH RECURSIVE authorized_account_team_tree AS (
			    SELECT t.id
			    FROM platform_teams t
			    WHERE t.tenant_id = :tenantId
			      AND t.id IN (:scopeTreeRootIds)
			      AND t.status = 'ACTIVE'
			      AND t.deleted_at IS NULL
			    UNION ALL
			    SELECT child.id
			    FROM platform_teams child
			    JOIN authorized_account_team_tree parent
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

	private AccountScopeSql(Set<DataScopeType> includedTypes,
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

	public static AccountScopeSql resolve(ActorId actorId,
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
					"Authorized Account data scope is unusable");
		}
		return new AccountScopeSql(includedTypes, directTeamIds, treeRootIds,
				actorId.toString());
	}

	public String cte() {
		return cte;
	}

	public String predicate(String alias) {
		validateAlias(alias);
		if (includes(DataScopeType.TENANT)) {
			return "1 = 1";
		}
		List<String> predicates = new ArrayList<>();
		if (includes(DataScopeType.OWN)) {
			predicates.add(column(alias, "owner_user_id")
					+ " = :scopeActorId");
		}
		if (!directTeamIds.isEmpty()) {
			predicates.add(column(alias, "owner_team_id")
					+ " IN (:scopeTeamIds)");
		}
		if (!treeRootIds.isEmpty()) {
			predicates.add(column(alias, "owner_team_id")
					+ " IN (SELECT id FROM authorized_account_team_tree)");
		}
		if (predicates.isEmpty()) {
			throw new AccessDeniedException(
					"Authorized Account data scope is unusable");
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

	private static void validateAlias(String alias) {
		if (alias == null || (!alias.isEmpty()
				&& !SIMPLE_ALIAS.matcher(alias).matches())) {
			throw new IllegalArgumentException(
					"Scope alias must be empty or a simple identifier");
		}
	}

}
