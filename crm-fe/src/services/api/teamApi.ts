import { apiFetch } from './apiClient';

export interface TeamMember {
  userId: string;
  roleInTeam: string;
  isPrimary?: boolean;
  userDisplayName?: string;
  userEmail?: string;
  joinedAt?: string;
}

export interface TeamItem {
  id: string;
  teamCode?: string;
  code?: string;
  name: string;
  parentTeamId?: string | null;
  parentTeamName?: string | null;
  leaderId?: string;
  managerUserId?: string | null;
  leaderName?: string;
  description?: string;
  membersCount?: number;
  activeMembersCount?: number;
  members?: TeamMember[];
  active?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  version?: number;
}

export interface TeamStatsData {
  totalTeams: number;
  activeTeams: number;
  totalMembersAssigned: number;
  unassignedMembersCount: number;
  teamsWithManagersCount: number;
}

export interface TeamTreeNodeData {
  id: string;
  name: string;
  description?: string;
  parentTeamId?: string | null;
  managerUserId?: string | null;
  managerName?: string | null;
  status: string;
  memberCount: number;
  children: TeamTreeNodeData[];
}

export const teamApi = {
  /**
   * GET /api/teams/stats - Get KPI statistics
   */
  getTeamStats: async (): Promise<TeamStatsData> => {
    return apiFetch<TeamStatsData>('/teams/stats', { method: 'GET' });
  },

  /**
   * GET /api/teams/hierarchy - Get organizational tree
   */
  getHierarchy: async (): Promise<TeamTreeNodeData[]> => {
    return apiFetch<TeamTreeNodeData[]>('/teams/hierarchy', { method: 'GET' });
  },

  /**
   * GET /api/teams - List all teams
   */
  listTeams: async (params?: { search?: string }): Promise<TeamItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<any>(`/teams${qs}`);
    const items = Array.isArray(res) ? res : res.items || [];
    return items.map((t: any) => ({
      ...t,
      code: t.teamCode || t.code || '',
      leaderName: t.leaderName || (t.managerUserId ? 'Trưởng bộ phận' : 'Chưa bổ nhiệm'),
      membersCount: t.members ? t.members.length : (t.activeMembersCount || t.membersCount || 0),
      status: t.status || (t.active === false ? 'INACTIVE' : 'ACTIVE'),
    }));
  },

  /**
   * GET /api/teams/{id} - Get single team details
   */
  getTeam: async (id: string): Promise<TeamItem> => {
    const t = await apiFetch<any>(`/teams/${id}`);
    return {
      ...t,
      code: t.teamCode || t.code || '',
      leaderName: t.leaderName || (t.managerUserId ? 'Trưởng bộ phận' : 'Chưa bổ nhiệm'),
      membersCount: t.members ? t.members.length : 0,
      status: t.status || (t.active === false ? 'INACTIVE' : 'ACTIVE'),
    };
  },

  /**
   * POST /api/teams - Create department
   */
  createTeam: async (data: {
    name: string;
    description?: string;
    parentTeamId?: string | null;
    leaderId?: string;
  }): Promise<TeamItem> => {
    const isUuid = data.leaderId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.leaderId);
    const payload = {
      name: data.name,
      description: data.description,
      parentTeamId: data.parentTeamId || undefined,
      managerUserId: isUuid ? data.leaderId : undefined,
    };
    return apiFetch<TeamItem>('/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * PUT /api/teams/{id} - Update department
   */
  updateTeam: async (
    id: string,
    data: {
      version: number;
      name: string;
      description?: string;
      parentTeamId?: string | null;
      leaderId?: string;
      active?: boolean;
    }
  ): Promise<TeamItem> => {
    const isUuid = data.leaderId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.leaderId);
    const payload = {
      version: data.version || 1,
      name: data.name,
      description: data.description,
      parentTeamId: data.parentTeamId || undefined,
      managerUserId: isUuid ? data.leaderId : undefined,
    };
    return apiFetch<TeamItem>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * PATCH /api/teams/{id}/status - Toggle status
   */
  changeTeamStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<void> => {
    return apiFetch<void>(`/teams/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * POST /api/teams/{id}/transfer-manager - Reassign manager
   */
  transferManager: async (id: string, newManagerUserId: string): Promise<TeamItem> => {
    return apiFetch<TeamItem>(`/teams/${id}/transfer-manager`, {
      method: 'POST',
      body: JSON.stringify({ newManagerUserId }),
    });
  },

  /**
   * POST /api/teams/{id}/members/batch - Batch update members
   */
  batchUpdateMembers: async (
    id: string,
    data: {
      addMemberUserIds?: string[];
      removeMemberUserIds?: string[];
      defaultMemberRole?: string;
    }
  ): Promise<void> => {
    return apiFetch<void>(`/teams/${id}/members/batch`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/teams/{id} - Delete department
   */
  deleteTeam: async (id: string, version: number = 1): Promise<void> => {
    return apiFetch<void>(`/teams/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
