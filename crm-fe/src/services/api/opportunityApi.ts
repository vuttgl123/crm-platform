import { apiFetch } from './apiClient';

export type OpportunityStage =
  | 'PROSPECTING'
  | 'QUALIFICATION'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type OpportunityType =
  | 'NEW_BUSINESS'
  | 'UPSELL'
  | 'CROSS_SELL'
  | 'RENEWAL'
  | 'PARTNERSHIP'
  | 'OTHER';

export type OpportunityStatus = 'OPEN' | 'WON' | 'LOST' | 'CANCELLED';
export type OpportunityOwnerType = 'USER' | 'TEAM';

export interface OpportunityOwner {
  type: OpportunityOwnerType;
  id: string;
}

export interface OpportunityAmount {
  amount: number;
  currencyCode: string;
}

export interface OpportunityItem {
  id: string;
  opportunityNumber?: string;
  name?: string;
  dealName: string; // alias
  accountId: string;
  accountName?: string;
  contactName?: string;
  pipelineId?: string;
  currentStageId?: string;
  owner?: OpportunityOwner | null;
  sourceId?: string | null;
  primaryContactId?: string | null;
  opportunityType?: OpportunityType;
  status?: OpportunityStatus;
  stage: OpportunityStage;
  amount: number;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string | null;
  assignedTo: string;
  leadSource?: string;
  nextStep?: string | null;
  description?: string | null;
  lostReasonId?: string | null;
  lostReasonNotes?: string | null;
  campaignId?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
  version: number;
}

export interface OpportunitySummaryItem {
  id: string;
  opportunityNumber: string;
  name: string;
  dealName?: string;
  accountId: string;
  accountName?: string;
  pipelineId: string;
  currentStageId: string;
  owner?: OpportunityOwner | null;
  opportunityType: OpportunityType;
  status: OpportunityStatus;
  stage?: OpportunityStage;
  amount: number;
  probability: number;
  expectedCloseDate: string;
  updatedAt: string;
  version: number;
}

export interface CreateOpportunityPayload {
  opportunityNumber?: string;
  name?: string;
  dealName?: string;
  accountId: string;
  pipelineId?: string;
  currentStageId?: string;
  owner?: OpportunityOwner | null;
  sourceId?: string | null;
  primaryContactId?: string | null;
  opportunityType?: OpportunityType;
  amount: number | OpportunityAmount;
  probability?: number;
  expectedCloseDate?: string | null;
  nextStep?: string | null;
  description?: string | null;
  campaignId?: string | null;
  stage?: OpportunityStage;
  accountName?: string;
  contactName?: string;
  assignedTo?: string;
  leadSource?: string;
}

export interface UpdateOpportunityPayload {
  version: number;
  name?: string;
  dealName?: string;
  accountId?: string;
  pipelineId?: string;
  currentStageId?: string;
  owner?: OpportunityOwner | null;
  sourceId?: string | null;
  primaryContactId?: string | null;
  opportunityType?: OpportunityType;
  status?: OpportunityStatus;
  stage?: OpportunityStage;
  amount?: number | OpportunityAmount;
  probability?: number;
  expectedCloseDate?: string | null;
  actualCloseDate?: string | null;
  nextStep?: string | null;
  description?: string | null;
  lostReasonId?: string | null;
  lostReasonNotes?: string | null;
  campaignId?: string | null;
  accountName?: string;
  contactName?: string;
  assignedTo?: string;
}

export interface OpportunitySearchParams {
  q?: string;
  search?: string;
  stage?: string;
  accountId?: string;
  pipelineId?: string;
  stageId?: string;
  status?: OpportunityStatus;
  opportunityType?: OpportunityType;
  ownerType?: OpportunityOwnerType;
  ownerId?: string;
  page?: number;
  size?: number;
}

