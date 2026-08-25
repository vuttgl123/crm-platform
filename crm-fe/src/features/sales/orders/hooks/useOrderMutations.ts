import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  orderApi,
  type CreateDirectOrderRequest,
  type SaveOrderDraftRequest,
  type RecordOrderFulfillmentRequest,
} from '@/services/api/orderApi';

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const invalidateOrders = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order'] });
  };

  const createDirectDraft = useMutation({
    mutationFn: (data: CreateDirectOrderRequest) => orderApi.createDirectDraft(data),
    onSuccess: (res) => {
      toast.success(`Order draft ${res.orderNumber} created`);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create order draft');
    },
  });

  const saveDraft = useMutation({
    mutationFn: ({ id, data, version }: { id: string; data: SaveOrderDraftRequest; version: number }) =>
      orderApi.saveDraft(id, data, version),
    onSuccess: (res) => {
      toast.success(`Order ${res.orderNumber} saved`);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save order draft');
    },
  });

  const confirm = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      orderApi.confirm(id, version),
    onSuccess: (res) => {
      toast.success(`Order ${res.orderNumber} confirmed`);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to confirm order');
    },
  });

  const startProcessing = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      orderApi.startProcessing(id, version),
    onSuccess: (res) => {
      toast.success(`Processing started for order ${res.orderNumber}`);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to start processing');
    },
  });

  const recordFulfillment = useMutation({
    mutationFn: ({
      id,
      data,
      version,
      idempotencyKey,
    }: {
      id: string;
      data: RecordOrderFulfillmentRequest;
      version: number;
      idempotencyKey?: string;
    }) => orderApi.recordFulfillment(id, data, version, idempotencyKey),
    onSuccess: (res) => {
      toast.success(`Fulfillment recorded for order ${res.orderNumber}`);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to record fulfillment');
    },
  });

  const voidFulfillment = useMutation({
    mutationFn: ({
      id,
      eventId,
      reason,
      version,
    }: {
      id: string;
      eventId: string;
      reason: string;
      version: number;
    }) => orderApi.voidFulfillment(id, eventId, reason, version),
    onSuccess: (res) => {
      toast.success(`Fulfillment event voided for order ${res.orderNumber}`);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to void fulfillment');
    },
  });

  const closeRemaining = useMutation({
    mutationFn: ({ id, reason, version }: { id: string; reason: string; version: number }) =>
      orderApi.closeRemaining(id, reason, version),
    onSuccess: (res) => {
      toast.success(`Order ${res.orderNumber} closed with remaining items cancelled`);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to close order');
    },
  });

  const cancel = useMutation({
    mutationFn: ({ id, reason, version }: { id: string; reason: string; version: number }) =>
      orderApi.cancel(id, reason, version),
    onSuccess: (res) => {
      toast.success(`Order ${res.orderNumber} cancelled`);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel order');
    },
  });

  const deleteDraft = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      orderApi.deleteDraft(id, version),
    onSuccess: () => {
      toast.success('Order draft deleted');
      invalidateOrders();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete order draft');
    },
  });

  return {
    createDirectDraft,
    saveDraft,
    confirm,
    startProcessing,
    recordFulfillment,
    voidFulfillment,
    closeRemaining,
    cancel,
    deleteDraft,
  };
}
