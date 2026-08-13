import { DataScopeType } from '@/types/schema';
import { UserSessionContext } from '@/types/auth';
import { NavigationItem } from '@/types/navigation';
import { CRM_READ_PERMISSIONS, SeededPermissionCode } from './constants';

export interface EntityRecordContext {
  tenant_id: string;
  created_by?: string;
  owner_user_id?: string;
  assigned_user_id?: string;
  team_id?: string;
}

/**
 * Checks if the active user session has a specific seeded permission code.
 */
export function can(permissionCode: SeededPermissionCode | string, session: UserSessionContext | null): boolean {
  if (!session) return false;
  if (
    session.membership?.is_tenant_admin ||
    session.activeRole?.role_code === 'TENANT_ADMIN' ||
    session.activeRole?.role_code === 'ADMIN'
  ) {
    return true;
  }
  return session.grantedPermissions.includes(permissionCode);
}

/**
 * Single evaluation entry point for navigation items and routes.
 */
export function canAccessRoute(navItem: NavigationItem, session: UserSessionContext | null): boolean {
  if (!session) return false;

  const isTenantAdmin =
    session.membership?.is_tenant_admin ||
    session.activeRole?.role_code === 'TENANT_ADMIN' ||
    session.activeRole?.role_code === 'ADMIN';

  // Unseeded modules (catalog, marketing, integration) require tenant admin
  if (navItem.requiresTenantAdmin) {
    return isTenantAdmin;
  }

  // Activity requires at least one CRM read permission
  if (navItem.requiresAnyCrmReadPermission) {
    if (isTenantAdmin) return true;
    return CRM_READ_PERMISSIONS.some((code) => session.grantedPermissions.includes(code));
  }

  // Specific seeded permission check
  if (navItem.requiredPermission) {
    return can(navItem.requiredPermission, session);
  }

  return true;
}

/**
 * Evaluates record-level data scope access: TENANT, TEAM_TREE, TEAM, OWN.
 * Prevents cross-tenant access unconditionally.
 */
export function canAccessEntity(
  recordContext: EntityRecordContext,
  session: UserSessionContext | null,
  childTeamIds: string[] = []
): boolean {
  if (!session) return false;

  // 1. Strict Tenant Isolation
  if (recordContext.tenant_id !== session.tenant.id) {
    return false;
  }

  // Tenant Admin override
  if (session.membership.is_tenant_admin) {
    return true;
  }

  const scope: DataScopeType = session.effectiveScopeType;

  switch (scope) {
    case 'TENANT':
      return true;

    case 'TEAM_TREE': {
      if (!session.assignedTeam) return false;
      if (!recordContext.team_id) return false;
      const validTeamIds = [session.assignedTeam.id, ...childTeamIds];
      return validTeamIds.includes(recordContext.team_id);
    }

    case 'TEAM': {
      if (!session.assignedTeam) return false;
      if (!recordContext.team_id) return false;
      return recordContext.team_id === session.assignedTeam.id;
    }

    case 'OWN': {
      const currentUserId = session.user.id;
      return (
        recordContext.created_by === currentUserId ||
        recordContext.owner_user_id === currentUserId ||
        recordContext.assigned_user_id === currentUserId
      );
    }

    default:
      return false;
  }
}
