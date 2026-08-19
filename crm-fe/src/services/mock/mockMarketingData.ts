import {
  CampaignItem,
  CampaignStatus,
  CampaignType,
  CAMPAIGN_STATUS_CONFIG,
  CAMPAIGN_TYPE_CONFIG,
  DripCampaignSummary,
  MarketingTemplateSummary,
} from '../api/campaignApi';

export {
  CAMPAIGN_STATUS_CONFIG,
  CAMPAIGN_TYPE_CONFIG,
};
export type { CampaignItem, CampaignStatus, CampaignType, DripCampaignSummary, MarketingTemplateSummary };

export const INITIAL_MOCK_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'cmp-001',
    name: 'Hội thảo Trực tuyến: Chuyển đổi số Bán hàng Doanh nghiệp B2B 2026',
    type: 'WEBINAR',
    status: 'ACTIVE',
    startDate: '2026-08-01',
    endDate: '2026-08-25',
    budget: 50000000,
    budgetAmount: 50000000,
    actualCost: 35000000,
    expectedRevenue: 850000000,
    leadsGenerated: 142,
    conversionsCount: 18,
    assignedTo: 'Trần Thị Mai',
    description: 'Webinar chuyên sâu dành cho C-level & Sales Directors khối doanh nghiệp B2B',
  },
  {
    id: 'cmp-002',
    name: 'Chiến dịch Quảng cáo LinkedIn Lead Gen - Khối Tài chính Ngân hàng',
    type: 'SOCIAL_ADS',
    status: 'ACTIVE',
    startDate: '2026-08-10',
    endDate: '2026-09-10',
    budget: 80000000,
    budgetAmount: 80000000,
    actualCost: 28000000,
    expectedRevenue: 1500000000,
    leadsGenerated: 89,
    conversionsCount: 7,
    assignedTo: 'Phạm Tuấn Vũ',
    description: 'Chạy quảng cáo Lead gen forms targeting IT Directors, CFOs',
  },
  {
    id: 'cmp-003',
    name: 'Email Nurturing: Bản tin cập nhật tính năng CRM Quý 3/2026',
    type: 'EMAIL',
    status: 'COMPLETED',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    budget: 15000000,
    budgetAmount: 15000000,
    actualCost: 12000000,
    expectedRevenue: 400000000,
    leadsGenerated: 54,
    conversionsCount: 12,
    assignedTo: 'Nguyễn Văn An',
    description: 'Gửi chuỗi bài viết tối ưu năng suất và giới thiệu tính năng AI Lead Scoring',
  },
  {
    id: 'cmp-004',
    name: 'Gian hàng Triển lãm Công nghệ Quốc tế Vietnam ICT Expo 2026',
    type: 'EVENT',
    status: 'PLANNING',
    startDate: '2026-10-15',
    endDate: '2026-10-18',
    budget: 200000000,
    budgetAmount: 200000000,
    actualCost: 0,
    expectedRevenue: 3000000000,
    leadsGenerated: 0,
    conversionsCount: 0,
    assignedTo: 'Phạm Tuấn Vũ',
    description: 'Triển lãm công nghệ tại SECC Q7 với 500+ khách tham quan tiềm năng',
  },
];

