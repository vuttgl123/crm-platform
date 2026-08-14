export interface ConsentItem {
  id: string;
  contactName: string;
  email: string;
  purpose: string;
  status: 'GRANTED' | 'REVOKED';
  grantedAt: string;
  revokedAt?: string;
  ipAddress: string;
}

export interface RetentionPolicyItem {
  id: string;
  dataType: string;
  durationYears: number;
  actionAfterExpiry: 'ARCHIVE' | 'PERMANENT_DELETE' | 'ANONYMIZE';
  isActive: boolean;
  lastRunDate: string;
}

export interface DsrItem {
  id: string;
  ticketNumber: string;
  requesterName: string;
  email: string;
  requestType: 'EXPORT_DATA' | 'ERASURE' | 'RECTIFICATION';
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED';
  requestedAt: string;
  completedAt?: string;
}

export interface LegalHoldItem {
  id: string;
  caseName: string;
  matterNumber: string;
  custodian: string;
  scope: string;
  status: 'ACTIVE' | 'RELEASED';
  createdAt: string;
}

export const INITIAL_CONSENTS: ConsentItem[] = [
  { id: 'cs-01', contactName: 'Trần Minh Đức', email: 'duc.tm@fpt.com', purpose: 'Nhận bản tin tiếp thị & email sản phẩm mới', status: 'GRANTED', grantedAt: '2026-08-01 10:00', ipAddress: '118.70.12.89' },
  { id: 'cs-02', contactName: 'Nguyễn Thị Thu Hà', email: 'ha.nt@vingroup.net', purpose: 'Lưu trữ thông tin liên hệ và lịch sử giao dịch', status: 'GRANTED', grantedAt: '2026-08-05 14:30', ipAddress: '14.232.180.45' },
  { id: 'cs-03', contactName: 'Vũ Đức Thịnh', email: 'thinhvd@mediphar.vn', purpose: 'Gửi tin nhắn Zalo thông báo đơn hàng', status: 'REVOKED', grantedAt: '2026-07-20 09:15', revokedAt: '2026-08-10 11:20', ipAddress: '113.161.78.22' },
];

export const INITIAL_RETENTION_POLICIES: RetentionPolicyItem[] = [
  { id: 'ret-01', dataType: 'Nhật ký Truy cập & Kiểm toán (Audit Logs)', durationYears: 3, actionAfterExpiry: 'ARCHIVE', isActive: true, lastRunDate: '2026-08-01' },
  { id: 'ret-02', dataType: 'Hồ sơ Tiềm năng Không chuyển đổi (Unqualified Leads)', durationYears: 2, actionAfterExpiry: 'PERMANENT_DELETE', isActive: true, lastRunDate: '2026-08-01' },
  { id: 'ret-03', dataType: 'Dữ liệu Phiếu Hỗ trợ Đã đóng (Resolved Tickets)', durationYears: 5, actionAfterExpiry: 'ANONYMIZE', isActive: true, lastRunDate: '2026-08-01' },
];

export const INITIAL_DSR: DsrItem[] = [
  { id: 'dsr-01', ticketNumber: 'DSR-2026-01', requesterName: 'Hoàng Văn Bách', email: 'bach.hv@masan.vn', requestType: 'EXPORT_DATA', status: 'COMPLETED', requestedAt: '2026-08-10', completedAt: '2026-08-11' },
  { id: 'dsr-02', ticketNumber: 'DSR-2026-02', requesterName: 'Vũ Đức Thịnh', email: 'thinhvd@mediphar.vn', requestType: 'ERASURE', status: 'IN_REVIEW', requestedAt: '2026-08-13' },
];

export const INITIAL_LEGAL_HOLDS: LegalHoldItem[] = [
  { id: 'lh-01', caseName: 'Thanh tra Sở TT&TT về An toàn Thông tin 2026', matterNumber: 'MAT-2026-009', custodian: 'Phòng Pháp chế & An ninh mạng', scope: 'Tất cả nhật ký kiểm toán và dữ liệu đối tác năm 2025-2026', status: 'ACTIVE', createdAt: '2026-07-01' },
];

export const mockPrivacyApi = {
  listConsents: async () => [...INITIAL_CONSENTS],
  listRetentionPolicies: async () => [...INITIAL_RETENTION_POLICIES],
  listDsr: async () => [...INITIAL_DSR],
  listLegalHolds: async () => [...INITIAL_LEGAL_HOLDS],
};
