import { apiFetch } from './apiClient';

export interface CustomerHealthScore {
  accountId: string;
  healthScore: number;
  healthGrade: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  activityScore: number;
  ticketScore: number;
  contractScore: number;
  transactionScore: number;
  churnRiskFactors: string[];
  recommendedAction: string;
}

export const healthScoreApi = {
  async getHealthScore(accountId: string): Promise<CustomerHealthScore> {
    return apiFetch<CustomerHealthScore>(`/crm/health-score/${accountId}`, {
      method: 'GET',
    });
  },

  async getAtRiskAccounts(): Promise<CustomerHealthScore[]> {
    return apiFetch<CustomerHealthScore[]>('/crm/health-score/at-risk', {
      method: 'GET',
    });
  },
};
