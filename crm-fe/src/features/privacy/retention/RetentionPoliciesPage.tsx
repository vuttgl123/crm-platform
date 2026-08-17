import React, { useState, useEffect } from 'react';
import { privacyApi, RetentionPolicyItem } from '@/services/api/privacyApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Archive, RefreshCw, Loader2, Calendar } from 'lucide-react';

export const RetentionPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<RetentionPolicyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = () => {
    setLoading(true);
    privacyApi.listRetentionPolicies().then((data) => {
      setPolicies(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Archive className="w-7 h-7 text-blue-600" />
            <span>Chính sách Lưu trữ & Tiêu hủy (Retention Policies)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quy định vòng đời lưu trữ, tự động nén lưu trữ hoặc ẩn danh hóa dữ liệu hết hạn
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPolicies} disabled={loading} className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải chính sách lưu trữ...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Loại Dữ liệu áp dụng</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Thời hạn lưu giữ</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Hành động khi hết hạn</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Lần quét gần nhất</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Trạng thái Chính sách</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {policies.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5 font-bold text-slate-900 text-xs">
                      {p.dataType}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs font-bold text-blue-700">
                      {p.durationYears} Năm
                    </TableCell>
                    <TableCell className="py-3.5">
                      {p.actionAfterExpiry === 'ARCHIVE' && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold text-xs">
                          Nén & Lưu trữ (Archive)
                        </Badge>
                      )}
                      {p.actionAfterExpiry === 'PERMANENT_DELETE' && (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-semibold text-xs">
                          Xóa vĩnh viễn (Delete)
                        </Badge>
                      )}
                      {p.actionAfterExpiry === 'ANONYMIZE' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-semibold text-xs">
                          Ẩn danh hóa (Anonymize)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.lastRunDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-5 py-3.5">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs">
                        Đang áp dụng
                      </Badge>
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
