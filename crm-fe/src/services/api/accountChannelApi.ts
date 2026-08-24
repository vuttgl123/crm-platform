import { apiFetch } from './apiClient';

export type ChannelType =
  | 'EMAIL'
  | 'PHONE'
  | 'MOBILE'
  | 'SMS'
  | 'WHATSAPP'
  | 'LINKEDIN'
  | 'OTHER';

export interface AccountCommunicationChannelResponse {
  id: string;
  accountId: string;
  channelType: ChannelType;
  rawValue: string;
  normalizedValue?: string;
  label?: string;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  doNotUse: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountCommunicationChannelRequest {
  channelType: ChannelType;
  rawValue: string;
  label?: string | null;
  isPrimary?: boolean;
  doNotUse?: boolean;
}

export interface UpdateAccountCommunicationChannelRequest {
  channelType: ChannelType;
  rawValue: string;
  label?: string | null;
  isPrimary?: boolean;
  doNotUse?: boolean;
}

export function normalizeChannelValue(type: ChannelType, rawValue: string): string {
  const trimmed = rawValue.trim();
  if (!trimmed) return trimmed;

  if (['PHONE', 'MOBILE', 'SMS', 'WHATSAPP'].includes(type)) {
    // Keep numbers and leading + format, strip spacing and dashes
    const cleaned = trimmed.replace(/[\s\-\.\(\)]/g, '');
    return cleaned;
  }

  return trimmed;
}

export const accountChannelApi = {
  async list(
    accountId: string,
    options?: { signal?: AbortSignal }
  ): Promise<AccountCommunicationChannelResponse[]> {
    return apiFetch<AccountCommunicationChannelResponse[]>(
      `/accounts/${accountId}/communication-channels`,
      { signal: options?.signal }
    );
  },

  async create(
    accountId: string,
    payload: CreateAccountCommunicationChannelRequest
  ): Promise<AccountCommunicationChannelResponse> {
    const normalizedPayload = {
      channelType: payload.channelType,
      rawValue: normalizeChannelValue(payload.channelType, payload.rawValue),
      label: payload.label?.trim() || null,
      isPrimary: payload.isPrimary ?? false,
      doNotUse: payload.doNotUse ?? false,
    };
    return apiFetch<AccountCommunicationChannelResponse>(
      `/accounts/${accountId}/communication-channels`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedPayload),
      }
    );
  },

  async update(
    accountId: string,
    channelId: string,
    version: number,
    payload: UpdateAccountCommunicationChannelRequest
  ): Promise<AccountCommunicationChannelResponse> {
    const normalizedPayload = {
      channelType: payload.channelType,
      rawValue: normalizeChannelValue(payload.channelType, payload.rawValue),
      label: payload.label?.trim() || null,
      isPrimary: payload.isPrimary ?? false,
      doNotUse: payload.doNotUse ?? false,
    };
    return apiFetch<AccountCommunicationChannelResponse>(
      `/accounts/${accountId}/communication-channels/${channelId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': `"${version}"`,
        },
        body: JSON.stringify(normalizedPayload),
      }
    );
  },

  async delete(accountId: string, channelId: string, version: number): Promise<void> {
    await apiFetch<void>(
      `/accounts/${accountId}/communication-channels/${channelId}`,
      {
        method: 'DELETE',
        headers: {
          'If-Match': `"${version}"`,
        },
      }
    );
  },
};
