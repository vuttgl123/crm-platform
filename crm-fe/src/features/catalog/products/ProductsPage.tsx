import React, { useState, useEffect, useCallback } from 'react';
import {
  mockCatalogApi,
  ProductItem,
} from '@/services/mock/mockCatalogData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Save,
  DollarSign,
  Box,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenCreate = () => {
    setSku(`PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setCategoryName('Bản quyền Phần mềm');
    setUnit('User / Năm');
    setUnitPrice('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unitPrice.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm và đơn giá niêm yết');
      return;
    }

    try {
      await mockCatalogApi.createProduct({
        sku,
        name,
        categoryName,
        unit,
        unitPrice: Number(unitPrice) || 0,
        inventoryCount: 9999,
        status: 'ACTIVE',
      });
      toast.success('Đã thêm sản phẩm mới thành công!');
      setIsModalOpen(false);
      fetchProducts();
    } catch {
      toast.error('Không thể thêm sản phẩm');
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${prodName}"?`)) return;
    try {
      await mockCatalogApi.deleteProduct(id);
      toast.success(`Đã xóa sản phẩm "${prodName}"`);
      fetchProducts();
    } catch {
      toast.error('Không thể xóa');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" />
            <span>Sản phẩm & Dịch vụ (Products)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị danh mục gói License, dịch vụ triển khai và đơn giá niêm yết chuẩn
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={loading}
            className="h-9 px-3 text-xs font-semibold gap-1.5 shadow-2xs border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản phẩm</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng mặt hàng</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalElements}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang kinh doanh</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalElements}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đơn vị tiền tệ</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">VNĐ (đ)</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Card */}
      <Card className="border-slate-200 shadow-2xs bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo mã SKU hoặc tên gói..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="w-60">
              <SearchableSelect
                placeholder="Lọc danh mục..."
                searchPlaceholder="Tìm danh mục..."
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setPage(0);
                }}
                options={[
                  { label: 'Tất cả nhóm danh mục', value: 'ALL' },
                  { label: 'Bản quyền Phần mềm', value: 'Bản quyền Phần mềm' },
                  { label: 'Dịch vụ Triển khai & Tích hợp', value: 'Dịch vụ Triển khai & Tích hợp' },
                  { label: 'Dịch vụ Bảo trì & Hỗ trợ Kỹ thuật SLA', value: 'Dịch vụ Bảo trì & Hỗ trợ Kỹ thuật SLA' },
                  { label: 'Dung lượng & Tài nguyên Cloud', value: 'Dung lượng & Tài nguyên Cloud' },
                ]}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải sản phẩm...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Package}
              title="Không tìm thấy sản phẩm nào"
              description="Thử tìm kiếm từ khóa khác hoặc thêm mới sản phẩm đầu tiên."
              actionLabel="Thêm Sản phẩm"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Mã SKU & Tên Sản phẩm</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Danh mục phân loại</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Đơn vị tính</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Đơn giá niêm yết</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Trạng thái</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mb-1">
                        {p.sku}
                      </span>
                      <span className="font-bold text-slate-900 text-xs block">{p.name}</span>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold text-xs">
                        {p.categoryName}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-600 font-medium">
                      {p.unit}
                    </TableCell>

                    <TableCell className="py-3.5">
                      <span className="text-xs font-black text-blue-700">
                        {p.unitPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
                        Đang kinh doanh
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(p.id, p.name)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>trên tổng số <b>{totalElements}</b> bản ghi</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                Trang {page + 1} / {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Thêm Sản phẩm Mới
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Nhập mã SKU, nhóm danh mục và thiết lập giá bán niêm yết
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Mã SKU sản phẩm *</Label>
              <Input
                placeholder="VD: CRM-ENT-USER"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Tên Sản phẩm / Gói dịch vụ *</Label>
              <Input
                placeholder="VD: Gói CRM Enterprise User (1 Năm)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Nhóm danh mục</Label>
                <Select value={categoryName} onValueChange={setCategoryName}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bản quyền Phần mềm">Bản quyền Phần mềm</SelectItem>
                    <SelectItem value="Dịch vụ Triển khai & Tích hợp">Dịch vụ Triển khai & Tích hợp</SelectItem>
                    <SelectItem value="Dịch vụ Bảo trì & Hỗ trợ Kỹ thuật SLA">Dịch vụ Bảo trì & SLA</SelectItem>
                    <SelectItem value="Dung lượng & Tài nguyên Cloud">Tài nguyên Cloud</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Đơn vị tính</Label>
                <Input
                  placeholder="VD: User / Năm"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Đơn giá niêm yết (VNĐ) *</Label>
              <Input
                type="number"
                placeholder="VD: 3600000"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-9 text-xs font-semibold px-4"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Tạo Sản phẩm</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
