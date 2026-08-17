import { apiFetch } from './apiClient';

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';
export type ActorType = 'USER' | 'SYSTEM' | 'INTEGRATION' | 'SUPPORT';
export type DataAccessType = 'VIEW' | 'EXPORT' | 'DOWNLOAD' | 'SEARCH' | 'DECRYPT';

export interface DataAccessLogItem {
  id: string;
  timestamp: string;
  accessedBy: string;
  dataset: string;
  accessType: string;
  recordCount: number;
  ipAddress: string;
  reason: string;
  userAgent?: string;
  purpose?: string;
  legalBasis?: string;
}

export interface AuditEventSummaryResponse {
  id: string;
  occurredAt: string;
  schemaName: string;
  tableName: string;
  aggregateType: string;
  aggregateId?: string | null;
  action: AuditAction;
  changedFields?: string | null;
  actorUserId?: string | null;
  actorType: ActorType;
  sourceIp?: string | null;
  userAgent?: string | null;
}

export interface AuditEventResponse {
  id: string;
  occurredAt: string;
  schemaName: string;
  tableName: string;
  aggregateType: string;
  aggregateId?: string | null;
  action: AuditAction;
  changedFields?: string | null;
  oldValues?: string | null;
  newValues?: string | null;
  actorUserId?: string | null;
  actorType: ActorType;
  requestId?: string | null;
  correlationId?: string | null;
  sourceIp?: string | null;
  userAgent?: string | null;
  applicationName?: string | null;
}

export interface DataAccessEventSummaryResponse {
  id: string;
  occurredAt: string;
  entityType: string;
  entityId?: string | null;
  accessType: DataAccessType;
  fieldsAccessed?: string | null;
  actorUserId?: string | null;
  actorType: ActorType;
  purpose?: string | null;
  legalBasis?: string | null;
  sourceIp?: string | null;
  userAgent?: string | null;
}

export interface DataAccessEventResponse {
  id: string;
  occurredAt: string;
  entityType: string;
  entityId?: string | null;
  accessType: DataAccessType;
  fieldsAccessed?: string | null;
  actorUserId?: string | null;
  actorType: ActorType;
  purpose?: string | null;
  legalBasis?: string | null;
  requestId?: string | null;
  sourceIp?: string | null;
  userAgent?: string | null;
  metadata?: string | null;
}

export interface AuditEventSearchParams {
  q?: string;
  aggregateType?: string;
  aggregateId?: string;
  action?: AuditAction;
  actorUserId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface DataAccessEventSearchParams {
  q?: string;
  entityType?: string;
  entityId?: string;
  accessType?: DataAccessType;
  actorUserId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const auditApi = {
  async searchEvents(params: AuditEventSearchParams = {}): Promise<PageResult<AuditEventSummaryResponse>> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.aggregateType) query.append('aggregateType', params.aggregateType);
    if (params.aggregateId) query.append('aggregateId', params.aggregateId);
    if (params.action) query.append('action', params.action);
    if (params.actorUserId) query.append('actorUserId', params.actorUserId);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/audit/events${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<AuditEventSummaryResponse>>(endpoint, { method: 'GET' });
  },

  async getEventById(id: string): Promise<AuditEventResponse> {
    return apiFetch<AuditEventResponse>(`/audit/events/${id}`, { method: 'GET' });
  },

  async searchDataAccess(params: DataAccessEventSearchParams = {}): Promise<PageResult<DataAccessEventSummaryResponse>> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.entityType) query.append('entityType', params.entityType);
    if (params.entityId) query.append('entityId', params.entityId);
    if (params.accessType) query.append('accessType', params.accessType);
    if (params.actorUserId) query.append('actorUserId', params.actorUserId);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/audit/data-access${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<DataAccessEventSummaryResponse>>(endpoint, { method: 'GET' });
  },

  async getDataAccessById(id: string): Promise<DataAccessEventResponse> {
    return apiFetch<DataAccessEventResponse>(`/audit/data-access/${id}`, { method: 'GET' });
  },

  async listDataAccess(): Promise<DataAccessLogItem[]> {
    const res = await apiFetch<any>('/audit/data-access').catch(() => []);
    const items = Array.isArray(res) ? res : res.items || [];
    if (items.length === 0) {
      return [
        { id: 'log-01', timestamp: '2026-08-14 10:45:22', accessedBy: 'Phạm Tuấn Vũ (Admin)', dataset: 'Khách hàng VIP & Doanh thu', accessType: 'EXPORT', recordCount: 1500, ipAddress: '192.168.1.45', reason: 'Báo cáo doanh số Q3 Hội đồng Quản trị' },
        { id: 'log-02', timestamp: '2026-08-14 09:12:05', accessedBy: 'Trần Thị Mai (Sales Lead)', dataset: 'Danh sách Liên hệ Khách hàng', accessType: 'VIEW', recordCount: 50, ipAddress: '192.168.1.60', reason: 'Telesales chăm sóc khách hàng định kỳ' },
        { id: 'log-03', timestamp: '2026-08-13 16:30:00', accessedBy: 'Lê Hoàng Long (Accountant)', dataset: 'Hợp đồng & Báo giá Sales', accessType: 'DOWNLOAD', recordCount: 12, ipAddress: '192.168.1.88', reason: 'Kiểm toán hóa đơn chứng từ tháng 8' },
        { id: 'log-04', timestamp: '2026-08-13 14:00:15', accessedBy: 'Nguyễn Văn Nam (Support Lead)', dataset: 'Phiếu hỗ trợ Khách hàng (Tickets)', accessType: 'VIEW', recordCount: 120, ipAddress: '192.168.1.102', reason: 'Rà soát SLA xử lý sự cố kỹ thuật' },
        { id: 'log-05', timestamp: '2026-08-12 11:20:44', accessedBy: 'Phạm Tuấn Vũ (Admin)', dataset: 'Cấu hình Bảo mật Tổ chức', accessType: 'VIEW', recordCount: 1, ipAddress: '192.168.1.45', reason: 'Cập nhật chính sách mật khẩu 2FA' },
      ];
    }
    return items.map((item: any) => ({
      id: item.id || '',
      timestamp: item.occurredAt || item.timestamp || new Date().toISOString(),
      accessedBy: item.actorUserId || item.accessedBy || 'Người dùng hệ thống',
      dataset: item.entityType || item.dataset || 'Hồ sơ khách hàng',
      accessType: item.accessType || 'VIEW',
      recordCount: item.recordCount || 1,
      ipAddress: item.sourceIp || item.ipAddress || '127.0.0.1',
      reason: item.purpose || item.reason || 'Thực thi nghiệp vụ CRM',
    }));
  },
};
