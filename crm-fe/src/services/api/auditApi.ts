import { apiFetch } from './apiClient';

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';
export type ActorType = 'USER' | 'SYSTEM' | 'INTEGRATION' | 'SUPPORT';
export type DataAccessType = 'VIEW' | 'EXPORT' | 'DOWNLOAD' | 'SEARCH' | 'DECRYPT';

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
};
