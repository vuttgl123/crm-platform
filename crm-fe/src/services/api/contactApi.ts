import { apiFetch } from './apiClient';

export type ContactLifecycleStage =
  | 'PROSPECT'
  | 'QUALIFIED'
  | 'CUSTOMER'
  | 'CHURNED'
  | 'INACTIVE';

export type PreferredContactChannel =
  | 'EMAIL'
  | 'PHONE'
  | 'MOBILE'
  | 'SMS'
  | 'WHATSAPP'
  | 'OTHER';

export type ContactOwnerType = 'USER' | 'TEAM';

export interface ContactOwner {
  type: ContactOwnerType;
  id: string;
}

export interface ContactItem {
  id: string;
  contactNumber: string;
  accountId?: string | null;
  accountName?: string;
  owner?: ContactOwner | null;
  honorific?: string | null;
  salutation?: 'MR' | 'MS' | 'MRS' | 'DR';
  givenName?: string | null;
  middleName?: string | null;
  familyName?: string | null;
  displayName: string;
  fullName: string;
  jobTitle?: string | null;
  department?: string | null;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimaryContact?: boolean;
  preferredLanguageCode?: string | null;
  preferredContactChannel?: PreferredContactChannel | null;
  lifecycleStage: ContactLifecycleStage;
  status: 'ACTIVE' | 'INACTIVE';
  dateOfBirth?: string | null;
  doNotContact: boolean;
  description?: string | null;
  city?: string;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface ContactSummaryItem {
  id: string;
  contactNumber: string;
  accountId?: string | null;
  accountName?: string;
  displayName: string;
  fullName: string;
  jobTitle?: string | null;
  department?: string | null;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimaryContact?: boolean;
  preferredContactChannel?: PreferredContactChannel | null;
  lifecycleStage: ContactLifecycleStage;
  status: 'ACTIVE' | 'INACTIVE';
  owner?: ContactOwner | null;
  doNotContact: boolean;
  city?: string;
  createdAt?: string;
  updatedAt: string;
  version: number;
}

export interface CreateContactPayload {
  contactNumber?: string;
  accountId?: string | null;
  owner?: ContactOwner | null;
  honorific?: string | null;
  salutation?: string;
  givenName?: string | null;
  middleName?: string | null;
  familyName?: string | null;
  displayName: string;
  fullName?: string;
  jobTitle?: string | null;
  department?: string | null;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimaryContact?: boolean;
  preferredLanguageCode?: string | null;
  preferredContactChannel?: PreferredContactChannel | null;
  lifecycleStage?: ContactLifecycleStage;
  status?: 'ACTIVE' | 'INACTIVE';
  dateOfBirth?: string | null;
  doNotContact?: boolean;
  description?: string | null;
  city?: string;
}

export interface UpdateContactPayload {
  version: number;
  accountId?: string | null;
  owner?: ContactOwner | null;
  honorific?: string | null;
  salutation?: string;
  givenName?: string | null;
  middleName?: string | null;
  familyName?: string | null;
  displayName: string;
  fullName?: string;
  jobTitle?: string | null;
  department?: string | null;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimaryContact?: boolean;
  preferredLanguageCode?: string | null;
  preferredContactChannel?: PreferredContactChannel | null;
  lifecycleStage?: ContactLifecycleStage;
  status?: 'ACTIVE' | 'INACTIVE';
  dateOfBirth?: string | null;
  doNotContact?: boolean;
  description?: string | null;
  city?: string;
}

export interface ContactSearchParams {
  q?: string;
  search?: string;
  status?: string;
  accountId?: string;
  lifecycleStage?: ContactLifecycleStage;
  ownerType?: ContactOwnerType;
  ownerId?: string;
  page?: number;
  size?: number;
}

export interface PageResult<T> {
  items: T[];
  content?: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

function normalizeContact<T extends Partial<ContactItem>>(item: T): T & ContactItem {
  const displayName = item.displayName || item.fullName || 'Người liên hệ';
  const lifecycleStage = item.lifecycleStage || (item.status === 'INACTIVE' ? 'INACTIVE' : 'CUSTOMER');
  const status: 'ACTIVE' | 'INACTIVE' = lifecycleStage === 'INACTIVE' || lifecycleStage === 'CHURNED' ? 'INACTIVE' : 'ACTIVE';

  return {
    ...item,
    id: item.id || '',
    contactNumber: item.contactNumber || `CT-${item.id?.slice(-4) || '000'}`,
    displayName,
    fullName: displayName,
    jobTitle: item.jobTitle || 'Chuyên viên',
    department: item.department || 'Phòng Ban',
    accountName: item.accountName || 'Khách hàng doanh nghiệp',
    email: item.email || '',
    phone: item.phone || item.mobile || '',
    mobile: item.mobile || item.phone || '',
    isPrimaryContact: item.isPrimaryContact ?? false,
    lifecycleStage,
    status,
    doNotContact: item.doNotContact ?? false,
    city: item.city || 'Hà Nội',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    version: item.version || 1,
  } as T & ContactItem;
}

export const contactApi = {
  async search(params: ContactSearchParams = {}): Promise<PageResult<ContactSummaryItem>> {
    const query = new URLSearchParams();
    const q = params.q || params.search;
    if (q) query.append('q', q);
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.lifecycleStage) query.append('lifecycleStage', params.lifecycleStage);
    if (params.ownerType) query.append('ownerType', params.ownerType);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/contacts${queryString ? `?${queryString}` : ''}`;
    const res = await apiFetch<any>(endpoint, { method: 'GET' });

    const rawItems: any[] = Array.isArray(res) ? res : res.items || res.content || [];
    const items = rawItems.map(normalizeContact);

    return {
      items,
      content: items,
      page: res.page ?? res.pageNumber ?? 0,
      size: res.size ?? res.pageSize ?? 10,
      totalElements: res.totalElements ?? items.length,
      totalPages: res.totalPages ?? 1,
    };
  },

  async list(params: ContactSearchParams = {}): Promise<{ content: ContactItem[]; totalElements: number; totalPages: number; page: number; size: number }> {
    const res = await this.search(params);
    let list = res.items as ContactItem[];
    if (params.status && params.status !== 'ALL') {
      list = list.filter((c) => c.status === params.status);
    }
    return {
      content: list,
      totalElements: res.totalElements,
      totalPages: res.totalPages,
      page: res.page,
      size: res.size,
    };
  },

  async get(id: string): Promise<ContactItem> {
    const res = await apiFetch<ContactItem>(`/contacts/${id}`, { method: 'GET' });
    return normalizeContact(res);
  },

  async create(data: CreateContactPayload): Promise<ContactItem> {
    const displayName = data.displayName || data.fullName || 'Người liên hệ mới';
    const payload = {
      contactNumber: data.contactNumber || `CT-${Date.now().toString().slice(-6)}`,
      accountId: data.accountId,
      displayName,
      jobTitle: data.jobTitle,
      department: data.department,
      honorific: data.honorific || data.salutation,
      lifecycleStage: data.lifecycleStage || 'CUSTOMER',
      doNotContact: data.doNotContact ?? false,
      description: data.description,
    };
    const res = await apiFetch<ContactItem>('/contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeContact({ ...res, email: data.email, phone: data.phone, mobile: data.mobile, isPrimaryContact: data.isPrimaryContact, city: data.city });
  },

  async update(id: string, data: UpdateContactPayload): Promise<ContactItem> {
    const displayName = data.displayName || data.fullName || 'Người liên hệ';
    const payload = {
      version: data.version || 1,
      accountId: data.accountId,
      displayName,
      jobTitle: data.jobTitle,
      department: data.department,
      honorific: data.honorific || data.salutation,
      lifecycleStage: data.lifecycleStage || 'CUSTOMER',
      doNotContact: data.doNotContact ?? false,
      description: data.description,
    };
    const res = await apiFetch<ContactItem>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeContact({ ...res, email: data.email, phone: data.phone, mobile: data.mobile, isPrimaryContact: data.isPrimaryContact, city: data.city });
  },

  async delete(id: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
