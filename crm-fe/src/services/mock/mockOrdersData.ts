export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface OrderItem {
  id: string;
  orderNumber: string;
  accountId: string;
  accountName: string;
  totalAmount: number;
  paidAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  deliveryDate?: string;
  assignedTo: string;
  itemsCount: number;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  PROCESSING: { label: 'Đang triển khai', className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
  SHIPPED: { label: 'Đang bàn giao', className: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' },
  DELIVERED: { label: 'Đã nghiệm thu', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  CANCELLED: { label: 'Đã hủy đơn', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID: { label: 'Chưa thanh toán', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
  PARTIAL: { label: 'Thanh toán một phần', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  PAID: { label: 'Đã thanh toán đủ', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
};

export const INITIAL_MOCK_ORDERS: OrderItem[] = [
  {
    id: 'ord-001',
    orderNumber: 'DH-2026-1001',
    accountId: 'acc-001',
    accountName: 'Tập đoàn Công nghệ FPT Software',
    totalAmount: 1620000000,
    paidAmount: 810000000,
    status: 'PROCESSING',
    paymentStatus: 'PARTIAL',
    orderDate: '2026-08-02',
    deliveryDate: '2026-09-30',
    assignedTo: 'Phạm Tuấn Vũ',
    itemsCount: 3,
  },
  {
    id: 'ord-002',
    orderNumber: 'DH-2026-1002',
    accountId: 'acc-002',
    accountName: 'Tập đoàn Vingroup JSC',
    totalAmount: 902500000,
    paidAmount: 902500000,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    orderDate: '2026-08-06',
    deliveryDate: '2026-08-14',
    assignedTo: 'Phạm Tuấn Vũ',
    itemsCount: 2,
  },
  {
    id: 'ord-003',
    orderNumber: 'DH-2026-1003',
    accountId: 'acc-003',
    accountName: 'Tổng Công ty Viễn thông Viettel',
    totalAmount: 2100000000,
    paidAmount: 630000000,
    status: 'PROCESSING',
    paymentStatus: 'PARTIAL',
    orderDate: '2026-07-28',
    deliveryDate: '2026-10-15',
    assignedTo: 'Trần Thị Mai',
    itemsCount: 4,
  },
  {
    id: 'ord-004',
    orderNumber: 'DH-2026-1004',
    accountId: 'acc-004',
    accountName: 'Công ty CP Sữa Việt Nam (Vinamilk)',
    totalAmount: 782000000,
    paidAmount: 782000000,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    orderDate: '2026-07-15',
    deliveryDate: '2026-08-01',
    assignedTo: 'Nguyễn Văn An',
    itemsCount: 1,
  },
];

let ordersStore = [...INITIAL_MOCK_ORDERS];

export const mockOrdersApi = {
  list: async (params?: { search?: string; status?: string; paymentStatus?: string; page?: number; size?: number }) => {
    let result = [...ordersStore];
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (o) => o.orderNumber.toLowerCase().includes(q) || o.accountName.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== 'ALL') {
      result = result.filter((o) => o.status === params.status);
    }
    if (params?.paymentStatus && params.paymentStatus !== 'ALL') {
      result = result.filter((o) => o.paymentStatus === params.paymentStatus);
    }
    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = result.slice(page * size, (page + 1) * size);
    return { content, totalElements, totalPages, page, size };
  },

  create: async (data: Omit<OrderItem, 'id' | 'orderNumber'>) => {
    const newItem: OrderItem = {
      ...data,
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: `DH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    ordersStore.unshift(newItem);
    return newItem;
  },

  update: async (id: string, data: Partial<OrderItem>) => {
    const index = ordersStore.findIndex((o) => o.id === id);
    if (index !== -1) {
      ordersStore[index] = { ...ordersStore[index], ...data };
      return ordersStore[index];
    }
    throw new Error('Order not found');
  },

  delete: async (id: string) => {
    ordersStore = ordersStore.filter((o) => o.id !== id);
    return true;
  },
};
