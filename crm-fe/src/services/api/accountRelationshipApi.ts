import { apiFetch } from './apiClient';
import { PageResult } from './accountApi';

export type RelationshipType =
  | 'PARENT_CHILD'
  | 'PARTNER'
  | 'AFFILIATE'
  | 'SUPPLIER'
  | 'CUSTOMER'
  | 'OTHER';

export type RelationshipDirection = 'OUTBOUND' | 'INBOUND';

export interface AccountRelationshipResponse {
  id: string;
  account: {
    id: string;
    accountNumber: string;
    displayName: string;
  };
  relatedAccount: {
    id: string;
    accountNumber: string;
    displayName: string;
  };
  direction: RelationshipDirection;
  relationshipType: RelationshipType;
  validFrom?: string;
  validTo?: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
}

export interface CreateAccountRelationshipRequest {
  relatedAccountId: string;
  relationshipType: RelationshipType;
  validFrom?: string;
  validTo?: string;
  description?: string;
}

export interface EndAccountRelationshipRequest {
  endDate?: string;
  reason?: string;
}

export const accountRelationshipApi = {
  async search(
    accountId: string,
    params?: { page?: number; size?: number }
  ): Promise<PageResult<AccountRelationshipResponse>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';

    return apiFetch<PageResult<AccountRelationshipResponse>>(
      `/api/accounts/${accountId}/relationships${queryString}`
    );
  },

  async create(
    accountId: string,
    payload: CreateAccountRelationshipRequest
  ): Promise<AccountRelationshipResponse> {
    return apiFetch<AccountRelationshipResponse>(
      `/api/accounts/${accountId}/relationships`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  },

  async end(
    accountId: string,
    relationshipId: string,
    payload?: EndAccountRelationshipRequest
  ): Promise<AccountRelationshipResponse> {
    return apiFetch<AccountRelationshipResponse>(
      `/api/accounts/${accountId}/relationships/${relationshipId}/end`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      }
    );
  },
};
