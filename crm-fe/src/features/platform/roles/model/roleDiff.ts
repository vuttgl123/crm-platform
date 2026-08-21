import {
  RoleDetailResponse,
  RoleDataScope,
} from '@/services/api/roleApi';
import {
  RoleDraft,
  RoleDiffResult,
  ExtendedPermission,
  RoleComparisonResult,
  ComparisonPermissionRow,
  ComparisonScopeRow,
} from './roleTypes';

export function computeRoleDiff(
  original: RoleDetailResponse | null,
  draft: RoleDraft,
  catalog: ExtendedPermission[] = []
): RoleDiffResult {
  const permMap = new Map<string, ExtendedPermission>();
  catalog.forEach((p) => permMap.set(p.permissionCode, p));

  const origPerms = new Set(original?.permissionCodes || []);
  const draftPerms = new Set(draft.permissionCodes || []);

  const addedPerms: string[] = [];
  const removedPerms: string[] = [];
  const retainedPerms: string[] = [];
  const addedPrivileged: string[] = [];
  const addedSensitive: string[] = [];

  draftPerms.forEach((code) => {
    if (!origPerms.has(code)) {
      addedPerms.push(code);
      const perm = permMap.get(code);
      if (perm?.riskLevel === 'PRIVILEGED') {
        addedPrivileged.push(code);
      } else if (perm?.riskLevel === 'SENSITIVE') {
        addedSensitive.push(code);
      }
    } else {
      retainedPerms.push(code);
    }
  });

  origPerms.forEach((code) => {
    if (!draftPerms.has(code)) {
      removedPerms.push(code);
    }
  });

  // Scopes Diff
  const origScopes = original?.dataScopes || [];
  const draftScopes = draft.dataScopes || [];

  const scopeKey = (s: RoleDataScope) => `${s.entityType}:${s.type}:${s.teamId || ''}`;
  const origScopeMap = new Map(origScopes.map((s) => [scopeKey(s), s]));
  const draftScopeMap = new Map(draftScopes.map((s) => [scopeKey(s), s]));

  const addedScopes: RoleDataScope[] = [];
  const removedScopes: RoleDataScope[] = [];
  const retainedScopes: RoleDataScope[] = [];

  let hasTenantExpansion = false;
  let hasTeamTreeExpansion = false;

  draftScopes.forEach((s) => {
    const k = scopeKey(s);
    if (!origScopeMap.has(k)) {
      addedScopes.push(s);
      if (s.type === 'TENANT') {
        hasTenantExpansion = true;
      }
      if (s.type === 'TEAM_TREE') {
        hasTeamTreeExpansion = true;
      }
    } else {
      retainedScopes.push(s);
    }
  });

  origScopes.forEach((s) => {
    const k = scopeKey(s);
    if (!draftScopeMap.has(k)) {
      removedScopes.push(s);
    }
  });

  // Metadata Diff
  const nameChanged = Boolean(original && original.name !== draft.name);
  const descriptionChanged = Boolean(original && (original.description || '') !== (draft.description || ''));
  const statusChanged = Boolean(original && original.status !== draft.status);

  const hasChanges =
    !original ||
    nameChanged ||
    descriptionChanged ||
    statusChanged ||
    addedPerms.length > 0 ||
    removedPerms.length > 0 ||
    addedScopes.length > 0 ||
    removedScopes.length > 0;

  // Risk warnings
  const riskWarnings: string[] = [];

  if (draft.status === 'INACTIVE' && original?.status === 'ACTIVE') {
    riskWarnings.push('Deactivating this role will immediately revoke active access for all assigned users upon their next request.');
  }

  if (addedPrivileged.length > 0) {
    riskWarnings.push(`Granting ${addedPrivileged.length} privileged security permission(s) with administrative impact.`);
  }

  if (hasTenantExpansion) {
    riskWarnings.push('Tenant-wide data scoping grants full visibility across all organizational units and branches.');
  }

  if (hasTeamTreeExpansion) {
    riskWarnings.push('Team-Tree scoping enables recursive access down the entire reporting hierarchy.');
  }

  return {
    hasChanges,
    metadata: {
      nameChanged,
      oldName: original?.name,
      newName: draft.name,
      descriptionChanged,
      oldDescription: original?.description,
      newDescription: draft.description,
      statusChanged,
      oldStatus: original?.status,
      newStatus: draft.status,
    },
    permissions: {
      added: addedPerms,
      removed: removedPerms,
      retained: retainedPerms,
      addedPrivileged,
      addedSensitive,
    },
    scopes: {
      added: addedScopes,
      removed: removedScopes,
      retained: retainedScopes,
      hasTenantExpansion,
      hasTeamTreeExpansion,
    },
    riskWarnings,
  };
}

