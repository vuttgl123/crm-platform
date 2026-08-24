import { apiFetch } from './apiClient';
import type { PageResult } from './accountApi';

export type { PageResult };

export type OpportunityStatus = 'OPEN' | 'WON' | 'LOST' | 'CANCELLED';

export type OpportunityType =
  | 'NEW_BUSINESS'
  | 'UPSELL'
  | 'CROSS_SELL'
  | 'RENEWAL'
  | 'PARTNERSHIP'
  | 'OTHER';

export type OpportunityOwnerType = 'USER' | 'TEAM';

export interface OpportunityOwner {
  type: OpportunityOwnerType;
  id: string;
}

export interface OpportunityAmount {
  amount: number;
  currencyCode: string;
}

export interface OpportunitySummaryResponse {
  id: string;
  opportunityNumber: string;
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner: OpportunityOwner | null;
  opportunityType: OpportunityType;
  status: OpportunityStatus;
  amount: OpportunityAmount;
  probability: number;
  expectedCloseDate: string | null;
  updatedAt: string;
  version: number;
}

export interface OpportunityResponse {
  id: string;
  opportunityNumber: string;
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner: OpportunityOwner | null;
  sourceId: string | null;
  primaryContactId: string | null;
  opportunityType: OpportunityType;
  status: OpportunityStatus;
  amount: OpportunityAmount;
  probability: number;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  nextStep: string | null;
  description: string | null;
  lostReasonId: string | null;
  lostReasonNotes: string | null;
  campaignId: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
  version: number;
}

export interface CreateOpportunityRequest {
  opportunityNumber?: string;
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner?: OpportunityOwner | null;
  sourceId?: string | null;
  primaryContactId?: string | null;
  opportunityType: OpportunityType;
  amount: OpportunityAmount;
  probability: number;
  expectedCloseDate?: string | null;
  nextStep?: string | null;
  description?: string | null;
  campaignId?: string | null;
}

export interface UpdateOpportunityRequest {
  version: number;
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner?: OpportunityOwner | null;
  sourceId?: string | null;
  primaryContactId?: string | null;
  opportunityType: OpportunityType;
  status?: OpportunityStatus;
  amount: OpportunityAmount;
  probability: number;
  expectedCloseDate?: string | null;
  actualCloseDate?: string | null;
  nextStep?: string | null;
  description?: string | null;
  lostReasonId?: string | null;
  lostReasonNotes?: string | null;
  campaignId?: string | null;
}

export type OpportunityTransitionAction =
  | 'MOVE_STAGE'
  | 'CHANGE_PIPELINE'
  | 'MARK_WON'
  | 'MARK_LOST'
  | 'CANCEL'
  | 'REOPEN';

export interface OpportunityTransitionRequest {
  version: number;
  action: OpportunityTransitionAction;
  targetPipelineId?: string;
  targetStageId?: string;
  actualCloseDate?: string;
  lostReasonId?: string;
  lostReasonNotes?: string | null;
  reason?: string | null;
}

export type OpportunityStageHistoryEventType =
  | 'STAGE_MOVED'
  | 'PIPELINE_CHANGED'
  | 'MARKED_WON'
  | 'MARKED_LOST'
  | 'CANCELLED'
  | 'REOPENED';

export interface OpportunityStageHistoryEntry {
  id: string;
  opportunityId: string;
  eventType: OpportunityStageHistoryEventType;
  fromPipelineId?: string;
  toPipelineId?: string;
  fromStageId?: string | null;
  toStageId?: string;
  fromStatus?: OpportunityStatus;
  toStatus?: OpportunityStatus;
  lostReasonId?: string | null;
  reason?: string | null;
  changedBy?: string | null;
  changedAt: string;
}

export interface OpportunityTransitionResponse {
  opportunity: OpportunityResponse;
  historyEntry?: OpportunityStageHistoryEntry;
}

export type OpportunityStakeholderRole =
  | 'DECISION_MAKER'
  | 'CHAMPION'
  | 'INFLUENCER'
  | 'PROCUREMENT'
  | 'TECHNICAL_EVALUATOR'
  | 'LEGAL'
  | 'OTHER';

