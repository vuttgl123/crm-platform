export interface ExternalIdMapping {
  id: string;
  internalEntity: string;
  internalId: string;
  systemName: string;
  externalId: string;
  lastSyncedAt: string;
}

export interface OutboxEventItem {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  status: 'PROCESSED' | 'PENDING' | 'FAILED';
  retryCount: number;
  createdAt: string;
}

export interface WebhookSubscription {
  id: string;
  name: string;
  targetUrl: string;
  events: string[];
  secretKey: string;
  isActive: boolean;
  successRate: number;
  lastTriggeredAt?: string;
}

export interface DataImportJob {
  id: string;
  fileName: string;
  targetEntity: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  uploadedBy: string;
  uploadedAt: string;
}

export const INITIAL_EXTERNAL_IDS: ExternalIdMapping[] = [
  { id: 'ext-01', internalEntity: 'Account', internalId: 'acc-001', systemName: 'SAP ERP S/4HANA', externalId: 'SAP-CUST-88990', lastSyncedAt: '2026-08-14 10:00' },
  { id: 'ext-02', internalEntity: 'Account', internalId: 'acc-002', systemName: 'Salesforce CRM (Cũ)', externalId: '0015g00000XyZ12', lastSyncedAt: '2026-08-13 18:30' },
  { id: 'ext-03', internalEntity: 'Contact', internalId: 'ct-001', systemName: 'Zalo OA Official', externalId: 'ZALO-UID-991283', lastSyncedAt: '2026-08-14 11:20' },
];

export const INITIAL_OUTBOX_EVENTS: OutboxEventItem[] = [
  { id: 'ev-01', eventType: 'ACCOUNT_CREATED', aggregateType: 'Account', aggregateId: 'acc-001', status: 'PROCESSED', retryCount: 0, createdAt: '2026-08-14 11:30:00' },
  { id: 'ev-02', eventType: 'OPPORTUNITY_STAGE_CHANGED', aggregateType: 'Opportunity', aggregateId: 'opp-001', status: 'PROCESSED', retryCount: 0, createdAt: '2026-08-14 11:20:15' },
  { id: 'ev-03', eventType: 'INVOICE_GENERATED', aggregateType: 'Order', aggregateId: 'ord-002', status: 'PENDING', retryCount: 0, createdAt: '2026-08-14 11:45:10' },
];

export const INITIAL_WEBHOOKS: WebhookSubscription[] = [
  { id: 'wh-01', name: 'Đồng bộ hóa Khách hàng mới sang ERP MISA', targetUrl: 'https://api.misa.vn/crm/v1/sync-account', events: ['account.created', 'account.updated'], secretKey: 'whsec_misa_live_9921', isActive: true, successRate: 99.8, lastTriggeredAt: '2026-08-14 11:30' },
  { id: 'wh-02', name: 'Thông báo Tin nhắn Zalo ZNS khi Đơn hàng hoàn tất', targetUrl: 'https://webhook.zalo.me/v3/zns/trigger', events: ['order.delivered'], secretKey: 'whsec_zalo_88231', isActive: true, successRate: 100, lastTriggeredAt: '2026-08-14 09:15' },
];

export const INITIAL_IMPORT_JOBS: DataImportJob[] = [
  { id: 'imp-01', fileName: 'danh_sach_khach_hang_vnr500_2026.xlsx', targetEntity: 'Khách hàng (Accounts)', totalRows: 500, successRows: 498, failedRows: 2, status: 'COMPLETED', uploadedBy: 'Phạm Tuấn Vũ', uploadedAt: '2026-08-01 08:30' },
  { id: 'imp-02', fileName: 'lead_hoi_thao_chuyen_doi_so.csv', targetEntity: 'Khách tiềm năng (Leads)', totalRows: 150, successRows: 150, failedRows: 0, status: 'COMPLETED', uploadedBy: 'Trần Thị Mai', uploadedAt: '2026-08-10 14:20' },
];

export const mockIntegrationApi = {
  listExternalIds: async () => [...INITIAL_EXTERNAL_IDS],
  listOutboxEvents: async () => [...INITIAL_OUTBOX_EVENTS],
  listWebhooks: async () => [...INITIAL_WEBHOOKS],
  listImportJobs: async () => [...INITIAL_IMPORT_JOBS],
};
