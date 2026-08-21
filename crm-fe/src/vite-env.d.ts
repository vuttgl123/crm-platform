/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCKS: string;
  readonly VITE_MOCK_DELAY_MS: string;
  readonly VITE_ENABLE_ROLE_SWITCHER: string;
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_DEMO_REQUEST_ENDPOINT?: string;
  readonly VITE_SALES_EMAIL?: string;
  readonly VITE_SALES_PHONE?: string;
  readonly VITE_PRIVACY_POLICY_URL?: string;
  readonly VITE_TERMS_URL?: string;
  readonly VITE_ENABLE_GOOGLE_SSO: string;
  readonly VITE_ENABLE_MICROSOFT_SSO: string;
  readonly VITE_OAUTH_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
