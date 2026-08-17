import React, { useState, useEffect, useCallback } from 'react';
import {
  mockCatalogApi,
  ProductItem,
} from '@/services/mock/mockCatalogData';
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
  Package,
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
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Bản quyền Phần mềm');
  const [unit, setUnit] = useState('User / Năm');
  const [unitPrice, setUnitPrice] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mockCatalogApi.listProducts({
        search: searchQuery,
        category: selectedCategory,
        page,
        size: pageSize,
      });
      setProducts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, page, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setPage(0);
    fetchProducts();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setSku(`PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setCategoryName('Bản quyền Phần mềm');
    setUnit('User / Năm');
    setUnitPrice('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prd: ProductItem) => {
    setEditingProduct(prd);
    setSku(prd.sku);
    setName(prd.name);
    setCategoryName(prd.categoryName);
    setUnit(prd.unit);
    setUnitPrice(prd.unitPrice.toString());
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unitPrice.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm và đơn giá');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await mockCatalogApi.updateProduct(editingProduct.id, {
          name,
          categoryName,
          unit,
          unitPrice: parseFloat(unitPrice),
        });
        toast.success('Đã cập nhật sản phẩm thành công!');
      } else {
        await mockCatalogApi.createProduct({
          sku,
          name,
          categoryName,
          unit,
          unitPrice: parseFloat(unitPrice),
          inventoryCount: 9999,
          status: 'ACTIVE',
        });
        toast.success('Đã tạo sản phẩm mới thành công!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch {
      toast.error('Không thể lưu sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
    try {
      await mockCatalogApi.deleteProduct(id);
      toast.success(`Đã xóa sản phẩm "${name}"`);
      fetchProducts();
    } catch {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  // KPI Metrics
  const softwareCount = products.filter((p) => p.categoryName.includes('Phần mềm')).length;
  const serviceCount = products.filter((p) => p.categoryName.includes('Dịch vụ')).length;
  const avgPrice = products.length > 0 ? products.reduce((sum, p) => sum + p.unitPrice, 0) / products.length : 0;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <Package className="w-4.5 h-4.5 text-white" />
            </div>
            Quản lý Danh mục Sản phẩm &amp; Dịch vụ (Catalog)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Quản lý danh sách SKU sản phẩm, gói giải pháp phần mềm và đơn giá niêm yết
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
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
            <span>Thêm Sản Phẩm Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Package className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng SKU Sản phẩm</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Layers className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Gói Bản Quyền / SaaS</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">{softwareCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Gói Dịch Vụ Triển Khai</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{serviceCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đơn giá trung bình</div>
            <div className="text-lg font-black text-amber-700 leading-tight">
              {(avgPrice / 1_000_000).toFixed(1)} Tr ₫
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo mã SKU, tên sản phẩm..."
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
            <div className="w-48">
              <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Nhóm sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả nhóm</SelectItem>
                  <SelectItem value="Bản quyền Phần mềm">Bản quyền Phần mềm</SelectItem>
                  <SelectItem value="Dịch vụ Triển khai &amp; Đào tạo">Dịch vụ Triển khai</SelectItem>
                  <SelectItem value="Phần cứng &amp; Thiết bị">Phần cứng &amp; Thiết bị</SelectItem>
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

      {/* ── Products Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Mã SKU &amp; Tên Sản phẩm</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Danh mục / Phân loại</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Đơn vị tính</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Đơn giá niêm yết</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Trạng thái kinh doanh</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Đang tải danh mục sản phẩm...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={Package}
                      title="Không tìm thấy sản phẩm nào"
                      description="Hãy thử thay đổi điều kiện lọc hoặc thêm mới sản phẩm vào danh mục."
                      actionLabel="Thêm Sản Phẩm"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                    {/* Cột 1: SKU & Tên */}
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{product.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{product.sku}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Danh mục */}
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px]">
                        {product.categoryName}
                      </Badge>
                    </TableCell>

                    {/* Cột 3: Đơn vị */}
                    <TableCell className="text-slate-600 font-medium">
                      {product.unit}
                    </TableCell>

                    {/* Cột 4: Đơn giá */}
                    <TableCell>
                      <div className="font-bold text-slate-900 font-mono text-xs">
                        {product.unitPrice.toLocaleString('vi-VN')} ₫
                      </div>
                    </TableCell>

                    {/* Cột 5: Trạng thái */}
                    <TableCell>
                      {product.status === 'ACTIVE' ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px]">
                          Đang kinh doanh
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[11px]">
                          Ngừng kinh doanh
                        </Badge>
                      )}
                    </TableCell>

                    {/* Cột 6: Thao tác */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(product)}
                          className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Bar ── */}
        {!loading && products.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-bold text-slate-800">{page * pageSize + 1}</span> -{' '}
              <span className="font-bold text-slate-800">{Math.min((page + 1) * pageSize, totalElements)}</span> trong tổng số{' '}
              <span className="font-bold text-slate-800">{totalElements}</span> sản phẩm
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

      {/* ── Create / Edit Product Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản Phẩm Mới'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingProduct ? `Mã SKU: ${editingProduct.sku}` : 'Khai báo SKU, danh mục và đơn giá niêm yết'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Mã SKU</Label>
                <Input
                  disabled
                  value={sku}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono bg-slate-50"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Tên sản phẩm / Gói giải pháp <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="Ví dụ: CRM Enterprise Core Edition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Danh mục phân loại</Label>
                <Select value={categoryName} onValueChange={(val) => setCategoryName(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bản quyền Phần mềm">Bản quyền Phần mềm</SelectItem>
                    <SelectItem value="Dịch vụ Triển khai &amp; Đào tạo">Dịch vụ Triển khai &amp; Đào tạo</SelectItem>
                    <SelectItem value="Phần cứng &amp; Thiết bị">Phần cứng &amp; Thiết bị</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Đơn vị tính</Label>
                <Input
                  placeholder="Ví dụ: User / Năm, Gói trọn gói..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Đơn giá niêm yết (VNĐ) <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                type="number"
                placeholder="25,000,000"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1 font-mono"
              />
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
                <span>{editingProduct ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
