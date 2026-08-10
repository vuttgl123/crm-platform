import {
  DataScopeType,
  IdentityProvider,
  PlatformRole,
  PlatformTeam,
  PlatformTenant,
  PlatformTenantMembership,
  PlatformUser,
} from './schema';

export type DemoRoleCode = 'ADMIN' | 'REGIONAL_MANAGER' | 'TEAM_LEADER' | 'SALES_STAFF' | 'VIEWER';

export interface DemoRoleDefinition {
  code: DemoRoleCode;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  scopeType: DataScopeType;
  isTenantAdmin: boolean;
  permissions: string[];
  userEmail: string;
}

export interface UserSessionContext {
  user: PlatformUser;
  tenant: PlatformTenant;
  membership: PlatformTenantMembership;
  activeRole: PlatformRole;
  activeScope: DataScopeType;
  assignedTeam?: PlatformTeam;
  grantedPermissions: string[];
  effectiveScopeType: DataScopeType;
  sessionToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SSOLoginPayload {
  provider: IdentityProvider; // 'GOOGLE' | 'MICROSOFT'
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthState {
  session: UserSessionContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isExpired: boolean;
  error: string | null;
}
