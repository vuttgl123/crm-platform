import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  accountApi,
  AccountSearchParams,
  AccountSummaryResponse,
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
  PageResult,
} from '@/services/api/accountApi';
import {
  accountAddressApi,
  AccountAddressResponse,
  AccountAddressSearchParams,
  CreateAccountAddressRequest,
  UpdateAccountAddressRequest,
} from '@/services/api/accountAddressApi';
import {
  accountChannelApi,
  AccountCommunicationChannelResponse,
  CreateAccountCommunicationChannelRequest,
  UpdateAccountCommunicationChannelRequest,
} from '@/services/api/accountChannelApi';
import {
  accountRelationshipApi,
  AccountRelationshipResponse,
  CreateAccountRelationshipRequest,
  EndAccountRelationshipRequest,
} from '@/services/api/accountRelationshipApi';
import { noteApi, NoteItem, NoteVisibility } from '@/services/api/noteApi';

// Accounts Queries
export function useAccountsQuery(
  params: AccountSearchParams,
  tenantId: string = 'default'
) {
  return useQuery<PageResult<AccountSummaryResponse>>({
    queryKey: ['accounts', tenantId, params],
    queryFn: async ({ signal }) => {
      return accountApi.search(params, { signal });
    },
    staleTime: 10000,
  });
}

export function useAccountDetailQuery(
  accountId?: string | null,
  tenantId: string = 'default',
  enabled: boolean = true
) {
  return useQuery<AccountResponse>({
    queryKey: ['account', tenantId, accountId],
    queryFn: async ({ signal }) => {
      if (!accountId) throw new Error('Account ID is required');
      return accountApi.get(accountId, { signal });
    },
    enabled: Boolean(enabled && accountId),
    staleTime: 15000,
  });
}

export function useParentAccountOptionsQuery(
  searchTerm: string = '',
  excludeAccountId?: string | null
) {
  return useQuery<AccountSummaryResponse[]>({
    queryKey: ['parent-account-options', searchTerm, excludeAccountId],
    queryFn: async ({ signal }) => {
      const res = await accountApi.search(
        { q: searchTerm, size: 20 },
        { signal }
      );
      const items = res?.items || [];
      if (!excludeAccountId) return items;
      return items.filter((acc) => acc.id !== excludeAccountId);
    },
    staleTime: 15000,
  });
}

export function useCreateAccountMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => accountApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['accounts', tenantId] });
      queryClient.setQueryData(['account', tenantId, created.id], created);
    },
  });
}

export function useUpdateAccountMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) =>
      accountApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['accounts', tenantId] });
      queryClient.setQueryData(['account', tenantId, updated.id], updated);
    },
  });
}

export function useDeleteAccountMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      accountApi.delete(id, version),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts', tenantId] });
      queryClient.removeQueries({ queryKey: ['account', tenantId, variables.id] });
    },
  });
}

// Child Resource: Addresses
export function useAccountAddressesQuery(
  accountId?: string | null,
  params?: AccountAddressSearchParams,
  enabled: boolean = true
) {
  return useQuery<AccountAddressResponse[]>({
    queryKey: ['account-addresses', accountId, params],
    queryFn: async ({ signal }) => {
      if (!accountId) return [];
      return accountAddressApi.list(accountId, params, { signal });
    },
    enabled: Boolean(enabled && accountId),
    staleTime: 15000,
  });
}

export function useCreateAccountAddressMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountAddressRequest) =>
      accountAddressApi.create(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-addresses', accountId] });
    },
  });
}

export function useUpdateAccountAddressMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      version,
      data,
    }: {
      addressId: string;
      version: number;
      data: UpdateAccountAddressRequest;
    }) => accountAddressApi.update(accountId, addressId, version, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-addresses', accountId] });
    },
  });
}

export function useEndAccountAddressMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, version }: { addressId: string; version: number }) =>
      accountAddressApi.end(accountId, addressId, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-addresses', accountId] });
    },
  });
}

// Child Resource: Channels
export function useAccountChannelsQuery(
  accountId?: string | null,
  enabled: boolean = true
) {
  return useQuery<AccountCommunicationChannelResponse[]>({
    queryKey: ['account-channels', accountId],
    queryFn: async ({ signal }) => {
      if (!accountId) return [];
      return accountChannelApi.list(accountId, { signal });
    },
    enabled: Boolean(enabled && accountId),
    staleTime: 15000,
  });
}

export function useCreateAccountChannelMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountCommunicationChannelRequest) =>
      accountChannelApi.create(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-channels', accountId] });
    },
  });
}

export function useUpdateAccountChannelMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      channelId,
      version,
      data,
    }: {
      channelId: string;
      version: number;
      data: UpdateAccountCommunicationChannelRequest;
    }) => accountChannelApi.update(accountId, channelId, version, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-channels', accountId] });
    },
  });
}

export function useDeleteAccountChannelMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, version }: { channelId: string; version: number }) =>
      accountChannelApi.delete(accountId, channelId, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-channels', accountId] });
    },
  });
}

// Child Resource: Relationships
export function useAccountRelationshipsQuery(
  accountId?: string | null,
  params?: { page?: number; size?: number },
  enabled: boolean = true
) {
  return useQuery<PageResult<AccountRelationshipResponse>>({
    queryKey: ['account-relationships', accountId, params],
    queryFn: async ({ signal }) => {
      if (!accountId) return { items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
      return accountRelationshipApi.search(accountId, params, { signal });
    },
    enabled: Boolean(enabled && accountId),
    staleTime: 15000,
  });
}

export function useCreateAccountRelationshipMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountRelationshipRequest) =>
      accountRelationshipApi.create(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-relationships', accountId] });
    },
  });
}

export function useEndAccountRelationshipMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      relationshipId,
      data,
    }: {
      relationshipId: string;
      data: EndAccountRelationshipRequest;
    }) => accountRelationshipApi.end(accountId, relationshipId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-relationships', accountId] });
    },
  });
}

// Child Resource: Notes
export function useAccountNotesQuery(
  accountId?: string | null,
  enabled: boolean = true
) {
  return useQuery<{ items: NoteItem[]; total: number }>({
    queryKey: ['account-notes', accountId],
    queryFn: async ({ signal }) => {
      if (!accountId) return { items: [], total: 0 };
      return noteApi.search(
        { targetType: 'ACCOUNT', targetId: accountId, size: 100 },
        { signal }
      );
    },
    enabled: Boolean(enabled && accountId),
    staleTime: 15000,
  });
}

export function useCreateAccountNoteMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string; visibility?: NoteVisibility }) =>
      noteApi.create({
        targetType: 'ACCOUNT',
        targetId: accountId,
        content: data.content,
        visibility: data.visibility || 'TEAM',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-notes', accountId] });
    },
  });
}

export function useDeleteAccountNoteMutation(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      noteApi.delete(id, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-notes', accountId] });
    },
  });
}
