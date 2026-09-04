import { apiFetch } from './apiClient';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export interface ContractItem {
  id: string;
  contractNumber: string;
  title: string;
  accountId: string;
  accountName?: string;
  contactId?: string;
  contactName?: string;
  totalValue: number;
  contractValue?: number; // compat alias
  startDate: string;
  endDate: string;
  status: ContractStatus;
  signDate?: string;
  signedByCustomer?: string;
  assignedTo?: string;
  terms?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
}

export interface ContractPageResult {
  items: ContractItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CreateContractRequest {
  contractNumber: string;
  title: string;
  accountId: string;
  contactId?: string;
  totalValue: number;
  startDate: string;
  endDate: string;
  terms?: string;
}

export interface UpdateContractRequest {
  version: number;
  title: string;
  contactId?: string;
  totalValue: number;
  startDate: string;
  endDate: string;
  terms?: string;
}

export interface ContractStatsDto {
  totalContracts: number;
  draftContracts: number;
  inReviewContracts: number;
  approvedContracts: number;
  activeContracts: number;
  expiringSoonContracts: number;
  terminatedContracts: number;
  totalActiveValue: number;
}

export interface RenewContractRequest {
  newContractNumber: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  contractValue?: number;
  autoRenew?: boolean;
  version: number;
}

export const CONTRACT_STATUS_CONFIG: Record<ContractStatus, { label: string; className: string }> = {
  DRAFT: { label: 'DRAFT', className: 'bg-slate-100 text-slate-600 border-slate-300 font-semibold' },
  ACTIVE: { label: 'ACTIVE', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  EXPIRED: { label: 'EXPIRED', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  TERMINATED: { label: 'TERMINATED', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
};

export const contractApi = {
  getStats: async (): Promise<ContractStatsDto> => {
    return apiFetch<ContractStatsDto>('/contracts/stats', {
      method: 'GET',
    });
  },

  list: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: ContractItem[]; totalElements: number; totalPages: number; page: number; size: number }> => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));
    if (params?.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<ContractPageResult | ContractItem[]>(`/contracts${qs}`);

    if (Array.isArray(res)) {
      const mapped = res.map((c) => ({ ...c, contractValue: c.totalValue || c.contractValue || 0 }));
      return { content: mapped, totalElements: mapped.length, totalPages: 1, page: 0, size: mapped.length };
    }

    const content = (res.items || []).map((c) => ({ ...c, contractValue: c.totalValue || c.contractValue || 0 }));
    return {
      content,
      totalElements: res.totalElements || 0,
      totalPages: res.totalPages || 1,
      page: (res.pageNumber || 1) - 1,
      size: res.pageSize || 10,
    };
  },

  get: async (id: string): Promise<ContractItem> => {
    const res = await apiFetch<ContractItem>(`/contracts/${id}`);
    return { ...res, contractValue: res.totalValue || res.contractValue || 0 };
  },

  create: async (data: CreateContractRequest | (Omit<ContractItem, 'id'> & { contractValue?: number })): Promise<ContractItem> => {
    const payload: CreateContractRequest = {
      contractNumber: data.contractNumber,
      title: data.title,
      accountId: data.accountId,
      contactId: data.contactId,
      totalValue: 'totalValue' in data ? data.totalValue : (data as any).contractValue || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      terms: (data as any).terms,
    };
    const res = await apiFetch<ContractItem>('/contracts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { ...res, contractValue: res.totalValue || res.contractValue || 0 };
  },

  update: async (id: string, data: Partial<ContractItem>): Promise<ContractItem> => {
    const payload: UpdateContractRequest = {
      version: data.version || 1,
      title: data.title || '',
      contactId: data.contactId,
      totalValue: data.totalValue || data.contractValue || 0,
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      terms: data.terms,
    };
    const res = await apiFetch<ContractItem>(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return { ...res, contractValue: res.totalValue || res.contractValue || 0 };
  },

  activate: async (id: string, version: number = 1): Promise<ContractItem> => {
    return apiFetch<ContractItem>(`/contracts/${id}/activate`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  renew: async (id: string, data: RenewContractRequest): Promise<ContractItem> => {
    const res = await apiFetch<ContractItem>(`/contracts/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { ...res, contractValue: res.totalValue || res.contractValue || 0 };
  },

  bulkSubmitReview: async (contractIds: string[]): Promise<{ submittedCount: number }> => {
    return apiFetch<{ submittedCount: number }>('/contracts/bulk/review', {
      method: 'POST',
      body: JSON.stringify({ contractIds }),
    });
  },

  terminate: async (id: string, version: number = 1, reason?: string): Promise<ContractItem> => {
    return apiFetch<ContractItem>(`/contracts/${id}/terminate`, {
      method: 'POST',
      body: JSON.stringify({ version, reason }),
    });
  },

  delete: async (id: string, version: number = 1): Promise<void> => {
    return apiFetch<void>(`/contracts/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
