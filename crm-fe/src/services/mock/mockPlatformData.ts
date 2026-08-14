export interface TeamItem {
  id: string;
  code: string;
  name: string;
  leaderName: string;
  membersCount: number;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
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

export const INITIAL_MOCK_TEAMS: TeamItem[] = [
  {
    id: 'team-01',
    code: 'SALES_ENT',
    name: 'Khối Kinh doanh Doanh nghiệp Lớn (Enterprise Sales)',
    leaderName: 'Phạm Tuấn Vũ',
    membersCount: 8,
    description: 'Phụ trách khách hàng Top 500 VNR và các tập đoàn đa quốc gia',
    status: 'ACTIVE',
  },
  {
    id: 'team-02',
    code: 'SALES_SME',
    name: 'Khối Kinh doanh Khách hàng Vừa & Nhỏ (SME Sales)',
    leaderName: 'Trần Thị Mai',
    membersCount: 12,
    description: 'Phụ trách các doanh nghiệp tăng trưởng nhanh và startup',
    status: 'ACTIVE',
  },
  {
    id: 'team-03',
    code: 'CS_TECH',
    name: 'Đội ngũ Hỗ trợ Kỹ thuật & Triển khai (CS & Support)',
    leaderName: 'Nguyễn Văn An',
    membersCount: 15,
    description: 'Bảo trì hệ thống, tích hợp API và hỗ trợ khách hàng SLA 24/7',
    status: 'ACTIVE',
  },
];

export const INITIAL_TENANT_SETTINGS: TenantSettingsData = {
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

let teamsStore = [...INITIAL_MOCK_TEAMS];
let tenantSettingsStore = { ...INITIAL_TENANT_SETTINGS };

export const mockPlatformApi = {
  listTeams: async (params?: { search?: string }) => {
    let result = [...teamsStore];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q) || t.leaderName.toLowerCase().includes(q));
    }
    return result;
  },

  createTeam: async (data: Omit<TeamItem, 'id' | 'membersCount'>) => {
    const newItem: TeamItem = {
      ...data,
      id: `team-${Date.now().toString().slice(-4)}`,
      membersCount: 1,
    };
    teamsStore.unshift(newItem);
    return newItem;
  },

  getSettings: async () => {
    return { ...tenantSettingsStore };
  },

  updateSettings: async (data: Partial<TenantSettingsData>) => {
    tenantSettingsStore = { ...tenantSettingsStore, ...data };
    return { ...tenantSettingsStore };
  },
};
