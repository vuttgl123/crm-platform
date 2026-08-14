export type ActivityType = 'CALL' | 'MEETING' | 'TASK' | 'EMAIL';
export type ActivityPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ActivityStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface ActivityItem {
  id: string;
  subject: string;
  type: ActivityType;
  priority: ActivityPriority;
  status: ActivityStatus;
  dueDate: string;
  dueTime?: string;
  accountId?: string;
  accountName?: string;
  contactName?: string;
  assignedTo: string;
  description?: string;
  createdAt: string;
}

export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { label: string; icon: string; className: string }> = {
  CALL: { label: 'Cuộc gọi điện', icon: 'Phone', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  MEETING: { label: 'Cuộc họp / Gặp gỡ', icon: 'Users', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  TASK: { label: 'Nhiệm vụ cần làm', icon: 'CheckSquare', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  EMAIL: { label: 'Gửi Email', icon: 'Mail', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export const INITIAL_MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-001',
    subject: 'Gọi điện xác nhận lịch demo hệ thống với CTO',
    type: 'CALL',
    priority: 'HIGH',
    status: 'PENDING',
    dueDate: '2026-08-15',
    dueTime: '09:30',
    accountId: 'acc-001',
    accountName: 'Tập đoàn Công nghệ FPT Software',
    contactName: 'Trần Minh Đức',
    assignedTo: 'Phạm Tuấn Vũ',
    description: 'Xác nhận danh sách các phòng ban tham dự buổi thuyết trình trực tuyến.',
    createdAt: '2026-08-14',
  },
  {
    id: 'act-002',
    subject: 'Họp rà soát hợp đồng và điều khoản SLA',
    type: 'MEETING',
    priority: 'HIGH',
    status: 'PENDING',
    dueDate: '2026-08-16',
    dueTime: '14:00',
    accountId: 'acc-002',
    accountName: 'Tập đoàn Vingroup JSC',
    contactName: 'Nguyễn Thị Thu Hà',
    assignedTo: 'Phạm Tuấn Vũ',
    description: 'Địa điểm: Tầng 12, Tòa nhà Symphony, Vinhomes Riverside.',
    createdAt: '2026-08-13',
  },
  {
    id: 'act-003',
    subject: 'Gửi báo giá tùy biến gói bảo trì năm 2',
    type: 'EMAIL',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    dueDate: '2026-08-14',
    dueTime: '11:00',
    accountId: 'acc-003',
    accountName: 'Tổng Công ty Viễn thông Viettel',
    contactName: 'Lê Hoàng Nam',
    assignedTo: 'Trần Thị Mai',
    description: 'Đã đính kèm file PDF bảng dự toán chi phí và phương án nhân sự.',
    createdAt: '2026-08-12',
  },
  {
    id: 'act-004',
    subject: 'Soạn thảo tài liệu đào tạo người dùng cuối',
    type: 'TASK',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '2026-08-18',
    accountId: 'acc-004',
    accountName: 'Công ty CP Sữa Việt Nam (Vinamilk)',
    contactName: 'Phạm Quỳnh Nga',
    assignedTo: 'Nguyễn Văn An',
    description: 'Biên soạn hướng dẫn sử dụng nhanh dạng slide và video 3 phút.',
    createdAt: '2026-08-10',
  },
  {
    id: 'act-005',
    subject: 'Khảo sát độ hài lòng khách hàng sau nghiệm thu',
    type: 'CALL',
    priority: 'LOW',
    status: 'COMPLETED',
    dueDate: '2026-08-12',
    accountId: 'acc-007',
    accountName: 'Công ty CP Tập đoàn Masan',
    contactName: 'Hoàng Văn Bách',
    assignedTo: 'Trần Thị Mai',
    description: 'Điểm CSAT 9.5/10. Khách hàng đề xuất nâng cấp gói storage thêm 50GB.',
    createdAt: '2026-08-08',
  },
];

let activitiesStore = [...INITIAL_MOCK_ACTIVITIES];

export const mockActivitiesApi = {
  list: async (params?: {
    search?: string;
    type?: string;
    priority?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    let result = [...activitiesStore];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.subject.toLowerCase().includes(q) ||
          (a.accountName && a.accountName.toLowerCase().includes(q)) ||
          (a.contactName && a.contactName.toLowerCase().includes(q)) ||
          a.assignedTo.toLowerCase().includes(q)
      );
    }

    if (params?.type && params.type !== 'ALL') {
      result = result.filter((a) => a.type === params.type);
    }

    if (params?.priority && params.priority !== 'ALL') {
      result = result.filter((a) => a.priority === params.priority);
    }

    if (params?.status && params.status !== 'ALL') {
      result = result.filter((a) => a.status === params.status);
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

  toggleComplete: async (id: string) => {
    const index = activitiesStore.findIndex((a) => a.id === id);
    if (index !== -1) {
      const curr = activitiesStore[index].status;
      activitiesStore[index].status = curr === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      return activitiesStore[index];
    }
    throw new Error('Activity not found');
  },

  create: async (data: Omit<ActivityItem, 'id' | 'createdAt'>) => {
    const newItem: ActivityItem = {
      ...data,
      id: `act-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    activitiesStore.unshift(newItem);
    return newItem;
  },

  update: async (id: string, data: Partial<ActivityItem>) => {
    const index = activitiesStore.findIndex((a) => a.id === id);
    if (index !== -1) {
      activitiesStore[index] = { ...activitiesStore[index], ...data };
      return activitiesStore[index];
    }
    throw new Error('Activity not found');
  },

  delete: async (id: string) => {
    activitiesStore = activitiesStore.filter((a) => a.id !== id);
    return true;
  },
};
