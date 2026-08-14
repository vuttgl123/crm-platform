export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export interface ContractItem {
  id: string;
  contractNumber: string;
  title: string;
  accountId: string;
  accountName: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  signDate?: string;
  signedByCustomer?: string;
  assignedTo: string;
}

export const CONTRACT_STATUS_CONFIG: Record<ContractStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Bản thảo', className: 'bg-slate-100 text-slate-600 border-slate-300 font-semibold' },
  ACTIVE: { label: 'Đang hiệu lực', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  EXPIRED: { label: 'Đã hết hạn', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  TERMINATED: { label: 'Đã thanh lý', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
};

export const INITIAL_MOCK_CONTRACTS: ContractItem[] = [
  {
    id: 'ct-001',
    contractNumber: 'HD-2026/FPT-CRM',
    title: 'Hợp đồng Cung cấp & Triển khai Hệ thống Quản trị Khách hàng CRM',
    accountId: 'acc-001',
    accountName: 'Tập đoàn Công nghệ FPT Software',
    contractValue: 1620000000,
    startDate: '2026-08-01',
    endDate: '2027-07-31',
    status: 'ACTIVE',
    signDate: '2026-08-01',
    signedByCustomer: 'Trần Minh Đức (CTO)',
    assignedTo: 'Phạm Tuấn Vũ',
  },
  {
    id: 'ct-002',
    contractNumber: 'HD-2026/VT-ERP',
    title: 'Hợp đồng Dịch vụ Tích hợp & Phát triển Module Phân tích B2B',
    accountId: 'acc-003',
    accountName: 'Tổng Công ty Viễn thông Viettel',
    contractValue: 2100000000,
    startDate: '2026-07-25',
    endDate: '2027-07-24',
    status: 'ACTIVE',
    signDate: '2026-07-25',
    signedByCustomer: 'Lê Hoàng Nam',
    assignedTo: 'Trần Thị Mai',
  },
  {
    id: 'ct-003',
    contractNumber: 'HD-2025/VNM-LIC',
    title: 'Hợp đồng Bản quyền Phần mềm & Hỗ trợ kỹ thuật 2025-2026',
    accountId: 'acc-004',
    accountName: 'Công ty CP Sữa Việt Nam (Vinamilk)',
    contractValue: 950000000,
    startDate: '2025-08-01',
    endDate: '2026-07-31',
    status: 'EXPIRED',
    signDate: '2025-07-28',
    signedByCustomer: 'Phạm Quỳnh Nga',
    assignedTo: 'Nguyễn Văn An',
  },
];

let contractsStore = [...INITIAL_MOCK_CONTRACTS];

export const mockContractsApi = {
  list: async (params?: { search?: string; status?: string; page?: number; size?: number }) => {
    let result = [...contractsStore];
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.contractNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.accountName.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== 'ALL') {
      result = result.filter((c) => c.status === params.status);
    }
    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = result.slice(page * size, (page + 1) * size);
    return { content, totalElements, totalPages, page, size };
  },

  create: async (data: Omit<ContractItem, 'id'>) => {
    const newItem: ContractItem = {
      ...data,
      id: `ct-${Date.now().toString().slice(-4)}`,
    };
    contractsStore.unshift(newItem);
    return newItem;
  },

  update: async (id: string, data: Partial<ContractItem>) => {
    const index = contractsStore.findIndex((c) => c.id === id);
    if (index !== -1) {
      contractsStore[index] = { ...contractsStore[index], ...data };
      return contractsStore[index];
    }
    throw new Error('Contract not found');
  },

  delete: async (id: string) => {
    contractsStore = contractsStore.filter((c) => c.id !== id);
    return true;
  },
};
