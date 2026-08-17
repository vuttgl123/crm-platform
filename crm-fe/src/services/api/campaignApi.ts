import { apiFetch } from './apiClient';

export type CampaignStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type CampaignType = 'EMAIL' | 'WEBINAR' | 'EVENT' | 'SOCIAL_ADS' | 'DIRECT_MAIL';

export interface CampaignItem {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  budgetAmount?: number;
  actualCost?: number;
  expectedRevenue?: number;
  leadsGenerated?: number;
  conversionsCount?: number;
  assignedTo?: string;
  description?: string;
  active?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignPageResult {
  items: CampaignItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string }> = {
  PLANNING: { label: 'Đang lên kế hoạch', className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold' },
  ACTIVE: { label: 'Đang chạy chiến dịch', className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
  COMPLETED: { label: 'Đã hoàn thành', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  CANCELLED: { label: 'Đã hủy bỏ', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
};

export const CAMPAIGN_TYPE_CONFIG: Record<CampaignType, { label: string; className: string }> = {
  EMAIL: { label: 'Email Marketing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  WEBINAR: { label: 'Hội thảo Trực tuyến (Webinar)', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  EVENT: { label: 'Triển lãm / Sự kiện Offline', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  SOCIAL_ADS: { label: 'Quảng cáo MXH (Meta / LinkedIn)', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  DIRECT_MAIL: { label: 'Thư ngỏ / Tài liệu trực tiếp', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const campaignApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: CampaignItem[]; totalElements: number; totalPages: number; page: number; size: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.type && params.type !== 'ALL') query.set('type', params.type);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<CampaignPageResult | CampaignItem[]>(`/marketing/campaigns${qs}`);

    const normalize = (c: CampaignItem): CampaignItem => ({
      ...c,
      budget: c.budgetAmount !== undefined ? c.budgetAmount : (c.budget || 0),
      actualCost: c.actualCost || 0,
      expectedRevenue: c.expectedRevenue || 0,
      leadsGenerated: c.leadsGenerated || 0,
      conversionsCount: c.conversionsCount || 0,
      assignedTo: c.assignedTo || 'Chưa phân công',
    });

    if (Array.isArray(res)) {
      const content = res.map(normalize);
      return { content, totalElements: content.length, totalPages: 1, page: 0, size: content.length };
    }

    const content = (res.items || []).map(normalize);
    return {
      content,
      totalElements: res.totalElements || 0,
      totalPages: res.totalPages || 1,
      page: (res.pageNumber || 1) - 1,
      size: res.pageSize || 10,
    };
  },

  get: async (id: string): Promise<CampaignItem> => {
    const c = await apiFetch<CampaignItem>(`/marketing/campaigns/${id}`);
    return {
      ...c,
      budget: c.budgetAmount !== undefined ? c.budgetAmount : (c.budget || 0),
      actualCost: c.actualCost || 0,
      expectedRevenue: c.expectedRevenue || 0,
    };
  },

  create: async (data: {
    name: string;
    type: CampaignType;
    budget?: number;
    budgetAmount?: number;
    expectedRevenue?: number;
    startDate?: string;
    endDate?: string;
    description?: string;
  }): Promise<CampaignItem> => {
    const payload = {
      name: data.name,
      type: data.type,
      budget: data.budgetAmount !== undefined ? data.budgetAmount : (data.budget || 0),
      expectedRevenue: data.expectedRevenue || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
    };
    return apiFetch<CampaignItem>('/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: async (
    id: string,
    data: Partial<CampaignItem> & { version?: number }
  ): Promise<CampaignItem> => {
    const payload = {
      version: data.version || 1,
      name: data.name,
      type: data.type,
      budget: data.budgetAmount !== undefined ? data.budgetAmount : (data.budget || 0),
      actualCost: data.actualCost || 0,
      expectedRevenue: data.expectedRevenue || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      active: data.active !== undefined ? data.active : true,
    };
    return apiFetch<CampaignItem>(`/marketing/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  updateStatus: async (id: string, version: number, status: CampaignStatus): Promise<CampaignItem> => {
    return apiFetch<CampaignItem>(`/marketing/campaigns/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ version, status }),
    });
  },

  delete: async (id: string, version: number = 1): Promise<void> => {
    return apiFetch<void>(`/marketing/campaigns/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
