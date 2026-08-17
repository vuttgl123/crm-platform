import { apiFetch } from './apiClient';

export type LeadRating = 'HOT' | 'WARM' | 'COLD';
export type LeadOwnerType = 'USER' | 'TEAM';

export interface LeadOwner {
  type: LeadOwnerType;
  id: string;
}

export interface LeadEstimatedValue {
  amount: number;
  currencyCode: string;
}

export interface LeadItem {
  id: string;
  leadNumber: string;
  statusId: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  accountName?: string | null;
  companyName?: string | null;
  honorific?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  displayName: string;
  fullName?: string; // alias for displayName
  email?: string | null;
  phoneE164?: string | null;
  phone?: string; // alias for phoneE164
  jobTitle?: string | null;
  website?: string | null;
  countryCode?: string | null;
  preferredLanguageCode?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  estimatedRevenue?: number; // alias
  qualificationNotes?: string | null;
  notes?: string; // alias
  disqualificationReason?: string | null;
  convertedAt?: string | null;
  convertedBy?: string | null;
  convertedAccountId?: string | null;
  convertedContactId?: string | null;
  convertedOpportunityId?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
  leadSource?: string;
  status?: string;
  city?: string;
  assignedTo?: string;
  lastContactedAt?: string;
}

export interface LeadSummaryItem {
  id: string;
  leadNumber: string;
  statusId: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  companyName?: string | null;
  displayName: string;
  fullName?: string;
  email?: string | null;
  phoneE164?: string | null;
  phone?: string;
  jobTitle?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  estimatedRevenue?: number;
  convertedAt?: string | null;
  updatedAt: string;
  version: number;
  leadSource?: string;
  status?: string;
  city?: string;
  assignedTo?: string;
  createdAt?: string;
}

export interface CreateLeadPayload {
  leadNumber?: string;
  statusId?: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  accountName?: string | null;
  companyName?: string | null;
  honorific?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  displayName: string;
  email?: string | null;
  phoneE164?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  countryCode?: string | null;
  preferredLanguageCode?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  qualificationNotes?: string | null;
}

export interface UpdateLeadPayload {
  version: number;
  statusId?: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  accountName?: string | null;
  companyName?: string | null;
  honorific?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  displayName: string;
  email?: string | null;
  phoneE164?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  countryCode?: string | null;
  preferredLanguageCode?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  qualificationNotes?: string | null;
  disqualificationReason?: string | null;
}

export interface ConvertLeadPayload {
  version: number;
  convertedAccountId?: string | null;
  convertedContactId?: string | null;
  convertedOpportunityId?: string | null;
  convertedStatusId?: string | null;
}

export interface LeadSearchParams {
  q?: string;
  statusId?: string;
  sourceId?: string;
  rating?: LeadRating;
  ownerType?: LeadOwnerType;
  ownerId?: string;
  converted?: boolean;
  page?: number;
  size?: number;
  search?: string;
  leadSource?: string;
  status?: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content?: T[];
}

