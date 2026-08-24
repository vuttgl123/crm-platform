import { UserSessionContext } from '@/types/auth';

const SESSION_KEY = 'vum_crm_session_v1';
const SIDEBAR_KEY = 'vum_crm_sidebar_collapsed';

export const storageAdapter = {
  getSession(): UserSessionContext | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        this.clearSession();
        return null;
      }
      // Check expiration
      if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
        this.clearSession();
        return null;
      }
      return parsed as UserSessionContext;
    } catch {
      this.clearSession();
      return null;
    }
  },

  setSession(session: UserSessionContext): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save session to localStorage', e);
    }
  },

  clearSession(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage errors
    }
  },

  getSidebarCollapsed(): boolean {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setSidebarCollapsed(collapsed: boolean): void {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch {
      // Ignore
    }
  },
};
