import { apiFetch } from './apiClient';

export interface DripStep {
  stepOrder: number;
  stepType: 'EMAIL' | 'SMS' | 'WAIT_DELAY' | 'CREATE_TASK' | 'CONDITION_CHECK';
  name: string;
  delayDays: number;
  templateSubject?: string;
  templateBody?: string;
  actionTarget?: string;
}

export interface DripCampaignSummary {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  targetAudience: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  totalEnrolled: number;
  activeSubscribers: number;
  completedSubscribers: number;
  stepCount: number;
  createdAt: string;
}

export interface CreateDripCampaignPayload {
  name: string;
  description: string;
  triggerEvent?: string;
  targetAudience?: string;
  steps: DripStep[];
}

export interface DripStepAnalytics {
  stepOrder: number;
  stepName: string;
  stepType: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  openRatePercent: number;
  clickRatePercent: number;
  conversionRatePercent: number;
}

export interface DripCampaignAnalyticsResponse {
  campaignId: string;
  campaignName: string;
  totalEnrolled: number;
  overallConversionRate: number;
  stepAnalytics: DripStepAnalytics[];
}

export interface EnrollSubscriberPayload {
  subscriberType: 'LEAD' | 'CONTACT' | 'ACCOUNT';
  subscriberId: string;
  subscriberName?: string;
  email?: string;
  phone?: string;
}

export const dripApi = {
  async list(): Promise<DripCampaignSummary[]> {
    return apiFetch<DripCampaignSummary[]>('/marketing/drip-campaigns', {
      method: 'GET',
    });
  },

  async create(payload: CreateDripCampaignPayload): Promise<DripCampaignSummary> {
    return apiFetch<DripCampaignSummary>('/marketing/drip-campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async enroll(campaignId: string, payload: EnrollSubscriberPayload): Promise<boolean> {
    return apiFetch<boolean>(`/marketing/drip-campaigns/${campaignId}/enroll`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAnalytics(campaignId: string): Promise<DripCampaignAnalyticsResponse> {
    return apiFetch<DripCampaignAnalyticsResponse>(`/marketing/drip-campaigns/${campaignId}/analytics`, {
      method: 'GET',
    });
  },
};
