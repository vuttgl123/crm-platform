import { apiFetch } from './apiClient';

export interface PermissionResponse {
  id?: string;
  permissionCode?: string;
  code?: string;
  description?: string;
  moduleCode?: string;
  moduleGroup?: string;
  displayNameVi?: string;
  displayNameEn?: string;
  descriptionVi?: string;
  riskLevel?: 'NORMAL' | 'SENSITIVE' | 'PRIVILEGED';
}

export interface RoleDataScopeRequest {
  entityType: string;
  type: 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT';
  teamId?: string;
}

export interface RoleSummaryResponse {
  id: string;
  roleCode: string;
  name: string;
  description?: string;
  isSystem: boolean;
  system?: boolean;
  permissionCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  version?: number;
}

export interface RoleDetailResponse {
  id: string;
  roleCode: string;
  name: string;
  description?: string;
  isSystem: boolean;
  system?: boolean;
  scopeType?: 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT';
  status: 'ACTIVE' | 'INACTIVE';
  permissions?: PermissionResponse[];
  permissionCodes?: string[];
  dataScopes?: RoleDataScopeRequest[];
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  roleCode: string;
  name: string;
  description?: string;
  scopeType?: 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT';
  permissionCodes: string[];
  dataScopes?: RoleDataScopeRequest[];
}

export interface UpdateRoleRequest {
  version: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissionCodes: string[];
  dataScopes?: RoleDataScopeRequest[];
}

export const roleApi = {
  /**
   * GET /api/permissions - List system permission catalog
   */
  async getPermissions(): Promise<PermissionResponse[]> {
    return apiFetch<PermissionResponse[]>('/permissions', { method: 'GET' });
  },

  /**
   * GET /api/roles - Search & list roles
   */
  async getRoles(): Promise<RoleSummaryResponse[]> {
    return apiFetch<RoleSummaryResponse[]>('/roles', { method: 'GET' });
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
   * DELETE /api/roles/{id} - Delete custom role
   */
  async deleteRole(id: string, version = 1): Promise<void> {
    return apiFetch<void>(`/roles/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
