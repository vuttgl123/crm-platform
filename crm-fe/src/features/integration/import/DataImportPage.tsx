import React, { useState, useEffect } from 'react';
import { mockIntegrationApi, DataImportJob } from '@/services/mock/mockIntegrationData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { UploadCloud, RefreshCw, Loader2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export const DataImportPage: React.FC = () => {
  const [jobs, setJobs] = useState<DataImportJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    setLoading(true);
    mockIntegrationApi.listImportJobs().then((data) => {
      setJobs(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-7 h-7 text-blue-600" />
            <span>Nhập Dữ liệu Hàng loạt (Bulk Data Import)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tải lên tệp Excel / CSV để nhập danh sách khách hàng, liên hệ hoặc cơ hội kinh doanh số lượng lớn
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading} className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
          <Button size="sm" onClick={() => toast.info('Mở hộp thoại tải tệp Excel / CSV')} className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <UploadCloud className="w-4 h-4" />
            <span>Tải lên Tệp mới</span>
          </Button>
        </div>
      </div>

      {/* Upload Zone Preview */}
      <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer rounded-2xl">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Kéo & Thả tệp Excel (.xlsx, .xls) hoặc CSV vào đây</h3>
          <p className="text-xs text-slate-400 mt-1">Hỗ trợ tối đa 50,000 dòng dữ liệu mỗi lần tải lên. Dung lượng tệp tối đa 25MB.</p>
        </CardContent>
      </Card>

      {/* Table of Past Import Jobs */}
      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải lịch sử nhập dữ liệu...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Tên Tệp Tải lên</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Thực thể Đích</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Tổng số dòng</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Thành công / Thất bại</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Người tải lên & Thời gian</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <TableRow key={j.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-900 text-xs">{j.fileName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-xs">
                        {j.targetEntity}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 text-xs font-bold text-slate-800">
                      {j.totalRows.toLocaleString()} Dòng
                    </TableCell>

                    <TableCell className="py-3.5">
                      <span className="text-xs font-bold text-emerald-600">{j.successRows} thành công</span>
                      {j.failedRows > 0 && (
                        <span className="text-xs font-bold text-rose-600 ml-2">({j.failedRows} lỗi)</span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-600">
                      <div>{j.uploadedBy}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{j.uploadedAt}</div>
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Hoàn tất</span>
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
