import { apiFetch } from './apiClient';

export interface MembershipRequester {
  id: string;
  email: string;
  displayName: string;
}

export interface MembershipReviewer {
  id: string;
  displayName: string;
}

export interface MembershipRequestItem {
  id: string;
  requester: MembershipRequester;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: MembershipReviewer;
  reviewNote?: string;
  version: number;
}

export interface MembershipRequestPageResult {
  items: MembershipRequestItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SubmitMembershipRequest {
  tenantCode: string;
  message?: string;
}

export interface ApproveMembershipRequest {
  version: number;
  roleIds: string[];
  reviewNote?: string;
}

export interface RejectMembershipRequest {
  version: number;
  reason?: string;
}

export const membershipApi = {
  /**
   * GET /api/membership-requests - Search & list membership approval requests
   */
  async searchRequests(status?: string): Promise<MembershipRequestPageResult> {
    const query = status ? `?status=${status}` : '';
    return apiFetch<MembershipRequestPageResult>(`/membership-requests${query}`, { method: 'GET' });
  },

  /**
   * POST /api/membership-requests - Submit a request to join a corporation/tenant
   */
  async submitRequest(data: SubmitMembershipRequest): Promise<MembershipRequestItem> {
    return apiFetch<MembershipRequestItem>('/membership-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /api/membership-requests/{id}/approve - Approve membership request & assign roles
   */
  async approveRequest(id: string, data: ApproveMembershipRequest): Promise<unknown> {
    return apiFetch(`/membership-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /api/membership-requests/{id}/reject - Reject membership request
   */
  async rejectRequest(id: string, data: RejectMembershipRequest): Promise<MembershipRequestItem> {
    return apiFetch<MembershipRequestItem>(`/membership-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /api/membership-requests/users/{userId}/roles - Update active member role assignments in PostgreSQL DB
   */
  async updateMemberRoles(userId: string, roleIds: string[]): Promise<void> {
    return apiFetch<void>(`/membership-requests/users/${userId}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roleIds }),
    });
  },
};