export function computeRoleComparison(
  leftRole: RoleDetailResponse,
  rightRole: RoleDetailResponse,
  catalog: ExtendedPermission[] = []
): RoleComparisonResult {
  const leftPerms = new Set(leftRole.permissionCodes || []);
  const rightPerms = new Set(rightRole.permissionCodes || []);

  const permMap = new Map<string, ExtendedPermission>();
  catalog.forEach((p) => permMap.set(p.permissionCode, p));

  // Build union of all known permissions in catalog + any present in roles
  const allCodes = new Set([
    ...catalog.map((p) => p.permissionCode),
    ...Array.from(leftPerms),
    ...Array.from(rightPerms),
  ]);

  let totalCommonPermissions = 0;
  let totalLeftOnlyPermissions = 0;
  let totalRightOnlyPermissions = 0;

  const permissions: ComparisonPermissionRow[] = [];

  allCodes.forEach((code) => {
    const inLeft = leftPerms.has(code);
    const inRight = rightPerms.has(code);

    if (inLeft || inRight) {
      const isDiff = inLeft !== inRight;
      if (inLeft && inRight) totalCommonPermissions++;
      else if (inLeft && !inRight) totalLeftOnlyPermissions++;
      else if (!inLeft && inRight) totalRightOnlyPermissions++;

      const perm = permMap.get(code);
      permissions.push({
        permissionCode: code,
        description: perm?.description || code,
        moduleCode: perm?.moduleCode || 'other',
        moduleNameEn: perm?.moduleNameEn || 'System',
        riskLevel: perm?.riskLevel || 'NORMAL',
        inLeft,
        inRight,
        isDiff,
      });
    }
  });

  // Sort permissions by module then code
  permissions.sort((a, b) => {
    if (a.moduleCode !== b.moduleCode) return a.moduleCode.localeCompare(b.moduleCode);
    return a.permissionCode.localeCompare(b.permissionCode);
  });

  // Scopes comparison
  const leftScopes = leftRole.dataScopes || [];
  const rightScopes = rightRole.dataScopes || [];

  const leftScopeMap = new Map(leftScopes.map((s) => [s.entityType, s]));
  const rightScopeMap = new Map(rightScopes.map((s) => [s.entityType, s]));

  const allEntities = Array.from(
    new Set([...leftScopes.map((s) => s.entityType), ...rightScopes.map((s) => s.entityType)])
  ).sort();

  let totalCommonScopes = 0;
  let totalLeftOnlyScopes = 0;
  let totalRightOnlyScopes = 0;

  const scopes: ComparisonScopeRow[] = [];

  allEntities.forEach((entityType) => {
    const leftScope = leftScopeMap.get(entityType);
    const rightScope = rightScopeMap.get(entityType);

    const isDiff =
      !leftScope ||
      !rightScope ||
      leftScope.type !== rightScope.type ||
      leftScope.teamId !== rightScope.teamId;

    if (leftScope && rightScope && !isDiff) totalCommonScopes++;
    else if (leftScope && !rightScope) totalLeftOnlyScopes++;
    else if (!leftScope && rightScope) totalRightOnlyScopes++;

    scopes.push({
      entityType,
      leftScope,
      rightScope,
      isDiff,
    });
  });

  return {
    leftRole,
    rightRole,
    permissions,
    scopes,
    totalCommonPermissions,
    totalLeftOnlyPermissions,
    totalRightOnlyPermissions,
    totalCommonScopes,
    totalLeftOnlyScopes,
    totalRightOnlyScopes,
  };
}