export const LEAD_SOURCE_CONFIG: Record<string, { label: string; className: string }> = {
  WEBSITE: { label: 'Website / Landing Page', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  EVENT: { label: 'Sự kiện / Hội thảo', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  REFERRAL: { label: 'Khách hàng giới thiệu', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COLD_CALL: { label: 'Telesale / Gọi điện', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  SOCIAL: { label: 'Mạng xã hội (LinkedIn/FB)', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  PARTNER: { label: 'Kênh đối tác', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

function normalizeLead<T extends Partial<LeadItem>>(item: T): T & LeadItem {
  const displayName = item.displayName || item.fullName || 'Khách hàng';
  const phone = item.phoneE164 || item.phone || '';
  const email = item.email || '';
  const companyName = item.companyName || item.accountName || 'Khách hàng doanh nghiệp';
  const estimatedRevenue = item.estimatedValue?.amount ?? (item.estimatedRevenue || 0);

  return {
    ...item,
    id: item.id || '',
    leadNumber: item.leadNumber || `LD-${item.id?.slice(-4) || '000'}`,
    displayName,
    fullName: displayName,
    phoneE164: phone,
    phone,
    email,
    companyName,
    accountName: companyName,
    jobTitle: item.jobTitle || 'Đại diện',
    statusId: item.statusId || (item.status ? String(item.status) : 'NEW'),
    status: (item.status || item.statusId || 'NEW') as any,
    rating: (item.rating || 'HOT') as any,
    leadSource: item.leadSource || 'WEBSITE',
    estimatedValue: { amount: estimatedRevenue, currencyCode: 'VND' },
    estimatedRevenue,
    assignedTo: item.assignedTo || 'Phạm Tuấn Vũ',
    city: item.city || 'Hà Nội',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    version: item.version || 1,
  } as T & LeadItem;
}

export interface LeadScoringResult {
  leadId: string;
  score: number;
  grade: 'HOT' | 'WARM' | 'COLD';
  scoringFactors: string[];
  recommendedAction: string;
}

export const leadApi = {
  async calculateScore(id: string): Promise<LeadScoringResult> {
    return apiFetch<LeadScoringResult>(`/leads/${id}/calculate-score`, {
      method: 'POST',
    });
  },

  async autoAssign(id: string): Promise<LeadItem> {
    const res = await apiFetch<LeadItem>(`/leads/${id}/auto-assign`, {
      method: 'POST',
    });
    return normalizeLead(res);
  },

  async search(params: LeadSearchParams = {}): Promise<PageResult<LeadSummaryItem>> {
    const query = new URLSearchParams();
    const q = params.q || params.search;
    if (q) query.append('q', q);
    if (params.statusId && params.statusId !== 'ALL') query.append('statusId', params.statusId);
    if (params.sourceId && params.sourceId !== 'ALL') query.append('sourceId', params.sourceId);
    if (params.rating && params.rating !== 'ALL') query.append('rating', params.rating);
    if (params.ownerType) query.append('ownerType', params.ownerType);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.converted !== undefined) query.append('converted', String(params.converted));
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/leads${queryString ? `?${queryString}` : ''}`;
    const res = await apiFetch<any>(endpoint, { method: 'GET' });

    const rawItems: any[] = Array.isArray(res) ? res : res.items || res.content || [];
    const items = rawItems.map(normalizeLead);

    return {
      items,
      content: items,
      page: res.page ?? res.pageNumber ?? 0,
      size: res.size ?? res.pageSize ?? 10,
      totalElements: res.totalElements ?? items.length,
      totalPages: res.totalPages ?? 1,
    };
  },

  async list(params: LeadSearchParams = {}): Promise<{ content: LeadItem[]; totalElements: number; totalPages: number; page: number; size: number }> {
    const res = await this.search(params);
    return {
      content: res.items as LeadItem[],
      totalElements: res.totalElements,
      totalPages: res.totalPages,
      page: res.page,
      size: res.size,
    };
  },

  async get(id: string): Promise<LeadItem> {
    const res = await apiFetch<LeadItem>(`/leads/${id}`, { method: 'GET' });
    return normalizeLead(res);
  },

  async create(data: any): Promise<LeadItem> {
    const payload: CreateLeadPayload = {
      leadNumber: data.leadNumber || `LD-${Date.now().toString().slice(-6)}`,
      statusId: data.statusId || data.status || 'NEW',
      sourceId: data.sourceId || data.leadSource || 'WEBSITE',
      displayName: data.displayName || data.fullName || 'Khách hàng mới',
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      email: data.email,
      phoneE164: data.phoneE164 || data.phone,
      rating: data.rating,
      estimatedValue: data.estimatedRevenue ? { amount: data.estimatedRevenue, currencyCode: 'VND' } : data.estimatedValue,
      qualificationNotes: data.notes || data.qualificationNotes,
    };
    const res = await apiFetch<LeadItem>('/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeLead(res);
  },

  async update(id: string, data: any): Promise<LeadItem> {
    const payload: UpdateLeadPayload = {
      version: data.version || 1,
      statusId: data.statusId || data.status || 'NEW',
      sourceId: data.sourceId || data.leadSource || 'WEBSITE',
      displayName: data.displayName || data.fullName || 'Khách hàng',
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      email: data.email,
      phoneE164: data.phoneE164 || data.phone,
      rating: data.rating,
      estimatedValue: data.estimatedRevenue ? { amount: data.estimatedRevenue, currencyCode: 'VND' } : data.estimatedValue,
      qualificationNotes: data.notes || data.qualificationNotes,
      disqualificationReason: data.disqualificationReason,
    };
    const res = await apiFetch<LeadItem>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeLead(res);
  },

  async convert(id: string, data: ConvertLeadPayload = { version: 1 }): Promise<LeadItem> {
    const res = await apiFetch<LeadItem>(`/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeLead(res);
  },

  async delete(id: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/leads/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
