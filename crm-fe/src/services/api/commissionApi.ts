import { apiFetch } from './apiClient';

export interface SalesCommissionItem {
  id: string;
  salesRepName: string;
  period: string;
  totalClosedRevenue: number;
  targetQuota: number;
  quotaAttainmentPercent: number;
  baseCommissionPercent: number;
  baseCommissionAmount: number;
  kickerBonusAmount: number;
  totalPayoutAmount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PAID';
  approvedBy?: string;
  calculatedAt: string;
}

export interface CalculateCommissionPayload {
  period?: string;
  salesRepName?: string;
  targetQuota?: number;
}

export interface ApproveCommissionPayload {
  note?: string;
}

export const commissionApi = {
  async list(period?: string): Promise<SalesCommissionItem[]> {
    const query = period ? `?period=${encodeURIComponent(period)}` : '';
    return apiFetch<SalesCommissionItem[]>(`/sales/commissions${query}`, {
      method: 'GET',
    });
  },

  async calculate(payload: CalculateCommissionPayload): Promise<SalesCommissionItem> {
    return apiFetch<SalesCommissionItem>('/sales/commissions/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async approve(id: string, payload?: ApproveCommissionPayload): Promise<boolean> {
    return apiFetch<boolean>(`/sales/commissions/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(payload || {}),
    });
  },
};
