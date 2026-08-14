import { apiFetch } from './apiClient';

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
  opportunityNumber: string;
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner?: OpportunityOwner | null;
  sourceId?: string | null;
  primaryContactId?: string | null;
  opportunityType: OpportunityType;
  status: OpportunityStatus;
  amount: OpportunityAmount;
  probability: number;
  expectedCloseDate?: string | null;
  actualCloseDate?: string | null;
  nextStep?: string | null;
  description?: string | null;
  lostReasonId?: string | null;
  lostReasonNotes?: string | null;
  campaignId?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface OpportunitySummaryItem {
  id: string;
  opportunityNumber: string;
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner?: OpportunityOwner | null;
  opportunityType: OpportunityType;
  status: OpportunityStatus;
  amount: OpportunityAmount;
  probability: number;
  expectedCloseDate?: string | null;
  updatedAt: string;
  version: number;
}

export interface CreateOpportunityPayload {
  opportunityNumber: string;
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner?: OpportunityOwner | null;
  sourceId?: string | null;
  primaryContactId?: string | null;
  opportunityType?: OpportunityType;
  amount: OpportunityAmount;
  probability?: number;
  expectedCloseDate?: string | null;
  nextStep?: string | null;
  description?: string | null;
  campaignId?: string | null;
}

export interface UpdateOpportunityPayload {
  version: number;
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner?: OpportunityOwner | null;
  sourceId?: string | null;
  primaryContactId?: string | null;
  opportunityType?: OpportunityType;
  status?: OpportunityStatus;
  amount: OpportunityAmount;
  probability?: number;
  expectedCloseDate?: string | null;
  actualCloseDate?: string | null;
  nextStep?: string | null;
  description?: string | null;
  lostReasonId?: string | null;
  lostReasonNotes?: string | null;
  campaignId?: string | null;
}

export interface OpportunitySearchParams {
  q?: string;
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
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const opportunityApi = {
  async search(params: OpportunitySearchParams = {}): Promise<PageResult<OpportunitySummaryItem>> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.pipelineId) query.append('pipelineId', params.pipelineId);
    if (params.stageId) query.append('stageId', params.stageId);
    if (params.status) query.append('status', params.status);
    if (params.opportunityType) query.append('opportunityType', params.opportunityType);
    if (params.ownerType) query.append('ownerType', params.ownerType);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/opportunities${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<OpportunitySummaryItem>>(endpoint, { method: 'GET' });
  },

  async get(id: string): Promise<OpportunityItem> {
    return apiFetch<OpportunityItem>(`/opportunities/${id}`, { method: 'GET' });
  },

  async create(data: CreateOpportunityPayload): Promise<OpportunityItem> {
    return apiFetch<OpportunityItem>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateOpportunityPayload): Promise<OpportunityItem> {
    return apiFetch<OpportunityItem>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string, version: number): Promise<void> {
    return apiFetch<void>(`/opportunities/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
