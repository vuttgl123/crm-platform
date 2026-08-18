import { apiFetch } from './apiClient';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'TASK_DUE' | 'LEAD_ASSIGNED' | 'DEAL_WON' | 'SLA_BREACH' | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface UnreadNotificationCount {
  unreadCount: number;
}

export const notificationApi = {
  async list(unreadOnly?: boolean): Promise<NotificationItem[]> {
    const query = unreadOnly !== undefined ? `?unreadOnly=${unreadOnly}` : '';
    return apiFetch<NotificationItem[]>(`/notifications${query}`, {
      method: 'GET',
    });
  },

  async getUnreadCount(): Promise<UnreadNotificationCount> {
    return apiFetch<UnreadNotificationCount>('/notifications/unread-count', {
      method: 'GET',
    });
  },

  async markAsRead(id: string): Promise<boolean> {
    return apiFetch<boolean>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead(): Promise<boolean> {
    return apiFetch<boolean>('/notifications/read-all', {
      method: 'PUT',
    });
  },
};
