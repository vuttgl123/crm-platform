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
