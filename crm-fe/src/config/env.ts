/**
 * Centralized, typed environment variable wrapper.
 * Prevents direct reads of `import.meta.env` across components.
 */

const readOptionalEnv = (value: string | undefined): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const browserOrigin =
  typeof window === 'undefined' ? 'http://localhost:3001' : window.location.origin;

export interface AppConfig {
  apiBaseUrl: string;
  useMocks: boolean;
  mockDelayMs: number;
  enableRoleSwitcher: boolean;
  publicSiteUrl: string;
  demoRequestEndpoint?: string;
  salesEmail?: string;
  salesPhone?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
}

export const env: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  mockDelayMs: Number(import.meta.env.VITE_MOCK_DELAY_MS) || 300,
  enableRoleSwitcher: import.meta.env.VITE_ENABLE_ROLE_SWITCHER !== 'false',
  publicSiteUrl: (readOptionalEnv(import.meta.env.VITE_PUBLIC_SITE_URL) || browserOrigin).replace(/\/$/, ''),
  demoRequestEndpoint: readOptionalEnv(import.meta.env.VITE_DEMO_REQUEST_ENDPOINT),
  salesEmail: readOptionalEnv(import.meta.env.VITE_SALES_EMAIL),
  salesPhone: readOptionalEnv(import.meta.env.VITE_SALES_PHONE),
  privacyPolicyUrl: readOptionalEnv(import.meta.env.VITE_PRIVACY_POLICY_URL),
  termsUrl: readOptionalEnv(import.meta.env.VITE_TERMS_URL),
};
