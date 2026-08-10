/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCKS: string;
  readonly VITE_MOCK_DELAY_MS: string;
  readonly VITE_ENABLE_ROLE_SWITCHER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
