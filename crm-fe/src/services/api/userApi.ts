import { apiFetch } from './apiClient';

export interface UserRoleItem {
  id: string;
  roleCode: string;
  name: string;
}

export interface UserTeamItem {
  id: string;
  name: string;
  memberRole?: string;
  isPrimary?: boolean;
}

export interface PlatformUserItem {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  jobTitle?: string;
  employeeReference?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'REMOVED';
  isTenantAdmin: boolean;
  roles: UserRoleItem[];
  primaryTeam?: UserTeamItem | null;
  joinedAt?: string;
  lastLoginAt?: string;
  version: number;
}

export interface PlatformUserDetails extends PlatformUserItem {
  teams: UserTeamItem[];
  permissionCodes: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface UserStatsData {
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  invitedMembers: number;
  tenantAdmins: number;
  pendingJoinRequests: number;
}

export interface UserSearchResponse {
  items: PlatformUserItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateUserData {
  email: string;
  displayName: string;
  phone?: string;
  jobTitle?: string;
  employeeReference?: string;
  roleIds?: string[];
  teamId?: string;
  isTenantAdmin?: boolean;
  sendInviteEmail?: boolean;
}

export interface UpdateUserData {
  displayName: string;
  phone?: string;
  jobTitle?: string;
  employeeReference?: string;
  primaryTeamId?: string;
  isTenantAdmin?: boolean;
  version: number;
}

export const userApi = {
  searchUsers: async (params?: {
    query?: string;
    status?: string;
    roleId?: string;
    teamId?: string;
    page?: number;
    size?: number;
  }): Promise<UserSearchResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
    if (params?.roleId && params.roleId !== 'ALL') searchParams.set('roleId', params.roleId);
    if (params?.teamId) searchParams.set('teamId', params.teamId);
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());

    const qs = searchParams.toString();
    const endpoint = `/platform/users${qs ? `?${qs}` : ''}`;
    return apiFetch<UserSearchResponse>(endpoint);
  },

  getUser: async (userId: string): Promise<PlatformUserDetails> => {
    return apiFetch<PlatformUserDetails>(`/platform/users/${userId}`);
  },

  getUserStats: async (): Promise<UserStatsData> => {
    return apiFetch<UserStatsData>('/platform/users/stats');
  },

  createUser: async (data: CreateUserData): Promise<PlatformUserDetails> => {
    return apiFetch<PlatformUserDetails>('/platform/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (userId: string, data: UpdateUserData): Promise<PlatformUserDetails> => {
    return apiFetch<PlatformUserDetails>(`/platform/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateUserRoles: async (userId: string, roleIds: string[]): Promise<void> => {
    return apiFetch<void>(`/platform/users/${userId}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roleIds }),
    });
  },

  changeUserStatus: async (
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'REMOVED'
  ): Promise<void> => {
    return apiFetch<void>(`/platform/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteUser: async (userId: string): Promise<void> => {
    return apiFetch<void>(`/platform/users/${userId}`, {
      method: 'DELETE',
    });
  },

  resendInvite: async (userId: string): Promise<void> => {
    return apiFetch<void>(`/platform/users/${userId}/resend-invite`, {
      method: 'POST',
    });
  },

  resetPassword: async (userId: string): Promise<void> => {
    return apiFetch<void>(`/platform/users/${userId}/reset-password`, {
      method: 'POST',
    });
  },

  revokeSessions: async (userId: string): Promise<void> => {
    return apiFetch<void>(`/platform/users/${userId}/revoke-sessions`, {
      method: 'POST',
    });
  },
};
