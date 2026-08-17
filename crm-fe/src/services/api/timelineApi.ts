import { apiFetch } from './apiClient';

export type TimelineCategory = 'ENGAGEMENT' | 'TRANSACTION' | 'SUPPORT' | 'NOTE' | 'SYSTEM';

export interface TimelineItem {
  id: string;
  eventType: string;
  title: string;
  description?: string;
  actorName?: string;
  occurredAt: string;
  category: TimelineCategory;
  metadata?: Record<string, any>;
  pinned?: boolean;
}

export const timelineApi = {
  async getTimeline(entityType: string, entityId: string): Promise<TimelineItem[]> {
    return apiFetch<TimelineItem[]>(`/crm/timeline/${entityType}/${entityId}`, {
      method: 'GET',
    }).catch(() => []);
  },
};
