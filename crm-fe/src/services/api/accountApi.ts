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

export interface AccountResponse {
  id: string;
  accountNumber: string;
  accountType: AccountType;
  legalName?: string | null;
  displayName: string;
  parentAccountId?: string | null;
  owner?: AccountOwner | null;
  lifecycleStage: AccountLifecycleStage;
  industryCode?: string | null;
  taxIdentifier?: string | null;
  registrationNumber?: string | null;
  website?: string | null;
  annualRevenue?: AccountRevenue | null;
  employeeCount?: number | null;
  description?: string | null;
  preferredLanguageCode?: string | null;
  doNotContact: boolean;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
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

export interface PageResult<T> {
  items: T[];
  content?: T[];
  page: number;
  size: number;
  totalElements: number;
  totalItems?: number;
  totalPages: number;
}

export interface CreateAccountRequest {
  accountNumber: string;
  accountType?: AccountType;
  legalName?: string;
  displayName: string;
  parentAccountId?: string;
  owner?: AccountOwner;
  lifecycleStage?: AccountLifecycleStage;
  industryCode?: string;
  taxIdentifier?: string;
  registrationNumber?: string;
  website?: string;
  annualRevenue?: AccountRevenue;
  employeeCount?: number;
  description?: string;
  preferredLanguageCode?: string;
  doNotContact?: boolean;
}

export interface UpdateAccountRequest {
  version: number;
  accountType: AccountType;
  displayName: string;
  lifecycleStage: AccountLifecycleStage;
  doNotContact: boolean;
  legalName?: string;
  parentAccountId?: string;
  owner?: AccountOwner;
  industryCode?: string;
  taxIdentifier?: string;
  registrationNumber?: string;
  website?: string;
  annualRevenue?: AccountRevenue;
  employeeCount?: number;
  description?: string;
  preferredLanguageCode?: string;
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

export const accountApi = {
  /**
   * Search / List accounts from backend GET /api/accounts
   */
  async search(params: AccountSearchParams = {}): Promise<PageResult<AccountSummaryResponse>> {
    const query = new window.URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.accountType) query.append('accountType', params.accountType);
    if (params.lifecycleStage) query.append('lifecycleStage', params.lifecycleStage);
    if (params.ownerType) query.append('ownerType', params.ownerType);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/accounts${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<AccountSummaryResponse>>(endpoint, { method: 'GET' });
  },

  /**
   * Get single account details from backend GET /api/accounts/{id}
   */
  async get(id: string): Promise<AccountResponse> {
    return apiFetch<AccountResponse>(`/accounts/${id}`, { method: 'GET' });
  },

  /**
   * Create account in backend POST /api/accounts
   */
  async create(data: CreateAccountRequest): Promise<AccountResponse> {
    return apiFetch<AccountResponse>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update account in backend PUT /api/accounts/{id}
   */
  async update(id: string, data: UpdateAccountRequest): Promise<AccountResponse> {
    return apiFetch<AccountResponse>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete account in backend DELETE /api/accounts/{id} with If-Match version header
   */
  async delete(id: string, version: number): Promise<void> {
    return apiFetch<void>(`/accounts/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
