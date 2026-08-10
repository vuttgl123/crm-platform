/**
 * Centralized, typed environment variable wrapper.
 * Prevents direct reads of `import.meta.env` across components.
 */

export interface AppConfig {
  apiBaseUrl: string;
  useMocks: boolean;
  mockDelayMs: number;
  enableRoleSwitcher: boolean;
}

export const env: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  mockDelayMs: Number(import.meta.env.VITE_MOCK_DELAY_MS) || 300,
  enableRoleSwitcher: import.meta.env.VITE_ENABLE_ROLE_SWITCHER !== 'false',
};
