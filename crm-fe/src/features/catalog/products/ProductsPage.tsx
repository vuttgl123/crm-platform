import React, { useState, useEffect, useCallback } from 'react';
import {
  catalogApi,
  ProductItem,
} from '@/services/api/catalogApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar, ViewTabItem } from '@/components/common/StandardFilterBar';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  Package,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
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
      const res = await catalogApi.listProducts({
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
    setCategoryName(prd.categoryName || 'Bản quyền Phần mềm');
    setUnit(prd.unit || 'Cái');
    setUnitPrice((prd.unitPrice || 0).toString());
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
        await catalogApi.updateProduct(editingProduct.id, {
          version: editingProduct.version || 1,
          name,
          unit,
          unitPrice: parseFloat(unitPrice),
        });
        toast.success('Đã cập nhật sản phẩm thành công!');
      } else {
        await catalogApi.createProduct({
          sku,
          name,
          unit,
          unitPrice: parseFloat(unitPrice),
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
      await catalogApi.deleteProduct(id);
      toast.success(`Đã xóa sản phẩm "${name}"`);
      fetchProducts();
    } catch {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  // KPI Metrics
  const softwareCount = products.filter((p) => (p.categoryName || '').includes('Phần mềm')).length;
  const serviceCount = products.filter((p) => (p.categoryName || '').includes('Dịch vụ')).length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== 'ALL' ? 1 : 0);

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'Tất cả', count: totalElements },
    { id: 'SOFTWARE', label: 'Bản quyền / SaaS', count: softwareCount, icon: Layers, dotColor: 'bg-indigo-500' },
    { id: 'SERVICE', label: 'Dịch vụ triển khai', count: serviceCount, icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  ];

  const currentActiveTab = selectedCategory === 'Bản quyền Phần mềm' ? 'SOFTWARE' : selectedCategory === 'Dịch vụ Triển khai & Đào tạo' ? 'SERVICE' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'SOFTWARE') {
      setSelectedCategory('Bản quyền Phần mềm');
    } else if (tabId === 'SERVICE') {
      setSelectedCategory('Dịch vụ Triển khai & Đào tạo');
    } else {
      setSelectedCategory('ALL');
    }
    setPage(0);
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Quản lý Danh mục Sản phẩm & Dịch vụ"
        subtitle="Quản lý danh mục mã SKU, các gói giải pháp bản quyền phần mềm SaaS & đơn giá niêm yết chuẩn"
        badgeCount={totalElements}
        badgeLabel="sản phẩm"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none h-8 rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Sản Phẩm</span>
            </Button>
          </>
        }
      />

      {/* Standard Filter & Search Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Tìm kiếm theo mã SKU, tên sản phẩm..."
        viewTabs={viewTabs}
        activeTab={currentActiveTab}
        onTabChange={handleTabChange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        filterControls={
          <div className="w-52">
            <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setPage(0); }}>
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Nhóm sản phẩm" />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                <SelectItem value="ALL">Tất cả nhóm</SelectItem>
                <SelectItem value="Bản quyền Phần mềm">Bản quyền Phần mềm</SelectItem>
                <SelectItem value="Dịch vụ Triển khai & Đào tạo">Dịch vụ Triển khai</SelectItem>
                <SelectItem value="Phần cứng & Thiết bị">Phần cứng & Thiết bị</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* ── Products Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Mã SKU &amp; Tên Sản phẩm</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Danh mục / Phân loại</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Đơn vị tính</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Đơn giá niêm yết</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Trạng thái kinh doanh</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Thao tác</TableHead>
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
                  <TableRow key={product.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                    {/* Cột 1: SKU & Tên */}
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{product.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{product.sku}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Danh mục */}
                    <TableCell className="py-2 px-3">
                      <span className="bg-[#EBECF0] text-[#42526E] font-semibold text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]">
                        {product.categoryName}
                      </span>
                    </TableCell>

                    {/* Cột 3: Đơn vị */}
                    <TableCell className="py-2 px-3 text-slate-600 font-medium">
                      {product.unit}
                    </TableCell>

                    {/* Cột 4: Đơn giá */}
                    <TableCell className="py-2 px-3">
                      <div className="font-semibold text-slate-900 font-mono text-xs">
                        {(product.unitPrice || 0).toLocaleString('vi-VN')} ₫
                      </div>
                    </TableCell>

                    {/* Cột 5: Trạng thái */}
                    <TableCell className="py-2 px-3">
                      {product.status === 'ACTIVE' ? (
                        <span className="bg-[#E3FCEF] text-[#006644] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                          Đang kinh doanh
                        </span>
                      ) : (
                        <span className="bg-[#FFFAE6] text-[#974F0C] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                          Ngừng kinh doanh
                        </span>
                      )}
                    </TableCell>

                    {/* Cột 6: Thao tác */}
                    <TableCell className="py-2 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(product)}
                          className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
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

        {/* ── Standard Pagination Bar ── */}
        {!loading && (
          <StandardPagination
            currentPage={page + 1}
            totalPages={Math.max(totalPages, 1)}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p - 1)}
            itemLabel="sản phẩm"
          />
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
