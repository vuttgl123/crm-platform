import { apiFetch } from './apiClient';

export type AccountType = 'ORGANIZATION' | 'PERSON' | 'PARTNER' | 'RESELLER' | 'SUPPLIER';
export type AccountLifecycleStage = 'PROSPECT' | 'QUALIFIED' | 'CUSTOMER' | 'CHURNED' | 'INACTIVE';
export type OwnerType = 'USER' | 'TEAM';

export interface AccountOwner {
  type: OwnerType;
  id: string;
}

export interface AccountRevenue {
  amount: number;
  currencyCode: string;
}

export interface AccountSummaryResponse {
  id: string;
  accountNumber: string;
  displayName: string;
  legalName?: string | null;
  parentAccountId?: string | null;
  accountType: AccountType;
  lifecycleStage: AccountLifecycleStage;
  owner?: AccountOwner | null;
  doNotContact: boolean;
  updatedAt: string;
  version: number;
}

export interface AccountResponse extends AccountSummaryResponse {
  industryCode?: string | null;
  taxIdentifier?: string | null;
  registrationNumber?: string | null;
  website?: string | null;
  annualRevenue?: AccountRevenue | null;
  employeeCount?: number | null;
  description?: string | null;
  preferredLanguageCode?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AccountSearchParams {
  q?: string;
  accountType?: AccountType;
  lifecycleStage?: AccountLifecycleStage;
  ownerType?: OwnerType;
  ownerId?: string;
  page?: number;
  size?: number;
}

export interface CreateAccountRequest {
  accountNumber: string;
  accountType?: AccountType;
  legalName?: string | null;
  displayName: string;
  parentAccountId?: string | null;
  owner?: AccountOwner | null;
  lifecycleStage?: AccountLifecycleStage;
  industryCode?: string | null;
  taxIdentifier?: string | null;
  registrationNumber?: string | null;
  website?: string | null;
  annualRevenue?: AccountRevenue | null;
  employeeCount?: number | null;
  description?: string | null;
  preferredLanguageCode?: string | null;
  doNotContact?: boolean;
}

export interface UpdateAccountRequest {
  version: number;
  accountType: AccountType;
  displayName: string;
  lifecycleStage: AccountLifecycleStage;
  doNotContact: boolean;
  legalName?: string | null;
  parentAccountId?: string | null;
  owner?: AccountOwner | null;
  industryCode?: string | null;
  taxIdentifier?: string | null;
  registrationNumber?: string | null;
  website?: string | null;
  annualRevenue?: AccountRevenue | null;
  employeeCount?: number | null;
  description?: string | null;
  preferredLanguageCode?: string | null;
}

export const accountApi = {
  async search(
    params: AccountSearchParams = {},
    options?: { signal?: AbortSignal }
  ): Promise<PageResult<AccountSummaryResponse>> {
    const query = new URLSearchParams();
    if (params.q?.trim()) query.append('q', params.q.trim());
    if (params.accountType) query.append('accountType', params.accountType);
    if (params.lifecycleStage) query.append('lifecycleStage', params.lifecycleStage);
    if (params.ownerType && params.ownerId) {
      query.append('ownerType', params.ownerType);
      query.append('ownerId', params.ownerId);
    }
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/accounts${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<AccountSummaryResponse>>(endpoint, {
      method: 'GET',
      signal: options?.signal,
    });
  },

  async get(id: string, options?: { signal?: AbortSignal }): Promise<AccountResponse> {
    return apiFetch<AccountResponse>(`/accounts/${id}`, {
      method: 'GET',
      signal: options?.signal,
    });
  },

  async create(data: CreateAccountRequest): Promise<AccountResponse> {
    return apiFetch<AccountResponse>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateAccountRequest): Promise<AccountResponse> {
    return apiFetch<AccountResponse>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string, version: number): Promise<void> {
    return apiFetch<void>(`/accounts/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
