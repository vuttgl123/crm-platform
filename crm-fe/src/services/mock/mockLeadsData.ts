export interface LeadItem {
  id: string;
  fullName: string;
  companyName: string;
  jobTitle: string;
  email: string;
  phone: string;
  leadSource: 'WEBSITE' | 'EVENT' | 'REFERRAL' | 'COLD_CALL' | 'SOCIAL' | 'PARTNER';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'UNQUALIFIED';
  rating: 'HOT' | 'WARM' | 'COLD';
  estimatedRevenue: number;
  assignedTo: string;
  notes?: string;
  city: string;
  createdAt: string;
  lastContactedAt?: string;
}

export const LEAD_SOURCE_CONFIG: Record<string, { label: string; className: string }> = {
  WEBSITE: { label: 'Website / Inbound', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  EVENT: { label: 'Event / Conference', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  REFERRAL: { label: 'Customer Referral', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COLD_CALL: { label: 'Outbound Telesales', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  SOCIAL: { label: 'Social Media (LinkedIn)', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  PARTNER: { label: 'Partner Channel', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export const INITIAL_MOCK_LEADS: LeadItem[] = [
  {
    id: 'ld-001',
    fullName: 'Nguyễn Văn Hùng',
    companyName: 'Công ty Cổ phần Vận tải Biển Đông',
    jobTitle: 'Phó Giám đốc Điều hành',
    email: 'hung.nguyen@biendongshipping.vn',
    phone: '0908 123 789',
    leadSource: 'WEBSITE',
    status: 'NEW',
    rating: 'HOT',
    estimatedRevenue: 450000000,
    assignedTo: 'Phạm Tuấn Vũ',
    notes: 'Khách hàng quan tâm gói giải pháp CRM Doanh nghiệp và tích hợp ERP kế toán.',
    city: 'Hải Phòng',
    createdAt: '2026-08-13',
    lastContactedAt: '2026-08-14',
  },
  {
    id: 'ld-002',
    fullName: 'Lê Minh Trang',
    companyName: 'Chuỗi Nhà hàng Ẩm thực Lotus Group',
    jobTitle: 'Trưởng phòng Marketing & CSKH',
    email: 'trang.lm@lotusgroup.com.vn',
    phone: '0919 888 234',
    leadSource: 'EVENT',
    status: 'CONTACTED',
    rating: 'HOT',
    estimatedRevenue: 280000000,
    assignedTo: 'Trần Thị Mai',
    notes: 'Gặp gỡ tại Hội nghị Chuyển đổi số Bán lẻ 2026. Cần demo tính năng tích hợp Zalo ZNS.',
    city: 'TP. Hồ Chí Minh',
    createdAt: '2026-08-10',
    lastContactedAt: '2026-08-12',
  },
  {
    id: 'ld-003',
    fullName: 'Hoàng Anh Tuấn',
    companyName: 'Công ty TNHH Cơ khí & Tự động hóa An Phú',
    jobTitle: 'Tổng Giám đốc',
    email: 'tuan.ha@anphuautomation.com',
    phone: '0983 456 999',
    leadSource: 'REFERRAL',
    status: 'QUALIFIED',
    rating: 'WARM',
    estimatedRevenue: 600000000,
    assignedTo: 'Phạm Tuấn Vũ',
    notes: 'Được giới thiệu từ đối tác FPT. Đã duyệt ngân sách Q3/2026.',
    city: 'Bình Dương',
    createdAt: '2026-08-01',
    lastContactedAt: '2026-08-11',
  },
  {
    id: 'ld-004',
    fullName: 'Bùi Phương Thảo',
    companyName: 'Viện Đào tạo & Khảo thí Quốc tế Elite',
    jobTitle: 'Giám đốc Tuyển sinh',
    email: 'thao.bp@elite-edu.vn',
    phone: '0936 777 888',
    leadSource: 'SOCIAL',
    status: 'NEW',
    rating: 'WARM',
    estimatedRevenue: 180000000,
    assignedTo: 'Nguyễn Văn An',
    notes: 'Để lại thông tin qua form quảng cáo LinkedIn. Cần quản lý hồ sơ học viên.',
    city: 'Hà Nội',
    createdAt: '2026-08-14',
  },
  {
    id: 'ld-005',
    fullName: 'Vũ Đức Thịnh',
    companyName: 'Công ty Cổ phần Dược phẩm Mediphar',
    jobTitle: 'Trưởng phòng Kinh doanh OTC',
    email: 'thinhvd@mediphar.vn',
    phone: '0972 333 444',
    leadSource: 'COLD_CALL',
    status: 'UNQUALIFIED',
    rating: 'COLD',
    estimatedRevenue: 120000000,
    assignedTo: 'Trần Thị Mai',
    notes: 'Chưa có nhu cầu đổi hệ thống trong năm 2026 do vừa gia hạn phần mềm cũ.',
    city: 'Đà Nẵng',
    createdAt: '2026-07-20',
    lastContactedAt: '2026-07-25',
  },
  {
    id: 'ld-006',
    fullName: 'Dương Thu Hằng',
    companyName: 'Tập đoàn Đầu tư & Bất động sản GreenLand',
    jobTitle: 'Giám đốc Chuyển đổi số',
    email: 'hang.dt@greenland.vn',
    phone: '0909 555 666',
    leadSource: 'PARTNER',
    status: 'CONVERTED',
    rating: 'HOT',
    estimatedRevenue: 1200000000,
    assignedTo: 'Phạm Tuấn Vũ',
    notes: 'Đã hoàn thành chuyển đổi thành khách hàng chính thức và tạo cơ hội kinh doanh.',
    city: 'Hà Nội',
    createdAt: '2026-06-15',
    lastContactedAt: '2026-08-01',
  },
];

let leadsStore = [...INITIAL_MOCK_LEADS];

export const mockLeadsApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    leadSource?: string;
    rating?: string;
    page?: number;
    size?: number;
  }) => {
    let result = [...leadsStore];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.companyName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.jobTitle.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== 'ALL') {
      result = result.filter((l) => l.status === params.status);
    }

    if (params?.leadSource && params.leadSource !== 'ALL') {
      result = result.filter((l) => l.leadSource === params.leadSource);
    }

    if (params?.rating && params.rating !== 'ALL') {
      result = result.filter((l) => l.rating === params.rating);
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

  getById: async (id: string) => {
    return leadsStore.find((l) => l.id === id) || null;
  },

  create: async (data: Omit<LeadItem, 'id' | 'createdAt'>) => {
    const newItem: LeadItem = {
      ...data,
      id: `ld-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    leadsStore.unshift(newItem);
    return newItem;
  },

  update: async (id: string, data: Partial<LeadItem>) => {
    const index = leadsStore.findIndex((l) => l.id === id);
    if (index !== -1) {
      leadsStore[index] = { ...leadsStore[index], ...data };
      return leadsStore[index];
    }
    throw new Error('Lead not found');
  },

  convert: async (id: string) => {
    const index = leadsStore.findIndex((l) => l.id === id);
    if (index !== -1) {
      leadsStore[index] = { ...leadsStore[index], status: 'CONVERTED' };
      return leadsStore[index];
    }
    throw new Error('Lead not found');
  },

  delete: async (id: string) => {
    leadsStore = leadsStore.filter((l) => l.id !== id);
    return true;
  },
};
