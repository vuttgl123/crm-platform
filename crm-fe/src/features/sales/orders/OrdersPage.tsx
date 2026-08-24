import React, { useState, useEffect, useCallback } from 'react';
import {
  orderApi,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '@/services/api/orderApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ActionTooltip } from '@/components/ui/action-tooltip';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar, ViewTabItem } from '@/components/common/StandardFilterBar';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  ShoppingCart,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Building2,
  Truck,
  CreditCard,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [accountName, setAccountName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [status, setStatus] = useState<OrderStatus>('PROCESSING');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PARTIALLY_PAID');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Alex Nguyen');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.list({
        search: searchQuery,
        status: selectedStatus,
        paymentStatus: selectedPaymentStatus,
        page,
        size: pageSize,
      });
      setOrders(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Unable to load orders from server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, selectedPaymentStatus, page, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPaymentStatus('ALL');
    setPage(0);
    fetchOrders();
  };

  const handleOpenCreate = () => {
    setEditingOrder(null);
    setAccountName('');
    setTotalAmount('');
    setStatus('CONFIRMED');
    setPaymentStatus('UNPAID');
    setDeliveryDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setAssignedTo('Alex Nguyen');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: OrderItem) => {
    setEditingOrder(order);
    setAccountName(order.accountName || '');
    setTotalAmount(order.totalAmount ? order.totalAmount.toString() : '');
    setStatus(order.status);
    setPaymentStatus(order.paymentStatus);
    setDeliveryDate(order.deliveryDate ? order.deliveryDate.split('T')[0] : '');
    setAssignedTo(order.assignedTo || '');
    setIsModalOpen(true);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !totalAmount) {
      toast.error('Please specify Client Organization and Order Value');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingOrder) {
        await orderApi.update(editingOrder.id, {
          version: editingOrder.version || 1,
          accountName,
          totalAmount: parseFloat(totalAmount),
          status,
          paymentStatus,
          deliveryDate,
          assignedTo,
        });
        toast.success('Order updated successfully!');
      } else {
        await orderApi.create({
          accountId: 'acc-custom',
          accountName,
          totalAmount: parseFloat(totalAmount),
          status,
          paymentStatus,
          deliveryDate,
          assignedTo: assignedTo || 'Alex Nguyen',
        });
        toast.success('New sales order created successfully!');
      }
      setIsModalOpen(false);
      fetchOrders();
    } catch {
      toast.error('Unable to save order details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete order "${code}"?`)) return;
    try {
      await orderApi.delete(id);
      toast.success(`Deleted order "${code}"`);
      fetchOrders();
    } catch {
      toast.error('Unable to delete order');
    }
  };

  // KPI Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCollected = orders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const deliveredCount = orders.filter((o) => o.status === 'FULFILLED').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedPaymentStatus !== 'ALL' ? 1 : 0);

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'All Orders', count: totalElements },
    { id: 'PROCESSING', label: 'In Fulfillment', count: processingCount, icon: Truck, dotColor: 'bg-purple-500' },
    { id: 'FULFILLED', label: 'Fulfilled', count: deliveredCount, icon: CreditCard, dotColor: 'bg-emerald-500' },
  ];

  const currentActiveTab = selectedStatus === 'PROCESSING' ? 'PROCESSING' : selectedStatus === 'FULFILLED' ? 'FULFILLED' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'PROCESSING') {
      setSelectedStatus('PROCESSING');
    } else if (tabId === 'FULFILLED') {
      setSelectedStatus('FULFILLED');
    } else {
      setSelectedStatus('ALL');
    }
    setPage(0);
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Sales Orders &amp; Fulfillment"
        subtitle="Manage execution milestones, fulfillment lifecycles, invoicing &amp; payment reconciliations"
        icon={ShoppingCart}
        badgeCount={totalElements}
        badgeLabel="orders"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none h-8 rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Order</span>
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Orders</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Gross Order Value</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">
              {(totalRevenue / 1_000_000).toFixed(0)}M VND
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CreditCard className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Settled Payments</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              {(totalCollected / 1_000_000).toFixed(0)}M VND
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Truck className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">In Delivery / Fulfillment</div>
            <div className="text-lg font-black text-amber-700 leading-tight">{processingCount}</div>
          </div>
        </div>
      </div>

      {/* Standard Filter Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Search by order code, account name..."
        viewTabs={viewTabs}
        activeTab={currentActiveTab}
        onTabChange={handleTabChange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        filterControls={
          <>
            <div className="w-40">
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                  <SelectItem value="PARTIALLY_FULFILLED">PARTIALLY FULFILLED</SelectItem>
                  <SelectItem value="FULFILLED">FULFILLED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-44">
              <Select value={selectedPaymentStatus} onValueChange={(val) => { setSelectedPaymentStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Payment Statuses</SelectItem>
                  <SelectItem value="PAID">PAID</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">PARTIALLY PAID</SelectItem>
                  <SelectItem value="UNPAID">UNPAID</SelectItem>
                  <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />

      {/* Orders Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Order Number</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Client Organization</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Total Amount</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Settled</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Payment Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Fulfillment Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Loading orders...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={ShoppingCart}
                      title="No orders found"
                      description="Try adjusting your filter criteria or generate a new sales order."
                      actionLabel="Create Order"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const statusInfo = ORDER_STATUS_CONFIG[order.status] || { label: order.status, className: 'bg-slate-100 text-slate-700' };
                  const paymentInfo = PAYMENT_STATUS_CONFIG[order.paymentStatus] || { label: order.paymentStatus, className: 'bg-slate-100 text-slate-700' };

                  return (
                    <TableRow key={order.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                      {/* Order Number */}
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 font-mono">{order.orderNumber}</div>
                            <div className="text-[11px] text-slate-400">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US') : '-'}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Account */}
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{order.accountName}</span>
                        </div>
                      </TableCell>

                      {/* Total Value */}
                      <TableCell className="py-2 px-3">
                        <div className="font-semibold text-slate-900 font-mono text-xs">
                          {order.totalAmount.toLocaleString('en-US')} ₫
                        </div>
                      </TableCell>

                      {/* Paid */}
                      <TableCell className="py-2 px-3 font-mono text-slate-700 text-[11px]">
                        {order.paymentStatus === 'PAID' ? order.totalAmount.toLocaleString('en-US') : '0'} ₫
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell className="py-2 px-3">
                        <Badge className={`${paymentInfo.className} text-[11px] rounded-[3px]`}>
                          {paymentInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Order Status */}
                      <TableCell className="py-2 px-3">
                        <Badge className={`${statusInfo.className} text-[11px] rounded-[3px]`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionTooltip label="Edit Order">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(order)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                              aria-label="Edit Order"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Delete Order">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(order.id, order.orderNumber)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                              aria-label="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Standard Pagination Bar */}
        {!loading && (
          <StandardPagination
            currentPage={page + 1}
            totalPages={Math.max(totalPages, 1)}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p - 1)}
            itemLabel="orders"
          />
        )}
      </Card>

      {/* Create / Edit Order Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingOrder ? 'Edit Sales Order Details' : 'Create New Sales Order'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingOrder ? `Order ID: ${editingOrder.orderNumber}` : 'Set order value, fulfillment status & delivery commitment'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveOrder} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Client Organization <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Acme Corporation"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Total Order Value (VND) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  placeholder="250,000,000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Fulfillment Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                    <SelectItem value="PARTIALLY_FULFILLED">PARTIALLY FULFILLED</SelectItem>
                    <SelectItem value="FULFILLED">FULFILLED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(val: any) => setPaymentStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">PAID</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">PARTIALLY PAID</SelectItem>
                    <SelectItem value="UNPAID">UNPAID</SelectItem>
                    <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Estimated Delivery / Handover Date</Label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Fulfillment Lead</Label>
                <Input
                  placeholder="Alex Nguyen"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs border-slate-200 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-9"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{editingOrder ? 'Save Changes' : 'Create Order'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
