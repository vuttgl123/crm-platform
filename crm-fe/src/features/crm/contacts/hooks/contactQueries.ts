import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  contactApi,
  ContactSummaryResponse,
  ContactResponse,
  ContactSearchRequest,
  CreateContactRequest,
  UpdateContactRequest,
} from '@/services/api/contactApi';
import { accountApi, AccountResponse, AccountSummaryResponse } from '@/services/api/accountApi';
import type { PageResult } from '@/services/api/accountApi';
import { AccountOption } from '../model/contactTypes';

export function useContactsQuery(
  filters: ContactSearchRequest,
  tenantId: string = 'default'
) {
  return useQuery<PageResult<ContactSummaryResponse>>({
    queryKey: ['contacts', tenantId, filters],
    queryFn: async ({ signal }) => {
      return contactApi.search(filters, { signal });
    },
    staleTime: 10000,
  });
}

export function useContactDetailQuery(
  contactId?: string | null,
  tenantId: string = 'default',
  enabled: boolean = true
) {
  return useQuery<ContactResponse>({
    queryKey: ['contact', tenantId, contactId],
    queryFn: async ({ signal }) => {
      if (!contactId) throw new Error('Contact ID is required');
      return contactApi.get(contactId, { signal });
    },
    enabled: Boolean(enabled && contactId),
    staleTime: 15000,
  });
}

export function useContactAccountQuery(
  accountId?: string | null,
  tenantId: string = 'default'
) {
  return useQuery<AccountResponse | null>({
    queryKey: ['contact-account', tenantId, accountId],
    queryFn: async () => {
      if (!accountId) return null;
      try {
        return await accountApi.get(accountId);
      } catch (err) {
        console.warn('Could not fetch linked account details', err);
        return null;
      }
    },
    enabled: Boolean(accountId),
    staleTime: 60000,
  });
}

export function useAccountOptionsQuery(
  search: string,
  tenantId: string = 'default'
) {
  return useQuery<AccountOption[]>({
    queryKey: ['contact-account-options', tenantId, search],
    queryFn: async () => {
      const res = await accountApi.search({
        q: search.trim() || undefined,
        page: 0,
        size: 20,
      });
      const items = res.items || [];
      return items.map((acc: AccountSummaryResponse) => ({
        id: acc.id,
        displayName: acc.displayName,
        accountNumber: acc.accountNumber,
      }));
    },
    staleTime: 30000,
  });
}

export function useCreateContactMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactRequest) => contactApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', tenantId] });
      queryClient.setQueryData(['contact', tenantId, created.id], created);
    },
  });
}

export function useUpdateContactMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactRequest }) =>
      contactApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', tenantId] });
      queryClient.setQueryData(['contact', tenantId, updated.id], updated);
    },
  });
}

export function useDeleteContactMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      contactApi.delete(id, version),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', tenantId] });
      queryClient.removeQueries({ queryKey: ['contact', tenantId, variables.id] });
    },
  });
}
