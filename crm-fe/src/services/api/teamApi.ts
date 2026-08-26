import { apiFetch } from './apiClient';

export interface TeamMember {
  userId: string;
  roleInTeam: string;
  joinedAt?: string;
}

export interface TeamItem {
  id: string;
  teamCode?: string;
  code?: string;
  name: string;
  leaderId?: string;
  leaderName?: string;
  description?: string;
  membersCount?: number;
  members?: TeamMember[];
  active?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  version?: number;
}

export interface TenantSettingsData {
  tenantName: string;
  taxCode: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  defaultCurrency: string;
  defaultTimezone: string;
  autoAssignLeads: boolean;
  enableAuditLog: boolean;
  enableTwoFactor: boolean;
}

export const teamApi = {
  listTeams: async (params?: { search?: string }): Promise<TeamItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<any>(`/platform/teams${qs}`);
    const items = Array.isArray(res) ? res : res.items || [];
    return items.map((t: any) => ({
      ...t,
      code: t.teamCode || t.code || '',
      leaderName: t.leaderName || 'Trưởng nhóm',
      membersCount: t.members ? t.members.length : (t.membersCount || 1),
      status: t.active === false ? 'INACTIVE' : 'ACTIVE',
    }));
  },

  getTeam: async (id: string): Promise<TeamItem> => {
    const t = await apiFetch<any>(`/platform/teams/${id}`);
    return {
      ...t,
      code: t.teamCode || t.code || '',
      leaderName: t.leaderName || 'Trưởng nhóm',
      membersCount: t.members ? t.members.length : 1,
      status: t.active === false ? 'INACTIVE' : 'ACTIVE',
    };
  },

  createTeam: async (data: { code?: string; name: string; description?: string; leaderId?: string }): Promise<TeamItem> => {
    const isUuid = data.leaderId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.leaderId);
    const payload = {
      name: data.name,
      description: data.description,
      managerUserId: isUuid ? data.leaderId : undefined,
    };
    return apiFetch<TeamItem>('/platform/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateTeam: async (id: string, data: { version: number; name: string; description?: string; leaderId?: string; active?: boolean }): Promise<TeamItem> => {
    const isUuid = data.leaderId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.leaderId);
    const payload = {
      version: data.version || 1,
      name: data.name,
      description: data.description,
      managerUserId: isUuid ? data.leaderId : undefined,
      status: data.active === false ? 'INACTIVE' : 'ACTIVE',
    };
    return apiFetch<TeamItem>(`/platform/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteTeam: async (id: string, version: number = 1): Promise<void> => {
    return apiFetch<void>(`/platform/teams/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  // Settings
  getSettings: async (): Promise<TenantSettingsData> => {
    const res = await apiFetch<any>('/platform/settings').catch(() => null);
    if (res) return res;
    return {
      tenantName: 'Công ty Cổ phần Công nghệ SmartCRM Việt Nam',
      taxCode: '0108998877',
      contactEmail: 'admin@smartcrm.vn',
      contactPhone: '1900 6868',
      address: 'Tầng 18, Keangnam Landmark 72, Đường Phạm Hùng, Nam Từ Liêm, Hà Nội',
      defaultCurrency: 'VND',
      defaultTimezone: 'Asia/Ho_Chi_Minh (GMT+7)',
      autoAssignLeads: true,
      enableAuditLog: true,
      enableTwoFactor: true,
    };
  },

  updateSettings: async (data: Partial<TenantSettingsData>): Promise<TenantSettingsData> => {
    const res = await apiFetch<any>('/platform/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }).catch(() => data);
    return res as TenantSettingsData;
  },
};
