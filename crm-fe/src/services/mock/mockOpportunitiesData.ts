export type OpportunityStage =
  | 'PROSPECTING'
  | 'QUALIFICATION'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface OpportunityItem {
  id: string;
  dealName: string;
  accountId: string;
  accountName: string;
  contactName: string;
  amount: number;
  stage: OpportunityStage;
  probability: number; // 0 - 100
  expectedCloseDate: string;
  assignedTo: string;
  leadSource?: string;
  description?: string;
  nextStep?: string;
  createdAt: string;
}

export const PIPELINE_STAGES: { id: OpportunityStage; title: string; defaultProb: number; colorClass: string }[] = [
  { id: 'PROSPECTING', title: 'Prospecting & Discovery', defaultProb: 15, colorClass: 'border-t-purple-500 bg-purple-50/20' },
  { id: 'QUALIFICATION', title: 'Solution Qualification', defaultProb: 35, colorClass: 'border-t-blue-500 bg-blue-50/20' },
  { id: 'PROPOSAL', title: 'Proposal & CPQ Quote', defaultProb: 60, colorClass: 'border-t-sky-500 bg-sky-50/20' },
  { id: 'NEGOTIATION', title: 'Contract Negotiation', defaultProb: 80, colorClass: 'border-t-amber-500 bg-amber-50/20' },
  { id: 'CLOSED_WON', title: 'Closed Won', defaultProb: 100, colorClass: 'border-t-emerald-500 bg-emerald-50/20' },
  { id: 'CLOSED_LOST', title: 'Closed Lost', defaultProb: 0, colorClass: 'border-t-rose-500 bg-rose-50/20' },
];

export const INITIAL_MOCK_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: 'opp-001',
    dealName: 'Gói triển khai Phần mềm CRM Enterprise 2026',
    accountId: 'acc-001',
    accountName: 'Tập đoàn Công nghệ FPT Software',
    contactName: 'Trần Minh Đức',
    amount: 1500000000,
    stage: 'NEGOTIATION',
    probability: 85,
    expectedCloseDate: '2026-08-30',
    assignedTo: 'Phạm Tuấn Vũ',
    leadSource: 'REFERRAL',
    description: 'Triển khai CRM cho 500 người dùng khối Outsource quốc tế.',
    nextStep: 'Họp rà soát hợp đồng pháp lý & bảo mật vào Thứ Hai',
    createdAt: '2026-06-01',
  },
  {
    id: 'opp-002',
    dealName: 'Hợp đồng Nâng cấp Hạ tầng & Tích hợp ERP',
    accountId: 'acc-002',
    accountName: 'Tập đoàn Vingroup JSC',
    contactName: 'Nguyễn Thị Thu Hà',
    amount: 3200000000,
    stage: 'PROPOSAL',
    probability: 60,
    expectedCloseDate: '2026-09-15',
    assignedTo: 'Phạm Tuấn Vũ',
    leadSource: 'EVENT',
    description: 'Kết nối API hai chiều giữa CRM và hệ thống SAP ERP.',
    nextStep: 'Gửi bản demo POC kiến trúc Microservices',
    createdAt: '2026-06-20',
  },
  {
    id: 'opp-003',
    dealName: 'Dự án Số hóa Kênh Bán hàng B2B Viettel',
    accountId: 'acc-003',
    accountName: 'Tổng Công ty Viễn thông Viettel',
    contactName: 'Lê Hoàng Nam',
    amount: 2100000000,
    stage: 'CLOSED_WON',
    probability: 100,
    expectedCloseDate: '2026-08-10',
    assignedTo: 'Trần Thị Mai',
    leadSource: 'PARTNER',
    description: 'Đã hoàn tất ký hợp đồng và nhận cọc 30% giai đoạn 1.',
    nextStep: 'Bàn giao cho đội ngũ Triển khai & Đào tạo',
    createdAt: '2026-05-15',
  },
  {
    id: 'opp-004',
    dealName: 'Module Quản lý Nhà phân phối Miền Tây',
    accountId: 'acc-004',
    accountName: 'Công ty CP Sữa Việt Nam (Vinamilk)',
    contactName: 'Phạm Quỳnh Nga',
    amount: 850000000,
    stage: 'QUALIFICATION',
    probability: 40,
    expectedCloseDate: '2026-10-01',
    assignedTo: 'Nguyễn Văn An',
    leadSource: 'WEBSITE',
    description: 'Mở rộng tính năng theo dõi lộ trình và đơn hàng đại lý.',
    nextStep: 'Thuyết trình giải pháp trực tiếp tại trụ sở TP.HCM',
    createdAt: '2026-07-10',
  },
  {
    id: 'opp-005',
    dealName: 'Phần mềm Quản lý Tài khoản Khách hàng VIP',
    accountId: 'acc-005',
    accountName: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
    contactName: 'Vũ Quốc Toàn',
    amount: 1800000000,
    stage: 'PROSPECTING',
    probability: 20,
    expectedCloseDate: '2026-11-20',
    assignedTo: 'Phạm Tuấn Vũ',
    leadSource: 'COLD_CALL',
    description: 'Nhu cầu phân tích 360 độ dữ liệu khách hàng VIP & Private Banking.',
    nextStep: 'Thu thập tài liệu yêu cầu chi tiết (BRD)',
    createdAt: '2026-08-05',
  },
  {
    id: 'opp-006',
    dealName: 'Dự án Thí điểm CRM Bán lẻ',
    accountId: 'acc-006',
    accountName: 'Công ty CP Thế Giới Di Động (MWG)',
    contactName: 'Đỗ Thùy Linh',
    amount: 650000000,
    stage: 'CLOSED_LOST',
    probability: 0,
    expectedCloseDate: '2026-07-30',
    assignedTo: 'Trần Thị Mai',
    leadSource: 'WEBSITE',
    description: 'Khách hàng quyết định tự phát triển nội bộ bằng đội in-house.',
    nextStep: 'Lưu vào hồ sơ theo dõi sau 6 tháng',
    createdAt: '2026-04-10',
  },
];

