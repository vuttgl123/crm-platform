import { apiFetch } from './apiClient';

export interface ConsentItem {
  id: string;
  contactId?: string;
  contactName?: string;
  email: string;
  purpose: string;
  status: 'GRANTED' | 'REVOKED';
  grantedAt?: string;
  revokedAt?: string;
  ipAddress?: string;
  createdAt?: string;
}

export interface RetentionPolicyItem {
  id: string;
  policyCode?: string;
  name?: string;
  dataType?: string;
  durationYears?: number;
  retentionMonths?: number;
  actionAfterExpiry?: 'ARCHIVE' | 'PERMANENT_DELETE' | 'ANONYMIZE';
  action?: string;
  active?: boolean;
  isActive?: boolean;
  lastRunDate?: string;
  lastExecutedAt?: string;
}

export interface DsrItem {
  id: string;
  ticketNumber?: string;
  requestNumber?: string;
  requesterName: string;
  email: string;
  requestType: 'EXPORT_DATA' | 'ERASURE' | 'RECTIFICATION';
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED';
  requestedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

export interface LegalHoldItem {
  id: string;
  caseName?: string;
  holdName?: string;
  matterNumber?: string;
  caseNumber?: string;
  custodian?: string;
  scope?: string;
  description?: string;
  status: 'ACTIVE' | 'RELEASED';
  createdAt?: string;
}

export const privacyApi = {
  // Consents
  listConsents: async (params?: { search?: string }): Promise<ConsentItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<any>(`/privacy/consents${qs}`);
    const items = Array.isArray(res) ? res : res.items || [];
    return items.map((item: any) => ({
      ...item,
      contactName: item.contactName || item.email?.split('@')[0] || 'Khách hàng',
      ipAddress: item.ipAddress || '127.0.0.1',
      grantedAt: item.grantedAt || item.createdAt || new Date().toISOString(),
    }));
  },

  createConsent: async (data: { email: string; purpose: string; status: 'GRANTED' | 'REVOKED'; contactId?: string }): Promise<ConsentItem> => {
    return apiFetch<ConsentItem>('/privacy/consents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Retention Policies
  listRetentionPolicies: async (): Promise<RetentionPolicyItem[]> => {
    const res = await apiFetch<any>('/privacy/retention-policies');
    const items = Array.isArray(res) ? res : res.items || [];
    return items.map((p: any) => ({
      ...p,
      dataType: p.name || p.dataType || p.policyCode || 'Dữ liệu hệ thống',
      durationYears: p.durationYears || Math.round((p.retentionMonths || 36) / 12),
      actionAfterExpiry: p.action || p.actionAfterExpiry || 'ARCHIVE',
      isActive: p.active !== undefined ? p.active : true,
      lastRunDate: p.lastExecutedAt || p.lastRunDate || '2026-08-01',
    }));
  },

  // DSR
  listDsr: async (params?: { search?: string }): Promise<DsrItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<any>(`/privacy/dsr${qs}`);
    const items = Array.isArray(res) ? res : res.items || [];
    return items.map((d: any) => ({
      ...d,
      ticketNumber: d.requestNumber || d.ticketNumber || `DSR-${d.id?.slice(-4) || '0000'}`,
      requestedAt: d.requestedAt || d.createdAt || '2026-08-01',
    }));
  },

  createDsr: async (data: { requesterName: string; email: string; requestType: string; description?: string }): Promise<DsrItem> => {
    return apiFetch<DsrItem>('/privacy/dsr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Legal Holds
  listLegalHolds: async (): Promise<LegalHoldItem[]> => {
    const res = await apiFetch<any>('/privacy/legal-holds');
    const items = Array.isArray(res) ? res : res.items || [];
    return items.map((lh: any) => ({
      ...lh,
      caseName: lh.holdName || lh.caseName || 'Hồ sơ pháp lý',
      matterNumber: lh.caseNumber || lh.matterNumber || `MAT-${lh.id?.slice(-4) || '000'}`,
      custodian: lh.custodian || 'Phòng Pháp chế & An ninh',
      scope: lh.description || lh.scope || 'Toàn bộ dữ liệu',
      createdAt: lh.createdAt || '2026-08-01',
    }));
  },

  createLegalHold: async (data: { holdName: string; caseNumber: string; custodian?: string; description?: string }): Promise<LegalHoldItem> => {
    return apiFetch<LegalHoldItem>('/privacy/legal-holds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
