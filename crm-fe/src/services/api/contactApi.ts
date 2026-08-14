import { apiFetch } from './apiClient';

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

export interface ContactItem {
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

export interface ContactSummaryItem {
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

export interface CreateContactPayload {
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

export interface UpdateContactPayload {
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

export interface ContactSearchParams {
  q?: string;
  accountId?: string;
  lifecycleStage?: ContactLifecycleStage;
  ownerType?: ContactOwnerType;
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

export const contactApi = {
  async search(params: ContactSearchParams = {}): Promise<PageResult<ContactSummaryItem>> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.lifecycleStage) query.append('lifecycleStage', params.lifecycleStage);
    if (params.ownerType) query.append('ownerType', params.ownerType);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/contacts${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<ContactSummaryItem>>(endpoint, { method: 'GET' });
  },

  async get(id: string): Promise<ContactItem> {
    return apiFetch<ContactItem>(`/contacts/${id}`, { method: 'GET' });
  },

  async create(data: CreateContactPayload): Promise<ContactItem> {
    return apiFetch<ContactItem>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateContactPayload): Promise<ContactItem> {
    return apiFetch<ContactItem>(`/contacts/${id}`, {
      method: 'PUT',
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