export type OpportunityStakeholderInfluence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface OpportunityStakeholderResponse {
  id: string;
  opportunityId: string;
  contactId: string;
  role: OpportunityStakeholderRole;
  influenceLevel: OpportunityStakeholderInfluence | null;
  primary: boolean;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface CreateOpportunityStakeholderRequest {
  contactId: string;
  role: OpportunityStakeholderRole;
  influenceLevel?: OpportunityStakeholderInfluence | null;
  primary: boolean;
}

export interface UpdateOpportunityStakeholderRequest {
  version: number;
  role: OpportunityStakeholderRole;
  influenceLevel?: OpportunityStakeholderInfluence | null;
  primary: boolean;
}

export type { NoteVisibility } from './noteApi';
import type { NoteVisibility } from './noteApi';

export interface OpportunityNoteResponse {
  id: string;
  opportunityId: string;
  title: string | null;
  body: string;
  visibility: NoteVisibility;
  ownerId?: string;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface CreateOpportunityNoteRequest {
  title?: string | null;
  body: string;
  visibility: NoteVisibility;
}

export interface UpdateOpportunityNoteRequest {
  version: number;
  title?: string | null;
  body: string;
  visibility: NoteVisibility;
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
  forecastFrom?: string;
  forecastTo?: string;
  forecastCategory?: string;
  currencyCode?: string;
  forecastQuality?: string;
  page?: number;
  size?: number;
}

export const opportunityApi = {
  async search(params: OpportunitySearchParams = {}, signal?: AbortSignal): Promise<PageResult<OpportunitySummaryResponse>> {
    const query = new URLSearchParams();
    if (params.q?.trim()) query.append('q', params.q.trim());
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.pipelineId) query.append('pipelineId', params.pipelineId);
    if (params.stageId) query.append('stageId', params.stageId);
    if (params.status) query.append('status', params.status);
    if (params.opportunityType) query.append('opportunityType', params.opportunityType);
    if (params.ownerType && params.ownerId) {
      query.append('ownerType', params.ownerType);
      query.append('ownerId', params.ownerId);
    }
    if (params.forecastFrom) query.append('forecastFrom', params.forecastFrom);
    if (params.forecastTo) query.append('forecastTo', params.forecastTo);
    if (params.forecastCategory) query.append('forecastCategory', params.forecastCategory);
    if (params.currencyCode) query.append('currencyCode', params.currencyCode);
    if (params.forecastQuality) query.append('forecastQuality', params.forecastQuality);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/opportunities${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<OpportunitySummaryResponse>>(endpoint, { method: 'GET', signal });
  },

  async get(id: string): Promise<OpportunityResponse> {
    return apiFetch<OpportunityResponse>(`/opportunities/${id}`, { method: 'GET' });
  },

  async create(data: CreateOpportunityRequest): Promise<OpportunityResponse> {
    return apiFetch<OpportunityResponse>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateOpportunityRequest): Promise<OpportunityResponse> {
    return apiFetch<OpportunityResponse>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async transition(id: string, data: OpportunityTransitionRequest): Promise<OpportunityResponse> {
    // If backend transition endpoint is available, call it; otherwise execute atomic update
    try {
      const res = await apiFetch<OpportunityTransitionResponse | OpportunityResponse>(`/opportunities/${id}/transitions`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if ('opportunity' in res) {
        return res.opportunity;
      }
      return res as OpportunityResponse;
    } catch {
      // Fallback transition via direct update
      const existing = await this.get(id);
      let newStatus: OpportunityStatus = existing.status;
      let newStageId = existing.currentStageId;
      let newPipelineId = existing.pipelineId;
      let newProb = existing.probability;
      let actualClose = existing.actualCloseDate;
      let lostReason = existing.lostReasonId;
      let lostNotes = existing.lostReasonNotes;

      if (data.action === 'MOVE_STAGE' && data.targetStageId) {
        newStageId = data.targetStageId;
      } else if (data.action === 'CHANGE_PIPELINE' && data.targetPipelineId && data.targetStageId) {
        newPipelineId = data.targetPipelineId;
        newStageId = data.targetStageId;
      } else if (data.action === 'MARK_WON') {
        newStatus = 'WON';
        newProb = 100;
        actualClose = data.actualCloseDate || new Date().toISOString().split('T')[0];
        if (data.targetStageId) newStageId = data.targetStageId;
        lostReason = null;
        lostNotes = null;
      } else if (data.action === 'MARK_LOST') {
        newStatus = 'LOST';
        newProb = 0;
        actualClose = data.actualCloseDate || new Date().toISOString().split('T')[0];
        if (data.targetStageId) newStageId = data.targetStageId;
        lostReason = data.lostReasonId || null;
        lostNotes = data.lostReasonNotes || null;
      } else if (data.action === 'CANCEL') {
        newStatus = 'CANCELLED';
        newProb = 0;
        actualClose = data.actualCloseDate || new Date().toISOString().split('T')[0];
        lostReason = null;
        lostNotes = null;
      } else if (data.action === 'REOPEN') {
        newStatus = 'OPEN';
        actualClose = null;
        lostReason = null;
        lostNotes = null;
        if (data.targetPipelineId) newPipelineId = data.targetPipelineId;
        if (data.targetStageId) newStageId = data.targetStageId;
      }

      return this.update(id, {
        version: data.version,
        name: existing.name,
        accountId: existing.accountId,
        pipelineId: newPipelineId,
        currentStageId: newStageId,
        owner: existing.owner,
        sourceId: existing.sourceId,
        primaryContactId: existing.primaryContactId,
        opportunityType: existing.opportunityType,
        status: newStatus,
        amount: existing.amount,
        probability: newProb,
        expectedCloseDate: existing.expectedCloseDate,
        actualCloseDate: actualClose,
        nextStep: existing.nextStep,
        description: existing.description,
        lostReasonId: lostReason,
        lostReasonNotes: lostNotes,
        campaignId: existing.campaignId,
      });
    }
  },

  async delete(id: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/opportunities/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  // Stage History
  async listStageHistory(id: string, params: { page?: number; size?: number } = {}): Promise<PageResult<OpportunityStageHistoryEntry>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());
    const qs = query.toString();
    try {
      return await apiFetch<PageResult<OpportunityStageHistoryEntry>>(`/opportunities/${id}/stage-history${qs ? `?${qs}` : ''}`);
    } catch {
      return { items: [], page: 0, size: params.size || 20, totalElements: 0, totalPages: 0 };
    }
  },

  // Stakeholders
  async listStakeholders(id: string): Promise<OpportunityStakeholderResponse[]> {
    try {
      const res = await apiFetch<OpportunityStakeholderResponse[] | { items: OpportunityStakeholderResponse[] }>(`/opportunities/${id}/stakeholders`);
      return Array.isArray(res) ? res : res.items || [];
    } catch {
      return [];
    }
  },

  async addStakeholder(id: string, data: CreateOpportunityStakeholderRequest): Promise<OpportunityStakeholderResponse> {
    return apiFetch<OpportunityStakeholderResponse>(`/opportunities/${id}/stakeholders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStakeholder(
    id: string,
    stakeholderId: string,
    data: UpdateOpportunityStakeholderRequest
  ): Promise<OpportunityStakeholderResponse> {
    return apiFetch<OpportunityStakeholderResponse>(`/opportunities/${id}/stakeholders/${stakeholderId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteStakeholder(id: string, stakeholderId: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/opportunities/${id}/stakeholders/${stakeholderId}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  // Notes
  async listNotes(id: string, params: { page?: number; size?: number } = {}): Promise<PageResult<OpportunityNoteResponse>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());
    const qs = query.toString();
    try {
      return await apiFetch<PageResult<OpportunityNoteResponse>>(`/opportunities/${id}/notes${qs ? `?${qs}` : ''}`);
    } catch {
      return { items: [], page: 0, size: params.size || 20, totalElements: 0, totalPages: 0 };
    }
  },

  async createNote(id: string, data: CreateOpportunityNoteRequest): Promise<OpportunityNoteResponse> {
    return apiFetch<OpportunityNoteResponse>(`/opportunities/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateNote(id: string, noteId: string, data: UpdateOpportunityNoteRequest): Promise<OpportunityNoteResponse> {
    return apiFetch<OpportunityNoteResponse>(`/opportunities/${id}/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteNote(id: string, noteId: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/opportunities/${id}/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