let oppsStore = [...INITIAL_MOCK_OPPORTUNITIES];

export const mockOpportunitiesApi = {
  list: async (params?: {
    search?: string;
    stage?: string;
    page?: number;
    size?: number;
  }) => {
    let result = [...oppsStore];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.dealName.toLowerCase().includes(q) ||
          o.accountName.toLowerCase().includes(q) ||
          o.contactName.toLowerCase().includes(q) ||
          o.assignedTo.toLowerCase().includes(q)
      );
    }

    if (params?.stage && params.stage !== 'ALL') {
      result = result.filter((o) => o.stage === params.stage);
    }

    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = result.slice(page * size, (page + 1) * size);

    return {
      content,
      totalElements,
      totalPages,
      page,
      size,
    };
  },

  getAllForKanban: async () => {
    return [...oppsStore];
  },

  updateStage: async (id: string, newStage: OpportunityStage) => {
    const stageObj = PIPELINE_STAGES.find((s) => s.id === newStage);
    const index = oppsStore.findIndex((o) => o.id === id);
    if (index !== -1) {
      oppsStore[index] = {
        ...oppsStore[index],
        stage: newStage,
        probability: stageObj ? stageObj.defaultProb : oppsStore[index].probability,
      };
      return oppsStore[index];
    }
    throw new Error('Opportunity not found');
  },

  create: async (data: Omit<OpportunityItem, 'id' | 'createdAt'>) => {
    const newItem: OpportunityItem = {
      ...data,
      id: `opp-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    oppsStore.unshift(newItem);
    return newItem;
  },

  update: async (id: string, data: Partial<OpportunityItem>) => {
    const index = oppsStore.findIndex((o) => o.id === id);
    if (index !== -1) {
      oppsStore[index] = { ...oppsStore[index], ...data };
      return oppsStore[index];
    }
    throw new Error('Opportunity not found');
  },

  delete: async (id: string) => {
    oppsStore = oppsStore.filter((o) => o.id !== id);
    return true;
  },
};
