import { apiFetch } from './apiClient';

export interface WebhookSubscription {
  id: string;
  name: string;
  targetUrl: string;
  secretToken: string;
  events: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'FAILED';
  successCount: number;
  failureCount: number;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface CreateWebhookPayload {
  name: string;
  targetUrl: string;
  secretToken?: string;
  events: string[];
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  httpStatusCode: number;
  executionTimeMs: number;
  requestPayload: string;
  responseBody: string;
  status: 'SUCCESS' | 'FAILED';
  triggeredAt: string;
}

export interface TestWebhookResult {
  success: boolean;
  httpStatusCode: number;
  executionTimeMs: number;
  responseMessage: string;
}

export const webhookApi = {
  async list(): Promise<WebhookSubscription[]> {
    return apiFetch<WebhookSubscription[]>('/integration/webhooks', {
      method: 'GET',
    });
  },

  async create(payload: CreateWebhookPayload): Promise<WebhookSubscription> {
    return apiFetch<WebhookSubscription>('/integration/webhooks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async test(id: string): Promise<TestWebhookResult> {
    return apiFetch<TestWebhookResult>(`/integration/webhooks/${id}/test`, {
      method: 'POST',
    });
  },

  async getLogs(id: string): Promise<WebhookDeliveryLog[]> {
    return apiFetch<WebhookDeliveryLog[]>(`/integration/webhooks/${id}/logs`, {
      method: 'GET',
    });
  },
};
