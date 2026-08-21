import { DataScopeType } from '@/types/schema';
import { UserSessionContext } from '@/types/auth';
import { AppRouteManifestItem, NavigationAccessRule } from '@/types/navigation';
import { KnownPermissionCode } from './constants';

export interface EntityRecordContext {
  tenant_id: string;
  created_by?: string;
  owner_user_id?: string;
  assigned_user_id?: string;
  team_id?: string;
}

export function isTenantAdminSession(session: UserSessionContext | null): boolean {
  return Boolean(
    session?.membership?.is_tenant_admin ||
      session?.activeRole?.role_code === 'TENANT_ADMIN' ||
      session?.activeRole?.role_code === 'ADMIN'
  );
}

export function canAccessRule(
  rule: NavigationAccessRule,
  session: UserSessionContext | null
): boolean {
  if (!session) return false;
  if (isTenantAdminSession(session)) return true;
  if (rule.kind === 'authenticated') return true;
  if (rule.kind === 'tenant-admin') return false;
  if (rule.kind === 'permission') return session.grantedPermissions.includes(rule.code);
  return rule.codes.some((code) => session.grantedPermissions.includes(code));
}

/**
 * Checks if the active user session has a specific known permission code.
 */
export function can(permissionCode: KnownPermissionCode | string, session: UserSessionContext | null): boolean {
  if (!session) return false;
  if (isTenantAdminSession(session)) return true;
  return session.grantedPermissions.includes(permissionCode);
}

/**
 * Single evaluation entry point for navigation items and routes.
 */
export function canAccessRoute(navItem: AppRouteManifestItem, session: UserSessionContext | null): boolean {
  return canAccessRule(navItem.access, session);
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
  if (isTenantAdminSession(session)) {
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
