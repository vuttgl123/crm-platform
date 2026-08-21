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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const resolveOAuthBaseUrl = (
  configuredValue: string | undefined,
  fallbackApiBaseUrl: string
): string => {
  const configured = readOptionalEnv(configuredValue);
  if (configured) {
    try {
      return new URL(configured, browserOrigin).toString().replace(/\/$/, '');
    } catch {
      return browserOrigin;
    }
  }

  try {
    return new URL(fallbackApiBaseUrl, browserOrigin).origin;
  } catch {
    return browserOrigin;
  }
};

export interface AppConfig {
  apiBaseUrl: string;
  useMocks: boolean;
  mockDelayMs: number;
  enableRoleSwitcher: boolean;
  googleSsoEnabled: boolean;
  microsoftSsoEnabled: boolean;
  oauthBaseUrl: string;
  publicSiteUrl: string;
  demoRequestEndpoint?: string;
  salesEmail?: string;
  salesPhone?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
}

export const env: AppConfig = {
  apiBaseUrl,
  useMocks,
  mockDelayMs: Number(import.meta.env.VITE_MOCK_DELAY_MS) || 300,
  enableRoleSwitcher: import.meta.env.VITE_ENABLE_ROLE_SWITCHER !== 'false',
  googleSsoEnabled:
    useMocks || import.meta.env.VITE_ENABLE_GOOGLE_SSO === 'true',
  microsoftSsoEnabled:
    useMocks || import.meta.env.VITE_ENABLE_MICROSOFT_SSO === 'true',
  oauthBaseUrl: resolveOAuthBaseUrl(
    import.meta.env.VITE_OAUTH_BASE_URL,
    apiBaseUrl
  ),
  publicSiteUrl: (readOptionalEnv(import.meta.env.VITE_PUBLIC_SITE_URL) || browserOrigin).replace(/\/$/, ''),
  demoRequestEndpoint: readOptionalEnv(import.meta.env.VITE_DEMO_REQUEST_ENDPOINT),
  salesEmail: readOptionalEnv(import.meta.env.VITE_SALES_EMAIL),
  salesPhone: readOptionalEnv(import.meta.env.VITE_SALES_PHONE),
  privacyPolicyUrl: readOptionalEnv(import.meta.env.VITE_PRIVACY_POLICY_URL),
  termsUrl: readOptionalEnv(import.meta.env.VITE_TERMS_URL),
};
