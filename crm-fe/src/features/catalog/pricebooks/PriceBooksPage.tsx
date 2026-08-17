import React, { useState, useEffect, useCallback } from 'react';
import {
  catalogApi,
  PriceBookItem,
} from '@/services/api/catalogApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  BookOpen,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Loader2,
  Calendar,
  DollarSign,
  Star,
} from 'lucide-react';

export const PriceBooksPage: React.FC = () => {
  const [priceBooks, setPriceBooks] = useState<PriceBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPriceBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await catalogApi.listPriceBooks({ search: searchQuery });
      setPriceBooks(res);
    } catch {
      toast.error('Không thể tải bảng giá');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPriceBooks();
  }, [fetchPriceBooks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <span>Bảng giá & Chính sách giá (Price Books)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị nhiều chính sách giá theo phân khúc khách hàng, đối tác đại lý và thời gian áp dụng
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPriceBooks}
            disabled={loading}
            className="h-9 px-3 text-xs font-semibold gap-1.5 shadow-2xs border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={() => toast.info('Tính năng tạo Bảng giá tùy biến theo phân khúc đối tác')}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bảng giá Mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số bảng giá</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{priceBooks.length}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bảng giá tiêu chuẩn</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">1 Chuẩn (VND)</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiền tệ mặc định</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">VNĐ (Vietnam Dong)</h3>
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
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm bảng giá theo tên hoặc mã..."
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
            <span className="text-xs font-semibold">Đang tải bảng giá...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Mã & Tên Bảng giá</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Tiền tệ</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Hiệu lực từ ngày</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Số mục giá áp dụng</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Phân loại</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {priceBooks.map((pb) => (
                  <TableRow key={pb.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {pb.code}
                        </span>
                        {pb.isStandard && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                            Bảng giá Chuẩn
                          </Badge>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 text-xs block mt-1">{pb.name}</span>
                    </TableCell>

                    <TableCell className="py-3.5 text-xs font-bold text-slate-700">
                      {pb.currency}
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pb.validFrom}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold text-xs">
                        {pb.entriesCount} Mặt hàng
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs">
                        Đang áp dụng
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
    </div>
  );
};
