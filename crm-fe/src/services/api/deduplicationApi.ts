import { apiFetch } from './apiClient';

export interface DuplicateAccountSummary {
  id: string;
  accountNumber: string;
  displayName: string;
  legalName?: string;
  taxIdentifier?: string;
  phone?: string;
  email?: string;
  lifecycleStage: string;
  updatedAt: string;
}

export interface DuplicateMatchGroup {
  matchReason: string;
  confidenceScore: number;
  matchValue: string;
  accounts: DuplicateAccountSummary[];
}

export interface MergeAccountRequest {
  sourceAccountId: string;
  targetAccountId: string;
  selectedFields?: Record<string, string>;
}

export const deduplicationApi = {
  async scanDuplicates(): Promise<DuplicateMatchGroup[]> {
    return apiFetch<DuplicateMatchGroup[]>('/crm/deduplication/scan', {
      method: 'GET',
    });
  },

  async mergeAccounts(payload: MergeAccountRequest): Promise<boolean> {
    return apiFetch<boolean>('/crm/deduplication/merge', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
