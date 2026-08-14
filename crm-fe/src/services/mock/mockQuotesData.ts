export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuoteItem {
  id: string;
  quoteNumber: string;
  title: string;
  accountId: string;
  accountName: string;
  contactName: string;
  totalAmount: number;
  discountPercent: number;
  finalAmount: number;
  status: QuoteStatus;
  validUntil: string;
  assignedTo: string;
  createdAt: string;
}

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Bản nháp', className: 'bg-slate-100 text-slate-600 border-slate-300 font-semibold' },
  SENT: { label: 'Đã gửi khách', className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
  ACCEPTED: { label: 'Đã chấp thuận', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  REJECTED: { label: 'Bị từ chối', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
  EXPIRED: { label: 'Đã hết hạn', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
};

export const INITIAL_MOCK_QUOTES: QuoteItem[] = [
  {
    id: 'qt-001',
    quoteNumber: 'BG-2026-0801',
    title: 'Báo giá triển khai CRM Enterprise 500 Users',
    accountId: 'acc-001',
    accountName: 'Tập đoàn Công nghệ FPT Software',
    contactName: 'Trần Minh Đức',
    totalAmount: 1800000000,
    discountPercent: 10,
    finalAmount: 1620000000,
    status: 'SENT',
    validUntil: '2026-09-01',
    assignedTo: 'Phạm Tuấn Vũ',
    createdAt: '2026-08-01',
  },
  {
    id: 'qt-002',
    quoteNumber: 'BG-2026-0802',
    title: 'Báo giá tích hợp API SAP ERP & Cổng Zalo ZNS',
    accountId: 'acc-002',
    accountName: 'Tập đoàn Vingroup JSC',
    contactName: 'Nguyễn Thị Thu Hà',
    totalAmount: 950000000,
    discountPercent: 5,
    finalAmount: 902500000,
    status: 'ACCEPTED',
    validUntil: '2026-08-25',
    assignedTo: 'Phạm Tuấn Vũ',
    createdAt: '2026-08-05',
  },
  {
    id: 'qt-003',
    quoteNumber: 'BG-2026-0803',
    title: 'Gói gia hạn License & Bảo trì 24/7 năm 2027',
    accountId: 'acc-003',
    accountName: 'Tổng Công ty Viễn thông Viettel',
    contactName: 'Lê Hoàng Nam',
    totalAmount: 600000000,
    discountPercent: 0,
    finalAmount: 600000000,
    status: 'DRAFT',
    validUntil: '2026-09-15',
    assignedTo: 'Trần Thị Mai',
    createdAt: '2026-08-12',
  },
  {
    id: 'qt-004',
    quoteNumber: 'BG-2026-0709',
    title: 'Báo giá module Quản lý Đại lý phân phối',
    accountId: 'acc-004',
    accountName: 'Công ty CP Sữa Việt Nam (Vinamilk)',
    contactName: 'Phạm Quỳnh Nga',
    totalAmount: 850000000,
    discountPercent: 8,
    finalAmount: 782000000,
    status: 'ACCEPTED',
    validUntil: '2026-08-10',
    assignedTo: 'Nguyễn Văn An',
    createdAt: '2026-07-20',
  },
];

let quotesStore = [...INITIAL_MOCK_QUOTES];

export const mockQuotesApi = {
  list: async (params?: { search?: string; status?: string; page?: number; size?: number }) => {
    let result = [...quotesStore];
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.quoteNumber.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.accountName.toLowerCase().includes(q) ||
          item.contactName.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== 'ALL') {
      result = result.filter((item) => item.status === params.status);
    }
    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = result.slice(page * size, (page + 1) * size);
    return { content, totalElements, totalPages, page, size };
  },

  create: async (data: Omit<QuoteItem, 'id' | 'quoteNumber' | 'createdAt'>) => {
    const newItem: QuoteItem = {
      ...data,
      id: `qt-${Date.now().toString().slice(-4)}`,
      quoteNumber: `BG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    quotesStore.unshift(newItem);
    return newItem;
  },

  update: async (id: string, data: Partial<QuoteItem>) => {
    const index = quotesStore.findIndex((q) => q.id === id);
    if (index !== -1) {
      quotesStore[index] = { ...quotesStore[index], ...data };
      return quotesStore[index];
    }
    throw new Error('Quote not found');
  },

  delete: async (id: string) => {
    quotesStore = quotesStore.filter((q) => q.id !== id);
    return true;
  },
};
