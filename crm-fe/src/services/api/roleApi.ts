import { apiFetch } from './apiClient';

export interface PermissionResponse {
  permissionCode: string;
  description: string;
  moduleCode: string;
  riskLevel: 'NORMAL' | 'SENSITIVE' | 'PRIVILEGED';
  // Compatibility fields for legacy usage
  id?: string;
  code?: string;
  moduleGroup?: string;
  displayNameVi?: string;
  displayNameEn?: string;
  descriptionVi?: string;
}

export interface RoleDataScope {
  entityType: string;
  type: 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT';
  teamId?: string | null;
}

export interface RoleSummaryResponse {
  id: string;
  roleCode: string;
  name: string;
  description?: string;
  system: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  permissionCount: number;
  dataScopeCount: number;
  updatedAt: string;
  version: number;
  // Compatibility alias
  isSystem?: boolean;
}

export interface RoleDetailResponse {
  id: string;
  roleCode: string;
  name: string;
  description?: string;
  system: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  permissionCodes: string[];
  dataScopes: RoleDataScope[];
  createdAt: string;
  updatedAt: string;
  version: number;
  // Compatibility alias
  isSystem?: boolean;
  permissions?: PermissionResponse[];
}

export interface RoleStatsData {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  activeRoles: number;
  totalPermissionsCatalog: number;
  totalAssignedMembers: number;
}

export interface RoleMemberSummaryData {
  userId: string;
  email: string;
  displayName: string;
  jobTitle?: string;
  employeeReference?: string;
  assignedAt?: string;
  assignedBy?: string;
}

export interface RoleComparisonResultData {
  roles: Array<{ id: string; roleCode: string; name: string; system: boolean }>;
  commonPermissions: string[];
  permissionDifferences: Array<{
    permissionCode: string;
    description: string;
    moduleCode: string;
    riskLevel: string;
    grantedInRoleIds: string[];
  }>;
  dataScopeDifferences: Array<{
    entityType: string;
    scopesByRoleId: Record<string, string>;
  }>;
}

export interface RoleTemplateData {
  templateCode: string;
  name: string;
  description: string;
  recommendedFor: string;
  defaultPermissionCodes: string[];
  permissionCount: number;
}

export interface PermissionMatrixData {
  modules: Array<{
    moduleCode: string;
    moduleName: string;
    permissions: Array<{
      permissionCode: string;
      description: string;
      riskLevel: string;
    }>;
  }>;
  totalPermissions: number;
}

export interface CreateRoleRequest {
  roleCode: string;
  name: string;
  description?: string;
  permissionCodes: string[];
  dataScopes?: RoleDataScope[];
}

export interface UpdateRoleRequest {
  version: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissionCodes: string[];
  dataScopes?: RoleDataScope[];
}

export interface CloneRoleRequest {
  newRoleCode: string;
  newName: string;
  description?: string;
}

export const roleApi = {
  /**
   * GET /api/permissions - List system permission catalog
   */
  async getPermissions(): Promise<PermissionResponse[]> {
    return apiFetch<PermissionResponse[]>('/permissions', { method: 'GET' });
  },

  /**
   * GET /api/permissions/matrix - Get permissions grouped by module matrix
   */
  async getPermissionMatrix(): Promise<PermissionMatrixData> {
    return apiFetch<PermissionMatrixData>('/permissions/matrix', { method: 'GET' });
  },

  /**
   * GET /api/roles - Search & list roles
   */
  async getRoles(): Promise<RoleSummaryResponse[]> {
    return apiFetch<RoleSummaryResponse[]>('/roles', { method: 'GET' });
  },

  /**
   * GET /api/roles/stats - Get role governance KPIs
   */
  async getRoleStats(): Promise<RoleStatsData> {
    return apiFetch<RoleStatsData>('/roles/stats', { method: 'GET' });
  },

  /**
   * GET /api/roles/{id} - Get role details
   */
  async getRole(id: string): Promise<RoleDetailResponse> {
    return apiFetch<RoleDetailResponse>(`/roles/${id}`, { method: 'GET' });
  },

  /**
   * POST /api/roles - Create role
   */
  async createRole(data: CreateRoleRequest): Promise<RoleDetailResponse> {
    return apiFetch<RoleDetailResponse>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /api/roles/{id} - Update role
   */
  async updateRole(id: string, data: UpdateRoleRequest): Promise<RoleDetailResponse> {
    return apiFetch<RoleDetailResponse>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /api/roles/{id}/clone - Clone role
   */
  async cloneRole(id: string, data: CloneRoleRequest): Promise<RoleDetailResponse> {
    return apiFetch<RoleDetailResponse>(`/roles/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /api/roles/{id}/status - Toggle or change role status
   */
  async changeRoleStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<void> {
    return apiFetch<void>(`/roles/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * GET /api/roles/{id}/members - Get members assigned to this role
   */
  async getRoleMembers(id: string): Promise<RoleMemberSummaryData[]> {
    return apiFetch<RoleMemberSummaryData[]>(`/roles/${id}/members`, { method: 'GET' });
  },

  /**
   * POST /api/roles/{id}/members/reassign - Bulk reassign members to target role
   */
  async reassignRoleMembers(id: string, targetRoleId: string): Promise<void> {
    return apiFetch<void>(`/roles/${id}/members/reassign`, {
      method: 'POST',
      body: JSON.stringify({ targetRoleId }),
    });
  },

  /**
   * POST /api/roles/compare - Compare 2-4 roles side-by-side
   */
  async compareRoles(roleIds: string[]): Promise<RoleComparisonResultData> {
    return apiFetch<RoleComparisonResultData>('/roles/compare', {
      method: 'POST',
      body: JSON.stringify({ roleIds }),
    });
  },

  /**
   * GET /api/roles/templates - List built-in role templates
   */
  async getRoleTemplates(): Promise<RoleTemplateData[]> {
    return apiFetch<RoleTemplateData[]>('/roles/templates', { method: 'GET' });
  },

  /**
   * POST /api/roles/templates/{templateCode}/instantiate - Create role from template
   */
  async instantiateTemplate(
    templateCode: string,
    data?: { customRoleCode?: string; customName?: string }
  ): Promise<RoleDetailResponse> {
    return apiFetch<RoleDetailResponse>(`/roles/templates/${templateCode}/instantiate`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  /**
   * DELETE /api/roles/{id} - Delete custom role with ETag version verification
   */
  async deleteRole(id: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/roles/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