export interface PageResult<T> {
  items: T[];
  content?: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const PIPELINE_STAGES: { id: OpportunityStage; title: string; defaultProb: number; colorClass: string }[] = [
  { id: 'PROSPECTING', title: 'Khám phá nhu cầu', defaultProb: 15, colorClass: 'border-t-purple-500 bg-purple-50/20' },
  { id: 'QUALIFICATION', title: 'Đánh giá giải pháp', defaultProb: 35, colorClass: 'border-t-blue-500 bg-blue-50/20' },
  { id: 'PROPOSAL', title: 'Báo giá & Đề xuất', defaultProb: 60, colorClass: 'border-t-sky-500 bg-sky-50/20' },
  { id: 'NEGOTIATION', title: 'Đàm phán hợp đồng', defaultProb: 80, colorClass: 'border-t-amber-500 bg-amber-50/20' },
  { id: 'CLOSED_WON', title: 'Chốt thành công', defaultProb: 100, colorClass: 'border-t-emerald-500 bg-emerald-50/20' },
  { id: 'CLOSED_LOST', title: 'Thất bại', defaultProb: 0, colorClass: 'border-t-rose-500 bg-rose-50/20' },
];

function normalizeOpportunity<T extends Partial<any>>(item: T): OpportunityItem {
  const dealName = item.dealName || item.name || 'Cơ hội kinh doanh';
  const rawAmount = typeof item.amount === 'object' ? item.amount?.amount : item.amount;
  const numAmount = typeof rawAmount === 'number' ? rawAmount : (parseFloat(rawAmount) || 0);
  const stage = (item.stage || (item.status === 'WON' ? 'CLOSED_WON' : item.status === 'LOST' ? 'CLOSED_LOST' : 'PROSPECTING')) as OpportunityStage;

  return {
    ...item,
    id: item.id || '',
    opportunityNumber: item.opportunityNumber || `OPP-${item.id?.slice(-4) || '000'}`,
    name: dealName,
    dealName,
    accountId: item.accountId || '',
    accountName: item.accountName || 'Khách hàng doanh nghiệp',
    contactName: item.contactName || 'Người liên hệ',
    amount: numAmount,
    stage,
    probability: item.probability ?? 50,
    expectedCloseDate: item.expectedCloseDate || new Date().toISOString().split('T')[0],
    assignedTo: item.assignedTo || 'Phạm Tuấn Vũ',
    leadSource: item.leadSource || 'WEBSITE',
    createdAt: item.createdAt || new Date().toISOString(),
    version: item.version || 1,
  };
}

export const opportunityApi = {
  async search(params: OpportunitySearchParams = {}): Promise<PageResult<OpportunityItem>> {
    const query = new URLSearchParams();
    const q = params.q || params.search;
    if (q) query.append('q', q);
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.pipelineId) query.append('pipelineId', params.pipelineId);
    if (params.stageId) query.append('stageId', params.stageId);
    if (params.status) query.append('status', params.status);
    if (params.opportunityType) query.append('opportunityType', params.opportunityType);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/opportunities${queryString ? `?${queryString}` : ''}`;
    const res = await apiFetch<any>(endpoint, { method: 'GET' });

    const rawItems: any[] = Array.isArray(res) ? res : res.items || res.content || [];
    let items = rawItems.map(normalizeOpportunity);

    if (params.stage && params.stage !== 'ALL') {
      items = items.filter((o) => o.stage === params.stage);
    }

    return {
      items,
      content: items,
      page: res.page ?? res.pageNumber ?? 0,
      size: res.size ?? res.pageSize ?? 10,
      totalElements: res.totalElements ?? items.length,
      totalPages: res.totalPages ?? 1,
    };
  },

  async list(params: OpportunitySearchParams = {}): Promise<{ content: OpportunityItem[]; totalElements: number; totalPages: number; page: number; size: number }> {
    const res = await this.search(params);
    return {
      content: res.items,
      totalElements: res.totalElements,
      totalPages: res.totalPages,
      page: res.page,
      size: res.size,
    };
  },

  async getAllForKanban(): Promise<OpportunityItem[]> {
    const res = await this.search({ size: 100 });
    return res.items;
  },

  async get(id: string): Promise<OpportunityItem> {
    const res = await apiFetch<any>(`/opportunities/${id}`, { method: 'GET' });
    return normalizeOpportunity(res);
  },

  async create(data: CreateOpportunityPayload): Promise<OpportunityItem> {
    const dealName = data.dealName || data.name || 'Cơ hội mới';
    const rawAmt = typeof data.amount === 'object' ? data.amount.amount : data.amount;
    const numAmt = typeof rawAmt === 'number' ? rawAmt : (parseFloat(rawAmt as any) || 0);

    const payload = {
      opportunityNumber: data.opportunityNumber || `OPP-${Date.now().toString().slice(-6)}`,
      name: dealName,
      accountId: data.accountId || 'acc-001',
      pipelineId: data.pipelineId || '80000000-0000-0000-0000-000000000001',
      currentStageId: data.currentStageId || '81000000-0000-0000-0000-000000000001',
      opportunityType: data.opportunityType || 'NEW_BUSINESS',
      amount: { amount: numAmt, currencyCode: 'VND' },
      probability: data.probability || 20,
      expectedCloseDate: data.expectedCloseDate,
      nextStep: data.nextStep,
      description: data.description,
    };
    const res = await apiFetch<any>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeOpportunity({ ...res, ...data });
  },

  async update(id: string, data: UpdateOpportunityPayload): Promise<OpportunityItem> {
    const dealName = data.dealName || data.name || 'Cơ hội';
    const rawAmt = typeof data.amount === 'object' ? data.amount.amount : data.amount;
    const numAmt = typeof rawAmt === 'number' ? rawAmt : (parseFloat(rawAmt as any) || 0);

    const payload = {
      version: data.version || 1,
      name: dealName,
      accountId: data.accountId || 'acc-001',
      pipelineId: data.pipelineId || '80000000-0000-0000-0000-000000000001',
      currentStageId: data.currentStageId || '81000000-0000-0000-0000-000000000001',
      opportunityType: data.opportunityType || 'NEW_BUSINESS',
      amount: { amount: numAmt, currencyCode: 'VND' },
      probability: data.probability || 50,
      expectedCloseDate: data.expectedCloseDate,
      nextStep: data.nextStep,
      description: data.description,
    };
    const res = await apiFetch<any>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeOpportunity({ ...res, ...data });
  },

  async changeStage(id: string, stage: OpportunityStage, defaultProb: number): Promise<OpportunityItem> {
    const opp = await this.get(id);
    return this.update(id, {
      ...opp,
      version: opp.version,
      stage,
      probability: defaultProb,
    });
  },

  async delete(id: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/opportunities/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
