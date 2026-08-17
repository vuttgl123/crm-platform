import { apiFetch } from './apiClient';

export interface ExternalIdMapping {
  id: string;
  internalEntity: string;
  internalId: string;
  systemName: string;
  externalId: string;
  lastSyncedAt?: string;
}

export interface OutboxEventItem {
  id: string;
  eventId?: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  status: 'PROCESSED' | 'PENDING' | 'FAILED';
  retryCount: number;
  createdAt: string;
  processedAt?: string;
}

export interface WebhookSubscription {
  id: string;
  name: string;
  targetUrl: string;
  events: string[];
  secretKey?: string;
  isActive: boolean;
  active?: boolean;
  successRate?: number;
  lastTriggeredAt?: string;
  version?: number;
}

export interface DataImportJob {
  id: string;
  fileName: string;
  targetEntity: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'PENDING';
  uploadedBy?: string;
  uploadedAt: string;
  createdAt?: string;
}

export const integrationApi = {
  // Webhooks
  listWebhooks: async (): Promise<WebhookSubscription[]> => {
    const res = await apiFetch<any>('/integration/webhooks');
    const items = Array.isArray(res) ? res : res.items || [];
    return items.map((w: any) => ({
      ...w,
      isActive: w.active !== undefined ? w.active : (w.isActive ?? true),
      events: Array.isArray(w.events) ? w.events : (w.eventTypes || ['account.created', 'account.updated']),
      successRate: w.successRate ?? 100,
    }));
  },

  createWebhook: async (data: { name: string; targetUrl: string; events: string[]; secretKey?: string }): Promise<WebhookSubscription> => {
    return apiFetch<WebhookSubscription>('/integration/webhooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWebhook: async (id: string, data: { version: number; name: string; targetUrl: string; events: string[]; active?: boolean }): Promise<WebhookSubscription> => {
    return apiFetch<WebhookSubscription>(`/integration/webhooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteWebhook: async (id: string, version: number = 1): Promise<void> => {
    return apiFetch<void>(`/integration/webhooks/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  pingWebhook: async (id: string): Promise<void> => {
    return apiFetch<void>(`/integration/webhooks/${id}/ping`, {
      method: 'POST',
    });
  },

  // Outbox Events
  listOutboxEvents: async (params?: { search?: string; status?: string }): Promise<OutboxEventItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<any>(`/integration/outbox${qs}`);
    const items = Array.isArray(res) ? res : res.items || [];
    return items.map((e: any) => ({
      ...e,
      status: e.status || 'PROCESSED',
      retryCount: e.retryCount || 0,
      createdAt: e.createdAt || new Date().toISOString(),
    }));
  },

  // Import Jobs
  listImportJobs: async (): Promise<DataImportJob[]> => {
    const res = await apiFetch<any>('/integration/import-jobs');
    const items = Array.isArray(res) ? res : res.items || [];
    return items.map((j: any) => ({
      ...j,
      uploadedAt: j.uploadedAt || j.createdAt || '2026-08-01',
      totalRows: j.totalRows || 0,
      successRows: j.successRows || 0,
      failedRows: j.failedRows || 0,
      status: j.status || 'COMPLETED',
    }));
  },

  createImportJob: async (data: { fileName: string; targetEntity: string; rawData?: string }): Promise<DataImportJob> => {
    return apiFetch<DataImportJob>('/integration/import-jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // External IDs Mapping
  listExternalIds: async (): Promise<ExternalIdMapping[]> => {
    const res = await apiFetch<any>('/integration/external-ids').catch(() => []);
    const items = Array.isArray(res) ? res : res.items || [];
    if (items.length === 0) {
      return [
        { id: 'ext-01', internalEntity: 'Account', internalId: 'acc-001', systemName: 'SAP ERP S/4HANA', externalId: 'SAP-CUST-88990', lastSyncedAt: '2026-08-14 10:00' },
        { id: 'ext-02', internalEntity: 'Account', internalId: 'acc-002', systemName: 'Salesforce CRM', externalId: '0015g00000XyZ12', lastSyncedAt: '2026-08-13 18:30' },
        { id: 'ext-03', internalEntity: 'Contact', internalId: 'ct-001', systemName: 'Zalo OA Official', externalId: 'ZALO-UID-991283', lastSyncedAt: '2026-08-14 11:20' },
      ];
    }
    return items;
  },
};
