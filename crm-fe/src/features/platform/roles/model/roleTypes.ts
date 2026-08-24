import {
  RoleDetailResponse,
  PermissionResponse,
  RoleDataScope,
} from '@/services/api/roleApi';

export type RoleEditorMode = 'view' | 'create' | 'edit' | 'clone';
export type RoleEditorStep = 'basics' | 'permissions' | 'scopes' | 'review';

export interface ExtendedPermission extends PermissionResponse {
  moduleNameVi?: string;
  moduleNameEn: string;
  actionName: string;
}

export interface RoleDraft {
  id?: string;
  roleCode: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  system: boolean;
  permissionCodes: string[];
  dataScopes: RoleDataScope[];
  version?: number;
  // Clone context
  cloneSourceName?: string;
}

export interface RoleFilterState {
  search: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  type: 'ALL' | 'SYSTEM' | 'CUSTOM';
  page: number;
  pageSize: number;
}

export interface CatalogueFilterState {
  search: string;
  module: string;
  risk: string;
  page: number;
  pageSize: number;
}

export interface ComparisonFilterState {
  leftRoleId: string;
  rightRoleId: string;
  search: string;
  module: string;
  onlyDifferences: boolean;
  page: number;
  pageSize: number;
}

export interface RoleDiffMetadata {
  nameChanged: boolean;
  oldName?: string;
  newName?: string;
  descriptionChanged: boolean;
  oldDescription?: string;
  newDescription?: string;
  statusChanged: boolean;
  oldStatus?: 'ACTIVE' | 'INACTIVE';
  newStatus?: 'ACTIVE' | 'INACTIVE';
}

export interface RoleDiffPermissions {
  added: string[];
  removed: string[];
  retained: string[];
  addedPrivileged: string[];
  addedSensitive: string[];
}

export interface RoleDiffScopes {
  added: RoleDataScope[];
  removed: RoleDataScope[];
  retained: RoleDataScope[];
  hasTenantExpansion: boolean;
  hasTeamTreeExpansion: boolean;
}

export interface RoleDiffResult {
  hasChanges: boolean;
  metadata: RoleDiffMetadata;
  permissions: RoleDiffPermissions;
  scopes: RoleDiffScopes;
  riskWarnings: string[];
}

export interface ComparisonPermissionRow {
  permissionCode: string;
  description: string;
  moduleCode: string;
  moduleNameEn: string;
  riskLevel: 'NORMAL' | 'SENSITIVE' | 'PRIVILEGED';
  inLeft: boolean;
  inRight: boolean;
  isDiff: boolean;
}

export interface ComparisonScopeRow {
  entityType: string;
  leftScope?: RoleDataScope;
  rightScope?: RoleDataScope;
  isDiff: boolean;
}

export interface RoleComparisonResult {
  leftRole: RoleDetailResponse;
  rightRole: RoleDetailResponse;
  permissions: ComparisonPermissionRow[];
  scopes: ComparisonScopeRow[];
  totalCommonPermissions: number;
  totalLeftOnlyPermissions: number;
  totalRightOnlyPermissions: number;
  totalCommonScopes: number;
  totalLeftOnlyScopes: number;
  totalRightOnlyScopes: number;
}

export interface RoleSummaryStats {
  totalRoles: number;
  activeRoles: number;
  customRoles: number;
  totalPermissions: number;
}
