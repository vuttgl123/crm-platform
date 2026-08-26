import { apiFetch } from '@/services/api/apiClient';

/**
 * Resolves for any well-formed request. The server answers 202 whether or not
 * the address is registered, and does the work asynchronously, so neither the
 * status nor the response time reveals whether an account exists.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch<void>('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<void> {
  await apiFetch<void>('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiFetch<void>('/auth/password/change', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
