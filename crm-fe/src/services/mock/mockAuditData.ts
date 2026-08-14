export interface AuditLogItem {
  id: string;
  action: string;
  resource: string;
  performedBy: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED';
  details: string;
  timestamp: string;
}

export interface DataAccessLogItem {
  id: string;
  dataset: string;
  accessedBy: string;
  accessType: 'READ' | 'EXPORT' | 'UPDATE' | 'DELETE';
  recordsCount: number;
  reason: string;
  timestamp: string;
}

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-001',
    action: 'CẬP NHẬT GIAI ĐOẠN DEAL',
    resource: 'Opportunities/opp-001',
    performedBy: 'Phạm Tuấn Vũ (Admin)',
    ipAddress: '118.70.12.89',
    userAgent: 'Chrome 128 / Windows',
    status: 'SUCCESS',
    details: 'Chuyển trạng thái Deal sang Đàm phán hợp đồng (80%)',
    timestamp: '2026-08-14 11:20:15',
  },
  {
    id: 'aud-002',
    action: 'XUẤT DỮ LIỆU BÁO CÁO KHÁCH HÀNG',
    resource: 'Accounts/ExportExcel',
    performedBy: 'Trần Thị Mai',
    ipAddress: '14.232.180.45',
    userAgent: 'Safari 17 / macOS',
    status: 'SUCCESS',
    details: 'Xuất file 500 khách hàng doanh nghiệp Top VNR',
    timestamp: '2026-08-14 09:45:00',
  },
  {
    id: 'aud-003',
    action: 'ĐĂNG NHẬP THẤT BẠI',
    resource: 'Auth/Login',
    performedBy: 'unknown_user@hacker.io',
    ipAddress: '103.245.236.12',
    userAgent: 'Python-requests / Linux',
    status: 'FAILED',
    details: 'Sai mật khẩu quá 5 lần - IP bị chặn tạm thời 15 phút',
    timestamp: '2026-08-14 03:12:44',
  },
  {
    id: 'aud-004',
    action: 'THÊM MỚI BẢNG GIÁ',
    resource: 'PriceBooks/pb-02',
    performedBy: 'Phạm Tuấn Vũ (Admin)',
    ipAddress: '118.70.12.89',
    userAgent: 'Chrome 128 / Windows',
    status: 'SUCCESS',
    details: 'Thiết lập bảng giá chiết khấu đặc biệt cho VIP Enterprise',
    timestamp: '2026-08-13 16:30:10',
  },
];

export const INITIAL_DATA_ACCESS: DataAccessLogItem[] = [
  { id: 'da-01', dataset: 'Danh bạ Khách hàng Doanh nghiệp', accessedBy: 'Phạm Tuấn Vũ', accessType: 'EXPORT', recordsCount: 150, reason: 'Báo cáo họp giao ban tháng 8', timestamp: '2026-08-14 10:15:00' },
  { id: 'da-02', dataset: 'Doanh thu & Hợp đồng Ký kết', accessedBy: 'Trần Thị Mai', accessType: 'READ', recordsCount: 45, reason: 'Đối soát công nợ kế toán', timestamp: '2026-08-14 09:30:22' },
  { id: 'da-03', dataset: 'Hồ sơ Người liên hệ & SĐT', accessedBy: 'Nguyễn Văn An', accessType: 'UPDATE', recordsCount: 12, reason: 'Cập nhật danh bạ sau sự kiện', timestamp: '2026-08-13 15:40:12' },
];

export const mockAuditApi = {
  listAuditLogs: async (params?: { search?: string; status?: string; page?: number; size?: number }) => {
    let result = [...INITIAL_AUDIT_LOGS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((l) => l.action.toLowerCase().includes(q) || l.performedBy.toLowerCase().includes(q) || l.ipAddress.includes(q));
    }
    if (params?.status && params.status !== 'ALL') {
      result = result.filter((l) => l.status === params.status);
    }
    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = result.slice(page * size, (page + 1) * size);
    return { content, totalElements, totalPages, page, size };
  },

  listDataAccess: async (params?: { search?: string }) => {
    let result = [...INITIAL_DATA_ACCESS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((d) => d.dataset.toLowerCase().includes(q) || d.accessedBy.toLowerCase().includes(q));
    }
    return result;
  },
};
