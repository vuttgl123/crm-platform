import { ApiError } from '@/services/api/apiClient';

export const AUTH_ERROR_CODES = [
  'NETWORK_ERROR',
  'REQUEST_VALIDATION_FAILED',
  'INVALID_CREDENTIALS',
  'SELF_REGISTRATION_DISABLED',
  'EMAIL_ALREADY_REGISTERED',
  'TENANT_NOT_AVAILABLE',
  'MEMBERSHIP_REQUEST_ALREADY_PENDING',
  'OAUTH2_LOGIN_FAILED',
  'EXTERNAL_EMAIL_NOT_VERIFIED',
  'EXTERNAL_IDENTITY_LINK_REQUIRED',
  'ACCOUNT_LOCKED',
  'PASSWORD_RESET_TOKEN_INVALID',
  'PASSWORD_RESET_TOKEN_EXPIRED',
  'WEAK_PASSWORD',
  'UNKNOWN_ERROR',
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

const AUTH_ERROR_CODE_SET = new Set<string>(AUTH_ERROR_CODES);

const AUTH_ERROR_MESSAGE_KEYS: Record<AuthErrorCode, string> = {
  NETWORK_ERROR: 'auth.gateway.errors.network',
  REQUEST_VALIDATION_FAILED: 'auth.gateway.errors.requestValidation',
  INVALID_CREDENTIALS: 'auth.gateway.errors.invalidCredentials',
  SELF_REGISTRATION_DISABLED: 'auth.gateway.errors.registrationDisabled',
  EMAIL_ALREADY_REGISTERED: 'auth.gateway.errors.emailRegistered',
  TENANT_NOT_AVAILABLE: 'auth.gateway.errors.tenantNotAvailable',
  MEMBERSHIP_REQUEST_ALREADY_PENDING: 'auth.gateway.errors.membershipPending',
  OAUTH2_LOGIN_FAILED: 'auth.gateway.errors.oauthFailed',
  EXTERNAL_EMAIL_NOT_VERIFIED: 'auth.gateway.errors.externalEmailNotVerified',
  EXTERNAL_IDENTITY_LINK_REQUIRED: 'auth.gateway.errors.identityLinkRequired',
  ACCOUNT_LOCKED: 'auth.gateway.errors.accountLocked',
  PASSWORD_RESET_TOKEN_INVALID: 'auth.gateway.errors.resetTokenInvalid',
  PASSWORD_RESET_TOKEN_EXPIRED: 'auth.gateway.errors.resetTokenExpired',
  WEAK_PASSWORD: 'auth.gateway.errors.weakPassword',
  UNKNOWN_ERROR: 'auth.gateway.errors.unknown',
};

/**
 * The unlock instant that accompanies ACCOUNT_LOCKED, as an ISO-8601 string.
 *
 * This lives in its own function rather than widening normalizeAuthError's
 * return type: only one of the fifteen codes carries data, and the mapping
 * from code to translation key stays a plain lookup for the other fourteen.
 */
export function extractLockedUntil(error: unknown): string | undefined {
  return error instanceof ApiError
    ? error.problemDetail?.lockedUntil
    : undefined;
}

export function normalizeAuthError(error: unknown): AuthErrorCode {
  if (error instanceof ApiError && AUTH_ERROR_CODE_SET.has(error.errorCode)) {
    return error.errorCode as AuthErrorCode;
  }
  if (error instanceof TypeError) return 'NETWORK_ERROR';
  return 'UNKNOWN_ERROR';
}

export function normalizeOAuthErrorCode(
  value: string | null
): AuthErrorCode | undefined {
  if (!value) return undefined;
  const allowedOAuthCodes: AuthErrorCode[] = [
    'OAUTH2_LOGIN_FAILED',
    'EXTERNAL_EMAIL_NOT_VERIFIED',
    'SELF_REGISTRATION_DISABLED',
    'EXTERNAL_IDENTITY_LINK_REQUIRED',
    'INVALID_CREDENTIALS',
  ];
  return allowedOAuthCodes.includes(value as AuthErrorCode)
    ? (value as AuthErrorCode)
    : 'OAUTH2_LOGIN_FAILED';
}

export function getAuthErrorMessageKey(
  code: AuthErrorCode | undefined,
  fallbackKey: string
): string {
  return code ? AUTH_ERROR_MESSAGE_KEYS[code] : fallbackKey;
}
