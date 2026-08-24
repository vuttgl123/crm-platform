import { apiFetch } from './apiClient';
import type { PageResult } from './accountApi';

export type LeadRating = 'HOT' | 'WARM' | 'COLD';
export type LeadOwnerType = 'USER' | 'TEAM';

export interface LeadOwner {
  type: LeadOwnerType;
  id: string;
}

export interface LeadEstimatedValue {
  amount: number;
  currencyCode: string;
}

export interface LeadSummaryResponse {
  id: string;
  leadNumber: string;
  statusId: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  companyName?: string | null;
  displayName: string;
  email?: string | null;
  phoneE164?: string | null;
  jobTitle?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  convertedAt?: string | null;
  updatedAt: string;
  version: number;
}

export interface LeadResponse {
  id: string;
  leadNumber: string;
  statusId: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  companyName?: string | null;
  displayName: string;
  email?: string | null;
  phoneE164?: string | null;
  jobTitle?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  convertedAt?: string | null;
  accountName?: string | null;
  honorific?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  website?: string | null;
  countryCode?: string | null;
  preferredLanguageCode?: string | null;
  qualificationNotes?: string | null;
  disqualificationReason?: string | null;
  convertedBy?: string | null;
  convertedAccountId?: string | null;
  convertedContactId?: string | null;
  convertedOpportunityId?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface LeadSearchParams {
  q?: string;
  statusId?: string;
  sourceId?: string;
  rating?: LeadRating;
  ownerType?: LeadOwnerType;
  ownerId?: string;
  converted?: boolean;
  page?: number;
  size?: number;
}

export interface CreateLeadRequest {
  leadNumber: string;
  statusId: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  accountName?: string | null;
  companyName?: string | null;
  honorific?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  displayName: string;
  email?: string | null;
  phoneE164?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  countryCode?: string | null;
  preferredLanguageCode?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  qualificationNotes?: string | null;
}

export interface UpdateLeadRequest {
  version: number;
  statusId: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  accountName?: string | null;
  companyName?: string | null;
  honorific?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  displayName: string;
  email?: string | null;
  phoneE164?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  countryCode?: string | null;
  preferredLanguageCode?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  qualificationNotes?: string | null;
  disqualificationReason?: string | null;
}

export interface ConvertLeadRequest {
  version: number;
  convertedAccountId?: string | null;
  convertedContactId?: string | null;
  convertedOpportunityId?: string | null;
  convertedStatusId?: string | null;
}

export interface LeadScoringResult {
  leadId: string;
  score: number;
  grade: LeadRating;
  scoringFactors?: string[];
  recommendedAction?: string;
}

export const leadApi = {
  async search(
    params: LeadSearchParams = {},
    options?: { signal?: AbortSignal }
  ): Promise<PageResult<LeadSummaryResponse>> {
    const query = new URLSearchParams();
    if (params.q?.trim()) query.append('q', params.q.trim());
    if (params.statusId) query.append('statusId', params.statusId);
    if (params.sourceId) query.append('sourceId', params.sourceId);
    if (params.rating) query.append('rating', params.rating);
    if (params.ownerType) query.append('ownerType', params.ownerType);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.converted !== undefined) query.append('converted', String(params.converted));
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/leads${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<LeadSummaryResponse>>(endpoint, {
      method: 'GET',
      signal: options?.signal,
    });
  },

  async get(id: string, options?: { signal?: AbortSignal }): Promise<LeadResponse> {
    return apiFetch<LeadResponse>(`/leads/${id}`, {
      method: 'GET',
      signal: options?.signal,
    });
  },

  async create(data: CreateLeadRequest): Promise<LeadResponse> {
    return apiFetch<LeadResponse>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateLeadRequest): Promise<LeadResponse> {
    return apiFetch<LeadResponse>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string, version: number): Promise<void> {
    return apiFetch<void>(`/leads/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  async convert(id: string, data: ConvertLeadRequest): Promise<LeadResponse> {
    return apiFetch<LeadResponse>(`/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async calculateScore(id: string): Promise<LeadScoringResult> {
    return apiFetch<LeadScoringResult>(`/leads/${id}/calculate-score`, {
      method: 'POST',
    });
  },

  async autoAssign(id: string): Promise<LeadResponse> {
    return apiFetch<LeadResponse>(`/leads/${id}/auto-assign`, {
      method: 'POST',
    });
  },
};
