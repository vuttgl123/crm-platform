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
  PLANNING: { label: 'PLANNING', className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold' },
  ACTIVE: { label: 'ACTIVE', className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
  COMPLETED: { label: 'COMPLETED', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  CANCELLED: { label: 'CANCELLED', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
};

export const CAMPAIGN_TYPE_CONFIG: Record<CampaignType, { label: string; className: string }> = {
  EMAIL: { label: 'Email Marketing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  WEBINAR: { label: 'Webinar / Online Demo', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  EVENT: { label: 'Tradeshow / Conference', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  SOCIAL_ADS: { label: 'Social Advertising (LinkedIn)', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  DIRECT_MAIL: { label: 'Direct Account Outreach', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export interface DripStepDto {
  stepOrder: number;
  stepType: 'EMAIL' | 'SMS' | 'CREATE_TASK' | 'NOTIFICATION';
  name: string;
  delayDays: number;
  templateSubject?: string;
  templateBody?: string;
  actionTarget?: string;
}

export interface DripCampaignSummary {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  targetAudience: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  totalEnrolled: number;
  activeSubscribers: number;
  completedSubscribers: number;
  stepCount: number;
  steps?: DripStepDto[];
  createdAt: string;
}

export interface DripStepAnalytics {
  stepOrder: number;
  stepName: string;
  stepType: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  openRatePercent: number;
  clickRatePercent: number;
  conversionRatePercent: number;
}

export interface DripCampaignAnalyticsResponse {
  campaignId: string;
  campaignName: string;
  totalEnrolled: number;
  overallConversionRate: number;
  stepAnalytics: DripStepAnalytics[];
}

export interface MarketingTemplateSummary {
  id: string;
  name: string;
  channel: 'EMAIL' | 'SMS' | 'ZALO_ZNS' | 'IN_APP';
  category: 'WELCOME' | 'NURTURE' | 'PROMOTION' | 'RE_ENGAGEMENT' | 'EVENT';
  subject?: string;
  content: string;
  variables: string[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  usageCount: number;
  updatedAt: string;
}

export interface MarketingRoiSummary {
  totalBudget: number;
  totalActualSpend: number;
  totalExpectedRevenue: number;
  totalWonRevenue: number;
  totalPipelineValue: number;
  overallRoiPercent: number;
  totalCampaignsCount: number;
  activeCampaignsCount: number;
  totalLeadsGenerated: number;
  totalOpportunitiesCreated: number;
  totalDealsWon: number;
  costPerLead: number;
  customerAcquisitionCost: number;
}

export interface ChannelPerformance {
  channelType: string;
  channelNameVi: string;
  campaignsCount: number;
  spend: number;
  leadsCount: number;
  conversionsCount: number;
  wonRevenue: number;
  roiPercent: number;
  costPerLead: number;
}

export interface MarketingFunnelStage {
  stageOrder: number;
  stageKey: string;
  stageNameVi: string;
  count: number;
  totalValue: number;
  conversionRateFromPrevious: number;
  dropoffRate: number;
}

export interface MarketingAnalyticsResponse {
  summary: MarketingRoiSummary;
  channelPerformances: ChannelPerformance[];
  funnelStages: MarketingFunnelStage[];
}

export interface CampaignStatsDto {
  totalCampaigns: number;
  activeCampaigns: number;
  planningCampaigns: number;
  completedCampaigns: number;
  pausedCampaigns: number;
  totalBudgetedCost: number;
  totalActualCost: number;
  totalMembersCount: number;
}

export interface BulkAddCampaignMembersRequest {
  members: Array<{
    leadId?: string;
    contactId?: string;
    memberStatus?: 'SENT' | 'OPENED' | 'RESPONDED' | 'ATTENDED' | 'CONVERTED' | 'UNSUBSCRIBED';
  }>;
}

export interface BulkChangeCampaignStatusRequest {
  campaignIds: string[];
  status: CampaignStatus;
}

export const campaignApi = {
  getStats: async (): Promise<CampaignStatsDto> => {
    return apiFetch<CampaignStatsDto>('/campaigns/stats', {
      method: 'GET',
    });
  },

  list: async (params?: {
    search?: string;
    type?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: CampaignItem[]; items: CampaignItem[]; totalElements: number; totalPages: number; page: number; size: number }> => {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'ALL') query.set('type', params.type);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));
    if (params?.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<any>(`/marketing/campaigns${qs}`);

    const rawItems: any[] = Array.isArray(res) ? res : res.items || res.content || [];
    const content = rawItems.map((c) => ({
      ...c,
      budget: c.budgetAmount !== undefined ? c.budgetAmount : (c.budget || 0),
      actualCost: c.actualCost || 0,
      expectedRevenue: c.expectedRevenue || 0,
    }));

    return {
      content,
      items: content,
      totalElements: res.totalElements ?? content.length,
      totalPages: res.totalPages ?? 1,
      page: res.pageNumber ?? 0,
      size: res.pageSize ?? 10,
    };
  },

  get: async (id: string): Promise<CampaignItem> => {
    const c = await apiFetch<any>(`/marketing/campaigns/${id}`);
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
      campaignCode: `CAMP-${Date.now().toString().slice(-6)}`,
      name: data.name,
      campaignType: data.type,
      budget: data.budgetAmount !== undefined ? data.budgetAmount : (data.budget || 0),
      expectedRevenue: data.expectedRevenue || 0,
      startAt: data.startDate ? `${data.startDate}T00:00:00Z` : null,
      endAt: data.endDate ? `${data.endDate}T23:59:59Z` : null,
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
      campaignType: data.type,
      budget: data.budgetAmount !== undefined ? data.budgetAmount : (data.budget || 0),
      actualCost: data.actualCost || 0,
      expectedRevenue: data.expectedRevenue || 0,
      startAt: data.startDate ? `${data.startDate}T00:00:00Z` : null,
      endAt: data.endDate ? `${data.endDate}T23:59:59Z` : null,
      description: data.description,
    };
    return apiFetch<CampaignItem>(`/marketing/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  updateStatus: async (id: string, version: number, status: CampaignStatus): Promise<CampaignItem> => {
    return apiFetch<CampaignItem>(`/campaigns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  changeStatus: async (id: string, status: CampaignStatus): Promise<CampaignItem> => {
    return apiFetch<CampaignItem>(`/campaigns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  bulkAddMembers: async (id: string, data: BulkAddCampaignMembersRequest): Promise<{ addedCount: number }> => {
    return apiFetch<{ addedCount: number }>(`/campaigns/${id}/members/bulk`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  bulkChangeStatus: async (data: BulkChangeCampaignStatusRequest): Promise<{ updatedCount: number }> => {
    return apiFetch<{ updatedCount: number }>('/campaigns/bulk/status', {
      method: 'POST',
      body: JSON.stringify(data),
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

export const dripApi = {
  list: async (): Promise<DripCampaignSummary[]> => {
    return apiFetch<DripCampaignSummary[]>('/marketing/drip-campaigns');
  },

  get: async (id: string): Promise<DripCampaignSummary> => {
    return apiFetch<DripCampaignSummary>(`/marketing/drip-campaigns/${id}`);
  },

  create: async (data: {
    name: string;
    description: string;
    triggerEvent: string;
    targetAudience: string;
    steps?: DripStepDto[];
  }): Promise<DripCampaignSummary> => {
    return apiFetch<DripCampaignSummary>('/marketing/drip-campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: string): Promise<DripCampaignSummary> => {
    return apiFetch<DripCampaignSummary>(`/marketing/drip-campaigns/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/marketing/drip-campaigns/${id}`, {
      method: 'DELETE',
    });
  },

  enroll: async (id: string, subscriber: {
    subscriberType: string;
    subscriberName: string;
    email?: string;
    phone?: string;
  }): Promise<boolean> => {
    return apiFetch<boolean>(`/marketing/drip-campaigns/${id}/enroll`, {
      method: 'POST',
      body: JSON.stringify(subscriber),
    });
  },

  getAnalytics: async (id: string): Promise<DripCampaignAnalyticsResponse> => {
    return apiFetch<DripCampaignAnalyticsResponse>(`/marketing/drip-campaigns/${id}/analytics`);
  },
};

export const marketingTemplateApi = {
  list: async (params?: { channel?: string; category?: string }): Promise<MarketingTemplateSummary[]> => {
    const query = new URLSearchParams();
    if (params?.channel && params.channel !== 'ALL') query.set('channel', params.channel);
    if (params?.category && params.category !== 'ALL') query.set('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<MarketingTemplateSummary[]>(`/marketing/templates${qs}`);
  },

  get: async (id: string): Promise<MarketingTemplateSummary> => {
    return apiFetch<MarketingTemplateSummary>(`/marketing/templates/${id}`);
  },

  create: async (data: {
    name: string;
    channel: string;
    category?: string;
    subject?: string;
    content: string;
    variables?: string[];
    status?: string;
  }): Promise<MarketingTemplateSummary> => {
    return apiFetch<MarketingTemplateSummary>('/marketing/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: {
      name: string;
      channel: string;
      category?: string;
      subject?: string;
      content: string;
      variables?: string[];
      status?: string;
    }
  ): Promise<MarketingTemplateSummary> => {
    return apiFetch<MarketingTemplateSummary>(`/marketing/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/marketing/templates/${id}`, {
      method: 'DELETE',
    });
  },

  preview: async (data: {
    subject?: string;
    content: string;
    sampleData?: Record<string, string>;
  }): Promise<{ renderedSubject?: string; renderedContent: string }> => {
    return apiFetch<{ renderedSubject?: string; renderedContent: string }>('/marketing/templates/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const marketingAnalyticsApi = {
  getFull: async (): Promise<MarketingAnalyticsResponse> => {
    return apiFetch<MarketingAnalyticsResponse>('/marketing/analytics');
  },

  getRoiSummary: async (): Promise<MarketingRoiSummary> => {
    return apiFetch<MarketingRoiSummary>('/marketing/analytics/roi-summary');
  },

  getChannels: async (): Promise<ChannelPerformance[]> => {
    return apiFetch<ChannelPerformance[]>('/marketing/analytics/channels');
  },

  getFunnel: async (): Promise<MarketingFunnelStage[]> => {
    return apiFetch<MarketingFunnelStage[]>('/marketing/analytics/funnel');
  },
};
