import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type CreateQuotePayload,
  type SaveQuoteDraftPayload,
  quoteApi,
} from '@/services/api/quoteApi';

export function useQuoteMutations() {
  const queryClient = useQueryClient();

  const invalidateQuoteQueries = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
    queryClient.invalidateQueries({ queryKey: ['quotes', 'summary'] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['quotes', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes', 'history', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes', 'revisions', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes', 'document', id] });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateQuotePayload) => quoteApi.createQuote(payload),
    onSuccess: (data) => invalidateQuoteQueries(data.id),
  });

  const saveDraftMutation = useMutation({
    mutationFn: ({ id, version, payload }: { id: string; version: number; payload: SaveQuoteDraftPayload }) =>
      quoteApi.saveQuoteDraft(id, version, payload),
    onSuccess: (data) => invalidateQuoteQueries(data.id),
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => quoteApi.submitQuote(id, version),
    onSuccess: (data) => invalidateQuoteQueries(data.id),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => quoteApi.approveQuote(id, version),
    onSuccess: (data) => invalidateQuoteQueries(data.id),
  });

  const requestChangesMutation = useMutation({
    mutationFn: ({ id, version, reason }: { id: string; version: number; reason: string }) =>
      quoteApi.requestQuoteChanges(id, version, reason),
    onSuccess: (data) => invalidateQuoteQueries(data.id),
  });

  const markSentMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => quoteApi.markQuoteSent(id, version),
    onSuccess: (data) => invalidateQuoteQueries(data.id),
  });

  const acceptMutation = useMutation({
    mutationFn: ({ id, version, customerReference }: { id: string; version: number; customerReference?: string }) =>
      quoteApi.acceptQuote(id, version, customerReference),
    onSuccess: (data) => invalidateQuoteQueries(data.id),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, version, reason }: { id: string; version: number; reason: string }) =>
      quoteApi.rejectQuote(id, version, reason),
    onSuccess: (data) => invalidateQuoteQueries(data.id),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, version, reason }: { id: string; version: number; reason: string }) =>
      quoteApi.cancelQuote(id, version, reason),
    onSuccess: (data) => invalidateQuoteQueries(data.id),
  });

  const reviseMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => quoteApi.reviseQuote(id, version),
    onSuccess: (data) => {
      invalidateQuoteQueries();
      invalidateQuoteQueries(data.id);
    },
  });

  const deleteDraftMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => quoteApi.deleteQuoteDraft(id, version),
    onSuccess: () => invalidateQuoteQueries(),
  });

  const convertToOrderMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => quoteApi.convertQuoteToOrder(id, version),
    onSuccess: (_, variables) => {
      invalidateQuoteQueries(variables.id);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    createMutation,
    saveDraftMutation,
    submitMutation,
    approveMutation,
    requestChangesMutation,
    markSentMutation,
    acceptMutation,
    rejectMutation,
    cancelMutation,
    reviseMutation,
    deleteDraftMutation,
    convertToOrderMutation,
  };
}
