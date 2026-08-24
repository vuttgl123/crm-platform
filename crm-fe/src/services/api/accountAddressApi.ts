import { apiFetch } from './apiClient';

export type AccountAddressType =
  | 'BILLING'
  | 'SHIPPING'
  | 'OFFICE'
  | 'REGISTERED'
  | 'OTHER';

export type AddressValidationStatus =
  | 'UNVERIFIED'
  | 'VALID'
  | 'INVALID'
  | 'PARTIAL';

export interface AccountAddressResponse {
  id: string;
  accountId: string;
  addressType: AccountAddressType;
  addressLine1?: string | null;
  addressLine2?: string | null;
  locality?: string | null;
  administrativeArea?: string | null;
  postalCode?: string | null;
  countryCode: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  validationStatus: AddressValidationStatus;
  isPrimary: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountAddressRequest {
  addressType: AccountAddressType;
  addressLine1?: string | null;
  addressLine2?: string | null;
  locality?: string | null;
  administrativeArea?: string | null;
  postalCode?: string | null;
  countryCode: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  isPrimary?: boolean;
  validFrom?: string | null;
}

export interface UpdateAccountAddressRequest {
  addressType: AccountAddressType;
  addressLine1?: string | null;
  addressLine2?: string | null;
  locality?: string | null;
  administrativeArea?: string | null;
  postalCode?: string | null;
  countryCode: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  isPrimary?: boolean;
  validFrom?: string | null;
}

export interface AccountAddressSearchParams {
  addressType?: AccountAddressType;
  includeHistory?: boolean;
}

export const ACCOUNT_ADDRESS_TYPE_CONFIG: Record<
  AccountAddressType,
  { label: string; badge: string; color: string }
> = {
  OFFICE: {
    label: 'Office / Branch',
    badge: 'Office',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  REGISTERED: {
    label: 'Registered Business Address',
    badge: 'Registered',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  BILLING: {
    label: 'Billing Address',
    badge: 'Billing',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  SHIPPING: {
    label: 'Shipping Address',
    badge: 'Shipping',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  OTHER: {
    label: 'Other Address',
    badge: 'Other',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

export const accountAddressApi = {
  async list(
    accountId: string,
    params?: AccountAddressSearchParams,
    options?: { signal?: AbortSignal }
  ): Promise<AccountAddressResponse[]> {
    const query = new URLSearchParams();
    if (params?.addressType) query.append('addressType', params.addressType);
    if (params?.includeHistory !== undefined) {
      query.append('includeHistory', params.includeHistory.toString());
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';

    return apiFetch<AccountAddressResponse[]>(
      `/accounts/${accountId}/addresses${queryString}`,
      { signal: options?.signal }
    );
  },

  async create(
    accountId: string,
    payload: CreateAccountAddressRequest
  ): Promise<AccountAddressResponse> {
    const normalizedPayload = {
      addressType: payload.addressType,
      addressLine1: payload.addressLine1?.trim() || null,
      addressLine2: payload.addressLine2?.trim() || null,
      locality: payload.locality?.trim() || null,
      administrativeArea: payload.administrativeArea?.trim() || null,
      postalCode: payload.postalCode?.trim() || null,
      countryCode: payload.countryCode.trim().toUpperCase(),
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      formattedAddress: payload.formattedAddress?.trim() || null,
      isPrimary: payload.isPrimary ?? false,
      validFrom: payload.validFrom || null,
    };

    return apiFetch<AccountAddressResponse>(
      `/accounts/${accountId}/addresses`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedPayload),
      }
    );
  },

  async update(
    accountId: string,
    addressId: string,
    version: number,
    payload: UpdateAccountAddressRequest
  ): Promise<AccountAddressResponse> {
    const normalizedPayload = {
      addressType: payload.addressType,
      addressLine1: payload.addressLine1?.trim() || null,
      addressLine2: payload.addressLine2?.trim() || null,
      locality: payload.locality?.trim() || null,
      administrativeArea: payload.administrativeArea?.trim() || null,
      postalCode: payload.postalCode?.trim() || null,
      countryCode: payload.countryCode.trim().toUpperCase(),
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      formattedAddress: payload.formattedAddress?.trim() || null,
      isPrimary: payload.isPrimary ?? false,
      validFrom: payload.validFrom || null,
    };

    return apiFetch<AccountAddressResponse>(
      `/accounts/${accountId}/addresses/${addressId}`,
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

  async end(
    accountId: string,
    addressId: string,
    version: number
  ): Promise<AccountAddressResponse> {
    return apiFetch<AccountAddressResponse>(
      `/accounts/${accountId}/addresses/${addressId}/end`,
      {
        method: 'POST',
        headers: {
          'If-Match': `"${version}"`,
        },
      }
    );
  },
};
