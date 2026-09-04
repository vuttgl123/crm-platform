import { apiFetch } from './apiClient';
import type { PageResult } from './accountApi';

export type ContactLifecycleStage =
  | 'PROSPECT'
  | 'QUALIFIED'
  | 'CUSTOMER'
  | 'CHURNED'
  | 'INACTIVE';

export type PreferredContactChannel =
  | 'EMAIL'
  | 'PHONE'
  | 'MOBILE'
  | 'SMS'
  | 'WHATSAPP'
  | 'OTHER';

export type ContactOwnerType = 'USER' | 'TEAM';

export interface ContactOwner {
  type: ContactOwnerType;
  id: string;
}

export interface ContactSummaryResponse {
  id: string;
  contactNumber: string;
  accountId?: string | null;
  displayName: string;
  jobTitle?: string | null;
  department?: string | null;
  preferredContactChannel?: PreferredContactChannel | null;
  lifecycleStage: ContactLifecycleStage;
  owner?: ContactOwner | null;
  doNotContact: boolean;
  updatedAt: string;
  version: number;
}

export interface ContactResponse {
  id: string;
  contactNumber: string;
  accountId?: string | null;
  owner?: ContactOwner | null;
  honorific?: string | null;
  givenName?: string | null;
  middleName?: string | null;
  familyName?: string | null;
  displayName: string;
  jobTitle?: string | null;
  department?: string | null;
  preferredLanguageCode?: string | null;
  preferredContactChannel?: PreferredContactChannel | null;
  lifecycleStage: ContactLifecycleStage;
  dateOfBirth?: string | null;
  doNotContact: boolean;
  description?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface ContactSearchRequest {
  q?: string;
  accountId?: string;
  lifecycleStage?: ContactLifecycleStage;
  ownerType?: ContactOwnerType;
  ownerId?: string;
  page?: number;
  size?: number;
}

export interface CreateContactRequest {
  contactNumber: string;
  accountId?: string | null;
  owner?: ContactOwner | null;
  honorific?: string | null;
  givenName?: string | null;
  middleName?: string | null;
  familyName?: string | null;
  displayName: string;
  jobTitle?: string | null;
  department?: string | null;
  preferredLanguageCode?: string | null;
  preferredContactChannel?: PreferredContactChannel | null;
  lifecycleStage?: ContactLifecycleStage;
  dateOfBirth?: string | null;
  doNotContact?: boolean;
  description?: string | null;
}

export interface UpdateContactRequest {
  version: number;
  accountId?: string | null;
  owner?: ContactOwner | null;
  honorific?: string | null;
  givenName?: string | null;
  middleName?: string | null;
  familyName?: string | null;
  displayName: string;
  jobTitle?: string | null;
  department?: string | null;
  preferredLanguageCode?: string | null;
  preferredContactChannel?: PreferredContactChannel | null;
  lifecycleStage: ContactLifecycleStage;
  dateOfBirth?: string | null;
  doNotContact: boolean;
  description?: string | null;
}

export interface ContactStatsDto {
  totalContacts: number;
  primaryContactsCount: number;
  prospectContactsCount: number;
  qualifiedContactsCount: number;
  customerContactsCount: number;
  inactiveContactsCount: number;
  churnedContactsCount: number;
}

export interface SetPrimaryContactRequest {
  isPrimary: boolean;
  version: number;
}

export interface TransferContactAccountRequest {
  newAccountId: string;
  jobTitle?: string;
  version: number;
}

export interface BulkUpdateContactLifecycleRequest {
  contactIds: string[];
  lifecycleStage: ContactLifecycleStage;
}

export const contactApi = {
  async getStats(): Promise<ContactStatsDto> {
    return apiFetch<ContactStatsDto>('/contacts/stats', {
      method: 'GET',
    });
  },

  async search(
    params: ContactSearchRequest = {},
    options?: { signal?: AbortSignal }
  ): Promise<PageResult<ContactSummaryResponse>> {
    const query = new URLSearchParams();
    if (params.q?.trim()) query.append('q', params.q.trim());
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.lifecycleStage) query.append('lifecycleStage', params.lifecycleStage);
    if (params.ownerType) query.append('ownerType', params.ownerType);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/contacts${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<ContactSummaryResponse>>(endpoint, {
      method: 'GET',
      signal: options?.signal,
    });
  },

  async get(id: string, options?: { signal?: AbortSignal }): Promise<ContactResponse> {
    return apiFetch<ContactResponse>(`/contacts/${id}`, {
      method: 'GET',
      signal: options?.signal,
    });
  },

  async create(data: CreateContactRequest): Promise<ContactResponse> {
    return apiFetch<ContactResponse>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateContactRequest): Promise<ContactResponse> {
    return apiFetch<ContactResponse>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async setPrimary(id: string, data: SetPrimaryContactRequest): Promise<ContactResponse> {
    return apiFetch<ContactResponse>(`/contacts/${id}/set-primary`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async transferAccount(id: string, data: TransferContactAccountRequest): Promise<ContactResponse> {
    return apiFetch<ContactResponse>(`/contacts/${id}/transfer-account`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async bulkUpdateLifecycle(data: BulkUpdateContactLifecycleRequest): Promise<{ updatedCount: number }> {
    return apiFetch<{ updatedCount: number }>('/contacts/bulk/lifecycle', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string, version: number): Promise<void> {
    return apiFetch<void>(`/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