export const INITIAL_MOCK_DRIP_CAMPAIGNS: DripCampaignSummary[] = [
  {
    id: '77000000-0000-0000-0000-000000000001',
    name: 'Chuỗi Nuôi dưỡng Khách hàng Tiềm năng Mới (New Lead Welcome Sequence)',
    description: 'Tự động gửi email giới thiệu hệ sinh thái, sau 2 ngày gửi SMS Demo và tạo lịch gọi tư vấn.',
    triggerEvent: 'LEAD_CREATED',
    targetAudience: 'ALL_LEADS',
    status: 'ACTIVE',
    totalEnrolled: 128,
    activeSubscribers: 42,
    completedSubscribers: 86,
    stepCount: 4,
    steps: [
      { stepOrder: 1, stepType: 'EMAIL', name: 'Email Chào mừng & Hồ sơ Năng lực Doanh nghiệp', delayDays: 0, templateSubject: 'Chào mừng quý khách đến với CRM Cloud' },
      { stepOrder: 2, stepType: 'SMS', name: 'SMS Nhắc nhở Đăng ký Trải nghiệm Demo Trực tuyến', delayDays: 2 },
      { stepOrder: 3, stepType: 'EMAIL', name: 'Email Chia sẻ Case Study Doanh nghiệp Cùng Ngành', delayDays: 4, templateSubject: 'Case study doanh nghiệp tối ưu 35% chi phí' },
      { stepOrder: 4, stepType: 'CREATE_TASK', name: 'Tự động Phân công Sales Gọi Tư vấn Báo giá', delayDays: 6, actionTarget: 'SALES_REP' }
    ],
    createdAt: '2026-08-10 09:00:00',
  },
  {
    id: '77000000-0000-0000-0000-000000000002',
    name: 'Chuỗi Kích hoạt Sau Ký kết Hợp đồng (Customer Onboarding Journey)',
    description: 'Kịch bản hướng dẫn triển khai phần mềm, đào tạo nhân sự và kích hoạt bảo hành 12 tháng.',
    triggerEvent: 'CONTRACT_SIGNED',
    targetAudience: 'EXISTING_CUSTOMERS',
    status: 'ACTIVE',
    totalEnrolled: 64,
    activeSubscribers: 18,
    completedSubscribers: 46,
    stepCount: 3,
    steps: [
      { stepOrder: 1, stepType: 'EMAIL', name: 'Thư Cảm ơn & Hướng dẫn Khởi tạo Tài khoản Admin', delayDays: 0 },
      { stepOrder: 2, stepType: 'EMAIL', name: 'Lịch Đào tạo Trực tuyến & Tài liệu Hướng dẫn', delayDays: 3 },
      { stepOrder: 3, stepType: 'CREATE_TASK', name: 'Kiểm tra Mức độ Hài lòng Sau 14 Ngày', delayDays: 14 }
    ],
    createdAt: '2026-08-12 14:30:00',
  },
  {
    id: '77000000-0000-0000-0000-000000000003',
    name: 'Chuỗi Chăm sóc Lại Lead Thất bại / Tạm dừng (Re-engagement Sequence)',
    description: 'Tự động kích hoạt sau khi Lead bị chuyển trạng thái Unqualified hoặc Cơ hội Lost quá 30 ngày.',
    triggerEvent: 'DEAL_LOST',
    targetAudience: 'LOST_LEADS',
    status: 'ACTIVE',
    totalEnrolled: 92,
    activeSubscribers: 31,
    completedSubscribers: 61,
    stepCount: 3,
    steps: [
      { stepOrder: 1, stepType: 'EMAIL', name: 'Khảo sát Lý do Chưa phù hợp & Nhận Góp ý', delayDays: 7 },
      { stepOrder: 2, stepType: 'EMAIL', name: 'Gửi Mã Ưu đãi Đặc quyền Mùa Chuyển đổi số 2026', delayDays: 21 },
      { stepOrder: 3, stepType: 'SMS', name: 'SMS Thông báo Tính năng Mới vừa Cập nhật', delayDays: 35 }
    ],
    createdAt: '2026-08-14 16:00:00',
  }
];

export const INITIAL_MOCK_TEMPLATES: MarketingTemplateSummary[] = [
  {
    id: '88000000-0000-0000-0000-000000000001',
    name: 'Email Chào mừng Lead Mới (Welcome Sequence)',
    channel: 'EMAIL',
    category: 'WELCOME',
    subject: 'Chào mừng {{lead.name}} đến với Hệ sinh thái Giải pháp Doanh nghiệp',
    content: 'Kính gửi Anh/Chị {{lead.name}},\n\nCảm ơn {{lead.name}} từ công ty {{lead.company}} đã đăng ký tìm hiểu giải pháp CRM của chúng tôi.\n\nChuyên viên tư vấn {{consultant.name}} (Hotline: {{consultant.phone}}) sẽ liên hệ trong vòng 15 phút để hỗ trợ.\n\nTrân trọng,\nĐội ngũ CRM',
    variables: ['lead.name', 'lead.company', 'consultant.name', 'consultant.phone'],
    status: 'ACTIVE',
    usageCount: 186,
    updatedAt: '2026-08-15 08:30:00',
  },
  {
    id: '88000000-0000-0000-0000-000000000002',
    name: 'SMS Nhắc Lịch Demo Trực tuyến',
    channel: 'SMS',
    category: 'NURTURE',
    content: 'CRM Cloud: Chào {{lead.name}}, lịch trải nghiệm Demo phần mềm của bạn diễn ra lúc 14h00 hôm nay. Mã xác nhận ưu đãi: {{promo.code}}. Hotline hỗ trợ: {{consultant.phone}}.',
    variables: ['lead.name', 'promo.code', 'consultant.phone'],
    status: 'ACTIVE',
    usageCount: 94,
    updatedAt: '2026-08-16 11:20:00',
  },
  {
    id: '88000000-0000-0000-0000-000000000003',
    name: 'Email Gửi Báo giá & Khuyến mãi Q3 (Special Deal Promotion)',
    channel: 'EMAIL',
    category: 'PROMOTION',
    subject: 'Ưu đãi đặc quyền 20% bản quyền CRM dành riêng cho {{lead.company}}',
    content: 'Kính gửi {{lead.name}},\n\nĐể đồng hành cùng mục tiêu tối ưu vận hành của {{lead.company}}, chúng tôi xin gửi tặng mã giảm giá {{promo.code}} áp dụng cho hợp đồng ký trong tháng này.\n\nVui lòng phản hồi email này để nhận bảng chiết khấu chi tiết.\n\nChuyên viên: {{consultant.name}}',
    variables: ['lead.name', 'lead.company', 'promo.code', 'consultant.name'],
    status: 'ACTIVE',
    usageCount: 52,
    updatedAt: '2026-08-17 14:15:00',
  },
];

let campaignsStore = [...INITIAL_MOCK_CAMPAIGNS];

export const mockMarketingApi = {
  list: async (params?: { search?: string; status?: string; type?: string; page?: number; size?: number }) => {
    let result = [...campaignsStore];
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || (c.assignedTo && c.assignedTo.toLowerCase().includes(q)));
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
