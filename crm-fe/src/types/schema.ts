/**
 * Database schema entity types corresponding strictly to:
 * - docs/crm_mysql80.sql
 * - docs/crm_mysql80_auth.sql
 */

export type DataScopeType = 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT';

export type TenantStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type UserStatus = 'INVITED' | 'ACTIVE' | 'LOCKED' | 'DISABLED';
export type MembershipStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
export type TeamStatus = 'ACTIVE' | 'INACTIVE';
export type RoleStatus = 'ACTIVE' | 'INACTIVE';
export type PermissionRiskLevel = 'NORMAL' | 'SENSITIVE' | 'PRIVILEGED';
export type IdentityProvider = 'GOOGLE' | 'MICROSOFT';
export type AuthEventType =
  | 'REGISTER'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'REFRESH'
  | 'LOGOUT'
  | 'SESSION_REVOKED'
  | 'EXTERNAL_IDENTITY_CREATED';

export interface PlatformTenant {
  id: string; // CHAR(36)
  tenant_code: string;
  legal_name: string;
  display_name: string;
  default_currency_code: string;
  default_country_code: string;
  default_language_code: string;
  default_timezone: string;
  data_region?: string;
  status: TenantStatus;
  plan_code?: string;
  retention_days?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PlatformUser {
  id: string; // CHAR(36)
  email: string;
  display_name: string;
  given_name?: string;
  family_name?: string;
  preferred_language_code?: string;
  external_subject?: string;
  identity_provider?: IdentityProvider | string;
  status: UserStatus;
  last_login_at?: string;
  email_verified_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PlatformTenantMembership {
  tenant_id: string;
  user_id: string;
  membership_status: MembershipStatus;
  employee_reference?: string;
  job_title?: string;
  locale?: string;
  timezone?: string;
  joined_at?: string;
  removed_at?: string;
  is_tenant_admin: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PlatformTeam {
  tenant_id: string;
  id: string;
  name: string;
  description?: string;
  parent_team_id?: string;
  manager_user_id?: string;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
}

export interface PlatformTeamMember {
  tenant_id: string;
  team_id: string;
  user_id: string;
  member_role?: string;
  is_primary: boolean;
  joined_at: string;
  left_at?: string;
}

export interface PlatformPermission {
  permission_code: string;
  description: string;
  module_code: string;
  risk_level: PermissionRiskLevel;
  created_at: string;
}

export interface PlatformRole {
  tenant_id: string;
  id: string;
  role_code: string;
  name: string;
  description?: string;
  is_system: boolean;
  status: RoleStatus;
  created_at: string;
  updated_at: string;
}

export interface PlatformRolePermission {
  tenant_id: string;
  role_id: string;
  permission_code: string;
  granted_at: string;
  granted_by?: string;
}

export interface PlatformRoleDataScope {
  tenant_id: string;
  id: string;
  role_id: string;
  entity_type: string;
  scope_type: DataScopeType;
  team_id?: string;
  created_at: string;
}

export interface PlatformAuthSession {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  rotation_counter: number;
  issued_at: string;
  expires_at: string;
  last_used_at?: string;
  revoked_at?: string;
  revoke_reason?: string;
}
