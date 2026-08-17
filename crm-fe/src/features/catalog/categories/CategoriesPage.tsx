import React, { useState, useEffect, useCallback } from 'react';
import {
  catalogApi,
  CategoryItem,
} from '@/services/api/catalogApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import {
  FolderTree,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Loader2,
  Save,
  Package,
  CheckCircle2,
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await catalogApi.listCategories({ search: searchQuery });
      setCategories(res);
    } catch {
      toast.error('Không thể tải danh mục sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setCode(`CAT-${Math.floor(10 + Math.random() * 90)}`);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      await catalogApi.createCategory({
        categoryCode: code,
        name,
        description,
      });
      toast.success('Đã thêm danh mục mới thành công!');
      setIsModalOpen(false);
      fetchCategories();
    } catch {
      toast.error('Không thể thêm danh mục');
    }
  };

  const totalProducts = categories.reduce((sum, c) => sum + c.productsCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-blue-600" />
            <span>Danh mục Sản phẩm & Dịch vụ</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Phân loại các nhóm sản phẩm phần mềm, gói dịch vụ và tài nguyên hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategories}
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
            <span>Thêm Danh mục Mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số nhóm danh mục</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{categories.length}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm / Dịch vụ đang bán</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalProducts}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái cấu hình</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">100% Hoạt động</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-slate-200 shadow-2xs bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục theo mã hoặc tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải danh mục...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FolderTree}
              title="Không tìm thấy danh mục nào"
              description="Tạo mới danh mục đầu tiên để phân loại sản phẩm."
              actionLabel="Thêm Danh mục"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Mã & Tên Danh mục</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Mô tả chi tiết</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Số lượng Sản phẩm</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Trạng thái</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 inline-block mb-1">
                        {c.code}
                      </span>
                      <span className="font-bold text-slate-900 text-xs block">{c.name}</span>
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-600 max-w-[350px]">
                      {c.description}
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs">
                        {c.productsCount} Sản phẩm
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs">
                        Đang hoạt động
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Thêm Danh mục Mới
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Tạo nhóm phân loại mới cho danh mục sản phẩm và dịch vụ
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Mã danh mục *</Label>
              <Input
                placeholder="VD: SOFT_LIC"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Tên danh mục *</Label>
              <Input
                placeholder="VD: Bản quyền Phần mềm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Mô tả</Label>
              <Input
                placeholder="Mô tả công dụng hoặc phạm vi nhóm sản phẩm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 text-xs"
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
                <span>Tạo Danh mục</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
