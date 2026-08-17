import { apiFetch } from './apiClient';

export type LeadStatusCategory = 'OPEN' | 'QUALIFIED' | 'DISQUALIFIED' | 'CONVERTED';

export interface LeadSourceItem {
  id: string;
  sourceCode: string;
  name: string;
  description?: string;
  active: boolean;
  version: number;
}

export interface LeadStatusItem {
  id: string;
  statusCode: string;
  name: string;
  statusCategory: LeadStatusCategory;
  displayOrder: number;
  defaultStatus: boolean;
  terminal: boolean;
  active: boolean;
  version: number;
}

export interface OpportunityLostReasonItem {
  id: string;
  reasonCode: string;
  name: string;
  description?: string;
  active: boolean;
  version: number;
}

export const salesConfigApi = {
  // Lead Sources
  listLeadSources: async (): Promise<LeadSourceItem[]> => {
    return apiFetch<LeadSourceItem[]>('/crm/config/lead-sources');
  },

  createLeadSource: async (data: { sourceCode: string; name: string; description?: string }): Promise<LeadSourceItem> => {
    return apiFetch<LeadSourceItem>('/crm/config/lead-sources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLeadSource: async (id: string, data: { version: number; name: string; description?: string; active: boolean }): Promise<LeadSourceItem> => {
    return apiFetch<LeadSourceItem>(`/crm/config/lead-sources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Lead Statuses
  listLeadStatuses: async (): Promise<LeadStatusItem[]> => {
    return apiFetch<LeadStatusItem[]>('/crm/config/lead-statuses');
  },

  createLeadStatus: async (data: {
    statusCode: string;
    name: string;
    statusCategory: LeadStatusCategory;
    displayOrder?: number;
    defaultStatus?: boolean;
    terminal?: boolean;
  }): Promise<LeadStatusItem> => {
    return apiFetch<LeadStatusItem>('/crm/config/lead-statuses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLeadStatus: async (
    id: string,
    data: {
      version: number;
      name: string;
      statusCategory: LeadStatusCategory;
      displayOrder?: number;
      defaultStatus?: boolean;
      terminal?: boolean;
      active: boolean;
    }
  ): Promise<LeadStatusItem> => {
    return apiFetch<LeadStatusItem>(`/crm/config/lead-statuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Lost Reasons
  listLostReasons: async (): Promise<OpportunityLostReasonItem[]> => {
    return apiFetch<OpportunityLostReasonItem[]>('/crm/config/lost-reasons');
  },

  createLostReason: async (data: { reasonCode: string; name: string; description?: string }): Promise<OpportunityLostReasonItem> => {
    return apiFetch<OpportunityLostReasonItem>('/crm/config/lost-reasons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLostReason: async (id: string, data: { version: number; name: string; description?: string; active: boolean }): Promise<OpportunityLostReasonItem> => {
    return apiFetch<OpportunityLostReasonItem>(`/crm/config/lost-reasons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
