export type CampaignStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type CampaignType = 'EMAIL' | 'WEBINAR' | 'EVENT' | 'SOCIAL_ADS' | 'DIRECT_MAIL';

export interface CampaignItem {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  actualCost: number;
  expectedRevenue: number;
  leadsGenerated: number;
  conversionsCount: number;
  assignedTo: string;
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

export const INITIAL_MOCK_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'cmp-001',
    name: 'Hội thảo Trực tuyến: Chuyển đổi số Bán hàng Doanh nghiệp B2B 2026',
    type: 'WEBINAR',
    status: 'ACTIVE',
    startDate: '2026-08-01',
    endDate: '2026-08-25',
    budget: 50000000,
    actualCost: 35000000,
    expectedRevenue: 850000000,
    leadsGenerated: 142,
    conversionsCount: 18,
    assignedTo: 'Trần Thị Mai',
  },
  {
    id: 'cmp-002',
    name: 'Chiến dịch Quảng cáo LinkedIn Lead Gen - Khối Tài chính Ngân hàng',
    type: 'SOCIAL_ADS',
    status: 'ACTIVE',
    startDate: '2026-08-10',
    endDate: '2026-09-10',
    budget: 80000000,
    actualCost: 28000000,
    expectedRevenue: 1500000000,
    leadsGenerated: 89,
    conversionsCount: 7,
    assignedTo: 'Phạm Tuấn Vũ',
  },
  {
    id: 'cmp-003',
    name: 'Email Nurturing: Bản tin cập nhật tính năng CRM Quý 3/2026',
    type: 'EMAIL',
    status: 'COMPLETED',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    budget: 15000000,
    actualCost: 12000000,
    expectedRevenue: 400000000,
    leadsGenerated: 54,
    conversionsCount: 12,
    assignedTo: 'Nguyễn Văn An',
  },
  {
    id: 'cmp-004',
    name: 'Gian hàng Triển lãm Công nghệ Quốc tế Vietnam ICT Expo 2026',
    type: 'EVENT',
    status: 'PLANNING',
    startDate: '2026-10-15',
    endDate: '2026-10-18',
    budget: 200000000,
    actualCost: 0,
    expectedRevenue: 3000000000,
    leadsGenerated: 0,
    conversionsCount: 0,
    assignedTo: 'Phạm Tuấn Vũ',
  },
];

let campaignsStore = [...INITIAL_MOCK_CAMPAIGNS];

export const mockMarketingApi = {
  list: async (params?: { search?: string; status?: string; type?: string; page?: number; size?: number }) => {
    let result = [...campaignsStore];
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.assignedTo.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== 'ALL') {
      result = result.filter((c) => c.status === params.status);
    }
    if (params?.type && params.type !== 'ALL') {
      result = result.filter((c) => c.type === params.type);
    }
    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = result.slice(page * size, (page + 1) * size);
    return { content, totalElements, totalPages, page, size };
  },

  create: async (data: Omit<CampaignItem, 'id'>) => {
    const newItem: CampaignItem = {
      ...data,
      id: `cmp-${Date.now().toString().slice(-4)}`,
    };
    campaignsStore.unshift(newItem);
    return newItem;
  },

  update: async (id: string, data: Partial<CampaignItem>) => {
    const index = campaignsStore.findIndex((c) => c.id === id);
    if (index !== -1) {
      campaignsStore[index] = { ...campaignsStore[index], ...data };
      return campaignsStore[index];
    }
    throw new Error('Campaign not found');
  },

  delete: async (id: string) => {
    campaignsStore = campaignsStore.filter((c) => c.id !== id);
    return true;
  },
};
