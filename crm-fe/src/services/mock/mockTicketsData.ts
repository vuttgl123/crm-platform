export type TicketPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketChannel = 'PORTAL' | 'EMAIL' | 'PHONE' | 'CHAT';

export interface TicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  accountId: string;
  accountName: string;
  contactName: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: TicketChannel;
  assignedTo: string;
  category: string;
  createdAt: string;
  resolvedAt?: string;
}

export const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  NEW: { label: 'NEW', className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold' },
  OPEN: { label: 'OPEN', className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
  IN_PROGRESS: { label: 'IN PROGRESS', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  RESOLVED: { label: 'RESOLVED', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  CLOSED: { label: 'CLOSED', className: 'bg-slate-100 text-slate-600 border-slate-300 font-semibold' },
};

export const INITIAL_MOCK_TICKETS: TicketItem[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'TK-2026-0081',
    subject: 'Lỗi đồng bộ dữ liệu liên hệ từ Zalo ZNS qua API Webhook',
    accountId: 'acc-001',
    accountName: 'Tập đoàn Công nghệ FPT Software',
    contactName: 'Trần Minh Đức',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    channel: 'PORTAL',
    assignedTo: 'Phạm Tuấn Vũ',
    category: 'Lỗi Kỹ thuật & API',
    createdAt: '2026-08-14 08:30',
  },
  {
    id: 'tkt-002',
    ticketNumber: 'TK-2026-0082',
    subject: 'Yêu cầu hỗ trợ cấp phát thêm 50 tài khoản người dùng chi nhánh mới',
    accountId: 'acc-002',
    accountName: 'Tập đoàn Vingroup JSC',
    contactName: 'Nguyễn Thị Thu Hà',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    channel: 'EMAIL',
    assignedTo: 'Trần Thị Mai',
    category: 'Yêu cầu Dịch vụ',
    createdAt: '2026-08-13 14:15',
    resolvedAt: '2026-08-14 10:00',
  },
  {
    id: 'tkt-003',
    ticketNumber: 'TK-2026-0083',
    subject: 'Hệ thống báo lỗi timeout khi xuất báo cáo doanh thu quý định dạng Excel',
    accountId: 'acc-003',
    accountName: 'Tổng Công ty Viễn thông Viettel',
    contactName: 'Lê Hoàng Nam',
    priority: 'URGENT',
    status: 'OPEN',
    channel: 'PHONE',
    assignedTo: 'Phạm Tuấn Vũ',
    category: 'Lỗi Hiệu năng',
    createdAt: '2026-08-14 11:45',
  },
  {
    id: 'tkt-004',
    ticketNumber: 'TK-2026-0079',
    subject: 'Hướng dẫn cấu hình phân quyền vai trò cho phòng Kế toán',
    accountId: 'acc-004',
    accountName: 'Công ty CP Sữa Việt Nam (Vinamilk)',
    contactName: 'Phạm Quỳnh Nga',
    priority: 'LOW',
    status: 'CLOSED',
    channel: 'CHAT',
    assignedTo: 'Nguyễn Văn An',
    category: 'Tư vấn Hướng dẫn',
    createdAt: '2026-08-10 09:00',
    resolvedAt: '2026-08-10 11:30',
  },
];

let ticketsStore = [...INITIAL_MOCK_TICKETS];

export const mockTicketsApi = {
  list: async (params?: { search?: string; status?: string; priority?: string; page?: number; size?: number }) => {
    let result = [...ticketsStore];
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.accountName.toLowerCase().includes(q) ||
          t.contactName.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== 'ALL') {
      result = result.filter((t) => t.status === params.status);
    }
    if (params?.priority && params.priority !== 'ALL') {
      result = result.filter((t) => t.priority === params.priority);
    }
    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = result.slice(page * size, (page + 1) * size);
    return { content, totalElements, totalPages, page, size };
  },

  create: async (data: Omit<TicketItem, 'id' | 'ticketNumber' | 'createdAt'>) => {
    const newItem: TicketItem = {
      ...data,
      id: `tkt-${Date.now().toString().slice(-4)}`,
      ticketNumber: `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    ticketsStore.unshift(newItem);
    return newItem;
  },

  update: async (id: string, data: Partial<TicketItem>) => {
    const index = ticketsStore.findIndex((t) => t.id === id);
    if (index !== -1) {
      ticketsStore[index] = { ...ticketsStore[index], ...data };
      return ticketsStore[index];
    }
    throw new Error('Ticket not found');
  },

  delete: async (id: string) => {
    ticketsStore = ticketsStore.filter((t) => t.id !== id);
    return true;
  },
};
