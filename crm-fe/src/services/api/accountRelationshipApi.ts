import { apiFetch } from './apiClient';
import type { PageResult } from './accountApi';

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
  validFrom?: string | null;
  validTo?: string | null;
  description?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface CreateAccountRelationshipRequest {
  relatedAccountId: string;
  relationshipType: RelationshipType;
  validFrom?: string | null;
  validTo?: string | null;
  description?: string | null;
}

export interface EndAccountRelationshipRequest {
  validTo: string;
}

export const accountRelationshipApi = {
  async search(
    accountId: string,
    params?: { page?: number; size?: number },
    options?: { signal?: AbortSignal }
  ): Promise<PageResult<AccountRelationshipResponse>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';

    return apiFetch<PageResult<AccountRelationshipResponse>>(
      `/accounts/${accountId}/relationships${queryString}`,
      { signal: options?.signal }
    );
  },

  async create(
    accountId: string,
    payload: CreateAccountRelationshipRequest
  ): Promise<AccountRelationshipResponse> {
    return apiFetch<AccountRelationshipResponse>(
      `/accounts/${accountId}/relationships`,
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
    payload: EndAccountRelationshipRequest
  ): Promise<AccountRelationshipResponse> {
    return apiFetch<AccountRelationshipResponse>(
      `/accounts/${accountId}/relationships/${relationshipId}/end`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  },
};
