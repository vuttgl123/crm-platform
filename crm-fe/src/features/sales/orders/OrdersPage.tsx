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
import {
  ShoppingCart,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  RotateCcw,
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
  const [paidAmount, setPaidAmount] = useState('');
  const [status, setStatus] = useState<OrderStatus>('PROCESSING');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PARTIALLY_PAID');
  const [orderDate, setOrderDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Phạm Tuấn Vũ');

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
      toast.error('Không thể tải danh sách đơn hàng');
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
    setPaidAmount('0');
    setStatus('DRAFT');
    setPaymentStatus('UNPAID');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setDeliveryDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: OrderItem) => {
    setEditingOrder(order);
    setAccountName(order.accountName || '');
    setTotalAmount((order.totalAmount || 0).toString());
    setPaidAmount('0');
    setStatus(order.status);
    setPaymentStatus(order.paymentStatus);
    setOrderDate(order.deliveryDate || '');
    setDeliveryDate(order.deliveryDate || '');
    setAssignedTo(order.assignedTo || '');
    setIsModalOpen(true);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !totalAmount.trim()) {
      toast.error('Vui lòng nhập tên khách hàng và tổng tiền đơn');
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
        toast.success('Đã cập nhật đơn hàng thành công!');
      } else {
        await orderApi.create({
          accountId: 'acc-custom',
          accountName,
          totalAmount: parseFloat(totalAmount),
          status,
          paymentStatus,
          deliveryDate,
          assignedTo: assignedTo || 'Phạm Tuấn Vũ',
        });
        toast.success('Đã tạo đơn hàng mới thành công!');
      }
      setIsModalOpen(false);
      fetchOrders();
    } catch {
      toast.error('Không thể lưu đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng "${code}"?`)) return;
    try {
      await orderApi.delete(id);
      toast.success(`Đã xóa đơn hàng "${code}"`);
      fetchOrders();
    } catch {
      toast.error('Không thể xóa đơn hàng');
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

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <ShoppingCart className="w-4.5 h-4.5 text-white" />
            </div>
            Quản lý Đơn hàng (Sales Orders)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Theo dõi tiến độ bàn giao, thanh toán công nợ và hoàn tất hợp đồng kinh tế
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
            className="text-xs gap-1.5 border-slate-200 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Đơn Hàng Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Đơn hàng</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Doanh số Đơn</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">
              {(totalRevenue / 1_000_000).toFixed(0)} Tr ₫
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CreditCard className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đã thu thực tế ({deliveredCount} đơn giao)</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              {(totalCollected / 1_000_000).toFixed(0)} Tr ₫
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Truck className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đang xử lý / Chờ giao</div>
            <div className="text-lg font-black text-amber-700 leading-tight">{processingCount}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng, khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-8.5 bg-slate-50/60 focus:bg-white border-slate-200 rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-40">
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Trạng thái đơn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                  <SelectItem value="PROCESSING">Đang triển khai</SelectItem>
                  <SelectItem value="SHIPPED">Đang bàn giao</SelectItem>
                  <SelectItem value="DELIVERED">Đã nghiệm thu</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-44">
              <Select value={selectedPaymentStatus} onValueChange={(val) => { setSelectedPaymentStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả thanh toán</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán đủ</SelectItem>
                  <SelectItem value="PARTIAL">Thanh toán 1 phần</SelectItem>
                  <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 gap-1 h-8.5 px-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại ({activeFiltersCount})</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Orders Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Mã Đơn hàng</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Khách hàng / Doanh nghiệp</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Tổng giá trị</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Đã thanh toán</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Thanh toán</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Trạng thái giao</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Đang tải danh sách đơn hàng...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={ShoppingCart}
                      title="Không tìm thấy đơn hàng nào"
                      description="Hãy thử thay đổi điều kiện lọc hoặc tạo mới đơn hàng bán lẻ / hợp đồng."
                      actionLabel="Tạo Đơn Hàng"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const statusInfo = ORDER_STATUS_CONFIG[order.status] || { label: order.status, className: 'bg-slate-100 text-slate-700' };
                  const paymentInfo = PAYMENT_STATUS_CONFIG[order.paymentStatus] || { label: order.paymentStatus, className: 'bg-slate-100 text-slate-700' };

                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                      {/* Cột 1: Mã đơn */}
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 font-mono">{order.orderNumber}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Khách hàng */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{order.accountName}</span>
                        </div>
                      </TableCell>

                      {/* Cột 3: Tổng giá trị */}
                      <TableCell>
                        <div className="font-bold text-slate-900 font-mono text-xs">
                          {order.totalAmount.toLocaleString('vi-VN')} ₫
                        </div>
                      </TableCell>

                      {/* Cột 4: Đã trả */}
                      <TableCell className="font-mono text-slate-700 text-[11px]">
                        {order.paymentStatus === 'PAID' ? order.totalAmount.toLocaleString('vi-VN') : '0'} ₫
                      </TableCell>

                      {/* Cột 5: Trạng thái thanh toán */}
                      <TableCell>
                        <Badge className={`${paymentInfo.className} text-[11px]`}>
                          {paymentInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Cột 6: Trạng thái đơn */}
                      <TableCell>
                        <Badge className={`${statusInfo.className} text-[11px]`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Cột 7: Thao tác */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(order)}
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Chỉnh sửa đơn hàng"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(order.id, order.orderNumber)}
                            className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                            title="Xóa đơn hàng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Bar ── */}
        {!loading && orders.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-bold text-slate-800">{page * pageSize + 1}</span> -{' '}
              <span className="font-bold text-slate-800">{Math.min((page + 1) * pageSize, totalElements)}</span> trong tổng số{' '}
              <span className="font-bold text-slate-800">{totalElements}</span> đơn hàng
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <div className="px-2 font-medium text-slate-700">
                Trang {page + 1} / {Math.max(totalPages, 1)}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Create / Edit Order Modal ── */}
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
                    {editingOrder ? `Chỉnh sửa Đơn hàng ${editingOrder.orderNumber}` : 'Tạo Đơn Hàng Mới'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Ghi nhận hợp đồng kinh tế và tiến độ thanh toán bàn giao
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveOrder} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Khách hàng / Doanh nghiệp <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="Ví dụ: Công ty CP Bất Động Sản Alpha"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Chuyên viên phụ trách đơn</Label>
                <Input
                  placeholder="Phạm Tuấn Vũ"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Tổng giá trị đơn (VNĐ) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  placeholder="300,000,000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Số tiền đã thanh toán (VNĐ)</Label>
                <Input
                  type="number"
                  placeholder="100,000,000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Trạng thái giao hàng</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                    <SelectItem value="PROCESSING">Đang triển khai</SelectItem>
                    <SelectItem value="SHIPPED">Đang bàn giao</SelectItem>
                    <SelectItem value="DELIVERED">Đã nghiệm thu</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Trạng thái thanh toán</Label>
                <Select value={paymentStatus} onValueChange={(val: any) => setPaymentStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Đã thanh toán đủ</SelectItem>
                    <SelectItem value="PARTIAL">Thanh toán 1 phần</SelectItem>
                    <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Ngày đặt hàng</Label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Ngày giao dự kiến</Label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
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
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-9"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{editingOrder ? 'Lưu Thay Đổi' : 'Tạo Đơn Hàng'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
