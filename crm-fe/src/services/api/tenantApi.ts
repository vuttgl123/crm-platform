import { apiFetch } from './apiClient';

export interface BootstrapTenantRequest {
  tenantCode: string;
  legalName: string;
  displayName: string;
  defaultCurrencyCode: string;
  defaultCountryCode: string;
  defaultLanguageCode?: string;
  defaultTimezone?: string;
}

export interface TenantResponse {
  id: string;
  tenantCode: string;
  legalName: string;
  displayName: string;
  status: string;
  defaultCurrencyCode: string;
  defaultCountryCode: string;
  defaultLanguageCode: string;
  defaultTimezone: string;
  tenantAdmin: boolean;
  createdAt: string;
  version: number;
}

export const tenantApi = {
  /**
   * Bootstrap a new tenant in backend POST /api/tenants
   */
  async bootstrap(data: BootstrapTenantRequest): Promise<TenantResponse> {
    return apiFetch<TenantResponse>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
