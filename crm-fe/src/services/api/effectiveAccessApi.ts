import { apiFetch } from './apiClient';

export interface EffectiveAccessResponse {
  tenant: {
    id: string;
    tenantCode: string;
    displayName: string;
  };
  membership: {
    status: string;
    tenantAdmin: boolean;
  };
  permissions: string[];
  dataAccess: {
    defaultScope: 'TENANT' | 'TEAM_TREE' | 'TEAM' | 'OWN';
    entities: Record<
      string,
      Array<{
        scopeType: 'TENANT' | 'TEAM_TREE' | 'TEAM' | 'OWN';
        teamId?: string;
      }>
    >;
  };
}

export const effectiveAccessApi = {
  async getMyAccess(): Promise<EffectiveAccessResponse> {
    return apiFetch<EffectiveAccessResponse>('/api/access/me');
  },
};
